import {
  ALL_DIGITS,
  BOXES,
  CELL_COUNT,
  COLS,
  EMPTY,
  PEERS,
  ROWS,
  UNITS,
  boxOf,
  colOf,
  digitBit,
  rowOf,
  type Grid
} from './board';
import { DIFFICULTIES, type Difficulty } from './puzzles';

/** Solving techniques the grader knows, from easiest to hardest. */
export const TECHNIQUES = [
  'fullHouse',
  'hiddenSingleBox',
  'hiddenSingleLine',
  'nakedSingle',
  'lockedCandidates',
  'nakedPair',
  'hiddenPair',
  'nakedTriple',
  'hiddenTriple',
  'xWing',
  'nakedQuad',
  'hiddenQuad',
  'swordfish',
  'xyWing',
  'xyzWing'
] as const;

export type Technique = (typeof TECHNIQUES)[number];

/** Lowest level that allows each technique; a puzzle's level comes from its hardest one. */
const TECHNIQUE_LEVEL: Record<Technique, Difficulty> = {
  fullHouse: 'beginner',
  hiddenSingleBox: 'beginner',
  hiddenSingleLine: 'easy',
  nakedSingle: 'easy',
  lockedCandidates: 'medium',
  nakedPair: 'hard',
  hiddenPair: 'hard',
  nakedTriple: 'hard',
  hiddenTriple: 'hard',
  xWing: 'hard',
  nakedQuad: 'master',
  hiddenQuad: 'master',
  swordfish: 'master',
  xyWing: 'master',
  xyzWing: 'master'
};

/** Most empty cells a beginner puzzle may have; a longer box-singles puzzle counts as easy. */
export const BEGINNER_MAX_EMPTY = 36;

/**
 * Outcome of a human-style solve.
 * - `solved`: false when the known techniques get stuck, i.e. the puzzle needs guessing or
 *   something more advanced
 * - `hardest`: hardest technique used, `null` for an already full grid
 * - `steps`: how many times each technique was applied (one placement or one elimination round)
 * - `level`: difficulty the puzzle belongs to, `null` when not `solved`
 */
export type Grade = {
  solved: boolean;
  hardest: Technique | null;
  steps: Partial<Record<Technique, number>>;
  level: Difficulty | null;
};

const LINES = [...ROWS, ...COLS];
/** Position of a level in `DIFFICULTIES`, for comparing levels. */
export const levelRank = (level: Difficulty): number => DIFFICULTIES.indexOf(level);

const BIT_COUNT = Array.from({ length: ALL_DIGITS + 1 }, (_, mask) => {
  let count = 0;
  for (let m = mask; m; m &= m - 1) {
    count++;
  }
  return count;
});

const bitDigit = (bit: number): number => 32 - Math.clz32(bit);

/** All `size`-element subsets of `items`, in lexicographic order. */
const combinations = <T>(items: readonly T[], size: number): T[][] => {
  if (size === 0) {
    return [[]];
  }
  return items.flatMap((item, i) =>
    combinations(items.slice(i + 1), size - 1).map((rest) => [item, ...rest])
  );
};

/** Working state: the grid and, for every empty cell, a mask of its remaining candidates. */
type State = {
  grid: Grid;
  candidates: Uint16Array;
};

const createState = (puzzle: Grid): State => {
  const grid = Uint8Array.from(puzzle);
  const candidates = new Uint16Array(CELL_COUNT);
  for (let i = 0; i < CELL_COUNT; i++) {
    if (grid[i] === EMPTY) {
      candidates[i] = PEERS[i].reduce(
        (mask, peer) => (grid[peer] === EMPTY ? mask : mask & ~digitBit(grid[peer])),
        ALL_DIGITS
      );
    }
  }
  return { grid, candidates };
};

const place = ({ grid, candidates }: State, index: number, digit: number) => {
  grid[index] = digit;
  candidates[index] = 0;
  for (const peer of PEERS[index]) {
    candidates[peer] &= ~digitBit(digit);
  }
};

/**
 * Removes `mask` from the candidates of `cells`, skipping `except`.
 * @returns whether anything was removed
 */
const eliminate = (
  { candidates }: State,
  cells: Iterable<number>,
  mask: number,
  except: ReadonlySet<number> = new Set()
): boolean => {
  let changed = false;
  for (const cell of cells) {
    if (!except.has(cell) && candidates[cell] & mask) {
      candidates[cell] &= ~mask;
      changed = true;
    }
  }
  return changed;
};

const emptyCells = (state: State, unit: readonly number[]) =>
  unit.filter((cell) => state.grid[cell] === EMPTY);

/** Cells of `unit` that still have `digit` as a candidate. */
const cellsWith = (state: State, unit: readonly number[], digit: number) =>
  unit.filter((cell) => state.candidates[cell] & digitBit(digit));

/** A unit with a single empty cell. */
const fullHouse = (state: State): boolean => {
  for (const unit of UNITS) {
    const empty = emptyCells(state, unit);
    if (empty.length === 1 && state.candidates[empty[0]]) {
      place(state, empty[0], bitDigit(state.candidates[empty[0]]));
      return true;
    }
  }
  return false;
};

/** A digit with only one possible cell in one of `units`. */
const hiddenSingle = (state: State, units: readonly (readonly number[])[]): boolean => {
  for (const unit of units) {
    for (let digit = 1; digit <= 9; digit++) {
      const cells = cellsWith(state, unit, digit);
      if (cells.length === 1) {
        place(state, cells[0], digit);
        return true;
      }
    }
  }
  return false;
};

/** A cell with only one candidate left. */
const nakedSingle = (state: State): boolean => {
  for (let i = 0; i < CELL_COUNT; i++) {
    if (BIT_COUNT[state.candidates[i]] === 1) {
      place(state, i, bitDigit(state.candidates[i]));
      return true;
    }
  }
  return false;
};

/**
 * Pointing: a digit confined to one line inside a box leaves the rest of that line.
 * Claiming (box-line reduction): a digit confined to one box inside a line leaves the rest of that box.
 */
const lockedCandidates = (state: State): boolean => {
  for (let digit = 1; digit <= 9; digit++) {
    const bit = digitBit(digit);
    for (const box of BOXES) {
      const cells = cellsWith(state, box, digit);
      if (cells.length < 2) {
        continue;
      }
      const lines = [rowOf, colOf].map((lineOf, axis) =>
        cells.every((cell) => lineOf(cell) === lineOf(cells[0]))
          ? (axis === 0 ? ROWS : COLS)[lineOf(cells[0])]
          : null
      );
      for (const line of lines) {
        if (line && eliminate(state, line, bit, new Set(box))) {
          return true;
        }
      }
    }
    for (const line of LINES) {
      const cells = cellsWith(state, line, digit);
      if (cells.length >= 2 && cells.every((cell) => boxOf(cell) === boxOf(cells[0]))) {
        if (eliminate(state, BOXES[boxOf(cells[0])], bit, new Set(line))) {
          return true;
        }
      }
    }
  }
  return false;
};

/** `size` cells of a unit whose candidates together span exactly `size` digits. */
const nakedSubset = (state: State, size: number): boolean => {
  for (const unit of UNITS) {
    const open = emptyCells(state, unit).filter(
      (cell) => BIT_COUNT[state.candidates[cell]] <= size
    );
    for (const subset of combinations(open, size)) {
      const mask = subset.reduce((union, cell) => union | state.candidates[cell], 0);
      if (BIT_COUNT[mask] === size && eliminate(state, unit, mask, new Set(subset))) {
        return true;
      }
    }
  }
  return false;
};

/** `size` digits of a unit confined to the same `size` cells; other candidates leave those cells. */
const hiddenSubset = (state: State, size: number): boolean => {
  for (const unit of UNITS) {
    const digits: number[] = [];
    for (let digit = 1; digit <= 9; digit++) {
      const count = cellsWith(state, unit, digit).length;
      if (count >= 2 && count <= size) {
        digits.push(digit);
      }
    }
    for (const subset of combinations(digits, size)) {
      const cells = new Set(subset.flatMap((digit) => cellsWith(state, unit, digit)));
      if (cells.size !== size) {
        continue;
      }
      const keep = subset.reduce((mask, digit) => mask | digitBit(digit), 0);
      if (eliminate(state, cells, ALL_DIGITS & ~keep)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Basic fish (X-Wing for `size` 2, Swordfish for 3): a digit whose candidates in `size` base
 * lines fit into `size` cover lines leaves the rest of the cover lines. Tried with rows and
 * columns as the base.
 */
const fish = (state: State, size: number): boolean => {
  for (const [base, cover, coverOf] of [
    [ROWS, COLS, colOf],
    [COLS, ROWS, rowOf]
  ] as const) {
    for (let digit = 1; digit <= 9; digit++) {
      const bit = digitBit(digit);
      const lines = base
        .map((line) => cellsWith(state, line, digit))
        .filter((cells) => cells.length >= 2 && cells.length <= size);
      for (const subset of combinations(lines, size)) {
        const covers = new Set(subset.flat().map(coverOf));
        if (covers.size !== size) {
          continue;
        }
        const baseCells = new Set(subset.flat());
        const targets = [...covers].flatMap((line) => cover[line]);
        if (eliminate(state, targets, bit, baseCells)) {
          return true;
        }
      }
    }
  }
  return false;
};

const sees = (a: number, b: number) => PEERS[a].includes(b);

/**
 * XY-Wing: a pivot with candidates XY sees two pincers XZ and YZ; Z leaves every cell
 * that sees both pincers. XYZ-Wing: the pivot holds XYZ as well, so the cells must also see it.
 */
const wing = (state: State, withZInPivot: boolean): boolean => {
  const { candidates } = state;
  const pivotSize = withZInPivot ? 3 : 2;
  for (let pivot = 0; pivot < CELL_COUNT; pivot++) {
    const pivotMask = candidates[pivot];
    if (BIT_COUNT[pivotMask] !== pivotSize) {
      continue;
    }
    const pincers = PEERS[pivot].filter((cell) => {
      const mask = candidates[cell];
      return BIT_COUNT[mask] === 2 && BIT_COUNT[mask & pivotMask] === (withZInPivot ? 2 : 1);
    });
    for (const [a, b] of combinations(pincers, 2)) {
      const z = candidates[a] & candidates[b];
      const union = candidates[a] | candidates[b];
      const valid = withZInPivot
        ? BIT_COUNT[z] === 1 && union === pivotMask
        : BIT_COUNT[z] === 1 && !(z & pivotMask) && (union & pivotMask) === pivotMask;
      if (!valid) {
        continue;
      }
      const targets = PEERS[a].filter(
        (cell) => cell !== b && sees(cell, b) && (!withZInPivot || sees(cell, pivot))
      );
      if (eliminate(state, targets, z, new Set([pivot]))) {
        return true;
      }
    }
  }
  return false;
};

const STEPS: Record<Technique, (state: State) => boolean> = {
  fullHouse,
  hiddenSingleBox: (state) => hiddenSingle(state, BOXES),
  hiddenSingleLine: (state) => hiddenSingle(state, LINES),
  nakedSingle,
  lockedCandidates,
  nakedPair: (state) => nakedSubset(state, 2),
  hiddenPair: (state) => hiddenSubset(state, 2),
  nakedTriple: (state) => nakedSubset(state, 3),
  hiddenTriple: (state) => hiddenSubset(state, 3),
  xWing: (state) => fish(state, 2),
  nakedQuad: (state) => nakedSubset(state, 4),
  hiddenQuad: (state) => hiddenSubset(state, 4),
  swordfish: (state) => fish(state, 3),
  xyWing: (state) => wing(state, false),
  xyzWing: (state) => wing(state, true)
};

/**
 * Solves a puzzle the way a person would: with every candidate noted, it repeatedly applies the
 * easiest technique that makes progress, until the grid is full or nothing more helps.
 * @param maxLevel - never use techniques above this level
 * @returns the grid as far as it got and how often each technique was applied
 */
export const humanSolve = (puzzle: Grid, maxLevel: Difficulty = 'master') => {
  const state = createState(puzzle);
  const steps: Grade['steps'] = {};
  const allowed = TECHNIQUES.filter(
    (technique) => levelRank(TECHNIQUE_LEVEL[technique]) <= levelRank(maxLevel)
  );
  while (state.grid.includes(EMPTY)) {
    const technique = allowed.find((candidate) => STEPS[candidate](state));
    if (!technique) {
      break;
    }
    steps[technique] = (steps[technique] ?? 0) + 1;
  }
  return { grid: state.grid, steps };
};

/**
 * Grades a puzzle by solving it with `humanSolve`. The level is the one of the hardest
 * technique needed, except that a box-singles puzzle with more than `BEGINNER_MAX_EMPTY` empty
 * cells is easy. The puzzle should have a unique solution.
 * @param maxLevel - never use techniques above this level; a puzzle that needs them comes out
 *   unsolved, which is all a generator aiming at `maxLevel` needs to know
 */
export const gradePuzzle = (puzzle: Grid, maxLevel: Difficulty = 'master'): Grade => {
  const { grid, steps } = humanSolve(puzzle, maxLevel);
  const used = TECHNIQUES.filter((technique) => steps[technique]);
  const hardest = used.length ? used[used.length - 1] : null;
  if (grid.includes(EMPTY)) {
    return { solved: false, hardest, steps, level: null };
  }
  const empty = puzzle.filter((value) => value === EMPTY).length;
  const level = hardest ? TECHNIQUE_LEVEL[hardest] : 'beginner';
  return {
    solved: true,
    hardest,
    steps,
    level: level === 'beginner' && empty > BEGINNER_MAX_EMPTY ? 'easy' : level
  };
};
