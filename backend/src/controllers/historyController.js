import { getHistory } from "../services/firestoreService.js";

export async function history(req, res, next) {
  try {
    const userId = req.user.uid;
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
    console.log(`[history] User ${userId} requesting history (limit: ${limit})`);
    const results = await getHistory(userId, limit);
    res.json({ success: true, count: results.length, results });
  } catch (err) {
    next(err);
  }
}
