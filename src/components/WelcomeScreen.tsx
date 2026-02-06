import { useState, useEffect, useCallback } from "react";
import type { Difficulty } from "../engine/difficulty";
import { getDifficultyConfig } from "../engine/difficulty";
import { BrainIcon } from "./BrainIcon";

interface WelcomeScreenProps {
  onStart: (difficulty: Difficulty) => void;
  highScores: { easy: number; normal: number; hard: number };
  lastScore?: number;
  lastDifficulty?: Difficulty;
  isNewHighScore?: boolean;
}

const difficulties: Difficulty[] = ["easy", "normal", "hard"];
const filledBrains: Record<Difficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 3,
};

export function WelcomeScreen({
  onStart,
  highScores,
  lastScore,
  lastDifficulty,
  isNewHighScore,
}: WelcomeScreenProps) {
  const title = "Not The Right Number";
  const isReturning = lastScore !== undefined;
  const [displayedChars, setDisplayedChars] = useState(
    isReturning ? title.length : 0,
  );
  const [showContent, setShowContent] = useState(isReturning);
  const [showButton, setShowButton] = useState(isReturning);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(
    lastDifficulty ?? "easy",
  );

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
      if (showButton && e.key === "Enter") {
        onStart(selectedDifficulty);
      }
    },
    [showButton, onStart, selectedDifficulty],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
          <p
            className="text-2xl md:text-3xl font-bold chalk-glow"
            style={{ color: "var(--chalk-yellow)" }}
          >
            Game Over!
          </p>
          <p className="text-xl md:text-2xl chalk-text opacity-80 mt-2">
            Score: {lastScore}
          </p>
          {isNewHighScore && (
            <p
              className="text-lg md:text-xl font-bold chalk-glow mt-2 animate-pulse"
              style={{ color: "var(--chalk-green)" }}
            >
              New High Score!
            </p>
          )}
        </div>
      )}

      {/* How to play (hidden when returning from a game) */}
      {!isReturning && (
        <div
          className={`max-w-md text-center transition-opacity duration-500 ${
            showContent ? "opacity-100" : "opacity-0"
          }`}
        >
          <h2
            className="text-xl md:text-2xl chalk-text mb-4"
            style={{ color: "var(--chalk-yellow)" }}
          >
            How to play
          </h2>
          <p className="text-base md:text-lg chalk-text opacity-80 leading-relaxed">
            Enter numbers that satisfy all the rules. Each time you find the
            right number, a new rule is added that your current number breaks.
            How many rules can you beat?
          </p>
        </div>
      )}

      {/* Difficulty selector */}
      <div
        className={`mt-8 transition-opacity duration-500 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col gap-3 items-stretch w-full max-w-sm">
          {difficulties.map((d) => {
            const config = getDifficultyConfig(d);
            const isSelected = d === selectedDifficulty;
            const score = highScores[d];
            const filled = filledBrains[d];
            return (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`chalk-selector px-5 py-3 transition-opacity ${
                  isSelected ? "opacity-100" : "opacity-40"
                }`}
                style={
                  isSelected ? { borderColor: "var(--chalk-blue)" } : undefined
                }
              >
                <span className="flex items-center gap-4">
                  <span className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <BrainIcon key={i} filled={i < filled} size={32} />
                    ))}
                  </span>
                  <span className="flex flex-col items-start leading-tight">
                    <span className="opacity-90">
                      1 – {config.max.toLocaleString()}
                    </span>
                    <span className="opacity-60 text-sm">
                      Score: x {config.scoreMultiplier.toFixed(1)}
                    </span>
                    <span className="opacity-60 text-sm">
                      Best: {score ?? "-"}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start / Play Again button */}
      <div
        className={`mt-8 transition-opacity duration-500 ${
          showButton ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={() => onStart(selectedDifficulty)}
          className="chalk-button chalk-button-start text-2xl px-12 py-4"
          tabIndex={showButton ? 0 : -1}
        >
          {isReturning ? "Play Again" : "Start"}
        </button>
      </div>
    </div>
  );
}
