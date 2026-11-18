import { translations } from './translations';
import { analysisTranslations } from './analysis-translations';
import { usePreferences, type Language } from './preferences';
export const locales = {ru:'ru-RU',kk:'kk-KZ',en:'en-GB'};
export function tr(text:string, language:Language=usePreferences.getState().language):string {
 if(language==='ru') return text;
 const key=text.trim().replace(/\s+/g,' '); const translated=(translations[key] ?? analysisTranslations[key])?.[language==='kk'?0:1];
 return translated ? text.replace(text.trim(),translated) : text;
}
export const activeLocale=()=>locales[usePreferences.getState().language];
