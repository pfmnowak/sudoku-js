import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { getPuzzle } from '@/engine/puzzles';
import { createMemoryHistory, createRouter } from 'vue-router';
import { EMPTY } from '@/engine/board';
import { useGameStore } from '@/stores/game';
import { useStatsStore } from '@/stores/stats';
import EndGameDialog from '../EndGameDialog.vue';

const setup = async () => {
  const stub = { template: '<div />' };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: stub },
      { path: '/new-game', name: 'newGame', component: stub },
      { path: '/game', name: 'game', component: stub }
    ]
  });
  await router.push('/game');
  const wrapper = mount(EndGameDialog, { global: { plugins: [router] }, attachTo: document.body });
  const dialog = wrapper.get('dialog').element as HTMLDialogElement;
  return { wrapper, router, dialog };
};

const solve = async () => {
  const store = useGameStore();
  store.cells.forEach((value, index) => {
    if (value === EMPTY) {
      store.placeDigit(store.solution[index], index);
    }
  });
  await nextTick();
  return store;
};

enableAutoUnmount(afterEach);

beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.open = false;
  };
});

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
  useGameStore().newGame(
    'easy',
    getPuzzle('easy', () => 0)
  );
});

describe('EndGameDialog', () => {
  it('opens on a win with the time, a new best badge and the streak', async () => {
    const { wrapper, dialog } = await setup();
    expect(dialog.open).toBe(false);
    const store = await solve();
    store.elapsedMs = 125_000;
    await nextTick();
    expect(dialog.open).toBe(true);
    expect(wrapper.text()).toContain('You solved an Easy puzzle in 2 minutes and 5 seconds.');
    expect(wrapper.text()).toContain('New best time!');
    expect(wrapper.text()).toContain('Win streak1');
  });

  it('shows the level best instead of the badge when the time is not a record', async () => {
    useStatsStore().recordWin('easy', 0);
    const { wrapper } = await setup();
    await solve();
    expect(wrapper.text()).not.toContain('New best time!');
    expect(wrapper.text()).toContain('Best time0:00');
  });

  it('goes to a new game or back to the menu', async () => {
    const { wrapper, router, dialog } = await setup();
    await solve();
    const [menu, newGame] = wrapper.findAll('.end-game-dialog__actions button');
    await newGame.trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.name).toBe('newGame');
    expect(dialog.open).toBe(false);

    await router.push('/game');
    dialog.showModal();
    await menu.trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.name).toBe('home');
  });
});
