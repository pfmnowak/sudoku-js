import { defineStore } from 'pinia';
import { computed, ref, shallowRef } from 'vue';
import {
  CELL_COUNT,
  EMPTY,
  createBoard,
  findConflicts,
  parseGrid,
  toggleNote as toggleNoteMask,
  type Grid
} from '@/engine/board';
import { getPuzzle, type Difficulty } from '@/engine/puzzles';

/** `idle` means no game has been started yet. */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'won';

/** Contents of one cell at a point in time. */
export type CellState = {
  value: number;
  notes: number;
};

/** One cell touched by a move, with its contents before and after. */
export type CellChange = {
  index: number;
  before: CellState;
  after: CellState;
};

/** A single player action; it may touch several cells, and is undone as a whole. */
export type Move = CellChange[];

/**
 * The game in progress: board, selection, input mode and status.
 * Typed arrays are not deeply reactive in Vue, so `cells` and `notes` live in shallow refs
 * and every change replaces the array with an updated copy.
 */
export const useGameStore = defineStore('game', () => {
  const status = ref<GameStatus>('idle');
  const difficulty = ref<Difficulty | null>(null);
  const puzzle = ref('');
  const solution = shallowRef<Grid>(new Uint8Array(CELL_COUNT));
  const cells = shallowRef<Grid>(new Uint8Array(CELL_COUNT));
  const givens = shallowRef<Uint8Array>(new Uint8Array(CELL_COUNT));
  const notes = shallowRef<Uint16Array>(new Uint16Array(CELL_COUNT));

  const selectedCell = ref<number | null>(null);
  /** Digit picked on the numpad for digit-first input; `EMPTY` (0) picks the eraser. */
  const selectedDigit = ref<number | null>(null);
  const notesMode = ref(false);

  const conflicts = computed(() => findConflicts(cells.value));
  const isInProgress = computed(() => status.value === 'playing' || status.value === 'paused');

  /** Digit to highlight across the board: the picked numpad digit, else the selected cell's digit. */
  const highlightedDigit = computed<number | null>(() => {
    if (selectedDigit.value !== null) {
      return selectedDigit.value === EMPTY ? null : selectedDigit.value;
    }
    if (selectedCell.value === null) {
      return null;
    }
    return cells.value[selectedCell.value] || null;
  });

  const isEditable = (index: number | null): index is number =>
    status.value === 'playing' && index !== null && givens.value[index] === 0;

  const cellState = (index: number): CellState => ({
    value: cells.value[index],
    notes: notes.value[index]
  });

  const writeCells = (changes: readonly { index: number; state: CellState }[]) => {
    const nextCells = Uint8Array.from(cells.value);
    const nextNotes = Uint16Array.from(notes.value);
    for (const { index, state } of changes) {
      nextCells[index] = state.value;
      nextNotes[index] = state.notes;
    }
    cells.value = nextCells;
    notes.value = nextNotes;
  };

  const isSolved = () => cells.value.every((value, i) => value === solution.value[i]);

  const checkWin = () => {
    if (status.value === 'playing' && isSolved()) {
      status.value = 'won';
      selectedCell.value = null;
      selectedDigit.value = null;
    }
  };

  /** Applies a move built from the given cells' new contents, skipping cells that would not change. */
  const commit = (updates: readonly { index: number; after: CellState }[]): Move | null => {
    const move: Move = updates
      .map(({ index, after }) => ({ index, before: cellState(index), after }))
      .filter(({ before, after }) => before.value !== after.value || before.notes !== after.notes);
    if (move.length === 0) {
      return null;
    }
    writeCells(move.map(({ index, after }) => ({ index, state: after })));
    checkWin();
    return move;
  };

  /**
   * Starts a new game of the given difficulty from a randomly transformed bank puzzle.
   * @param rand - source of uniform numbers in `[0, 1)`, injectable for reproducible games
   */
  const newGame = (level: Difficulty, rand: () => number = Math.random) => {
    const entry = getPuzzle(level, rand);
    const board = createBoard(entry.puzzle);
    difficulty.value = level;
    puzzle.value = entry.puzzle;
    solution.value = parseGrid(entry.solution);
    cells.value = board.cells;
    givens.value = board.givens;
    notes.value = board.notes;
    selectedCell.value = null;
    selectedDigit.value = null;
    notesMode.value = false;
    status.value = 'playing';
  };

  const selectCell = (index: number | null) => {
    selectedCell.value = index;
  };

  /** Picks a numpad digit for digit-first input; picking the same one again clears it. */
  const selectDigit = (digit: number | null) => {
    selectedDigit.value = selectedDigit.value === digit ? null : digit;
  };

  const toggleNotesMode = () => {
    notesMode.value = !notesMode.value;
  };

  /** Writes a digit into a non-given cell (the selected one by default) and clears its notes. */
  const placeDigit = (digit: number, index = selectedCell.value) => {
    if (!isEditable(index)) {
      return;
    }
    commit([{ index, after: { value: digit, notes: 0 } }]);
  };

  /** Clears a non-given cell's digit and notes (the selected cell by default). */
  const erase = (index = selectedCell.value) => {
    if (!isEditable(index)) {
      return;
    }
    commit([{ index, after: { value: EMPTY, notes: 0 } }]);
  };

  /** Toggles a pencil mark in an empty, non-given cell (the selected one by default). */
  const toggleNote = (digit: number, index = selectedCell.value) => {
    if (!isEditable(index) || cells.value[index] !== EMPTY) {
      return;
    }
    commit([{ index, after: { value: EMPTY, notes: toggleNoteMask(notes.value[index], digit) } }]);
  };

  /** Enters a digit the way the current input mode says: as a note in notes mode, else as a value. */
  const input = (digit: number, index = selectedCell.value) => {
    if (notesMode.value) {
      toggleNote(digit, index);
    } else {
      placeDigit(digit, index);
    }
  };

  return {
    status,
    difficulty,
    puzzle,
    solution,
    cells,
    givens,
    notes,
    selectedCell,
    selectedDigit,
    notesMode,
    conflicts,
    isInProgress,
    highlightedDigit,
    newGame,
    selectCell,
    selectDigit,
    toggleNotesMode,
    placeDigit,
    erase,
    toggleNote,
    input
  };
});
