# Tam Quân Kỳ: cờ tư lệnh trên sa bàn tập trận

> Cập nhật: 23/11/2026 (thêm đấu sứ quân có thưởng và đấu online 1vs1, server làm trọng tài)
> Trạng thái: **IMPLEMENTED (bản thử)** — ý tưởng và bản đề xuất của Shan; luật lấy nguyên từ Cờ Việt Nam của Shanverse. Luyện với máy và hai người cùng máy chạy trên trình duyệt; đấu sứ quân có thưởng và đấu online 1vs1 do server làm trọng tài. Tranh quân, sa bàn và thẻ chế độ do Shan vẽ (23/11/2026).

## 1. Định vị

Chế độ đấu trí hai phe theo lượt, không dùng bàn match-3. Tích "cờ lau tập trận": cậu bé Đinh Bộ Lĩnh bày binh trên sa bàn đất, cát và nước, đánh nhau với một trong 12 sứ quân. Tên "Tam Quân" là ba quân bộ, thủy và thiên mã (quân bay).

Thẻ chế độ nằm ở mục **Sắp ra mắt** trên màn Chiến Trường (bấm được, ghi "Bản thử, có thưởng khi thắng sứ quân"). Đường dẫn `/game/three-armies`, scene `TAM_QUAN_KY`.

## 2. Luật

Giữ **nguyên** luật Cờ Việt Nam của Shanverse (bàn 11 × 12, mỗi bên 19 quân, chở quân, vùng cấm bay, anh hùng, chiếu bí, giữ Soái trướng ba lượt). Không đổi luật cho hợp bối cảnh.

- Engine chép từ repo `ShanChen6/shanverse`, `src/features/games/co-viet-nam/logic.ts` và `ai.ts` (commit `b3c8241`), vào `src/core/tam-quan-ky/`, ghi nguồn đầu file. Shan chọn chép thay vì tách package (23/11/2026): **sửa luật thì sửa cả hai repo**.
- Khác bản gốc một chỗ: `chooseMove` nhận đồng hồ `now` từ nơi gọi, vì `src/core` không được đọc giờ hệ thống.
- Test luật và AI chép theo vào `tests/core/tam-quan-ky/`.
- Luật đầy đủ cho người chơi nằm ở thẻ Hướng dẫn (`MODE_GUIDES.TAM_QUAN_KY` trong `src/app/game/modeGuides.ts`).

## 3. Tên quân

Tên chỉ ở lớp giao diện (`src/app/game/tam-quan-ky/pieces.ts`).

| Mã | Quân gốc | Tên cổ trang |
|---|---|---|
| c | Commander | Chủ tướng |
| h | Headquarters | Soái trướng (không gọi Doanh trại để khỏi trùng màn hồ sơ) |
| i | Infantry | Bộ binh |
| m | Militia | Hương binh |
| e | Engineer | Phu cầu |
| t | Tank | Voi chiến |
| a | Artillery | Máy bắn đá |
| g | Anti-air | Nỏ thủ |
| s | Missile | Hỏa tiễn |
| f | Air force | **Thiên mã** (Shan chốt 23/11/2026: ngựa bay chở được voi) |
| n | Navy | Chiến thuyền |

## 4. Sa bàn

| Bàn gốc | Sa bàn |
|---|---|
| Biển (cột a, b) | Đầm sen |
| Bờ biển (cột c) | Bãi lau |
| Sông giữa hàng 6 và 7 | Sông nhỏ |
| Hai cầu (cột f, h) | Cầu tre |
| Cửa sông d6, e6, d7, e7 | Bến thuyền |

Tranh nền `public/art/tam-quan-ky/sa-ban.webp` (1200 × 1300, đúng tỉ lệ bàn 12 : 13 đơn vị). Code kẻ lưới và đặt quân lên trên; xoay sa bàn thì xoay tranh nửa vòng. Prompt và khung toạ độ ở thư mục dự án `art/prompts/tam-quan-ky.md`.

Bản Shan vẽ (23/11/2026) lệch so với khung: đầm và sông cao hơn, cầu thứ hai ở cột j. Claude dời cả tranh sang phải và xuống 50 px, chuyển hai cầu về cột f và h; bản gốc lưu ở thư mục dự án `art/tam-quan-ky/sa-ban-goc.png`.

Quân: `public/art/tam-quan-ky/quan/<mã>.webp` (256 × 256, cắt tròn từ bảng quân Shan vẽ), một hình cho cả hai phe; code vẽ viền đỏ hoặc xanh quanh hình. Thẻ chế độ và banner: `public/art/home/tam-quan-ky.webp` (cắt 16 : 9 từ tranh chính).

## 5. Màn chơi

- Cách chơi (bốn lựa chọn):
  - **Luyện với sứ quân**: máy ba độ khó, nghĩ trong web worker, chạy trên trình duyệt, không thưởng.
  - **Đấu sứ quân có thưởng**: server làm trọng tài (mục 6).
  - **Hai người cùng máy**: trên trình duyệt, không thưởng.
  - **Đấu người 1vs1** (online): hai tài khoản trên hai máy, server làm trọng tài (mục 6).
- Đối thủ: chọn 1 trong 12 sứ quân (`WARLORD_ENCOUNTERS`), chỉ đổi tên và chân dung. Đỏ luôn là quân Bộ Lĩnh, đi trước; đấu máy thì bạn chọn cầm phe nào.
- Đồng hồ mỗi bên: không giới hạn, 10, 15 hoặc 30 phút.
- Không có đi lại ở mọi cách chơi (Shan 23/11/2026). Xoay sa bàn, ván mới, đầu hàng; nhật ký trận; ván dở lưu ở trình duyệt (`reed-banner:tam-quan-ky:save:v1`). Không có dòng mô tả nước đi dưới sa bàn vì nhật ký đã ghi (Shan 23/11/2026); dòng đó chỉ còn cho trình đọc màn hình.
- Bố cục (Shan 23/11/2026, theo kiểu bàn cờ vây): sa bàn ở giữa, co theo chiều cao màn cả ở trang thường lẫn khi phóng to; bên trái là thẻ phe ở mép dưới sa bàn (thường là bạn) kèm thoại Bộ Lĩnh, quân đang chọn và nút thao tác; bên phải là thẻ phe kia và nhật ký trận. Màn hẹp xếp dọc: thẻ đối thủ, sa bàn, thẻ của bạn. Thành phần dùng chung với Vây Thành Kỳ: `src/app/game/DuelLayout.tsx`.
- Hướng dẫn: thẻ Hướng dẫn có mục "Quân và cách đi", mỗi quân kèm hình tầm đi vẽ thẳng từ luật (`ReachDiagram.tsx`).
- Bản đồ: chọn ở phần chuẩn bị, nhớ theo trình duyệt. Mọi bản đồ cùng bố cục địa hình, chỉ khác cảnh. Sáu bản, tranh Shan vẽ (23/11/2026), Claude căn về lưới (dời đầm, sông, cầu về đúng cột, hàng): Đầm Hoa Lư, Đồng xuân tháng giêng, Hoa Lư thu muộn, Đêm trăng tập trận, Thung Tràng An, Cửa Bố Hải. Gốc và bản đã căn ở `art/tam-quan-ky/ban-do/` trong thư mục dự án.
- Thoại: Đinh Bộ Lĩnh nói một câu ngắn khi vào trận, khi chiếu tướng, khi bị chiếu, khi có anh hùng mới bên Đỏ, khi thắng, thua, hòa (`src/app/game/tam-quan-ky/lines.ts`). Lời game sáng tác, không phải lời nhân vật lịch sử.

## 6. Server làm trọng tài (Shan chốt 23/11/2026)

Code: luật ván `src/core/tam-quan-ky/match.ts`, dịch vụ `src/server/tamQuanKy.ts`, API `/api/tam-quan-ky`, bảng `tqk_matches` (migration 0016), giao diện `ServerPlay.tsx` và `useServerMatch.ts`.

- Cần đăng nhập. Mọi nước đi gửi lên server; server kiểm lượt, luật và đồng hồ rồi mới lưu (ghi kèm điều kiện `seq`). Trình duyệt chỉ hiện ván server trả về.
- **Đấu sứ quân có thưởng**: chọn sứ quân, phe, độ khó. Máy tính nước ngay trong request của người chơi (engine `chooseMove`, cùng độ khó như bản luyện). Không đi lại, không đồng hồ. Thắng được vàng: Dễ 20, Thường 40, Khó 80; tối đa **3 ván có vàng mỗi ngày** (giờ Việt Nam), thắng thêm vẫn ghi kết quả nhưng không có vàng. Thua, hòa, đầu hàng không có vàng. Mức vàng do Claude đặt, chờ Shan duyệt.
- **Đấu online 1vs1**: người mở phòng cầm Đỏ, nhận mã 6 ký tự; người kia nhập mã, cầm Xanh. Bắt buộc đồng hồ 10, 15 hoặc 30 phút mỗi bên; đồng hồ Đỏ chạy khi có người vào. Trình duyệt hỏi lại server mỗi 1,5 giây suốt ván (bên kia có thể đầu hàng hay hết giờ bất cứ lúc nào). Hết giờ được xử khi có request tới (bên nào hỏi cũng được). Mã hết hạn sau 30 phút nếu chưa ai vào; chủ phòng hủy được phòng đang chờ. Giao hữu, **không có vàng**, để hai tài khoản không dàn xếp lấy vàng.
- Ván dở nhớ theo trình duyệt (`reed-banner:tam-quan-ky:server:v1`), tải lại trang thì về đúng ván.
- Tắt nhanh cả hai chế độ server bằng biến môi trường `TAM_QUAN_KY_SERVER_ENABLED=false` (mặc định bật; luyện với máy và hai người cùng máy vẫn chạy).

## 7. Chưa làm

- Dấu anh hùng bằng tranh (đang là chấm vàng; prompt đã có).
- Bảng công trạng hay xếp hạng online; dọn ván cũ trong `tqk_matches` bằng việc định kỳ.
