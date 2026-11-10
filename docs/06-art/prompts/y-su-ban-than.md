# Prompt ảnh bán thân cho 6 y sư (giữ nguyên theo ảnh cũ)

> Cập nhật: 10/11/2026
> Trạng thái: **DRAFT** — prompt ảnh bán thân cho Lục Diệp, Trần Ngọc, Hồng Đan, Mã Liên, Tiêu Minh, Bạch Sương, vẽ lại từ chân dung cũ (bộ ảnh toàn thân cũ của y sư đã được duyệt là ổn, chỉ thiếu bán thân); chưa có ảnh nào được chốt và gắn vào game.

Bộ ảnh toàn thân cũ của y sư ổn, **chỉ thiếu ảnh chân dung bán thân**. Mỗi y sư một ảnh bán thân vẽ lại từ chân dung cũ, **không đổi gì ở nhân vật** (mặt, tóc, màu áo). Mai Thanh đã có bán thân (`bust.webp`) nên không có trong tệp này.

## Cách dùng chung

- **Ảnh đính (hai ảnh):** (1) `mat-cu-<id>.png` (chân dung cũ, phóng lên 4 lần); (2) `bust-ha-van.png` (ảnh bán thân Hà Vân, chỉ để lấy **độ đậm nét viền, cách đổ bóng và tỉ lệ khung**, không lấy mặt hay trang phục). Nếu công cụ chỉ cho một ảnh, chỉ dùng ảnh (1).
- Khổ vuông 1:1, từ 1024×1024, có nền, mắt khoảng 38% chiều cao từ trên, một phần tư dưới của ảnh êm.
- Bán thân **được phép có nụ cười nhẹ**. Nét mặt từng người ghi trong prompt.
- Tôi sẽ xuất `bust.webp` 384×384 vào `public/art/characters/<thư mục>/bust.webp`, thêm id vào `BUST_IDS` rồi chụp thử ở 1440px và 360px trước khi commit.

| Nhân vật | Id | Thư mục | Hệ | Ảnh đính chân dung |
|---|---|---|---|---|
| Lục Diệp | `lucDiep` | `luc-diep` | Mộc | `mat-cu-luc-diep.png` |
| Trần Ngọc | `chauNgoc` | `chau-ngoc` | Kim | `mat-cu-chau-ngoc.png` |
| Hồng Đan | `hongDan` | `hong-dan` | Hỏa | `mat-cu-hong-dan.png` |
| Mã Liên | `beLien` | `be-lien` | Thổ | `mat-cu-be-lien.png` |
| Tiêu Minh | `tieuMinh` | `tieu-minh` | Lôi | `mat-cu-tieu-minh.png` |
| Bạch Sương | `bachSuong` | `bach-suong` | Phong | `mat-cu-bach-suong.png` |

## Lục Diệp (Mộc, ngoại hiệu Hồi Xuân, khoảng 24 tuổi, nghĩa quân Hoa Lư, con nhà hái thuốc)

```text
Redraw the reference image as a clean, higher-resolution bust portrait of the SAME young woman, keeping everything exactly as in the reference: the same round friendly face with the freckles, the same dark hair in two low buns on both sides tied with deep-green ribbons, the same sprig of green leaves tucked into one bun, the same deep-green cross-collar tunic over the cream undershirt with the herb embroidery on the collar edge, a gentle smile, the same three-quarter view looking slightly to the right, the same painting style and the same colours. Change nothing about the character. Do not change the face, the hair or the clothing colours.

Add only one small detail: a green herb basket strap on one shoulder.

Improve only: thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills), cleaner details, a bit more of the shoulders and upper chest visible so it is a true bust portrait (head, shoulders, upper chest), and a new background: a faded sepia ink-wash landscape in mist: a herb-covered hillside with terraced medicine beds, a bamboo drying rack with hanging herb bundles, a small thatched hut far away, a pale glow behind the head, lighter, desaturated and out of focus so the figure stands out. Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, hand-made cloth. Square 1:1, no text, no frame, no border.
```

Nếu mô hình đổi mặt, thêm: `the face, hair and clothing must be identical to the reference image`. Nếu quá thật: `visible ink outlines and painterly shading, a game illustration, not a photograph`.

## Trần Ngọc (Kim, ngoại hiệu Nhất Châm, khoảng 30 tuổi, lính Siêu Loại theo về Hoa Lư, thầy thuốc quân)

```text
Redraw the reference image as a clean, higher-resolution bust portrait of the SAME young woman, keeping everything exactly as in the reference: the same calm composed face with the long phoenix-shaped eyes, the same brown hair gathered low at the back with a silver hairpin and loose strands at the temples, the same silver drop earring, the same white-silver cross-collar jacket with the grey trim and the scale-pattern edge, the brown strap across the shoulder, a composed faint expression, the same three-quarter view looking slightly to the right, the same painting style and the same colours. Change nothing about the character. Do not change the face, the hair or the clothing colours.

Add only one small detail: a small roll of silver needles hanging at the strap.

Improve only: thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills), cleaner details, a bit more of the shoulders and upper chest visible so it is a true bust portrait (head, shoulders, upper chest), and a new background: a faded sepia ink-wash landscape in mist: a bamboo-palisade citadel wall with a gate, a few bamboo clumps, a tiny flag far away, a pale glow behind the head, lighter, desaturated and out of focus so the figure stands out. Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, hand-made cloth. Square 1:1, no text, no frame, no border.
```

Nếu mô hình đổi mặt, thêm: `the face, hair and clothing must be identical to the reference image`. Nếu quá thật: `visible ink outlines and painterly shading, a game illustration, not a photograph`.

## Hồng Đan (Hỏa, ngoại hiệu Văn Hỏa, khoảng 31 tuổi, lính Đằng Châu theo về Hoa Lư, thầy thuốc chữa bỏng)

```text
Redraw the reference image as a clean, higher-resolution bust portrait of the SAME young woman, keeping everything exactly as in the reference: the same oval face with the rosy cheeks and the small red dot on the forehead, the same dark hair in a low bun with the red braided cord hanging down, the same light-red cross-collar tunic over the cream undershirt, a direct honest expression with a slight stubborn set of the mouth, the same three-quarter view looking slightly to the right, the same painting style and the same colours. Change nothing about the character. Do not change the face, the hair or the clothing colours.

Add only one small detail: a small herb-boiling pot hanging at the waist, barely visible.

Improve only: thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills), cleaner details, a bit more of the shoulders and upper chest visible so it is a true bust portrait (head, shoulders, upper chest), and a new background: a faded sepia ink-wash landscape in mist: a river-market wharf with moored boats, a small clay kiln with a thin line of smoke, a tiny red flag far away, a pale glow behind the head, lighter, desaturated and out of focus so the figure stands out. Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, hand-made cloth. Square 1:1, no text, no frame, no border.
```

Nếu mô hình đổi mặt, thêm: `the face, hair and clothing must be identical to the reference image`. Nếu quá thật: `visible ink outlines and painterly shading, a game illustration, not a photograph`.

## Mã Liên (Thổ, ngoại hiệu Vô Kỳ, khoảng 23 tuổi, nghĩa quân Hoa Lư, con gái một mưu sĩ Tam Đái)

```text
Redraw the reference image as a clean, higher-resolution bust portrait of the SAME young woman, keeping everything exactly as in the reference: the same round face with the round dark eyes and the rosy cheeks, the same wrapped turban of blue and orange patterned cloth, the same silver ring around the neck, the same ochre-brown cross-collar tunic over the cream undershirt, the brown strap across the shoulder, a reserved but kind half-smile, the same three-quarter view looking slightly to the right, the same painting style and the same colours. Change nothing about the character. Do not change the face, the hair or the clothing colours.

Add only one small detail: the brass edge of a mortar rising behind her shoulder.

Improve only: thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills), cleaner details, a bit more of the shoulders and upper chest visible so it is a true bust portrait (head, shoulders, upper chest), and a new background: a faded sepia ink-wash landscape in mist: red-earth terraced hills, a clay kiln, a few clay pots lined up on a low wall, a bamboo grove far away, a pale glow behind the head, lighter, desaturated and out of focus so the figure stands out. Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, hand-made cloth. Square 1:1, no text, no frame, no border.
```

Nếu mô hình đổi mặt, thêm: `the face, hair and clothing must be identical to the reference image`. Nếu quá thật: `visible ink outlines and painterly shading, a game illustration, not a photograph`.

## Tiêu Minh (Lôi, ngoại hiệu Thiên Lý Y, khoảng 27 tuổi, nghĩa quân Hoa Lư, thầy thuốc rong)

```text
Redraw the reference image as a clean, higher-resolution bust portrait of the SAME young woman, keeping everything exactly as in the reference: the same lively face with the small mole beside the lips and sun-tanned skin, the same short black hair with straight bangs, the same purple headband with the white lightning mark, the same light-purple cross-collar tunic over the cream undershirt, an open lively expression with a broad natural smile, the same three-quarter view looking slightly to the right, the same painting style and the same colours. Change nothing about the character. Do not change the face, the hair or the clothing colours.

Add only one small detail: a worn medicine bag strap across the chest.

Improve only: thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills), cleaner details, a bit more of the shoulders and upper chest visible so it is a true bust portrait (head, shoulders, upper chest), and a new background: a faded sepia ink-wash landscape in mist: a country road between village fields, a stone milestone, a bamboo grove and a distant village roof, a pale glow behind the head, a pale glow behind the head, lighter, desaturated and out of focus so the figure stands out. Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, hand-made cloth. Square 1:1, no text, no frame, no border.
```

Nếu mô hình đổi mặt, thêm: `the face, hair and clothing must be identical to the reference image`. Nếu quá thật: `visible ink outlines and painterly shading, a game illustration, not a photograph`.

## Bạch Sương (Phong, ngoại hiệu Sương Phủ, khoảng 29 tuổi, nghĩa quân Hoa Lư, người làm hương xông thuốc giải cảm)

```text
Redraw the reference image as a clean, higher-resolution bust portrait of the SAME young woman, keeping everything exactly as in the reference: the same fair delicate face with pale light eyes and the single white lock of hair among the black, the same hair gathered in a high loose topknot with the white feather and the brass ornament, the same ivory-and-jade cross-collar jacket with the faint cloud pattern on the collar, a soft distant gaze with a faint smile, the same three-quarter view looking slightly to the right, the same painting style and the same colours. Change nothing about the character. Do not change the face, the hair or the clothing colours.

Add only one small detail: a small incense pouch hanging at the chest.

Improve only: thin fine ink outlines of varied thickness, soft painterly shading with gentle gradients (not flat colour fills), cleaner details, a bit more of the shoulders and upper chest visible so it is a true bust portrait (head, shoulders, upper chest), and a new background: a faded sepia ink-wash landscape in mist: foggy hills at the edge of the mountains, thin lines of incense smoke curling up, a tiny hut far away, a pale glow behind the head, lighter, desaturated and out of focus so the figure stands out. Soft diffused warm light from the upper left. Eyes at about 38% of the height from the top, the lower quarter calm and quiet. 10th-century Vietnam, hand-made cloth. Square 1:1, no text, no frame, no border.
```

Nếu mô hình đổi mặt, thêm: `the face, hair and clothing must be identical to the reference image`. Nếu quá thật: `visible ink outlines and painterly shading, a game illustration, not a photograph`.

## Negative prompt (nếu công cụ có ô riêng)

```text
text, letters, numbers, logo, frame, border, watermark, signature, chibi, child, cartoon face, glowing eyes, magic effects, aura, fantasy armor, gemstones, plastic skin, neon, 3d render, photograph, photorealistic, low contrast, Chinese imperial palace, European, modern clothing, close-up cropped face, multiple people
```

## Tiêu chí tôi kiểm khi nhận ảnh

1. Nhận ra đúng người so với chân dung cũ (mặt, tóc, màu áo), ở cỡ ô thật 140×110px.
2. Cùng độ đậm nét viền và đổ bóng với bán thân Hà Vân; không quá thật, không fantasy.
3. Nền sương cùng tông sepia với các bán thân khác; nhân vật tách khỏi nền.
4. Không chữ, khung, viền; mắt ở khoảng 38% chiều cao từ trên.