#!/usr/bin/env node
// Zero runtime-dependency TypeScript watcher and local preview server.
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {createReadStream,readFileSync,statSync,watch} from 'node:fs';
import {dirname,resolve,extname,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const compiler=resolve(root,'node_modules/typescript/bin/tsc');
const child=spawn(process.execPath,[compiler,'-p',resolve(root,'tsconfig.components.json'),'--watch'],{stdio:'inherit'});
const clients=new Set();let changed;
for(const folder of ['playground','skills/b0rks-uiux/assets/components']){watch(resolve(root,folder),{recursive:true},(_,filename)=>{if(filename?.includes('dist/'))return;clearTimeout(changed);changed=setTimeout(()=>{for(const client of clients)client.write('data: update\\n\\n')},250)})}
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript'};
const server=createServer((req,res)=>{
 const url=new URL(req.url??'/', 'http://127.0.0.1');
 if(url.pathname==='/__reload'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache'});clients.add(res);req.on('close',()=>clients.delete(res));return}
 if(url.pathname==='/'){res.writeHead(302,{Location:'/playground/'}).end();return}
 let target=resolve(root,'.'+decodeURIComponent(url.pathname));
 if(!target.startsWith(root+sep)){res.writeHead(403).end();return}
 try{if(statSync(target).isDirectory())target=join(target,'index.html');const type=mime[extname(target)];if(!type){res.writeHead(403).end();return}
 if(type==='text/html'){res.writeHead(200,{'Content-Type':type}).end(readFileSync(target,'utf8').replace('</body>',`<script>new EventSource('/__reload').onmessage=()=>location.reload()</script></body>`))}
 else {res.writeHead(200,{'Content-Type':type});createReadStream(target).pipe(res)}}catch{res.writeHead(404).end('Not found')}
});
server.listen(Number(process.env.PORT??4173),'127.0.0.1',()=>console.log('Workbench: http://127.0.0.1:4173/playground/'));
process.on('SIGINT',()=>{child.kill();server.close()});
