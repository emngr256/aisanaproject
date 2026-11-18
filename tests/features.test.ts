import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weeklyReport } from '../src/lib/weekly';
import { contradictions } from '../src/lib/contradictions';
import { presentAnalysis } from '../src/lib/presentation';
import { demoAnalyze, type Entry } from '../src/lib/analysis';
import { classify } from '../src/lib/local-ml';
import { tr } from '../src/lib/i18n';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const input={text:'Сегодня спокойно делаю задания по плану.',mood:3,sleep:7,activity:0,workload:0};
const now=new Date(2026,10,3,12);
function entry(daysAgo:number,score:number,id:string,sample=false):Entry {const day=new Date(now);day.setDate(day.getDate()-daysAgo);day.setHours(10);return {...input,id,sample,createdAt:day.toISOString(),analysis:{...demoAnalyze(input),score}};}
test('weekly averages weigh days equally, exclude old/future records and do not fill missing days with zero',()=>{
 const report=weeklyReport([entry(0,2,'a'),entry(0,4,'b'),entry(1,9,'c'),entry(6,6,'d'),entry(7,10,'old'),entry(-1,10,'future')],now);
 assert.equal(report.days,3);assert.equal(report.entries.length,4);assert.equal(report.score,6);assert.equal(report.delta,null);
});
test('weekly comparison needs 3 days each and excludes sample records from personal reports',()=>{
 const report=weeklyReport([entry(0,2,'a'),entry(1,2,'b'),entry(2,2,'c'),entry(7,6,'d'),entry(8,6,'e'),entry(13,6,'f'),entry(0,10,'sample',true)],now);
 assert.equal(report.delta,-4);assert.equal(report.sampleMode,false);assert.equal(report.entries.length,3);
 assert.equal(weeklyReport([],now).score,null);
});
test('contradiction detector asks about explicit mismatches in all 3 languages',()=>{
 for(const text of ['Я весь день учился.','I studied all day.','Күні бойы оқыдым.'])assert.ok(contradictions({...input,text}).some(c=>c.id==='study-all-day'));
 for(const text of ['Я не спал всю ночь.','I did not sleep.','Түні бойы ұйықтамадым.'])assert.ok(contradictions({...input,text}).some(c=>c.id==='no-sleep'));
 for(const text of ['Я спал 2 часа.','I slept 2 hours.','2 сағат ұйықтадым.'])assert.ok(contradictions({...input,text}).some(c=>c.id==='sleep-hours'));
});
test('detector avoids common negations and matching numbers',()=>{
 for(const text of ['Я не весь день учился.','I did not study all day.','Я спал 7 часов.','I slept 7 hours.'])assert.deepEqual(contradictions({...input,text}),[]);
});
test('tone only changes recommendation presentation and does not mutate entries',()=>{
 const e=entry(0,5,'a');const before=JSON.stringify(e);const gentle=presentAnalysis(e,'en','gentle'),coach=presentAnalysis(e,'en','coach');
 assert.equal(gentle.score,coach.score);assert.deepEqual(gentle.emotions,coach.emotions);assert.notEqual(gentle.recommendations[0].detail,coach.recommendations[0].detail);assert.equal(JSON.stringify(e),before);
});
test('all interface translation calls have Kazakh and English translations',()=>{
 const missing:string[]=[];
 for(const path of ['src/app/page.tsx','src/components/preferences-panel.tsx','src/components/weekly-report.tsx']){
  const sf=ts.createSourceFile(path,readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function visit(n:ts.Node){if(ts.isCallExpression(n)&&n.expression.getText(sf)==='tr'&&ts.isStringLiteral(n.arguments[0])){const key=n.arguments[0].text;if(/[А-Яа-я]/.test(key)&&key.trim()!=='А')for(const lang of ['kk','en'] as const)if(tr(key,lang)===key&&!(lang==='kk'&&['б.','мин','Экспорт'].includes(key)))missing.push(lang+': '+key);}ts.forEachChild(n,visit);}visit(sf);
 }assert.deepEqual(missing,[]);
});
test('local classifier recognizes unseen simple multilingual topics',()=>{
 assert.equal(classify('I procrastinate and get distracted by my phone').label,'avoid');
 assert.equal(classify('Қатты шаршадым ұйқым қанбады күшім жоқ').label,'fatigue');
});
