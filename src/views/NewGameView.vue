<template>
  <section class="toolbar-section">
    <IconButtonMDI icon="$prev" @click="$router.push({ path: '/', replace: true })" />
  </section>
  <div>
    <h1>This is a new game page</h1>
    <RouterLink to="/game">Start a Game!</RouterLink>
  </div>
</template>

<script setup lang="ts">
import IconButtonMDI from '@/components/base/IconButtonMDI.vue';
</script>

<style lang="scss" scoped></style>
