---
name: bizar-uiux
description: Design, review, and improve user interfaces and user experiences using a practical synthesis of established UX psychology and UI composition principles. Use for UI/UX audits, redesigns, component design, interaction flows, onboarding, navigation, forms, dashboards, responsive layouts, accessibility-oriented interface review, visual hierarchy, information architecture, conversion/decision flows, and frontend implementation where user experience quality matters.
---

# Bizar UI/UX

Use this skill to turn interface work into explicit, testable design decisions instead of taste-driven styling. Apply the smallest relevant subset of principles; do not force every law into every screen.

## Operating model

1. Identify the user's primary goal, context, device, and likely level of familiarity.
2. Inspect the actual interface, flow, component tree, screenshots, code, or requirements before recommending changes.
3. Find the highest-friction moments first: uncertainty, too many choices, poor target sizing, weak hierarchy, hidden state, long waits, unclear grouping, or broken conventions.
4. Map each material problem to one or more relevant principles from [principles.md](references/principles.md).
5. Propose the smallest design change that removes friction without adding decorative complexity.
6. Check the proposal against accessibility, consistency, responsive behavior, error recovery, and implementation cost.
7. Validate the final result against the task-specific checklist in [review-checklist.md](references/review-checklist.md).

## Design priorities

Optimize in this order unless the task explicitly requires otherwise:

1. **Task completion:** Can the user understand what to do and finish the core task?
2. **Clarity:** Are hierarchy, grouping, states, labels, and choices obvious?
3. **Efficiency:** Is the common path short, responsive, and low-effort?
4. **Error resistance:** Are destructive actions, invalid input, and ambiguous states handled safely?
5. **Accessibility:** Does the design remain usable with keyboard, assistive technology, low vision, motion sensitivity, zoom, and small screens?
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

## Output format for audits

For each material finding provide:

- **Location / flow**
- **Severity**
- **Observed problem**
- **User consequence**
- **Relevant principle(s)**
- **Recommended change**
- **How to validate**

Prioritize a short list of high-impact fixes over a large inventory of weak observations.

## Source and evidence discipline

This skill is an original synthesis informed by Laws of UX and Laws of UI plus standard interaction-design practice. The source sites are reference material, not text to reproduce. Do not copy their article prose, examples, illustrations, or branded descriptions into deliverables.

Read [sources.md](references/sources.md) when provenance, attribution, or source scope matters. Read [principles.md](references/principles.md) for the full principle catalog. Read [review-checklist.md](references/review-checklist.md) when performing an audit or final implementation review.
