import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty } from '../engine/difficulty';

interface HighScores {
  easy: number;
  normal: number;
  hard: number;
}

interface SolvedState {
  easy: boolean;
  normal: boolean;
  hard: boolean;
}

interface HighScoreStore {
  highScores: HighScores;
  solved: SolvedState;
  getHighScore: (difficulty: Difficulty) => number;
  checkAndUpdateHighScore: (score: number, difficulty: Difficulty) => boolean;
  markSolved: (difficulty: Difficulty) => void;
  isSolved: (difficulty: Difficulty) => boolean;
}

export const useHighScoreStore = create<HighScoreStore>()(
  persist(
    (set, get) => ({
      highScores: { easy: 0, normal: 0, hard: 0 },
      solved: { easy: false, normal: false, hard: false },
      getHighScore: (difficulty) => get().highScores[difficulty],
      checkAndUpdateHighScore: (score, difficulty) => {
        if (score > get().highScores[difficulty]) {
          set({
            highScores: { ...get().highScores, [difficulty]: score },
          });
          return true;
        }
        return false;
      },
      markSolved: (difficulty) => {
        set({
          solved: { ...get().solved, [difficulty]: true },
        });
      },
      isSolved: (difficulty) => get().solved[difficulty],
    }),
    { name: 'not-the-right-number-highscores' }
  )
);
