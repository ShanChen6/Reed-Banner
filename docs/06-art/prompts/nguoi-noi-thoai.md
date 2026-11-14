# Prompt chân dung người nói không tên trong thoại Chiến dịch (6 người)

> Cập nhật: 13/11/2026
> Trạng thái: **DRAFT** — prompt chân dung bán thân cho 6 người nói không tên trong thoại Chiến dịch (`speakerLook` trả `null`, hộp thoại hiện chữ cái đầu). Có ảnh thì xuất `public/art/npc/<id>.webp` (384×384) và thêm id vào `NPC_PORTRAIT_IDS` (`src/app/game/art/portrait-data.ts`); `STORY_SPEAKER_LOOKS` (`src/app/game/campaign/dialogue.ts`) tự nhận.

> Quyết định của Shan (13/11/2026): thiếu chân dung người đưa tin và các người nói không tên khác. Tất cả là **nhân vật hư cấu** (thoại hư cấu), tạo hình nhẹ, khác hẳn 30 NPC trận (không giáp trận); người phe Hoa Lư và Bố Hải có miếng thêu biểu tượng.

## Cách dùng chung

- Khổ vuông 1:1, từ 1024×1024, có nền sương. **Ảnh đính:** `bust-ha-van.png` (độ đậm nét viền, đổ bóng, tỉ lệ khung; không lấy mặt) và ảnh biểu tượng ghi ở từng người (nếu có).
- Bán thân được phép cười nhẹ (đã ghi từng người). Quay hơi về bên phải.
- Ô chân dung trong hộp thoại hiển thị ở khoảng 64–80px nên mỗi người cần **một món đồ nhận dạng rõ** (ống tin, gậy, thư, cờ lau, hương, thừng).

| Người nói | Id ảnh | Xuất hiện | Biểu tượng |
|---|---|---|---|
| Người đưa tin | `story-nguoi-dua-tin` | chapterOne (M01–M02, hỏi tin trong vùng) | không |
| Cụ già trong động | `story-cu-gia-trong-dong` | chapterOne (kể chuyện cờ lau) | không |
| Sứ giả Hoa Lư | `story-su-gia-hoa-lu` | chapterFive (xin mở bến cho thuyền lương) | `bieu-tuong-hoa-lu.png` |
| Một người lính già | `story-linh-gia` | chapterSix (nhớ chuyện cờ lau) | `bieu-tuong-hoa-lu.png` |
| Một người dân Hoa Lư | `story-nguoi-dan-hoa-lu` | chapterSix (nhìn cờ bay từ trên đồi) | không |
| Một tướng Bố Hải | `story-tuong-bo-hai` | chapterTwo (giữ kho lương và bến thuyền) | `bieu-tuong-bo-hai.png` |

## Người đưa tin (`story-nguoi-dua-tin`)

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, BUST portrait (head, shoulders, upper chest), three-quarter view, square 1:1, a faded sepia ink-wash misty landscape background that is lighter, desaturated and out of focus so the figure stands out (background: a misty river path between rice fields with a distant village and a few bamboo clumps), thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills, not photographic skin), real adult face with clear character appeal, not anime, not photographic. Medium saturation, warm earthy colours with ONE accent colour (faded blue-grey). Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather. Modest historical costume, no glow, no magic effects. No text, no logo, no frame, no border.

Subject: an unnamed fictional messenger of a 10th-century Vietnamese region, about 28 years old, lean, sun-tanned and wiry, with a travel-worn but alert face, a few days of stubble and a ready half-smile (a bust may smile lightly), looking slightly to the right. Hair in a topknot under a plain grey-blue headcloth knotted at the side. A short worn travel cape over a tan tunic with rolled sleeves, a leather strap across the chest carrying a small bamboo message tube, a rolled letter tucked in the belt edge, dust on the hem, no armor, no weapon, no emblem. One small detail: a small bundle of reed (lau) stems tied to the strap as a traveller's sign.

Negative: text, letters, numbers, logo, frame, border, watermark, chibi, child, cartoon face, glowing eyes, magic effects, aura, anime style, photo-real skin pores, gemstones, modern items, torn streaming cloth, extra fingers.
```

## Cụ già trong động (`story-cu-gia-trong-dong`)

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, BUST portrait (head, shoulders, upper chest), three-quarter view, square 1:1, a faded sepia ink-wash misty landscape background that is lighter, desaturated and out of focus so the figure stands out (background: the mouth of a limestone cave with reeds (lau) and low mist, soft light from outside), thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills, not photographic skin), real adult face with clear character appeal, not anime, not photographic. Medium saturation, warm earthy colours with ONE accent colour (earth brown). Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather. Modest historical costume, no glow, no magic effects. No text, no logo, no frame, no border.

Subject: an unnamed fictional village elder of about 75 years old, a thin kind face deeply lined, white hair gathered in a small topknot, a long thin white beard and moustache, warm clouded eyes under white brows, a gentle storyteller's smile (a bust may smile lightly), looking slightly to the right. A plain undyed tan tunic with a brown shawl over the shoulders, a wooden walking stick leaning on one shoulder, no armor, no weapon, no emblem. One small detail: a few white reed (lau) plumes held in his hand at the picture edge.

Negative: text, letters, numbers, logo, frame, border, watermark, chibi, child, cartoon face, glowing eyes, magic effects, aura, anime style, photo-real skin pores, gemstones, modern items, torn streaming cloth, extra fingers.
```

## Sứ giả Hoa Lư (`story-su-gia-hoa-lu`)

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, BUST portrait (head, shoulders, upper chest), three-quarter view, square 1:1, a faded sepia ink-wash misty landscape background that is lighter, desaturated and out of focus so the figure stands out (background: a misty river landing with a moored wooden boat and a low limestone ridge behind), thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills, not photographic skin), real adult face with clear character appeal, not anime, not photographic. Medium saturation, warm earthy colours with ONE accent colour (steel blue). Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather. Modest historical costume, no glow, no magic effects. No text, no logo, no frame, no border.

Subject: an unnamed fictional envoy of the Hoa Lu volunteer army, about 36 years old, composed, with a clear intelligent face, a short neat moustache and calm steady eyes, a courteous mild expression, looking slightly to the right. Hair in a neat topknot with a plain dark band. A steel-blue long-sleeved tunic with a cream inner collar and a short clean blue cape, a wide leather sash, no armor, no weapon. On the cape, a hand-sized flat embroidered patch of the Hoa Lu volunteer-army emblem (a bronze-drum sun: a round sun disc with a ring of short triangular rays and concentric circles, antique gold with dark outlines, shape copied from the emblem reference image, not a metal badge). One small detail: a rolled letter tied with a cord held at his chest.

Negative: text, letters, numbers, logo, frame, border, watermark, chibi, child, cartoon face, glowing eyes, magic effects, aura, anime style, photo-real skin pores, gemstones, modern items, torn streaming cloth, extra fingers.
```

Ảnh đính thêm: `bieu-tuong-hoa-lu.png` (chỉ lấy hình miếng thêu).

## Một người lính già (`story-linh-gia`)

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, BUST portrait (head, shoulders, upper chest), three-quarter view, square 1:1, a faded sepia ink-wash misty landscape background that is lighter, desaturated and out of focus so the figure stands out (background: a misty parade ground edge with a row of reed (lau) flags and low hills), thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills, not photographic skin), real adult face with clear character appeal, not anime, not photographic. Medium saturation, warm earthy colours with ONE accent colour (earth brown). Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather. Modest historical costume, no glow, no magic effects. No text, no logo, no frame, no border.

Subject: an unnamed fictional veteran soldier of about 62 years old, a broad weathered face with deep lines, short grey stubble, a faded old scar on one cheek, proud wet eyes and a quiet moved look, looking slightly to the right. Short grey hair under a faded brown headcloth. An old patched leather jerkin over a plain tunic with a worn leather strap across the chest, a small faded Hoa Lu bronze-drum sun patch sewn on one shoulder sleeve (flat thread embroidery, antique gold faded to ochre, shape copied from the emblem reference image, not a metal badge), no weapon. One small detail: a small reed (lau) flag stuck in his belt.

Negative: text, letters, numbers, logo, frame, border, watermark, chibi, child, cartoon face, glowing eyes, magic effects, aura, anime style, photo-real skin pores, gemstones, modern items, torn streaming cloth, extra fingers.
```

Ảnh đính thêm: `bieu-tuong-hoa-lu.png` (chỉ lấy hình miếng thêu).

## Một người dân Hoa Lư (`story-nguoi-dan-hoa-lu`)

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, BUST portrait (head, shoulders, upper chest), three-quarter view, square 1:1, a faded sepia ink-wash misty landscape background that is lighter, desaturated and out of focus so the figure stands out (background: a hillside path above a village with thin incense smoke and a row of small flags far away), thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills, not photographic skin), real adult face with clear character appeal, not anime, not photographic. Medium saturation, warm earthy colours with ONE accent colour (olive green). Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather. Modest historical costume, no glow, no magic effects. No text, no logo, no frame, no border.

Subject: an unnamed fictional villager of Hoa Lu, a woman of about 40 years old with a round sun-tanned friendly face, strong calm eyes and a thoughtful quiet expression, looking slightly to the right. Dark hair tied back under an olive-green headscarf. A plain undyed tunic with an olive-green overshirt with rolled sleeves, a cloth shoulder strap holding a small woven basket, no armor, no weapon, no emblem. One small detail: a few sticks of incense in her hand with a thin line of smoke.

Negative: text, letters, numbers, logo, frame, border, watermark, chibi, child, cartoon face, glowing eyes, magic effects, aura, anime style, photo-real skin pores, gemstones, modern items, torn streaming cloth, extra fingers.
```

## Một tướng Bố Hải (`story-tuong-bo-hai`)

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, BUST portrait (head, shoulders, upper chest), three-quarter view, square 1:1, a faded sepia ink-wash misty landscape background that is lighter, desaturated and out of focus so the figure stands out (background: a misty estuary with moored wooden boats and a stockaded river landing far away), thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills, not photographic skin), real adult face with clear character appeal, not anime, not photographic. Medium saturation, warm earthy colours with ONE accent colour (brick red). Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, Dinh dynasty era: hand-made cloth, leather. Modest historical costume, no glow, no magic effects. No text, no logo, no frame, no border.

Subject: an unnamed fictional general of the Bo Hai estuary warlord's army, about 40 years old, a sturdy broad face with a thick short beard, sea-weathered skin and a confident easy half-smile (a bust may smile lightly), looking slightly to the right. Hair in a topknot under a brick-red headcloth knotted at the side. Lightweight lamellar leather armor of small brown scales with small shoulder pieces over a brick-red tunic, a short clean brick-red cape on one shoulder, a leather strap across the chest, no weapon in view. On the cape, a hand-sized flat embroidered patch of the Bo Hai emblem (three gold wave crests with a small blue crest on top, shape copied from the emblem reference image, antique gold thread, not a metal badge). One small detail: a coil of rope at the edge of the shoulder.

Negative: text, letters, numbers, logo, frame, border, watermark, chibi, child, cartoon face, glowing eyes, magic effects, aura, anime style, photo-real skin pores, gemstones, modern items, torn streaming cloth, extra fingers.
```

Ảnh đính thêm: `bieu-tuong-bo-hai.png` (chỉ lấy hình miếng thêu).

## Tiêu chí duyệt

1. Mỗi người nhận ra ở cỡ 64px nhờ món đồ riêng; sáu người khác nhau rõ về tuổi, giới và dáng (đưa tin trẻ gầy, cụ già râu bạc, sứ giả điềm đạm, lính già có sẹo, người dân nữ, tướng Bố Hải vạm vỡ).
2. Biểu tượng Hoa Lư (sứ giả, lính già) và Bố Hải (tướng) thêu trên vải; người đưa tin, cụ già, người dân **không** biểu tượng.
3. Phong cách Hà Vân, nền sương nhạt; không phát sáng, không vũ khí lộ rõ (trừ chuôi kiếm của tướng nếu có).
