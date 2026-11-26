import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/new-game',
      name: 'newGame',
      component: () => import('../views/NewGameView.vue')
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../views/GameView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue')
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('../views/StatsView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' }
    }
  ]
});

export default router;
