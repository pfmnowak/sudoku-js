const UNITS = [
  { ms: 3_600_000, one: 'hour', many: 'hours' },
  { ms: 60_000, one: 'minute', many: 'minutes' },
  { ms: 1000, one: 'second', many: 'seconds' }
] as const;

const pluralRules = new Intl.PluralRules('en');

/** Splits a duration into whole hours, minutes and seconds. */
const splitDuration = (ms: number): [number, number, number] => {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  return [
    Math.floor(totalSeconds / 3600),
    Math.floor((totalSeconds % 3600) / 60),
    totalSeconds % 60
  ];
};

/**
 * Formats a duration as a clock: `m:ss` under an hour, `h:mm:ss` from an hour up.
 * @example formatClock(65_000) // '1:05'
 */
export const formatClock = (ms: number): string => {
  const [hours, minutes, seconds] = splitDuration(ms);
  const pad = (part: number) => part.toString().padStart(2, '0');
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
};

/**
 * Formats a duration in words with the right plural forms, skipping zero units.
 * @example formatDuration(3_661_000) // '1 hour, 1 minute and 1 second'
 */
export const formatDuration = (ms: number): string => {
  const parts = splitDuration(ms)
    .map((count, i) => ({ count, unit: UNITS[i] }))
    .filter(({ count }) => count > 0)
    .map(
      ({ count, unit }) => `${count} ${pluralRules.select(count) === 'one' ? unit.one : unit.many}`
    );
  if (parts.length === 0) {
    return '0 seconds';
  }
  return parts.length === 1
    ? parts[0]
    : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
};
