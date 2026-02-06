import type { Test } from './types';
import { Tier } from './types';

function digitSum(value: number): number {
  return value
    .toString()
    .split('')
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
}

function digits(value: number): string[] {
  return value.toString().split('');
}

export const allTests: Test[] = [
  // ── Always-first base rule ──────────────────────────────────────
  {
    id: 'between-1-and-999999',
    name: 'Must be between 1 and 999,999',
    description: 'The number must be a whole number from 1 to 999,999',
    tier: Tier.EARLY,
    validate: (v) => Number.isInteger(v) && v >= 1 && v <= 999_999,
  },

  // ── EARLY tier ──────────────────────────────────────────────────
  {
    id: 'is-even',
    name: 'Must be even',
    description: 'The number must be divisible by 2',
    tier: Tier.EARLY,
    validate: (v) => v % 2 === 0,
  },
  {
    id: 'is-odd',
    name: 'Must be odd',
    description: 'The number must not be divisible by 2',
    tier: Tier.EARLY,
    validate: (v) => v % 2 !== 0,
  },
  {
    id: 'greater-than-50',
    name: 'Must be greater than 50',
    description: 'The number must be larger than 50',
    tier: Tier.EARLY,
    validate: (v) => v > 50,
  },
  {
    id: 'greater-than-100',
    name: 'Must be greater than 100',
    description: 'The number must be larger than 100',
    tier: Tier.EARLY,
    validate: (v) => v > 100,
  },
  {
    id: 'greater-than-200',
    name: 'Must be greater than 200',
    description: 'The number must be larger than 200',
    tier: Tier.EARLY,
    validate: (v) => v > 200,
  },
  {
    id: 'less-than-1000',
    name: 'Must be less than 1,000',
    description: 'The number must be smaller than 1,000',
    tier: Tier.EARLY,
    validate: (v) => v < 1000,
  },
  {
    id: 'less-than-500',
    name: 'Must be less than 500',
    description: 'The number must be smaller than 500',
    tier: Tier.EARLY,
    validate: (v) => v < 500,
  },
  {
    id: 'less-than-100000',
    name: 'Must be less than 100,000',
    description: 'The number must be smaller than 100,000',
    tier: Tier.EARLY,
    validate: (v) => v < 100_000,
  },
  {
    id: 'at-least-2-digits',
    name: 'Must have at least 2 digits',
    description: 'The number must have 2 or more digits',
    tier: Tier.EARLY,
    validate: (v) => v >= 10,
  },
  {
    id: 'at-least-3-digits',
    name: 'Must have at least 3 digits',
    description: 'The number must have 3 or more digits',
    tier: Tier.EARLY,
    validate: (v) => v >= 100,
  },
  {
    id: 'divisible-by-3',
    name: 'Must be divisible by 3',
    description: 'The number must be evenly divisible by 3',
    tier: Tier.EARLY,
    validate: (v) => v % 3 === 0,
  },
  {
    id: 'divisible-by-5',
    name: 'Must be divisible by 5',
    description: 'The number must be evenly divisible by 5',
    tier: Tier.EARLY,
    validate: (v) => v % 5 === 0,
  },
  {
    id: 'divisible-by-7',
    name: 'Must be divisible by 7',
    description: 'The number must be evenly divisible by 7',
    tier: Tier.EARLY,
    validate: (v) => v % 7 === 0,
  },
  {
    id: 'divisible-by-11',
    name: 'Must be divisible by 11',
    description: 'The number must be evenly divisible by 11',
    tier: Tier.EARLY,
    validate: (v) => v % 11 === 0,
  },
  {
    id: 'not-divisible-by-4',
    name: 'Must NOT be divisible by 4',
    description: 'The number must not be evenly divisible by 4',
    tier: Tier.EARLY,
    validate: (v) => v % 4 !== 0,
  },
  {
    id: 'last-digit-is-even',
    name: 'Last digit must be even',
    description: 'The ones digit must be 0, 2, 4, 6, or 8',
    tier: Tier.EARLY,
    validate: (v) => (v % 10) % 2 === 0,
  },
  {
    id: 'last-digit-is-odd',
    name: 'Last digit must be odd',
    description: 'The ones digit must be 1, 3, 5, 7, or 9',
    tier: Tier.EARLY,
    validate: (v) => (v % 10) % 2 !== 0,
  },

  // ── MID tier ────────────────────────────────────────────────────
  {
    id: 'is-prime',
    name: 'Must be a prime number',
    description: 'The number must only be divisible by 1 and itself',
    tier: Tier.MID,
    validate: (v) => {
      if (v < 2) return false;
      if (v === 2) return true;
      if (v % 2 === 0) return false;
      for (let i = 3; i * i <= v; i += 2) {
        if (v % i === 0) return false;
      }
      return true;
    },
  },
  {
    id: 'is-perfect-square',
    name: 'Must be a perfect square',
    description: 'The number must be the square of an integer (e.g., 4, 9, 16)',
    tier: Tier.MID,
    validate: (v) => {
      const sqrt = Math.sqrt(v);
      return Math.round(sqrt) * Math.round(sqrt) === v;
    },
  },
  {
    id: 'digit-sum-greater-10',
    name: 'Digit sum must be greater than 10',
    description: 'The sum of all digits must exceed 10',
    tier: Tier.MID,
    validate: (v) => digitSum(v) > 10,
  },
  {
    id: 'digit-sum-divisible-by-3',
    name: 'Digit sum must be divisible by 3',
    description: 'The sum of all digits must be divisible by 3',
    tier: Tier.MID,
    validate: (v) => digitSum(v) % 3 === 0,
  },
  {
    id: 'digit-sum-is-even',
    name: 'Digit sum must be even',
    description: 'The sum of all digits must be an even number',
    tier: Tier.MID,
    validate: (v) => digitSum(v) % 2 === 0,
  },
  {
    id: 'digit-sum-is-odd',
    name: 'Digit sum must be odd',
    description: 'The sum of all digits must be an odd number',
    tier: Tier.MID,
    validate: (v) => digitSum(v) % 2 !== 0,
  },
  {
    id: 'contains-digit-7',
    name: 'Must contain the digit 7',
    description: 'The number must have at least one 7 in it',
    tier: Tier.MID,
    validate: (v) => v.toString().includes('7'),
  },
  {
    id: 'contains-digit-3',
    name: 'Must contain the digit 3',
    description: 'The number must have at least one 3 in it',
    tier: Tier.MID,
    validate: (v) => v.toString().includes('3'),
  },
  {
    id: 'is-palindrome',
    name: 'Must be a palindrome',
    description: 'The number must read the same forwards and backwards',
    tier: Tier.MID,
    validate: (v) => {
      const s = v.toString();
      return s === s.split('').reverse().join('');
    },
  },
  {
    id: 'no-repeating-digits',
    name: 'No repeating digits',
    description: 'Each digit can only appear once in the number',
    tier: Tier.MID,
    validate: (v) => {
      const d = digits(v);
      return new Set(d).size === d.length;
    },
  },
  {
    id: 'first-digit-greater-than-5',
    name: 'First digit must be > 5',
    description: 'The first (leftmost) digit must be 6, 7, 8, or 9',
    tier: Tier.MID,
    validate: (v) => parseInt(v.toString()[0], 10) > 5,
  },
  {
    id: 'first-digit-less-than-4',
    name: 'First digit must be < 4',
    description: 'The first (leftmost) digit must be 1, 2, or 3',
    tier: Tier.MID,
    validate: (v) => parseInt(v.toString()[0], 10) < 4,
  },
  {
    id: 'contains-consecutive-digits',
    name: 'Must contain consecutive digits',
    description: 'Must have two adjacent digits that are consecutive (e.g., 3 next to 4)',
    tier: Tier.MID,
    validate: (v) => {
      const d = digits(v);
      for (let i = 0; i < d.length - 1; i++) {
        if (Math.abs(parseInt(d[i], 10) - parseInt(d[i + 1], 10)) === 1) return true;
      }
      return false;
    },
  },
  {
    id: 'no-digit-zero',
    name: 'Must not contain 0',
    description: 'None of the digits can be zero',
    tier: Tier.MID,
    validate: (v) => !v.toString().includes('0'),
  },
  {
    id: 'no-digit-5',
    name: 'Must not contain 5',
    description: 'None of the digits can be five',
    tier: Tier.MID,
    validate: (v) => !v.toString().includes('5'),
  },
  {
    id: 'is-harshad',
    name: 'Must be a Harshad number',
    description: 'The number must be divisible by the sum of its own digits',
    tier: Tier.MID,
    validate: (v) => {
      const ds = digitSum(v);
      return ds > 0 && v % ds === 0;
    },
  },
  {
    id: 'contains-double-digit',
    name: 'Must have a repeated pair',
    description: 'Must contain two identical adjacent digits (e.g., 11, 33, 558)',
    tier: Tier.MID,
    validate: (v) => {
      const d = digits(v);
      for (let i = 0; i < d.length - 1; i++) {
        if (d[i] === d[i + 1]) return true;
      }
      return false;
    },
  },
  {
    id: 'exactly-3-digits',
    name: 'Must have exactly 3 digits',
    description: 'The number must be between 100 and 999',
    tier: Tier.MID,
    validate: (v) => v >= 100 && v <= 999,
  },
  {
    id: 'exactly-4-digits',
    name: 'Must have exactly 4 digits',
    description: 'The number must be between 1,000 and 9,999',
    tier: Tier.MID,
    validate: (v) => v >= 1000 && v <= 9999,
  },
  {
    id: 'exactly-5-digits',
    name: 'Must have exactly 5 digits',
    description: 'The number must be between 10,000 and 99,999',
    tier: Tier.MID,
    validate: (v) => v >= 10_000 && v <= 99_999,
  },
  {
    id: 'is-multiple-of-digit-count',
    name: 'Divisible by its digit count',
    description: 'The number must be divisible by how many digits it has',
    tier: Tier.MID,
    validate: (v) => {
      const len = v.toString().length;
      return v % len === 0;
    },
  },
  {
    id: 'all-digits-less-than-6',
    name: 'All digits must be < 6',
    description: 'Every digit in the number must be 0, 1, 2, 3, 4, or 5',
    tier: Tier.MID,
    validate: (v) => digits(v).every((d) => parseInt(d, 10) < 6),
  },
  {
    id: 'all-digits-greater-than-3',
    name: 'All digits must be > 3',
    description: 'Every digit in the number must be 4, 5, 6, 7, 8, or 9',
    tier: Tier.MID,
    validate: (v) => digits(v).every((d) => parseInt(d, 10) > 3),
  },
  {
    id: 'digit-product-greater-than-50',
    name: 'Digit product must be > 50',
    description: 'The product of all digits must exceed 50 (digits with 0 give product 0!)',
    tier: Tier.MID,
    validate: (v) => {
      const product = digits(v).reduce((acc, d) => acc * parseInt(d, 10), 1);
      return product > 50;
    },
  },

  // ── LATE tier ───────────────────────────────────────────────────
  {
    id: 'is-fibonacci',
    name: 'Must be a Fibonacci number',
    description: 'The number must appear in the Fibonacci sequence',
    tier: Tier.LATE,
    validate: (() => {
      const fibs = new Set<number>();
      let a = 1, b = 1;
      while (a <= 999_999) {
        fibs.add(a);
        [a, b] = [b, a + b];
      }
      return (v: number) => fibs.has(v);
    })(),
  },
  {
    id: 'is-triangular',
    name: 'Must be a triangular number',
    description: 'The number must equal n×(n+1)/2 for some n (e.g., 1, 3, 6, 10, 15)',
    tier: Tier.LATE,
    validate: (v) => {
      // n*(n+1)/2 = v  =>  n^2 + n - 2v = 0  =>  n = (-1 + sqrt(1+8v)) / 2
      const n = (-1 + Math.sqrt(1 + 8 * v)) / 2;
      return Number.isInteger(Math.round(n)) && Math.round(n) * (Math.round(n) + 1) / 2 === v;
    },
  },
  {
    id: 'is-perfect-cube',
    name: 'Must be a perfect cube',
    description: 'The number must be the cube of an integer (e.g., 8, 27, 64)',
    tier: Tier.LATE,
    validate: (v) => {
      const cbrt = Math.round(Math.cbrt(v));
      return cbrt * cbrt * cbrt === v;
    },
  },
  {
    id: 'digits-ascending',
    name: 'Digits must be ascending',
    description: 'Each digit must be greater than or equal to the one before it',
    tier: Tier.LATE,
    validate: (v) => {
      const d = digits(v);
      for (let i = 1; i < d.length; i++) {
        if (d[i] < d[i - 1]) return false;
      }
      return true;
    },
  },
  {
    id: 'digits-descending',
    name: 'Digits must be descending',
    description: 'Each digit must be less than or equal to the one before it',
    tier: Tier.LATE,
    validate: (v) => {
      const d = digits(v);
      for (let i = 1; i < d.length; i++) {
        if (d[i] > d[i - 1]) return false;
      }
      return true;
    },
  },
  {
    id: 'first-equals-last',
    name: 'First digit = last digit',
    description: 'The first and last digits of the number must be the same',
    tier: Tier.LATE,
    validate: (v) => {
      const s = v.toString();
      return s[0] === s[s.length - 1];
    },
  },
  {
    id: 'alternating-parity',
    name: 'Digits must alternate odd/even',
    description: 'Each digit must have different parity than the digit next to it',
    tier: Tier.LATE,
    validate: (v) => {
      const d = digits(v);
      if (d.length < 2) return true;
      for (let i = 1; i < d.length; i++) {
        if (parseInt(d[i], 10) % 2 === parseInt(d[i - 1], 10) % 2) return false;
      }
      return true;
    },
  },
  {
    id: 'all-digits-prime',
    name: 'Every digit must be prime',
    description: 'All digits must be 2, 3, 5, or 7',
    tier: Tier.LATE,
    validate: (v) => {
      const primeDigits = new Set(['2', '3', '5', '7']);
      return digits(v).every((d) => primeDigits.has(d));
    },
  },
  {
    id: 'sum-first-last-greater-10',
    name: 'First + last digit > 10',
    description: 'The sum of the first and last digits must be greater than 10',
    tier: Tier.LATE,
    validate: (v) => {
      const s = v.toString();
      return parseInt(s[0], 10) + parseInt(s[s.length - 1], 10) > 10;
    },
  },
  {
    id: 'is-power-of-2',
    name: 'Must be a power of 2',
    description: 'The number must be 1, 2, 4, 8, 16, 32, ...',
    tier: Tier.LATE,
    validate: (() => {
      const powers = new Set<number>();
      let p = 1;
      while (p <= 999_999) {
        powers.add(p);
        p *= 2;
      }
      return (v: number) => powers.has(v);
    })(),
  },
];

export function getInitialTest(): Test {
  return allTests[0]; // "Must be between 1 and 999,999"
}

export function getAvailableTests(): Test[] {
  return allTests.slice(1);
}
