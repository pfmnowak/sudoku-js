import { ALL_DIGITS, CELL_COUNT, EMPTY, boxOf, colOf, digitBit, rowOf, type Grid } from './board';

const ROW_OF = Array.from({ length: CELL_COUNT }, (_, i) => rowOf(i));
const COL_OF = Array.from({ length: CELL_COUNT }, (_, i) => colOf(i));
const BOX_OF = Array.from({ length: CELL_COUNT }, (_, i) => boxOf(i));

const BIT_COUNT = Array.from({ length: ALL_DIGITS + 1 }, (_, mask) => {
  let count = 0;
  for (let m = mask; m; m &= m - 1) {
    count++;
  }
  return count;
});

/**
 * Backtracking search state: the working grid plus, for every row, column and box,
 * a mask of the digits already used in it.
 */
type SearchState = {
  grid: Grid;
  rows: Uint16Array;
  cols: Uint16Array;
  boxes: Uint16Array;
};

/** Builds the search state, or returns `null` when the grid already breaks a sudoku rule. */
const initState = (input: Grid): SearchState | null => {
  const state: SearchState = {
    grid: Uint8Array.from(input),
    rows: new Uint16Array(9),
    cols: new Uint16Array(9),
    boxes: new Uint16Array(9)
  };
  for (let i = 0; i < CELL_COUNT; i++) {
    const value = state.grid[i];
    if (value === EMPTY) {
      continue;
    }
    const bit = digitBit(value);
    if ((state.rows[ROW_OF[i]] | state.cols[COL_OF[i]] | state.boxes[BOX_OF[i]]) & bit) {
      return null;
    }
    state.rows[ROW_OF[i]] |= bit;
    state.cols[COL_OF[i]] |= bit;
    state.boxes[BOX_OF[i]] |= bit;
  }
  return state;
};

/**
 * Depth-first search that always branches on the empty cell with the fewest candidates.
 * Stops once `limit` solutions are found; the first one is copied into `firstSolution`.
 * @returns number of solutions found, capped at `limit`
 */
const search = (
  state: SearchState,
  limit: number,
  firstSolution: { grid: Grid | null }
): number => {
  const { grid, rows, cols, boxes } = state;
  let bestIndex = -1;
  let bestCandidates = 0;
  let bestCount = 10;

  for (let i = 0; i < CELL_COUNT; i++) {
    if (grid[i] !== EMPTY) {
      continue;
    }
    const candidates = ALL_DIGITS & ~(rows[ROW_OF[i]] | cols[COL_OF[i]] | boxes[BOX_OF[i]]);
    const count = BIT_COUNT[candidates];
    if (count === 0) {
      return 0;
    }
    if (count < bestCount) {
      bestIndex = i;
      bestCandidates = candidates;
      bestCount = count;
      if (count === 1) {
        break;
      }
    }
  }

  if (bestIndex === -1) {
    firstSolution.grid ??= Uint8Array.from(grid);
    return 1;
  }

  const row = ROW_OF[bestIndex];
  const col = COL_OF[bestIndex];
  const box = BOX_OF[bestIndex];
  let found = 0;

  for (let remaining = bestCandidates; remaining && found < limit; remaining &= remaining - 1) {
    const bit = remaining & -remaining;
    grid[bestIndex] = 32 - Math.clz32(bit);
    rows[row] |= bit;
    cols[col] |= bit;
    boxes[box] |= bit;
    found += search(state, limit - found, firstSolution);
    rows[row] &= ~bit;
    cols[col] &= ~bit;
    boxes[box] &= ~bit;
  }
  grid[bestIndex] = EMPTY;
  return found;
};

/**
 * Counts the solutions of a grid, stopping early at `limit`.
 * With the default `limit` of 2 the answer is enough to tell "none", "unique" and "several" apart.
 * A grid that already contains a conflict has 0 solutions.
 */
export const countSolutions = (grid: Grid, limit = 2): number => {
  const state = initState(grid);
  return state ? search(state, limit, { grid: null }) : 0;
};

/** True when the grid has exactly one solution — the requirement for a proper sudoku puzzle. */
export const hasUniqueSolution = (grid: Grid): boolean => countSolutions(grid, 2) === 1;

/** Returns a solution of the grid (the first one found), or `null` when there is none. Does not mutate the input. */
export const solve = (grid: Grid): Grid | null => {
  const state = initState(grid);
  if (!state) {
    return null;
  }
  const firstSolution: { grid: Grid | null } = { grid: null };
  search(state, 1, firstSolution);
  return firstSolution.grid;
};
