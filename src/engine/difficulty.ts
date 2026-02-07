export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  label: string;
  min: number;
  max: number;
  maxDigits: number;
  scoreMultiplier: number;
  excludedRuleIds: Set<string>;
  winThreshold: number;
}

const EASY_EXCLUDED = new Set([
  'exactly-4-digits',
  'exactly-5-digits',
  'less-than-1000',
  'less-than-100000',
]);

const NORMAL_EXCLUDED = new Set([
  'exactly-5-digits',
  'less-than-100000',
]);

const HARD_EXCLUDED = new Set<string>();

const configs: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'Easy',
    min: 1,
    max: 999,
    maxDigits: 3,
    scoreMultiplier: 1,
    excludedRuleIds: EASY_EXCLUDED,
    winThreshold: 4,
  },
  normal: {
    label: 'Normal',
    min: 1,
    max: 9_999,
    maxDigits: 4,
    scoreMultiplier: 1.5,
    excludedRuleIds: NORMAL_EXCLUDED,
    winThreshold: 10,
  },
  hard: {
    label: 'Hard',
    min: 1,
    max: 999_999,
    maxDigits: 6,
    scoreMultiplier: 2,
    excludedRuleIds: HARD_EXCLUDED,
    winThreshold: 25,
  },
};

export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
  return configs[difficulty];
}
