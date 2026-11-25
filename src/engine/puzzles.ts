import bank from './data/puzzles.json';

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

/** The hand-picked puzzle bank, kept as static data outside any reactive store. */
export const puzzleBank: Readonly<Record<Difficulty, readonly PuzzleEntry[]>> = bank;

/**
 * Picks a random entry of the given difficulty from the bank.
 * @param rand - source of uniform numbers in `[0, 1)`; swap in a seeded RNG for reproducible picks
 */
export const pickPuzzle = (difficulty: Difficulty, rand: () => number = Math.random): PuzzleEntry => {
  const entries = puzzleBank[difficulty];
  return entries[Math.floor(rand() * entries.length)]!;
};
