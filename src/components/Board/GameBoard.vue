<template>
  <div ref="board" class="board" role="grid" aria-label="Sudoku board" :aria-rowcount="9">
    <div v-for="row in 9" :key="row" class="board__row" role="row" :aria-rowindex="row">
      <BoardCell v-for="col in 9" :key="col" :index="indexOf(row - 1, col - 1)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { indexOf } from '@/engine/board';
import { useGameStore } from '@/stores/game';
import { nextTick, useTemplateRef, watch } from 'vue';
import BoardCell from './BoardCell.vue';

/**
 * The 9×9 board as a CSS Grid of cell buttons. Rows use `display: contents`, so the grid stays flat
 * for layout while the ARIA grid/row/gridcell structure stays intact for assistive tech.
 *
 * Keyboard focus follows the selection while it is inside the board (roving tabindex).
 */
const store = useGameStore();
const board = useTemplateRef<HTMLDivElement>('board');

watch(
  () => store.selectedCell,
  async (index) => {
    if (index === null || !board.value?.contains(document.activeElement)) {
      return;
    }
    await nextTick();
    board.value.querySelector<HTMLElement>(`[data-index="${index}"]`)?.focus();
  }
);
</script>

<style scoped>
.board {
  --line-thin: 1px solid var(--color-board-line);
  --line-thick: 2px solid var(--color-board-line-strong);

  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(9, 1fr);
  width: var(--board-size, min(94vw, 70dvh));
  aspect-ratio: 1;
  container-type: inline-size;
  border: var(--line-thick);
  border-radius: 0.4rem;
  overflow: hidden;
  user-select: none;
}

.board__row {
  display: contents;
}

.board__row > :deep(.cell:not(:last-child)) {
  border-right: var(--line-thin);
}

.board__row > :deep(.cell:nth-child(3n):not(:last-child)) {
  border-right: var(--line-thick);
}

.board__row:not(:last-child) > :deep(.cell) {
  border-bottom: var(--line-thin);
}

.board__row:nth-child(3n):not(:last-child) > :deep(.cell) {
  border-bottom: var(--line-thick);
}
</style>
