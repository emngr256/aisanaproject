import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Entry, makeSamples } from './analysis';

type State = {
  entries: Entry[];
  initialized: boolean;
  add: (entry: Entry) => void;
  remove: (id: string) => void;
  init: () => void;
  reset: () => void;
  samples: () => void;
  syncWithDatabase: () => Promise<void>;
};

export const useJournal = create<State>()(
  persist(
    (set, get) => ({
      entries: [],
      initialized: false,
      init: () => {
        if (!get().initialized) set({ entries: makeSamples(), initialized: true });
      },
      add: (entry) => {
        set((s) => ({ entries: [...s.entries.filter((e) => !e.sample), entry] }));
        if (typeof window !== 'undefined') {
          try {
            fetch('/api/entries', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ entry }),
            }).catch(() => {});
          } catch {
            // Ignore in test or offline environment
          }
        }
      },
      remove: (id) => {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
        if (typeof window !== 'undefined') {
          try {
            fetch(`/api/entries?id=${encodeURIComponent(id)}`, {
              method: 'DELETE',
            }).catch(() => {});
          } catch {
            // Ignore in test or offline environment
          }
        }
      },
      reset: () => set({ entries: [], initialized: true }),
      samples: () => set({ entries: makeSamples(), initialized: true }),
      syncWithDatabase: async () => {
        if (typeof window === 'undefined') return;
        try {
          const res = await fetch('/api/entries');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.entries) && data.entries.length > 0) {
              set({ entries: data.entries });
            }
          }
        } catch {
          // Ignore in test or offline environment
        }
      },
    }),
    {
      name: 'aisana-journal-v1',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
