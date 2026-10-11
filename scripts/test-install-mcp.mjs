import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"b0x-install-"));
const target=path.join(temp,"mcp.json");
try{
 fs.writeFileSync(target,JSON.stringify({mcpServers:{other:{command:"node",args:["other.js"]}},custom:{enabled:true}}));
 const invoke=(args)=>spawnSync("bash",[path.join(root,"scripts/install-mcp.sh"),...args],{cwd:root,env:{...process.env,B0X_MCP_CONFIG:target},encoding:"utf8"});
 let r=invoke([]);
 assert.equal(r.status,0,r.stderr);
 let data=JSON.parse(fs.readFileSync(target,"utf8"));
 assert.equal(data.custom.enabled,true);
 assert.equal(data.mcpServers.other.args[0],"other.js");
 assert.equal(data.mcpServers.b0x.type,"stdio");
 assert.ok(fs.existsSync(target+".b0x-backup"));
 r=invoke(["--uninstall"]);
 assert.equal(r.status,0,r.stderr);
 data=JSON.parse(fs.readFileSync(target,"utf8"));
 assert.equal(data.mcpServers.b0x,undefined);
 assert.equal(data.mcpServers.other.command,"node");
 console.log("MCP installer round-trip PASS");
}finally{fs.rmSync(temp,{recursive:true,force:true});}
