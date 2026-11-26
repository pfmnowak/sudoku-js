import bank from './data/puzzles.json';
import { parseGrid, serializeGrid } from './board';
import { applyTransform, randomTransform } from './transform';

/** Difficulty levels the puzzle bank is grouped by, from easiest to hardest. */
export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'master';

/**
 * A bank entry: `puzzle` is an 81-char row-major string with `-` for empty cells,
 * `solution` is the matching 81-digit string.
 */
export type PuzzleEntry = {
  puzzle: string;
  solution: string;
};

export const DIFFICULTIES: readonly Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'master'];

/**
 * The puzzle bank, kept as static data outside any reactive store: the original 100 puzzles
 * re-sorted by their graded level, topped up with generated ones to at least 20 per level.
 * It is the instant fallback when the generator runs out of time.
 */
export const puzzleBank: Readonly<Record<Difficulty, readonly PuzzleEntry[]>> = bank;

/**
 * Picks a random entry of the given difficulty from the bank.
 * @param rand - source of uniform numbers in `[0, 1)`; swap in a seeded RNG for reproducible picks
 */
export const pickPuzzle = (
  difficulty: Difficulty,
  rand: () => number = Math.random
): PuzzleEntry => {
  const entries = puzzleBank[difficulty];
  return entries[Math.floor(rand() * entries.length)];
};

/**
 * Returns a fresh puzzle of the given difficulty: a random bank entry passed through a random
 * difficulty-preserving transform, so a few dozen entries per level yield billions of distinct boards.
 * The same transform is applied to the solution, so the pair stays consistent.
 * @param rand - source of uniform numbers in `[0, 1)`; swap in a seeded RNG for reproducible puzzles
 */
export const getPuzzle = (
  difficulty: Difficulty,
  rand: () => number = Math.random
): PuzzleEntry => {
  const entry = pickPuzzle(difficulty, rand);
  const transform = randomTransform(rand);
  return {
    puzzle: serializeGrid(applyTransform(parseGrid(entry.puzzle), transform)),
    solution: serializeGrid(applyTransform(parseGrid(entry.solution), transform))
  };
};
