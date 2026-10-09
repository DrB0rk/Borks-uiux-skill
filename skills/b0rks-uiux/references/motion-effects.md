# Motion and effects

Motion should explain causality, orientation, state change, or hierarchy. Decoration that competes with the task should be removed or restrained. This reference covers when to animate, how to animate it, and which libraries are safe to reach for.

Every licensing and standards statement below was checked against its source; the verification record is in [sources.md](sources.md).

## Reach for CSS first

web.dev's guidance is the practical default: **use CSS for simpler one-shot transitions** (toggling a state, sliding a menu in, showing a tooltip); **use JavaScript when you need significant control** — bounce, stop, pause, rewind, slow down.

That guidance is old but still authoritative, and it points the right way for most interface work. A `transition` on `transform` and `opacity` is composited on the GPU, needs no dependency, and cannot be got wrong by a version bump. Reach for a library when the animation is genuinely choreographed, interruptible, or sequenced.

```css
/* Correct: only compositor-friendly properties, no layout thrash */
.panel {
  transition: transform 200ms ease, opacity 200ms ease;
}
```

```css
/* Wrong: animating layout properties forces reflow on every frame */
.panel {
  transition: height 200ms ease, top 200ms ease;
}
```

## Morphing between states

The **FLIP** technique (**F**irst, **L**ast, **I**nvert, **P**lay) was documented by Paul Lewis on Aerotwist. Measure the element before the change, apply the change, invert the difference with a transform, then play the transform away. The browser animates only transforms, so layout happens once instead of per frame.

This is the right technique whenever an element changes size, position, or shape between two states — expanding a row into a panel, reordering a list, a card growing into a detail view.

**GSAP's Flip plugin** implements this for you: it "records the current position/size/rotation of your elements, you make whatever changes you want, and then Flip applies offsets to make them look like they never moved." It was added in v3.9.0 and is documented at https://gsap.com/docs/v3/Plugins/Flip/.

Do not hand-roll FLIP for complex or interruptible cases; the plugin handles nested transforms, batching for frameworks, and `onEnter`/`onLeave` callbacks.

## GSAP — and what its licence actually permits

GSAP is a legitimate choice for orchestrated, scroll-linked, SVG and morphing work. Current version at the time of writing: **3.15.0**.

**The licence is the part to get right.** GSAP is *not* MIT, ISC, or otherwise open-source. Webflow owns it, and the published npm licence string is:

> Standard 'no charge' license

What that permits, in the licence's own terms:

- Commercial use at no charge **as long as end users are not charged a fee of any kind** to use your product or gain access to any part of it.
- Charging the *client* a one-time fee to build the site or product is explicitly fine.
- AI-generated code is explicitly allowed — the licence FAQ states this is not a "Prohibited Use".
- IP stays with Webflow, and removing proprietary notices or branding is prohibited.
- Webflow may revise the licence at any time by posting updated terms.

What it restricts:

- Using GSAP in a tool that lets end users build visual animations *without code*, where that competes with Webflow's own visual animation builder.
- Reverse engineering GSAP to create a competing product.

So: **if your product charges end users to access it, or sells an animation builder, the free licence does not cover you** and you need a Business membership. For ordinary application UI work the no-charge licence is fine. Check the current terms before shipping, because the licence can change: https://gsap.com/standard-license/

## Shadows

Two different properties, and the choice is about shape:

- **`box-shadow`** draws a rectangular shadow behind the element's *entire box*, regardless of its shape.
- **`filter: drop-shadow()`** produces "a blurred, offset version of the input image's alpha mask" — a shadow that **conforms to the element's actual rendered shape**.

MDN states it directly: `box-shadow` creates a shadow behind an element's entire box, while `drop-shadow()` "creates a shadow that conforms to the shape (alpha channel) of the image itself."

Use `box-shadow` for opaque rectangular surfaces — cards, panels, modals. Use `drop-shadow()` for irregular or transparent shapes — logos, SVG, text, images with alpha.

**Elevation is a system, not a pile of shadows.** Material Design documents an explicit dp scale tied to what each level means (switch 1dp, resting card 2dp, app bar 4dp, FAB 6dp, menu/raised button 8dp, dialog 24dp) and notes that shadows are "the only visual cue indicating the amount of separation between surfaces." Define a small elevation scale in your tokens and use it consistently rather than inventing a new blur on each component.

Two common dark-mode failures: shadows disappear on dark surfaces while still being relied on to communicate elevation, and elevation gets re-expressed as a subtle background lightening. Either is fine — but pick one per surface and keep it consistent.

## Glow

Glow is not an accessibility or hierarchy mechanism; it is emphasis. Treat it with the same restraint as any other accent treatment.

- **A glow must not be the only signal.** If it communicates state, that state needs a non-colour carrier as well.
- **Glow on text degrades legibility.** Large coloured text-shadow spreads glyph edges and reduces contrast against the background. Reserve glow for non-text elements or very large display type, and re-check contrast after the effect.
- **Glow is expensive to composite.** Large blurred shadows over animated elements force repaints on every frame. Prefer a small blur radius on a static element over a large one on something in motion.
- **Glass and glow together** — a blurred backdrop plus a coloured glow on the same element usually reads as decoration rather than meaning. Pick one.

Note that this skill's own [ai-assisted-ui.md](ai-assisted-ui.md) lists glow and aurora blobs as medium-confidence generative defaults — worth a review prompt precisely because they are easy to add and easy to overuse.

## Sliding and transforms

- Animate `transform` and `opacity`. Both are compositor-friendly.
- **Avoid `transition: all`.** It animates properties you did not intend, including ones that trigger layout, and makes a component's motion impossible to reason about. Name the properties.
- Slide with `transform: translateX()`, not `left`. `left` triggers layout on every frame.
- Slide-in panels should respect safe areas on mobile and account for the virtual keyboard.
- Never animate something *into* the viewport and leave it covering the trigger or trapping focus — see the interaction-patterns reference for dialog focus management.

## Motion accessibility

**The criterion people most often get wrong:** WCAG 2.2 **SC 2.3.3 Animation from Interactions is Level AAA**, not AA. It requires that motion animation triggered by interaction can be disabled unless the animation is essential. Because it is AAA it is not part of an AA conformance claim — but honouring it is cheap and correct.

The criteria that *are* part of Level A:

| Criterion | Level | What it requires |
|---|---|---|
| 2.2.2 Pause, Stop, Hide | **A** | Auto-playing motion that lasts more than five seconds and runs in parallel with other content must be pausable, stoppable, or hideable |
| 2.3.1 Three Flashes or Below Threshold | **A** | Nothing flashes more than three times per second, or below the general and red flash thresholds |

SC 1.4.2 Audio Control is also Level A but governs **audio only** — do not cite it as covering motion.

### `prefers-reduced-motion`

Per MDN, this feature "is used to detect if a user has enabled a setting on their device to minimize the amount of non-essential motion… the user prefers an interface that removes, reduces, or replaces motion-based animations." Values are `no-preference` and `reduce`, and it is Baseline Widely Available.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Reduce or replace — do not simply delete feedback. A transition that confirmed an action still needs to confirm it; swap it for an instant state change or another cue rather than removing the feedback.

For GSAP, honour the same preference by setting durations to near zero rather than by disabling the plugin.

## Testing motion

- Verify with the OS "reduce motion" setting on, not just a media-query override in devtools.
- Confirm nothing becomes unreachable or unfocusable when motion is reduced.
- Check that focus is never animated in a way that leaves it invisible.
- Confirm auto-playing loops honour Pause, Stop, Hide when they exceed five seconds.