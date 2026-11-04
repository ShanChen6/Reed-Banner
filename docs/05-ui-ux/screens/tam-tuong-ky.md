# Giao diện Tầm Tướng Ký

> Cập nhật: 03/11/2026
> Trạng thái: **DRAFT** — LT-03: màn chế độ Thường đã có code (`src/app/game/tam-tuong-ky/`), bật bằng cờ `TAM_TUONG_KY_ENABLED` (mặc định tắt). Bản xem trước chưa lưu, chưa tốn phiếu; chờ Shan chơi thử và góp ý.

Luật ở [Design Freeze](../../02-game-modes/future/14-tam-tuong-ky-design-freeze.md); nội dung công thức ở [catalog LT-01](../../02-game-modes/future/15-tam-tuong-ky-lt01-catalog.md). Tài liệu này chỉ nói về giao diện.

## 1. Vào màn

- Đường dẫn `/game/tam-tuong-ky`, phân cảnh `TAM_TUONG_KY`.
- Cờ tắt: thẻ Home giữ “Sắp ra mắt”, mở thẳng đường dẫn thì hiện “Chế độ này chưa mở”.
- Cờ bật: thẻ Home thành “Đã mở” và dẫn vào màn. Khách thấy màn nhắc đăng nhập kèm lý do tốn phiếu (A-14).

## 2. Bố cục

| Màn | Cách xếp |
|---|---|
| ≥ 1024px | Ba cột: Vạn Vật Lục (trái ~26%), Đài Hợp Nguyên (giữa ~44%, dính khi cuộn), Tướng Lục (phải ~30%) |
| < 1024px | Đài Hợp Nguyên ở trên; hai nút chọn sổ “Vạn Vật Lục” / “Tướng Lục x/y” bên dưới; thanh **Hợp Nguyên** cố định ở đáy màn hình |

Tông gỗ tối, giấy dó, đồng cổ dùng token `--atlas-*` và khung `atlas-frame` của Sử ký; dùng chung Global Game Header. Dòng “Công thức biểu trưng của trò chơi, không phải diễn giải sử học” luôn hiện dưới tiêu đề (P-25).

## 3. Các vùng

**Vạn Vật Lục**
- Ô tìm kiếm không phân biệt dấu (“thap dao” ra “Thập đạo”).
- Lọc theo nhóm (Nguyên tố, Thiên nhiên, Binh khí, Cờ hiệu, Thư tịch, Ngọc); chỉ hiện nhóm đã có yếu tố.
- Nút yếu tố cao ≥ 44px; 7 nguyên tố dùng icon hệ có sẵn, yếu tố khác dùng chữ cái đầu trong vòng đồng (chưa có icon riêng).
- Bấm yếu tố: điền ô trước, rồi ô sau; đủ hai ô thì thay ô sau. Bấm cùng yếu tố hai lần được (`A+A`). Không có kéo thả.

**Đài Hợp Nguyên**
- Hai ô có nhãn **Ô trước** / **Ô sau**, mỗi ô có nút Bỏ; nút ⇄ đổi chỗ hai ô; dòng nhắc thứ tự ô có nghĩa.
- Nút Hợp Nguyên chỉ bấm được khi đủ hai ô và còn lần ghép.
- Ô thông báo `aria-live`: khám phá mới, tìm thấy chân dung, đã biết (không trừ lần ghép), chưa tìm được mối liên hệ, yếu tố không hợp lệ. Hiệu ứng sáng lên chỉ chạy khi không bật giảm chuyển động.
- Số lần ghép còn lại của lượt (15) và nút “Lượt mới” khi hết; số gợi ý hôm nay (2), hai nút “Gợi ý nhóm” và “Gợi ý nguyên liệu”.
- “Lần ghép gần đây”: 5 lần gần nhất, thu gọn mặc định.

**Tướng Lục**
- Đủ số tướng của pack (A-15). Tướng chưa tìm: vòng “?”, chữ “Tướng chưa tìm thấy” và bậc; không có tên, chân dung hay nghề/hệ trong HTML lẫn aria.
- Tướng đã tìm: chân dung thật (`Portrait`), tên, bậc, icon và tên nghề/hệ đọc từ roster, vật biểu trưng là hai nguyên liệu công thức cuối (A-16). Chưa có tiểu sử.
- Dòng “Tìm thấy chân dung chỉ ghi vào Tướng Lục, không thêm tướng vào đội”. Không có chữ nhận tướng, chiêu mộ hay vàng.
- Ghép ra tướng trên điện thoại thì tự chuyển sang Tướng Lục.

## 4. Bản xem trước so với bản thật

| Mục | LT-03 (bây giờ) | Sau LT-04 |
|---|---|---|
| Sổ khám phá | Trong bộ nhớ trang, tải lại là mất | Lưu theo tài khoản trên server |
| Lượt | 15 lần ghép, “Lượt mới” không tốn gì | Mở lượt tốn 1 phiếu |
| Gợi ý | Đếm trong trang | 2 lượt mỗi ngày, server đếm |
| Chế độ Hạng | Chưa có | LT-06 |

## 5. Đã kiểm

- `tests/game/tam-tuong-ky-screen.test.ts` (13 test): chọn ô, đổi chỗ, `A+A`; tìm không dấu và lọc nhóm; lời thông báo; Tướng Lục không lộ tướng chưa tìm; dựng màn không có tên tướng hay chữ thưởng; phân cảnh và cờ.
- Playwright với cờ bật: khách thấy màn nhắc đăng nhập; đăng ký rồi ghép ra Đinh Ngọc ở 1440px và iPhone 13 (390px); không tràn ngang ở 320, 768, 1024px; thẻ Home dẫn vào màn.

> TODO: Icon riêng cho từng yếu tố trung gian, chế độ Hạng, kéo thả (tùy chọn) và hiệu ứng mở sách; Shan chơi thử rồi góp ý.
