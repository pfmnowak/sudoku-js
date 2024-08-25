<template>
  <footer>
    <social-link
      link="https://github.com/pfmnowak/sudoku-js/"
      title="GitHub Repo with the code"
    ></social-link>
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

<script lang="ts">
import SocialLink from '../SocialLink.vue';

export default {
  components: { SocialLink }
};
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
