require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { fileHash } = require('./utils');
const { Document, User, Stats } = require('./models');
const { processDocument, registerSSE, unregisterSSE, emitProgress } = require('./ocrWorker');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PORT = process.env.PORT || 5001;
const MONGO = process.env.MONGO || 'mongodb://127.0.0.1:27017/doc-ocr';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

async function ensureDirs() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}
ensureDirs();

mongoose.connect(MONGO, {});

const app = express();

// CORS configuration - allow all origins in development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow localhost on any port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    callback(null, true); // Allow all origins in development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type']
}));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded files (thumbnails / page images)
app.use('/uploads', express.static(UPLOAD_DIR));

const upload = multer({ dest: path.join(UPLOAD_DIR, 'tmp/'), limits: { fileSize: 50 * 1024 * 1024 } });

// Auth middleware to validate JWT token
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Create user
    const user = new User({ email, password, name });
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      ok: true, 
      token, 
      user: { id: user._id, email: user.email, name: user.name } 
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed: ' + String(err) });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      ok: true, 
      token, 
      user: { id: user._id, email: user.email, name: user.name } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + String(err) });
  }
});

// SSE endpoint to stream progress for a document/job
app.get('/api/events/:docId', (req, res) => {
  const docId = req.params.docId;
  // Set CORS headers explicitly for EventSource (required for Chrome/Firefox)
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'X-Accel-Buffering': 'no' // Disable buffering in nginx if used
  });
  res.flushHeaders();
  // send initial keepalive
  res.write(':ok\n\n');
  registerSSE(docId, res);
  req.on('close', () => {
    unregisterSSE(docId);
  });
});

// Upload endpoint: saves file, checks hash/duplicate, creates Document and enqueues processing
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const f = req.file;
    if (!f) return res.status(400).json({ ok: false, error: 'no file' });
    // minimal validation
    if (!['image/png','image/jpeg','application/pdf'].includes(f.mimetype)) {
      await fs.unlink(f.path);
      return res.status(400).json({ ok: false, error: 'unsupported file type' });
    }
    const h = await fileHash(f.path);
    const existing = await Document.findOne({ hash: h });
    if (existing) {
      // duplicate, remove uploaded temp
      await fs.unlink(f.path);
      return res.json({ ok: true, duplicate: true, docId: existing._id });
    }
    // move file to permanent path
    const dest = path.join(UPLOAD_DIR, h + path.extname(f.originalname));
    await fs.rename(f.path, dest);
    // create doc
    const doc = new Document({
      title: req.body.title || f.originalname,
      filename: f.originalname,
      size: f.size,
      mime: f.mimetype,
      hash: h,
      language: req.body.language || 'eng',
      status: 'queued',
      pages: [] // pages will be filled by worker
    });
    await doc.save();
    // enqueue background processing (non-blocking)
    processDocument(doc._id, dest).catch(e => {
      console.error('background worker error', e);
    });
    res.json({ ok: true, docId: doc._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Provide doc-by-id endpoint for frontend preview
app.get('/api/doc/:id', async (req,res) => {
  try {
    const id = req.params.id;
    const doc = await Document.findById(id).lean();
    if (!doc) return res.status(404).json({ error: 'not found' });
    // attach thumbnail URLs for pages (if PNGs exist)
    const pages = (doc.pages || []).map(p => {
      const thumbName = `${doc.hash}-page-${p.pageNumber}.png`;
      // check file existence optional; just expose path
      return { ...p, thumbnail: `/uploads/${thumbName}` };
    });
    doc.pages = pages;
    res.json({ doc });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Search endpoint using text index
// Enhanced search endpoint for multi-page documents
app.get('/api/search', async (req, res) => {
  const q = req.query.q || '';
  const page = parseInt(req.query.page || '1', 10);
  const limit = Math.min(50, parseInt(req.query.limit || '10', 10));
  
  if (!q) return res.json({ results: [] });

  // Increment search count when a search is performed
  try {
    let statsDoc = await Stats.findOne();
    if (!statsDoc) {
      statsDoc = new Stats({ searchCount: 1 });
    } else {
      statsDoc.searchCount = (statsDoc.searchCount || 0) + 1;
    }
    statsDoc.lastUpdated = new Date();
    await statsDoc.save().catch(() => {}); // Don't fail search if stats update fails
  } catch (err) {
    // Ignore stats update errors
  }

  try {
    // Search across documents and pages
    const filter = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { 'pages.text': { $regex: q, $options: 'i' } }
      ]
    };

    const docs = await Document.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Process results to include matching pages with snippets
    const results = docs.map(doc => {
      const matchingPages = (doc.pages || [])
        .map(page => {
          if (!page || !page.text) return null;
          
          const lowerText = page.text.toLowerCase();
          const lowerQuery = q.toLowerCase();
          const matchIndex = lowerText.indexOf(lowerQuery);
          
          if (matchIndex >= 0) {
            // Create snippet around the match
            const start = Math.max(0, matchIndex - 60);
            const end = Math.min(page.text.length, matchIndex + q.length + 200);
            let snippet = page.text.substring(start, end);
            
            // Add ellipsis if not at start/end
            if (start > 0) snippet = '...' + snippet;
            if (end < page.text.length) snippet = snippet + '...';
            
            return {
              pageNumber: page.pageNumber,
              confidence: page.confidence,
              snippet: snippet,
              matchIndex: matchIndex,
              thumbnail: `/uploads/${doc.hash}-page-${page.pageNumber}.png`
            };
          }
          return null;
        })
        .filter(Boolean); // Remove null entries

      // Only include documents that have matching pages
      if (matchingPages.length === 0) return null;

      return {
        _id: doc._id,
        title: doc.title,
        filename: doc.filename,
        totalPages: doc.pages.length,
        pages: matchingPages
      };
    }).filter(Boolean); // Remove documents with no matches

    res.json({ 
      results, 
      total: results.length,
      page,
      limit 
    });

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed: ' + String(err) });
  }
});

// Reprocess a document or page
app.post('/api/reprocess/:docId', async (req, res) => {
  try {
    const docId = req.params.docId;
    const doc = await Document.findById(docId);
    if (!doc) return res.status(404).json({ ok: false, error: 'not found' });
    // find stored file by hash
    const ext = path.extname(doc.filename) || '.jpg';
    const filePath = path.join(UPLOAD_DIR, doc.hash + ext);
    // mark pages pending
    doc.pages = (doc.pages || []).map(p => ({ ...p, status: 'pending' }));
    doc.status = 'queued';
    await doc.save();
    processDocument(docId, filePath).catch(console.error);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Stats endpoint - returns real-time statistics
app.get('/api/stats', async (req, res) => {
  try {
    // Count total documents
    const documentCount = await Document.countDocuments();
    
    // Count total pages across all documents
    const documents = await Document.find({}, 'pages').lean();
    const pageCount = documents.reduce((total, doc) => {
      return total + (doc.pages ? doc.pages.length : 0);
    }, 0);
    
    // Get search count from stats collection
    let statsDoc = await Stats.findOne();
    if (!statsDoc) {
      statsDoc = new Stats({ searchCount: 0 });
      await statsDoc.save();
    }
    const searchCount = statsDoc.searchCount || 0;
    
    res.json({
      ok: true,
      stats: {
        documents: documentCount,
        pages: pageCount,
        searches: searchCount
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Increment search count
app.post('/api/stats/increment-search', async (req, res) => {
  try {
    let statsDoc = await Stats.findOne();
    if (!statsDoc) {
      statsDoc = new Stats({ searchCount: 1 });
    } else {
      statsDoc.searchCount = (statsDoc.searchCount || 0) + 1;
    }
    statsDoc.lastUpdated = new Date();
    await statsDoc.save();
    res.json({ ok: true, count: statsDoc.searchCount });
  } catch (err) {
    console.error('Increment search error:', err);
    res.status(500).json({ error: 'Failed to increment search count' });
  }
});

// Simple health endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: Date.now(), message: 'Backend server is running' });
});

// Root endpoint for basic connectivity test
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'OCR Backend API', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`✅ OCR backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 API root: http://localhost:${PORT}/`);
});