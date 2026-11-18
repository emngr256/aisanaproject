import type { Entry } from './analysis';
const dayKey=(d:Date)=>`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const mean=(v:number[])=>v.length?v.reduce((s,n)=>s+n,0)/v.length:null;
export function weeklyReport(entries:Entry[],now=new Date()) {
 const start=new Date(now);start.setHours(0,0,0,0);start.setDate(start.getDate()-6);
 const previousStart=new Date(start);previousStart.setDate(previousStart.getDate()-7);
 const sampleMode=entries.length>0&&entries.every(e=>e.sample);
 const pool=entries.filter(e=>sampleMode?e.sample:!e.sample);
 const valid=pool.filter(e=>Number.isFinite(Date.parse(e.createdAt))&&(sampleMode||new Date(e.createdAt)<=now));
 const tomorrow=new Date(now);tomorrow.setHours(0,0,0,0);tomorrow.setDate(tomorrow.getDate()+1);
 const current=valid.filter(e=>new Date(e.createdAt)>=start&&new Date(e.createdAt)<tomorrow).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
 const previous=valid.filter(e=>new Date(e.createdAt)>=previousStart&&new Date(e.createdAt)<start);
 const daily=(list:Entry[])=>{const groups=new Map<string,Entry[]>();list.forEach(e=>{const key=dayKey(new Date(e.createdAt));groups.set(key,[...(groups.get(key)??[]),e]);});return [...groups.values()].map(group=>({score:mean(group.map(e=>e.analysis.score))!,mood:mean(group.map(e=>e.mood))!,sleep:mean(group.map(e=>e.sleep))!,activity:mean(group.map(e=>e.activity))!,workload:mean(group.map(e=>e.workload))!}));};
 const days=daily(current),before=daily(previous);const score=mean(days.map(d=>d.score));const previousScore=mean(before.map(d=>d.score));
 const triggers=new Map<string,number>();current.forEach(e=>new Set(e.analysis.triggers).forEach(t=>triggers.set(t,(triggers.get(t)??0)+1)));
 return {start,end:now,sampleMode,entries:current,days:days.length,score,mood:mean(days.map(d=>d.mood)),sleep:mean(days.map(d=>d.sleep)),activity:mean(days.map(d=>d.activity)),workload:mean(days.map(d=>d.workload)),delta:days.length>=3&&before.length>=3&&score!==null&&previousScore!==null?score-previousScore:null,triggers:[...triggers].sort((a,b)=>b[1]-a[1]).slice(0,3),latest:current.at(-1)};
}
