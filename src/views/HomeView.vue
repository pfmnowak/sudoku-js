<template>
  <main>
    <BaseButton title="Start a New Game" class="button--cta" @click="startGameHandler" />
  </main>
</template>

<script setup lang="ts">
import BaseButton from '../components/base/BaseButton.vue';

const startGameHandler = () => {
  console.log('Start a new game!');
};
</script>
