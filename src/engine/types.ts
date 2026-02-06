import type { Difficulty } from './difficulty';

export const Tier = {
  EARLY: 'EARLY',
  MID: 'MID',
  LATE: 'LATE',
} as const;

export type Tier = (typeof Tier)[keyof typeof Tier];

export interface Test {
  id: string;
  name: string;
  description: string;
  tier: Tier;
  validate: (value: number) => boolean;
}

export interface TestResult {
  test: Test;
  passed: boolean;
}

export interface GameState {
  activeTests: Test[];
  availableTests: Test[];
  score: number;
  isGameOver: boolean;
  currentInput: string;
  level: number;
  levelScores: number[];
  validCount: number;
  difficulty: Difficulty;
}

export type { Difficulty } from './difficulty';

