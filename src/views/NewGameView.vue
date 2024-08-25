<template>
  <section class="toolbar-section">
    <icon-button icon="icon-chevron-left" @click="$router.go(-1)" />
  </section>
  <div>
    <h1>This is a new game page</h1>
    <router-link to="/game">Start a Game!</router-link>
  </div>
</template>

<script lang="ts">
import IconButton from '@/components/base/IconButton.vue';

export default {
  components: { IconButton }
};
</script>

<style lang="scss" scoped></style>
