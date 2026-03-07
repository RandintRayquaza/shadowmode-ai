const SEVERITY_WEIGHTS = { high: 20, medium: 10, low: 5 };

function scoreToVerdict(score) {
  if (score >= 80) return "Authentic";
  if (score >= 50) return "Possibly Edited";
  if (score >= 20) return "Likely Manipulated";
  return "AI Generated";
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
