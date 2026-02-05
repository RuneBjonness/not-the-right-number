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
        returnToWelcome(finalTotal);
      }
    },
    [
      submitInput,
      potentialPoints,
      setTotalScore,
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
      {/* Top bar: Score */}
      <header className="flex-shrink-0 bg-[var(--chalkboard-bg)] border-b border-[var(--chalk-white-dim)] py-2 px-3">
        <div className="max-w-xl mx-auto flex items-center justify-center">
          <ScoreDisplay
            highScore={highScore}
            totalScore={gameState.score}
            potentialPoints={gameState.isGameOver ? 0 : potentialPoints}
          />
        </div>
      </header>

      {/* Middle: Scrollable rules list */}
      <main className="flex-1 overflow-y-auto p-3 flex flex-col items-center">
        <TestList activeTests={gameState.activeTests} testResults={testResults} />
      </main>

      {/* Bottom: Fixed numpad */}
      <footer className="flex-shrink-0">
        <div className="max-w-sm mx-auto px-3 pb-2">
          <NumberInput onSubmit={handleSubmit} disabled={gameState.isGameOver} />
        </div>
      </footer>
    </div>
  );
}

export default App;
