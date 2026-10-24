# T06.01 — Full Regression

Ngày chạy: 2026-10-24 (Asia/Ho_Chi_Minh)  
Repository: `ShanChen6/Reed-Banner`  
Revision kiểm thử: `c918671`  
Nhánh kiểm thử: `update/tower`

> Task ghi nhánh nền là `develop`, nhưng chuỗi Song Tháp đang được tích hợp và vừa được push trên
> `update/tower`. Regression được chạy trên nhánh tích hợp này để kiểm tra đúng code sẽ được merge; không
> checkout, merge, commit, push hoặc deploy trong task này.

## Phạm vi

- Toàn bộ unit/integration suite của repository.
- TypeScript và ESLint toàn repository.
- Next.js production build và route generation.
- Migration/schema bằng PGlite dùng cùng migration với Neon.
- Compatibility dữ liệu Tower cũ, `tower.best`, `tower.run`, profile cũ và schema tương lai.
- Reward consistency/idempotency cho Trial, daily sweep, Destiny milestone/cycle và stone wallet.
- Gameplay hiện hữu: Battle/AI, Campaign, Boss/Raid, Arena, Daily, Inventory/Gear,
  Player/Profile/Match, Survival V1.1, Trial và Destiny.

## Lệnh và kết quả thực tế

| Lệnh | Kết quả | Ghi chú |
|---|---|---|
| `pnpm typecheck` | PASS | `tsc --noEmit`, exit 0. |
| `pnpm lint` | PASS | `eslint .`, exit 0. |
| `pnpm test` | PASS | Full suite; 688 test cases theo dot reporter, không có dấu fail/skip. |
| `node --import tsx --test --test-reporter=dot "tests/**/*.test.ts"` | PASS | 688 dấu pass; không có output fail. |
| `pnpm build` | PASS | Next.js 16.4.2/Turbopack compile thành công; TypeScript thành công; tạo 30/30 static pages. |
| `node --import tsx --test tests/server/db.test.ts tests/core/tower/dualTower.test.ts tests/server/stones.test.ts tests/server/trialReward.test.ts tests/server/destiny.test.ts` | PASS | 49 tests, 7 suites, 0 fail, 0 skipped. |

Không có test bị skip/todo/cancel trong nhóm migration/legacy/reward được tách riêng. Full suite không báo
failure hoặc skipped case; output chi tiết rất dài nên được chạy lại bằng dot reporter để xác nhận toàn bộ case.

## Database migration

`pnpm build` gọi đúng chuỗi `tsx scripts/migrate.mts && next build`. Môi trường regression không có
`DATABASE_URL`, nên migration remote in ra `Không có DATABASE_URL, bỏ qua migration.` và không kết nối Neon.
Đây là skip có chủ đích của script, không được tính là migration production PASS.

Dry run/schema compatibility được kiểm tra bằng `tests/server/db.test.ts` trên PGlite, dùng cùng migration với
Neon. Cả 10 test database đều PASS, gồm:

- match create/read/CAS update;
- Survival V2 resume và nâng legacy active run;
- profile/account/auth persistence;
- Daily và leaderboard cũ;
- Destiny leaderboard migration, tie order, dedup và cycle isolation;
- Arena storage và giới hạn lượt.

## Compatibility và reward consistency

- Profile legacy thiếu Song Tháp đọc được với 0 đá và state mặc định.
- `tower.best` và `tower.run` không bị Trial/Destiny hoặc stone settlement sửa.
- Schema Song Tháp mới hơn được giữ nguyên, không bị code cũ ghi đè.
- Stone wallet chỉ nhận số nguyên không âm, chống overflow và duplicate ledger event.
- Trial first-clear chỉ cấp đá một lần; replay, retry, hai tab và settle lặp không nhân thưởng.
- Trial không phát vàng, EXP hoặc trang bị riêng.
- Daily sweep và Destiny settlement dùng server state/idempotency; không dựa vào client claim.
- Destiny milestone/cycle tách khỏi reward giữa tầng và không phụ thuộc BXH.
- Run Destiny cũ bị kẹt khi Đinh Bộ Lĩnh gục được phục hồi qua lựa chọn Cứu viện bắt buộc.

## Gameplay regression coverage

- **Survival V1.1:** chọn active/reserve, rotate, revive, break preview, `nextWave` concurrent/retry,
  HP/energy/food xuyên đợt và legacy resume.
- **Campaign/Boss:** unlock tuần tự, settlement, first-clear reward, boss difficulty và gear drop.
- **Arena/Daily:** ghost snapshot, Elo, lượt/ngày, leaderboard và timezone Việt Nam.
- **Inventory/Gear:** equip/loadout, merge/drop và stat calculation; không có `enhanceLevel` hay API tiêu đá.
- **Player/Match:** ownership, authentication, CAS sequence/profile writes, timeout/resume và settlement một lần.
- **Battle:** 1v1/3v3, AI, skills, combo/chase, spirit, board RNG và deterministic replay.
- **Song Tháp:** luật đội hình, 20 tầng Trial, sweep, Destiny roster/cycle/rule/reward/leaderboard và UI helpers.

## Lỗi và sửa code

Không có failure tái hiện trong regression này, vì vậy không sửa production code hoặc balance. File duy nhất
được thêm là báo cáo này.

## Giới hạn và rủi ro mở

1. Chưa chạy migration trên Neon/Postgres remote vì không có `DATABASE_URL`; cần chạy `pnpm db:migrate` trong
   staging có backup và quyền DB trước release.
2. Suite hiện chủ yếu là unit/integration/PGlite; chưa có browser E2E thật trên thiết bị mobile/desktop trong
   task này.
3. Regression chạy trên `update/tower`, không phải HEAD của `develop`; cần CI chạy lại sau khi merge để bắt
   xung đột tích hợp cuối cùng.

## Kết luận

**Status: PASS có điều kiện môi trường.** Code trên `update/tower` qua typecheck, lint, full automated suite và
production build. Điều kiện còn lại trước release là migration staging/remote và CI post-merge trên `develop`.
