<template>
  <dialog ref="dialog" class="end-game-dialog" :aria-labelledby="titleId">
    <IconButton
      :icon="mdiClose"
      label="Show the board"
      class="end-game-dialog__close"
      @click="dialog?.close()"
    />
    <AppIcon :path="mdiTrophyOutline" class="end-game-dialog__trophy" />
    <h2 :id="titleId" class="end-game-dialog__title">Puzzle solved!</h2>
    <p class="end-game-dialog__summary">
      You solved {{ levelArticle }} {{ levelLabel }} puzzle in
      <strong>{{ formatDuration(store.elapsedMs) }}</strong>.
    </p>
    <p v-if="store.isNewBest" class="end-game-dialog__badge">New best time!</p>
    <dl class="end-game-dialog__stats">
      <div v-if="!store.isNewBest && bestMs !== null">
        <dt>Best time</dt>
        <dd>{{ formatClock(bestMs) }}</dd>
      </div>
      <div>
        <dt>Win streak</dt>
        <dd>{{ stats.currentStreak }}</dd>
      </div>
    </dl>
    <div class="end-game-dialog__actions">
      <BaseButton title="Back to menu" class="button--compact" @click="leave('home')" />
      <BaseButton
        title="New game"
        class="button--compact button--cta"
        autofocus
        @click="leave('newGame')"
      />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import AppIcon from '@/components/base/AppIcon.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import IconButton from '@/components/base/IconButton.vue';
import { useGameStore } from '@/stores/game';
import { useStatsStore } from '@/stores/stats';
import { DIFFICULTY_LABELS } from '@/utils/difficulty';
import { formatClock, formatDuration } from '@/utils/time';
import { mdiClose, mdiTrophyOutline } from '@mdi/js';
import { computed, useId, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';

/**
 * Win screen, built on the native `<dialog>`: the solving time in words, a new best time or
 * the level's best, the win streak, and the way on (a new game or the menu). Closing it shows
 * the solved board. It opens on the transition to `won` only, so a won game restored after
 * a reload does not reopen it.
 */
const store = useGameStore();
const stats = useStatsStore();
const router = useRouter();
const dialog = useTemplateRef<HTMLDialogElement>('dialog');
const titleId = useId();

const levelLabel = computed(() => (store.difficulty ? DIFFICULTY_LABELS[store.difficulty] : ''));
const levelArticle = computed(() => (/^[aeiou]/i.test(levelLabel.value) ? 'an' : 'a'));
const bestMs = computed(() => (store.difficulty ? stats.levels[store.difficulty].bestMs : null));

const leave = (route: 'home' | 'newGame') => {
  dialog.value?.close();
  router.push({ name: route });
};

watch(
  () => store.status,
  (status, previous) => {
    if (status === 'won' && previous === 'playing') {
      dialog.value?.showModal();
    }
  }
);
</script>

<style scoped>
.end-game-dialog {
  position: relative;
  width: min(380px, calc(100vw - 2rem));
  margin: auto;
  padding: 2rem 1.5rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  background: var(--color-surface);
  color: var(--color-text);
  text-align: center;
}

.end-game-dialog::backdrop {
  background: var(--color-backdrop);
}

.end-game-dialog__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.end-game-dialog__trophy {
  font-size: 2.5rem;
  color: var(--color-accent);
}

.end-game-dialog__title {
  margin: 0.25rem 0 0.75rem;
  color: var(--color-text-strong);
  font-size: 1.5rem;
  font-weight: 600;
}

.end-game-dialog__summary strong {
  color: var(--color-text-strong);
  font-weight: 600;
}

.end-game-dialog__badge {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.2rem 0.75rem;
  border-radius: 1rem;
  background-color: var(--color-accent);
  color: var(--color-on-accent);
  font-weight: 600;
}

.end-game-dialog__stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.end-game-dialog__stats dt {
  font-size: 0.8rem;
  text-transform: uppercase;
}

.end-game-dialog__stats dd {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1.3rem;
  font-variant-numeric: tabular-nums;
}

.end-game-dialog__actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
