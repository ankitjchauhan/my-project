const http = require('http');
const { randomUUID } = require('crypto');

/*
 * In‑memory data store to simulate a MongoDB collection. Each user has
 * a unique identifier (_id), a name and a numeric balance. The data is
 * not persisted across restarts.
 */
const users = [];

/**
 * Parse the body of an incoming HTTP request as JSON. Returns a promise
 * that resolves with the parsed object or rejects on error.
 *
 * @param {http.IncomingMessage} req
 * @returns {Promise<any>}
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        const parsed = data ? JSON.parse(data) : {};
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', err => reject(err));
  });
}

/**
 * Helper to send a JSON response with the given status code and payload.
 *
 * @param {http.ServerResponse} res
 * @param {number} status
 * @param {object} payload
 */
function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

/**
 * Create multiple users in one call.
 * Expects body: { users: [ { name: string, balance: number }, ... ] }
 */
async function handleCreateUsers(req, res) {
  try {
    const { users: newUsers } = await parseJsonBody(req);
    if (!Array.isArray(newUsers) || newUsers.length === 0) {
      return sendJson(res, 400, { message: 'Request body must include a non‑empty users array' });
    }
    const created = newUsers.map(u => {
      const user = {
        _id: randomUUID(),
        name: (u && typeof u.name === 'string') ? u.name.trim() : '',
        balance: Number(u && u.balance) || 0,
      };
      users.push(user);
      return user;
    });
    return sendJson(res, 201, { message: 'Users created', users: created });
  } catch (err) {
    return sendJson(res, 500, { message: 'Failed to create users', error: err.message });
  }
}

/**
 * List all users.
 */
function handleListUsers(req, res) {
  return sendJson(res, 200, users);
}

/**
 * Transfer money between two users. Expects body: { fromUserId, toUserId, amount }
 */
async function handleTransfer(req, res) {
  try {
    const { fromUserId, toUserId, amount } = await parseJsonBody(req);
    if (!fromUserId || !toUserId || typeof amount !== 'number') {
      return sendJson(res, 400, { message: 'fromUserId, toUserId and numeric amount are required' });
    }
    if (amount <= 0) {
      return sendJson(res, 400, { message: 'Transfer amount must be positive' });
    }
    if (fromUserId === toUserId) {
      return sendJson(res, 400, { message: 'Sender and receiver must be different accounts' });
    }
    const sender = users.find(u => u._id === fromUserId);
    const receiver = users.find(u => u._id === toUserId);
    if (!sender || !receiver) {
      return sendJson(res, 404, { message: 'One or both user accounts not found' });
    }
    if (sender.balance < amount) {
      return sendJson(res, 400, { message: 'Insufficient balance' });
    }
    sender.balance -= amount;
    receiver.balance += amount;
    return sendJson(res, 200, {
      message: `Transferred $${amount} from ${sender.name} to ${receiver.name}.`,
      senderBalance: sender.balance,
      receiverBalance: receiver.balance,
    });
  } catch (err) {
    return sendJson(res, 500, { message: 'Failed to perform transfer', error: err.message });
  }
}

const server = http.createServer((req, res) => {
  const { method, url } = req;
  if (method === 'POST' && url === '/create-users') {
    return handleCreateUsers(req, res);
  }
  if (method === 'GET' && url === '/users') {
    return handleListUsers(req, res);
  }
  if (method === 'POST' && url === '/transfer') {
    return handleTransfer(req, res);
  }
  // Fallback for unknown routes
  return sendJson(res, 404, { message: 'Not found' });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});