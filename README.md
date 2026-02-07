# Not The Right Number

A simple browser-based number puzzle game. Enter a number that satisfies all the rules — but every time you succeed, a new rule is added that your number breaks. Can you find the right number?

## Features

### Three Difficulty Levels

- **Easy** (1–999), **Normal** (1–9,999), and **Hard** (1–999,999)
- Score multipliers increase with difficulty (1x / 1.5x / 2x)
- Each difficulty has its own high score and a win condition to chase

### ~47 Rules Across Three Tiers

Rules progress from basic properties (even/odd, divisibility) through mathematical puzzles (primes, digit sums, palindromes) to complex constraints (Fibonacci, ascending digits, alternating parity). The game engine ensures every new rule still leaves valid answers.

### Time-Based Scoring

Points decay the longer you take per rule, with penalties for wrong answers and bonuses for harder constraints. Beat the win threshold to earn a 1.5x win bonus.

### Brag & Challenge Friends

Share your scores via a link. Recipients see a side-by-side comparison across all three difficulties and can save challenges locally.

### Interactive Tutorial

A step-by-step guided walkthrough highlights each part of the UI and walks new players through their first move.

## Development

```bash
npm install      # Install dependencies
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```
