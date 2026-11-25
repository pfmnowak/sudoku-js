import { describe, expect, it } from 'vitest';
import { DIFFICULTIES, pickPuzzle, puzzleBank } from '../puzzles';

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
