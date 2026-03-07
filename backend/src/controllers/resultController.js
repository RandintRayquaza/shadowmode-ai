import { getResultById } from "../services/firestoreService.js";

export async function result(req, res, next) {
  try {
    const record = await getResultById(req.params.id);
    if (!record) return res.status(404).json({ error: true, message: "Analysis not found." });
    res.json({ success: true, ...record });
  } catch (err) {
    next(err);
  }
}
