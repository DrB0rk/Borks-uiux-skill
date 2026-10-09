# Content design, cognitive accessibility and ethical interaction

Use this reference for microcopy, forms, dense tools, onboarding, consent, billing and high-stakes settings. Product terminology and actual policies are the source of truth; never invent legal or financial guarantees.

## Clear and precise language

- Prefer direct labels that describe an action and its object ("Delete workspace" rather than "Continue"). Use domain terminology when users actually recognize it; explain novel terms.
- Put necessary instructions at the point of decision, not in generic onboarding.
- Write errors as: **what happened, what changed, what remains saved, what the user can do**. Do not blame the user or expose raw exception traces in routine UI.
- State units, time zone, rounding, currency, risk, data scope and permanence when they affect a decision.
- Avoid ambiguous relative time in audit trails and irreversible operations.
- Use accessible headings and scannable chunks without removing information needed for informed decisions.
- Preserve user-entered work; never use a hostile "Something went wrong" dead end.
- Design meaningful empty states: new user, zero matches, permission denied and connectivity failure require different guidance.

### Every element earns its place

Marketing-heavy, decorative or filler language is not a tone choice; it is a defect. Every word, label, and UI element must have a purpose that follows from the user's actual need, the state the screen is showing, or the downstream action it enables.

Concrete rules:

- **Cut adjectives and superlatives unless they communicate something specific.** "Streamline your workflow", "unlock insights", "powerful", "intuitive" — none of these tell a user what happens when they click.
- **Replace abstract qualifiers with the concrete thing.** Instead of "experience seamless productivity", say what the button does: "Create project". Instead of "powerful analytics", name the chart and the unit: "Daily active users".
- **Cut elements without a reason.** A decorative hero gradient with no information; a four-tile "feature" grid that duplicates the primary nav; a third CTA. If it does not serve a user task, a state, or a downstream action, remove it.
- **Aesthetic does not excuse density, but density does not justify clutter either.** Both are easier than restraint.
- **Never invent trust signals, customer counts, awards, testimonials, ratings, scarcity, urgency or social proof** to make a generated UI look finished. Fabricated trust signals are a more serious defect than bland copy.

This is a default for copy and layout *together*. A perfectly written label on a redundant element is still redundant; a stripped layout with a single clear label is better than a polished one carrying three.

## Cognitive and neurodiversity-informed usability

Consult [W3C Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/) (W3C Working Group Note, 29 April 2021). It is practical supporting guidance, **not** a normative WCAG success criterion checklist.

- Keep instructions and terminology consistent across steps.
- Avoid relying on memory of details shown elsewhere; keep needed context visible or retrievable.
- Provide sufficient time, visible progress, predictable controls and understandable error recovery.
- Limit unsolicited animation, interruptions, competing notifications and attention traps.
- Allow optional simplification and user control for advanced features without hiding mandatory information.
- Do not infer that a particular layout universally works for any diagnosis or user group. Validate with affected users.

## Honest choice architecture

- Do not preselect optional paid add-ons or consent where meaningful consent is required.
- Make declining, editing and canceling discoverable; do not create asymmetrical friction merely to boost conversion.
- Show total cost, recurring commitments, trial end, important consequences and irreversible operations before commitment.
- Distinguish upsell, advertising, preference changes and essential system notifications.
- Never fabricate urgency, testimonials, rankings, scarcity, user counts or social proof.
- Do not hide data export or account deletion behind unrelated menus.
- Behavioral laws are design heuristics for comprehension and task completion, **not** licenses for deceptive patterns.

## Permission, privacy and security interaction

- Explain the permission requested, why it is needed, its scope and duration; support least privilege and an understandable denial path.
- For secrets and credentials, avoid putting sensitive contents in previews, logs or notifications. Mask where appropriate while still supporting copying/reveal securely.
- Warn before data exfiltration or wide-reaching tool actions and allow scope inspection.
- Explain destructive action scope using actual entities, and offer undo or recovery where technically possible.
- Never assert that an operation completed before a confirmed backend result.

## Complex software and expert interfaces

- Experts often prefer higher information density and keyboard shortcuts. Avoid conflating sparse visual design with lower cognitive effort.
- Provide stable spatial positions and inspectable state for frequent workflows.
- Keep high-consequence parameters visible at decision time; progressive disclosure should hide optional complexity, not critical conditions.
- For coding agents, show which model/host/repository/context is active, what work is pending, and which action requires approval.
- Do not silently change model, permission mode, destructive scope or deployment target mid-flow.
