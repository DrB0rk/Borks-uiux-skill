---
name: b0rks-uiux
description: Research, design, implement, audit, and validate UI/UX in web, mobile, and developer tools. Use for frontend coding, interface design, redesigns, responsive layouts, design systems and tokens, component interactions, agent/chat interfaces, forms, accessibility, content design, keyboard usability, interaction state modeling, performance, and AI-generated UI quality review. Produce evidence-backed fixes, complete states, and practical verification rather than generic visual polish.
metadata:
  version: 1.0.0
---

# B0rk's UI/UX SKILL

Use this skill to turn interface work into explicit, testable design decisions instead of taste-driven styling. Apply the smallest relevant subset of principles; do not force every law into every screen.

## Operating model

0. If the `b0x_*` MCP tools are available, call `b0x_context` (optionally passing `role: "ui-engineer"`, `"ui-auditor"`, `"content-designer"`, `"motion-specialist"`, or `"accessibility-specialist"`) before proposing anything. The b0x repository provides global engineering roles and universal baseline constraints that govern all work, layered with any project-specific overrides. Follow [project-memory.md](references/project-memory.md).
1. Identify the user's primary goal, context of use, device, and target group (B2B power user, B2C consumer, aging adult, novice). Consult [user-cognition-interaction.md](references/user-cognition-interaction.md) for audience-calibrated density, scanning mechanics, and CVD ergonomics.
2. Inspect the actual interface, flow, component tree, screenshots, code, or requirements before recommending changes.
3. Find the highest-friction moments first: uncertainty, too many choices, poor target sizing, weak hierarchy, hidden state, long waits, unclear grouping, or broken conventions.
4. Map each material problem to one or more relevant principles from [principles.md](references/principles.md).
5. Propose the smallest design change that removes friction without adding decorative complexity.
6. Check the proposal against accessibility, consistency, responsive behavior, error recovery, and implementation cost. When the `b0x_*` MCP tools are available, run automated diagnostics:
   - Call `b0x_check_contrast` to verify color pairs against WCAG 2.2 AA (4.5:1 text, 3:1 components) and receive automatic passing color adjustments.
   - Call `b0x_check_target` to verify touch and pointer target sizes against WCAG 2.5.8 (24×24 px minimum) and platform touch comfort (44×44 / 48×48 px).
   - Call `b0x_check_html` on markup snippets or component files to catch unlabeled inputs, unnamed icon buttons, clickable non-semantic elements, and layout-thrashing animations before presentation.
   - Call `b0x_check_tokens` on design token dictionaries to validate DTCG 2025.10 compliance and prevent raw values leaking into component layers.
   - In shell/CI contexts, run `./scripts/audit-ui.js` (`--contrast`, `--target`, `--html`, `--file`, `--tokens`).
7. Validate the final result against the task-specific checklist in [review-checklist.md](references/review-checklist.md).
8. **Automated learning and reflection loop:** Before completing the turn, check whether the user provided feedback, rejected a pattern, or expressed a design preference during this session.
   - Call `b0x_learn({ feedback })` to automatically distill the feedback into a reusable directive, auto-supersede conflicting earlier rules, or increment the reinforcement counter on confirmed patterns.
   - If a diagnostic audit issue was resolved (`b0x_check_*`), call `b0x_learn_from_audit` to permanently record the verified fix so the defect is never repeated.
   - Never finish a turn leaving explicit user corrections unlearned.

For design or implementation tasks, follow [agent-workflow.md](references/agent-workflow.md), using its intent contract, state model, design envelope and explicit verification reporting. For real controls consult [interaction-patterns.md](references/interaction-patterns.md). For visual-system, icons or responsive changes consult [design-systems.md](references/design-systems.md) — it also carries the rule to use a maintained icon set such as Lucide rather than hand-drawn SVG. For animation, shadows, glow, morphing or motion accessibility consult [motion-effects.md](references/motion-effects.md). For content, consent, permission or cognitive clarity consult [content-trust-ethics.md](references/content-trust-ethics.md). For QA and testing consult [evaluation-playbook.md](references/evaluation-playbook.md). For color perception science, CVD dual-encoding, eye-tracking scanning patterns (F/Z/Gutenberg) and target group models consult [user-cognition-interaction.md](references/user-cognition-interaction.md). For global roles and project-specific memory consult [project-memory.md](references/project-memory.md). These are selectively loaded task guides, not mandatory reading for every trivial request.

When a finding needs a threshold rather than an opinion, take the number from [standards-targets.md](references/standards-targets.md) instead of asserting what feels adequate. When reviewing agent-generated or visibly generic output, read [ai-assisted-ui.md](references/ai-assisted-ui.md).

## Automated learning engine

When the user rejects a design choice, corrects an element, or confirms a preference, that signal must be learned automatically:
- **Call `b0x_learn({ feedback })`:** The tool automatically parses conversational input (e.g. *"I don't like the button padding, make it 8px"*), strips conversational noise, classifies the kind (`rejection`, `preference`, `praise`), extracts domain tags, and handles conflicts.
- **Automatic conflict supersession:** If the new directive contradicts an earlier rule (e.g. changing cell padding from 16px to 8px), `b0x_learn` automatically supersedes the outdated rule, preventing conflicting instructions.
- **Reinforcement tracking:** Repeatedly expressed preferences increment a reinforcement counter (`reinforced ×N`), signaling strong project consensus.
- **Diagnostic learning:** When an audit tool (`b0x_check_*`) detects an issue and an approved fix is applied, call `b0x_learn_from_audit` to permanently record the remedy so the defect is never repeated.

Without the MCP tools, apply the correction immediately in code and carry it through the conversation. Never claim memory was stored if it was not.

## Design priorities

Optimize in this order unless the task explicitly requires otherwise:

1. **Task completion:** Can the user understand what to do and finish the core task?
2. **Clarity:** Are hierarchy, grouping, states, labels, and choices obvious?
3. **Efficiency:** Is the common path short, responsive, and low-effort?
4. **Error resistance:** Are destructive actions, invalid input, and ambiguous states handled safely?
5. **Accessibility (non-negotiable gate):** Does the design remain usable with keyboard, assistive technology, low vision, motion sensitivity, zoom, and small screens? Never trade this away to optimize an earlier priority.
6. **Consistency and familiarity:** Does it follow established platform and product conventions unless deviation has a measurable benefit?
7. **Aesthetics:** Does visual polish reinforce hierarchy and trust rather than obscure function?

Do not use aesthetics to excuse poor usability. Do not use minimalism to hide required information or controls.

## Native UI/UX reasoning rules

- Prefer familiar interaction patterns for ordinary tasks. Novelty must earn its learning cost.
- Reduce visible choice when the user must decide quickly; use grouping, defaults, filtering, and progressive disclosure rather than deleting necessary options.
- Put frequent and important actions closer, larger, and easier to acquire.
- Keep response feedback immediate. For work that cannot finish quickly, acknowledge the action instantly and expose progress/state.
- Move unavoidable complexity into the system where practical, but do not abstract away information users need to make informed decisions.
- Keep related items spatially and visually related. Do not make spacing, borders, cards, color, and typography communicate conflicting groupings.
- Use contrast and isolation sparingly for priority. If everything is emphasized, nothing is.
- Make the beginning and ending of important flows especially clear. Preserve progress and unfinished work where appropriate.
- Design for actual behavior: users scan, skip instructions, reuse habits, make mistakes, interrupt tasks, and operate under time pressure.
- Treat loading, empty, error, disabled, partial, offline, success, and permission-denied states as first-class interface states.
- Treat mobile and desktop as different interaction constraints, not merely different widths.

## UI implementation guidance

When changing code, preserve the product's existing design system before inventing new primitives. Reuse existing tokens, components, spacing scales, typography, colors, radii, and interaction patterns when they are sound.

For a new component or screen, explicitly decide:

- primary action;
- secondary actions;
- information hierarchy;
- grouping model;
- interaction states;
- responsive behavior;
- focus/keyboard behavior;
- validation/error behavior;
- loading/empty states;
- accessible name/role/state where relevant.

Avoid adding visual containers by default. Use cards, borders, dividers, backgrounds, shadows, and spacing only when they clarify structure.

## Review severity

Classify findings by user impact, not visual preference:

- **Critical:** blocks task completion, creates serious accessibility barriers, causes destructive mistakes, or hides essential state.
- **High:** materially increases error rate, abandonment, confusion, or time-to-completion on an important flow.
- **Medium:** meaningful friction, weak hierarchy, inconsistent behavior, or avoidable cognitive load.
- **Low:** polish, local inconsistency, or minor visual/interaction refinement with limited task impact.

Do not report subjective style preferences as defects. Tie every finding to an observable user consequence.

## Evidence and thresholds

Prefer findings a reader can verify over findings that merely sound informed.

- When a finding concerns size, contrast, reflow, timing, or target dimensions, cite the specific threshold and where it comes from rather than saying "too small" or "too slow".
- Distinguish a normative requirement (a WCAG success criterion, a documented platform convention) from an internal engineering target and from a heuristic. They carry different weight, and conflating them misleads readers about how binding something is.
- Do not restate quantitative research findings as established fact unless the underlying source supports the specific number. When evidence is a short abstract, a practitioner reflection, or observational commentary, say so and state the conclusion at the strength the evidence actually carries.
- Accessibility thresholds are engineering guidance, not legal advice. Flag that distinction when a compliance question is in play.

## Output format for audits

For each material finding provide:

- **Location / flow**
- **Severity**
- **Observed problem**
- **User consequence**
- **Relevant principle(s)**
- **Threshold or evidence** (where a measurable basis applies)
- **Recommended change**
- **How to validate**

Prioritize a short list of high-impact fixes over a large inventory of weak observations.

## Source and evidence discipline

This skill is an original synthesis informed by Laws of UX and Laws of UI, established usability research, and normative accessibility and performance standards. The source sites are reference material, not text to reproduce. Do not copy their article prose, examples, illustrations, or branded descriptions into deliverables.

Treat sources in three tiers rather than as one undifferentiated body of evidence:

- **Normative and official** — WCAG, WAI-ARIA, ISO, platform design guidance, government design systems, Core Web Vitals. These justify hard requirements and specific thresholds.
- **Peer-reviewed empirical** — published conference and journal studies with stated methods. These support claims about how generated or designed interfaces actually behave.
- **Established and observational** — long-running usability research organizations, plus practitioner commentary on emerging conventions. Useful for framing and corroboration; never sufficient alone to justify a hard requirement.

When a heuristic is contradicted by product analytics, usability testing, accessibility requirements, platform conventions, or direct user research, prefer the stronger task-specific evidence.

Read [sources.md](references/sources.md) for the full provenance, source verification status, and licensing rationale. Read [standards-targets.md](references/standards-targets.md) for verified thresholds. Read [principles.md](references/principles.md) for the principle catalog. Read [ai-assisted-ui.md](references/ai-assisted-ui.md) when reviewing agent-generated or homogenised interfaces. Read [review-checklist.md](references/review-checklist.md) when performing an audit or final implementation review.

## Evidence-backed autonomous work

- Before modifying a repository, inspect existing screens, tokens, components and domain vocabulary. Never replace the design system with a generic template without a task-specific reason.
- For new screens or significant redesigns, document user task, primary action, state transitions, responsive behavior, keyboard semantics, data truth and acceptance tests before writing code. For a small repair, use the narrowest relevant subset.
- Treat **implemented**, **builds**, **test passes**, **visually inspected**, **assistive-tech checked**, **field measured** and **user validated** as distinct claims. Run real checks where possible; label unavailable checks explicitly. A static mockup cannot verify interaction.
- Maintain a two-pass quality gate: correctness/behavior/accessibility first; density/hierarchy/token coherence/domain character second. Avoid endless decorative iteration.
- For coding-agent interfaces, model model/effort/permission selection, tool approvals, execution states, session/host identity, background jobs and composer draft retention. Never imply completion merely because text streams.
- An internal rubric or heuristic is not a published standard. Never derive legal-compliance conclusions solely from this skill.

## Expanded reference map

| Work | Load only when relevant |
|---|---|
| Repository implementation or autonomous audit | [agent-workflow.md](references/agent-workflow.md) |
| Dialogs, menus, tabs, chat composers, forms, async controls | [interaction-patterns.md](references/interaction-patterns.md) |
| Tokens, typography, themes, grids, responsive layouts, localization | [design-systems.md](references/design-systems.md) |
| QA, accessibility tooling, viewport/state checks, real user tasks | [evaluation-playbook.md](references/evaluation-playbook.md) |
| UX writing, trust, consent, neuroinclusive design and permissions | [content-trust-ethics.md](references/content-trust-ethics.md) |
| Primary references and specific evidence status | [research-addendum-2026.md](references/research-addendum-2026.md) and [sources.md](references/sources.md) |

WCAG 2.2 Focus Appearance (2.4.13) is **Level AAA**; do not include it as an AA conformance criterion. Aim for a strong visible focus treatment without misstating its normative level.
