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
    giveUp,
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

  const handleGiveUp = useCallback(() => {
    stopTimer();
    checkAndUpdateHighScore(totalScoreRef.current);
    giveUp();
  }, [stopTimer, checkAndUpdateHighScore, giveUp]);

  const handleReset = useCallback(() => {
    totalScoreRef.current = 0;
    resetGame();
    startTimer(0);
  }, [resetGame, startTimer]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 py-8">
      <h1 className="text-6xl font-bold mb-2 chalk-text-strong">Not The Right Number</h1>
      <p className="text-xl mb-8 text-center max-w-md chalk-text opacity-80">
        Enter numbers that satisfy all the rules. Each success adds a new rule
        that your current number breaks!
      </p>

      {/* Score Display */}
      <ScoreDisplay
        highScore={highScore}
        totalScore={gameState.score}
        potentialPoints={gameState.isGameOver ? 0 : potentialPoints}
      />

      {/* Input Section */}
      <div className="mb-8 w-full flex flex-col items-center">
        <NumberInput onSubmit={handleSubmit} disabled={gameState.isGameOver} />

        <div className="flex gap-3 mt-4">
          {!gameState.isGameOver ? (
            <button onClick={handleGiveUp} className="chalk-button">
              Give Up
            </button>
          ) : (
            <button onClick={handleReset} className="chalk-button chalk-button-success">
              Play Again
            </button>
          )}
        </div>
      </div>

      {/* Game Over Message */}
      {gameState.isGameOver && (
        <div className="mb-6 p-4 test-card text-center animate-chalk-appear">
          <p className="text-3xl font-bold chalk-glow" style={{ color: 'var(--chalk-yellow)' }}>
            Game Over!
          </p>
          <p className="text-xl chalk-text opacity-80">
            Final score: {gameState.score}
          </p>
        </div>
      )}

      {/* Test List */}
      <TestList activeTests={gameState.activeTests} testResults={testResults} />
    </div>
  );
}

export default App;
