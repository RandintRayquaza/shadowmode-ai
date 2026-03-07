import { Router } from "express";
import { result } from "../controllers/resultController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// GET /api/result/:id   — requires valid Firebase ID token; returns 403 if wrong owner
router.get("/:id", requireAuth, result);

export default router;
