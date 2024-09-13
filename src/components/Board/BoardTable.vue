<template>
  <div class="board" id="board">
    <table class="board__table">
      <tbody v-for="indexRowGroup in 3" :key="indexRowGroup" class="board__row-group">
        <tr v-for="indexRow in 3" :key="indexRow" class="board__row">
          <td
            v-for="indexCell in 9"
            :key="indexCell"
            class="board__cell"
            @click="selectCell(getCellIndex(indexRowGroup, indexRow, indexCell))"
          >
            <div class="tile tile--small">
              {{ getCellValue(indexRowGroup, indexRow, indexCell) }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useGameStateStore } from '@/store';
import { computed } from 'vue';

const store = useGameStateStore();

const currentBoard = computed(() => {
  return store.currentBoard;
});

const getCellIndex = (rowGroup: number, row: number, cell: number) => {
  return (rowGroup - 1) * 27 + (row - 1) * 9 + cell - 1;
};

const getCellValue = (rowGroup: number, row: number, cell: number) => {
  const index = getCellIndex(rowGroup, row, cell);

  if (!currentBoard.value || currentBoard.value.length === 0) {
    return;
  }
  return currentBoard.value[index].value === '-' ? '' : currentBoard.value[index].value;
};

const selectCell = (cellIndex: any) => {
  if (currentBoard.value[cellIndex].disabled) {
    return;
  }

  currentBoard.value[cellIndex].value = store.selectedNum === 'X' ? '' : store.selectedNum;
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

  &__cell {
    width: 6rem;
    height: 6rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &:not(:last-child) {
      // border-right: 1px solid $color-gray-dark;
      border-right: 1px solid darkgrey;
    }

    &:nth-child(3),
    &:nth-child(6) {
      // border-right: 2px solid $color-gray-light !important;
      border-right: 2px solid lightgrey !important;
    }
  }
}

.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 80%;
  height: 80%;
  font-size: 3rem;
  cursor: pointer;
}
</style>
