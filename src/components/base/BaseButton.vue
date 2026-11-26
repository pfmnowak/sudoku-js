<template>
  <button class="button" type="button">{{ title }}</button>
</template>

<script setup lang="ts">
/**
 * Large text button for the main menu actions. Add `button--cta` for the accent-filled variant
 * and `button--compact` for a smaller one, e.g. in a dialog.
 */
defineProps<{
  title: string;
}>();
</script>

<style scoped>
.button {
  display: inline-block;
  min-height: 44px;
  padding: 1.1rem 2.5rem;
  border: 2px solid var(--color-accent);
  border-radius: 1rem;
  background-color: transparent;
  color: var(--color-accent);
  font-size: 1.4rem;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s,
    transform 0.2s;
}

.button:hover {
  transform: translateY(-2px);
  background-color: var(--color-hover);
}

.button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.button--compact {
  padding: 0.6rem 1.25rem;
  border-radius: 0.6rem;
  font-size: 1rem;
}

.button--cta,
.button--cta:hover {
  background-color: var(--color-accent);
  color: var(--color-on-accent);
}
</style>
