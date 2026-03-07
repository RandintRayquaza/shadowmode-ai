import { Router } from "express";
import { result } from "../controllers/resultController.js";

const router = Router();

// GET /api/result/:id
router.get("/:id", result);

export default router;
