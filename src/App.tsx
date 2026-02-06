import { useCallback, useRef, useState } from 'react';
import { NumberInput } from './components/NumberInput';
import { TestList } from './components/TestList';
import { ScoreDisplay } from './components/ScoreDisplay';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useGameState } from './hooks/useGameState';
import { useScoreTimer } from './hooks/useScoreTimer';
import { useHighScoreStore } from './stores/highScoreStore';
import type { Difficulty } from './engine/difficulty';
import { getDifficultyConfig } from './engine/difficulty';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [lastScore, setLastScore] = useState<number | undefined>(undefined);
  const [lastDifficulty, setLastDifficulty] = useState<Difficulty | undefined>(undefined);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const { highScores, getHighScore, checkAndUpdateHighScore } = useHighScoreStore();
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
    (finalScore: number, difficulty: Difficulty) => {
      if (gameEndedRef.current) return;
      gameEndedRef.current = true;
      const isNew = checkAndUpdateHighScore(finalScore, difficulty);
      setLastScore(finalScore);
      setLastDifficulty(difficulty);
      setIsNewHighScore(isNew);
      setShowWelcome(true);
    },
    [checkAndUpdateHighScore]
  );

  const handleTimeOut = useCallback(() => {
    triggerGameOver();
    returnToWelcome(totalScoreRef.current, gameState.difficulty);
  }, [triggerGameOver, returnToWelcome, gameState.difficulty]);

  const {
    potentialPoints,
    startTimer,
    stopTimer,
    applyPenalty,
    resetForNewLevel,
  } = useScoreTimer(handleTimeOut);

  const handleStartGame = useCallback(
    (difficulty: Difficulty) => {
      gameEndedRef.current = false;
      totalScoreRef.current = 0;
      resetGame(difficulty);
      setShowWelcome(false);
      startTimer(0);
    },
    [resetGame, startTimer]
  );

  const handleSubmit = useCallback(
    (input: string) => {
      const result = submitInput(input);
      const config = getDifficultyConfig(gameState.difficulty);

      if (result.type === 'passed' && result.newLevel !== undefined) {
        const earned = Math.round(potentialPoints * config.scoreMultiplier);
        addLevelScore(earned);
        const newTotal = totalScoreRef.current + earned;
        totalScoreRef.current = newTotal;
        setTotalScore(newTotal);
        resetForNewLevel(result.newLevel);
      } else if (result.type === 'failed' || result.type === 'invalid') {
        applyPenalty();
      } else if (result.type === 'won') {
        const earned = Math.round(potentialPoints * config.scoreMultiplier);
        addLevelScore(earned);
        const finalTotal = totalScoreRef.current + earned;
        totalScoreRef.current = finalTotal;
        setTotalScore(finalTotal);
        stopTimer();
        returnToWelcome(finalTotal, gameState.difficulty);
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
      gameState.difficulty,
    ]
  );

  if (showWelcome) {
    return (
      <WelcomeScreen
        onStart={handleStartGame}
        highScores={highScores}
        lastScore={lastScore}
        lastDifficulty={lastDifficulty}
        isNewHighScore={isNewHighScore}
      />
    );
  }

  const config = getDifficultyConfig(gameState.difficulty);

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Middle: Scrollable rules list */}
      <main className="flex-1 overflow-y-auto p-3 flex flex-col items-center justify-end">
        <TestList
          activeTests={gameState.activeTests}
          testResults={testResults}
          levelScores={gameState.levelScores}
          potentialPoints={gameState.isGameOver ? 0 : Math.round(potentialPoints * config.scoreMultiplier)}
        />
      </main>

      {/* Bottom: Score + numpad */}
      <footer className="flex-shrink-0">
        <div className="max-w-sm mx-auto px-3">
          <div className="flex items-center justify-center py-1.5 border-t border-[var(--chalk-white-dim)]">
            <ScoreDisplay
              highScore={getHighScore(gameState.difficulty)}
              totalScore={gameState.score}
              validCount={gameState.validCount}
            />
          </div>
          <NumberInput
            onSubmit={handleSubmit}
            disabled={gameState.isGameOver}
            maxDigits={config.maxDigits}
          />
        </div>
      </footer>
    </div>
  );
}

export default App;
