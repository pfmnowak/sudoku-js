import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, useSettingsStore } from '../settings';

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  setActivePinia(createPinia());
});

describe('useSettingsStore', () => {
  it('starts with the defaults and follows the system theme', () => {
    const store = useSettingsStore();
    expect(store.theme).toBe('system');
    expect(store.mistakes).toBe(DEFAULT_SETTINGS.mistakes);
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('applies a forced theme to the document and removes it for system', async () => {
    const store = useSettingsStore();
    store.theme = 'paper';
    await nextTick();
    expect(document.documentElement.dataset.theme).toBe('paper');
    store.theme = 'system';
    await nextTick();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('saves changes and restores them in a new session', async () => {
    const store = useSettingsStore();
    store.theme = 'high-contrast';
    store.highlightPeers = false;
    await nextTick();

    setActivePinia(createPinia());
    const restored = useSettingsStore();
    expect(restored.theme).toBe('high-contrast');
    expect(restored.highlightPeers).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('high-contrast');
  });

  it('keeps valid saved fields and falls back to defaults for broken ones', () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ theme: 'neon', mistakes: 'solution', autoRemoveNotes: 'yes' })
    );
    const store = useSettingsStore();
    expect(store.theme).toBe('system');
    expect(store.mistakes).toBe('solution');
    expect(store.autoRemoveNotes).toBe(DEFAULT_SETTINGS.autoRemoveNotes);
  });

  it('resets every option to its default', () => {
    const store = useSettingsStore();
    store.theme = 'dark';
    store.mistakes = 'off';
    store.reset();
    expect(store.theme).toBe('system');
    expect(store.mistakes).toBe('conflicts');
  });
});
