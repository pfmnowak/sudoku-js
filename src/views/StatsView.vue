<template>
  <div class="stats">
    <PageHeader title="Statistics" />

    <dl class="stats__summary">
      <div v-for="tile in summary" :key="tile.label" class="stats__tile">
        <dt class="stats__tile-label">{{ tile.label }}</dt>
        <dd class="stats__tile-value">{{ tile.value }}</dd>
      </div>
    </dl>

    <div class="stats__table-wrapper">
      <table class="stats__table">
        <caption class="stats__caption">
          By difficulty
        </caption>
        <thead>
          <tr>
            <th scope="col">Level</th>
            <th scope="col">Played</th>
            <th scope="col">Won</th>
            <th scope="col">Best</th>
            <th scope="col">Average</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="level in DIFFICULTIES" :key="level">
            <th scope="row">{{ DIFFICULTY_LABELS[level] }}</th>
            <td>{{ stats.levels[level].played }}</td>
            <td>{{ stats.levels[level].won }}</td>
            <td>{{ clockOrDash(stats.levels[level].bestMs) }}</td>
            <td>{{ clockOrDash(stats.averageMs(level)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <button
      type="button"
      class="stats__reset"
      :disabled="stats.totals.played === 0"
      @click="resetDialog?.open()"
    >
      Reset statistics
    </button>

    <ConfirmDialog
      ref="resetDialog"
      title="Reset statistics?"
      message="All games played, wins, times and streaks will be erased. This cannot be undone."
      confirm-label="Reset"
      @confirm="stats.reset"
    />
  </div>
</template>

<script setup lang="ts">
import ConfirmDialog from '@/components/base/ConfirmDialog.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { DIFFICULTIES } from '@/engine/puzzles';
import { useStatsStore } from '@/stores/stats';
import { DIFFICULTY_LABELS } from '@/utils/difficulty';
import { formatClock } from '@/utils/time';
import { computed, useTemplateRef } from 'vue';

/** Lifetime results: totals and streaks up top, then played/won and times per difficulty. */
const stats = useStatsStore();
const resetDialog = useTemplateRef<InstanceType<typeof ConfirmDialog>>('resetDialog');

const clockOrDash = (ms: number | null) => (ms === null ? '–' : formatClock(ms));

const summary = computed(() => {
  const { played, won } = stats.totals;
  return [
    { label: 'Played', value: played },
    { label: 'Won', value: won },
    { label: 'Win rate', value: played ? `${Math.round((won / played) * 100)}%` : '–' },
    { label: 'Streak', value: stats.currentStreak },
    { label: 'Best streak', value: stats.bestStreak }
  ];
});
</script>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 36rem;
  margin: 0 auto;
}

.stats__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(6rem, 1fr));
  gap: 0.5rem;
  margin: 0;
}

.stats__tile {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-radius: 0.75rem;
  background-color: var(--color-surface);
}

.stats__tile-label {
  font-size: 0.8rem;
  text-transform: uppercase;
}

.stats__tile-value {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1.6rem;
  font-variant-numeric: tabular-nums;
}

.stats__table-wrapper {
  overflow-x: auto;
  padding: 0.5rem 1rem 1rem;
  border-radius: 0.75rem;
  background-color: var(--color-surface);
}

.stats__table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.stats__caption {
  padding: 0.5rem 0;
  color: var(--color-accent);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: left;
  text-transform: uppercase;
}

.stats__table th,
.stats__table td {
  padding: 0.5rem 0.4rem;
  border-bottom: 1px solid var(--color-border);
  text-align: right;
}

.stats__table th:first-child {
  text-align: left;
}

.stats__table thead th {
  font-size: 0.8rem;
  font-weight: 600;
}

.stats__table tbody th {
  color: var(--color-text-strong);
}

.stats__table tbody tr:last-child > * {
  border-bottom: none;
}

.stats__reset {
  align-self: center;
  min-height: 44px;
  padding: 0 1.25rem;
  border-radius: 0.5rem;
  color: var(--color-conflict);
  cursor: pointer;
}

.stats__reset:hover:not(:disabled) {
  background-color: var(--color-hover);
}

.stats__reset:disabled {
  opacity: 0.4;
  cursor: default;
}

.stats__reset:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
