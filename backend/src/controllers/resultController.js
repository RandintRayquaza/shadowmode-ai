import { getResultById } from "../services/firestoreService.js";

export async function result(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: true, message: "Analysis ID is required." });
    }

    const record = await getResultById(id);
    if (!record) {
      return res.status(404).json({
        error: true,
        message: `Analysis result not found for id: ${id}`,
      });
    }

    res.json({ success: true, ...record });
  } catch (err) {
    console.error("[resultController] error:", err);
    next(err);
  }
}
