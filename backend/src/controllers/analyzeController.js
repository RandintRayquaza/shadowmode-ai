import { v4 as uuidv4 } from "uuid";
import { analyzeImageWithPython } from "../services/pythonBridge.js";
import { uploadImage } from "../services/imagekitService.js";
import { saveAnalysis } from "../services/firestoreService.js";
import { generateExplanation } from "../services/llmService.js";
import { calculateScore } from "../services/scoreService.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = (parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10)) * 1024 * 1024;

export async function analyze(req, res, next) {
  try {
    // ── 1. Validate uploaded file ──────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({ error: true, message: "No image uploaded." });
    }
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: true,
        message: `Unsupported file type: ${req.file.mimetype}. Allowed: JPEG, PNG, WEBP, GIF.`,
      });
    }
    if (req.file.size > MAX_BYTES) {
      return res.status(400).json({
        error: true,
        message: `File too large. Maximum allowed size is ${process.env.MAX_FILE_SIZE_MB || 10} MB.`,
      });
    }

    const imageBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const baseName = `${uuidv4()}-${originalName.replace(/\s+/g, "_")}`;

    console.log(`[analyzeController] Processing: ${originalName}`);

    // ── 2. Send to Python microservice ─────────────────────────────────────
    const pythonResult = await analyzeImageWithPython(imageBuffer, originalName);
    const {
      ela_score = 0,
      ai_probability = 0,
      ai_label = "unknown",
      metadata = {},
      flags = [],
      ela_heatmap_b64 = null,
    } = pythonResult;

    // ── 3. Upload images to ImageKit ───────────────────────────────────────
    const [originalUpload, elaUpload] = await Promise.all([
      uploadImage(imageBuffer, baseName, "/analyses/originals"),
      ela_heatmap_b64
        ? uploadImage(
            Buffer.from(ela_heatmap_b64, "base64"),
            `ela-${baseName}`,
            "/analyses/ela"
          )
        : Promise.resolve({ url: null, fileId: null, thumbnailUrl: null }),
    ]);

    // ── 4. Score calculation ───────────────────────────────────────────────
    const { score, verdict } = calculateScore({ elaScore: ela_score, aiProbability: ai_probability, flags });

    // ── 5. LLM explanation ─────────────────────────────────────────────────
    const explanation = await generateExplanation({
      score,
      verdict,
      aiProbability: ai_probability,
      flags,
      metadata,
    });

    // ── 6. Build record ────────────────────────────────────────────────────
    const record = {
      imageUrl: originalUpload.url,
      imageFileId: originalUpload.fileId,
      thumbnailUrl: originalUpload.thumbnailUrl,
      elaUrl: elaUpload.url,
      elaFileId: elaUpload.fileId,
      score,
      verdict,
      aiProbability: ai_probability,
      aiLabel: ai_label,
      elaScore: ela_score,
      metadata,
      flags,
      explanation,
      originalName,
    };

    // ── 7. Persist to Firestore ────────────────────────────────────────────
    let firestoreId = null;
    try {
      firestoreId = await saveAnalysis(record);
    } catch (dbErr) {
      console.warn("[analyzeController] Firestore save failed:", dbErr.message);
    }

    // ── 8. Return response ─────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      id: firestoreId,
      ...record,
    });
  } catch (err) {
    console.error("[analyzeController] Unhandled error:", err);
    next(err);
  }
}
