<template>
  <div class="social">
    <a :href="link" class="social__link" :title="title">
      <svg class="social__icon">
        <use xlink:href="../assets/sprite.svg#icon-github"></use>
      </svg>
    </a>
  </div>
</template>

<script setup lang="ts">
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
