import { useCallback, useRef, useState } from "react";
import { NumberInput } from "./components/NumberInput";
import { TestList } from "./components/TestList";
import { ScoreDisplay } from "./components/ScoreDisplay";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { GameOverScreen } from "./components/GameOverScreen";
import { TutorialScreen } from "./components/TutorialScreen";
import { BragScreen } from "./components/BragScreen";
import { IncomingChallengeModal } from "./components/IncomingChallengeModal";
import { Countdown } from "./components/Countdown";
import { useGameState } from "./hooks/useGameState";
import { useScoreTimer } from "./hooks/useScoreTimer";
import { useHighScoreStore } from "./stores/highScoreStore";
import { useBragStore } from "./stores/bragStore";
import { decodeBrag } from "./engine/bragCodec";
import type { Challenge } from "./engine/bragCodec";
import { collectValidNumbers } from "./engine/ruleCompatibility";
import type { Difficulty } from "./engine/difficulty";
import { getDifficultyConfig } from "./engine/difficulty";
import type { Test } from "./engine/types";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showBrag, setShowBrag] = useState(false);
  const [skipWelcomeAnim, setSkipWelcomeAnim] = useState(false);
  const [incomingChallenge, setIncomingChallenge] = useState<Challenge | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('c');
    if (code) {
      window.history.replaceState({}, '', window.location.pathname);
      return decodeBrag(code);
    }
    return null;
  });
  const [showCountdown, setShowCountdown] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverData, setGameOverData] = useState<{
    score: number;
    difficulty: Difficulty;
    isNewHighScore: boolean;
    isWon: boolean;
    validNumbers: number[];
    validCount: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<number | undefined>(undefined);
  const [lastDifficulty, setLastDifficulty] = useState<Difficulty | undefined>(
    undefined,
  );
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [lastIsWon, setLastIsWon] = useState(false);
  const {
    highScores,
    solved,
    getHighScore,
    checkAndUpdateHighScore,
    markSolved,
  } = useHighScoreStore();
  const {
    playerName,
    challenges,
    setPlayerName,
    addChallenge,
    removeChallenge,
    hasChallenge,
  } = useBragStore();

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
    (
      finalScore: number,
      difficulty: Difficulty,
      activeTests: Test[],
      isWon: boolean,
      cachedValidNumbers?: number[] | null,
      cachedValidCount?: number,
    ) => {
      if (gameEndedRef.current) return;
      gameEndedRef.current = true;
      if (isWon) markSolved(difficulty);
      const config = getDifficultyConfig(difficulty);
      const MAX_DISPLAY = 2000;
      let validNumbers: number[];
      let validCount: number;
      if (cachedValidNumbers) {
        validCount = cachedValidCount ?? cachedValidNumbers.length;
        validNumbers =
          cachedValidNumbers.length > MAX_DISPLAY
            ? cachedValidNumbers.slice(0, MAX_DISPLAY)
            : cachedValidNumbers;
      } else {
        validCount = cachedValidCount ?? config.max - config.min + 1;
        validNumbers = collectValidNumbers(
          activeTests,
          config.min,
          config.max,
          MAX_DISPLAY,
        );
      }
      const isNew = checkAndUpdateHighScore(finalScore, difficulty);
      setGameOverData({
        score: finalScore,
        difficulty,
        isNewHighScore: isNew,
        isWon,
        validNumbers,
        validCount,
      });
      setShowGameOver(true);
    },
    [checkAndUpdateHighScore, markSolved],
  );

  const handleContinueFromGameOver = useCallback(() => {
    if (gameOverData) {
      setLastScore(gameOverData.score);
      setLastDifficulty(gameOverData.difficulty);
      setIsNewHighScore(gameOverData.isNewHighScore);
      setLastIsWon(gameOverData.isWon);
    }
    setShowGameOver(false);
    setShowWelcome(true);
    setGameOverData(null);
  }, [gameOverData]);

  const handleTimeOut = useCallback(() => {
    triggerGameOver();
    handleGameEnd(
      totalScoreRef.current,
      gameState.difficulty,
      gameState.activeTests,
      false,
      gameState.validNumbers,
      gameState.validCount,
    );
  }, [
    triggerGameOver,
    handleGameEnd,
    gameState.difficulty,
    gameState.activeTests,
    gameState.validNumbers,
    gameState.validCount,
  ]);

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
      setShowCountdown(true);
    },
    [resetGame],
  );

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    startTimer(0);
  }, [startTimer]);

  const handleStartTutorial = useCallback(() => {
    setShowWelcome(false);
    setShowTutorial(true);
  }, []);

  const handleReturnFromTutorial = useCallback(() => {
    setShowTutorial(false);
    setShowWelcome(true);
  }, []);

  const handleShowBrag = useCallback(() => {
    setShowWelcome(false);
    setShowBrag(true);
  }, []);

  const handleReturnFromBrag = useCallback(() => {
    setShowBrag(false);
    setSkipWelcomeAnim(true);
    setShowWelcome(true);
  }, []);

  const handleAcceptChallenge = useCallback(
    (challenge: Challenge) => {
      addChallenge(challenge);
      setIncomingChallenge(null);
    },
    [addChallenge],
  );

  const handleDismissChallenge = useCallback(() => {
    setIncomingChallenge(null);
  }, []);

  const handleSubmit = useCallback(
    (input: string) => {
      const result = submitInput(input);
      const config = getDifficultyConfig(gameState.difficulty);

      if (result.type === "passed" && result.newLevel !== undefined) {
        const earned = Math.round(potentialPoints * config.scoreMultiplier);
        addLevelScore(earned);
        const newTotal = totalScoreRef.current + earned;
        totalScoreRef.current = newTotal;
        setTotalScore(newTotal);
        resetForNewLevel(result.newLevel);
      } else if (result.type === "failed" || result.type === "invalid") {
        applyPenalty();
      } else if (result.type === "won") {
        const earned = Math.round(potentialPoints * config.scoreMultiplier);
        addLevelScore(earned);
        const subtotal = totalScoreRef.current + earned;
        const finalTotal = Math.round(subtotal * 1.5);
        totalScoreRef.current = finalTotal;
        setTotalScore(finalTotal);
        stopTimer();
        handleGameEnd(
          finalTotal,
          gameState.difficulty,
          gameState.activeTests,
          true,
          gameState.validNumbers,
          gameState.validCount,
        );
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
      gameState.validNumbers,
      gameState.validCount,
    ],
  );

  if (showGameOver && gameOverData) {
    return (
      <GameOverScreen
        score={gameOverData.score}
        isNewHighScore={gameOverData.isNewHighScore}
        isWon={gameOverData.isWon}
        validNumbers={gameOverData.validNumbers}
        validCount={gameOverData.validCount}
        onContinue={handleContinueFromGameOver}
      />
    );
  }

  if (showTutorial) {
    return <TutorialScreen onReturn={handleReturnFromTutorial} />;
  }

  if (showBrag) {
    return (
      <BragScreen
        highScores={highScores}
        solved={solved}
        playerName={playerName}
        onSetPlayerName={setPlayerName}
        onReturn={handleReturnFromBrag}
        challenges={challenges}
        onRemoveChallenge={removeChallenge}
      />
    );
  }

  if (showWelcome) {
    return (
      <>
        <WelcomeScreen
          onStart={handleStartGame}
          onStartTutorial={handleStartTutorial}
          onShowBrag={handleShowBrag}
          highScores={highScores}
          solved={solved}
          lastScore={lastScore}
          lastDifficulty={lastDifficulty}
          isNewHighScore={isNewHighScore}
          lastIsWon={lastIsWon}
          skipAnimation={skipWelcomeAnim}
        />
        {incomingChallenge && (
          <IncomingChallengeModal
            challenge={incomingChallenge}
            myHighScores={highScores}
            mySolved={solved}
            alreadySaved={hasChallenge(incomingChallenge.id)}
            onAccept={handleAcceptChallenge}
            onDismiss={handleDismissChallenge}
          />
        )}
      </>
    );
  }

  const config = getDifficultyConfig(gameState.difficulty);

  return (
    <div className="flex flex-col h-[100dvh]">
      {showCountdown && <Countdown onComplete={handleCountdownComplete} />}

      {/* Middle: Scrollable rules list */}
      <main className="flex-1 overflow-y-auto p-3 flex flex-col items-center justify-end">
        <TestList
          activeTests={gameState.activeTests}
          testResults={testResults}
          levelScores={gameState.levelScores}
          potentialPoints={
            gameState.isGameOver
              ? 0
              : Math.round(potentialPoints * config.scoreMultiplier)
          }
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
            disabled={gameState.isGameOver || showCountdown}
            maxDigits={config.maxDigits}
          />
        </div>
      </footer>
    </div>
  );
}

export default App;
