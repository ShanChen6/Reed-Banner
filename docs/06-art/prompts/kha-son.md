# Prompt bộ tranh Kha Sơn (dựng mới, rìu-giáo)

> Cập nhật: 10/11/2026
> Trạng thái: **DRAFT** — bộ prompt Kha Sơn dựng mới từ đầu (không dùng ảnh cũ): rìu-giáo hai tay (bản đơn giản hóa đã thử ổn), giáp đơn giản một mảnh, biểu tượng Tam Đái thêu vào áo vải, 1 avatar bán thân + 6 dáng; đang thử ảnh chuẩn đứng, chưa chốt và chưa gắn vào game.

**Dựng lại Kha Sơn hoàn toàn mới**: không dùng bất kỳ ảnh Kha Sơn cũ nào (bỏ cả bản "giữ nguyên ảnh cũ" lần trước). Mặt, tóc, râu, vóc dáng viết **theo hồ sơ**; trang phục **theo phong cách chung** (chuẩn Hà Vân: lịch sử, hai lớp, viền thêu rõ, một màu nhấn). Ảnh diễn viên Shan gửi chỉ dùng **tham chiếu hình rìu** (đã cắt riêng đầu rìu thành `riu-lon.png`, không có mặt người).

## 0. Hồ sơ Kha Sơn (nguồn `docs/03-characters/ho-so-37-tuong-thuong.md`)

| Mục | Nội dung |
|---|---|
| Nghề, hệ | Tướng sĩ, **Thổ**; ngoại hiệu **Bất Thoái** (núi không lùi) |
| Tuổi, giới | Khoảng **40**, nam; anh của Kha Thạch |
| Phe | **Lính Tam Đái**, theo về Hoa Lư; họa tiết **ba dải** |
| Xuất thân, tính cách | Thợ đẽo đá chuyển sang cầm rìu trận, **tay to như cái cối**; theo về khi em trai rời đồn; **chậm, chắc, ít lời, tốt bụng, thích đứng nhìn núi** |
| **Ba dấu ấn** | (1) **thân to, đầu cạo, râu thưa**; (2) **giáp đá mài nhẵn thêu ba dải**, màu nhấn **nâu đất**; (3) **đai giáp đá** |
| Vũ khí | **Rìu lớn hai tay** (nhịp Chém) |

**Khác ảnh tham khảo (và vì sao):** ảnh có râu rậm và tóc rối; hồ sơ ghi **đầu cạo, râu thưa** nên prompt theo hồ sơ. Từ ảnh chỉ lấy **hình rìu** (đầu thép bán nguyệt rộng, có một khuyết cắt ở mép dưới, hai đinh tán, cán gỗ) và **chất vải thô**.

**Rủi ro đã biết, đã tính vào prompt:**
- Nhân vật to mà mô hình hay vẽ **đầu to thân ngắn kiểu hoạt hình**: tỉ lệ lấy từ ảnh Hà Vân, chỉ tả thứ nhìn thấy (vai rộng, cổ dày, tay to), không viết `short, stocky`.
- Rìu hai tay hay sai ở tư thế giơ cao: **tuyệt chiêu chỉ giơ tới ngang vai**, các dáng khác chống hoặc vác.
- Ảnh rìu là ảnh chụp thật, mô hình dễ vẽ ra kiểu ảnh chụp: prompt dặn **chỉ lấy hình dáng, vẽ theo nét minh họa**.

## 0B. Phương án B: rìu mũi giáo (theo ảnh thứ hai Shan gửi, 10/11/2026)

Ảnh thứ hai là cặp rìu trang trí bằng đồng: **lưỡi bán nguyệt có khuyết ở mép dưới**, giữa lưỡi khắc **một vầng tròn (mặt trời) và vân mây xoắn**, **mũi giáo nhọn dựng phía trên đầu rìu**, **đầu rồng đồng ở chỗ nối**, cán đen, **cuối cán có mũi nhọn hình nón**. Đã cắt `riu-rong-dau.png` (đầu rìu, gần cảnh) và `riu-rong-ca-doi.png` (cả hai cây, có logo cửa hàng ở giữa: chỉ lấy hình dáng).

**Đã chốt: dùng bản ĐƠN GIẢN HÓA của rìu này** (Shan thử ổn, 10/11/2026), vì nó hợp Kha Sơn hơn rìu ở mục 1 ở ba điểm: bóng rất riêng (lưỡi trăng + mũi giáo, không giống rìu của Lê Thạch hay các binh lính khác); **vầng tròn khắc giữa lưỡi chính là mặt trời trống đồng**; vân mây xoắn là mô-típ Đông Sơn. Nhưng **đầu rồng và vân khắc dày là fantasy và quá cầu kỳ** cho một thợ đẽo đá, và mô hình hay vẽ rối. Nên bản đơn giản hóa **bỏ đầu rồng** (thay bằng ống đồng trơn), **giảm vân khắc còn vầng tròn và vài nét mây**, **giữ mũi giáo và mũi nhọn cuối cán**.

**Thay đoạn vũ khí trong Khối B bằng đoạn này:**

```text
His weapon is a big two-handed axe-spear: a straight dark wooden haft wrapped with cord at the grip that reaches up to his chest when the axe rests on the ground, with a small cone-shaped bronze spike at the bottom end. At the top of the haft a plain bronze socket collar (no dragon head) holds a broad crescent-shaped hand-forged head about two head-heights across with a notch cut out of its lower edge, made of dull bronze with a bright steel cutting edge, with ONE round disc (a sun) engraved in the middle and just a few small cloud-scroll lines around it (simple, not dense), and a short leaf-shaped spearhead rising straight up from the top of the head on a short bronze neck, about one head-height long. No glow, no earth effects. Keep exactly this weapon in this picture and keep the whole weapon inside the picture. No shield.
```

**Thay ghi chú ảnh rìu ở mục 1 bằng:** `The reference image of the axe shows only the SHAPE of the weapon: a broad crescent-shaped blade with a notch cut out of its lower edge, a round sun disc engraved in the middle, a leaf-shaped spearhead rising above the head, a bronze socket collar and a cone-shaped spike at the bottom of the haft. Copy the shape only, but SIMPLIFY it: no dragon head, only one sun disc and a few small cloud lines, hand-forged dull bronze and steel drawn in the painting style of the style standard, not a photograph, not a shiny product photo, not a display piece. Do not copy any logo or text.`

**Điều chỉnh vài dòng dáng khi dùng bản B** (do có mũi giáo phía trên và mũi nhọn dưới cán):
- Chuẩn đứng, phong thái: **đặt mũi nhọn cuối cán xuống đất** (rìu dựng thẳng như cây giáo), không để đầu rìu chạm đất.
- Ra đòn: quét ngang, **mũi giáo hướng sang phải**.
- Tuyệt chiêu: giữ ngang vai sau lưng; **mũi giáo không vượt quá đỉnh đầu**.
- Bảng sửa lỗi thêm: `no dragon head, simple sun disc and few cloud lines, a leaf-shaped spearhead above the head, the whole weapon inside the picture`.

**Rủi ro của bản B:** hình phức tạp hơn bản A (có thêm mũi giáo và vân), nên khả năng vẽ sai cao hơn; ảnh gốc bóng loáng như ảnh sản phẩm nên dễ ra "đồ trưng bày". Nếu bản B lỗi nhiều, quay về bản A (rìu bán nguyệt trơn), hoặc thử bản B nhưng **bỏ mũi giáo** cho gọn.

## 0C. Bản thử 1 (Shan nhận xét 10/11/2026): rìu đạt, giáp và trang phục chưa ổn

**Rìu-giáo đã đạt** (đầu bán nguyệt có khuyết, vầng tròn mặt trời, vài nét mây, mũi giáo trên đầu, mũi nhọn dưới cán): chốt **phương án B đơn giản hóa**. Đầu cạo và râu thưa đúng hồ sơ. Còn lại lệch so với chuẩn Hà Vân (ảnh Hà Vân Shan gửi kèm: áo nhiều lớp có lớp lót cam, dải thêu liền có họa tiết, tấm đồng ở thắt lưng, tua hạt đồng, vòng đồng, giày quấn dây đỏ):

| Chi tiết | Bản thử | Chuẩn Hà Vân (cần đạt) |
|---|---|---|
| **Giáp** | **Ba tấm đá phẳng to**, buộc dây chéo hình chữ X, như tạ hoặc tấm bê tông; một mảnh vai đá trơn dán lên vai | Giáp **vảy nhỏ** (nhiều mảnh đá mài chồng như ngói, khâu theo hàng), vai cũng vảy nhỏ |
| **Áo** | Áo **cộc tay**, hai dải **sọc vàng** chạy quanh tay và gấu như áo thể thao | Áo **tay dài**, cổ chéo, **lớp trong và lớp lót tương phản**, dải thêu liền có họa tiết |
| **Họa tiết ba dải** | Sọc phẳng | Ba dải ngang xếp tầng đầu khuyết (ký hiệu cờ Tam Đái) **thêu liền** ở cổ, cổ tay, gấu |
| **Phụ kiện** | Gần như không có (chỉ cổ tay da) | Tấm đồng ở thắt lưng, tua hạt đồng, vòng đồng bắp tay |
| **Quần** | **Phồng như quần ngủ** | Quần thẳng thon, giày quấn dây đỏ |
| **Thân hình** | **Lực sĩ**: cơ tay phồng, ngực múi | Nặng và dày kiểu thợ đẽo đá, tay áo che tay |
| **Mặt** | Gần như **ảnh chụp người mẫu** | Mặt vẽ minh họa có hồn |

**Nguyên nhân tôi thấy:** prompt trước viết "giáp đá mài nhẵn xâu dây thành ba dải" nên mô hình làm **đúng nghĩa đen ba tấm đá**; và "áo nâu tay ngắn" thiếu dòng nào bắt cấu tạo lớp và thêu như Hà Vân. Đã sửa Khối A, Khối B, bán thân và bảng lỗi.

**Prompt chỉnh ảnh cho bản thử 1** (đính ảnh bản thử, ảnh Hà Vân, ảnh giáp mẫu `giap-mau.png` và biểu tượng `bieu-tuong-tam-dai.png` (giáp của Tống Tấn và Đinh Bộ Lĩnh Shan gửi 10/11/2026); giữ rìu, đầu, dáng):

```text
Edit this image. KEEP exactly: the bald head, the sparse short beard and the face expression, the pose, the whole axe-spear (haft, crescent head with the sun disc and cloud lines, leaf-shaped spearhead, cone spike) and the canvas. REDRAW the clothing in the manner of the second reference image (layered historical clothing with embroidered borders) and the armor like the third reference image (a simple fitted cuirass with a fine grid texture and a thin trim), drawn as an illustration, not a photograph: (1) replace the three big flat grey slabs with a SIMPLE fitted cuirass in one piece, polished grey with a fine even grid texture of very small plates, a thin dark-bronze edge trim, no visible lacing, no X straps, with two or three small curved overlapping lames on each shoulder in the same grey with a thin bronze edge (not wider than the shoulders), like the armor in the armor reference image; (2) replace the short-sleeved shirt with a long-sleeved cross-collar earth-brown tunic with sleeves to the wrists, a darker brown inner layer at the collar, a warm orange-tan lining at the cuffs, and the Tam Dai emblem from the emblem reference image (three stacked horizontal bars with notched T-shaped ends, ochre-gold) embroidered large as a cloth patch sewn into the tunic, one on the outside of each upper sleeve below the shoulder lames and one centred on the lower front panel of the tunic below the belt, with only a thin cream double line along the collar, cuffs and hem, instead of plain yellow stripes; (3) add a broad plain leather belt with one round bronze plaque and plain dark leather bracers (no tassels, no beads); (4) replace the puffy trousers with straight dark brown trousers tapering at the ankle and leg wraps tied with red cord; (5) change the body from a gym bodybuilder to a heavy thick stonecutter's build with no bare bulging arms and no sculpted abs; (6) make the face an illustrated face with character, not a photograph.
```

## 0D. Giáp mẫu (Shan 10/11/2026): "giáp trông đơn giản thế này thôi"

Shan gửi hai tranh giáp có sẵn trong game (Tống Tấn: giáp đồng nâu; Đinh Bộ Lĩnh: giáp xám viền vàng, áo choàng đỏ). Điểm chung cần theo: **giáp là MỘT mảnh ôm thân**, bề mặt là **lưới vảy rất nhỏ mịn** thấy như **hoa văn ô vuông đều**, **một đường viền kim loại mỏng** quanh mép, **vai là vài lá cong nhỏ chồng lên**, **bao tay da trơn**, **thắt lưng có một tấm tròn đồng**. **Không có dây buộc chéo, không tấm phẳng to, không phụ kiện lủng lẳng.** Bản trước tôi viết "vảy đá chồng như ngói, xâu dây đỏ" nên vẫn quá rối; đã đổi sang "giáp đơn giản một mảnh, họa tiết lưới mịn". Đã bỏ **tua hạt đồng và vòng đồng bắp tay** (chỉ để lại tấm đồng ở thắt lưng) cho giáp gọn như mẫu. **Ảnh giáp mẫu** gửi kèm tên `giap-mau.png` (ghép hai tranh); đính khi tạo để mô hình theo độ đơn giản này, **chỉ lấy kiểu giáp, không lấy áo choàng, người hay vũ khí**.

## 0E. Biểu tượng sứ quân lồng vào áo vải (Shan 10/11/2026)

Giáp để **đơn giản** nên **biểu tượng phe không đặt lên giáp**: nó là **họa tiết thêu vào áo vải** bên trong, đúng cách "một miếng vải có ký hiệu" ở `thiet-ke-lai-nhan-vat.md` mục 2.1. Với Kha Sơn (lính **Tam Đái**), biểu tượng là **ba thanh ngang xếp tầng, hai đầu khuyết hình chữ T** (ảnh cờ `public/art/flags/co-nguyenKhoan.webp`; gửi kèm `bieu-tuong-tam-dai.png`, màu vàng đất). Chỗ đặt, vì giáp che ngực và bụng:
- **Hai bắp tay**: một miếng biểu tượng ngay dưới các lá vai, mặt ngoài tay áo.
- **Vạt trước áo dưới thắt lưng**: một miếng ở giữa.
- Viền cổ, cổ tay, gấu chỉ còn **đường kẻ kem mảnh**, để biểu tượng là họa tiết chính (bản trước thêu dải viền liền nên biểu tượng không nổi).
- Biểu tượng cỡ **một bàn tay**, thêu vào vải (theo nếp vải), không như hình dán.

**Dùng cho các nhân vật khác:** quy tắc này áp được cho mọi nhân vật thuộc sứ quân: lấy ảnh `public/art/flags/co-<id>.webp` làm `bieu-tuong`, đặt ở bắp tay và vạt áo, viền chỉ kẻ mảnh. Hiện các prompt khác (Cao Kiên, Hoàng Mộc, Thái Hà, Trương Viêm, Ông Chấn, Vi Lam...) đang thêu biểu tượng phe dạng **dải viền**; nếu bạn thấy cách bắp tay + vạt áo này ổn, tôi sửa lại cho cả nhóm.

## 1. Quy trình (vì không còn ảnh mặt cũ nên tạo ảnh chuẩn trước)

| Bước | Ảnh | Đính | Nền | Khổ |
|---|---|---|---|---|
| 1 | **Ảnh chuẩn đứng** (mục 3.1) | `chuan-ha-van-style.png` + `riu-lon.png` | trong suốt | dọc 2:3 |
| 2 | **Avatar bán thân** (mục 2) | ảnh chuẩn đứng + `bust-ha-van.png` | có nền sương | vuông 1:1 |
| 3 | Phong thái, ra đòn, ra chiêu, tuyệt chiêu, gục xuống (3.2 đến 3.6) | ảnh chuẩn đứng + `riu-lon.png` | trong suốt | theo từng dáng |

**Ghi chú về cách đính `riu-lon.png`** (dán thêm vào cuối mọi prompt có rìu, tiếng Anh): `The reference image of the axe shows only the SHAPE of the axe head: a broad crescent-shaped steel blade with a notch cut out of its lower edge, a thick head block with two rivets, mounted on a wooden haft. Copy the shape of the axe head only; redraw it in the painting style of the style standard, as a hand-forged dull steel head with a bronze socket collar, not as a photograph. The reference is a photo of a real person: do not copy any person, face or clothing from it.`

## 2. Avatar bán thân

Ảnh đính: ảnh chuẩn đứng của Kha Sơn (đã tạo ở bước 1; giữ mặt) + `bust-ha-van.png` (cách vẽ và nền sương). Khổ vuông 1:1, từ 1024×1024, có nền, mắt khoảng 38% chiều cao từ trên.

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, bust portrait (head, shoulders and upper chest), three-quarter view. Thin fine ink contour lines of varied thickness around face, hair and clothing, soft painterly shading with gentle gradients (not flat colour fills), minimal brush texture, no photo-real skin pores. Slightly idealised, expressive face with clear character appeal and a distinct personality; natural proportions, eyes only slightly larger than life, not anime and not photographic. Medium saturation with warm earthy colours and ONE strong accent colour on the clothing (earth brown). Strong figure-ground separation: the figure is warmer, more saturated and has a soft rim light on the shoulder and cheek, while the background is lighter, desaturated and out of focus. Background: a faded sepia ink-wash landscape in mist (three stepped rocky peaks at the foot of a mountain, a stone quarry with cut blocks, a small flag far away), the same warm tone in every portrait, with a pale glow behind the head. Soft diffused warm light from the upper left. 10th-century Vietnam, Dinh dynasty era, hand-made cloth, leather and polished stone. No text, no frame, no border.

Subject: Kha Son, male, about 40 years old, a stonecutter turned soldier from the foot of Tam Dai mountain, slow, steady, few words, kind-hearted, he likes to stand and look at the mountain. Face: a broad calm adult face with a heavy brow, small steady eyes, a strong jaw, a sparse short beard (thin, not full), a fully shaved head, sun-weathered skin with deep lines, an illustrated face with character, not a photograph. Clothing: a simple fitted grey cuirass with a fine even grid texture and a thin dark-bronze edge trim, with small curved shoulder lames, over a long-sleeved earth-brown tunic with a darker inner layer and a warm orange-tan lining at the collar; a thick neck. Pattern and trim: the Tam Dai emblem (three stacked horizontal bars with notched ends) embroidered as a clear ochre cloth patch on the upper sleeve at the shoulder, with only a thin cream line along the collar edge. One small everyday detail: the leaf-shaped spearhead and the crescent head of a big axe-spear rising beside his shoulder, no glow. Looking slightly to the right and a little upward, as if looking at a mountain, calm and patient. Keep the lower quarter of the picture calm and quiet.

Reference images: keep the same person, face structure, shaved head and sparse beard as reference image 1; repaint in the painting style and background of reference image 2. Square 1:1.
```

**Negative prompt** (nếu công cụ có ô riêng):

```text
text, letters, numbers, logo, frame, border, watermark, signature, chibi, child, cartoon face, full thick beard, wild messy hair, glowing eyes, magic effects, aura, earth effects, fantasy armor, giant shoulder discs, gemstones, plastic skin, neon, 3d render, photograph, photorealistic, low contrast, Chinese imperial palace, European, modern clothing, close-up cropped face, multiple people
```

## 3. Hai khối dùng chung + sáu dáng

**Khối A: phong cách toàn thân** (dán trước mỗi dòng dáng)

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, FULL-BODY game sprite on a fully TRANSPARENT background (no landscape, no ground, no shadow on the ground). Thin fine ink outlines of varied thickness (not thick uniform black outlines), soft painterly shading with gentle colour gradients on the cloth, stone plates and hands (not flat colour fills), a thin warm rim light, minimal brush texture, no photo-real skin pores. Slightly idealised, expressive adult face with clear character appeal, real hand anatomy, not anime and not photographic. Medium saturation, warm earthy colours with ONE strong accent colour (earth brown). Soft diffused warm light from the upper left. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather and polished stone plates, sandals with leg wraps. Costume must stay modest and historical, in the layered manner of the style standard image: a long-sleeved cross-collar earth-brown tunic over a darker brown inner layer showing at the collar, a warm orange-tan lining peeking at the sleeve opening, and over it a simple cuirass; no gemstones, no giant shoulder plates, no layered flying cloth, no magic glow, no earth effects. KEEP the character's signature pattern work in the CLOTHING, and keep the ARMOR SIMPLE: the Tam Dai emblem (three stacked horizontal bars with notched T-shaped ends, ochre-gold on the brown cloth, exactly as in the emblem reference image) embroidered large and clearly readable as a woven cloth patch sewn into the tunic: one on the outside of each upper sleeve just below the shoulder lames, and one centred on the front lower panel of the tunic below the belt; only a thin cream double line as border along the collar, cuffs and hem so that the emblems stay the main pattern; the armor is a SIMPLE fitted cuirass in one material: smooth grey polished stone-coloured plates cut very small and tight so that the surface reads as a fine even grid texture (like a fine mesh of small squares), with NO visible lacing, NO X straps and NO big separate slabs; one thin dark-bronze trim line around its edges; the cuirass covers the chest and belly down to the belt as one clean piece; two or three small curved overlapping lames on each shoulder in the same grey material with a thin bronze edge, sitting naturally on the shoulder (not wider than the shoulder); plain dark leather bracers on the forearms; a broad plain leather belt with ONE round bronze plaque (no tassels, no beads). Patterns stay readable and moderate, not dense royal brocade.
```

**Khối B: nhân vật Kha Sơn**

```text
Subject: Kha Son, male, about 40 years old, a stonecutter turned soldier of the Tam Dai troops, slow, steady, few words, kind-hearted. An adult man with the same body proportions, head-to-body ratio and height as the style standard image, but a very big, strong build: broad shoulders, a thick neck, a deep chest, very large strong hands (hands as big as millstones) and thick forearms; his head is a normal size for his body, never oversized. A broad calm weathered face with a heavy brow, small steady eyes, a strong jaw, a sparse short beard, a fully shaved head, an illustrated face with character (not a photograph, not a model's face). The build is heavy and thick like a stonecutter who lifts blocks all day: a deep chest, thick limbs, a heavy waist, NOT a gym bodybuilder, NO sculpted abs, NO bare bulging biceps. Clothing in two main layers: a long-sleeved cross-collar earth-brown tunic with sleeves to the wrists, a darker brown inner layer at the collar, a warm orange-tan lining at the cuffs, the Tam Dai emblem (three stacked horizontal bars with notched T-shaped ends, ochre-gold on the brown cloth, exactly as in the emblem reference image) embroidered large and clearly readable as a woven cloth patch sewn into the tunic: one on the outside of each upper sleeve just below the shoulder lames, and one centred on the front lower panel of the tunic below the belt; only a thin cream double line as border along the collar, cuffs and hem so that the emblems stay the main pattern, the tunic falling to the knees; over it a SIMPLE fitted cuirass in one material: smooth grey polished stone-coloured plates cut very small and tight so that the surface reads as a fine even grid texture (like a fine mesh of small squares), with NO visible lacing, NO X straps and NO big separate slabs; one thin dark-bronze trim line around its edges; the cuirass covers the chest and belly down to the belt as one clean piece, with two or three small curved overlapping lames on each shoulder in the same grey material with a thin bronze edge, sitting naturally on the shoulder (not wider than the shoulder); plain dark leather bracers on the forearms; a broad plain leather belt with ONE round bronze plaque (no tassels, no beads), straight dark brown trousers tapering at the ankle (not baggy, not puffy), cloth leg wraps tied with red cord and leather sandals. His weapon is a big two-handed axe-spear: a straight dark wooden haft wrapped with red cord at the grip that reaches up to his chest when the weapon stands on the ground, with a small cone-shaped bronze spike at the bottom end. At the top of the haft a plain bronze socket collar (no dragon head) holds a broad crescent-shaped hand-forged head about two head-heights across with a notch cut out of its lower edge, made of dull bronze with a bright steel cutting edge, with ONE round sun disc engraved in the middle and a few small cloud-scroll lines (simple), and a short leaf-shaped spearhead rising straight up from the top of the head on a short bronze neck. No glow, no earth effects. Keep exactly this weapon in this picture and keep the whole weapon inside the picture. No shield.
```

**Dòng tham chiếu chung** (dán cuối mỗi dòng dáng, cùng ghi chú về ảnh rìu ở mục 1):

```text
Draw the same character with the face, body, clothing and axe of the first reference image (the standing reference of Kha Son), the axe head shape from the axe reference image, in the painting style, line weight and body proportions of the style standard image, full-body, transparent background, facing right (toward the right edge of the picture).
```

### 3.1 Chuẩn đứng (bước 1; đính `chuan-ha-van-style.png` + `riu-lon.png`; khổ dọc 2:3, từ 1000px)

```text
Pose: standing steadily in a three-quarter view facing right, weight on both feet, the axe-spear held upright in his right hand beside him with its bottom spike on the ground, his grip at about chest height, his left hand relaxed, a calm heavy gaze as if looking at a mountain. Full body from head to sandals and the whole weapon, centred, small margin.
```

### 3.2 Phong thái

```text
Pose: walking slowly facing right and leading a young draught elephant by a rope, the elephant seen from the side with its head, trunk and shoulder at the right of the picture (a plain rope halter, a folded cloth pad on its back, no ornament), one hand on the rope and the other resting on the elephant's trunk, the axe-spear carried on his left shoulder with its whole length visible, a quiet half-smile. Three-quarter view.
```

### 3.3 Ra đòn (khổ ngang 3:2)

```text
Pose: a wide heavy forward step toward the right, the axe-spear held in both hands and carried across at waist height in a broad horizontal sweep with the crescent head and the spearhead pointing to the right, his weight low and steady, a focused calm gaze. The whole weapon is inside the picture. Full body, wide horizontal picture, centred. BATTLE FACE: eyes locked on the enemy ahead, brows drawn down, jaw set, lips pressed, an intense determined look, no smile, no grin.
```

### 3.4 Ra chiêu

```text
Pose: planted wide and low, the axe-spear held upright in front of him in both hands with the haft vertical and the crescent head beside his shoulder, one foot stamping firmly, a solid immovable expression like a mountain that does not step back. The whole weapon is inside the picture, the spearhead not higher than the top of his head plus half a head. Full body, centred. BATTLE FACE: narrowed concentrated eyes under lowered brows, a steady unyielding gaze, jaw set, mouth closed, no smile.
```

### 3.5 Tuyệt chiêu

```text
Pose: a wide stable stance, the axe-spear held in both hands behind his right shoulder with the crescent head up and back at shoulder height (ready to swing, NOT overhead), leaning slightly forward, a determined expression. The crescent head stays lower than the top of his head. The whole weapon is inside the picture. Full body, centred. BATTLE FACE: an intense resolute face, eyes blazing with focus under drawn brows, mouth set or open in a battle cry, neck and jaw tense, never smiling and never comical.
```

### 3.6 Gục xuống (khổ ngang 3:2)

```text
Pose: sitting exhausted on the ground, seen from the side, his back sagging, leaning on one arm with the other arm resting limp, head hanging forward, eyes closed, a tired face, the axe-spear lying on the ground beside him with its whole length visible. Full figure, wide horizontal picture. FACE: pain and exhaustion, brows drawn together, eyes closed, a grimace, no smile.
```

## 4. Nếu kết quả lệch, chỉ đổi một câu

| Nếu ảnh | Thêm câu |
|---|---|
| Đầu to, thân ngắn, như hoạt hình | `the same body proportions as the style standard image: an adult man with a normal-sized head, a longer torso and longer legs, broad shoulders and a thick neck, not cartoonish` |
| Râu rậm hoặc tóc rối như ảnh | `a fully shaved head and a sparse short beard, no thick beard, no messy hair` |
| Nét viền đen dày, màu phẳng | `thin fine ink outlines of varied thickness, soft painterly shading and gentle gradients, not flat colour fills` |
| Rìu thành bóng tròn, liềm, hai lưỡi | `one broad crescent-shaped steel axe head with a notch cut out of its lower edge, mounted on the top of a long wooden haft, a single head` |
| Rìu như ảnh chụp thật, màu xám lạnh | `a hand-forged dull steel head drawn in the painting style, warm earthy palette, not a photograph` |
| Rìu bị cắt khỏi khung | `the whole axe inside the picture, leave a margin around the axe head and the bottom of the haft` |
| Giáp là mấy tấm đá phẳng to như tạ, có dây chéo, hoặc quá rối vảy | `a simple fitted grey cuirass in one piece with a fine even grid texture, a thin dark-bronze edge trim, no visible lacing, no X straps, no big slabs, no busy details` |
| Biểu tượng sứ quân mất, chỉ còn sọc hoặc viền | `the Tam Dai emblem of three stacked horizontal bars with notched ends embroidered large as a cloth patch on each upper sleeve and on the lower front panel of the tunic, clearly readable` |
| Biểu tượng như hình dán, lệch, quá to | `the emblem is stitched into the cloth, following the folds of the fabric, about the size of a hand` |
| Áo cộc tay, sọc vàng như áo thể thao | `a long-sleeved cross-collar tunic with the Tam Dai emblem embroidered on the sleeves and the lower front panel and a thin cream line border, a darker inner layer at the collar and an orange-tan lining at the cuffs, not sports stripes` |
| Người như lực sĩ, cơ bắp lộ | `a heavy thick stonecutter's build, a heavy waist, sleeves to the wrists, no bare muscular arms, no sculpted abs` |
| Quần phồng như quần ngủ | `straight dark brown trousers tapering at the ankle, leg wraps tied with red cord` |
| Mặt như ảnh chụp người mẫu | `an illustrated face with character drawn by an illustrator, not a photograph` |
| Thiếu đai đồng | `a broad plain leather belt with one round bronze plaque` |
| Chép khuôn mặt hoặc áo của người trong ảnh rìu | `a different person: do not copy any face or clothing from the axe reference, only the axe head shape` |
| Ngón tay lỗi | `anatomically correct hands, four fingers and a thumb on each hand` |
| Tranh gục xuống trông như đang quỳ | `sitting slumped on the ground, eyes closed, head hanging, a limp arm, the axe lying on the ground, not kneeling` |
| Quay sai hướng | `facing right, looking toward the right edge of the picture` |

**Nếu công cụ từ chối vì bộ lọc:** gọi rìu là `a big ceremonial stonecutter's axe`, bỏ các từ `swept`, `strike`, `fierce`.

**Sửa riêng rìu bằng chế độ chỉnh ảnh** (đính tranh lỗi và `riu-lon.png`): `Replace only the axe in this image with a big two-handed axe: a straight dark wooden haft up to his chest, a broad crescent-shaped steel head about two head-heights across with a notch cut out of its lower edge and two rivets, drawn in the painting style of this image. Keep everything else unchanged.`

## 5. Tiêu chí tôi kiểm khi nhận ảnh

1. Nhận ra đúng Kha Sơn ở cỡ ô thật (140×110px): **đầu cạo, râu thưa, thân to, giáp đá ba dải, rìu lớn hai tay**.
2. **Ba dấu ấn đủ:** thân to đầu cạo râu thưa; giáp đá mài nhẵn thêu ba dải, màu nhấn nâu đất; đai giáp đá.
3. **Tỉ lệ cân đối** như ảnh Hà Vân (đầu không to), tay to nhưng đúng giải phẫu.
4. **Rìu-giáo đồng nhất** ở cả 6 dáng (đầu bán nguyệt có khuyết và vầng tròn mặt trời, mũi giáo trên đầu, mũi nhọn dưới cán), cả vũ khí nằm trong khung; không phát sáng. **Trang phục có cấu tạo như Hà Vân:** áo tay dài, lớp trong và lớp lót tương phản, giáp vảy đá nhỏ, thắt lưng có tấm đồng và tua hạt đồng.
5. Cùng đẳng cấp Hà Vân (nét viền mảnh dày mỏng thay đổi, đổ bóng mềm), không giống tranh cũ của Kha Sơn, không giống người trong ảnh tham khảo.
6. Quay về bên phải; nền trong suốt thật.

## 6. Nếu dùng được: việc tôi làm tiếp

Cắt, co về đúng cỡ, thay vào `public/art/characters/kha-son/`, chỉnh tọa độ trong `KHA_SON` (`rigs.ts`; rìu hai tay, nhịp Chém giữ), tách lớp lại hình động đứng (rìu cùng nắm tay, bàn tay buông, đầu) và làm `portrait.webp`. Vì làm mới từ đầu nên phần tách lớp phải làm lại.
