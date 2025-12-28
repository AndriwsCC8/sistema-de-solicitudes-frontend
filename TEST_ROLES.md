# 🧪 TEST DEL FLUJO DE ROLES

## 📋 Checklist de Verificación

### ✅ Cambios Implementados

1. **ELIMINADO definición duplicada de ROLES en authService.ts**
   - ❌ Ya no existe `export const ROLES = {...}` en authService.ts
   - ✅ Solo existe en `src/constants/roles.ts`

2. **CORREGIDO saveAuthData() para NO reconstruir el objeto user**
   - ❌ Ya NO hace: `user: { id: user.id, rol: user.rol, ... }`
   - ✅ Ahora hace: `user` (objeto completo sin reconstruir)
   - ✅ Log agregado: "💾 Guardando en localStorage. Rol: X"
   - ✅ Verificación post-guardado: "✅ Verificación: Rol guardado correctamente: X"

3. **AGREGADOS logs en initialize()**
   - ✅ "🔍 Inicializando auth desde localStorage"
   - ✅ "🔢 Rol en localStorage: X (tipo: number)"
   - ✅ "💾 Rol cargado en store: X"
   - ✅ "🎯 userRole getter: X"

4. **AGREGADOS logs en authService.login()**
   - ✅ "🔢 Rol backend (DIRECTO): X"
   - ✅ "🔢 Rol normalizado (SIN CAMBIOS): X"

5. **AGREGADO log en DashboardLayout**
   - ✅ "🎨 DashboardLayout - userRole: X"

## 🔬 Flujo Completo del Rol

```
Backend (C#)
    ↓ POST /api/auth/login
    ↓ Response: { rol: 4 }
    ↓
authService.login()
    ↓ 📥 Respuesta del backend: rol: 4
    ↓ 🔢 Rol backend (DIRECTO): 4
    ↓ Normalización: rol: response.data.rol (SIN CAMBIOS)
    ↓ 🔢 Rol normalizado (SIN CAMBIOS): 4
    ↓ return { user: { rol: 4 } }
    ↓
authStore.login()
    ↓ 🔐 Validando respuesta
    ↓ ✅ Validación exitosa. Rol: 4
    ↓ 🔢 Rol recibido en store: 4 (tipo: number)
    ↓ this.user = response.user (ASIGNACIÓN DIRECTA)
    ↓ 💾 Rol guardado en store: 4
    ↓ 🎯 userRole getter: 4
    ↓
authStore.saveAuthData()
    ↓ 💾 Guardando en localStorage. Rol: 4
    ↓ authData = { token, user } (OBJETO COMPLETO)
    ↓ localStorage.setItem('auth_data', JSON.stringify(authData))
    ↓ ✅ Verificación: Rol guardado correctamente: 4
    ↓
[REFRESH PAGE]
    ↓
authStore.initialize()
    ↓ 🔍 Inicializando auth desde localStorage
    ↓ authData = JSON.parse(localStorage.getItem('auth_data'))
    ↓ 🔢 Rol en localStorage: 4 (tipo: number)
    ↓ this.user = authData.user (ASIGNACIÓN DIRECTA)
    ↓ 💾 Rol cargado en store: 4
    ↓ 🎯 userRole getter: 4
    ↓
DashboardLayout
    ↓ userRole = computed(() => authStore.userRole)
    ↓ 🎨 DashboardLayout - userRole: 4
    ↓
Sidebar
    ↓ props.userRole = 4
    ↓ menuItems.filter(item => 4 >= item.minRole)
    ↓ Muestra TODOS los items (Usuario, Agente, Admin)
```

## 🧪 Comandos de Prueba

### 1. Limpiar localStorage y empezar fresco
```javascript
localStorage.clear()
location.reload()
```

### 2. Después de login, verificar rol en localStorage
```javascript
const auth = JSON.parse(localStorage.getItem('auth_data'))
console.log('Rol en localStorage:', auth.user.rol, typeof auth.user.rol)
```

### 3. Verificar rol en el store
```javascript
// En la consola del navegador
window.authDebug.showState()
```

### 4. Verificar getter del store
```javascript
// Esto debería mostrar el rol correcto
console.log('userRole getter:', $pinia.state.value.auth.user?.rol)
```

## 🎯 Resultados Esperados por Usuario

| Usuario   | Backend Rol | localStorage | authStore | userRole | Menú Visible |
|-----------|-------------|--------------|-----------|----------|--------------|
| superadmin| 4           | 4            | 4         | 4        | Todos + Usuarios |
| admin     | 3           | 3            | 3         | 3        | Hasta Admin |
| agente    | 2           | 2            | 2         | 2        | Hasta Bandeja |
| usuario   | 1           | 1            | 1         | 1        | Solo Base |

## 🚨 Señales de Alerta

Si ves en los logs:

❌ **Rol cambia entre pasos**: Bug de mutación
❌ **Tipo cambia a string**: Bug de serialización
❌ **Rol es 0 o undefined**: Bug de inicialización
❌ **Rol se resta 1**: Bug de mapeo con arrays

✅ **Rol mantiene el mismo número en todo el flujo**: CORRECTO

## 🔍 Debugging Avanzado

Si el rol sigue siendo incorrecto:

1. **Verificar respuesta del backend**:
```javascript
// En authService.ts, el primer log debería mostrar:
// 📥 Respuesta del backend: rol: 4
```

2. **Verificar que no hay transformaciones**:
```bash
# Buscar cualquier operación aritmética con rol
grep -r "rol.*[-+]" src/
grep -r "\.rol.*[-+]" src/
```

3. **Verificar que no hay mapeos con arrays**:
```bash
# Buscar acceso por índice con rol
grep -r "\[.*rol.*\]" src/
grep -r "roles\[" src/
```

4. **Verificar getters del store**:
```typescript
// En authStore.ts, el getter debe ser:
userRole: (state) => state.user?.rol || 1
// NO debe tener ninguna operación aritmética
```

## ✅ Confirmación Final

Después de hacer login con SuperAdmin (rol 4), ejecuta:

```javascript
// Todos estos deben mostrar 4
console.log('1. Backend response.user.rol:', /* ver en Network tab */)
console.log('2. authStore.user.rol:', JSON.parse(localStorage.getItem('auth_data')).user.rol)
console.log('3. userRole getter:', document.querySelector('[data-v-app]').__VUE__[0].ctx.userRole)
```

Si TODOS muestran 4, el bug está resuelto. ✅
