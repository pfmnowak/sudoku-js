import type { Difficulty } from '@/engine/puzzles';

/** Display names of the difficulty levels. */
export const DIFFICULTY_LABELS: Readonly<Record<Difficulty, string>> = {
  beginner: 'Beginner',
  easy: 'Easy',
  medium: 'Standard',
  hard: 'Hard',
  master: 'Master'
};
