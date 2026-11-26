import { enableAutoUnmount, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent } from 'vue';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EMPTY, digitBit } from '@/engine/board';
import { useGameStore } from '@/stores/game';
import { useGameKeyboard } from '../useGameKeyboard';

const Host = defineComponent({
  setup: () => {
    useGameKeyboard();
    return () => null;
  }
});

const press = (key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init });
  window.dispatchEvent(event);
  return event;
};

const pressDigit = (digit: number, init: KeyboardEventInit = {}) =>
  press(String(digit), { code: `Digit${digit}`, ...init });

const setup = () => {
  const store = useGameStore();
  store.newGame('easy', () => 0);
  const wrapper = mount(Host);
  return { store, wrapper, emptyIndex: store.cells.indexOf(EMPTY) };
};

enableAutoUnmount(afterEach);

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe('useGameKeyboard', () => {
  it('moves the selection with the arrows and clears it with Escape', () => {
    const { store } = setup();
    const event = press('ArrowRight');
    expect(store.selectedCell).toBe(0);
    expect(event.defaultPrevented).toBe(true);
    press('ArrowDown');
    press('ArrowRight');
    expect(store.selectedCell).toBe(10);
    press('Escape');
    expect(store.selectedCell).toBeNull();
  });

  it('enters, notes and erases digits in the selected cell', () => {
    const { store, emptyIndex } = setup();
    store.selectCell(emptyIndex);
    pressDigit(4, { shiftKey: true });
    expect(store.notes[emptyIndex]).toBe(digitBit(4));
    press('Numpad7', { code: 'Numpad7' });
    pressDigit(7);
    expect(store.cells[emptyIndex]).toBe(7);
    press('Backspace');
    expect(store.cells[emptyIndex]).toBe(EMPTY);
  });

  it('enters notes in notes mode toggled with N', () => {
    const { store, emptyIndex } = setup();
    store.selectCell(emptyIndex);
    press('n');
    expect(store.notesMode).toBe(true);
    pressDigit(2);
    expect(store.notes[emptyIndex]).toBe(digitBit(2));
  });

  it('picks a digit when no cell is selected', () => {
    const { store } = setup();
    pressDigit(5);
    expect(store.selectedDigit).toBe(5);
  });

  it('undoes and redoes with Ctrl+Z, Ctrl+Y and Ctrl+Shift+Z', () => {
    const { store, emptyIndex } = setup();
    store.placeDigit(3, emptyIndex);
    press('z', { ctrlKey: true });
    expect(store.cells[emptyIndex]).toBe(EMPTY);
    press('y', { ctrlKey: true });
    expect(store.cells[emptyIndex]).toBe(3);
    press('z', { ctrlKey: true });
    press('Z', { ctrlKey: true, shiftKey: true });
    expect(store.cells[emptyIndex]).toBe(3);
  });

  it('leaves other keys, paused games and unmounted views alone', () => {
    const { store, wrapper } = setup();
    expect(press('Tab').defaultPrevented).toBe(false);
    expect(press('c', { ctrlKey: true }).defaultPrevented).toBe(false);
    store.pause();
    expect(press('ArrowRight').defaultPrevented).toBe(false);
    store.resume();
    wrapper.unmount();
    press('ArrowRight');
    expect(store.selectedCell).toBeNull();
  });
});
