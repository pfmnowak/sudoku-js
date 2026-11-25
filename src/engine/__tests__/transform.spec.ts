import { describe, expect, it } from 'vitest';
import { findConflicts, isFilled, parseGrid, serializeGrid, type Grid } from '../board';
import { DIFFICULTIES, puzzleBank } from '../puzzles';
import { countSolutions } from '../solver';
import {
  IDENTITY_TRANSFORM,
  applyTransform,
  isBandPreservingOrder,
  randomTransform,
  shuffle,
  type Transform
} from '../transform';

/** Deterministic mulberry32 PRNG so random-transform tests are reproducible. */
const seededRand = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const countGivens = (grid: Grid) => grid.filter((value) => value !== 0).length;

const { puzzle, solution } = puzzleBank.medium[0];
const puzzleGrid = parseGrid(puzzle);
const solutionGrid = parseGrid(solution);

const withTransform = (overrides: Partial<Transform>): Transform => ({
  ...IDENTITY_TRANSFORM,
  ...overrides
});

describe('shuffle', () => {
  it('returns a permutation and leaves the input untouched', () => {
    const items = [1, 2, 3, 4, 5];
    const result = shuffle(items, seededRand(1));
    expect([...result].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  it('keeps the order when rand always picks the last slot', () => {
    expect(shuffle([1, 2, 3], () => 0.999)).toEqual([1, 2, 3]);
  });
});

describe('isBandPreservingOrder', () => {
  it('accepts swaps within bands and of whole bands', () => {
    expect(isBandPreservingOrder([0, 1, 2, 3, 4, 5, 6, 7, 8])).toBe(true);
    expect(isBandPreservingOrder([2, 0, 1, 3, 4, 5, 6, 7, 8])).toBe(true);
    expect(isBandPreservingOrder([6, 7, 8, 0, 1, 2, 5, 4, 3])).toBe(true);
  });

  it('rejects lines moved across bands and malformed orders', () => {
    expect(isBandPreservingOrder([3, 1, 2, 0, 4, 5, 6, 7, 8])).toBe(false);
    expect(isBandPreservingOrder([0, 0, 2, 3, 4, 5, 6, 7, 8])).toBe(false);
    expect(isBandPreservingOrder([0, 1, 2, 3, 4, 5, 6, 7])).toBe(false);
    expect(isBandPreservingOrder([0, 1, 2, 3, 4, 5, 6, 7, 9])).toBe(false);
  });
});

describe('applyTransform', () => {
  it('is a no-op for the identity transform and does not mutate the input', () => {
    const copy = Uint8Array.from(puzzleGrid);
    expect(applyTransform(puzzleGrid, IDENTITY_TRANSFORM)).toEqual(puzzleGrid);
    expect(puzzleGrid).toEqual(copy);
  });

  it('relabels digits and keeps empty cells empty', () => {
    const digitMap = [2, 3, 4, 5, 6, 7, 8, 9, 1];
    const result = applyTransform(puzzleGrid, withTransform({ digitMap }));
    puzzleGrid.forEach((value, i) => {
      expect(result[i]).toBe(value === 0 ? 0 : digitMap[value - 1]);
    });
  });

  it('moves rows and columns according to the orders', () => {
    const rowOrder = [3, 4, 5, 0, 1, 2, 6, 7, 8];
    const colOrder = [1, 0, 2, 3, 4, 5, 6, 7, 8];
    const result = applyTransform(solutionGrid, withTransform({ rowOrder, colOrder }));
    expect(result[0]).toBe(solutionGrid[3 * 9 + 1]);
    expect(result[1]).toBe(solutionGrid[3 * 9 + 0]);
    expect(result[3 * 9 + 2]).toBe(solutionGrid[2]);
  });

  it('transposes across the main diagonal', () => {
    const result = applyTransform(solutionGrid, withTransform({ transpose: true }));
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        expect(result[row * 9 + col]).toBe(solutionGrid[col * 9 + row]);
      }
    }
  });

  it('rejects orders and digit maps that would break the grid', () => {
    expect(() =>
      applyTransform(puzzleGrid, withTransform({ rowOrder: [3, 1, 2, 0, 4, 5, 6, 7, 8] }))
    ).toThrow();
    expect(() =>
      applyTransform(puzzleGrid, withTransform({ digitMap: [1, 1, 3, 4, 5, 6, 7, 8, 9] }))
    ).toThrow();
  });
});

describe('randomTransform', () => {
  it('produces valid orders and a digit permutation', () => {
    const rand = seededRand(42);
    for (let n = 0; n < 50; n++) {
      const { rowOrder, colOrder, digitMap } = randomTransform(rand);
      expect(isBandPreservingOrder(rowOrder)).toBe(true);
      expect(isBandPreservingOrder(colOrder)).toBe(true);
      expect([...digitMap].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }
  });

  it('is reproducible for the same rand sequence', () => {
    expect(randomTransform(seededRand(7))).toEqual(randomTransform(seededRand(7)));
  });

  describe.each(DIFFICULTIES)('on %s bank puzzles', (difficulty) => {
    it.each(puzzleBank[difficulty].map((entry, index) => ({ ...entry, index })))(
      'entry $index keeps validity, givens count and uniqueness',
      (entry) => {
        const transform = randomTransform(seededRand(entry.index + 1));
        const puzzleOut = applyTransform(parseGrid(entry.puzzle), transform);
        const solutionOut = applyTransform(parseGrid(entry.solution), transform);

        expect(isFilled(solutionOut)).toBe(true);
        expect(findConflicts(solutionOut).size).toBe(0);
        expect(countGivens(puzzleOut)).toBe(countGivens(parseGrid(entry.puzzle)));
        puzzleOut.forEach((value, i) => {
          if (value !== 0) {
            expect(value).toBe(solutionOut[i]);
          }
        });
        expect(countSolutions(puzzleOut)).toBe(1);
        expect(serializeGrid(puzzleOut)).not.toBe(entry.puzzle);
      }
    );
  });
});
