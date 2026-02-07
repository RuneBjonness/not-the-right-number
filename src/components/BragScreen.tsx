import { useState, useCallback } from "react";
import { BrainIcon } from "./BrainIcon";
import {
  encodeBrag,
  buildShareUrl,
  buildShareMessage,
} from "../engine/bragCodec";
import type { Challenge } from "../engine/bragCodec";
import type { Difficulty } from "../engine/difficulty";

interface BragScreenProps {
  highScores: { easy: number; normal: number; hard: number };
  solved: { easy: boolean; normal: boolean; hard: boolean };
  playerName: string;
  onSetPlayerName: (name: string) => void;
  onReturn: () => void;
  challenges: Challenge[];
  onRemoveChallenge: (id: string) => void;
}

const difficulties: Difficulty[] = ["easy", "normal", "hard"];
const filledBrains: Record<Difficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 3,
};

function relativeTime(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function BragScreen({
  highScores,
  solved,
  playerName,
  onSetPlayerName,
  onReturn,
  challenges,
  onRemoveChallenge,
}: BragScreenProps) {
  const [copied, setCopied] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  const handleCopy = useCallback(async () => {
    const scores: [number, number, number] = [
      highScores.easy,
      highScores.normal,
      highScores.hard,
    ];
    const solvedMask =
      (solved.easy ? 1 : 0) | (solved.normal ? 2 : 0) | (solved.hard ? 4 : 0);

    const encoded = encodeBrag(playerName, scores, solvedMask);
    const url = buildShareUrl(encoded);
    const message = buildShareMessage(url);

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFallbackUrl(url);
    }
  }, [highScores, solved, playerName]);

  const canShare = playerName.trim().length > 0;

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-3 py-2">
        <button
          onClick={onReturn}
          className="chalk-text text-base opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: "var(--chalk-blue)" }}
        >
          &larr; Return
        </button>
        <span
          className="chalk-text text-base opacity-60"
          style={{ color: "var(--chalk-yellow)" }}
        >
          Brag
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-sm space-y-6">
          {/* High scores */}
          <div className="space-y-3">
            <h2
              className="text-xl font-bold chalk-text-strong chalk-glow text-center"
              style={{ color: "var(--chalk-yellow)" }}
            >
              Your Records
            </h2>
            {difficulties.map((d) => {
              const score = highScores[d];
              const filled = filledBrains[d];
              const isSolved = solved[d];
              return (
                <div key={d} className="flex items-center gap-3 px-3 py-2">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <BrainIcon key={i} filled={i < filled} size={24} />
                    ))}
                  </span>
                  <span className="chalk-text text-lg capitalize opacity-80 flex-1">
                    {d}
                  </span>
                  <span className="chalk-text text-lg opacity-90 text-right w-24">
                    {score > 0 ? `${score} pts` : "--"}
                  </span>
                  <span
                    className="chalk-text text-sm font-bold w-6 text-center"
                    style={{
                      color: isSolved ? "var(--chalk-green)" : "var(--chalk-red)",
                      opacity: isSolved ? 1 : 0.5,
                    }}
                  >
                    {isSolved ? "\u2713" : "\u2717"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <label className="chalk-text text-sm opacity-60 block">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => onSetPlayerName(e.target.value)}
              maxLength={20}
              placeholder="Enter your name"
              className="w-full bg-transparent chalk-text text-lg px-3 py-2 rounded"
              style={{
                border: "1px dashed var(--chalk-white)",
                color: "var(--chalk-white)",
                outline: "none",
                opacity: 0.9,
              }}
            />
          </div>

          {/* Share button */}
          <button
            onClick={handleCopy}
            disabled={!canShare}
            className="chalk-button w-full text-lg px-6 py-3 transition-opacity"
            style={{
              color: canShare ? "var(--chalk-blue)" : "var(--chalk-white)",
              opacity: canShare ? 1 : 0.3,
            }}
          >
            {copied ? "Copied!" : "Copy Challenge Link"}
          </button>

          {/* Fallback URL display */}
          {fallbackUrl && (
            <div className="space-y-1">
              <p className="chalk-text text-sm opacity-60">
                Copy this link manually:
              </p>
              <input
                type="text"
                readOnly
                value={fallbackUrl}
                onFocus={(e) => e.target.select()}
                className="w-full bg-transparent chalk-text text-sm px-2 py-1 rounded"
                style={{
                  border: "1px dashed var(--chalk-white)",
                  color: "var(--chalk-white)",
                  opacity: 0.7,
                }}
              />
            </div>
          )}

          {/* Challenges */}
          {challenges.length > 0 && (
            <div className="space-y-3">
              <h2
                className="text-xl font-bold chalk-text-strong chalk-glow text-center"
                style={{ color: "var(--chalk-yellow)" }}
              >
                Challenges
              </h2>
              {[...challenges]
                .sort((a, b) => b.receivedAt - a.receivedAt)
                .map((c) => (
                  <div
                    key={c.id}
                    className="relative p-4 rounded-lg"
                    style={{
                      border: "1px dashed rgba(232, 232, 216, 0.3)",
                    }}
                  >
                    <button
                      onClick={() => onRemoveChallenge(c.id)}
                      className="absolute top-2 right-3 chalk-text text-lg opacity-40 hover:opacity-90 transition-opacity"
                      style={{ color: "var(--chalk-red)" }}
                    >
                      &times;
                    </button>
                    <div className="flex items-baseline gap-2 mb-3 pr-6">
                      <span
                        className="chalk-text font-bold text-lg"
                        style={{ color: "var(--chalk-yellow)" }}
                      >
                        {c.name}
                      </span>
                      <span className="chalk-text text-sm opacity-40">
                        {relativeTime(c.receivedAt)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center chalk-text text-sm opacity-50">
                        <span className="w-16" />
                        <span className="flex-1 text-right">{c.name}</span>
                        <span className="w-5" />
                        <span className="mx-2 opacity-0">vs</span>
                        <span className="flex-1 text-right">You</span>
                        <span className="w-5" />
                      </div>
                      {difficulties.map((d, i) => {
                        const theirScore = c.scores[i];
                        const myScore = highScores[d];
                        const theirSolved = (c.solvedMask >> i) & 1;
                        const iWin = myScore > theirScore;
                        const theyWin = theirScore > myScore;
                        return (
                          <div
                            key={d}
                            className="flex items-center"
                          >
                            <span className="w-16 chalk-text text-base capitalize opacity-60">
                              {d}
                            </span>
                            <span
                              className="flex-1 text-right chalk-text text-xl"
                              style={{
                                color: theyWin
                                  ? "var(--chalk-green)"
                                  : "var(--chalk-white)",
                                opacity: theyWin ? 1 : 0.6,
                              }}
                            >
                              {theirScore > 0 ? theirScore : "--"}
                            </span>
                            <span
                              className="w-5 text-center chalk-text text-sm"
                              style={{
                                color: theirSolved
                                  ? "var(--chalk-green)"
                                  : "var(--chalk-red)",
                                opacity: theirSolved ? 1 : 0.5,
                              }}
                            >
                              {theirSolved ? "\u2713" : "\u2717"}
                            </span>
                            <span className="chalk-text opacity-30 mx-2">
                              vs
                            </span>
                            <span
                              className="flex-1 text-right chalk-text text-xl"
                              style={{
                                color: iWin
                                  ? "var(--chalk-green)"
                                  : "var(--chalk-white)",
                                opacity: iWin ? 1 : 0.6,
                              }}
                            >
                              {myScore > 0 ? myScore : "--"}
                            </span>
                            <span
                              className="w-5 text-center chalk-text text-sm"
                              style={{
                                color: solved[d]
                                  ? "var(--chalk-green)"
                                  : "var(--chalk-red)",
                                opacity: solved[d] ? 1 : 0.5,
                              }}
                            >
                              {solved[d] ? "\u2713" : "\u2717"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
