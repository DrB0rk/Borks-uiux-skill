# Component workbench

This development-only, responsive workbench imports the **actual** standalone source components in `skills/b0rks-uiux/assets/components/`. It is not a second implementation or an imposed design system.

```bash
npm install
npm run components:dev
# Open http://127.0.0.1:4173/playground/
npm run components:check
npm run components:build
npm run components:test
```

The local server watches TypeScript, recompiles on change and reloads the page. TypeScript and Playwright are development dependencies, never dependencies of copied components. Use Node 20+.

Use the gallery to test pointer and keyboard behavior, focus, DOM event payloads and native selection. The side inspector updates accessible labels and disabled states and lets you modify token values. Compare light/dark, density and narrow screen layouts. Test actual assistive technology separately.

To add another component, write **one independent `.ts` file** under `skills/b0rks-uiux/assets/components/`, import it from `playground/playground.ts`, add one instance and a visible state output to `playground/index.html`, then add contract documentation to `references/component-library.md` and an interaction test. Do not add runtime dependencies or a duplicate gallery-only implementation.

These examples are not form-associated custom elements. If FormData/validation is required, adapt to native light-DOM controls or implement ElementInternals and verify the form contract.

## Regression matrix

Playwright is configured for Chromium, Firefox and WebKit. Tests cover switch state and disabled behavior, native selection, keyboard-controlled segments, Escape and focus restoration, a disclosure, small-screen reflow, and forced-colors/reduced-motion smoke checks. Manual assistive-technology testing remains required for any production adaptation.
