import { useCallback, useEffect, useRef } from 'react';
import { NumberInput } from './components/NumberInput';
import { TestList } from './components/TestList';
import { ScoreDisplay } from './components/ScoreDisplay';
import { useGameState } from './hooks/useGameState';
import { useScoreTimer } from './hooks/useScoreTimer';
import { useHighScoreStore } from './stores/highScoreStore';

function App() {
  const { highScore, checkAndUpdateHighScore } = useHighScoreStore();
  const {
    gameState,
    testResults,
    submitInput,
    resetGame,
    setTotalScore,
    triggerGameOver,
  } = useGameState();

  const totalScoreRef = useRef(0);
  const hasStartedRef = useRef(false);

  const handleTimeOut = useCallback(() => {
    checkAndUpdateHighScore(totalScoreRef.current);
    triggerGameOver();
  }, [checkAndUpdateHighScore, triggerGameOver]);

  const {
    potentialPoints,
    startTimer,
    stopTimer,
    applyPenalty,
    resetForNewLevel,
  } = useScoreTimer(handleTimeOut);

  // Start timer on mount
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startTimer(0);
    }
  }, [startTimer]);

  const handleSubmit = useCallback(
    (input: string) => {
      const result = submitInput(input);

      if (result.type === 'passed' && result.newLevel !== undefined) {
        // Add potential points to total score
        const newTotal = totalScoreRef.current + potentialPoints;
        totalScoreRef.current = newTotal;
        setTotalScore(newTotal);
        // Reset timer for new level
        resetForNewLevel(result.newLevel);
      } else if (result.type === 'failed' || result.type === 'invalid') {
        // Apply penalty for wrong answer
        applyPenalty();
      } else if (result.type === 'won') {
        // Player won - add final points and end game
        const finalTotal = totalScoreRef.current + potentialPoints;
        totalScoreRef.current = finalTotal;
        setTotalScore(finalTotal);
        stopTimer();
        checkAndUpdateHighScore(finalTotal);
      }
    },
    [
      submitInput,
      potentialPoints,
      setTotalScore,
      resetForNewLevel,
      applyPenalty,
      stopTimer,
      checkAndUpdateHighScore,
    ]
  );

  const handleReset = useCallback(() => {
    totalScoreRef.current = 0;
    resetGame();
    startTimer(0);
  }, [resetGame, startTimer]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header: Score, Input */}
      <header className="sticky top-0 z-10 bg-[var(--chalkboard-bg)] border-b border-[var(--chalk-white-dim)] pb-2 pt-2 px-3">
        <div className="max-w-xl mx-auto">
          {/* Score Row */}
          <div className="flex items-center justify-center mb-2">
            <ScoreDisplay
              highScore={highScore}
              totalScore={gameState.score}
              potentialPoints={gameState.isGameOver ? 0 : potentialPoints}
            />
          </div>

          {/* Input Row */}
          <NumberInput onSubmit={handleSubmit} disabled={gameState.isGameOver} />
        </div>
      </header>

      {/* Main Content: Rules */}
      <main className="flex-1 p-4 pt-4 flex flex-col items-center">
        {/* Game Over Message */}
        {gameState.isGameOver && (
          <div className="mb-4 p-4 test-card text-center animate-chalk-appear max-w-xl w-full">
            <p className="text-2xl md:text-3xl font-bold chalk-glow" style={{ color: 'var(--chalk-yellow)' }}>
              Game Over!
            </p>
            <p className="text-lg chalk-text opacity-80 mb-3">
              Final score: {gameState.score}
              {gameState.score >= highScore && gameState.score > 0 && (
                <span style={{ color: 'var(--chalk-green)' }}> - New Best!</span>
              )}
            </p>
            <button onClick={handleReset} className="chalk-button chalk-button-success">
              Play Again
            </button>
          </div>
        )}

        {/* Test List */}
        <TestList activeTests={gameState.activeTests} testResults={testResults} />

        {/* Footer with title and instructions */}
        <div className="mt-6 max-w-xl w-full text-center">
          <p className="chalk-text opacity-40 text-sm">Not The Right Number</p>
          <details className="mt-2">
            <summary className="chalk-text opacity-40 text-xs cursor-pointer hover:opacity-60">
              How to play
            </summary>
            <p className="text-xs mt-1 chalk-text opacity-50">
              Enter numbers that satisfy all the rules. Each success adds a new rule
              that your current number breaks!
            </p>
          </details>
        </div>
      </main>
    </div>
  );
}

export default App;
