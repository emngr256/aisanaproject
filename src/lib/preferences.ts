import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
export type Language = 'ru' | 'kk' | 'en';
export type Tone = 'gentle' | 'direct' | 'coach';
type Preferences = { language: Language; theme: 'light' | 'dark'; tone: Tone; setLanguage:(v:Language)=>void; setTheme:(v:'light'|'dark')=>void; setTone:(v:Tone)=>void };
export const usePreferences = create<Preferences>()(persist(set=>({language:'ru',theme:'light',tone:'gentle',setLanguage:language=>set({language}),setTheme:theme=>set({theme}),setTone:tone=>set({tone})}),{name:'aisana-preferences-v1',storage:createJSONStorage(()=>localStorage),skipHydration:true}));
