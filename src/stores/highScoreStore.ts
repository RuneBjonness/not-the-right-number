import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty } from '../engine/difficulty';

interface HighScores {
  easy: number;
  normal: number;
  hard: number;
}

interface HighScoreStore {
  highScores: HighScores;
  getHighScore: (difficulty: Difficulty) => number;
  checkAndUpdateHighScore: (score: number, difficulty: Difficulty) => boolean;
}

export const useHighScoreStore = create<HighScoreStore>()(
  persist(
    (set, get) => ({
      highScores: { easy: 0, normal: 0, hard: 0 },
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
    }),
    { name: 'not-the-right-number-highscores' }
  )
);
