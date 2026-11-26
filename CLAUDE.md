# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Sudoku game being migrated from a vanilla JS/SASS app (kept for reference in `_old/`, not part of the build) to Vue 3 + TypeScript + Vite, with Pinia for state and Vue Router. There is no UI library: controls are plain elements, icons are `@mdi/js` path strings rendered by `components/base/AppIcon.vue` / `IconButton.vue`, the end-game modal is a native `<dialog>`, and the dark palette lives as CSS variables in `src/assets/main.css`. `ToDo.txt` lists the planned pages and features (leaderboard, scores, auth, local storage/DB persistence, i18n, PWA); the Leaderboard and Scores views are still placeholders.

**Planned rewrite:** [`docs/REWRITE_PLAN.md`](docs/REWRITE_PLAN.md) holds the analysis of the current app and the agreed direction — rebuild from scratch on Vue 3 + TS + Vite + Pinia without Vuetify, with a framework-free `src/engine/` (solver, generator, difficulty grader, puzzle transforms), split stores with localStorage persistence, CSS Grid board and CSS-variable themes. Auth, a database and a global leaderboard are dropped. It supersedes `ToDo.txt` where they disagree. The architecture below describes the rewrite as it stands.

## Commands

npm is the package manager (`package-lock.json`).

- `npm run dev` — Vite dev server
- `npm run build` — type-check (`vue-tsc --build --force`) and `vite build` in parallel
- `npm run type-check` — type-check only
- `npm run test:unit` — Vitest in watch mode (jsdom environment); single file: `npx vitest run src/components/__tests__/HelloWorld.spec.ts`; single test: add `-t "<test name>"`
- `npm run lint` — ESLint **with `--fix`** (rewrites files)
- `npm run format` — Prettier over `src/`

Unit tests live in `src/**/__tests__/` and are excluded from the app tsconfig (covered by `tsconfig.vitest.json`). Vitest runs two projects: `engine` (node env, `src/engine/**`) and `ui` (jsdom, everything else).

## Code style

Prettier: single quotes, semicolons, 2-space indent, print width 100, no trailing commas. ESLint additionally enforces `semi: always` and `curly: error` (braces on every `if`). Components use `<script setup lang="ts">` and scoped SCSS; import from `src` via the `@/` alias.

## Architecture

**Engine** (`src/engine/`, framework-free, tested in a node-env Vitest project): `board.ts` (grid as `Uint8Array(81)`, `0` = empty; givens; notes as 9-bit masks; unit/peer tables; `parseGrid`/`serializeGrid`; `findConflicts`), `solver.ts` (bitmask solver, `countSolutions` stops at a limit), `transform.ts` (difficulty-preserving transforms) and `puzzles.ts` (the 100-puzzle bank from `data/puzzles.json`; `getPuzzle(level, rand)` returns a randomly transformed bank entry). Randomness is always an injectable `rand: () => number`.

**State:** `useGameStore` in `src/stores/game.ts` holds the board (`cells`/`givens`/`notes` in `shallowRef`s — typed arrays are not deeply reactive, so every change replaces the array), selection (`selectedCell: number | null`, `selectedDigit` where `0` is the eraser), `notesMode`, `status` (`idle | playing | paused | won`), undo/redo as `history`/`future` lists of multi-cell moves, and the clock as `elapsedMs` + `startedAt` (read with `elapsedAt(now)`). All input goes through store actions (`pressCell`, `pressDigit`, `placeDigit`, `erase`, `toggleNote`, `input`, `moveSelection`, `undo`, `redo`, `restart`), which ignore givens and non-`playing` states; win detection happens in the store. The store saves itself to `localStorage` (`sudoku:game`, versioned) on every change and restores on creation, always as `paused`.

Game flow across views:

1. `NewGameView` calls `store.newGame(difficulty)` and navigates to `/game`.
2. `GameView` redirects home when there is no game; `useGameClock` resumes the game on mount, pauses it on unmount and on `visibilitychange`, and ticks the displayed time; `useGameKeyboard` adds keyboard play (arrows, 1–9, Shift+digit for a note, Backspace/Delete, N, Escape, Ctrl+Z/Ctrl+Y) and ignores keys while a `<dialog>` is open. Restart asks first through `base/ConfirmDialog`. `HomeView` shows "Continue" only while `store.isInProgress`.
3. Input: cell-first (tap a cell, then a `NumberPad` digit) and digit-first (with no cell selected, tap a digit or the eraser to pick it, then tap cells). `store.pressCell`/`store.pressDigit` hold that logic.
4. `EndGameDialog` opens on the `playing → won` transition.

`GameBoard` is a 9×9 CSS Grid (`role="grid"`, rows as `display: contents`) sized by `--board-size` with fonts in `cqi`; `BoardCell` buttons use a roving tabindex and shade the selected cell's row/column/box, cells with the highlighted digit and conflicts, and draw notes as a 3×3 mini-grid. `NumberPad` shows remaining counts per digit plus erase/undo/redo/notes; `GameView` puts it beside the board on wide landscape screens (`--pad-columns: 3`) and below it otherwise.

