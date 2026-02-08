import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundStore {
  soundEnabled: boolean;
  musicEnabled: boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
}

export const useSoundStore = create<SoundStore>()(
  persist(
    (set, get) => ({
      soundEnabled: true,
      musicEnabled: true,
      toggleSound: () => set({ soundEnabled: !get().soundEnabled }),
      toggleMusic: () => set({ musicEnabled: !get().musicEnabled }),
    }),
    { name: 'not-the-right-number-sound' },
  ),
);
