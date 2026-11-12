# Quy trình test

> Cập nhật: 12/11/2026
> Trạng thái: **IMPLEMENTED** — Shan duyệt 12/11/2026; tầng 1 và 2 đã có trong repo và CI, tầng 3 là checklist tay.

Ba tầng kiểm tra, không cần AI. Tầng sau không thay tầng trước.

| Tầng | Khi nào | Ai chạy | Lệnh | Thời gian |
|---|---|---|---|---|
| 1. Trên máy | Trước mỗi commit | Người làm | `pnpm check` | khoảng 4 phút |
| 2. CI | Mỗi PR, mỗi lần đẩy lên `develop`/`main` | GitHub Actions, tự động | `.github/workflows/ci.yml` | khoảng 6–8 phút |
| 3. Trước phát hành | Trước khi gộp `develop` vào `main` | Người làm, theo checklist | [mục 4](#4-tầng-3-checklist-trước-phát-hành) | tùy thay đổi |

Máy dev dùng **Node 24** như `package.json` và Vercel; CI cũng chạy Node 24.

## 1. Tầng 1: trên máy

```bash
pnpm check
```

`pnpm check` chạy lần lượt `pnpm lint`, `pnpm typecheck`, `pnpm docs:check`, `pnpm test`, dừng ở bước đỏ đầu tiên. Đỏ thì sửa rồi mới commit.

Khi đang sửa một chỗ, chạy riêng cho nhanh:

| Muốn | Lệnh |
|---|---|
| Một file test | `node --import tsx --test tests/core/tower/destinyBoons.test.ts` |
| Các test có tên chứa một cụm | `node --import tsx --test --test-name-pattern "Phúc" "tests/**/*.test.ts"` |
| Smoke test trình duyệt (tự build, khoảng 2 phút) | `pnpm e2e` |
| Smoke test một cỡ màn | `pnpm e2e --project mobile` (hoặc `desktop`) |
| Smoke test vào server đang mở sẵn, bỏ qua build | `E2E_BASE_URL=http://localhost:3000 pnpm e2e` |
| Xem trình duyệt chạy | `pnpm e2e --headed` |

Lần đầu chạy `pnpm e2e` trên máy mới cần tải trình duyệt: `pnpm exec playwright install chromium`.

`pnpm e2e` build bản production với **mọi cờ chế độ bật** (`TRIAL_ENABLED`, `DESTINY_ENABLED`, `EXPEDITION_ENABLED`, `TAM_TUONG_KY_ENABLED`, `FORMATION_RANKED_ENABLED`) và kho trong bộ nhớ, nên không cần database, SMTP hay khóa OAuth. Cấu hình ở `playwright.config.ts`. Lệnh này ghi đè thư mục `.next` của máy.

## 2. Tầng 2: CI

CI có hai job chạy song song, cả hai phải xanh:

| Job | Kiểm gì |
|---|---|
| **Lint, typecheck, docs, test, build** | Như `pnpm check`, thêm `pnpm build` |
| **Smoke test trình duyệt** | `pnpm e2e` trên hai cỡ màn (máy tính 1280px, điện thoại Pixel 7) |

Smoke test (`e2e/smoke.spec.ts`) kiểm game còn chạy được trên trình duyệt thật, không kiểm luật chơi:

- Mọi màn trong `src/app/game/scene.ts` (trừ màn đăng nhập và màn trận) mở được khi đã đăng nhập: không lỗi JS, không phản hồi 5xx, không tràn ngang, thanh đầu trang hiện đúng tên màn, không có dòng "Không tải được". **Thêm màn mới vào `scene.ts` là smoke test tự đi qua màn đó.**
- Trang chủ mở được.
- Khách vào được trận Thao Luyện; khách bị chặn ở chế độ xếp hạng và thấy nút "Đăng nhập để chơi".
- Tài khoản tạo được trận Giao Tranh trên máy chủ.
- Tháp Thiên Mệnh: khóa đội hình, chuẩn bị tầng 1, nút dừng có xác nhận, vào trận.
- Tháp Thí Luyện: mở được tầng 1.

**Khi CI đỏ:**

1. Mở lần chạy trên tab Actions của GitHub, xem bước đỏ.
2. Job smoke test đỏ thì tải artifact `playwright-report`, giải nén rồi chạy `pnpm exec playwright show-report playwright-report`. Mỗi test đỏ có ảnh chụp màn lúc lỗi.
3. Chạy lại đúng lệnh đó trên máy để tái hiện, sửa, rồi đẩy lại.

Smoke test được thử lại một lần trên CI; test chỉ xanh ở lần thử lại vẫn hiện là *flaky* trong báo cáo. Test chập chờn phải sửa ngay, không bỏ qua hay tắt.

**Bảo vệ nhánh (Shan bật một lần trên GitHub):** Settings → Branches → Add branch ruleset cho `develop` và `main` → bật *Require status checks to pass*, chọn hai check **Lint, typecheck, docs, test, build** và **Smoke test trình duyệt**. Khi đó PR đỏ không merge được.

## 3. Viết test ở đâu

| Thư mục | Loại | Ví dụ |
|---|---|---|
| `tests/core/` | Luật chơi, tính toán thuần (không mạng, không trình duyệt) | sát thương, luật tầng, Phúc |
| `tests/server/` | Luồng máy chủ với kho trong bộ nhớ | mở trận, chốt kết quả, phát thưởng, chống gửi lặp |
| `tests/game/` | Logic giao diện thuần (không dựng trình duyệt) | chọn tướng hợp luật, chữ hiển thị |
| `tests/scripts/` | Script trong `scripts/` | `check-docs` |
| `e2e/` | Trình duyệt thật, chỉ smoke | màn mở được, luồng chính tới được trận |

Quy tắc:

- **Sửa lỗi kèm một test tái hiện lỗi đó**: test đỏ trước khi sửa, xanh sau khi sửa.
- **Đổi luật hoặc số liệu** kèm test và sửa tài liệu luật trong cùng PR. Đổi số cân bằng thì chạy mô phỏng của chế độ đó ([mục 4](#4-tầng-3-checklist-trước-phát-hành)).
- Chế độ mới có ít nhất: test luật ở `tests/core/`, test luồng máy chủ ở `tests/server/` nếu có máy chủ, và một luồng chính trong `e2e/smoke.spec.ts`.
- Không xóa, bỏ qua (`skip`) hay nới test chỉ để CI xanh. Test sai thì sửa test và nói rõ lý do trong PR.
- E2E chỉ thêm khi luồng đó không kiểm được bằng test đơn vị; giữ cả bộ dưới 3 phút.

## 4. Tầng 3: checklist trước phát hành

Chạy trước khi gộp `develop` vào `main`. Ghi kết quả vào mô tả PR phát hành.

**Chung (mọi lần):**

- [ ] CI xanh trên commit sẽ phát hành.
- [ ] Đọc mục mới nhất của [changelog](../decisions/changelog.md) để biết chế độ nào có thay đổi.
- [ ] Kiểm kê giao diện 4 cỡ màn: chạy `pnpm dev`, rồi `node scripts/ui-audit.mjs --register`. Phải báo "Đạt"; cảnh báo vùng chạm nhỏ và chữ nhỏ thì xem có mới phát sinh không.
- [ ] Biến môi trường trên Vercel: cờ chế độ đúng ý muốn, `SESSION_SECRET` và `DATABASE_URL` có giá trị.
- [ ] Có migration mới trong `drizzle/` thì đã thử trên nhánh Neon staging ([runbook](../02-game-modes/dual-tower/06-06-neon-staging-runbook.md)).

**Theo chế độ có thay đổi:** chạy mô phỏng nếu đổi số cân bằng, rồi chơi tay trên điện thoại và máy tính.

| Chế độ | Mô phỏng khi đổi số | Chơi tay tối thiểu |
|---|---|---|
| Luật trận, nghề, hệ, kỹ năng | `pnpm sim -- --mode 3v3 --battles 200`; `node --import tsx scripts/profession-balance.ts` | Một trận Thao Luyện 1vs1 và 3vs3 tới hết |
| Bình Loạn, Tái đấu sứ quân | `pnpm exec tsx scripts/campaign-balance.ts --runs 200` | Một nhiệm vụ sự kiện và một nhiệm vụ có trận; nhận thưởng lần đầu |
| Tháp Thí Luyện | `pnpm exec tsx scripts/trial-puzzle-qa.ts` | Vượt tầng 1, nhận đá lần đầu, quét tháp |
| Tháp Thiên Mệnh | `pnpm exec tsx scripts/destiny-stone-sim.ts` | Khóa đội hình, thắng một tầng, chọn Phúc, chọn hồi phục, dừng lượt leo |
| Trấn Ải | `pnpm exec tsx scripts/survival-v11-balance.ts` | Qua hai đợt, đổi tướng ở lúc nghỉ, dừng để ghi điểm |
| Quần Hùng, Nhật Lệnh | (dùng luật trận) | Đánh một trận, xem bảng xếp hạng |
| Trận Đồ | `pnpm exec tsx scripts/binh-phap-sim.ts --runs 2000` | Một ván chơi thường; xếp hạng nếu cờ bật |
| Tầm Tướng Ký | `pnpm exec tsx scripts/tam-tuong-ky-sim.ts` | Ghép ra một tướng ở chế độ Thường |
| Viễn Chinh | `pnpm exec tsx scripts/expedition-sim.ts --runs 100` | Tiến một ngày, đánh một trận, giáp công |
| Khai Lộ | (không có) | Qua một màn |
| Tài khoản | (không có) | Đăng ký, đăng xuất, đăng nhập lại; quên mật khẩu nếu có SMTP |

Kết quả mô phỏng lệch xa số trong tài liệu luật của chế độ thì dừng phát hành và hỏi Shan.
