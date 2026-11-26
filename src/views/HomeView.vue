<template>
  <header>
    <h1 class="title">Sudoku</h1>
    <RouterLink v-if="store.isInProgress" :to="{ name: 'game' }" v-slot="{ navigate }" custom>
      <BaseButton title="Continue" class="button--cta" @click="navigate" />
    </RouterLink>
    <RouterLink to="/new-game" v-slot="{ navigate }" custom>
      <BaseButton title="Start a New Game" class="button--cta" @click="navigate" />
    </RouterLink>
    <nav>
      <RouterLink :to="{ name: 'stats' }">Statistics</RouterLink>
      <RouterLink :to="{ name: 'settings' }">Settings</RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue';
import { useGameStore } from '@/stores/game';

const store = useGameStore();
</script>

<style scoped>
.title {
  font-weight: 500;
  font-size: 2.6rem;
  color: var(--color-accent);
}

header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

nav {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

nav a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 0.4rem;
}

nav a + a {
  border-left: 1px solid var(--color-border);
  border-radius: 0;
}
</style>
