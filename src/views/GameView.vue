<template>
  <section class="toolbar-section">
    <IconButtonMDI icon="$prev" @click="$router.push({ path: '/', replace: true })" />
    <div class="timer">{{ formattedTime }}</div>
    <IconButtonMDI icon="mdi-restore" @click="$router.push({ path: '/', replace: true })" />
  </section>
  <section id="game" class="game-section">
    <BoardTable />
    <NumberContainer />
  </section>
</template>

<script setup lang="ts">
import IconButtonMDI from '@/components/base/IconButtonMDI.vue';
import BoardTable from '@/components/Board/BoardTable.vue';
import NumberContainer from '@/components/NumberContainer/NumberContainer.vue';
import { useGameStateStore, type Cell } from '@/store';
import { computed, onMounted, onUnmounted } from 'vue';

const store = useGameStateStore();

const formattedTime = computed(() => {
  const hours = Math.floor(store.timer / 3600);
  const minutes = Math.floor((store.timer % 3600) / 60);
  const seconds = store.timer % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const startGame = () => {
  getData();
  loadData();
  store.resetTimer();
  store.startTimer();
};

// const resumeGame = () => {
//   store.startTimer();
// };

const getData = () => {
  // Choose board difficulty
  let board;
  let solution;

  // if (document.querySelector('.beginner').checked)
  [board, solution] = store.data.beginner[Math.floor(Math.random() * store.data.beginner.length)];
  // Tutaj computed() property z funkcją

  store.solution = solution;
  store.board = board;
};

const loadData = function () {
  store.disableSelect = false;
  store.currentBoard = [...store.board].map((position) => {
    return {
      value: position as Cell['value'],
      disabled: position !== '-'
    };
  });
};

onMounted(() => {
  startGame();
  // depending on the button pressed / previous path
  // resumeGame();
});

onUnmounted(() => {
  store.stopTimer();
});
</script>

<style lang="scss" scoped>
.toolbar-section {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 5rem 10rem;
}

.game-section {
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;

  // @include respond(tab-port) {
  flex-direction: column;
  // }
}
</style>
