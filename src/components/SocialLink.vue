<template>
  <div class="social">
    <a :href="link" class="social__link" :title="title">
      <AppIcon :path="mdiGithub" class="social__icon" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { mdiGithub } from '@mdi/js';
import AppIcon from './base/AppIcon.vue';

defineProps<{
  link: string;
  title: string;
}>();
</script>

<style lang="scss" scoped>
.social {
  display: flex;
  justify-content: center;

  &__link {
    width: 5rem;
    height: 5rem;
    padding: 1rem;
    background-color: #ddd;
    border-radius: 50%;
    margin-right: 1rem;
    color: #333;

    &:hover {
      background-color: #fff;
    }
  }

  &__icon {
    width: 100%;
    height: 100%;
  }
}
</style>
