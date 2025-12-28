/**
 * Utilidades para depuración del sistema de autenticación
 * Usar en la consola del navegador para diagnosticar problemas
 */

export const authDebug = {
  /**
   * Muestra el estado actual de autenticación
   */
  showState() {
    const authDataStr = localStorage.getItem('auth_data');
    
    console.group('🔐 Estado de Autenticación');
    console.log('localStorage auth_data:', authDataStr);
    
    if (!authDataStr || authDataStr === 'undefined' || authDataStr === 'null') {
      console.warn('⚠️ No hay datos de autenticación o son inválidos');
    } else {
      try {
        const authData = JSON.parse(authDataStr);
        console.log('✅ Datos parseados correctamente:');
        console.log('Token:', authData.token ? `${authData.token.substring(0, 20)}...` : 'NO HAY TOKEN');
        console.log('Usuario:', {
          id: authData.user?.id,
          nombre: authData.user?.nombre,
          email: authData.user?.email,
          rol: authData.user?.rol,
          rolNombre: this.getRoleName(authData.user?.rol),
          area: authData.user?.area
        });
      } catch (error) {
        console.error('❌ Error al parsear datos:', error);
      }
    }
    console.groupEnd();
  },

  /**
   * Verifica si los datos de autenticación son válidos
   */
  validateAuth() {
    const authDataStr = localStorage.getItem('auth_data');
    
    console.group('✔️ Validación de Autenticación');
    
    if (!authDataStr) {
      console.error('❌ No hay datos en localStorage');
      console.groupEnd();
      return false;
    }

    if (authDataStr === 'undefined' || authDataStr === 'null') {
      console.error('❌ Datos inválidos en localStorage:', authDataStr);
      console.groupEnd();
      return false;
    }

    try {
      const authData = JSON.parse(authDataStr);
      
      const validations = [
        { name: 'Tiene token', valid: !!authData.token && typeof authData.token === 'string' },
        { name: 'Tiene user', valid: !!authData.user && typeof authData.user === 'object' },
        { name: 'User tiene id', valid: typeof authData.user?.id === 'number' },
        { name: 'User tiene nombre', valid: !!authData.user?.nombre },
        { name: 'User tiene email', valid: !!authData.user?.email },
        { name: 'User tiene rol', valid: typeof authData.user?.rol === 'number' },
        { name: 'Rol es válido (1,2,3,4)', valid: [1, 2, 3, 4].includes(authData.user?.rol) }
      ];

      let allValid = true;
      validations.forEach(({ name, valid }) => {
        if (valid) {
          console.log(`✅ ${name}`);
        } else {
          console.error(`❌ ${name}`);
          allValid = false;
        }
      });

      console.log('\n🎯 Resultado:', allValid ? 'VÁLIDO' : 'INVÁLIDO');
      console.groupEnd();
      return allValid;
    } catch (error) {
      console.error('❌ Error al parsear:', error);
      console.groupEnd();
      return false;
    }
  },

  /**
   * Limpia completamente los datos de autenticación
   */
  clearAuth() {
    console.group('🧹 Limpiando autenticación');
    
    const keys = ['auth_data', 'token', 'user'];
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`Eliminando ${key}:`, value.substring(0, 50) + '...');
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Autenticación limpiada');
    console.groupEnd();
  },

  /**
   * Simula datos de autenticación para testing
   */
  setMockAuth(rol: number = 3) {
    const mockAuth = {
      token: 'mock_token_' + Date.now(),
      user: {
        id: 1,
        nombre: 'Usuario de Prueba',
        email: 'test@test.com',
        rol: rol,
        area: 'Testing'
      }
    };

    localStorage.setItem('auth_data', JSON.stringify(mockAuth));
    console.log('✅ Datos mock guardados:', mockAuth);
    console.log('🔄 Recarga la página para que se apliquen');
  },

  /**
   * Obtiene el nombre del rol
   */
  getRoleName(rol: number): string {
    // Usar directamente la función de constants/roles.ts
    const names: Record<number, string> = {
      1: 'Usuario',
      2: 'Administrador',
      3: 'Super Administrador',
      4: 'Agente de Área'
    };
    return names[rol] || 'Desconocido';
  },

  /**
   * Muestra ayuda de comandos disponibles
   */
  help() {
    console.log(`
🔐 Utilidades de Depuración de Autenticación

Comandos disponibles (en la consola del navegador):

1. authDebug.showState()
   Muestra el estado actual de autenticación

2. authDebug.validateAuth()
   Valida que los datos de autenticación sean correctos

3. authDebug.clearAuth()
   Limpia todos los datos de autenticación

4. authDebug.setMockAuth(rol)
   Crea datos de autenticación de prueba
   Ejemplo: authDebug.setMockAuth(3) // Crea un usuario Admin

5. authDebug.help()
   Muestra esta ayuda

Ejemplo de uso:
> authDebug.showState()
> authDebug.validateAuth()
    `);
  }
};

// Hacer disponible globalmente en desarrollo
if (import.meta.env.DEV) {
  (window as any).authDebug = authDebug;
  console.log('🔧 authDebug disponible globalmente. Usa authDebug.help() para ver comandos');
}
