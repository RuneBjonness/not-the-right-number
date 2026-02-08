import { useEffect, useRef } from 'react';
import { playSound } from '../engine/sounds';
import { getUrgencyLevel } from '../engine/urgency';
import type { UrgencyLevel } from '../engine/urgency';

interface ScoreDisplayProps {
  highScore: number;
  totalScore: number;
  validCount: number;
  potentialPoints: number;
  secondsLeft: number;
}

function formatCount(n: number): string {
  return n.toLocaleString();
}

const urgencyStyles: Record<UrgencyLevel, { color: string; className: string }> = {
  normal: { color: 'var(--chalk-green)', className: '' },
  warning: { color: 'var(--chalk-yellow)', className: '' },
  danger: { color: 'var(--chalk-red)', className: 'animate-timer-pulse' },
  critical: { color: 'var(--chalk-red)', className: 'animate-timer-critical' },
};

export function ScoreDisplay({
  highScore,
  totalScore,
  validCount,
  potentialPoints,
  secondsLeft,
}: ScoreDisplayProps) {
  const urgency = getUrgencyLevel(secondsLeft);
  const { color, className } = urgencyStyles[urgency];
  const prevUrgencyRef = useRef<UrgencyLevel>(urgency);

  useEffect(() => {
    const prev = prevUrgencyRef.current;
    prevUrgencyRef.current = urgency;
    if (prev === urgency) return;
    if (urgency === 'danger') playSound('lowTimeWarning');
    if (urgency === 'critical') playSound('lowTimeCritical');
  }, [urgency]);

  return (
    <div className="flex flex-col items-center w-full" data-tutorial="score">
      {/* Big countdown timer */}
      <div
        className={`text-5xl font-bold chalk-glow leading-none ${className}`}
        style={{ color, transition: 'color 0.3s' }}
      >
        +{potentialPoints}
      </div>
      {/* Stats row */}
      <div className="flex items-center gap-5 mt-1">
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
    </div>
  );
}
