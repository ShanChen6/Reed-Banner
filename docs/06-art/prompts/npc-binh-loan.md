# Prompt chân dung NPC Bình Loạn: dùng chung theo vai (6 vai, đổi màu và biểu tượng theo phe)

> Cập nhật: 13/11/2026
> Trạng thái: **DRAFT** — prompt 6 vai NPC Bình Loạn dùng chung, chưa có ảnh; khi có ảnh thì thêm id vào `NPC_PORTRAIT_IDS` (`src/app/game/art/portrait-data.ts`).

> **Quyết định của Shan (13/11/2026):** 30 nhân vật hư cấu trong Bình Loạn (`src/core/campaign/encounters.ts`) hiện dùng **hình tạm vẽ SVG theo nghề**. Làm **một bộ chân dung bán thân cho mỗi vai** (6 vai), rồi **đổi màu và biểu tượng theo phe** để ít ảnh nhất. Bán thân thôi; trong trận vẫn dùng hình động theo nghề.

## 1. Cách làm (hai bước)

1. **Làm 6 ảnh gốc** theo mục 3, màu trung tính (nâu đất, nhấn một màu tùy chọn).
2. **Đổi theo phe** bằng prompt sửa ảnh ở mục 4, mỗi lần đổi **màu nhấn** và thêm **miếng thêu biểu tượng phe** theo bảng mục 2. Giữ nguyên mặt và dáng, nên cùng một vai ở các phe là **cùng một người đổi áo**; để bớt trùng, mỗi lần đổi có thể thêm một chi tiết nhỏ (sẹo, ria, dải khăn) ghi ở cột **Biến thể**.

Khổ vuông 1:1, từ 1024×1024, có nền sương. Ảnh đính cho mọi prompt: `bust-ha-van.png` (chỉ lấy độ đậm nét viền, cách đổ bóng, tỉ lệ khung; không lấy mặt).

## 2. Phe, màu nhấn, biểu tượng và NPC dùng

| Phe | Màu nhấn | Biểu tượng thêu | NPC (vai) |
|---|---|---|---|
| Quân Ngô (951) | slate blue-grey | không có biểu tượng (chỉ màu) | ngo-951-field-commander (R2), ngo-951-soldier (R3), ngo-951-strategist (R4) |
| Hoa Lư: toán cướp vô danh | plain undyed brown | không có biểu tượng | hoa-lu-raider-chief (R1) |
| Bố Hải: toán cướp ven biển | brick red | sóng vàng, đỉnh xanh (`bieu-tuong-bo-hai.png`) | bo-hai-raider-chief (R1), bo-hai-raider-boatman (R3), bo-hai-raider-scout (R4) |
| Phong Châu | violet purple | núi và tia sét tím (`bieu-tuong-phong-chau.png`) | phong-chau-vanguard (R2), phong-chau-strategist (R4) |
| Hồi Hồ | olive green | hoa sen giữa hai lá (`bieu-tuong-hoi-ho.png`) | hoi-ho-bank-guard (R2), hoi-ho-ritualist (R5) |
| Siêu Loại | silver | vảy cá xếp hàng (`bieu-tuong-sieu-loai.png`) | sieu-loai-vanguard (R2), sieu-loai-strategist (R4) |
| Tiên Du | blue | sao bốn cánh (`bieu-tuong-tien-du.png`) | tien-du-vanguard (R2), tien-du-healer (R6) |
| Tây Phù Liệt | dark red | lũy cọc nhọn có ngọn lửa nhỏ (`bieu-tuong-tay-phu-liet.png`) | phu-liet-wall-captain (R1), phu-liet-raid-leader (R1), phu-liet-wall-guard (R3), phu-liet-raider (R3), phu-liet-scout (R4), phu-liet-wall-archer (R5), phu-liet-vanguard (R2), phu-liet-healer (R6) |
| Đỗ Động | ochre gold | mũi giáo (`bieu-tuong-do-dong.png`) | do-dong-road-captain (R1), do-dong-boatman (R3), do-dong-lookout (R5), do-dong-vanguard (R2), do-dong-strategist (R4), do-dong-guard (R2), do-dong-healer (R6) |

Ghi chú: Hoa Lư (toán cướp vô danh) và quân Ngô **không có biểu tượng** vì chưa có cờ phe riêng; chỉ đổi màu. Hồi Hồ dùng olive green, Siêu Loại silver, Tiên Du blue, Đỗ Động ochre gold, Tây Phù Liệt dark red, Phong Châu violet, Bố Hải brick red (khớp màu nhấn đã dùng cho các sứ quân tương ứng).

## 3. Prompt 6 ảnh gốc

### R1. Thủ lĩnh / đội trưởng

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, BUST portrait (head, shoulders, upper chest), square 1:1, a faded sepia ink-wash misty landscape background that is lighter, desaturated and out of focus so the figure stands out, thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills, not photographic skin), real adult face with clear character appeal, not anime, not photographic. Medium saturation, warm earthy colours with ONE accent colour (earth brown). Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather. Modest historical costume, two layers, no glow, no magic effects. No text, no logo, no frame, no border.

Subject: an unnamed fictional thủ lĩnh of a 10th-century Vietnamese warlord's army, a hard-faced man of about 40 with a square jaw, a short beard and a weathered scar, a stern commanding gaze slightly to the right, mouth closed. Clothing: a dark-tanned cloth head wrap, lightweight lamellar leather armor with small shoulder pieces over a long-sleeved tunic, a plain leather strap across the chest. One small detail: a bronze command tally on a cord at the chest edge. No emblem on the cloth yet.

Negative: text, letters, numbers, logo, frame, border, watermark, chibi, child, cartoon face, glowing eyes, magic effects, aura, anime style, photo-real skin pores, gemstones, modern items, torn streaming cloth, extra fingers.
```

### R2. Phó tướng / tướng tiên phong / thân binh

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, BUST portrait (head, shoulders, upper chest), square 1:1, a faded sepia ink-wash misty landscape background that is lighter, desaturated and out of focus so the figure stands out, thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills, not photographic skin), real adult face with clear character appeal, not anime, not photographic. Medium saturation, warm earthy colours with ONE accent colour (earth brown). Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather. Modest historical costume, two layers, no glow, no magic effects. No text, no logo, no frame, no border.

Subject: an unnamed fictional phó tướng of a 10th-century Vietnamese warlord's army, a lean alert man of about 32 with sharp brows, a thin moustache, a clean steady gaze slightly to the right, mouth closed. Clothing: hair in a topknot with a plain cloth band, lightweight lamellar leather armor with two small shoulder pieces and a short clean cape on one shoulder over a long-sleeved tunic. One small detail: the grip of a sabre and the shaft of a spear rising behind the shoulder. No emblem on the cloth yet.

Negative: text, letters, numbers, logo, frame, border, watermark, chibi, child, cartoon face, glowing eyes, magic effects, aura, anime style, photo-real skin pores, gemstones, modern items, torn streaming cloth, extra fingers.
```

### R3. Lính thường (gác cổng, giữ bến, chèo thuyền, cướp lương)

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, BUST portrait (head, shoulders, upper chest), square 1:1, a faded sepia ink-wash misty landscape background that is lighter, desaturated and out of focus so the figure stands out, thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills, not photographic skin), real adult face with clear character appeal, not anime, not photographic. Medium saturation, warm earthy colours with ONE accent colour (earth brown). Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather. Modest historical costume, two layers, no glow, no magic effects. No text, no logo, no frame, no border.

Subject: an unnamed fictional lính thường (gác cổng, giữ bến, chèo thuyền, cướp lương) of a 10th-century Vietnamese warlord's army, a plain sturdy young man of about 24 with a round tanned face, a faint stubble, a wary honest look slightly to the right, mouth closed. Clothing: a plain wound cloth head wrap, a simple padded leather jerkin over a rough tunic with rolled sleeves, a small round shield strap on one shoulder. One small detail: the edge of a plain round wooden shield at the picture edge. No emblem on the cloth yet.

Negative: text, letters, numbers, logo, frame, border, watermark, chibi, child, cartoon face, glowing eyes, magic effects, aura, anime style, photo-real skin pores, gemstones, modern items, torn streaming cloth, extra fingers.
```

### R4. Mưu sĩ / quân sư / thám báo

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, BUST portrait (head, shoulders, upper chest), square 1:1, a faded sepia ink-wash misty landscape background that is lighter, desaturated and out of focus so the figure stands out, thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills, not photographic skin), real adult face with clear character appeal, not anime, not photographic. Medium saturation, warm earthy colours with ONE accent colour (earth brown). Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather. Modest historical costume, two layers, no glow, no magic effects. No text, no logo, no frame, no border.

Subject: an unnamed fictional mưu sĩ of a 10th-century Vietnamese warlord's army, a thin clever man of about 36 with a narrow face, a small moustache and a pointed goatee, sharp watchful eyes slightly to the right, a faint knowing set of the mouth. Clothing: a plain cloth cap or a knotted headscarf, a long-sleeved scholar's tunic with a short cloth cape, a leather satchel strap across the chest, no armor. One small detail: a rolled map and a few bamboo slips tucked at the satchel. No emblem on the cloth yet.

Negative: text, letters, numbers, logo, frame, border, watermark, chibi, child, cartoon face, glowing eyes, magic effects, aura, anime style, photo-real skin pores, gemstones, modern items, torn streaming cloth, extra fingers.
```

### R5. Pháp sư / thầy pháp / cung thủ-lính canh đầm

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, BUST portrait (head, shoulders, upper chest), square 1:1, a faded sepia ink-wash misty landscape background that is lighter, desaturated and out of focus so the figure stands out, thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills, not photographic skin), real adult face with clear character appeal, not anime, not photographic. Medium saturation, warm earthy colours with ONE accent colour (earth brown). Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather. Modest historical costume, two layers, no glow, no magic effects. No text, no logo, no frame, no border.

Subject: an unnamed fictional pháp sư of a 10th-century Vietnamese warlord's army, a lean ascetic man of about 45 with high cheekbones, a long thin beard and calm deep-set eyes, a distant composed gaze slightly to the right, mouth closed. Clothing: a plain wound cloth head wrap, a layered long-sleeved robe with a wide sash and a string of plain wooden beads, no armor. One small detail: the top of a plain wooden staff with a few knotted cords rising behind the shoulder. No emblem on the cloth yet.

Negative: text, letters, numbers, logo, frame, border, watermark, chibi, child, cartoon face, glowing eyes, magic effects, aura, anime style, photo-real skin pores, gemstones, modern items, torn streaming cloth, extra fingers.
```

### R6. Lang y

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, BUST portrait (head, shoulders, upper chest), square 1:1, a faded sepia ink-wash misty landscape background that is lighter, desaturated and out of focus so the figure stands out, thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills, not photographic skin), real adult face with clear character appeal, not anime, not photographic. Medium saturation, warm earthy colours with ONE accent colour (earth brown). Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather. Modest historical costume, two layers, no glow, no magic effects. No text, no logo, no frame, no border.

Subject: an unnamed fictional lang y of a 10th-century Vietnamese warlord's army, a gentle weathered man of about 50 with a kind lined face, a short grey beard and tired warm eyes, a patient gaze slightly to the right, the faintest softening of the mouth. Clothing: a plain wound cloth head wrap, a long-sleeved tunic with a short cloth cape and a leather herb satchel strap, no armor. One small detail: a small medicine gourd and a bundle of herbs hung at the strap. No emblem on the cloth yet.

Negative: text, letters, numbers, logo, frame, border, watermark, chibi, child, cartoon face, glowing eyes, magic effects, aura, anime style, photo-real skin pores, gemstones, modern items, torn streaming cloth, extra fingers.
```

## 4. Prompt đổi theo phe (dùng cho mọi ảnh gốc)

```text
Edit this image. KEEP EXACTLY unchanged: the man, his face, hair and head wrap, the pose, the crop, the painting style, the line weight and the background. CHANGE ONLY: (1) recolour the cloth to the faction colour [MÀU NHẤN] (tunic, cape or sash in that colour, armor leather and metal stay brown and steel); (2) sew one hand-sized flat embroidered patch of the faction emblem [BIỂU TƯỢNG, shape copied from the emblem reference image] on the cape or the visible shoulder sleeve in antique gold thread, never on the armor, not a metal badge; (3) [BIẾN THỂ: một chi tiết nhỏ, ví dụ a thin scar on the left cheek / a short moustache / the head-wrap end hanging longer]. No glow, no text.
```

Ảnh đính: ảnh gốc của vai, `bieu-tuong-<phe>.png`. Phe không có biểu tượng thì bỏ bước (2).

## 5. Tiêu chí duyệt

1. Nhận ra **đúng vai** ở cỡ ô thật (48 px trong thẻ đối thủ, khoảng 32 px ở danh sách): thủ lĩnh giáp và khăn, phó tướng áo choàng, lính khiên, mưu sĩ túi và mũ, thầy pháp áo dài, lang y túi thuốc.
2. **Cùng vai khác phe** vẫn phân biệt được nhờ màu nhấn và miếng thêu; hai NPC cùng vai trong **cùng một trận** (ví dụ phó tướng và thân binh Đỗ Động) dùng hai biến thể khác nhau.
3. Phong cách Hà Vân (nét viền mảnh dày mỏng, đổ bóng mềm); nét mặt nghiêm hoặc trung tính; không biểu tượng trên giáp.
4. Có mặt, tóc, khăn khác nhau giữa 6 vai.

## 6. Khi gắn vào game

- Thêm một bảng ánh xạ **id NPC → ảnh** (ví dụ `public/art/npc/<phe>-<vai>/bust.webp`, 384×384) và để `portraitUrl`/`Portrait` tra bảng này; nhân vật chưa có ảnh **vẫn dùng hình tạm SVG**.
- Thêm test: mọi id trong `encounters.ts` có `hero: false` đều có mục ánh xạ hoặc nằm trong danh sách "đang dùng hình tạm".
- Số ảnh: 6 gốc + khoảng 30 biến thể màu; xong mình chụp thử thẻ đối thủ ở 1440px và 360px trước khi commit.
