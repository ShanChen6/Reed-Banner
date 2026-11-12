# 19 — Tầm Tướng Ký: chế độ Hạng tuần LT-06

> Cập nhật: 04/11/2026
> Trạng thái: **DRAFT** — có code sau cờ `TAM_TUONG_KY_ENABLED` (mặc định tắt; từ 04/11/2026 Hạng đi cùng cờ chế độ, không còn biến riêng). Chờ Shan chơi thử.

Luật theo [Design Freeze](design-freeze.md) (A-7, A-8, A-9, A-19, A-23, P-11…P-19, Shan duyệt L5-1…L5-7 ngày 04/11/2026). Nội dung tướng và lời dẫn ở [Gói 1](goi-1.md). Phần chế độ Thường ở [server LT-04](server.md).

## 1. Luật đã code

| Mục | Cách chạy |
|---|---|
| Tuần | Thứ Hai 0 giờ giờ Việt Nam (`seasonKey`), cùng khóa với Trấn Ải, Quần Hùng |
| Đề cử | 7 tướng mỗi tuần, giống nhau cho mọi người, xoay vòng cố định qua 12 tướng của Gói 1; tuần nào cũng có ít nhất 1 tướng đặc biệt; sau 12 tuần mỗi tướng được đề cử đúng 7 lần |
| Hiển thị đề cử (A-23) | Mỗi ô chỉ có **lời dẫn** và **điểm** (lịch sử 300, đặc biệt 200). Tên và chân dung chỉ hiện sau khi ghép ra; server không gửi tên tướng chưa tìm |
| Túi nguyên tố (P-11) | Theo tài khoản, không reset. **Đơn vị tự chọn**: mỗi đơn vị dùng làm nguyên tố hệ nào cũng được; một bó = 7 đơn vị |
| Cấp nền (P-12) | Lần đầu vào chế độ Hạng mỗi tuần +3 bó (21 đơn vị) |
| Kho tuần (P-14) | Yếu tố trung gian ghép ra nằm trong kho tuần; sang tuần mới bỏ kho, đơn vị dư trong túi giữ nguyên |
| Ghép (A-8, P-15) | Tiêu 1 đơn vị mỗi nguyên liệu (`A+A` tiêu 2), cả khi ghép sai, không hoàn lại. Tướng không vào kho, không làm nguyên liệu. Công thức mới cũng ghi vào sổ khám phá và Tướng Lục |
| Gợi ý | Không có; không tốn phiếu |
| Điểm (P-18) | Mỗi tướng đề cử tính một lần trong tuần; tướng không đề cử không có điểm (vẫn vào Tướng Lục) |
| Bảng tuần | `season_scores` chế độ `tamTuongKy`; điểm lưu = điểm × 1000 + (999 − đơn vị đã tiêu), nên bằng điểm thì ai tiêu ít hơn đứng trên, rồi ai đạt trước |
| Cửa hàng (A-19, P-13) | 300 vàng một bó, tối đa 2 bó mỗi tuần; trừ vàng cùng lần ghi hồ sơ |
| Thưởng hạng (P-19) | Vàng 500 / 300 / 180 / 80 / 30 + bó theo P-11, qua sổ `rank_reward_claims` |

## 2. Bó trong thưởng hạng các chế độ

Thưởng hạng **chế độ theo tuần** kèm bó: Tháp Thiên Mệnh, Trấn Ải, Quần Hùng, Tầm Tướng Ký (sổ chung) và Trận Đồ Đại trận (sổ riêng). Hạng 1 → 5 bó; 2–3 → 4; 4–10 → 3; nửa trên → 2; có tên → 1. Nhật Lệnh, Trận Đồ Thường/Khó (theo ngày) không có bó.

- Chỉ cộng cho người đã vào Tầm Tướng Ký (có dữ liệu chế độ trong hồ sơ).
- Khi cờ `TAM_TUONG_KY_ENABLED` tắt: không cộng bó và danh sách thưởng chờ nhận không nhắc tới bó (không lộ chế độ chưa phát hành).
- Bảng tuần Tầm Tướng Ký chỉ là nguồn thưởng hạng khi cờ Hạng bật.

## 3. API

Cờ tắt: `403 featureDisabled`; khách: `401 loginRequired`; POST cùng Origin; `requestId` chống trừ hai lần.

| Đường dẫn | Việc | Lỗi |
|---|---|---|
| `GET /api/tam-tuong-ky/ranked` | Tuần hiện tại: túi, kho tuần, điểm, đơn vị đã tiêu, 7 ô đề cử, cửa hàng, vàng, top 10 bảng tuần và hạng của mình. Vào tuần lần đầu thì ghi cấp nền | |
| `POST /api/tam-tuong-ky/ranked/combine {requestId, first, second}` | Ghép; tướng đề cử mới thì ghi bảng tuần | `409 conflict` |
| `POST /api/tam-tuong-ky/ranked/buy {requestId}` | Mua một bó | `409 noGold`, `409 shopLimit` |
| `GET /api/tam-tuong-ky/board[?week=current\|<thứ Hai>]` | Bảng tuần cho trang Xếp hạng: top 50, điểm và số nguyên tố đã tiêu, hạng của mình | `400 badRequest` |

## 4. Thay đổi kèm ở chế độ Thường

- **Gợi ý nhắm tướng** (L5-5): công thức gợi ý là công thức ghép được ngay trên đường tới tướng chưa tìm còn ít bước nhất; mức 1 lộ nhóm, mức 2 lộ một nguyên liệu, vẫn 2 lượt/ngày.
- **Dấu “còn công thức chưa tìm”** (L5-4): chấm vàng trên yếu tố trong Vạn Vật Lục còn là nguyên liệu của công thức chưa tìm; trình đọc màn hình đọc “còn công thức chưa tìm”. Không có ở chế độ Hạng.

## 5. Kiểm thử

- `tests/core/tam-tuong-ky/ranked.test.ts` (16 test): khóa tuần, xoay vòng đều, cấp nền một lần mỗi tuần, sang tuần, điểm theo bậc một lần, tướng không đề cử 0 điểm, ghép sai mất nguyên liệu, `requestId` lặp, điểm bảng mùa, cửa hàng, lưu/đọc, gợi ý nhắm tướng, dấu còn công thức.
- `tests/core/tam-tuong-ky/engine.test.ts`: ghép Hạng với túi tự chọn (9 test).
- `tests/server/tamTuongKyRanked.test.ts` (10 test): cờ, khách, cấp nền, ô đề cử không lộ tên, ghép ra tướng ghi bảng tuần, gửi trùng song song, cửa hàng, bó trong thưởng hạng khi cờ bật/tắt, bảng tuần là nguồn thưởng.
- `tests/game/tam-tuong-ky-screen.test.ts`: dấu còn công thức; màn Hạng có 7 lời dẫn, không lộ tên, không có nút gợi ý.
- Playwright với hai cờ bật: ghép ra tướng đặc biệt đề cử (+200 điểm, túi 21 → 11), bảng tuần có tên, tải lại vẫn giữ, nút mua khóa khi không có vàng; iPhone 13 không tràn ngang.

Trang Xếp hạng có tab **Tầm Tướng Ký** (chỉ khi cờ Hạng bật, mở thẳng bằng `/game/leaderboard?board=tamTuongKy`): chỉ bảng tuần này, mỗi dòng ghi điểm và số nguyên tố đã tiêu.

> TODO: lời dẫn dạng ảnh.
