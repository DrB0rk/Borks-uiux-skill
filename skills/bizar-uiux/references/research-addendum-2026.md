# Research addendum — October 2026

This document is a source map for the 2026 extension, distinguishing normative criteria, official design guidance and synthesized internal policy. It is not a claim that every linked study establishes causal effects in every product.

| Source | Authority and use | Implementation implication |
|---|---|---|
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | W3C Recommendation, normative requirements | Audit success criteria by conformance level and exceptions; aim for AA as engineering baseline |
| [WCAG 2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) | W3C AA criterion | Provide non-drag single-pointer alternative when applicable |
| [WCAG 2.5.8 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | W3C AA criterion | Check 24 x 24 CSS px target size or qualifying exceptions; prefer larger touch hit areas |
| [WCAG 2.4.11 Focus Not Obscured Minimum](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | W3C AA criterion | Sticky overlays must not completely hide focused controls |
| [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) | W3C **AAA** criterion | Useful stretch target; do **not** claim it is required for AA |
| [WCAG 3.3.8 Accessible Authentication Minimum](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html) | W3C AA criterion | Avoid memory/transcription cognitive function tests without an applicable alternative |
| [WCAG 3.3.7 Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html) | W3C AA criterion | Avoid redundant user input subject to exceptions |
| [WAI ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/) | Authoritative W3C design/implementation guide, nonnormative examples | Implement the full keyboard/focus pattern when adopting ARIA composites |
| [W3C Cognitive Accessibility Guidance](https://www.w3.org/TR/coga-usable/) | W3C supporting guidance, not a normative WCAG checklist | Reduce memory load, improve language, navigation and recovery |
| [GOV.UK Design System Error Summary](https://design-system.service.gov.uk/components/error-summary/) | Established government design system | Apply actionable, linked and focused error summaries where proportionate |
| [USWDS Accessibility](https://designsystem.digital.gov/documentation/accessibility/) | Government guidance | Composite pages still need manual review after using accessible components |
| [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing) | Testing-tool documentation | Automated axe scanning complements, never replaces, manual and AT verification |
| [web.dev Web Vitals](https://web.dev/articles/vitals) | Google documentation | Evaluate LCP, INP and CLS at field p75 separately for mobile/desktop |
| [DTCG Format Module 2025.10](https://www.designtokens.org/TR/2025.10/format/) | Stable Design Tokens Community Group report; not a W3C Recommendation | Standard format for token portability, if tooling warrants |
| [MDN container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) | Platform API documentation | Consider component-local responsive changes |
| [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) | Platform API documentation | Honor OS-level motion setting |
| [MDN forced colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors) | Platform API documentation | Test high-contrast rendering separately |
| [Nielsen Norman Group usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) | Established practitioner framework | Diagnose visibility, control, recognition, errors, consistency |

## Cross-source synthesis (this skill's original guidance)

The agent workflow, release gates, state contracts, domain-aware chat composer rules, generic-default review and design envelope are **local engineering syntheses**. They are neither published standards nor externally validated scoring instruments.

### Evidence hierarchy

1. Normative requirements and product/security constraints.
2. Observed behavior, user research, tests and field measurements.
3. Official design-system/platform recommendations.
4. Established heuristics and observational practitioner patterns.
5. Aesthetic preference alone.

Reverify changes to standards and APIs before asserting current legal compliance. Do not claim that W3C standards directly establish regional legal obligations.

## Key research-to-practice changes in this expansion

- Made the agent workflow explicit: inspect -> intent contract -> state model -> design envelope -> implementation -> real verification.
- Added composite-widget keyboard contracts and differentiated native controls from ARIA application widgets.
- Expanded cognitive accessibility, content truthfulness and ethical choice design.
- Added product-specific considerations for coding agents, permissions, effort/model controls and persistent background work.
- Added design-token layering, responsive component behavior, locale resilience and dark/high-contrast themes.
- Added a verification matrix and distinguished automated coverage from WCAG conformance and task success.
- Corrected the WCAG AA/AAA distinction around Focus Appearance.

No quantitative field-study improvements are claimed for this skill without running an evaluation.
