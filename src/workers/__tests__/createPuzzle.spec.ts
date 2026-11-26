import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseGrid } from '@/engine/board';
import { gradePuzzle } from '@/engine/grader';
import type { PuzzleEntry } from '@/engine/puzzles';
import { hasUniqueSolution } from '@/engine/solver';
import { GENERATOR_TIME_LIMIT_MS, createPuzzle } from '../createPuzzle';

const GENERATED: PuzzleEntry = {
  puzzle: '18--6--3---9--1----2-4--6--7---56----5-----9----74---5--2--7-5----1--3---4--3--86',
  solution: '184569237679321548523478619738956421456812793291743865312687954865194372947235186'
};

/** Stand-in for `Worker`; the static `reply` decides what the generator answers, if anything. */
class FakeWorker extends EventTarget {
  static reply: (worker: FakeWorker) => void = () => {};
  static instances: FakeWorker[] = [];
  posted: unknown[] = [];
  terminate = vi.fn();
  constructor() {
    super();
    FakeWorker.instances.push(this);
  }
  postMessage(message: unknown) {
    this.posted.push(message);
    FakeWorker.reply(this);
  }
}

const stubWorker = (reply: (worker: FakeWorker) => void) => {
  FakeWorker.reply = reply;
  FakeWorker.instances = [];
  vi.stubGlobal('Worker', FakeWorker);
  return FakeWorker.instances;
};

const answer = (worker: EventTarget, data: PuzzleEntry | null) =>
  queueMicrotask(() => worker.dispatchEvent(new MessageEvent('message', { data })));

const expectProperPuzzle = (entry: PuzzleEntry, level: 'easy' | 'hard') => {
  expect(hasUniqueSolution(parseGrid(entry.puzzle))).toBe(true);
  expect(gradePuzzle(parseGrid(entry.puzzle)).level).toBe(level);
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('createPuzzle', () => {
  it('returns the generated puzzle and terminates the worker', async () => {
    const workers = stubWorker((worker) => answer(worker, GENERATED));
    await expect(createPuzzle('hard')).resolves.toEqual(GENERATED);
    expect(workers[0].posted).toEqual([{ level: 'hard', timeLimitMs: GENERATOR_TIME_LIMIT_MS }]);
    expect(workers[0].terminate).toHaveBeenCalled();
  });

  it('falls back to the bank when the generator runs out of time', async () => {
    stubWorker((worker) => answer(worker, null));
    expectProperPuzzle(await createPuzzle('hard'), 'hard');
  });

  it('falls back to the bank when the worker fails', async () => {
    stubWorker((worker) => queueMicrotask(() => worker.dispatchEvent(new Event('error'))));
    expectProperPuzzle(await createPuzzle('easy'), 'easy');
  });

  it('falls back to the bank and stops a stalled worker', async () => {
    vi.useFakeTimers();
    const workers = stubWorker(() => {});
    const result = createPuzzle('hard', 100);
    await vi.advanceTimersByTimeAsync(5000);
    expectProperPuzzle(await result, 'hard');
    expect(workers[0].terminate).toHaveBeenCalled();
  });

  it('uses the bank where workers are unavailable', async () => {
    vi.stubGlobal('Worker', undefined);
    expectProperPuzzle(await createPuzzle('easy'), 'easy');
  });
});
