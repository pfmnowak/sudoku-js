<template>
  <header class="page-header">
    <IconButton :icon="mdiChevronLeft" label="Back" @click="goBack" />
    <h1 class="page-header__title">{{ title }}</h1>
  </header>
</template>

<script setup lang="ts">
import IconButton from '@/components/base/IconButton.vue';
import { mdiChevronLeft } from '@mdi/js';
import { useRouter } from 'vue-router';

/**
 * Title bar of a secondary screen with a back button. Back returns to the previous screen
 * of the app, or to home when the screen was opened directly.
 */
defineProps<{
  title: string;
}>();

const router = useRouter();

const goBack = () => {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.push({ name: 'home' });
  }
};
</script>

<style scoped>
.page-header {
  display: grid;
  grid-template-columns: 2.5rem 1fr 2.5rem;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.page-header__title {
  color: var(--color-text-strong);
  font-size: 1.6rem;
  font-weight: 500;
  text-align: center;
}
</style>
