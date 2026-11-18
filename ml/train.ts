import { writeFileSync } from 'node:fs';
import corpus from './corpus.json';
import { features } from './features';
const examples=Object.values(corpus).reduce((n,rows)=>n+rows.length,0);
const vocab = new Set<string>();
const classes = Object.fromEntries(Object.entries(corpus).map(([label, texts]) => {
  const counts: Record<string,number> = {}; let total = 0;
  for (const text of texts) for (const token of features(text)) { counts[token] = (counts[token] || 0) + 1; total++; vocab.add(token); }
  return [label, {counts,total,documents:texts.length}];
}));
const model = {version:1, algorithm:'Multinomial Naive Bayes', provenance:`${examples} synthetic RU/KK/EN examples authored for this educational MVP; not clinical data`, vocabulary:[...vocab].sort(), classes,examples};
writeFileSync(new URL('../src/lib/local-model.json', import.meta.url), JSON.stringify(model));
console.log(`Trained ${Object.keys(classes).length} classes on ${examples} examples; vocabulary ${vocab.size}. No network or personal diary data used.`);
