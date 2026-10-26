# Bộ prompt đồ họa game Cờ Lau

> Cập nhật: 20/10/2026
>
> Phần tiếp theo của [Prompt nhân vật](nhan-vat.md): prompt ráp sẵn cho **mọi thứ ngoài nhân vật**: trang bị, ô bàn cờ, nền trận, mẫu giao diện, tranh lớn, linh vật và hạt hiệu ứng. Danh sách lấy từ code (`src/core/gear`, `src/core/board`, `src/core/campaign`), quy tắc theo [Hình ảnh](../art-bible.md) và [Kế hoạch đồ họa](../ke-hoach-do-hoa.md). Giải thích bằng tiếng Việt, prompt bằng tiếng Anh.

## 1. Cách dùng

- Mỗi khối là một hình, dán nguyên vào Copilot. Hình nào cần trong suốt thì tạo trên nền trơn **xanh lá `#00b140`** hoặc **hồng tươi `#ff00ff`** (chọn màu không có trên vật), rồi xóa nền bằng Photopea theo bước 1 của hướng dẫn tách lớp (`/mnt/project-files/guides/tach-lop-photopea.md`).
- Gửi Claude file PNG gốc, đặt tên theo cột tên file. Claude xử lý tiếp: xóa nền nếu còn sót, đổi màu nguyên tố, xuất WebP, gom atlas và nạp theo phân cảnh ([Kế hoạch đồ họa mục 6](../ke-hoach-do-hoa.md)).
- Hoạt ảnh và hiệu ứng làm bằng code PixiJS, không dùng Spine hay DragonBones. Vì vậy hình **không cần** khe gắn (slot) hay xương, chỉ cần sạch và tách được.

Thứ tự gợi ý (theo giá trị thấy ngay trong trận): nền chung + nền Hoa Lư → 21 ô bàn cờ → 14 món bộ Cờ Lau → các nền màn còn lại → hai bộ trang bị kia → phần tùy chọn.

| Nhóm | Số hình | Ai dùng hình thế nào |
|---|---|---|
| Trang bị | 42 (14 × 3 bộ) | Thay biểu tượng SVG trong `gear.tsx`; khung phẩm vẫn do code vẽ |
| Ô bàn cờ | 21 (7 × 3 bản) | Thay hình vẽ trong ô; nền màu, khung, vòng tia vẫn do code |
| Nền trận | 54 (18 nơi × 3 lớp) | Lớp parallax sau màn trận |
| Mẫu giao diện | 5 | **Chỉ để tham khảo**: Claude vẽ lại bằng SVG/CSS cho nhẹ và co giãn được |
| Tranh lớn | 4 | Landing, menu, bản đồ chiến dịch |
| Linh vật (tùy chọn) | 7 | Cận cảnh tuyệt chiêu; chờ Shan duyệt bảng linh vật |
| Hạt hiệu ứng | 7 | Atlas hạt cho hiệu ứng code |

## 2. Những gì đã sửa so với bản Shan gửi

| Bản gửi | Bản này | Lý do |
|---|---|---|
| Ô nguyên tố (Hỏa, Thủy...) thành ngọc 3D có lõi chuyển động bằng sprite sheet | Bàn cờ giữ **7 loại ô** Kiếm, Âm dương, Bánh chưng, Tim, Thỏi vàng, Sách, Trống trận, mỗi loại 3 bản; vật vẽ phẳng, giữ dáng | Code không có ô nguyên tố (`TILE_KINDS`, và luật "không gắn nguyên tố vào ô" ở Bàn cờ). Kế hoạch đồ họa chốt ô giữ hình, vẽ đẹp hơn được nhưng không đổi hình; 96 ô động cùng lúc nặng cho điện thoại |
| Ô Tim thành ngọc bội sen | Tim vẫn là trái tim, bản yếu bạc, bản mạnh vàng | Ngọc bội đã là một ô trang bị, dùng lại sẽ dễ nhầm |
| Thay đồ bằng slot trên xương DragonBones, mũ/áo/găng/giày hiện trên người | Trang bị là **biểu tượng** trong giao diện, không vẽ lên người | Không dùng DragonBones; mỗi món phải khớp với 61 dáng người là quá nhiều việc. Có thể thêm vũ khí hiện trên tay về sau (một lớp `weapon` đã tách sẵn) |
| Kích thước trang bị 80–250 px khác nhau | Mọi icon 1024×1024 khi tạo, game xuất 96 và 192 px | Theo quy cách Hình ảnh mục 2.6; thu nhỏ đều nhau thì thẳng hàng |
| Không nói tới nguyên tố và bộ trang bị | 3 bộ (Cờ Lau, Hoa Lư, Đồng Cổ) mỗi bộ một chủ đề; nguyên tố đổi màu bằng code qua một chi tiết tô hồng | Khớp `GEAR_SETS`; tránh tạo 7 lần cho 7 hệ |
| Khung bàn cờ gỗ mun, mây cụm thời Lê–Trần | Khung **sơn mài đỏ son, viền đồng răng cưa trống đồng**, góc là mặt trống nhỏ | Theo Kế hoạch đồ họa mục 8.1; họa tiết Lê–Trần muộn hơn thế kỷ X |
| Thanh máu/năng lượng neon phát sáng | Thanh máu dạng cuộn giấy, Nộ dạng ngọn cờ lau, màu phẳng | Theo mục 8.1 và phong cách nét mực màu phẳng; Claude dựng bằng SVG/CSS, prompt chỉ làm mẫu |
| Nền cánh đồng cờ lau hoàng hôn | Giữ, làm **nền chung**; thêm nền riêng cho 13 màn và 4 chế độ | Mỗi màn một vùng đất (`CampaignStage.region`) |
| Mục rã khối Photopea cho Spine/DragonBones, mục nén | Không lặp lại | Quy trình nhân vật đã chốt ở Prompt nhân vật; nén, atlas, tải theo phân cảnh đã có ở Kế hoạch đồ họa mục 6 |

## 3. Ba khối phong cách

Prompt bên dưới đã ráp sẵn một trong ba khối này, không cần dán thêm.

- **Icon** (trang bị, ô cờ): nét nâu đậm, tô 1–2 tông, dáng to đọc được ở 48 px, một vật, lề 8%, không chữ, không khung, không phát sáng.
- **Nền trận**: tranh vẽ 16:9, màu trầm hơi nhạt, tương phản thấp, giữa khung yên vì bàn cờ che, hai góc dưới là đất trống cho nhân vật đứng, không người, không chữ.
- **Tranh lớn** (landing, menu): chi tiết như hình mẫu Đinh Bộ Lĩnh, vẫn một chủ thể mỗi hình để làm lớp parallax.


## 4. Trang bị

Khớp `GEAR_SLOTS` trong `src/core/gear/gear.ts`: 8 ô dùng chung + vũ khí riêng 6 nghề = **14 hình mỗi bộ**, 3 bộ (Cờ Lau, Hoa Lư, Đồng Cổ) = 42 hình. Mỗi món có đúng một chi tiết tô **hồng tươi phẳng** để game đổi sang màu nguyên tố bằng code, nên không phải tạo 7 bản theo hệ. Khung phẩm (Trắng, Lục, Lam, Tím, Cam) do code vẽ, không đưa vào hình.

- Kích thước gốc 1024×1024 (Copilot), game xuất 96 và 192 px. Đặt tên `<bộ>-<ô>.png`, ví dụ `coLau-dinhMao.png`, `hoaLu-vuKhi-tuongSi.png`.
- Nếu Copilot tô bóng lên phần hồng làm nó loang ra nhiều sắc, giữ hình và báo Claude; tách vùng nhấn bằng tay trong Photopea cũng được.

| Ô | Chỉ số | Ghi chú hình |
|---|---|---|
| Đính mão (`dinhMao`) | Máu | a 10th-century Vietnamese warrior helmet |
| Y phục (`yPhuc`) | Thủ | a folded cross-collar (giao linh) battle robe with a lamellar chest piece, laid flat and seen from the front, wide belt |
| Hộ thủ (`hoThu`) | Công | a pair of leather forearm guards with bronze studs and lacing, shown side by side |
| Bảo ngoa (`baoNgoa`) | Thủ | a pair of high leather boots with slightly upturned toes and cloth leg wraps, shown side by side |
| Giới chỉ (`gioiChi`) | Công | a bronze ring with a large cabochon gemstone, seen at a slight angle |
| Hạng liên (`hangLien`) | Máu | a necklace of round wooden and bronze beads with a bronze pendant shaped like a flying Lac bird |
| Hộ phù (`hoPhu`) | Thủ | a paper talisman strip with a red square seal stamp (no readable writing) and a hanging tassel |
| Ngọc bội (`ngocBoi`) | Máu | a round flat jade disc with a hole in the center, hanging from a braided cord with a knot and tassel |
| Vũ khí Tướng sĩ | Công | a long broad single-edged curved saber (dao) with a bronze guard and a cloth-wrapped grip |
| Vũ khí Pháp sư | Công | a ritual staff of dark wood with a bronze ring at the top holding a round orb |
| Vũ khí Binh lính | Công | a long spear with a leaf-shaped bronze head and a red horsehair tassel |
| Vũ khí Y sư | Công | a medicine gourd with a bronze cap and stopper |
| Vũ khí Mưu sĩ | Công | a folding fan of bamboo ribs and paper |
| Vũ khí Quân sư | Công | a small triangular command flag on a short pole standing beside a bundle of bamboo slips tied with cord |

### 4.1 Bộ Cờ Lau

**Đính mão** · `coLau-dinhMao.png`

```text
Game icon: a 10th-century Vietnamese warrior helmet: rounded bronze-and-leather cap with a short spike on top, cheek flaps and a cloth tassel at the back. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Y phục** · `coLau-yPhuc.png`

```text
Game icon: a folded cross-collar (giao linh) battle robe with a lamellar chest piece, laid flat and seen from the front, wide belt. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Hộ thủ** · `coLau-hoThu.png`

```text
Game icon: a pair of leather forearm guards with bronze studs and lacing, shown side by side. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bảo ngoa** · `coLau-baoNgoa.png`

```text
Game icon: a pair of high leather boots with slightly upturned toes and cloth leg wraps, shown side by side. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Giới chỉ** · `coLau-gioiChi.png`

```text
Game icon: a bronze ring with a large cabochon gemstone, seen at a slight angle. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Hạng liên** · `coLau-hangLien.png`

```text
Game icon: a necklace of round wooden and bronze beads with a bronze pendant shaped like a flying Lac bird. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Hộ phù** · `coLau-hoPhu.png`

```text
Game icon: a paper talisman strip with a red square seal stamp (no readable writing) and a hanging tassel. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Ngọc bội** · `coLau-ngocBoi.png`

```text
Game icon: a round flat jade disc with a hole in the center, hanging from a braided cord with a knot and tassel. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Tướng sĩ** · `coLau-vuKhi-tuongSi.png`

```text
Game icon: a long broad single-edged curved saber (dao) with a bronze guard and a cloth-wrapped grip, diagonal. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Pháp sư** · `coLau-vuKhi-phapSu.png`

```text
Game icon: a ritual staff of dark wood with a bronze ring at the top holding a round orb, diagonal. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Binh lính** · `coLau-vuKhi-binhLinh.png`

```text
Game icon: a long spear with a leaf-shaped bronze head and a red horsehair tassel, crossed in front of a round woven rattan shield. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Y sư** · `coLau-vuKhi-ySu.png`

```text
Game icon: a medicine gourd with a bronze cap and stopper, tied with a cord and a small herb bundle. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Mưu sĩ** · `coLau-vuKhi-muuSi.png`

```text
Game icon: a folding fan of bamboo ribs and paper, half open, with a small tassel. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Quân sư** · `coLau-vuKhi-quanSu.png`

```text
Game icon: a small triangular command flag on a short pole standing beside a bundle of bamboo slips tied with cord. Set theme: white reed flowers and reed-stem patterns, simple rustic materials (wood, leather, cloth) with bronze fittings. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

### 4.2 Bộ Hoa Lư

**Đính mão** · `hoaLu-dinhMao.png`

```text
Game icon: a 10th-century Vietnamese warrior helmet: rounded bronze-and-leather cap with a short spike on top, cheek flaps and a cloth tassel at the back. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Y phục** · `hoaLu-yPhuc.png`

```text
Game icon: a folded cross-collar (giao linh) battle robe with a lamellar chest piece, laid flat and seen from the front, wide belt. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Hộ thủ** · `hoaLu-hoThu.png`

```text
Game icon: a pair of leather forearm guards with bronze studs and lacing, shown side by side. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bảo ngoa** · `hoaLu-baoNgoa.png`

```text
Game icon: a pair of high leather boots with slightly upturned toes and cloth leg wraps, shown side by side. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Giới chỉ** · `hoaLu-gioiChi.png`

```text
Game icon: a bronze ring with a large cabochon gemstone, seen at a slight angle. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Hạng liên** · `hoaLu-hangLien.png`

```text
Game icon: a necklace of round wooden and bronze beads with a bronze pendant shaped like a flying Lac bird. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Hộ phù** · `hoaLu-hoPhu.png`

```text
Game icon: a paper talisman strip with a red square seal stamp (no readable writing) and a hanging tassel. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Ngọc bội** · `hoaLu-ngocBoi.png`

```text
Game icon: a round flat jade disc with a hole in the center, hanging from a braided cord with a knot and tassel. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Tướng sĩ** · `hoaLu-vuKhi-tuongSi.png`

```text
Game icon: a long broad single-edged curved saber (dao) with a bronze guard and a cloth-wrapped grip, diagonal. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Pháp sư** · `hoaLu-vuKhi-phapSu.png`

```text
Game icon: a ritual staff of dark wood with a bronze ring at the top holding a round orb, diagonal. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Binh lính** · `hoaLu-vuKhi-binhLinh.png`

```text
Game icon: a long spear with a leaf-shaped bronze head and a red horsehair tassel, crossed in front of a round woven rattan shield. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Y sư** · `hoaLu-vuKhi-ySu.png`

```text
Game icon: a medicine gourd with a bronze cap and stopper, tied with a cord and a small herb bundle. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Mưu sĩ** · `hoaLu-vuKhi-muuSi.png`

```text
Game icon: a folding fan of bamboo ribs and paper, half open, with a small tassel. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Quân sư** · `hoaLu-vuKhi-quanSu.png`

```text
Game icon: a small triangular command flag on a short pole standing beside a bundle of bamboo slips tied with cord. Set theme: dark red lacquer and limestone-gray stone details, patterns of stacked karst mountains, sturdy and royal. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

### 4.3 Bộ Đồng Cổ

**Đính mão** · `dongCo-dinhMao.png`

```text
Game icon: a 10th-century Vietnamese warrior helmet: rounded bronze-and-leather cap with a short spike on top, cheek flaps and a cloth tassel at the back. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Y phục** · `dongCo-yPhuc.png`

```text
Game icon: a folded cross-collar (giao linh) battle robe with a lamellar chest piece, laid flat and seen from the front, wide belt. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Hộ thủ** · `dongCo-hoThu.png`

```text
Game icon: a pair of leather forearm guards with bronze studs and lacing, shown side by side. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bảo ngoa** · `dongCo-baoNgoa.png`

```text
Game icon: a pair of high leather boots with slightly upturned toes and cloth leg wraps, shown side by side. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Giới chỉ** · `dongCo-gioiChi.png`

```text
Game icon: a bronze ring with a large cabochon gemstone, seen at a slight angle. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Hạng liên** · `dongCo-hangLien.png`

```text
Game icon: a necklace of round wooden and bronze beads with a bronze pendant shaped like a flying Lac bird. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Hộ phù** · `dongCo-hoPhu.png`

```text
Game icon: a paper talisman strip with a red square seal stamp (no readable writing) and a hanging tassel. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Ngọc bội** · `dongCo-ngocBoi.png`

```text
Game icon: a round flat jade disc with a hole in the center, hanging from a braided cord with a knot and tassel. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Tướng sĩ** · `dongCo-vuKhi-tuongSi.png`

```text
Game icon: a long broad single-edged curved saber (dao) with a bronze guard and a cloth-wrapped grip, diagonal. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Pháp sư** · `dongCo-vuKhi-phapSu.png`

```text
Game icon: a ritual staff of dark wood with a bronze ring at the top holding a round orb, diagonal. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Binh lính** · `dongCo-vuKhi-binhLinh.png`

```text
Game icon: a long spear with a leaf-shaped bronze head and a red horsehair tassel, crossed in front of a round woven rattan shield. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Y sư** · `dongCo-vuKhi-ySu.png`

```text
Game icon: a medicine gourd with a bronze cap and stopper, tied with a cord and a small herb bundle. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Mưu sĩ** · `dongCo-vuKhi-muuSi.png`

```text
Game icon: a folding fan of bamboo ribs and paper, half open, with a small tassel. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Vũ khí Quân sư** · `dongCo-vuKhi-quanSu.png`

```text
Game icon: a small triangular command flag on a short pole standing beside a bundle of bamboo slips tied with cord. Set theme: aged bronze with green patina, dong son sun-star and concentric-circle engravings, ancient and heavy. Element accent: exactly one small inlaid part (gem, cord or trim) painted in flat pure magenta (#ff00ff) with no shading, so the game can recolor it to the element color; everything else in neutral bronze, wood, leather and cloth tones. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

## 5. Ô bàn cờ

Khớp `TILE_KINDS` trong `src/core/board/tiles.ts` và bảng ô đặc biệt ở [Bàn cờ](../../01-gameplay/ban-co.md): 7 loại × 3 bản (thường, bản yếu từ chữ L/T, bản mạnh từ thẳng 5) = 21 hình. Bàn cờ **không có ô nguyên tố**; hình mỗi ô phải giữ dáng hiện tại vì người chơi nhận ô bằng hình chứ không chỉ bằng màu. Nền màu của ô, khung đồng đinh tán (bản yếu) và vòng tia mặt trời (bản mạnh) vẫn do code vẽ.

- Ô hiển thị 40–64 px nên hình cần mảng to, nét đậm, ít chi tiết nhỏ. Ô Bánh chưng nền hồng tươi vì lá dong màu xanh lá.
- Đặt tên `tile-<mã>.png`, `tile-<mã>-yeu.png`, `tile-<mã>-manh.png`.

### Kiếm (`kiem`, nền ô `#c0392b`)

**Thường** · `tile-kiem.png`

```text
Game icon: a short straight sword pointing to the upper right at 45 degrees, pale steel blade, gold crossguard, brown grip, gold pommel. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bản yếu: Kiếm đồng** · `tile-kiem-yeu.png`

```text
Game icon: the same sword made of bronze with engraved bands, a little heavier. Plain version for reference: a short straight sword pointing to the upper right at 45 degrees, pale steel blade, gold crossguard, brown grip, gold pommel. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bản mạnh: Kiếm lửa** · `tile-kiem-manh.png`

```text
Game icon: the same sword with the blade wreathed in a tight stylized flame shape that follows the blade outline (painted shape, not a glow). Plain version for reference: a short straight sword pointing to the upper right at 45 degrees, pale steel blade, gold crossguard, brown grip, gold pommel. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

### Âm dương (`amDuong`, nền ô `#5b4a9e`)

**Thường** · `tile-amDuong.png`

```text
Game icon: a round yin-yang disc in ink-black and paper-white with a thick dark outline. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bản yếu: Bùa âm dương** · `tile-amDuong-yeu.png`

```text
Game icon: the yin-yang disc on a small paper talisman with a red seal and a tassel. Plain version for reference: a round yin-yang disc in ink-black and paper-white with a thick dark outline. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bản mạnh: Âm dương thái cực** · `tile-amDuong-manh.png`

```text
Game icon: the yin-yang disc set in a bronze ring with eight short trigram bars around it. Plain version for reference: a round yin-yang disc in ink-black and paper-white with a thick dark outline. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

### Bánh chưng (`banhChung`, nền ô `#a7cf74`)

**Thường** · `tile-banhChung.png`

```text
Game icon: a square banh chung rice cake wrapped in dark green dong leaves, tied with four pale bamboo strings in a grid, seen from above. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid magenta (#ff00ff), completely uniform.
```

**Bản yếu: Giỏ bánh** · `tile-banhChung-yeu.png`

```text
Game icon: two or three small banh chung in a woven bamboo basket. Plain version for reference: a square banh chung rice cake wrapped in dark green dong leaves, tied with four pale bamboo strings in a grid, seen from above. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid magenta (#ff00ff), completely uniform.
```

**Bản mạnh: Mâm cỗ** · `tile-banhChung-manh.png`

```text
Game icon: a round lacquered feast tray holding a banh chung, fruit and a small bowl. Plain version for reference: a square banh chung rice cake wrapped in dark green dong leaves, tied with four pale bamboo strings in a grid, seen from above. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid magenta (#ff00ff), completely uniform.
```

### Tim (`tim`, nền ô `#f3b3c3`)

**Thường** · `tile-tim.png`

```text
Game icon: a plump red heart with a small white highlight at the upper left, dark outline. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bản yếu: Tim bạc** · `tile-tim-yeu.png`

```text
Game icon: the heart in polished silver with a small red gem in the middle. Plain version for reference: a plump red heart with a small white highlight at the upper left, dark outline. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bản mạnh: Tim vàng** · `tile-tim-manh.png`

```text
Game icon: the heart in gold with a small lotus engraving. Plain version for reference: a plump red heart with a small white highlight at the upper left, dark outline. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

### Thỏi vàng (`vang`, nền ô `#5e3b1f`)

**Thường** · `tile-vang.png`

```text
Game icon: a boat-shaped gold ingot with a raised rounded center, bright yellow gold. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bản yếu: Túi vàng** · `tile-vang-yeu.png`

```text
Game icon: a small cloth pouch tied at the neck with gold ingots peeking out. Plain version for reference: a boat-shaped gold ingot with a raised rounded center, bright yellow gold. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bản mạnh: Rương vàng** · `tile-vang-manh.png`

```text
Game icon: a small open wooden chest with bronze corners full of gold ingots. Plain version for reference: a boat-shaped gold ingot with a raised rounded center, bright yellow gold. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

### Sách (`sach`, nền ô `#2f5f9f`)

**Thường** · `tile-sach.png`

```text
Game icon: a thick stitched book with a red-brown cover, visible binding stitches on the left and a blank paper label on the cover. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bản yếu: Thẻ tre** · `tile-sach-yeu.png`

```text
Game icon: a bundle of bamboo slips tied with cord, partly unrolled. Plain version for reference: a thick stitched book with a red-brown cover, visible binding stitches on the left and a blank paper label on the cover. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bản mạnh: Binh thư** · `tile-sach-manh.png`

```text
Game icon: a large war manual: a rolled bamboo-slip scroll with a bronze end cap and a red seal ribbon. Plain version for reference: a thick stitched book with a red-brown cover, visible binding stitches on the left and a blank paper label on the cover. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

### Trống trận (`trong`, nền ô `#1f7a6d`)

**Thường** · `tile-trong.png`

```text
Game icon: a bronze drum face seen from above: round, golden bronze, concentric rings and a ten-pointed star in the center. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bản yếu: Trống da** · `tile-trong-yeu.png`

```text
Game icon: a small wooden war drum with a leather head and lacing, seen at a slight angle. Plain version for reference: a bronze drum face seen from above: round, golden bronze, concentric rings and a ten-pointed star in the center. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bản mạnh: Trống đồng** · `tile-trong-manh.png`

```text
Game icon: a large Dong Son bronze drum seen at a slight angle, sun-star on top and a band of flying birds on the side. Plain version for reference: a bronze drum face seen from above: round, golden bronze, concentric rings and a ten-pointed star in the center. Object only, without any tile background or plate (the game draws the colored square behind it); front view, fills about 80% of a square canvas. Keep the same overall silhouette as the plain version so players still recognise it. Style: 2D game icon, semi-realistic hand-painted look with clean bold dark-brown outlines, cel shading with one or two tones, strong simple silhouette that stays readable at 48 px, grounded in 10th-century Vietnam with Dong Son bronze-drum motifs used sparingly. One object only, centered, about 8% empty margin on every side. No text, no letters, no frame, no border, no ground shadow, no glow, no sparkles, no particles. Background: flat solid chroma green (#00b140), completely uniform.
```

## 6. Nền trận

Mỗi nơi 3 lớp parallax (xa, giữa, gần) theo [Kế hoạch đồ họa mục 8.1](../ke-hoach-do-hoa.md#81-màn-trận): 13 màn chiến dịch (khớp id màn trong `src/core/campaign/campaign.ts`) + Leo tháp, Sinh tồn, Đấu trường, Thử thách ngày và nền chung (cánh đồng cờ lau hoàng hôn, ý của bản Shan gửi) = 18 nơi, 54 hình. Lớp giữa và gần dùng **nền hồng tươi** vì cảnh có nhiều cây xanh.

- Quy tắc đọc được: nền phải tối hoặc nhạt hơn bàn cờ rõ ràng, giữa khung yên tĩnh vì bàn cờ che. Không vẽ người, không chữ trên cờ.
- Lớp xa tạo trước; nếu 3 lớp lệch màu nhau, dán thêm câu `Same color palette and lighting as the far layer: <tả lại ánh sáng>.`
- Đặt tên `bg-<mã>-xa.png`, `bg-<mã>-giua.png`, `bg-<mã>-gan.png`.

### Cờ lau tập trận · Hoa Lư, Ninh Bình (`coLau`)

**Lớp xa** · `bg-coLau-xa.png`

```text
Layer: far background only, fully painted: tall limestone karst peaks, a winding river and a pale morning sky. Lighting: morning light. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-coLau-giua.png`

```text
Layer: middle distance only: rice paddies, a thatched stilt-house hamlet and a wide field of white reed flowers, as a horizontal band across the lower middle of the image. Lighting: morning light. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-coLau-gan.png`

```text
Layer: near foreground only: tall white reed flowers and a few wooden practice stakes, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: morning light. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Bố Hải Khẩu · Thái Bình (`boHai`)

**Lớp xa** · `bg-boHai-xa.png`

```text
Layer: far background only, fully painted: a wide river mouth opening to the sea, sandbars and a hazy horizon. Lighting: bright coastal noon. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-boHai-giua.png`

```text
Layer: middle distance only: dug-out canoes pulled onto a muddy bank, wooden stilt piers and fishing nets on poles, as a horizontal band across the lower middle of the image. Lighting: bright coastal noon. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-boHai-gan.png`

```text
Layer: near foreground only: mangrove roots, reeds and coiled ropes, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: bright coastal noon. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Đằng Châu · Hưng Yên (`dangChau`)

**Lớp xa** · `bg-dangChau-xa.png`

```text
Layer: far background only, fully painted: flat Red River plains, a broad brown river and soft clouds. Lighting: warm afternoon. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-dangChau-giua.png`

```text
Layer: middle distance only: a long earthen rampart with a wooden palisade and a gate tower, banana and longan trees, as a horizontal band across the lower middle of the image. Lighting: warm afternoon. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-dangChau-gan.png`

```text
Layer: near foreground only: a broken cart wheel, spears stuck in the ground, tall grass, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: warm afternoon. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Bình Kiều · Thanh Hóa (`binhKieu`)

**Lớp xa** · `bg-binhKieu-xa.png`

```text
Layer: far background only, fully painted: rolling green hills and low mountains. Lighting: overcast. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-binhKieu-giua.png`

```text
Layer: middle distance only: an old wooden bridge on posts over a calm river, a guard post at one end, as a horizontal band across the lower middle of the image. Lighting: overcast. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-binhKieu-gan.png`

```text
Layer: near foreground only: river stones, ferns and the end of a wooden railing, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: overcast. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Đường Lâm · Sơn Tây (`duongLam`)

**Lớp xa** · `bg-duongLam-xa.png`

```text
Layer: far background only, fully painted: a distant hill line and a sky with soft clouds. Lighting: golden late afternoon. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-duongLam-giua.png`

```text
Layer: middle distance only: an old village with red laterite stone walls, a gate house and a huge banyan tree, as a horizontal band across the lower middle of the image. Lighting: golden late afternoon. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-duongLam-gan.png`

```text
Layer: near foreground only: laterite bricks, a stone well edge and banyan roots, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: golden late afternoon. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Tam Đái · Vĩnh Phúc (`tamDai`)

**Lớp xa** · `bg-tamDai-xa.png`

```text
Layer: far background only, fully painted: three rivers meeting under a pale sky. Lighting: dusty daylight. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-tamDai-giua.png`

```text
Layer: middle distance only: a besieged fortress with thick earthen walls, wooden towers and banners without writing, as a horizontal band across the lower middle of the image. Lighting: dusty daylight. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-tamDai-gan.png`

```text
Layer: near foreground only: siege ladders, sharpened stakes and trampled mud, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: dusty daylight. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Phong Châu · Bạch Hạc, Phú Thọ (`phongChau`)

**Lớp xa** · `bg-phongChau-xa.png`

```text
Layer: far background only, fully painted: layered green hills fading into mist and a river confluence. Lighting: misty dawn. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-phongChau-giua.png`

```text
Layer: middle distance only: a hilltop shrine of wood and thatch, white cranes standing in shallow water, as a horizontal band across the lower middle of the image. Lighting: misty dawn. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-phongChau-gan.png`

```text
Layer: near foreground only: tea bushes, palm-leaf thatch and wet stones, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: misty dawn. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Đầm Hồi Hồ · Cẩm Khê, Phú Thọ (`hoiHo`)

**Lớp xa** · `bg-hoiHo-xa.png`

```text
Layer: far background only, fully painted: a vast marsh lake disappearing into fog. Lighting: grey misty morning. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-hoiHo-giua.png`

```text
Layer: middle distance only: lotus beds, floating reed islands and a narrow bamboo walkway, as a horizontal band across the lower middle of the image. Lighting: grey misty morning. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-hoiHo-gan.png`

```text
Layer: near foreground only: large lotus leaves, reeds and a moored dug-out canoe, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: grey misty morning. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Siêu Loại · Thuận Thành, Bắc Ninh (`sieuLoai`)

**Lớp xa** · `bg-sieuLoai-xa.png`

```text
Layer: far background only, fully painted: the wide Kinh Bac plain and a faraway river. Lighting: clear daylight. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-sieuLoai-giua.png`

```text
Layer: middle distance only: an old walled town of brick and earth with a simple brick stupa rising behind the wall, as a horizontal band across the lower middle of the image. Lighting: clear daylight. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-sieuLoai-gan.png`

```text
Layer: near foreground only: brick rubble, a stone lantern and grass, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: clear daylight. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Tiên Du · Bắc Ninh (`tienDu`)

**Lớp xa** · `bg-tienDu-xa.png`

```text
Layer: far background only, fully painted: a low rounded mountain with a small temple roof among trees. Lighting: soft late afternoon. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-tienDu-giua.png`

```text
Layer: middle distance only: terraced rice fields and a village bamboo hedge, as a horizontal band across the lower middle of the image. Lighting: soft late afternoon. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-tienDu-gan.png`

```text
Layer: near foreground only: bamboo stems, a field-edge path and a straw hat on a post, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: soft late afternoon. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Tế Giang · Văn Giang, Hưng Yên (`teGiang`)

**Lớp xa** · `bg-teGiang-xa.png`

```text
Layer: far background only, fully painted: a very wide river under heavy clouds. Lighting: stormy river light. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-teGiang-giua.png`

```text
Layer: middle distance only: wooden war boats with oars and cloth sails, a river bank with a camp, as a horizontal band across the lower middle of the image. Lighting: stormy river light. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-teGiang-gan.png`

```text
Layer: near foreground only: the prow of a boat, water splashes painted as shapes, wet planks, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: stormy river light. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Tây Phù Liệt · Thanh Trì, Hà Nội (`tayPhuLiet`)

**Lớp xa** · `bg-tayPhuLiet-xa.png`

```text
Layer: far background only, fully painted: a lowland horizon under an orange-red sky. Lighting: red sunset with smoke. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-tayPhuLiet-giua.png`

```text
Layer: middle distance only: earthen ramparts, a burning wooden watchtower and bamboo hedges, as a horizontal band across the lower middle of the image. Lighting: red sunset with smoke. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-tayPhuLiet-gan.png`

```text
Layer: near foreground only: scorched stakes, embers painted as small shapes, a fallen shield, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: red sunset with smoke. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Đỗ Động · Thanh Oai, Hà Nội (trùm) (`doDong`)

**Lớp xa** · `bg-doDong-xa.png`

```text
Layer: far background only, fully painted: black storm clouds with a few lightning shapes over a wetland. Lighting: dark thunderstorm. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-doDong-giua.png`

```text
Layer: middle distance only: a massive dark fortress of timber and earth with heavy gates on marshy ground, as a horizontal band across the lower middle of the image. Lighting: dark thunderstorm. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-doDong-gan.png`

```text
Layer: near foreground only: broken spears, dead reeds and puddles reflecting the sky, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: dark thunderstorm. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Leo tháp (`tower`)

**Lớp xa** · `bg-tower-xa.png`

```text
Layer: far background only, fully painted: high misty mountain peaks and the first stars. Lighting: twilight. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-tower-giua.png`

```text
Layer: middle distance only: a tall stone-and-timber watchtower built on a cliff, with a long stair cut into the rock, as a horizontal band across the lower middle of the image. Lighting: twilight. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-tower-gan.png`

```text
Layer: near foreground only: stone steps, a rope railing and wind-bent pine branches, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: twilight. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Sinh tồn (`survival`)

**Lớp xa** · `bg-survival-xa.png`

```text
Layer: far background only, fully painted: a dark sky with a red moon behind clouds. Lighting: night with torchlight. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-survival-giua.png`

```text
Layer: middle distance only: a ruined camp with burnt tents, wooden barricades and torches, as a horizontal band across the lower middle of the image. Lighting: night with torchlight. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-survival-gan.png`

```text
Layer: near foreground only: sandbag-like straw bundles, broken arrows and a torch on a pole, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: night with torchlight. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Đấu trường bóng ma (`arena`)

**Lớp xa** · `bg-arena-xa.png`

```text
Layer: far background only, fully painted: a moonlit sky over dark hills. Lighting: moonlit with pale blue mist. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-arena-giua.png`

```text
Layer: middle distance only: a round sandy training ground fenced by a bamboo palisade, paper lanterns glowing pale blue, as a horizontal band across the lower middle of the image. Lighting: moonlit with pale blue mist. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-arena-gan.png`

```text
Layer: near foreground only: wooden weapon racks, a lantern post and drifting mist shapes, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: moonlit with pale blue mist. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Thử thách ngày (`daily`)

**Lớp xa** · `bg-daily-xa.png`

```text
Layer: far background only, fully painted: a sunrise sky over rice fields. Lighting: sunrise. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-daily-giua.png`

```text
Layer: middle distance only: a temple courtyard with a large bronze drum on a wooden stand and old trees, as a horizontal band across the lower middle of the image. Lighting: sunrise. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-daily-gan.png`

```text
Layer: near foreground only: stone tiles, an incense stand and fallen leaves, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: sunrise. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

### Chơi thử / nền chung (`practice`)

**Lớp xa** · `bg-practice-xa.png`

```text
Layer: far background only, fully painted: a sunset sky with low hills. Lighting: sunset. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp giữa** · `bg-practice-giua.png`

```text
Layer: middle distance only: a wide misty field of white reed flowers glowing in the low sun, as a horizontal band across the lower middle of the image. Lighting: sunset. Everything above the band (the whole sky area) is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

**Lớp gần** · `bg-practice-gan.png`

```text
Layer: near foreground only: tall reed flowers framing both corners, framing the bottom-left and bottom-right corners and the bottom edge. Lighting: sunset. The rest of the image, including the whole center and top, is flat solid magenta (#ff00ff), completely uniform, to be removed. Style: painterly 2D game background, semi-realistic with soft anime-influenced lighting, muted slightly desaturated colors, low contrast, gentle atmospheric haze, 10th-century Vietnam, no modern objects. Format: 16:9 wide (1920x1080). The center of the frame stays calm and low in detail because the game board covers it; the lower-left and lower-right thirds are open flat ground where characters stand. No people, no animals in front, no text, no writing on banners, no frame.
```

## 7. Mẫu giao diện (tham khảo)

Khung bàn cờ, thẻ nhân vật, thanh chỉ số, nút và bảng thưởng sẽ được Claude **vẽ bằng SVG/CSS** ([Kế hoạch đồ họa mục 4.1](../ke-hoach-do-hoa.md#41-tổng-quan)) để nhẹ, sắc nét ở mọi cỡ màn hình và đổi màu theo nguyên tố được. Các prompt dưới đây tạo **bảng mẫu** để Shan chọn hướng; Claude vẽ lại theo mẫu được chọn, không dùng thẳng ảnh.

**Khung bàn cờ** · `ui-board-frame.png`

```text
Game UI design sheet: an ornate rectangular frame for a 12 by 8 match-3 board, landscape. Dark red lacquer frame with a bronze inner border engraved with Dong Son sawtooth bands, each of the four corners is a small round bronze drum face with a sun-star. The inside of the frame is empty dark lacquer. Front view, flat, symmetrical. Style: hand-painted 2D game UI, clean bold dark-brown outlines, cel shading with one or two tones, 10th-century Vietnamese bronze-drum motifs. No text, no icons inside. Background: flat solid chroma green (#00b140), completely uniform.
```

**Thẻ nhân vật trong trận** · `ui-character-card.png`

```text
Game UI design sheet: three variants side by side of a small vertical character card frame for a turn-based battle game: carved dark wood frame with a thin colored inner border (one green, one blue, one red), an empty round portrait window at the top, below it an empty horizontal health bar shaped like a half-unrolled paper scroll, and a small pennant shape for a rage meter. Front view, flat. Style: hand-painted 2D game UI, clean bold dark-brown outlines, flat colors with one shadow tone, 10th-century Vietnamese motifs. No text, no numbers, no characters inside. Background: flat solid chroma green (#00b140), completely uniform.
```

**Thanh chỉ số** · `ui-bars.png`

```text
Game UI design sheet: four horizontal bars stacked with space between them, each shown empty and full: a health bar like a paper scroll with wooden end rollers (red fill), an energy bar of linked yin-yang beads (indigo fill), a rage bar shaped like a white reed-flower banner on a pole (orange fill), a food bar of small rice-cake squares (green fill). Front view, flat, bold outlines, flat colors with one shadow tone, no neon, no glow. No text, no numbers. Background: flat solid magenta (#ff00ff), completely uniform.
```

**Nút và bảng** · `ui-buttons-panels.png`

```text
Game UI design sheet: a set of buttons and panels for a 10th-century Vietnamese themed game: a wide primary button in red lacquer with bronze edges, a secondary button in pale paper with ink border, a round icon button like a small bronze drum face, a large rectangular panel of warm paper texture with a bronze sawtooth border and cloud-scroll corners, a small tooltip box. Each element separated with empty space. Front view, flat, bold dark-brown outlines, flat colors with one shadow tone. No text, no icons. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bảng thắng / thua** · `ui-result.png`

```text
Game UI design sheet: two result banners side by side for a battle game: a victory banner as a long red cloth hanging from a wooden pole with white reed flowers and two small flying Lac birds; a defeat banner as a torn gray cloth with ink-wash smudges. Both have an empty space in the middle for a title. Front view, flat, bold dark-brown outlines, flat colors with one shadow tone. No text, no letters. Background: flat solid chroma green (#00b140), completely uniform.
```

## 8. Tranh lớn

Theo [Kế hoạch đồ họa mục 8.2](../ke-hoach-do-hoa.md#82-ngoài-trận) và quy tắc một chủ thể mỗi hình: tranh landing tách thành nền và nhân vật để làm parallax. Kích thước gốc lớn nhất Copilot cho, game xuất WebP/AVIF.

**Landing: nền đồi Hoa Lư** · `splash-landing-bg.png`

```text
Wide cinematic 2D game key art background, 16:9: the karst limestone hills of Hoa Lu at golden sunset, a winding river, rice paddies and a broad field of white reed flowers in the foreground, flying Lac birds as small silhouettes in the sky. The lower center is open for a hero figure to be placed later. Style: detailed semi-realistic anime-influenced splash art, warm vermilion, moss green and bronze gold palette, atmospheric depth. No people, no animals, no text, no frame.
```

**Landing: Đinh Bộ Lĩnh cưỡi trâu** · `splash-landing-hero.png`

```text
Full-body key art for a 2D game: the boy Dinh Bo Linh, about thirteen, sitting proudly on the back of a large water buffalo, holding up a tall reed stalk with a white reed-flower head as his battle flag, children's mock army spirit, low camera angle for a heroic look. Brown cross-collar tunic, rolled trousers, small topknot, barefoot. The whole buffalo and boy visible with margin, three-quarter view facing right. Style: detailed semi-realistic anime-influenced splash art, clean bold dark-brown line art, natural proportions. One subject only, no glow, no text. Background: flat solid magenta (#ff00ff), completely uniform.
```

**Nền menu** · `splash-menu-bg.png`

```text
Wide 2D game menu background, 16:9: the interior of a 10th-century Vietnamese war tent of wood and thatch at night, a low table with a bamboo-slip map, a bronze drum on a stand, white reed-flower banners leaning on the posts, warm oil-lamp light. The center is calm and dark enough for menu buttons on top. Style: painterly semi-realistic anime-influenced, muted warm palette, low contrast. No people, no text, no writing on the map or banners.
```

**Bản đồ chiến dịch** · `splash-campaign-map.png`

```text
Top-down hand-painted map for a 2D game, 16:9: the Red River delta of northern Vietnam drawn on aged yellowish do paper with diagonal fibers, dark-brown ink linework, rivers in indigo, the sea in moss green with carved wave patterns, small ink drawings of karst hills in the southwest, earthen forts and villages as tiny symbols scattered across the delta, edges darkening like old paper. Style: Vietnamese folk woodblock print look, flat colors. No text, no letters, no labels, no compass.
```


## 9. Linh vật nguyên tố (tùy chọn)

Theo bảng linh vật ở [Kế hoạch đồ họa mục 2.2](../ke-hoach-do-hoa.md#22-ngôn-ngữ-hình-ảnh-của-7-nguyên-tố), dùng trong cận cảnh tuyệt chiêu và hiệu ứng lớn. Bảng này **còn chờ Shan duyệt** (vẽ thành hình hay chỉ làm họa tiết), nên chỉ tạo khi đã chốt. Thủy dùng thuồng luồng thân rắn, không dùng rồng.

**Kim** · `mascot-kim.png`

```text
Creature art for a 2D game: a golden turtle with a bronze-drum pattern on its shell, calm and wise, standing. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, Dong Son bronze-drum motifs. Full body, whole creature visible with margin, one subject only, no glow, no particles, no text. Background: flat solid chroma green (#00b140), completely uniform.
```

**Mộc** · `mascot-moc.png`

```text
Creature art for a 2D game: a clump of golden-stemmed bamboo (tre dang nga) with a few leaves blowing, as a spirit plant. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, Dong Son bronze-drum motifs. Full body, whole creature visible with margin, one subject only, no glow, no particles, no text. Background: flat solid magenta (#ff00ff), completely uniform.
```

**Thủy** · `mascot-thuy.png`

```text
Creature art for a 2D game: a thuong luong water serpent: slender snake-like body with fins and a frilled head, coiling in an S shape, no legs, no antlers. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, Dong Son bronze-drum motifs. Full body, whole creature visible with margin, one subject only, no glow, no particles, no text. Background: flat solid chroma green (#00b140), completely uniform.
```

**Hỏa** · `mascot-hoa.png`

```text
Creature art for a 2D game: a fire Lac bird: long-beaked crested water bird in Dong Son style with feathers shaped like curling flames, wings spread. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, Dong Son bronze-drum motifs. Full body, whole creature visible with margin, one subject only, no glow, no particles, no text. Background: flat solid chroma green (#00b140), completely uniform.
```

**Thổ** · `mascot-tho.png`

```text
Creature art for a 2D game: a mountain spirit: a giant calm man made of layered stone and moss, arms folded, in a simple cross-collar garment. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, Dong Son bronze-drum motifs. Full body, whole creature visible with margin, one subject only, no glow, no particles, no text. Background: flat solid chroma green (#00b140), completely uniform.
```

**Lôi** · `mascot-loi.png`

```text
Creature art for a 2D game: a thunder spirit: a muscular figure with a small bronze drum and a hammer, zigzag lightning shapes around (painted shapes, not glow). Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, Dong Son bronze-drum motifs. Full body, whole creature visible with margin, one subject only, no glow, no particles, no text. Background: flat solid chroma green (#00b140), completely uniform.
```

**Phong** · `mascot-phong.png`

```text
Creature art for a 2D game: a Lac bird in flight with very long tail feathers trailing like ribbons of wind. Style: semi-realistic anime-influenced 2D game splash art, clean bold dark-brown line art, cel shading with one or two shadow tones, Dong Son bronze-drum motifs. Full body, whole creature visible with margin, one subject only, no glow, no particles, no text. Background: flat solid magenta (#ff00ff), completely uniform.
```

## 10. Hạt hiệu ứng

Hiệu ứng chiêu dựng bằng code PixiJS; chỉ cần vài mảnh hạt nhỏ mỗi hệ, gom vào một atlas ≤ 512×512. Mỗi hình là một tấm 3×3 hạt rời nhau, Claude cắt ra.

**Kim** · `fx-kim.png`

```text
Sprite sheet for 2D game effects: a 3 by 3 grid of separate small particles: metal shards, small bronze coins, thin silver slash streaks. Each particle is a simple flat painted shape with a bold outline and one shadow tone, well separated from the others with empty space, all similar size. No glow, no blur, no text, no grid lines. Background: flat solid chroma green (#00b140), completely uniform.
```

**Mộc** · `fx-moc.png`

```text
Sprite sheet for 2D game effects: a 3 by 3 grid of separate small particles: bamboo leaves, small sprouts, round green seed pods. Each particle is a simple flat painted shape with a bold outline and one shadow tone, well separated from the others with empty space, all similar size. No glow, no blur, no text, no grid lines. Background: flat solid magenta (#ff00ff), completely uniform.
```

**Thủy** · `fx-thuy.png`

```text
Sprite sheet for 2D game effects: a 3 by 3 grid of separate small particles: water droplets, small splash crowns, ice shards. Each particle is a simple flat painted shape with a bold outline and one shadow tone, well separated from the others with empty space, all similar size. No glow, no blur, no text, no grid lines. Background: flat solid chroma green (#00b140), completely uniform.
```

**Hỏa** · `fx-hoa.png`

```text
Sprite sheet for 2D game effects: a 3 by 3 grid of separate small particles: flame tongues, embers, curling smoke puffs. Each particle is a simple flat painted shape with a bold outline and one shadow tone, well separated from the others with empty space, all similar size. No glow, no blur, no text, no grid lines. Background: flat solid chroma green (#00b140), completely uniform.
```

**Thổ** · `fx-tho.png`

```text
Sprite sheet for 2D game effects: a 3 by 3 grid of separate small particles: rock fragments, pebbles, dust clouds. Each particle is a simple flat painted shape with a bold outline and one shadow tone, well separated from the others with empty space, all similar size. No glow, no blur, no text, no grid lines. Background: flat solid chroma green (#00b140), completely uniform.
```

**Lôi** · `fx-loi.png`

```text
Sprite sheet for 2D game effects: a 3 by 3 grid of separate small particles: short zigzag bolts, round spark bursts, small arcs. Each particle is a simple flat painted shape with a bold outline and one shadow tone, well separated from the others with empty space, all similar size. No glow, no blur, no text, no grid lines. Background: flat solid chroma green (#00b140), completely uniform.
```

**Phong** · `fx-phong.png`

```text
Sprite sheet for 2D game effects: a 3 by 3 grid of separate small particles: wind streak curves, swirling leaves, small cloud scrolls. Each particle is a simple flat painted shape with a bold outline and one shadow tone, well separated from the others with empty space, all similar size. No glow, no blur, no text, no grid lines. Background: flat solid magenta (#ff00ff), completely uniform.
```

## 11. Khi Copilot ra sai

| Hiện tượng | Cách sửa |
|---|---|
| Nền không trơn, có vệt sáng hoặc sàn | Thêm cuối prompt: `Pure flat background color only.` |
| Icon quá nhiều chi tiết, nhỏ lại thì nhòe | Thêm: `Fewer details, bigger shapes, thicker outlines.` |
| Ô cờ ra kiểu viên ngọc 3D bóng loáng | Thêm: `Flat painted object, not a gem, not 3D.` |
| Nền trận quá sáng, tranh với bàn cờ | Thêm: `Darker and more muted, low contrast, like seen through evening haze.` |
| Có chữ trên cờ, bùa, sách | Thêm: `Blank surfaces, no writing.` |
| Lớp giữa hoặc gần vẽ cả bầu trời | Nhắc lại: `Only the band of <cảnh>, everything else magenta.` |

Nguyên tắc clean-room vẫn áp dụng: không ghi tên game, họa sĩ hay dán ảnh của game khác vào prompt.

