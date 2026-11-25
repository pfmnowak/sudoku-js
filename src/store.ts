import { defineStore } from 'pinia';
import { ref } from 'vue';

export type Cell = {
  value: '' | '-' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'X';
  disabled: boolean;
};

export const useGameStateStore = defineStore('gameState', () => {
  const currentBoard = ref<Cell[]>([]);
  const selectedDigitOption = ref<Cell['value']>('');
  const selectedCell = ref('');
  const highlightedValue = ref<Cell['value']>('');
  const disableSelect = ref(false);
  const solution = ref<string>('');
  const initialBoard = ref<string>('');

  const timer = ref(0);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const startTimer = () => {
    if (intervalId) {
      return;
    }
    intervalId = setInterval(() => {
      timer.value += 1;
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    timer.value = 0;
  };

  const endGameModalOpen = ref(false);

  const toggleEndGameModal = () => (endGameModalOpen.value = !endGameModalOpen.value);

  return {
    currentBoard,
    selectedDigitOption,
    selectedCell,
    highlightedValue,
    disableSelect,
    solution,
    initialBoard,
    timer,
    startTimer,
    stopTimer,
    resetTimer,
    endGameModalOpen,
    toggleEndGameModal
  };
});
