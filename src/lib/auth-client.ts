'use client';
import { create } from 'zustand';
import type { AuthUser } from './auth';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  checkSession: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  loginDemo: () => Promise<AuthUser | null>;
  loginDemoAdmin: () => Promise<AuthUser | null>;
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
  loginDemo: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Google Студент',
          email: 'student.google@aisana.me',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, loading: false, initialized: true });
        return data.user;
      }
    } catch {
      // ignore
    }
    set({ loading: false });
    return null;
  },
  loginDemoAdmin: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Alan (Admin)',
          email: 'alan27945@gmail.com',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, loading: false, initialized: true });
        return data.user;
      }
    } catch {
      // ignore
    }
    set({ loading: false });
    return null;
  },
}));
