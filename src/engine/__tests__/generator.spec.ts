import { describe, expect, it } from 'vitest';
import { EMPTY, findConflicts, isFilled, parseGrid } from '../board';
import { MIN_GIVENS, generatePuzzle, randomSolution, tryGeneratePuzzle } from '../generator';
import { gradePuzzle } from '../grader';
import { DIFFICULTIES } from '../puzzles';
import { hasUniqueSolution } from '../solver';

/** Small seeded PRNG (mulberry32), so the generated puzzles are the same on every run. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

describe('randomSolution', () => {
  it('builds valid full grids that differ between draws', () => {
    const rand = seeded(1);
    const first = randomSolution(rand);
    expect(isFilled(first)).toBe(true);
    expect(findConflicts(first).size).toBe(0);
    expect(randomSolution(rand)).not.toEqual(first);
  });
});

describe('generatePuzzle', () => {
  it.each(DIFFICULTIES)('makes a proper %s puzzle', (level) => {
    const entry = generatePuzzle(level, seeded(42))!;
    const puzzle = parseGrid(entry.puzzle);
    const solution = parseGrid(entry.solution);

    expect(hasUniqueSolution(puzzle)).toBe(true);
    puzzle.forEach((value, i) => {
      if (value !== EMPTY) {
        expect(value).toBe(solution[i]);
      }
      expect(value === EMPTY).toBe(puzzle[80 - i] === EMPTY);
    });
    expect(puzzle.filter((value) => value !== EMPTY).length).toBeGreaterThanOrEqual(
      MIN_GIVENS[level]
    );
    expect(gradePuzzle(puzzle).level).toBe(level);
  });

  it('is reproducible with the same seed', () => {
    expect(generatePuzzle('medium', seeded(7))).toEqual(generatePuzzle('medium', seeded(7)));
  });

  it('makes a single attempt with no time budget and gives up after it', () => {
    expect(tryGeneratePuzzle('master', seeded(3))).toBeNull();
    expect(generatePuzzle('master', seeded(3), 0)).toBeNull();
  });
});
