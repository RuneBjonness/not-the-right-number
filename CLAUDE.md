# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Not The Right Number" is a browser-based number puzzle game inspired by "The Password Game". Players enter numbers that must satisfy an evolving set of rules. When a number passes all current tests, a new test is added that the current input fails. The goal is to pass as many tests as possible before giving up.

## Tech Stack

- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Persistence:** Local storage (high scores, progress)

## Common Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests (if configured)
```

## Game Architecture

### Core Game Loop

1. Player enters a number
2. Number is validated against all active tests
3. If all tests pass: select a new test from the pool that the current input fails, add it to active tests
4. If any test fails: display which tests failed
5. Game ends when player gives up; score = number of tests passed

### Test System

The base rule constrains all numbers to integers 1–999,999. Tests are organized by tier:

**Early Game (Basic Properties)** — ~17 rules

- Even/odd, parity of last digit
- Greater/less than thresholds
- Divisibility rules (3, 5, 7, 11, NOT 4)
- Digit count constraints

**Mid Game (Mathematical & Digit-based)** — ~20 rules

- Prime numbers, perfect squares, Harshad numbers
- Digit sum requirements (even/odd, divisible by 3, > 10)
- Contains/excludes specific digits, palindrome, no repeating digits
- Consecutive digits, repeated pairs, digit product, first-digit constraints
- Exact digit count (3, 4, or 5 digits)

**Late Game (Complex Constraints)** — ~10 rules

- Fibonacci, triangular, perfect cube, power of 2
- Ascending/descending digits, alternating parity
- First = last digit, all-prime digits, first+last > 10

### Key Components

- `src/components/NumberInput.tsx`: Calculator-style input with 6-digit limit
- `src/components/TestList.tsx`: Stacked list showing all active tests with pass/fail indicators
- `src/engine/gameEngine.ts`: Core logic for validating input and selecting new tests
- `src/engine/tests.ts`: ~47 test definitions organized by tier (EARLY, MID, LATE)
- `src/engine/ruleCompatibility.ts`: Exclusion pairs and valid-number counting
- `src/engine/types.ts`: TypeScript types for Test, GameState, TestResult
- `src/hooks/useGameState.ts`: Game state management hook

### Test Selection Strategy (Fairness Engine)

When adding a new test, the engine:

1. Filters available tests to those the current input fails
2. Applies tier progression (EARLY → MID at 5 rules → LATE at 10 rules)
3. Rejects rules that violate exclusion pairs (e.g., even+odd, prime+even)
4. **Single-pass scoring:** scans 1–999,999 once to count how many valid answers remain for each candidate rule
5. Rejects any candidate that would leave 0 valid numbers (impossible state)
6. Prefers candidates from the upper half by valid count (keeps game playable)
7. Shows remaining valid-number count to the player

## Visual Theme

The game uses a **classroom blackboard** inspired aesthetic with realistic chalk text effects.

### Chalkboard Background
- Dark green base color (`#2a3c2a`)
- SVG fractal noise filter for grainy surface texture
- Chalk dust smudges (horizontal swipes like eraser marks)
- Vignette effect darkening the edges

### Chalk Text Effects
Implemented via SVG filters in `index.html`:

- **`#chalk`** (body text, input, buttons): Grainy texture, softened edges, subtle dust halo
- **`#chalk-strong`** (headers, score): Edge displacement for wobble, harsher grain, larger glow

Chalk text characteristics replicated:
- Grainy, dusty appearance (not solid color)
- Soft/fuzzy edges with dust halo
- Slight wobble/imperfection on large text
- Off-white color (`#e8e8d8`)

### CSS Classes
- `.chalk-text` - Standard chalk effect for body text
- `.chalk-text-strong` - Pronounced effect for headers
- `.chalk-glow` - Extra glow for score/emphasis
- `.chalk-input` - Large chalky input field
- `.chalk-button` - Dashed border, chalk-filtered buttons

### Typography
- **Font:** "Indie Flower" (Google Fonts) - handwritten style
- **Colors:**
  - Chalk white: `#e8e8d8`
  - Chalk green (pass): `#7cb987`
  - Chalk red (fail): `#e07a7a`
  - Chalk yellow (score): `#e8d174`
  - Chalk blue (primary actions): `#7ab8d4`
