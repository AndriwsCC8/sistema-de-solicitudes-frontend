# Guía de Solución de Problemas de Autenticación

## Problema Resuelto: "Error parsing user from localStorage"

### ¿Qué causaba el problema?

1. **Datos inválidos en localStorage**: El sistema intentaba parsear "undefined" o valores corruptos
2. **Sin validación**: No había verificación de que los datos fueran válidos antes de usarlos
3. **Falta de manejo de errores**: Cualquier error rompía toda la aplicación

### Solución Implementada

#### 1. Nuevo formato de almacenamiento
- **Antes**: `localStorage.setItem('token', ...)` y `localStorage.setItem('user', ...)`
- **Ahora**: `localStorage.setItem('auth_data', JSON.stringify({ token, user }))`
- **Ventaja**: Un solo objeto con validación completa

#### 2. Validación robusta
```typescript
isValidAuthData(data: any): boolean {
  // Verifica estructura completa
  // Valida tipos de datos
  // Confirma campos obligatorios
}
```

#### 3. Manejo defensivo de errores
```typescript
initialize() {
  try {
    // Intentar cargar datos
  } catch (error) {
    // Si falla, limpiar todo
    this.clearAuth();
  }
}
```

## Herramientas de Depuración

En la **consola del navegador** (F12), usa estos comandos:

### Ver estado actual
```javascript
authDebug.showState()
```
Muestra:
- Contenido de localStorage
- Datos del usuario parseados
- Rol y permisos

### Validar autenticación
```javascript
authDebug.validateAuth()
```
Verifica:
- ✅ Tiene token
- ✅ Tiene user
- ✅ User tiene id, nombre, email, rol
- ✅ Rol es válido (1-4)

### Limpiar todo
```javascript
authDebug.clearAuth()
```
Elimina todos los datos de autenticación

### Crear datos de prueba
```javascript
// Usuario normal (rol 1)
authDebug.setMockAuth(1)

// Agente (rol 2)
authDebug.setMockAuth(2)

// Administrador (rol 3)
authDebug.setMockAuth(3)

// Super Admin (rol 4)
authDebug.setMockAuth(4)
```

## Verificación de Roles

### Roles Numéricos
| Rol | Valor | Permisos |
|-----|-------|----------|
| Usuario | 1 | Básicos |
| Agente | 2 | + Bandeja de área |
| Admin | 3 | + Administración |
| Super Admin | 4 | + Gestión de usuarios |

### Verificar rol actual
```javascript
const authStore = useAuthStore()
console.log('Rol:', authStore.userRole)
console.log('Es Admin?:', authStore.isAdmin)
console.log('Es Super Admin?:', authStore.isSuperAdmin)
```

## Flujo de Autenticación

### Login
1. Usuario ingresa credenciales
2. Se envía petición al backend `/api/auth/login`
3. Backend responde con:
   ```json
   {
     "token": "...",
     "user": {
       "id": 1,
       "nombre": "...",
       "email": "...",
       "rol": 3,  // ← DEBE SER NÚMERO
       "area": "..."
     }
   }
   ```
4. Store valida la respuesta
5. Si es válida, guarda en localStorage como `auth_data`
6. Redirige a `/dashboard`

### Refresco de página
1. `authStore.initialize()` se ejecuta en `main.ts`
2. Lee `auth_data` de localStorage
3. Valida estructura y tipos
4. Si es válido, restaura el estado
5. Si es inválido, limpia todo

### Logout
1. Llama a `authStore.logout()`
2. Intenta notificar al backend
3. Siempre limpia el estado local (incluso si falla el backend)
4. Elimina `auth_data` de localStorage
5. Redirige a `/login`

## Problemas Comunes

### "Todos los usuarios entran como Usuario (rol 1)"

**Causa**: Backend no está devolviendo el rol correctamente

**Solución**:
1. Abrir consola del navegador
2. Ejecutar: `authDebug.showState()`
3. Verificar que `rol` sea un número, no un string
4. Si es string o undefined, el problema está en el backend

**Fix temporal** (solo para testing):
```javascript
authDebug.setMockAuth(3) // Crear usuario Admin
// Refrescar página
```

### "Error al iniciar autenticación"

**Causa**: Datos corruptos en localStorage

**Solución**:
```javascript
authDebug.clearAuth()
// Refrescar página e intentar login nuevamente
```

### "Usuario pierde sesión al refrescar"

**Causa**: Token o datos no se están guardando

**Solución**:
1. Login
2. Ejecutar: `authDebug.validateAuth()`
3. Si muestra errores, revisar qué campo falta
4. Verificar respuesta del backend

### "No se muestran opciones de Admin"

**Verificar**:
```javascript
const authStore = useAuthStore()
console.log('Rol:', authStore.userRole) // Debe ser >= 3
console.log('Es Admin:', authStore.isAdmin) // Debe ser true
```

Si el rol es correcto pero no se ven las opciones:
1. Limpiar caché del navegador
2. Hacer logout/login
3. Verificar que los componentes usen `authStore.userRole` o `authStore.isAdmin`

## Estructura del Store

### State
```typescript
{
  token: string | null,
  user: User | null,
  isAuthenticated: boolean
}
```

### Getters
```typescript
userRole: number         // Siempre devuelve un número (default: 1)
isAdmin: boolean        // true si rol >= 3
isSuperAdmin: boolean   // true si rol === 4
```

### Actions
- `initialize()`: Carga datos al iniciar
- `login(email, password)`: Realiza login
- `logout()`: Cierra sesión
- `clearAuth()`: Limpia todo
- `saveAuthData(token, user)`: Guarda de forma segura
- `isValidAuthData(data)`: Valida estructura

## Mejores Prácticas

### ✅ HACER
- Usar `authStore.userRole` en lugar de `authStore.user?.rol`
- Usar `authStore.isAdmin` para verificar permisos de admin
- Verificar `authStore.isAuthenticated` antes de acceder a rutas protegidas
- Manejar errores de login con try/catch

### ❌ NO HACER
- No acceder directamente a localStorage para autenticación
- No asumir que `authStore.user` siempre existe
- No guardar datos sin validar primero
- No usar `window.location.href` para navegación

## Contacto y Debug

Si encuentras problemas:

1. **Revisar consola**: Buscar errores en rojo
2. **Usar authDebug**: `authDebug.validateAuth()`
3. **Verificar red**: Pestaña Network en DevTools
4. **Revisar respuesta**: Ver qué devuelve el backend

En **desarrollo**, authDebug está disponible globalmente:
```javascript
authDebug.help() // Lista todos los comandos
```
