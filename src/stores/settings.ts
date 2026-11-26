import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { readStorage, writeStorage } from './storage';

export const THEMES = ['system', 'light', 'dark', 'paper', 'high-contrast'] as const;

/** `system` follows the OS light/dark preference; the rest force one palette. */
export type Theme = (typeof THEMES)[number];

export const MISTAKE_MODES = ['off', 'conflicts', 'solution'] as const;

/**
 * Which entered digits are marked as mistakes: none, digits clashing with another digit in a row,
 * column or box, or every digit that differs from the solution.
 */
export type MistakeMode = (typeof MISTAKE_MODES)[number];

export type Settings = {
  theme: Theme;
  mistakes: MistakeMode;
  highlightPeers: boolean;
  highlightSameDigit: boolean;
  autoRemoveNotes: boolean;
};

export const SETTINGS_STORAGE_KEY = 'sudoku:settings';

export const DEFAULT_SETTINGS: Readonly<Settings> = {
  theme: 'system',
  mistakes: 'conflicts',
  highlightPeers: true,
  highlightSameDigit: true,
  autoRemoveNotes: true
};

/** Keeps every valid field of a saved settings object and falls back to defaults for the rest. */
const sanitize = (value: unknown): Settings => {
  const saved = (typeof value === 'object' && value !== null ? value : {}) as Partial<Settings>;
  const pickBoolean = (key: 'highlightPeers' | 'highlightSameDigit' | 'autoRemoveNotes') =>
    typeof saved[key] === 'boolean' ? saved[key] : DEFAULT_SETTINGS[key];
  return {
    theme: THEMES.includes(saved.theme as Theme) ? (saved.theme as Theme) : DEFAULT_SETTINGS.theme,
    mistakes: MISTAKE_MODES.includes(saved.mistakes as MistakeMode)
      ? (saved.mistakes as MistakeMode)
      : DEFAULT_SETTINGS.mistakes,
    highlightPeers: pickBoolean('highlightPeers'),
    highlightSameDigit: pickBoolean('highlightSameDigit'),
    autoRemoveNotes: pickBoolean('autoRemoveNotes')
  };
};

/** Sets `data-theme` on `<html>`, which picks the palette in `main.css`; `system` removes it. */
const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') {
    return;
  }
  if (theme === 'system') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = theme;
  }
};

/**
 * Player preferences, saved to `localStorage` (`sudoku:settings`) on every change and restored
 * when the store is created. The theme is applied to the document right away.
 */
export const useSettingsStore = defineStore('settings', () => {
  const initial = sanitize(readStorage(SETTINGS_STORAGE_KEY));

  const theme = ref(initial.theme);
  const mistakes = ref(initial.mistakes);
  const highlightPeers = ref(initial.highlightPeers);
  const highlightSameDigit = ref(initial.highlightSameDigit);
  const autoRemoveNotes = ref(initial.autoRemoveNotes);

  const reset = () => {
    theme.value = DEFAULT_SETTINGS.theme;
    mistakes.value = DEFAULT_SETTINGS.mistakes;
    highlightPeers.value = DEFAULT_SETTINGS.highlightPeers;
    highlightSameDigit.value = DEFAULT_SETTINGS.highlightSameDigit;
    autoRemoveNotes.value = DEFAULT_SETTINGS.autoRemoveNotes;
  };

  watch(theme, applyTheme, { immediate: true });

  watch([theme, mistakes, highlightPeers, highlightSameDigit, autoRemoveNotes], () => {
    writeStorage(SETTINGS_STORAGE_KEY, {
      theme: theme.value,
      mistakes: mistakes.value,
      highlightPeers: highlightPeers.value,
      highlightSameDigit: highlightSameDigit.value,
      autoRemoveNotes: autoRemoveNotes.value
    } satisfies Settings);
  });

  return { theme, mistakes, highlightPeers, highlightSameDigit, autoRemoveNotes, reset };
});
