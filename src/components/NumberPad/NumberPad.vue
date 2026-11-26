<template>
  <div class="pad">
    <div class="pad__actions" role="toolbar" aria-label="Game actions">
      <button
        type="button"
        class="pad__action"
        :aria-pressed="store.selectedDigit === EMPTY"
        @click="store.pressDigit(EMPTY)"
      >
        <AppIcon :path="mdiEraserVariant" />
        <span class="pad__action-label">Erase</span>
      </button>
      <button type="button" class="pad__action" :disabled="!store.canUndo" @click="store.undo">
        <AppIcon :path="mdiUndo" />
        <span class="pad__action-label">Undo</span>
      </button>
      <button type="button" class="pad__action" :disabled="!store.canRedo" @click="store.redo">
        <AppIcon :path="mdiRedo" />
        <span class="pad__action-label">Redo</span>
      </button>
      <button
        type="button"
        class="pad__action"
        :aria-pressed="store.notesMode"
        @click="store.toggleNotesMode"
      >
        <AppIcon :path="mdiPencilOutline" />
        <span class="pad__action-label">Notes {{ store.notesMode ? 'on' : 'off' }}</span>
      </button>
    </div>

    <div class="pad__digits" role="group" aria-label="Digits">
      <button
        v-for="digit in 9"
        :key="digit"
        type="button"
        class="pad__digit"
        :class="{
          'pad__digit--highlighted':
            store.selectedDigit === null && store.highlightedDigit === digit,
          'pad__digit--done': store.remainingCounts[digit] === 0
        }"
        :aria-pressed="store.selectedDigit === digit"
        :aria-label="`${digit}, ${store.remainingCounts[digit]} left`"
        @click="store.pressDigit(digit)"
      >
        <span class="pad__digit-value">{{ digit }}</span>
        <span class="pad__digit-count" aria-hidden="true">{{ store.remainingCounts[digit] }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/base/AppIcon.vue';
import { EMPTY } from '@/engine/board';
import { useGameStore } from '@/stores/game';
import { mdiEraserVariant, mdiPencilOutline, mdiRedo, mdiUndo } from '@mdi/js';

/**
 * Game controls: erase, undo, redo and the notes toggle, plus digits 1–9 with how many of each
 * are still missing. A digit enters into the selected cell (cell-first input), or with no cell
 * selected it is picked and then entered by tapping cells (digit-first input).
 * The parent sets `--pad-columns` to lay the digits out in 3 (beside the board) or more columns.
 */
const store = useGameStore();
</script>

<style scoped>
.pad {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.pad__actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.pad__digits {
  display: grid;
  grid-template-columns: repeat(var(--pad-columns, 3), 1fr);
  gap: 0.5rem;
}

.pad__action,
.pad__digit {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border-radius: 0.6rem;
  background-color: var(--color-surface);
  cursor: pointer;
  transition:
    background-color 0.15s,
    opacity 0.15s;
}

.pad__action:focus-visible,
.pad__digit:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (hover: hover) {
  .pad__action:not(:disabled):hover,
  .pad__digit:hover {
    background-color: var(--color-cell-peer);
  }
}

.pad__action {
  gap: 0.15rem;
  padding: 0.4rem 0.25rem;
  font-size: 0.8rem;
}

.pad__action:disabled {
  opacity: 0.35;
  cursor: default;
}

.pad__action[aria-pressed='true'] {
  background-color: var(--color-cell-selected);
  color: var(--color-text-strong);
}

.pad__action-label {
  white-space: nowrap;
}

.pad__digit {
  padding: 0.3rem 0;
  color: var(--color-cell-entered);
  line-height: 1.1;
}

.pad__digit-value {
  font-size: 1.8rem;
}

.pad__digit-count {
  font-size: 0.75rem;
  color: var(--color-text);
}

.pad__digit--highlighted {
  background-color: var(--color-cell-same-digit);
}

.pad__digit[aria-pressed='true'] {
  background-color: var(--color-cell-selected);
  color: var(--color-text-strong);
}

.pad__digit--done {
  opacity: 0.4;
}
</style>
