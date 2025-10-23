// server.js
const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

// Secret key for signing JWT
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// 🔹 Hardcoded sample users (for demo)
const users = [
  { id: 1, username: "adminUser", password: "12345", role: "Admin" },
  { id: 2, username: "modUser", password: "12345", role: "Moderator" },
  { id: 3, username: "normalUser", password: "12345", role: "User" },
];

// 🟢 LOGIN ROUTE - issues token with user role
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Create token with role info
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login successful",
    role: user.role,
    token,
  });
});

// 🛡️ Middleware to verify token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(403).json({ message: "Access denied: No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "Invalid or expired token" });

    req.user = decoded;
    next();
  });
}

// 🔑 Middleware for role-based access
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: Insufficient role privileges" });
    }
    next();
  };
}

// 🔒 Protected routes
app.get("/user", verifyToken, authorizeRoles("User", "Admin", "Moderator"), (req, res) => {
  res.json({ message: "Welcome to the User Profile Page", user: req.user });
});

app.get("/moderator", verifyToken, authorizeRoles("Moderator", "Admin"), (req, res) => {
  res.json({ message: "Welcome to the Moderator Management Panel", user: req.user });
});

app.get("/admin", verifyToken, authorizeRoles("Admin"), (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard", user: req.user });
});

// 🏃 Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
