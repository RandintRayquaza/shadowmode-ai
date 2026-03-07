import axios from "axios";

const HIVE_API_KEY = process.env.HIVE_AI_API_KEY;
const HIVE_ACCESS_KEY = process.env.HIVE_AI_ACCESS_KEY;

/**
 * Build a structured prompt from analysis results
 */
function buildPrompt({ score, verdict, aiProbability, flags, metadata }) {
  const flagsSummary =
    flags.length > 0
      ? flags.map((f) => `- ${f.name} (${f.severity}): ${f.description}`).join("\n")
      : "- No significant anomalies detected";

  const metaSummary = metadata
    ? [
        metadata.camera ? `Camera: ${metadata.camera}` : null,
        metadata.datetime ? `Captured: ${metadata.datetime}` : null,
        metadata.software ? `Software tag: ${metadata.software}` : null,
        metadata.hasGps ? "GPS data present" : "No GPS data",
      ]
        .filter(Boolean)
        .join(", ")
    : "No metadata available";

  return `You are a forensic image analysis expert. Analyse the following results and write a concise 2-3 sentence plain-English explanation of whether this image appears authentic or manipulated. Be direct and non-technical.

Authenticity Score: ${score}/100 (${verdict})
AI Generation Probability: ${(aiProbability * 100).toFixed(1)}%
Image Metadata: ${metaSummary}
Detected Issues:
${flagsSummary}

Write only the explanation, no headers or bullet points.`;
}

/**
 * Call Hive AI text generation API
 */
async function callHiveAI(prompt) {
  // Hive AI uses a chat-completion style endpoint
  const response = await axios.post(
    "https://api.thehive.ai/api/v2/task/sync",
    {
      text_data: prompt,
    },
    {
      headers: {
        Authorization: `Token ${HIVE_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15_000,
    }
  );

  // Hive AI response structure: status[0].response.output[0].choices[0].message.content
  const output =
    response.data?.status?.[0]?.response?.output?.[0]?.choices?.[0]?.message?.content;

  if (output) return output.trim();
  throw new Error("Unexpected Hive AI response structure");
}

/**
 * Build a fallback template explanation when LLM is unavailable
 */
function buildFallback({ score, verdict, aiProbability, flags }) {
  if (score >= 80) {
    return "This image shows no significant signs of manipulation or AI generation. The metadata and pixel-level analysis appear consistent with an authentic photograph.";
  }
  if (aiProbability > 0.7) {
    return `This image has a ${(aiProbability * 100).toFixed(0)}% probability of being AI-generated based on visual pattern analysis. The forensic signals are inconsistent with real camera images.`;
  }
  if (flags.length > 0) {
    const topFlag = flags[0];
    return `The image shows signs of potential editing. The primary concern is: ${topFlag.description}. The authenticity score of ${score}/100 indicates this image may have been modified.`;
  }
  return `The analysis returned an authenticity score of ${score}/100 (${verdict}). Some anomalies were detected that suggest this image may not be entirely original.`;
}

/**
 * Generate a natural language explanation for the analysis result
 * @param {Object} analysisData
 * @returns {Promise<string>}
 */
export async function generateExplanation(analysisData) {
  const prompt = buildPrompt(analysisData);

  try {
    const explanation = await callHiveAI(prompt);
    console.log("[llmService] Hive AI explanation generated.");
    return explanation;
  } catch (err) {
    console.warn("[llmService] Hive AI failed, using fallback:", err.message);
    return buildFallback(analysisData);
  }
}
