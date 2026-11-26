<template>
  <fieldset class="choice-group">
    <legend class="choice-group__legend">{{ legend }}</legend>
    <div class="choice-group__options">
      <label
        v-for="option in options"
        :key="option.value"
        class="choice-group__option"
        :class="{ 'choice-group__option--checked': model === option.value }"
      >
        <input
          v-model="model"
          type="radio"
          class="choice-group__input"
          :name="name"
          :value="option.value"
        />
        {{ option.label }}
      </label>
    </div>
    <p v-if="hint" class="choice-group__hint">{{ hint }}</p>
  </fieldset>
</template>

<script setup lang="ts" generic="T extends string">
import { useId } from 'vue';

/**
 * Single choice from a few options, drawn as segmented buttons over native radio inputs,
 * so arrow keys and screen readers work as for any radio group. Bind the value with `v-model`.
 */
defineProps<{
  legend: string;
  options: readonly { value: T; label: string }[];
  hint?: string;
}>();

const model = defineModel<T>({ required: true });
const name = useId();
</script>

<style scoped>
.choice-group {
  min-width: 0;
  padding: 0;
  border: none;
}

.choice-group__legend {
  margin-bottom: 0.5rem;
  padding: 0;
  color: var(--color-text-strong);
}

.choice-group__options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.choice-group__option {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.choice-group__option:hover {
  background-color: var(--color-hover);
}

.choice-group__option--checked,
.choice-group__option--checked:hover {
  border-color: var(--color-accent);
  background-color: var(--color-accent);
  color: var(--color-on-accent);
}

.choice-group__option:has(:focus-visible) {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.choice-group__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.choice-group__hint {
  margin-top: 0.4rem;
  font-size: 0.85rem;
}
</style>
