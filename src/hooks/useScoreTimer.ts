import { useState, useCallback, useRef, useEffect } from 'react';
import {
  calculateLevelStartingPoints,
  applyWrongAnswerPenalty,
} from '../engine/scoring';

export interface UseScoreTimerReturn {
  potentialPoints: number;
  isRunning: boolean;
  startTimer: (level: number) => void;
  stopTimer: () => void;
  applyPenalty: () => void;
  resetForNewLevel: (level: number) => void;
}

export function useScoreTimer(
  onPointsReachZero: () => void
): UseScoreTimerReturn {
  const [potentialPoints, setPotentialPoints] = useState(
    calculateLevelStartingPoints(0)
  );
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const onPointsReachZeroRef = useRef(onPointsReachZero);

  // Keep the callback ref up to date
  useEffect(() => {
    onPointsReachZeroRef.current = onPointsReachZero;
  }, [onPointsReachZero]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (level: number) => {
      clearTimer();
      const startingPoints = calculateLevelStartingPoints(level);
      setPotentialPoints(startingPoints);
      setIsRunning(true);

      intervalRef.current = window.setInterval(() => {
        setPotentialPoints((prev) => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            clearTimer();
            setIsRunning(false);
            // Use setTimeout to avoid state update during render
            setTimeout(() => onPointsReachZeroRef.current(), 0);
            return 0;
          }
          return newValue;
        });
      }, 1000);
    },
    [clearTimer]
  );

  const stopTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const applyPenalty = useCallback(() => {
    setPotentialPoints((prev) => {
      const newValue = applyWrongAnswerPenalty(prev);
      if (newValue <= 0) {
        clearTimer();
        setIsRunning(false);
        setTimeout(() => onPointsReachZeroRef.current(), 0);
        return 0;
      }
      return newValue;
    });
  }, [clearTimer]);

  const resetForNewLevel = useCallback(
    (level: number) => {
      clearTimer();
      startTimer(level);
    },
    [clearTimer, startTimer]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    potentialPoints,
    isRunning,
    startTimer,
    stopTimer,
    applyPenalty,
    resetForNewLevel,
  };
}
