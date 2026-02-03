import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HighScoreStore {
  highScore: number;
  setHighScore: (score: number) => void;
  checkAndUpdateHighScore: (score: number) => boolean;
}

export const useHighScoreStore = create<HighScoreStore>()(
  persist(
    (set, get) => ({
      highScore: 0,
      setHighScore: (score) => set({ highScore: score }),
      checkAndUpdateHighScore: (score) => {
        if (score > get().highScore) {
          set({ highScore: score });
          return true;
        }
        return false;
      },
    }),
    { name: 'not-the-right-number-highscore' }
  )
);
