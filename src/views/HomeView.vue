<template>
  <header>
    <h1 class="title">Sudoku</h1>
    <RouterLink to="/new-game" v-slot="{ href, navigate }">
      <BaseButton title="Start a New Game" class="button--cta" :href="href" @click="navigate" />
    </RouterLink>
    <nav>
      <RouterLink v-if="gameStarted" :to="{ name: 'game', query: { mode: 'resume' } }"
        >Resume a Game</RouterLink
      >
      <RouterLink to="/leaderboard">Leaderboard</RouterLink>
      <RouterLink to="/scores">Scores</RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue';

const gameStarted = true;
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
  flex-direction: column;
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
