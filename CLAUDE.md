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

### App Flow

Welcome Screen → (optional Tutorial) → Countdown → Game → Game Over → back to Welcome

Additional overlays: Tutorial (step-by-step walkthrough), Incoming Challenge modal (URL-based)

### Core Game Loop

1. Player picks a difficulty (Easy/Normal/Hard) and starts the game
2. A 3-2-1 countdown plays, then the scoring timer begins
3. Player enters a number; it's validated against all active rules
4. If all rules pass: a new rule is selected that the current input fails
5. If any rule fails: failed rules are highlighted
6. Reaching the win threshold triggers a "Must be X" final rule; solving it wins the game
7. Player can give up at any time; final score is shown on the game-over screen

### Difficulty System (`src/engine/difficulty.ts`)

| Level  | Range      | Win at | Multiplier |
|--------|-----------|--------|------------|
| Easy   | 1–999     | 4 rules | 1x        |
| Normal | 1–9,999   | 10 rules | 1.5x     |
| Hard   | 1–999,999 | 25 rules | 2x       |

Each difficulty excludes rules that don't make sense for its range.

### Scoring (`src/engine/scoring.ts`, `src/hooks/useScoreTimer.ts`)

- Base points per level: `20 + level × 10`, decaying over time
- Wrong-answer penalty: points halved
- Difficulty bonus based on constraint elimination ratio
- Win bonus: 1.5x on final score

### Test System (`src/engine/tests.ts`)

~47 rules in three tiers (EARLY → MID at 5 rules → LATE at 10 rules). The fairness engine (`src/engine/gameEngine.ts`, `src/engine/ruleCompatibility.ts`) ensures every new rule leaves valid answers by scanning the number range, rejecting incompatible rule pairs, and preferring rules that keep the game playable.

### Key Source Files

**Engine:**
- `src/engine/gameEngine.ts` — Rule validation, selection, fairness scoring
- `src/engine/tests.ts` — Rule definitions by tier
- `src/engine/ruleCompatibility.ts` — Exclusion pairs, valid-number counting/caching
- `src/engine/difficulty.ts` — Difficulty config (ranges, multipliers, win thresholds)
- `src/engine/scoring.ts` — Point calculations
- `src/engine/types.ts` — Core TypeScript types
- `src/engine/bragCodec.ts` — Encode/decode challenge URLs

**Components:**
- `src/App.tsx` — Screen routing and state orchestration
- `src/components/WelcomeScreen.tsx` — Difficulty picker, high scores, animated title
- `src/components/NumberInput.tsx` — Calculator-style input
- `src/components/TestList.tsx` — Active rules with pass/fail indicators
- `src/components/ScoreDisplay.tsx` — Live score and timer
- `src/components/GameOverScreen.tsx` — Results, remaining valid numbers grid
- `src/components/BragScreen.tsx` — Share scores, manage challenges
- `src/components/IncomingChallengeModal.tsx` — Compare scores from a challenge URL
- `src/components/TutorialOverlay.tsx` — Step-by-step tutorial overlay
- `src/components/Countdown.tsx` — 3-2-1 animated countdown

**State:**
- `src/hooks/useGameState.ts` — Game state management
- `src/hooks/useScoreTimer.ts` — Time-based scoring hook
- `src/stores/highScoreStore.ts` — Per-difficulty high scores and solved status (Zustand + localStorage)
- `src/stores/bragStore.ts` — Player name and saved challenges (Zustand + localStorage)
- `src/tutorial/tutorialSteps.ts` — Tutorial step definitions

## Visual Theme

Dark charcoal chalkboard aesthetic with chalk text effects. SVG filters (`#chalk`, `#chalk-strong`) in `index.html` create the grainy/dusty look. Font: "Indie Flower" (Google Fonts).

**CSS classes:** `.chalk-text`, `.chalk-text-strong`, `.chalk-glow`, `.chalk-input`, `.chalk-button`

**Color palette:** white `#e8e8d8`, green/pass `#7cb987`, red/fail `#e07a7a`, yellow/score `#e8d174`, blue/action `#7ab8d4`
