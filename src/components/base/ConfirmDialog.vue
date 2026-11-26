<template>
  <dialog ref="dialog" class="confirm-dialog" :aria-labelledby="titleId">
    <h2 :id="titleId" class="confirm-dialog__title">{{ title }}</h2>
    <p>{{ message }}</p>
    <form method="dialog" class="confirm-dialog__actions">
      <button type="submit" class="confirm-dialog__button" value="cancel" autofocus>Cancel</button>
      <button
        type="submit"
        class="confirm-dialog__button confirm-dialog__button--confirm"
        value="confirm"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { useId, useTemplateRef } from 'vue';

/**
 * Modal yes/no question built on the native `<dialog>`: Escape, the backdrop-less Cancel button
 * and Confirm all close it, and only Confirm emits `confirm`. Open it with the exposed `open()`.
 */
defineProps<{
  title: string;
  message: string;
  confirmLabel: string;
}>();

const emit = defineEmits<{
  confirm: [];
}>();

const dialog = useTemplateRef<HTMLDialogElement>('dialog');
const titleId = useId();

const open = () => dialog.value?.showModal();

defineExpose({ open });
</script>

<style scoped>
.confirm-dialog {
  max-width: min(400px, calc(100vw - 2rem));
  margin: auto;
  padding: 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
}

.confirm-dialog::backdrop {
  background: rgba(0, 0, 0, 0.6);
}

.confirm-dialog__title {
  margin-bottom: 0.75rem;
  color: var(--color-text-strong);
  font-size: 1.3rem;
}

.confirm-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.confirm-dialog__button {
  min-width: 44px;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 0.4rem;
  cursor: pointer;
  text-transform: uppercase;
}

.confirm-dialog__button:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.confirm-dialog__button--confirm {
  background-color: var(--color-cell-selected);
  color: var(--color-text-strong);
}

.confirm-dialog__button--confirm:hover {
  background-color: var(--color-accent);
}

.confirm-dialog__button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
