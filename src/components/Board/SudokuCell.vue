<template>
  <td @click="selectCell" class="board__cell">
    <div class="tile tile--small" :class="tileClasses">
      {{ cellValue }}
    </div>
  </td>
</template>

<script setup lang="ts">
import { useGameStateStore, type Cell } from '@/store';
import { computed, defineProps } from 'vue';

const props = defineProps<{
  cellIndex: number;
  getCellValue: (index: number) => Cell['value'];
  selectCell: (index: number) => void;
}>();

const store = useGameStateStore();

const cellValue = computed(() => props.getCellValue(props.cellIndex));

const tileClasses = computed(() => ({
  selected: store.selectedCell === props.cellIndex.toString(),
  disabled: store.currentBoard[props.cellIndex]?.disabled || false,
  highlighted: store.highlightedValue === cellValue.value
}));

const selectCell = () => {
  if (store.disableSelect) {
    return;
  }

  if (store.selectedCell === props.cellIndex.toString()) {
    store.selectedCell = '';
    return;
  }

  if (!store.selectedDigitOption) {
    if (store.highlightedValue === cellValue.value) {
      store.highlightedValue = '';
    } else {
      store.highlightedValue = cellValue.value;
    }
    return;
  }

  if (store.currentBoard[props.cellIndex].disabled) {
    return;
  }

  store.selectedCell = props.cellIndex.toString();
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
  width: 100%;
  height: 100%;
  font-size: 3rem;
  cursor: pointer;
}

.disabled {
  //   background-color: rgba($color-gray-dark, 0.6);
  background-color: rgba(#333, 0.6);
  color: #ddd;
  //   color: $color-gray-light;
  cursor: auto !important;
}

.highlighted {
  color: #32cd32;
  //   color: $color-green-light;
  // background-color: rgba($color-green-light, 0.6);
}

.selected {
  // background-color: $color-green-light;
  background-color: rgba(#32cd32, 0.6);
  //   background-color: rgba($color-green-light, 0.6);
  color: #fff;
  //   color: $color-white;
}
</style>
