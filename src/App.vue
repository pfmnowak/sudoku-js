<template>
  <main class="main">
    <RouterView />
  </main>
  <TheFooter />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import TheFooter from './components/layout/TheFooter.vue';
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
</style>
