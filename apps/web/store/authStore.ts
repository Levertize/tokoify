import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  setAuth: (user, accessToken) => set({ user, accessToken, isLoading: false }),
  setAccessToken: (token) => set({ accessToken: token }),
  clearAuth: () => set({ user: null, accessToken: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const apiClient = (await import('@/lib/api')).default;
      const res: any = await apiClient.get('/auth/me', {
        _noRedirect: true,
      } as any);
      if (res?.success && res.data) {
        const token = useAuthStore.getState().accessToken;
        set({ user: res.data, accessToken: token, isLoading: false });
      } else {
        set({ user: null, accessToken: null, isLoading: false });
      }
    } catch (err) {
      set({ user: null, accessToken: null, isLoading: false });
    }
  },
}));

export default useAuthStore;
