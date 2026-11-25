import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { EMPTY, digitBit } from '@/engine/board';
import { useGameStore } from '../game';

const startGame = () => {
  const store = useGameStore();
  store.newGame('easy', () => 0);
  return store;
};

const emptyCells = (store: ReturnType<typeof useGameStore>) =>
  Array.from(store.cells.keys()).filter((i) => store.cells[i] === EMPTY);

const givenCell = (store: ReturnType<typeof useGameStore>) => store.givens.indexOf(1);

/** A wrong digit for the cell: anything but its solution. */
const wrongDigit = (store: ReturnType<typeof useGameStore>, index: number) =>
  (store.solution[index] % 9) + 1;

const fillAllButOne = (store: ReturnType<typeof useGameStore>) => {
  const [last, ...rest] = emptyCells(store);
  for (const index of rest) {
    store.placeDigit(store.solution[index], index);
  }
  return last;
};

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('newGame', () => {
  it('starts idle and loads a playable board', () => {
    const store = useGameStore();
    expect(store.status).toBe('idle');
    expect(store.isInProgress).toBe(false);

    store.newGame('easy', () => 0);
    expect(store.status).toBe('playing');
    expect(store.isInProgress).toBe(true);
    expect(store.difficulty).toBe('easy');
    expect(store.puzzle).toMatch(/^[1-9-]{81}$/);
    store.cells.forEach((value, i) => {
      expect(store.givens[i]).toBe(value === EMPTY ? 0 : 1);
      if (value !== EMPTY) {
        expect(value).toBe(store.solution[i]);
      }
    });
    expect(store.notes.every((mask) => mask === 0)).toBe(true);
  });

  it('resets selection and input mode', () => {
    const store = startGame();
    store.selectCell(3);
    store.selectDigit(4);
    store.toggleNotesMode();
    store.newGame('hard');
    expect(store.selectedCell).toBeNull();
    expect(store.selectedDigit).toBeNull();
    expect(store.notesMode).toBe(false);
  });
});

describe('placeDigit and erase', () => {
  it('places a digit in the selected cell and clears its notes', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.selectCell(index);
    store.toggleNote(5);
    store.placeDigit(store.solution[index]);
    expect(store.cells[index]).toBe(store.solution[index]);
    expect(store.notes[index]).toBe(0);
  });

  it('ignores given cells and a missing selection', () => {
    const store = startGame();
    const given = givenCell(store);
    const before = store.cells[given];
    store.placeDigit(wrongDigit(store, given), given);
    store.erase(given);
    expect(store.cells[given]).toBe(before);

    const cellsBefore = store.cells;
    store.placeDigit(1);
    expect(store.cells).toBe(cellsBefore);
  });

  it('erases a placed digit', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.placeDigit(wrongDigit(store, index), index);
    store.erase(index);
    expect(store.cells[index]).toBe(EMPTY);
  });

  it('reports conflicts for a clashing digit', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    const rowStart = index - (index % 9);
    const clash = Array.from({ length: 9 }, (_, c) => rowStart + c).find(
      (i) => store.cells[i] !== EMPTY
    );
    expect(clash).toBeDefined();
    store.placeDigit(store.cells[clash!], index);
    expect(store.conflicts.has(index)).toBe(true);
    expect(store.conflicts.has(clash!)).toBe(true);
  });
});

describe('notes', () => {
  it('toggles a note on and off in an empty cell', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.toggleNote(3, index);
    store.toggleNote(7, index);
    expect(store.notes[index]).toBe(digitBit(3) | digitBit(7));
    store.toggleNote(3, index);
    expect(store.notes[index]).toBe(digitBit(7));
  });

  it('does not add notes to a filled cell', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.placeDigit(1, index);
    store.toggleNote(2, index);
    expect(store.notes[index]).toBe(0);
  });

  it('routes input through the notes mode', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.selectCell(index);
    store.toggleNotesMode();
    store.input(4);
    expect(store.notes[index]).toBe(digitBit(4));
    expect(store.cells[index]).toBe(EMPTY);
    store.toggleNotesMode();
    store.input(4);
    expect(store.cells[index]).toBe(4);
  });
});

describe('selection', () => {
  it('toggles the picked digit and derives the highlighted digit', () => {
    const store = startGame();
    const given = givenCell(store);
    store.selectCell(given);
    expect(store.highlightedDigit).toBe(store.cells[given]);

    store.selectDigit(6);
    expect(store.highlightedDigit).toBe(6);
    store.selectDigit(6);
    expect(store.selectedDigit).toBeNull();

    store.selectDigit(EMPTY);
    expect(store.highlightedDigit).toBeNull();
  });
});

describe('win detection', () => {
  it('does not win on a full board with a wrong digit', () => {
    const store = startGame();
    const last = fillAllButOne(store);
    store.placeDigit(wrongDigit(store, last), last);
    expect(store.status).toBe('playing');
  });

  it('wins when the board matches the solution and locks input', () => {
    const store = startGame();
    const last = fillAllButOne(store);
    store.selectCell(last);
    store.placeDigit(store.solution[last]);
    expect(store.status).toBe('won');
    expect(store.isInProgress).toBe(false);
    expect(store.selectedCell).toBeNull();

    store.erase(last);
    expect(store.cells[last]).toBe(store.solution[last]);
  });
});

describe('undo and redo', () => {
  it('undoes and redoes moves in order', () => {
    const store = startGame();
    const [a, b] = emptyCells(store);
    store.placeDigit(1, a);
    store.toggleNote(2, b);
    store.toggleNote(3, b);
    expect(store.canUndo).toBe(true);
    expect(store.canRedo).toBe(false);

    store.undo();
    expect(store.notes[b]).toBe(digitBit(2));
    expect(store.selectedCell).toBe(b);
    store.undo();
    store.undo();
    expect(store.cells[a]).toBe(EMPTY);
    expect(store.notes[b]).toBe(0);
    expect(store.canUndo).toBe(false);

    store.redo();
    expect(store.cells[a]).toBe(1);
    store.redo();
    store.redo();
    expect(store.notes[b]).toBe(digitBit(2) | digitBit(3));
    expect(store.canRedo).toBe(false);
  });

  it('restores the notes a placed digit wiped out', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.toggleNote(5, index);
    store.placeDigit(4, index);
    store.undo();
    expect(store.cells[index]).toBe(EMPTY);
    expect(store.notes[index]).toBe(digitBit(5));
  });

  it('drops the redo stack on a new move', () => {
    const store = startGame();
    const [a, b] = emptyCells(store);
    store.placeDigit(1, a);
    store.undo();
    store.placeDigit(2, b);
    expect(store.canRedo).toBe(false);
    store.redo();
    expect(store.cells[a]).toBe(EMPTY);
  });

  it('does not record moves that change nothing', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.erase(index);
    store.placeDigit(3, index);
    store.placeDigit(3, index);
    expect(store.history).toHaveLength(1);
  });

  it('blocks undo once the game is won', () => {
    const store = startGame();
    const last = fillAllButOne(store);
    store.placeDigit(store.solution[last], last);
    expect(store.status).toBe('won');
    expect(store.canUndo).toBe(false);
    store.undo();
    expect(store.cells[last]).toBe(store.solution[last]);
  });

  it('starts every new game with empty history', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.placeDigit(1, index);
    store.newGame('easy');
    expect(store.history).toHaveLength(0);
    expect(store.future).toHaveLength(0);
  });
});
