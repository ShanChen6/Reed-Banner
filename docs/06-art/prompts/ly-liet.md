# Prompt bộ tranh Lý Liệt (phong cách mới)

> Cập nhật: 09/11/2026
> Trạng thái: **DRAFT** — bộ prompt viết cho Lý Liệt (Tướng sĩ, hệ Hỏa) cầm đao cán dài có ruy băng đỏ theo tranh cũ (hồ sơ ghi đôi hộ thủ câu, chưa chốt đổi; xem mục 0), áo đỏ gạch ba vạch vuốt, màu nhấn đỏ cam; chưa có ảnh nào được tạo và gắn vào game.

Căn cứ: hồ sơ Lý Liệt trong `docs/03-characters/ho-so-37-tuong-thuong.md` (Tướng sĩ, hệ Hỏa, ngoại hiệu Cuồng Hỏa, khoảng 35 tuổi, lính giữ chợ bến Đằng Châu theo về Hoa Lư, anh của Lý Diệm) và các bài học từ chín nhân vật trước: **prompt ngắn, khẳng định, mỗi tranh một khối, ảnh chuẩn làm khuôn, vật cầm đơn giản và khóa kích cỡ**.

## 0. Cần Shan quyết trước: vũ khí

Hồ sơ ghi **đôi hộ thủ câu** (hai thanh kiếm móc ngắn). Tranh cũ trong game lại là **một cây đao cán dài, lưỡi cong, có ruy băng đỏ**. Tôi viết prompt theo **tranh cũ (một cây đao cán dài)** vì: (1) tranh cũ đã được duyệt, đỡ phải đổi hình động và nhịp; (2) hai thanh kiếm móc là hình khó, dễ vẽ sai chi tiết và dễ vướng bộ lọc như rìu của Lê Thạch. Nếu bạn muốn đúng hồ sơ (đôi hộ thủ câu), nói tôi viết lại, và khi chốt tôi sẽ cập nhật hồ sơ cho khớp.

## 1. Quy trình

| Bước | Ảnh | Đính | Nền | Khổ |
|---|---|---|---|---|
| 1 | **Ảnh chuẩn đứng** | không | trong suốt | dọc 2:3 |
| 2 | Chân dung bán thân | ảnh chuẩn | có nền sương | vuông 1:1 |
| 3 | Tranh phong thái | ảnh chuẩn | trong suốt | dọc 2:3 |
| 4 | Ra đòn | ảnh chuẩn | trong suốt | **ngang 3:2** |
| 5 | Ra chiêu | ảnh chuẩn | trong suốt | dọc 2:3 |
| 6 | Tuyệt chiêu | ảnh chuẩn | trong suốt | dọc 2:3 |
| 7 | Gục xuống | ảnh chuẩn | trong suốt | **ngang 3:2** |

**Giữ từ tranh cũ:** đao cán dài có ruy băng đỏ (nhịp chém), áo đỏ gạch, tóc buộc cao, giáp ngực đồng. **Đổi theo hồ sơ:** áo thêu **ba vạch vuốt** màu cam (dấu hiệu lính Đằng Châu), **khăn đỏ buộc ngang trán**, **vết cháy xém ở cẳng tay phải** (thay cho vết xước trên má), tính cách nóng thẳng thể hiện qua nụ cười ngạo, **đỏ cam là màu nhấn duy nhất**.

**Quy tắc cố định ở mọi tranh:**
1. **Đao cán dài:** cán nâu tối cao ngang người, nắp đồng ở đáy; lưỡi thép một lưỡi cong dài khoảng 1,5 lần chiều cao đầu, có một mũi móc nhỏ ở sống lưỡi; vòng đồng dưới lưỡi; **ruy băng đỏ** buộc ngay dưới vòng đồng. **Cả cây nằm trong khung** (chừa lề quanh đầu lưỡi).
2. **Áo:** đỏ gạch thêu ba vạch vuốt cam; giáp ngực da đinh đồng nhạt; bảo vệ cổ tay hai bên.
3. Mọi tranh **quay về bên phải**, nền **trong suốt thật**.

## 1. Ảnh chuẩn đứng (không tham chiếu)

Khổ dọc 2:3 (ví dụ 1024×1536), PNG nền trong suốt.

```text
Ly Liet, a Vietnamese man of about 35, a market-wharf guard of Dang Chau who later joined the Hoa Lu volunteer army in 10th-century Vietnam, hot-tempered and straight-talking, quick to get angry but never goes back on his word, he cracks his finger joints when he waits. Lean muscular build, a sharp lively face with bright eyes, black hair in a high ponytail tied with a red cloth band, a thick red headband across his forehead. A small old burn scar on his right forearm. Clothing, modest and historical: a brick-red short-sleeved tunic with three claw-stroke stripes embroidered in orange thread across the chest and along the hem (the sign of the Dang Chau soldiers), a light bronze-studded leather chest guard over it, a bronze-studded leather wrist guard on each forearm, a dark sash, loose dark trousers with red cord leg wraps and woven sandals. Red-orange is the ONE accent colour.

He carries a pole blade with a long wooden shaft about as tall as his own height, a dark brown shaft with a small bronze cap at the bottom, and at the top a single-edged curved steel blade about 1.5 head-heights long with a small hooked spike on its back, a bronze ring below the blade, and a red cloth ribbon tied just below the ring. Keep exactly this design in every picture.

Pose: standing in a three-quarter view facing right (toward the right edge of the picture), weight on one leg, the pole held upright in his right hand at his side with its bottom on the ground, his grip at about chest height, his left hand cracking the knuckles of his fist in front of his belt, a cocky sharp grin. Full body from ponytail to sandals and the whole pole with a margin above the blade, centred.

Painting style: stylised digital painting for a strategy game, clean confident ink outlines, soft cel-like shading with simplified shadow planes, no photo-real skin, slightly idealised expressive face, natural proportions, not anime, not photographic. Medium saturation, warm earthy colours with red-orange as the single accent, soft diffused warm light from the upper left. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 2. Chân dung bán thân (đính: ảnh chuẩn)

Khổ vuông 1:1 (từ 1024×1024), có nền.

```text
Use the reference image as the exact character: same sharp lively face with bright eyes, same high ponytail with the red band, same red headband, same brick-red tunic with the three orange claw-stroke stripes and bronze-studded chest guard.

Draw a bust portrait (head, shoulders, upper chest), three-quarter view, looking slightly to the right with a cocky half-smile. Only the curved blade of the pole with its red ribbon rises beside his shoulder, partly in the frame.

Painting style: clean ink outlines, soft cel-like shading, medium saturation, warm earthy colours with red-orange as the accent, slightly idealised face, not anime, not photographic. Background: a faded sepia ink-wash landscape in mist, a busy market wharf with awnings, stacked sacks and lanterns, low tiled roofs, a small flag far away, a pale glow behind the head, lighter and out of focus so the figure stands out. Eyes at about 38% of the height from the top, the lower quarter calm. Square 1:1, no text, no frame.
```

## 3. Tranh phong thái (đính: ảnh chuẩn)

Khổ dọc 2:3, từ 1000px cạnh dài, PNG nền trong suốt.

```text
Use the reference image as the exact character and equipment: same face, high ponytail with the red band, red headband, brick-red tunic with the three orange claw-stroke stripes, bronze-studded chest guard and wrist guards, the burn scar on the right forearm, and the same pole blade (shaft as tall as he is, curved blade with a small hook on its back, red ribbon below the blade).

Pose: standing facing right (toward the right edge of the picture), the pole resting on his shoulder with one hand holding the shaft, the other hand pulling his fingers one by one to crack the knuckles, his head tilted with a confident impatient grin as if waiting for someone to start trouble. The whole pole is inside the picture. Full body, centred.

Painting style: clean ink outlines, soft cel-like shading with simplified shadow planes, medium saturation, warm earthy colours with red-orange as the accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 4. Ra đòn (đính: ảnh chuẩn; khổ ngang 3:2)

Khổ ngang 3:2.

```text
Use the reference image as the exact character and equipment: same face, high ponytail with the red band, red headband, brick-red tunic with the three orange claw-stroke stripes, bronze-studded chest guard and wrist guards, the burn scar on the right forearm, and the same pole blade (shaft as tall as he is, curved blade with a small hook on its back, red ribbon below the blade).

Pose: a wide forward lunge toward the right, facing right (toward the right edge of the picture), the pole held in both hands and swept forward to the right at waist height, the curved blade pointing right with the red ribbon streaming behind it, his weight low and steady, a focused gaze. The whole pole is inside the picture. Full body, wide horizontal picture, centred.

Painting style: clean ink outlines, soft cel-like shading with simplified shadow planes, medium saturation, warm earthy colours with red-orange as the accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 5. Ra chiêu (đính: ảnh chuẩn)

Khổ dọc 2:3.

```text
Use the reference image as the exact character and equipment: same face, high ponytail with the red band, red headband, brick-red tunic with the three orange claw-stroke stripes, bronze-studded chest guard and wrist guards, the burn scar on the right forearm, and the same pole blade (shaft as tall as he is, curved blade with a small hook on its back, red ribbon below the blade).

Pose: planted wide and low, facing right (toward the right edge of the picture), the pole held across his body in both hands with the blade end at the right, one fist clenched near the shaft, a fiery determined expression, the red headband tails and the ribbon moved by the wind. The whole pole is inside the picture. Full body, centred.

Painting style: clean ink outlines, soft cel-like shading with simplified shadow planes, medium saturation, warm earthy colours with red-orange as the accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 6. Tuyệt chiêu (đính: ảnh chuẩn)

Khổ dọc 2:3.

```text
Use the reference image as the exact character and equipment: same face, high ponytail with the red band, red headband, brick-red tunic with the three orange claw-stroke stripes, bronze-studded chest guard and wrist guards, the burn scar on the right forearm, and the same pole blade (shaft as tall as he is, curved blade with a small hook on its back, red ribbon below the blade).

Pose: a wide stable stance, facing right (toward the right edge of the picture), the pole raised high in both hands above his head with the blade slanting up and forward to the right, the red ribbon and the headband tails streaming sideways, leaning slightly forward, a fierce grin. The whole pole is inside the picture with a margin around the blade end. Full body, centred.

Painting style: clean ink outlines, soft cel-like shading with simplified shadow planes, medium saturation, warm earthy colours with red-orange as the accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 7. Gục xuống (đính: ảnh chuẩn; khổ ngang 3:2)

Khổ ngang 3:2.

```text
Use the reference image as the exact character and equipment: same face, high ponytail with the red band, red headband, brick-red tunic with the three orange claw-stroke stripes, bronze-studded chest guard and wrist guards, the burn scar on the right forearm, and the same pole blade (shaft as tall as he is, curved blade with a small hook on its back, red ribbon below the blade).

Pose: sitting exhausted on the ground, seen from the side, facing right, his back sagging, leaning on one arm with the other arm resting limp, head hanging forward, eyes closed, a tired face, the red headband slipped, the pole lying on the ground beside him with its whole length visible. Full figure, wide horizontal picture.

Painting style: clean ink outlines, soft cel-like shading with simplified shadow planes, medium saturation, warm earthy colours with red-orange as the accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 8. Nếu kết quả lệch, chỉ thêm một câu cuối prompt

| Nếu ảnh | Thêm câu |
|---|---|
| Đao quá ngắn như dao, hoặc quá dài như thương | `the pole is about as tall as the character himself, a curved blade of about 1.5 head-heights at the top` |
| Lưỡi thẳng hoặc hai lưỡi | `a single-edged curved blade with a small hook on its back` |
| Mất ruy băng đỏ | `a red cloth ribbon tied just below the bronze ring under the blade` |
| Đao bị cắt khỏi khung | `the whole pole inside the picture, leave a margin around the blade end and the bottom` |
| Mất ba vạch vuốt | `three orange claw-stroke stripes embroidered clearly on the brick-red tunic` |
| Mất khăn đỏ trên trán | `a thick red headband across his forehead and a high ponytail with a red band` |
| Thiếu vết cháy ở cẳng tay | `a small old burn scar on his right forearm, clearly visible` |
| Mặt hiền quá, mất vẻ nóng nảy | `a sharp lively face with bright eyes and a cocky grin` |
| Ngón tay lỗi | `anatomically correct hands, four fingers and a thumb on each hand` |
| Tranh gục xuống trông như đang quỳ | `sitting slumped on the ground, eyes closed, head hanging, a limp arm, the pole lying on the ground, not kneeling` |
| Quay sai hướng | `facing right, looking toward the right edge of the picture` |
| Nét vẽ đổi kiểu (viền đen dày) | `thin soft outlines and the same colour palette as the reference` |
| Nền không trong suốt | `fully transparent PNG background, no white, no floor shadow` |

**Nếu công cụ từ chối vì bộ lọc:** đổi "cocky", "fierce", "fiery" thành "confident", "determined"; gọi đao là `a long-handled festival blade`; gửi tôi nguyên văn thông báo từ chối.

## 9. Tiêu chí tôi kiểm khi nhận ảnh

1. Nhận ra đúng Lý Liệt: khăn đỏ ngang trán, tóc buộc cao, mắt sáng, áo đỏ gạch ba vạch cam, vết cháy ở cẳng tay phải.
2. **Đao cán dài đồng nhất** ở mọi tranh (cán cao ngang người, lưỡi cong có móc, ruy băng đỏ), **cả cây nằm trong khung**.
3. Đỏ cam là màu nhấn duy nhất.
4. Tranh gục xuống đọc ra ngay là kiệt sức.
5. Quay về bên phải; nền trong suốt thật; chân đặt đúng giữa hai bàn chân ở tranh đứng và ra chiêu.
6. Ở cỡ thẻ 140×110px vẫn nhận ra.

## 10. Quy cách gửi lại

Gửi **PNG gốc**, tên `chuan`, `bust`, `style`, `attack`, `cast`, `ultimate`, `down`. Tôi sẽ cắt, co về đúng cỡ, thay vào `public/art/characters/ly-liet/`, chỉnh tọa độ trong `LY_LIET` (`rigs.ts`; vũ khí vẫn là đao nên giữ nhịp chém), tách lớp lại hình động đứng (đao cùng nắm tay, bàn tay buông, đầu và dải khăn) và làm `portrait.webp`.
