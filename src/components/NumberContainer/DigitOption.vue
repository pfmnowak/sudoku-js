<template>
  <div
    :class="[`tile tile--big tile--${optionValue}`, tileClasses]"
    @click="setSelectedNumber(optionValue)"
  >
    {{ optionValue }}
  </div>
</template>

<script setup lang="ts">
import { useGameStateStore, type Cell } from '@/store';
import { computed } from 'vue';

const props = defineProps<{
  optionValue: Cell['value'];
}>();

const store = useGameStateStore();

const tileClasses = computed(() => ({
  selected: store.selectedDigitOption === props.optionValue,
  highlighted: store.highlightedValue === props.optionValue && store.selectedDigitOption === ''
}));

const setSelectedNumber = (value: Cell['value']) => {
  if (store.disableSelect) {
    return;
  }

  if (store.highlightedValue === value) {
    store.selectedDigitOption = '';
    store.highlightedValue = '';
  } else {
    store.selectedDigitOption = value;
    store.highlightedValue = value;
  }
};
</script>

<style scoped lang="scss">
.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 80%;
  height: 80%;
  font-size: 3rem;
  cursor: pointer;

  &--big {
    width: 6rem;
    height: 6rem;
    // border: 3px solid $color-green-dark;
    border: 3px solid darkgreen;
    font-size: 4rem;

    margin-left: 1rem;
    margin-top: 1rem;
  }
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
