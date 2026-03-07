import axios from "axios";
import FormData from "form-data";

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5001";

/**
 * Sends an image buffer to the Python analysis microservice
 * @param {Buffer} imageBuffer - raw image bytes
 * @param {string} originalName - original filename (used for MIME detection)
 * @returns {Promise<Object>} analysis result from Python service
 */
export async function analyzeImageWithPython(imageBuffer, originalName) {
  const form = new FormData();
  form.append("image", imageBuffer, {
    filename: originalName,
    contentType: "image/*",
  });

  try {
    const response = await axios.post(`${PYTHON_URL}/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 60_000, // 60s — model inference can be slow on first load
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return response.data;
  } catch (err) {
    const msg =
      err.response?.data?.error ||
      err.message ||
      "Python analysis service unavailable";
    console.error("[pythonBridge] error:", msg);
    throw new Error(`Python analysis failed: ${msg}`);
  }
}
