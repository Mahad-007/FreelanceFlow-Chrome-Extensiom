export function getScoreClass(score: number): string {
  if (score >= 80) return "score-high";
  if (score >= 50) return "score-medium";
  return "score-low";
}
