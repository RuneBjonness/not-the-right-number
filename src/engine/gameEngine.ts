import type { Test, TestResult } from './types';
import { Tier } from './types';
import { violatesExclusion } from './ruleCompatibility';

export function parseInput(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  if (isNaN(num)) return null;
  return num;
}

export function validateInput(value: number, tests: Test[]): TestResult[] {
  return tests.map((test) => ({
    test,
    passed: test.validate(value),
  }));
}

export function allTestsPassed(results: TestResult[]): boolean {
  return results.every((r) => r.passed);
}

interface CandidateScore {
  test: Test;
  validCount: number;
}

interface ScoredResult {
  scored: CandidateScore[];
  validNumbers: number[];
}

/**
 * Single-pass scoring: scan valid numbers once,
 * and for every number that passes all active rules, check which
 * candidates it also passes.
 *
 * When cachedValidNumbers is provided, skips the active-test check
 * entirely (the cache already contains only numbers passing active tests).
 */
function scoreCandidates(
  activeTests: Test[],
  candidates: Test[],
  min: number,
  max: number,
  minValidCount: number = 1,
  cachedValidNumbers?: number[] | null
): ScoredResult {
  const counts = new Array<number>(candidates.length).fill(0);
  let validNumbers: number[];

  if (cachedValidNumbers) {
    validNumbers = cachedValidNumbers;
    for (let i = 0; i < validNumbers.length; i++) {
      const n = validNumbers[i];
      for (let c = 0; c < candidates.length; c++) {
        if (candidates[c].validate(n)) {
          counts[c]++;
        }
      }
    }
  } else {
    validNumbers = [];
    for (let n = min; n <= max; n++) {
      let passesActive = true;
      for (let r = 0; r < activeTests.length; r++) {
        if (!activeTests[r].validate(n)) {
          passesActive = false;
          break;
        }
      }
      if (!passesActive) continue;

      validNumbers.push(n);
      for (let c = 0; c < candidates.length; c++) {
        if (candidates[c].validate(n)) {
          counts[c]++;
        }
      }
    }
  }

  const scored: CandidateScore[] = [];
  for (let c = 0; c < candidates.length; c++) {
    if (counts[c] >= minValidCount) {
      scored.push({ test: candidates[c], validCount: counts[c] });
    }
  }
  return { scored, validNumbers };
}

export function selectNextTest(
  currentValue: number,
  activeTests: Test[],
  availableTests: Test[],
  min: number,
  max: number,
  minValidCount: number = 1,
  cachedValidNumbers?: number[] | null
): { test: Test; validCount: number; validNumbers: number[] } | null {
  const failingTests = availableTests.filter((test) => !test.validate(currentValue));
  if (failingTests.length === 0) return null;

  const activeIds = new Set(activeTests.map((t) => t.id));

  const tierOrder = [Tier.EARLY, Tier.MID, Tier.LATE];
  let targetTierIndex = 0;
  if (activeTests.length >= 5) targetTierIndex = 1;
  if (activeTests.length >= 10) targetTierIndex = 2;

  const eligible = failingTests.filter((test) => {
    const testTierIndex = tierOrder.indexOf(test.tier);
    if (testTierIndex > targetTierIndex) return false;
    if (violatesExclusion(test.id, activeIds)) return false;
    return true;
  });

  if (eligible.length === 0) return null;

  const { scored, validNumbers } = scoreCandidates(activeTests, eligible, min, max, minValidCount, cachedValidNumbers);

  if (scored.length === 0) return null;

  scored.sort((a, b) => b.validCount - a.validCount);

  const upperHalf = scored.slice(0, Math.max(1, Math.ceil(scored.length / 2)));

  const preferred = upperHalf.filter(
    (c) => tierOrder.indexOf(c.test.tier) === targetTierIndex
  );

  const pool = preferred.length > 0 ? preferred : upperHalf;
  const pick = pool[Math.floor(Math.random() * pool.length)];

  // Filter cached valid numbers to those passing the new test
  const newValidNumbers = validNumbers.filter(n => pick.test.validate(n));

  return { test: pick.test, validCount: pick.validCount, validNumbers: newValidNumbers };
}
