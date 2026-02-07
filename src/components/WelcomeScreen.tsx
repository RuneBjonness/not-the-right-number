import { useState, useEffect, useCallback } from "react";
import type { Difficulty } from "../engine/difficulty";
import { getDifficultyConfig } from "../engine/difficulty";
import { BrainIcon } from "./BrainIcon";

interface WelcomeScreenProps {
  onStart: (difficulty: Difficulty) => void;
  onStartTutorial: () => void;
  onShowBrag: () => void;
  highScores: { easy: number; normal: number; hard: number };
  solved: { easy: boolean; normal: boolean; hard: boolean };
  lastScore?: number;
  lastDifficulty?: Difficulty;
  isNewHighScore?: boolean;
  lastIsWon?: boolean;
  skipAnimation?: boolean;
}

const difficulties: Difficulty[] = ["easy", "normal", "hard"];
const filledBrains: Record<Difficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 3,
};

export function WelcomeScreen({
  onStart,
  onStartTutorial,
  onShowBrag,
  highScores,
  solved,
  lastScore,
  lastDifficulty,
  isNewHighScore,
  lastIsWon,
  skipAnimation,
}: WelcomeScreenProps) {
  const title = "Not The Right Number";
  const isReturning = lastScore !== undefined;
  const noAnim = isReturning || skipAnimation;
  const [displayedChars, setDisplayedChars] = useState(
    noAnim ? title.length : 0,
  );
  const [showContent, setShowContent] = useState(noAnim);
  const [showButton, setShowButton] = useState(noAnim);
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
    } else if (!noAnim) {
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    }
  }, [displayedChars, title.length, noAnim]);

  // Show button after content appears (only on first visit)
  useEffect(() => {
    if (showContent && !noAnim) {
      const timer = setTimeout(() => setShowButton(true), 400);
      return () => clearTimeout(timer);
    }
  }, [showContent, noAnim]);

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
      <div className="relative inline-block mb-8">
        <h1 className="text-4xl md:text-6xl font-bold chalk-text-strong chalk-glow text-center min-h-[1.2em]">
          {title.slice(0, displayedChars)}
        </h1>
        {lastIsWon && isReturning && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ transform: "rotate(-3deg)" }}
          >
            <div
              className="w-[110%] chalk-glow"
              style={{
                height: "6px",
                background: "var(--chalk-red)",
                borderRadius: "3px",
                opacity: 0.9,
                filter: "url(#chalk)",
              }}
            />
          </div>
        )}
      </div>

      {/* Game over results */}
      {isReturning && (
        <div className="mb-6 text-center animate-chalk-appear">
          <p
            className="text-2xl md:text-3xl font-bold chalk-glow"
            style={{
              color: lastIsWon ? "var(--chalk-green)" : "var(--chalk-yellow)",
            }}
          >
            {lastIsWon ? "That's the right number!" : "Game Over!"}
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

      {/* How to play link (hidden when returning from a game) */}
      {!isReturning && (
        <div
          className={`text-center transition-opacity duration-500 ${
            showContent ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-base md:text-lg chalk-text opacity-80 leading-relaxed">
            I'm thinking of a number. You'll never guess it though
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
            const isSolved = solved[d];
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
                  <span className="flex flex-col items-center gap-1">
                    <span className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <BrainIcon key={i} filled={i < filled} size={32} />
                      ))}
                    </span>
                    <span className="flex items-center gap-2 text-lg font-bold">
                      <span
                        className="chalk-glow"
                        style={{
                          color: isSolved
                            ? "var(--chalk-green)"
                            : "var(--chalk-red)",
                        }}
                      >
                        {isSolved ? "Solved!" : "Unsolved"}
                      </span>
                      <span className="opacity-40">-</span>
                      <span className="opacity-80">{score || "-"}</span>
                    </span>
                  </span>
                  <span
                    className="self-stretch w-px opacity-40"
                    style={{ background: "var(--chalk-white)" }}
                  />
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-lg opacity-90">
                      1 – {config.max.toLocaleString()}
                    </span>
                    <span className="opacity-60 text-sm">
                      x {config.scoreMultiplier.toFixed(1)} score
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* How to play link + Start / Play Again button */}
      <div
        className={`mt-8 flex flex-col items-center gap-3 transition-opacity duration-500 ${
          showButton ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex gap-4">
          <button
            onClick={onStartTutorial}
            className="chalk-text text-base underline opacity-50 hover:opacity-90 transition-opacity"
            style={{ color: "var(--chalk-blue)" }}
            tabIndex={showButton ? 0 : -1}
          >
            How to play
          </button>
          <button
            onClick={onShowBrag}
            className="chalk-text text-base underline opacity-50 hover:opacity-90 transition-opacity"
            style={{ color: "var(--chalk-yellow)" }}
            tabIndex={showButton ? 0 : -1}
          >
            Brag &amp; Challenge
          </button>
        </div>
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
