import { getPuzzle, type Difficulty, type PuzzleEntry } from '@/engine/puzzles';
import type { GeneratorRequest } from './generator.worker';

/** How long the generator may try before the game falls back to a bank puzzle. */
export const GENERATOR_TIME_LIMIT_MS = 2500;

/** Extra wait on top of the generator's own limit, covering the worker's startup. */
const STARTUP_GRACE_MS = 1000;

/**
 * Gets a fresh puzzle of the given level from the generator in a Web Worker, so the page stays
 * responsive while the harder levels search. Falls back to a randomly transformed bank puzzle
 * when workers are unavailable, the generator runs out of time, the worker fails or stalls.
 * Never rejects.
 */
export const createPuzzle = (
  level: Difficulty,
  timeLimitMs = GENERATOR_TIME_LIMIT_MS
): Promise<PuzzleEntry> => {
  if (typeof Worker === 'undefined') {
    return Promise.resolve(getPuzzle(level));
  }

  return new Promise((resolve) => {
    const worker = new Worker(new URL('./generator.worker.ts', import.meta.url), {
      type: 'module'
    });
    const finish = (entry: PuzzleEntry | null) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(entry ?? getPuzzle(level));
    };
    const timer = setTimeout(() => finish(null), timeLimitMs + STARTUP_GRACE_MS);

    worker.addEventListener('message', ({ data }: MessageEvent<PuzzleEntry | null>) =>
      finish(data)
    );
    worker.addEventListener('error', () => finish(null));
    worker.postMessage({ level, timeLimitMs } satisfies GeneratorRequest);
  });
};
