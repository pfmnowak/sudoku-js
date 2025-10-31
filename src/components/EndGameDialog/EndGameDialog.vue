<template>
  <v-dialog v-model="store.endGameModalOpen" width="auto">
    <v-card max-width="400" prepend-icon="mdi-update" title="Congratulations!">
      <v-card-text
        >🏆Congratulations! You have completed the Sudoku puzzle in
        {{ formattedTime }} 🥳</v-card-text
      >
      <template v-slot:actions>
        <v-btn class="ms-auto" text="Ok" @click="store.toggleEndGameModal()"></v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useGameStateStore } from '@/store';
import { computed } from 'vue';

const store = useGameStateStore();
const formattedTime = computed(() => {
  const hours = Math.floor(store.timer / 3600).toString();
  const minutes = Math.floor((store.timer % 3600) / 60).toString();
  const seconds = (store.timer % 60).toString();

  return `${hours && hours !== '0' ? hours + ' hours, ' : ''}${minutes && minutes !== '0' ? minutes + ' minutes and ' : ''}${seconds} seconds`;
});
</script>
