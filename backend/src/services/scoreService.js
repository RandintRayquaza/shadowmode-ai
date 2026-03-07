const SEVERITY_WEIGHTS = { high: 20, medium: 10, low: 5 };

function scoreToVerdict(score) {
  // score is the combined risk score (higher = more likely AI/manipulated)
  if (score < 40) return "Authentic Photo";
  if (score < 70) return "Possibly Edited";
  return "Likely AI Generated";
}

export function calculateScore({ elaScore = 0, aiProbability = 0, flags = [] }) {
  let score = 100;

  for (const flag of flags) {
    score -= SEVERITY_WEIGHTS[flag.severity] ?? 5;
  }

  score -= (elaScore / 100) * 30;
  score -= aiProbability * 40;
  score = Math.round(Math.max(0, Math.min(100, score)));

  return { score, verdict: scoreToVerdict(score) };
}
