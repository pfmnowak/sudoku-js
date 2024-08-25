<template>
  <section class="toolbar-section">
    <IconButton icon="icon-chevron-left" @click="$router.go(-1)" />
  </section>
  <div>
    <h1>This is a new game page</h1>
    <RouterLink to="/game">Start a Game!</RouterLink>
  </div>
</template>

<script setup lang="ts">
import IconButton from '@/components/base/IconButton.vue';
</script>

<style lang="scss" scoped></style>
