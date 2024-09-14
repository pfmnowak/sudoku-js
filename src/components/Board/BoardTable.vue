<template>
  <div class="board" id="board">
    <table class="board__table">
      <tbody v-for="indexRowGroup in 3" :key="indexRowGroup" class="board__row-group">
        <tr v-for="indexRow in 3" :key="indexRow" class="board__row">
          <SudokuCell
            v-for="indexCell in 9"
            :key="indexCell"
            :cellIndex="getCellIndex(indexRowGroup, indexRow, indexCell)"
            :getCellValue="getCellValue"
            :selectCell="selectCell"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useGameStateStore } from '@/store';
import { computed } from 'vue';
import SudokuCell from './SudokuCell.vue';

const store = useGameStateStore();

const currentBoard = computed(() => {
  return store.currentBoard;
});

const getCellIndex = (rowGroup: number, row: number, cell: number) => {
  return (rowGroup - 1) * 27 + (row - 1) * 9 + cell - 1;
};

const getCellValue = (cellIndex: number) => {
  if (!currentBoard.value || currentBoard.value.length === 0) {
    return '';
  }
  return currentBoard.value[cellIndex].value === '-' ? '' : currentBoard.value[cellIndex].value;
};

const selectCell = (cellIndex: any) => {
  if (currentBoard.value[cellIndex].disabled) {
    return;
  }

  currentBoard.value[cellIndex].value =
    store.selectedDigitOption === 'X' ? '' : store.selectedDigitOption;
};
</script>

<style scoped lang="scss">
.board {
  padding: 2rem 5rem;

  // @include respond(tab-port) {
  padding: 2rem 0rem;
  // }

  &__table {
    border-collapse: collapse;
    display: flex;
    flex-direction: column;
  }

  &__row-group {
    display: flex;
    flex-direction: column;
  }

  &__row-group:not(:last-child) {
    // border-bottom: 2px solid $color-gray-light;
    border-bottom: 2px solid lightgrey;
  }

  &__row {
    display: flex;

    &:not(:last-child) {
      // border-bottom: 1px solid $color-gray-dark;
      border-bottom: 1px solid darkgrey;
    }
  }
}
</style>
