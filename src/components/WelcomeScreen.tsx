import { useState, useEffect, useCallback } from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
  highScore: number;
  lastScore?: number;
  isNewHighScore?: boolean;
}

export function WelcomeScreen({ onStart, highScore, lastScore, isNewHighScore }: WelcomeScreenProps) {
  const title = 'Not The Right Number';
  const isReturning = lastScore !== undefined;
  const [displayedChars, setDisplayedChars] = useState(isReturning ? title.length : 0);
  const [showContent, setShowContent] = useState(isReturning);
  const [showButton, setShowButton] = useState(isReturning);

  // Animate title character by character (only on first visit)
  useEffect(() => {
    if (displayedChars < title.length) {
      const delay = 30 + Math.random() * 40;
      const timer = setTimeout(() => {
        setDisplayedChars((c) => c + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else if (!isReturning) {
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    }
  }, [displayedChars, title.length, isReturning]);

  // Show button after content appears (only on first visit)
  useEffect(() => {
    if (showContent && !isReturning) {
      const timer = setTimeout(() => setShowButton(true), 400);
      return () => clearTimeout(timer);
    }
  }, [showContent, isReturning]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showButton && e.key === 'Enter') {
        onStart();
      }
    },
    [showButton, onStart]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-bold chalk-text-strong chalk-glow text-center mb-8 min-h-[1.2em]">
        {title.slice(0, displayedChars)}
      </h1>

      {/* Game over results */}
      {isReturning && (
        <div className="mb-6 text-center animate-chalk-appear">
          <p className="text-2xl md:text-3xl font-bold chalk-glow" style={{ color: 'var(--chalk-yellow)' }}>
            Game Over!
          </p>
          <p className="text-xl md:text-2xl chalk-text opacity-80 mt-2">
            Score: {lastScore}
          </p>
          {isNewHighScore && (
            <p
              className="text-lg md:text-xl font-bold chalk-glow mt-2 animate-pulse"
              style={{ color: 'var(--chalk-green)' }}
            >
              New High Score!
            </p>
          )}
        </div>
      )}

      {/* High score */}
      {highScore > 0 && (
        <div
          className={`mb-6 text-center transition-opacity duration-500 ${
            showContent ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-lg md:text-xl chalk-text opacity-60">
            Best: {highScore}
          </p>
        </div>
      )}

      {/* How to play */}
      <div
        className={`max-w-md text-center transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h2
          className="text-xl md:text-2xl chalk-text mb-4"
          style={{ color: 'var(--chalk-yellow)' }}
        >
          How to play
        </h2>
        <p className="text-base md:text-lg chalk-text opacity-80 leading-relaxed">
          Enter numbers that satisfy all the rules. Each time you find the right
          number, a new rule is added that your current number breaks. How many
          rules can you beat?
        </p>
      </div>

      {/* Start / Play Again button */}
      <div
        className={`mt-10 transition-opacity duration-500 ${
          showButton ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={onStart}
          className="chalk-button chalk-button-primary text-2xl px-10 py-3"
          tabIndex={showButton ? 0 : -1}
        >
          {isReturning ? 'Play Again' : 'Start'}
        </button>
      </div>
    </div>
  );
}
