# Verification and evaluation playbook

Do not claim that a visually plausible interface is tested. Separate **static review**, **automation**, **interactive manual verification**, **assistive-technology testing**, **field performance** and **user research**. An audit without running software must say so.

## Risk-based test matrix

For each critical journey, cover:
- **Task:** first use, routine use, expert use and interrupted/resumed use where applicable.
- **State:** default, pending, filled, empty, error, partial, denied and offline as relevant.
- **Input:** keyboard, pointer, touch, screen reader; no gesture-only operation.
- **Display:** 320/360/390 CSS px, tablet, desktop and intermediate widths as warranted; zoom/reflow and text-spacing overrides.
- **Preferences:** reduced motion, dark mode, forced colors/high contrast, text enlargement and localization.
- **Data:** empty, one, many, long strings, unknown strings, malformed input, real-world size and stale versions.
- **Environment:** slow network, API error, retry, refresh and navigation during pending work.

These sample viewport widths are **engineering test choices**, not formal breakpoint requirements. Apply the WCAG 1.4.10 reflow requirement and its exceptions correctly.

## Required verification sequence

1. Run repository checks (build, lint, typecheck, unit/component tests) where available.
2. Confirm markup and control semantics, accessible names, roles, state and label relationships.
3. Run automated accessibility checks on key pages and open dialogs using an appropriate tool (e.g. axe + Playwright).
4. Walk through the key user journey with keyboard only, checking focus visibility, order, return, Escape and submission.
5. Test manual screen reader announcement of names, errors, status and composite widgets using at least one supported screen reader/browser combination.
6. Exercise blank/error/loading/permission/offline paths; prove failed submissions retain entered data and expose retry.
7. Inspect responsive surfaces at narrow and wide widths and zoom. Test overflow and virtual-keyboard obstruction.
8. Check contrast and forced-colors behavior. Verify target hit areas, not just glyph sizes.
9. For production web performance, use field data for Core Web Vitals where available, and lab traces for debugging; do not represent a one-off Lighthouse score as field performance.
10. Inspect final screenshots/recordings for hierarchy, information density and visual consistency only after functional checks.

Automated axe scans do **not** establish complete WCAG conformance. Use [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing) and its manual-testing caveat.

## Example: Playwright + axe (for projects already using these packages)

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('critical screen has no detected axe violations', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations).toEqual([]);
});

test('user can save via keyboard', async ({ page }) => {
  await page.goto('/settings');
  // Replace with actual app controls, not placeholder selectors.
  await page.getByRole('textbox', { name: /display name/i }).fill('Example');
  await page.getByRole('button', { name: /^save$/i }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/saved/i)).toBeVisible();
});
```

Tests above are **templates**, not proven to run against any particular application. Mock or configure server persistence in a real test. Do not add new dependencies silently for a tiny change.

## Prioritization

Treat accessibility and loss-of-work regressions as release blockers according to impact. Score remaining issues with: severity of user consequence, prevalence of the journey, confidence of evidence, and remediation cost. Do not multiply arbitrary scores and claim scientific accuracy.

## Findings format

For each:
- Location / reproduction steps
- Environment and evidence (observed, measured, inferred)
- Severity and affected users
- Expected vs actual
- Consequence and source/rationale
- Smallest corrective change
- Exact acceptance test

Examples of non-defensible claims:
- "Accessible" based on axe alone.
- "Fast" based on a single local trace.
- "Mobile-ready" after one device-width screenshot.
- "Intuitive" without task outcome evidence.
- "WCAG-certified" without an appropriately scoped independent conformance process.

## User study, when feasible

For high-risk changes, define actual top tasks and success/effort/error measures **before** testing. Observe representative participants completing them without coaching. Note sample limitations. Qualitative observations are useful for diagnosing problems but small unrepresentative studies cannot establish population-wide effect sizes. Compare a redesigned flow with a baseline using comparable tasks and conditions.
