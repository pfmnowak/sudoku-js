<template>
  <v-responsive class="border rounded" pa-4>
    <v-app>
      <v-main style="padding: 2rem; display: flex; flex-direction: column">
        <RouterView />
      </v-main>
      <TheFooter />
    </v-app>
  </v-responsive>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import TheFooter from './components/layout/TheFooter.vue';
</script>
