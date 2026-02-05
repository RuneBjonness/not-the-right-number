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
    <div className="flex items-center gap-2 md:gap-4">
      {/* Total Score */}
      <div className="flex items-baseline gap-1">
        <span
          className="text-3xl md:text-5xl font-bold chalk-glow"
          style={{ color: 'var(--chalk-yellow)' }}
        >
          {totalScore}
        </span>
        {/* Potential Points */}
        <span
          className={`text-lg md:text-2xl font-bold chalk-text ${isLow ? 'animate-pulse' : ''}`}
          style={{ color: getPotentialColor(potentialPoints) }}
        >
          +{potentialPoints}
        </span>
      </div>

      {/* High Score */}
      <div className="text-xs md:text-sm chalk-text opacity-60 border-l border-current pl-2 md:pl-3">
        Best: {highScore}
      </div>
    </div>
  );
}
