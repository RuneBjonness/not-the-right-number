import type { Test, TestResult } from './types';
import { Tier } from './types';

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

export function selectNextTest(
  currentValue: number,
  activeTests: Test[],
  availableTests: Test[]
): Test | null {
  // Filter to tests that the current value fails
  const failingTests = availableTests.filter((test) => !test.validate(currentValue));

  if (failingTests.length === 0) return null;

  // Get tier order for progression
  const tierOrder = [Tier.EARLY, Tier.MID, Tier.LATE];

  // Calculate target tier based on number of active tests
  let targetTierIndex = 0;
  if (activeTests.length >= 5) targetTierIndex = 1; // Allow MID tier
  if (activeTests.length >= 10) targetTierIndex = 2; // Allow LATE tier

  // Filter tests by tier progression
  const eligibleTests = failingTests.filter((test) => {
    const testTierIndex = tierOrder.indexOf(test.tier);
    return testTierIndex <= targetTierIndex;
  });

  if (eligibleTests.length === 0) {
    // Fall back to any failing test if tier filtering is too strict
    return failingTests[Math.floor(Math.random() * failingTests.length)];
  }

  // Prefer tests from the current target tier, but allow earlier tiers
  const preferredTests = eligibleTests.filter(
    (test) => tierOrder.indexOf(test.tier) === targetTierIndex
  );

  const testPool = preferredTests.length > 0 ? preferredTests : eligibleTests;

  // Random selection from eligible tests
  return testPool[Math.floor(Math.random() * testPool.length)];
}
