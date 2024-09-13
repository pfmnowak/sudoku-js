<template>
  <td :class="['board__cell']" @click="selectCell">
    <div class="tile tile--small">
      {{ displayValue }}
    </div>
  </td>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';

const props = defineProps<{
  cellIndex: number;
  getCellValue: (index: number) => void;
  selectCell: (index: number) => void;
}>();

const displayValue = computed(() => props.getCellValue(props.cellIndex));

const selectCell = () => {
  props.selectCell(props.cellIndex);
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
