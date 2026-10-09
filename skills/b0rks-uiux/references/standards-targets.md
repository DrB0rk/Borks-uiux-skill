# Measurable standards and engineering targets

Use this reference when a review needs a number rather than an opinion. Every threshold below was checked against its normative source; see [sources.md](sources.md) for the verification status of each.

Principles explain *why* something matters. This file answers *how much is enough*, so a finding can state "below 24 CSS px" instead of "a bit small."

## When to use this

- The task involves implementing or auditing accessibility, responsive behaviour, or performance.
- A finding needs a defensible threshold to justify its severity.
- Someone asks "what counts as good enough" rather than "what looks better."

Do not turn every threshold into a compliance audit. Apply the ones relevant to the work at hand.

## Accessibility baseline

**Target WCAG 2.2 Level AA** for web work, even where a legal baseline still references an older harmonised version. WCAG conformance is a floor, not a complete usability standard: a page can pass automated checks and still be confusing or exhausting to use. Pair conformance with cognitive review and manual assistive-technology testing of critical journeys.

WCAG 2.2 added criteria directly relevant to everyday interface work: Focus Not Obscured, Dragging Movements, Target Size (Minimum), Consistent Help, Redundant Entry, and Accessible Authentication.

Focus Appearance (SC 2.4.13) is **Level AAA**, not part of the Level AA baseline. Its design guidance is useful as a stretch goal, but must not be cited as mandatory for AA. See [research-addendum-2026.md](research-addendum-2026.md).

## Verified thresholds

| Area | Target | Source |
|---|---|---|
| Normal text contrast | at least 4.5:1 | WCAG 1.4.3 |
| Large text contrast | at least 3:1 | WCAG 1.4.3 |
| Non-text / UI component contrast | at least 3:1 where 1.4.11 applies | WCAG 1.4.11 |
| Pointer target minimum (AA) | 24 × 24 CSS px, or qualifying spacing | WCAG 2.5.8 |
| Primary touch target (internal target) | roughly 44 × 44 CSS px | Apple HIG, Fluent 2 |
| Android interactive target | 48 × 48 dp | Android |
| Reflow | no loss or two-dimensional scrolling at 320 CSS px equivalent | WCAG 1.4.10 |
| INP (Interaction to Next Paint) | ≤ 200 ms at p75 (Good threshold) | Core Web Vitals (W3C/Chrome) |
| LCP (Largest Contentful Paint) | ≤ 2.5 s at p75 | Core Web Vitals |
| CLS (Cumulative Layout Shift) | ≤ 0.1 at p75 | Core Web Vitals |
| LoAF animation frame delay | ≤ 50 ms main-thread task threshold | W3C Long Animation Frames API |
**On target size:** 24 × 24 CSS px is a *conformance minimum*, not good touch design. It comes with documented exceptions (spacing, inline targets, essential cases, user-agent control). For primary touch interactions, treat ~44–48 units as the real internal target.

**On hit areas:** the interactive hit area can be larger than the visible icon. A 16 px icon inside a 44 px button is not an oversized button. Judge the target, not the glyph.

**On body text size:** there is no universal web rule that body text must be exactly 16 px. Readability depends on font metrics, line length, zoom support, and platform. Use relative/rem-friendly sizing, support user zoom and text settings, and validate actual readability rather than asserting a single pixel value.

## Reflow and text resilience

Reflow at 320 CSS px applies to vertically scrolling content. Content that genuinely requires two dimensions (data tables, maps, code) is excepted — but "excepted" means the alternative must still be usable, not that it can overflow.

Text spacing (WCAG 1.4.12) does not require authors to adopt specific spacing values. It requires that content does not break when users override line, paragraph, word, and letter spacing. Test with overrides applied.

Beyond the conformance checks, verify:

- browser zoom to at least 200%, and reflow around 400% zoom / 320 CSS px;
- long translated strings and expansion;
- unbroken identifiers and URLs;
- user-generated content of unknown length;
- system font scaling and dynamic type on mobile.

## Semantics and ARIA

An ARIA role is a **behavioural promise**. Adding `role="button"` to a `div` does not give it keyboard behaviour, focus handling, or activation semantics. The role tells assistive technology what you promised; you still have to implement it.

This is the single most common way generated frontends look accessible while remaining unusable.

Order of preference:

1. **Native HTML.** `<button>` for actions, `<a>` for navigation, native form controls. Semantics and behaviour come free and are correct.
2. **ARIA to complete semantics** the markup cannot express, plus the documented keyboard pattern, focus model, and states for composite widgets.
3. Never superficial repair — bolting `aria-*` attributes onto broken markup produces a misleading accessibility tree while leaving keyboard behaviour broken.

## Keyboard and focus

Keyboard operation is a primary interaction path, not a fallback. Verify:

- every interactive control reachable and operable with keyboard alone;
- focus indicator always visible, never entirely hidden behind sticky headers or overlays;
- focus order follows meaningful document order, not CSS visual reordering;
- dialogs and popovers set initial focus intentionally and return it to the trigger on close;
- composite widgets (menus, tabs, comboboxes, dialogs) follow their documented keyboard conventions;
- no keyboard traps;
- focus stays in a predictable place when content updates dynamically.

Dynamic status that does not move focus — a save confirmation, a result count, a background-job update — must be programmatically determinable so assistive technology can announce it (WCAG 4.1.3).

## Performance is user experience

Core Web Vitals, assessed separately for mobile and desktop at the 75th percentile:

| Metric | "Good" threshold |
|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5 s |
| INP (Interaction to Next Paint) | ≤ 200 ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 |

These are the load and interaction budgets behind the Doherty Threshold principle. A polished interface that responds slowly is not high-quality UX — and equally, performance work should not strip required feedback or accessibility semantics to hit a number.

### INP sub-parts & LoAF diagnosis

INP officially replaced FID as a Core Web Vital. It measures the longest latency of user interactions throughout the page lifecycle:
- **Input delay:** time from user action to event handler start (must yield main thread quickly).
- **Processing duration:** time spent executing JS event callbacks (split long tasks > 50 ms using `scheduler.yield()` or micro-tasks).
- **Presentation delay:** time from event callback end to browser painting the next frame.

Use the **Long Animation Frames (LoAF) API** (W3C Working Draft) to diagnose frames where rendering was delayed beyond 50 ms. LoAF identifies the exact script URL, character position, and invoker causing interaction latency.

## Modern CSS primitives & web baseline

Modern interface implementations should leverage platform-native standards that have achieved Baseline status across modern browser engines:

- **Container Queries (@container):** Baseline Widely Available. Components must be intrinsically responsive to their container width (`@container (min-width: ...)` and units `cqw`, `cqi`), rather than relying exclusively on global viewport media queries.
- **Popover API:** Baseline 2025. Use the native HTML `popover` attribute and `popovertarget` button attribute for tooltips, menus, and contextual overlays. The browser handles top-layer promotion, native light-dismiss on outside click or Escape, and focus management without custom JS traps.
- **@starting-style & allow-discrete:** Baseline 2024/2025. Enables CSS-only transitions from `display: none` or top-layer elements using `transition-behavior: allow-discrete` and `@starting-style` for entry/exit keyframes without flash of unstyled content.
- **oklch() color space:** Baseline Widely Available. Use `oklch(L C H)` for theme palettes and programmatic contrast. Unlike HSL, OKLCH has perceptual lightness uniformity: a lightness of `0.7` has the same perceived brightness across all hues, preventing contrast degradation across theme tints.
- **View Transitions API:** Native morphing between DOM states via `document.startViewTransition()` and multi-page cross-document `@view-transition { navigation: auto; }`.
## Motion

Respect `prefers-reduced-motion` and remove or reduce non-essential motion. Motion should explain causality, orientation, state change, or hierarchy. Decorative motion that competes with the user's task should be restrained or removed — including universal `hover:scale-*`, continuous background animation, and spring effects on frequent workflows.

## Test strategy

Automated checks catch a minority of problems. USWDS is explicit that an accessible component library does not make composed pages automatically accessible, and that both automated and manual testing are required.

Automate where possible: accessibility linting, axe-style browser checks on key pages, component tests, contrast token checks, visual regression, performance budgets.

Pass manually before calling a flow done:

1. Keyboard-only from page load through completion.
2. Visible focus and sensible focus return.
3. Browser zoom and reflow.
4. Screen reader smoke test.
5. Reduced motion enabled.
6. Forced-colours / high-contrast mode where supported.
7. Touch targets on real hardware.
8. Validation and error recovery.
9. Dynamic status announcements.

## Evidence discipline

Thresholds marked *verified* were checked directly against the normative source during this skill's research pass. Where the underlying research is an extended abstract or practitioner reflection rather than a full empirical study, [sources.md](sources.md) records that, and findings depending on it should be stated as directional rather than measured.

Accessibility targets here are engineering guidance, not legal advice. Jurisdictional obligations differ: under the EU Web Accessibility Directive, the harmonised standard EN 301 549 v3.2.1 still formally references WCAG 2.1, and newer WCAG versions do not acquire legal force automatically upon publication. Separately, the European Accessibility Act (EAA) entered active legal enforcement across all EU member states on 28 June 2025, mandating digital accessibility for commercial products, e-commerce, banking, and transport services. Consult qualified legal counsel for compliance claims.