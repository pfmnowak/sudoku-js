import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EMPTY, PEERS, digitBit } from '@/engine/board';
import { GAME_STORAGE_KEY, useGameStore } from '../game';
import { useSettingsStore } from '../settings';

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
  localStorage.clear();
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.useRealTimers();
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

describe('clock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
  });

  it('counts time only while playing', () => {
    const store = startGame();
    vi.advanceTimersByTime(5_000);
    expect(store.elapsedAt()).toBe(5_000);

    store.pause();
    expect(store.status).toBe('paused');
    vi.advanceTimersByTime(60_000);
    expect(store.elapsedAt()).toBe(5_000);

    store.resume();
    vi.advanceTimersByTime(2_000);
    expect(store.elapsedAt()).toBe(7_000);
  });

  it('blocks input while paused', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.pause();
    store.placeDigit(1, index);
    expect(store.cells[index]).toBe(EMPTY);
  });

  it('freezes the time on a win and ignores pause/resume afterwards', () => {
    const store = startGame();
    const last = fillAllButOne(store);
    vi.advanceTimersByTime(3_000);
    store.placeDigit(store.solution[last], last);
    vi.advanceTimersByTime(10_000);
    expect(store.elapsedAt()).toBe(3_000);

    store.pause();
    store.resume();
    expect(store.status).toBe('won');
    expect(store.elapsedAt()).toBe(3_000);
  });

  it('resets the time for a new game', () => {
    const store = startGame();
    vi.advanceTimersByTime(3_000);
    store.newGame('easy');
    expect(store.elapsedAt()).toBe(0);
  });
});

describe('persistence', () => {
  /** Simulates a page reload: a fresh Pinia whose store restores from localStorage. */
  const reload = () => {
    setActivePinia(createPinia());
    return useGameStore();
  };

  it('saves nothing until a game starts', async () => {
    useGameStore();
    await nextTick();
    expect(localStorage.getItem(GAME_STORAGE_KEY)).toBeNull();
  });

  it('restores the board, notes, history and time after a reload, paused', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    const store = startGame();
    const [a, b] = emptyCells(store);
    store.placeDigit(7, a);
    store.toggleNote(2, b);
    store.undo();
    store.toggleNote(4, b);
    vi.advanceTimersByTime(4_000);
    store.pause();
    await nextTick();

    const restored = reload();
    expect(restored.status).toBe('paused');
    expect(restored.difficulty).toBe('easy');
    expect(restored.puzzle).toBe(store.puzzle);
    expect(restored.cells).toEqual(store.cells);
    expect(restored.givens).toEqual(store.givens);
    expect(restored.solution).toEqual(store.solution);
    expect(restored.notes).toEqual(store.notes);
    expect(restored.history).toEqual(store.history);
    expect(restored.future).toEqual(store.future);
    expect(restored.elapsedAt()).toBe(4_000);

    restored.resume();
    restored.undo();
    expect(restored.notes[b]).toBe(0);
  });

  it('brings a game that was playing back as paused', async () => {
    const store = startGame();
    store.placeDigit(1, emptyCells(store)[0]);
    await nextTick();
    expect(reload().status).toBe('paused');
  });

  it('keeps a won game won', async () => {
    const store = startGame();
    const last = fillAllButOne(store);
    store.placeDigit(store.solution[last], last);
    await nextTick();
    const restored = reload();
    expect(restored.status).toBe('won');
    expect(restored.isInProgress).toBe(false);
  });

  it('does not restart the clock when a won game is resumed', async () => {
    const store = startGame();
    const last = fillAllButOne(store);
    store.placeDigit(store.solution[last], last);
    await nextTick();
    const restored = reload();
    const finalTime = restored.elapsedAt();
    restored.resume();
    expect(restored.status).toBe('won');
    expect(restored.startedAt).toBeNull();
    expect(restored.elapsedAt(Date.now() + 60_000)).toBe(finalTime);
  });

  it('ignores a corrupted or outdated save', () => {
    localStorage.setItem(GAME_STORAGE_KEY, '{not json');
    expect(reload().status).toBe('idle');
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify({ version: 0 }));
    expect(reload().status).toBe('idle');
  });
});

describe('pressCell and pressDigit', () => {
  it('enters a digit cell-first: select a cell, then press a digit', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.pressCell(index);
    store.pressDigit(store.solution[index]);
    expect(store.cells[index]).toBe(store.solution[index]);
    expect(store.selectedCell).toBe(index);
    expect(store.selectedDigit).toBeNull();
  });

  it('erases cell-first with the eraser', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.pressCell(index);
    store.pressDigit(5);
    store.pressDigit(EMPTY);
    expect(store.cells[index]).toBe(EMPTY);
  });

  it('toggles the selection when the same cell is pressed twice', () => {
    const store = startGame();
    store.pressCell(4);
    expect(store.selectedCell).toBe(4);
    store.pressCell(4);
    expect(store.selectedCell).toBeNull();
  });

  it('enters digits digit-first: pick a digit, then press cells', () => {
    const store = startGame();
    const [first, second] = emptyCells(store);
    store.pressDigit(7);
    expect(store.selectedDigit).toBe(7);
    expect(store.selectedCell).toBeNull();
    store.pressCell(first);
    store.pressCell(second);
    expect(store.cells[first]).toBe(7);
    expect(store.cells[second]).toBe(7);
    expect(store.selectedDigit).toBe(7);
  });

  it('respects notes mode in digit-first input', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.toggleNotesMode();
    store.pressDigit(3);
    store.pressCell(index);
    expect(store.cells[index]).toBe(EMPTY);
    expect(store.notes[index]).toBe(digitBit(3));
  });

  it('erases digit-first with the picked eraser', () => {
    const store = startGame();
    const [index] = emptyCells(store);
    store.placeDigit(2, index);
    store.pressDigit(EMPTY);
    store.pressCell(index);
    expect(store.cells[index]).toBe(EMPTY);
  });

  it('switches the picked digit and drops it when pressed again', () => {
    const store = startGame();
    store.pressDigit(2);
    store.pressDigit(6);
    expect(store.selectedDigit).toBe(6);
    store.pressDigit(6);
    expect(store.selectedDigit).toBeNull();
  });

  it('does nothing while paused', () => {
    const store = startGame();
    store.pause();
    store.pressCell(0);
    store.pressDigit(1);
    expect(store.selectedCell).toBeNull();
    expect(store.selectedDigit).toBeNull();
  });
});

describe('moveSelection', () => {
  it('starts at the top-left cell and moves by rows and columns', () => {
    const store = startGame();
    store.moveSelection(0, 1);
    expect(store.selectedCell).toBe(0);
    store.moveSelection(1, 0);
    expect(store.selectedCell).toBe(9);
    store.moveSelection(0, 1);
    expect(store.selectedCell).toBe(10);
  });

  it('wraps around the board edges', () => {
    const store = startGame();
    store.selectCell(0);
    store.moveSelection(0, -1);
    expect(store.selectedCell).toBe(8);
    store.moveSelection(-1, 0);
    expect(store.selectedCell).toBe(80);
  });

  it('drops the picked digit so the highlight follows the cell', () => {
    const store = startGame();
    store.pressDigit(4);
    store.moveSelection(0, 1);
    expect(store.selectedDigit).toBeNull();
  });

  it('clears both selections at once', () => {
    const store = startGame();
    store.selectCell(5);
    store.selectDigit(5);
    store.clearSelection();
    expect(store.selectedCell).toBeNull();
    expect(store.selectedDigit).toBeNull();
  });
});

describe('remainingCounts', () => {
  it('counts how many of each digit are still missing', () => {
    const store = startGame();
    const expected = Array.from({ length: 10 }, (_, digit) =>
      digit === 0 ? 0 : 9 - store.cells.filter((value) => value === digit).length
    );
    expect(store.remainingCounts).toEqual(expected);

    const [index] = emptyCells(store);
    const digit = store.solution[index];
    store.placeDigit(digit, index);
    expect(store.remainingCounts[digit]).toBe(expected[digit] - 1);
  });

  it('never goes below zero', () => {
    const store = startGame();
    for (const index of emptyCells(store)) {
      store.placeDigit(1, index);
    }
    expect(store.remainingCounts[1]).toBe(0);
  });
});

describe('restart', () => {
  it('clears the entries, history and time of the same puzzle', () => {
    vi.useFakeTimers();
    const store = startGame();
    const puzzle = store.puzzle;
    const [index, other] = emptyCells(store);
    store.placeDigit(3, index);
    store.toggleNote(4, other);
    store.toggleNotesMode();
    vi.advanceTimersByTime(5000);

    store.restart();
    expect(store.puzzle).toBe(puzzle);
    expect(store.cells[index]).toBe(EMPTY);
    expect(store.notes[other]).toBe(0);
    expect(store.canUndo).toBe(false);
    expect(store.notesMode).toBe(false);
    expect(store.status).toBe('playing');
    expect(store.elapsedAt()).toBe(0);
  });

  it('does nothing without a game in progress', () => {
    const store = useGameStore();
    store.restart();
    expect(store.status).toBe('idle');
  });
});

describe('auto-removal of notes', () => {
  const setupNotes = (store: ReturnType<typeof useGameStore>) => {
    const [index] = emptyCells(store);
    const digit = store.solution[index];
    const peer = PEERS[index].find((i) => store.cells[i] === EMPTY)!;
    store.toggleNote(digit, peer);
    store.toggleNote(wrongDigit(store, peer), peer);
    return { index, digit, peer };
  };

  it('drops the placed digit from peer notes in the same move, and undo brings it back', () => {
    const store = startGame();
    const { index, digit, peer } = setupNotes(store);
    const notesBefore = store.notes[peer];
    store.placeDigit(digit, index);
    expect(store.notes[peer]).toBe(notesBefore & ~digitBit(digit));
    store.undo();
    expect(store.cells[index]).toBe(EMPTY);
    expect(store.notes[peer]).toBe(notesBefore);
  });

  it('leaves peer notes alone when turned off', () => {
    const store = startGame();
    useSettingsStore().autoRemoveNotes = false;
    const { index, digit, peer } = setupNotes(store);
    const notesBefore = store.notes[peer];
    store.placeDigit(digit, index);
    expect(store.notes[peer]).toBe(notesBefore);
  });
});
