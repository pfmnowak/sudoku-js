<template>
  <button
    type="button"
    role="gridcell"
    class="cell"
    :class="cellClasses"
    :data-index="index"
    :tabindex="isTabStop ? 0 : -1"
    :aria-label="label"
    :aria-selected="isSelected"
    :aria-readonly="isGiven"
    :aria-invalid="isConflict"
    @click="store.pressCell(index)"
  >
    <template v-if="value">{{ value }}</template>
    <span v-else-if="noteMask" class="cell__notes" aria-hidden="true">
      <span
        v-for="digit in 9"
        :key="digit"
        class="cell__note"
        :class="{
          'cell__note--highlighted': digit === store.highlightedDigit && hasNote(noteMask, digit)
        }"
      >
        {{ hasNote(noteMask, digit) ? digit : '' }}
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { EMPTY, boxOf, colOf, hasNote, maskDigits, rowOf } from '@/engine/board';
import { useGameStore } from '@/stores/game';
import { computed } from 'vue';

/**
 * One board cell: a given or entered digit, or the cell's notes as a 3×3 mini-grid.
 * Shades the selected cell, its row/column/box, cells with the highlighted digit and conflicts.
 */
const props = defineProps<{
  index: number;
}>();

const store = useGameStore();

const value = computed(() => store.cells[props.index]);
const noteMask = computed(() => store.notes[props.index]);
const isGiven = computed(() => store.givens[props.index] === 1);
const isSelected = computed(() => store.selectedCell === props.index);
const isConflict = computed(() => store.conflicts.has(props.index));
const isTabStop = computed(() => (store.selectedCell ?? 0) === props.index);

const isPeerOfSelected = computed(() => {
  const selected = store.selectedCell;
  if (selected === null || selected === props.index) {
    return false;
  }
  return (
    rowOf(selected) === rowOf(props.index) ||
    colOf(selected) === colOf(props.index) ||
    boxOf(selected) === boxOf(props.index)
  );
});

const cellClasses = computed(() => ({
  'cell--given': isGiven.value,
  'cell--selected': isSelected.value,
  'cell--peer': isPeerOfSelected.value,
  'cell--same-digit':
    value.value !== EMPTY && value.value === store.highlightedDigit && !isSelected.value,
  'cell--conflict': isConflict.value
}));

const label = computed(() => {
  const position = `Row ${rowOf(props.index) + 1}, column ${colOf(props.index) + 1}`;
  if (value.value !== EMPTY) {
    const given = isGiven.value ? ', given' : '';
    const conflict = isConflict.value ? ', conflict' : '';
    return `${position}, ${value.value}${given}${conflict}`;
  }
  const notes = maskDigits(noteMask.value);
  return notes.length ? `${position}, notes ${notes.join(' ')}` : `${position}, empty`;
});
</script>

<style scoped>
.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  padding: 0;
  background-color: var(--color-cell);
  color: var(--color-cell-entered);
  font-size: 7cqi;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background-color 0.1s;
}

.cell:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -3px;
}

.cell--given {
  color: var(--color-cell-given);
  font-weight: 600;
}

.cell--peer {
  background-color: var(--color-cell-peer);
}

.cell--same-digit {
  background-color: var(--color-cell-same-digit);
}

.cell--selected {
  background-color: var(--color-cell-selected);
}

.cell--conflict {
  color: var(--color-conflict);
}

.cell--conflict:not(.cell--selected) {
  background-color: var(--color-conflict-bg);
}

.cell__notes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 100%;
  height: 100%;
  padding: 0.2cqi;
  color: var(--color-cell-note);
  font-size: 3.2cqi;
}

.cell__note {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell__note--highlighted {
  border-radius: 50%;
  background-color: var(--color-cell-same-digit);
  color: var(--color-text-strong);
  font-weight: 600;
}
</style>
