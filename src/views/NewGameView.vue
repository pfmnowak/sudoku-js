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

    <BaseButton title="Start a Game!" class="button--cta" @click="startGame" />
  </section>
</template>

<script setup lang="ts">
import AppIcon from '@/components/base/AppIcon.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import IconButton from '@/components/base/IconButton.vue';
import { pickPuzzle, type Difficulty } from '@/engine/puzzles';
import { useGameStateStore } from '@/store';
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
  { value: 'beginner', label: 'Beginner', icon: mdiEmoticonExcitedOutline },
  { value: 'easy', label: 'Easy', icon: mdiEmoticonHappyOutline },
  { value: 'medium', label: 'Standard', icon: mdiEmoticonNeutralOutline },
  { value: 'hard', label: 'Hard', icon: mdiEmoticonAngryOutline },
  { value: 'master', label: 'Master', icon: mdiEmoticonDevilOutline }
];

const store = useGameStateStore();
const router = useRouter();
const difficulty = ref<Difficulty>('medium');

/** Loads a random puzzle of the chosen difficulty into the store and opens the game view. */
const startGame = () => {
  setDifficulty();
  router.push({ path: '/game', query: { mode: 'new' } });
};

/** Picks a random puzzle of the selected difficulty from the bank and writes it to the store. */
const setDifficulty = () => {
  const { puzzle, solution } = pickPuzzle(difficulty.value);

  store.solution = solution;
  store.initialBoard = puzzle;
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
      background-color: rgba(255, 255, 255, 0.08);
    }

    &[aria-pressed='true'] {
      background-color: rgba(255, 255, 255, 0.16);
      color: #fff;
    }
  }
}
</style>
