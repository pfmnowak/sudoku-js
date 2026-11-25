# Sudoku — App Assessment and Rewrite Plan

## Context

Project: Sudoku (vanilla JS + SCSS → Vue 3 + TS + Vite + Pinia + Vuetify; assessed on `develop` after merging
`feature/vue-app-migration`, November 2026).
Product goal: a responsive game (desktop + phone) with several difficulty levels, many distinct puzzles, and themes.
Question asked: an honest review of the code, architecture and functionality, plus a decision on whether to rewrite
from scratch or keep building on what exists.

Method: read all of `src/` and compared it with `_old/`, ran `vue-tsc`, and wrote a script that checks the puzzle
bank (consistency with the solution, uniqueness of the solution, clue counts).

---

## 1. Current state in numbers

- About 400 lines of actual logic (excluding data and scaffold). The game is 6 components + 1 store.
- Puzzle bank: **100 puzzles** (20 per level), hardcoded in `src/store.ts`.
- **`npm run build` fails** — type error in `NumberContainer.vue:3` (`index.toString()` is a `string`, while the
  prop expects `Cell['value']`).
- Tests: only the scaffold's `HelloWorld.spec.ts`.

## 2. Strengths (real ones)

- **The puzzle data is correct**: each of the 100 puzzles matches its solution and has **exactly one solution**
  (verified with a solver), with no duplicates. This is the only part worth carrying over as-is.
- Sensible stack: Vue 3 `<script setup>`, TS, Pinia setup store, lazy-loaded routes, ESLint + Prettier.
- The game flow is simple and easy to follow (NewGame → Game?mode=new/resume → win → dialog).
- Pausing via `onUnmounted` + a timer in the store — a simple idea that works.
- The old version had well-structured SCSS (7-1 architecture, responsive `font-size` on `html`) — a good source of
  visual patterns.

## 3. Functional bugs (things that simply don't work as intended)

1. **The build fails** (TS error, see above).
2. **Responsiveness is broken, not just "unfinished".** The old app set `html { font-size: 62.5% }` (1rem = 10px)
   and scaled it with breakpoints. The Vue app doesn't (`base.css` sets `font-size: 15px` on `body`), so
   1rem = 16px: a `6rem` cell is 96px → the board is ~870px wide, the numpad 560px, the toolbar has
   `padding: 5rem 10rem`. The game is unplayable on a phone and cramped on a small laptop. The `respond()` mixin is
   commented out and the "mobile" styles are hardcoded.
3. **Refreshing the page loses the game.** There is no persistence at all; after F5, `/game?mode=new` renders an
   empty board (`initialBoard === ''`).
4. **"Resume a Game" is always visible** (`const gameStarted = true` in `HomeView.vue`) — without a started game it
   shows an empty board.
5. **Resuming after a win restarts the timer** on a solved, locked board.
6. **The "restart" button (`mdi-restore`) does the same as "back"** — it navigates to `/`.
7. Clicking: a second click on the same cell only deselects it instead of placing the digit; clicking an empty cell
   with no digit selected sets `highlightedValue = ''`, which gives the `highlighted` class to every empty cell
   (invisible, but it says something about the state model).
8. `EndGameDialog`: "1 minutes", "1 hours"; no "new game / back to menu" actions.
9. The home page is still the Vite scaffold: `HelloWorld` with "You've successfully created a project with Vite +
   Vue 3. What's next?".
10. Footer: "© 2022" and a link to the `sudoku-js` repo.

## 4. Missing features relative to what a sudoku game needs

Missing pieces that are standard in any sudoku app today and that **drive the architecture**:
- **notes (pencil marks)** — without them the hard levels are practically unplayable,
- **undo/redo**,
- **conflict/mistake highlighting** (at least as an option),
- **keyboard support** (arrows, 1–9, Backspace) and a "cell first, then digit" input mode (currently only
  "digit first" works),
- highlighting of the selected cell's row/column/box, a remaining-count per digit,
- themes — **they don't exist**; there is Vuetify's forced dark theme + the scaffold's light/dark variables
  (`prefers-color-scheme`) + hardcoded colors in SCSS. Three independent color systems that clash.

## 5. Puzzle variety and difficulty — the biggest conceptual weakness

- 20 puzzles per level → repeats start after ~20 games (random picks without history repeat even sooner).
- **Difficulty is measured only by clue count, and inconsistently**: beginner 57, easy 43–44, medium 33–35,
  **hard 23–31, master 22–32 (identical average: 25.8)**. "Master" is not harder than "hard". Clue count correlates
  poorly with real difficulty — what matters is which solving techniques are required.
- The data lives in a reactive `ref` in the store (needless reactivity and bundle cost).

## 6. Architecture and code quality

- **Game logic lives in view components**: win detection in `SudokuCell`, board construction in `GameView`, puzzle
  picking in `NewGameView`. There is no domain layer that could be tested without the DOM.
- **The store is a god object**: puzzle bank + board state + selection UI state + timer + modal state.
- The data model is ad hoc: `Cell['value']` mixes `''`, `'-'` and `'X'` (the "erase" UI action stored as a cell
  value), `selectedCell` is the index as a **string**, the board is compared by `join('')`-ing strings.
- **Functions passed as props** (`getCellValue`, `selectCell`) — a React pattern; idiomatic Vue uses `emit` or store
  actions directly. On top of that the cell reads the store directly anyway — two channels for the same data.
- `<table>` with `display: flex` at every level — it loses table semantics without gaining a grid; cells are `div`s
  with `@click` (no focus, no keyboard, no ARIA).
- The timer counts `setInterval` ticks instead of measuring time from a timestamp — drift, no pausing when the tab is
  hidden.
- **Vuetify**: *all* components and directives are imported (`vuetify.ts`), while 4–5 are used (btn-toggle, btn,
  dialog, card, icon). `v-responsive` wraps `v-app` (it should be the other way round), inline styles in `App.vue`.
  For a game with custom themes, Vuetify gets in the way more than it helps.
- Dead code / scaffold: `HelloWorld`, `icons/*`, `logo.svg`, `sprite.svg`, commented-out SCSS variables.
- Dependencies from mid-2024: ESLint 8 (legacy config, EOL), Vite 5, Vitest 1, TS 5.4 — an upgrade would be needed
  anyway.

## 7. Verdict: rewrite or continue?

**Rewrite from scratch, in the same repo (new branch), staying with Vue 3 + TS + Vite + Pinia.**

Rationale:
- There is so little code that "continuing" saves nothing — and every missing feature (notes, undo, persistence,
  keyboard, themes, generator) needs a different data model than the current one. A refactor would touch 100% of the
  files.
- Worth keeping: **the bank of 100 puzzles** (as seed/fallback data), the color palette and layout from the old SCSS,
  the overall screen flow.
- No need to switch frameworks — Vue is fully adequate here.
- **Vuetify — recommended to remove.** The game needs 3–4 simple controls and full control over the look for
  theming; custom components + CSS custom properties will be simpler and lighter. (If a Material look in the menus is
  preferred, it can stay with `vite-plugin-vuetify` for tree-shaking, but that is a compromise.)

## 8. Target design

### 8.1 Domain layer — `src/engine/` (plain TS, no Vue, covered by tests)
- `board.ts` — board as `Uint8Array(81)` (0 = empty), a givens mask, notes as a 9-bit mask per cell;
  row/column/box helpers, `findConflicts()`.
- `solver.ts` — a fast bitmask solver that counts solutions (stops at 2) → uniqueness check.
- `generator.ts` — random full grid → remove cells (symmetrically) while the solution stays unique.
- `grader.ts` — a **human-style solver** with techniques (naked/hidden singles, pairs/triples, pointing/box-line,
  X-Wing, …); level = hardest technique required + number of steps. This is what actually separates hard from master.
- `transform.ts` — **difficulty-preserving transforms**: digit permutation (9!), swapping rows within bands and
  swapping bands, the same for columns and stacks, transposition. One puzzle yields billions of visually different
  ones — an immediate way to get variety from the existing 100 puzzles, even before the generator exists.
- Hard puzzles are generated in a **Web Worker** (it can take hundreds of ms); fallback = a transformed puzzle from
  the bank.
- **Nice to have — seeded RNG** (`rng.ts`, e.g. mulberry32): a tiny PRNG where the same seed always yields the same
  sequence of numbers. If the generator and transforms draw randomness from it instead of `Math.random()`, a puzzle
  is fully determined by `{ seed, difficulty }`. That enables replaying the same game, a "daily puzzle" (seed derived
  from the date — everyone gets the same board, no server needed), sharing a puzzle via a link
  (`/game?seed=12345&level=hard`) and reproducing bugs. Not required for the MVP, but the generator and transforms
  should accept a `rand` function as a parameter from the start, so adding it later needs no rework.

### 8.2 State — Pinia, split by responsibility
- `useGameStore`: board, notes, givens, undo/redo history (a list of moves), selection (`number | null`), notes mode,
  status (`playing | paused | won`), time as `elapsedMs + startedAt`.
- `useSettingsStore`: theme, mistake highlighting, highlight options, auto-removal of notes.
- `useStatsStore`: results per level (best/average time, games played, streak).
- Persistence in `localStorage` (a custom `watch` or `pinia-plugin-persistedstate`) → resume also works after F5 and
  after closing the browser; "Resume" is shown only when a game is in progress.

### 8.3 UI
- Board as a **9×9 CSS Grid**, sized `min(94vw, 70dvh)` + `aspect-ratio: 1`, font in `cqi` (container queries) —
  scales smoothly from phone to monitor.
- Layout: numpad beside the board on wide screens, below it on narrow ones; buttons at least 44px (touch).
- Input: both cell-first **and** digit-first, full keyboard support, notes toggle, undo, erase.
- Cells as `button`/`role="gridcell"` with a roving tabindex — accessibility comes almost for free with keyboard
  support.
- **Themes via CSS custom properties** on `[data-theme="…"]` (e.g. light, dark, sepia/paper, high-contrast); the
  default follows `prefers-color-scheme`. One color system instead of three.
- Screens: Home (Continue / New game / Stats / Settings), difficulty picker, Game, Stats, Settings.

### 8.4 Scope
- **In scope (MVP):** engine + transforms + generator with grading, notes, undo, conflicts, keyboard, persistence,
  responsiveness, themes, local stats.
- **Later:** PWA (`vite-plugin-pwa` — offline sudoku is an ideal fit), PL/EN i18n (`vue-i18n`), deploy to GitHub
  Pages.
- **Nice to have:** seeded RNG with daily puzzle and shareable puzzle links (see 8.1).
- **Dropped (decided):** login/auth, a database and a global leaderboard. They would require a backend (e.g.
  Supabase), and client-submitted scores are trivial to fake — high cost, little value for a single-player game.
  Local stats cover the real need. The Leaderboard view and the auth/DB items in `ToDo.txt` are out of scope.

### 8.5 Tooling
- Current versions of Vite / Vitest / TS / vue-tsc, ESLint 9 (flat config).
- Unit tests mainly for `engine/` (solver, generator, grader, transforms, conflicts) — that is where the risk is and
  where tests pay off most; a few component tests; optionally Playwright for a single "solve a puzzle" scenario.
- Remove the scaffold (`HelloWorld`, `icons/`, `base.css` with the Vue theme) and Vuetify.

## 9. Order of work

All work happens on `feature/sudoku-rewrite`. Tick items off as they land.

### 9.1 Branch, tooling, cleanup
- [x] Create the `feature/sudoku-rewrite` branch
- [x] Remove the Vite scaffold (`HelloWorld` + its test, `icons/`, `logo.svg`, `base.css`, `leaves.jpg`), replace the
      scaffold home header, fix the `NumberContainer` build error
- [x] Remove Vuetify — native elements, `@mdi/js` icons via `AppIcon` / `IconButton`, native `<dialog>`
- [x] Upgrade Vue, Vite, Vitest, TS, vue-tsc; migrate to ESLint flat config
- [x] Remove the remaining leftovers (`src/assets/sprite.svg`, commented-out SCSS from `_old/`)

### 9.2 Engine — board and solver
- [x] `src/engine/` skeleton with a Vitest setup for framework-free tests
- [x] Move the 100-puzzle bank to `src/engine/data/puzzles.json` (out of the reactive store)
- [x] `board.ts`: `Uint8Array(81)` grid, givens mask, 9-bit notes mask, row/column/box index helpers, parse/serialize
      to the 81-char string format
- [x] `findConflicts()` + tests
- [x] `solver.ts`: bitmask solver that counts solutions (stops at 2) + tests
- [x] Bank test: every puzzle matches its solution and has exactly one solution

### 9.3 Engine — transforms
- [x] `transform.ts`: digit permutation, row/column swaps within bands/stacks, band/stack swaps, transposition
- [x] All randomness taken from a `rand: () => number` parameter (ready for a seeded RNG later)
- [x] Tests: transforms preserve validity, givens count and uniqueness
- [x] `getPuzzle(level)`: random bank puzzle + random transform

### 9.4 Game store and persistence
- [x] `useGameStore`: board, notes, givens, selection (`number | null`), notes mode, status
      (`playing | paused | won`)
- [x] Actions: place digit, erase, toggle note, select cell — win detection in the store, not in components
- [ ] Undo/redo as a list of moves
- [ ] Timer as `elapsedMs + startedAt`; pause on leaving the game view and on `visibilitychange`
- [ ] Persistence in `localStorage`; restore after F5 / browser restart
- [ ] Unit tests for the store actions
- [ ] Remove the old `store.ts`

### 9.5 Game UI — playable MVP
- [ ] Board as a 9×9 CSS Grid, `min(94vw, 70dvh)` + `aspect-ratio: 1`, font in `cqi`
- [ ] Cells as buttons with `role="gridcell"` and a roving tabindex
- [ ] Highlighting: selected cell's row/column/box, same digits, conflicts
- [ ] Notes rendered as a 3×3 mini-grid in a cell
- [ ] Numpad with remaining-count per digit; erase, undo, notes toggle (≥ 44px touch targets)
- [ ] Input modes: cell-first and digit-first
- [ ] Keyboard: arrows, 1–9, Backspace/Delete, a key for notes mode, Ctrl+Z / Ctrl+Y
- [ ] Layout: numpad beside the board on wide screens, below it on narrow ones
- [ ] Home: "Continue" only when a game is in progress; difficulty picker; working "restart" action
- [ ] Check at 360×740 and 1440×900 (mouse, touch, keyboard)

### 9.6 Themes, settings, win screen, stats
- [ ] One color system: CSS custom properties on `[data-theme]` (light, dark, paper, high-contrast); default follows
      `prefers-color-scheme`
- [ ] `useSettingsStore` (persisted): theme, mistake highlighting, highlight options, auto-removal of notes
- [ ] Settings screen
- [ ] Win screen: correct pluralization of the time, "New game" / "Back to menu" actions; resuming a won game does not
      restart the timer
- [ ] `useStatsStore` (persisted): games played/won, best and average time per level, streak
- [ ] Stats screen (replaces the Scores placeholder); remove the Leaderboard view
- [ ] Footer: current year, link to this repo

### 9.7 Grader and generator
- [ ] `grader.ts`: human-style solver — naked/hidden singles, pairs/triples, pointing/box-line, X-Wing, …
- [ ] Level = hardest technique required + number of steps; tests on hand-picked puzzles
- [ ] Re-grade the 100 bank puzzles and re-assign their levels
- [ ] `generator.ts`: full grid → symmetric cell removal while the solution stays unique, graded to a target level
- [ ] Generation in a Web Worker; fallback to a transformed bank puzzle on timeout
- [ ] Rescale the difficulty levels so each one is measurably harder than the previous

### 9.8 PWA, i18n, deploy
- [ ] PWA via `vite-plugin-pwa` (offline play, install prompt, icons)
- [ ] PL/EN i18n via `vue-i18n`
- [ ] Deploy to GitHub Pages (CI workflow: lint, type-check, tests, build)
- [ ] Optional: Playwright "solve a puzzle" scenario
- [ ] Merge `feature/sudoku-rewrite` into `develop`; update `CLAUDE.md` and `README.md`; delete `ToDo.txt`

### 9.9 Nice to have
- [ ] `rng.ts` — seeded PRNG (mulberry32) wired into transforms and the generator
- [ ] Daily puzzle (seed derived from the date)
- [ ] Shareable puzzle links (`/game?seed=…&level=…`)

## Verification

- `npm run build` and `npm run type-check` pass; `npx vitest run` — engine tests green.
- Solver test: all 100 bank puzzles have exactly one solution; transforms preserve validity and uniqueness.
- `npm run dev` + browser (DevTools emulation at 360×740 and 1440×900): play a game with mouse, touch and keyboard,
  F5 mid-game → resumes, switch theme, win → stats updated.
