import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { EMPTY } from '@/engine/board';
import { useGameStore } from '@/stores/game';
import NumberPad from '../NumberPad.vue';

const setup = () => {
  const store = useGameStore();
  store.newGame('easy', () => 0);
  const wrapper = mount(NumberPad);
  const digit = (value: number) => wrapper.findAll('.pad__digit')[value - 1];
  const action = (name: string) =>
    wrapper.findAll('.pad__action').find((button) => button.text().startsWith(name))!;
  return { store, wrapper, digit, action, emptyIndex: store.cells.indexOf(EMPTY) };
};

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe('NumberPad', () => {
  it('shows how many of each digit are left', () => {
    const { store, digit } = setup();
    expect(digit(4).text()).toBe(`4${store.remainingCounts[4]}`);
    expect(digit(4).attributes('aria-label')).toBe(`4, ${store.remainingCounts[4]} left`);
  });

  it('enters a digit into the selected cell', async () => {
    const { store, digit, emptyIndex } = setup();
    store.selectCell(emptyIndex);
    await digit(6).trigger('click');
    expect(store.cells[emptyIndex]).toBe(6);
  });

  it('picks a digit when no cell is selected', async () => {
    const { store, digit } = setup();
    await digit(3).trigger('click');
    expect(store.selectedDigit).toBe(3);
    expect(digit(3).attributes('aria-pressed')).toBe('true');
  });

  it('erases, undoes and redoes', async () => {
    const { store, action, emptyIndex } = setup();
    expect(action('Undo').attributes('disabled')).toBeDefined();
    store.selectCell(emptyIndex);
    store.placeDigit(5);
    await action('Erase').trigger('click');
    expect(store.cells[emptyIndex]).toBe(EMPTY);
    await action('Undo').trigger('click');
    expect(store.cells[emptyIndex]).toBe(5);
    await action('Redo').trigger('click');
    expect(store.cells[emptyIndex]).toBe(EMPTY);
  });

  it('toggles notes mode', async () => {
    const { store, action } = setup();
    await action('Notes').trigger('click');
    expect(store.notesMode).toBe(true);
    expect(action('Notes').attributes('aria-pressed')).toBe('true');
    expect(action('Notes').text()).toContain('Notes on');
  });
});
