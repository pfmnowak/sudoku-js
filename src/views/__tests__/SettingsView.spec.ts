import { enableAutoUnmount, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import SettingsView from '../SettingsView.vue';

const setup = () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/settings', name: 'settings', component: SettingsView }
    ]
  });
  const wrapper = mount(SettingsView, { global: { plugins: [router] } });
  return { wrapper, settings: useSettingsStore() };
};

enableAutoUnmount(afterEach);

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  setActivePinia(createPinia());
});

describe('SettingsView', () => {
  it('switches the theme with the radio group', async () => {
    const { wrapper, settings } = setup();
    await wrapper.get('input[type="radio"][value="paper"]').setValue();
    expect(settings.theme).toBe('paper');
    expect(document.documentElement.dataset.theme).toBe('paper');
  });

  it('changes mistake marking and shows the matching hint', async () => {
    const { wrapper, settings } = setup();
    await wrapper.get('input[type="radio"][value="solution"]').setValue();
    expect(settings.mistakes).toBe('solution');
    expect(wrapper.text()).toContain('does not match the solution');
  });

  it('turns options off with the switches and restores the defaults', async () => {
    const { wrapper, settings } = setup();
    const switches = wrapper.findAll('input[role="switch"]');
    expect(switches).toHaveLength(3);
    await switches[0].setValue(false);
    expect(settings.highlightPeers).toBe(false);

    await wrapper.get('.settings__reset').trigger('click');
    expect(settings.highlightPeers).toBe(true);
    expect((switches[0].element as HTMLInputElement).checked).toBe(true);
  });
});
