import type { Test } from './types';

/**
 * Pairs of rule IDs that must never coexist.
 * This is a fast pre-filter; the valid-count check is the ultimate safety net.
 */
const EXCLUSION_PAIRS: [string, string][] = [
  ['is-even', 'is-odd'],
  ['last-digit-is-even', 'last-digit-is-odd'],
  ['digit-sum-is-even', 'digit-sum-is-odd'],
  ['first-digit-greater-than-5', 'first-digit-less-than-4'],
  ['digits-ascending', 'digits-descending'],
  ['is-prime', 'is-even'],
  ['is-perfect-square', 'is-prime'],
  ['contains-digit-7', 'all-digits-less-than-6'],
  ['contains-digit-3', 'all-digits-less-than-3'],
  ['is-palindrome', 'no-repeating-digits'],
];

/**
 * Returns true if adding `candidate` to `activeIds` would violate an exclusion pair.
 */
export function violatesExclusion(candidateId: string, activeIds: Set<string>): boolean {
  for (const [a, b] of EXCLUSION_PAIRS) {
    if (candidateId === a && activeIds.has(b)) return true;
    if (candidateId === b && activeIds.has(a)) return true;
  }
  return false;
}

/**
 * Counts how many integers in [min, max] satisfy ALL given rules.
 */
export function countValidNumbers(rules: Test[], min: number, max: number): number {
  let count = 0;
  for (let n = min; n <= max; n++) {
    let valid = true;
    for (let r = 0; r < rules.length; r++) {
      if (!rules[r].validate(n)) {
        valid = false;
        break;
      }
    }
    if (valid) count++;
  }
  return count;
}
