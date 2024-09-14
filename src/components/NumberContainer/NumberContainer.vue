<template>
  <div class="number-container hidden">
    <DigitOption v-for="index in 9" :key="index" :optionValue="index.toString()" />
    <DigitOption optionValue="X" />
  </div>
</template>

<script setup lang="ts">
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

  // @include respond(tab-port) {
  flex-direction: row;
  width: 35rem;
  height: auto;
  // }
}
</style>
