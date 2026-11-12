# Prompt bộ tranh Mai Thanh (phong cách mới)

> Cập nhật: 09/11/2026
> Trạng thái: **DRAFT** — bộ prompt viết từ đầu cho Mai Thanh, theo quy trình Hà Vân (ảnh chuẩn trước, các tranh sau tham chiếu ảnh chuẩn); Shan đã tạo đủ 7 ảnh và đã gắn vào game (09/11/2026, xem mục 10).

Căn cứ: `docs/03-characters/thiet-ke-lai-nhan-vat.md` (hồ sơ Mai Thanh: Y sư, hệ Thủy, ngoại hiệu Thanh Hồ, 22 tuổi, nghĩa quân Hoa Lư lo chữa trị) và các quy tắc đã chốt khi làm Hà Vân. Mỗi prompt **tự đủ ý, không cần ảnh tham chiếu cũ**; giữ đồng nhất bằng **một ảnh chuẩn** (mục 2).

## 0. Thứ tự làm

| Bước | Ảnh | Tham chiếu | Nền |
|---|---|---|---|
| 1 | **Ảnh chuẩn toàn thân** (mục 2) | không | trong suốt |
| 2 | Chân dung bán thân `bust.webp` (mục 3) | ảnh chuẩn | có nền sương |
| 3 | Tranh phong thái `style.webp` (mục 4) | ảnh chuẩn | trong suốt |
| 4 | Ra đòn, ra chiêu, tuyệt chiêu, ngã (mục 5) | ảnh chuẩn | trong suốt |

Nền sân khấu hệ Thủy chưa có (chỉ hệ Hỏa đã có tranh nền), nên trang chi tiết của Mai Thanh tạm dùng nền gỗ tối cũ.

## 1. Những điểm khác bản cũ (nên xem trước)

Hồ sơ đã duyệt đổi vài chi tiết so với tranh hiện tại của Mai Thanh, và các prompt dưới đây theo hồ sơ mới:

| | Tranh cũ trong game | Theo hồ sơ mới (prompt này) |
|---|---|---|
| Đầu | Khăn xanh nhạt có hoa trắng, dải khăn bay | **Tóc dài buông**, một trâm vàng nhỏ, nốt ruồi dưới mắt |
| Vật dụng đeo | Túi thuốc và chổi lá ở hông | **Cối đồng nhỏ** và túi thuốc vải ở hông |
| Dấu hiệu phe | không có | **Băng tay có bông lau** (nghĩa quân Hoa Lư) |
| Hồ lô | Hồ lô đôi men xanh, tua chàm | Giữ hình cổ điển, **khắc vân sông**, men xanh nhạt |
| Màu | Xanh dương đậm và xanh nhạt | **Xanh chàm làm màu nhấn duy nhất**, xanh nhạt chỉ ở tấm vải thêu |

Nếu Shan muốn **giữ khăn xanh có hoa** thay cho tóc buông, thay câu `Hair:` ở Khối NHÂN VẬT bằng: `Hair: dark brown, parted in the middle, covered by a pale celadon-blue cloth headscarf tied at the nape with one small white plum flower pinned on it, two soft scarf ends falling calmly over one shoulder (not flying); one small gold hairpin visible beside the scarf.`

## 2. Bốn khối dùng chung (dán nguyên khối, mỗi tranh dán đủ)

**Khối NHÂN VẬT:**

```text
Character: Mai Thanh, a Vietnamese young woman about 22 years old, the healer of the Hoa Lu volunteer army in 10th-century Vietnam, daughter of a river-boat medicine man. Gentle, resolute, caring, the kind of person who reminds everyone to drink water. Face: unmistakably feminine, soft round jawline, calm kind dark-brown eyes, fine natural brows, a tiny beauty mark just under the outer corner of her left eye, light natural lip colour, no forehead mark, no heavy makeup. Hair: long dark hair worn loose past the shoulders, parted at the side and tucked behind one ear, with one small gold hairpin holding the front strands; a few soft strands over the shoulder, calm, never wild. Clothing, modest and historical: a closed cross-collar short robe in deep indigo blue (the ONE accent colour) over a cream undershirt, long sleeves with the cuffs folded back once to the forearm, a long indigo skirt-robe open at the front over loose cream trousers, a brown cloth sash, a pale river-blue embroidered apron panel hanging at the front. Pattern work is part of her identity and must stay clearly visible but moderate: a river-wave and reed scroll embroidered in pale silver-blue and cream thread along the collar edge, cuffs, hem and the apron panel, with a few tiny gold accents; a narrow band of small Dong Son bird-and-wave motifs on the hem. A reed-plume armband (a white reed plume tied with a brown cord) on her left upper arm, the sign of the Hoa Lu army. At her right hip: a small bronze mortar for crushing herbs and a small cloth herb pouch with a few green leaves sticking out, carried only, never used as a weapon. Cloth shoes with navy cord leg wraps. Skin tone natural warm, no glow.
```

**Khối HỒ LÔ** (đặt đúng kích cỡ, tránh lúc to lúc nhỏ):

```text
Weapon: a double-lobed medicine gourd (hu lo), pale celadon-blue glazed ceramic with carved river-wave lines, total height about equal to the height of her head (about the length of her hand plus wrist and a bit more), a small bronze stopper cap on top, a short navy cord with one small navy tassel. It is carried by its cord in one hand, held in her hands, or lies on the ground when she is down. No glow, no liquid effects, no splash, no sparks. Keep exactly this size and design in every picture.
```

**Khối PHONG CÁCH toàn thân:**

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, full-body game sprite on a fully transparent background (no landscape, no ground, no cast shadow). Clean confident ink contour lines, smooth painterly shading with simplified soft cel-like shadow planes, minimal brush texture, no photo-real skin. Slightly idealised expressive face with clear character appeal; natural proportions, eyes only slightly larger than life; not anime, not photographic. Medium saturation, warm earthy colours with ONE strong accent colour (deep indigo blue). Soft diffused warm light from the upper left with a thin rim light on the shoulder. Hand-made cloth, leather and bronze only. No magic effects, no gemstones, no plunging neckline, no high heels, no layered flying silk veils. Facing right, the whole body visible, centred, with a small margin.
```

**Khối PHONG CÁCH bán thân (có nền):**

```text
Style: stylised digital painting of a historical Vietnamese character for a strategy game, bust portrait (head, shoulders and upper chest), three-quarter view, square 1:1. Clean confident ink contour lines, smooth painterly shading with simplified soft cel-like planes, minimal brush texture, no photo-real skin pores. Slightly idealised expressive face, natural proportions, eyes only slightly larger than life, not anime, not photographic. Medium saturation, warm earthy colours, ONE strong accent colour on the clothing (deep indigo blue). Strong figure-ground separation: the figure is warmer and more saturated with a soft rim light on the shoulder and cheek; the background is lighter, desaturated and out of focus. Background: a faded sepia ink-wash landscape in mist (distant limestone mountains, a quiet river with one small moored sampan and a bamboo palisade with a small reed-plume flag on the far bank), with a pale glow behind the head. Soft warm light from the upper left. No text, no frame, no border. Eyes at about 38% of the height from the top; keep the lower quarter calm and quiet.
```

**Câu chống lỗi** (thêm vào cuối mọi prompt):

```text
Do not add text, letters, logo, frame, watermark, glowing eyes, magic aura, water effects, gemstones, chibi proportions, 3D render, or a second person. Keep the beauty mark under her left eye in every picture.
```

## 3. Ảnh chuẩn toàn thân (không tham chiếu)

Khổ dọc 2:3 (ví dụ 1024×1536), PNG nền trong suốt. Dán: **NHÂN VẬT + HỒ LÔ + PHONG CÁCH toàn thân + dòng dưới + câu chống lỗi.**

```text
Pose: standing relaxed in a neutral three-quarter view facing slightly right, weight on one leg, a slight hip tilt, the gourd hanging by its navy cord from her right hand at her side, held a little away from the body so the whole gourd and cord stay clear of the robe, her left hand open and resting near her hip, calm kind gaze. The whole body visible from hair to shoes.
```

Khi duyệt: nét nữ dịu rõ; vân sông và họa tiết còn đủ; nốt ruồi dưới mắt; bông lau ở băng tay; hồ lô nhỏ cỡ đầu; nền trong suốt thật. Hồ lô treo **tách khỏi áo** để sau này cắt lớp hình động dễ (như trượng của Hà Vân). Xong thì chốt làm **ảnh chuẩn**.

## 4. Chân dung bán thân (có nền)

Tham chiếu: **chỉ ảnh chuẩn**. Dán: **NHÂN VẬT + PHONG CÁCH bán thân + dòng dưới + câu chống lỗi.**

```text
Framing: bust portrait. Looking slightly to the right, gentle and resolute. Show the loose dark hair with the small gold hairpin, the beauty mark under her left eye, the indigo cross-collar with the pale silver-blue river-wave embroidery, the reed-plume armband on her upper arm, and only the top of the pale blue gourd with its navy tassel hanging at her side near the edge of the picture. Keep the same person, face, hair and clothing as the reference image.
```

## 5. Tranh phong thái (trang chi tiết)

Tham chiếu: ảnh chuẩn. Khổ dọc, PNG trong suốt, từ 1000px cạnh dài. Dán: **NHÂN VẬT + HỒ LÔ + PHONG CÁCH toàn thân + dòng dưới + câu chống lỗi.**

```text
Pose: standing gracefully in a three-quarter view facing right, the gourd hanging by its cord from her left hand, her right hand holding up a small sprig of green herb and looking at it with a soft, caring expression, slight smile. Keep the same person, face, hair and clothing as the reference image. Whole body visible, centred.
```

## 6. Bốn tranh ra chiêu (nền trong suốt)

Tham chiếu: ảnh chuẩn. Dán: **NHÂN VẬT + HỒ LÔ + PHONG CÁCH toàn thân + dòng dáng + câu chống lỗi.** Khổ dọc 2:3 (ngã: ngang 3:2). **Mọi tranh quay về bên phải** (`facing right`), vì nhân vật phe trái nhìn sang phải; phe phải được lật tự động.

**Ra đòn:**

```text
Pose: a gentle forward step toward the right, her right hand open with the palm pushed forward to the right, the gourd swinging back from her left hand on its cord, a resolute focused gaze to the right. Facing right. Same person, face, hair and clothing as the reference image.
```

**Ra chiêu:**

```text
Pose: standing planted, holding the gourd in both hands in front of her chest, tilted a little toward the right as if offering its contents, calm caring expression, facing right. Same person, face, hair and clothing as the reference image.
```

**Tuyệt chiêu:**

```text
Pose: a wide stable stance, the gourd held high in her right hand above her shoulder, her left arm extended to the right with the palm turned up as if giving, a determined but gentle expression, body leaning slightly, facing right. Same person, face, hair and clothing as the reference image.
```

**Ngã** (khổ ngang 3:2):

```text
Pose: sitting slumped on the ground leaning on one hand, head bowed, eyes closed, the gourd lying on the ground beside her, hair falling naturally, seen from the side, facing right. Same person, face, hair and clothing as the reference image.
```

## 7. Nếu kết quả lệch, chỉ thêm một câu

| Nếu ảnh | Thêm câu |
|---|---|
| Hồ lô quá to hoặc quá nhỏ | `the gourd is exactly as tall as her head, double-lobed, pale celadon blue, held in one hand` |
| Mất họa tiết | `the river-wave embroidery on collar, cuffs, hem and apron must be clearly visible` |
| Quá thật | `stronger ink outlines, flatter colour shapes, game illustration look` |
| Quá anime | `realistic eye size, natural skin tone, less glossy` |
| Nền không trong suốt | `fully transparent PNG background, alpha channel, no white background, no floor shadow` |
| Khác người so với ảnh chuẩn | `same face, same hair, same robe colours and patterns as the reference image, only the pose changes` |
| Tóc bay lung tung | `hair falls calmly, no wind, no flying strands` |
| Quay sai hướng | `facing right, the character looks and acts toward the right edge of the picture` |

## 8. Tiêu chí tôi kiểm khi nhận ảnh

1. Nhận ra đúng Mai Thanh: tóc dài buông, trâm vàng, nốt ruồi dưới mắt, áo chàm, hồ lô xanh nhạt, nét nữ dịu.
2. **Hồ lô đồng nhất** (cỡ đầu, men xanh nhạt khắc vân sông, tua chàm) ở mọi tranh.
3. **Còn họa tiết:** vân sông ở viền cổ, cổ tay, gấu, tấm vải thêu; băng tay bông lau; cối đồng và túi thuốc ở hông.
4. Không fantasy: không hiệu ứng nước, phép, châu ngọc, trang điểm đậm.
5. Nền trong suốt thật; các tranh ra chiêu quay về bên phải, chân đặt đúng giữa hai bàn chân.
6. Ở cỡ thẻ 140×110px vẫn nhận ra (xanh chàm nổi trên nền sương).

## 9. Quy cách gửi lại

Gửi **PNG gốc**, đặt tên `chuan`, `bust`, `style`, `attack`, `cast`, `ultimate`, `down`. Tôi sẽ cắt sát, co về đúng cỡ, thay vào `public/art/characters/mai-thanh/`, chỉnh tọa độ trong `MAI_THANH` (`src/app/game/stage/rigs/mai-thanh.ts`), tách lớp lại hình động đứng (hồ lô và nắm tay, bàn tay buông, đầu, tóc/dải nếu có) và làm `portrait.webp` từ ảnh chuẩn.

## 10. Kết quả (09/11/2026)

Shan gửi đủ 7 ảnh theo đúng thứ tự mục 9 (chuẩn, bust, style, attack, cast, ultimate, down): tóc buông, khuôn mặt giữ nguyên ở mọi tranh, hồ lô cỡ đầu đồng nhất, các tranh ra chiêu đều quay sang phải nên **không cần lật tệp** như Hà Vân. Ảnh toàn thân nền trong suốt 1024×1536 (ngã 1536×1024), bust nền sương 1254×1254.

- **Tranh tư thế:** cắt sát, co 0,4 lần (`pose-attack`, `pose-cast`, `pose-ultimate`, `pose-down`); phong thái co 0,5 lần (`style.webp`); `standing.webp` co 0,25 lần từ ảnh chuẩn. Tọa độ mới trong `MAI_THANH` (`src/app/game/stage/rigs/mai-thanh.ts`): chân đặt giữa hai bàn chân; điểm bắn là bàn tay đẩy chưởng (đánh thường), miệng hồ lô (ra chiêu), hồ lô giơ cao (tuyệt chiêu). Tranh ngã có nhân vật lớn hơn ảnh chuẩn một chút (so cối đồng và hồ lô) nên đặt `scale` 0,9.
- **Hình động đứng:** ảnh chuẩn được tách lớp bằng code: `sword` là hồ lô cùng dây và tua (lắc quanh chỗ nắm dây, điểm `grip`), `arm` là nắm tay xách dây (xoay quanh cổ tay), `armR` là bàn tay trái đặt trên vạt áo (xoay quanh cổ tay), `head` là đầu; thân đã xóa hồ lô, nắm tay, bàn tay, phần vạt áo sau hồ lô và dưới bàn tay được vá lại theo vân vải.
- **Chân dung:** `bust.webp` 384×384 từ ảnh bust (đã thêm `maiThanh` vào `BUST_IDS`); `portrait.webp` 192×192 nền trong suốt cắt từ ảnh chuẩn.
- Tổng dung lượng thư mục `mai-thanh/` khoảng 300 KB, dưới ngân sách 350 KB.
