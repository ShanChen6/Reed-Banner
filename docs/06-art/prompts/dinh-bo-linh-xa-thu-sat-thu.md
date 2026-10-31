# Đinh Bộ Lĩnh — biến thể hình ảnh Xạ thủ và Sát thủ

> Cập nhật: 31/10/2026
> Trạng thái: **DRAFT** — Shan đồng ý thiết kế lại hình ảnh ngày 31/10/2026; bộ tạo hình và prompt cần duyệt Master. Chưa tạo ảnh hoặc asset trong repo; chưa có code chọn biến thể rig.

## Nguồn và phạm vi

Thiết kế gameplay duy nhất: [Đinh Bộ Lĩnh — thêm Xạ thủ/Sát thủ](../../03-characters/dinh-bo-linh-xa-thu-sat-thu.md). Tài liệu này chỉ quyết định **cái gì thay đổi về hình**, không định nghĩa chiêu hay số liệu.

Hiện Đinh Bộ Lĩnh dùng một rig (`dinhBoLinh` trong [rigs.ts](../../../src/app/game/stage/rigs.ts), ảnh ở `public/art/characters/dinh-bo-linh/`) với một thanh kiếm cho cả sáu nghề cũ. Hai nghề mới cầm kiếm sẽ lệch với tên chiêu, nên chỉ hai nghề này có biến thể; **sáu nghề cũ giữ nguyên hình hiện có**.

## Khóa nhân dạng (không đổi ở mọi biến thể)

Giữ y nguyên bản tướng quân hiện có: khuôn mặt, búi tóc và dải buộc tóc, áo giáp, áo choàng, dải đai, tư thế đứng chữ A và bảng màu. Chỉ thay **vũ khí** và những phần tranh có vũ khí. Không đổi màu giáp theo nghề, không thêm giáp mới, không thêm ống tên, bao đao hay đồ đeo ở thân (thân là một lớp `body` dùng chung, đổi thân sẽ phải tách lại toàn bộ rig).

Phong cách theo [art bible](../art-bible.md) và quy trình [tách lớp rig](codex-rig-nhan-vat.md): nhân vật toàn thân, nền trong suốt, đường nét tay vẽ, khe hở giữa tay và thân để tách lớp.

## Hai vũ khí

| Nghề | Vũ khí | Tả hình | Khác với đồng hành cùng nghề |
|---|---|---|---|
| Xạ thủ | Cung tre cánh dài | Cung tre ngâm sẫm, cao khoảng đến vai khi dựng đứng, dây tơ chùng, hai đầu cung buộc dải vải đỏ cờ lau, tay cầm quấn vải chàm. Cầm ở tay trái, đầu cung chúc xuống dọc theo đường kiếm cũ | Đồng hành dùng nỏ, phi tiêu, phi luân, phi hoàng thạch, phi châm, lụa; Đinh Bộ Lĩnh dùng một cung duy nhất, không đổi theo hệ |
| Sát thủ | Dao găm lưỡi cong | Dao ngắn cỡ một cẳng tay, lưỡi thép cong nhẹ một lưỡi, chắn tay đồng nhỏ, chuôi quấn vải chàm, chuôi buộc tua đỏ cờ lau. Cầm ngược, mũi dao chúc xuống đúng đường kiếm cũ | Đồng hành dùng đa vũ khí (dao găm, kim châm, song đao, móng vuốt…); Đinh Bộ Lĩnh một con dao, không đổi theo hệ |

Cả hai dùng đồng `#A88A54` cho kim loại và đỏ cờ lau cho dải/tua, cùng màu với thanh kiếm hiện có, để nhìn là cùng một nhân vật. Hệ chỉ thể hiện bằng VFX, không đổi hình vũ khí.

## Danh sách ảnh cần có

Mỗi biến thể một bộ độc lập (khóa tên file theo mẫu `<tên>-<nghề>.webp`, nghề là `xaThu` hoặc `satThu`). Thực hiện theo thứ tự: Master → tách lớp → ba tranh tư thế.

| # | Ảnh | Dùng cho | Ghi chú |
|---|---|---|---|
| 1 | Master đứng | Cơ sở để tách lớp và duyệt | Cùng tọa độ ảnh 1024×1536 với bản hiện có |
| 2 | Lớp vũ khí | Thay `sword.webp` | Cắt từ Master, cùng vùng `sword` {x:17, y:586, w:469, h:784}, tay cầm khớp lớp `arm` |
| 3 | `pose-cast` | Ra chiêu | Thay ảnh cùng tên của bản kiếm |
| 4 | `pose-ultimate` | Tuyệt chiêu ô 4 | Thay ảnh cùng tên |
| 5 | `pose-down` | Hạ gục | Vũ khí rơi cạnh người, không cầm |

Chân dung (`portrait.webp`) giữ nguyên cho mọi nghề. Các lớp khác (`body`, `head`, `arm`, `armR`, `sleeve`, `cape`, `ribbon`, `sash`) dùng chung; chỉ khi Master mới làm thay đổi tay trái ôm vũ khí thì lớp `arm` mới phải làm biến thể và ghi vào checklist nghiệm thu.

Cần thêm tọa độ `blade` (đường VFX theo vũ khí) cho từng biến thể: Xạ thủ theo thân cung từ đầu trên xuống đầu dưới; Sát thủ theo lưỡi dao, ngắn hơn đường kiếm cũ.

## Prompt

Gắn ảnh bản tướng quân hiện có (`public/art/characters/dinh-bo-linh/body.webp` ghép các lớp, hoặc ảnh gốc 1024×1536) làm tham chiếu nhân dạng. Prompt viết tiếng Anh.

### 1A. Master Xạ thủ

```
Reuse the exact character from the reference image: Dinh Bo Linh in his general's armor, same face, same topknot with hair ribbon, same armor, cloak, sash, colors and A-shaped standing pose. Change ONLY the weapon: replace the straight sword with a long bamboo bow of dark-stained bamboo, about shoulder-height when upright, slack silk string, both limb tips tied with short red reed-flower cloth ribbons, grip wrapped in indigo cloth, copper fittings (#A88A54). Held in the left hand exactly where the sword was held, bow tip pointing downward along the old sword line, string facing the body. No quiver, no arrows on the body, no extra armor. Hand-painted game illustration, full body, transparent background, clear gap between arms and torso for layer cutting, 10th-century Vietnamese setting, not Japanese or Chinese styling.
```

### 1B. Master Sát thủ

```
Reuse the exact character from the reference image: Dinh Bo Linh in his general's armor, same face, same topknot with hair ribbon, same armor, cloak, sash, colors and A-shaped standing pose. Change ONLY the weapon: replace the straight sword with one short curved single-edge steel dagger about one forearm long, small copper guard (#A88A54), grip wrapped in indigo cloth, a short red reed-flower tassel tied to the pommel. Held in the left hand in reverse grip exactly where the sword was held, blade pointing downward along the old sword line. No second dagger, no sheath, no new belt items, no extra armor. Hand-painted game illustration, full body, transparent background, clear gap between arms and torso for layer cutting, 10th-century Vietnamese setting, not Japanese or Chinese styling.
```

### 3A / 3B. Tư thế ra chiêu (`pose-cast`)

Gắn tranh `pose-cast.webp` hiện có và Master đã duyệt làm tham chiếu.

```
Same pose, camera, framing, lighting and character as the reference pose-cast image, but the weapon is the <BOW | DAGGER> from the approved master. <BOW: left hand pulls the bow, right hand draws the string back to the cheek, no arrow shown — an arrow of light is added later as VFX. | DAGGER: reverse-grip dagger held low across the body, blade pointing back, left hand open in front.> Keep face, armor, cloak and colors identical. Transparent background.
```

### 4A / 4B. Tuyệt chiêu (`pose-ultimate`)

```
Same pose, camera, framing and character as the reference pose-ultimate image, but the weapon is the <BOW | DAGGER> from the approved master. <BOW: bow raised high in one hand, other hand open toward the enemy, cloak whipping. | DAGGER: dagger raised overhead in reverse grip, body leaning into the strike, cloak whipping.> No new effects painted in; elemental VFX are added by the game. Keep identity identical. Transparent background.
```

### 5A / 5B. Hạ gục (`pose-down`)

```
Same pose, camera and framing as the reference pose-down image (defeated, fallen), but the <BOW | DAGGER> lies on the ground beside him, not held. Keep identity, armor and colors identical. Transparent background.
```

## Nghiệm thu và triển khai

1. Duyệt Master cả hai nghề trước khi làm tranh tư thế. Kiểm tay cầm khớp lớp `arm`, vũ khí không che mặt, khe hở đủ để tách lớp.
2. Tách lớp theo quy trình rig, đặt vào `public/art/characters/dinh-bo-linh/` với hậu tố nghề; đo dung lượng so với bản kiếm.
3. Code (chưa làm): rig cần nhận biến thể theo nghề của thủ lĩnh (ví dụ khóa `dinhBoLinh` kèm nghề, rơi về bản kiếm khi thiếu ảnh) và test tự động kiểm đủ file/alpha như các rig hiện có.
4. Chưa duyệt Master thì Đinh Bộ Lĩnh Xạ thủ/Sát thủ vẫn hiển thị bằng bản kiếm; không mượn hình vũ khí của đồng hành.
