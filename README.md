<p align="center">
  <img src="assets/banner.svg" alt="Bizar UI/UX — design and review interfaces with behavioral design principles" width="100%">
</p>

<p align="center">
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-6EA8FF?style=flat-square"></a>
  <img alt="Skill files" src="https://img.shields.io/badge/skill-5%20files-8F7CFF?style=flat-square">
  <img alt="No runtime dependencies" src="https://img.shields.io/badge/dependencies-none-3FB950?style=flat-square">
</p>

# Bizar UI/UX

A skill that turns interface work into **explicit, testable design decisions** instead of taste-driven styling.

Point your agent at a screen, a flow, or a component and this skill audits it against behavioral design principles — then proposes the *smallest* change that removes the friction. Every finding ties back to a named principle and an observable user consequence.

> **What it is:** a set of instructions and reference material your AI agent loads on demand.
> **What it isn't:** a component library, a CSS framework, or a design system. It has **zero runtime dependencies** — it works on any stack.

---

## Why this exists

Most UI feedback from an AI is taste, delivered confidently:

> *"Make it cleaner. Add more whitespace. Modernize the buttons."*

That's unfalsifiable and unactionable. This skill inverts it:

| Instead of | You get |
|---|---|
| "This feels cluttered" | "Nine competing actions violate Hick's Law; consolidate the four secondary filters behind progressive disclosure" |
| "The button looks odd" | "The destructive action sits 12px from Save, violating separation for irreversible operations" |
| "Let's add some polish" | "Aesthetic-usability effect justifies visual polish, but it must not mask contrast failures" |

Findings are graded by **user impact** — `Critical`, `High`, `Medium`, `Low` — never by visual preference.

---

## What's inside

```
skills/bizar-uiux/
├── SKILL.md                      # Entry point: operating model, priorities, output format
├── references/
│   ├── principles.md             # 40 principles mapped to concrete design guidance
│   ├── review-checklist.md       # 13-section audit checklist
│   └── sources.md                # Provenance and licensing discipline
└── agents/
    └── openai.yaml               # Display metadata for OpenAI-compatible hosts
```

The layout is [progressive disclosure](https://en.wikipedia.org/wiki/Progressive_disclosure): only `SKILL.md` loads when the skill triggers, and the three reference files load only when the specific task needs them. Roughly **116 tokens** of frontmatter description sit in context at all times; a triggered load pulls in ~1.5k more, and the references add ~5k only when a task actually needs them.

---

## Install

### Claude Code / OMP (recommended)

Clone into your skills directory:

```bash
git clone https://github.com/DrB0rk/Borks-uiux-skill.git ~/.agents/skills/bizar-uiux
```

Restart your agent. The skill is discovered automatically.

### Verify it loaded

Ask your agent:

```
What does the bizar-uiux skill do?
```

It should describe UI/UX design and review using behavioral principles. To confirm the files are in place:

```bash
ls ~/.agents/skills/bizar-uiux
```

### Already using BizarHarness-OMP?

You already have it. `bizar-uiux` ships with `@polderlabs/bizar-omp` and is enabled by default — no install required. This repository is that skill's **canonical standalone source**, so keep the two semantically aligned.

---

## Usage

The skill activates on its own from the request. You rarely need to invoke it manually.

**Prompt it like this:**

```
Audit the checkout flow in this repo. Focus on error recovery and mobile.
```

```
Redesign this settings page — the form is long and users abandon midway.
```

```
Review src/components/DataTable.tsx for accessibility and responsive behavior.
```

**Expected output** — every material finding arrives in a fixed shape:

- **Location / flow** — where the problem lives
- **Severity** — `Critical` → `Low`, by user impact
- **Observed problem** — the concrete evidence
- **User consequence** — what it costs the user
- **Relevant principle(s)** — the law being applied
- **Recommended change** — the smallest fix
- **How to validate** — how you confirm it worked

Severity is assigned by impact, and the skill is explicitly instructed to **omit subjective style preferences**.

---

## Design priorities

When principles conflict, the skill resolves them in this order:

1. **Task completion** — can the user understand what to do and finish?
2. **Clarity** — are hierarchy, grouping, states, and choices obvious?
3. **Efficiency** — is the common path short and responsive?
4. **Error resistance** — are destructive and invalid states handled safely?
5. **Accessibility** — keyboard, assistive tech, low vision, motion, zoom, small screens
6. **Consistency and familiarity** — platform conventions unless deviation earns it
7. **Aesthetics** — polish that reinforces hierarchy, never obscures function

Aesthetics sit last on purpose. **Aesthetics must not be used to excuse poor usability, and minimalism must not be used to hide required information.**

---

## Principles covered

<details>
<summary><strong>Click to expand the full catalog (40 principles)</strong></summary>

**Decision-making & cognitive effort**  
Hick's Law · Choice overload · Cognitive load · Working memory · Miller-style chunking · Chunking · Tesler's Law (conservation of complexity) · Occam-style simplicity · Complexity bias

**Familiarity, models & consistency**  
Jakob's Law · Mental models · Consistency · Paradox of the active user

**Target acquisition & interaction speed**  
Fitts's Law · Doherty Threshold (~400 ms) · Parkinson's Law

**Motivation, progress & memory**  
Goal-gradient effect · Zeigarnik effect · Peak-end rule · Serial position effect · Flow

**Attention & emphasis**  
Selective attention · Von Restorff / isolation effect · Aesthetic-usability effect · Cognitive bias

**Grouping & Gestalt structure**  
Proximity · Common region · Similarity · Uniform connectedness · Prägnanz · Closure · Continuity · Symmetry

**Composition & visual hierarchy**  
Rule of thirds · White space · Typography hierarchy · Contrast · Color theory

**Robustness & resilience**  
Postel-style robustness · Pareto principle

</details>

Each principle includes what it is, **when to use it**, and — importantly — **when not to**. Reference material is a source of hypotheses, not automatic rules.

---

## The 13-section review checklist

Used for audits and final implementation review:

| # | Area | # | Area |
|---|---|---|---|
| 1 | Primary task & information architecture | 8 | Accessibility |
| 2 | Decisions & cognitive load | 9 | Responsive / mobile behavior |
| 3 | Actions & controls | 10 | Onboarding & discoverability |
| 4 | Feedback & system state | 11 | Progress, completion & resumption |
| 5 | Forms & input | 12 | Error prevention & recovery |
| 6 | Visual hierarchy | 13 | Implementation quality |
| 7 | Consistency & familiarity | | |

Only relevant sections are applied — the skill does not force findings into categories that don't apply to your product.

---

## Contributing

Improvements are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the short version.

**Two things matter most:**

1. **Keep it behavioral, not aesthetic.** New guidance must change a decision someone can observe, not a preference someone can argue.
2. **Keep provenance honest.** See `skills/bizar-uiux/references/sources.md`.

---

## A note on the banner

The artwork in `assets/banner.svg` dogfoods the skill. It uses a clear typographic hierarchy, groups the capability chips by proximity, applies a rule-of-thirds grid at very low contrast, and isolates exactly one element with accent color and spacing — demonstrating that each principle in the catalog is load-bearing.

---

## License

[MIT](LICENSE) © 2026 DrB0rk

The skill is an original synthesis informed by [Laws of UX](https://lawsofux.com/) (Jon Yablonski) and [Laws of UI](https://www.uilaws.com/), plus standard interaction-design practice. No source prose, examples, illustrations, or branded assets are reproduced — see [`references/sources.md`](skills/bizar-uiux/references/sources.md) for the full provenance and licensing rationale.