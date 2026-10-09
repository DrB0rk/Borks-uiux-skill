# Sources and provenance

## Canonical skill repository

Standalone source distribution: https://github.com/DrB0rk/Borks-uiux-skill

BizarHarness-OMP includes the skill by default so OMP can discover it from the installed package. The standalone repository is the intended canonical home for the reusable skill itself; Bizar's packaged copy must stay semantically aligned with it.

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

**Tier C — verified.** All seven Nielsen Norman Group articles cited (ten usability heuristics, five principles of visual design, recognition and recall, progressive disclosure, icon usability, error-message guidelines, visibility of system status) are live and on-topic. The five visual-design principles — scale, visual hierarchy, balance, contrast, Gestalt — were confirmed as the actual published list. Stated publication dates for recognition-and-recall, error-message guidelines, and visibility of system status were confirmed from page metadata.

**Tier D — live but observational.** Practitioner commentary on AI-generated UI conventions is used only to corroborate implementation smells already supported by stronger accessibility and usability evidence. Such sources never establish authorship and never justify a requirement on their own.

### Standing rule

No numeric research finding should be restated in this skill unless the underlying source supports that specific number. Where evidence is an extended abstract, a practitioner reflection, or observational commentary, the conclusion is stated at the strength the evidence actually carries, and the weakness is recorded rather than smoothed over.

## Provenance of specific reference files

- **[principles.md](principles.md)** — original synthesis informed by Laws of UX and Laws of UI plus standard interaction-design practice.
- **[review-checklist.md](review-checklist.md)** — original synthesis informed by established usability heuristics and the verified standards above.
- **[standards-targets.md](standards-targets.md)** — numeric thresholds drawn from normative W3C, platform, and web.dev sources, each verified against its primary source as recorded above.
- **[ai-assisted-ui.md](ai-assisted-ui.md)** — synthesis of verified peer-reviewed findings on AI-generated interface quality, plus a risk rubric created for this skill's use. That rubric is **not a published standard** and carries no external authority.

## Laws of UX

- Website: https://lawsofux.com/
- Creator: Jon Yablonski
- Scope consulted: the site's current law index and public explanatory pages.
- The site states that its content is licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0.
- Because BizarHarness-OMP is an independently licensed software package, keep this skill to independently worded summaries of general design/psychology principles and attribution. Do not copy the site's prose, examples, diagrams, posters, or branded graphics.

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