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
import { type Difficulty } from '@/engine/puzzles';
import { useGameStore } from '@/stores/game';
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

const store = useGameStore();
const router = useRouter();
const difficulty = ref<Difficulty>('medium');

/** Starts a game of the chosen difficulty and opens the game view. */
const startGame = () => {
  store.newGame(difficulty.value);
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
      background-color: rgba(255, 255, 255, 0.08);
    }

    &[aria-pressed='true'] {
      background-color: rgba(255, 255, 255, 0.16);
      color: #fff;
    }
  }
}
</style>
