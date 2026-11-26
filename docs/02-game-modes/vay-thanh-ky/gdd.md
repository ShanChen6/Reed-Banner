# Vây Thành Kỳ: cờ vây bảy nguyên tố

> Cập nhật: 23/11/2026 (bản thử đầu tiên)
> Trạng thái: **IMPLEMENTED (bản thử)** — Shan đề xuất và chốt tên 23/11/2026; luật lấy nguyên từ cờ vây của Shanverse. Đấu sứ quân và hai người cùng máy chạy trên trình duyệt; đấu người bằng mã phòng do server làm trọng tài. Đấu sứ quân có thưởng (23/11/2026) chạy trên server.

## 1. Định vị

Chế độ đấu trí hai phe theo lượt, không dùng bàn match-3. Mỗi bên chọn một trong 7 nguyên tố của game (Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Phong): quân thành quả cầu nguyên tố, đất quanh quân đổi nền theo hệ (Hỏa nham thạch nứt, Mộc cỏ, Thủy băng...). Ý tưởng tham khảo các bàn cờ vây đổi theo hệ; hình và mã tự làm.

Thẻ chế độ nằm ở mục **Sắp ra mắt** trên màn Chiến Trường (bấm được, ghi "Bản thử, cờ vây bảy nguyên tố"). Đường dẫn `/game/go`, scene `VAY_THANH_KY`.

## 2. Luật

Giữ **nguyên** luật cờ vây của Shanverse: bàn 9, 13 hoặc 19; bắt quân khi hết khí; cấm tự sát; luật cướp đơn (ko); đếm đất kiểu Trung Quốc (quân + đất vây), komi 7,5 cho bên đi sau. Có thêm luật nhập môn "Bắt quân trước": bắt đầu từ thế chéo giữa bàn, ai bắt được quân trước thắng.

- Engine chép từ repo `ShanChen6/shanverse`, `src/features/games/go/logic.ts` và `mcts.ts` (commit `bf8666b`), vào `src/core/co-vay/`, ghi nguồn đầu file. **Sửa luật thì sửa cả hai repo.**
- Khác bản gốc: `search` nhận đồng hồ `now` từ nơi gọi (src/core không đọc giờ hệ thống); thêm `!` cho chế độ `noUncheckedIndexedAccess`. Bản Shanverse còn dùng mạng KataGo 27 MB cho máy tính bàn, ở đây chưa đem sang: máy chỉ dùng MCTS.
- `src/core/co-vay/ai.ts`: `chooseMove` (độ khó Dễ, Thường, Khó; tự bỏ lượt theo khi đang dẫn; xin thua khi hết hy vọng) và `guessDead` (đoán quân chết để đếm điểm).
- Test luật và máy chép theo vào `tests/core/co-vay/`.
- Luật cho người chơi nằm ở thẻ Hướng dẫn (`MODE_GUIDES.VAY_THANH_KY` trong `src/app/game/modeGuides.ts`).

## 3. Nguyên tố

Chỉ là lớp giao diện, không đổi luật (`src/app/game/vay-thanh-ky/theme.tsx`, `Board.tsx`).

- Quân: quả cầu tô màu hệ, giữa là biểu tượng hệ Shan vẽ (`public/art/elements/<hệ>.webp`).
- Quân có bóng đổ, viền sáng và vệt bóng như quả cầu ngọc (`OrbDefs`).
- Nền đất: mỗi hệ hai tấm tranh Shan vẽ (`public/art/vay-thanh-ky/ground/<hệ>-calm.webp` và `<hệ>-core.webp`). Tấm `calm` dịu, phủ vùng đất theo ảnh hưởng của quân trong bán kính 3 (lúc đếm điểm theo chủ đất thật, `scoreArea`), mép vùng làm mờ. Tấm `core` rực, chỉ hiện trong quầng tròn quanh mỗi quân còn sống, lặp thành tấm nhỏ để mỗi quân một mảng khác. Đất chưa ai giữ là nền đá xám vẽ bằng bộ lọc SVG (`GroundFilter`).
- Tranh đất được làm dịu bằng bộ lọc (bớt tương phản, bớt rực) để lưới nổi lên. Lưới kẻ hai lớp: viền sáng mảnh dưới nét tối, đọc được trên cả nền sáng lẫn nền tối.
- Hai bên không chọn trùng hệ. Đấu sứ quân: hệ đối thủ mặc định là hệ của sứ quân, đổi được.
- Bố cục hai bên (`Arena` trong `parts.tsx`): màn rộng từ 64rem, khung người chơi đứng dọc hai bên bàn, nền là tranh dọc của hệ (`public/art/vay-thanh-ky/panel/<hệ>.webp`), bàn co theo chiều cao màn để vừa cả thanh nút (kể cả khi phóng to). Màn hẹp: hai khung ngang xếp trên bàn.
- Tranh thẻ chế độ `public/art/home/vay-thanh-ky.webp`, banner đầu màn `public/art/vay-thanh-ky/banner.webp` (Shan vẽ 24/11).

## 4. Cách chơi

| Cách | Nơi chạy | Ghi chú |
|---|---|---|
| Luyện với sứ quân | Trình duyệt (web worker) | Chọn 1 trong 12 sứ quân, ba độ khó, đi trước hay sau. Có đi lại. Ván dở lưu ở trình duyệt. Không vàng |
| Đấu sứ quân có thưởng (23/11/2026) | Server (`goStartAi` trong `src/server/coVay.ts`, `/api/go` action `ai`, cột `ai`, `reward`, `reward_day` của `go_matches`, migration 0018) | Chọn như ván luyện. Máy tính nước ngay trong request (MCTS, trần 2,5 giây mỗi nước), không đồng hồ, không đi lại. Thắng được 20, 40, 80 vàng theo độ khó, tối đa 3 ván có vàng mỗi ngày, cùng mức Tam Quân Kỳ (Claude đặt, chờ Shan duyệt). Cần trình danh |
| Hai người cùng máy | Trình duyệt | Chọn hệ cho bên đi trước và đi sau |
| Đấu người bằng mã phòng | Server (`src/server/coVay.ts`, `/api/go`, bảng `go_matches`) | Người mở phòng đi trước, chọn luật, cỡ bàn, đồng hồ 10/20/30 phút. Người vào bằng mã đi sau; chọn trùng hệ thì server đổi sang hệ khác. Hai bên cùng bỏ lượt thì server tự đoán quân chết và đếm điểm (seed cố định theo ván), không có bước thỏa thuận. Giao hữu, cần trình danh. Tắt nhanh bằng `VAY_THANH_KY_SERVER_ENABLED=false` |

Ván ở trình duyệt: hai bên cùng bỏ lượt thì máy đoán quân chết, người chơi bấm nhóm quân để sửa rồi Chốt điểm, hoặc Đánh tiếp.

## 5. Còn mở

- Tranh thẻ chế độ, banner và nền đất vẽ tay cho từng hệ.
- Mạng KataGo cho máy tính bàn như Shanverse.
