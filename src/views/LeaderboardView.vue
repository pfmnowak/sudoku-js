<template>
  <div>
    <IconButtonMDI icon="$prev" @click="$router.push({ path: '/', replace: true })" />
    <h1>This is a Leaderboard page</h1>
  </div>
</template>

<script setup lang="ts">
import IconButtonMDI from '@/components/base/IconButtonMDI.vue';
</script>

<style lang="scss" scoped></style>
