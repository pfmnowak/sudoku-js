<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="Sudoku" />
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/new-game">Start a New Game</RouterLink>
        <RouterLink v-if="gameStarted" to="/game">Resume a Game</RouterLink>
        <RouterLink to="/leaderboard">Leaderboard</RouterLink>
        <RouterLink to="/scores">Scores</RouterLink>
      </nav>
    </div>
  </header>

  <button @click="onConversationsAPIReady">Open the Chat</button>

  <div id="some-lovely-custom-id"></div>
  <RouterView />

  <TheFooter />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
import TheFooter from './components/layout/TheFooter.vue';

const gameStarted = true;

const onConversationsAPIReady = () => {
  console.log(`HubSpot Conversations API: ${window.HubSpotConversations}`);

  const status = window.HubSpotConversations.widget.status();
  console.log(`___HubSpot status___: ${status}`);

  console.log(`HubSpot Conversations WIDżET: ${window.HubSpotConversations.widget}`);
  // Ładujemy chuja
  window.HubSpotConversations.widget.load();
};

onMounted(() => {
  console.log('On Mounted');

  /*
    configure window.hsConversationsSettings if needed.
  */
  window.hsConversationsSettings = {
    loadImmediately: false,
    inlineEmbedSelector: '#some-lovely-custom-id',
    enableWidgetCookieBanner: true,
    disableAttachment: true
  };

  /*
    If external API methods are already available, use them.
  */
  if (window.HubSpotConversations) {
    // onConversationsAPIReady();
    console.log('API REDI');
  } else {
    console.log('API NOT REDI');
    /*
  Otherwise, callbacks can be added to the hsConversationsOnReady on the window object.
  These callbacks will be called once the external API has been initialized.
  */
    // window.hsConversationsOnReady = [onConversationsAPIReady];
  }
  console.log('END if On Mounted');
});
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
