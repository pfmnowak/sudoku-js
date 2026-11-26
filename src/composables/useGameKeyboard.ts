import { onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/game';

const ARROW_STEPS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1]
};

const isTextField = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/** Reads a digit 1–9 from the top row or the numpad, independent of Shift and the keyboard layout. */
const digitOf = (event: KeyboardEvent): number | null => {
  const match = /^(?:Digit|Numpad)([1-9])$/.exec(event.code);
  return match ? Number(match[1]) : null;
};

/**
 * Keyboard controls for the game while the component using it is mounted:
 * - arrows move the selection, Escape clears it
 * - 1–9 enter a digit into the selected cell (as a note in notes mode, or with Shift held);
 *   with no cell selected they pick the digit for digit-first input
 * - Backspace, Delete or 0 erase the selected cell
 * - N toggles notes mode
 * - Ctrl/Cmd+Z undoes, Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z redoes
 *
 * Keys are left alone while a text field has focus or a dialog is open.
 */
export const useGameKeyboard = () => {
  const store = useGameStore();

  const handleShortcut = (event: KeyboardEvent): boolean => {
    const key = event.key.toLowerCase();
    if (key === 'z' && !event.shiftKey) {
      store.undo();
      return true;
    }
    if (key === 'y' || (key === 'z' && event.shiftKey)) {
      store.redo();
      return true;
    }
    return false;
  };

  const handleKey = (event: KeyboardEvent): boolean => {
    const step = ARROW_STEPS[event.key];
    if (step) {
      store.moveSelection(...step);
      return true;
    }
    const digit = digitOf(event);
    if (digit !== null) {
      if (store.selectedCell === null) {
        store.pressDigit(digit);
      } else if (event.shiftKey) {
        store.toggleNote(digit);
      } else {
        store.input(digit);
      }
      return true;
    }
    if (['Backspace', 'Delete', '0'].includes(event.key)) {
      store.erase();
      return true;
    }
    if (event.key.toLowerCase() === 'n') {
      store.toggleNotesMode();
      return true;
    }
    if (event.key === 'Escape') {
      store.clearSelection();
      return true;
    }
    return false;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      isTextField(event.target) ||
      document.querySelector('dialog[open]')
    ) {
      return;
    }
    if (store.status !== 'playing') {
      return;
    }
    const handled = event.ctrlKey || event.metaKey ? handleShortcut(event) : handleKey(event);
    if (handled) {
      event.preventDefault();
    }
  };

  onMounted(() => window.addEventListener('keydown', onKeyDown));
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown));
};
