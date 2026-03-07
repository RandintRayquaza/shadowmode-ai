import { getHistory } from "../services/firestoreService.js";

export async function history(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
    const results = await getHistory(limit);
    res.json({ success: true, count: results.length, results });
  } catch (err) {
    next(err);
  }
}
