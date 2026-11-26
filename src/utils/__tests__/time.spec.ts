import { describe, expect, it } from 'vitest';
import { formatClock, formatDuration } from '../time';

describe('formatClock', () => {
  it('shows minutes and seconds under an hour, hours from an hour up', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(65_999)).toBe('1:05');
    expect(formatClock(3_600_000 + 2 * 60_000 + 3000)).toBe('1:02:03');
  });
});

describe('formatDuration', () => {
  it('uses singular and plural forms and skips zero units', () => {
    expect(formatDuration(1000)).toBe('1 second');
    expect(formatDuration(42_000)).toBe('42 seconds');
    expect(formatDuration(60_000)).toBe('1 minute');
    expect(formatDuration(125_000)).toBe('2 minutes and 5 seconds');
    expect(formatDuration(3_661_000)).toBe('1 hour, 1 minute and 1 second');
    expect(formatDuration(7_200_000 + 1000)).toBe('2 hours and 1 second');
  });

  it('says 0 seconds for an instant', () => {
    expect(formatDuration(400)).toBe('0 seconds');
  });
});
