# OMP native integration audit (2026-10-11)

Target upstream: [can1357/oh-my-pi v18.9.1](https://github.com/can1357/oh-my-pi/releases/tag/v18.9.1), published 2026-10-11. An installed host binary/profile has **not** been inspected. Treat OMP runtime compatibility as UNKNOWN until tested in that environment.

## Findings and corrections

1. This repo is an **OMP skill package**, not a native extension. `omp.skills` advertises one discoverable skill; no `omp.extensions` entry exists. Do not represent it as an extension or promise extension lifecycle hooks.
2. The separate `b0x` MCP process requires explicit installation and Node dependencies. It is not bundled into the agent loop. Confirm MCP registration with `omp mcp list` on the actual release before relying on `b0x_context`.
3. The previous MCP installer hardcodes user and project locations and its project path assumes `.claude/mcp.json`. Paths can differ by OMP release/profile. The installer now prefers explicitly supplied target paths and preserves existing configuration, with a backup and atomic replacement. Manual verification of OMP's actual MCP config discovery remains required.
4. Package metadata now clearly distinguishes skills and MCP. No unverified native extension API is introduced.
5. A static Cloudflare Pages build copies only the browser workbench and its compiled components. Private design memory and MCP server are excluded from hosting.

## Real-host acceptance checklist

- Fingerprint `omp --version`, current profile, platform and installed package revision.
- Verify skill discovery and `/skill:b0rks-uiux` with actual OMP host.
- Verify MCP config location in that release, run installer into a disposable config first, then `omp mcp list`.
- Exercise `b0x_context`, `b0x_check_contrast`, `b0x_check_html` with representative inputs in an actual session.
- Test restart, plugin update, re-install, uninstall and project switching with no unrelated MCP entry loss.

Static inspection of package and scripts is SOURCE-OBSERVED; browser CI from prior merged PR is TESTED separately, not proof of native OMP integration.
