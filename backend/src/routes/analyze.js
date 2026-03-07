import { Router } from "express";
import multer from "multer";
import { analyze } from "../controllers/analyzeController.js";

const router = Router();
const MAX_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10)) * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

router.post("/", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (!err) return next();
    const msg = {
      MISSING_FIELD_NAME:    'Set form-data key to "image" with type File.',
      LIMIT_FILE_SIZE:       `File too large. Max ${process.env.MAX_FILE_SIZE_MB || 10} MB.`,
      LIMIT_UNEXPECTED_FILE: 'Unexpected field. Use "image" as the form-data key.',
    }[err.code] || err.message;
    res.status(400).json({ error: true, message: msg });
  });
}, analyze);

export default router;
