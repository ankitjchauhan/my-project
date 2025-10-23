// server.js
const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

// Secret key for signing JWT
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// Sample user (for simplicity)
const user = {
  id: 1,
  username: "admin",
  password: "12345"
};

// 🟢 Login Route - Issues JWT token
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate credentials
  if (username === user.username && password === user.password) {
    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// 🛡️ Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Get token from "Bearer <token>"

  if (!token) {
    return res.status(403).json({ message: "Access denied: No token provided" });
  }

  // Verify token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Save user info to request
    req.user = decoded;
    next();
  });
}

// 🔒 Protected Route
app.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to the protected dashboard!",
    user: req.user,
  });
});

// 🏃 Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
