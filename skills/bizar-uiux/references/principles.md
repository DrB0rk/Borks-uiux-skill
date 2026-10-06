# Bizar UI/UX principle catalog

This reference translates common UX psychology and UI composition laws into operational design guidance. Use principles as hypotheses about user behavior, not as automatic rules. Context, accessibility, product conventions, and observed user evidence take precedence.

## Decision-making and cognitive effort

### Hick's Law
Decision time tends to grow as the number and complexity of choices increases.

Use it to:
- reduce simultaneous choices on time-sensitive paths;
- separate advanced options from common actions;
- provide sensible defaults and recommendations;
- split genuinely complex tasks into meaningful stages.

Do not use it to remove necessary comparison information or force users through excessive wizard steps.

### Choice overload
Too many alternatives can reduce decision confidence and increase abandonment.

Prefer filtering, ranking, comparison, presets, and progressive disclosure over dumping all options into one undifferentiated list.

### Cognitive load
Every control, instruction, unfamiliar pattern, remembered value, and context switch consumes mental effort.

Reduce load by making state visible, reusing conventions, grouping information, removing redundant decisions, and keeping required information near the action that needs it.

### Working memory
Users should not have to remember information from one view to operate another.

Keep important values, prior selections, requirements, and task context visible or retrievable. Prefer recognition over recall.

### Miller-style chunking
Human short-term memory benefits from meaningful grouping; exact numeric limits are not a design target.

Break dense information into semantically coherent groups. Do not create arbitrary seven-item rules.

### Chunking
Group related information into understandable units to improve scanning and comprehension.

Use headings, spacing, progressive disclosure, grouped controls, and summaries that reflect task structure.

### Tesler's Law / conservation of complexity
Some complexity is inherent and must live somewhere.

Move repetitive, technical, or machine-manageable complexity into the system. Keep decision-relevant complexity visible to the user.

### Occam-style simplicity
When two designs solve the same problem equally well, prefer the one with fewer assumptions and unnecessary mechanisms.

Do not confuse simplicity with fewer pixels. A slightly richer interface may be simpler to understand.

### Complexity bias
People can overvalue complicated explanations or systems.

Do not add configuration, abstraction, dashboards, or workflow steps merely to make a product appear powerful.

## Familiarity, models, and consistency

### Jakob's Law
Users bring expectations learned from other products.

Use familiar navigation, control behavior, terminology, form patterns, and platform conventions for ordinary tasks. Deviate when there is a clear user benefit, and make the new behavior learnable.

### Mental models
Users act according to their internal understanding of how the system works.

Make cause/effect, state, ownership, and object relationships match the conceptual model presented by the interface. Avoid labels or layouts that imply a false structure.

### Consistency
Repeated patterns reduce learning cost and strengthen predictability.

Keep the same component, state, terminology, placement, and behavior for the same concept. Differentiate only when semantics differ.

### Paradox of the active user
Users commonly start using software instead of studying instructions first.

Make the primary path self-explanatory. Put help in context, reveal advanced guidance when needed, and do not rely on manuals or onboarding slides to explain basic operation.

## Target acquisition and interaction speed

### Fitts's Law
Larger and nearer targets are easier and faster to acquire.

Give important controls adequate hit areas, place frequent actions where pointer/thumb travel is low, avoid tiny icon-only targets, and keep destructive actions separated from common actions.

### Doherty Threshold
Interfaces feel much more fluid when interaction feedback arrives quickly; the often-cited target is around 400 ms for keeping the interaction loop engaged.

Acknowledge actions immediately. Use optimistic state, skeletons, inline progress, streaming, or background execution when the underlying work is slower.

### Parkinson's Law
Work tends to expand to fill the available time.

For UX, constrain tasks and forms to what users actually need. Do not make a workflow longer because the available surface permits it.

## Motivation, progress, and memory

### Goal-gradient effect
Motivation often increases as users perceive themselves getting closer to completion.

Expose meaningful progress, completed steps, remaining work, and achievable next actions. Avoid fake progress indicators.

### Zeigarnik effect
Unfinished tasks remain cognitively salient.

Preserve drafts and progress, make incomplete work easy to resume, and use pending-state cues carefully. Do not weaponize unfinished-state anxiety for dark patterns.

### Peak-end rule
People disproportionately remember intense moments and the ending of an experience.

Prioritize failure recovery, success confirmation, checkout completion, onboarding finish, and other high-emotion points. A polished ending cannot compensate for a broken flow, but a poor ending can damage an otherwise good one.

### Serial position effect
People tend to remember items at the beginning and end of a sequence more readily.

Put high-priority actions or information in strong positions, but do not hide lower-ranked critical items in the middle of long lists.

### Flow
Sustained work benefits from clear goals, immediate feedback, manageable challenge, and minimal interruption.

Keep expert workflows fast, preserve context, avoid unnecessary modal interruptions, and reduce repetitive confirmation where risk does not require it.

## Attention and emphasis

### Selective attention
Users focus on stimuli related to their current goal and ignore much of the rest.

Put task-relevant information near the point of action. Do not assume a banner, tooltip, or distant status indicator will be noticed simply because it exists.

### Von Restorff / isolation effect
A visually distinct item attracts attention and is more memorable.

Use singular emphasis for the primary action, warning, selected state, or exceptional item. Avoid multiple competing accent treatments.

### Aesthetic-usability effect
Visually polished interfaces are often perceived as easier to use.

Use visual quality to create trust and reduce perceived friction, but never let polish hide bad interaction design, inaccessible contrast, or ambiguous behavior.

### Cognitive bias
Judgment is affected by predictable heuristics and context.

Use behavioral principles to reduce mistakes and improve comprehension, not to manipulate users into decisions against their interests.

## Grouping and Gestalt structure

### Proximity
Nearby elements are perceived as related.

Use spacing before borders. Keep labels near their controls, related actions together, and unrelated groups separated.

### Common region
Elements enclosed by a shared boundary are perceived as a group.

Use containers only when the boundary communicates a real relationship. Too many cards create visual noise and competing regions.

### Similarity
Elements with similar appearance are interpreted as related.

Keep shared semantics visually consistent. Avoid making different actions look identical or identical actions look unrelated.

### Uniform connectedness
Explicit visual connections imply stronger relationships than mere proximity.

Use connecting lines, stepper paths, grouped controls, and shared backgrounds when relationships must be unmistakable.

### Prägnanz / simplicity of form
People tend to interpret complex visual input as the simplest stable structure available.

Create clean silhouettes, obvious hierarchy, and unambiguous grouping. Remove ornamental geometry that makes the structure harder to parse.

### Closure
People infer complete forms from partial visual information.

Useful for icons, charts, logos, and restrained decorative composition. Do not depend on closure for essential controls or information where ambiguity would hurt usability.

### Continuity
Aligned elements and continuous visual paths are perceived as related.

Use alignment to lead scanning through forms, tables, timelines, navigation, and multi-step flows. Break continuity intentionally to signal a semantic break.

### Symmetry
Balanced symmetrical structures are often perceived as coherent and stable.

Use symmetry for calm, comparison, and balanced layouts. Break it deliberately when hierarchy or directional emphasis matters more.

## Composition and visual hierarchy

### Rule of thirds
A 3x3 compositional grid can help establish balanced focal placement in image-heavy, landing-page, editorial, or promotional layouts.

Treat it as a composition aid, not an application-layout requirement. Functional product interfaces usually benefit more from grid consistency and task hierarchy than photographic composition rules.

### White space
Unused space is an active structural tool.

Use it to separate groups, increase legibility, create emphasis, and reduce density. Avoid both cramped interfaces and wasteful whitespace that pushes important controls off-screen.

### Typography hierarchy
Text size, weight, spacing, and style should reveal the information structure before the user reads every word.

Keep heading levels coherent, body text readable, metadata subordinate, labels distinguishable, and emphasis limited. Do not use font size alone to communicate semantics.

### Contrast
Contrast directs attention and establishes hierarchy.

Use contrast for readability, primary actions, selected state, errors, and key distinctions. Verify color contrast and avoid relying on color as the only signal.

### Color theory
Color carries perceptual and cultural associations and can encode hierarchy/state.

Use a constrained semantic palette, consistent state colors, accessible contrast, and theme-aware tokens. Avoid assigning meaning only through hue and avoid decorative color that competes with status/action semantics.

## Robustness and resilience

### Postel-style robustness
User input is variable and imperfect; interfaces should tolerate reasonable variation while producing clear, consistent output.

Normalize benign input, accept common formatting differences, show constraints before failure, and return specific recovery guidance. Do not apply this principle to security boundaries where permissiveness creates risk.

### Pareto principle
A small subset of actions often accounts for most use.

Optimize frequent, high-value paths first. Keep rare expert functions available without letting them dominate the primary interface.

## Practical combination rules

Some principles reinforce each other:

- Hick + choice overload + cognitive load -> reduce and structure decisions.
- Fitts + selective attention + contrast -> make the primary action easy to find and hit.
- Proximity + common region + similarity + connectedness -> make grouping unambiguous.
- Jakob + consistency + mental models -> preserve predictable behavior.
- Goal-gradient + Zeigarnik + peak-end -> design progress, resumption, and completion intentionally.
- Doherty + flow -> keep interaction feedback fast and interruptions low.
- White space + typography hierarchy + contrast -> establish readable visual hierarchy.

Some principles can conflict:

- Minimalism vs necessary complexity: Tesler wins when hidden complexity harms decisions.
- Familiarity vs innovation: Jakob wins unless novelty produces a material benefit.
- Emphasis vs consistency: Von Restorff should create one intentional exception, not a new visual language.
- Robust input vs security: security constraints override permissive input handling.
