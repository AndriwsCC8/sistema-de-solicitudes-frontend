import { createRouter, createWebHistory } from 'vue-router';
import Login from '../app/components/Login.vue';
import DashboardLayout from '../app/layouts/DashboardLayout.vue';
import { authGuard } from './guards/authGuard';
import { roleGuard } from './guards/roleGuard';
import { ROLES } from '../constants/roles';

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
      component: DashboardLayout,
      beforeEnter: authGuard,
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../app/components/MyRequests.vue'),
        },
        {
          path: 'new-request',
          name: 'NewRequest',
          component: () => import('../app/components/NewRequest.vue'),
        },
        {
          path: 'area-inbox',
          name: 'AreaInbox',
          component: () => import('../app/components/AreaInbox.vue'),
          beforeEnter: roleGuard(ROLES.AGENTE), // Requiere rol Agente o superior
        },
        {
          path: 'administration',
          name: 'Administration',
          component: () => import('../app/components/Administration.vue'),
          beforeEnter: roleGuard(ROLES.ADMIN), // Requiere rol Admin o superior
        },
        {
          path: 'request-detail/:id?',
          name: 'RequestDetail',
          component: () => import('../app/components/RequestDetail.vue'),
        },
      ],
    },
  ],
});

export default router;
