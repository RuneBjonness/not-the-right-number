export function calculateLevelStartingPoints(level: number): number {
  return 20 + level * 10;
}

export function applyWrongAnswerPenalty(points: number): number {
  return Math.floor(points / 2);
}

/**
 * Bonus points based on how much a new rule constrains the search space.
 * A rule that eliminates 90% of valid numbers is worth more than one
 * that only eliminates 10%.
 */
export function calculateDifficultyBonus(
  previousValidCount: number,
  newValidCount: number
): number {
  if (previousValidCount <= 0) return 0;
  const eliminationRatio = 1 - newValidCount / previousValidCount;
  return Math.ceil(10 * eliminationRatio);
}
