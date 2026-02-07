import { useEffect, useRef } from "react";

interface GameOverScreenProps {
  score: number;
  isNewHighScore: boolean;
  isWon: boolean;
  validNumbers: number[];
  onContinue: () => void;
}

function getGridConfig(count: number) {
  if (count <= 5)
    return {
      cols: Math.max(count, 1),
      textSize: "text-4xl md:text-5xl",
      scrolls: false,
    };
  if (count <= 10)
    return { cols: 2, textSize: "text-3xl md:text-4xl", scrolls: false };
  if (count <= 30)
    return { cols: 3, textSize: "text-xl md:text-2xl", scrolls: false };
  if (count <= 100) return { cols: 4, textSize: "text-lg", scrolls: true };
  return { cols: 5, textSize: "text-base", scrolls: true };
}

const AUTO_SCROLL_PX_PER_SEC = 50;
const RESUME_DELAY_MS = 2000;

function useAutoScroll(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const accumulatedRef = useRef(0);
  const userControlRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const directionRef = useRef<1 | -1>(1);

  useEffect(() => {
    if (!enabled) return;

    const el = containerRef.current;
    if (!el) return;

    lastTimeRef.current = 0;
    accumulatedRef.current = 0;
    directionRef.current = 1;

    const tick = (time: number) => {
      if (lastTimeRef.current && !userControlRef.current) {
        const dt = (time - lastTimeRef.current) / 1000;
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (maxScroll > 0) {
          accumulatedRef.current +=
            AUTO_SCROLL_PX_PER_SEC * dt * directionRef.current;
          const step = Math.trunc(accumulatedRef.current);
          if (step !== 0) {
            accumulatedRef.current -= step;
            el.scrollTop += step;

            if (el.scrollTop >= maxScroll) {
              el.scrollTop = maxScroll;
              directionRef.current = -1;
              accumulatedRef.current = 0;
            } else if (el.scrollTop <= 0) {
              el.scrollTop = 0;
              directionRef.current = 1;
              accumulatedRef.current = 0;
            }
          }
        }
      }
      lastTimeRef.current = time;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const scheduleResume = () => {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        userControlRef.current = false;
        accumulatedRef.current = 0;
      }, RESUME_DELAY_MS);
    };

    const onInteractionStart = () => {
      userControlRef.current = true;
      clearTimeout(resumeTimerRef.current);
    };

    const onInteractionEnd = () => {
      scheduleResume();
    };

    // Wheel: pause and immediately schedule resume (no "wheel up" event exists)
    const onWheel = () => {
      userControlRef.current = true;
      scheduleResume();
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("pointerdown", onInteractionStart);
    el.addEventListener("pointerup", onInteractionEnd);
    el.addEventListener("pointercancel", onInteractionEnd);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resumeTimerRef.current);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onInteractionStart);
      el.removeEventListener("pointerup", onInteractionEnd);
      el.removeEventListener("pointercancel", onInteractionEnd);
    };
  }, [enabled]);

  return containerRef;
}

export function GameOverScreen({
  score,
  isNewHighScore,
  isWon,
  validNumbers,
  onContinue,
}: GameOverScreenProps) {
  const count = validNumbers.length;
  const { cols, textSize, scrolls } = getGridConfig(count);
  const scrollRef = useAutoScroll(scrolls);

  return (
    <div className="h-[100dvh] flex flex-col items-center px-4 py-6">
      {/* Header */}
      <div className="text-center mb-4 animate-chalk-appear flex-shrink-0">
        <h1
          className="text-4xl md:text-5xl font-bold chalk-text-strong chalk-glow mb-2"
          style={{
            color: isWon ? "var(--chalk-green)" : "var(--chalk-yellow)",
          }}
        >
          {isWon ? "That's the right number!" : "That's NOT the right number!"}
        </h1>
        <p className="text-2xl md:text-3xl chalk-text">Score: {score}</p>
        {isWon && (
          <p
            className="text-lg md:text-xl font-bold chalk-glow mt-1"
            style={{ color: "var(--chalk-yellow)" }}
          >
            Win Bonus: x1.5
          </p>
        )}
        {isNewHighScore && (
          <p
            className="text-lg md:text-xl font-bold chalk-glow mt-1 animate-pulse"
            style={{ color: "var(--chalk-green)" }}
          >
            New High Score!
          </p>
        )}
      </div>

      {/* Subtitle */}
      <div className="text-center mb-3 flex-shrink-0">
        {count === 0 ? (
          <p className="text-lg chalk-text opacity-80">
            Turned out to be none of the numbers known to man — truly
            impossible! We might call it a bug, but let's just say you found a
            secret ending. Congrats?
          </p>
        ) : count === 1 ? (
          <p className="text-lg chalk-text opacity-80">Well, there it is:</p>
        ) : (
          <p className="text-lg chalk-text opacity-80">
            ..it could have been any of these {count.toLocaleString()} numbers:
          </p>
        )}
      </div>

      {/* Number grid */}
      {count > 0 && (
        <div
          ref={scrollRef}
          className={`w-full max-w-lg ${scrolls ? "flex-1 overflow-y-auto chalk-scroll min-h-0" : ""} mb-4`}
        >
          <div
            className="grid gap-2 justify-items-center"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {validNumbers.map((n) => (
              <span key={n} className={`${textSize} chalk-text font-bold`}>
                {n.toLocaleString()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Continue button */}
      <div className="flex-shrink-0 mt-auto pt-4">
        <button
          onClick={onContinue}
          className="chalk-button chalk-button-start text-2xl px-12 py-4"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
