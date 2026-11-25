import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useGameStore } from '@/stores/game';

const TICK_MS = 250;

/**
 * Runs the game clock while the component using it is mounted: resumes the game on mount,
 * pauses it on unmount and whenever the tab is hidden, and ticks a reactive `now`
 * so the elapsed time can be shown live.
 * @returns `elapsedMs` — total play time, updated every tick
 */
export const useGameClock = () => {
  const store = useGameStore();
  const now = ref(Date.now());
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const onVisibilityChange = () => {
    if (document.hidden) {
      store.pause();
    } else {
      store.resume();
    }
  };

  onMounted(() => {
    store.resume();
    intervalId = setInterval(() => {
      now.value = Date.now();
    }, TICK_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);
  });

  onUnmounted(() => {
    store.pause();
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  });

  const elapsedMs = computed(() => store.elapsedAt(now.value));

  return { elapsedMs };
};
