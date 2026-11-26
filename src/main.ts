import './assets/main.css';

import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { useSettingsStore } from './stores/settings';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
useSettingsStore(pinia);

app.mount('#app');
