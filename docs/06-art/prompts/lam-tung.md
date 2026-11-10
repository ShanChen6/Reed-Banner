# Prompt bộ tranh Lâm Tùng (phong cách mới)

> Cập nhật: 09/11/2026
> Trạng thái: **APPROVED** — bộ prompt viết cho Lâm Tùng (Tướng sĩ, hệ Mộc) cầm côn tam khúc gỗ lim thu gọn thành gậy, giáp mây bện cánh sen, màu nhấn xanh lá; ảnh Shan gửi 09/11/2026 đã gắn vào game (xem mục 11).

Căn cứ: hồ sơ Lâm Tùng trong `docs/03-characters/ho-so-37-tuong-thuong.md` (Tướng sĩ, hệ Mộc, ngoại hiệu Cô Tùng, khoảng 30 tuổi, lính Hồi Hồ theo về Hoa Lư, cậu của Hoàng Mộc) và các bài học từ sáu nhân vật trước: **prompt ngắn, khẳng định, mỗi tranh một khối, ảnh chuẩn làm khuôn, vật cầm đơn giản và khóa kích cỡ**.

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

**Giữ từ tranh cũ:** vai rộng, tóc buộc búi gọn với dải xanh, lông mày rậm, áo xanh lá, giáp ngực. **Đổi theo hồ sơ:** vũ khí từ kiếm thành **côn tam khúc gỗ lim** (nhịp trượng), giáp **mây bện thêu họa tiết cánh sen** (dấu hiệu lính Hồi Hồ), **cành tùng nhỏ cài ở giáp vai**, **xanh lá là màu nhấn duy nhất**.

**Côn tam khúc đơn giản hóa để mô hình vẽ ổn định:** ba khúc đều nhau nối bằng dây quấn vòng đồng, **luôn vẽ thu gọn thành một cây gậy thẳng**, ngang vai, không vẽ ba khúc lủng lẳng hay đang vung (dễ lỗi và dễ vướng bộ lọc). Chuyển động ba khúc nếu muốn thì làm bằng hình động trong game, không trong tranh.

**Quy tắc cố định ở mọi tranh:**
1. **Gậy gỗ lim ba khúc:** tổng dài ngang vai, mỗi khúc khoảng 2 lần chiều cao đầu, gỗ nâu tối, vòng đồng nhỏ ở hai khớp, nắp đồng hai đầu, **cả cây gậy nằm trong khung**.
2. **Giáp:** mây bện, họa tiết cánh sen xếp lớp ở ngực; **cành tùng** nhỏ cài ở dây vai.
3. Mọi tranh **quay về bên phải**, nền **trong suốt thật**.

## 1. Ảnh chuẩn đứng (không tham chiếu)

Khổ dọc 2:3 (ví dụ 1024×1536), PNG nền trong suốt.

```text
Lam Tung, a Vietnamese man of about 30, a former ironwood logger from the reed marshes of Hoi Ho lagoon who became a lakeshore guard and later joined the Hoa Lu volunteer army in 10th-century Vietnam, calm, patient, kind to younger people, a man who sits and splits firewood when he thinks. Broad shoulders, a strong plain face with thick eyebrows, a light stubble, black hair tied in a neat topknot with a plain green cloth band. Clothing, modest and historical: a woven rattan-cord breastplate with a lotus-petal pattern stitched in lighter thread across the chest, one small sprig of pine tucked into the shoulder strap, a short-sleeved green tunic over a cream undershirt, a brown belt, loose brown trousers, green cloth leg wraps and simple leather shoes. Leaf green is the ONE accent colour.

He carries a staff of ironwood made of three equal sections joined by short cords wrapped with small bronze rings, folded into one straight staff: total length about as tall as his own shoulder, each section about 2 head-heights, dark brown wood, a small bronze cap on each end. Always drawn as one straight staff, never as separate swinging pieces.

Pose: standing calmly in a three-quarter view facing right (toward the right edge of the picture), weight on both feet, the staff held upright in his right hand at his side with its bottom on the ground, his grip at about waist height, his left hand relaxed at his side, a patient steady gaze. Full body from topknot to shoes and the whole staff, centred, small margin.

Painting style: stylised digital painting for a strategy game, clean confident ink outlines, soft cel-like shading with simplified shadow planes, no photo-real skin, slightly idealised expressive face, natural proportions, not anime, not photographic. Medium saturation, warm earthy colours with leaf green as the single accent, soft diffused warm light from the upper left. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 2. Chân dung bán thân (đính: ảnh chuẩn)

Khổ vuông 1:1 (từ 1024×1024), có nền.

```text
Use the reference image as the exact character: same face with the stubble and thick eyebrows, same topknot with the green band, same lotus-patterned rattan breastplate with the pine sprig at the shoulder.

Draw a bust portrait (head, shoulders, upper chest), three-quarter view, looking slightly to the right, calm and patient. Only the top end of the ironwood staff with its bronze cap rises beside his shoulder, partly in the frame.

Painting style: clean ink outlines, soft cel-like shading, medium saturation, warm earthy colours with leaf green as the accent, slightly idealised face, not anime, not photographic. Background: a faded sepia ink-wash landscape in mist, a reed-fringed lagoon with lotus leaves, a tall lone pine on the shore, a small flag far away, a pale glow behind the head, lighter and out of focus so the figure stands out. Eyes at about 38% of the height from the top, the lower quarter calm. Square 1:1, no text, no frame.
```

## 3. Tranh phong thái (đính: ảnh chuẩn)

Khổ dọc 2:3, từ 1000px cạnh dài, PNG nền trong suốt.

```text
Use the reference image as the exact character and equipment: same face, stubble, topknot with the green band, lotus-patterned rattan breastplate with the pine sprig, green tunic, belt, leg wraps, and the same three-section ironwood staff (as tall as his shoulder, bronze rings at the joints).

Pose: sitting on a low tree stump facing right (toward the right edge of the picture), the staff lying across his knees, both hands tying a small pine sprig to his shoulder strap with a bit of cord, his head slightly bowed, a quiet thoughtful expression. The stump is part of the figure and the whole staff is inside the picture. Full figure, centred.

Painting style: clean ink outlines, soft cel-like shading with simplified shadow planes, medium saturation, warm earthy colours with leaf green as the accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 4. Ra đòn (đính: ảnh chuẩn; khổ ngang 3:2)

Khổ ngang 3:2.

```text
Use the reference image as the exact character and equipment: same face, stubble, topknot with the green band, lotus-patterned rattan breastplate with the pine sprig, green tunic, belt, leg wraps, and the same three-section ironwood staff (as tall as his shoulder, bronze rings at the joints).

Pose: a wide forward stride toward the right, facing right (toward the right edge of the picture), the staff held in both hands and thrust forward to the right at chest height, the front end pointing right, his weight low and steady, a focused gaze. The whole staff is inside the picture. Full body, wide horizontal picture, centred.

Painting style: clean ink outlines, soft cel-like shading with simplified shadow planes, medium saturation, warm earthy colours with leaf green as the accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 5. Ra chiêu (đính: ảnh chuẩn)

Khổ dọc 2:3.

```text
Use the reference image as the exact character and equipment: same face, stubble, topknot with the green band, lotus-patterned rattan breastplate with the pine sprig, green tunic, belt, leg wraps, and the same three-section ironwood staff (as tall as his shoulder, bronze rings at the joints).

Pose: planted wide and low, facing right (toward the right edge of the picture), the staff planted upright in front of him with both hands on it, the bottom firmly on the ground, his body leaning on it like a tree that does not move, a solid patient expression. The whole staff is inside the picture. Full body, centred.

Painting style: clean ink outlines, soft cel-like shading with simplified shadow planes, medium saturation, warm earthy colours with leaf green as the accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 6. Tuyệt chiêu (đính: ảnh chuẩn)

Khổ dọc 2:3.

```text
Use the reference image as the exact character and equipment: same face, stubble, topknot with the green band, lotus-patterned rattan breastplate with the pine sprig, green tunic, belt, leg wraps, and the same three-section ironwood staff (as tall as his shoulder, bronze rings at the joints).

Pose: a wide stable stance, facing right (toward the right edge of the picture), the staff raised high in both hands above his head with the ends slanting up and forward to the right, his cloth tunic and the topknot band moving with the motion, leaning slightly forward, a determined expression. The whole staff is inside the picture with a margin around both ends. Full body, centred.

Painting style: clean ink outlines, soft cel-like shading with simplified shadow planes, medium saturation, warm earthy colours with leaf green as the accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 7. Gục xuống (đính: ảnh chuẩn; khổ ngang 3:2)

Khổ ngang 3:2.

```text
Use the reference image as the exact character and equipment: same face, stubble, topknot with the green band, lotus-patterned rattan breastplate with the pine sprig, green tunic, belt, leg wraps, and the same three-section ironwood staff (as tall as his shoulder, bronze rings at the joints).

Pose: sitting exhausted on the ground, seen from the side, facing right, his back sagging, leaning on one arm with the other arm resting limp, head hanging forward, eyes closed, a tired face, the green band slipped, the staff lying on the ground beside him with its whole length visible. Full figure, wide horizontal picture.

Painting style: clean ink outlines, soft cel-like shading with simplified shadow planes, medium saturation, warm earthy colours with leaf green as the accent, slightly idealised face, not anime, not photographic. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 8. Nếu kết quả lệch, chỉ thêm một câu cuối prompt

| Nếu ảnh | Thêm câu |
|---|---|
| Gậy vẽ thành ba khúc lủng lẳng hoặc hai đoạn rời | `one straight staff, the three sections joined end to end in a straight line, never hanging or swinging` |
| Gậy quá dài hoặc quá ngắn | `the staff is about as tall as his shoulder, a short sturdy ironwood staff` |
| Gậy bị cắt khỏi khung | `the whole staff inside the picture, leave a margin around both ends` |
| Mất họa tiết cánh sen | `a lotus-petal pattern clearly visible on the rattan breastplate` |
| Mất cành tùng ở vai | `a small sprig of pine tucked into the shoulder strap` |
| Áo chuyển sang màu khác | `leaf-green tunic, leaf green as the only accent colour` |
| Mặt quá trẻ hoặc không râu | `a strong plain face of a man of about 30 with light stubble and thick eyebrows` |
| Ngón tay lỗi | `anatomically correct hands, four fingers and a thumb on each hand` |
| Tranh gục xuống trông như đang quỳ | `sitting slumped on the ground, eyes closed, head hanging, a limp arm, the staff lying on the ground, not kneeling` |
| Quay sai hướng | `facing right, looking toward the right edge of the picture` |
| Nét vẽ đổi kiểu (viền đen dày) | `thin soft outlines and the same colour palette as the reference` |
| Nền không trong suốt | `fully transparent PNG background, no white, no floor shadow` |

## 9. Tiêu chí tôi kiểm khi nhận ảnh

1. Nhận ra đúng Lâm Tùng: vai rộng, lông mày rậm, búi tóc dải xanh, giáp mây bện cánh sen, cành tùng ở vai.
2. **Gậy ba khúc đồng nhất** ở mọi tranh (thẳng, ngang vai, vòng đồng ở khớp), **cả cây gậy nằm trong khung**.
3. Xanh lá là màu nhấn duy nhất.
4. Tranh gục xuống đọc ra ngay là kiệt sức.
5. Quay về bên phải; nền trong suốt thật; chân đặt đúng giữa hai bàn chân ở tranh đứng và ra chiêu.
6. Ở cỡ thẻ 140×110px vẫn nhận ra.

## 10. Quy cách gửi lại

Gửi **PNG gốc**, tên `chuan`, `bust`, `style`, `attack`, `cast`, `ultimate`, `down`. Tôi sẽ cắt, co về đúng cỡ, thay vào `public/art/characters/lam-tung/`, chỉnh tọa độ trong `LAM_TUNG` (`rigs.ts`), đổi nhịp vũ khí từ kiếm sang trượng, tách lớp lại hình động đứng (gậy cùng nắm tay, bàn tay buông, đầu và dải khăn) và làm `portrait.webp`.

## 11. Kết quả (09/11/2026)

Shan gửi 7 ảnh: chuẩn, bust, ra đòn (ngang 1536×1024), ra chiêu, tuyệt chiêu, phong thái (ngồi gốc cây gài nhành tùng, côn đặt ngang đùi), gục (ngang 1536×1024). Nền trong suốt sẵn.

- **Tranh tư thế:** cắt sát, co 0,4 lần (`pose-attack`, `pose-cast`, `pose-ultimate`, `pose-down`); phong thái co 0,5 lần; `standing.webp` co 0,25 lần. Tọa độ mới trong `LAM_TUNG` (`rigs.ts`), vũ khí đổi sang `staff`. Điểm bắn: đầu côn đâm tới (ra đòn), đầu côn trên (ra chiêu), đầu côn giơ cao (tuyệt chiêu).
- **Hình động đứng:** `sword` là côn, `arm` là nắm tay phải (cả hai xoay quanh cổ tay), `armR` là bàn tay trái buông, `head` là đầu kèm khăn. Phần ống tay và cánh tay sau côn được vá bằng nội suy hai bên. Lớp `ribbon` cũ đã bỏ.
- **Chân dung:** `bust.webp` 384×384 (đã thêm `lamTung` vào `BUST_IDS`); `portrait.webp` 192×192. Tổng thư mục khoảng 260 KB.
