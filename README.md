# The Ledger — To‑Do List App

A vanilla HTML/CSS/JavaScript to‑do list, styled like a ledger/journal page.
No frameworks or build step required.

## Files
- `index.html` — structure/markup
- `style.css` — ledger-inspired visual design
- `script.js` — all app logic (state, events, validation, Local Storage)

## Run it
Just open `index.html` in a browser, or serve the folder locally, e.g.:
```
npx serve .
```

## How it meets the brief
- **Create**: the form at the top adds a task instantly via JS, no page reload; input clears after a successful add.
- **Validation**: empty/whitespace-only input is rejected with an inline error message (red underline + text), handled entirely in `script.js`.
- **Read/View**: all tasks render from a single `tasks` array (the source of truth) into the `<ul>`; the list re-renders on every change.
- **Update**: clicking the round check button toggles `done` on a task, which flips its visual style (strikethrough) and persists.
- **Delete**: the × button removes a single task immediately from state, DOM, and storage.
- **Delete All**: the footer button clears every task, showing a ~2s simulated loading state (via `setTimeout` wrapped in a `Promise`, awaited with `async/await`) before clearing.
- **Persistence**: all task data is saved to `localStorage` under the key `ledger.tasks.v1` and reloaded on page load, including completed state.
- **State management**: `tasks` is the single in-memory source of truth. Every operation (add/toggle/delete/clear) mutates `tasks`, then calls `saveTasks()` and `renderTasks()` — the DOM is never edited ad hoc, it's always derived from state.

## Submission checklist (per exam instructions)
1. Branch your existing GitHub repo: `git checkout -b Prelim-Exam`
2. Copy these three files into the project.
3. Commit and push the branch.
4. Submit the repository link.
