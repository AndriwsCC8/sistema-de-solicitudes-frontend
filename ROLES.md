# Sistema de Roles

## Estructura de Roles Numéricos

El sistema utiliza roles numéricos que deben coincidir con los valores devueltos por el backend:

| Rol | Valor | Descripción | Permisos |
|-----|-------|-------------|----------|
| Usuario | 1 | Usuario normal del sistema | - Ver mis solicitudes<br>- Crear nuevas solicitudes<br>- Ver detalles de solicitudes propias |
| Agente | 2 | Agente de área | - Todo lo de Usuario<br>- Bandeja de área<br>- Gestionar solicitudes del área |
| Administrador | 3 | Administrador del sistema | - Todo lo de Agente<br>- Gestionar áreas<br>- Gestionar categorías<br>- Configuración del sistema<br>- Reportes |
| Super Admin | 4 | Super Administrador | - Todo lo de Administrador<br>- Gestionar usuarios<br>- Acceso total al sistema |

## Implementación

### Constantes
Las constantes de roles están definidas en `src/constants/roles.ts`:
```typescript
export const ROLES = {
  USUARIO: 1,
  AGENTE: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4
} as const;
```

### Verificación de Permisos
El sistema utiliza un modelo de permisos jerárquico donde un rol superior tiene todos los permisos de los roles inferiores.

```typescript
// Verificar si el usuario tiene rol mínimo requerido
userRole >= ROLES.ADMIN // true para Admin y Super Admin

// Verificar rol exacto
userRole === ROLES.USUARIO // true solo para Usuario
```

### Guards de Rutas
Las rutas están protegidas usando el guard `roleGuard`:
```typescript
{
  path: 'administration',
  beforeEnter: roleGuard(ROLES.ADMIN) // Solo Admin o superior
}
```

### Componentes
Los componentes verifican el rol para mostrar/ocultar funcionalidades:
```typescript
// En el menú lateral
const menuItems = items.filter(item => userRole >= item.minRole)

// En las tabs de administración
const tabs = allTabs.filter(tab => userRole >= tab.minRole)
```

## Configuración del Backend

Asegúrate de que tu backend devuelva el campo `rol` como número en la respuesta de login:

```json
{
  "token": "...",
  "user": {
    "id": 1,
    "nombre": "Usuario",
    "email": "usuario@ejemplo.com",
    "rol": 3,  // ← Debe ser un número (1, 2, 3 o 4)
    "area": "Soporte TI"
  }
}
```

## Solución de Problemas

### Todos los usuarios entran con rol de usuario normal
- Verifica que el backend esté devolviendo `rol` como número, no como string
- Revisa la consola del navegador para ver qué valor de rol se está recibiendo
- Verifica que el `localStorage` guarde correctamente el usuario con el rol numérico

### Usuario no ve opciones administrativas
- Verifica que el rol del usuario sea >= 3 (ADMIN)
- Revisa que el store esté leyendo correctamente el rol: `authStore.user?.rol`
- Asegúrate de que el rol se haya guardado correctamente en el login

### Consola para debugging
```javascript
// En la consola del navegador
const authStore = useAuthStore()
console.log('Rol del usuario:', authStore.user?.rol)
console.log('Usuario completo:', authStore.user)
```
