# Reed Banner — UI Design System (Home & Game Modes)

**Status:** specification and migration plan only · **Date:** 27/10/2026 · **Baseline:** `develop`

- [Game Mode UI/UX Specification](game-mode-ui-spec.md): design language, responsive/layout rules, screen-by-screen information architecture, interaction and visual wireframes; **Home V2 approved visual direction (section 14)**.
- [Implementation Roadmap](implementation-roadmap.md): tasks UI-00..UI-09, source impact, acceptance tests, art checklist and risks; **UI-02 Home V2 refined implementation gate (section 7)**.

## Scope

Home `MenuScene`; Tháp Thí Luyện; Tháp Vận Mệnh; Sinh tồn; Thử thách ngày; Đấu trường; limited navigation/style consistency for normal/practice. **Campaign is excluded from redesign** and acts as visual baseline. Global Game Header remains unchanged.

## Truth hierarchy

1. Server logic + current code in `src/core`, `src/server` and `src/app/game`.
2. [Live modes design](../design/09-che-do-choi.md).
3. [Product future directions](../game-modes/README.md), expressly tagged design-only.
4. Screenshot references supplied by project owner. Screenshots are evidence of current visual state, not specification of behavior.

These documents do not add new route, gameplay, reward, model, API, feature toggle or artwork file. Implement UI work in follow-up code PRs after UI-00 audit and owner review.

## Design principle

**Same game identity; different player decisions.** Campaign displays atlas/story; Trial focuses on rules/floor feasibility; Destiny on cycle/roster/resource attrition; Survival on wave-break rotation; Daily on fixed exam and ranking; Arena on asynchronous challenge snapshots. Avoid copying Campaign's three-column map layout to every mode.
