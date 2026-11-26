import { enableAutoUnmount, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { useStatsStore } from '@/stores/stats';
import StatsView from '../StatsView.vue';

const setup = () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'home', component: { template: '<div />' } }]
  });
  return mount(StatsView, { global: { plugins: [router] } });
};

enableAutoUnmount(afterEach);

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe('StatsView', () => {
  it('shows dashes and a disabled reset before the first game', () => {
    const wrapper = setup();
    expect(wrapper.get('.stats__summary').text()).toContain('Win rate–');
    expect(wrapper.findAll('tbody tr')).toHaveLength(5);
    expect(wrapper.get('.stats__reset').attributes('disabled')).toBeDefined();
  });

  it('shows totals, streaks and per-level times', () => {
    const stats = useStatsStore();
    stats.recordStart('hard', false);
    stats.recordWin('hard', 90_000);
    stats.recordStart('hard', false);
    stats.recordWin('hard', 150_000);
    stats.recordStart('easy', false);
    const wrapper = setup();

    const summary = wrapper.get('.stats__summary').text();
    expect(summary).toContain('Played3');
    expect(summary).toContain('Win rate67%');
    expect(summary).toContain('Best streak2');

    const hardRow = wrapper.findAll('tbody tr').find((row) => row.text().startsWith('Hard'))!;
    expect(hardRow.findAll('td').map((cell) => cell.text())).toEqual(['2', '2', '1:30', '2:00']);
  });
});
