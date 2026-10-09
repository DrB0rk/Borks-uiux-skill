# Agent UI/UX delivery workflow

Use this playbook for implementation, redesign and code-level audit. It makes a coding agent accountable for **observable behaviour**, rather than a plausible screenshot. Use lighter passes for small fixes; do not manufacture process for trivial changes.

## 0. Select an execution mode

- **Audit only:** inspect evidence, reproduce issues where possible, rank recommendations, make no code changes.
- **Targeted repair:** preserve current product language and layout; fix a demonstrated defect with the smallest safe patch.
- **New screen or feature:** establish an intent contract, interaction/state contract and design envelope before writing components.
- **Broader redesign:** map existing flows, identify what must remain familiar, and compare task outcomes before committing visual changes.

Treat explicit user constraints, functional requirements and security as hard constraints. Accessibility is an implementation gate, not a style preference. Do not silently broaden scope.

## 1. Inspect the actual product

1. Identify routes, component boundaries, styles, token definitions, existing design systems, icons, dependencies and supported platforms.
2. Determine the primary user/job, navigation model, data model, actual terminology, permissions and destructive actions from code or supplied documents.
3. Examine related screens before creating a new visual archetype. Record existing components and any inconsistencies.
4. If a runnable environment and browser tools exist, inspect the rendered product at an appropriate desktop width and at least one mobile width. Navigate the real task, not just the homepage.
5. Identify real and synthetic data. Mark mock content unambiguously; never invent production metrics, endorsements or user activity.
6. Capture observed defects separately from inferred risks. A screenshot cannot prove keyboard operation, semantics, backend behaviour or performance.
7. If browser, simulator or application execution is unavailable, explicitly label verification as **not run**. Never imply screenshots or interaction tests took place.

## 2. Write a one-screen intent contract

Record briefly, using facts if available and assumptions otherwise:

| Field | Minimum answer |
|---|---|
| User and job | Who is doing what, why, and under what constraints? |
| Primary route | Entry point, key decisions, completion state, next step |
| Information priority | What must be visible at decision time? |
| Primary and secondary actions | Label, consequence, and reversibility |
| Source of truth | Server/local/draft ownership; when changes commit |
| Design envelope | Existing tokens, patterns, permitted components, density |
| Supported context | Small/large viewport, touch, pointer, keyboard, zoom |
| Key states | Initial, pending, populated, empty, validation, failure, offline, no permission |
| Risks | Irreversible actions, accessibility, sensitive data, latency |
| Acceptance | User-observable behaviour and objective checks |

If a detail is unspecified, derive a conservative default and label it as an assumption. Ask for input only when a missing decision prevents a safe implementation.

## 3. Define the interaction and state model

- Model the flow before the surface. Draw a minimal decision tree or describe triggers -> transitions -> visible state -> recovery.
- Make controls truthful: if an action commits server state, distinguish **Saving** from **Saved**; a toast is not proof of persistence.
- Preserve edits when requests fail. Resolve races, duplicate submits and stale updates with clear ownership or versioning.
- Specify focus placement for opening, dismissing and submitting dialogs, menus and forms; specify announcements for background status.
- Specify error handling at the right scope: inline field error, component failure, page failure or global outage.
- Support an alternative to gesture-only or drag-only workflows.
- Do not add confirmations to reversible low-risk actions when Undo is a better fit. Protect consequential irreversible actions.

Read [interaction-patterns.md](interaction-patterns.md) when choosing composite controls.

## 4. Establish the design envelope

Use [design-systems.md](design-systems.md) to identify:
- **Layout grammar:** content widths, grid/containers, spacing density, alignment and visual hierarchy.
- **Tokens:** color roles, contrast, typography, spacing, radii, elevation and responsive behavior.
- **Component contract:** visual variants and all semantic states, not only a default CSS class.
- **Content contract:** real nouns, label verbs, units, formatting, localization, no fake figures.
- **Exceptions:** explicit rationale for any new component, animation, decorative block or nonstandard pattern.

A new screen should look like an extension of the product, not a fresh starter template. A genuine new design system should be intentional and coherent, not mechanically identical to every other product.

## 5. Implement the smallest complete vertical slice

1. Prefer existing tested primitives and platform APIs; avoid new dependencies if existing components solve the problem.
2. Implement semantic markup, accessible names/states, keyboard behavior and focus management concurrently with visual styling.
3. Implement all relevant states and real data wiring. Do not ship static-only interactivity or speculative API contracts.
4. Make layout resilient to 320 CSS px reflow where required, long strings, zoom, user text settings and the mobile keyboard.
5. Honor reduced motion, forced colors and user theme. Preserve adequate contrast across states.
6. Cover transitions, cancellation and retry; clean up listeners, observers and async effects; prevent stale responses from overwriting newer state.
7. Keep meaningful changes in the smallest coherent diff; avoid unrelated restyling.

## 6. Verify and iterate

Use [evaluation-playbook.md](evaluation-playbook.md). Test the actual top task, keyboard path, error/recovery, responsive breakpoints, text expansion, and assistive-technology smoke tests when tools are available.

**Two-pass quality gate:**
- **Functional pass:** task completes, states reflect reality, forms preserve data, keyboard and accessibility gates, no obvious regression.
- **Craft pass:** hierarchy, density, specific content, consistent tokens, platform fidelity, no unearned decoration or template sameness.

Never trade functional correctness or accessibility for a visual polish pass. Stop after substantive convergence; avoid endless cosmetic iteration without a user-impact hypothesis.

## 7. Report evidence, not theatre

For audit output, use the main `SKILL.md` finding format. For a code change, report:

1. Changed paths and user-visible behaviour.
2. Decision rationale and meaningful alternatives rejected.
3. Tests/viewport/state combinations **actually run**, with pass/fail.
4. Remaining unverified paths, explicit risks or blockers.
5. Follow-up work strictly outside this change's scope.

Distinguish **implemented**, **tested**, **visually inspected**, **measured**, and **assumed**. These are not interchangeable.

## Small, concrete acceptance contract example

> When an editor saves a record, the Save action becomes unavailable while its request is pending; success appears only after confirmed persistence. On failure the editor retains entered values, receives an actionable error and can retry. Keyboard-only users can complete the flow and focus remains predictable. At 320 CSS px equivalent, controls reflow without obscuring the Save action. Automated checks and manual verification are separately reported.

Avoid acceptance criteria such as "modern", "professional", "sleek", "engaging" or "intuitive" unless accompanied by observable operational meaning.
