import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Challenge } from '../engine/bragCodec';

interface BragStore {
  playerName: string;
  challenges: Challenge[];
  setPlayerName: (name: string) => void;
  addChallenge: (challenge: Challenge) => void;
  removeChallenge: (id: string) => void;
  hasChallenge: (id: string) => boolean;
}

export const useBragStore = create<BragStore>()(
  persist(
    (set, get) => ({
      playerName: '',
      challenges: [],
      setPlayerName: (name) => set({ playerName: name.slice(0, 20) }),
      addChallenge: (challenge) => {
        if (get().challenges.some((c) => c.id === challenge.id)) return;
        set({ challenges: [...get().challenges, challenge] });
      },
      removeChallenge: (id) => {
        set({ challenges: get().challenges.filter((c) => c.id !== id) });
      },
      hasChallenge: (id) => get().challenges.some((c) => c.id === id),
    }),
    { name: 'not-the-right-number-brag' },
  ),
);
