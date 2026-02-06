import { useCallback, useRef, useState } from 'react';
import { NumberInput } from './components/NumberInput';
import { TestList } from './components/TestList';
import { ScoreDisplay } from './components/ScoreDisplay';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useGameState } from './hooks/useGameState';
import { useScoreTimer } from './hooks/useScoreTimer';
import { useHighScoreStore } from './stores/highScoreStore';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [lastScore, setLastScore] = useState<number | undefined>(undefined);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const { highScore, checkAndUpdateHighScore } = useHighScoreStore();
  const {
    gameState,
    testResults,
    submitInput,
    resetGame,
    setTotalScore,
    addLevelScore,
    triggerGameOver,
  } = useGameState();

  const totalScoreRef = useRef(0);
  const gameEndedRef = useRef(false);

  const returnToWelcome = useCallback(
    (finalScore: number) => {
      if (gameEndedRef.current) return;
      gameEndedRef.current = true;
      const isNew = checkAndUpdateHighScore(finalScore);
      setLastScore(finalScore);
      setIsNewHighScore(isNew);
      setShowWelcome(true);
    },
    [checkAndUpdateHighScore]
  );

  const handleTimeOut = useCallback(() => {
    triggerGameOver();
    returnToWelcome(totalScoreRef.current);
  }, [triggerGameOver, returnToWelcome]);

  const {
    potentialPoints,
    startTimer,
    stopTimer,
    applyPenalty,
    resetForNewLevel,
  } = useScoreTimer(handleTimeOut);

  const handleStartGame = useCallback(() => {
    gameEndedRef.current = false;
    totalScoreRef.current = 0;
    resetGame();
    setShowWelcome(false);
    startTimer(0);
  }, [resetGame, startTimer]);

  const handleSubmit = useCallback(
    (input: string) => {
      const result = submitInput(input);

      if (result.type === 'passed' && result.newLevel !== undefined) {
        // Record earned score for this level and add to total
        addLevelScore(potentialPoints);
        const newTotal = totalScoreRef.current + potentialPoints;
        totalScoreRef.current = newTotal;
        setTotalScore(newTotal);
        // Reset timer for new level
        resetForNewLevel(result.newLevel);
      } else if (result.type === 'failed' || result.type === 'invalid') {
        // Apply penalty for wrong answer
        applyPenalty();
      } else if (result.type === 'won') {
        // Player won - record earned score and end game
        addLevelScore(potentialPoints);
        const finalTotal = totalScoreRef.current + potentialPoints;
        totalScoreRef.current = finalTotal;
        setTotalScore(finalTotal);
        stopTimer();
        returnToWelcome(finalTotal);
      }
    },
    [
      submitInput,
      potentialPoints,
      setTotalScore,
      addLevelScore,
      resetForNewLevel,
      applyPenalty,
      stopTimer,
      returnToWelcome,
    ]
  );

  if (showWelcome) {
    return (
      <WelcomeScreen
        onStart={handleStartGame}
        highScore={highScore}
        lastScore={lastScore}
        isNewHighScore={isNewHighScore}
      />
    );
  }

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Middle: Scrollable rules list */}
      <main className="flex-1 overflow-y-auto p-3 flex flex-col items-center justify-end">
        <TestList
          activeTests={gameState.activeTests}
          testResults={testResults}
          levelScores={gameState.levelScores}
          potentialPoints={gameState.isGameOver ? 0 : potentialPoints}
        />
      </main>

      {/* Bottom: Score + numpad */}
      <footer className="flex-shrink-0">
        <div className="max-w-sm mx-auto px-3">
          <div className="flex items-center justify-center py-1.5 border-t border-[var(--chalk-white-dim)]">
            <ScoreDisplay
              highScore={highScore}
              totalScore={gameState.score}
              validCount={gameState.validCount}
            />
          </div>
          <NumberInput onSubmit={handleSubmit} disabled={gameState.isGameOver} />
        </div>
      </footer>
    </div>
  );
}

export default App;
