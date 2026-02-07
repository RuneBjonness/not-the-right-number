import { useEffect, useState } from 'react';

interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  if (count === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40" />
      <span
        key={count}
        className="relative text-[10rem] leading-none chalk-text-strong"
        style={{
          color: 'var(--chalk-yellow)',
          animation: 'countdown-pop 0.8s ease-out forwards',
        }}
      >
        {count}
      </span>
    </div>
  );
}
