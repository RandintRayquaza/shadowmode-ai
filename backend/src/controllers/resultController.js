import { getResultById } from "../services/firestoreService.js";

export async function result(req, res, next) {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    console.log(`[result] User ${userId} requesting result ${id}`);
    const record = await getResultById(id, userId);
    if (!record) return res.status(404).json({ error: true, message: "Analysis not found." });
    if (record === "forbidden") return res.status(403).json({ error: true, message: "Forbidden: this analysis belongs to another user." });
    res.json({ success: true, ...record });
  } catch (err) {
    next(err);
  }
}
