# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Sudoku game being migrated from a vanilla JS/SASS app (kept for reference in `_old/`, not part of the build) to Vue 3 + TypeScript + Vite, with Pinia for state, Vue Router, and Vuetify 3 (MDI icons, dark theme by default). `ToDo.txt` lists the planned pages and features (leaderboard, scores, auth, local storage/DB persistence, i18n, PWA); the Leaderboard and Scores views are still placeholders.

**Planned rewrite:** [`docs/REWRITE_PLAN.md`](docs/REWRITE_PLAN.md) (in Polish) holds the analysis of the current app and the agreed direction — rebuild from scratch on Vue 3 + TS + Vite + Pinia without Vuetify, with a framework-free `src/engine/` (solver, generator, difficulty grader, puzzle transforms), split stores with localStorage persistence, CSS Grid board and CSS-variable themes. It supersedes `ToDo.txt` where they disagree. The architecture described below is the current (pre-rewrite) state.

## Commands

npm is the package manager (`package-lock.json`).

- `npm run dev` — Vite dev server
- `npm run build` — type-check (`vue-tsc --build --force`) and `vite build` in parallel
- `npm run type-check` — type-check only
- `npm run test:unit` — Vitest in watch mode (jsdom environment); single file: `npx vitest run src/components/__tests__/HelloWorld.spec.ts`; single test: add `-t "<test name>"`
- `npm run lint` — ESLint **with `--fix`** (rewrites files)
- `npm run format` — Prettier over `src/`

Unit tests live in `src/**/__tests__/` and are excluded from the app tsconfig (covered by `tsconfig.vitest.json`). The only existing test is the scaffold's `HelloWorld.spec.ts`.

## Code style

Prettier: single quotes, semicolons, 2-space indent, print width 100, no trailing commas. ESLint additionally enforces `semi: always` and `curly: error` (braces on every `if`). Components use `<script setup lang="ts">` and scoped SCSS; import from `src` via the `@/` alias.

## Architecture

All game state lives in a single Pinia setup store, `useGameStateStore` in `src/store.ts`. It holds:

- the puzzle bank (`data`): hardcoded `[puzzle, solution]` string pairs per difficulty (`beginner`, `easy`, `medium`, `hard`, `master`). Puzzles are 81-char strings with `-` for empty cells; solutions are 81 digits.
- board state: `initialBoard` / `solution` (strings), `currentBoard` (`Cell[]` of `{ value, disabled }`, where `disabled` marks given clues)
- selection state: `selectedDigitOption`, `highlightedValue`, `selectedCell` (cell index stored as a **string**), `disableSelect` (locks input after a win)
- the timer (`timer` seconds + `startTimer`/`stopTimer`/`resetTimer`, backed by a module-level `setInterval`) and `endGameModalOpen`

Game flow across views:

1. `NewGameView` picks a random puzzle for the chosen difficulty, writes `initialBoard`/`solution` to the store, and navigates to `/game?mode=new`.
2. `GameView` reads `route.query.mode` on mount: `new` builds `currentBoard` from `initialBoard` and restarts the timer; `resume` just restarts the timer on the existing board. The timer is stopped on unmount, which is how "pause" works.
3. Input: clicking a `DigitOption` (1–9, or `X` to erase) selects/highlights a digit; clicking a `SudokuCell` then writes it via the `selectCell` callback passed down from `BoardTable`. With no digit selected, clicking a cell toggles highlighting of its value.
4. Win detection is in `SudokuCell`: after each placement it compares the joined `currentBoard` values to `solution`; on a match it stops the timer, locks input, and opens `EndGameDialog`.

`BoardTable` renders the 9×9 grid as three `<tbody>` row groups of three rows to draw the 3×3 box borders, mapping (group, row, cell) to a flat index 0–80. The game components' SCSS still carries commented-out variables/mixins from `_old/sass` (e.g. `respond(tab-port)`), which have not been ported.
