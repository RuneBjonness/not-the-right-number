import { useEffect, useRef, useState } from 'react';
import { playSound } from '../engine/sounds';

interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (count === 0) {
      playSound('countdownGo');
      onCompleteRef.current();
      return;
    }
    playSound('countdownTick');
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count]);

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
