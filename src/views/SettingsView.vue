<template>
  <div class="settings">
    <PageHeader title="Settings" />

    <section class="settings__section" aria-labelledby="settings-look">
      <h2 id="settings-look" class="settings__heading">Look</h2>
      <ChoiceGroup v-model="settings.theme" legend="Theme" :options="themeOptions" />
    </section>

    <section class="settings__section" aria-labelledby="settings-play">
      <h2 id="settings-play" class="settings__heading">Play</h2>
      <ChoiceGroup
        v-model="settings.mistakes"
        legend="Mark mistakes"
        :options="mistakeOptions"
        :hint="mistakeHints[settings.mistakes]"
      />
      <ToggleSwitch
        v-model="settings.highlightPeers"
        label="Highlight row, column and box"
        hint="Shade the cells that share a unit with the selected one."
      />
      <ToggleSwitch
        v-model="settings.highlightSameDigit"
        label="Highlight the same digit"
        hint="Shade every cell and note with the selected digit."
      />
      <ToggleSwitch
        v-model="settings.autoRemoveNotes"
        label="Remove notes automatically"
        hint="Placing a digit clears it from the notes in its row, column and box."
      />
    </section>

    <button type="button" class="settings__reset" @click="settings.reset">Restore defaults</button>
  </div>
</template>

<script setup lang="ts">
import ChoiceGroup from '@/components/base/ChoiceGroup.vue';
import ToggleSwitch from '@/components/base/ToggleSwitch.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { useSettingsStore, type MistakeMode, type Theme } from '@/stores/settings';

/** Player preferences; every change applies and saves at once. */
const settings = useSettingsStore();

const themeOptions: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'paper', label: 'Paper' },
  { value: 'high-contrast', label: 'High contrast' }
];

const mistakeOptions: { value: MistakeMode; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'conflicts', label: 'Conflicts' },
  { value: 'solution', label: 'Wrong digits' }
];

const mistakeHints: Record<MistakeMode, string> = {
  off: 'Nothing is marked; find your mistakes yourself.',
  conflicts: 'Digits that repeat in a row, column or box are marked.',
  solution: 'Every digit that does not match the solution is marked.'
};
</script>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 36rem;
  margin: 0 auto;
}

.settings__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 0.75rem;
  background-color: var(--color-surface);
}

.settings__heading {
  color: var(--color-accent);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.settings__reset {
  align-self: center;
  min-height: 44px;
  padding: 0 1.25rem;
  border-radius: 0.5rem;
  color: var(--color-accent);
  cursor: pointer;
}

.settings__reset:hover {
  background-color: var(--color-hover);
}

.settings__reset:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
