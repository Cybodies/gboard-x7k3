# Changelog

All notable changes to woe-party. The `APP_VERSION` constant in `index.html` (shown in the
app footer) is a calendar version `YYYY.MM.DD`. Bump it whenever you ship a user-visible
change to `index.html`; add an entry here. Git history is the detailed record — this file
is the human-readable highlight reel.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]
- _nothing yet_

## [2026.05.30]
### Added
- **SDLC hardening (Phase 1):** versioned Firebase security rules
  (`database.rules.json` + `docs/firebase-rules-audit.md`), GitHub Actions CI running the
  test suite on push/PR, this changelog, a `RUNBOOK.md`, and a version stamp in the app
  footer.
- **Auction Request — event-day lock:** the ขอประมูล page now opens only on the current
  event day (อังคาร/พฤหัส = GL, อาทิตย์ = Overrun) and only for that day's event; no
  requesting a future event in advance.
- **Editable per-person rates:** admins can set จำนวนของที่ได้รับต่อคน per item for both
  GL and Overrun auctions (synced; feeds the auction-page chain numbering).
- **Test suite + QA tooling:** dependency-free Node test harness (`test/`,
  `node test/run.js`), `/woe-qa` pre-deploy skill, and `woe-qa-reviewer` agent.

### Notes
- Firebase rules in this release must be **deployed manually** (console paste or
  `firebase deploy --only database`) — see `docs/firebase-rules-audit.md`. The new
  `rates` write requires these rules (or equivalent) to be live.
