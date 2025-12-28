import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { ROLES, hasMinRole } from '@/constants/roles';

// Guard que verifica si el usuario tiene el rol mínimo requerido
export function roleGuard(minRole: number) {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore();

    console.log('🛡️ [roleGuard] Verificando acceso a:', to.path);
    console.log('🛡️ [roleGuard] Rol mínimo requerido:', minRole);
    console.log('🛡️ [roleGuard] Usuario actual:', authStore.user);
    console.log('🛡️ [roleGuard] Rol del usuario:', authStore.user?.rol);
    console.log('🛡️ [roleGuard] userRole getter:', authStore.userRole);

    if (!authStore.user) {
      console.log('🛡️ [roleGuard] ❌ Sin usuario, redirigiendo a login');
      next('/login');
      return;
    }

    // Verificar que el usuario tenga el rol mínimo requerido usando jerarquía correcta
    const hasAccess = hasMinRole(authStore.user.rol, minRole);
    console.log('🛡️ [roleGuard] Verificación hasMinRole:', authStore.user.rol, 'vs', minRole, '=', hasAccess);
    
    if (!hasAccess) {
      console.log('🛡️ [roleGuard] ❌ Acceso denegado, redirigiendo a dashboard');
      next('/dashboard'); // Redirigir al dashboard si no tiene permisos
      return;
    }

    console.log('🛡️ [roleGuard] ✅ Acceso concedido');
    next();
  };
}
