<template>
  <div class="number-container hidden">
    <div
      v-for="index in 9"
      :key="index"
      :class="[`tile tile--big tile--${index}`]"
      @click="setSelectedNumber(index.toString())"
    >
      {{ index }}
    </div>
    <div class="tile tile--big tile--x" @click="setSelectedNumber('X')">X</div>
  </div>
</template>

<script setup lang="ts">
import { useGameStateStore } from '@/store';

const store = useGameStateStore();

const setSelectedNumber = (value: string) => {
  store.selectedNum = value;
  console.log('store.selectedNum', store.selectedNum);
};
</script>

<style scoped lang="scss">
.number-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  flex: 0 0 auto;

  flex-direction: column;
  height: 35rem;

  // @include respond(tab-port) {
  flex-direction: row;
  width: 35rem;
  height: auto;
  // }
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
</style>
