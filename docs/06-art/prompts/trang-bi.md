# Prompt trang bị

> Cập nhật: 03/11/2026
> Trạng thái: **DRAFT** — đã có 5 khung phẩm (mục 4) và đủ 16 món bộ Cờ Lau (mục 5), đủ 16 món bộ Hoa Lư, đủ 16 món bộ Đồng Cổ, 3 huy hiệu bộ (mục 6), 9 bóng ô trống (mục 7), 2 biểu tượng thao tác (mục 8), 04/11/2026; các hình khác chưa có ảnh; thay mục 4 cũ của [Prompt đồ họa](do-hoa.md#4-trang-bị) (nét phẳng, 6 vũ khí).

Prompt ráp sẵn cho hệ thống trang bị: hình từng món theo **9 ô** và **3 bộ**, vũ khí cho đủ **8 nghề**, khung **5 phẩm**, huy hiệu bộ, bóng ô trống và hai biểu tượng thao tác. Luật trang bị (chỉ số, thưởng bộ, phẩm, ghép) ở [Trang bị](../../04-equipment/trang-bi.md); danh sách lấy từ code ngày 03/11/2026 (`GEAR_SLOTS`, `GEAR_SETS`, `TIERS` trong `src/core/gear/gear.ts`, `PROFESSIONS` trong `src/core/battle/rules.ts`). Phong cách theo [Prompt biểu tượng kỹ năng](icon-ky-nang.md) để món đồ và kỹ năng nằm cạnh nhau không lệch nhau. Giải thích bằng tiếng Việt, prompt bằng tiếng Anh.

## 1. Vì sao làm lại

| Bản cũ ([Prompt đồ họa](do-hoa.md#4-trang-bị), 20/10) | Bản này | Lý do |
|---|---|---|
| Nét nâu đậm, tô 1–2 tông, phẳng | Vẽ tay bán tả thực, bóng bẩy, viền hoa văn vàng nhỏ | Khớp 42 ảnh kỹ năng và 21 ô cờ Shan đã gửi; icon phẳng đặt cạnh sẽ lạc tông |
| 6 vũ khí | 8 vũ khí (thêm Xạ thủ, Sát thủ) | Hai nghề mới đã vào trận từ 31/10/2026 |
| Một chi tiết tô hồng để code nhuộm màu hệ | Món đồ giữ màu chất liệu; hệ hiện bằng huy hiệu nguyên tố nhỏ ở góc (dùng lại `public/art/elements/`) | Ảnh vẽ tay nhiều sắc độ, nhuộm một vùng hồng dễ loang và lộ viền |
| Ba bộ cùng một kiểu dáng, khác câu chủ đề | Mỗi bộ một chất liệu và hoa văn riêng, nhìn hình là biết bộ | Người chơi gom 6/9 món cùng bộ để có thưởng bộ nên cần nhận bộ ngay trong túi đồ |

## 2. Cách dùng

- Mỗi khối là một hình, dán nguyên. Đính kèm 1–2 ảnh trong `public/art/skills/` (ví dụ `thachGiap.webp`, `giapDongHoThe.webp`) làm ảnh tham chiếu phong cách. **Món đầu tiên của mỗi bộ** (gợi ý: Y phục) duyệt xong thì đính kèm nó vào mọi món còn lại của bộ đó để giữ chất liệu đồng nhất.
- Tạo 1024×1024 trên nền xanh lá `#00b140`; bộ Đồng Cổ có gỉ đồng xanh nên dùng nền hồng `#ff00ff`. Gửi Claude PNG đặt tên đúng tên file trong khối.
- Claude xóa nền và xuất `public/art/gear/<bộ>/<ô>.webp` (vũ khí `vuKhi-<nghề>.webp`) ở 96 và 192 px, rồi cho `GearIcon` nhận thêm `set` để chọn ảnh; thiếu ảnh thì giữ SVG hiện tại.
- Không vẽ món đồ lên người nhân vật: trang bị chỉ là biểu tượng trong giao diện (như bản cũ đã chốt).

## 3. Hệ thống hình

| Nhóm | Số hình | Dùng ở đâu |
|---|---|---|
| Món đồ: 8 ô dùng chung + 8 vũ khí, × 3 bộ | 48 | Ô trang bị hồ sơ, túi đồ 8×5, chiến lợi phẩm, cửa hàng, ghép |
| Khung phẩm | 5 (đã có) | Đè lên mọi ô món đồ (đã thay `TierFrame` SVG) |
| Huy hiệu bộ | 3 | Bảng thưởng bộ trong hồ sơ, bộ lọc túi đồ, cửa hàng |
| Bóng ô trống | 9 | 9 ô quanh chân dung khi chưa mặc |
| Biểu tượng thao tác | 2 | Nút Ghép, nút Bán |
| **Cộng** | **67** | |

Một món trên màn hình là bốn lớp, chỉ lớp 2 và 3 là ảnh mới:

1. Nền ô sơn mài thẫm (code), thêm ánh màu phẩm nhạt.
2. Ảnh món đồ theo bộ + ô (+ nghề nếu là vũ khí).
3. Khung phẩm theo bậc.
4. Huy hiệu nguyên tố nhỏ ở góc dưới phải (ảnh có sẵn), bậc Cam thêm tia sáng (code).

Như vậy 48 ảnh món đồ phủ đủ 3 bộ × 9 ô × 8 nghề × 7 hệ × 5 phẩm mà không phải tạo theo hệ hay theo phẩm.

Thứ tự gợi ý: 5 khung phẩm → bộ Cờ Lau (bộ rơi nhiều nhất ở đầu game) → 9 bóng ô trống → bộ Hoa Lư → bộ Đồng Cổ → huy hiệu bộ → biểu tượng thao tác.

## 4. Khung phẩm (5)

> Đã có ảnh (04/11/2026): Shan gửi 5 khung, Claude làm sạch viền và xuất `public/art/gear/frames/frame-<bậc>.webp` 192 px; `GearIcon` (`src/app/game/art/gear.tsx`) đè khung lên mọi ô có phẩm và thu món đồ còn 78% để nằm gọn trong lòng khung.

Khung vuông bo góc, lòng khung **để trống hoàn toàn** (chiếm khoảng 76% cạnh) để ảnh món đồ nằm bên trong. Mỗi bậc khác nhau cả về **hình** chứ không chỉ màu (như `TierFrame` hiện tại), để người khó phân biệt màu vẫn đọc được phẩm. Màu khớp `TIER_FRAME` trong `gear.tsx`. Nền xanh lá; lòng khung cũng xanh lá để Claude khoét trong suốt.

**Phàm phẩm · Trắng** · `frame-1.png`

```text
Square 1024x1024 game UI item frame, front view, perfectly symmetrical. A thin rounded-square border of pale grey weathered wood (#d6d3d1 tone) with plain smooth edges and no ornaments at all. The inside of the frame is completely empty and filled with the same flat background color; the open center takes about 76% of the width. Hand-painted semi-realistic style matching ornate fantasy game icons, subtle highlights. No text, no item, no glow. Background: flat solid chroma green (#00b140) both outside and inside the frame, completely uniform.
```

**Lương phẩm · Lục** · `frame-2.png`

```text
Square 1024x1024 game UI item frame, front view, perfectly symmetrical. A rounded-square border made of polished green bamboo (#4ade80 tone) with visible bamboo nodes, and a small round bronze stud at each of the four corners. The inside of the frame is completely empty and filled with the same flat background color; the open center takes about 76% of the width. Hand-painted semi-realistic style matching ornate fantasy game icons, glossy highlights. No text, no item, no glow. Background: flat solid pure magenta (#ff00ff) both outside and inside the frame, completely uniform.
```

**Tinh phẩm · Lam** · `frame-3.png`

```text
Square 1024x1024 game UI item frame, front view, perfectly symmetrical. A double rounded-square border: an outer band of sky-blue enamel (#38bdf8 tone) on silver and a thin inner silver line, engraved with a continuous small wave pattern, a round silver stud at each corner. The inside of the frame is completely empty and filled with the same flat background color; the open center takes about 74% of the width. Hand-painted semi-realistic style matching ornate fantasy game icons, glossy highlights. No text, no item, no glow. Background: flat solid chroma green (#00b140) both outside and inside the frame, completely uniform.
```

**Bảo phẩm · Tím** · `frame-4.png`

```text
Square 1024x1024 game UI item frame, front view, perfectly symmetrical. A double rounded-square border of violet lacquer (#c084fc tone) trimmed with gold, a diamond-shaped gold ornament at each of the four corners, and a saw-tooth band like the rim of a bronze drum along the bottom edge. The inside of the frame is completely empty and filled with the same flat background color; the open center takes about 72% of the width. Hand-painted semi-realistic style matching ornate fantasy game icons, glossy highlights. No text, no item, no glow. Background: flat solid chroma green (#00b140) both outside and inside the frame, completely uniform.
```

**Thần phẩm · Cam** · `frame-5.png`

```text
Square 1024x1024 game UI item frame, front view, perfectly symmetrical. A rich double rounded-square border of burnished gold and orange-red lacquer (#fb923c tone), with flying Lac-bird and tangent-spiral bands like a Dong Son bronze drum engraved along all four sides, ornate curling gold filigree flourishes at the four corners, and a small radiating sun-star at the top center. The inside of the frame is completely empty and filled with the same flat background color; the open center takes about 70% of the width. Hand-painted semi-realistic style matching ornate fantasy game icons, glossy highlights. No text, no item, no glow outside the frame. Background: flat solid chroma green (#00b140) both outside and inside the frame, completely uniform.
```

Khung Lục làm trên nền hồng vì tre màu xanh lá.

## 5. Món đồ (48)

| Ô | Chỉ số | Bộ Cờ Lau | Bộ Hoa Lư | Bộ Đồng Cổ |
|---|---|---|---|---|
| Vũ khí (8 nghề) | ATK | Gỗ, tre, da, đồng thô | Sơn mài đỏ, vàng | Đồng đúc, gỉ xanh |
| Đính mão | Máu | Mũ da chỏm đồng, chùm bông lau | Trụ sơn đỏ, mào lông đỏ | Mũ đồng mặt trời, mào lông chim Lạc |
| Y phục | DEF | Áo gai giao lĩnh, giáp da | Giáp lá sơn đỏ viền vàng | Giáp vảy đồng, hộ tâm mặt trời |
| Hộ thủ | ATK | Bao tay da đinh đồng | Bao tay sơn đỏ khắc núi | Vòng tay đồng hoa văn xoắn |
| Bảo ngoa | DEF | Ủng da quấn xà cạp | Ủng giáp đá xám | Ủng ốp đồng vòng tròn đồng tâm |
| Giới chỉ | ATK | Nhẫn dây đồng, đá cuội | Nhẫn vàng, mã não đỏ | Nhẫn xoắn ốc, ngọc lam |
| Hạng liên | Máu | Chuỗi hạt gỗ, mặt sừng trâu | Dây vàng, mặt núi đá vôi | Vòng cổ đồng, chuông nhỏ, chim Lạc |
| Hộ phù | DEF | Nút cói đeo thẻ gỗ ấn đỏ | Thẻ sơn son viền vàng | Trống đồng thu nhỏ |
| Ngọc bội | Máu | Ngọc bích dây gai | Ngọc trắng chạm núi sóng | Ngọc lam khảm mặt trời đồng |

Chủ đề ba bộ: **Cờ Lau** là đồ của nghĩa quân làng (bông lau trắng, gỗ, da, cói), **Hoa Lư** là đồ cấm quân kinh đô Đại Cồ Việt (sơn son thếp vàng, núi đá vôi, sóng) hợp thưởng bộ thiên thủ, **Đồng Cổ** là đồ nghi lễ đúc đồng Đông Sơn (mặt trời, chim Lạc, gỉ xanh) hợp thưởng bộ thiên công.

### Bộ Cờ Lau (`coLau`)

> Đã có đủ 16 ảnh (04/11/2026): `public/art/gear/coLau/<ô>.webp` và `vuKhi-<nghề>.webp` 192 px, căn tâm theo thân chính (bỏ hoa văn vàng rời). `GearIcon` nhận `set` và vẽ ảnh khi bộ có trong `SET_ART` (`gear.tsx`), kèm huy hiệu nguyên tố ở góc; `tests/game/gear-art.test.ts` kiểm đủ file.

Thưởng bộ: ATK +4%, Máu +3% ở mốc 6 món, thêm lần nữa ở mốc 9 món. Nền khi tạo: xanh lá.

**Đính mão** (Máu) · `coLau-dinhMao.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a leather-and-wood war cap with a rounded crown, a short bronze spike, cheek flaps and a white reed-flower plume tied at the top. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Y phục** (DEF) · `coLau-yPhuc.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a cross-collar hemp battle robe with a leather lamellar chest piece and a woven reed belt, laid flat and seen from the front. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hộ thủ** (ATK) · `coLau-hoThu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a pair of tanned leather bracers laced with hemp cord and studded with small bronze rivets, shown side by side. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Bảo ngoa** (DEF) · `coLau-baoNgoa.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a pair of high leather boots with cloth leg wraps tied by straw rope and slightly upturned toes, shown side by side. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Giới chỉ** (ATK) · `coLau-gioiChi.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a ring of braided bronze wire set with a polished river pebble, a tiny reed leaf engraved on the band, seen at a slight angle. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hạng liên** (Máu) · `coLau-hangLien.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a necklace of wooden and bronze beads with a carved water-buffalo-horn pendant. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hộ phù** (DEF) · `coLau-hoPhu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a woven reed amulet knot holding a small wooden tablet stamped with a red square seal (unreadable), with a hemp tassel. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ngọc bội** (Máu) · `coLau-ngocBoi.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a pale green jade disc with a hole in the center hanging from a braided hemp cord with a reed-flower tassel. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Tướng sĩ** (ATK) · `coLau-vuKhi-tuongSi.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a broad single-edged saber (dao) with a hemp-wrapped wooden grip, a plain bronze guard and a white reed plume at the pommel, diagonal. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Pháp sư** (ATK) · `coLau-vuKhi-phapSu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a staff of knotted dark wood with a woven rattan cage at the top holding a clear crystal orb, diagonal. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Binh lính** (ATK) · `coLau-vuKhi-binhLinh.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a bamboo-shafted spear with a leaf-shaped bronze head and a white reed tuft, crossed in front of a round woven rattan shield. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Y sư** (ATK) · `coLau-vuKhi-ySu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a dried bottle-gourd medicine flask with a wooden stopper, hemp cord and a small bundle of herbs. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Mưu sĩ** (ATK) · `coLau-vuKhi-muuSi.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a half-open fan of woven reed on bamboo ribs with a hemp tassel. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Quân sư** (ATK) · `coLau-vuKhi-quanSu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a small triangular cream command flag (plain, no writing) on a bamboo pole beside a bundle of bamboo slips tied with hemp. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Xạ thủ** (ATK) · `coLau-vuKhi-xaThu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a simple bamboo longbow strung with hemp beside three reed-shafted arrows with white fletching. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Sát thủ** (ATK) · `coLau-vuKhi-satThu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a pair of short single-edged knives with bone handles, one in a hemp-tied leather sheath, crossed. Set theme 'Reed Banner': humble rebel gear of a young village army — weathered wood, tanned leather, woven reed and rattan, undyed hemp cloth and small bronze fittings, with tufts of white reed-flower plumes as the recurring motif; warm brown, cream and bronze palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

### Bộ Hoa Lư (`hoaLu`)

Thưởng bộ: DEF +12%, Máu +4% ở mốc 6 món, thêm lần nữa ở mốc 9 món. Nền khi tạo: xanh lá.

**Đính mão** (Máu) · `hoaLu-dinhMao.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a royal guard helmet of red-lacquered iron plates with a gold-trimmed brim, a neck guard, a red horsehair crest and a small gold karst-peak plaque on the front. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Y phục** (DEF) · `hoaLu-yPhuc.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a red-lacquered lamellar armor coat with gold edging and wave-patterned skirt panels, laid flat and seen from the front. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hộ thủ** (ATK) · `hoaLu-hoThu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a pair of gauntlets of red-lacquered plates engraved with gold mountain-and-wave lines, shown side by side. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Bảo ngoa** (DEF) · `hoaLu-baoNgoa.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a pair of armored boots with stone-grey plates over red cloth and gold trim, shown side by side. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Giới chỉ** (ATK) · `hoaLu-gioiChi.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a heavy gold ring set with a square red carnelian, seen at a slight angle. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hạng liên** (Máu) · `hoaLu-hangLien.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a gold chain with a pendant shaped like three karst peaks above river waves, a small red stone at the center. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hộ phù** (DEF) · `hoaLu-hoPhu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a vermilion-lacquered wooden tablet amulet with a gold border, a blank face and a red silk tassel. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ngọc bội** (Máu) · `hoaLu-ngocBoi.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a white jade pendant carved as layered mountains over waves, hung on a red silk cord with gold beads. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Tướng sĩ** (ATK) · `hoaLu-vuKhi-tuongSi.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a heavy court saber with a steel blade inlaid with a gold line along the spine, a red lacquer grip and a gold guard shaped like karst peaks, diagonal. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Pháp sư** (ATK) · `hoaLu-vuKhi-phapSu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a red-lacquered staff with gold rings and a gold crown shaped like mountain peaks holding a white stone orb, diagonal. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Binh lính** (ATK) · `hoaLu-vuKhi-binhLinh.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a long spear with a gold-trimmed red shaft crossed in front of a red-lacquered round shield with a gold karst emblem. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Y sư** (ATK) · `hoaLu-vuKhi-ySu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a red-lacquered double-bulb gourd with gold bands and a jade stopper. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Mưu sĩ** (ATK) · `hoaLu-vuKhi-muuSi.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a folding fan with red lacquer ribs and gold-leaf paper painted with a grey karst landscape (no writing), half open. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Quân sư** (ATK) · `hoaLu-vuKhi-quanSu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a red swallow-tailed command flag with gold fringe (no writing) on a lacquered pole beside bamboo slips bound with gold cord. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Xạ thủ** (ATK) · `hoaLu-vuKhi-xaThu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a recurved bow with red-lacquered limbs and gold tips beside three gold-fletched arrows. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ khí Sát thủ** (ATK) · `hoaLu-vuKhi-satThu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a pair of slim daggers with red lacquer handles and gold guards, blades engraved with karst peaks, crossed. Set theme 'Hoa Lư Citadel': royal guard gear of the Đại Cồ Việt court at Hoa Lư — deep vermilion red lacquer, polished gold trim and grey limestone-like plates, with layered karst mountain peaks and river waves engraved in gold as the recurring motif; heavy, protective and dignified; red, gold and stone-grey palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

### Bộ Đồng Cổ (`dongCo`)

Thưởng bộ: ATK +7% ở mốc 6 món, thêm lần nữa ở mốc 9 món. Nền khi tạo: hồng.

**Đính mão** (Máu) · `dongCo-dinhMao.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a cast bronze helmet with verdigris patches, an engraved sun-star on the crown and a crest of stylized Lac-bird feathers. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Y phục** (DEF) · `dongCo-yPhuc.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a bronze scale armor vest with a round bronze chest disc engraved with the sun-star, laid flat and seen from the front. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Hộ thủ** (ATK) · `dongCo-hoThu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a pair of bronze bracers with tangent-spiral bands and pointed rims, shown side by side. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Bảo ngoa** (DEF) · `dongCo-baoNgoa.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a pair of leather boots with bronze shin guards engraved with concentric circles, shown side by side. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Giới chỉ** (ATK) · `dongCo-gioiChi.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a bronze ring shaped as a coiled spiral set with a turquoise stone, seen at a slight angle. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Hạng liên** (Máu) · `dongCo-hangLien.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a bronze torque necklace hung with small bronze bells and a flying Lac-bird pendant. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Hộ phù** (DEF) · `dongCo-hoPhu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a miniature bronze drum amulet with a sun-star on its face, hanging from a cord. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Ngọc bội** (Máu) · `dongCo-ngocBoi.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a turquoise-green jade disc with an inset bronze sun-star, hanging from a bronze chain. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Vũ khí Tướng sĩ** (ATK) · `dongCo-vuKhi-tuongSi.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a Dong Son bronze short sword with a flared blade and a spiral-engraved hilt, diagonal. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Vũ khí Pháp sư** (ATK) · `dongCo-vuKhi-phapSu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a bronze staff topped with a miniature bronze drum cradling an orb of polished stone, diagonal. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Vũ khí Binh lính** (ATK) · `dongCo-vuKhi-binhLinh.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a bronze spear with a long leaf blade engraved with Lac birds crossed in front of a round bronze shield with the sun-star. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Vũ khí Y sư** (ATK) · `dongCo-vuKhi-ySu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a cast bronze flask in the shape of a gourd with spiral bands and verdigris. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Vũ khí Mưu sĩ** (ATK) · `dongCo-vuKhi-muuSi.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a fan of thin hammered bronze leaves on a bronze handle, half open. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Vũ khí Quân sư** (ATK) · `dongCo-vuKhi-quanSu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a command banner on a bronze pole topped with a Lac-bird finial beside a bundle of bronze-bound bamboo slips. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Vũ khí Xạ thủ** (ATK) · `dongCo-vuKhi-xaThu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a bronze-fitted crossbow in Âu Lạc style with a bronze trigger beside three bolts with bronze heads. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Vũ khí Sát thủ** (ATK) · `dongCo-vuKhi-satThu.png`

```text
Square 1024x1024 fantasy RPG equipment icon. Item: a pair of Dong Son bronze daggers with spiral-engraved hilts, crossed. Set theme 'Ancient Bronze Drum': ceremonial war gear cast in Dong Son bronze — golden bronze with patches of blue-green verdigris patina, engraved with the radiating sun-star, flying Lac birds, concentric circles and tangent-spiral bands like a bronze drum; sharp, aggressive shapes; bronze, gold and teal-patina palette. Style: same family as a set of ornate hand-painted fantasy skill icons — rich semi-realistic digital painting, high detail, glossy highlights on metal and lacquer, bright rim light, strong contrast, a bold silhouette that stays readable at 48 px; one single item, centered, three-quarter view, filling about 78% of the canvas, with a few small curling gold filigree flourishes around it but no frame. Culture: 10th-century Vietnam (Đinh dynasty) with Dong Son bronze-drum motifs; no Chinese dragons, no phoenixes, no Japanese or European armor. Neutral materials only: do not tint the item toward any single element color, no magic aura, no glow, no sparkles, no particles (the game adds element and rarity effects). No people, no text, no letters, no frame, no border, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

## 6. Huy hiệu bộ (3)

Huy hiệu tròn hiện cạnh tên bộ và số món đang mặc (ví dụ "Cờ Lau 6/9").

**Huy hiệu Cờ Lau** · `set-coLau.png`

```text
Square 1024x1024 round game emblem medallion, front view. A disc of dark weathered wood with a bronze rim, on its face two crossed stalks of white reed flowers over a water-buffalo horn, small hemp cord wrapping. Hand-painted semi-realistic style matching ornate fantasy game icons, glossy highlights, a few curling gold filigree flourishes. No text, no letters. Background: flat solid chroma green (#00b140), completely uniform.
```

**Huy hiệu Hoa Lư** · `set-hoaLu.png`

```text
Square 1024x1024 round game emblem medallion, front view. A disc of vermilion red lacquer with a polished gold rim, on its face three layered limestone karst peaks in gold rising above stylized river waves. Hand-painted semi-realistic style matching ornate fantasy game icons, glossy highlights, a few curling gold filigree flourishes. No text, no letters. Background: flat solid chroma green (#00b140), completely uniform.
```

**Huy hiệu Đồng Cổ** · `set-dongCo.png`

```text
Square 1024x1024 round game emblem medallion, front view. The face of a Dong Son bronze drum: a radiating sun-star at the center, rings of flying Lac birds and tangent spirals around it, golden bronze with patches of blue-green verdigris. Hand-painted semi-realistic style matching ornate fantasy game icons, glossy highlights. No text, no letters. Background: flat solid pure magenta (#ff00ff), completely uniform.
```

## 7. Bóng ô trống (9)

Hiện ở ô chưa mặc đồ quanh chân dung trong hồ sơ. Cố ý **mờ và đơn sắc** để không lẫn với món thật. Cả 9 dùng chung một khung câu, chỉ đổi vật.

| Ô | Tên file | Vật |
|---|---|---|
| Vũ khí | `empty-vuKhi.png` | a broad saber laid diagonally |
| Đính mão | `empty-dinhMao.png` | a war helmet |
| Y phục | `empty-yPhuc.png` | a cross-collar armored robe |
| Hộ thủ | `empty-hoThu.png` | a pair of bracers |
| Bảo ngoa | `empty-baoNgoa.png` | a pair of boots |
| Giới chỉ | `empty-gioiChi.png` | a ring with a stone |
| Hạng liên | `empty-hangLien.png` | a bead necklace with a pendant |
| Hộ phù | `empty-hoPhu.png` | a hanging amulet tablet with a tassel |
| Ngọc bội | `empty-ngocBoi.png` | a round jade disc on a cord |

```text
Square 1024x1024 placeholder icon for an empty equipment slot: [VẬT] drawn only as a simple engraved outline in pale bronze lines, like a faint carving on a dark lacquer panel, single color, no shading, no fill, no highlights, low contrast, one centered object filling about 70% of the canvas. No text, no frame. Background: flat solid chroma green (#00b140), completely uniform.
```

Thay `[VẬT]` bằng cột Vật của bảng.

## 8. Biểu tượng thao tác (2)

**Ghép nâng bậc** · `action-merge.png`

```text
Square 1024x1024 fantasy game UI icon. Item: a small bronze casting furnace with three glowing molten droplets flowing into one mold, a hammer leaning on it. Style: rich semi-realistic hand-painted fantasy game icon, glossy highlights, bright rim light, strong silhouette readable at 32 px, a few curling gold filigree flourishes, 10th-century Vietnam with Dong Son bronze motifs. No text, no frame. Background: flat solid chroma green (#00b140), completely uniform.
```

**Bán** · `action-sell.png`

```text
Square 1024x1024 fantasy game UI icon. Item: an open cloth purse spilling round bronze coins with square holes and a small gold ingot. Style: rich semi-realistic hand-painted fantasy game icon, glossy highlights, bright rim light, strong silhouette readable at 32 px, a few curling gold filigree flourishes, 10th-century Vietnam. No text, no frame. Background: flat solid chroma green (#00b140), completely uniform.
```

## 9. Khi ảnh ra sai

| Lỗi | Sửa |
|---|---|
| Món đồ phát sáng hoặc ám một màu hệ | Nhắc lại "neutral materials only, no glow"; hệ và phẩm do code thêm |
| Hai món cùng bộ khác chất liệu | Đính kèm món đã duyệt của bộ đó làm ảnh tham chiếu thứ hai |
| Có chữ trên cờ, thẻ, ấn | Thêm "the flag and tablet must be completely blank" |
| Giáp kiểu Nhật, Trung Hoa hay châu Âu | Thêm "10th-century Vietnamese lamellar armor, not samurai, not Chinese Ming, not European plate" |
| Lòng khung phẩm bị vẽ hoa văn hoặc đổ bóng | Thêm "the center must be one flat color, nothing inside" |
| Ủng, bao tay chỉ ra một chiếc | Thêm "exactly two, a matching pair side by side" |
