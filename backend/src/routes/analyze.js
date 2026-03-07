import { Router } from "express";
import multer from "multer";
import { analyze } from "../controllers/analyzeController.js";

const router = Router();
const MAX_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10)) * 1024 * 1024;

// Use memory storage so the buffer is available in req.file.buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// POST /api/analyze
router.post("/", upload.single("image"), analyze);

export default router;
