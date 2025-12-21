import { createRouter, createWebHistory } from 'vue-router';
import Login from '../app/components/Login.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../app/components/MyRequests.vue'),
      // Aquí se pueden agregar guards después
    },
  ],
});

export default router;
