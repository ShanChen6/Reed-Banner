# Prompt chân dung bán thân tướng sĩ (phong cách lịch sử, bớt fantasy)

> Cập nhật: 07/11/2026
> Trạng thái: **DRAFT** — Claude soạn theo yêu cầu của Shan (07/11/2026: tranh mẫu Doanh Trại có chân dung "không fantasy quá mức mà vẫn đậm nét lịch sử, hợp dự án hơn"). Chưa có tranh; làm thử **2 nhân vật** (mục 5) rồi mới làm tiếp.

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

### Kết quả thử lần 1 (07/11/2026): vẽ quá thật

Shan tạo Nguyễn Bặc và Hà Vân bằng bản prompt đầu. Nền sương, trang phục thế kỷ X và bố cục đạt, nhưng **tranh quá thật, mất chất nhân vật** (Shan: "không còn chất anime/fantasy"). So ở cỡ ô thật với tranh mẫu và chân dung đang dùng:

- Bản thử giống tranh sơn dầu cổ điển, khuôn mặt gần ảnh chụp; tranh mẫu là **minh họa game có nét viền rõ, mặt hơi lý tưởng hóa** nên vẫn có "hồn nhân vật".
- Người và nền cùng tông nâu đỏ, độ tương phản thấp: ở ô nhỏ nhân vật **chìm vào nền** (Hà Vân áo đỏ trên nền đỏ nâu).
- Prompt cấm quá tay: bỏ cả dải lụa đỏ và nét nữ tính nên Hà Vân gần như mất đặc trưng; mặt nhìn trung tính giới.

**Bài học:** mục tiêu là **mức giữa**: lịch sử và bớt fantasy (bỏ hiệu ứng phép, trang sức lộng lẫy, trang điểm đậm) nhưng vẫn là **minh họa nhân vật game** có nét viền, mặt hơi lý tưởng hóa, tách nhân vật khỏi nền rõ. Khối phong cách ở mục 3 đã viết lại theo hướng này (bản 2).

## 2. Thông số

| Mục | Giá trị |
|---|---|
| Tệp | `bust.webp` trong thư mục từng nhân vật (`public/art/characters/<tên>/bust.webp`); PNG gốc đặt tên `<tên>-bust.png` |
| Khổ | **Vuông 1:1**, tạo 1024×1024 hoặc 768×768; Claude xuất WebP **384×384** (khoảng 30–50 KB) |
| Nền | **Có nền tranh** (không trong suốt); không cần cắt nền |
| Bố cục | Nhìn chếch ba phần tư, mắt nằm khoảng **38%** chiều cao từ trên; đỉnh đầu hoặc nón cách mép trên ít nhất 6%; **một phần tư phía dưới để êm** vì tên và cấp đè lên |
| Cấm trong ảnh | Chữ, số, logo, khung, viền, watermark; hiệu ứng phép (phát sáng, tia sét, lửa quanh người, vòng sáng, mắt phát sáng); vũ khí chắn mặt; nhiều người |
| Ghép trong game | Ô chân dung Doanh Trại, Đội hình, chọn người ra trận; chân dung tròn nhỏ ở HUD vẫn dùng `portrait.webp` cũ cho đến khi có `bust.webp` |

**Negative prompt dùng chung (nếu công cụ hỗ trợ):** `text, letters, numbers, logo, frame, border, watermark, signature, chibi, glamour makeup, glowing eyes, magic effects, aura, fantasy armor, giant shoulder discs, plastic skin, neon, 3d render, photograph, photorealistic, oil painting realism, heavy canvas texture, low contrast, Chinese imperial palace, European, modern clothing, close-up cropped face, multiple people`

## 3. Khối phong cách chung (bản 2, dán vào đầu mọi prompt)

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, bust portrait (head, shoulders and upper chest), three-quarter view. Clean confident ink contour lines around face, hair and clothing, smooth painterly shading with simplified shadow shapes (soft cel-like planes), minimal brush texture, no photo-real skin pores. Slightly idealised, expressive face with clear character appeal and a distinct personality; natural proportions, eyes only slightly larger than life, not anime and not photographic. Medium saturation with warm earthy colours and ONE strong accent colour on the clothing (red, indigo, teal or ochre). Strong figure-ground separation: the figure is warmer, more saturated and has a soft rim light on the shoulder and cheek, while the background is lighter, desaturated and out of focus. Background: a faded sepia ink-wash landscape in mist (distant mountains, river bank or ancient battlefield haze), the same warm tone in every portrait, with a pale glow behind the head. Soft diffused warm light from the upper left. 10th-century Vietnam, Dinh dynasty era, hand-made cloth, leather and lacquered lamellar plates. No text, no frame, no border.
```

**Núm chỉnh mức vẽ** (nếu kết quả vẫn lệch, chỉ đổi một câu rồi thử lại, không viết lại cả prompt):

| Nếu ảnh | Đổi câu |
|---|---|
| Vẫn quá thật, như tranh sơn dầu | Thêm `stronger ink outlines, flatter colour shapes, game illustration look` |
| Quá anime, mắt to, da bóng | Thêm `realistic eye size, natural skin tone, less glossy` |
| Nhân vật chìm vào nền | Thêm `pale ivory glow behind the head, figure much darker and more saturated than the background` |
| Còn ít chất riêng | Thêm một chi tiết đặc trưng đã có ở ảnh đứng cũ (dải lụa, khăn, nón) |

## 4. Quy tắc để không bị fantasy

- Trang phục theo thế kỷ X: **áo giao lĩnh** (cổ chéo), áo vạt, khăn quấn hoặc búi tóc, nón lá, xà cạp; giáp **da** hoặc **giáp lá**; không giáp kim loại bóng kiểu phương Tây, không vai giáp khổng lồ, không áo choàng thêu lộng lẫy.
- Phụ kiện **ít và hợp lý**: giữ **một chi tiết đặc trưng** của nhân vật từ ảnh đứng cũ (ví dụ dải lụa đỏ của Hà Vân, khăn đỏ của Nguyễn Bặc) để nhận ra người đó; không vương miện vàng, không vai giáp khổng lồ, không dải lụa bay tứ phía như có gió thổi.
- Gương mặt: **không** trang điểm đậm, không điểm hoa trên trán; mặt **hơi lý tưởng hóa** (không chân thật như ảnh chụp), giữ nét nam hoặc nữ rõ ràng; cho phép sẹo, râu, da sạm nắng.
- Nghề và hệ chỉ thể hiện bằng **vật dụng đời thường** (túi thuốc cho y sư, cuộn sách cho quân sư, cán giáo sau vai cho tướng sĩ) và **màu trang phục**, không bằng hiệu ứng.
- Nhân vật có thật (Đinh Bộ Lĩnh, Đinh Liễn, Nguyễn Bặc, các sứ quân): tạo hình **theo tổng thuật**, không gán chân dung chép sử; ghi chú đây là tranh tái dựng ([Narrative Bible](../../02-game-modes/campaign/narrative-bible.md)).

## 5. Quy trình và mẫu prompt

**Giữ đúng người cũ:** với mỗi nhân vật đính **hai ảnh tham chiếu**: (1) ảnh dáng đứng cũ `standing.webp` hoặc `style.webp` của chính nhân vật để giữ khuôn mặt, màu áo, phụ kiện; (2) một chân dung đã duyệt trong bộ mới (hoặc tranh mẫu của Shan) để giữ phong cách. Thêm câu: `Keep the same person, face structure, hair, clothing colours and accessories as reference image 1; repaint in the style of reference image 2.`

**Mẫu prompt** (khối phong cách ở mục 3 đứng trước):

```text
Subject: [TÊN], [GIỚI TÍNH], about [TUỔI] years old, [NGHỀ VÀ VAI TRÒ NGẮN]. Face: [ĐẶC ĐIỂM MẶT: râu, sẹo, nếp nhăn, nét mặt]. Hair/head: [TÓC, KHĂN, NÓN]. Clothing: [ÁO, GIÁP, MÀU CHỦ ĐẠO THEO HỆ]. One small everyday detail: [PHỤ KIỆN ĐỜI THƯỜNG]. Looking slightly [TRÁI/PHẢI], calm and resolute. Keep the lower quarter of the picture calm and quiet.
```

### 5.1 Làm thử 2 nhân vật trước (Shan chốt 07/11/2026: không tạo nhiều)

Chọn hai người thử **hai thái cực**: Nguyễn Bặc là tướng nam nặng về trang phục lịch sử (thử giáp, khăn, râu, nền); Hà Vân là nhân vật đang bị fantasy nhiều nhất (thử xem bớt trang điểm, trang sức mà vẫn nhận ra cô). Nếu hai ảnh này đạt thì các nhân vật còn lại ít rủi ro.

**Nguyễn Bặc** (Tướng sĩ · Hỏa) — dán khối phong cách ở mục 3, rồi dòng dưới:

```text
Subject: Nguyen Bac, male, about 40 years old, loyal childhood friend of Dinh Bo Linh and a steady, solid general of Hoa Lu. Face: broad weathered face, short thick beard, firm jaw, a calm unyielding gaze. Hair/head: a red cloth wrapped tightly around the head, a few loose strands. Clothing: lamellar armour made of small lacquered leather plates in dull red over a coarse cross-collar tunic; the shaft of a spear rises behind his right shoulder. One small everyday detail: a worn leather strap across the chest. Looking slightly to the left, calm and resolute. Keep the lower quarter of the picture calm and quiet.
Keep the same person, face structure, hair, clothing colours and accessories as reference image 1; repaint in the style of reference image 2.
```

**Hà Vân** (Pháp sư · Hỏa):

```text
Subject: Ha Van, female, about 25 years old, a fire mage of the Dinh court, composed and a little guarded. Face: unmistakably feminine, soft jawline, fine dark brows, slightly idealised and expressive, light natural lip colour, no forehead mark, no heavy makeup. Hair/head: dark hair gathered in a bun with a red cloth band, two long red ribbon ends falling over the shoulder (her signature detail, calm, not flying). Clothing: red cross-collar robe in rich brick red with a darker brown inner layer, plain fabric edges, one small bronze hair pin. One small everyday detail: the bronze-capped top of a wooden staff behind her shoulder, no flame, no glow. Looking slightly to the right, calm and resolute. Keep the lower quarter of the picture calm and quiet.
Keep the same person, face structure, hair, clothing colours and accessories as reference image 1; repaint in the style of reference image 2.
```

Ảnh tham chiếu 1 là `standing.webp` hoặc `style.webp` của chính nhân vật (`public/art/characters/nguyenBac/` và `public/art/characters/ha-van/`); ảnh tham chiếu 2 là ô chân dung tương ứng trong tranh mẫu của Shan.

**Nếu hai ảnh đạt**, sáu nhân vật làm tiếp theo thứ tự trong tranh mẫu:

| Nhân vật | Nghề · hệ | Gợi ý tạo hình |
|---|---|---|
| Đinh Bộ Lĩnh | chủ tướng | Nam khoảng 40, búi tóc, râu ria vừa, một vết sẹo trên mặt; áo choàng tím sẫm trên giáp da; thần thái người dẫn đầu |
| Mai Thanh | Y sư · Mộc | Nữ trẻ, tóc dài buông, một trâm vàng nhỏ cài tóc; áo xanh chàm cổ chéo, túi thuốc vải đeo vai |
| Lê Thạch | Binh lính · Thổ | Nam khoảng 30, da sạm nắng, đội nón lá; áo giáp da màu ô-liu; nét mặt rắn rỏi |
| Đinh Liễn | Pháp sư · Thủy | Nam trẻ, búi tóc buộc dây xanh; áo xanh chàm cổ chéo; nét giống cha nhưng trẻ hơn |
| Phùng Phong | Quân sư · Phong | Nam trung niên gầy, khăn quấn đầu xanh ngọc; áo vải nâu xám, một cuộn thẻ tre bên hông |
| Tô Kim | Mưu sĩ · Kim | Nam trung niên, búi tóc gọn; áo xám bạc cổ chéo, một túi tiền vải nhỏ bên hông |

## 6. Kiểm tra sau khi thử 2 nhân vật

1. Đặt 2 ảnh thử cạnh tranh mẫu và các chân dung cũ khác ở cỡ ô thật (khoảng 140×110px trên máy tính, 2x): **nhận ra đúng người**, và không lạc tông so với phần còn lại của danh sách.
2. Đồng tông giữa hai ảnh (cùng nền sương nâu đỏ) **và nhân vật tách khỏi nền rõ** ở cỡ ô thật (không chìm như lần thử 1).
3. Soát theo mục 4: không hiệu ứng phép, không trang sức lộng lẫy; **nhưng vẫn là minh họa nhân vật** (nét viền rõ, mặt hơi lý tưởng hóa), không như ảnh chụp.
4. Đối chiếu với `standing.webp` cũ: cùng khuôn mặt, cùng màu áo.
5. Đạt cả bốn thì làm tiếp sáu nhân vật ở mục 5.1, rồi mới làm các nhân vật còn lại (chia theo hệ, 7 nhóm, để dễ duyệt).

## 7. Sau khi có ảnh (kế hoạch gắn vào game)

1. Xuất `bust.webp` 384×384 vào thư mục từng nhân vật.
2. Thêm hàm `bustUrl(id)` cạnh `portraitUrl` ở `src/app/game/art/portrait-data.ts`; ô chân dung trong danh sách tướng, đội hình và chọn người ra trận dùng `bust.webp`, thiếu thì lùi về `portrait.webp` và chân dung tròn SVG hiện tại (cơ chế lùi đã có ở `ProfileArt`).
3. Bỏ nền màu theo hệ ở các ô dùng `bust.webp`; thể hiện hệ bằng huy hiệu nhỏ ở góc (đã có biểu tượng hệ).
4. Chụp Doanh Trại ở 1440px và 360px, soát đọc được tên, cấp và biểu tượng đè lên phần dưới ảnh (độ tương phản chữ ít nhất 4,5:1).
5. Cập nhật [art bible](../art-bible.md) mục 2.7 (hiện ghi phong cách in khắc gỗ) cho khớp phong cách đã duyệt, và đổi dòng `Trạng thái` của tài liệu này thành IMPLEMENTED.
