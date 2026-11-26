<template>
  <label class="toggle">
    <span class="toggle__text">
      <span :id="`${id}-label`" class="toggle__label">{{ label }}</span>
      <span v-if="hint" :id="`${id}-hint`" class="toggle__hint">{{ hint }}</span>
    </span>
    <input
      v-model="model"
      type="checkbox"
      role="switch"
      class="toggle__input"
      :aria-labelledby="`${id}-label`"
      :aria-describedby="hint ? `${id}-hint` : undefined"
    />
    <span class="toggle__track" aria-hidden="true"></span>
  </label>
</template>

<script setup lang="ts">
import { useId } from 'vue';

/**
 * On/off switch over a native checkbox (`role="switch"`) with a label and an optional hint.
 * Bind the state with `v-model`.
 */
defineProps<{
  label: string;
  hint?: string;
}>();

const model = defineModel<boolean>({ required: true });
const id = useId();
</script>

<style scoped>
.toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 44px;
  cursor: pointer;
}

.toggle__text {
  display: flex;
  flex-direction: column;
}

.toggle__label {
  color: var(--color-text-strong);
}

.toggle__hint {
  font-size: 0.85rem;
}

.toggle__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.toggle__track {
  position: relative;
  flex-shrink: 0;
  width: 2.75rem;
  height: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-hover);
  transition: background-color 0.15s;
}

.toggle__track::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0.2rem;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  background-color: var(--color-text);
  transform: translateY(-50%);
  transition:
    transform 0.15s,
    background-color 0.15s;
}

.toggle__input:checked + .toggle__track {
  border-color: var(--color-accent);
  background-color: var(--color-accent);
}

.toggle__input:checked + .toggle__track::after {
  background-color: var(--color-on-accent);
  transform: translate(1.2rem, -50%);
}

.toggle__input:focus-visible + .toggle__track {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
