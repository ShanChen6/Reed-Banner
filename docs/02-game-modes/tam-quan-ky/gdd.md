# Tam Quân Kỳ: cờ tư lệnh trên sa bàn tập trận

> Cập nhật: 23/11/2026 (Shan chốt tên và năm điểm mở; bản thử đã code)
> Trạng thái: **IMPLEMENTED (bản thử)** — ý tưởng và bản đề xuất của Shan; luật lấy nguyên từ Cờ Việt Nam của Shanverse. Bản thử chạy trên máy người chơi, chưa có thưởng, tranh quân, sa bàn và thẻ chế độ do Shan vẽ (23/11/2026).

## 1. Định vị

Chế độ đấu trí hai phe theo lượt, không dùng bàn match-3. Tích "cờ lau tập trận": cậu bé Đinh Bộ Lĩnh bày binh trên sa bàn đất, cát và nước, đánh nhau với một trong 12 sứ quân. Tên "Tam Quân" là ba quân bộ, thủy và thiên mã (quân bay).

Thẻ chế độ nằm ở mục **Sắp ra mắt** trên màn Chiến Trường (bấm được, ghi "Bản thử, chưa có thưởng"). Đường dẫn `/game/three-armies`, scene `TAM_QUAN_KY`.

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

- Cách chơi: đấu sứ quân (máy, ba độ khó, nghĩ trong web worker) hoặc hai người cùng máy.
- Đối thủ: chọn 1 trong 12 sứ quân (`WARLORD_ENCOUNTERS`), chỉ đổi tên và chân dung. Đỏ luôn là quân Bộ Lĩnh, đi trước; đấu máy thì bạn chọn cầm phe nào.
- Đồng hồ mỗi bên: không giới hạn, 10, 15 hoặc 30 phút.
- Đi lại, xoay sa bàn, ván mới, đầu hàng; nhật ký trận; ván dở lưu ở trình duyệt (`reed-banner:tam-quan-ky:save:v1`). Không có dòng mô tả nước đi dưới sa bàn vì nhật ký đã ghi (Shan 23/11/2026); dòng đó chỉ còn cho trình đọc màn hình.
- Bản đồ: chọn ở phần chuẩn bị, nhớ theo trình duyệt. Mọi bản đồ cùng bố cục địa hình, chỉ khác cảnh. Sáu bản, tranh Shan vẽ (23/11/2026), Claude căn về lưới (dời đầm, sông, cầu về đúng cột, hàng): Đầm Hoa Lư, Đồng xuân tháng giêng, Hoa Lư thu muộn, Đêm trăng tập trận, Thung Tràng An, Cửa Bố Hải. Gốc và bản đã căn ở `art/tam-quan-ky/ban-do/` trong thư mục dự án.
- Thoại: Đinh Bộ Lĩnh nói một câu ngắn khi vào trận, khi chiếu tướng, khi bị chiếu, khi có anh hùng mới bên Đỏ, khi thắng, thua, hòa (`src/app/game/tam-quan-ky/lines.ts`). Lời game sáng tác, không phải lời nhân vật lịch sử.

## 6. Chưa làm

- Dấu anh hùng bằng tranh (đang là chấm vàng; prompt đã có).
- Thưởng khi thắng sứ quân: Shan chốt server làm trọng tài (23/11/2026), làm cùng đấu online 1vs1 giữa hai tài khoản, PR sau.
