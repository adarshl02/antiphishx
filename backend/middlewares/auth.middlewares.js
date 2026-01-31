import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const JWT_JOIN_SECRET = process.env.JWT_JOIN_SECRET;

export const authMiddleware = (req, res, next) => {
  let token = req.header("Authorization");

  if (!token)
    return res.status(401).json({ error: "Unauthorized: Token missing" });

  if (token.startsWith("Bearer ")) {
    token = token.substring(7);
  }

  try {
    const decoded = jwt.verify(token, JWT_JOIN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ error: "Unauthorized: Invalid token", err });
  }
};