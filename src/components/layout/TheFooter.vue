<template>
  <footer>
    <SocialLink link="https://github.com/pfmnowak/sudoku-js/" title="GitHub Repo with the code" />
    <div class="footer__info">
      <div>
        &copy; 2022 | By
        <a href="https://pfmnowak.github.io/" class="inline-link" title="Author's page"
          >Mikołaj Nowak</a
        >
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import SocialLink from '../SocialLink.vue';
</script>

<style lang="scss" scoped>
footer {
  /* //   color: $color-gray-light; */
  text-align: center;
  padding: 3rem 0;
  margin-top: 5rem;
  /* //   font-size: $default-font-size; */
}
</style>
