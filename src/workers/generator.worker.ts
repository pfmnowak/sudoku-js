import { generatePuzzle } from '@/engine/generator';
import type { Difficulty } from '@/engine/puzzles';

/** Request sent to the worker: the level to generate and how long it may try. */
export type GeneratorRequest = {
  level: Difficulty;
  timeLimitMs: number;
};

/** Runs the generator off the main thread; answers with the puzzle, or `null` on running out of time. */
self.addEventListener('message', ({ data }: MessageEvent<GeneratorRequest>) => {
  postMessage(generatePuzzle(data.level, Math.random, data.timeLimitMs));
});
