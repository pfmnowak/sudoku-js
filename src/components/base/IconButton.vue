<template>
  <button class="button button--round" type="button">
    <svg class="button__icon">
      <use :xlink:href="[`/src/assets/sprite.svg#${icon}`]"></use>
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
}>();
</script>

<style lang="scss" scoped>
.button,
.button:link,
.button:visited {
  text-transform: uppercase;
  text-decoration: none;
  padding: 1.5rem 3rem;
  display: inline-block;
  transition: all 0.2s;
  position: relative;
  font-size: 1.6rem;
  border: none;
  cursor: pointer;

  &:hover {
    box-shadow: 0 1rem 2rem rgba(255, 255, 255, 0.2);
  }

  &:focus,
  &:active {
    outline: none;
    box-shadow: 0 0.5rem 1rem rgba(255, 255, 255, 0.2);
  }
}

.button__icon {
  width: 100%;
  height: 100%;
}

.button--round {
  width: 5rem;
  height: 5rem;
  padding: 1rem;
  background-color: #ddd;
  border-radius: 50%;
}
</style>
