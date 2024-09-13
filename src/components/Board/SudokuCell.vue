<template>
  <td @click="selectCell" class="board__cell" :class="tileClasses">
    <div class="tile tile--small">
      {{ displayValue }}
    </div>
  </td>
</template>

<script setup lang="ts">
import { useGameStateStore } from '@/store';
import { computed, defineProps } from 'vue';

const props = defineProps<{
  cellIndex: number;
  getCellValue: (index: number) => string;
  selectCell: (index: number) => void;
}>();

const store = useGameStateStore();

const displayValue = computed(() => props.getCellValue(props.cellIndex));

const tileClasses = computed(() => ({
  selected: store.selectedTile === props.cellIndex.toString(),
  disabled: store.currentBoard[props.cellIndex]?.disabled || false,
  highlighted: store.highlightedValue === displayValue.value && store.selectedNum === null
}));

const selectCell = () => {
  if (store.disableSelect) return;

  if (store.selectedTile === props.cellIndex.toString()) {
    store.selectedTile = '';
    return;
  }

  if (!store.selectedNum) {
    if (store.highlightedValue === displayValue.value) {
      store.highlightedValue = '';
    } else {
      store.highlightedValue = displayValue.value;
    }
    return;
  }

  if (store.currentBoard[props.cellIndex].disabled) return;

  store.selectedTile = props.cellIndex.toString();
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
