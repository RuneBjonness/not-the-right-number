import { useState, useCallback } from 'react';
import type { GameState, TestResult } from '../engine/types';
import { getInitialTest, getAvailableTests } from '../engine/tests';
import {
  parseInput,
  validateInput,
  allTestsPassed,
  selectNextTest,
} from '../engine/gameEngine';

export interface UseGameStateReturn {
  gameState: GameState;
  testResults: TestResult[];
  submitInput: (input: string) => void;
  giveUp: () => void;
  resetGame: () => void;
}

function createInitialState(): GameState {
  return {
    activeTests: [getInitialTest()],
    availableTests: getAvailableTests(),
    score: 0,
    isGameOver: false,
    currentInput: '',
  };
}

export function useGameState(): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const submitInput = useCallback(
    (input: string) => {
      if (gameState.isGameOver) return;

      const value = parseInput(input);

      // Update current input
      setGameState((prev) => ({ ...prev, currentInput: input }));

      if (value === null) {
        // Invalid input - fail the first test
        setTestResults(
          gameState.activeTests.map((test, index) => ({
            test,
            passed: index !== 0 ? true : false, // First test (is-number) fails
          }))
        );
        return;
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
          setGameState((prev) => ({
            ...prev,
            activeTests: [...prev.activeTests, newTest],
            availableTests: prev.availableTests.filter((t) => t.id !== newTest.id),
            score: prev.activeTests.length, // Score is number of tests passed
            currentInput: input,
          }));
        } else {
          // No more tests available - player wins!
          setGameState((prev) => ({
            ...prev,
            score: prev.activeTests.length,
            isGameOver: true,
            currentInput: input,
          }));
        }
      }
    },
    [gameState]
  );

  const giveUp = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isGameOver: true,
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
  };
}
