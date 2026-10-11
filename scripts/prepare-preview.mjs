import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'preview-dist');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
fs.cpSync(path.join(root,'playground'),path.join(out,'playground'),{recursive:true,filter:p=>!p.includes('/tests/')&&!p.includes('/node_modules/')&&!p.endsWith('.ts')});
fs.mkdirSync(path.join(out,'skills/b0rks-uiux/assets/components'),{recursive:true});
fs.cpSync(path.join(root,'playground/dist/skills'),path.join(out,'skills'),{recursive:true});
fs.writeFileSync(path.join(out,'index.html'),'<meta http-equiv="refresh" content="0;url=/playground/">');
console.log('Prepared',out);
