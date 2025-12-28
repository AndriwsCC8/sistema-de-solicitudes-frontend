import api from './api';

interface LoginCredentials {
  NombreUsuario: string;
  Password: string;
}

// Formato interno normalizado del usuario
interface User {
  id: number;
  email: string;
  nombre: string;
  rol: number; // 1: Usuario, 2: Agente, 3: Admin, 4: Super Admin
  area: string;
  areaId?: number | null;
}

// Formato REAL que devuelve el backend
interface BackendLoginResponse {
  token: string;
  usuarioId: number;
  nombreUsuario: string;
  nombre: string;
  email: string;
  rol: number;
  areaId?: number | null;
  areaNombre?: string | null;
}

// Formato interno normalizado
interface LoginResponse {
  token: string;
  user: User;
}

const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const credentials: LoginCredentials = { NombreUsuario: email, Password: password };
    const response = await api.post<BackendLoginResponse>('/api/auth/login', credentials);
    
    // ⚠️ CRÍTICO: Loguear la respuesta RAW del backend ANTES de cualquier procesamiento
    console.log('🚨🚨🚨 RESPUESTA RAW DEL BACKEND (SIN PROCESAR) 🚨🚨🚨');
    console.log('JSON completo:', JSON.stringify(response.data, null, 2));
    console.log('Tipo de response.data.rol:', typeof response.data.rol);
    console.log('Valor EXACTO de response.data.rol:', response.data.rol);
    console.log('Es número?', Number.isInteger(response.data.rol));
    console.log('Conversión a número:', Number(response.data.rol));
    console.log('🚨🚨🚨 FIN RESPUESTA RAW 🚨🚨🚨');
    
    // Loguear la respuesta completa del backend para debugging
    console.log('📥 Respuesta del backend:', {
      token: response.data.token ? `${response.data.token.substring(0, 20)}...` : 'NO TOKEN',
      usuarioId: response.data.usuarioId,
      nombreUsuario: response.data.nombreUsuario,
      nombre: response.data.nombre,
      email: response.data.email,
      rol: response.data.rol,
      rolType: typeof response.data.rol,
      areaId: response.data.areaId,
      areaNombre: response.data.areaNombre
    });
    console.log('🔢 Rol backend (DIRECTO):', response.data.rol);

    // Mapear la respuesta del backend al formato interno normalizado
    const normalizedResponse: LoginResponse = {
      token: response.data.token,
      user: {
        id: response.data.usuarioId,
        nombre: response.data.nombre,
        email: response.data.email,
        rol: response.data.rol, // ⚠️ CRÍTICO: Se asigna DIRECTAMENTE sin transformación
        area: response.data.areaNombre || '',
        areaId: response.data.areaId
      }
    };

    console.log('✅ Datos normalizados:', {
      token: normalizedResponse.token ? 'OK' : 'MISSING',
      userId: normalizedResponse.user.id,
      nombre: normalizedResponse.user.nombre,
      email: normalizedResponse.user.email,
      rol: normalizedResponse.user.rol,
      rolType: typeof normalizedResponse.user.rol,
      area: normalizedResponse.user.area
    });
    console.log('🔢 Rol normalizado (SIN CAMBIOS):', normalizedResponse.user.rol);
    console.log('⚠️ VERIFICACIÓN CRÍTICA: response.data.rol === normalizedResponse.user.rol?', response.data.rol === normalizedResponse.user.rol);
    console.log('🔍 Usuario normalizado completo:', JSON.stringify(normalizedResponse.user));

    return normalizedResponse;
  },

  async logout(): Promise<void> {
    // Por ahora solo es un método vacío
    // La lógica de limpieza de token se añadirá después
    return Promise.resolve();
  },
};

export default authService;
export type { User, LoginResponse };
