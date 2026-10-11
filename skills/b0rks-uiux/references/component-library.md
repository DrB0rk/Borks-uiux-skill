# Editable component examples

Agent reference assets in `../assets/components/` are **single-file, dependency-free TypeScript** examples, not a production design system. Inspect and prefer the target project's existing controls and tokens first. Copy only the relevant primitive, modify its source and test in the consuming framework.

| File | Purpose | API / user event |
|---|---|---|
| [switch.ts](../assets/components/switch.ts) | Binary toggle | `checked`, `disabled`, `label`; `checked-change {checked}` |
| [segmented-control.ts](../assets/components/segmented-control.ts) | Two–five exclusive values | `options: {value,label,disabled?}[]`, `value`, `label`; `value-change {value}` |
| [select.ts](../assets/components/select.ts) | Native dropdown selection | `options`, `value`, `label`, `placeholder`, `disabled`, `required`; `value-change {value}` |
| [dropdown-menu.ts](../assets/components/dropdown-menu.ts) | Commands, not value selection | `items: {id,label,disabled?,destructive?}[]`, `label`; `action {id}` |
| [disclosure.ts](../assets/components/disclosure.ts) | Optional content | `open`, `label`, slot; `open-change {open}` |

All examples use Shadow DOM. They expose `--b0x-accent`, `--b0x-fg`, `--b0x-border`, `--b0x-focus`, `--b0x-surface` and relevant `::part(...)` hooks. Change them to the actual app's tokens. Event payloads arrive as bubbling, composed `CustomEvent.detail`.

**Important:** These custom elements are not form-associated and do not submit or validate via `FormData` automatically. Use native light-DOM inputs or implement and test `ElementInternals` in form workflows. The command menu requires modern Popover API support. Product-side persistence, loading, error recovery, permissions and server truth are the consuming application's responsibility.

Example:

```ts
import './components/switch.js';
const el = document.querySelector('b0x-switch');
el?.addEventListener('checked-change', e => {
  const checked = (e as CustomEvent<{checked: boolean}>).detail.checked;
  // Save via actual application state; do not claim persistence before success.
});
```

Read [interaction-patterns.md](interaction-patterns.md) before adapting semantics, and [playground/README.md](../../../playground/README.md) for interactive preview and tests. Verify keyboard and pointer navigation, focus, disabled states, screen readers, responsive layout, reduced motion, contrast, and events in the adapted project. The examples are teaching references, not an excuse to inject generic styling.

## Workbench catalog metadata

The gallery consumes `playground/registry.ts`: a typed catalog of component file names, live event contracts, labels and expected keys. The component implementations remain standalone. Adding a new example requires one independent TypeScript file, a registry entry and a preview fixture. Do not copy the registry into consumer applications.

## Accessibility and form limitations

The Shadow DOM examples are reference controls and are **not** form-associated by default. Choose native form elements for production submissions or implement `ElementInternals` in the adapted control. Test Windows forced colors, reduced motion, keyboard focus return, RTL where relevant, text enlargement and screen-reader announcements. Never report component test coverage as full WCAG conformance. The workbench is for inspection, not accessibility certification.
