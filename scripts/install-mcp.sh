#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER="$ROOT/mcp/src/index.js"
NODE_BIN="$(command -v node || true)"
[[ -n "$NODE_BIN" && -f "$SERVER" ]] || { echo 'Node and MCP server are required' >&2; exit 1; }
MODE=install; TARGET="${B0X_MCP_CONFIG:-}"
for arg in "$@"; do
 case "$arg" in
  --uninstall) MODE=uninstall;;
  --user) [[ -n "$TARGET" ]] || TARGET="$HOME/.omp/agent/mcp.json";;
  --project) [[ -n "$TARGET" ]] || TARGET="$(pwd)/.claude/mcp.json";;
  --help|-h) echo 'Usage: B0X_MCP_CONFIG=/absolute/path/to/mcp.json install-mcp.sh [--uninstall|--user|--project]'; exit 0;;
  *) echo "Unknown option $arg" >&2; exit 2;;
 esac
done
[[ -n "$TARGET" ]] || { echo 'Set B0X_MCP_CONFIG to the verified OMP MCP config path, or explicitly use --user/--project after checking your OMP version.' >&2; exit 2; }
if [[ "$MODE" == install && ! -d "$ROOT/mcp/node_modules/@modelcontextprotocol/sdk" ]]; then
 (cd "$ROOT/mcp" && if command -v bun >/dev/null; then bun install --frozen-lockfile; else npm install --no-audit; fi)
fi
mkdir -p "$(dirname "$TARGET")"
node - "$TARGET" "$MODE" "$NODE_BIN" "$SERVER" <<'NODE'
const fs=require('fs'),path=require('path');const [file,mode,command,server]=process.argv.slice(2);
const original=fs.existsSync(file)?fs.readFileSync(file,'utf8'):null;
const data=original?JSON.parse(original):{mcpServers:{}};
if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Expected JSON config object');
if(data.mcpServers!==undefined&&(!data.mcpServers||typeof data.mcpServers!=='object'||Array.isArray(data.mcpServers)))throw Error('Invalid mcpServers object');
data.mcpServers??={};
if(mode==='uninstall'){delete data.mcpServers.b0x;}else{data.mcpServers.b0x={command,args:[server],type:'stdio'};}
if(original!==null)fs.copyFileSync(file,file+'.b0x-backup');
const temp=path.join(path.dirname(file),'.'+path.basename(file)+'.'+process.pid+'.tmp');
try{fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{mode:0o600});fs.renameSync(temp,file);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
console.log(mode==='install'?'Registered b0x MCP':'Removed b0x MCP',file);
NODE
