import { v4 as uuidv4 } from "uuid";
import { analyzeImageWithPython } from "../services/pythonBridge.js";
import { uploadImage } from "../services/imagekitService.js";
import { saveAnalysis, updateAnalysis } from "../services/firestoreService.js";
import { generateExplanation } from "../services/llmService.js";
import { calculateScore } from "../services/scoreService.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = (parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10)) * 1024 * 1024;

export async function analyze(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: "No image uploaded." });
    }
    if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ error: true, message: `Unsupported file type: ${req.file.mimetype}.` });
    }
    if (req.file.size > MAX_BYTES) {
      return res.status(400).json({ error: true, message: `File exceeds ${process.env.MAX_FILE_SIZE_MB || 10} MB limit.` });
    }

    const { buffer: imageBuffer, originalname } = req.file;
    const baseName = `${uuidv4()}-${originalname.replace(/\s+/g, "_")}`;

    let originalUpload = { url: null, fileId: null, thumbnailUrl: null };
    try {
      originalUpload = await uploadImage(imageBuffer, baseName, "/analyses/originals");
    } catch (e) {
      console.error("[analyze] ImageKit upload failed:", e.message);
    }

    const docId = await saveAnalysis({
      imageUrl: originalUpload.url,
      imageFileId: originalUpload.fileId,
      thumbnailUrl: originalUpload.thumbnailUrl,
      elaUrl: null,
      score: null,
      verdict: null,
      aiProbability: null,
      aiLabel: null,
      elaScore: null,
      metadata: null,
      flags: [],
      explanation: null,
      originalName: originalname,
      status: "pending",
    });

    res.status(202).json({
      success: true,
      id: docId,
      status: "pending",
      imageUrl: originalUpload.url,
      thumbnailUrl: originalUpload.thumbnailUrl,
      originalName: originalname,
    });

    // Background analysis
    (async () => {
      try {
        const python = await analyzeImageWithPython(imageBuffer, originalname);
        const { ela_score = 0, ai_probability = 0, ai_label = "unknown", metadata = {}, flags = [], ela_heatmap_b64 = null } = python;

        let elaUpload = { url: null, fileId: null };
        if (ela_heatmap_b64) {
          try {
            elaUpload = await uploadImage(Buffer.from(ela_heatmap_b64, "base64"), `ela-${baseName}`, "/analyses/ela");
          } catch (e) {
            console.error("[analyze] ELA upload failed:", e.message);
          }
        }

        const { score, verdict } = calculateScore({ elaScore: ela_score, aiProbability: ai_probability, flags });
        const explanation = await generateExplanation({ score, verdict, aiProbability: ai_probability, flags, metadata });

        await updateAnalysis(docId, {
          elaUrl: elaUpload.url,
          elaFileId: elaUpload.fileId,
          score, verdict,
          aiProbability: ai_probability,
          aiLabel: ai_label,
          elaScore: ela_score,
          metadata, flags, explanation,
          status: "complete",
        });
      } catch (e) {
        console.error("[analyze] Background analysis failed:", e.message);
        await updateAnalysis(docId, { status: "analysis_failed" }).catch(() => {});
      }
    })();
  } catch (err) {
    next(err);
  }
}
