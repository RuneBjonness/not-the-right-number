import { useState, useEffect } from 'react';
import type { TutorialStep, HighlightTarget } from '../tutorial/tutorialSteps';

interface TutorialOverlayProps {
  step: TutorialStep;
  onContinue: () => void;
}

function getTargetRect(highlight: HighlightTarget): DOMRect | null {
  if (!highlight) return null;
  const el = document.querySelector(`[data-tutorial="${highlight}"]`);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export function TutorialOverlay({ step, onContinue }: TutorialOverlayProps) {
  const [rect, setRect] = useState<DOMRect | null>(() => getTargetRect(step.highlight));
  const [prevHighlight, setPrevHighlight] = useState(step.highlight);

  // Re-compute rect when highlight target changes (no effect-based setState)
  if (step.highlight !== prevHighlight) {
    setPrevHighlight(step.highlight);
    setRect(getTargetRect(step.highlight));
  }

  useEffect(() => {
    const onResize = () => setRect(getTargetRect(step.highlight));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [step.highlight]);

  const padding = 8;

  // Spotlight hole style — if we have a target rect, cut a hole; otherwise full dim
  const spotlightStyle: React.CSSProperties = rect
    ? {
        position: 'absolute',
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        borderRadius: '8px',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
        pointerEvents: 'none',
      }
    : {
        display: 'none',
      };

  // Card positioning: below or above the spotlight, or centered if no target
  const cardStyle: React.CSSProperties = (() => {
    if (!rect) {
      return {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const spaceBelow = window.innerHeight - (rect.bottom + padding);
    const cardBelow = spaceBelow > 180;

    return {
      position: 'absolute' as const,
      left: '50%',
      transform: 'translateX(-50%)',
      ...(cardBelow
        ? { top: rect.bottom + padding + 12 }
        : { bottom: window.innerHeight - rect.top + padding + 12 }),
    };
  })();

  return (
    <div className="fixed inset-0 z-50">
      {/* Dim layer (behind spotlight) */}
      {!rect && <div className="absolute inset-0 bg-black/60" />}

      {/* Spotlight cutout */}
      <div style={spotlightStyle} />

      {/* Card */}
      <div className="tutorial-card" style={cardStyle}>
        <h3
          className="text-xl font-bold chalk-glow mb-2"
          style={{ color: 'var(--chalk-yellow)' }}
        >
          {step.title}
        </h3>
        <p className="chalk-text opacity-90 text-base leading-relaxed mb-3">
          {step.description}
        </p>
        {step.type !== 'action-required' && (
          <button
            onClick={onContinue}
            className="chalk-text text-base font-bold underline opacity-80 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--chalk-blue)' }}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
