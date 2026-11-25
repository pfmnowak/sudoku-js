<template>
  <div class="board" id="board">
    <table class="board__table">
      <tbody v-for="indexRowGroup in 3" :key="indexRowGroup" class="board__row-group">
        <tr v-for="indexRow in 3" :key="indexRow" class="board__row">
          <SudokuCell
            v-for="indexCell in 9"
            :key="indexCell"
            :cellIndex="getCellIndex(indexRowGroup, indexRow, indexCell)"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import SudokuCell from './SudokuCell.vue';

const getCellIndex = (rowGroup: number, row: number, cell: number) =>
  (rowGroup - 1) * 27 + (row - 1) * 9 + cell - 1;
</script>

<style scoped lang="scss">
.board {
  padding: 2rem 5rem;

  padding: 2rem 0rem;

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
    border-bottom: 2px solid lightgrey;
  }

  &__row {
    display: flex;

    &:not(:last-child) {
      border-bottom: 1px solid darkgrey;
    }
  }
}
</style>
