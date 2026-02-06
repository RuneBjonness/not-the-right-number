interface ScoreDisplayProps {
  highScore: number;
  totalScore: number;
  validCount: number;
}

function formatCount(n: number): string {
  return n.toLocaleString();
}

export function ScoreDisplay({
  highScore,
  totalScore,
  validCount,
}: ScoreDisplayProps) {
  return (
    <div className="flex items-center gap-5">
      <span className="text-m chalk-text opacity-80">Best: {highScore}</span>
      <span
        className="text-lg font-bold chalk-glow"
        style={{ color: "var(--chalk-yellow)" }}
      >
        Score: {totalScore}
      </span>
      <span className="text-m chalk-text opacity-80">
        Valid: {formatCount(validCount)}
      </span>
    </div>
  );
}
