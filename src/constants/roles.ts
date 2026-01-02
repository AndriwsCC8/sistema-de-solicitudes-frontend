/**
 * Constantes de roles del sistema
 * Estos valores deben coincidir EXACTAMENTE con los valores numéricos del backend
 * IMPORTANTE: El backend usa valores específicos: Usuario=1, Administrador=2, SuperAdministrador=3, AgenteArea=4
 * 
 * Jerarquía de permisos (de menor a mayor):
 * Usuario (1) < Agente (4) < Admin (2) < SuperAdmin (3)
 */
export const ROLES = {
  USUARIO: 1,
  AGENTE: 4,
  ADMIN: 2,
  SUPER_ADMIN: 3
} as const;

/**
 * Jerarquía de roles para comparaciones
 * Orden: Usuario < Agente < Admin < SuperAdmin
 */
const ROLE_HIERARCHY: Record<number, number> = {
  1: 0,  // Usuario tiene nivel 0
  4: 1,  // Agente tiene nivel 1
  2: 2,  // Admin tiene nivel 2
  3: 3   // SuperAdmin tiene nivel 3
};

/**
 * Verifica si un usuario tiene permisos suficientes para un rol requerido
 * @param userRole - El rol del usuario
 * @param requiredRole - El rol mínimo requerido
 * @returns true si el usuario tiene el rol requerido o superior
 */
export const hasMinRole = (userRole: number, requiredRole: number): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 999;
  return userLevel >= requiredLevel;
};

/**
 * Helper para verificar si un usuario tiene exactamente un rol específico
 * @param userRole - El rol del usuario
 * @param requiredRole - El rol exacto requerido
 * @returns true si el usuario tiene exactamente ese rol
 */
export const hasExactRole = (userRole: number, requiredRole: number): boolean => {
  return userRole === requiredRole;
};

/**
 * Obtiene el nombre legible de un rol
 * @param role - El número del rol
 * @returns El nombre del rol en español
 */
export const getRoleName = (role: number): string => {
  switch (role) {
    case ROLES.USUARIO:        // 1
      return 'Usuario';
    case ROLES.ADMIN:          // 2
      return 'Administrador';
    case ROLES.SUPER_ADMIN:    // 3
      return 'Super Administrador';
    case ROLES.AGENTE:         // 4
      return 'Agente de Área';
    default:
      console.warn(`[getRoleName] Rol desconocido: ${role}`);
      return `Desconocido (${role})`;
  }
};
