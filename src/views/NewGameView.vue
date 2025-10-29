<template>
  <section class="toolbar-section">
    <IconButtonMDI icon="$prev" @click="$router.push({ path: '/', replace: true })" />
  </section>

  <v-container class="text-center">
    <h1>New game</h1>
    <h3 class="mb-4">Choose a difficulty</h3>

    <v-row class="justify-center my-2">
      <v-btn-toggle v-model="difficulty" mandatory>
        <v-btn value="beginner" class="mx-2">
          <v-icon>mdi-emoticon-excited-outline</v-icon>Beginner</v-btn
        >
        <v-btn value="easy" class="mx-2"> <v-icon>mdi-emoticon-happy-outline</v-icon>Easy</v-btn>
        <v-btn value="medium" class="mx-2">
          <v-icon>mdi-emoticon-neutral-outline</v-icon>Standard</v-btn
        >
        <v-btn value="hard" class="mx-2"> <v-icon>mdi-emoticon-angry-outline</v-icon>Hard</v-btn>
        <v-btn value="master" class="mx-2">
          <v-icon>mdi-emoticon-devil-outline</v-icon>Master</v-btn
        >
      </v-btn-toggle>
    </v-row>

    <v-btn @click="startGame" class="mt-5" color="primary">Start a Game!</v-btn>
  </v-container>
</template>

<script setup lang="ts">
import IconButtonMDI from '@/components/base/IconButtonMDI.vue';
import { useGameStateStore } from '@/store';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'master';
const store = useGameStateStore();
const router = useRouter();
const difficulty = ref<Difficulty>('medium');

const startGame = () => {
  setDifficulty();
  router.push({ path: '/game', query: { mode: 'new' } });
};

const setDifficulty = () => {
  let board;
  let solution;

  [board, solution] =
    store.data[difficulty.value][Math.floor(Math.random() * store.data[difficulty.value].length)];

  store.solution = solution;
  store.initialBoard = board;
};
</script>

<style lang="scss" scoped></style>
