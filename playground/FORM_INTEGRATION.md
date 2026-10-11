# Using reference components in forms

These examples are intentionally lightweight and their values **are not submitted** by default. Shadow DOM prevents an ancestor form from discovering nested native fields. Use a native `<select>`, `<input type=checkbox>`, or radio group when ordinary form semantics are sufficient.

For an adapted standalone control, `static formAssociated = true` and `this.attachInternals()` support `ElementInternals.setFormValue(...)`, but also require `formDisabledCallback`, `formResetCallback`, validity handling and browser tests. Do not add hidden inputs that silently drift from the visible control. A framework adapter should update its single source of truth from the composable `value-change` or `checked-change` event, then explicitly submit that value through its own form state.
