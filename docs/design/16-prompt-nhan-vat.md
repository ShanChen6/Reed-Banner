# Bộ prompt tạo ảnh nhân vật Cờ Lau

> Cập nhật: 20/10/2026
>
> Prompt ráp sẵn cho **mọi nhân vật chơi được**: Đinh Bộ Lĩnh (3 thời kỳ), 6 tướng lịch sử, 12 sứ quân và 42 tướng thường, tổng **63 hình toàn thân**. Danh sách, nghề và hệ lấy từ `src/core/roster/roster.ts`; mô tả nhân vật ở [Danh sách nhân vật](14-nhan-vat.md). Phong cách và quy tắc theo [Hình ảnh](13-hinh-anh.md) và [Kế hoạch đồ họa](15-ke-hoach-do-hoa.md). Phần giải thích viết tiếng Việt, prompt viết tiếng Anh vì Copilot hiểu tốt hơn.

## 1. Cách dùng

Quy trình đã kiểm chứng ([Kế hoạch đồ họa mục 4.4](15-ke-hoach-do-hoa.md#44-quy-cách-mảnh-cắt-cho-họa-sĩ--công-cụ-ai)):

1. **Copilot:** dán nguyên một khối prompt của nhân vật, tạo **một hình toàn thân** trên nền trơn. Chọn hình có tay, chân và vũ khí tách khỏi thân rõ nhất, không chọn hình đẹp nhất.
2. **live2dlayer:** tách lớp tự động, xuất PSD.
3. **Photopea:** kiểm ba chỗ hay lỗi: bắp tay dính vào lớp áo, vũ khí hoặc đồ cầm tay nằm chung lớp với thứ khác, ảnh bị thu về 1024×1024 (giữ thêm ảnh gốc để làm tranh lớn). Hướng dẫn tách tay ở `/mnt/project-files/guides/tach-lop-photopea.md`.
4. Gửi PSD cùng ảnh gốc, đặt tên theo cột **File** của từng nhân vật (mã trong code, ví dụ `haVan-toanThan.png`). Claude gộp lớp, xuất WebP và dựng động tác bằng code PixiJS.

Thứ tự gợi ý: Đinh Bộ Lĩnh tướng quân → 5 tướng khởi đầu (★) → 6 tướng lịch sử → 12 sứ quân theo thứ tự màn → các tướng thường còn lại.

## 2. Những gì đã sửa so với bản cũ

Tên, nghề và hệ của 42 tướng thường trong bản cũ **khớp code**, không có ai sai chỗ. Phần sửa nằm ở khung prompt và phần còn thiếu:

| Bản cũ | Bản này | Lý do |
|---|---|---|
| "designed for layered Spine 2D animation" | Bỏ chữ Spine, thay bằng "to be cut into layers for animation" | Đã chốt dựng động tác bằng code PixiJS, không dùng Spine |
| Chỉ viết đủ khoảng 11 người, còn lại "tương tự" | Mỗi nhân vật một prompt ráp sẵn, kèm ngoại hình riêng | Copy dán thẳng, không phải tự ghép |
| Thiếu Đinh Bộ Lĩnh, tướng lịch sử, sứ quân | Thêm Đinh Bộ Lĩnh 3 thời kỳ, 6 tướng lịch sử, 12 sứ quân | Theo yêu cầu, khớp `HERO_COMPANIONS` và `WARLORD_COMPANIONS` |
| "dragon, phoenix, or Lac bird motifs engraved on armor" | Họa tiết trống đồng theo từng hệ; cấm giáp vai đầu rồng và hình rồng, phượng | Hình thử Trần Cương ra giáp vai đầu rồng kiểu cổ trang Trung Quốc. Rồng Việt định hình từ thời Lý (thân mảnh uốn khúc như rắn), không hợp thế kỷ X; nếu sau này cần rồng thì dùng dáng đó và bàn riêng |
| "with glowing magical energy fx" trên vũ khí | Vũ khí viền sắc, **không hiệu ứng, không hạt** | Hiệu ứng dính vào vũ khí làm live2dlayer gộp chung một lớp; hiệu ứng sẽ làm bằng code |
| "orthographic front view" | Ba phần tư, quay sang phải, tư thế chữ A nhẹ | Theo quy cách hình toàn thân: nhân vật phe trái quay sang phải, game tự lật cho phe đối thủ |
| "Arms and legs are clearly separated" | Thêm: khe nền giữa tay và thân, thấy rõ bắp tay, khuỷu, cẳng tay; tay áo bó trên khuỷu cho Pháp sư | Bản thử pháp sư Thủy bị bắp tay dính vào lớp áo, tay chỉ xoay nhẹ được |
| Nền "solid gray" cho mọi hệ | Nền xanh lá trơn; riêng Mộc và Phong nền hồng tươi | Hệ Kim bạc trắng lẫn với nền xám; nền phải là màu không có trên nhân vật |
| Quân sư cầm "binh thư cổ bay lơ lửng" | Quân sư cầm **thẻ tre và cờ lệnh** | Theo vũ khí nghề trong Hình ảnh mục 2.4; sách đóng gáy không hợp thế kỷ X |
| Mưu sĩ "quạt hoặc thẻ tre", Pháp sư "quả cầu hoặc bùa" | Mưu sĩ **quạt lông**, Pháp sư **gậy phép có quả cầu** | Mỗi nghề một đồ cầm tay để nhận ra ở 160 px, không trùng nhau |
| "anime splash art" | Giữ hướng lai nửa tả thực nửa anime, thêm "mắt tự nhiên, tỉ lệ người lớn" | Shan chọn hướng lai cho tranh lớn (Kế hoạch đồ họa mục 2.4); bản yêu cầu họa sĩ tránh anime mắt to |
| Phong "pale jade green" | Phong xanh ngọc nhạt (teal) | Tách khỏi màu xanh lá của Mộc, khớp màu hệ trong game `#2e9e90` |

## 3. Khung chung

Mọi prompt bên dưới ráp từ khung này. Muốn tạo nhân vật mới thì thay các chỗ `[...]` theo hai bảng tra.

```text
Full-body character art for a 2D game, to be cut into layers for animation.
Character: [NAME], a [CLASS] of the [ELEMENT] element, a fictional [man/woman] of 10th-century Vietnam.
Look: [AGE, BUILD, FACE, HAIR]; [SILHOUETTE].
Outfit: [OUTFIT]. Main colors: [PALETTE], with bronze gold and warm beige as neutrals.
Decoration: [MOTIF] in Dong Son bronze-drum style, sparingly on trims and belt.
Holding: [WEAPON].
Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away
from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart,
feet flat, empty margin around the figure.
Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two
shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam.
The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic
effects anywhere. One character only.
Background: [BACKGROUND], completely uniform.
No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix
emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### 3.1 Bảng nghề

| Nghề | [CLASS] | [OUTFIT] | [WEAPON] |
|---|---|---|---|
| ⚔️ Tướng sĩ | vanguard warrior | giáp vảy đồng buộc trên da, ngoài áo giao lĩnh, tay áo ngắn để lộ bắp tay | đao bản to, kiếm đồng thẳng hoặc giáo dài, chĩa xuống và ra ngoài |
| ☯️ Pháp sư | mystic sorcerer | áo lễ giao lĩnh nhiều lớp, đai lụa, tay áo buộc dây trên khuỷu | gậy phép gỗ bọc đồng, đầu có quả cầu theo hệ |
| 🍙 Binh lính | guardian soldier | áo da độn có vảy sắt nhỏ, tay áo bó, xà cạp, dép cỏ | giáo dựng cạnh người + khiên mây tròn giơ ra bên, không che thân |
| ❤️ Y sư | herbalist healer | áo giao lĩnh nhẹ, tạp dề ngắn, túi thuốc ở đai, tay áo xắn | hồ lô thuốc nắp đồng treo dây |
| 💰 Mưu sĩ | cunning strategist | áo nho sĩ giao lĩnh, khăn vải mềm, tay áo hẹp, ống bút ở đai | quạt lông trắng |
| 📖 Quân sư | army tactician | áo giao lĩnh dài, áo choàng vai ngắn, dải lệnh chéo ngực | bó thẻ tre (tay trái) + cờ lệnh tam giác (tay phải) |

### 3.2 Bảng hệ

| Hệ | [ELEMENT] | [PALETTE] | [MOTIF] | [BACKGROUND] |
|---|---|---|---|---|
| ⚙️ Kim | metal (gold and silver) | trắng bạch kim, bạc, vàng hoàng gia, `#9ea4ad` | răng cưa trống đồng, vân mai rùa | xanh lá `#00b140` |
| 🌿 Mộc | wood (nature) | xanh ngọc lục bảo, xanh rừng, nâu gỗ, `#4f9a4a` | lá tre, đốt tre | hồng tươi `#ff00ff` |
| 💧 Thủy | water | xanh biển, xanh thẳm, xanh nước trong, trắng, `#2f7fc1` | sóng nước khắc | xanh lá `#00b140` |
| 🔥 Hỏa | fire | đỏ thẫm, cam lửa, đen than, tàn lửa, `#d9502a` | lửa cuộn kiểu mây, lông chim Lạc | xanh lá `#00b140` |
| ⛰️ Thổ | earth (rock) | vàng đất, nâu bùn, be cát, xám đá, `#a5772f` | núi tầng, vân đá | xanh lá `#00b140` |
| ⚡ Lôi | thunder (lightning) | tím thạch anh, tím sáng, đen huyền, ánh xanh điện, `#7d55c7` | tia chớp gãy khúc | xanh lá `#00b140` |
| 🌪️ Phong | wind (storm) | xanh ngọc nhạt, trắng bạc, xám nhạt, `#2e9e90` | mây cuộn, đuôi chim Lạc | hồng tươi `#ff00ff` |


## 4. Đinh Bộ Lĩnh (nhân vật chính, 3 thời kỳ)

Trong trận Đinh Bộ Lĩnh đổi nghề và hệ mỗi trận, nên hình gốc giữ **bảng màu riêng** (đỏ son, xanh rêu, vàng đồng, bông lau trắng) và vẽ theo nghề mặc định Tướng sĩ. Màu nguyên tố của trận hiện bằng hiệu ứng và vùng nhấn đổi màu bằng code (Kế hoạch đồ họa mục 4.3), không cần tạo 42 bản.

### Thiếu niên (chăn trâu, cờ lau)

- File: `dinhBoLinh-thieuNien-toanThan.png` · Dùng ở: Các màn đầu chiến dịch, cốt truyện

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Dinh Bo Linh as a boy, a Vietnamese water-buffalo herder around thirteen who leads village children in mock battles with reed flags. Look: lean, sun-tanned boy, fearless bright eyes, determined mouth, short messy hair tied in a small topknot with a cloth strip, barefoot. Outfit: simple brown cross-collar (giao linh) tunic with short sleeves, trousers rolled to the knee, a rope belt, a small bamboo water tube at the hip. Main colors: earth brown, faded indigo and the pure white of reed flowers, with bronze gold and warm beige as neutrals. Decoration: a simple sawtooth band in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a tall reed stalk with a fluffy white reed-flower head used as his battle flag, held upright in the right hand beside the body; a short bamboo stick in the left hand like a toy sword. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural child proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Tướng quân (hình chính trong trận)

- File: `dinhBoLinh-tuongQuan-toanThan.png` · Dùng ở: Trận đấu, menu, landing

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Dinh Bo Linh as a young general around twenty-eight, leader of the reed-flag army that ends the war of the twelve lords. Look: tall, strong and lean, resolute leader's gaze, short beard along the jaw, black hair in a high topknot wrapped with a vermilion cloth whose ends trail behind. Outfit: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps; a short vermilion cape fixed at the shoulders, a white reed-flower tassel hanging from the belt. Main colors: vermilion red, moss green and the white of reed flowers, with bronze gold and warm beige as neutrals. Decoration: sawtooth bands, concentric circles and small flying Lac birds in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a long broad single-edged saber (dao) held in the right hand, blade angled down and outward away from the legs. He is the hero of the whole game: make him the most striking and heroic design of the set. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Hoàng đế (Đại Cồ Việt, đoạn kết)

- File: `dinhBoLinh-hoangDe-toanThan.png` · Dùng ở: Đoạn kết chiến dịch, bảng thắng

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Dinh Bo Linh as the founding emperor of Dai Co Viet in his forties, after reuniting the land. Look: dignified and powerful, calm commanding eyes, full well-kept beard, hair in a topknot under a simple low crown of dark lacquer and bronze with a single reed-flower crest. Outfit: long cross-collar (giao linh) imperial robe in deep vermilion with a moss-green inner layer and a wide bronze-plaque belt, sleeves gathered at the wrists, cloth shoes. Main colors: deep vermilion, moss green and the white of reed flowers, with bronze gold and warm beige as neutrals. Decoration: concentric circles and Lac birds in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a sheathed straight sword held upright in the right hand in front of the hip, away from the body. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

## 5. Sáu tướng lịch sử

Nhân vật lịch sử được hư cấu hóa; nét mặt và trang phục do Claude đặt, không dựa trên tranh có sẵn nào. Mỗi người có một **túm bông lau trắng** trên đai để nhận ra là người của đạo quân cờ lau (trừ khi Shan muốn bỏ).

| Tướng | Nghề | Hệ | Gia nhập ở màn | Ghi chú tạo hình |
|---|---|---|---|---|
| Nguyễn Bặc | ⚔️ Tướng sĩ | 🔥 Hỏa | Cờ lau tập trận (Hoa Lư) | Bạn thuở nhỏ của Đinh Bộ Lĩnh, Định Quốc công. Dáng tướng trung thành, chắc nịch. |
| Đinh Điền | 🍙 Binh lính | ⛰️ Thổ | Thử tài ở Bố Hải Khẩu | Bạn thuở nhỏ, Ngoại giáp (chỉ huy quân bảo vệ). Lá chắn của đội. |
| Lưu Cơ | 💰 Mưu sĩ | ⚙️ Kim | Thu phục Đằng Châu | Đô hộ phủ sĩ sư (quan coi việc hình án). Dáng nho sĩ sắc sảo. |
| Trịnh Tú | ❤️ Y sư | 🌿 Mộc | Đánh Bình Kiều | Một trong nhóm bạn cờ lau. Đặt làm Y sư (hư cấu hóa). |
| Lê Hoàn | 📖 Quân sư | ⚡ Lôi | Vây thành Tam Đái | Thập đạo tướng quân, sau này lên ngôi. Trẻ, tự tin, có nét tướng. |
| Đinh Liễn | ☯️ Pháp sư | 💧 Thủy | Lên Phong Châu | Con trưởng Đinh Bộ Lĩnh, Nam Việt vương. Hoàng tử trẻ, nét giống cha. |

### Nguyễn Bặc · ⚔️ Tướng sĩ · 🔥 Hỏa

- File: `nguyenBac-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Nguyễn Bặc, childhood friend and most loyal general of Dinh Bo Linh, later honored as Duke of State Stability, a vanguard warrior of the fire element, a historical Vietnamese figure of the 10th century shown as a fantasy hero. Look: a powerfully built man around thirty, square determined face, short full beard, hair in a topknot wrapped with a red cloth, a white reed-flower tassel tied to his belt; broad shoulders, solid stance. Outfit: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals. Decoration: curling cloud-shaped flame patterns and Lac bird feathers in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a long broad single-edged saber (dao) held in the right hand, blade angled down and outward away from the legs. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Đinh Điền · 🍙 Binh lính · ⛰️ Thổ

- File: `dinhDien-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Đinh Điền, childhood friend of Dinh Bo Linh who became commander of the outer guard, a guardian soldier of the earth (rock) element, a historical Vietnamese figure of the 10th century shown as a fantasy hero. Look: a stocky, broad man around thirty, cheerful weathered face, short beard, conical palm-leaf hat (non la) pushed back, a white reed-flower tassel on his belt; stocky, grounded stance. Outfit: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals. Decoration: stacked-mountain and stone-grain patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Lưu Cơ · 💰 Mưu sĩ · ⚙️ Kim

- File: `luuCo-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Lưu Cơ, childhood friend of Dinh Bo Linh who later served as chief judicial officer, a cunning strategist of the metal (gold and silver) element, a historical Vietnamese figure of the 10th century shown as a fantasy hero. Look: a thin, upright man in his thirties, keen eyes, neat mustache and goatee, black scholar's cap, a small bronze seal hanging from his belt; lean, upright silhouette. Outfit: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals. Decoration: sawtooth bands and turtle-shell scale patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a white feather fan held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Trịnh Tú · ❤️ Y sư · 🌿 Mộc

- File: `trinhTu-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Trịnh Tú, one of the reed-flag companions of Dinh Bo Linh's youth, a herbalist healer of the wood (nature) element, a historical Vietnamese figure of the 10th century shown as a fantasy hero. Look: a kind, steady man in his thirties, gentle eyes, short beard, green head wrap, a woven herb basket on his back kept small and close to the body; gentle, slender silhouette. Outfit: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals. Decoration: bamboo leaves and bamboo-node patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bronze-capped medicine gourd hanging from a cord, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Lê Hoàn · 📖 Quân sư · ⚡ Lôi

- File: `leHoan-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Lê Hoàn, a brilliant young officer who became Commander of the Ten Circuits, an army tactician of the thunder (lightning) element, a historical Vietnamese figure of the 10th century shown as a fantasy hero. Look: a handsome, sharp-eyed man in his late twenties, confident half smile, clean-shaven, hair in a topknot with a purple cord, bronze plates over the shoulders of his robe; composed, commanding silhouette. Outfit: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals. Decoration: zigzag lightning patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Đinh Liễn · ☯️ Pháp sư · 💧 Thủy

- File: `dinhLien-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Đinh Liễn, eldest son of Dinh Bo Linh, later titled King of Nam Viet, a mystic sorcerer of the water element, a historical Vietnamese figure of the 10th century shown as a fantasy hero. Look: a young prince around twenty, resembling a younger Dinh Bo Linh, proud bright eyes, hair in a topknot with a small bronze crown band, blue silk sash; tall flowing silhouette. Outfit: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals. Decoration: carved wave patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a short ritual staff of dark wood and bronze topped with a small water-element orb, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

## 6. Mười hai sứ quân

Trùm các màn chiến dịch, sau mở bán ở cửa hàng. Mỗi người một nét riêng (tuổi, dáng, vũ khí) theo bản yêu cầu họa sĩ (Hình ảnh mục 2.4). Nhóm này có thêm đai và viền áo sang hơn để đọc ra là thủ lĩnh.

| Sứ quân | Tước hiệu | Nghề | Hệ | Đất | Ghi chú tạo hình |
|---|---|---|---|---|---|
| Trần Lãm | Trần Minh Công | 📖 Quân sư | 💧 Thủy | Bố Hải Khẩu | Người già nhất, vùng cửa biển. Râu trắng, hiền mà tinh. |
| Phạm Bạch Hổ | Phạm Phòng Át | ⚔️ Tướng sĩ | 🔥 Hỏa | Đằng Châu | Tên Bạch Hổ nên có áo choàng da hổ trắng. |
| Ngô Xương Xí | Kiều công | 💰 Mưu sĩ | ⚙️ Kim | Bình Kiều | Dòng dõi nhà Ngô, trẻ, kiêu. |
| Ngô Nhật Khánh | Ngô Nam công | 📖 Quân sư | 🌪️ Phong | Đường Lâm | Quý tộc nhà Ngô ở Đường Lâm, điềm tĩnh tính toán. |
| Nguyễn Khoan | Nguyễn Thái Bình | 🍙 Binh lính | ⛰️ Thổ | Tam Đái | Giữ thành Tam Đái, nặng nề vững chãi. |
| Kiều Công Hãn | Kiều Tam Chế | ☯️ Pháp sư | ⚡ Lôi | Phong Châu | Phong Châu (vùng đất Tổ), dáng pháp sư u ám. |
| Kiều Thuận | Kiều Lệnh công | ❤️ Y sư | 🌿 Mộc | Hồi Hồ | Đầm Hồi Hồ, áo hoa văn sen và lau sậy. |
| Lý Khuê | Lý Lãng công | ⚔️ Tướng sĩ | ⚙️ Kim | Siêu Loại | Siêu Loại (Bắc Ninh), giáp bạc vàng bóng. |
| Nguyễn Thủ Tiệp | Nguyễn Lệnh công | 💰 Mưu sĩ | 💧 Thủy | Tiên Du | Tiên Du, giàu có, mưu mô. |
| Lữ Đường | Lữ Tá công | ☯️ Pháp sư | 💧 Thủy | Tế Giang | Thủy chiến Tế Giang, dáng người sông nước. |
| Nguyễn Siêu | Nguyễn Hữu công | 🍙 Binh lính | 🔥 Hỏa | Tây Phù Liệt | Tây Phù Liệt, nóng nảy, trán bướng. |
| Đỗ Cảnh Thạc | Đỗ Lệnh công | ⚔️ Tướng sĩ | ⛰️ Thổ | Đỗ Động | Trùm cuối chương 1, cựu tướng dày dạn, sẹo trên mắt. |

### Trần Lãm (Trần Minh Công) · 📖 Quân sư · 💧 Thủy

- File: `tranLam-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Trần Lãm, one of the twelve rival warlords of 10th-century Vietnam, lord of Bố Hải Khẩu, an army tactician of the water element, shown as a fantasy boss. Look: an elderly coastal lord in his sixties, long white beard, kind but shrewd eyes, topknot with a blue jade pin, slightly stooped but dignified; composed, commanding silhouette; a lord's richer trims and a bronze rank plaque on the belt. Outfit: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals. Decoration: carved wave patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Phạm Bạch Hổ (Phạm Phòng Át) · ⚔️ Tướng sĩ · 🔥 Hỏa

- File: `phamBachHo-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Phạm Bạch Hổ, one of the twelve rival warlords of 10th-century Vietnam, lord of Đằng Châu, a vanguard warrior of the fire element, shown as a fantasy boss. Look: a fierce, battle-hardened lord in his forties, tiger-like eyes, thick beard, a white tiger-pelt mantle over his armor (tiger head not included); broad shoulders, solid stance; a lord's richer trims and a bronze rank plaque on the belt. Outfit: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals. Decoration: curling cloud-shaped flame patterns and Lac bird feathers in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a long broad single-edged saber (dao) held in the right hand, blade angled down and outward away from the legs. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Ngô Xương Xí (Kiều công) · 💰 Mưu sĩ · ⚙️ Kim

- File: `ngoXuongXi-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Ngô Xương Xí, one of the twelve rival warlords of 10th-century Vietnam, lord of Bình Kiều, a cunning strategist of the metal (gold and silver) element, shown as a fantasy boss. Look: a young, proud noble in his twenties, heir of the fallen Ngo royal house, refined pale face, thin mustache, black lacquered cap with a gold band; lean, upright silhouette; a lord's richer trims and a bronze rank plaque on the belt. Outfit: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals. Decoration: sawtooth bands and turtle-shell scale patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a white feather fan held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Ngô Nhật Khánh (Ngô Nam công) · 📖 Quân sư · 🌪️ Phong

- File: `ngoNhatKhanh-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Ngô Nhật Khánh, one of the twelve rival warlords of 10th-century Vietnam, lord of Đường Lâm, an army tactician of the wind (storm) element, shown as a fantasy boss. Look: an aristocratic lord in his thirties of the Ngo royal clan, calm calculating eyes, neat beard, teal silk sash and a gold belt plaque; composed, commanding silhouette; a lord's richer trims and a bronze rank plaque on the belt. Outfit: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals. Decoration: rolling cloud scrolls and Lac bird tail-feather patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Nguyễn Khoan (Nguyễn Thái Bình) · 🍙 Binh lính · ⛰️ Thổ

- File: `nguyenKhoan-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Nguyễn Khoan, one of the twelve rival warlords of 10th-century Vietnam, lord of Tam Đái, a guardian soldier of the earth (rock) element, shown as a fantasy boss. Look: a heavyset lord in his fifties, round stern face, gray beard, ochre head wrap, thick padded armor; stocky, grounded stance; a lord's richer trims and a bronze rank plaque on the belt. Outfit: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals. Decoration: stacked-mountain and stone-grain patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Kiều Công Hãn (Kiều Tam Chế) · ☯️ Pháp sư · ⚡ Lôi

- File: `kieuCongHan-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Kiều Công Hãn, one of the twelve rival warlords of 10th-century Vietnam, lord of Phong Châu, a mystic sorcerer of the thunder (lightning) element, shown as a fantasy boss. Look: a gaunt, intense lord in his forties, sunken eyes, long black beard, hair loose under a purple head band, purple-black robes; tall flowing silhouette; a lord's richer trims and a bronze rank plaque on the belt. Outfit: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals. Decoration: zigzag lightning patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a short ritual staff of dark wood and bronze topped with a small thunder-element orb, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Kiều Thuận (Kiều Lệnh công) · ❤️ Y sư · 🌿 Mộc

- File: `kieuThuan-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Kiều Thuận, one of the twelve rival warlords of 10th-century Vietnam, lord of Hồi Hồ, a herbalist healer of the wood (nature) element, shown as a fantasy boss. Look: a calm marshland lord in his forties, lean, long thin beard, green head wrap, reed-and-lotus pattern on his robe; gentle, slender silhouette; a lord's richer trims and a bronze rank plaque on the belt. Outfit: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals. Decoration: bamboo leaves and bamboo-node patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bronze-capped medicine gourd hanging from a cord, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Lý Khuê (Lý Lãng công) · ⚔️ Tướng sĩ · ⚙️ Kim

- File: `lyKhue-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Lý Khuê, one of the twelve rival warlords of 10th-century Vietnam, lord of Siêu Loại, a vanguard warrior of the metal (gold and silver) element, shown as a fantasy boss. Look: a tall, imposing lord in his forties, hawk-like face, short pointed beard, polished silver-and-gold lamellar armor; broad shoulders, solid stance; a lord's richer trims and a bronze rank plaque on the belt. Outfit: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals. Decoration: sawtooth bands and turtle-shell scale patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a straight double-edged bronze sword held in the right hand, angled down and outward away from the legs. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Nguyễn Thủ Tiệp (Nguyễn Lệnh công) · 💰 Mưu sĩ · 💧 Thủy

- File: `nguyenThuTiep-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Nguyễn Thủ Tiệp, one of the twelve rival warlords of 10th-century Vietnam, lord of Tiên Du, a cunning strategist of the water element, shown as a fantasy boss. Look: a wealthy, scheming lord in his fifties, plump face, thin long mustache, blue silk robe with a heavy jade belt; lean, upright silhouette; a lord's richer trims and a bronze rank plaque on the belt. Outfit: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals. Decoration: carved wave patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a white feather fan held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Lữ Đường (Lữ Tá công) · ☯️ Pháp sư · 💧 Thủy

- File: `luDuong-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Lữ Đường, one of the twelve rival warlords of 10th-century Vietnam, lord of Tế Giang, a mystic sorcerer of the water element, shown as a fantasy boss. Look: a river-war lord in his forties, sun-darkened skin, braided beard, rope-bound hair, blue robe with wave hems; tall flowing silhouette; a lord's richer trims and a bronze rank plaque on the belt. Outfit: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals. Decoration: carved wave patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a short ritual staff of dark wood and bronze topped with a small water-element orb, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Nguyễn Siêu (Nguyễn Hữu công) · 🍙 Binh lính · 🔥 Hỏa

- File: `nguyenSieu-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Nguyễn Siêu, one of the twelve rival warlords of 10th-century Vietnam, lord of Tây Phù Liệt, a guardian soldier of the fire element, shown as a fantasy boss. Look: a hot-tempered lord in his forties, bull-necked, thick black beard, red head wrap, scarred forearms; stocky, grounded stance; a lord's richer trims and a bronze rank plaque on the belt. Outfit: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals. Decoration: curling cloud-shaped flame patterns and Lac bird feathers in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### Đỗ Cảnh Thạc (Đỗ Lệnh công) · ⚔️ Tướng sĩ · ⛰️ Thổ

- File: `doCanhThac-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Đỗ Cảnh Thạc, one of the twelve rival warlords of 10th-century Vietnam, lord of Đỗ Động, a vanguard warrior of the earth (rock) element, shown as a fantasy boss. Look: a grim veteran general in his fifties, the toughest of the twelve lords, deep scar over one eye, gray beard, massive frame, heavy ochre-and-stone lamellar armor; broad shoulders, solid stance; a lord's richer trims and a bronze rank plaque on the belt. Outfit: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals. Decoration: stacked-mountain and stone-grain patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a long broad single-edged saber (dao) held in the right hand, blade angled down and outward away from the legs. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

## 7. Bốn mươi hai tướng thường

Mỗi tổ hợp nghề × hệ đúng một người (khớp `SHOP_COMPANIONS` và `STARTER_COMPANIONS`). **Giới tính không có trong code**: cột Giới tính là Claude đặt, giữ nguyên chỗ bản cũ đã ghi; muốn đổi chỉ cần sửa chữ `man`/`woman` và phần mô tả tóc. ★ là 5 người khởi đầu, nên tạo trước.

| Nghề \ Hệ | ⚙️ Kim | 🌿 Mộc | 💧 Thủy | 🔥 Hỏa | ⛰️ Thổ | ⚡ Lôi | 🌪️ Phong |
|---|---|---|---|---|---|---|---|
| ⚔️ Tướng sĩ | Trần Cương (nam) | Lâm Tùng (nam) | Hồ Lãng (nam) | Lý Liệt (nam) | Kha Sơn (nam) | Tống Tấn (nam) | Hứa Lăng (nữ) |
| ☯️ Pháp sư | Chu Ngân (nam) | Đàm Thảo (nữ) | Đào Lam (nữ) | ★ Hà Vân (nữ) | Doãn Nham (nam) | Vũ Lôi (nam) | Liễu Yên (nữ) |
| 🍙 Binh lính | Cao Kiên (nam) | Hoàng Mộc (nam) | Thái Hà (nam) | Trương Viêm (nam) | ★ Lê Thạch (nam) | Ông Chấn (nam) | Mạnh Tường (nam) |
| ❤️ Y sư | Châu Ngọc (nữ) | Lục Diệp (nữ) | ★ Mai Thanh (nữ) | Hồng Đan (nữ) | Bế Liên (nữ) | Tiêu Minh (nữ) | Bạch Sương (nữ) |
| 💰 Mưu sĩ | ★ Tô Kim (nam) | Nhan Trúc (nữ) | Quách Ẩn (nam) | Ninh Hỏa (nam) | Mã Nhạc (nam) | Từ Kinh (nam) | Bùi Phiêu (nam) |
| 📖 Quân sư | Nghiêm Thiết (nam) | Sầm Tuệ (nữ) | Vi Triều (nam) | Tôn Diệm (nữ) | Tạ Thạch (nam) | Mạc Vân (nữ) | ★ Phùng Phong (nam) |

### ⚙️ Kim

#### Trần Cương · ⚔️ Tướng sĩ · nam

- File: `tranCuong-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Trần Cương, a vanguard warrior of the metal (gold and silver) element, a fictional man of 10th-century Vietnam. Look: a young man in his mid-twenties, tall and athletic, sharp jaw, black hair tied in a high topknot with a silver band; broad shoulders, solid stance. Outfit: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals. Decoration: sawtooth bands and turtle-shell scale patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a long broad single-edged saber (dao) held in the right hand, blade angled down and outward away from the legs. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Chu Ngân · ☯️ Pháp sư · nam

- File: `chuNgan-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Chu Ngân, a mystic sorcerer of the metal (gold and silver) element, a fictional man of 10th-century Vietnam. Look: a slender man around thirty, calm narrow eyes, long black hair half tied with a silver pin, thin mustache; tall flowing silhouette. Outfit: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals. Decoration: sawtooth bands and turtle-shell scale patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a short ritual staff of dark wood and bronze topped with a small metal-element orb, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Cao Kiên · 🍙 Binh lính · nam

- File: `caoKien-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Cao Kiên, a guardian soldier of the metal (gold and silver) element, a fictional man of 10th-century Vietnam. Look: a broad, heavily built man in his thirties, square face, short beard, black head wrap with a silver trim; stocky, grounded stance. Outfit: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals. Decoration: sawtooth bands and turtle-shell scale patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Châu Ngọc · ❤️ Y sư · nữ

- File: `chauNgoc-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Châu Ngọc, a herbalist healer of the metal (gold and silver) element, a fictional woman of 10th-century Vietnam. Look: a poised young woman in her mid-twenties, oval face, hair in a low bun held by a silver hairpin, small pearl earrings; gentle, slender silhouette. Outfit: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals. Decoration: sawtooth bands and turtle-shell scale patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bronze-capped medicine gourd hanging from a cord, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Tô Kim · 💰 Mưu sĩ · nam ★

- File: `toKim-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Tô Kim, a cunning strategist of the metal (gold and silver) element, a fictional man of 10th-century Vietnam. Look: a sly-looking man in his thirties, thin face, neat goatee, scholar's soft black cap; lean, upright silhouette. Outfit: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals. Decoration: sawtooth bands and turtle-shell scale patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a white feather fan held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Nghiêm Thiết · 📖 Quân sư · nam

- File: `nghiemThiet-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Nghiêm Thiết, an army tactician of the metal (gold and silver) element, a fictional man of 10th-century Vietnam. Look: a stern man in his forties, strong brow, short gray-streaked beard, hair in a topknot with an iron crest; composed, commanding silhouette. Outfit: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals. Decoration: sawtooth bands and turtle-shell scale patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### 🌿 Mộc

#### Lâm Tùng · ⚔️ Tướng sĩ · nam

- File: `lamTung-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Lâm Tùng, a vanguard warrior of the wood (nature) element, a fictional man of 10th-century Vietnam. Look: a sturdy man around thirty, weathered tan skin, thick eyebrows, hair in a topknot wrapped with a green cloth; broad shoulders, solid stance. Outfit: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals. Decoration: bamboo leaves and bamboo-node patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a straight double-edged bronze sword held in the right hand, angled down and outward away from the legs. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Đàm Thảo · ☯️ Pháp sư · nữ

- File: `damThao-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Đàm Thảo, a mystic sorcerer of the wood (nature) element, a fictional woman of 10th-century Vietnam. Look: a young woman around twenty, bright gentle eyes, long hair braided with small leaves, a sprig of bamboo in her hair; tall flowing silhouette. Outfit: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals. Decoration: bamboo leaves and bamboo-node patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a short ritual staff of dark wood and bronze topped with a small wood-element orb, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Hoàng Mộc · 🍙 Binh lính · nam

- File: `hoangMoc-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Hoàng Mộc, a guardian soldier of the wood (nature) element, a fictional man of 10th-century Vietnam. Look: a big-framed young man, friendly round face, wearing a conical palm-leaf hat (non la) over a green head wrap; stocky, grounded stance. Outfit: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals. Decoration: bamboo leaves and bamboo-node patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Lục Diệp · ❤️ Y sư · nữ

- File: `lucDiep-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Lục Diệp, a herbalist healer of the wood (nature) element, a fictional woman of 10th-century Vietnam. Look: a cheerful young woman in her early twenties, round face, hair in two low buns tied with green ribbons; gentle, slender silhouette. Outfit: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals. Decoration: bamboo leaves and bamboo-node patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bronze-capped medicine gourd hanging from a cord, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Nhan Trúc · 💰 Mưu sĩ · nữ

- File: `nhanTruc-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Nhan Trúc, a cunning strategist of the wood (nature) element, a fictional woman of 10th-century Vietnam. Look: a sharp-eyed woman in her late twenties, slim, hair in a high bun with a bamboo hairpin, faint knowing smile; lean, upright silhouette. Outfit: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals. Decoration: bamboo leaves and bamboo-node patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a white feather fan held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Sầm Tuệ · 📖 Quân sư · nữ

- File: `samTue-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Sầm Tuệ, an army tactician of the wood (nature) element, a fictional woman of 10th-century Vietnam. Look: a calm, wise woman in her thirties, straight posture, long hair tied back with a dark green cloth band; composed, commanding silhouette. Outfit: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals. Decoration: bamboo leaves and bamboo-node patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### 💧 Thủy

#### Hồ Lãng · ⚔️ Tướng sĩ · nam

- File: `hoLang-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Hồ Lãng, a vanguard warrior of the water element, a fictional man of 10th-century Vietnam. Look: an athletic man in his late twenties with a river boatman's tan, short stubble, hair in a topknot tied with a blue cord; broad shoulders, solid stance. Outfit: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals. Decoration: carved wave patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a long spear held upright in the right hand beside the body, shaft not crossing the torso. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Đào Lam · ☯️ Pháp sư · nữ

- File: `daoLam-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Đào Lam, a mystic sorcerer of the water element, a fictional woman of 10th-century Vietnam. Look: a graceful young woman in her early twenties, long flowing black hair with blue ribbons, serene expression; tall flowing silhouette. Outfit: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals. Decoration: carved wave patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a short ritual staff of dark wood and bronze topped with a small water-element orb, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Thái Hà · 🍙 Binh lính · nam

- File: `thaiHa-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Thái Hà, a guardian soldier of the water element, a fictional man of 10th-century Vietnam. Look: a sturdy man in his thirties, broad shoulders, short beard, blue head wrap; stocky, grounded stance. Outfit: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals. Decoration: carved wave patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Mai Thanh · ❤️ Y sư · nữ ★

- File: `maiThanh-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Mai Thanh, a herbalist healer of the water element, a fictional woman of 10th-century Vietnam. Look: a kind young woman in her mid-twenties, soft features, hair under a pale blue head scarf; gentle, slender silhouette. Outfit: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals. Decoration: carved wave patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bronze-capped medicine gourd hanging from a cord, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Quách Ẩn · 💰 Mưu sĩ · nam

- File: `quachAn-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Quách Ẩn, a cunning strategist of the water element, a fictional man of 10th-century Vietnam. Look: a quiet, mysterious man in his thirties, half-lidded eyes, long hair loose over one shoulder; lean, upright silhouette. Outfit: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals. Decoration: carved wave patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a white feather fan held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Vi Triều · 📖 Quân sư · nam

- File: `viTrieu-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Vi Triều, an army tactician of the water element, a fictional man of 10th-century Vietnam. Look: a dignified man in his forties, long thin beard, hair in a topknot with a blue jade pin; composed, commanding silhouette. Outfit: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals. Decoration: carved wave patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### 🔥 Hỏa

#### Lý Liệt · ⚔️ Tướng sĩ · nam

- File: `lyLiet-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Lý Liệt, a vanguard warrior of the fire element, a fictional man of 10th-century Vietnam. Look: a fierce young man in his mid-twenties, intense eyes, scar across one cheek, wild hair tied back with a red band; broad shoulders, solid stance. Outfit: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals. Decoration: curling cloud-shaped flame patterns and Lac bird feathers in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a long broad single-edged saber (dao) held in the right hand, blade angled down and outward away from the legs. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Hà Vân · ☯️ Pháp sư · nữ ★

- File: `haVan-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Hà Vân, a mystic sorcerer of the fire element, a fictional woman of 10th-century Vietnam. Look: a confident young woman in her mid-twenties, striking eyes, hair in a high bun with red ribbons trailing; tall flowing silhouette. Outfit: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals. Decoration: curling cloud-shaped flame patterns and Lac bird feathers in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a short ritual staff of dark wood and bronze topped with a small fire-element orb, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Trương Viêm · 🍙 Binh lính · nam

- File: `truongViem-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Trương Viêm, a guardian soldier of the fire element, a fictional man of 10th-century Vietnam. Look: a muscular man in his thirties, thick beard, red head wrap, soot-dark forearms; stocky, grounded stance. Outfit: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals. Decoration: curling cloud-shaped flame patterns and Lac bird feathers in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Hồng Đan · ❤️ Y sư · nữ

- File: `hongDan-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Hồng Đan, a herbalist healer of the fire element, a fictional woman of 10th-century Vietnam. Look: an elegant woman in her late twenties, warm smile, hair in a low bun with a red cord; gentle, slender silhouette. Outfit: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals. Decoration: curling cloud-shaped flame patterns and Lac bird feathers in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bronze-capped medicine gourd hanging from a cord, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Ninh Hỏa · 💰 Mưu sĩ · nam

- File: `ninhHoa-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Ninh Hỏa, a cunning strategist of the fire element, a fictional man of 10th-century Vietnam. Look: a lean, restless man around thirty, sharp grin, short beard, hair tied in a small topknot; lean, upright silhouette. Outfit: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals. Decoration: curling cloud-shaped flame patterns and Lac bird feathers in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a white feather fan held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Tôn Diệm · 📖 Quân sư · nữ

- File: `tonDiem-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Tôn Diệm, an army tactician of the fire element, a fictional woman of 10th-century Vietnam. Look: a commanding woman in her thirties, sharp eyebrows, hair in a tall bun with a red-lacquered pin; composed, commanding silhouette. Outfit: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals. Decoration: curling cloud-shaped flame patterns and Lac bird feathers in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### ⛰️ Thổ

#### Kha Sơn · ⚔️ Tướng sĩ · nam

- File: `khaSon-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Kha Sơn, a vanguard warrior of the earth (rock) element, a fictional man of 10th-century Vietnam. Look: a huge, mountain-like man in his thirties, shaved sides, full beard, hair in a short topknot; broad shoulders, solid stance. Outfit: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals. Decoration: stacked-mountain and stone-grain patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a long broad single-edged saber (dao) held in the right hand, blade angled down and outward away from the legs. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Doãn Nham · ☯️ Pháp sư · nam

- File: `doanNham-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Doãn Nham, a mystic sorcerer of the earth (rock) element, a fictional man of 10th-century Vietnam. Look: a solemn man in his forties, deep-set eyes, long beard, hair in a topknot with an ochre cloth; tall flowing silhouette. Outfit: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals. Decoration: stacked-mountain and stone-grain patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a short ritual staff of dark wood and bronze topped with a small earth-element orb, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Lê Thạch · 🍙 Binh lính · nam ★

- File: `leThach-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Lê Thạch, a guardian soldier of the earth (rock) element, a fictional man of 10th-century Vietnam. Look: a steady, stocky young man, square jaw, wearing a conical palm-leaf hat (non la); stocky, grounded stance. Outfit: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals. Decoration: stacked-mountain and stone-grain patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Bế Liên · ❤️ Y sư · nữ

- File: `beLien-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Bế Liên, a herbalist healer of the earth (rock) element, a fictional woman of 10th-century Vietnam. Look: a sturdy, warm-faced woman in her thirties from the highlands, hair wrapped in an indigo-and-ochre head cloth, silver neck ring; gentle, slender silhouette. Outfit: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals. Decoration: stacked-mountain and stone-grain patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bronze-capped medicine gourd hanging from a cord, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Mã Nhạc · 💰 Mưu sĩ · nam

- File: `maNhac-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Mã Nhạc, a cunning strategist of the earth (rock) element, a fictional man of 10th-century Vietnam. Look: a cautious middle-aged man, heavy eyebrows, short mustache, brown scholar's head wrap; lean, upright silhouette. Outfit: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals. Decoration: stacked-mountain and stone-grain patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a white feather fan held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Tạ Thạch · 📖 Quân sư · nam

- File: `taThach-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Tạ Thạch, an army tactician of the earth (rock) element, a fictional man of 10th-century Vietnam. Look: an old but sturdy man in his fifties, white-streaked beard, topknot with a stone bead pin; composed, commanding silhouette. Outfit: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals. Decoration: stacked-mountain and stone-grain patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### ⚡ Lôi

#### Tống Tấn · ⚔️ Tướng sĩ · nam

- File: `tongTan-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Tống Tấn, a vanguard warrior of the thunder (lightning) element, a fictional man of 10th-century Vietnam. Look: a quick, lean man in his late twenties, piercing eyes, spiky short beard, hair tied high with a purple band; broad shoulders, solid stance. Outfit: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals. Decoration: zigzag lightning patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a straight double-edged bronze sword held in the right hand, angled down and outward away from the legs. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Vũ Lôi · ☯️ Pháp sư · nam

- File: `vuLoi-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Vũ Lôi, a mystic sorcerer of the thunder (lightning) element, a fictional man of 10th-century Vietnam. Look: an intense man around thirty, wild loose hair half tied, strong brow, thin beard; tall flowing silhouette. Outfit: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals. Decoration: zigzag lightning patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a short ritual staff of dark wood and bronze topped with a small thunder-element orb, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Ông Chấn · 🍙 Binh lính · nam

- File: `ongChan-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Ông Chấn, a guardian soldier of the thunder (lightning) element, a fictional man of 10th-century Vietnam. Look: a thick-set veteran in his forties, broken nose, short gray beard, purple head wrap; stocky, grounded stance. Outfit: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals. Decoration: zigzag lightning patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Tiêu Minh · ❤️ Y sư · nữ

- File: `tieuMinh-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Tiêu Minh, a herbalist healer of the thunder (lightning) element, a fictional woman of 10th-century Vietnam. Look: a bright, quick-eyed young woman around twenty, short hair to the jaw with a purple headband; gentle, slender silhouette. Outfit: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals. Decoration: zigzag lightning patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bronze-capped medicine gourd hanging from a cord, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Từ Kinh · 💰 Mưu sĩ · nam

- File: `tuKinh-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Từ Kinh, a cunning strategist of the thunder (lightning) element, a fictional man of 10th-century Vietnam. Look: a pale, sharp-featured man in his thirties, narrow eyes, neat mustache, dark scholar's cap; lean, upright silhouette. Outfit: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals. Decoration: zigzag lightning patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a white feather fan held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Mạc Vân · 📖 Quân sư · nữ

- File: `macVan-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Mạc Vân, an army tactician of the thunder (lightning) element, a fictional woman of 10th-century Vietnam. Look: a cool, composed woman in her thirties, long straight hair tied low, a purple cord across her brow; composed, commanding silhouette. Outfit: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals. Decoration: zigzag lightning patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid chroma green (#00b140), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

### 🌪️ Phong

#### Hứa Lăng · ⚔️ Tướng sĩ · nữ

- File: `huaLang-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Hứa Lăng, a vanguard warrior of the wind (storm) element, a fictional woman of 10th-century Vietnam. Look: an agile woman warrior in her mid-twenties, determined eyes, high ponytail tied with a long teal ribbon; broad shoulders, solid stance. Outfit: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals. Decoration: rolling cloud scrolls and Lac bird tail-feather patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a straight double-edged bronze sword held in the right hand, angled down and outward away from the legs. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Liễu Yên · ☯️ Pháp sư · nữ

- File: `lieuYen-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Liễu Yên, a mystic sorcerer of the wind (storm) element, a fictional woman of 10th-century Vietnam. Look: a delicate young woman around twenty, long hair loose with light strands, thin teal hair ribbons; tall flowing silhouette. Outfit: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals. Decoration: rolling cloud scrolls and Lac bird tail-feather patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a short ritual staff of dark wood and bronze topped with a small wind-element orb, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Mạnh Tường · 🍙 Binh lính · nam

- File: `manhTuong-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Mạnh Tường, a guardian soldier of the wind (storm) element, a fictional man of 10th-century Vietnam. Look: a tall, wiry young man, alert eyes, teal head wrap with trailing ends; stocky, grounded stance. Outfit: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals. Decoration: rolling cloud scrolls and Lac bird tail-feather patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Bạch Sương · ❤️ Y sư · nữ

- File: `bachSuong-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Bạch Sương, a herbalist healer of the wind (storm) element, a fictional woman of 10th-century Vietnam. Look: a pale, gentle woman in her mid-twenties, light gray-streaked hair in a loose bun, soft smile; gentle, slender silhouette. Outfit: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals. Decoration: rolling cloud scrolls and Lac bird tail-feather patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bronze-capped medicine gourd hanging from a cord, held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Bùi Phiêu · 💰 Mưu sĩ · nam

- File: `buiPhieu-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Bùi Phiêu, a cunning strategist of the wind (storm) element, a fictional man of 10th-century Vietnam. Look: a carefree-looking man in his late twenties, messy hair under a loose cloth head wrap, faint smirk; lean, upright silhouette. Outfit: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals. Decoration: rolling cloud scrolls and Lac bird tail-feather patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a white feather fan held out to the side in the right hand. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

#### Phùng Phong · 📖 Quân sư · nam ★

- File: `phungPhong-toanThan.png`

```text
Full-body character art for a 2D game, to be cut into layers for animation. Character: Phùng Phong, an army tactician of the wind (storm) element, a fictional man of 10th-century Vietnam. Look: a calm man in his forties, long thin beard, hair wrapped in a teal cloth; composed, commanding silhouette. Outfit: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals. Decoration: rolling cloud scrolls and Lac bird tail-feather patterns in Dong Son bronze-drum style, sparingly on trims and belt. Holding: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body. Pose: full body head to feet, three-quarter view turned to the viewer's right, relaxed A-pose, arms held slightly away from the torso with a clear gap between arm and body, upper arm, elbow and forearm clearly visible, legs slightly apart, feet flat, empty margin around the figure. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, natural adult proportions and eye size, grounded in 10th-century Vietnam. The held item has crisp edges, fully visible, not overlapping the face or torso; no glow, sparks, particles or magic effects anywhere. One character only. Background: flat solid magenta (#ff00ff), completely uniform. No text, watermark, frame, scenery, floor shadow or gradient. Avoid dragon-head shoulder guards, dragon or phoenix emblems, multi-tiered Chinese crowns, samurai armor, Qing hairstyles.
```

## 8. Chân dung bán thân

Thẻ nhân vật cần thêm chân dung 1024×1024 ([Hình ảnh mục 2.4](13-hinh-anh.md#24-danh-sách-hình)). Cách nhanh nhất: lấy prompt toàn thân của nhân vật, **thay câu đầu tiên và cả đoạn `Pose:`** bằng đoạn dưới, bỏ câu `Holding:` nếu đồ cầm tay không lọt khung. Đặt tên `<mã>-chanDung.png`.

```text
Bust portrait character art for a 2D game card.
Camera: three-quarter view, chest up, head about 45% of the image height, centered, head and shoulders inside the
central 84% of a square canvas, must stay readable when shrunk to 48 px.
```

## 9. Khi Copilot ra sai

| Hiện tượng | Cách sửa |
|---|---|
| Vẫn ra giáp vai đầu rồng, hoa văn rồng | Thêm lên đầu prompt: `Plain rounded bronze shoulder plates with simple sawtooth bands.` |
| Tay áp sát người, ống tay che bắp tay | Thêm: `Arms angled about 25 degrees away from the body. Short or tied-up sleeves.` |
| Vũ khí có lửa, sét, khói bám quanh | Thêm: `Plain weapon, no effects.` Hiệu ứng sẽ làm bằng code |
| Nền có vệt sáng, sàn, bóng đổ | Thêm vào cuối: `Pure flat background color only.` Nếu màu nền lem lên nhân vật, đổi sang nền còn lại (xanh lá ↔ hồng tươi) hoặc xám trơn `#808080` cho hệ không có xám bạc |
| Cắt mất chân hoặc đỉnh đầu | Thêm: `Entire figure visible, generous space above the head and below the feet.` |
| Mặt kiểu anime mắt to, trẻ con | Thêm: `Mature face, realistic eye size.` |
| Ra chữ Hán hoặc chữ lạ trên áo, cờ | Thêm: `Blank fabric, no writing.` Cờ thời Đinh nếu cần chữ thì chỉ dùng 丁 hoặc 大瞿越, ghép bằng code |

Nguyên tắc clean-room vẫn áp dụng: không ghi tên họa sĩ, tên game hay ảnh mẫu của game khác vào prompt, và kiểm tra điều khoản dùng thương mại của Copilot trước khi phát hành.

