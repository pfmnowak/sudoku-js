<template>
  <button @click="onClick">
    <v-icon :icon="icon" size="x-large" />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  onClick: () => void;
}>();
</script>

<style scoped lang="scss"></style>
