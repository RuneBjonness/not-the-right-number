import { useState, useCallback } from 'react';
import type { GameState, TestResult } from '../engine/types';
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
  resetGame: () => void;
  setTotalScore: (score: number) => void;
  addLevelScore: (score: number) => void;
  triggerGameOver: () => void;
}

function createInitialState(): GameState {
  return {
    activeTests: [getInitialTest()],
    availableTests: getAvailableTests(),
    score: 0,
    isGameOver: false,
    currentInput: '',
    level: 0,
    levelScores: [],
  };
}

export function useGameState(): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const submitInput = useCallback(
    (input: string): SubmitResult => {
      if (gameState.isGameOver) return { type: 'invalid' };

      const value = parseInput(input);

      // Update current input
      setGameState((prev) => ({ ...prev, currentInput: input }));

      if (value === null) {
        // Invalid input - fail the first test
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
        // All tests passed - add a new test
        const newTest = selectNextTest(
          value,
          gameState.activeTests,
          gameState.availableTests
        );

        if (newTest) {
          const newLevel = gameState.level + 1;
          setGameState((prev) => ({
            ...prev,
            activeTests: [...prev.activeTests, newTest],
            availableTests: prev.availableTests.filter((t) => t.id !== newTest.id),
            currentInput: input,
            level: newLevel,
          }));
          return { type: 'passed', newLevel };
        } else {
          // No more tests available - player wins!
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
    setGameState((prev) => ({
      ...prev,
      isGameOver: true,
    }));
  }, []);

  const triggerGameOver = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isGameOver: true,
    }));
  }, []);

  const setTotalScore = useCallback((score: number) => {
    setGameState((prev) => ({
      ...prev,
      score,
    }));
  }, []);

  const addLevelScore = useCallback((score: number) => {
    setGameState((prev) => ({
      ...prev,
      levelScores: [...prev.levelScores, score],
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(createInitialState());
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
