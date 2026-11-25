import { defineStore } from 'pinia';
import { computed, ref, shallowRef, watch } from 'vue';
import {
  CELL_COUNT,
  EMPTY,
  createBoard,
  findConflicts,
  parseGrid,
  serializeGrid,
  toggleNote as toggleNoteMask,
  type Grid
} from '@/engine/board';
import { DIFFICULTIES, getPuzzle, type Difficulty } from '@/engine/puzzles';
import { readStorage, writeStorage } from './storage';

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

export const GAME_STORAGE_KEY = 'sudoku:game';

/**
 * Shape of the game saved in `localStorage`. Grids are stored as 81-char strings.
 * Bump `version` on any incompatible change; saves with another version are discarded.
 */
type SavedGame = {
  version: 1;
  status: 'paused' | 'won';
  difficulty: Difficulty;
  puzzle: string;
  solution: string;
  cells: string;
  notes: number[];
  history: Move[];
  future: Move[];
  elapsedMs: number;
};

const isSavedGame = (value: unknown): value is SavedGame => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const save = value as Partial<SavedGame>;
  return (
    save.version === 1 &&
    (save.status === 'paused' || save.status === 'won') &&
    DIFFICULTIES.includes(save.difficulty as Difficulty) &&
    typeof save.puzzle === 'string' &&
    /^[1-9-]{81}$/.test(save.puzzle) &&
    typeof save.solution === 'string' &&
    /^[1-9]{81}$/.test(save.solution) &&
    typeof save.cells === 'string' &&
    /^[1-9-]{81}$/.test(save.cells) &&
    Array.isArray(save.notes) &&
    save.notes.length === CELL_COUNT &&
    save.notes.every((mask) => Number.isInteger(mask) && mask >= 0 && mask <= 0x1ff) &&
    Array.isArray(save.history) &&
    Array.isArray(save.future) &&
    typeof save.elapsedMs === 'number' &&
    save.elapsedMs >= 0
  );
};

/**
 * The game in progress: board, selection, input mode and status.
 * Typed arrays are not deeply reactive in Vue, so `cells` and `notes` live in shallow refs
 * and every change replaces the array with an updated copy.
 *
 * The game is saved to `localStorage` on every change and restored when the store is created,
 * so it survives a reload or a browser restart. A restored game always comes back paused.
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

  /** Moves made so far, oldest first; `undo` pops from here. */
  const history = ref<Move[]>([]);
  /** Undone moves, most recently undone last; any new move clears it. */
  const future = ref<Move[]>([]);

  /** Play time banked before the current running stretch. */
  const elapsedMs = ref(0);
  /** When the current running stretch began (`Date.now()`), or `null` while the clock is stopped. */
  const startedAt = ref<number | null>(null);

  const conflicts = computed(() => findConflicts(cells.value));
  const isInProgress = computed(() => status.value === 'playing' || status.value === 'paused');
  const canUndo = computed(() => status.value === 'playing' && history.value.length > 0);
  const canRedo = computed(() => status.value === 'playing' && future.value.length > 0);

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

  const stopClock = () => {
    if (startedAt.value !== null) {
      elapsedMs.value += Math.max(0, Date.now() - startedAt.value);
      startedAt.value = null;
    }
  };

  /** Total play time in ms at the given moment; reactive only to pauses, so tick `now` to animate. */
  const elapsedAt = (now: number = Date.now()): number =>
    elapsedMs.value + (startedAt.value === null ? 0 : Math.max(0, now - startedAt.value));

  const checkWin = () => {
    if (status.value === 'playing' && isSolved()) {
      stopClock();
      status.value = 'won';
      selectedCell.value = null;
      selectedDigit.value = null;
    }
  };

  /**
   * Applies a move built from the given cells' new contents and records it for undo.
   * Cells that would not change are skipped; a move that changes nothing is not recorded.
   */
  const commit = (updates: readonly { index: number; after: CellState }[]) => {
    const move: Move = updates
      .map(({ index, after }) => ({ index, before: cellState(index), after }))
      .filter(({ before, after }) => before.value !== after.value || before.notes !== after.notes);
    if (move.length === 0) {
      return;
    }
    writeCells(move.map(({ index, after }) => ({ index, state: after })));
    history.value.push(move);
    future.value = [];
    checkWin();
  };

  /** Reverts the last move and selects the cell it touched. */
  const undo = () => {
    const move = canUndo.value ? history.value.pop() : undefined;
    if (!move) {
      return;
    }
    writeCells(move.map(({ index, before }) => ({ index, state: before })));
    future.value.push(move);
    selectedCell.value = move[0].index;
  };

  /** Re-applies the last undone move and selects the cell it touched. */
  const redo = () => {
    const move = canRedo.value ? future.value.pop() : undefined;
    if (!move) {
      return;
    }
    writeCells(move.map(({ index, after }) => ({ index, state: after })));
    history.value.push(move);
    selectedCell.value = move[0].index;
    checkWin();
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
    history.value = [];
    future.value = [];
    elapsedMs.value = 0;
    startedAt.value = Date.now();
    status.value = 'playing';
  };

  /** Stops the clock and locks input; used when the game view is left or the tab is hidden. */
  const pause = () => {
    if (status.value !== 'playing') {
      return;
    }
    stopClock();
    status.value = 'paused';
  };

  /** Restarts the clock of a paused game. */
  const resume = () => {
    if (status.value !== 'paused') {
      return;
    }
    startedAt.value = Date.now();
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

  const toSavedGame = (): SavedGame | null => {
    if (status.value === 'idle' || difficulty.value === null) {
      return null;
    }
    return {
      version: 1,
      status: status.value === 'won' ? 'won' : 'paused',
      difficulty: difficulty.value,
      puzzle: puzzle.value,
      solution: serializeGrid(solution.value),
      cells: serializeGrid(cells.value),
      notes: Array.from(notes.value),
      history: history.value,
      future: future.value,
      elapsedMs: elapsedAt()
    };
  };

  const restore = (save: SavedGame) => {
    difficulty.value = save.difficulty;
    puzzle.value = save.puzzle;
    solution.value = parseGrid(save.solution);
    givens.value = createBoard(save.puzzle).givens;
    cells.value = parseGrid(save.cells);
    notes.value = Uint16Array.from(save.notes);
    history.value = save.history;
    future.value = save.future;
    elapsedMs.value = save.elapsedMs;
    startedAt.value = null;
    status.value = save.status;
  };

  const saved = readStorage(GAME_STORAGE_KEY);
  if (isSavedGame(saved)) {
    restore(saved);
  }

  watch(
    [status, cells, notes, history, future, elapsedMs],
    () => {
      const save = toSavedGame();
      if (save) {
        writeStorage(GAME_STORAGE_KEY, save);
      }
    },
    { deep: true }
  );

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
    history,
    future,
    elapsedMs,
    startedAt,
    conflicts,
    isInProgress,
    canUndo,
    canRedo,
    highlightedDigit,
    elapsedAt,
    newGame,
    pause,
    resume,
    selectCell,
    selectDigit,
    toggleNotesMode,
    placeDigit,
    erase,
    toggleNote,
    input,
    undo,
    redo
  };
});
