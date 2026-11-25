import { describe, expect, it } from 'vitest';
import {
  BOXES,
  COLS,
  PEERS,
  ROWS,
  UNITS,
  boxOf,
  colOf,
  createBoard,
  hasNote,
  indexOf,
  isFilled,
  maskDigits,
  parseGrid,
  rowOf,
  serializeGrid,
  toggleNote
} from '../board';

const puzzle = '18-9576--2796-4851564281973-5-47-3-9398-657-442-39851--4-82-1-77-6-4--3883-7-64--';
const solution =
  '183957642279634851564281973651472389398165724427398516945823167716549238832716495';

describe('index helpers', () => {
  it('maps a flat index to row, column and box', () => {
    expect([rowOf(0), colOf(0), boxOf(0)]).toEqual([0, 0, 0]);
    expect([rowOf(40), colOf(40), boxOf(40)]).toEqual([4, 4, 4]);
    expect([rowOf(80), colOf(80), boxOf(80)]).toEqual([8, 8, 8]);
    expect([rowOf(23), colOf(23), boxOf(23)]).toEqual([2, 5, 1]);
    expect(indexOf(2, 5)).toBe(23);
  });

  it('builds units that agree with the helpers', () => {
    expect(UNITS).toHaveLength(27);
    ROWS.forEach((cells, row) => cells.forEach((i) => expect(rowOf(i)).toBe(row)));
    COLS.forEach((cells, col) => cells.forEach((i) => expect(colOf(i)).toBe(col)));
    BOXES.forEach((cells, box) => cells.forEach((i) => expect(boxOf(i)).toBe(box)));
    expect(BOXES[4]).toEqual([30, 31, 32, 39, 40, 41, 48, 49, 50]);
  });

  it('gives every cell 20 distinct peers, excluding itself', () => {
    PEERS.forEach((peers, index) => {
      expect(new Set(peers).size).toBe(20);
      expect(peers).not.toContain(index);
    });
  });
});

describe('notes masks', () => {
  it('toggles and reads digits', () => {
    let mask = 0;
    mask = toggleNote(mask, 1);
    mask = toggleNote(mask, 9);
    mask = toggleNote(mask, 5);
    mask = toggleNote(mask, 5);
    expect(hasNote(mask, 1)).toBe(true);
    expect(hasNote(mask, 5)).toBe(false);
    expect(maskDigits(mask)).toEqual([1, 9]);
  });
});

describe('parseGrid / serializeGrid', () => {
  it('round-trips the bank format', () => {
    expect(serializeGrid(parseGrid(puzzle))).toBe(puzzle);
    expect(serializeGrid(parseGrid(solution))).toBe(solution);
  });

  it('accepts . and 0 as empty cells', () => {
    expect(serializeGrid(parseGrid(puzzle.replace(/-/g, '.')))).toBe(puzzle);
    expect(serializeGrid(parseGrid(puzzle.replace(/-/g, '0')), '0')).toBe(
      puzzle.replace(/-/g, '0')
    );
  });

  it('rejects malformed input', () => {
    expect(() => parseGrid(puzzle.slice(1))).toThrow();
    expect(() => parseGrid(`x${puzzle.slice(1)}`)).toThrow();
  });
});

describe('createBoard', () => {
  it('marks filled cells as givens and starts without notes', () => {
    const board = createBoard(puzzle);
    expect(board.givens[0]).toBe(1);
    expect(board.givens[2]).toBe(0);
    expect(board.notes.every((mask) => mask === 0)).toBe(true);
    expect(isFilled(board.cells)).toBe(false);
    expect(isFilled(parseGrid(solution))).toBe(true);
  });
});
