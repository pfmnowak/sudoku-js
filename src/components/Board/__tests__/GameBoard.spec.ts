import { enableAutoUnmount, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EMPTY, PEERS } from '@/engine/board';
import { useGameStore } from '@/stores/game';
import { useSettingsStore } from '@/stores/settings';
import GameBoard from '../GameBoard.vue';

const setup = () => {
  const store = useGameStore();
  store.newGame('easy', () => 0);
  const wrapper = mount(GameBoard, { attachTo: document.body });
  const cell = (index: number) => wrapper.get(`[data-index="${index}"]`);
  const emptyIndex = store.cells.indexOf(EMPTY);
  return { store, wrapper, cell, emptyIndex };
};

enableAutoUnmount(afterEach);

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe('GameBoard', () => {
  it('renders 81 grid cells in 9 rows with the givens', () => {
    const { store, wrapper, cell } = setup();
    expect(wrapper.findAll('[role="row"]')).toHaveLength(9);
    expect(wrapper.findAll('[role="gridcell"]')).toHaveLength(81);
    const given = store.givens.indexOf(1);
    expect(cell(given).text()).toBe(String(store.cells[given]));
    expect(cell(given).classes()).toContain('cell--given');
  });

  it('selects a cell on click and shades its row, column and box', async () => {
    const { store, wrapper, cell, emptyIndex } = setup();
    await cell(emptyIndex).trigger('click');
    expect(store.selectedCell).toBe(emptyIndex);
    expect(cell(emptyIndex).attributes('aria-selected')).toBe('true');
    expect(wrapper.findAll('.cell--peer')).toHaveLength(PEERS[emptyIndex].length);
  });

  it('keeps a single tab stop on the selected cell', async () => {
    const { wrapper, cell, emptyIndex } = setup();
    expect(wrapper.findAll('[tabindex="0"]')).toHaveLength(1);
    expect(cell(0).attributes('tabindex')).toBe('0');
    await cell(emptyIndex).trigger('click');
    expect(wrapper.findAll('[tabindex="0"]')).toHaveLength(1);
    expect(cell(emptyIndex).attributes('tabindex')).toBe('0');
  });

  it('highlights cells holding the selected digit', async () => {
    const { store, wrapper, cell } = setup();
    const given = store.givens.indexOf(1);
    const digit = store.cells[given];
    await cell(given).trigger('click');
    const sameDigit = store.cells.filter((value) => value === digit).length;
    expect(wrapper.findAll('.cell--same-digit')).toHaveLength(sameDigit - 1);
  });

  it('marks conflicting cells as mistakes', async () => {
    const { store, cell } = setup();
    const given = store.givens.indexOf(1);
    const peer = PEERS[given].find((index) => store.cells[index] === EMPTY)!;
    store.placeDigit(store.cells[given], peer);
    await nextTick();
    expect(cell(peer).classes()).toContain('cell--mistake');
    expect(cell(given).classes()).toContain('cell--mistake');
    expect(cell(peer).attributes('aria-invalid')).toBe('true');
  });

  it('marks every digit that differs from the solution in solution mode, and nothing when off', async () => {
    const { store, cell } = setup();
    const settings = useSettingsStore();
    const isQuietWrong = (index: number, digit: number) =>
      digit !== store.solution[index] && PEERS[index].every((peer) => store.cells[peer] !== digit);
    const emptyIndex = store.cells.findIndex(
      (value, index) =>
        value === EMPTY && [1, 2, 3, 4, 5, 6, 7, 8, 9].some((d) => isQuietWrong(index, d))
    );
    const quietWrongDigit = [1, 2, 3, 4, 5, 6, 7, 8, 9].find((d) => isQuietWrong(emptyIndex, d));
    expect(quietWrongDigit).toBeDefined();
    store.placeDigit(quietWrongDigit!, emptyIndex);
    await nextTick();
    expect(cell(emptyIndex).classes()).not.toContain('cell--mistake');

    settings.mistakes = 'solution';
    await nextTick();
    expect(cell(emptyIndex).classes()).toContain('cell--mistake');

    settings.mistakes = 'off';
    await nextTick();
    expect(cell(emptyIndex).classes()).not.toContain('cell--mistake');
  });

  it('skips peer and same-digit shading when turned off in the settings', async () => {
    const { store, wrapper, cell } = setup();
    const settings = useSettingsStore();
    settings.highlightPeers = false;
    settings.highlightSameDigit = false;
    await cell(store.givens.indexOf(1)).trigger('click');
    expect(wrapper.findAll('.cell--peer')).toHaveLength(0);
    expect(wrapper.findAll('.cell--same-digit')).toHaveLength(0);
  });

  it('renders notes as a 3×3 mini-grid with digits in place', async () => {
    const { store, cell, emptyIndex } = setup();
    store.toggleNote(2, emptyIndex);
    store.toggleNote(9, emptyIndex);
    await nextTick();
    const notes = cell(emptyIndex).findAll('.cell__note');
    expect(notes).toHaveLength(9);
    expect(notes.map((note) => note.text())).toEqual(['', '2', '', '', '', '', '', '', '9']);
  });

  it('moves focus with the selection once the board has focus', async () => {
    const { store, cell, emptyIndex } = setup();
    (cell(emptyIndex).element as HTMLElement).focus();
    await cell(emptyIndex).trigger('click');
    store.moveSelection(0, 1);
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.activeElement?.getAttribute('data-index')).toBe(String(store.selectedCell));
  });
});
