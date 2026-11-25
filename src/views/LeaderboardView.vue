<template>
  <div>
    <IconButton
      :icon="mdiChevronLeft"
      label="Back to home"
      @click="$router.push({ path: '/', replace: true })"
    />
    <h1>This is a Leaderboard page</h1>
  </div>
</template>

<script setup lang="ts">
import IconButton from '@/components/base/IconButton.vue';
import { mdiChevronLeft } from '@mdi/js';
</script>

<style lang="scss" scoped></style>
