<template>
  <section class="toolbar-section">
    <IconButton
      :icon="mdiChevronLeft"
      label="Back to home"
      @click="$router.push({ path: '/', replace: true })"
    />
  </section>

  <section class="new-game">
    <h1>New game</h1>
    <h3>Choose a difficulty</h3>

    <div class="difficulty-picker" role="group" aria-label="Difficulty">
      <button
        v-for="option in difficultyOptions"
        :key="option.value"
        type="button"
        class="difficulty-picker__option"
        :aria-pressed="difficulty === option.value"
        @click="difficulty = option.value"
      >
        <AppIcon :path="option.icon" />
        {{ option.label }}
      </button>
    </div>

    <BaseButton
      :title="isGenerating ? 'Generating…' : 'Start a Game!'"
      class="button--cta"
      :disabled="isGenerating"
      :aria-busy="isGenerating"
      @click="startGame"
    />
  </section>
</template>

<script setup lang="ts">
import AppIcon from '@/components/base/AppIcon.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import IconButton from '@/components/base/IconButton.vue';
import { type Difficulty } from '@/engine/puzzles';
import { useGameStore } from '@/stores/game';
import { createPuzzle } from '@/workers/createPuzzle';
import { DIFFICULTY_LABELS } from '@/utils/difficulty';
import {
  mdiChevronLeft,
  mdiEmoticonAngryOutline,
  mdiEmoticonDevilOutline,
  mdiEmoticonExcitedOutline,
  mdiEmoticonHappyOutline,
  mdiEmoticonNeutralOutline
} from '@mdi/js';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const difficultyOptions: { value: Difficulty; label: string; icon: string }[] = [
  { value: 'beginner', label: DIFFICULTY_LABELS.beginner, icon: mdiEmoticonExcitedOutline },
  { value: 'easy', label: DIFFICULTY_LABELS.easy, icon: mdiEmoticonHappyOutline },
  { value: 'medium', label: DIFFICULTY_LABELS.medium, icon: mdiEmoticonNeutralOutline },
  { value: 'hard', label: DIFFICULTY_LABELS.hard, icon: mdiEmoticonAngryOutline },
  { value: 'master', label: DIFFICULTY_LABELS.master, icon: mdiEmoticonDevilOutline }
];

const store = useGameStore();
const router = useRouter();
const difficulty = ref<Difficulty>('medium');
const isGenerating = ref(false);

/** Generates a puzzle of the chosen difficulty, starts the game with it and opens the game view. */
const startGame = async () => {
  isGenerating.value = true;
  const level = difficulty.value;
  const entry = await createPuzzle(level);
  store.newGame(level, entry);
  router.push({ name: 'game' });
};
</script>

<style lang="scss" scoped>
.new-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.difficulty-picker {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;

  &__option {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.4rem;
    background: transparent;
    color: inherit;
    font: inherit;
    text-transform: uppercase;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-hover);
    }

    &[aria-pressed='true'] {
      border-color: var(--color-accent);
      background-color: var(--color-accent);
      color: var(--color-on-accent);
    }
  }
}
</style>
