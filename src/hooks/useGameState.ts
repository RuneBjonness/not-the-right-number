import { useState, useCallback } from 'react';
import type { GameState, TestResult } from '../engine/types';
import type { Difficulty } from '../engine/difficulty';
import { getDifficultyConfig } from '../engine/difficulty';
import { getInitialTest, getAvailableTests } from '../engine/tests';
import {
  parseInput,
  validateInput,
  allTestsPassed,
  selectNextTest,
} from '../engine/gameEngine';

export interface SubmitResult {
  type: 'invalid' | 'failed' | 'passed' | 'won';
  newLevel?: number;
}

export interface UseGameStateReturn {
  gameState: GameState;
  testResults: TestResult[];
  submitInput: (input: string) => SubmitResult;
  giveUp: () => void;
  resetGame: (difficulty: Difficulty) => void;
  setTotalScore: (score: number) => void;
  addLevelScore: (score: number) => void;
  triggerGameOver: () => void;
}

function createInitialState(difficulty: Difficulty): GameState {
  const config = getDifficultyConfig(difficulty);
  return {
    activeTests: [getInitialTest(difficulty)],
    availableTests: getAvailableTests(difficulty),
    score: 0,
    isGameOver: false,
    currentInput: '',
    level: 0,
    levelScores: [],
    validCount: config.max - config.min + 1,
    difficulty,
  };
}

export function useGameState(): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState('normal'));
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const submitInput = useCallback(
    (input: string): SubmitResult => {
      if (gameState.isGameOver) return { type: 'invalid' };

      const value = parseInput(input);

      setGameState((prev) => ({ ...prev, currentInput: input }));

      if (value === null) {
        setTestResults(
          gameState.activeTests.map((test, index) => ({
            test,
            passed: index !== 0 ? true : false,
          }))
        );
        return { type: 'failed' };
      }

      const results = validateInput(value, gameState.activeTests);
      setTestResults(results);

      if (allTestsPassed(results)) {
        const config = getDifficultyConfig(gameState.difficulty);
        const result = selectNextTest(
          value,
          gameState.activeTests,
          gameState.availableTests,
          config.min,
          config.max
        );

        if (result) {
          const newLevel = gameState.level + 1;
          setGameState((prev) => ({
            ...prev,
            activeTests: [...prev.activeTests, result.test],
            availableTests: prev.availableTests.filter((t) => t.id !== result.test.id),
            currentInput: input,
            level: newLevel,
            validCount: result.validCount,
          }));
          return { type: 'passed', newLevel };
        } else {
          setGameState((prev) => ({
            ...prev,
            isGameOver: true,
            currentInput: input,
          }));
          return { type: 'won' };
        }
      }

      return { type: 'failed' };
    },
    [gameState]
  );

  const giveUp = useCallback(() => {
    setGameState((prev) => ({ ...prev, isGameOver: true }));
  }, []);

  const triggerGameOver = useCallback(() => {
    setGameState((prev) => ({ ...prev, isGameOver: true }));
  }, []);

  const setTotalScore = useCallback((score: number) => {
    setGameState((prev) => ({ ...prev, score }));
  }, []);

  const addLevelScore = useCallback((score: number) => {
    setGameState((prev) => ({
      ...prev,
      levelScores: [...prev.levelScores, score],
    }));
  }, []);

  const resetGame = useCallback((difficulty: Difficulty) => {
    setGameState(createInitialState(difficulty));
    setTestResults([]);
  }, []);

  return {
    gameState,
    testResults,
    submitInput,
    giveUp,
    resetGame,
    setTotalScore,
    addLevelScore,
    triggerGameOver,
  };
}
