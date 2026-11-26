import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { DIFFICULTIES, type Difficulty } from '@/engine/puzzles';
import { readStorage, writeStorage } from './storage';

/** Results of one difficulty level. `totalWonMs` sums the times of won games, for the average. */
export type LevelStats = {
  played: number;
  won: number;
  bestMs: number | null;
  totalWonMs: number;
};

export const STATS_STORAGE_KEY = 'sudoku:stats';

/** Shape saved in `localStorage`; bump `version` on any incompatible change. */
type SavedStats = {
  version: 1;
  levels: Record<Difficulty, LevelStats>;
  currentStreak: number;
  bestStreak: number;
};

const emptyLevel = (): LevelStats => ({ played: 0, won: 0, bestMs: null, totalWonMs: 0 });

const emptyLevels = (): Record<Difficulty, LevelStats> =>
  Object.fromEntries(DIFFICULTIES.map((level) => [level, emptyLevel()])) as Record<
    Difficulty,
    LevelStats
  >;

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const isLevelStats = (value: unknown): value is LevelStats => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const level = value as Partial<LevelStats>;
  return (
    isCount(level.played) &&
    isCount(level.won) &&
    (level.bestMs === null || isCount(level.bestMs)) &&
    isCount(level.totalWonMs)
  );
};

const isSavedStats = (value: unknown): value is SavedStats => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const save = value as Partial<SavedStats>;
  return (
    save.version === 1 &&
    typeof save.levels === 'object' &&
    save.levels !== null &&
    DIFFICULTIES.every((level) => isLevelStats(save.levels![level])) &&
    isCount(save.currentStreak) &&
    isCount(save.bestStreak)
  );
};

/**
 * Lifetime results: games played and won, best and average time per level, and the win streak.
 * A game counts as played when it starts; starting a new game while one is unfinished
 * abandons it and breaks the streak. Saved to `localStorage` (`sudoku:stats`) on every change.
 */
export const useStatsStore = defineStore('stats', () => {
  const levels = ref(emptyLevels());
  const currentStreak = ref(0);
  const bestStreak = ref(0);

  const saved = readStorage(STATS_STORAGE_KEY);
  if (isSavedStats(saved)) {
    levels.value = saved.levels;
    currentStreak.value = saved.currentStreak;
    bestStreak.value = saved.bestStreak;
  }

  const totals = computed(() =>
    Object.values(levels.value).reduce(
      (sum, level) => ({ played: sum.played + level.played, won: sum.won + level.won }),
      { played: 0, won: 0 }
    )
  );

  /** Mean time of the won games of a level, or `null` before the first win. */
  const averageMs = (level: Difficulty): number | null => {
    const { won, totalWonMs } = levels.value[level];
    return won ? Math.round(totalWonMs / won) : null;
  };

  /**
   * Counts a new game as played.
   * @param abandonedPrevious - whether an unfinished game was dropped for it, which breaks the streak
   */
  const recordStart = (level: Difficulty, abandonedPrevious: boolean) => {
    levels.value[level].played += 1;
    if (abandonedPrevious) {
      currentStreak.value = 0;
    }
  };

  /**
   * Counts a won game with its time and extends the streak. A win whose start was never recorded
   * (a game saved before stats existed) is counted as played too.
   * @returns whether the time is a new best for the level (the first win always is)
   */
  const recordWin = (level: Difficulty, timeMs: number): boolean => {
    const stats = levels.value[level];
    const isBest = stats.bestMs === null || timeMs < stats.bestMs;
    stats.won += 1;
    stats.played = Math.max(stats.played, stats.won);
    stats.totalWonMs += timeMs;
    if (isBest) {
      stats.bestMs = timeMs;
    }
    currentStreak.value += 1;
    bestStreak.value = Math.max(bestStreak.value, currentStreak.value);
    return isBest;
  };

  const reset = () => {
    levels.value = emptyLevels();
    currentStreak.value = 0;
    bestStreak.value = 0;
  };

  watch(
    [levels, currentStreak, bestStreak],
    () => {
      writeStorage(STATS_STORAGE_KEY, {
        version: 1,
        levels: levels.value,
        currentStreak: currentStreak.value,
        bestStreak: bestStreak.value
      } satisfies SavedStats);
    },
    { deep: true }
  );

  return {
    levels,
    currentStreak,
    bestStreak,
    totals,
    averageMs,
    recordStart,
    recordWin,
    reset
  };
});
