# CLAUDE.md — WOE Party Organizer

Project memory for Claude Code. Focus: **coding and editing the WoE party
tool**. Anything not related to that is out of scope.

## What this project is

Single-file HTML web app for a Ragnarok Online guild ("ROO Party"). Organizes
War of Emperium (WoE) parties and the post-WoE loot auction. Thai-language UI,
served as a static page (e.g. GitHub Pages).

**Everything ships from `index.html`** — one ~6,300-line file containing
HTML, CSS, and vanilla JS. No build step, no bundler, no framework. Plus
three PNGs in `maps/` (main, sub, overrun) embedded as backgrounds.

## Repo layout

```
index.html                    Single-file app — all UI + logic + styles
maps/main.png                 Main battlefield map
maps/sub.png                  Sub battlefield map
maps/overrun.png              Overrun-mode map
README.md                     Public-facing summary (keep accurate)
.claude/
  skills/woe-edit/SKILL.md    Editing playbook for this codebase
  agents/woe-coder.md         Subagent for focused coding tasks
knowledge.md                  Deeper architecture / data model reference
```

## Stack

- **Vanilla JS** — no framework. Global `state` object. `render()` is the
  top-level redraw.
- **Firebase compat SDK v10.7.1** (loaded via `<script>` tag from gstatic):
  - Auth — anonymous by default; Google sign-in for admins
  - Realtime Database — single source of truth for shared state
  - Storage — map background images
- **localStorage** — local cache (`roo_party_v2`) and saved-team snapshot
  (`roo_party_team_v1`). Firebase is authoritative when signed in.

## Key constants (top of script block)

| Constant | Value | Where |
|---|---|---|
| `STORAGE_KEY` | `"roo_party_v2"` | `index.html:2311` |
| `PARTIES` | `16` | `index.html:2344` |
| `PARTY_SLOTS` | `5` | `index.html:2343` |
| `TEAM_SAVE_KEY` | `"roo_party_team_v1"` | `index.html:6220` |
| `FIREBASE_CONFIG` | project `woe-party` | `index.html:4374` |
| `ADMIN_EMAILS` | hardcoded allowlist | `index.html:4387` |

To add an admin: append the email (lowercased) to `ADMIN_EMAILS` and redeploy,
**or** add `/config/admins/{email-with-dots-as-underscores}: true` at runtime
via Firebase Console (the runtime path is also honored by `isAdmin()`'s
extension hook if present).

## Pages / modes

`state.mode` is one of:

- `league` — 16 parties × 5 slots over main + sub maps (drag-drop)
- `overrun` — 4 big parties × 4 sub-parties on the overrun map
- `roster` — member table (name, job, CP, Discord) synced to `/members`
- `summary` — job counts vs. targets
- `auction-gl` — post-WoE loot split (League mode), 70/30 main/sub field
- `auction-overrun` — per-column drag-drop auction with page numbering
- `leave` — scheduled-leave registration, auto-resets weekly (Mon 00:00 BKK)

Legacy modes `dimension` and `glsummary` redirect to `league` at load time
(`index.html:6258-6259`). Don't reintroduce them.

## Firebase data model

| Path | Purpose |
|---|---|
| `/members` | Roster (id, name, job, cp, discord) |
| `/parties/league` | 16 parties × 5 slots |
| `/parties/overrun` | Overrun layout |
| `/auction_gl` | League auction state |
| `/auction_overrun` | Overrun auction state |
| `/job_targets` | Per-job target counts |
| `/markers` | League map markers |
| `/overrun_markers` | Overrun map markers |
| `/leaves` | Scheduled leaves per memberId |
| `/system` | `lastDailyReset`, `lastWeeklyReset` (BKK ISO dates) |

All `_fbDB.ref(...)` writes are gated by `isAdmin()`. Reads are open via
anonymous auth. Every realtime listener sets `_fbApplyingRemote = true` while
applying snapshots so re-pushes don't loop.

## Auth model

- First load: anonymous sign-in (`_fbAuth.signInAnonymously()`).
- Google sign-in via popup → if email is in `ADMIN_EMAILS`, user is admin.
- `isAdmin()` (`index.html:4185`) gates: all DB writes, name/job/Discord edits,
  marker drag, repair buttons, map-image upload, etc.
- Non-admins are tagged `viewer-mode` on `<body>` — CSS disables edit UI.

## Timezone

All "today" / "00:00" semantics are **Asia/Bangkok (UTC+7)**. Helpers:

- `bkkNow()`, `todayBkkISO()`, `bkkDow(iso)`, `isEventDay(iso)`,
  `thisMondayISO()` — all near `index.html:2382-2415`.

Don't use raw `new Date()` for date boundaries — use these helpers.

## How to make code changes

1. **Always read the surrounding section first**. `index.html` is one big
   file; jumping in blind breaks adjacent features.
2. **Find by line range**, not by re-reading 6300 lines. Use grep to locate,
   Read with `offset`+`limit`.
3. **CSS, HTML, and JS are all in `index.html`**. Style edits go in the
   `<style>` block (top), markup in the `<body>`, logic in the `<script>`
   tag at the bottom.
4. **Match the existing style** — 2-space indent, double quotes, no semicolon
   omissions, Thai strings inline.
5. **Don't introduce a build step or framework**. The single-file constraint
   is intentional (deploy = copy `index.html`).
6. **Don't commit secrets**. Firebase config is a public web key — fine to
   commit; **never** commit a service-account JSON or admin SDK key.
7. After editing logic, mentally walk through: anonymous viewer load,
   admin sign-in, mode switch, drag-drop, page reload.
8. **Verify in a browser when possible** — type-checks don't catch UI
   regressions. If you can't open a browser, say so explicitly.

## Conventions

- Modes/pages: add to the union in the `state.mode` comment
  (`index.html:2357`), the toggle UI (`updateModeToggleUI`), and the
  `render()` dispatch.
- New Firebase path: add a listener in `subscribeFirebase` and a writer
  gated by `isAdmin()`. Wrap writes in the `_fbApplyingRemote` guard.
- New persistent field: extend `state`, include in `save()`/`load()`,
  add Firebase sync. Legacy migrations live near `index.html:6256-6298`.
- Thai UI text is fine inline. Don't introduce an i18n layer for a single
  locale.
- No emojis in code comments / docs unless they're already in user-facing
  toasts.

## Verifying changes

There is no test suite. To verify:

1. Open `index.html` directly in a browser (file://) — works without
   Firebase for the layout, but auth/sync will warn in console.
2. Or serve over localhost so Firebase auth/popup works:
   `python3 -m http.server 8000`, then visit `http://localhost:8000/`.
3. Sign in with the admin Google account to exercise write paths.
4. Mobile layout: DevTools responsive mode, check ≤700px and ≤480px
   breakpoints (defined in the CSS).

## Out of scope

- Adding a build pipeline / TypeScript / framework
- Changing the deployment model (it's a static single-file app)
- Adding analytics, telemetry, or external trackers
- Public-facing features for non-guild users
