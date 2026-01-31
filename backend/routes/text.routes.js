import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

import {
  analyzeText,
  analyzeImage,
  getUserHistory,
} from "../controllers/text.controllers.js";

const router = express.Router();
const upload = multer();

router.post("/analyze-text", authMiddleware, analyzeText);
router.post(
  "/analyze-image",
  authMiddleware,
  upload.single("image"),
  analyzeImage
);
router.get("/get-user-history", authMiddleware, getUserHistory);

export default router;
