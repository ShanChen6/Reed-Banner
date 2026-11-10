# Prompt bộ tranh Lê Thạch (cầm giáo, phong cách mới)

> Cập nhật: 09/11/2026
> Trạng thái: **DRAFT** — bộ prompt viết lại hoàn toàn cho Lê Thạch cầm giáo và khiên mây (bỏ rìu vì mô hình tạo ảnh vẽ rìu sai nhiều lần); chưa có ảnh nào được tạo và gắn vào game.

Bỏ rìu: Lê Thạch cầm **giáo mũi đồng hình lá** và **khiên mây** (nhịp đâm, giống hình cổ điển trong game nên chỉ cần vẽ lại ảnh và cắt lại lớp). Docs thiết kế đã cập nhật.

## 0. Nguyên tắc của bộ này

1. **Lấy ảnh Lê Thạch đã duyệt (cầm rìu) làm khuôn cho mặt, áo, khiên.** Chỉ thay vũ khí. Đặt tên `khuon.png`, đính vào mọi lần tạo.
2. **Giáo là một đường thẳng dài nên dễ giữ nhất quán hơn rìu**, nhưng vẫn khóa hai thứ: **độ dài** (khi đứng thẳng, cán chạm đất thì mũi giáo cao hơn đỉnh nón khoảng một cái đầu) và **cách cầm** (một tay nắm cán ở nửa dưới, đầu giáo nhô xa).
3. Mỗi tranh chỉ dán **một khối ngắn**. Không nhồi thêm mô tả.
4. Nếu giáo vẫn lệch: sửa bằng **chế độ chỉnh ảnh** (mục 3), không tạo lại cả tranh.

**Giáo (khóa ở mọi tranh):** cán gỗ thẳng, tối màu, dài bằng chiều cao người cộng thêm một đầu, **mũi đồng hình lá** dài khoảng một gang tay rưỡi (khoảng nửa chiều cao đầu), có ống đồng ôm cán, **một chùm tua đỏ nâu nhỏ** buộc dưới mũi, nắp đồng nhỏ ở cuối cán.

**Khiên (khóa ở mọi tranh):** như ảnh khuôn: khiên mây tròn, núm đồng, vành gỗ có đinh đồng, dải răng cưa và sóng, bông lau trắng ở mép.

## 1. Quy trình

| Bước | Ảnh | Đính | Nền | Khổ |
|---|---|---|---|---|
| 1 | Ảnh chuẩn đứng | `khuon.png` | trong suốt | dọc 2:3 |
| 2 | Chân dung bán thân | ảnh chuẩn đứng | có nền sương | vuông 1:1 |
| 3 | Tranh phong thái | ảnh chuẩn đứng + `khuon.png` | trong suốt | dọc 2:3 |
| 4 | Ra đòn | ảnh chuẩn đứng + `khuon.png` | trong suốt | **ngang 3:2** |
| 5 | Ra chiêu | ảnh chuẩn đứng + `khuon.png` | trong suốt | dọc 2:3 |
| 6 | Tuyệt chiêu | ảnh chuẩn đứng + `khuon.png` | trong suốt | dọc 2:3 |
| 7 | Gục xuống | ảnh chuẩn đứng + `khuon.png` | trong suốt | **ngang 3:2** |

Ảnh khuôn quay mặt sang **trái**; game cần quay sang **phải**. Mô hình có thể lật ảnh (giáo ở tay nào cũng được); điều quan trọng là giống ảnh khuôn và quay mặt về cạnh phải.

## 2. Bảy prompt (dán nguyên khối)

Cụm này nằm sẵn trong từng prompt, ghi ở đây để bạn kiểm:

- **Giữ như ảnh khuôn:** mặt, nón lá, áo da ô-liu với ba dải họa tiết, áo vải gai sờn mép, đai nâu đỏ, túi vải ở hông, quần nâu, quấn chân vải, dép rơm, khiên mây có bông lau; thêm **một vết sẹo nhỏ nhạt ở cằm**.
- **Thay rìu bằng giáo** như mô tả ở mục 0.

### 2.1 Ảnh chuẩn đứng (đính: `khuon.png`)

```text
Use the reference image as the exact character: same face, same conical hat, same olive leather jerkin with three bands of patterns, same tunic, sash, soil pouch, trousers, leg wraps and sandals, and the same round rattan shield with the white reed plume. Add one small pale scar on his chin. IMPORTANT: do NOT draw the axe from the reference. Instead he carries a spear.

The spear: a straight dark wooden shaft as long as his own height plus one head, a leaf-shaped bronze spearhead about half a head-height long fixed on a bronze socket, a small red-brown tassel tied just below the spearhead, a small bronze cap at the bottom of the shaft.

Draw him standing calmly, facing right (toward the right edge of the picture), three-quarter view, weight on both feet, the spear held upright in one hand at his side with the bottom of the shaft resting on the ground beside his foot, that hand gripping the shaft at about chest height, the whole spear visible with its tip about one head above his hat, the round shield on the other forearm in front of his body, steady gaze. Full body from hat to sandals and the whole spear, centred, small margin.

Painting style: clean thin soft outlines, soft cel-like shading, medium saturation, warm earthy colours with earth brown as the accent, same palette as the reference, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text.
```

### 2.2 Chân dung bán thân (đính: ảnh chuẩn đứng)

```text
Use the reference image as the exact character: same face, same conical hat, same olive leather jerkin with the three pattern bands, same tunic. Add one small pale scar on his chin.

Draw a bust portrait (head, shoulders, upper chest), three-quarter view, looking slightly to the right, calm and steady. The hat tilted back so his whole face and the scar are visible, the hat brim fully inside the frame. At one side, only the leaf-shaped bronze spearhead with its small red-brown tassel rises beside his shoulder, partly in the frame. Only the edge of the round rattan shield with the white reed plume is visible at the lower side.

Painting style: clean thin soft outlines, soft cel-like shading, medium saturation, warm earthy colours with earth brown as the accent, slightly idealised face, not anime, not photographic. Background: a faded sepia ink-wash landscape in mist, an earthen river dike with bamboo clumps, a quiet river, distant limestone hills, a small flag far away, a pale glow behind the head, lighter and out of focus so the figure stands out. Eyes at about 38% of the height from the top, the lower quarter calm. Square 1:1, no text, no frame.
```

### 2.3 Tranh phong thái (đính: ảnh chuẩn đứng + `khuon.png`)

```text
Use the reference images as the exact character and equipment: same face, hat, olive jerkin with three pattern bands, tunic, sash, pouch, trousers, wraps, sandals and the same round rattan shield with the white reed plume. Small pale scar on his chin. Do NOT draw the axe; he carries the same spear as in the first reference image: straight dark shaft as long as his height plus one head, leaf-shaped bronze spearhead on a bronze socket, small red-brown tassel below the head, small bronze cap at the bottom.

Pose: kneeling on one knee, facing right (toward the right edge of the picture), his free hand pressed flat on the ground as he touches the earth before work, the spear held upright in the other hand with the bottom of the shaft resting on the ground, the whole spear visible, the shield lowered on his forearm, head slightly bowed, calm resolute expression. Full body and the whole spear, centred.

Painting style: clean thin soft outlines, soft cel-like shading, medium saturation, warm earthy colours, earth brown accent, same palette as the reference, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text.
```

### 2.4 Ra đòn (đính: ảnh chuẩn đứng + `khuon.png`; khổ ngang 3:2)

```text
Use the reference images as the exact character and equipment: same face, hat, olive jerkin with three pattern bands, tunic, sash, pouch, trousers, wraps, sandals and the same round rattan shield with the white reed plume. Small pale scar on his chin. Do NOT draw the axe; he carries the same spear as in the first reference image: straight dark shaft as long as his height plus one head, leaf-shaped bronze spearhead on a bronze socket, small red-brown tassel below the head, small bronze cap at the bottom.

Pose: a strong forward lunge toward the right, facing right (toward the right edge of the picture), the spear pushed forward horizontally at chest height with the tip pointing to the right, held with one hand near the middle of the shaft and the other hand near the back of the shaft (or the shield arm holding the shield close to his body), a focused gaze. The whole spear is visible inside the picture. Full body, wide horizontal picture, centred.

Painting style: clean thin soft outlines, soft cel-like shading, medium saturation, warm earthy colours, earth brown accent, same palette as the reference, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text.
```

### 2.5 Ra chiêu (đính: ảnh chuẩn đứng + `khuon.png`)

```text
Use the reference images as the exact character and equipment: same face, hat, olive jerkin with three pattern bands, tunic, sash, pouch, trousers, wraps, sandals and the same round rattan shield with the white reed plume. Small pale scar on his chin. Do NOT draw the axe; he carries the same spear as in the first reference image: straight dark shaft as long as his height plus one head, leaf-shaped bronze spearhead on a bronze socket, small red-brown tassel below the head, small bronze cap at the bottom.

Pose: planted wide and low, facing right (toward the right edge of the picture), the round shield pushed forward like a wall, the spear held upright in the other hand beside him with the bottom of the shaft on the ground, the whole spear visible, a solid and steady expression. Full body and the whole spear, centred.

Painting style: clean thin soft outlines, soft cel-like shading, medium saturation, warm earthy colours, earth brown accent, same palette as the reference, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text.
```

### 2.6 Tuyệt chiêu (đính: ảnh chuẩn đứng + `khuon.png`)

```text
Use the reference images as the exact character and equipment: same face, hat, olive jerkin with three pattern bands, tunic, sash, pouch, trousers, wraps, sandals and the same round rattan shield with the white reed plume. Small pale scar on his chin. Do NOT draw the axe; he carries the same spear as in the first reference image: straight dark shaft as long as his height plus one head, leaf-shaped bronze spearhead on a bronze socket, small red-brown tassel below the head, small bronze cap at the bottom.

Pose: a wide stable stance, facing right (toward the right edge of the picture), the spear raised high in one hand with the shaft slanting up and forward to the right, the spearhead above his head level, the shield held forward on the other forearm, leaning slightly forward, a determined expression. The whole spear is visible inside the picture. Full body, centred.

Painting style: clean thin soft outlines, soft cel-like shading, medium saturation, warm earthy colours, earth brown accent, same palette as the reference, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text.
```

### 2.7 Gục xuống (đính: ảnh chuẩn đứng + `khuon.png`; khổ ngang 3:2)

```text
Use the reference images as the exact character and equipment: same face, hat, olive jerkin with three pattern bands, tunic, sash, pouch, trousers, wraps, sandals and the same round rattan shield with the white reed plume. Small pale scar on his chin. Do NOT draw the axe; the same spear as in the first reference image lies on the ground: straight dark shaft as long as his height plus one head, leaf-shaped bronze spearhead on a bronze socket, small red-brown tassel below the head, small bronze cap at the bottom.

Pose: sitting exhausted on the ground, seen from the side, facing right, his back sagging, leaning on one arm with the other arm resting limp, head hanging forward, eyes closed, a tired face, the hat fallen on the ground beside him, the spear lying on the ground beside him with the whole length visible, the shield lying on the ground near him. Full figure, wide horizontal picture.

Painting style: clean thin soft outlines, soft cel-like shading, medium saturation, warm earthy colours, earth brown accent, same palette as the reference, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text.
```

## 3. Nếu giáo lỗi: sửa bằng chế độ chỉnh ảnh

Đưa tranh lỗi vào **chế độ chỉnh ảnh** và ghi:

```text
Edit only the spear in this image: make it a straight dark wooden shaft as long as the character's height plus one head, with a leaf-shaped bronze spearhead on a bronze socket, a small red-brown tassel below the head and a small bronze cap at the bottom. His hand grips the shaft with four fingers and a thumb. Keep everything else unchanged.
```

## 4. Nếu kết quả lệch, chỉ thêm một câu cuối prompt

| Nếu ảnh | Thêm câu |
|---|---|
| Giáo quá ngắn hoặc quá dài | `the spear shaft is as long as his own height plus one head, the whole spear visible in the picture` |
| Mũi giáo không phải hình lá | `a leaf-shaped bronze spearhead, wide in the middle and pointed, on a short bronze socket` |
| Vẫn vẽ rìu | `no axe, only a spear` |
| Giáo bị cắt khỏi khung | `the whole spear inside the picture, leave a margin around the tip and the bottom` |
| Ngón tay lỗi | `anatomically correct hand, four fingers and a thumb` |
| Mất sẹo ở cằm | `a small pale scar on his chin, clearly visible` |
| Mất họa tiết | `the three pattern bands on the jerkin must be clearly visible` |
| Tranh gục xuống trông như đang quỳ | `sitting slumped on the ground, eyes closed, head hanging, a limp arm, the spear lying on the ground, not kneeling` |
| Quay sai hướng | `facing right, looking toward the right edge of the picture` |
| Nét vẽ đổi kiểu (viền đen dày) | `thin soft outlines and the same colour palette as the reference` |
| Nền không trong suốt | `fully transparent PNG background, no white, no floor shadow` |

## 5. Tiêu chí tôi kiểm khi nhận ảnh

1. Nhận ra đúng Lê Thạch: nón lá, da sạm nắng, sẹo ở cằm, áo da ô-liu với ba dải họa tiết.
2. **Giáo đồng nhất** ở mọi tranh: cán dài bằng người cộng một đầu, mũi đồng hình lá, tua đỏ nâu, nắp đồng; **cả cây giáo nằm trong khung**; nắm tay đúng chỗ, năm ngón tự nhiên.
3. Khiên giống ảnh khuôn (núm đồng, dải răng cưa và sóng, bông lau).
4. Tranh gục xuống đọc ra ngay là kiệt sức.
5. Quay về bên phải; nền trong suốt thật; chân đặt đúng giữa hai bàn chân ở tranh đứng và ra chiêu.
6. Ở cỡ thẻ 140×110px vẫn nhận ra.

## 6. Quy cách gửi lại

Gửi **PNG gốc**, tên `chuan`, `bust`, `style`, `attack`, `cast`, `ultimate`, `down`. Tôi sẽ cắt, co về đúng cỡ, thay vào `public/art/characters/le-thach/`, chỉnh tọa độ trong `LE_THACH` (`rigs.ts`; vũ khí vẫn là giáo nên giữ nhịp đâm), tách lớp lại hình động đứng (giáo cùng nắm tay, khiên cùng cẳng tay, đầu và nón lá) và làm `portrait.webp`.
