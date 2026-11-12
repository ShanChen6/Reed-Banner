# 17 — Tầm Tướng Ký: server chế độ Thường LT-04

> Cập nhật: 04/11/2026
> Trạng thái: **DRAFT** — có code sau cờ `TAM_TUONG_KY_ENABLED` (mặc định tắt): phiếu, lượt, gợi ý theo ngày, sổ khám phá theo tài khoản, phiếu từ nhiệm vụ, thành tựu bộ. Chờ Shan chơi thử.

Luật theo [Design Freeze](design-freeze.md) (A-5, A-6, A-12, A-13, A-14, P-8, P-9, P-10, P-20, P-23). Giao diện ở [màn Tầm Tướng Ký](../../05-ui-ux/screens/tam-tuong-ky.md).

## 1. Dữ liệu

Lưu trong hồ sơ tài khoản (`Profile.tamTuongKy`, bảng hồ sơ có sẵn, không thêm bảng hay migration). Chưa vào chế độ lần nào thì không có trường này; lần ghi đầu tiên tạo tài khoản mới với **3 phiếu**.

| Trường | Nội dung |
|---|---|
| `discovery` | Sổ khám phá (engine LT-02): node và công thức đã tìm, theo gói và `contentVersion` |
| `tickets` | 0–10 phiếu |
| `session` | Lượt đang mở: `combinesLeft` (15 khi mở), `startedAt`; hết hạn sau 24 giờ |
| `hints` | Ngày (giờ Việt Nam) và số gợi ý đã dùng trong ngày đó |
| `receipts` | 16 phản hồi gần nhất theo `requestId` |

Đọc hồ sơ: dữ liệu hỏng thì bỏ trường (như chưa vào chế độ); ID không còn trong catalog bị bỏ, đủ 7 starter, tướng đã mở giữ nguyên.

## 2. API

Mọi API: cờ tắt trả `403 featureDisabled`; khách hoặc không có cookie trả `401 loginRequired` (A-14); POST phải cùng Origin. Phản hồi `{ view, response }` hoặc `{ error, view }`; `view` gồm phiếu, lượt, gợi ý còn lại hôm nay, sổ khám phá.

| Đường dẫn | Việc | Lỗi |
|---|---|---|
| `GET /api/tam-tuong-ky` | Trạng thái hiện tại, không ghi gì | |
| `POST /api/tam-tuong-ky/session {requestId}` | Mở lượt: đang có lượt dở thì trả lượt đó, không trừ phiếu; không thì trừ 1 phiếu | `409 noTicket` |
| `POST /api/tam-tuong-ky/combine {requestId, first, second}` | Ghép ô trước + ô sau; chỉ `created`, `noRecipe` trừ lần ghép | `409 noSession` |
| `POST /api/tam-tuong-ky/hint {requestId, level}` | Gợi ý mức 1 hoặc 2; 2 lượt mỗi ngày, không cộng dồn; không còn gì để gợi ý thì không trừ | `409 noHint` |

**Chống trùng:** cùng `requestId` (8–64 ký tự) trả lại đúng phản hồi cũ, không trừ lần hai. Ghi qua `updateProfile` có điều kiện version: hai request cùng lúc thì một bên đọc lại rồi thử lại, thấy biên nhận nên không trừ thêm. Client giữ nguyên `requestId` khi gửi lại sau lỗi mạng, và khóa nút trong lúc chờ.

## 3. Phiếu từ chế độ khác (P-10)

Cộng trong `applyProfileAction` khi nhận thưởng, cho người đã vào Tầm Tướng Ký:

| Nguồn | Phiếu |
|---|---|
| Nhận nốt nhiệm vụ ngày cuối cùng trong ngày | +1 |
| Nhiệm vụ tuần “Thắng 15 trận” | +2 |
| Điểm danh ngày thứ 7 của chuỗi | +1 |

Trần 10 phiếu. Vàng của nhiệm vụ và điểm danh giữ nguyên. Không bán phiếu.

## 4. Thành tựu bộ (A-13, P-20)

`Pack.achievementSets` khai báo bộ tướng; `ttkAchievements(pack)` đổi thành thành tựu thường (nhận một lần, vàng + tên thành tựu là huy hiệu), tiến độ đọc từ sổ khám phá. Validator chặn bộ dưới 2 tướng, tướng không có, trùng ID (`badAchievementSet`).

Chỉ gói **đã phát hành** (`PUBLISHED_PACKS`) mới hiện thành tựu ở trang Nhiệm vụ. Gói thử `slice-1` còn `draft` nên hai bộ của nó (đủ 2 tướng lịch sử 200 vàng, đủ gói 1 000 vàng) chỉ có trong test, chưa nhận được.

## 5. Kiểm thử

- `tests/core/tam-tuong-ky/account.test.ts` (25 test): phiếu, lượt, hết hạn, lần ghép bị trừ, `requestId` lặp, gợi ý theo ngày, đọc/lưu/khớp catalog, phiếu từ nhiệm vụ và điểm danh, thành tựu bộ.
- `tests/server/tamTuongKy.test.ts` (8 test): cờ tắt, khách, GET không ghi, chưa mở lượt, luồng đủ, hai request cùng `requestId` song song, hai lần mở lượt song song, hết phiếu.
- Playwright với cờ bật: đăng ký, mở lượt (3 → 2 phiếu), ghép ra Đinh Ngọc, bấm đúp Hợp Nguyên chỉ trừ 1 lần ghép, tải lại trang vẫn giữ sổ và lượt, gợi ý trừ còn 1/2.

> Chế độ Hạng tuần: [LT-06](hang-tuan.md).

> TODO: trang Nhiệm vụ chưa ghi chú phiếu Tầm Tướng Ký đi kèm thưởng; số vàng thành tựu của gói thật đặt khi phát hành gói.
