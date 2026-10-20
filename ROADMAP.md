# Court94 — Development Roadmap and Known Reports

**Status of this document:** Historic reports and requests from development conversations and game testing through October 2026. These are **not verified against the current code**. Before changing anything, inspect the actual repository, reproduce the issue, and confirm priority with the owner. Work on **one task at a time**.

## First: safety, inspection, and deployment diagnosis

- [ ] **Read-only project audit.** Identify source files, entry points, dependencies, local/dev run method, Git state, storage mechanism, and deployment configuration. Do not edit in the initial review.
- [x] **Protect saved teams and games.** Investigate persistence and design a safe backup/export-and-restore strategy. Clearing iPad browser history/site data previously caused teams to disappear. Confirm exactly where and how state is stored before any migration.
  - **Completed October 2026:** Backup & Restore released in Settings (`backup.js`). Coaches can download a backup of teams, rosters, completed games, and the game in progress, and restore it with validation, duplicate prevention, conflict choices, and a required safety backup. Tested on Windows and iPad (Safari, Private Browsing, Home Screen shortcut). Data is still stored only on each device; cloud accounts/sync remain future work.
- [ ] **Verify public site / 404 issue.** On October 15, 2026, court94.com was showing 404 after a privacy setting had been changed. Determine current hosting/domain/public-access status; do not assume it's still broken.
- [ ] **Verify deployed version.** Earlier pushes sometimes failed to show recent changes (including SUB IN/SUB OUT UI). Compare actual Git commit, build, and live site before assuming source changes are deployed.

## Bugs from full-game testing — prioritize after audit

- [ ] **Live Summary: player offensive rebounds missing.** Player O-rebound actions were recorded on player cards, but the live Summary did not display them during the second full-game test. Check column selection, calculation, rendering, and whether historical game data is affected.
- [ ] **Double-tap zoom during live tracking on iPad.** Accidental zoom persisted even after adding `touch-action: manipulation` to player point/stat button selectors. Investigate real iPad Safari/PWA behavior rather than relying only on desktop emulation. Do not disable accessibility zoom globally without discussion.
- [ ] **Team Turnovers missing in team setup/edit.** Team Turnovers was not appearing as an available selectable stat when building/editing a team, despite being part of the intended stat set.
- [ ] **Editing Game Setup during an in-progress game.** Adding a player stat in Game Setup did not show the new card after choosing Continue Game; the workaround had been returning Home and editing the team. Recheck state hydration and active game configurations.

## Features / workflow refinements — require specification first

- [ ] **Link player offensive and defensive rebounds to team totals.** Player rebounds should contribute to corresponding team counts; retain independent team rebound buttons for events where the player is unknown. Undo must avoid mismatches/double counts. Define semantics for manually entered team-only actions.
- [ ] **Running score / points total on live tracker.** Show the in-game total without adding clutter. Decide whether team points derive solely from player +1/+2/+3 or have an independent input path.
- [ ] **Save and resume unfinished games.** Store full in-progress game state and resume it exactly, including lineup, stats, substitutions, pending substitutions, and settings. Distinguish In Progress from Past Games; define safe failure/recovery behavior.
- [ ] **Link team 3PT events to overall team FG totals.** A 3PT make should contribute a team FGA and FGM; a 3PT miss should contribute an FGA. Undo must reverse all linked increments exactly once. Validate whether current build already does this.
- [ ] **Consider linking player +1 scoring to team free throws.** Define whether +1 always represents made FT and how missed attempts are entered before implementing.
- [ ] **Substitution workflow regression coverage.** Tests for SUB OUT/IN in either order, pending highlights, queueing multiple substitutions, first-in/first-out pairing, unmatched pending players, original starters, bench divider, and stats usability while swaps are pending. This area has been reported to work very well; avoid gratuitous redesign.

## Future exploration — not approved immediate work

- [ ] **Shot chart.** Suggested by an external coach as a potential differentiator; owner is open to longer-term exploration but has not prioritized building it now.
- [ ] **Season/stat reporting refinements.** Confirm actual season totals and calculations before proposing expansion.
- [ ] **Player season stats: show per-game averages by default.** Player season statistics should primarily display per-game averages rather than cumulative totals. Lower priority — after the backup and restore system. Eventually consider a toggle between averages and totals. Before building, verify how "games played" is counted (the current report may count games a player did not play in).
- [ ] **Demo vs Team Edition behavior.** Audit whether the intended three-completed-game demo limit is implemented and reliable. Avoid changing plans or pricing without approval.

## Suggested order for the first paid Claude Code session

1. Inspect the project in **read-only mode** and report architecture, Git/deployment state, data storage, and testing approach.
2. Agree on safe Git backup/branch and a data-preservation plan.
3. Resolve any current production accessibility issue **only if it still exists**.
4. Select **one** bug from the full-game test list; diagnose, implement narrowly, test, then ask before commit/push/deploy.

## Acceptance criteria for every fix

- Existing teams/games remain intact and readable.
- Relevant team and player stats and Undo stay consistent.
- Substitutions and current-five tracking still work.
- Touchscreen use is tested or clearly flagged for owner testing on a real iPad.
- Owner gets an understandable summary and specific tests.
- No automatic release or deployment without owner approval.
