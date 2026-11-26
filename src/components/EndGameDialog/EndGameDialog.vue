<template>
  <dialog ref="dialog" class="end-game-dialog">
    <h2 class="end-game-dialog__title">
      <AppIcon :path="mdiTrophyOutline" />
      Congratulations!
    </h2>
    <p>🏆 You have completed the Sudoku puzzle in {{ formattedTime }} 🥳</p>
    <div class="end-game-dialog__actions">
      <BaseButton title="Ok" class="button--cta" @click="dialog?.close()" />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import AppIcon from '@/components/base/AppIcon.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import { useGameStore } from '@/stores/game';
import { mdiTrophyOutline } from '@mdi/js';
import { computed, ref, watch } from 'vue';

/**
 * Modal shown when the puzzle gets solved, built on the native `<dialog>` element.
 * It opens on the transition to `won` only, so a won game restored after a reload does not reopen it.
 */
const store = useGameStore();
const dialog = ref<HTMLDialogElement>();

watch(
  () => store.status,
  (status, previous) => {
    if (status === 'won' && previous === 'playing') {
      dialog.value?.showModal();
    }
  }
);

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(store.elapsedAt() / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours ? hours + ' hours, ' : ''}${minutes ? minutes + ' minutes and ' : ''}${seconds} seconds`;
});
</script>

<style scoped>
.end-game-dialog {
  max-width: 400px;
  margin: auto;
  padding: 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
}

.end-game-dialog::backdrop {
  background: var(--color-backdrop);
}

.end-game-dialog__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--color-text-strong);
}

.end-game-dialog__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>
