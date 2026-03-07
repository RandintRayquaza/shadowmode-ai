/**
 * Severity weights for score deductions
 */
const SEVERITY_WEIGHTS = {
  high: 20,
  medium: 10,
  low: 5,
};

/**
 * Map a numeric score to a verdict category
 * @param {number} score
 * @returns {string}
 */
function scoreToVerdict(score) {
  if (score >= 80) return "Authentic";
  if (score >= 50) return "Possibly Edited";
  if (score >= 20) return "Likely Manipulated";
  return "AI Generated";
}

/**
 * Calculate the final authenticity score from raw analysis signals
 *
 * @param {Object} params
 * @param {number} params.elaScore          - 0–100, higher = more anomalous
 * @param {number} params.aiProbability     - 0.0–1.0
 * @param {Array}  params.flags             - [{name, severity, description}]
 * @returns {{ score: number, verdict: string }}
 */
export function calculateScore({ elaScore = 0, aiProbability = 0, flags = [] }) {
  let score = 100;

  // Per-flag deductions
  for (const flag of flags) {
    const weight = SEVERITY_WEIGHTS[flag.severity] ?? 5;
    score -= weight;
  }

  // ELA deduction — ELA score 0-100 contributes up to 30 points
  const elaDeduction = (elaScore / 100) * 30;
  score -= elaDeduction;

  // AI probability deduction — up to 40 points
  const aiDeduction = aiProbability * 40;
  score -= aiDeduction;

  // Clamp between 0 and 100, round to integer
  score = Math.round(Math.max(0, Math.min(100, score)));

  return { score, verdict: scoreToVerdict(score) };
}
