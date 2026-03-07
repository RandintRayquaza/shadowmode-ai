import { Router } from "express";
import { history } from "../controllers/historyController.js";

const router = Router();

// GET /api/history?limit=20
router.get("/", history);

export default router;
