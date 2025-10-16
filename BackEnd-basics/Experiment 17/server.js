require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const auth = require("./middlewares/auth");

const app = express();
app.use(express.json());

const USERS = {
  user1: { password: "password123", balance: 1000 },
};

function signToken(payload) {
  const secret = process.env.JWT_SECRET || "dev-secret-369";
  const expiresIn = process.env.JWT_EXPIRES_IN || "1h";
  return jwt.sign(payload, secret, { expiresIn });
}

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Experiment-17 JWT Banking API" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }
  const rec = USERS[username];
  if (!rec || rec.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = signToken({ username });
  return res.status(200).json({ token });
});

app.get("/balance", auth, (req, res) => {
  const { username } = req.user;
  const rec = USERS[username];
  return res.status(200).json({ balance: rec.balance });
});

app.post("/deposit", auth, (req, res) => {
  const { username } = req.user;
  const { amount } = req.body || {};
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a positive number" });
  }
  USERS[username].balance += num;
  return res.status(200).json({
    message: `Deposited $${num}`,
    newBalance: USERS[username].balance,
  });
});

app.post("/withdraw", auth, (req, res) => {
  const { username } = req.user;
  const { amount } = req.body || {};
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a positive number" });
  }
  if (USERS[username].balance < num) {
    return res
      .status(400)
      .json({ message: "Insufficient balance for withdrawal" });
  }
  USERS[username].balance -= num;
  return res.status(200).json({
    message: `Withdraw $${num}`,
    newBalance: USERS[username].balance,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Experiment-17 API running on http://localhost:${PORT}`);
});
