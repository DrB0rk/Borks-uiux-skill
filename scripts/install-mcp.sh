#!/usr/bin/env bash
# Register the b0x MCP server with an OMP installation.
#
#   ./scripts/install-mcp.sh            # user scope  (~/.omp/agent/mcp.json)
#   ./scripts/install-mcp.sh --project  # project scope (<repo>/.claude/mcp.json)
#   ./scripts/install-mcp.sh --uninstall
#
# User scope is the default: the server is stateless, so one registration
# serves every project. Per-project state lives in that project's .b0x/.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER="$REPO_ROOT/mcp/src/index.js"
NODE_BIN="$(command -v node || true)"

ACTION="install"
SCOPE="user"
for arg in "$@"; do
  case "$arg" in
    --uninstall) ACTION="uninstall" ;;
    --project)   SCOPE="project" ;;
    --user)      SCOPE="user" ;;
    -h|--help)   sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

[[ -n "$NODE_BIN" ]] || { echo "error: node not found on PATH" >&2; exit 1; }
[[ -f "$SERVER" ]]  || { echo "error: server not found at $SERVER" >&2; exit 1; }

if [[ "$SCOPE" == "user" ]]; then
  TARGET="${HOME}/.omp/agent/mcp.json"
else
  # OMP reads project config from its project dir; .claude is the default for omp.
  PROJECT_DIR="${B0X_PROJECT_DIR:-$(pwd)/.claude}"
  TARGET="$PROJECT_DIR/mcp.json"
fi

if [[ "$ACTION" == "uninstall" ]]; then
  [[ -f "$TARGET" ]] || { echo "nothing to uninstall: $TARGET does not exist"; exit 0; }
  node -e '
    const fs = require("fs");
    const f = process.argv[1];
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    if (j.mcpServers) delete j.mcpServers.b0x;
    fs.writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
  ' "$TARGET"
  echo "removed b0x from $TARGET"
  exit 0
fi

# Install dependencies if the SDK is not already present.
if [[ ! -d "$REPO_ROOT/mcp/node_modules/@modelcontextprotocol/sdk" ]]; then
  echo "installing MCP dependencies..."
  if command -v bun >/dev/null 2>&1; then
    (cd "$REPO_ROOT/mcp" && bun install --silent)
  else
    (cd "$REPO_ROOT/mcp" && npm install --silent)
  fi
fi

mkdir -p "$(dirname "$TARGET")"
[[ -f "$TARGET" ]] || printf '{\n  "mcpServers": {}\n}\n' > "$TARGET"

node -e '
  const fs = require("fs");
  const [file, command, server] = process.argv.slice(1);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  j.mcpServers = j.mcpServers || {};
  const prior = j.mcpServers.b0x;
  j.mcpServers.b0x = { command, args: [server], type: "stdio" };
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
  if (prior && JSON.stringify(prior) !== JSON.stringify(j.mcpServers.b0x)) {
    console.log("updated existing b0x entry (previous command pointed elsewhere)");
  }
' "$TARGET" "$NODE_BIN" "$SERVER"

echo "registered b0x in $TARGET"
echo
echo "Verify with:   omp mcp list"
echo "Then restart OMP so it picks the server up."
echo
echo "NOTE: .b0x/ holds per-project design feedback. It is not sensitive by"
echo "default, but review it before committing - see mcp/README.md."