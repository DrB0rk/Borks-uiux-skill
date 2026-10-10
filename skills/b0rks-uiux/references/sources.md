# Sources and provenance

## Canonical skill repository

Standalone source distribution: https://github.com/DrB0rk/Borks-uiux-skill

This repository is the canonical source for B0rk's UI/UX SKILL. OMP-based hosts may bundle independent copies; host maintainers must explicitly sync the new skill identity and references when upgrading.

## How this skill is sourced

This skill is an original operational synthesis. It does not reproduce article text, examples, illustrations, or proprietary visual assets from any source site. Guidance is independently worded throughout.

Sources are used in three tiers, and the tier determines how strongly a claim may be stated:

- **Tier A — normative / official.** WCAG, WAI-ARIA, ISO, platform design guidance, government design systems, Core Web Vitals. Justifies hard requirements and specific numeric thresholds.
- **Tier B — peer-reviewed empirical.** Studies with stated methods. Supports claims about how interfaces actually behave.
- **Tier C/D — established practitioner research and observational commentary.** Frames problems and corroborates smells. Never sufficient alone to justify a hard requirement.

### Verification status

Every citation below was checked against its source during the integration of the standards research pack. Status reflects what could be confirmed from primary sources at that time, not an assertion of permanent truth. Standards and thresholds change — re-verify before relying on a specific number in a compliance context.

**Tier A — verified against normative sources.** WCAG 2.2 is the current W3C Recommendation; the 24 × 24 CSS px target minimum (SC 2.5.8), the 320 CSS px reflow requirement (SC 1.4.10), text-spacing resilience (SC 1.4.12), and status-message requirements (SC 4.1.3) were each confirmed directly from their Understanding documents. Core Web Vitals thresholds — LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile — were confirmed verbatim from web.dev. Apple HIG, Fluent 2, Android, USWDS, and GOV.UK guidance was confirmed as live and on-topic.

**Tier B — mixed, recorded honestly.**

| Source | Status |
|---|---|
| Guriță & Vatavu (ACM DIS '25), DOI 10.1145/3715336.3735691 | **Verified.** Title, authors, venue, and pages (1197–1209) confirmed. The 90-interface / 2-tool / 3-domain / 8-designer methodology was confirmed from the full paper text. |
| Abu Doush & Kassem (Springer UAIS '25), DOI 10.1007/s10209-025-01250-2 | **Verified.** Title, authors, volume 24, pages 3483–3506 confirmed. The four named models, 11 enumerated components, and manual keyboard/screen-reader method are confirmed from the public abstract. |
| Aljedaani et al. (ACM W4A '24), DOI 10.1145/3677846.3677854 | **Verified** for the study's existence, authorship, and main results. One secondary figure was not confirmable from the results text and is therefore not restated here. |
| Panchanadikar, Bhosekar & Dixon (ACM ASSETS '25), DOI 10.1145/3663547.3759755 | **Caveated.** Title, authors, and venue confirmed, but this is an **extended abstract, not a full-length paper**, and its headline quantitative results could not be independently confirmed from a primary source — only from third-party commentary. The skill relies on its *qualitative* conclusion only, which is independently corroborated by the better-verified studies above. **Its specific error counts are not reproduced anywhere in this skill.** |
| Hohn & Loydl (i-com '26), DOI 10.1515/icom-2026-0018 | **Cited as practitioner reflection only.** The paper is real and the Intent-Context-Quality framing is confirmed from the Crossref abstract, but it is a practice-based reflection, not an empirical study. It is used for framing, never as evidence. |
| Mowar, Peng, Steinfeld & Bigham (ACM ASSETS '24), DOI 10.1145/3663548.3688513 | **Cited for subject only.** Title, authors, and research question confirmed — the paper genuinely studies AI coding assistants and web accessibility. No specific quantitative claim is drawn from it. |

**Motion, effects and icons — verified.** `motion-effects.md` rests on checks made directly against primary sources:

- **GSAP licensing — verified, and the nuance matters.** GSAP is *not* MIT, ISC, or otherwise open-source. The published npm licence string is `Standard 'no charge' license`, owned by Webflow. It permits commercial use only while end users are not charged a fee of any kind; a one-time client fee for building the product is explicitly fine; AI-generated code is explicitly allowed. It prohibits use in no-code visual animation builders that compete with Webflow's, and Webflow may revise the terms. **Do not describe GSAP as simply "free"** — the end-user-fee condition is the operative limit. Version confirmed at 3.15.0 via the npm registry.
- **Lucide — verified.** ISC licence, read from the repository LICENSE file. Packages `lucide`, `lucide-react` and `lucide-static` confirmed at 1.54.0 on npm. Accessibility behaviour (icons `aria-hidden` by default; decorative icons get no `aria-label`; functional icons need a real name; interactive icons must be wrapped in semantic elements) is from Lucide's own accessibility guidance.
- **WCAG motion criteria — verified.** SC 2.3.3 Animation from Interactions is **Level AAA**, not AA — a common and consequential misstatement. SC 2.2.2 Pause, Stop, Hide and SC 2.3.1 Three Flashes or Below Threshold are both **Level A**. SC 1.4.2 Audio Control is Level A but governs audio only and must not be cited as covering motion.
- **prefers-reduced-motion — verified.** MDN wording and Baseline Widely Available status confirmed.
- **Shadows — verified.** MDN confirms `box-shadow` draws behind the element's entire box while `drop-shadow()` "creates a shadow that conforms to the shape (alpha channel) of the image itself".
- **Material elevation — verified with a caveat.** The documented dp scale (1/2/3/4/6/8/9/12/16/24) comes from the **archived Material 1** page, which is explicitly no longer maintained; Material 3 is current and its elevation system may differ. Cite it as a well-established model, not as current normative guidance.
- **CSS versus JS — verified.** web.dev recommends CSS for simpler one-shot transitions and JavaScript when significant control is needed. The article dates to 2014; the principle holds, but it predates the Web Animations API's now-broad support.
- **FLIP — verified.** Documented by Paul Lewis on Aerotwist, expanding to First, Last, Invert, Play. The GSAP Flip plugin is documented at `gsap.com/docs/v3/Plugins/Flip/` and was added in v3.9.0.

**Tier C — verified.** All seven Nielsen Norman Group articles cited (ten usability heuristics, five principles of visual design, recognition and recall, progressive disclosure, icon usability, error-message guidelines, visibility of system status) are live and on-topic. The five visual-design principles — scale, visual hierarchy, balance, contrast, Gestalt — were confirmed as the actual published list. Stated publication dates for recognition-and-recall, error-message guidelines, and visibility of system status were confirmed from page metadata.

**Tier D — live but observational.** Practitioner commentary on AI-generated UI conventions is used only to corroborate implementation smells already supported by stronger accessibility and usability evidence. Such sources never establish authorship and never justify a requirement on their own.


**Modern web standards, CSS baseline & performance (2025–2026) — verified.** Direct primary-source checks:

- **Modern CSS Baseline — verified.** MDN confirms Baseline Widely Available for Container Queries (`@container`, `cqw`, `cqi`), `oklch()` color space (May 2023), and CSS `linear()` piecewise easing (December 2023). Popover API (`popover`, `popovertarget`, `:popover-open`) is Baseline 2025 across all engines. `@starting-style` and `transition-behavior: allow-discrete` are Baseline 2024/2025. View Transitions API is documented by W3C CSS WG and MDN (`startViewTransition()`, `@view-transition`).
- **Performance & Core Web Vitals — verified.** web.dev confirms INP officially replaced FID as the responsiveness Core Web Vital in March 2024 (Good ≤ 200 ms at p75). The Long Animation Frames (LoAF) API reached W3C First Public Working Draft status in April 2026, diagnosing rendering updates delayed beyond 50 ms.
- **Design Tokens Community Group (DTCG) — verified.** W3C Design Tokens Community Group published the Design Tokens Format Module 2025.10 as a stable final Community Group Report on 28 October 2025. Style Dictionary v4 provides native first-class support for the `$value`, `$type`, `$description` format.
- **Evolving accessibility standards & regulations — verified.** WAI-ARIA 1.3 reached W3C Working Draft status in June 2026 (Editor's Draft September 2026), adding `suggestion`, `comment`, `mark` roles and `aria-description`, `aria-braillelabel`. WCAG 3.0 remains an active W3C Working Draft (March & September 2026), transitioning toward outcome-oriented assertion testing; WCAG 2.2 AA remains the current normative engineering baseline. European Accessibility Act (EAA) entered active legal enforcement across all EU member states on 28 June 2025.
- **Color perception, eye-tracking & audience models — verified.** Color Vision Deficiency simulation matrices implement the physiologically-based model of Machado, Oliveira & Fernandes (IEEE TVCG 2009). Eye-tracking reading and scanning patterns (F-shaped, layer-cake, spotted, Gutenberg diagram) are sourced from Nielsen Norman Group empirical eye-tracking research. Context of use framework is grounded in ISO 9241-210.
### Standing rule

No numeric research finding should be restated in this skill unless the underlying source supports that specific number. Where evidence is an extended abstract, a practitioner reflection, or observational commentary, the conclusion is stated at the strength the evidence actually carries, and the weakness is recorded rather than smoothed over.

## Provenance of specific reference files

- **[principles.md](principles.md)** — original synthesis informed by Laws of UX and Laws of UI plus standard interaction-design practice.
- **[review-checklist.md](review-checklist.md)** — original synthesis informed by established usability heuristics and the verified standards above.
- **[standards-targets.md](standards-targets.md)** — numeric thresholds drawn from normative W3C, platform, and web.dev sources, each verified against its primary source as recorded above.
- **[ai-assisted-ui.md](ai-assisted-ui.md)** — synthesis of verified peer-reviewed findings on AI-generated interface quality, plus a risk rubric created for this skill's use. That rubric is **not a published standard** and carries no external authority.
- **[design-systems.md](design-systems.md)** — tokens, elevation and iconography. Lucide's licence and accessibility behaviour verified against the project itself.
- **[motion-effects.md](motion-effects.md)** — CSS versus JS choice, FLIP/morphing, shadow and glow technique, GSAP licensing terms, and WCAG motion criteria — each verified against its primary source as recorded above.
- **[user-cognition-interaction.md](user-cognition-interaction.md)** — color perception science, OKLCH, 60-30-10 palette architecture, Color Vision Deficiency (Machado et al. 2009 model), eye-tracking scanning patterns (Nielsen Norman Group), and audience context models (ISO 9241-210).

## Laws of UX

- Website: https://lawsofux.com/
- Creator: Jon Yablonski
- Scope consulted: the site's current law index and public explanatory pages.
- The site states that its content is licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0.
- Because downstream OMP distributions may be independently licensed, keep this skill to independently worded summaries of general design/psychology principles and attribution. Do not copy the site's prose, examples, diagrams, posters, or branded graphics.

Principles represented include aesthetic-usability effect, choice overload, chunking, cognitive load, Doherty threshold, Fitts's Law, flow, goal-gradient effect, Hick's Law, Jakob's Law, Gestalt grouping principles, mental models, working memory, active-user behavior, Pareto/Parkinson effects, peak-end rule, Postel-style robustness, selective attention, serial-position effects, Tesler's Law, isolation effect, and unfinished-task effects.

## Laws of UI

- Website: https://www.uilaws.com/
- Scope consulted: the current public law index.
- The site footer states "All rights reserved."
- Do not copy its page text or visual assets. This skill independently expresses common UI principles and design practice.

Principles represented include symmetry, rule of thirds, white space, color theory, typography hierarchy, consistency, proximity, contrast, closure, continuity, Fitts's Law, Hick's Law, and Jakob's Law.

## Legal note

Accessibility content in this skill is engineering guidance, not legal advice. Jurisdictional obligations differ and change: for example, within the EU the currently harmonised EN 301 549 still draws heavily on WCAG 2.1, and a newer WCAG version does not acquire legal force merely by being published. Consult qualified counsel for compliance determinations.

## Evidence discipline

These principles are heuristics, not empirical guarantees for every context. When product analytics, usability tests, accessibility requirements, platform conventions, or direct user research contradict a heuristic, prefer the stronger task-specific evidence.
## October 2026 additions

For primary links and the normative/official/heuristic distinction covering ARIA APG, WCAG focus conformance levels, cognitive accessibility, responsive CSS, DTCG design tokens, Playwright and GOV.UK patterns, see [research-addendum-2026.md](research-addendum-2026.md). Agent-specific workflows and scorecards are an **original engineering synthesis**, not externally standardized or causally validated research findings.
