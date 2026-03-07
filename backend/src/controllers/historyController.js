import { getHistory } from "../services/firestoreService.js";

export async function history(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || "20", 10);
    const results = await getHistory(Math.min(limit, 50));
    res.json({ success: true, count: results.length, results });
  } catch (err) {
    console.error("[historyController] error:", err);
    next(err);
  }
}
