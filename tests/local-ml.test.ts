import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, localAnalyze } from '../src/lib/local-ml';
import { analysisSchema } from '../src/lib/analysis';
test('zero study time does not confirm academic overload and the formula is explained',()=>{
 const result=localAnalyze({text:'Слишком много заданий одновременно огромная нагрузка не справляюсь',mood:3,sleep:8,activity:0,workload:0});
 assert.notEqual(result.title,'Кажется, задач стало слишком много');
 assert.match(result.summary,/0 часов учёбы/);
 assert.match(result.summary,/не входит в формулу/);
 assert.ok(analysisSchema.safeParse(result).success);
});
test('unknown vocabulary produces an uncertain result',()=>assert.equal(classify('космодром галактика метеорит').uncertain,true));
test('local analysis produces valid output without network access',()=>{
 const original=globalThis.fetch;
 globalThis.fetch=(()=>{throw new Error('Network unavailable');}) as typeof fetch;
 try {const result=localAnalyze({text:'Откладываю учебу и постоянно отвлекаюсь на телефон',mood:3,sleep:7,activity:20,workload:6}); assert.equal(result.source,'local'); assert.ok(analysisSchema.safeParse(result).success); assert.equal(classify('Откладываю учебу и постоянно отвлекаюсь на телефон').label,'avoid');} finally {globalThis.fetch=original;}
});
