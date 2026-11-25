<template>
  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path :d="path" />
  </svg>
</template>

<script setup lang="ts">
/**
 * Inline SVG icon drawn from a single 24×24 path, e.g. one exported by `@mdi/js`.
 * Inherits the current text color and scales with the font size.
 */
defineProps<{
  path: string;
}>();
</script>

<style scoped>
.icon {
  width: 1.5em;
  height: 1.5em;
  fill: currentColor;
  flex-shrink: 0;
}
</style>
