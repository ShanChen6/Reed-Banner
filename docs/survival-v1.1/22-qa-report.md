# Survival Defense V1.1 — QA Report

**Kết luận: PASS**  
**Phạm vi:** tích hợp và hồi quy Tasks 04–21.  
**Môi trường:** Node.js test runner, PGlite cho kiểm thử persistence; không cấu hình `DATABASE_URL`.

## Test matrix

| Phạm vi / acceptance criteria | Kiểm thử | Kết quả |
|---|---|---|
| Roster 3 active + tối đa 2 reserve; fighter sở hữu, không trùng; snapshot theo ID | `tests/core/survival/survival.test.ts`, `tests/game/survival-roster-selection.test.ts`, `tests/server/battles.test.ts` | PASS |
| Persistent fighter state, reserve runtime, serialization và mapping 5→3 | `tests/core/survival/survival.test.ts`, `tests/server/db.test.ts` | PASS |
| Recovery active/reserve, không hồi khi gục, lương và giới hạn hồi sinh | `tests/core/survival/survival.test.ts`, `tests/server/battles.test.ts` | PASS |
| Rotation hợp lệ trong BREAK, không đưa fighter gục vào active; giữ state theo ID | `tests/core/survival/survival.test.ts`, `tests/game/survival-tactical-preview.test.ts`, `tests/server/battles.test.ts` | PASS |
| Đổi nghề/hệ, giữ tỷ lệ HP, gear, progression, skill loadout và sử dụng skill sau reload | `tests/core/survival/survival.test.ts`, `tests/server/battles.test.ts` | PASS |
| Server actions, owner check, sai phase, payload giả mạo, stale sequence | `tests/server/battle-routes.test.ts`, `tests/server/battles.test.ts` | PASS |
| Atomic nextWave, nhiều tab, retry khi mất response, không double settle | `tests/server/battles.test.ts`, `tests/server/db.test.ts` | PASS |
| Resume BREAK/FIGHTING và tương thích bản lưu cũ | `tests/server/db.test.ts`, `tests/server/battles.test.ts` | PASS |
| Bỏ dở sau 24 giờ, settlement phần thưởng một lần | `tests/core/survival/survival.test.ts`, `tests/server/battles.test.ts`, `tests/server/db.test.ts` | PASS |
| UI nghỉ, preview, bản nháp và lựa chọn roster | `tests/game/survival-break.test.ts`, `tests/game/survival-tactical-preview.test.ts`, `tests/game/survival-roster-selection.test.ts` | PASS |
| Regression Battle, Campaign, Tower, Arena, Profile progression | `tests/core/match/match.test.ts`, `tests/server/battles.test.ts`, `tests/core/progress/progress.test.ts` và suite toàn repo | PASS |

### Kịch bản tổng hợp A–E

| Scenario | Coverage và kết quả |
|---|---|
| A — bắt đầu đủ 5 fighter, thắng wave, recovery theo vai trò, đổi một người, vào wave kế | PASS: service integration kiểm tra preview và state sau transition, active/reserve IDs và energy; core test kiểm tra recovery 20%/10% và giới hạn max HP. |
| B — active gục nhưng thắng, chuyển xuống reserve, thay bằng reserve sống, tiếp tục chờ/hồi sinh | PASS: core rotation/revive tests và service integration kiểm tra downedAtWave, reserve location, revival ID, chi phí/energy và lineup sau transition. |
| C — đổi nghề/hệ, HP ratio, stats/skills, cast skill sau reload | PASS: core multi-wave build test kiểm tra builder/progression, HP ratio, loadout kỹ năng và cast; persistence test kiểm tra deserialize. |
| D — cả 3 active gục trong khi reserve còn sống | PASS: thêm service integration test; run kết thúc, reserve được giữ nguyên trong reserve và không được đưa tự động vào BattleState. |
| E — reload BREAK, request lặp, không double recovery/food/revive | PASS: BREAK GET read-only, retry stale sequence, duplicate revive và cạnh tranh cùng sequence được kiểm tra; chỉ một transition được lưu. |

## Commands executed

| Command | Kết quả |
|---|---|
| `pnpm test` | PASS — 412 tests, 0 failed, 0 skipped. |
| `pnpm lint` | PASS — toàn repo. |
| `pnpm typecheck` | PASS — chạy lại sau khi production build tạo xong `.next/types`. |
| `pnpm build` | PASS — production build Next.js hoàn tất. Script bỏ qua migration vì không có `DATABASE_URL`. |
| `node --import tsx --test tests/server/battles.test.ts tests/core/match/match.test.ts tests/core/survival/survival.test.ts` | PASS — xác minh bổ sung sau khi sửa lỗi kết thúc run. |
| `git diff --check` | PASS. |

E2E browser không chạy: repository không có cấu hình Playwright/Cypress hoặc script E2E. Component UI hiện được kiểm tra bằng static render và pure-function/service tests; chưa có browser-driven interaction/responsive test.

## Regression findings và sửa lỗi

Thêm Scenario D đã làm lộ lỗi persistence: khi `closeLost` đánh dấu Survival run là `done`, hàm không tăng `Match.seq`. Do `settleRecord` chỉ lưu khi sequence thay đổi, view trả về hiển thị run kết thúc nhưng trạng thái `done` chưa được ghi bền; reload có thể phục hồi trạng thái cũ.

Đã sửa tại [match.ts](../../src/core/match/match.ts): chuyển trạng thái `closeLost` tăng sequence cùng lúc với `survival.done`. Kiểm thử tích hợp mới trong [battles.test.ts](../../tests/server/battles.test.ts) xác nhận run kết thúc được lưu, ba active vẫn là fighter duy nhất trong battle và reserve sống không tự động nhập trận. Sau sửa, toàn bộ 412 test, lint, typecheck và production build đều pass.

Một lần chạy `pnpm typecheck` đồng thời với build trước đó báo thiếu file `.next/types`; đây là race khi Next đang tái tạo generated types. Chạy lại sau build hoàn tất đã pass, không cần thay đổi tsconfig hoặc source.

## Coverage gaps / giới hạn

- Không có E2E browser thực tế; các luồng UI chưa được xác minh bằng click/tap trên PC/mobile.
- Không chạy kiểm thử trên Neon/Postgres từ xa; persistence được kiểm tra bằng PGlite và memory store, gồm CAS cạnh tranh.
- Build không áp migration lên database thật vì môi trường không cấu hình `DATABASE_URL`; migration không cần thiết cho thay đổi này.
- Không thu coverage instrumentation; ma trận dựa trên các test case đang chạy và full suite.

## Blocking issues

Không còn blocker đã biết trong luồng Survival V1.1 hoặc regression được chạy. Những giới hạn còn lại là E2E/browser và xác minh hạ tầng database thật, không ngăn kết luận PASS cho acceptance criteria automated của task.
