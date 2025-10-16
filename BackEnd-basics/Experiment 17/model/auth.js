const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
  const token = authHeader.slice(7).trim();
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret-369"
    );
    req.user = decoded; // { username }
    return next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = auth;
