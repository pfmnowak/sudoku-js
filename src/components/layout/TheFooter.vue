<template>
  <footer class="footer">
    <span>
      &copy; {{ years }}
      <a href="https://pfmnowak.github.io/" class="footer__link" title="Author's page">
        Mikołaj Nowak
      </a>
    </span>
    <a :href="REPO_URL" class="footer__link footer__link--repo" title="Source code on GitHub">
      <AppIcon :path="mdiGithub" />
      Source code
    </a>
  </footer>
</template>

<script setup lang="ts">
import AppIcon from '@/components/base/AppIcon.vue';
import { mdiGithub } from '@mdi/js';

/** Small page footer: copyright up to the current year and a link to the source code. */
const REPO_URL = 'https://github.com/pfmnowak/sudoku-js';
const FIRST_YEAR = 2022;

const currentYear = new Date().getFullYear();
const years = currentYear > FIRST_YEAR ? `${FIRST_YEAR}–${currentYear}` : `${FIRST_YEAR}`;
</script>

<style scoped>
.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.25rem 1.25rem;
  margin-top: auto;
  padding: 1.5rem 1rem;
  font-size: 0.85rem;
}

.footer__link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 0.3rem;
}

.footer__link--repo {
  color: var(--color-text);
}

.footer__link--repo:hover {
  color: var(--color-accent);
}
</style>
