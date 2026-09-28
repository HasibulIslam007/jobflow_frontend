'use client';

import { create } from 'zustand';

import type { User } from '@/types/auth';

/**
 * Client-side auth snapshot. Server truth lives in TanStack Query
 * (`useSession`); this store mirrors it so components can read
 * auth state synchronously without awaiting a query.
 */

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export function selectIsAuthenticated(state: AuthState): boolean {
  return state.isAuthenticated;
}

export function selectCurrentUser(state: AuthState): User | null {
  return state.user;
}
