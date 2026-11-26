import { describe, expect, it } from 'vitest';
import { CELL_COUNT, EMPTY, findConflicts, parseGrid } from '../board';
import { DIFFICULTIES, puzzleBank } from '../puzzles';
import { gradePuzzle } from '../grader';
import { countSolutions } from '../solver';

describe.each(DIFFICULTIES)('puzzle bank: %s', (difficulty) => {
  it.each(puzzleBank[difficulty].map((entry, i) => [i, entry] as const))(
    'entry %i is a proper puzzle matching its solution and level',
    (_, { puzzle, solution }) => {
      const puzzleGrid = parseGrid(puzzle);
      const solutionGrid = parseGrid(solution);

      expect(findConflicts(solutionGrid).size).toBe(0);
      for (let i = 0; i < CELL_COUNT; i++) {
        if (puzzleGrid[i] !== EMPTY) {
          expect(puzzleGrid[i]).toBe(solutionGrid[i]);
        }
      }
      expect(countSolutions(puzzleGrid)).toBe(1);
      expect(gradePuzzle(puzzleGrid).level).toBe(difficulty);
    }
  );
});
