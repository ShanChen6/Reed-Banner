# Prompt bộ tranh Đàm Thảo (chuẩn Hà Vân)

> Cập nhật: 09/11/2026
> Trạng thái: **DRAFT** — bộ prompt viết cho Đàm Thảo (Pháp sư nữ, hệ Mộc) theo chuẩn Hà Vân: hai lớp áo xanh rêu, họa tiết lau sậy, gậy cành gỗ; đã thử ba bản và sửa lỗi tỉ lệ (xem mục 0A); chưa có ảnh nào được chốt và gắn vào game.

Căn cứ: hồ sơ Đàm Thảo trong `docs/03-characters/ho-so-37-tuong-thuong.md` (Pháp sư, hệ Mộc, ngoại hiệu Thảo Tâm, khoảng 26 tuổi, nữ, người hái thuốc kiêm thầy cúng rừng, nghĩa quân Hoa Lư, chị em họ của Lục Diệp). **Shan: lấy Hà Vân làm tiêu chuẩn.**

## 0. Chuẩn Hà Vân gồm những gì

Hà Vân được duyệt vì: **trang phục lịch sử giản dị, chỉ hai lớp** (áo ngoài trên áo lót), **một màu nhấn mạnh**, **viền thêu rõ** ở cổ, cổ tay, gấu áo, vật cầm đơn giản (trượng gỗ), không dải lụa bay, không nhiều lớp váy, không phát sáng. Tôi áp đúng bấy nhiêu cho Đàm Thảo. **Đính ảnh Hà Vân (`chuan-ha-van-style.png`) vào mọi lần tạo ảnh chuẩn đứng và bán thân** để mô hình lấy nét vẽ, độ đậm viền, kiểu cấu tạo trang phục; prompt đã dặn **không chép mặt, tóc, màu và đồ vật của Hà Vân**.

**Tranh cũ của Đàm Thảo đi ngược chuẩn này:** váy nhiều lớp xếp nếp xanh lá, vòng hoa trên đầu, trượng dây leo có quả cầu ngọc, tay áo bay. Bản mới **chỉ giữ mặt** (mắt to, nốt ruồi bên cằm, nét hiền) và **vẽ lại toàn bộ trang phục**:

| | Tranh cũ | Bản mới (chuẩn Hà Vân) |
|---|---|---|
| Đầu | Vòng hoa và lá, tóc xõa | **Một bím tóc dài** buộc dây lá khô, không hoa |
| Áo | Nhiều lớp váy xanh lá và trắng xếp nếp | **Hai lớp**: áo xanh rêu cổ chéo dài đến ống chân, áo lót kem, quần kem, đai nâu |
| Họa tiết | Hoa văn nhỏ lẻ | **Lau sậy** thêu chỉ xanh nhạt và kem ở viền cổ, cổ tay, gấu |
| Gậy | Dây leo xoắn, quả cầu ngọc phát sáng | **Cành gỗ tự nhiên**, vài cành lá nhỏ buộc gần đầu, không cầu, không phát sáng |
| Dấu hiệu | không | **Bông lau trắng** buộc ở bắp tay trái (nghĩa quân Hoa Lư), túi hạt giống ở hông, vòng lá khô ở cổ tay |
| Màu nhấn | Xanh lá nhiều sắc | **Xanh lá là màu nhấn duy nhất** |

## 0A. Hai bản thử đầu và bài học (Shan nhận xét 09/11/2026)

| Bản thử | Trang phục | Cơ thể và mặt | Đã sửa |
|---|---|---|---|
| Lần 1 | Đúng (áo hai lớp, lau sậy, gậy cành, bông lau, túi hạt) | **Đầu to** (khoảng 5,7 đầu), chân ngắn, mặt như thiếu niên có tàn nhang | Thêm dòng tỉ lệ 7,5 đầu |
| Lần 2 | Đúng | Đầu đã nhỏ hơn (khoảng 7,3 đầu) nhưng **người quá gầy** (vai hẹp, tay như que, không eo hông), **mặt trung tính gần như nam, thiếu sức hút** | Thay bằng **khối "người đẹp"** trong khối nhân vật (dưới đây) |

Mô hình không tự làm người đẹp nếu không được dặn; áo suông cũng che mất dáng người, nên **đai phải ôm eo**.

| Lần 3 | Đúng | **Nhân vật nhỏ bé**: cây gậy cao vọt hơn đầu cả một cái, áo xòe rộng, vai hẹp, tay áo dài; đầu nhỏ vừa người nhưng cả người trông thấp nhỏ, tưởng như thiếu nữ | Bỏ chỉ dẫn "đầu nhỏ, vai hẹp" (mô hình hiểu thành thu nhỏ cả người), đổi thành **"cùng tỉ lệ, chiều cao và thần thái như ảnh Hà Vân"**, gậy chỉ tới vai, áo dài tới giữa bắp chân, người chiếm 90% chiều cao khung |

**Bài học lần 3:** càng viết nhiều con số tỉ lệ (7,5 đầu, đầu nhỏ, vai hẹp, chân dài) thì mô hình càng khó vẽ, vì các chỉ dẫn kéo ngược nhau và nó không đếm được số đầu. Cách tốt hơn là **để ảnh Hà Vân làm thước đo** ("cùng tỉ lệ, chiều cao, thần thái như ảnh đính") và chỉ dặn vài điều nhìn thấy được: gậy tới vai, người chiếm gần hết khung, vai rộng hai bề ngang đầu.

**Prompt chỉnh ảnh cho bản thử lần 3 (đính ảnh bản thử lần 3 và ảnh Hà Vân):**

```text
Edit this image: redraw the same woman at the same height, build and presence as the second reference image (the style standard character), standing taller and larger in the frame so the figure fills about 90 percent of the picture height. Make the staff shorter: it reaches only to her shoulder. Make the robe fall to the middle of the calves. Natural shoulders about two head-widths wide, healthy arms, a natural waist shown by the belt. Make her face more beautiful: a delicate oval face, large almond eyes with long lashes, finely arched brows, a small straight nose, soft full lips, clear glowing skin, a charming expression. Keep the same clothes, colours, reed embroidery, braid, seed pouch, reed plume armband and the pose, and the same painting style.
```

**Prompt chỉnh ảnh cho bản thử lần 2 (đính ảnh bản thử lần 2):**

```text
Edit this image: make the character a clearly more beautiful woman with a better figure, keeping the same clothes, colours, reed embroidery, braid with the leaf cord, seed pouch, reed plume armband, branch staff and the pose. Face: a delicate oval face with a smooth jawline, large expressive almond-shaped dark eyes with long lashes, finely arched brows, a small straight nose, soft full lips, clear glowing skin, a charming gentle expression, clearly feminine and attractive, not boyish. Body: a graceful figure about 7.5 heads tall, a long neck, softly sloping shoulders, healthy rounded arms (not thin sticks), the belt gathering the robe so a natural waist is visible, softly curved hips, long slender legs. Keep the painting style and the outline weight.
```

Sau khi chỉnh xong và vừa ý, dùng ảnh đó làm **ảnh chuẩn đứng** cho các tranh còn lại.

## 1. Quy trình

| Bước | Ảnh | Đính | Nền | Khổ |
|---|---|---|---|---|
| 1 | Ảnh chuẩn đứng | `chuan-ha-van-style.png` + `khuon-cu-mat.png` | trong suốt | dọc 2:3 |
| 2 | Chân dung bán thân | `chuan-ha-van-style.png` + `khuon-cu-mat.png` | có nền sương | vuông 1:1 |
| 3 | Tranh phong thái | ảnh chuẩn | trong suốt | dọc 2:3 |
| 4 | Ra đòn | ảnh chuẩn | trong suốt | **ngang 3:2** |
| 5 | Ra chiêu | ảnh chuẩn | trong suốt | dọc 2:3 |
| 6 | Tuyệt chiêu | ảnh chuẩn | trong suốt | dọc 2:3 |
| 7 | Gục xuống | ảnh chuẩn | trong suốt | **ngang 3:2** |

**Quy tắc cố định ở mọi tranh:** hai lớp áo, xanh lá là màu nhấn duy nhất; gậy cành gỗ tự nhiên ngang vai cộng đầu với vài cành lá nhỏ; **cả cây gậy nằm trong khung**; quay về bên phải; nền trong suốt thật.

## 1. Ảnh chuẩn đứng (đính: `chuan-ha-van-style.png` và `khuon-cu-mat.png`)

Khổ dọc 2:3 (ví dụ 1024×1536), PNG nền trong suốt. Ảnh 1 = chuẩn Hà Vân (chỉ lấy nét vẽ, cách cấu tạo trang phục). Ảnh 2 = chân dung cũ của Đàm Thảo (chỉ lấy mặt).

```text
First reference image = style standard. Second reference image = the face of this character only.
Painting style and costume standard: copy ONLY the painting style, the outline weight, the shading and the way the costume is built from the style reference image (a different character): a modest historical two-layer outfit with clean embroidered borders, one strong accent colour, no floating ribbons, no ruffles. Do NOT copy her face, hair, colours or objects.
Use the second reference image only for her face (big kind eyes, soft round face, beauty mark by the chin); the long dark hair becomes one braid.

Dam Thao, a Vietnamese woman of about 26, a herb gatherer and forest-spirit keeper from the bamboo mountains near Hoa Lu who leads villagers through the forest every flood season and joined the Hoa Lu volunteer army in 10th-century Vietnam, gentle, dreamy, observant, she talks to trees. Face: unmistakably feminine, an adult woman's face with big kind dark eyes, a gentle oval face, a small beauty mark beside her chin, light natural lip colour, no heavy makeup. BEAUTY AND BUILD STANDARD (female): a beautiful adult woman of average height with a healthy, graceful, well-proportioned build, with the SAME body proportions, height and presence as the first reference image (the style standard): natural shoulders about two head-widths wide, a natural waist shown by the belt, softly curved hips, normal adult legs, healthy arms and graceful hands. She fills the picture: the full figure takes up about 90 percent of the picture height. Face: a delicate oval face with a smooth jawline, large expressive almond-shaped dark eyes with long lashes (only slightly larger than life), finely arched brows, a small straight nose, soft full lips with light natural colour, clear smooth skin with a healthy glow, no freckles, a charming gentle expression; clearly feminine, attractive, with real appeal; an adult face, not boyish, not childlike, not chibi. Hair: long dark hair worn in one thick braid over her shoulder, tied at the end with a small dried-leaf cord, a few short strands framing the face, no flower crown. Clothing, modest and historical, TWO layers only: a moss-green cross-collar robe with long sleeves, falling straight to the middle of the calves, over a cream inner collar and plain cream trousers that are only slightly visible at the ankles, a brown cloth belt that gathers the robe at the waist so a natural waist is visible, brown wrapped leg guards and simple shoes. A reed-and-grass pattern embroidered in lighter green and cream thread along the collar edge, the cuffs and the hem. A small cloth seed pouch hangs at her right hip, a bracelet of dried leaves on her left wrist, and a white reed plume tied with a brown cord on her left upper arm (the sign of the Hoa Lu army). Leaf green is the ONE accent colour. No ruffles, no layered skirts, no floating ribbons, no flowers in her hair.

She carries a staff made from a natural wooden branch: a straight, slightly knotted brown branch that reaches only up to her shoulder when it stands on the ground beside her (much shorter than her whole height, never taller than her head), a small natural fork at the top holding nothing, two or three small green leaf sprigs tied near the top with cord, a plain bottom end. No orb, no crystal, no glow. Always the same in every picture and the whole staff stays inside the picture.

Pose: standing calmly in a three-quarter view facing right (toward the right edge of the picture), weight on one leg, the staff held upright in her right hand beside her with its bottom on the ground, her left hand holding the end of her braid, a gentle dreamy gaze. Full body from head to shoes and the whole staff, centred, small margin.

Painting style: stylised digital painting for a strategy game, clean confident ink outlines, soft cel-like shading with simplified shadow planes, no photo-real skin, slightly idealised expressive face, natural proportions, not anime, not photographic. Medium saturation, warm earthy colours with leaf green as the single accent. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 2. Chân dung bán thân (đính: `chuan-ha-van-style.png` và `khuon-cu-mat.png`)

Khổ vuông 1:1 (từ 1024×1024), có nền.

```text
First reference image = style standard. Second reference image = the face of this character.
Painting style and costume standard: copy ONLY the painting style, the outline weight, the shading and the way the costume is built from the style reference image (a different character): a modest historical two-layer outfit with clean embroidered borders, one strong accent colour, no floating ribbons, no ruffles. Do NOT copy her face, hair, colours or objects.

Redraw the second reference image as a bust portrait (head, shoulders, upper chest) of the SAME young woman: the same big kind dark eyes, the same soft face, the beauty mark beside her chin and the same expression, three-quarter view looking slightly to the right. Make the face more beautiful as described: a delicate oval face with a smooth jawline, large expressive almond-shaped eyes with long lashes, finely arched brows, a small straight nose, soft full lips and clear glowing skin, clearly feminine and attractive, while keeping the same person and the beauty mark beside her chin. Replace the flower-and-leaf crown with a plain long braid over her shoulder tied with a dried-leaf cord, and dress her in the moss-green cross-collar robe with a cream inner collar and the reed-and-grass pattern along the collar edge. Only the top of the branch staff with its small leaf sprigs rises beside her shoulder.

Painting style: clean ink outlines, soft cel-like shading, medium saturation, warm earthy colours with leaf green as the accent. Background: a faded sepia ink-wash landscape in mist, bamboo-covered mountains, a forest path with a few reeds, a small flag far away, a pale glow behind the head, lighter and out of focus so the figure stands out. Eyes at about 38% of the height from the top, the lower quarter calm. Square 1:1, no text, no frame.
```

## 3. Tranh phong thái (đính: ảnh chuẩn)

Khổ dọc 2:3, từ 1000px cạnh dài, PNG nền trong suốt.

```text
Use the first reference image as the exact character and equipment: same face with the beauty mark by the chin, the thick braid with the dried-leaf cord, the moss-green two-layer robe with the reed pattern, belt, seed pouch, leaf bracelet, white reed plume armband, and the same natural branch staff with leaf sprigs near the top.

Pose: standing facing right (toward the right edge of the picture), the staff leaning against her shoulder, one hand gently touching a small leaf on the staff as if talking to it, her head tilted with a soft dreamy smile. The whole staff is inside the picture. Full body, centred.

Painting style: stylised digital painting for a strategy game, clean confident ink outlines, soft cel-like shading with simplified shadow planes, no photo-real skin, slightly idealised expressive face, natural proportions, not anime, not photographic. Medium saturation, warm earthy colours with leaf green as the single accent. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 4. Ra đòn (đính: ảnh chuẩn; khổ ngang 3:2)

Khổ ngang 3:2.

```text
Use the first reference image as the exact character and equipment: same face with the beauty mark by the chin, the thick braid with the dried-leaf cord, the moss-green two-layer robe with the reed pattern, belt, seed pouch, leaf bracelet, white reed plume armband, and the same natural branch staff with leaf sprigs near the top.

Pose: a gentle forward step toward the right, facing right (toward the right edge of the picture), the staff held in both hands and pointed forward to the right at chest height, the braid swinging a little behind her, a focused gaze. Full body, wide horizontal picture, centred.

Painting style: stylised digital painting for a strategy game, clean confident ink outlines, soft cel-like shading with simplified shadow planes, no photo-real skin, slightly idealised expressive face, natural proportions, not anime, not photographic. Medium saturation, warm earthy colours with leaf green as the single accent. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 5. Ra chiêu (đính: ảnh chuẩn)

Khổ dọc 2:3.

```text
Use the first reference image as the exact character and equipment: same face with the beauty mark by the chin, the thick braid with the dried-leaf cord, the moss-green two-layer robe with the reed pattern, belt, seed pouch, leaf bracelet, white reed plume armband, and the same natural branch staff with leaf sprigs near the top.

Pose: standing firmly, facing right (toward the right edge of the picture), the staff planted upright in her left hand, her right hand held out to the right with the palm open as if calling the forest, a calm composed expression. Full body, centred.

Painting style: stylised digital painting for a strategy game, clean confident ink outlines, soft cel-like shading with simplified shadow planes, no photo-real skin, slightly idealised expressive face, natural proportions, not anime, not photographic. Medium saturation, warm earthy colours with leaf green as the single accent. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 6. Tuyệt chiêu (đính: ảnh chuẩn)

Khổ dọc 2:3.

```text
Use the first reference image as the exact character and equipment: same face with the beauty mark by the chin, the thick braid with the dried-leaf cord, the moss-green two-layer robe with the reed pattern, belt, seed pouch, leaf bracelet, white reed plume armband, and the same natural branch staff with leaf sprigs near the top.

Pose: a wide stable stance, facing right (toward the right edge of the picture), the staff raised in her right hand above her head, her left arm stretched out to the right with the palm turned up, the braid and the robe hem moved a little by the wind, leaning slightly forward, a determined gentle expression. The whole staff is inside the picture with a margin above its top. Full body, centred.

Painting style: stylised digital painting for a strategy game, clean confident ink outlines, soft cel-like shading with simplified shadow planes, no photo-real skin, slightly idealised expressive face, natural proportions, not anime, not photographic. Medium saturation, warm earthy colours with leaf green as the single accent. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 7. Gục xuống (đính: ảnh chuẩn; khổ ngang 3:2)

Khổ ngang 3:2.

```text
Use the first reference image as the exact character and equipment: same face with the beauty mark by the chin, the thick braid with the dried-leaf cord, the moss-green two-layer robe with the reed pattern, belt, seed pouch, leaf bracelet, white reed plume armband, and the same natural branch staff with leaf sprigs near the top.

Pose: sitting exhausted on the ground, seen from the side, facing right, her back sagging, leaning on one arm with the other arm resting limp, head hanging forward, eyes closed, a tired face, the braid fallen over her shoulder, the staff lying on the ground beside her with its whole length visible. Full figure, wide horizontal picture.

Painting style: stylised digital painting for a strategy game, clean confident ink outlines, soft cel-like shading with simplified shadow planes, no photo-real skin, slightly idealised expressive face, natural proportions, not anime, not photographic. Medium saturation, warm earthy colours with leaf green as the single accent. Fully transparent background, no ground, no shadow, no text, no frame.
```

## 8. Nếu kết quả lệch, chỉ thêm một câu cuối prompt

| Nếu ảnh | Thêm câu |
|---|---|
| Chép mặt hoặc màu đỏ của Hà Vân | `the character is a different woman: green clothes, a thick braid, a beauty mark by the chin; do not copy the style reference's face, hair or red colours` |
| Mặt vẫn trung tính hoặc giống nam | `a clearly feminine, beautiful face with large almond eyes, long lashes, soft full lips and a small nose` |
| Người vẫn gầy như que, tay chân mảnh | `a healthy graceful figure with rounded arms, a visible waist and softly curved hips, not skinny` |
| Quá gợi cảm hoặc hở hang | `modest historical clothing, a closed collar, nothing revealing, a graceful but modest figure` |
| Quá anime, mắt quá to | `realistic eye size, only slightly larger than life, not anime` |
| Đầu to, chân ngắn, trông như trẻ con hoặc chibi | `an adult woman about 7.5 heads tall with a small head, long neck, long legs making up half of her height, slender proportions like the style reference, a grown woman's face` |
| Nhiều lớp váy, nếp xếp | `only two layers: one moss-green robe over a cream inner collar and trousers, no ruffles, no layered skirts` |
| Còn vòng hoa trên đầu | `no flower crown, no flowers in her hair, a plain long braid` |
| Tay áo hoặc dải vải bay | `no floating ribbons, no billowing sleeves, the robe falls straight` |
| Gậy có quả cầu hoặc phát sáng | `a plain natural wooden branch staff with a few small leaf sprigs, no orb, no crystal, no glow` |
| Gậy bị cắt khỏi khung | `the whole staff inside the picture, leave a margin above and below` |
| Mất nốt ruồi bên cằm | `a small beauty mark beside her chin, clearly visible` |
| Mất bông lau ở bắp tay | `a white reed plume tied with a brown cord on her left upper arm` |
| Mất họa tiết lau sậy | `a reed-and-grass pattern in lighter green and cream thread clearly visible along the collar, cuffs and hem` |
| Ngón tay lỗi | `anatomically correct hands, four fingers and a thumb on each hand` |
| Tranh gục xuống trông như đang quỳ | `sitting slumped on the ground, eyes closed, head hanging, a limp arm, the staff lying on the ground, not kneeling` |
| Quay sai hướng | `facing right, looking toward the right edge of the picture` |
| Nền không trong suốt | `fully transparent PNG background, no white, no floor shadow` |

## 9. Tiêu chí tôi kiểm khi nhận ảnh

1. **Đẹp, cân đối và cùng tầm vóc với Hà Vân** (người chiếm gần hết khung, gậy chỉ tới vai, có eo hông, tay đầy đặn, mặt nữ tính có sức hút, không nhỏ bé, không gầy như que), và **cùng đẳng cấp:** nét viền, cách đổ bóng, trang phục hai lớp, viền thêu rõ, không rườm.
2. Nhận ra đúng Đàm Thảo (mắt to hiền, nốt ruồi bên cằm, bím tóc, áo xanh rêu) và **không giống Hà Vân**.
3. **Gậy đồng nhất** ở mọi tranh, cả cây nằm trong khung; không cầu ngọc, không phát sáng.
4. Tranh gục xuống đọc ra ngay là kiệt sức.
5. Quay về bên phải; nền trong suốt thật; chân đặt đúng giữa hai bàn chân ở tranh đứng và ra chiêu.
6. Ở cỡ thẻ 140×110px vẫn nhận ra.

## 10. Quy cách gửi lại

Gửi **PNG gốc**, tên `chuan`, `bust`, `style`, `attack`, `cast`, `ultimate`, `down`. Tôi sẽ cắt, co về đúng cỡ, thay vào `public/art/characters/dam-thao/`, chỉnh tọa độ trong `DAM_THAO` (`rigs.ts`), tách lớp lại hình động đứng và làm `portrait.webp`. Tranh toàn thân mới khác hẳn tranh cũ nên phần tách lớp phải làm lại từ đầu.
