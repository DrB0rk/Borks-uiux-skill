# Contributing

Thanks for improving `bizar-uiux`. This repo is the **canonical standalone source** for the skill that also ships inside [`@polderlabs/bizar-omp`](https://www.npmjs.com/package/@polderlabs/bizar-omp), so changes here should stay semantically aligned with that packaged copy.

## The bar for a good addition

Most rejected contributions try to add **more advice**. The harder contribution is making existing advice **more actionable**.

A principle earns its place here only if it changes a decision someone can observe:

- ✅ *"Destructive actions must be visually separated from Save, not merely colored differently."*
- ❌ *"Make destructive actions feel more intentional."*

If you cannot state the observable user consequence of your guidance, it is a preference, and preferences do not belong in this skill.

## Where to put things

| Change | File |
|---|---|
| New or revised design guidance | `skills/bizar-uiux/references/principles.md` |
| New audit criteria | `skills/bizar-uiux/references/review-checklist.md` |
| Priority order, severity rubric, output format | `skills/bizar-uiux/SKILL.md` |
| Provenance / attribution | `skills/bizar-uiux/references/sources.md` |
| Triggering behavior | `SKILL.md` frontmatter `description` |

**Keep `SKILL.md` lean.** It loads in full whenever the skill triggers. Move anything that is only needed for a specific subtask into a reference file and link to it — that is the progressive disclosure the repo relies on to stay cheap in context.

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

Confirm the structure and that the frontmatter parses:

```bash
ls -R skills/bizar-uiux
python3 -c "import yaml;print(yaml.safe_load(open('skills/bizar-uiux/SKILL.md'))['name'])"
```

Rendering the banner:

```bash
rsvg-convert -w 1200 assets/banner.svg -o /tmp/banner.png
```

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).