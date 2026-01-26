import type { Test } from './types';
import { Tier } from './types';

export const allTests: Test[] = [
  // Always first - validates that input is a number
  {
    id: 'is-number',
    name: 'Must be a number',
    description: 'Your input must be a valid number',
    tier: Tier.EARLY,
    validate: (value: number) => !isNaN(value) && isFinite(value),
  },

  // Basic parity and sign tests
  {
    id: 'is-positive',
    name: 'Must be positive',
    description: 'The number must be greater than zero',
    tier: Tier.EARLY,
    validate: (value: number) => value > 0,
  },
  {
    id: 'is-negative',
    name: 'Must be negative',
    description: 'The number must be less than zero',
    tier: Tier.EARLY,
    validate: (value: number) => value < 0,
  },
  {
    id: 'is-even',
    name: 'Must be even',
    description: 'The number must be divisible by 2',
    tier: Tier.EARLY,
    validate: (value: number) => value % 2 === 0,
  },
  {
    id: 'is-odd',
    name: 'Must be odd',
    description: 'The number must not be divisible by 2',
    tier: Tier.EARLY,
    validate: (value: number) => value % 2 !== 0,
  },

  // Comparison tests
  {
    id: 'greater-than-10',
    name: 'Must be greater than 10',
    description: 'The number must be larger than 10',
    tier: Tier.EARLY,
    validate: (value: number) => value > 10,
  },
  {
    id: 'greater-than-50',
    name: 'Must be greater than 50',
    description: 'The number must be larger than 50',
    tier: Tier.EARLY,
    validate: (value: number) => value > 50,
  },
  {
    id: 'greater-than-100',
    name: 'Must be greater than 100',
    description: 'The number must be larger than 100',
    tier: Tier.EARLY,
    validate: (value: number) => value > 100,
  },
  {
    id: 'less-than-1000',
    name: 'Must be less than 1000',
    description: 'The number must be smaller than 1000',
    tier: Tier.EARLY,
    validate: (value: number) => value < 1000,
  },
  {
    id: 'less-than-500',
    name: 'Must be less than 500',
    description: 'The number must be smaller than 500',
    tier: Tier.EARLY,
    validate: (value: number) => value < 500,
  },

  // Digit count tests
  {
    id: 'at-least-2-digits',
    name: 'Must have at least 2 digits',
    description: 'The number must have 2 or more digits',
    tier: Tier.EARLY,
    validate: (value: number) => Math.abs(value).toString().replace('.', '').length >= 2,
  },
  {
    id: 'at-least-3-digits',
    name: 'Must have at least 3 digits',
    description: 'The number must have 3 or more digits',
    tier: Tier.EARLY,
    validate: (value: number) => Math.abs(value).toString().replace('.', '').length >= 3,
  },

  // Divisibility tests
  {
    id: 'divisible-by-3',
    name: 'Must be divisible by 3',
    description: 'The number must be evenly divisible by 3',
    tier: Tier.EARLY,
    validate: (value: number) => Number.isInteger(value) && value % 3 === 0,
  },
  {
    id: 'divisible-by-5',
    name: 'Must be divisible by 5',
    description: 'The number must be evenly divisible by 5',
    tier: Tier.EARLY,
    validate: (value: number) => Number.isInteger(value) && value % 5 === 0,
  },
  {
    id: 'divisible-by-7',
    name: 'Must be divisible by 7',
    description: 'The number must be evenly divisible by 7',
    tier: Tier.EARLY,
    validate: (value: number) => Number.isInteger(value) && value % 7 === 0,
  },

  // Mid-game tests
  {
    id: 'is-prime',
    name: 'Must be a prime number',
    description: 'The number must only be divisible by 1 and itself',
    tier: Tier.MID,
    validate: (value: number) => {
      if (!Number.isInteger(value) || value < 2) return false;
      if (value === 2) return true;
      if (value % 2 === 0) return false;
      for (let i = 3; i <= Math.sqrt(value); i += 2) {
        if (value % i === 0) return false;
      }
      return true;
    },
  },
  {
    id: 'is-perfect-square',
    name: 'Must be a perfect square',
    description: 'The number must be the square of an integer (e.g., 4, 9, 16)',
    tier: Tier.MID,
    validate: (value: number) => {
      if (value < 0 || !Number.isInteger(value)) return false;
      const sqrt = Math.sqrt(value);
      return Number.isInteger(sqrt);
    },
  },
  {
    id: 'digit-sum-greater-10',
    name: 'Digit sum must be greater than 10',
    description: 'The sum of all digits must exceed 10',
    tier: Tier.MID,
    validate: (value: number) => {
      const digits = Math.abs(value).toString().replace('.', '').split('');
      const sum = digits.reduce((acc, d) => acc + parseInt(d, 10), 0);
      return sum > 10;
    },
  },
  {
    id: 'digit-sum-divisible-by-3',
    name: 'Digit sum must be divisible by 3',
    description: 'The sum of all digits must be divisible by 3',
    tier: Tier.MID,
    validate: (value: number) => {
      const digits = Math.abs(value).toString().replace('.', '').split('');
      const sum = digits.reduce((acc, d) => acc + parseInt(d, 10), 0);
      return sum % 3 === 0;
    },
  },
  {
    id: 'contains-digit-7',
    name: 'Must contain the digit 7',
    description: 'The number must have at least one 7 in it',
    tier: Tier.MID,
    validate: (value: number) => value.toString().includes('7'),
  },
  {
    id: 'contains-digit-3',
    name: 'Must contain the digit 3',
    description: 'The number must have at least one 3 in it',
    tier: Tier.MID,
    validate: (value: number) => value.toString().includes('3'),
  },
  {
    id: 'is-palindrome',
    name: 'Must be a palindrome',
    description: 'The number must read the same forwards and backwards',
    tier: Tier.MID,
    validate: (value: number) => {
      const str = Math.abs(value).toString();
      return str === str.split('').reverse().join('');
    },
  },
  {
    id: 'no-repeating-digits',
    name: 'Must have no repeating digits',
    description: 'Each digit can only appear once',
    tier: Tier.MID,
    validate: (value: number) => {
      const digits = Math.abs(value).toString().replace('.', '').split('');
      return new Set(digits).size === digits.length;
    },
  },
];

export function getInitialTest(): Test {
  return allTests[0]; // "Must be a number"
}

export function getAvailableTests(): Test[] {
  return allTests.slice(1); // All tests except the first one
}
