# T06.04 — Documentation và Release Readiness

> Cập nhật: 24/10/2026

## Phạm vi nghiệm thu

Nghiệm thu Song Tháp V1.0 dựa trên implementation hiện có và các báo cáo
[regression](06-01-regression.md), [Trial QA](06-02-trial-qa.md),
[Destiny/economy simulation](06-03-balance.md). Task này chỉ cập nhật tài liệu và release gates; không đổi code
production, balance, schema hay triển khai cường hóa trang bị.

Working copy được kiểm tra trên nhánh `update/tower`, không phải `develop` nêu trong brief. Đây là nhánh người dùng
đã yêu cầu tiếp tục ở các task trước; mọi gate phải chạy lại sau khi hợp nhất vào `develop`.

## Kết luận phát hành

| Hạng mục | Quyết định | Bằng chứng / điều kiện |
|---|---|---|
| Trial | **GO có điều kiện** | 20/20 tầng có legal team và deterministic seed; tầng 16/19/20 đã tune theo QA; first-clear/sweep idempotent; cần staging migration, browser/device smoke và flag riêng trước public launch. |
| Destiny | **ADJUST / limited beta** | Run/cycle/roster/settlement đã có integration coverage; roster cho phép toàn bộ tướng sở hữu, cần telemetry recovery/HP/food và thêm mẫu cycle. |
| Stone issuance | **GO để tích lũy** | Wallet không âm, ledger receipt chống lặp; replay không farm; Trial tối đa 77 first-clear + 1–4/ngày, Destiny tối đa 23/cycle. |
| Stone spending / gear enhancement | **NO-GO** | Không có `enhanceLevel`, stat bonus, API tiêu đá hay luật merge mới. GEAR-01–08 vẫn là FUTURE TODO. |
| Public release đồng thời | **ADJUST** | Chưa có runtime feature flag riêng, chưa dry-run Neon staging/remote, chưa browser E2E mobile/desktop và chưa CI post-merge `develop`. |

**Quyết định tổng thể: ADJUST.** Có thể đưa Trial vào rollout có kiểm soát sau khi đóng các gate bắt buộc bên
dưới. Destiny chỉ nên limited beta/telemetry; không mở cường hóa trang bị.

## Hành vi được chốt

- Trial: 20 tầng cố định, HP/lương reset mỗi attempt, ba active hợp luật từ owned fighters, replay không nhận lại
  first-clear. Sweep một lần/ngày theo `Asia/Ho_Chi_Minh`, không tích lượt bỏ ngày.
- Destiny: cycle 7 ngày từ thứ Hai 00:00 Việt Nam; snapshot luật bất biến trong cycle; roster khóa theo fighter ID;
  HP/energy/lương/downed xuyên tầng, dự bị không tự hồi, không đổi tướng trong combat.
- Đinh Bộ Lĩnh luôn ở active leader slot, được đổi nghề/hệ trước tầng và vẫn phải hợp luật. Flow Cứu viện xử lý
  run legacy khi thủ lĩnh đã gục mà không tạo hồi miễn phí khi reload.
- Trial/Destiny không dùng `tower.best`/`tower.run` để entitlement và không sửa BXH/settlement legacy.
- Trial V1.0 không phát vàng, EXP hay gear riêng. Destiny reward giữa tầng không phát đá; đá chỉ qua milestone và
  cycle settlement.

## Reward table canonical

| Nguồn | Cap | Chống farm |
|---|---:|---|
| Trial first-clear | 77 đá lifetime cho 20 tầng V1 | receipt theo floor; replay/settle lặp = 0 |
| Trial sweep | 1/2/3/4 đá/ngày ở tier 1–5/6–10/11–15/16–20 | date key VN + ledger receipt; tier 0 = 0 |
| Destiny milestones | 18 đá/cycle | receipt theo cycle + milestone |
| Destiny cycle reward | 0–5 đá/cycle | settlement idempotent theo cycle |
| Destiny giữa tầng | 0 đá | chỉ offer run-local |

Số chi tiết theo từng Trial floor nằm trong data/report T02.06; emission 7/30/90 ngày và benchmark không-production
nằm ở [T03.02](03-02-stone-economy.md) và [T06.03](06-03-balance.md). Không suy bảng benchmark thành giá cường hóa.

## Launch và rollback

### Gate bắt buộc trước public launch

1. Merge/rebase có kiểm soát vào `develop`, chạy lại CI typecheck/test/lint/build.
2. Snapshot Neon staging; chạy `pnpm db:migrate`; kiểm tra row count, profile legacy và leaderboard trước/sau.
3. Thêm hai feature flag server-authoritative độc lập cho Trial và Destiny, mặc định tắt; chặn cả write API và
   entry UI. Flag là công việc implementation riêng, không được giả là đã có trong T06.04.
4. Browser smoke bằng bàn phím/touch trên mobile/desktop: loading/error/locked/claimed, retry mạng chậm, midnight VN.
5. Cấu hình `SESSION_SECRET`, kiểm tra cycle/rule snapshot Destiny và telemetry trước limited beta.

### Trình tự đề xuất

1. Deploy compatibility/migration với cả hai flag tắt.
2. Bật Trial cho cohort nhỏ; theo dõi settlement lỗi, duplicate receipt, claim rate, số dư p50/p90 và dữ liệu legacy.
3. Mở rộng Trial nếu metric ổn định.
4. Bật Destiny limited beta riêng; cho phép khóa toàn bộ tướng sở hữu vào roster của run.
5. Không bật stone spending cho đến khi GEAR-01–08 được duyệt, triển khai và nghiệm thu riêng.

### Rollback

- Tắt flag mode gặp lỗi; không tự trừ đá đã cấp và không xóa `dualTower`/ledger.
- Rollback code chỉ về phiên bản parse-and-preserve; không lùi xuống bản làm mất `stones`/`dualTower` khi ghi profile.
- Nếu cấp sai, dùng backup + script bù/trừ được review và chạy thủ công; không sửa wallet từ client.
- Migration chỉ thêm cấu trúc; khi rollback ngừng đọc bảng mới, không tự `DROP`.

Chi tiết matrix legacy và backup: [T00.03](00-03-migration-plan.md).

## Compatibility

- Hồ sơ cũ thiếu Song Tháp đọc thành state rỗng và 0 đá; schema Song Tháp mới hơn được bảo toàn.
- `tower.best`, `tower.run`, legacy tower leaderboard và match settlement cũ vẫn độc lập.
- PGlite migration/database tests đã bao phủ profile/match/BXH cũ; chưa xác nhận Neon remote vì môi trường không có
  `DATABASE_URL`.
- Trial và Destiny tách scene/API/state nên có thể launch riêng sau khi bổ sung flag. Hiện tại chỉ tách logic,
  **chưa tách operational rollout**.

## Release evidence và test results

| Evidence | Kết quả |
|---|---|
| T06.01 full regression | PASS có điều kiện: 688 tests, typecheck/lint/build PASS; migration remote skipped |
| T06.02 Trial QA | PASS: 20/20 legal/deterministic; tune khách quan 3 tầng cuối |
| T06.03 Destiny/economy | ADJUST: roster 5 tốt nhất trong mẫu; chỉ 4 cycle seed, cần telemetry |
| Equipment boundary | PASS: tài liệu GEAR-01–08 tồn tại; regression không thấy `enhanceLevel`/spend API/stat bonus |

Kết quả lệnh chạy riêng cho T06.04 được ghi sau khi hoàn tất ở mục “Test run 24/10/2026” bên dưới; không dùng
bảng này để giả nhận migration production hoặc browser E2E.

## Open risks

1. Feature flag server-authoritative đã triển khai ở RH-02; còn cần xác minh cấu hình trên staging/deployment thật.
2. Chưa chạy migration trên Neon staging/production hoặc kiểm thử restore snapshot thật.
3. Chưa có browser E2E/touch/device matrix trong automated suite.
4. Destiny balance có mẫu cycle nhỏ; roster lớn có thể tăng tải chọn đội và chưa được mô phỏng sau khi bỏ trần 8.
5. Chưa có stone sink nên số dư tăng tuyến tính; đây là accumulation có chủ ý, không phải economy bền vững.
6. Nhánh nghiệm thu là `update/tower`; xung đột khi vào `develop` chưa được kiểm chứng.

## Next dependency

Tạo task release-control riêng để triển khai/test hai feature flag, chạy Neon staging migration + restore drill và
browser/device smoke. Sau đó chạy lại T06.01 trên HEAD `develop`, review telemetry plan Destiny và mới quyết định
public GO. GEAR-01–08 vẫn là dependency tương lai độc lập, không chặn việc tích đá.

## Test run 24/10/2026

| Lệnh | Kết quả thực tế |
|---|---|
| `git diff --check` | Ban đầu báo một blank line ở EOF trong change log; đã sửa, lần kiểm tra cuối PASS. |
| kiểm tra `GEAR-01`…`GEAR-08` bằng `rg` | PASS: đủ 8 ID duy nhất. |
| tìm `enhanceLevel`, spend/enhance API markers trong `src tests` | PASS: không tìm thấy implementation marker. |
| `pnpm typecheck` | BLOCKED bởi Corepack/DNS khi tải metadata `pnpm@10.28.0`; không chạy compiler. |
| `.\\node_modules\\.bin\\tsc.cmd --noEmit` | PASS, exit 0. |
| test liên quan bằng `node --import tsx --test ...` | PASS: 47 tests, 8 suites, 0 fail/skip/todo. |
| `.\\node_modules\\.bin\\eslint.cmd .` | PASS, exit 0. |
| `.\\node_modules\\.bin\\tsx.cmd scripts/migrate.mts` | SKIP có chủ đích: `Không có DATABASE_URL, bỏ qua migration.` |
| `.\\node_modules\\.bin\\next.cmd build` | FAIL: Turbopack panic khi tạo process PostCSS cho `globals.css`; tái hiện cả trong và ngoài sandbox. |
| `.\\node_modules\\.bin\\next.cmd build --webpack` | PASS: compile + TypeScript + 30/30 static pages; đây là fallback được docs Next.js 16 hỗ trợ. |

Không che lỗi Turbopack: source build được bằng webpack nhưng pipeline production mặc định vẫn cần được xác minh/sửa
trong môi trường CI trước release. T06.04 không sửa bundler/config vì không có bằng chứng lỗi thuộc Song Tháp.

## Status

**PARTIAL / ADJUST** — tài liệu và ranh giới sản phẩm đã sẵn sàng; Trial có thể đi tiếp sau release gates, Destiny
cần limited beta/điều chỉnh, và full public launch chưa đạt GO.

## Post-merge verification

HEAD `develop` `5c0a8247d276a2f4b1cfc3051e9cce3ba54ffdd7` đã được GitHub Actions CI run #261 xác minh
PASS trên Node 22/Linux, gồm cả `pnpm build` mặc định bằng Turbopack. Lỗi Turbopack local Windows/Node 24 vẫn tái
hiện, trong khi webpack fallback PASS; vì lỗi không tái hiện trên CI nên không đổi production build command.
Chi tiết lệnh, exit code và giới hạn working copy xem [post-merge verification](06-07-post-merge-verification.md).
