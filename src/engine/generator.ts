import { BOXES, CELL_COUNT, EMPTY, serializeGrid, type Grid } from './board';
import { gradePuzzle, levelRank } from './grader';
import type { Difficulty, PuzzleEntry } from './puzzles';
import { hasUniqueSolution, solve } from './solver';
import { applyTransform, randomTransform, shuffle } from './transform';

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Fewest givens a generated puzzle of each level keeps. Removal stops there even if more
 * cells could go, so beginner and easy puzzles stay short.
 */
export const MIN_GIVENS: Readonly<Record<Difficulty, number>> = {
  beginner: 45,
  easy: 32,
  medium: 17,
  hard: 17,
  master: 17
};

/**
 * Builds a random full grid: the three diagonal boxes, which never constrain each other, get
 * shuffled digits, the solver fills in the rest, and a random transform mixes the result.
 * @param rand - source of uniform numbers in `[0, 1)`
 */
export const randomSolution = (rand: () => number = Math.random): Grid => {
  const seed = new Uint8Array(CELL_COUNT);
  for (const box of [BOXES[0], BOXES[4], BOXES[8]]) {
    shuffle(DIGITS, rand).forEach((digit, i) => {
      seed[box[i]] = digit;
    });
  }
  return applyTransform(solve(seed)!, randomTransform(rand));
};

/**
 * Removes clues from a full grid in random 180°-symmetric pairs, keeping a removal only while
 * the puzzle still has one solution and grades at or below `level`, until `MIN_GIVENS` is reached.
 * @returns the puzzle and its grade
 */
const carve = (solution: Grid, level: Difficulty, rand: () => number) => {
  const puzzle = Uint8Array.from(solution);
  let givens = CELL_COUNT;
  const pairs = shuffle(
    Array.from({ length: Math.ceil(CELL_COUNT / 2) }, (_, i) => i),
    rand
  );

  for (const cell of pairs) {
    const twin = CELL_COUNT - 1 - cell;
    const removed = cell === twin ? 1 : 2;
    if (givens - removed < MIN_GIVENS[level]) {
      continue;
    }
    puzzle[cell] = EMPTY;
    puzzle[twin] = EMPTY;
    const grade = hasUniqueSolution(puzzle) ? gradePuzzle(puzzle, level) : null;
    if (grade?.solved && levelRank(grade.level!) <= levelRank(level)) {
      givens -= removed;
    } else {
      puzzle[cell] = solution[cell];
      puzzle[twin] = solution[twin];
    }
  }
  return { puzzle, grade: gradePuzzle(puzzle, level) };
};

/**
 * Tries once to generate a puzzle of exactly the given level from a fresh random grid.
 * @param rand - source of uniform numbers in `[0, 1)`; swap in a seeded RNG for reproducible puzzles
 * @returns the puzzle, or `null` when this grid came out too easy; call again to retry
 */
export const tryGeneratePuzzle = (
  level: Difficulty,
  rand: () => number = Math.random
): PuzzleEntry | null => {
  const solution = randomSolution(rand);
  const { puzzle, grade } = carve(solution, level, rand);
  return grade.level === level
    ? { puzzle: serializeGrid(puzzle), solution: serializeGrid(solution) }
    : null;
};

/**
 * Generates a puzzle of the given level, retrying with new grids until one fits or the time
 * budget runs out. Harder levels need more attempts: most random grids carve into puzzles
 * that are either too easy or need techniques the grader does not know.
 * @param timeLimitMs - give up after this long
 * @returns the puzzle, or `null` when the time ran out
 */
export const generatePuzzle = (
  level: Difficulty,
  rand: () => number = Math.random,
  timeLimitMs = Infinity
): PuzzleEntry | null => {
  const deadline = Date.now() + timeLimitMs;
  do {
    const entry = tryGeneratePuzzle(level, rand);
    if (entry) {
      return entry;
    }
  } while (Date.now() < deadline);
  return null;
};
