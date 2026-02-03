export function calculateLevelStartingPoints(level: number): number {
  return 20 + level * 10;
}

export function applyWrongAnswerPenalty(points: number): number {
  return Math.floor(points / 2);
}
