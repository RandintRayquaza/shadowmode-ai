import axios from "axios";
import FormData from "form-data";

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5001";

export async function analyzeImageWithPython(imageBuffer, originalName) {
  const form = new FormData();
  form.append("image", imageBuffer, { filename: originalName, contentType: "image/*" });

  try {
    const { data } = await axios.post(`${PYTHON_URL}/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 60_000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return data;
  } catch (err) {
    const msg = err.response?.data?.error || err.message || "Python analysis service unavailable";
    throw new Error(`Python analysis failed: ${msg}`);
  }
}
