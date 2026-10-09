# Design-system engineering and responsive composition

Read for visual foundations, token architecture, themes, responsive components and design-language consistency. This reference defines a method, not a universal visual style.

## 1. Inventory before inventing

Inspect existing primitives, token definitions, component variants, typography, layout containers, elevation and iconography. Determine whether design decisions are intentional, legacy or accidental. Preserve sound conventions during targeted repairs.

For a new product, write a compact **design envelope** before generating many screens: domain tone, content density, grid/spacing logic, type scale, semantic color roles, interaction language, motion rules and image treatment. Prefer a small coherent system to a broad palette of arbitrary components.

## 2. Separate token layers

| Layer | Example | Purpose |
|---|---|---|
| Primitive | `blue.600`, `space.4` | Raw values, not component intent |
| Semantic | `color.action.primary`, `color.text.muted` | Meaning independent of theme |
| Component | `button.primary.background` | Controlled component-specific mapping |

- Make status, error, warning, success and interactive focus colors semantic and test contrast **in each theme/state**.
- Define a deliberate density model. A financial ledger, coding IDE and marketing page should not all use identical spacing.
- Avoid leaking raw hex values into every page. Use a clear exception policy for truly unique visuals.
- Prefer logical spacing and typography scales over arbitrary values repeated throughout components.
- Keep roles distinct: a chart series color, status color and button action color should not compete semantically.

### DTCG interoperability

The [Design Tokens Format Module 2025.10](https://www.designtokens.org/TR/2025.10/format/) is a **stable final Community Group Report**, not a W3C Recommendation. Consider it for cross-tool token exchange; it does not require teams to refactor an established CSS-variable system. Use its `$type`, `$value`, group and alias concepts accurately. Do not implement newer preview drafts as if final.

Example of a *conceptual* source token representation (validate exact syntax against the format before using in production):

```json
{
  "surface": {
    "base": { "$type": "color", "$value": { "colorSpace": "srgb", "components": [1, 1, 1] } }
  }
}
```

## 3. Typography and information hierarchy

- Define roles such as page heading, section heading, body, label, supportive text, code/data, and caption.
- Reserve expressive typography for places where it helps product identity; prioritize stable metrics, readability and glyph coverage in dense software.
- Use readable line length, clearly separated paragraphs and meaningful emphasis. Test actual fonts at typical device scale.
- Use tabular figures for columns of numeric data and aligned decimal formats when relevant.
- Internationalize numbers, dates, currency, pluralization and casing instead of hard-coding English assumptions.

## 4. Responsive behavior is a layout decision

- Design the hierarchy at narrow and wide viewports, not only the breakpoint list. What remains visible? What becomes a disclosure? What changes interaction mode?
- Prefer intrinsic layout (grid, flex, minmax, wrapping, logical properties). For reusable components, use container-size queries where supported, not viewport queries alone.
- Test intermediate widths, translated labels, zoom and mobile keyboard overlays. Sticky elements must not obscure focus or the only completion action.
- For tables, choose among horizontal scroll with clear affordance, prioritized columns, row detail views or alternate summaries based on the task. Do not arbitrarily convert every table into cards.
- Account for device safe areas, scroll bars, input modality and font scaling.

Reference: [MDN CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries).

## 5. Themes and user preferences

- Test light/dark and high-contrast / forced-colors independently. Never assume a color that passes in light mode passes in dark mode.
- Respect user theme and reduced-motion preferences where the platform exposes them. Avoid removing browser focus outline without an accessible replacement.
- Use noncolor cues for success, selection, errors, priority and data series.
- Test semi-transparent surfaces and blur against *real* varied content; contrast must hold over the underlying composition.
- Reference: [MDN forced colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/forced-colors), [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion).

## 6. Locale, direction and content resilience

- Handle longer localized labels, compound words, screen-reader language and right-to-left layouts.
- Prefer `padding-inline` / `margin-inline` and logical alignment to one-off left/right fixes; reverse direction only for content whose semantics require it.
- Keep numeric identifiers, file paths and code tokens legible in mixed-direction text.
- Stress with 2x string expansion and translated plural forms. Test truncation for discoverability rather than clipping required meaning.
- Do not make progress, sorting or state depend exclusively on an English word or a language-specific icon.

## 7. Visual craft that resists template convergence

Choose a limited number of deliberate distinctions based on product intent:
- information density and reading rhythm;
- navigation and workflow topology;
- hierarchy of data, actions and secondary metadata;
- visual identity in type, geometry, iconography and appropriate imagery;
- small meaningful motion, not page-wide decoration.

Use real domain data and task-specific content. Avoid an exact three-card grid, giant hero, badge and glow treatment when the information model calls for a search interface, ledger or detail-first workflow. A standard pattern is good when it fits the task; novelty is not a measurable quality by itself.

## 8. Change management

When editing an existing design system, document any new token, variant or exception and where it is used. Prefer a migration path for renamed tokens. Test representative components and states against new mappings before making a repo-wide replacement. Do not introduce a design-system dependency solely to apply a familiar aesthetic.
