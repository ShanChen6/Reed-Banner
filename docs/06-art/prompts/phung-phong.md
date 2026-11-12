# Prompt bộ tranh Phùng Phong (phong cách mới)

> Cập nhật: 09/11/2026
> Trạng thái: **DRAFT** — bộ prompt viết cho Phùng Phong (Quân sư, hệ Phong) cầm gậy trúc chỉ huy, thổi sáo trúc ở tranh ra chiêu; Shan đã tạo đủ 7 ảnh và đã gắn vào game (09/11/2026, xem mục 11).

Căn cứ: hồ sơ Phùng Phong trong `docs/03-characters/thiet-ke-lai-nhan-vat.md` (Quân sư, hệ Phong, ngoại hiệu Báo Phong, khoảng 40 tuổi, trinh sát đưa tin của nghĩa quân Hoa Lư) và các bài học từ Hà Vân, Mai Thanh, Lê Thạch: **prompt ngắn, nói khẳng định, mỗi tranh một khối, từ ảnh chuẩn trở đi dùng ảnh làm khuôn, vũ khí chỉ là một cây gậy trúc đơn giản**.

## 0. Quy trình

| Bước | Ảnh | Đính | Nền | Khổ |
|---|---|---|---|---|
| 1 | **Ảnh chuẩn đứng** | không | trong suốt | dọc 2:3 |
| 2 | Chân dung bán thân | ảnh chuẩn | có nền sương | vuông 1:1 |
| 3 | Tranh phong thái | ảnh chuẩn | trong suốt | dọc 2:3 |
| 4 | Ra đòn | ảnh chuẩn | trong suốt | **ngang 3:2** |
| 5 | Ra chiêu | ảnh chuẩn | trong suốt | dọc 2:3 |
| 6 | Tuyệt chiêu | ảnh chuẩn | trong suốt | dọc 2:3 |
| 7 | Gục xuống | ảnh chuẩn | trong suốt | **ngang 3:2** |

**Khác tranh cũ trong game:** cờ lệnh mây gió trên giáo thành **gậy trúc chỉ huy** (nhịp trượng), thêm **sáo trúc cài hông** có dải vải bông lau (vật dụng, không đánh), khăn xanh ngọc, râu thưa, áo nâu xám thêu vân gió xoáy (xanh ngọc là màu nhấn duy nhất).

**Quy tắc cố định ở mọi tranh:**
1. **Gậy trúc** thẳng, mảnh, có đốt, dài **ngang vai khi dựng đứng** (không dài hơn đầu), một dải vải xanh ngọc nhỏ buộc dưới ngọn. Cầm một tay, nắm ở nửa trên.
2. **Sáo trúc** ngắn cài ở hông phải, có dải vải trắng bông lau (dấu phe).
3. **Họa tiết là nhận diện:** vân gió xoáy ở cổ áo, cổ tay, gấu áo.
4. Mọi tranh **quay về bên phải**, nền **trong suốt thật**, cả cây gậy nằm trong khung.

## 1. Ảnh chuẩn đứng (không tham chiếu)

Khổ dọc 2:3 (ví dụ 1024×1536), PNG nền trong suốt.

```text
Phung Phong, a Vietnamese man of about 40, the scout and messenger of the Hoa Lu volunteer army in 10th-century Vietnam, calm, observant, quiet, he often looks up at the sky before he speaks. Lean build, a narrow weathered face, bright attentive eyes, a thin sparse goatee, a jade-teal cloth turban wrapped around his head with the end hanging behind his shoulder. Clothing, modest and historical: a brown-grey cross-collar long robe with long sleeves, jade-teal (blue-green) swirling wind-pattern embroidery along the collar, cuffs and hem, a plain dark sash, loose grey trousers, cloth leg wraps and simple cloth shoes. Jade teal is the ONE accent colour. A short bamboo flute tucked into the sash at his right hip, with a small white reed-plume cloth strip tied to it.

He carries a slender straight bamboo staff with visible nodes, as tall as his own shoulder when held upright, with a small jade-teal cloth ribbon tied just below its top.

Pose: standing calmly in a three-quarter view facing right (toward the right edge of the picture), weight on both feet, the bamboo staff held upright in his right hand at his side with its bottom resting on the ground, his grip on the upper half of the staff, his left hand open and relaxed near his belt, his face lifted slightly as if reading the sky. Full body from turban to shoes and the whole staff, centred, small margin.

Painting style: stylised digital painting for a strategy game, clean confident ink outlines, soft cel-like shading with simplified shadow planes, no photo-real skin, slightly idealised expressive face, natural proportions, not anime, not photographic. Medium saturation, warm earthy colours with jade teal as the single accent, soft diffused warm light from the upper left. Fully transparent background, no ground, no shadow, no text, no frame.
```

Khi duyệt: râu thưa, khăn xanh ngọc, vân gió xoáy còn rõ, gậy trúc ngang vai (không như cây giáo), sáo ở hông phải có dải trắng, nền trong suốt thật. Chốt làm **ảnh chuẩn**.

## 2. Chân dung bán thân (đính: ảnh chuẩn)

Khổ vuông 1:1 (từ 1024×1024), có nền.

```text
Use the reference image as the exact character: same face with the thin sparse goatee, same jade-teal turban, same brown-grey robe with the swirling wind-pattern embroidery.

Draw a bust portrait (head, shoulders, upper chest), three-quarter view, looking slightly to the right and a little upward, calm and observant. Only the top of the bamboo staff with its small jade-teal ribbon rises beside his shoulder, partly in the frame.

Painting style: clean ink outlines, soft cel-like shading, medium saturation, warm earthy colours with jade teal as the accent, slightly idealised face, not anime, not photographic. Background: a faded sepia ink-wash landscape in mist, windswept mountain ridges with clouds streaming sideways, a few bamboo leaning in the wind, a small reed-plume flag far away, a pale glow behind the head, lighter and out of focus so the figure stands out. Eyes at about 38% of the height from the top, the lower quarter calm. Square 1:1, no text, no frame.
```

## 3. Tranh phong thái (đính: ảnh chuẩn)

Khổ dọc 2:3, từ 1000px cạnh dài, PNG nền trong suốt.

```text
Use the reference image as the exact character and equipment: same face, goatee, turban, robe with swirling wind embroidery, sash, bamboo flute at the hip, and the same bamboo staff (shoulder height, small jade-teal ribbon below the top).

Pose: standing in a three-quarter view facing right (toward the right edge of the picture), one hand raised with the palm open as if feeling the wind, the bamboo staff held upright in the other hand with its bottom on the ground, the whole staff visible, his face lifted to the sky with a quiet knowing look, the sleeves and the turban end gently moved by the wind. Full body, centred.

Painting style: clean ink outlines, soft cel-like shading, medium saturation, warm earthy colours, jade teal accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text.
```

## 4. Ra đòn (đính: ảnh chuẩn; khổ ngang 3:2)

```text
Use the reference image as the exact character and equipment: same face, goatee, turban, robe with swirling wind embroidery, sash, bamboo flute at the hip, and the same bamboo staff (shoulder height, small jade-teal ribbon below the top).

Pose: a forward step toward the right, facing right (toward the right edge of the picture), the bamboo staff pointed forward to the right at chest height, held with both hands, one hand near the middle and the other near the back, the whole staff inside the picture, a focused gaze. Full body, wide horizontal picture, centred.

Painting style: clean ink outlines, soft cel-like shading, medium saturation, warm earthy colours, jade teal accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text.
```

## 5. Ra chiêu: thổi sáo báo hiệu (đính: ảnh chuẩn)

```text
Use the reference image as the exact character and equipment: same face, goatee, turban, robe with swirling wind embroidery, sash, and the same bamboo staff (shoulder height, small jade-teal ribbon below the top). The short bamboo flute with the white reed-plume strip is now in his hands.

Pose: standing firmly, facing right (toward the right edge of the picture), blowing the short bamboo flute held sideways to his lips with both hands, the bamboo staff tucked under one arm or leaning against his shoulder, his eyes half closed, the robe and the turban end moved by the wind. Full body and the whole staff, centred.

Painting style: clean ink outlines, soft cel-like shading, medium saturation, warm earthy colours, jade teal accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text.
```

## 6. Tuyệt chiêu (đính: ảnh chuẩn)

```text
Use the reference image as the exact character and equipment: same face, goatee, turban, robe with swirling wind embroidery, sash, bamboo flute at the hip, and the same bamboo staff (shoulder height, small jade-teal ribbon below the top).

Pose: a wide stable stance, facing right (toward the right edge of the picture), the bamboo staff raised high in one hand and pointing up and forward to the right, his other arm stretched out to the right with the palm open, the long sleeves and the turban end streaming sideways in a strong wind, leaning slightly forward, a determined expression. The whole staff is inside the picture. Full body, centred.

Painting style: clean ink outlines, soft cel-like shading, medium saturation, warm earthy colours, jade teal accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text.
```

## 7. Gục xuống (đính: ảnh chuẩn; khổ ngang 3:2)

```text
Use the reference image as the exact character and equipment: same face, goatee, turban, robe with swirling wind embroidery, sash, and the same bamboo staff (shoulder height, small jade-teal ribbon below the top) and the short bamboo flute.

Pose: sitting exhausted on the ground, seen from the side, facing right, his back sagging, leaning on one arm with the other arm resting limp, head hanging forward, eyes closed, a tired face, the turban slipped a little, the bamboo staff lying on the ground beside him with its whole length visible, the flute fallen on the ground near his hand. Full figure, wide horizontal picture.

Painting style: clean ink outlines, soft cel-like shading, medium saturation, warm earthy colours, jade teal accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text.
```

## 8. Nếu kết quả lệch, chỉ thêm một câu cuối prompt

| Nếu ảnh | Thêm câu |
|---|---|
| Gậy quá dài, như giáo | `the bamboo staff is as tall as his shoulder only, a short slender walking staff, not a spear, not a flag pole` |
| Gậy có cờ hoặc mũi nhọn | `a plain bamboo staff with a small ribbon, no flag, no blade, no spearhead` |
| Gậy bị cắt khỏi khung | `the whole staff inside the picture, leave a margin around its ends` |
| Mất sáo ở hông | `a short bamboo flute with a white reed-plume cloth strip tucked into the sash at his right hip` |
| Mất họa tiết gió xoáy | `jade-teal swirling wind-pattern embroidery clearly visible on the collar, cuffs and hem` |
| Râu quá rậm hoặc mặt quá trẻ | `thin sparse goatee, a lean weathered face of a man of about 40` |
| Ngón tay lỗi | `anatomically correct hands, four fingers and a thumb` |
| Tranh gục xuống trông như đang quỳ | `sitting slumped on the ground, eyes closed, head hanging, a limp arm, the staff lying on the ground, not kneeling` |
| Quay sai hướng | `facing right, looking toward the right edge of the picture` |
| Nét vẽ đổi kiểu (viền đen dày) | `thin soft outlines and the same colour palette as the reference` |
| Nền không trong suốt | `fully transparent PNG background, no white, no floor shadow` |

## 9. Tiêu chí tôi kiểm khi nhận ảnh

1. Nhận ra đúng Phùng Phong: gầy, khăn xanh ngọc, mắt sáng, râu thưa, áo nâu xám thêu vân gió xoáy.
2. **Gậy trúc đồng nhất** ở mọi tranh (mảnh, có đốt, ngang vai, ruy băng xanh ngọc), **cả cây gậy nằm trong khung**; sáo trúc ở hông có dải trắng.
3. Không còn cờ lệnh hay giáo như tranh cũ.
4. Tranh gục xuống đọc ra ngay là kiệt sức.
5. Quay về bên phải; nền trong suốt thật; chân đặt đúng giữa hai bàn chân ở tranh đứng và ra chiêu.
6. Ở cỡ thẻ 140×110px vẫn nhận ra (xanh ngọc nổi trên nền sương).

## 10. Quy cách gửi lại

Gửi **PNG gốc**, tên `chuan`, `bust`, `style`, `attack`, `cast`, `ultimate`, `down`. Tôi sẽ cắt, co về đúng cỡ, thay vào `public/art/characters/phung-phong/`, chỉnh tọa độ trong `PHUNG_PHONG` (`src/app/game/stage/rigs/phung-phong.ts`), đổi nhịp vũ khí sang trượng, tách lớp lại hình động đứng (gậy cùng nắm tay, bàn tay buông, đầu và khăn) và làm `portrait.webp`.

## 11. Kết quả (09/11/2026)

Shan gửi đủ 7 ảnh theo đúng thứ tự (chuẩn, bust, phong thái, ra đòn, ngã, tuyệt chiêu, ra chiêu), nền trong suốt sẵn, các tranh đều quay sang phải. Ảnh toàn thân 1024×1536 (ra đòn và ngã 1536×1024), bust 1254×1254.

- **Tranh tư thế:** cắt sát, co 0,4 lần (`pose-attack`, `pose-cast`, `pose-ultimate`, `pose-down`); phong thái co 0,5 lần (`style.webp`); `standing.webp` co 0,25 lần. Tọa độ mới trong `PHUNG_PHONG` (`src/app/game/stage/rigs/phung-phong.ts`), vũ khí đổi từ giáo sang gậy (`staff`). Cỡ so theo bề ngang khăn đầu: ra đòn 1,17, tuyệt chiêu 1,27 (dáng tấn rộng nên nhân vật nhỏ hơn trong khung). Điểm bắn: đầu gậy (ra đòn), đầu sáo (ra chiêu), bàn tay xòe (tuyệt chiêu).
- **Hình động đứng:** ảnh chuẩn tách lớp bằng code: `sword` là gậy trúc cùng dải vải xanh, `arm` là nắm tay cầm gậy (cả hai xoay quanh cổ tay), `armR` là bàn tay trái buông (xoay quanh cổ tay trong ống tay), `head` là đầu và khăn. Ống tay sau gậy vá bằng phản chiếu nếp áo bên phải gậy; vạt áo và lòng ống tay sau bàn tay trái vá bằng khuếch tán màu.
- **Chân dung:** `bust.webp` 384×384 (đã thêm `phungPhong` vào `BUST_IDS`); `portrait.webp` 192×192 cắt từ ảnh chuẩn. Tổng thư mục khoảng 273 KB.
