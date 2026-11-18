export function features(text: string): string[] {
  const words = text.toLowerCase().replace(/ё/g, 'е').match(/\p{L}+/gu) ?? [];
  const stop = new Set(['и','в','на','с','по','я','из','к','а','но','за','это','что']);
  const tokens = words.filter(w => !stop.has(w)).map(w => w.slice(0, 5));
  return [...tokens, ...tokens.slice(1).map((w,i) => tokens[i] + '_' + w)];
}
