# Survival Defense V1.1 — Final Acceptance

**Ngày nghiệm thu:** 2026-10-23  
**Kết luận kỹ thuật:** PASS cho implementation và automated checks đã chạy.  
**Kết luận phát hành:** **ADJUST — chưa sign-off phát hành cuối cùng** do balance sample chưa đạt ngưỡng thiết kế và chưa có browser E2E / xác minh database production.

## 1. Executive Summary

Survival V1.1 hỗ trợ roster tối đa năm fighter với đúng ba active trong BattleState và tối đa hai reserve được lưu theo fighter ID. Đinh Bộ Lĩnh luôn là active leader. Người chơi chọn roster trước run; tại BREAK sau khi thắng có thể đổi companion, đổi nghề/nguyên tố leader, chọn revive bằng lương hoặc dừng. Server xác thực state/sequence, tính recovery và settlement một lần rồi bắt đầu wave kế; save/resume tiếp tục dùng Match persistence hiện có, không thêm schema database.

Nghiệm thu trên worktree hiện tại đạt TypeScript, lint, build production và toàn bộ 413 automated tests. Full suite bao gồm core/unit, server integration/persistence và regression modes. Không có E2E browser hoặc test trên Neon/Postgres thật; kết quả mô phỏng hoàn tất nhưng chưa đủ 200 paired seeds/cấp/treatment. Vì vậy không tuyên bố GO cuối cùng.

**Final status: ADJUST.** Có thể tiếp tục QA/staging, giữ luật production hiện tại 10% hồi reserve; chỉ quyết định phát hành sau khi hoàn tất các điều kiện balance và môi trường còn thiếu. Không có lỗi blocker hoặc nguy cơ mất dữ liệu đã biết trong các kiểm thử chạy.

## 2. Scope Delivered

- Roster snapshot 3 active + 0–2 reserve; fighter config/progression/gear bị khóa theo run.
- Fighter runtime theo ID ổn định, ánh xạ ba active vào BattleState; reserve không tham gia combat.
- BREAK transition server-authoritative, có recovery, tiếp tế, revive, rotation/build và khởi tạo wave kế.
- Rotation một/hai companion, gồm fighter sống hoặc gục chuyển xuống reserve; reserve được chọn vào active phải sống.
- Đổi nghề/nguyên tố Đinh Bộ Lĩnh trong phạm vi Survival, tính lại stats/skills bằng builder hiện hành, không sửa Profile gốc.
- UI chọn roster trước run và UI BREAK preview/confirm.
- Sequence/CAS, adapter saved match cũ, resume/retry handling và kiểm thử duplicate/concurrent request.
- Simulation-only V1.1 harness và báo cáo balance; không thay logic production.
- Không commit, push, merge hoặc deploy.

## 3. Architecture Changes

- `SurvivalRun.stateVersion: 2` lưu roster snapshot, active/reserve IDs, fighter location/runtime, downed/revive markers và marker settlement. Active HP/energy vẫn lấy từ BattleState; reserve runtime nằm trong roster.
- `Side.fighters` vẫn là ba active combatants. Không có reserve trong turn order, target list hoặc battle effects.
- `recoverSurvivalRoster` settle active +20% và reserve +10% theo vai trò trong wave vừa kết thúc; fighter gục không được hồi. `planBreak` cộng 25 lương, xử lý tối đa một auto/paid revive sau tiếp tế.
- `coordinateSurvivalRoundTransition` xác thực BREAK và action, dựng transition đầy đủ rồi tăng Match sequence; persistence compare-and-swap ngăn stale/concurrent request commit hai lần. `settledThroughWave` là lớp chặn double recovery bổ sung.
- `beginWave` giữ board, board RNG và Nộ; reset spirit, effects, turn markers theo luật hiện tại; giữ energy trừ fighter vừa revive.
- Match JSONB shape không yêu cầu migration. Adapter hỗ trợ saved match cũ; Survival run được dựng từ Profile đã lưu, và nghề/hệ trong run không ghi ngược vào Profile.

## 4. Gameplay Changes

Các tỷ lệ/luật production hiện hành được kiểm tra trong [survival.ts](../../../src/core/survival/survival.ts):

- Roster tổng 3–5 fighter; đúng 3 active slots trong battle; Đinh Bộ Lĩnh cố định active slot 0/leader.
- Không đổi fighter trong FIGHTING. Ở BREAK, có thể thay một hoặc hai active companion sống/gục bằng reserve sống; state, HP, energy và `downedAtWave` đi theo ID. Nếu active gục mà còn reserve sống, fighter gục phải rời active; không có reserve sống thì slot gục được giữ.
- Active còn sống hồi 20% max HP; reserve còn sống hồi 10% max HP theo vai trò wave vừa thắng. HP bị cap max; gục không hồi. Recovery được settle một lần trước rotation.
- Lương tăng 25, cap 100, trước khi xét paid revive. Hồi sinh trả 40 lương khi hợp lệ; auto-revive được ưu tiên, tối đa một fighter mỗi break. Fighter revive có 30% HP và 0 energy; reserve revive vẫn ở reserve.
- Auto-revive dùng lịch gục theo ID; fighter gục ở wave 3 đủ điều kiện sau khi thắng wave 4 để vào wave 5. Không trả paid revive đồng thời nếu có auto-revive đến hạn.
- Leader được đổi nghề/nguyên tố tại preparation hoặc BREAK. Build mới giữ ID/cấp, dùng stat/gear/skill builders và skill unlock theo progression; HP ratio chuẩn hóa, HP 0 không tự hồi sinh. Energy, rage và Profile không được cấp/chỉnh bởi preview.
- Spirit reset theo battle rules khi wave mới bắt đầu; energy của fighter không revive và rage giữ nguyên. Board và RNG state được bảo toàn.
- Thua khi cả ba active bị hạ; reserve còn sống không tự vào trận và không cứu run. Người chơi có thể dừng ở BREAK. Bỏ dở quá 24h giữ luật chốt điểm cũ.

Tỷ lệ reserve heal 10% là **giá trị implementation hiện tại**. Báo cáo simulation Task 23 chưa đủ mẫu để xác nhận cân bằng hoặc đề nghị đổi.

## 5. Acceptance Checklist

| Criterion | Status | Evidence / note |
|---|---|---|
| Roster tối đa 5 fighter; 3 active + tối đa 2 reserve | PASS | Core roster validation and preparation UI tests. |
| BattleState có đúng 3 active; Đinh Bộ Lĩnh luôn leader | PASS | `survivalActiveSideConfig`, lineup validation and battle integration tests. |
| Không đổi tướng trong round; đổi được ở BREAK sau thắng | PASS | Domain phase validation and server action tests. |
| Có thể thay active fighter gục bằng reserve sống; giữ state theo ID | PASS | Rotation, downed preservation and next-wave integration tests. |
| Active hồi 20%; reserve hồi 10% theo role của wave trước | PASS | Core recovery tests; reserve 10% is current implementation value. |
| Không double healing / food / revive | PASS | `settledThroughWave`, Match sequence/CAS and duplicate transition tests. |
| Auto-revive và paid revive đúng hạn/chi phí/HP | PASS | Core and server integration tests; one revive maximum per break. |
| Lương +25, cap 100; không bị cộng lại khi retry | PASS | Transition and persistence tests. |
| Tinh thần/energy/rage/board theo luật wave transition | PASS | `beginWave` and multi-wave integration tests. |
| Đinh Bộ Lĩnh đổi nghề và nguyên tố | PASS | BREAK build proposal/apply tests and next-wave integration. |
| HP ratio hợp lệ; HP 0 không tự hồi sinh | PASS | Repeated build/round-trip and downed-leader tests. |
| Skills đổi đúng theo nghề/hệ, cấp unlock; không cấp skill point | PASS | Loadout/progression tests and successful cast after reload. |
| Profile gốc không đổi từ preview/build Survival | PASS | Pure domain tests verify snapshot-only build changes. |
| Save/resume và old saved match compatibility | PASS for automated local coverage | DB adapter and resume tests; no live production DB test. |
| Server validation / unauthorized access / stale sequence | PASS | Battle route, ownership and CAS integration tests. |
| Regression Campaign/Tower/Arena/Profile/Battle | PASS | Full 413-test suite. |
| Browser E2E and responsive validation | PENDING | No configured browser E2E runner in repository. |
| Balance simulation report exists | PASS | [23-balance-report.md](./23-balance-report.md); sample sufficiency remains ADJUST. |

## 6. UI/UX Changes

- Preparation UI trình bày đội phòng thủ, doanh trại, fighter sở hữu và validation roster.
- BREAK UI trình bày wave vừa thắng/kế tiếp, cảnh báo boss, quân lực, HP/energy, revive/food và recovery từ server state.
- Tactical preview cho phép chỉnh lineup/build tạm, hoàn tác, xem preview và xác nhận; preview không trực tiếp mutate Match.
- Server response là nguồn sự thật sau confirm; loading, invalid choice, stale request và error state được xử lý.
- Automated component/pure-function/service tests pass. Responsive layout và real browser interactions chưa được xác nhận bằng browser E2E.

## 7. API & Security

- API kiểm tra authentication, owner/match access, phase, locked roster ownership/IDs, active count, leader identity, duplicate IDs, downed selection, profession/element và food eligibility.
- Client không được gửi HP/ATK/DEF/energy để server dùng; payload schema từ chối stat injection.
- Endpoint tạo Survival chỉ đọc Profile và snapshot build hiện có; không ghi nghề/nguyên tố từ payload của client vào Profile. Nghề/hệ đổi trong run chỉ được lưu trong SurvivalRun.
- Next-wave action gộp revive, lineup và leader choice; transition được tính ở server và commit theo sequence/CAS. Retry với response mất hoặc hai tab cùng gửi không settlement hai lần.
- Seed không được đưa vào client view. Không thay API semantics cho Campaign/Tower/Arena; regression suite được chạy trong full test.
- Test coverage gồm route auth/owner, invalid roster/build/revive, stale sequence, duplicate/concurrent request, save/resume và retry cases.

## 8. Files Changed

Worktree còn chứa thay đổi chưa commit từ task series 01–23; các path dưới đây là phạm vi implementation, test và tài liệu hiện có, không phải toàn bộ đều phát sinh riêng ở Task 24.

| Area | Files |
|---|---|
| Survival domain, battle, match coordinator | [survival.ts](../../../src/core/survival/survival.ts), [battle.ts](../../../src/core/battle/battle.ts), [match.ts](../../../src/core/match/match.ts) |
| Server API / persistence | [battles.ts](../../../src/server/battles.ts), [store.ts](../../../src/server/db/store.ts) |
| Game UI | [DemoGame.tsx](../../../src/app/game/battle/DemoGame.tsx), [online.ts](../../../src/app/game/battle/online.ts), [SurvivalScreen.tsx](../../../src/app/game/survival/SurvivalScreen.tsx), `src/app/game/survival/SurvivalBreakScreen.tsx`, `roster-selection.ts`, `tactical-preview.ts` |
| Simulation | [survival.ts](../../../src/core/sim/survival.ts), `src/core/sim/survival-v11.ts`, `scripts/survival-v11-balance.ts` |
| Tests | `tests/core/survival/survival.test.ts`, `tests/server/battles.test.ts`, `tests/server/db.test.ts`, `tests/server/battle-routes.test.ts`, `tests/game/survival-break.test.ts`, `tests/game/survival-roster-selection.test.ts`, `tests/game/survival-tactical-preview.test.ts` |
| Documentation | [09-che-do-choi.md](../README.md), [01-current-state-audit.md](./01-current-state-audit.md), [02-rules-state-machine.md](./02-rules-state-machine.md), [03-data-architecture.md](./03-data-architecture.md), [22-qa-report.md](./22-qa-report.md), [23-balance-report.md](./23-balance-report.md), this report |

Task 24 found and fixed a Profile isolation gap in Survival creation: the server had persisted profession/element values from the request payload. Creation now loads the stored Profile read-only and snapshots that build; a regression test verifies that a crafted request cannot change the Profile or override the run snapshot. Task 24 also corrected the simulation-only recovery-rate override so a treatment uses the role/runtime from the wave just completed; this does not affect production combat. Documentation updates aligned the current rules in `docs/design/09-che-do-choi.md` and earlier state-machine/data-architecture notes, and added this report.

## 9. Test Results

Commands run during this acceptance:

| Command | Result |
|---|---|
| `pnpm test` | **PASS** — 413 tests, 90 suites, 0 failed, 0 skipped. Includes Survival core, battle/match, server routes, persistence, UI logic and Campaign/Tower/Arena/Profile regressions. |
| `pnpm lint` | **PASS** — repository ESLint. |
| `pnpm typecheck` | **PASS** — `tsc --noEmit`. |
| `pnpm build` | **PASS** — Next.js production build; migration skipped because `DATABASE_URL` is not configured. |
| `node --import tsx --test tests/core/survival/survival.test.ts` | **PASS** — 27 tests, run while validating Task 23 harness. |
| `pnpm exec eslint src/core/sim/survival-v11.ts scripts/survival-v11-balance.ts` | **PASS**. |
| `git diff --check` | **PASS**. |
| `pnpm exec tsx scripts/survival-v11-balance.ts --seeds 1 --levels 5 --maxWaves 10 --category reserve ...` | **PASS** — 5 reserve rates smoke-tested after final harness correction. |

The 413-test full suite includes integration coverage for simultaneous/stale next-wave requests, lost-response retry, BREAK/FIGHTING resume, all-active-down with live reserves, reward/persistence behavior, Profile isolation at Survival creation, and mode regressions. See [22-qa-report.md](./22-qa-report.md) for the detailed matrix.

**Not run:** browser E2E, real Postgres/Neon migration or production-DB verification. Repository has no configured Playwright/Cypress E2E command; build skipped migrations without `DATABASE_URL`.

## 10. Balance Simulation Summary

See [23-balance-report.md](./23-balance-report.md).

- 432 final analysis runs: 200 reserve-heal samples (10 seeds/cấp/treatment), 192 rotation/leader samples (3 seeds/cấp/policy), and 40 additional no-reserve controls.
- 556 successful executions including harness validation and 24 replacement samples; one early pilot stopped on a policy bug and is excluded.
- Paired reserve-heal differences vs 10% have 95% intervals containing zero; no evidence supports changing current 10%.
- Small sample, especially n=3/cấp for strategies, prevents balance sign-off. Keep 10% in production as currently implemented, not as a statistically approved optimum.

## 11. Known Issues

1. Balance study is underpowered relative to requested 200 seeds/cấp/treatment; effects of reserve healing and tactical policies remain uncertain.
2. No automated browser E2E confirms actual desktop/mobile interactions or responsive behavior.
3. No test against production-compatible Postgres/Neon or live migration environment; persistence was verified in automated local tests (including PGlite per Task 22 report).
4. Existing design docs include historical baseline estimates whose original simulator snapshot/hash is unknown; they are marked as historical rather than comparable paired evidence.

No known blocker-level functional or data-loss defect remains in executed automated checks.

## 12. Technical Debt

- Add test/CI fixtures that make the server-authoritative transition and older-match adapter explicit across persisted payload versions.
- Add reusable statistical aggregation/paired-CI output and durable simulation manifests containing code revision and parameters.
- Add browser test infrastructure for roster selection, BREAK interactions and responsive viewport checks.
- Add production-like persistence validation before migration/schema/runtime releases.

## 13. Recommendation for V1.2

1. Run at least 200 paired seeds at each level and treatment for reserve 0/5/10/15/20%; preserve exact combat/AI/seed parity and publish reproducible artifacts.
2. Increase policy sample count before ranking element-counter, Boss-prep or leader build policies; include the full profession/element grid and explicitly measure battle duration and rotation burden.
3. Keep 10% reserve recovery unchanged until the balance owner reviews statistically adequate results; no automatic balancing changes.
4. Add browser E2E and responsive checks, then run staging Postgres resume/CAS and migration verification.
5. Use release telemetry (wave reached, rotations, revive choice, abandonment) to validate simulation assumptions against human behavior, subject to privacy/retention policy.

## 14. Release Readiness

| Gate | Status | Evidence |
|---|---|---|
| Core/gameplay and server validation | PASS | Full automated suite; domain and route tests. |
| Persistence and resume | PASS for automated local coverage | PGlite/memory tests and sequence/CAS tests; no live DB verification. |
| Regression outside Survival | PASS in repository test suite | 413 tests, no failures; lint/typecheck/build pass. |
| Documentation / implementation alignment | PASS | Current rules in design doc; historical design sections labeled; prior rules/data docs corrected. |
| Balance sign-off | **ADJUST / pending** | Task 23 explicitly reports inadequate sample size. |
| Browser E2E / production DB | **Pending** | Not configured / environment unavailable. |

**Overall: ADJUST.** Automated engineering acceptance passes, but do not claim final release GO until balance owner accepts adequately powered results (or explicitly waives that gate) and release pipeline completes its applicable browser/database checks. No gameplay balance parameter was changed during Tasks 23–24.
