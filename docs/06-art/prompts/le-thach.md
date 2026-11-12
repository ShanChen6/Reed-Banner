# Prompt bộ tranh Lê Thạch (cầm giáo, chuẩn mới)

> Cập nhật: 10/11/2026
> Trạng thái: **DRAFT** — bộ prompt Lê Thạch cầm giáo + khiên mây, chuẩn mới (giáp đơn giản, biểu tượng phe thêu vào áo vải, khuôn Hà Vân), 1 avatar bán thân + 6 dáng; thay bản giáo cũ và bản thử rìu; chưa có ảnh nào được chốt và gắn vào game.

Shan chọn **hướng A** (10/11/2026): Lê Thạch **giữ giáo + khiên mây** vì Kha Sơn (cùng hệ Thổ) đã cầm rìu. Bản này thay prompt Lê Thạch cầm giáo đang có trong repo (chính file này, bản cũ) và **thay bản thử rìu**. Áp **chuẩn mới**: giáp đơn giản như mẫu Shan duyệt; **biểu tượng phe thêu vào áo vải**; khuôn Hà Vân; tỉ lệ lấy từ ảnh Hà Vân; thân hình thợ đắp đê (không lực sĩ). **Giữ mặt, nón lá, áo giáp da ô-liu, khiên mây từ ảnh khuôn Shan đã chốt** (`khuon.png`), chỉ **đổi rìu thành giáp**.

## 0. Hồ sơ Lê Thạch và các thay đổi

| Mục | Nội dung |
|---|---|
| Nghề, hệ | Binh lính, **Thổ**; ngoại hiệu **Thủ Thổ** (giữ đất); khoảng **30**, nam |
| Phe | **Dân binh trong nghĩa quân Hoa Lư**; dấu hiệu: **mặt trời trống đồng và bông lau** |
| Tính cách | Chắc nịch, ít nói, bền bỉ; đặt tay lên đất trước trận; câu nói: "Đất còn thì lũy còn. Ta đứng đây." |
| **Ba dấu ấn** | (1) **da sạm nắng, nón lá, sẹo ở cằm**; (2) **áo giáp da ô-liu ba dải đất**, màu nhấn **nâu đất**; (3) **túi vải đựng nắm đất** ở hông |
| Vũ khí | **Giáo mũi đồng hình lá + khiên mây** (nhịp Đâm) |

**Khác bản thử rìu và bản giáo cũ trong repo:**
- **Vũ khí:** giáo (rìu bỏ vì Kha Sơn đã dùng rìu; hồ sơ trong repo vốn đã ghi giáo nên không phải đổi).
- **Biểu tượng phe thêu vào áo vải** (mục 0A): bắp tay và vạt áo, không phải dải viền.
- **Giáp đơn giản** như mẫu Shan duyệt: giữ **áo da ô-liu một mảnh** của ảnh khuôn, bỏ chi tiết thừa.
- **Thân hình:** vai rộng, thợ đắp đê, **không lực sĩ** (bài học Kha Sơn); tay áo xắn tới cẳng tay.

### 0A. Biểu tượng Hoa Lư thêu vào áo vải

Nhân vật thuộc **nghĩa quân Hoa Lư** nên dấu hiệu là **mặt trời trống đồng** (vầng tròn đồng tâm có tia xung quanh, ảnh `bieu-tuong-hoa-lu.png` gửi kèm) và **bông lau**. Vì không có ảnh cờ cho phe này, tôi vẽ một biểu tượng đơn giản để làm tham chiếu hình dáng. Chỗ đặt, vì áo da che ngực:
- **Hai bắp tay áo vải:** một miếng mặt trời trống đồng cỡ bàn tay, vàng đất, mặt ngoài tay áo xắn, ngay dưới vai.
- **Vạt trước áo dưới thắt lưng:** một miếng ở giữa.
- **Bông lau trắng** vẫn buộc ở mép khiên.
- Viền gấu áo chỉ còn **đường kẻ sóng mảnh**, để biểu tượng là họa tiết chính.

**Ảnh đính** (đã chuẩn bị, gửi kèm): `khuon.png` (Lê Thạch cầm rìu và khiên bạn đã chốt: **chỉ lấy mặt, nón, giáp ô-liu, khiên; bỏ rìu**), `khien.png` (khiên cận cảnh), `bieu-tuong-hoa-lu.png`, `mat-cu-le-thach.png` (chân dung cũ, cho bán thân), `cu-*.png` (tranh cũ cầm giáo: **chỉ lấy dáng**, vì đã cầm giáo nên khớp dáng và tọa độ rig), `chuan-ha-van-style.png` (tỉ lệ, nét vẽ).

## 1. Avatar bán thân

Ảnh đính: `khuon.png` + `bust-ha-van.png` (và `mat-cu-le-thach.png` nếu công cụ cho đính 3 ảnh). Khổ vuông 1:1, từ 1024×1024, có nền, mắt khoảng 38% chiều cao từ trên.

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, bust portrait (head, shoulders and upper chest), three-quarter view. Thin fine ink contour lines of varied thickness around face, hair and clothing, soft painterly shading with gentle gradients (not flat colour fills), minimal brush texture, no photo-real skin pores. Slightly idealised, expressive face with clear character appeal and a distinct personality; natural proportions, eyes only slightly larger than life, not anime and not photographic. Medium saturation with warm earthy colours and ONE strong accent colour on the clothing (earth brown). Strong figure-ground separation: the figure is warmer, more saturated and has a soft rim light on the shoulder and cheek, while the background is lighter, desaturated and out of focus. Background: a faded sepia ink-wash landscape in mist (a long earthen river dike with bamboo clumps, a quiet river, distant limestone hills, a small reed-plume flag far away), the same warm tone in every portrait, with a pale glow behind the head. Soft diffused warm light from the upper left. 10th-century Vietnam, Dinh dynasty era, hand-made cloth, leather and bronze. No text, no frame, no border.

Subject: Le Thach, male, about 30 years old, a village militiaman of the Hoa Lu volunteer army, a dike builder, sturdy, plain-spoken, patient. Face: a weathered adult face with sun-tanned skin, a strong square jaw, short dark stubble, calm steady dark eyes, a small pale scar on the chin, an illustrated face with character (not a photograph), a calm composed expression. Hair/head: short dark hair, a woven conical palm-leaf hat tilted back so the whole face and the scar are visible, the chin cord hanging. Clothing: a simple olive-green leather jerkin over a worn cream hemp tunic with a darker inner collar. Pattern and trim: the Hoa Lu bronze-drum sun emblem (concentric circles with short rays, ochre-gold) embroidered as a clear cloth patch on the rolled upper sleeve at the shoulder, a thin wave line along the collar. One small everyday detail: the leaf-shaped bronze spearhead of a long spear rising beside his shoulder and the edge of a round rattan shield with a white reed plume at the lower side of the picture, no glow. Looking slightly to the right, steady and patient. Keep the lower quarter of the picture calm and quiet.

Reference images: keep the same person, face structure, scar, hat and jerkin as the reference images; repaint in the painting style and background of the bust portrait of Ha Van. Square 1:1.
```

**Negative prompt** (nếu công cụ có ô riêng):

```text
text, letters, numbers, logo, frame, border, watermark, signature, chibi, child, cartoon face, glowing eyes, magic effects, aura, earth effects, fantasy armor, giant shoulder discs, gemstones, plastic skin, neon, 3d render, photograph, photorealistic, low contrast, Chinese imperial palace, European, modern clothing, close-up cropped face, multiple people
```

## 2. Hai khối dùng chung cho 6 dáng (dán trước mỗi dòng dáng)

**Khối A: phong cách toàn thân**

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, FULL-BODY game sprite on a fully TRANSPARENT background (no landscape, no ground, no shadow on the ground). Thin fine ink outlines of varied thickness (not thick uniform black outlines), soft painterly shading with gentle colour gradients on the cloth, leather and hands (not flat colour fills), a thin warm rim light, minimal brush texture, no photo-real skin pores. Slightly idealised, expressive adult face with clear character appeal, real hand anatomy, an illustrated face, not anime and not photographic. Medium saturation, warm earthy colours with ONE strong accent colour (earth brown). Soft diffused warm light from the upper left. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather, rattan and bronze, woven straw sandals with leg wraps. Costume must stay modest and historical, in two main layers like the style standard image: a worn cream hemp tunic under a SIMPLE olive-green leather jerkin; no gemstones, no fantasy armor, no giant shoulder plates, no layered flying cloth, no magic glow, no earth effects. KEEP the signature pattern work: the jerkin is a simple fitted one-piece leather jerkin with three horizontal bands of stitched earth-toned patterns across the chest (a wave band, a sawtooth band, a wave band, in ochre, clay and umber) and a thin edge trim, no X straps, no busy details; the PHE EMBLEM is part of the CLOTH: the Hoa Lu bronze-drum sun emblem (concentric circles with short rays, ochre-gold, exactly as in the emblem reference image) embroidered about the size of a hand as a cloth patch sewn into the tunic, one on the outside of each rolled upper sleeve and one centred on the lower front panel of the tunic below the belt, with only a thin wave line along the tunic hem; a brown-red sash with a hanging tail, a small plain cloth pouch of soil at the right hip.
```

**Khối B: nhân vật Lê Thạch**

```text
Subject: Le Thach, male, about 30 years old, a village militiaman of the Hoa Lu volunteer army, a dike builder, sturdy, plain-spoken, patient. An adult man with the same body proportions, head-to-body ratio and height as the style standard image; a sturdy broad-shouldered build like a man who builds dikes with his hands, thick forearms, NOT a gym bodybuilder, NO sculpted abs, NO bare bulging biceps. A weathered adult illustrated face with sun-tanned skin, a strong square jaw, short dark stubble, calm steady dark eyes, a small pale scar on the chin. A woven conical palm-leaf hat with a thin chin cord, short dark hair. A simple olive-green leather jerkin with three bands of stitched patterns over a worn cream hemp tunic with frayed edges and sleeves rolled to the forearm, the Hoa Lu bronze-drum sun emblem embroidered as cloth patches on the rolled upper sleeves and the lower front panel, a brown-red sash with a hanging tail, a small cloth pouch of soil at the right hip, straight dark brown trousers (not baggy), cloth leg wraps and woven straw sandals. His weapon is a long spear: a straight dark wooden shaft about as tall as he is plus half a head, a leaf-shaped bronze spearhead about one head-height long fixed on a bronze socket, a small red-brown tassel tied just below the spearhead, a small bronze cap at the bottom of the shaft (no glow). Keep exactly this spear in this picture and keep the whole spear inside the picture. In his other forearm the round woven rattan shield from the reference image: about two head-heights across, a small bronze boss, a dark wooden rim with bronze rivets, a red-brown sawtooth and wave band, a white reed plume tied at the top of the rim. No glow, no earth effects.
```

## 3. Sáu dáng

Mỗi dáng gồm **Khối A + Khối B + dòng dáng và dòng tham chiếu dưới đây**. Ảnh đính: `khuon.png` (mặt, nón, áo, khiên), `bieu-tuong-hoa-lu.png`, tranh cũ cùng loại (chỉ lấy dáng), `chuan-ha-van-style.png` (tỉ lệ và nét vẽ). Nếu công cụ chỉ cho 2 đến 3 ảnh: giữ `khuon.png`, `bieu-tuong-hoa-lu.png` và tranh cũ. **`khuon.png` đang cầm rìu: bỏ rìu**, prompt đã dặn.

**Dòng tham chiếu chung (dán cuối mỗi dòng dáng):**

```text
Keep the pose and the camera angle of the old picture (used for the pose only). Redraw it as the same character with the exact face, hat, leather jerkin and round shield of the first reference image (the approved character), but WITHOUT the axe from that image: he carries the long spear described above instead. Add the Hoa Lu sun emblem from the emblem reference image as cloth patches on the sleeves and the lower front panel of the tunic. Painting style, line weight and body proportions of the style standard image, full-body, transparent background, facing right (toward the right edge of the picture).
```

### 3.1 Chuẩn đứng (đính `khuon.png` làm ảnh chính; khổ dọc 2:3, từ 1000px)

```text
Pose: standing calmly in a three-quarter view facing right, weight on both feet, the long spear held upright in his right hand beside him with its bottom on the ground, his grip at about chest height, the round shield on his left forearm in front of his body, steady gaze. Full body from hat to sandals and the whole spear, tip about one head above his hat, centred, small margin.
```

### 3.2 Phong thái (đính `cu-style.png`; khổ dọc 2:3)

```text
Pose: standing beside a water buffalo and leading it by a rope halter, one hand resting on the animal's neck, the buffalo seen from the side at his right with its head and shoulders in the picture, the long spear carried upright in his other hand with its bottom on the ground, the shield slung on his back, head turned to the buffalo with a soft relaxed smile (a village farmer at the end of the day). The whole spear is inside the picture.
```

### 3.3 Ra đòn (đính `cu-pose-attack.png`; khổ ngang 3:2)

```text
Pose: a wide steady forward lunge toward the right, the long spear thrust forward horizontally in both hands at chest height with the spearhead pointing right, the shield held close to his body, his weight low, a focused steady gaze. The whole spear is inside the picture. BATTLE FACE: eyes locked on the enemy ahead, brows drawn down, jaw set, lips pressed, an intense determined look, no smile, no grin.
```

### 3.4 Ra chiêu (đính `cu-pose-cast.png`; khổ dọc 2:3)

```text
Pose: planted wide and low, the round shield pushed forward like a wall on his left forearm, the long spear held upright in his right hand beside him with its bottom on the ground, a solid steady expression. The whole spear is inside the picture. BATTLE FACE: narrowed concentrated eyes under lowered brows, a steady unyielding gaze, jaw set, mouth closed, no smile.
```

### 3.5 Tuyệt chiêu (đính `cu-pose-ultimate.png`; khổ dọc 2:3)

```text
Pose: a wide stable stance, the shield held forward on his left forearm, the long spear drawn back low behind him in his right hand ready for a powerful thrust, leaning slightly forward, a determined expression. The whole spear is inside the picture with a margin around the tip. BATTLE FACE: an intense resolute face, eyes blazing with focus under drawn brows, mouth set or open in a battle cry, neck and jaw tense, never smiling and never comical.
```

### 3.6 Gục xuống (đính `cu-pose-down.png`; khổ ngang 3:2)

```text
Pose: sitting exhausted on the ground, seen from the side, his back sagging, leaning on one arm with the other arm resting limp, head hanging forward, eyes closed, a tired face, the hat fallen on the ground beside him, the shield lying on the ground half under his arm, the long spear lying on the ground beside him with its whole length visible. FACE: pain and exhaustion, brows drawn together, eyes closed, a grimace, no smile.
```

## 4. Nếu kết quả lệch

| Nếu ảnh | Thêm câu |
|---|---|
| Còn vẽ rìu (do ảnh khuôn) | `no axe, only a long spear with a leaf-shaped bronze spearhead` |
| Giáo quá ngắn, cắt khỏi khung | `the long spear about as tall as he is plus half a head, the whole spear inside the picture, leave a margin around the tip and the bottom` |
| Mũi giáo không phải hình lá | `a leaf-shaped bronze spearhead, wide in the middle and pointed, on a short bronze socket` |
| Biểu tượng Hoa Lư mất hoặc chỉ là viền | `the bronze-drum sun emblem (concentric circles with short rays) embroidered about the size of a hand on each rolled upper sleeve and on the lower front panel of the tunic, clearly readable` |
| Biểu tượng như hình dán | `the emblem is stitched into the cloth, following the folds of the fabric` |
| Người như lực sĩ, cơ phồng | `a sturdy broad-shouldered dike builder's build, thick forearms, sleeves rolled to the forearm, no sculpted abs, no bare bulging biceps` |
| Giáp rối, dây chéo X, tấm phẳng | `a simple fitted one-piece olive leather jerkin with three horizontal bands of stitched patterns, no X straps, no busy details` |
| Quần phồng như quần ngủ | `straight dark brown trousers, cloth leg wraps` |
| Đầu to, hoạt hình | `the same body proportions as the style standard image: a normal-sized head, a longer torso and longer legs, not cartoonish` |
| Nét viền đen dày, màu phẳng | `thin fine ink outlines of varied thickness, soft painterly shading and gentle gradients, not flat colour fills` |
| Mặt như ảnh chụp | `an illustrated face with character drawn by an illustrator, not a photograph` |
| Mất sẹo ở cằm | `a small pale scar on his chin, clearly visible` |
| Quay sai hướng | `facing right, looking toward the right edge of the picture` |
| Gục xuống trông như quỳ | `sitting slumped on the ground, eyes closed, head hanging, a limp arm, the tools lying on the ground, not kneeling` |

**Prompt chỉnh ảnh từ `khuon.png` (đang cầm rìu) thành cầm giáo, giữ nguyên mặt** (đính `khuon.png` và `bieu-tuong-hoa-lu.png`):

```text
Edit this image. KEEP exactly: the face and its expression, the small scar on the chin, the conical palm-leaf hat, the olive-green leather jerkin with its three pattern bands, the round rattan shield with the white reed plume, the soil pouch, the pose of the shield arm and the canvas. CHANGE: (1) replace the hatchet in his right hand with a long spear: a straight dark wooden shaft about as tall as he is plus half a head, a leaf-shaped bronze spearhead about one head-height long on a bronze socket, a small red-brown tassel below the spearhead and a small bronze cap at the bottom, held upright beside him with the bottom on the ground and his hand at chest height, the whole spear inside the picture; (2) embroider the bronze-drum sun emblem from the second reference image (concentric circles with short rays, ochre-gold) as a hand-sized cloth patch on each rolled upper sleeve and one on the lower front panel of the tunic; (3) keep the jerkin simple and one-piece; (4) make the trousers straight and dark brown rather than baggy; (5) keep a sturdy dike builder's build, not a bodybuilder; (6) the face stays an illustrated face, not a photograph.
```

**Nếu công cụ từ chối vì bộ lọc:** gọi giáo là `a long wooden pole with a leaf-shaped bronze tip`, bỏ `thrust`, `powerful`; gửi tôi nguyên văn thông báo.

## 5. Tiêu chí tôi kiểm khi nhận ảnh

1. Nhận ra đúng Lê Thạch: nón lá, da sạm, sẹo cằm, áo giáp da ô-liu ba dải, túi đất ở hông, **không còn rìu**.
2. **Biểu tượng mặt trời trống đồng thêu vào áo vải** (bắp tay và vạt áo), không phải dải viền; bông lau ở khiên.
3. **Giáo đồng nhất** ở cả 6 dáng (cán ngang người cộng nửa đầu, mũi lá đồng, tua đỏ nâu, nắp đồng), cả cây giáo nằm trong khung; khiên giống ảnh khuôn.
4. **Giáp đơn giản**, thân hình thợ đắp đê (không lực sĩ), quần thẳng, tỉ lệ như ảnh Hà Vân.
5. Cùng đẳng cấp Hà Vân: nét viền mảnh dày mỏng thay đổi, đổ bóng mềm, mặt vẽ minh họa; quay phải; nền trong suốt thật.

## 6. Khi dùng được: việc tôi làm tiếp

Thay `docs/06-art/prompts/le-thach.md` trong repo bằng bản này; gắn ảnh vào `public/art/characters/le-thach/`; chỉnh tọa độ trong `LE_THACH` (`src/app/game/stage/rigs/le-thach.ts`; vũ khí vẫn giáo nên nhịp Đâm giữ); tách lớp lại hình động đứng (giáo cùng nắm tay, khiên cùng cẳng tay, đầu và nón lá); làm `portrait.webp` từ ảnh chuẩn.
