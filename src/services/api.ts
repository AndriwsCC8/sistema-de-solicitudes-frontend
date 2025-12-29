import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función helper para obtener el token
const getStoredToken = (): string | null => {
  try {
    const authDataStr = localStorage.getItem('auth_data');
    if (!authDataStr || authDataStr === 'undefined' || authDataStr === 'null') {
      return null;
    }
    const authData = JSON.parse(authDataStr);
    return authData?.token || null;
  } catch {
    return null;
  }
};

// Interceptor de request: agregar token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response: manejar errores 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Limpiar localStorage usando la nueva clave
      localStorage.removeItem('auth_data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Limpiar el store también (necesitamos importarlo de forma lazy)
      const { useAuthStore } = await import('@/stores/authStore');
      const authStore = useAuthStore();
      authStore.clearAuth();
      
      // Redirigir a login usando vue-router para mantener el comportamiento SPA
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
