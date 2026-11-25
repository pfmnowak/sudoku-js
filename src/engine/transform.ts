import { CELL_COUNT, EMPTY, indexOf, type Grid } from './board';

/**
 * A difficulty-preserving sudoku transform. Applying it to a valid grid yields a valid grid
 * with the same number of givens, the same number of solutions and the same solving techniques.
 * - `rowOrder[r]`: source row placed at row `r`; rows may only move within their band,
 *   and bands only as a whole
 * - `colOrder[c]`: source column placed at column `c`, with the same rule for stacks
 * - `transpose`: mirror the result across the main diagonal
 * - `digitMap[d - 1]`: digit written in place of digit `d`, a permutation of 1–9
 */
export type Transform = {
  rowOrder: readonly number[];
  colOrder: readonly number[];
  transpose: boolean;
  digitMap: readonly number[];
};

const range = (length: number): number[] => Array.from({ length }, (_, i) => i);

export const IDENTITY_TRANSFORM: Transform = {
  rowOrder: range(9),
  colOrder: range(9),
  transpose: false,
  digitMap: range(9).map((i) => i + 1)
};

/**
 * Fisher–Yates shuffle into a new array.
 * @param rand - source of uniform numbers in `[0, 1)`
 */
export const shuffle = <T>(items: readonly T[], rand: () => number): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Builds a line order that keeps the band (or stack) structure: shuffles the three bands,
 * then the three lines inside each band independently.
 */
const randomLineOrder = (rand: () => number): number[] =>
  shuffle(range(3), rand).flatMap((band) => shuffle(range(3), rand).map((line) => band * 3 + line));

/**
 * True when `order` is a permutation of 0–8 that moves lines only within their band
 * and bands only as a whole — the moves that keep a sudoku valid.
 */
export const isBandPreservingOrder = (order: readonly number[]): boolean => {
  if (
    order.length !== 9 ||
    new Set(order).size !== 9 ||
    order.some((line) => !(line >= 0 && line < 9))
  ) {
    return false;
  }
  return range(3).every((band) => {
    const sourceBand = Math.floor(order[band * 3] / 3);
    return range(3).every((offset) => Math.floor(order[band * 3 + offset] / 3) === sourceBand);
  });
};

/**
 * Draws a uniformly random transform: band, stack, row and column shuffles, a coin flip
 * for transposition and a random digit permutation.
 * @param rand - source of uniform numbers in `[0, 1)`; swap in a seeded RNG for reproducible results
 */
export const randomTransform = (rand: () => number = Math.random): Transform => ({
  rowOrder: randomLineOrder(rand),
  colOrder: randomLineOrder(rand),
  transpose: rand() < 0.5,
  digitMap: shuffle(
    range(9).map((i) => i + 1),
    rand
  )
});

const isDigitPermutation = (digitMap: readonly number[]): boolean =>
  digitMap.length === 9 &&
  new Set(digitMap).size === 9 &&
  digitMap.every((digit) => Number.isInteger(digit) && digit >= 1 && digit <= 9);

/**
 * Applies a transform to a grid and returns a new grid; the input is not mutated.
 * @throws if the row or column order would break the band/stack structure,
 *   or `digitMap` is not a permutation of 1–9
 */
export const applyTransform = (grid: Grid, transform: Transform): Grid => {
  const { rowOrder, colOrder, transpose, digitMap } = transform;
  if (!isBandPreservingOrder(rowOrder) || !isBandPreservingOrder(colOrder)) {
    throw new Error('Row and column orders must keep lines inside their bands and stacks');
  }
  if (!isDigitPermutation(digitMap)) {
    throw new Error('Digit map must be a permutation of 1-9');
  }
  const result = new Uint8Array(CELL_COUNT);
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = grid[indexOf(rowOrder[row], colOrder[col])];
      const target = transpose ? indexOf(col, row) : indexOf(row, col);
      result[target] = value === EMPTY ? EMPTY : digitMap[value - 1];
    }
  }
  return result;
};
