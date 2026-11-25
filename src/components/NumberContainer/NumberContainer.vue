<template>
  <div class="number-container hidden">
    <DigitOption v-for="digit in 9" :key="digit" :digit="digit" />
    <DigitOption :digit="EMPTY" />
  </div>
</template>

<script setup lang="ts">
import { EMPTY } from '@/engine/board';
import DigitOption from './DigitOption.vue';
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

  flex-direction: row;
  width: 35rem;
  height: auto;
}
</style>
