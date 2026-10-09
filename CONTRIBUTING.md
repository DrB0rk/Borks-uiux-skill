# Contributing

Thanks for improving `b0rks-uiux`. This repository is the canonical standalone source for B0rk's UI/UX SKILL. OMP-based hosts may embed their own copies; keep those aligned explicitly when updating.

## The bar for a good addition

Most rejected contributions try to add **more advice**. The harder contribution is making existing advice **more actionable**.

A principle earns its place here only if it changes a decision someone can observe:

- ✅ *"Destructive actions must be visually separated from Save, not merely colored differently."*
- ❌ *"Make destructive actions feel more intentional."*

If you cannot state the observable user consequence of your guidance, it is a preference, and preferences do not belong in this skill.

## Where to put things

| Change | File |
|---|---|
| New or revised design guidance | `skills/b0rks-uiux/references/principles.md` |
| New audit criteria | `skills/b0rks-uiux/references/review-checklist.md` |
| Numeric thresholds (WCAG, performance, targets) | `skills/b0rks-uiux/references/standards-targets.md` |
| Agent-generated / homogenised UI review | `skills/b0rks-uiux/references/ai-assisted-ui.md` |
| Implementation workflow, state models, envelopes | `skills/b0rks-uiux/references/agent-workflow.md` |
| Concrete control behaviour and keyboard patterns | `skills/b0rks-uiux/references/interaction-patterns.md` |
| Tokens, visual system, responsive rules | `skills/b0rks-uiux/references/design-systems.md` |
| Content, consent, permission, cognitive clarity | `skills/b0rks-uiux/references/content-trust-ethics.md` |
| QA strategy and verification sequencing | `skills/b0rks-uiux/references/evaluation-playbook.md` |
| Standards provenance and 2026 source map | `skills/b0rks-uiux/references/research-addendum-2026.md` |
| Provenance / attribution / verification status | `skills/b0rks-uiux/references/sources.md` |
| Per-project rejections and preferences | `.b0x/` via the `b0x_*` MCP tools |
| Priority order, severity rubric, output format | `skills/b0rks-uiux/SKILL.md` |
| Triggering behavior | `SKILL.md` frontmatter `description` |

**Keep `SKILL.md` lean.** It loads in full whenever the skill triggers. Move anything that is only needed for a specific subtask into a reference file and link to it — that is the progressive disclosure the repo relies on to stay cheap in context. Every reference file must be reachable from `SKILL.md`; the validator fails on orphans.

## Per-project memory

Design feedback belongs in the project, not in the global skill. If a user rejects a pattern, that is a property of one codebase and should never become a global default — the same person may want it in the next project.

The `b0x` MCP server stores those in `.b0x/` at the project root:

```bash
./scripts/install-mcp.sh      # register with OMP
node mcp/test/e2e.mjs /tmp/x  # exercise the server over the real MCP protocol
```

Rules that keep this honest:

- **Record only what the user said.** Never store an inferred preference. If durability is unclear, ask.
- **Write directives, not anecdotes.** `"No saturated accent bar on active nav rows"` is reusable; `"the user didn't like the last mockup"` is not.
- **Supersede, don't contradict.** Use `b0x_forget` before recording a replacement, so the snapshot the agent reads never contains two rules that disagree.
- **Keep `.b0x/` git-ignored by default.** Committing it shares constraints with the team, which is legitimate and sometimes desirable — but it is plain-text instructions an agent will read back. Review before committing.

Changes to `mcp/src/` must keep both properties the tests rely on: `entries.json` is written atomically, and no user-supplied value ever reaches a filesystem path.

## Rules

1. **No reproduction of source material.** Laws of UX is CC BY-NC-ND; Laws of UI is all-rights-reserved. Write independently worded guidance. Never copy prose, examples, diagrams, or branded assets.
2. **Every principle needs a "do not" case.** Include where the heuristic misfires — accessibility requirements, security boundaries, and product analytics beat a heuristic every time.
3. **State real tradeoffs.** If two principles conflict, say which one wins and why.
4. **Keep the severity rubric objective.** Severity is user impact, never visual preference.

## Changing the description

The frontmatter `description` is the primary triggering mechanism. It should be specific and slightly assertive, since under-triggering is the common failure mode. Include both what the skill does and the contexts where you want it used.

## Pull requests

1. Branch from `main`.
2. Keep the change scoped — one topic per PR.
3. Explain **what user-facing problem** the change fixes.
4. Update the README if you changed structure, install steps, or the principles catalog.

## Local check

Run the validator before opening a pull request. It catches the failure modes that have actually broken this repo:

```bash
./scripts/validate.sh
```

It verifies that frontmatter parses and the skill name matches its directory, that `metadata.version` is present (without it `omp skill publish` silently refuses to package), that every relative markdown link resolves, that `package.json` and `SKILL.md` agree on name and version, that no markdown heading is malformed (`#Heading` renders as literal text), and that no reference file has been orphaned away from `SKILL.md`.

Then confirm the packaging paths still work:

```bash
omp skill publish ./skills/b0rks-uiux --dry-run   # Skillshare registry
npm pack --dry-run                                # npm tarball
omp plugin install . && omp plugin doctor          # OMP plugin
```

Rendering the banner:

```bash
rsvg-convert -w 1200 assets/banner.svg -o /tmp/banner.png
```

## Publishing

Two registries, each with its own credential:

- **Skillshare** (`skills.omp.sh`) — needs a Stencil account: run `omp` and use `/login → Stencil`, or set `STENCIL_API_KEY`. Publish with `omp skill publish ./skills/b0rks-uiux`.
- **npm** — needs `npm login`. Publish with `npm publish --access public`.

Bump `metadata.version` in `SKILL.md` **and** `version` in `package.json` together; the validator fails if they drift. `omp skill version <patch|minor|major|x.y.z>` updates the frontmatter for you.

> **Renaming the skill breaks installed plugin links.** If the directory, frontmatter `name`, or `package.json` name changes, existing local plugin links keep pointing at the old identity and `omp plugin uninstall` may report "not installed" because the lockfile key no longer matches. Remove the orphaned entry from `~/.omp/plugins/omp-plugins.lock.json` and the stale symlink in `~/.omp/plugins/node_modules/`, then reinstall.

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).