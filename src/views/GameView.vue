<template>
  <div class="game">
    <header class="game__toolbar">
      <IconButton
        :icon="mdiChevronLeft"
        label="Back to home"
        @click="router.push({ name: 'home' })"
      />
      <div class="game__timer" role="timer" aria-label="Elapsed time">{{ formattedTime }}</div>
      <IconButton
        :icon="mdiRestore"
        label="Restart"
        :disabled="!store.isInProgress"
        @click="restartDialog?.open()"
      />
    </header>
    <section class="game__play" aria-label="Game">
      <GameBoard />
      <NumberPad />
    </section>
  </div>
  <ConfirmDialog
    ref="restartDialog"
    title="Restart this puzzle?"
    message="All your digits, notes and the time will be cleared."
    confirm-label="Restart"
    @confirm="store.restart"
  />
  <EndGameDialog />
</template>

<script setup lang="ts">
import ConfirmDialog from '@/components/base/ConfirmDialog.vue';
import IconButton from '@/components/base/IconButton.vue';
import GameBoard from '@/components/Board/GameBoard.vue';
import EndGameDialog from '@/components/EndGameDialog/EndGameDialog.vue';
import NumberPad from '@/components/NumberPad/NumberPad.vue';
import { useGameClock } from '@/composables/useGameClock';
import { useGameKeyboard } from '@/composables/useGameKeyboard';
import { useGameStore } from '@/stores/game';
import { mdiChevronLeft, mdiRestore } from '@mdi/js';
import { computed, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

/**
 * The game screen: toolbar with the timer and restart, the board and the number pad.
 * The pad sits beside the board on wide screens and below it on narrow ones.
 */
const store = useGameStore();
const router = useRouter();
const restartDialog = useTemplateRef<InstanceType<typeof ConfirmDialog>>('restartDialog');
const { elapsedMs } = useGameClock();
useGameKeyboard();

if (store.status === 'idle') {
  router.replace({ name: 'home' });
}

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(elapsedMs.value / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => part.toString().padStart(2, '0')).join(':');
});
</script>

<style scoped>
.game {
  --board-size: min(100%, 58dvh);
  --pad-columns: 5;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.game__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: var(--board-size);
}

.game__timer {
  font-size: 1.25rem;
  font-variant-numeric: tabular-nums;
}

.game__play {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.game__play > .pad {
  max-width: 28rem;
}

@media (min-width: 480px) {
  .game {
    --pad-columns: 9;
  }
}

@media (min-width: 768px) and (min-aspect-ratio: 1/1) {
  .game {
    --board-size: min(94vw - 20rem, 70dvh);
    --pad-columns: 3;
  }

  .game__toolbar {
    max-width: calc(var(--board-size) + 18rem);
  }

  .game__play {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 2rem;
  }

  .game__play > .pad {
    width: 16rem;
  }
}
</style>
