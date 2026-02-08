import { useEffect, useRef } from "react";
import {
  startMusic,
  stopMusic,
  updateMusicState,
  setMusicEnabled,
  playFailureEnding,
  playSuccessEnding,
} from "../engine/music";
import { useSoundStore } from "../stores/soundStore";
import type { UrgencyLevel } from "../engine/urgency";

export type GamePhase = "welcome" | "countdown" | "playing" | "gameOver" | "won";

export interface BackgroundMusicProps {
  phase: GamePhase;
  level: number;
  winThreshold: number;
  potentialPoints: number;
  maxPoints: number;
  urgency: UrgencyLevel;
}

export function useBackgroundMusic({
  phase,
  level,
  winThreshold,
  potentialPoints,
  maxPoints,
  urgency,
}: BackgroundMusicProps): void {
  const { soundEnabled, musicEnabled } = useSoundStore();
  const prevPhaseRef = useRef<GamePhase>(phase);

  // Start/stop music on phase transitions
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    if (prev !== phase) {
      if (phase === "playing" && soundEnabled && musicEnabled) {
        startMusic();
      } else if (phase === "gameOver" && prev === "playing") {
        playFailureEnding();
      } else if (phase === "won" && prev === "playing") {
        playSuccessEnding();
      } else if (phase === "welcome" || phase === "countdown") {
        stopMusic(0.3);
      }
    }
  }, [phase, soundEnabled, musicEnabled]);

  // Sync enabled state
  useEffect(() => {
    setMusicEnabled(soundEnabled && musicEnabled);
  }, [soundEnabled, musicEnabled]);

  // Update music intensity
  useEffect(() => {
    if (phase !== "playing") return;
    updateMusicState({
      level,
      winThreshold,
      potentialPoints,
      maxPoints,
      urgency,
    });
  }, [phase, level, winThreshold, potentialPoints, maxPoints, urgency]);
}
