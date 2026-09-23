import { create } from 'zustand';
import { authAPI } from '../api/endpoints/auth';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || localStorage.getItem('authToken') || null,
  isAuthenticated: !!(localStorage.getItem('token') || localStorage.getItem('authToken')),
  loading: false,
  error: null,
  login: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login(userData);
      const token = data.token || data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token);
      if (data.data?.user) localStorage.setItem('user', JSON.stringify(data.data.user));
      set({ user: data.data?.user || data.user || null, token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw err;
    }
  },
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register(userData);
      const token = data.token || data.data;
      if (token && typeof token === 'string') { localStorage.setItem('token', token); localStorage.setItem('authToken', token); }
      set({ user: data.data?.user || data.user || null, token, isAuthenticated: !!token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw err;
    }
  },
  logout: async () => {
    localStorage.removeItem('token'); localStorage.removeItem('authToken'); localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  setUser: (user) => { localStorage.setItem('user', JSON.stringify(user)); set({ user }); },
  clearError: () => set({ error: null }),
}));
