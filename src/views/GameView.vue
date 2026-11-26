<template>
  <section class="toolbar-section">
    <IconButton
      :icon="mdiChevronLeft"
      label="Back to home"
      @click="$router.push({ path: '/', replace: true })"
    />
    <div class="timer">{{ formattedTime }}</div>
    <IconButton
      :icon="mdiRestore"
      label="Restart"
      @click="$router.push({ path: '/', replace: true })"
    />
  </section>
  <section id="game" class="game-section">
    <GameBoard />
    <NumberPad />
  </section>
  <EndGameDialog />
</template>

<script setup lang="ts">
import IconButton from '@/components/base/IconButton.vue';
import { mdiChevronLeft, mdiRestore } from '@mdi/js';
import GameBoard from '@/components/Board/GameBoard.vue';
import EndGameDialog from '@/components/EndGameDialog/EndGameDialog.vue';
import NumberPad from '@/components/NumberPad/NumberPad.vue';
import { useGameClock } from '@/composables/useGameClock';
import { useGameKeyboard } from '@/composables/useGameKeyboard';
import { useGameStore } from '@/stores/game';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const store = useGameStore();
const router = useRouter();
const { elapsedMs } = useGameClock();
useGameKeyboard();

if (store.status === 'idle') {
  router.replace('/');
}

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(elapsedMs.value / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => part.toString().padStart(2, '0')).join(':');
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

  flex-direction: column;
}
</style>
