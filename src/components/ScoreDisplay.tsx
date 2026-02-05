interface ScoreDisplayProps {
  highScore: number;
  totalScore: number;
}

export function ScoreDisplay({
  highScore,
  totalScore,
}: ScoreDisplayProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs chalk-text opacity-50">
        Best: {highScore}
      </span>
      <span
        className="text-lg font-bold chalk-glow"
        style={{ color: 'var(--chalk-yellow)' }}
      >
        Score: {totalScore}
      </span>
    </div>
  );
}
