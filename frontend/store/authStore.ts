import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, UserProfile } from '@/types';
import { authApi } from '@/lib/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          
          if (response.status === 'success' && response.user) {
            set({ 
              user: response.user, 
              isLoggedIn: true,
              isLoading: false,
              error: null 
            });
          } else {
            throw new Error(response.message || 'Đăng nhập thất bại');
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Lỗi đăng nhập';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw error;
        }
      },

      signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.signup(email, password, name);
          
          if (response.status === 'success' && response.user) {
            // Sau khi đăng ký, tự động đăng nhập
            await get().login(email, password);
          } else {
            throw new Error(response.message || 'Đăng ký thất bại');
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Lỗi đăng ký';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        // Xóa localStorage
        localStorage.removeItem('user_profile');
        localStorage.removeItem('view_history');
        
        set({ 
          user: null, 
          isLoggedIn: false,
          error: null 
        });
      },

      updateProfile: async (profile: UserProfile) => {
        const { user } = get();
        if (!user) throw new Error('Chưa đăng nhập');
        
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.saveProfile(user.email, profile);
          
          if (response.status === 'success' && response.profile) {
            // Cập nhật user trong store
            set({ 
              user: { ...user, profile: response.profile },
              isLoading: false 
            });
            
            // Lưu vào localStorage
            localStorage.setItem('user_profile', JSON.stringify(response.profile));
          } else {
            throw new Error(response.message || 'Lưu profile thất bại');
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Lỗi lưu profile';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isLoggedIn: state.isLoggedIn
      }),
    }
  )
);