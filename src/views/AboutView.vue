<template>
  <div class="about">
    <h1>This is an about page</h1>
    <TheWelcome />
  </div>
</template>

<script setup lang="ts">
import TheWelcome from '@/components/TheWelcome.vue';
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
}
</style>
