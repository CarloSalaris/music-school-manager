/**
 * AuthStore — authentication state management.
 *
 * Manages the JWT token and current user data.
 * Used by fetchApi to inject Authorization headers
 * and handle 401 auto-logout.
 *
 * TODO: Will be expanded when building the login page:
 * - login/logout API calls
 * - role-based access (admin, segreteria, insegnante, studente)
 * - persist token across page refreshes (pinia-plugin-persistedstate)
 */
import { defineStore } from "pinia";

interface AuthUser {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  role: string;
}

interface LogoutOptions {
  message?: string;
}

export const useAuthStore = defineStore("AuthStore", {
  state: () => ({
    token: null as string | null,
    user: null as AuthUser | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role ?? "",
  },

  actions: {
    setAuth(token: string, user: AuthUser) {
      this.token = token;
      this.user = user;
    },

    logout(_options: LogoutOptions = {}) {
      this.token = null;
      this.user = null;
      navigateTo("/login");
    },
  },
});
