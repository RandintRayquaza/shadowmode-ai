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

  return `You are a forensic image analysis expert. Write a concise 2-3 sentence plain-English explanation of whether this image appears authentic or AI-generated. Be direct and non-technical. Base your conclusion primarily on the Neural AI Score.

Verdict: ${verdict}
Neural AI Score: ${(aiProbability * 100).toFixed(1)}% (primary signal)
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

function fallbackExplanation({ verdict, score }) {
  const riskDisplay = score != null ? Math.round(score) : '?';
  if (verdict === 'Authentic Photo') {
    return `Risk analysis score: ${riskDisplay}/100. The neural detector found no strong synthetic patterns and forensic signals are consistent with an authentic photograph.`;
  }
  if (verdict === 'Possibly Edited') {
    return `Risk analysis score: ${riskDisplay}/100. Some synthetic patterns were detected but the evidence is not conclusive. The image may have been processed or lightly edited.`;
  }
  // Likely AI Generated
  return `Risk analysis score: ${riskDisplay}/100. The combined forensic and neural analysis strongly indicates AI-generated visual patterns.`;
}

export async function generateExplanation(analysisData) {
  try {
    return await callHiveAI(buildPrompt(analysisData));
  } catch {
    return fallbackExplanation(analysisData);
  }
}
