<template>
  <main>
    <base-button title="Start a New Game" class="button--cta" @click="startGameHandler" />
  </main>
</template>

<script lang="ts">
import BaseButton from '../components/base/BaseButton.vue'

export default {
  components: { BaseButton },

  setup() {
    const startGameHandler = () => {
      console.log('Start a new game!')
    }

    return {
      startGameHandler
    }
  }
}

BaseButton
</script>
