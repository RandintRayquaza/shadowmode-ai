import axios from "axios";

const HIVE_API_KEY = process.env.HIVE_AI_API_KEY;

function buildPrompt({ score, verdict, aiProbability, flags, metadata }) {
  const flagsSummary = flags.length > 0
    ? flags.map((f) => `- ${f.name} (${f.severity}): ${f.description}`).join("\n")
    : "- No significant anomalies detected";

  const metaSummary = metadata
    ? [
        metadata.camera   ? `Camera: ${metadata.camera}`         : null,
        metadata.datetime ? `Captured: ${metadata.datetime}`     : null,
        metadata.software ? `Software tag: ${metadata.software}` : null,
        metadata.hasGps   ? "GPS data present"                   : "No GPS data",
      ].filter(Boolean).join(", ")
    : "No metadata available";

  return `You are a forensic image analysis expert. Write a concise 2-3 sentence plain-English explanation of whether this image appears authentic or manipulated. Be direct and non-technical.

Authenticity Score: ${score}/100 (${verdict})
AI Generation Probability: ${(aiProbability * 100).toFixed(1)}%
Image Metadata: ${metaSummary}
Detected Issues:
${flagsSummary}

Write only the explanation, no headers or bullet points.`;
}

async function callHiveAI(prompt) {
  const { data } = await axios.post(
    "https://api.thehive.ai/api/v2/task/sync",
    { text_data: prompt },
    {
      headers: { Authorization: `Token ${HIVE_API_KEY}`, "Content-Type": "application/json" },
      timeout: 15_000,
    }
  );
  const output = data?.status?.[0]?.response?.output?.[0]?.choices?.[0]?.message?.content;
  if (output) return output.trim();
  throw new Error("Unexpected Hive AI response");
}

function fallbackExplanation({ score, verdict, aiProbability, flags }) {
  if (score >= 80) return "This image shows no significant signs of manipulation or AI generation. The metadata and pixel-level analysis appear consistent with an authentic photograph.";
  if (aiProbability > 0.7) return `This image has a ${(aiProbability * 100).toFixed(0)}% probability of being AI-generated based on visual pattern analysis.`;
  if (flags.length > 0) return `The image shows signs of potential editing. The primary concern is: ${flags[0].description}. Authenticity score: ${score}/100.`;
  return `Analysis returned an authenticity score of ${score}/100 (${verdict}). Some anomalies suggest this image may not be entirely original.`;
}

export async function generateExplanation(analysisData) {
  try {
    return await callHiveAI(buildPrompt(analysisData));
  } catch {
    return fallbackExplanation(analysisData);
  }
}
