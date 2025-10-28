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
import { useRoute } from 'vue-router';

const store = useGameStateStore();
const route = useRoute();

const formattedTime = computed(() => {
  const hours = Math.floor(store.timer / 3600);
  const minutes = Math.floor((store.timer % 3600) / 60);
  const seconds = store.timer % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const startGame = () => {
  loadData();
  store.resetTimer();
  store.startTimer();
};

const resumeGame = () => {
  store.startTimer();
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
  if (route.query.mode === 'new') {
    startGame();
  } else if (route.query.mode === 'resume') {
    resumeGame();
  }
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
