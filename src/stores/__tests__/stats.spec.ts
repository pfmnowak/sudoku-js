import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { EMPTY } from '@/engine/board';
import { useGameStore } from '../game';
import { STATS_STORAGE_KEY, useStatsStore } from '../stats';

const solve = (game: ReturnType<typeof useGameStore>) => {
  game.cells.forEach((value, index) => {
    if (value === EMPTY) {
      game.placeDigit(game.solution[index], index);
    }
  });
};

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe('useStatsStore', () => {
  it('starts empty', () => {
    const stats = useStatsStore();
    expect(stats.totals).toEqual({ played: 0, won: 0 });
    expect(stats.levels.easy).toEqual({ played: 0, won: 0, bestMs: null, totalWonMs: 0 });
    expect(stats.averageMs('easy')).toBeNull();
  });

  it('tracks best and average time per level', () => {
    const stats = useStatsStore();
    expect(stats.recordWin('hard', 300_000)).toBe(true);
    expect(stats.recordWin('hard', 400_000)).toBe(false);
    expect(stats.recordWin('hard', 200_000)).toBe(true);
    expect(stats.levels.hard.bestMs).toBe(200_000);
    expect(stats.averageMs('hard')).toBe(300_000);
    expect(stats.levels.easy.won).toBe(0);
  });

  it('counts a win without a recorded start as played', () => {
    const stats = useStatsStore();
    stats.recordWin('easy', 1000);
    expect(stats.levels.easy).toMatchObject({ played: 1, won: 1 });
  });

  it('extends the streak with wins and breaks it on an abandoned game', () => {
    const stats = useStatsStore();
    stats.recordStart('easy', false);
    stats.recordWin('easy', 1000);
    stats.recordStart('easy', false);
    stats.recordWin('easy', 1000);
    expect(stats.currentStreak).toBe(2);
    stats.recordStart('easy', true);
    expect(stats.currentStreak).toBe(0);
    expect(stats.bestStreak).toBe(2);
    expect(stats.totals).toEqual({ played: 3, won: 2 });
  });

  it('saves and restores, ignoring a broken save', async () => {
    const stats = useStatsStore();
    stats.recordStart('master', false);
    stats.recordWin('master', 5000);
    await nextTick();

    setActivePinia(createPinia());
    expect(useStatsStore().levels.master).toEqual({
      played: 1,
      won: 1,
      bestMs: 5000,
      totalWonMs: 5000
    });

    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify({ version: 1, levels: {} }));
    setActivePinia(createPinia());
    expect(useStatsStore().totals).toEqual({ played: 0, won: 0 });
  });

  it('is fed by the game: a start counts as played and a solved puzzle as won', () => {
    const game = useGameStore();
    const stats = useStatsStore();
    game.newGame('easy', () => 0);
    expect(stats.levels.easy.played).toBe(1);

    solve(game);
    expect(game.status).toBe('won');
    expect(stats.levels.easy.won).toBe(1);
    expect(stats.levels.easy.bestMs).toBe(game.elapsedMs);
    expect(game.isNewBest).toBe(true);
    expect(stats.currentStreak).toBe(1);
  });

  it('breaks the streak when a new game replaces an unfinished one', () => {
    const game = useGameStore();
    const stats = useStatsStore();
    game.newGame('easy', () => 0);
    solve(game);
    game.newGame('easy', () => 0);
    game.newGame('medium', () => 0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.bestStreak).toBe(1);
    expect(stats.totals).toEqual({ played: 3, won: 1 });
  });
});
