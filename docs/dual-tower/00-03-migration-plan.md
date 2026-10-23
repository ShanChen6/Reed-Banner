# T00.03 — Kế hoạch tương thích và chuyển dữ liệu

Chỉ là kế hoạch; **không chạy migration, không xóa/sửa trạng thái cũ**. Dựa trên [00-01-audit.md](./00-01-audit.md) và [00-02-rules.md](./00-02-rules.md). Mọi số liệu thưởng là [TBD] như ở T00.02.

## 1. Audit lưu trữ thực tế

| Thành phần | Thực tế (file) | Hệ quả |
|---|---|---|
| Hồ sơ | Bảng `profiles(owner_id PK, version int, data jsonb, updated_at bigint)` (`src/server/db/schema.ts`, `drizzle/0003_profiles.sql`). Toàn bộ `Profile` nằm trong `data`; `tower` là khóa con. | Thêm trường hồ sơ **không cần SQL migration**. |
| Ghi hồ sơ | `DrizzleProfileStore.put`: `UPDATE … WHERE version = :expected`; `updateProfile` đọc–đổi–ghi, thử lại tối đa 3 lần (`src/server/profiles.ts`). | Mọi thay đổi `stones`/`dualTower` đi qua cùng cơ chế optimistic lock; không cần khóa mới. |
| Đọc hồ sơ | `loadProfile` → `parseProfile` (`profile.ts`): `version !== 1` hoặc hỏng → **trả hồ sơ mới** (nguy cơ mất dữ liệu nếu tăng `Profile.version`); các trường khác được `...rest` giữ lại và parse từng nhánh. | **Không tăng `Profile.version`**. Trường mới optional + parse mềm. Lưu ý: `parseProfile` ghi hồ sơ chỉ khi có `put`, nên đọc không tự ghi đè DB. |
| Trường lạ | `parseProfile` dùng `...rest` nên trường không biết vẫn được giữ trong bộ nhớ, nhưng server cũ ghi lại hồ sơ từ `Profile` đã parse → **trường mới bị mất nếu bản cũ ghi lại** (rollback code, mục 6). | Rủi ro rollback, có biện pháp ở mục 6. |
| Trận | Bảng `matches(state jsonb, seq, rewarded_at)`; `claimReward(id)` là cổng idempotent cộng thưởng (`battles.ts reward`). Trận tower mang `match.tower: number`. | Trận Song Tháp phải dùng cờ khác `match.tower`; settle dùng `claimReward` để idempotent. |
| BXH | `leaderboard_scores(board, owner_id, score int, updated_at)`, PK `(board, owner_id)`; `boardScores(profile)` sinh điểm từ hồ sơ, `submitProfile` sau settle; `isBoardId` là allow-list (`tower`, `survival`, `stage:<id>`, …). | Board `tower` = `tower.best`. Board mới cần thêm vào `BoardId`/`isBoardId`; không cần migration (board là text). |
| Dọn khách | `maintenance.ts deleteGuests` xóa `profiles`, `leaderboard_scores`, … theo owner. | Bảng SQL mới theo owner phải được thêm vào đây, nếu không rò dữ liệu. |
| Migration runner | `scripts/migrate.mts`: `drizzle migrate` chạy khi `pnpm build` nếu có `DATABASE_URL`; thư mục `drizzle/` 0000–0007. | Mỗi migration SQL chạy trong build/deploy; chỉ thêm, không sửa file cũ. |
| Dữ liệu legacy đang chạm | `profile.tower.{best,run}`, `matches` có `tower`, board `tower`, quest `w.tower10`, thành tựu `a.tower10/25` (`p.tower.best`) | Phải giữ nguyên. |

## 2. Nguyên tắc

1. **Additive-only:** thêm trường/bảng mới, không đổi nghĩa hay xóa trường cũ.
2. **Legacy là bản ghi sống:** `tower.best`/`tower.run` tiếp tục được đọc/ghi bởi code Legacy. Song Tháp không đọc `tower.*` để tính tiến trình.
3. **Không quy đổi thành tích cũ:** `tower.best` **không** được dùng để mở tầng Trial, cấp đá, hay tính mốc Destiny. Lý do: tầng Legacy sinh theo seed, vô hạn tầng, cân bằng khác; quy đổi sẽ tạo đá từ nguồn không kiểm chứng và phá luật "thưởng lần đầu một lần". Người chơi cũ bắt đầu Song Tháp từ 0 (D-13 bên dưới).
4. **Không tăng `Profile.version`**; không sửa file migration có sẵn.
5. **Idempotent:** mọi bước migration/backfill chạy lại không đổi kết quả.

## 3. Đề xuất cấu trúc dữ liệu

### 3.1 Phương án chọn: JSON trong hồ sơ (tối thiểu, tái sử dụng `updateProfile`)
Thêm hai trường optional vào `Profile`:

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `stones` | `number` (nguyên ≥ 0, mặc định 0) | Đá tài khoản; parse ép về nguyên không âm, `NaN`/âm → 0. Không có đường trừ trong V1.0 (C7, C10). |
| `dualTower` | `DualTowerState` | Chứa: `trial { cleared, claimedFloors[], lastSweep }`, trong đó `lastSweep = { dateKey, tier, claimedAt } | null`; parser nâng mềm `lastSweepDay` cũ. `destiny { cycleId, run|null, claimedMilestones[], cycleRewardClaimed }`, `schema: 1` (phiên bản con của riêng trạng thái này). |

Lý do chọn: ghi nguyên tử cùng số dư đá và mốc đã nhận trong **một** `put` có version → thưởng + khóa idempotent không thể lệch nhau. Bảng SQL riêng sẽ cần hai lần ghi (không có transaction trên Neon HTTP, xem comment `server/profiles.ts`) nên dễ cộng đá nhưng mất mốc, hoặc ngược lại.

### 3.2 Phương án thay thế (không chọn ở V1.0)
Bảng `dual_tower_*` riêng. Chỉ cân nhắc nếu cần truy vấn tổng hợp theo chu kỳ (BXH Destiny). Nếu cần: bảng chỉ đọc/phát sinh từ hồ sơ, không là nguồn sự thật cho đá.

### 3.3 BXH Song Tháp
Dùng bảng `leaderboard_scores` hiện có với board id mới (ví dụ `trial`, `destiny:<cycleId>`); mở rộng `BoardId` + `isBoardId`; không migration. Board `tower` không đổi.

## 4. Danh mục thay đổi schema/SQL dự kiến

| # | Thay đổi | SQL? | Ghi chú |
|---|---|---|---|
| S1 | `Profile.stones`, `Profile.dualTower` + `parseStones`/`parseDualTower` trong `parseProfile`/`newProfile` | Không | Optional, default an toàn |
| S2 | `BoardId`/`isBoardId` thêm board Song Tháp | Không | Allow-list code |
| S3 | `Match` thêm cờ riêng (không dùng `match.tower`) | Không | JSON trong `matches.state`; `parseMatch` phải bỏ qua/giữ cờ lạ an toàn (kiểm tra ở test) |
| S4 | `maintenance.deleteGuests` | Không | Chỉ cần nếu có bảng mới (3.2) |
| S5 | (Tuỳ chọn) bảng cycle/archives | Có, `drizzle/0008_*.sql` | Chỉ nếu duyệt 3.2; chỉ `CREATE TABLE`/`CREATE INDEX`, không `ALTER` cột cũ, không `DROP` |

Kết luận: phương án mặc định **không cần SQL migration**. Nếu S5 được duyệt, sinh bằng `pnpm db:generate` từ `schema.ts`, kiểm tra snapshot trong `drizzle/meta`.

## 5. Migration matrix theo tình trạng hồ sơ

| # | Tình trạng hồ sơ | Hành vi khi đọc | Hành vi khi ghi lần đầu | Rủi ro / test |
|---|---|---|---|---|
| M1 | Hồ sơ không tồn tại | `newProfile()`: `stones:0`, `dualTower` rỗng | Tạo mới (`expected=0`) | Test mặc định |
| M2 | Hồ sơ cũ không có `stones`/`dualTower`, `tower` bất kỳ | Điền default; `tower` nguyên vẹn | Trường mới xuất hiện khi có ghi | Test: `parseProfile(old).tower` bằng cũ (đã có kiểu test tương tự ở `tower.test.ts`) |
| M3 | `tower.best = 0`, `run = null` | Như M2 | — | — |
| M4 | `tower.best > 0`, `run = null` | `best` giữ; Trial `cleared = 0` | — | Test: không quy đổi |
| M5 | `tower.run` hợp lệ, `active=false`, `offer=null` | Giữ nguyên; Legacy tiếp tục chơi | — | Legacy test |
| M6 | `tower.run.offer != null` | Giữ nguyên; `towerPick` còn hoạt động | — | Test: `towerPick` sau nâng cấp |
| M7 | `tower.run.active = true` có trận `matches` chưa settle | Giữ; settle bằng `applyTowerResult` như cũ qua `match.tower` | — | Test: settle trận cũ sau deploy |
| M8 | `tower.run.active = true` nhưng **không có** trận (mồ côi) | Giữ; **không** tự đóng ở migration. `towerQuit` bị chặn bởi `towerBusy` | — | Rủi ro có sẵn từ trước. Đề xuất sau (không trong task này): job đọc-chỉ báo cáo số lượng; chỉ xử lý sau duyệt riêng |
| M9 | `tower.run` hỏng (không qua `parseRun`) | `null` (hành vi hiện tại), `best` giữ | Hồ sơ lưu lại sẽ bỏ run hỏng | Hành vi cũ, không đổi; **backup trước deploy** để khôi phục (mục 7) |
| M10 | `stones` là âm / không nguyên / chuỗi / `NaN` | Ép về 0 | — | Test negative |
| M11 | `stones` rất lớn (> `Number.MAX_SAFE_INTEGER`) | Chặn trần an toàn **[TBD]** | — | Test negative |
| M12 | `dualTower` hỏng hoặc `schema` lạ | Dùng rỗng nhưng **không ghi đè** nếu `schema` > hiểu biết (tránh bản cũ xóa dữ liệu mới) | — | Test; xem rollback |
| M13 | `Profile.version !== 1` (hỏng) | `newProfile()` — hành vi hiện tại | — | Không đổi; không tăng `version` |
| M14 | Khách đã bị dọn (`deleteGuests`) | Xóa cùng profile và điểm; thêm bảng mới nếu có (S4) | — | Test nếu có bảng mới |
| M15 | Hồ sơ có `dualTower.destiny.cycleId` cũ (khi sang chu kỳ mới) | Tự kết thúc/tính thưởng chu kỳ cũ idempotent rồi mở chu kỳ mới | — | Test idempotency thời gian |
| M16 | Hai request đồng thời ghi hồ sơ | Optimistic lock; thử lại 3 lần | — | Test race: cộng đá không bị mất/nhân đôi |

## 6. Rollout và rollback

### 6.1 Rollout (đề xuất, theo giai đoạn)
1. **P0 — chuẩn bị:** backup (mục 7); chạy test baseline (xem mục 8).
2. **P1 — "đọc được":** triển khai code chỉ **đọc/parse** `stones`, `dualTower` (giữ nguyên khi ghi lại), chưa mở tính năng. Mục đích: mọi instance đều không làm mất trường mới trước khi dùng.
3. **P2 — bật tính năng** sau cờ cấu hình (feature flag, mặc định tắt): Trial, rồi Destiny.
4. **P3 — theo dõi:** đối chiếu BXH `tower`, số hồ sơ có `tower.run`, tổng `stones` bằng truy vấn chỉ đọc.

Thứ tự P1 trước P2 giải quyết rủi ro "instance cũ ghi đè hồ sơ" khi deploy cuốn chiếu.

### 6.2 Rollback

| Tình huống | Hành động | Mất dữ liệu? |
|---|---|---|
| Lỗi ở tính năng Song Tháp, chưa có thưởng thật | Tắt feature flag | Không |
| Cần lùi code về trước P1 | Bản cũ **sẽ bỏ** `stones`/`dualTower` ở lần ghi hồ sơ tiếp theo của người đó. Vì vậy chỉ lùi về bản **P1** (có parse-and-preserve), không lùi dưới P1 sau khi P2 đã phát đá | Có nếu lùi dưới P1 |
| Cộng đá sai | Sửa bằng bản vá + script bù **có duyệt, chạy thủ công**, dựa trên backup; không tự động trừ | Không (khôi phục có kiểm) |
| Migration SQL (chỉ nếu S5) | Migration chỉ `CREATE`; rollback = bỏ qua bảng mới (không đọc), không `DROP` tự động | Không |

### 6.3 Idempotency
- Thưởng đá: khóa `(trial, floor)`, `(destiny, cycleId, milestoneId)`, `(sweep, ngày VN)` nằm trong cùng `put` với số dư.
- Settle trận: `claimReward(matchId)` đã atomic; Song Tháp phải gọi trước khi cộng đá.
- Migration/backfill (nếu có): chạy lại không đổi kết quả (thiết kế "set nếu thiếu").

## 7. Backup và tái lập

1. Trước P1/P2: snapshot DB Neon (branch/point-in-time) và xuất `profiles`, `leaderboard_scores`, `matches` chưa `rewarded_at` ra tệp bảo mật (chứa dữ liệu người chơi, không đưa vào repo).
2. Ghi hash/đếm dòng của từng bảng.
3. Tái lập: tạo nhánh DB từ snapshot, chạy migration hiện có (`pnpm db:migrate`), so sánh đếm dòng và `tower.best` mẫu với BXH `tower`.
4. Kiểm tra khôi phục bằng PGlite trong test (đã dùng ở `tests/server/db.test.ts`) với hồ sơ mẫu M2–M9.

## 8. Test plan (cho task triển khai sau)

| Loại | Test |
|---|---|
| Positive | Hồ sơ cũ (M2–M7) parse → `tower` bất biến, `stones = 0`, `dualTower` rỗng; ghi/đọc vòng tròn giữ `stones`/`dualTower`; BXH `tower` vẫn lấy `tower.best` |
| Negative | M9–M13: dữ liệu hỏng/âm/lạ; `tower.best` không mở Trial hay cấp đá; `schema` lạ không bị ghi đè |
| Idempotency | Settle hai lần cùng trận → đá một lần (`claimReward`); thưởng lần đầu tầng nhận một lần; quét hai lần trong ngày VN một lần; mốc Destiny một lần; qua 00:00 VN quét lại được |
| Concurrency | Hai `updateProfile` đồng thời cộng đá không mất/nhân đôi (M16) |
| Legacy regression | `tests/core/tower/tower.test.ts`, `tests/server/battles.test.ts` (tower), `tests/server/db.test.ts` (BXH), `tests/core/quests/quests.test.ts` giữ xanh; baseline hiện tại 415/415 |
| Migration | Nếu có S5: áp `drizzle` lên PGlite hai lần, schema không đổi, dữ liệu cũ nguyên vẹn |
| Rollback | Mô phỏng bản "P1" ghi lại hồ sơ có `dualTower` → trường được giữ |

Lệnh: `pnpm typecheck`, `pnpm test`, `pnpm sim --tower --level 10 --battles 50` (đối chiếu baseline T00.01: trung bình 12,6 tầng, trung vị 14, p90 19), `pnpm lint`.

## 9. Decision log bổ sung

| ID | Quyết định | Trạng thái |
|---|---|---|
| D-13 | Không quy đổi `tower.best`/`tower.run` sang Trial/Destiny/đá; người chơi cũ bắt đầu từ 0 | Chốt theo yêu cầu "không tự quy thành tích cũ" |
| D-14 | Lưu `stones` và `dualTower` trong JSON hồ sơ, không bảng SQL mới ở V1.0 | **Cần duyệt** |
| D-15 | Không tăng `Profile.version` | Chốt (tránh `parseProfile` reset hồ sơ) |
| D-16 | Rollout P1 (parse-and-preserve) trước P2 (bật tính năng) | **Cần duyệt** |
| D-17 | Run Legacy mồ côi (M8) không xử lý trong migration này | **Cần duyệt** |
| D-18 | Trần an toàn của `stones` | [TBD] |

## 10. Rủi ro còn mở
- `parseProfile` hiện không bảo toàn trường lạ khi bản cũ ghi lại; cần P1 (D-16).
- Run Legacy mồ côi tồn tại từ trước (M8) và `towerQuit` bị `towerBusy` chặn; chưa rõ quy mô, cần truy vấn chỉ đọc trên DB thật (chưa có quyền truy cập trong task này).
- Không có dữ liệu production: số hồ sơ theo từng tình trạng M1–M9 chưa đo được.
- Deploy cuốn chiếu Neon/Vercel có thể có hai phiên bản code cùng lúc.
- Chưa kiểm tra `parseMatch`/serialize trận với cờ mới (S3) — việc của task triển khai.

Status: PARTIAL (kế hoạch đầy đủ; chưa có số liệu DB thật và 4 quyết định cần duyệt).
