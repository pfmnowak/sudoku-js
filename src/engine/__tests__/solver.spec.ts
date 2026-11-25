import { describe, expect, it } from 'vitest';
import { CELL_COUNT, findConflicts, isFilled, parseGrid, serializeGrid } from '../board';
import { countSolutions, hasUniqueSolution, solve } from '../solver';

const puzzle = '18-9576--2796-4851564281973-5-47-3-9398-657-442-39851--4-82-1-77-6-4--3883-7-64--';
const solution =
  '183957642279634851564281973651472389398165724427398516945823167716549238832716495';

/** A 17-clue puzzle known for forcing deep backtracking in naive solvers. */
const hardPuzzle =
  '8..........36......7..9.2...5...7.......457.....1...3...1....68..85...1..9....4..';
const hardSolution =
  '812753649943682175675491283154237896369845721287169534521974368438526917796318452';

describe('solve', () => {
  it('solves an easy bank puzzle', () => {
    expect(serializeGrid(solve(parseGrid(puzzle))!)).toBe(solution);
  });

  it('solves a hard minimal puzzle', () => {
    expect(serializeGrid(solve(parseGrid(hardPuzzle))!)).toBe(hardSolution);
  });

  it('fills an empty grid with a valid solution', () => {
    const grid = solve(new Uint8Array(CELL_COUNT))!;
    expect(isFilled(grid)).toBe(true);
    expect(findConflicts(grid).size).toBe(0);
  });

  it('does not mutate its input', () => {
    const grid = parseGrid(puzzle);
    solve(grid);
    expect(serializeGrid(grid)).toBe(puzzle);
  });

  it('returns null for a grid with a conflict', () => {
    const grid = parseGrid(puzzle);
    grid[2] = 8;
    expect(solve(grid)).toBeNull();
  });

  it('returns null for a conflict-free grid with no solution', () => {
    const grid = new Uint8Array(CELL_COUNT);
    grid.set([1, 2, 3, 4, 5, 6, 7, 8], 0);
    grid[17] = 9;
    expect(findConflicts(grid).size).toBe(0);
    expect(solve(grid)).toBeNull();
  });
});

describe('countSolutions', () => {
  it('finds exactly one solution for proper puzzles', () => {
    expect(countSolutions(parseGrid(puzzle))).toBe(1);
    expect(hasUniqueSolution(parseGrid(hardPuzzle))).toBe(true);
  });

  it('stops at the limit for grids with many solutions', () => {
    const empty = new Uint8Array(CELL_COUNT);
    expect(countSolutions(empty)).toBe(2);
    expect(countSolutions(empty, 5)).toBe(5);
    expect(hasUniqueSolution(empty)).toBe(false);
  });

  it('detects two solutions when a swappable rectangle is emptied', () => {
    const grid = parseGrid(solution);
    for (const index of [0, 8, 9, 17]) {
      grid[index] = 0;
    }
    expect(countSolutions(grid)).toBe(2);
  });

  it('returns 0 for a grid with a conflict', () => {
    const grid = parseGrid(puzzle);
    grid[2] = 8;
    expect(countSolutions(grid)).toBe(0);
  });
});
