'use client';
import { create } from 'zustand';
import type { AuthUser } from './auth';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  checkSession: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  checkSession: async () => {
    if (typeof window === 'undefined') return null;
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, loading: false, initialized: true });
        return data.user;
      }
    } catch {
      // Gracefully handled in test or offline environment
    }
    set({ user: null, loading: false, initialized: true });
    return null;
  },
  logout: async () => {
    set({ loading: true });
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    set({ user: null, loading: false });
  },
}));
