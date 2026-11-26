<template>
  <button class="icon-button" type="button" :aria-label="label" :title="label">
    <AppIcon :path="icon" />
  </button>
</template>

<script setup lang="ts">
import AppIcon from './AppIcon.vue';

/**
 * Round, borderless button showing a single icon.
 * Click and other listeners fall through to the native `<button>`.
 *
 * @prop icon - SVG path data, e.g. `mdiChevronLeft` from `@mdi/js`.
 * @prop label - Accessible name, also shown as a tooltip.
 */
defineProps<{
  icon: string;
  label: string;
}>();
</script>

<style scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.icon-button:hover:not(:disabled) {
  background-color: var(--color-hover);
}

.icon-button:disabled {
  opacity: 0.35;
  cursor: default;
}

.icon-button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
