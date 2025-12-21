import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  area: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const credentials: LoginCredentials = { email, password };
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    // Por ahora solo es un método vacío
    // La lógica de limpieza de token se añadirá después
    return Promise.resolve();
  },
};

export default authService;
export type { User, LoginResponse };
