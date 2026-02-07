import type { Challenge } from "../engine/bragCodec";
import type { Difficulty } from "../engine/difficulty";

interface IncomingChallengeModalProps {
  challenge: Challenge;
  myHighScores: { easy: number; normal: number; hard: number };
  mySolved: { easy: boolean; normal: boolean; hard: boolean };
  alreadySaved: boolean;
  onAccept: (challenge: Challenge) => void;
  onDismiss: () => void;
}

const difficulties: Difficulty[] = ["easy", "normal", "hard"];

export function IncomingChallengeModal({
  challenge,
  myHighScores,
  mySolved,
  alreadySaved,
  onAccept,
  onDismiss,
}: IncomingChallengeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onDismiss} />
      <div
        className="relative z-10 w-full max-w-sm mx-4 p-10 rounded-lg"
        style={{
          background: "#2a3c2a",
          border: "2px dashed var(--chalk-white)",
          borderColor: "rgba(232, 232, 216, 0.4)",
        }}
      >
        <h2
          className="text-xl font-bold chalk-text-strong chalk-glow text-center mb-4"
          style={{ color: "var(--chalk-yellow)" }}
        >
          {challenge.name} challenges you!
        </h2>

        {/* Score comparison */}
        <div className="space-y-2 mb-6 mt-8">
          <div className="flex chalk-text text-sm opacity-60 px-1">
            <span className="flex-1" />
            <span className="w-16 text-right">{challenge.name}</span>
            <span className="w-6" />
            <span className="w-16 text-right">You</span>
            <span className="w-6" />
          </div>
          {difficulties.map((d, i) => {
            const theirScore = challenge.scores[i];
            const myScore = myHighScores[d];
            const theirSolved = (challenge.solvedMask >> i) & 1;
            const iWin = myScore > theirScore;
            const theyWin = theirScore > myScore;
            return (
              <div key={d} className="flex items-center px-1">
                <span className="flex-1 chalk-text text-base capitalize opacity-80">
                  {d}
                </span>
                <span
                  className="w-16 text-right chalk-text text-xl"
                  style={{
                    color: theyWin
                      ? "var(--chalk-green)"
                      : "var(--chalk-white)",
                    opacity: theyWin ? 1 : 0.7,
                  }}
                >
                  {theirScore > 0 ? theirScore : "--"}
                </span>
                <span
                  className="w-6 text-center chalk-text text-sm"
                  style={{
                    color: theirSolved ? "var(--chalk-green)" : "var(--chalk-red)",
                    opacity: theirSolved ? 1 : 0.5,
                  }}
                >
                  {theirSolved ? "\u2713" : "\u2717"}
                </span>
                <span
                  className="w-16 text-right chalk-text text-xl"
                  style={{
                    color: iWin ? "var(--chalk-green)" : "var(--chalk-white)",
                    opacity: iWin ? 1 : 0.7,
                  }}
                >
                  {myScore > 0 ? myScore : "--"}
                </span>
                <span
                  className="w-6 text-center chalk-text text-sm"
                  style={{
                    color: mySolved[d] ? "var(--chalk-green)" : "var(--chalk-red)",
                    opacity: mySolved[d] ? 1 : 0.5,
                  }}
                >
                  {mySolved[d] ? "\u2713" : "\u2717"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 chalk-button py-2 text-base"
            style={{ color: "var(--chalk-white)", opacity: 0.6 }}
          >
            Dismiss
          </button>
          <button
            onClick={() => onAccept(challenge)}
            disabled={alreadySaved}
            className="flex-1 chalk-button py-2 text-base"
            style={{
              color: alreadySaved ? "var(--chalk-white)" : "var(--chalk-blue)",
              opacity: alreadySaved ? 0.4 : 1,
            }}
          >
            {alreadySaved ? "Already Saved" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
