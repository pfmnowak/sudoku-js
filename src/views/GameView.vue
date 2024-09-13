<template>
  <section class="toolbar-section">
    <IconButton icon="icon-chevron-left" @click="$router.push({ path: '/', replace: true })" />
    <!-- <IconButtonMDI icon="$prev" @click="$router.push({ path: '/', replace: true })" /> -->
    <div class="timer"></div>
    <IconButton icon="icon-rotate-left" @click="() => {}" />
  </section>
  <section id="game" class="game-section">
    <BoardTable />
    <NumberContainer />
  </section>
</template>

<script setup lang="ts">
import IconButton from '@/components/base/IconButton.vue';
import BoardTable from '@/components/Board/BoardTable.vue';
import NumberContainer from '@/components/NumberContainer/NumberContainer.vue';
import { useGameStateStore } from '@/store';
import { onMounted } from 'vue';

const store = useGameStateStore();

const startGame = () => {
  getData();
  loadData();
};

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
  // Show number container
  // document.querySelector('.number-container').classList.remove('hidden');
  // setNumberContainerVisible

  // Activate the board
  store.disableSelect = false;

  // ToDo: Reset will do these too
  // Clear previous board
  // clearState();
  // Store current board
  store.currentBoard = [...store.board].map((position) => {
    return {
      value: position,
      disabled: position !== '-'
    };
  });

  // Start the timer
  // startTimer();
};

onMounted(() => {
  startGame();
  // depending on the button pressed / previous path
  // resumeGame();
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
