import type { Entry, Analysis } from './analysis';
import { tr } from './i18n';
import { usePreferences, type Language, type Tone } from './preferences';
export function presentAnalysis(entry:Entry,language:Language=usePreferences.getState().language,tone:Tone=usePreferences.getState().tone):Analysis {
 const a=entry.analysis;
 const pick=(ru:string,kk:string,en:string)=>language==='ru'?ru:language==='kk'?kk:en;
 const t=(s:string)=>tr(s,language);
 // Never re-run inference or change saved scores when switching language/tone.
 const indexNote=pick('Условный индекс, не оценка здоровья или продуктивности. Движение не входит в формулу.','Шартты индекс, денсаулықтың немесе өнімділіктің бағасы емес. Қозғалыс формулаға кірмейді.','An estimated index, not a health or productivity assessment. Movement is not part of the formula.');
 const summary=language==='ru'?a.summary:pick('',`Тақырып: «${t(a.title)}». Бұл шағын синтетикалық деректерде үйретілген жергілікті модельдің болжамы. Индекс көңіл күйге, ұйқыға, оқу уақытына және мерзім туралы сөздерге тәуелді. ${indexNote} Бастапқы жазба аударылмайды.`,`Topic: “${t(a.title)}”. This is a suggestion from a local model trained on a small synthetic dataset. The index uses mood, sleep, study time and deadline mentions. ${indexNote} Your original entry is not translated.`);
 const prefix=tone==='gentle'?pick('Можно попробовать: ','Мынаны байқап көруге болады: ','You could try: '):tone==='coach'?pick('Твой следующий шаг: ','Келесі қадамың: ','Your next step: '):'';
 const ending=tone==='coach'?pick(' После этого отметь, удалось ли сделать шаг.',' Содан кейін қадамды орындағаныңды белгіле.',' Afterwards, note whether you completed the step.'):'';
 return {...a,title:t(a.title),summary,emotions:a.emotions.map(t),triggers:a.triggers.map(t),recommendations:a.recommendations.map(r=>({title:t(r.title),detail:prefix+t(r.detail)+ending}))};
}
