import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Entry, makeSamples } from './analysis';
type State = { entries: Entry[]; initialized: boolean; add: (entry: Entry) => void; remove: (id: string) => void; init: () => void; reset: () => void; samples: () => void };
export const useJournal = create<State>()(persist((set, get) => ({
  entries: [], initialized: false,
  init: () => { if (!get().initialized) set({ entries: makeSamples(), initialized: true }); },
  add: (entry) => set((s) => ({ entries: [...s.entries.filter(e => !e.sample), entry] })),
  remove: (id) => set(s => ({ entries: s.entries.filter(e => e.id !== id) })),
  reset: () => set({ entries: [], initialized: true }),
  samples: () => set({ entries: makeSamples(), initialized: true })
}), { name: 'aisana-journal-v1', storage: createJSONStorage(() => localStorage), skipHydration: true }));
