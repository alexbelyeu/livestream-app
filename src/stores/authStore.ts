import { create } from 'zustand';

// Mock user type
interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Mock user for demo
const MOCK_USER: User = {
  id: 'user_1',
  username: 'demo_user',
  displayName: 'Demo User',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  signIn: async () => {
    set({ isLoading: true });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Set mock user
    set({
      user: MOCK_USER,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  signOut: async () => {
    set({ isLoading: true });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Clear user
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
