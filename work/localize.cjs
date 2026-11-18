const fs=require('fs'),ts=require('typescript');const path='src/app/page.tsx';let s=fs.readFileSync(path,'utf8');const sf=ts.createSourceFile(path,s,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const edits=[];
function insideFunction(n){for(let p=n.parent;p;p=p.parent)if(ts.isFunctionLike(p))return true;return false;}
function visit(n){
 if(ts.isJsxText(n)&&/[А-Яа-яЁё]/.test(n.text)){const raw=n.text;const norm=raw.trim().replace(/\s+/g,' ');const str=(/^\s/.test(raw)?' ':'')+norm+(/\s$/.test(raw)?' ':'');edits.push([n.getStart(sf),n.end,'{tr('+JSON.stringify(str)+')}']);return;}
 if(ts.isStringLiteral(n)&&/[А-Яа-яЁё]/.test(n.text)&&insideFunction(n)){
  if(ts.isCallExpression(n.parent)&&n.parent.expression.getText(sf)==='tr')return;
  const call='tr('+JSON.stringify(n.text)+')';edits.push([n.getStart(sf),n.end,ts.isJsxAttribute(n.parent)?'{'+call+'}':call]);return;
 }ts.forEachChild(n,visit);
}visit(sf);for(const [a,b,v]of edits.sort((x,y)=>y[0]-x[0]))s=s.slice(0,a)+v+s.slice(b);
s=s.replace("const v = Math.abs(n); return forms[", "const v = Math.abs(n); if(usePreferences.getState().language==='en')return forms[v===1?0:2]; if(usePreferences.getState().language==='kk')return forms[0]; return forms[");fs.writeFileSync(path,s);console.log('Localized',edits.length,'text nodes');
