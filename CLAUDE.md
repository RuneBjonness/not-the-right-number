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

Tests are organized by category and difficulty progression:

**Early Game (Basic Properties)**

- Even/odd, positive/negative
- Greater than X, between ranges
- Divisibility rules
- Digit count constraints

**Mid Game (Mathematical & Digit-based)**

- Prime numbers, perfect squares, Fibonacci
- Digit sum requirements
- Contains specific digit, palindrome, ascending/descending digits

**Late Game (Comparison & Expressions)**

- Input as mathematical expression (e.g., "12+5")
- Rules from early game and mid game - but this time each operand must satisfy individual tests (while the result of the expression must still satisfy the existing tests)

### Key Components

- `src/components/NumberInput.tsx`: Main input field with submit button
- `src/components/TestList.tsx`: Stacked list showing all active tests with pass/fail indicators
- `src/engine/gameEngine.ts`: Core logic for validating input and selecting new tests
- `src/engine/tests.ts`: Test definitions organized by tier (EARLY, MID, LATE)
- `src/engine/types.ts`: TypeScript types for Test, GameState, TestResult
- `src/hooks/useGameState.ts`: Game state management hook

### Test Selection Strategy

When adding a new test, the engine must:

1. Filter available tests to those the current input fails
2. Consider difficulty progression (don't add late-game tests too early)
3. Avoid contradictory test combinations that make the game impossible

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
