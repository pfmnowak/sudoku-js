<template>
  <dialog ref="dialog" class="end-game-dialog" @close="store.endGameModalOpen = false">
    <h2 class="end-game-dialog__title">
      <AppIcon :path="mdiTrophyOutline" />
      Congratulations!
    </h2>
    <p>🏆 You have completed the Sudoku puzzle in {{ formattedTime }} 🥳</p>
    <div class="end-game-dialog__actions">
      <BaseButton title="Ok" class="button--cta" @click="store.endGameModalOpen = false" />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import AppIcon from '@/components/base/AppIcon.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import { useGameStateStore } from '@/store';
import { mdiTrophyOutline } from '@mdi/js';
import { computed, ref, watch } from 'vue';

/**
 * Modal shown after the puzzle is solved, built on the native `<dialog>` element.
 * Visibility mirrors `store.endGameModalOpen`; closing it (button or Esc) resets that flag.
 */
const store = useGameStateStore();
const dialog = ref<HTMLDialogElement>();

watch(
  () => store.endGameModalOpen,
  (isOpen) => {
    if (isOpen) {
      dialog.value?.showModal();
    } else {
      dialog.value?.close();
    }
  }
);

const formattedTime = computed(() => {
  const hours = Math.floor(store.timer / 3600).toString();
  const minutes = Math.floor((store.timer % 3600) / 60).toString();
  const seconds = (store.timer % 60).toString();

  return `${hours && hours !== '0' ? hours + ' hours, ' : ''}${minutes && minutes !== '0' ? minutes + ' minutes and ' : ''}${seconds} seconds`;
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
  background: rgba(0, 0, 0, 0.6);
}

.end-game-dialog__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #fff;
}

.end-game-dialog__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>
