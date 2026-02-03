interface ScoreDisplayProps {
  highScore: number;
  totalScore: number;
  potentialPoints: number;
}

function getPotentialColor(points: number): string {
  if (points > 10) return 'var(--chalk-green)';
  if (points > 5) return 'var(--chalk-yellow)';
  return 'var(--chalk-red)';
}

export function ScoreDisplay({
  highScore,
  totalScore,
  potentialPoints,
}: ScoreDisplayProps) {
  const isLow = potentialPoints <= 5;

  return (
    <div className="mb-6 text-center">
      {/* High Score */}
      <p className="text-sm chalk-text opacity-60">
        High Score: {highScore}
      </p>

      {/* Total Score */}
      <p className="text-lg chalk-text opacity-70 mt-2">Score</p>
      <p
        className="text-7xl font-bold chalk-glow"
        style={{ color: 'var(--chalk-yellow)' }}
      >
        {totalScore}
      </p>

      {/* Potential Points */}
      <p
        className={`text-3xl font-bold mt-2 chalk-text ${isLow ? 'animate-pulse' : ''}`}
        style={{ color: getPotentialColor(potentialPoints) }}
      >
        +{potentialPoints}
      </p>
    </div>
  );
}
