# Interaction patterns and component contracts

Use this when implementing or reviewing a concrete control. Prefer native HTML and established platform/design-system components. For genuinely custom composites, use the W3C [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/) and test the complete keyboard/focus pattern. ARIA attributes alone do not implement behaviour.

## Choose the simplest correct primitive

| Need | Preferred primitive | Avoid |
|---|---|---|
| Perform an action | `<button type="button">` (or `type="submit"` in a form) | Clickable `div`, link with `href="#"` |
| Navigate to content | `<a href="...">` | Button that changes URL without navigation semantics |
| Choose one of few mutually exclusive values | Radio group / segmented control | Unlabeled toggle buttons |
| Choose from established values | Native `select` when sufficient | Custom combobox by default |
| Reveal optional detail | `<details>` or accessible disclosure | Hover-only reveal |
| Present noninteractive data | `<table>` with headers | ARIA `grid` without interactive navigation |
| Filter/select many records | Appropriate list, search or combobox | Endless dropdown without search |
| Select an action from a compact action list | Menu button with APG keyboard behaviour | Arbitrary popover with fake menu roles |
| Confirm high-risk action | Clear dialog with safe focus and consequence | Generic "Are you sure?" without target |

## Buttons and action surfaces

- Provide accessible name matching visible label. Use a real hit area independent of icon size.
- Represent pending state without repeatedly firing the action; provide visible progress and status when meaningful.
- If disabled, convey why when necessary; do not hide unavailable operations without considering discoverability.
- Destructive controls need clear verbs, resource identity and separation from common actions.
- Do not place nested buttons or links inside clickable cards. Make navigation targets individually clear.

## Dialogs and sheets

- Use native `<dialog>` with appropriate modal APIs or a thoroughly tested library where practical.
- Move focus into the dialog and maintain a modal focus boundary; restore to its logical origin after close or to a sensible successor if origin disappears.
- Label with a meaningful title. Keep the close action discoverable and support Escape unless a genuine critical workflow requires otherwise.
- If the task is extensive or content-heavy, use a page rather than compressing an entire workflow into a modal.
- Position destructive-action default focus conservatively. Avoid accidental Enter-to-delete.
- For mobile sheets, test screen readers, on-screen keyboard and orientation rather than assuming the visual style is enough.
- Reference: [W3C APG dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## Comboboxes, command palettes, menus and popovers

- A combobox has nuanced focus and arrow-key expectations; follow the corresponding APG subtype. Preserve standard text-editing shortcuts, IME composition and Escape behaviour.
- Prefer an ordinary select when native filtering and styling are adequate.
- Menu semantics are for **commands**, not arbitrary navigation links or a form containing inputs. Use a disclosure or navigation list when that matches the content.
- Ensure visible open/closed state, placement, keyboard control, active-option announcement, selection, and click-outside dismissal where appropriate.
- Search results require a clear "no matches" state and a way to recover.
- Reference: [combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) and [menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/).

## Tabs, tables, grids and trees

- Use tabs for alternate peer views of the **same context**. Do not use them as unrelated site navigation.
- For custom tabs, implement the APG relationships, focus, arrow keys and activation mode; choose automatic activation only when content appears without noticeable latency.
- Use semantic tables for read-only data, headings and row/column relationships. Add sorting control to the table header with clear sort state.
- An ARIA grid is an application-like composite with a managed focus model; it is not simply a prettier table.
- In virtualised tables, preserve selection and focus identity when rows mount/unmount. Provide accessible row counts and loading feedback.
- For a hierarchical tree, ensure expand/collapse, keyboard navigation, names and level information match APG.
- Reference: [tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) and [tree](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/).

## Forms and validation

1. Use persistent visible labels, programmatic names, suitable autocomplete and inputmode.
2. Put constraints and format guidance before submission where helpful; never rely exclusively on placeholders.
3. Preserve the user's entered values after errors; identify problematic fields and offer exact corrective actions.
4. Connect hints and errors to inputs. For longer forms, offer a linked top-of-form error summary and deliberate focus management.
5. Avoid needless confirmation/retyping. Use sensible defaults and support password-manager paste and one-time-code autofill.
6. Keep validation rules consistent client/server; do not claim success before the authoritative response.

The [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/) is a useful **service-design pattern**, not a universal WCAG mandate for every one-field form. Choose proportional feedback.

## Async operations, notifications and background work

- Represent explicit states: idle -> queued/pending -> partial/success/failure/cancelled; ensure each state is labelled unambiguously.
- Status notification must not be the sole place critical information exists. Provide persistent task history for long-running work.
- Avoid flooding live regions with every token, progress percentage or transient micro-update.
- Announce consequential state changes once, concisely; allow dismissal or pausing where required.
- A skeleton is justified only when layout/placeholders meaningfully represent expected content. Do not mask chronic slowness with animation.
- Empty, zero-results, unavailable, denied and offline are different causes and require different recovery paths.

## Dragging, gestures, motion and hover

- When dragging is required for functionality, provide a single-pointer alternative that does not require dragging (WCAG 2.5.7, Level AA, subject to exceptions); keyboard access remains separately required.
- Never rely on swipe, hover or long press as the **only** way to discover or execute essential actions.
- Tooltip content must also be available on focus; complex actionable overlays are not tooltips. W3C APG tooltip guidance remains work in progress, so prefer supported library patterns and test carefully.
- Honor `prefers-reduced-motion` and avoid transforming frequent controls for cosmetic reasons.

## Agent/chat and developer-tool interfaces

These controls deserve a specific contract because they mix high-frequency input with expensive or dangerous operations.

- Keep the chat composer an integrated input surface: text entry, attachment state, send/stop, and model/effort/permission controls must retain separate semantic names and independent focus targets.
- Expose model, effort and permission *before invocation*. A settings popover must clearly distinguish saved defaults from per-run overrides; label consequences such as cost, latency or capability only when backed by actual data.
- Disabled Send and enabled Stop are mutually meaningful states; never show both as equally active primary actions.
- Treat a tool call as a traceable operation: queued, running, succeeded, failed, awaiting approval, cancelled. Do not claim work is completed because text was streamed.
- For shell commands, file edits, network actions, secret exposure or permissions, display the proposed scope and require appropriate approval before dangerous execution.
- Preserve composer drafts and context when switching model or background job. Show host/project/directory when sessions could otherwise be confused.
- Render streamed responses without stealing focus, generating excessive live-region announcements or destabilising scroll position.
- Put background tasks in persistent, inspectable affordances, with cancellation and a clear relationship to the active conversation.
- A permission-denied or disconnected host state must not look like an empty response.

## Anti-pattern review

- Decorative pseudo-controls that do not operate.
- Disabled buttons with no explanation for an expected action.
- Confirmation for every harmless edit, yet none for deleting many records.
- Entire cards clickable with hidden internal action conflicts.
- Modal wizard stacked inside a second modal.
- Infinite scroll without an alternate recovery/navigation route for the use case.
- Toast-only errors that disappear before the user can correct them.
- Using a tooltip for required instructions on touch devices.
- Treating a CSS focus ring as proof of a fully accessible custom widget.

Choose patterns for task semantics, not familiarity with a particular UI library.
