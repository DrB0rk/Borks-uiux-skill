# User cognition, interaction mechanics and audience context

This reference provides evidence-backed guidance on how real human users perceive color, scan layouts, process decisions, and navigate interfaces across different target groups. Ground design decisions in human perception rather than personal taste.

---

## 1. Color perception science and palette architecture

### Perceptual uniformity with OKLCH
Standard sRGB and HSL color models are not perceptually uniform: in HSL, yellow (`hsl(60, 100%, 50%)`) appears vastly brighter to the human eye than blue (`hsl(240, 100%, 50%)`) despite sharing an identical `50%` lightness value. This causes contrast failures across theme hues.

Use the `oklch(L C H)` color space (Baseline Widely Available):
- Lightness ($L \in [0, 1]$): represents perceived brightness calibrated to human vision. A lightness of `0.7` produces the same perceived luminance across all hues.
- Chroma ($C$): color saturation/intensity.
- Hue ($H \in [0, 360]$): angle on the perceptual color circle.

### The 60-30-10 palette architecture
Adapted from interior and graphic composition, the 60-30-10 rule establishes a clear visual hierarchy in user interfaces:
- **60% Dominant surface / canvas neutral:** Background surfaces, card containers, and empty space that give content room to breathe.
- **30% Structural elements & typography:** Borders, dividers, secondary containers, card headers, body text, and icons that organize information.
- **10% Interactive accent & primary focus:** Reserved exclusively for primary calls-to-action, active status, unread indicators, and key conversion paths.

**Accent creep warning:** Adding multiple competing bright hues (e.g. blue buttons, purple badges, orange banners, teal chips) destroys focal priority. Reserve the 10% layer for a single primary brand hue, plus an isolated semantic destructive hue (red).

### Color Vision Deficiency (CVD) ergonomics
Approximately **8% of men and 0.5% of women (~300 million people worldwide)** experience Color Vision Deficiency:
- **Deuteranopia / Deuteranomaly (~5.3% males):** M-cone defect; difficulty distinguishing red and green hues.
- **Protanopia / Protanomaly (~1.3% males):** L-cone defect; red blindness; reds appear darker or olive-brown.
- **Tritanopia / Tritanomaly (~0.02%):** S-cone defect; blue-yellow confusion.
- **Achromatopsia (~0.003%):** Total monochromacy / gray-scale vision.

**Non-negotiable rule (WCAG 1.4.1): Never rely on color as the sole carrier of meaning.**
- Dual-encode status: pair color with a text label (e.g., "Active", "Offline"), an explicit badge, or an icon shape.
- Never use a bare red dot and green dot to communicate system state; under deuteranopia, both collapse into olive-yellow tones of identical lightness.

### Dark mode halation and contrast ergonomics
Extreme contrast in dark mode (pure white `#ffffff` on pitch black `#000000`, 21:1 contrast) causes the **halation effect** — light scattering around glyph edges caused by pupil dilation. This triggers eye strain, blurred text, and reading fatigue, particularly for users with astigmatism (~33–50% of adults).

- **Background:** Use deep charcoal or slate (`oklch(0.15 0.02 260)` / `#0f172a` / `#121212`, lightness ~10–15%), not `#000000`.
- **Text:** Use off-white text (`oklch(0.92 0.01 260)` / `#f1f5f9`, lightness ~90–92%), keeping contrast in the comfortable **10:1 to 15:1 range** rather than harsh 21:1.
- **Pure black OLED power saving:** Pure `#000000` is beneficial on mobile OLED screens for battery conservation, but should be paired with subdued off-white text and restrained typography.

---

## 2. User scanning patterns and visual momentum

Eye-tracking research by the Nielsen Norman Group confirms that users rarely read web pages word-for-word; they scan in predictable patterns determined by content structure and task urgency.

### The F-shaped scanning pattern
Common on text-dense pages (articles, documentation, search results):
1. **Top horizontal sweep:** Users read across the upper section of content.
2. **Second shorter horizontal sweep:** Users scan a shorter section lower down.
3. **Vertical sweep down the left margin:** Users glance down the left edge for keywords.

**Design accommodation:**
- **Front-load key information:** Place primary action verbs and critical keywords in the **first 2 words** of headings, labels, and bullet points.
- The F-pattern is a *coping mechanism* for unstructured text. Break up walls of text with meaningful subheadings, bulleted lists, and visual dividers.

### The layer-cake scanning pattern
Users fixate almost exclusively on headings and subheadings, skimming past the body text until they locate the relevant section.
- Write informative, scannable headings that summarize the section's takeaway.
- Avoid vague headings like "Overview", "Details", or "Information".

### The spotted scanning pattern
Users fixate on visually salient anchor points throughout the page:
- Links and colored badges.
- Bolded keywords and digits (numerals like "42" attract fixations far more than spelled-out words like "forty-two").
- Bulleted lists and visual chips.

Use visual anchors deliberately to guide user gaze along the intended task path.

### The Gutenberg diagram and Z-pattern
On scan-heavy landing pages or forms with low text density, reading gravity flows diagonally:
1. **Primary Optical Area (Top-Left):** The initial entry point. Logo, page title, primary orientation.
2. **Strong Fall Fallow Area (Top-Right):** Secondary focal point. Navigation, global search, profile.
3. **Weak Fall Fallow Area (Bottom-Left):** Blind spot unless given deliberate visual anchors.
4. **Terminal Area (Bottom-Right):** The conclusion. **Place the primary call-to-action (CTA) here**, matching reading gravity.

### The above-the-fold reality
Research confirms users spend **~57% of their viewing time above the fold**, but **74% of viewing time in the first two screenfuls**.
- Do not cram everything into the hero section.
- Create visual momentum ("scent of information"): let content visibly cross the fold line to invite scrolling. Never create a "false floor" where empty space implies the page has ended.

---

## 3. Target groups and context of use

Interfaces must calibrate their information density, navigation models, and cognitive load to the specific audience context (ISO 9241-210).

### Enterprise / B2B power users
Users who operate software daily to complete high-volume business tasks.
- **Primary values:** Throughput, zero latency, data density, keyboard navigation.
- **Layout standards:** Dense multi-column tables, tabular numeric alignment (`font-variant-numeric: tabular-nums`), persistent filters, bulk operations, keyboard shortcuts (`Cmd+K`, Tab traversal), and sticky column headers.
- **Anti-pattern:** Excessive decorative whitespace that forces pagination or scrolling when the user needs to compare 50 records at once.

### Consumer / B2C e-commerce users
Users with discretionary intent, operating under divided attention or time pressure.
- **Primary values:** Frictionless progression, high trust, mobile comfort, low cognitive friction.
- **Layout standards:** Generous breathing room, single-path conversion flows, mobile thumb-zone primary controls, transparent pricing, visible return/security guarantees.
- **Anti-pattern:** Unnecessary modal interruptions, multi-step wizards for single-field actions, choice overload (Hick's law).

### Aging adults (silver surfers)
Users with natural age-related declines in visual acuity, contrast sensitivity, and fine motor precision.
- **Primary values:** Legibility, forgiving hit areas, predictable behavior.
- **Layout standards:** Minimum 16px body type, generous line-height (1.5–1.6), high contrast (>= 4.5:1, ideally >= 7:1), touch targets 44–48px minimum, clear focus rings, and no rapid auto-advancing carousels.

### Novice and low digital literacy users
Users who are unfamiliar with technical abstractions or domain jargon.
- **Primary values:** Clarity, safety, error forgiveness.
- **Layout standards:** Explicit text labels alongside icons (never standalone ambiguous glyphs), Postel-style robust input formatting (accepting diverse phone/date formats and normalizing silently), clear back/cancel escapes, and persistent visible progress.
