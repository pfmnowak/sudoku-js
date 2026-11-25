/** Number of cells on a 9×9 board. */
export const CELL_COUNT = 81;

/** Value stored in a grid cell that has no digit. */
export const EMPTY = 0;

/** Row-major cell values, `0` for empty and `1`–`9` for digits. Always `CELL_COUNT` long. */
export type Grid = Uint8Array;

/**
 * Full state of a board in play.
 * - `cells`: current digits, see `Grid`
 * - `givens`: `1` for the puzzle's clue cells, which the player cannot change, `0` otherwise
 * - `notes`: per-cell pencil marks as a 9-bit mask, bit `d - 1` set when digit `d` is noted
 */
export type Board = {
  cells: Grid;
  givens: Uint8Array;
  notes: Uint16Array;
};

export const rowOf = (index: number): number => Math.floor(index / 9);

export const colOf = (index: number): number => index % 9;

/** Box number 0–8, counted row-major from the top-left 3×3 box. */
export const boxOf = (index: number): number =>
  Math.floor(rowOf(index) / 3) * 3 + Math.floor(colOf(index) / 3);

export const indexOf = (row: number, col: number): number => row * 9 + col;

const range9 = Array.from({ length: 9 }, (_, i) => i);

/** Cell indices of each row, indexed by row number. */
export const ROWS: readonly (readonly number[])[] = range9.map((row) =>
  range9.map((col) => indexOf(row, col))
);

/** Cell indices of each column, indexed by column number. */
export const COLS: readonly (readonly number[])[] = range9.map((col) =>
  range9.map((row) => indexOf(row, col))
);

/** Cell indices of each 3×3 box, indexed by box number (see `boxOf`). */
export const BOXES: readonly (readonly number[])[] = range9.map((box) =>
  range9.map((i) => indexOf(Math.floor(box / 3) * 3 + Math.floor(i / 3), (box % 3) * 3 + (i % 3)))
);

/** All 27 units (rows, then columns, then boxes); each must hold the digits 1–9 exactly once. */
export const UNITS: readonly (readonly number[])[] = [...ROWS, ...COLS, ...BOXES];

/** For every cell, the 20 other cells that share its row, column or box. */
export const PEERS: readonly (readonly number[])[] = Array.from(
  { length: CELL_COUNT },
  (_, index) => {
    const peers = new Set([...ROWS[rowOf(index)], ...COLS[colOf(index)], ...BOXES[boxOf(index)]]);
    peers.delete(index);
    return [...peers];
  }
);

/** Bit for digit `1`–`9` in a candidate or notes mask. */
export const digitBit = (digit: number): number => 1 << (digit - 1);

/** Mask with all nine digits set. */
export const ALL_DIGITS = 0x1ff;

export const hasNote = (mask: number, digit: number): boolean => (mask & digitBit(digit)) !== 0;

export const toggleNote = (mask: number, digit: number): number => mask ^ digitBit(digit);

/** Digits `1`–`9` present in a mask, ascending. */
export const maskDigits = (mask: number): number[] =>
  range9.filter((i) => mask & (1 << i)).map((i) => i + 1);

/**
 * Parses an 81-char row-major puzzle string into a grid.
 * Digits `1`–`9` are values; `-`, `.` and `0` mark empty cells.
 * @throws if the string has the wrong length or an unexpected character
 */
export const parseGrid = (text: string): Grid => {
  if (text.length !== CELL_COUNT) {
    throw new Error(`Expected ${CELL_COUNT} characters, got ${text.length}`);
  }
  const grid = new Uint8Array(CELL_COUNT);
  for (let i = 0; i < CELL_COUNT; i++) {
    const char = text[i];
    if (char >= '1' && char <= '9') {
      grid[i] = Number(char);
    } else if (char !== '-' && char !== '.' && char !== '0') {
      throw new Error(`Unexpected character "${char}" at position ${i}`);
    }
  }
  return grid;
};

/**
 * Serializes a grid back to the 81-char string format.
 * @param emptyChar - character written for empty cells, `-` to match the puzzle bank
 */
export const serializeGrid = (grid: Grid, emptyChar = '-'): string =>
  Array.from(grid, (value) => (value === EMPTY ? emptyChar : String(value))).join('');

/** Creates a fresh board from a puzzle string: every filled cell becomes a given, no notes. */
export const createBoard = (puzzle: string): Board => {
  const cells = parseGrid(puzzle);
  return {
    cells,
    givens: cells.map((value) => (value === EMPTY ? 0 : 1)),
    notes: new Uint16Array(CELL_COUNT)
  };
};

/** True when every cell holds a digit. Says nothing about correctness. */
export const isFilled = (grid: Grid): boolean => grid.every((value) => value !== EMPTY);
