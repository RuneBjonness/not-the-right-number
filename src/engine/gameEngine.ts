import type { Test, TestResult } from './types';
import { Tier } from './types';
import { violatesExclusion, MIN_VALUE, MAX_VALUE } from './ruleCompatibility';

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

/**
 * Single-pass scoring: scan [MIN_VALUE, MAX_VALUE] once,
 * and for every number that passes all active rules, check which
 * candidates it also passes. This is O(N * C) where N = range size
 * and C = candidate count, but avoids repeated full scans.
 */
function scoreCandidates(
  activeTests: Test[],
  candidates: Test[]
): CandidateScore[] {
  const counts = new Array<number>(candidates.length).fill(0);

  for (let n = MIN_VALUE; n <= MAX_VALUE; n++) {
    // Check active rules first (most constraining → fast rejection)
    let passesActive = true;
    for (let r = 0; r < activeTests.length; r++) {
      if (!activeTests[r].validate(n)) {
        passesActive = false;
        break;
      }
    }
    if (!passesActive) continue;

    // This number passes all active rules — check each candidate
    for (let c = 0; c < candidates.length; c++) {
      if (candidates[c].validate(n)) {
        counts[c]++;
      }
    }
  }

  const scored: CandidateScore[] = [];
  for (let c = 0; c < candidates.length; c++) {
    if (counts[c] > 0) {
      scored.push({ test: candidates[c], validCount: counts[c] });
    }
  }
  return scored;
}

export function selectNextTest(
  currentValue: number,
  activeTests: Test[],
  availableTests: Test[]
): { test: Test; validCount: number } | null {
  // Only consider tests that the current value FAILS
  const failingTests = availableTests.filter((test) => !test.validate(currentValue));
  if (failingTests.length === 0) return null;

  // Build set of active rule IDs for exclusion checks
  const activeIds = new Set(activeTests.map((t) => t.id));

  // Tier progression
  const tierOrder = [Tier.EARLY, Tier.MID, Tier.LATE];
  let targetTierIndex = 0;
  if (activeTests.length >= 5) targetTierIndex = 1;
  if (activeTests.length >= 10) targetTierIndex = 2;

  // Filter by tier and exclusion rules
  const eligible = failingTests.filter((test) => {
    const testTierIndex = tierOrder.indexOf(test.tier);
    if (testTierIndex > targetTierIndex) return false;
    if (violatesExclusion(test.id, activeIds)) return false;
    return true;
  });

  if (eligible.length === 0) return null;

  // Score all candidates in a single pass over the number range
  const scored = scoreCandidates(activeTests, eligible);

  if (scored.length === 0) return null;

  // Sort by valid count descending (most permissive first)
  scored.sort((a, b) => b.validCount - a.validCount);

  // Prefer the upper half of candidates (keeps game playable)
  // but add some randomness so it's not always the most permissive
  const upperHalf = scored.slice(0, Math.max(1, Math.ceil(scored.length / 2)));

  // Within the upper half, prefer rules from the target tier
  const preferred = upperHalf.filter(
    (c) => tierOrder.indexOf(c.test.tier) === targetTierIndex
  );

  const pool = preferred.length > 0 ? preferred : upperHalf;
  const pick = pool[Math.floor(Math.random() * pool.length)];

  return { test: pick.test, validCount: pick.validCount };
}
