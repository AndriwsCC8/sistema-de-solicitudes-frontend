import { defineStore } from 'pinia';
import authService, { type User } from '@/services/authService';
import { ROLES, hasMinRole } from '@/constants/roles';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// Clave única para localStorage
const AUTH_STORAGE_KEY = 'auth_data';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
    isAuthenticated: false,
  }),

  getters: {
    userRole: (state) => {
      const rol = state.user?.rol ?? null;
      console.log('🎯 [GETTER userRole] Devolviendo rol:', rol, '| user:', state.user);
      return rol;
    },
    isAdmin: (state) => {
      const rol = state.user?.rol ?? -1;
      const result = hasMinRole(rol, ROLES.ADMIN); // Usa la jerarquía correcta
      console.log('🎯 [GETTER isAdmin] Rol:', rol, '| Resultado:', result);
      return result;
    },
    isSuperAdmin: (state) => {
      const rol = state.user?.rol ?? -1;
      const result = rol === ROLES.SUPER_ADMIN; // SuperAdmin es exactamente 3
      console.log('🎯 [GETTER isSuperAdmin] Rol:', rol, '| Resultado:', result);
      return result;
    },
  },

  actions: {
    /**
     * Inicializa el estado de autenticación desde localStorage
     * Maneja errores de forma defensiva para evitar que la app se rompa
     */
    initialize() {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      try {
        const authDataStr = localStorage.getItem(AUTH_STORAGE_KEY);
        console.log('🔍 Inicializando auth desde localStorage:', authDataStr ? 'Datos encontrados' : 'Sin datos');
        
        // Si no hay datos o es "undefined" literal, limpiar todo
        if (!authDataStr || authDataStr === 'undefined' || authDataStr === 'null') {
          this.clearAuth();
          return;
        }

        // Intentar parsear los datos
        const authData = JSON.parse(authDataStr);

        // Validar que los datos son correctos
        if (this.isValidAuthData(authData)) {
          console.log('🔄 Cargando auth desde localStorage...');
          console.log('🔢 Rol en localStorage:', authData.user.rol, '(tipo:', typeof authData.user.rol, ')');
          console.log('🔍 Usuario completo en localStorage:', JSON.stringify(authData.user));
          
          this.token = authData.token;
          this.user = authData.user;
          this.isAuthenticated = true;
          
          console.log('💾 Rol cargado en store.user:', this.user.rol);
          console.log('🎯 userRole getter DESPUÉS de asignar:', this.userRole);
          console.log('🔍 Usuario completo en store:', JSON.stringify(this.user));
        } else {
          // Datos inválidos, limpiar
          console.warn('Datos de autenticación inválidos en localStorage, limpiando...');
          this.clearAuth();
        }
      } catch (error) {
        // Si hay cualquier error al parsear o cargar, limpiar todo
        console.error('Error al inicializar autenticación:', error);
        this.clearAuth();
      }
    },

    /**
     * Valida que los datos de autenticación tengan la estructura correcta
     */
    isValidAuthData(data: any): boolean {
      if (!data || typeof data !== 'object') {
        return false;
      }

      // Verificar que tenga token
      if (!data.token || typeof data.token !== 'string') {
        return false;
      }

      // Verificar que tenga user con estructura correcta
      if (!data.user || typeof data.user !== 'object') {
        return false;
      }

      const user = data.user;

      // Verificar campos obligatorios del usuario
      if (
        typeof user.id !== 'number' ||
        typeof user.rol !== 'number' ||
        !user.nombre ||
        !user.email
      ) {
        return false;
      }

      return true;
    },

    /**
     * Guarda los datos de autenticación en localStorage de forma segura
     */
    saveAuthData(token: string, user: User) {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      try {
        console.log('💾 Guardando en localStorage. Rol:', user.rol, '(tipo:', typeof user.rol, ')');
        
        // Guardar el objeto user COMPLETO sin reconstruirlo
        const authData = {
          token,
          user
        };

        const serialized = JSON.stringify(authData);
        localStorage.setItem(AUTH_STORAGE_KEY, serialized);
        
        // Verificar que se guardó correctamente
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        const parsed = JSON.parse(saved!);
        console.log('✅ Verificación: Rol guardado correctamente:', parsed.user.rol);
      } catch (error) {
        console.error('Error al guardar datos de autenticación:', error);
      }
    },

    /**
     * Limpia completamente los datos de autenticación
     */
    clearAuth() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;

      if (typeof window !== 'undefined' && window.localStorage) {
        // Limpiar tanto el nuevo formato como el antiguo por compatibilidad
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },

    /**
     * Realiza el login del usuario
     */
    async login(email: string, password: string) {
      try {
        const response = await authService.login(email, password);
        
        console.log('🔐 Validando respuesta de login...');
        
        // Validar que la respuesta tenga token
        if (!response.token || typeof response.token !== 'string') {
          console.error('❌ Token inválido:', response.token);
          throw new Error('Token no válido en la respuesta del servidor');
        }

        // Validar que la respuesta tenga user
        if (!response.user || typeof response.user !== 'object') {
          console.error('❌ Usuario inválido:', response.user);
          throw new Error('Datos de usuario no válidos en la respuesta del servidor');
        }

        // Validar campos obligatorios del usuario
        if (typeof response.user.id !== 'number') {
          console.error('❌ ID de usuario inválido:', response.user.id);
          throw new Error('ID de usuario no válido');
        }

        if (typeof response.user.rol !== 'number') {
          console.error('❌ Rol inválido:', response.user.rol);
          throw new Error('Rol de usuario no válido');
        }

        if (!response.user.nombre || typeof response.user.nombre !== 'string') {
          console.error('❌ Nombre inválido:', response.user.nombre);
          throw new Error('Nombre de usuario no válido');
        }

        if (!response.user.email || typeof response.user.email !== 'string') {
          console.error('❌ Email inválido:', response.user.email);
          throw new Error('Email de usuario no válido');
        }

        console.log('✅ Validación exitosa. Rol:', response.user.rol);
        console.log('🔢 Rol recibido en store:', response.user.rol, '(tipo:', typeof response.user.rol, ')');
        console.log('🔍 Usuario completo ANTES de asignar:', JSON.stringify(response.user));

        // Actualizar el estado (EL ROL SE GUARDA SIN MODIFICAR)
        this.token = response.token;
        this.user = response.user;
        this.isAuthenticated = true;
        
        console.log('💾 Rol guardado en store.user:', this.user.rol);
        console.log('🎯 userRole getter DESPUÉS de asignar:', this.userRole);
        console.log('🔍 Usuario completo en store:', JSON.stringify(this.user));
        console.log('⚠️ VERIFICACIÓN CRÍTICA: response.user.rol === this.user.rol?', response.user.rol === this.user.rol);

        // Guardar en localStorage de forma segura
        this.saveAuthData(response.token, response.user);

        return response;
      } catch (error) {
        // En caso de error, limpiar todo el estado
        console.error('❌ Error en login:', error);
        this.clearAuth();
        throw error;
      }
    },

    /**
     * Cierra la sesión del usuario
     */
    async logout() {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Error al hacer logout en el servidor:', error);
      } finally {
        // Siempre limpiar el estado local
        this.clearAuth();
      }
    },
  },
});
