# Prompt chân dung bán thân tướng sĩ (phong cách lịch sử, bớt fantasy)

> Cập nhật: 07/11/2026
> Trạng thái: **DRAFT** — Claude soạn theo yêu cầu của Shan (07/11/2026: tranh mẫu Doanh Trại có chân dung "không fantasy quá mức mà vẫn đậm nét lịch sử, hợp dự án hơn"). Đã làm thử **2 nhân vật** (Nguyễn Bặc, Hà Vân) bằng bản prompt 2, Shan nhận xét "ổn hơn" (07/11/2026) và đã gắn thử vào Doanh Trại; làm tiếp sáu nhân vật ở mục 5.1.

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

### Kết quả thử lần 2 (bản 2): đạt về phong cách, nhưng mất họa tiết trang phục

Nguyễn Bặc và Hà Vân bằng khối phong cách bản 2: minh họa game có nét viền rõ, mặt hơi lý tưởng hóa, giữ nền sương và trang phục thế kỷ X. Kiểm theo mục 6:

- **Tách nền:** độ chênh bão hòa giữa người và nền tăng từ 0,09–0,15 (lần 1) lên 0,29–0,35; nhân vật không còn chìm ở ô nhỏ.
- **Nhận ra đúng người:** Nguyễn Bặc giữ khăn đỏ, giáp lá đỏ, cán giáo, vết sẹo; Hà Vân giữ dải lụa đỏ, búi tóc, áo đỏ, nét nữ rõ.
- **Đồng tông:** hai ảnh cùng nền sương nâu đỏ, nhìn thuộc một bộ. Cảnh nền lặp giống nhau (đồn lũy và cờ bên phải); khi làm cả bộ nên đổi nhẹ cảnh nền theo hệ để danh sách không như bản sao.
- **Đã gắn:** `bust.webp` 384×384 (22–33 KB) trong `public/art/characters/nguyenBac/` và `ha-van/`; `BUST_IDS` và `bustUrl` ở `portrait-data.ts`; ô chân dung ở danh sách tướng sĩ (`HeroList.tsx`) dùng bust khi có, nền màu theo hệ chỉ dùng cho nhân vật còn lại.
- Lúc còn lẫn chân dung cũ (tối, cận mặt), hai ô mới sáng và nổi hơn hẳn; sẽ đều tay khi làm xong cả bộ.

**Phát hiện thêm (Shan, 07/11/2026): Hà Vân mất hết họa tiết trang phục.** Tranh gốc có lớp lót cam lộ ở tay áo và vạt váy, các tấm vải thêu chỉ vàng treo ở thắt lưng (họa tiết cánh sen), dải thêu sóng mây vàng ở vạt váy, đai lưng có tấm đồng chạm hình thoi, vòng đồng ở bắp tay, tua đỏ có hạt đồng. Bản 2 chỉ còn áo đỏ trơn viền nâu vì prompt ghi `plain fabric edges` và `no jewelled ornaments`: **lại cấm quá tay**, bỏ luôn họa tiết là một phần nhận diện nhân vật. Đã sửa: mục 4 có quy tắc họa tiết, mẫu prompt có ô `Pattern`, và prompt Hà Vân ở 5.1, 9.3, 9.4 ghi lại họa tiết (Shan cần tạo lại `bust.webp` của Hà Vân).

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
- **Họa tiết là một phần nhận diện, phải giữ** (đừng tả áo "trơn"). Trước khi viết prompt, nhìn `body.webp` hoặc `standing.webp` của nhân vật và ghi lại các họa tiết đặc trưng: dải thêu, tấm vải thêu, lớp lót khác màu, đai và tấm đồng, tua. Vẽ lại ở dạng **hợp thời**: thêu chỉ vàng hoặc dệt viền theo mô-típ Đông Sơn (sóng, mây cuộn, răng cưa, vòng tròn đồng tâm) hoặc cánh sen kiểu cột đá Hoa Lư; tấm đồng và hạt đồng thay cho châu ngọc. **Bỏ** hạt đá quý, dát vàng kín, hoa văn dày đặc như gấm hoàng gia.
- Phụ kiện **ít và hợp lý**: giữ **một chi tiết đặc trưng** của nhân vật từ ảnh đứng cũ (ví dụ dải lụa đỏ của Hà Vân, khăn đỏ của Nguyễn Bặc) để nhận ra người đó; không vương miện vàng, không vai giáp khổng lồ, không dải lụa bay tứ phía như có gió thổi.
- Gương mặt: **không** trang điểm đậm, không điểm hoa trên trán; mặt **hơi lý tưởng hóa** (không chân thật như ảnh chụp), giữ nét nam hoặc nữ rõ ràng; cho phép sẹo, râu, da sạm nắng.
- Nghề và hệ chỉ thể hiện bằng **vật dụng đời thường** (túi thuốc cho y sư, cuộn sách cho quân sư, cán giáo sau vai cho tướng sĩ) và **màu trang phục**, không bằng hiệu ứng.
- Nhân vật có thật (Đinh Bộ Lĩnh, Đinh Liễn, Nguyễn Bặc, các sứ quân): tạo hình **theo tổng thuật**, không gán chân dung chép sử; ghi chú đây là tranh tái dựng ([Narrative Bible](../../02-game-modes/campaign/narrative-bible.md)).

## 5. Quy trình và mẫu prompt

**Giữ đúng người cũ:** với mỗi nhân vật đính **hai ảnh tham chiếu**: (1) ảnh dáng đứng cũ `standing.webp` hoặc `style.webp` của chính nhân vật để giữ khuôn mặt, màu áo, phụ kiện; (2) một chân dung đã duyệt trong bộ mới (hoặc tranh mẫu của Shan) để giữ phong cách. Thêm câu: `Keep the same person, face structure, hair, clothing colours and accessories as reference image 1; repaint in the style of reference image 2.`

**Mẫu prompt** (khối phong cách ở mục 3 đứng trước):

```text
Subject: [TÊN], [GIỚI TÍNH], about [TUỔI] years old, [NGHỀ VÀ VAI TRÒ NGẮN]. Face: [ĐẶC ĐIỂM MẶT: râu, sẹo, nếp nhăn, nét mặt]. Hair/head: [TÓC, KHĂN, NÓN]. Clothing: [ÁO, GIÁP, MÀU CHỦ ĐẠO THEO HỆ]. Pattern and trim: [HỌA TIẾT ĐẶC TRƯNG LẤY TỪ TRANG PHỤC GỐC: dải thêu, lớp lót, đai và tấm đồng, tua]. One small everyday detail: [PHỤ KIỆN ĐỜI THƯỜNG]. Looking slightly [TRÁI/PHẢI], calm and resolute. Keep the lower quarter of the picture calm and quiet.
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
Subject: Ha Van, female, about 25 years old, a fire mage of the Dinh court, composed and a little guarded. Face: unmistakably feminine, soft jawline, fine dark brows, slightly idealised and expressive, light natural lip colour, no forehead mark, no heavy makeup. Hair/head: dark hair gathered in a bun with a red cloth band, two long red ribbon ends falling over the shoulder (her signature detail, calm, not flying). Clothing: red cross-collar robe in rich brick red with a darker brown inner layer and a warm orange lining peeking at the sleeve opening. Pattern and trim: a gold-thread embroidered border along the collar and cuff in a wave-and-cloud scroll, a bronze arm band with a small sawtooth (Dong Son) pattern on the upper arm, a small bronze plaque with filigree on the diagonal strap, short red tassels with bronze beads. One small bronze hair pin. One small everyday detail: the bronze-capped top of a wooden staff behind her shoulder, no flame, no glow. Looking slightly to the right, calm and resolute. Keep the lower quarter of the picture calm and quiet.
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
5. Đạt cả bốn thì làm tiếp sáu nhân vật ở mục 5.1, rồi mới làm **75 nhân vật còn lại** (chia theo hệ, 7 nhóm, để dễ duyệt). Tổng số nhân vật là **77** (77 thư mục trong `public/art/characters/`, 77 bộ hình động trong `rigs.ts`); con số 63 ở `nhan-vat.md` là cũ.

## 7. Sau khi có ảnh (kế hoạch gắn vào game)

1. Xuất `bust.webp` 384×384 vào thư mục từng nhân vật.
2. Thêm id vào `BUST_IDS` ở `src/app/game/art/portrait-data.ts` (đã có `bustUrl`; test `bust-art.test.ts` kiểm tệp tồn tại). Đã áp dụng cho danh sách tướng sĩ ở Doanh Trại; **còn lại** thẻ Đội hình (`TeamTab.tsx`), Kho đồ và màn chọn người ra trận. Thiếu `bust.webp` thì lùi về `portrait.webp` như cũ.
3. Bỏ nền màu theo hệ ở các ô dùng `bust.webp`; thể hiện hệ bằng huy hiệu nhỏ ở góc (đã có biểu tượng hệ).
4. Chụp Doanh Trại ở 1440px và 360px, soát đọc được tên, cấp và biểu tượng đè lên phần dưới ảnh (độ tương phản chữ ít nhất 4,5:1).
5. Cập nhật [art bible](../art-bible.md) mục 2.7 (hiện ghi phong cách in khắc gỗ) cho khớp phong cách đã duyệt, và đổi dòng `Trạng thái` của tài liệu này thành IMPLEMENTED.

## 8. Các loại tranh khác của nhân vật (tranh ra chiêu, tranh lớn)

Mỗi nhân vật có nhiều loại tranh, không chỉ chân dung. Phong cách mới ở tài liệu này hiện chỉ áp cho `bust.webp`. Kiểm tra 07/11/2026 (Shan hỏi về tranh ra chiêu):

| Tranh | Số lượng | Dùng ở | Gắn với hình động trận? | Đề xuất |
|---|---|---|---|---|
| `portrait.webp` (cận mặt 192px) | 77 | Chân dung tròn nhỏ ở HUD, dự phòng khi chưa có bust | Không | Giữ làm dự phòng |
| **`bust.webp` (mới, bán thân 384px)** | 2/77 | Ô chân dung ở Doanh Trại | Không | **Làm trước** (mục 5) |
| `style.webp` (tranh phong thái, 250×379) | 77 | Tranh lớn ở trang chi tiết tướng (`ProfileArt`) | **Không**: chỉ `ProfileArt` đọc | **Làm thứ hai**: khi ô chân dung đã mới, tranh lớn bên cạnh vẫn kiểu cũ sẽ lệch trong cùng một màn |
| `standing.webp` + các lớp (`head`, `body`, `arm`, `sword`, vải…) | 77 | Hình động trong trận, cắt lớp bằng tọa độ cố định | **Có** | Để sau cùng |
| `pose-attack`, `pose-cast`, `pose-ultimate`, `pose-down` (tranh ra chiêu và ngã) | 77 × 4 = 308 | Trận (`BattleStage`, `rigs.ts`: mỗi nhân vật có `texScale`, `origin`, `anchor`, `burst` chỉnh tay cho từng tranh) | **Có** | Để sau cùng, làm theo mục 8.2 |

### 8.1 Vì sao để tranh ra chiêu sau

- 308 tranh trong suốt toàn thân, mỗi tranh có tọa độ đặt chân và điểm bắn hiệu ứng chỉnh tay trong `rigs.ts`; đổi dáng là phải chỉnh lại từng điểm.
- Phong cách hiện tại của tranh ra chiêu là **fantasy toàn thân** (ví dụ Hà Vân: dải lụa bay nhiều lớp, áo xẻ sâu, giày cao gót, quầng lụa quanh người), lệch với chân dung mới. Cần sửa, nhưng sau khi phong cách bán thân đã được chốt, vì toàn thân dễ trôi phong cách hơn.
- Trong lúc chờ, ô chân dung mới (UI) và tranh trận (cũ) nằm ở hai màn khác nhau nên lệch ít bị lộ hơn so với hai tranh cạnh nhau trong cùng một màn (trường hợp `style.webp`).

### 8.2 Khi làm tranh ra chiêu theo phong cách mới

1. **Dùng chính tranh ra chiêu cũ làm ảnh tham chiếu dáng** (giữ nguyên tư thế, khung ảnh và vị trí chân), chỉ **thay cách vẽ**: màu trầm, nét viền rõ, trang phục thế kỷ X, bỏ lụa bay và trang sức lộng lẫy. Nhờ giữ dáng nên tọa độ trong `rigs.ts` gần như dùng lại được, chỉ chỉnh nhẹ.
2. Giữ **nền trong suốt** và đúng kích thước tệp cũ (`texScale` tính theo kích thước).
3. Chỉ làm tranh **ra chiêu và tuyệt chiêu** (`pose-cast`, `pose-ultimate`) trước; đòn thường (`pose-attack`) và ngã (`pose-down`) làm sau vì xuất hiện ít được chú ý hơn.
4. Làm thử **một nhân vật** (Hà Vân hoặc Nguyễn Bặc) cả bốn tranh, ghép vào trận để xem hiệu ứng và tọa độ trước khi làm hàng loạt.
5. Ảnh hưởng đến `standing.webp`: vì các lớp hình động cắt từ ảnh đứng, đổi ảnh đứng nghĩa là cắt lại lớp cho từng nhân vật (`head`, `body`, `arm`…). Chỉ làm khi đã chốt đổi toàn bộ hình trận sang phong cách mới.

**Thứ tự đề xuất:** (1) `bust.webp` 77 nhân vật, (2) `style.webp` 77 nhân vật, (3) thử một nhân vật với bốn tranh ra chiêu, (4) mới quyết định có đổi cả bộ hình trận hay không.

## 9. Test đầy đủ một nhân vật: Hà Vân

Shan chốt (07/11/2026): thử **trọn bộ tranh của một nhân vật** là Hà Vân trước khi làm hàng loạt. Chân dung bán thân (`bust.webp`) đã xong (mục 5.1). Còn lại: tranh lớn và bốn tranh ra chiêu.

### 9.1 Phạm vi

| Tranh | Làm trong lần test này? | Ghi chú |
|---|---|---|
| `bust.webp` | Đã xong | Đã gắn ở danh sách tướng sĩ |
| `style.webp` (tranh lớn ở trang chi tiết) | **Có** | Không gắn với hình động trận, thay thoải mái. **Nền: chung theo hệ, ảnh nhân vật trong suốt** (Shan chốt 08/11/2026, xem [tranh nền](nen-phong-thai.md)); tranh nền hệ Hỏa đã có và đã gắn |
| `pose-attack.webp`, `pose-cast.webp`, `pose-ultimate.webp` | **Có** | Gắn với `rigs.ts` (xem 9.2) |
| `pose-down.webp` (ngã) | **Có** | Gắn với `rigs.ts` |
| `standing.webp` và các lớp (`head`, `body`, `arm`, `sword`…) | **Không** | Hình động cắt lớp từ ảnh đứng bằng tọa độ cố định; đổi ảnh đứng phải cắt lại lớp. Chỉ làm khi đã chốt đổi cả bộ |

Hệ quả cần biết: trong lúc test, Hà Vân đứng yên hoặc di chuyển vẫn là hình cũ (ảnh đứng), còn ra đòn, ra chiêu và ngã là hình mới. Hai kiểu sẽ lệch nhau; đó chính là điều cần xem để quyết định có đổi cả `standing.webp` hay không.

### 9.2 Tệp tham chiếu của Hà Vân và điều phải giữ

Mỗi tranh ra chiêu có tọa độ chỉnh tay trong `HA_VAN` (`src/app/game/stage/rigs.ts`): `anchor` (chân đặt ở đâu), `origin` (điểm gốc trong tranh) và `burst` (nơi bắn hiệu ứng, thường là đầu trượng). Vì vậy tranh mới phải **giữ đúng dáng, khung ảnh và vị trí chân và đầu trượng** của tranh cũ.

| Tranh | Kích thước cũ | Dáng cần giữ | Điểm bắn hiệu ứng |
|---|---|---|---|
| `style.webp` | 250×379 | Quỳ một gối, tay trái cầm trượng dựng bên người, tay phải xòe ngửa trước ngực | không |
| `pose-attack.webp` | 290×457 | Bước tới, hạ trượng chĩa **đầu trượng ra trước bên trái**, tay kia dang ra sau | đầu trượng |
| `pose-cast.webp` | 297×456 | Đứng chắc, trượng dựng bên trái, **tay phải xòe bàn tay ra trước** | bàn tay phải |
| `pose-ultimate.webp` | 302×454 | **Giơ cao trượng bằng tay trái**, tay phải duỗi thẳng chỉ ra bên phải, thân hơi nghiêng | đầu ngón tay phải (hướng ra ngoài) |
| `pose-down.webp` | 457×304 (ngang) | Nằm nghiêng, mắt nhắm, một tay chống đất, **trượng nằm dưới đất cạnh chân** | không |

**Độ dài trượng phải đồng nhất ở mọi tranh** (Shan nhận xét 09/11/2026: bộ tranh đầu lúc dài lúc ngắn). Tranh cũ dùng **trượng ngắn**, dài khoảng **1,8 lần chiều cao đầu** (từ đỉnh búi tóc đến cằm), tức cỡ một cánh tay rưỡi, nắm một tay, đầu đồng có hạt đỏ. Bản đầu của tranh cast lại vẽ trượng dài tới sát đất (khoảng 2,5 lần chiều cao đầu) nên phải vẽ lại. Câu thêm vào mọi prompt: `the staff is a SHORT wooden rod, its total length equal to about 1.8 times the height of her head (a bit longer than her forearm), never taller than her shoulder when held upright, bronze cap with a small red orb on one end only; keep exactly this length in every picture`. Khi duyệt ảnh, so chiều dài trượng với chiều cao đầu.

**Họa tiết đặc trưng của Hà Vân cần giữ ở mọi tranh** (đọc từ `body.webp`): lớp lót cam ở tay áo và vạt; hai tấm vải thêu chỉ vàng treo ở thắt lưng (họa tiết cánh sen); dải thêu sóng mây vàng ở mép vạt đỏ; đai nâu có hai tấm đồng thoi; vòng đồng răng cưa ở bắp tay; tua đỏ hạt đồng ở đai và chỗ buộc giày. Tranh ra chiêu có thể che bớt vì dáng, nhưng không được bỏ hẳn.

### 9.3 Khối phong cách toàn thân (biến thể của khối bản 2)

Dán khối này **thay cho khối ở mục 3** khi tạo tranh toàn thân của Hà Vân (cùng cách vẽ, bỏ nền cảnh):

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, FULL-BODY game sprite on a fully TRANSPARENT background (no landscape, no ground, no shadow on the ground). Clean confident ink contour lines, smooth painterly shading with simplified shadow shapes (soft cel-like planes), minimal brush texture, no photo-real skin. Slightly idealised, expressive face with clear character appeal, not anime and not photographic. Medium saturation, warm earthy colours with ONE strong accent colour (brick red). Soft diffused warm light from the upper left with a thin rim light on the shoulder. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, simple cloth shoes with leg wraps. Costume must stay modest and historical: closed cross-collar neckline, long robe, no plunging neckline, no high heels, no gemstones, no layered flying silk veils, no magic glow, no flame or sparks drawn on the figure. KEEP the character's signature pattern work: gold-thread embroidered bands and hanging embroidered cloth panels with Dong Son wave-and-cloud scrolls and lotus-petal motifs (Hoa Lu stone-pillar style), a contrasting orange lining visible at sleeves and hem, bronze belt plaques and a bronze arm band with a sawtooth pattern, short red tassels with bronze beads. Patterns stay readable and moderate, not dense royal brocade.
```

### 9.4 Năm prompt của Hà Vân

Nhân vật chung cho cả năm (dán ngay sau khối 9.3):

```text
Subject: Ha Van, female, about 25 years old, a fire mage of the Dinh court, composed and a little guarded. Unmistakably feminine, soft jawline, fine dark brows, light natural lip colour, no forehead mark, no heavy makeup. Dark hair in a bun with a red cloth band and one bronze hair pin, two long red ribbon ends falling behind the shoulder (signature detail, kept calm and short). Brick-red cross-collar robe with a darker brown inner layer and a warm orange lining at the sleeve openings and hem; a gold-thread embroidered wave-and-cloud scroll band along the hem and cuffs; two hanging embroidered cloth panels (one dark, one red) at the waist with a lotus-petal motif; a brown sash with two diamond-shaped bronze plaques; a bronze arm band with a sawtooth pattern on the upper arm; short red tassels with bronze beads; cloth shoes with red cord leg wraps. Carries a wooden staff with a bronze cap and a small red lacquered orb on top (no flame, no glow). A small bronze incense burner hangs on a short chain at her left hip: a carried item only, never used as a weapon. A small embroidered sun-and-bronze-drum emblem (Hoa Lu volunteer army) on the left cuff.
```

Rồi thêm **một dòng dáng** theo tranh:

```text
style.webp   : Pose: kneeling on one knee, staff held upright at her left side in her left hand, right hand open palm-up in front of her chest, calm downward gaze. Three-quarter view.
pose-attack  : Pose: a forward step, the staff lowered and pointed forward-left with the orb at the tip, her other arm swept back for balance, focused gaze toward the target on the left.
pose-cast    : Pose: standing firm, staff upright at her left side, her right hand open with the palm pushed forward, a calm concentrated expression.
pose-ultimate: Pose: left arm raised high holding the staff above her head, right arm fully extended pointing to the right, body leaning slightly, intense but controlled expression.
pose-down    : Pose: lying on her side on the ground, eyes closed, one hand pressed to the ground, the staff lying on the ground beside her feet, robe spread naturally (no flying ribbons).
```

### 9.5 Cách tạo (giữ dáng)

Với **mỗi** tranh đính hai ảnh tham chiếu và dòng chỉ dẫn:

1. Ảnh 1: **tranh cũ cùng loại** trong `public/art/characters/ha-van/` (ví dụ `pose-ultimate.webp`) để giữ dáng.
2. Ảnh 2: **chân dung mới** `bust.webp` của Hà Vân để giữ khuôn mặt và cách vẽ.
3. Câu chỉ dẫn: `Keep the exact pose, camera angle, canvas proportions and the position of the feet and the top of the staff of reference image 1. Redraw it as the same character in the style and costume of reference image 2, full-body, transparent background.`

Khung ảnh **cùng tỉ lệ với tranh cũ** (bảng 9.2: dọc 0,63 cho ba tranh đứng, ngang 1,5 cho `pose-down`), cỡ lớn (1024px cạnh dài trở lên), PNG nền trong suốt.

### 9.6 Kiểm tra trước khi ghép vào trận

Claude đo tự động rồi báo:

- **Khớp dáng:** so bóng nhân vật mới với bóng tranh cũ trên cùng khung; mục tiêu độ chồng khít (IoU) từ 0,75 trở lên và vị trí chân, đầu trượng lệch không quá 4% khung.
- **Nền trong suốt thật** (góc ảnh alpha = 0), không viền sáng bám quanh người.
- **Nhận ra Hà Vân:** khớp chân dung mới (khăn đỏ, hai dải lụa, trâm đồng, áo đỏ).
- **Không fantasy:** theo mục 4 và khối 9.3.

### 9.7 Ghép vào trận (và tranh nền)

1. Claude co và căn từng tranh về **đúng kích thước tệp cũ** (290×457, 297×456, 302×454, 457×304, 250×379) rồi xuất WebP đè lên tệp cũ (bản cũ còn trong lịch sử git để hoàn tác).
2. Chạy một trận có Hà Vân, quay từng cảnh đánh thường, ra chiêu, tuyệt chiêu, ngã, kiểm tra chân đứng đúng chỗ và hiệu ứng bắn ra từ đúng đầu trượng hoặc ngón tay; chỉnh `anchor`, `origin`, `burst` trong `HA_VAN` nếu lệch.
3. Chụp trang chi tiết tướng ở Doanh Trại (tranh lớn `style.webp` cạnh chân dung mới).
4. Báo Shan so sánh trước và sau để quyết có làm tiếp 76 nhân vật còn lại không.

**Đã làm (08/11/2026):** thay `bust.webp` bản có họa tiết; gắn tranh nền hệ Hỏa vào trang chi tiết ([tranh nền](nen-phong-thai.md)). Còn chờ ảnh `style.webp` và bốn tranh ra chiêu của Hà Vân.
