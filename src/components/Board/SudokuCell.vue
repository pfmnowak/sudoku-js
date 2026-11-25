<template>
  <td @click="selectCell" class="board__cell">
    <div class="tile tile--small" :class="tileClasses">
      {{ cellValue }}
    </div>
  </td>
</template>

<script setup lang="ts">
import { EMPTY } from '@/engine/board';
import { useGameStore } from '@/stores/game';
import { computed } from 'vue';

const props = defineProps<{
  cellIndex: number;
}>();

const store = useGameStore();

const cellValue = computed(() => store.cells[props.cellIndex] || '');

const tileClasses = computed(() => ({
  selected: store.selectedCell === props.cellIndex,
  disabled: store.givens[props.cellIndex] === 1,
  highlighted:
    store.highlightedDigit !== null && store.cells[props.cellIndex] === store.highlightedDigit
}));

/**
 * With a numpad digit picked, writes it (or erases, for the eraser) into this cell;
 * otherwise toggles the selection of this cell, which highlights its digit across the board.
 */
const selectCell = () => {
  if (store.status !== 'playing') {
    return;
  }
  if (store.selectedDigit === null) {
    store.selectCell(store.selectedCell === props.cellIndex ? null : props.cellIndex);
    return;
  }
  store.selectCell(props.cellIndex);
  if (store.selectedDigit === EMPTY) {
    store.erase();
  } else {
    store.placeDigit(store.selectedDigit);
  }
};
</script>

<style scoped lang="scss">
.board {
  &__cell {
    width: 6rem;
    height: 6rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &:not(:last-child) {
      border-right: 1px solid darkgrey;
    }

    &:nth-child(3),
    &:nth-child(6) {
      border-right: 2px solid lightgrey !important;
    }
  }
}

.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 3rem;
  cursor: pointer;
}

.disabled {
  background-color: rgba(#333, 0.6);
  color: #ddd;
  cursor: auto !important;
}

.highlighted {
  color: #32cd32;
}

.selected {
  background-color: rgba(#32cd32, 0.6);
  color: #fff;
}
</style>
