import { defineStore } from 'pinia';
import authService, { type User } from '@/services/authService';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: !!localStorage.getItem('token'),
  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const response = await authService.login(email, password);
        
        this.token = response.token;
        this.user = response.user;
        this.isAuthenticated = true;

        // Guardar en localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        return response;
      } catch (error) {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        throw error;
      }
    },

    async logout() {
      await authService.logout();

      this.token = null;
      this.user = null;
      this.isAuthenticated = false;

      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
