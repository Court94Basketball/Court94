# Court94 — Claude Code Project Instructions

## Product identity

**Product:** Court94  
**Website:** https://court94.com  
**Tagline:** The Modern Assistant Coach  
**Format:** Tablet-friendly basketball game-stat tracking web app / progressive web app (PWA); not currently an App Store app.  
**Audience:** Basketball coaches, especially assistant coaches tracking live games from the bench.  
**Brand direction:** Athletic blue and gold; straightforward, clean, quick to use.

Court94 was formerly called *Sideline IQ*. Do not treat these as two unrelated projects.

## Primary product goal

Make it practical for a coach to track useful basketball statistics **at game speed**, with minimal scrolling, tap count, cognitive load, and accidental input. Preserve the coach's attention on the game. Practical game-day usability is more important than adding elaborate features.

The owner is a coach and product designer, not a professional programmer. Explain proposed changes in accessible language and give simple test steps. Ask before making substantial design or architectural changes.

## Important: source code is the authority

This document summarizes product decisions and observed behavior from past planning and tests. It is **not a substitute for inspecting the repository**. Before editing, examine actual source files, project configuration, Git status, storage behavior, hosting/deployment configuration, and currently implemented features. Explicitly report discrepancies; do not silently assume the descriptions below are complete or technically accurate.

**First session: review only. Do not edit files, install packages, commit, push, deploy, or change hosting settings until instructed.**

## Existing user experience — verify implementation

- Users create and edit teams and rosters, then set up and track games.
- Team statistics have included offensive rebounds, defensive rebounds, turnovers, opponent offensive rebounds, transition points, forced turnovers, fouls, FGA/FGM/FG%, paint touches, plus/minus, free throws, and three-point attempts/makes/percentage. Available choices may vary by current build.
- Player statistics have included points (+1, +2, +3), assists, steals, blocks, turnovers, and offensive/defensive rebounds.
- Team and player tracking are available in the live game workflow with configurable stat cards.
- Game setup includes starters with a maximum of five starters enforced (verify).
- Live substitutions/current-five tracking has been heavily tested. SUB OUT and SUB IN, pending highlights, queueing multiple substitutions, and bench distinction have been explored and improved. **Preserve this workflow; audit what is actually present before changing it.**
- Live summary, game reports, and season reports exist or have been under development; verify exact capabilities and calculations.
- Past decisions included home navigation, back behavior, finish-game confirmation, newest-first ordering, and a live-tracker warning before exiting. Confirm current behavior.
- Intended editions: Demo (limited to three completed games) and Team Edition (full use). Verify licensing/limits before changing.

## Data reliability: top priority

A coach previously lost teams on an iPad after clearing browser history/site data. Assume persistent data protection is an unresolved product risk **until storage is verified in code**. Investigate whether the app uses localStorage, IndexedDB, another browser-based method, or a backend. Do not assert the mechanism without checking.

Never suggest clearing site data, cache, local storage, reinstalling the PWA, or running destructive migration/reset commands without warning that this could permanently remove teams and tracked games. Before any storage changes, propose a backup/export and recovery path, and explain migration risks. Avoid silently replacing existing data schemas.

## Engineering workflow and guardrails

1. **Inspect before editing.** Summarize the relevant code path, then propose the smallest safe change.
2. **One focused bug or feature per session/task.** Avoid large unsolicited refactors.
3. **Preserve existing features and recorded data.** Especially protect in-game stat entry, Undo, substitutions, live summaries, and reports.
4. **Confirm the Git working tree and branch.** Request a safety commit or branch before meaningful changes. Do not overwrite uncommitted work.
5. **Do not automatically commit, push, deploy, or change GitHub or hosting settings.** Ask for permission at each release step.
6. **Test both functional behavior and touchscreen interaction.** The primary device is an iPad/tablet; desktop-only testing is insufficient for game-speed changes.
7. **Reconcile linked stats and Undo carefully.** Any derived team/player totals must remain internally consistent after corrections.
8. **Keep performance simple and fast.** Avoid adding libraries, services, databases, or accounts without a reason and the owner's approval.
9. **Keep secrets out of source control.** Never request that API keys or passwords be pasted into repository files or chat.
10. **Explain what changed**, which files changed, how it was tested, remaining risks, and exact manual verification steps for the owner.

## Deployment and project infrastructure — verify, do not assume

- The project has used **VS Code**, **GitHub**, and web hosting for **court94.com**.
- Vercel and Netlify have both appeared in previous setup/deployment discussions. **Do not assume which provider currently serves the production domain. Inspect repository configuration and ask the owner to confirm DNS/hosting as necessary.**
- There has been a problem where a push did not appear on the live site, and a later **404** after the site was made private. Diagnose the current domain/deployment state separately; do not deploy blindly.
- Determine actual run/build commands by inspecting `package.json`, HTML/JS structure, CI configs, and host config. Do not invent commands.

## UX / product philosophy

- Live tracking should be readable, forgiving, and quick while watching basketball.
- Coaches should be able to track team events even when a specific player cannot be identified.
- Buttons must be sufficiently separated and resistant to accidental taps/zoom on iPad.
- Avoid unnecessary navigation, long forms, and excessive on-screen cards or scrolling.
- Preserve original starters and accurate current-five context while performing substitutions.
- Do not add speculative features just because they are technically feasible. A shot chart has been discussed but is **not an approved near-term priority**.

## How to collaborate with the owner

For any assigned task, respond in this order:

1. **What I found** in the current code (cite filenames/functions).
2. **Root cause / proposal** in plain English.
3. **Impact and risks** (especially saved data, stats, Undo, touch behavior).
4. **A narrowly scoped implementation plan**; ask approval if the change is consequential or ambiguous.
5. After implementation, provide a **short changelog and step-by-step test checklist**.

If a request conflicts with current code or the owner's intentions, ask rather than guessing.

## Related project document

Read `ROADMAP.md` for previously reported bugs and feature requests. Its items are **unverified reports, not proof of present-day defects**. Reproduce or inspect each issue before fixing it. The owner will choose the next priority.
