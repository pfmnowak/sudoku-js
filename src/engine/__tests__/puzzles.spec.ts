import { describe, expect, it } from 'vitest';
import { findConflicts, isFilled, parseGrid } from '../board';
import { DIFFICULTIES, getPuzzle, pickPuzzle, puzzleBank } from '../puzzles';
import { countSolutions } from '../solver';

describe('puzzleBank', () => {
  it('has 20 well-formed entries per difficulty', () => {
    for (const difficulty of DIFFICULTIES) {
      const entries = puzzleBank[difficulty];
      expect(entries).toHaveLength(20);
      for (const { puzzle, solution } of entries) {
        expect(puzzle).toMatch(/^[1-9-]{81}$/);
        expect(solution).toMatch(/^[1-9]{81}$/);
      }
    }
  });
});

describe('pickPuzzle', () => {
  it('uses the injected rand to choose an entry', () => {
    expect(pickPuzzle('hard', () => 0)).toBe(puzzleBank.hard[0]);
    expect(pickPuzzle('hard', () => 0.999)).toBe(puzzleBank.hard[19]);
  });
});

describe('getPuzzle', () => {
  it('returns a transformed, consistent puzzle with a unique solution', () => {
    for (const difficulty of DIFFICULTIES) {
      const { puzzle, solution } = getPuzzle(difficulty);
      const puzzleGrid = parseGrid(puzzle);
      const solutionGrid = parseGrid(solution);

      expect(puzzle).toMatch(/^[1-9-]{81}$/);
      expect(findConflicts(solutionGrid).size).toBe(0);
      expect(isFilled(solutionGrid)).toBe(true);
      puzzleGrid.forEach((value, i) => {
        if (value !== 0) {
          expect(value).toBe(solutionGrid[i]);
        }
      });
      expect(countSolutions(puzzleGrid)).toBe(1);
    }
  });

  it('keeps the givens count of the source bank entry', () => {
    const rand = () => 0;
    const countGivens = (text: string) => text.replace(/-/g, '').length;
    expect(countGivens(getPuzzle('master', rand).puzzle)).toBe(
      countGivens(puzzleBank.master[0].puzzle)
    );
  });
});
