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
- Is focus visible?
- Are accessible names, roles, states, headings, and landmarks appropriate?
- Is color never the only carrier of meaning?
- Is text/background and UI-component contrast adequate?
- Does the interface survive 200%+ zoom/reflow where applicable?
- Is meaningful motion reducible and non-essential?
- Are touch targets and spacing usable for motor impairments?
- Do validation and notifications work with assistive technology?

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

## 13. Review of implementation quality
- Does the implementation reuse existing design tokens/components?
- Are one-off CSS values creating design drift?
- Are semantic HTML and native controls used where suitable?
- Are interactive states implemented, not just shown in static mockups?
- Do loading/error/empty states have actual code paths?
- Are responsive and accessibility behaviors covered by tests or manual verification?

## Final prioritization

Before reporting, ask:

1. Which issue most blocks the user's goal?
2. Which change removes the most friction for the most common path?
3. Which issue creates the highest error/accessibility risk?
4. Which recommendations can share one underlying fix?
5. Which observations are merely stylistic preference and should be omitted?
