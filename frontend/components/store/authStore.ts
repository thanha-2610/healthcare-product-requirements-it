import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  username: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void; 
  logout: () => void;
}
 
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      login: (userData: User) => set({ user: userData, isLoggedIn: true }), 
      logout: () => {
        set({ user: null, isLoggedIn: false });
        localStorage.removeItem('user_profile');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),  
    }
  )
);