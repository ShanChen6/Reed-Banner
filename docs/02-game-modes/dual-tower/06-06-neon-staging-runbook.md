# RH-03 — Neon staging migration và restore drill

> Cập nhật: 24/10/2026

## Trạng thái phiên làm việc

**BLOCKED.** Máy hiện tại không có `STAGING_DATABASE_URL`, Neon API key/project/branch ID hoặc bất kỳ
`DATABASE_URL` nào. Không kết nối và không chạy migration. Production không được dùng làm phương án thay thế.

## Audit migration

- Repo có migration `0000`–`0008`; lệnh thật là `pnpm db:migrate` → `tsx scripts/migrate.mts` → Drizzle
  `migrate(..., { migrationsFolder: "drizzle" })`.
- `0003_profiles.sql` tạo `profiles(owner_id, version, data jsonb, updated_at)` và thêm
  `matches.rewarded_at`; `data` chứa legacy `tower`, `stones`, `dualTower` và receipt `stoneLedger`.
- `0005_leaderboard.sql` giữ BXH legacy, gồm board `tower`.
- `0008_nervous_dexter_bennett.sql` chỉ tạo `destiny_leaderboard_scores`, PK `(cycle_id, owner_id)`, unique
  `event_id` và rank index. Không ALTER profile JSON, không rewrite `tower.best`/`tower.run`, không backfill đá.
- Trial receipt/first-clear/sweep và Destiny milestone nằm trong Profile JSON; match idempotency dùng
  `matches.rewarded_at`; Destiny BXH có event receipt riêng qua `event_id`.

## Thông tin operator phải cung cấp

Không gửi credential vào chat hoặc log. Đặt trực tiếp trong secret environment của terminal:

- `STAGING_DATABASE_URL` — URL chỉ của staging; script cố ý không đọc `DATABASE_URL`.
- `STAGING_EXPECTED_HOST`, `STAGING_EXPECTED_DATABASE` — lấy từ Neon Console staging.
- `NEON_STAGING_BRANCH_NAME`, `NEON_STAGING_BRANCH_ID` — branch phải có nhãn staging, không phải main/prod.
- `STAGING_SAFETY_CONFIRMATION=I_HAVE_VERIFIED_NEON_STAGING` sau khi hai người/owner kiểm tra Console.
- Quyền Neon Console/API để tạo snapshot/child branch; API key không được in hoặc lưu trong repo.

## Quy trình bắt buộc

### 1. Xác minh và baseline read-only

1. Trong Neon Console, xác nhận project, branch name/id, endpoint host và database. Chụp evidence đã che project
   nhạy cảm; ghi UTC timestamp.
2. Chạy `node --import tsx scripts/neon-staging-audit.mts`. Script fail-closed nếu thiếu identity, host/database
   lệch, branch không có dấu hiệu staging hoặc có dấu hiệu prod; output chỉ có hash và aggregate.
3. Lưu output vào kho evidence bảo mật ngoài repo với mã `RH03-BEFORE-<UTC>`.

### 2. Backup staging

Tạo Neon snapshot của branch staging tại thời điểm T0 hoặc child branch từ current point-in-time. Ghi:

- snapshot/branch ID đã che, UTC T0, parent branch fingerprint;
- xác nhận snapshot/child branch đọc được;
- hash output audit trên child branch bằng URL riêng.

Neon snapshot có thể restore thành branch mới, không cần ghi đè branch nguồn; Neon branch là copy-on-write và cô
lập. Restore drill trong task này **không dùng thao tác restore-in-place/PITR chuyển endpoint**.

### 3. Migration staging

Chỉ sau khi baseline và backup đọc được:

1. Trong đúng process đã xác minh, gán tạm `DATABASE_URL` từ `STAGING_DATABASE_URL`; không echo biến.
2. Chạy `pnpm db:migrate`.
3. Chạy lại cùng lệnh lần hai để kiểm tra idempotency.
4. Chạy audit thành `RH03-AFTER-<UTC>`; đối chiếu aggregate và migration history.

Kỳ vọng `0008` thêm bảng/index Destiny; count/profile aggregate, legacy `tower.best/run`, stones, receipts,
matches và BXH legacy không đổi. Chỉ metadata schema/migration history được phép đổi.

### 4. Restore drill tách biệt

1. Restore snapshot T0 thành **branch mới** `rh03-restore-drill-<UTC>` với endpoint/URL riêng.
2. Xác minh branch ID/host khác staging đang dùng.
3. Chạy audit read-only trên branch restore; fingerprint aggregate phải bằng BEFORE (trừ identity fingerprint).
4. Chạy migration trên restore branch nếu mục tiêu là kiểm tra forward recovery; audit lại và so với AFTER.
5. Không chuyển endpoint staging/production sang branch restore. Chỉ xóa branch drill sau khi evidence được duyệt.

## Checklist đối chiếu

| Hạng mục | BEFORE = AFTER migration | RESTORE = BEFORE |
|---|---|---|
| profile row count/version aggregate | bắt buộc | bắt buộc |
| legacy `tower.best` sum/max và active `tower.run` | bắt buộc | bắt buộc |
| `dualTower`, `stones`, `stoneLedger` aggregate | bắt buộc | bắt buộc |
| matches/rewarded/trial/destiny counts | bắt buộc | bắt buộc |
| legacy leaderboard và board `tower` | bắt buộc | bắt buộc |
| Destiny leaderboard rows/events | giữ nguyên hoặc 0 trước tạo bảng | theo snapshot |
| constraints/indexes/migration count | được tăng đúng migration | theo snapshot |

Không log owner ID, account/email, URL, token, match state hoặc Profile JSON. Khi cần sample integrity, chọn record
bằng hash server-side và chỉ log boolean/path tồn tại + hash canonical, không log payload.

## Rollback

- Không `DROP` bảng `destiny_leaderboard_scores`; tắt code đọc/ghi hoặc feature flags và giữ dữ liệu.
- Không rollback xuống code parser làm mất `stones`/`dualTower` khi ghi Profile. Chỉ dùng bản parse-and-preserve.
- Nếu migration lỗi, dừng traffic staging, giữ branch lỗi để điều tra và tạo branch mới từ snapshot T0; không
  restore đè branch đang dùng trong drill.
- Không tự trừ đá hoặc sửa receipt. Mọi corrective script phải được review, snapshot trước và idempotent.

## Evidence chưa có

Staging fingerprint, migration versions thực tế, before/after counts, backup ID và restore fingerprint đều **chưa
có** vì thiếu credential/quyền. Không mục nào được đánh dấu PASS cho đến khi operator thực hiện đủ quy trình.

## Dry-run local 24/10/2026

| Kiểm tra | Kết quả |
|---|---|
| Presence check credential | `DATABASE_URL`, `STAGING_DATABASE_URL`, Neon API/project/branch ID đều không có |
| `node --import tsx scripts/neon-staging-audit.mts` | Refuse như thiết kế: `missing_staging_identity`; không kết nối |
| `.\\node_modules\\.bin\\tsx.cmd scripts/migrate.mts` | Skip: không có `DATABASE_URL`; không migration |
| PGlite DB + dualTower + stone tests | PASS, 31/31, 0 fail/skip |
| Typecheck script/repo | PASS |
| ESLint script | PASS |
| `git diff --check` | PASS |

PGlite dùng cùng thư mục migration và chứng minh dry-run/schema compatibility cục bộ, nhưng không chứng minh backup,
Neon branch identity, network/permission, migration staging hoặc restore drill.
