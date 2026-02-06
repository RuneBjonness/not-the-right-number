import { useCallback, useRef, useState } from 'react';
import { NumberInput } from './components/NumberInput';
import { TestList } from './components/TestList';
import { ScoreDisplay } from './components/ScoreDisplay';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { useGameState } from './hooks/useGameState';
import { useScoreTimer } from './hooks/useScoreTimer';
import { useHighScoreStore } from './stores/highScoreStore';
import { collectValidNumbers } from './engine/ruleCompatibility';
import type { Difficulty } from './engine/difficulty';
import { getDifficultyConfig } from './engine/difficulty';
import type { Test } from './engine/types';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverData, setGameOverData] = useState<{
    score: number; difficulty: Difficulty; isNewHighScore: boolean; validNumbers: number[];
  } | null>(null);
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

  const handleGameEnd = useCallback(
    (finalScore: number, difficulty: Difficulty, activeTests: Test[]) => {
      if (gameEndedRef.current) return;
      gameEndedRef.current = true;
      const config = getDifficultyConfig(difficulty);
      const validNumbers = collectValidNumbers(activeTests, config.min, config.max);
      const isNew = checkAndUpdateHighScore(finalScore, difficulty);
      setGameOverData({ score: finalScore, difficulty, isNewHighScore: isNew, validNumbers });
      setShowGameOver(true);
    },
    [checkAndUpdateHighScore]
  );

  const handleContinueFromGameOver = useCallback(() => {
    if (gameOverData) {
      setLastScore(gameOverData.score);
      setLastDifficulty(gameOverData.difficulty);
      setIsNewHighScore(gameOverData.isNewHighScore);
    }
    setShowGameOver(false);
    setShowWelcome(true);
    setGameOverData(null);
  }, [gameOverData]);

  const handleTimeOut = useCallback(() => {
    triggerGameOver();
    handleGameEnd(totalScoreRef.current, gameState.difficulty, gameState.activeTests);
  }, [triggerGameOver, handleGameEnd, gameState.difficulty, gameState.activeTests]);

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
        handleGameEnd(finalTotal, gameState.difficulty, gameState.activeTests);
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
      handleGameEnd,
      gameState.difficulty,
      gameState.activeTests,
    ]
  );

  if (showGameOver && gameOverData) {
    return (
      <GameOverScreen
        score={gameOverData.score}
        isNewHighScore={gameOverData.isNewHighScore}
        validNumbers={gameOverData.validNumbers}
        onContinue={handleContinueFromGameOver}
      />
    );
  }

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
