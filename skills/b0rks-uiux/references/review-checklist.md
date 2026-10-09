# UI/UX review checklist

Use only the sections relevant to the product and task. This is a review aid, not a requirement to produce findings in every category.

## 1. Primary task and information architecture
- Can a first-time user identify the screen's purpose within a few seconds?
- Is one primary action visually and semantically dominant where appropriate?
- Are navigation labels based on user concepts rather than implementation terminology?
- Are advanced/rare actions available without competing with the common path?
- Are related items grouped consistently by spacing, region, alignment, and styling?
- Does the hierarchy remain clear when content grows, localizes, or wraps?

## 2. Decisions and cognitive load
- Is the user asked to make more choices than necessary at once?
- Are defaults safe and meaningful?
- Can complex choices be filtered, compared, or progressively disclosed?
- Does the interface require remembering values or instructions from elsewhere?
- Are labels, values, requirements, and consequences visible at the point of decision?

## 3. Actions and controls
- Are target sizes and hit areas adequate for pointer and touch?
- Are frequent actions easy to reach?
- Are destructive actions separated and clearly distinguished?
- Do icons have obvious meaning or accessible labels/tooltips where needed?
- Do controls look interactive and expose disabled/selected/pressed/loading state?
- Are keyboard focus order and shortcuts coherent?

## 4. Feedback and system state
- Is there immediate acknowledgment after an action?
- Are loading, queued, background, partial, success, failure, empty, and offline states handled?
- Can users tell whether something is saved, synced, selected, running, or complete?
- Do long operations expose progress or meaningful status rather than appearing frozen?
- Are repeated submissions prevented or safely idempotent where needed?

## 5. Forms and input
- Are labels persistent and clear?
- Are format requirements visible before submission?
- Is reasonable input variation accepted and normalized safely?
- Are errors attached to the relevant field and written as recovery instructions?
- Is entered data preserved after recoverable errors?
- Are optional fields actually necessary?
- Are autocomplete, input modes, and platform-native controls used appropriately?

## 6. Visual hierarchy
- Does typography reveal structure without relying on reading order alone?
- Is whitespace used to communicate grouping rather than simply increase emptiness?
- Is contrast sufficient and intentional?
- Is accent color reserved for meaningful priority/state?
- Do active/selected items use one primary emphasis signal, rather than stacking a filled card with a saturated accent edge?
- Where an accent edge marks the current item, is state also conveyed without relying on colour alone?
- Are cards/borders/shadows doing structural work, or just adding visual noise?
- Does the layout remain balanced without flattening important hierarchy?

## 7. Consistency and familiarity
- Does the interface follow the host platform's conventions?
- Are repeated concepts named and represented consistently?
- Are similar actions placed and styled similarly?
- Does a redesign preserve useful learned behavior or clearly teach the change?
- Are custom controls justified over native/design-system primitives?

## 8. Accessibility
- Can all interactive controls be reached and used with keyboard alone?
- Is focus visible, and never entirely hidden behind sticky headers or overlays?
- Do dialogs return focus to their trigger on close, without creating traps?
- Does focus order follow document order rather than CSS visual reordering?
- Are accessible names, roles, states, headings, and landmarks appropriate?
- Are native elements used for native actions (`<button>` for actions, `<a>` for navigation)?
- Where ARIA is used, is the matching keyboard behaviour actually implemented?
- Is color never the only carrier of meaning?
- Does text/background contrast meet at least 4.5:1, and non-text UI contrast at least 3:1?
- Do pointer targets meet at least 24 × 24 CSS px, and primary touch controls reach roughly 44–48?
- Does content reflow to 320 CSS px without loss or two-dimensional scrolling?
- Does the interface survive 200%+ zoom/reflow and user text-spacing overrides?
- Are dynamic status messages programmatically determinable without moving focus?
- Is meaningful motion reducible and non-essential, honouring `prefers-reduced-motion`?

Thresholds and the caveats around them are in [standards-targets.md](standards-targets.md).

## 9. Responsive/mobile behavior
- Does priority change appropriately on small screens instead of merely stacking everything?
- Are touch targets, thumb reach, and gesture discoverability considered?
- Are sticky controls preventing content access?
- Are tables, dense filters, and multi-column layouts redesigned rather than squeezed?
- Does orientation/viewport change preserve state?

## 10. Onboarding and discoverability
- Can users begin without reading a manual?
- Is contextual guidance available exactly where uncertainty appears?
- Is progressive disclosure used for advanced functionality?
- Are empty states instructional and actionable?
- Does onboarding teach the core behavior rather than describe features abstractly?

## 11. Progress, completion, and resumption
- Is meaningful progress visible for multi-step tasks?
- Can users resume unfinished work?
- Are final confirmation and next steps clear?
- Are success screens dead ends, or do they help users continue appropriately?
- Are drafts/autosave states understandable?

## 12. Error prevention and recovery
- Can the interface prevent common errors before they happen?
- Are irreversible/destructive actions proportionately protected?
- Are undo/retry/recover options available when practical?
- Are errors specific, local, and actionable?
- Does the system fail safely under latency, duplicate input, refresh, disconnect, or stale state?

## 13. Performance as user experience
- Is load and interaction performance measured rather than assumed, where tooling allows?
- For web work, do LCP, INP, and CLS sit within the Core Web Vitals "good" thresholds?
- Are images and fonts sized and prioritised so they do not drive layout shift?
- Do route transitions and long tasks stay responsive?
- Has decorative animation or blur been costed, and does speed work preserve needed feedback?

## 14. Review of implementation quality
- Does the implementation reuse existing design tokens/components?
- Are one-off CSS values creating design drift?
- Are semantic HTML and native controls used where suitable?
- Are interactive states implemented, not just shown in static mockups?
- Do loading/error/empty states have actual code paths?
- Are responsive and accessibility behaviors covered by tests or manual verification?

## 15. Generic-default review
Applies when reviewing generated or visibly generic interfaces. See [ai-assisted-ui.md](ai-assisted-ui.md) for the full rubric.

- Were states designed beyond the happy path, or does the screen only render its default appearance?
- Do page types that should differ (browse, edit, analyse, settings) share one generic composition?
- Is content specific to this product, or would it fit almost any product unchanged?
- Are styles drawn from semantic tokens, or do library defaults and per-page values accumulate?
- Is responsive behaviour intentional, or does a desktop layout simply stack?
- Could another company's logo be substituted without changing layout or content?
- Is any decoration present without a product-specific reason?

Do not infer AI authorship from visual style. Review lack of intent, not membership in a list of common design choices.

## Final prioritization

Before reporting, ask:

1. Which issue most blocks the user's goal?
2. Which change removes the most friction for the common path?
3. Which issue creates the highest error/accessibility risk?
4. Which recommendations can share one underlying fix?
5. Which findings rest on a threshold or cited source rather than on taste?
6. Which observations are merely stylistic preference and should be omitted?

## 16. Agent delivery and state completeness
- Has the agent inspected real code, flows and design tokens before redesigning?
- Are primary task and permissions expressed as observable transitions?
- Are non-happy-path states real, wired and recoverable?
- Are the control type and keyboard/focus patterns semantically correct?
- Are responsive changes considered at component scope and tested with content expansion?
- Is the design unmistakably relevant to the product's domain without gratuitous novelty?
- Do claims distinguish automation, manual verification, measurements and untested paths?
- Are user-facing actions, especially dangerous tools, approvals and model/effort settings, truthful and inspectable?

See [agent-workflow.md](agent-workflow.md) and [evaluation-playbook.md](evaluation-playbook.md).
