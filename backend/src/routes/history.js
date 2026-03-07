import { Router } from "express";
import { history } from "../controllers/historyController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// GET /api/history?limit=20   — requires valid Firebase ID token
router.get("/", requireAuth, history);

export default router;
