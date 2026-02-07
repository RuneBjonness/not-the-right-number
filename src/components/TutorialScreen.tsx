import { useState, useCallback, useEffect } from 'react';
import { NumberInput } from './NumberInput';
import { TestList } from './TestList';
import { ScoreDisplay } from './ScoreDisplay';
import { TutorialOverlay } from './TutorialOverlay';
import { tutorialSteps } from '../tutorial/tutorialSteps';
import { useGameState } from '../hooks/useGameState';

interface TutorialScreenProps {
  onReturn: () => void;
}

export function TutorialScreen({ onReturn }: TutorialScreenProps) {
  const {
    gameState,
    testResults,
    submitInput,
    resetGame,
    addLevelScore,
    setTotalScore,
  } = useGameState();

  const [stepIndex, setStepIndex] = useState(0);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [postActionQueue, setPostActionQueue] = useState(0);

  // Initialize with easy mode on mount
  useEffect(() => {
    resetGame('easy');
  }, [resetGame]);

  const currentStep = tutorialSteps[stepIndex];
  const showOverlay = currentStep && !(currentStep.type === 'action-required' && inputEnabled);

  const handleContinue = useCallback(() => {
    const nextIndex = stepIndex + 1;
    if (nextIndex >= tutorialSteps.length) {
      onReturn();
      return;
    }

    const nextStep = tutorialSteps[nextIndex];

    if (nextStep.type === 'action-required') {
      // Show the action-required overlay first, then enable input on next continue
      setStepIndex(nextIndex);
      setInputEnabled(true);
    } else {
      setStepIndex(nextIndex);
    }
  }, [stepIndex, onReturn]);

  const handleSubmit = useCallback(
    (input: string) => {
      const result = submitInput(input);

      if (result.type === 'passed' || result.type === 'won') {
        // Award a fixed score
        addLevelScore(20);
        setTotalScore(20 * gameState.level);
        // Disable input, show post-action steps
        setInputEnabled(false);
        // Count how many post-action steps follow
        let postCount = 0;
        let i = stepIndex + 1;
        while (i < tutorialSteps.length && tutorialSteps[i].type === 'post-action') {
          postCount++;
          i++;
        }
        setPostActionQueue(postCount);
        setStepIndex(stepIndex + 1);
      }
      // On fail, input stays enabled — user sees X marks and keeps trying
    },
    [submitInput, stepIndex, addLevelScore, setTotalScore, gameState.level]
  );

  const handleOverlayContinue = useCallback(() => {
    if (postActionQueue > 1) {
      setPostActionQueue((q) => q - 1);
      setStepIndex((i) => i + 1);
    } else if (postActionQueue === 1) {
      setPostActionQueue(0);
      setStepIndex((i) => i + 1);
    } else {
      handleContinue();
    }
  }, [postActionQueue, handleContinue]);

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Top bar with Return button */}
      <header className="flex-shrink-0 flex items-center justify-between px-3 py-2">
        <button
          onClick={onReturn}
          className="chalk-text text-base opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--chalk-blue)' }}
        >
          &larr; Return
        </button>
        <span
          className="chalk-text text-base opacity-60"
          style={{ color: 'var(--chalk-yellow)' }}
        >
          Tutorial
        </span>
      </header>

      {/* Rules list */}
      <main className="flex-1 overflow-y-auto p-3 flex flex-col items-center justify-end">
        <TestList
          activeTests={gameState.activeTests}
          testResults={testResults}
          levelScores={gameState.levelScores}
          potentialPoints={20}
        />
      </main>

      {/* Score + numpad */}
      <footer className="flex-shrink-0">
        <div className="max-w-sm mx-auto px-3">
          <div className="flex items-center justify-center py-1.5 border-t border-[var(--chalk-white-dim)]">
            <ScoreDisplay
              highScore={0}
              totalScore={gameState.score}
              validCount={gameState.validCount}
            />
          </div>
          <NumberInput
            onSubmit={handleSubmit}
            disabled={!inputEnabled}
            maxDigits={3}
          />
        </div>
      </footer>

      {/* Tutorial overlay */}
      {showOverlay && currentStep && (
        <TutorialOverlay
          step={currentStep}
          onContinue={handleOverlayContinue}
        />
      )}
    </div>
  );
}
