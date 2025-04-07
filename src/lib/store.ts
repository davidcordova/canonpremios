import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'seller';
  name: string;
  avatar?: string;
  category?: 'bronce' | 'plata' | 'oro' | 'diamante';
  points?: number;
  store?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserAvatar: (avatarUrl: string) => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
    // Lógica de inicio de sesión simulada
    if (email === 'vendedor@canon.com' && password === 'vendedor123') {
      const user: User = {
        id: '1',
        email,
        role: 'seller',
        name: 'Juan Pérez',
        store: 'Canon Store Central',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        category: 'plata',
        points: 1250
      };
      set({ user, isAuthenticated: true });
    } else if (email === 'vendedor2@canon.com' && password === 'vendedor123') {
      const user: User = {
        id: '2',
        email,
        role: 'seller',
        name: 'María García',
        store: 'Canon Store Norte',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        category: 'oro',
        points: 2800
      };
      set({ user, isAuthenticated: true });
    } else if (email === 'admin@canon.com' && password === 'admin123') {
      const user: User = {
        id: '3',
        email,
        role: 'admin',
        name: 'Administrador',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      };
      set({ user, isAuthenticated: true });
    } else {
      throw new Error('Credenciales inválidas');
    }
  },
  logout: () => set({ user: null, isAuthenticated: false }),
  updateUserAvatar: (avatarUrl: string) => set(state => ({
    user: state.user ? { ...state.user, avatar: avatarUrl } : null,
  })),
}), // Close the state definition function here
{ // Persist options object starts here
  name: 'auth-storage', // Unique name for the localStorage key
  storage: createJSONStorage(() => localStorage), // Use localStorage
  // Remove partialize to persist the entire state
}
) // Close persist()
); // Close create()
