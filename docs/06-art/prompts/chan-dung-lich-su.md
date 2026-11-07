# Prompt chân dung bán thân tướng sĩ (phong cách lịch sử, bớt fantasy)

> Cập nhật: 07/11/2026
> Trạng thái: **DRAFT** — Claude soạn theo yêu cầu của Shan (07/11/2026: tranh mẫu Doanh Trại có chân dung "không fantasy quá mức mà vẫn đậm nét lịch sử, hợp dự án hơn"). Chưa có tranh; làm thử **8 nhân vật** (mục 5) rồi mới làm cả bộ.

Chân dung hiện tại (`public/art/characters/<tên>/portrait.webp`, 192×192) là **cận mặt** kiểu minh họa số sạch, vài nhân vật (như Hà Vân) có nét "idol/fantasy" (son môi đậm, điểm trang trán, tóc cầu kỳ). Tranh mẫu của Shan dùng **chân dung bán thân** tả thực nhẹ, màu trầm, có nền tranh mờ sương. Tài liệu này ghi lại phong cách đó thành prompt để tạo cả bộ.

## 1. Khác biệt cần giữ khi vẽ lại

| Mục | Hiện tại | Phong cách mới (theo tranh mẫu) |
|---|---|---|
| Khung hình | Cận mặt, đầu chiếm gần hết khung, hay cắt mất mũ và vai | **Bán thân**: đầu, vai và ngực trên; thấy rõ trang phục (giáp, khăn, nón, áo giao lĩnh) |
| Nét vẽ | Số sạch, bóng mịn, màu tươi | **Sơn gouache / bột màu**, có vân cọ nhẹ, màu **trầm, ít bão hòa**, ánh sáng dịu |
| Gương mặt | Đẹp lý tưởng, hơi anime | **Người thật**: tuổi tác, nếp nhăn, râu, sẹo; nét mặt Việt, thần thái cương nghị |
| Trang phục | Gọn, ít đặc trưng | Mang dấu ấn thế kỷ X: áo giao lĩnh, khăn quấn đầu, nón lá, giáp da hoặc giáp lá, vải thô |
| Nền | Không có (trong suốt, đặt lên màu theo hệ) | **Tranh nền mờ sương** nâu vàng: núi thủy mặc, bờ sông, chiến trường xa; cả bộ cùng tông |
| Màu hệ | Cả khung tô màu hệ, mỗi người một màu | Màu hệ **chỉ là điểm nhấn trên trang phục** (khăn, áo); nền chung tông nâu đỏ ấm |

## 2. Thông số

| Mục | Giá trị |
|---|---|
| Tệp | `bust.webp` trong thư mục từng nhân vật (`public/art/characters/<tên>/bust.webp`); PNG gốc đặt tên `<tên>-bust.png` |
| Khổ | **Vuông 1:1**, tạo 1024×1024 hoặc 768×768; Claude xuất WebP **384×384** (khoảng 30–50 KB) |
| Nền | **Có nền tranh** (không trong suốt); không cần cắt nền |
| Bố cục | Nhìn chếch ba phần tư, mắt nằm khoảng **38%** chiều cao từ trên; đỉnh đầu hoặc nón cách mép trên ít nhất 6%; **một phần tư phía dưới để êm** vì tên và cấp đè lên |
| Cấm trong ảnh | Chữ, số, logo, khung, viền, watermark; hiệu ứng phép (phát sáng, tia sét, lửa quanh người, vòng sáng, mắt phát sáng); vũ khí chắn mặt; nhiều người |
| Ghép trong game | Ô chân dung Doanh Trại, Đội hình, chọn người ra trận; chân dung tròn nhỏ ở HUD vẫn dùng `portrait.webp` cũ cho đến khi có `bust.webp` |

**Negative prompt dùng chung (nếu công cụ hỗ trợ):** `text, letters, numbers, logo, frame, border, watermark, signature, anime, chibi, glamour makeup, glowing eyes, magic effects, aura, halo, fantasy armor, plastic skin, airbrushed, oversaturated, neon, 3d render, photorealistic, Chinese imperial palace, European, modern clothing, close-up cropped face, multiple people`

## 3. Khối phong cách chung (dán vào đầu mọi prompt)

```text
Style: hand-painted gouache and opaque watercolour illustration of a historical Vietnamese figure, bust portrait (head, shoulders and upper chest), three-quarter view, restrained semi-realistic proportions, visible soft brush texture and paper grain, muted earthy palette (ochre, burnt sienna, umber, faded teal and indigo, dull red), low to medium saturation, soft diffused warm light from the upper left, one gentle shadow tone. Mature, grounded face with real skin texture, natural features and expression, no beauty-filter look. Clothing and gear drawn with fabric and leather detail. Background: a faded sepia ink-wash landscape in mist (distant mountains, river bank or ancient battlefield haze), soft and out of focus so the figure stays the focus; same warm brown-red tone for every portrait. 10th-century Vietnam, Dinh dynasty era. No text, no frame, no border.
```

## 4. Quy tắc để không bị fantasy

- Trang phục theo thế kỷ X: **áo giao lĩnh** (cổ chéo), áo vạt, khăn quấn hoặc búi tóc, nón lá, xà cạp; giáp **da** hoặc **giáp lá**; không giáp kim loại bóng kiểu phương Tây, không vai giáp khổng lồ, không áo choàng thêu lộng lẫy.
- Phụ kiện **ít và hợp lý**: một trâm hoặc dây buộc tóc là đủ; không vương miện vàng, không dải lụa bay như có gió thổi.
- Gương mặt: **không** trang điểm đậm, không điểm hoa trên trán, không mắt to kiểu anime; cho phép sẹo, nếp nhăn, râu thưa, da sạm nắng.
- Nghề và hệ chỉ thể hiện bằng **vật dụng đời thường** (túi thuốc cho y sư, cuộn sách cho quân sư, cán giáo sau vai cho tướng sĩ) và **màu trang phục**, không bằng hiệu ứng.
- Nhân vật có thật (Đinh Bộ Lĩnh, Đinh Liễn, Nguyễn Bặc, các sứ quân): tạo hình **theo tổng thuật**, không gán chân dung chép sử; ghi chú đây là tranh tái dựng ([Narrative Bible](../../02-game-modes/campaign/narrative-bible.md)).

## 5. Quy trình và mẫu prompt

**Giữ đúng người cũ:** với mỗi nhân vật đính **hai ảnh tham chiếu**: (1) ảnh dáng đứng cũ `standing.webp` hoặc `style.webp` của chính nhân vật để giữ khuôn mặt, màu áo, phụ kiện; (2) một chân dung đã duyệt trong bộ mới (hoặc tranh mẫu của Shan) để giữ phong cách. Thêm câu: `Keep the same person, face structure, hair, clothing colours and accessories as reference image 1; repaint in the style of reference image 2.`

**Mẫu prompt** (khối phong cách ở mục 3 đứng trước):

```text
Subject: [TÊN], [GIỚI TÍNH], about [TUỔI] years old, [NGHỀ VÀ VAI TRÒ NGẮN]. Face: [ĐẶC ĐIỂM MẶT: râu, sẹo, nếp nhăn, nét mặt]. Hair/head: [TÓC, KHĂN, NÓN]. Clothing: [ÁO, GIÁP, MÀU CHỦ ĐẠO THEO HỆ]. One small everyday detail: [PHỤ KIỆN ĐỜI THƯỜNG]. Looking slightly [TRÁI/PHẢI], calm and resolute. Keep the lower quarter of the picture calm and quiet.
```

**Tám nhân vật làm thử** (đúng các ô trong tranh mẫu; chi tiết lấy từ tranh mẫu, đối chiếu với `standing.webp` khi tạo):

| Nhân vật | Nghề · hệ | Gợi ý tạo hình |
|---|---|---|
| Đinh Bộ Lĩnh | chủ tướng | Nam khoảng 40, búi tóc, râu ria vừa, một vết sẹo trên mặt; áo choàng tím sẫm trên giáp da; thần thái người dẫn đầu |
| Mai Thanh | Y sư · Mộc | Nữ trẻ, tóc dài buông, một trâm vàng nhỏ cài tóc; áo xanh chàm cổ chéo, túi thuốc vải đeo vai |
| Lê Thạch | Binh lính · Thổ | Nam khoảng 30, da sạm nắng, đội nón lá; áo giáp da màu ô-liu; nét mặt rắn rỏi |
| Đinh Liễn | Pháp sư · Thủy | Nam trẻ, búi tóc buộc dây xanh; áo xanh chàm cổ chéo; nét giống cha nhưng trẻ hơn |
| Nguyễn Bặc | Tướng sĩ · Hỏa | Nam khoảng 40, khăn quấn đầu đỏ, râu quai nón ngắn; giáp lá sơn đỏ; cán giáo sau vai |
| Hà Vân | Pháp sư · Hỏa | Nữ khoảng 25, tóc búi buộc dải vải đỏ (chỉ một dải, không bay); áo đỏ cổ chéo giản dị; **bỏ** điểm trang trán và son đậm |
| Phùng Phong | Quân sư · Phong | Nam trung niên gầy, khăn quấn đầu xanh ngọc; áo vải nâu xám, một cuộn thẻ tre bên hông |
| Tô Kim | Mưu sĩ · Kim | Nam trung niên, búi tóc gọn; áo xám bạc cổ chéo, một túi tiền vải nhỏ bên hông |

## 6. Kiểm tra trước khi làm cả bộ

1. Đặt 8 ảnh thử cạnh nhau ở cỡ ô thật (khoảng 140×110px trên máy tính, 2x): **nhận ra từng người** chỉ bằng nhìn, không lẫn nhau.
2. Đồng tông: cùng nền nâu đỏ, cùng độ trầm; không ảnh nào chói hơn hẳn.
3. Soát fantasy theo mục 4: không hiệu ứng phép, không trang sức lộng lẫy, mặt không "lọc đẹp".
4. Đối chiếu với `standing.webp` cũ: cùng khuôn mặt, cùng màu áo.
5. Đạt cả bốn mới làm tiếp 55 nhân vật còn lại, nên chia theo hệ để dễ duyệt (7 nhóm).

## 7. Sau khi có ảnh (kế hoạch gắn vào game)

1. Xuất `bust.webp` 384×384 vào thư mục từng nhân vật.
2. Thêm hàm `bustUrl(id)` cạnh `portraitUrl` ở `src/app/game/art/portrait-data.ts`; ô chân dung trong danh sách tướng, đội hình và chọn người ra trận dùng `bust.webp`, thiếu thì lùi về `portrait.webp` và chân dung tròn SVG hiện tại (cơ chế lùi đã có ở `ProfileArt`).
3. Bỏ nền màu theo hệ ở các ô dùng `bust.webp`; thể hiện hệ bằng huy hiệu nhỏ ở góc (đã có biểu tượng hệ).
4. Chụp Doanh Trại ở 1440px và 360px, soát đọc được tên, cấp và biểu tượng đè lên phần dưới ảnh (độ tương phản chữ ít nhất 4,5:1).
5. Cập nhật [art bible](../art-bible.md) mục 2.7 (hiện ghi phong cách in khắc gỗ) cho khớp phong cách đã duyệt, và đổi dòng `Trạng thái` của tài liệu này thành IMPLEMENTED.
