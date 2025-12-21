import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

export function roleGuard(allowedRoles: string[]) {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore();

    if (!authStore.user) {
      next('/login');
      return;
    }

    if (!allowedRoles.includes(authStore.user.rol)) {
      next('/unauthorized');
      return;
    }

    next();
  };
}
