#!/usr/bin/env bash
# Validate the skill package before publishing.
#
# Catches the failure modes that have actually bitten this repo:
#   - a rename dropped `metadata.version`, silently breaking `omp skill publish`
#   - a reference file was deleted but SKILL.md still links to it
#   - package.json and SKILL.md drifted to different skill names/versions
#   - a malformed markdown heading (`#Heading`) silently swallowed a note
#
# Usage: ./scripts/validate.sh   (exit 0 = safe to publish, 1 = problems found)
set -uo pipefail

cd "$(dirname "$0")/.."
fail=0
ok()   { printf '  \033[32mok\033[0m    %s\n' "$1"; }
bad()  { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; fail=1; }

skill_dir="$(find skills -mindepth 1 -maxdepth 1 -type d | head -1)"
skill_name="$(basename "$skill_dir")"

echo "Skill: ${skill_dir}"

# 1. SKILL.md exists with parseable frontmatter
[[ -f "${skill_dir}/SKILL.md" ]] || { bad "SKILL.md missing"; exit 1; }

python3 - "$skill_dir" <<'PY'
import re, sys, pathlib
p = pathlib.Path(sys.argv[1], "SKILL.md")
m = re.match(r"^---\n(.*?)\n---\n", p.read_text(), re.S)
if not m:
    print("  \033[31mFAIL\033[0m  SKILL.md has no frontmatter delimiters"); sys.exit(1)
try:
    import yaml
    fm = yaml.safe_load(m.group(1)) or {}
except ImportError:
    fm = {}
    for line in m.group(1).splitlines():
        if line and not line[0].isspace() and ":" in line:
            k, v = line.split(":", 1); fm[k.strip()] = v.strip()
name = fm.get("name", "")
if name != p.parent.name:
    print(f"  \033[31mFAIL\033[0m  frontmatter name {name!r} != directory {p.parent.name!r}"); sys.exit(1)
print(f"  \033[32mok\033[0m    frontmatter parses; name matches directory ({name})")
ver = (fm.get("metadata") or {}).get("version")
if ver:
    print(f"  \033[32mok\033[0m    metadata.version present ({ver})")
else:
    print("  \033[31mFAIL\033[0m  metadata.version missing - `omp skill publish` will reject this"); sys.exit(1)
PY
[[ $? -ne 0 ]] && fail=1

# 2. Every relative markdown link resolves
dead=$(python3 - "$skill_dir" <<'PY'
import re, sys, pathlib
root = pathlib.Path(sys.argv[1]); bad = []
for p in root.rglob("*.md"):
    for link in re.findall(r"\]\(([^)]+)\)", p.read_text()):
        if link.startswith(("http", "#")):
            continue
        if not (p.parent / link.split("#")[0]).exists():
            bad.append(f"{p.relative_to(root)} -> {link}")
print("\n".join(bad))
PY
)
if [[ -z "$dead" ]]; then ok "all relative links resolve"; else bad "dead links:"; echo "$dead" | sed 's/^/        /'; fi

# 3. package.json agrees with the skill directory and version
python3 - "$skill_dir" "$skill_name" <<'PY'
import json, re, sys, pathlib
skill_dir, skill_name = pathlib.Path(sys.argv[1]), sys.argv[2]
pkg = json.loads(pathlib.Path("package.json").read_text())
problems = []
if skill_name not in pkg.get("name", ""):
    problems.append(f"package name {pkg.get('name')!r} does not contain skill dir {skill_name!r}")
m = re.match(r"^---\n(.*?)\n---\n", (skill_dir / "SKILL.md").read_text(), re.S)
try:
    import yaml; fm = yaml.safe_load(m.group(1)) or {}
except ImportError:
    fm = {}
sver = (fm.get("metadata") or {}).get("version")
if sver and pkg.get("version") and sver != pkg["version"]:
    problems.append(f"metadata.version {sver} != package.json version {pkg['version']}")
if "skills/" not in pkg.get("files", []):
    problems.append('package.json "files" does not include skills/')
if not pkg.get("omp", {}).get("skills"):
    problems.append('package.json omp.skills is missing or empty')
if problems:
    for p in problems:
        print(f"  \033[31mFAIL\033[0m  {p}")
    sys.exit(1)
print(f"  \033[32mok\033[0m    package.json consistent (v{pkg.get('version')})")
PY
[[ $? -ne 0 ]] && fail=1

# 4. Malformed markdown headings (#Heading) that render as literal text
broken=$(grep -rn '^#[^# ]' --include='*.md' "$skill_dir" 2>/dev/null | grep -v '^\s*$' || true)
if [[ -z "$broken" ]]; then ok "no malformed headings"; else bad "malformed heading (missing space):"; echo "$broken" | sed 's/^/        /'; fi

# 5. Orphan reference files never linked from SKILL.md
orphans=$(comm -23 \
  <(find "$skill_dir/references" -name '*.md' -exec basename {} \; 2>/dev/null | sort) \
  <(grep -o 'references/[a-z0-9.-]*\.md' "$skill_dir/SKILL.md" | xargs -n1 basename 2>/dev/null | sort -u))
if [[ -z "$orphans" ]]; then ok "every reference file is linked from SKILL.md"; else bad "orphaned reference files (never loaded):"; echo "$orphans" | sed 's/^/        /'; fi

echo
if [[ $fail -eq 0 ]]; then
  printf '\033[32mAll checks passed.\033[0m Safe to publish.\n'
else
  printf '\033[31mValidation failed.\033[0m Fix the issues above before publishing.\n'
fi
exit $fail