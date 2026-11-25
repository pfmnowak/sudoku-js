<template>
  <div :class="[`tile tile--big tile--${label}`, tileClasses]" @click="pickDigit">
    {{ label }}
  </div>
</template>

<script setup lang="ts">
import { EMPTY } from '@/engine/board';
import { useGameStore } from '@/stores/game';
import { computed } from 'vue';

/** A numpad button: digit `1`-`9`, or `EMPTY` (0) for the eraser shown as `X`. */
const props = defineProps<{
  digit: number;
}>();

const store = useGameStore();

const label = computed(() => (props.digit === EMPTY ? 'X' : String(props.digit)));

const tileClasses = computed(() => ({
  selected: store.selectedDigit === props.digit,
  highlighted: store.selectedDigit === null && store.highlightedDigit === props.digit
}));

/** Picks this digit for digit-first input, or drops it when it is already picked. */
const pickDigit = () => {
  if (store.status !== 'playing') {
    return;
  }
  store.selectCell(null);
  store.selectDigit(props.digit);
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
    border: 3px solid darkgreen;
    font-size: 4rem;

    margin-left: 1rem;
    margin-top: 1rem;
  }
}

.highlighted {
  color: #32cd32;
}

.selected {
  background-color: rgba(#32cd32, 0.6);
  color: #fff;
}
</style>
