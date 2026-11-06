# Prompt biểu tượng kỹ năng

> Cập nhật: 03/11/2026
> Trạng thái: **DRAFT** — đã có ảnh đủ 24 chiêu nghề của 8 nghề (04/11/2026) và mọi chiêu ô 4 riêng của tướng (06/11/2026, không còn chiêu nào mượn ảnh hệ cũ); 42 ảnh kỹ năng hệ Shan gửi ở `public/art/skills/` là chuẩn phong cách.

Prompt ráp sẵn để tạo ảnh cho mọi kỹ năng còn vẽ bằng SVG (`src/app/game/art/skills.tsx`): chiêu nghề, tuyệt chiêu/chiêu riêng của nhân vật kèm, tướng lịch sử, sứ quân, Xạ thủ/Sát thủ, tuyệt chiêu ô 4 của Đinh Bộ Lĩnh và hai nhân vật đặc biệt. Danh sách lấy từ code ngày 03/11/2026 (`ROLE_SKILLS`, `CHARACTER_SKILLS`, `DBL_ULTIMATES`, `SPECIAL_SKILLS` trong `src/core/battle/`). Luật kỹ năng ở [Kỹ năng](../../03-characters/ky-nang/README.md), bảng từng nhân vật ở [kỹ năng đồng hành](../../03-characters/ky-nang/data/ky-nang-dong-hanh.md). Giải thích bằng tiếng Việt, prompt bằng tiếng Anh. Prompt trang bị ở [Prompt trang bị](trang-bi.md).

## 1. Cách dùng

- Mỗi khối là một hình, dán nguyên vào công cụ tạo ảnh (Copilot, ChatGPT…). Nên **đính kèm 2–3 ảnh trong `public/art/skills/`** làm ảnh tham chiếu phong cách (ví dụ `thachGiap.webp`, `hanBangTien.webp`, `kimAnPhaThien.webp`); khối nào có ghi "Ảnh tham chiếu phong cách" thì đính kèm thêm đúng ảnh đó vì chủ đề gần nhau.
- Tạo ở 1024×1024 trên nền trơn **xanh lá `#00b140`**; hệ Mộc, Phong và nghề Y sư, Xạ thủ dùng **hồng `#ff00ff`** vì vật có màu xanh. Gửi Claude file PNG đặt tên đúng mã trong khối (ví dụ `role_tramKich.png`; quy ước tên ở [Hình ảnh, mục 2.8](../art-bible.md)). Claude xóa nền, xuất `public/art/skills/<mã>.webp` 128 px như 42 ảnh hiện có và thêm mã vào `SKILL_ART`.
- Khung ô, viền màu hệ và hào quang tuyệt chiêu do code vẽ (`SkillArtIcon`), nên prompt cấm khung, chữ và nền ô.
- Tên chiêu là của Cờ Lau; prompt chỉ tả hình, không đưa tên chiêu vào ảnh. Giữ clean-room: không lấy hình hay tên từ game tham khảo ([Tổng quan](../../00-overview/tong-quan.md)).

### Phong cách chung (đã ráp vào mọi prompt)

Rút từ 42 ảnh Shan gửi: một vật hoặc một cảnh nhỏ làm biểu tượng, năng lượng màu hệ cuộn quanh, dải hoa văn vàng uốn cong ôm lấy như huy hiệu, nét vẽ tay bán tả thực, bóng bẩy, tương phản mạnh, đọc được ở 48 px; không người, không chữ, không khung.

| Hệ | Màu năng lượng | Nền khi tạo |
|---|---|---|
| ⚙️ Kim | Bạc thép, vàng kim, mảnh kim loại | Xanh lá |
| 🌳 Mộc | Lục bảo, xanh nõn, lá, dây leo | Hồng |
| 💧 Thủy | Lam ngọc, xanh lơ, sóng, băng | Xanh lá |
| 🔥 Hỏa | Đỏ thắm, cam, vàng, tàn lửa | Xanh lá |
| ⛰️ Thổ | Hoàng thổ, hổ phách, đá nứt | Xanh lá |
| ⚡ Lôi | Tím điện, tia sét | Xanh lá |
| 🌪️ Phong | Xanh ngọc nhạt, trắng, lốc xoáy | Hồng |

Chiêu nghề không có hệ nên lấy màu theo `PROFESSION_COLOR` (đỏ son Tướng sĩ, tím Pháp sư, nâu Binh lính, ngọc Y sư, vàng đất Mưu sĩ, chàm Quân sư, lục Xạ thủ, tím than Sát thủ) cộng vàng.

## 2. Dùng lại 42 ảnh đã có

42 ảnh trong `public/art/skills/` là bộ kỹ năng hệ cũ của Đinh Bộ Lĩnh (7 hệ × 6 ô). Sau cải tổ kỹ năng, chúng chia làm hai phần:

| Phần | Số ảnh | Đang dùng ở đâu | Cách dùng lại |
|---|---|---|---|
| Ô 2 và ô 6 hệ (ví dụ Phóng Hỏa Thiêu Doanh, Thạch Giáp) | 14 | Ô 2/6 của **mọi** nhân vật chơi được, kể cả Đinh Bộ Lĩnh | Dùng thẳng, không cần tạo mới. `skillArt` trong `skills.tsx` bỏ tiền tố `element_` khi tra ảnh (đã nối 04/11/2026) |
| Ô 1/3/4/5 hệ cũ (ví dụ Hàn Băng Tiễn, Kim Ấn Phá Thiên) | 28 | Bộ kỹ năng preset của AI chiến dịch ([preset AI hệ cũ](../../03-characters/ky-nang/preset-ai-he-cu.md)) | Giữ cho AI. Bảy ảnh ô 5 cũ dùng làm tuyệt chiêu ô 4 của Đinh Bộ Lĩnh (mục 5, phương án A); một số ảnh khác làm ảnh tham chiếu cho tuyệt chiêu cùng chủ đề (ghi trong từng khối) |

Không dùng **cùng một ảnh** cho hai kỹ năng khác nhau mà cùng hiện trên một màn: người chơi sẽ tưởng là một chiêu. Ngoại lệ duy nhất là phương án A ở mục 5, vì 8 tuyệt chiêu ô 4 của Đinh Bộ Lĩnh không bao giờ hiện cùng lúc (mỗi trận chỉ một nghề).

## 3. Số lượng và thứ tự gợi ý

| Nhóm | Số hình | Ưu tiên |
|---|---|---|
| Chiêu nghề (ô 1/3/5, dùng chung theo nghề) | 24 | 1: hiện ở mọi nhân vật kèm và Đinh Bộ Lĩnh |
| Tuyệt chiêu Đinh Bộ Lĩnh (ô 4) | 0 (phương án A) hoặc 8 (B) | 2 |
| Tuyệt chiêu/chiêu riêng tướng lịch sử | 6 | 3: đội khởi đầu chiến dịch |
| Chiêu riêng sứ quân | 12 | 4 |
| Tuyệt chiêu tướng thường | 42 | 5: làm theo nhân vật đã có hình động trước |
| Tuyệt chiêu Xạ thủ, Sát thủ | 14 | 6 |
| Nhân vật đặc biệt Đinh Ngọc, Vũ Phong | 12 | Để sau: nhân vật còn DRAFT, chưa vào roster |
| **Cộng** | **110 (A) / 118 (B)** | |

Bị động (nghề và hệ) hiện chỉ có chữ, chưa có ô biểu tượng nên không nằm trong bộ này.

## 4. Chiêu nghề (24)

Ô 1/3/5 của mọi nhân vật cùng nghề, gồm cả Đinh Bộ Lĩnh. Thông số ở cấp 1, theo [kỹ năng đồng hành](../../03-characters/ky-nang/data/ky-nang-dong-hanh.md).

### Tướng sĩ

**Ô 1 · Trảm kích** · `role_tramKich.png`

Địch đơn: sát thương.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a single curved broad saber (dao) with a vermilion tassel sweeping through the air, leaving one huge bright crescent slash arc. Energy and color: deep vermilion red and gold, with steel highlights. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ô 3 · Phá trận** · `role_phaTran.png`

Địch đơn: sát thương, Thủ−.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a heavy saber smashing straight through a round enemy shield and a splintering wooden palisade, plates and splinters bursting outward, deep cracks. Energy and color: deep vermilion red and gold, with steel highlights. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ô 5 · Đoạt mệnh** · `role_doatMenh.png`

Địch đơn: sát thương.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a saber driving downward in a finishing blow, a long crimson slash streak cutting across a cracked bronze helmet that splits in two. Energy and color: deep vermilion red and gold, with steel highlights. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

### Pháp sư

**Ô 1 · Phép lan** · `role_phepLan.png`

Mọi địch: sát thương.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a ritual staff orb at the center releasing three expanding rings of arcane force that ripple outward in every direction. Energy and color: royal purple and gold, with pale arcane light. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ô 3 · Ngũ hành ấn** · `role_nguHanhAn.png`

Địch đơn: sát thương, dấu ấn.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a round bronze seal disc hovering and stamping down, its face engraved with five small orbs in a ring (white, green, blue, red, ochre) around a central dot, a burst of stamped light under it. Energy and color: royal purple and gold, with pale arcane light. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ô 5 · Thiên địa cộng hưởng** · `role_thienDiaCong.png`

Mọi địch: sát thương, phá ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a vertical beam of light joining a swirling cloud vortex above with cracked shattering ground below, square stone tiles flying up and breaking. Energy and color: royal purple and gold, with pale arcane light. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

### Binh lính

**Ô 1 · Thủ thành** · `role_thuThanh.png`

Bản thân: Khiêu khích, Khiên.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a round woven rattan shield with a bronze boss planted upright in front of a raised spear flying a small war pennant, a golden protective shell outlining the shield. Energy and color: warm earthen brown, bronze and gold. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ô 3 · Tường khiên** · `role_tuongKhien.png`

Cả đội: Khiên.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: three overlapping round rattan shields locked edge to edge into a wall, a dome of golden protective light arching over them. Energy and color: warm earthen brown, bronze and gold. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ô 5 · Phản kích** · `role_phanKich.png`

Bản thân: Phản đòn, Thủ+, Khiêu khích.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a bronze-bossed round shield deflecting an incoming arrow, the arrow snapping and flying back in the opposite direction with sparks at the point of impact. Energy and color: warm earthen brown, bronze and gold. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

### Y sư

**Ô 1 · Linh dược** · `role_linhDuoc.png`

Một đồng đội: hồi máu, giải hiệu ứng xấu.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a medicine gourd tilted so one large glowing jade-green droplet falls from its mouth, sprigs of fresh herbs tied to the cord. Energy and color: jade green, white and gold. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Ô 3 · Dưỡng sinh** · `role_duongSinh.png`

Cả đội: hồi dần.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a young herb seedling sprouting from a small bronze bowl of earth, gentle spirals of soft green light rising in a slow loop around it. Energy and color: jade green, white and gold. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Ô 5 · Tế độ** · `role_teDo.png`

Cả đội: hồi máu, giải hiệu ứng xấu.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: an open lotus flower with three glowing healing droplets rising from its center while wisps of dark smoke disperse and fade at the edges. Energy and color: jade green, white and gold. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

### Mưu sĩ

**Ô 1 · Mua chuộc** · `role_muaChuoc.png`

Địch đơn: năng lượng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: an open cloth purse spilling round bronze coins with square holes, a closed folding fan resting across it, a few coins floating away. Energy and color: antique gold, ochre and dark brown. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ô 3 · Ly gián** · `role_lyGian.png`

Địch đơn: Câm lặng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a folded paper letter tearing apart in the middle, a red wax seal splitting, thin wisps of smoke curling from the torn edge. Energy and color: antique gold, ochre and dark brown. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ô 5 · Cắt quân lương** · `role_catQuanLuong.png`

Mọi địch: cắt lương, năng lượng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a sack of rice slashed open with grain pouring out, a snapped bamboo carrying pole lying across it. Energy and color: antique gold, ochre and dark brown. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

### Quân sư

**Ô 1 · Nghi binh** · `role_nghiBinh.png`

Địch đơn: Công−.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: three decoy war banners made of straw and rags on crooked poles standing in drifting mist, looking like an army that is not there. Energy and color: indigo blue, gold and white. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ô 3 · Hiệu lệnh** · `role_hieuLenh.png`

Cả đội: Công+.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a triangular command flag raised high above a small bronze war drum, golden rays of rallying light fanning out behind the flag. Energy and color: indigo blue, gold and white. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ô 5 · Phá kế** · `role_phaKe.png`

Mọi địch: xóa hiệu ứng tốt.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a bundle of bamboo slips bursting apart, the cords snapping, glowing enemy sigil circles (abstract, no letters) shattering into fragments around it. Energy and color: indigo blue, gold and white. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

### Xạ thủ

**Ô 1 · Định Điểm** · `role_xaThu_dinhDiem.png`

Địch đơn: sát thương.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a single arrow with a glowing tip flying dead straight into the exact center of a target made of concentric rings, the rings rippling from the hit. Energy and color: forest green, bronze and gold. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Ô 3 · Phá Giáp** · `role_xaThu_phaGiap.png`

Địch đơn: sát thương, Thủ−.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: an arrow punching through a lamellar armor plate, small armor scales flying outward from the hole, cracks spreading. Energy and color: forest green, bronze and gold. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Ô 5 · Tập Kích** · `role_xaThu_tapKich.png`

Mọi địch: sát thương, phá ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a volley of many arrows raining down in a wide fan from above, small craters and broken square tiles where they land. Energy and color: forest green, bronze and gold. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

### Sát thủ

**Ô 1 · Thừa Hư** · `role_satThu_thuaHu.png`

Địch đơn: sát thương, năng lượng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a short dagger slipping through a narrow gap between two armor plates, a thin wisp of stolen energy flowing back along the blade. Energy and color: dusky violet, black-steel and gold. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ô 3 · Đoạt Khí** · `role_satThu_doatKhi.png`

Địch đơn: sát thương, năng lượng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: two short daggers crossed in an X drawing glowing wisps of energy out of a cracking crystal orb between them. Energy and color: dusky violet, black-steel and gold. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ô 5 · Truy Mệnh** · `role_satThu_truyMenh.png`

Địch đơn: sát thương.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a thrown dagger flying with a long dark trailing streak toward a fading crimson target mark, the mark cracking. Energy and color: dusky violet, black-steel and gold. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

## 5. Tuyệt chiêu ô 4 của Đinh Bộ Lĩnh (56 mã)

`DBL_ULTIMATES` có 56 mã `dbl_<nghề>_<hệ>`: 8 đòn kết theo nghề, mỗi đòn có thêm một hiệu ứng nhỏ theo hệ. Hai cách:

- **Phương án A (đề xuất, 0 ảnh mới):** mỗi hệ dùng lại ảnh ô 5 cũ của chính Đinh Bộ Lĩnh: Kim `kimAnPhaThien`, Mộc `coThuTranThien`, Thủy `thuyKiepVanTrung`, Hỏa `lietDiemPhanThanh`, Thổ `thaiSonApDinh`, Lôi `cuuTieuLoiPhat`, Phong `baoTapCanKhon`. Code vẽ thêm biểu tượng nghề (`public/art/professions/`) nhỏ ở góc để phân biệt 8 nghề (đã dùng từ 04/11/2026, `DBL_ULTIMATE_ART` trong `skills.tsx`). Hợp vì đây vốn là tuyệt chiêu hệ của Đinh Bộ Lĩnh và người chơi đã quen.
- **Phương án B (8 ảnh × 7 màu):** 8 prompt dưới đây, mỗi prompt thay `[ELEMENT]` và `[BACKGROUND]` theo bảng để ra 7 bản (56 ảnh), hoặc chỉ tạo 8 bản theo một hệ rồi để code nhuộm màu năng lượng. Chủ thể có cờ lau trắng để nhận ra là chiêu của Đinh Bộ Lĩnh.

| Hệ | `[ELEMENT]` | `[BACKGROUND]` |
|---|---|---|
| ⚙️ Kim | silver-white steel and polished gold metallic energy, sharp glints and flying metal shards | flat solid chroma green (#00b140) |
| 🌳 Mộc | emerald and lime-green living-wood energy with leaves and vines | flat solid pure magenta (#ff00ff) |
| 💧 Thủy | sapphire and cyan water energy with waves, droplets and frost | flat solid chroma green (#00b140) |
| 🔥 Hỏa | crimson, orange and gold flames with embers | flat solid chroma green (#00b140) |
| ⛰️ Thổ | ochre, amber and gold earth energy with cracked rock and dust | flat solid chroma green (#00b140) |
| ⚡ Lôi | violet and electric-purple lightning with crackling arcs | flat solid chroma green (#00b140) |
| 🌪️ Phong | pale teal and white wind energy with spiralling gusts and drifting leaves | flat solid pure magenta (#ff00ff) |

**Tướng sĩ · Bình định** · `dbl_tuongSi_<hệ>.png`

Dùng cho 7 mã `dbl_tuongSi_kim` … `dbl_tuongSi_phong`: thay câu `[ELEMENT]` bằng dòng của hệ ở bảng trên, đổi nền theo bảng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a long broad single-edged general's saber with a round bronze disc guard and a long vermilion tassel cutting one great arc, a white reed-flower banner standing behind it. Energy and color: [ELEMENT]. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: [BACKGROUND], completely uniform, nothing else on it.
```

**Pháp sư · Thiên uy** · `dbl_phapSu_<hệ>.png`

Dùng cho 7 mã `dbl_phapSu_kim` … `dbl_phapSu_phong`: thay câu `[ELEMENT]` bằng dòng của hệ ở bảng trên, đổi nền theo bảng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a ritual staff raised under a splitting sky while a huge round seal of light presses down from the heavens. Energy and color: [ELEMENT]. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: [BACKGROUND], completely uniform, nothing else on it.
```

**Binh lính · Trấn quốc** · `dbl_binhLinh_<hệ>.png`

Dùng cho 7 mã `dbl_binhLinh_kim` … `dbl_binhLinh_phong`: thay câu `[ELEMENT]` bằng dòng của hệ ở bảng trên, đổi nền theo bảng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a spear driven through the center of a round rattan shield into the ground, a protective shell spreading out from it. Energy and color: [ELEMENT]. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: [BACKGROUND], completely uniform, nothing else on it.
```

**Y sư · Hưng sinh** · `dbl_ySu_<hệ>.png`

Dùng cho 7 mã `dbl_ySu_kim` … `dbl_ySu_phong`: thay câu `[ELEMENT]` bằng dòng của hệ ở bảng trên, đổi nền theo bảng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a medicine gourd pouring a stream of light onto the ground where white reed flowers bloom. Energy and color: [ELEMENT]. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: [BACKGROUND], completely uniform, nothing else on it.
```

**Mưu sĩ · Định kế** · `dbl_muuSi_<hệ>.png`

Dùng cho 7 mã `dbl_muuSi_kim` … `dbl_muuSi_phong`: thay câu `[ELEMENT]` bằng dòng của hệ ở bảng trên, đổi nền theo bảng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a folding fan sweeping across a small battle map with tiny enemy banners toppling over. Energy and color: [ELEMENT]. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: [BACKGROUND], completely uniform, nothing else on it.
```

**Xạ thủ · Vạn tiễn** · `dbl_xaThu_<hệ>.png`

Dùng cho 7 mã `dbl_xaThu_kim` … `dbl_xaThu_phong`: thay câu `[ELEMENT]` bằng dòng của hệ ở bảng trên, đổi nền theo bảng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a bamboo bow fully drawn, a storm of arrows fanning out ahead of it. Energy and color: [ELEMENT]. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: [BACKGROUND], completely uniform, nothing else on it.
```

**Sát thủ · Tuyệt mệnh** · `dbl_satThu_<hệ>.png`

Dùng cho 7 mã `dbl_satThu_kim` … `dbl_satThu_phong`: thay câu `[ELEMENT]` bằng dòng của hệ ở bảng trên, đổi nền theo bảng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a short dagger in a final downward strike, a single white reed flower torn loose and drifting. Energy and color: [ELEMENT]. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: [BACKGROUND], completely uniform, nothing else on it.
```

**Quân sư · Nhất thống** · `dbl_quanSu_<hệ>.png`

Dùng cho 7 mã `dbl_quanSu_kim` … `dbl_quanSu_phong`: thay câu `[ELEMENT]` bằng dòng của hệ ở bảng trên, đổi nền theo bảng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a tall white reed-flower command banner above a Dong Son bronze drum, rays of light spreading out to unite the field. Energy and color: [ELEMENT]. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: [BACKGROUND], completely uniform, nothing else on it.
```

## 6. Tuyệt chiêu và chiêu riêng nhân vật kèm

Ô 4 của từng nhân vật (tướng thường 100 năng lượng; tướng lịch sử và sứ quân là chiêu riêng). Mỗi khối ghi người dùng, nghề, hệ và tác dụng ở cấp 1 để hình khớp với chiêu. Tác dụng lấy từ code; tác dụng đổi thì giữ hình nếu chủ đề còn đúng.

### Tướng thường (42)

**Hỏa Vũ Liệu Nguyên · Hà Vân (Pháp sư, 🔥 Hỏa)** · `hoaVuLieuNguyen.png`

Mọi địch: sát thương, Thiêu đốt, phá ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a rain of fire droplets pouring from a burning cloud onto a reed field that bursts into spreading flames. Energy and color: crimson, orange and gold flames with embers. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Trấn Sơn Hộ Quân · Lê Thạch (Binh lính, ⛰️ Thổ)** · `tranSonHoQuan.png`

Cả đội: Khiên, Khiêu khích, Phản đòn.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a mountain-shaped wall of rock rising behind a planted spear and round rattan shield, a dome of protective light over three small banners. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Cam Lộ Hồi Xuân · Mai Thanh (Y sư, 💧 Thủy)** · `camLoHoiXuan.png`

Cả đội: hồi máu, giải hiệu ứng xấu, Đóng băng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a willow sprig dipped in a medicine gourd scattering sweet-dew drops that turn into tiny ice crystals as they fall. Energy and color: sapphire and cyan water energy with waves, droplets and frost. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Kim Ngân Ly Tán · Tô Kim (Mưu sĩ, ⚙️ Kim)** · `kimNganLyTan.png`

Địch đơn: sát thương, năng lượng, Câm lặng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a gold ingot and a pile of silver coins splitting apart, a black crow-feather fan slicing the silver thread that tied them together. Energy and color: silver-white steel and polished gold metallic energy, sharp glints and flying metal shards. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Phong Vân Biến Trận · Phùng Phong (Quân sư, 🌪️ Phong)** · `phongVanBienTran.png`

Mọi địch: xóa hiệu ứng tốt, Công−, năng lượng, xoay ô. Ảnh tham chiếu phong cách: `public/art/skills/baoTapCanKhon.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a command flag whipped in a spiral wind, clouds shifting around a 3x3 grid of square stones that is rotating. Energy and color: pale teal and white wind energy with spiralling gusts and drifting leaves. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Kim Qua Thiết Mã · Trần Cương (Tướng sĩ, ⚙️ Kim)** · `kimQuaThietMa.png`

Địch đơn: sát thương, Thủ−. Ảnh tham chiếu phong cách: `public/art/skills/thietKyTungHoanh.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a bronze dagger-axe halberd (qua) crossed in front of the head of a charging iron-armored warhorse, steel sparks. Energy and color: silver-white steel and polished gold metallic energy, sharp glints and flying metal shards. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Xích Hỏa Đoạt Kỳ · Lý Liệt (Tướng sĩ, 🔥 Hỏa)** · `xichHoaDoatKy.png`

Địch đơn: sát thương, Thiêu đốt, phá ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a long-handled pole-saber tearing a burning enemy war banner (plain cloth, no writing) off its pole, flames streaming. Energy and color: crimson, orange and gold flames with embers. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Băng Hà Phong Tỏa · Đào Lam (Pháp sư, 💧 Thủy)** · `bangHaPhongToa.png`

Mọi địch: sát thương, Đóng băng, phá ô. Ảnh tham chiếu phong cách: `public/art/skills/thuyKiepVanTrung.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a frozen river surging up into jagged glacier sheets that lock around a staff orb, icicles everywhere. Energy and color: sapphire and cyan water energy with waves, droplets and frost. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Thiên Lôi Giáng Thế · Vũ Lôi (Pháp sư, ⚡ Lôi)** · `thienLoiGiangThe.png`

Địch đơn: sát thương, năng lượng, phá ô. Ảnh tham chiếu phong cách: `public/art/skills/loiTruGiangThe.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a massive lightning bolt descending from storm clouds into a ritual staff orb and shattering the ground under it. Energy and color: violet and electric-purple lightning with crackling arcs. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Rễ Già Giữ Thành · Hoàng Mộc (Binh lính, 🌳 Mộc)** · `reGiaGiuThanh.png`

Cả đội: hồi dần, Khiên, Khiêu khích. Ảnh tham chiếu phong cách: `public/art/skills/coThuTranThien.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: huge ancient tree roots wrapping around and holding up a small wooden fortress gate, leaves and a soft protective glow. Energy and color: emerald and lime-green living-wood energy with leaves and vines. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Thiết Bích Đồng Thành · Cao Kiên (Binh lính, ⚙️ Kim)** · `thietBichDongThanh.png`

Bản thân: Thủ+, Phản đòn, Khiêu khích.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a wall of riveted iron plates with a bronze-bossed shield at its center, short spikes deflecting sparks back. Energy and color: silver-white steel and polished gold metallic energy, sharp glints and flying metal shards. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Xuân Mộc Vạn Sinh · Lục Diệp (Y sư, 🌳 Mộc)** · `xuanMocVanSinh.png`

Cả đội: hồi máu, hồi dần. Ảnh tham chiếu phong cách: `public/art/skills/linhMocHoiSinh.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a spring tree bursting into blossom, thousands of leaves spiralling upward in a healing green whirl. Energy and color: emerald and lime-green living-wood energy with leaves and vines. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Gió Lành Tẩy Uế · Bạch Sương (Y sư, 🌪️ Phong)** · `gioLanhTayUe.png`

Cả đội: giải hiệu ứng xấu, hồi máu, năng lượng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a soft breeze ribbon carrying white petals that washes away dark smoke around a white jade-colored gourd. Energy and color: pale teal and white wind energy with spiralling gusts and drifting leaves. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Hỏa Thiêu Kho Lương · Ninh Hỏa (Mưu sĩ, 🔥 Hỏa)** · `hoaThieuKhoLuong.png`

Mọi địch: cắt lương, năng lượng, Thiêu đốt. Ảnh tham chiếu phong cách: `public/art/skills/hoaThieuLienTrai.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a thatched granary storehouse engulfed in flames, rice sacks burning and sparks rising. Energy and color: crimson, orange and gold flames with embers. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Thủy Độn Ly Gián · Quách Ẩn (Mưu sĩ, 💧 Thủy)** · `thuyDonLyGian.png`

Mọi địch: Câm lặng, năng lượng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a dark-blue folding paper fan half dissolving into water mist, a torn letter sinking into a rippling pool. Energy and color: sapphire and cyan water energy with waves, droplets and frost. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Bát Trận Thạch Lũy · Tạ Thạch (Quân sư, ⛰️ Thổ)** · `batTranThachLuy.png`

Cả đội: Thủ+, Khiên. Ảnh tham chiếu phong cách: `public/art/skills/kienThanhBatDong.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: eight standing stone pillars arranged in an octagon around a central command pennant, earth energy linking them. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Lôi Trận Kinh Hồn · Mạc Vân (Quân sư, ⚡ Lôi)** · `loiTranKinhHon.png`

Mọi địch: Công−, năng lượng, phá ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a ring of formation banners struck by violet lightning around a cracked war drum, frightening arcs jumping between them. Energy and color: violet and electric-purple lightning with crackling arcs. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Trúc Lâm Phá Trận · Lâm Tùng (Tướng sĩ, 🌳 Mộc)** · `trucLamPhaTran.png`

Địch đơn: sát thương, hồi dần. Ảnh tham chiếu phong cách: `public/art/skills/thanhTrucBaoPhu.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a straight sword cutting through a thicket of sharp green bamboo stalks bursting up from the ground, leaves flying. Energy and color: emerald and lime-green living-wood energy with leaves and vines. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Lãng Đào Trảm · Hồ Lãng (Tướng sĩ, 💧 Thủy)** · `langDaoTram.png`

Địch đơn: sát thương, Đóng băng, năng lượng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a towering curling wave shaped like a crescent blade, a spear slicing through it, the foam freezing. Energy and color: sapphire and cyan water energy with waves, droplets and frost. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Sơn Hà Trấn Kích · Kha Sơn (Tướng sĩ, ⛰️ Thổ)** · `sonHaTranKich.png`

Địch đơn: sát thương, Khiên, phá ô. Ảnh tham chiếu phong cách: `public/art/skills/sonBangDiaLiet.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a Dong Son bronze war axe striking down and splitting a carved mountain-and-river relief, rock shards flying, a stone shield glow. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Lôi Đao Liên Trảm · Tống Tấn (Tướng sĩ, ⚡ Lôi)** · `loiDaoLienTram.png`

Địch đơn: sát thương, năng lượng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a long two-handed straight sword with three successive lightning slash arcs crossing in front of it. Energy and color: violet and electric-purple lightning with crackling arcs. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Truy Phong Đoạt Mệnh · Hứa Lăng (Tướng sĩ, 🌪️ Phong)** · `truyPhongDoatMenh.png`

Địch đơn: sát thương, năng lượng, xoay ô. Ảnh tham chiếu phong cách: `public/art/skills/phongNhanLietKhong.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a slender curved saber with a long teal tassel riding a spiralling gust, leaving fading afterimages. Energy and color: pale teal and white wind energy with spiralling gusts and drifting leaves. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Ngân Châm Tán Xạ · Chu Ngân (Pháp sư, ⚙️ Kim)** · `nganChamTanXa.png`

Mọi địch: sát thương, Thủ−.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: dozens of silver needles bursting outward in every direction from a polished silver orb. Energy and color: silver-white steel and polished gold metallic energy, sharp glints and flying metal shards. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Kinh Cức Triền Thân · Đàm Thảo (Pháp sư, 🌳 Mộc)** · `kinhCucTrienThan.png`

Mọi địch: sát thương, Công−.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: thorny brambles coiling around and binding a broken enemy spear, sharp green thorns. Energy and color: emerald and lime-green living-wood energy with leaves and vines. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Địa Mạch Bùng Phát · Doãn Nham (Pháp sư, ⛰️ Thổ)** · `diaMachBungPhat.png`

Mọi địch: sát thương, Thủ+, phá ô. Ảnh tham chiếu phong cách: `public/art/skills/diaChanTamQuan.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: glowing amber earth veins cracking open in the ground and erupting, a rock-headed staff planted in the middle. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Phong Ấn Cuồng Lưu · Liễu Yên (Pháp sư, 🌪️ Phong)** · `phongAnCuongLuu.png`

Mọi địch: sát thương, xóa hiệu ứng tốt, xoay ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a round wind seal disc engraved with a spiral (no letters) releasing a raging torrent of air. Energy and color: pale teal and white wind energy with spiralling gusts and drifting leaves. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Thủy Trại Liên Hoàn · Thái Hà (Binh lính, 💧 Thủy)** · `thuyTraiLienHoan.png`

Cả đội: Khiên, Khiêu khích, Đóng băng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a ring of rafts chained together into a floating water fortress, icy spray and a protective wave wall. Energy and color: sapphire and cyan water energy with waves, droplets and frost. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Viêm Giáp Hộ Doanh · Trương Viêm (Binh lính, 🔥 Hỏa)** · `viemGiapHoDoanh.png`

Bản thân: Khiên, Khiêu khích, Phản đòn, Thiêu đốt. Ảnh tham chiếu phong cách: `public/art/skills/giapDongHoThe.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a suit of lamellar armor wreathed in flames standing behind a soot-stained round rattan shield, burning aura. Energy and color: crimson, orange and gold flames with embers. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Chấn Lôi Thiết Vệ · Ông Chấn (Binh lính, ⚡ Lôi)** · `chanLoiThietVe.png`

Bản thân: Thủ+, Khiêu khích, năng lượng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: an iron watchtower struck by lightning, a broad-bladed spear and a small shield with a zigzag rim in front. Energy and color: violet and electric-purple lightning with crackling arcs. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Phong Lũy Hộ Kỳ · Mạnh Tường (Binh lính, 🌪️ Phong)** · `phongLuyHoKy.png`

Cả đội: Khiên, năng lượng, Khiêu khích.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a banner pole held upright inside a rampart of swirling teal gusts that form a shield ring. Energy and color: pale teal and white wind energy with spiralling gusts and drifting leaves. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Kim Châm Độ Mệnh · Châu Ngọc (Y sư, ⚙️ Kim)** · `kimChamDoMenh.png`

Cả đội: hồi máu, giải hiệu ứng xấu, Thủ+.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: golden acupuncture needles arranged in a fan above a white porcelain medicine gourd, rays of healing light. Energy and color: silver-white steel and polished gold metallic energy, sharp glints and flying metal shards. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Đan Hỏa Hồi Nguyên · Hồng Đan (Y sư, 🔥 Hỏa)** · `danHoaHoiNguyen.png`

Cả đội: hồi máu, Công+. Ảnh tham chiếu phong cách: `public/art/skills/ducHoaTrungSinh.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a small bronze alchemy cauldron over flames with a glowing red elixir pill rising out of it. Energy and color: crimson, orange and gold flames with embers. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hậu Thổ Dưỡng Nguyên · Bế Liên (Y sư, ⛰️ Thổ)** · `hauThoDuongNguyen.png`

Cả đội: hồi máu, Khiên.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a large brown gourd resting on fertile earth that sprouts young rice seedlings, an amber protective glow. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Lôi Châm Khởi Tử · Tiêu Minh (Y sư, ⚡ Lôi)** · `loiChamKhoiTu.png`

Cả đội: hồi máu, năng lượng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a pair of purple-glazed gourds tied together and a lightning-charged needle sparking a heartbeat pulse of light. Energy and color: violet and electric-purple lightning with crackling arcs. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Trúc Độc Mê Hồn · Nhan Trúc (Mưu sĩ, 🌳 Mộc)** · `trucDocMeHon.png`

Mọi địch: năng lượng, Câm lặng, hồi dần.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a cut bamboo tube spilling dizzying purple-green poison mist with drifting bamboo leaves and spiral swirls. Energy and color: emerald and lime-green living-wood energy with leaves and vines. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Đoạn Đạo Tuyệt Lương · Mã Nhạc (Mưu sĩ, ⛰️ Thổ)** · `doanDaoTuyetLuong.png`

Mọi địch: cắt lương, năng lượng, phá ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a mountain road collapsing, boulders crushing the wheel of a supply cart full of rice sacks. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Kinh Lôi Đoạt Khí · Từ Kinh (Mưu sĩ, ⚡ Lôi)** · `kinhLoiDoatKhi.png`

Địch đơn: sát thương, năng lượng, Câm lặng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a closed iron-ribbed fan used like a baton channelling a lightning bolt that tears glowing energy wisps out of the air. Energy and color: violet and electric-purple lightning with crackling arcs. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Phiêu Phong Ly Gián · Bùi Phiêu (Mưu sĩ, 🌪️ Phong)** · `phieuPhongLyGian.png`

Mọi địch: năng lượng, xóa hiệu ứng tốt, xoay ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a long white goose-feather fan blowing scattered letters and snapped alliance cords away in a gust. Energy and color: pale teal and white wind energy with spiralling gusts and drifting leaves. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Thiết Trận Phá Giáp · Nghiêm Thiết (Quân sư, ⚙️ Kim)** · `thietTranPhaGiap.png`

Mọi địch: Thủ−, Công+.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a grey square command flag above a phalanx of iron spear points breaking through a lamellar armor plate. Energy and color: silver-white steel and polished gold metallic energy, sharp glints and flying metal shards. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Thanh Lâm Bày Trận · Sầm Tuệ (Quân sư, 🌳 Mộc)** · `thanhLamBayTran.png`

Cả đội: hồi dần, Thủ+.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a green swallow-tailed pennant planted at the center of a ring of young trees forming a battle formation, leaves swirling. Energy and color: emerald and lime-green living-wood energy with leaves and vines. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Triều Dâng Vây Thành · Vi Triều (Quân sư, 💧 Thủy)** · `trieuDangVayThanh.png`

Mọi địch: Công−, Đóng băng. Ảnh tham chiếu phong cách: `public/art/skills/bachDangTrieuDang.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: rising tide waves encircling a small walled citadel, a blue wave-edged banner, the spray turning to ice. Energy and color: sapphire and cyan water energy with waves, droplets and frost. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hỏa Công Liên Kế · Tôn Diệm (Quân sư, 🔥 Hỏa)** · `hoaCongLienKe.png`

Mọi địch: Công−, Thiêu đốt, năng lượng. Ảnh tham chiếu phong cách: `public/art/skills/hoaThieuLienTrai.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a chain of burning fire-ships linked by iron chains on dark water, a red swallow-tailed command flag. Energy and color: crimson, orange and gold flames with embers. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

### Tướng lịch sử (6)

**Định Quốc Hỏa Kỳ · Nguyễn Bặc (Tướng sĩ, 🔥 Hỏa)** · `dinhQuocHoaKy.png`

Địch đơn: sát thương, Thiêu đốt, Công+.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a great flaming war banner (plain red cloth, no writing) planted beside a broad saber tied with a red ribbon. Energy and color: crimson, orange and gold flames with embers. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ngoại Giáp Hộ Quân · Đinh Điền (Binh lính, ⛰️ Thổ)** · `ngoaiGiapHoQuan.png`

Cả đội: Khiên, Khiêu khích, Phản đòn.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a heavy outer armor coat standing like a wall, a spear with white reed feathers and a round rattan shield, an ochre protective glow. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Đô Hộ Phủ Lệnh · Lưu Cơ (Mưu sĩ, ⚙️ Kim)** · `doHoPhuLenh.png`

Mọi địch: năng lượng, Câm lặng, Thủ−.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a blank bronze official command tablet lying on a white feather fan, silver chains coiling around both. Energy and color: silver-white steel and polished gold metallic energy, sharp glints and flying metal shards. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hoa Lư Thảo Dược · Trịnh Tú (Y sư, 🌳 Mộc)** · `hoaLuThaoDuoc.png`

Cả đội: hồi máu, giải hiệu ứng xấu, hồi dần.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a double-bulb medicine gourd with healing herbs growing out of its mouth, small limestone karst peaks behind it. Energy and color: emerald and lime-green living-wood energy with leaves and vines. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Thập Đạo Lôi Binh · Lê Hoàn (Quân sư, ⚡ Lôi)** · `thapDaoLoiBinh.png`

Mọi địch: sát thương, Công−, năng lượng. Ảnh tham chiếu phong cách: `public/art/skills/cuuTieuLoiPhat.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: ten lightning bolts striking down in a wide fan behind a small triangular command flag and a bundle of bamboo slips. Energy and color: violet and electric-purple lightning with crackling arcs. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Nam Việt Vương Ấn · Đinh Liễn (Pháp sư, 💧 Thủy)** · `namVietVuongAn.png`

Mọi địch: sát thương, Đóng băng, phá ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a square royal jade seal with a blank face resting on a cresting wave, the water swirling and freezing around it. Energy and color: sapphire and cyan water energy with waves, droplets and frost. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

### Sứ quân, chiêu riêng (12)

**Bố Hải Trấn Giang · Trần Lãm (Quân sư, 💧 Thủy)** · `boHaiTranGiang.png`

Mọi địch: sát thương, Công−, Đóng băng, phá ô. Ảnh tham chiếu phong cách: `public/art/skills/bachDangTrieuDang.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a war boat breaking through river waves at an estuary under a command flag, the waves freezing at their crests. Energy and color: sapphire and cyan water energy with waves, droplets and frost. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Bạch Hổ Xuất Sơn · Phạm Bạch Hổ (Tướng sĩ, 🔥 Hỏa)** · `bachHoXuatSon.png`

Địch đơn: sát thương, Thiêu đốt, Công+.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a white tiger leaping out of a mountain wreathed in flames, a heavy notched saber in the foreground. Energy and color: crimson, orange and gold flames with embers. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Ngô Gia Di Mưu · Ngô Xương Xí (Mưu sĩ, ⚙️ Kim)** · `ngoGiaDiMuu.png`

Địch đơn: sát thương, năng lượng, Câm lặng, phá ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: an old closed lacquered scroll box beside a white feather fan and one gold coin, silver light sealing the box shut. Energy and color: silver-white steel and polished gold metallic energy, sharp glints and flying metal shards. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Đường Lâm Phong Khởi · Ngô Nhật Khánh (Quân sư, 🌪️ Phong)** · `duongLamPhongKhoi.png`

Mọi địch: sát thương, xóa hiệu ứng tốt, Công−, xoay ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a gust rising from an old laterite village gate, a command flag streaming in the swirling wind. Energy and color: pale teal and white wind energy with spiralling gusts and drifting leaves. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Tam Đái Kiên Thành · Nguyễn Khoan (Binh lính, ⛰️ Thổ)** · `tamDaiKienThanh.png`

Cả đội: Khiên, Khiêu khích, Phản đòn. Ảnh tham chiếu phong cách: `public/art/skills/kienThanhBatDong.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a three-tiered earthen rampart with a spear and round shield planted on the top tier, a rock protective glow. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Phong Châu Lôi Kích · Kiều Công Hãn (Pháp sư, ⚡ Lôi)** · `phongChauLoiKich.png`

Mọi địch: sát thương, năng lượng, phá ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: lightning striking a Dong Son bronze drum, a ritual staff with a thunder orb beside it. Energy and color: violet and electric-purple lightning with crackling arcs. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hồi Hồ Sinh Khí · Kiều Thuận (Y sư, 🌳 Mộc)** · `hoiHoSinhKhi.png`

Cả đội: hồi máu, hồi dần.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a marsh lake where lotuses bloom and green life energy rises, a bronze-capped gourd floating at the center. Energy and color: emerald and lime-green living-wood energy with leaves and vines. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Siêu Loại Phá Giáp · Lý Khuê (Tướng sĩ, ⚙️ Kim)** · `sieuLoaiPhaGiap.png`

Địch đơn: sát thương, Thủ−, phá ô. Ảnh tham chiếu phong cách: `public/art/skills/doanKimNhatTuyen.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a straight double-edged bronze sword cleaving through a stack of armor plates, sparks and steel shards. Energy and color: silver-white steel and polished gold metallic energy, sharp glints and flying metal shards. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Tiên Du Đoạt Lương · Nguyễn Thủ Tiệp (Mưu sĩ, 💧 Thủy)** · `tienDuDoatLuong.png`

Mọi địch: sát thương, cắt lương, năng lượng, Đóng băng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a white feather fan sweeping rice grains out of a granary into a cold water mist that freezes them. Energy and color: sapphire and cyan water energy with waves, droplets and frost. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Tế Giang Thủy Trận · Lữ Đường (Pháp sư, 💧 Thủy)** · `teGiangThuyTran.png`

Mọi địch: sát thương, Đóng băng, biến ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a water vortex formation spinning in a river, square stones turning into water drops as they are pulled in. Energy and color: sapphire and cyan water energy with waves, droplets and frost. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Phù Liệt Hỏa Lũy · Nguyễn Siêu (Binh lính, 🔥 Hỏa)** · `phuLietHoaLuy.png`

Bản thân: Khiên, Khiêu khích, Thiêu đốt.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: an earthen fort ringed by a wall of fire, a spear and round shield planted at its gate. Energy and color: crimson, orange and gold flames with embers. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Đỗ Động Kiên Tâm · Đỗ Cảnh Thạc (Tướng sĩ, ⛰️ Thổ)** · `doDongKienTam.png`

Địch đơn: sát thương, Thủ+, phá ô. Ảnh tham chiếu phong cách: `public/art/skills/thaiSonApDinh.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a massive long-handled war hammer with a square bronze head slamming onto a rock, a firm stone core glowing at the impact. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

### Xạ thủ và Sát thủ (14)

**Thiết Nỏ Phá Thành · Bạch Nỏ Lang (Xạ thủ, ⚙️ Kim)** · `rb_bnl_thietNoPhaThanh.png`

Địch đơn: sát thương, Thủ−, phá ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a heavy iron crossbow firing a bolt that punches through a fortified city gate, iron shards flying. Energy and color: silver-white steel and polished gold metallic energy, sharp glints and flying metal shards. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Lục Tiễn Trói Đường · Thanh Lâm Xạ (Xạ thủ, 🌳 Mộc)** · `rb_tlx_lucTienTroiDuong.png`

Địch đơn: sát thương, Thủ−, hồi máu.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: green-fletched arrows trailing vines that bind a path, healing leaves sprouting along it. Energy and color: emerald and lime-green living-wood energy with leaves and vines. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Liễu Diệp Tỏa Giang · Lam Giang Phi Diệp (Xạ thủ, 💧 Thủy)** · `rb064_lieuDiepToaGiang.png`

Địch đơn: sát thương, Đóng băng, năng lượng. Ảnh tham chiếu phong cách: `public/art/skills/hanBangTien.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: willow-leaf-shaped arrowheads raining over a river and locking its surface in ice. Energy and color: sapphire and cyan water energy with waves, droplets and frost. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Xích Luân Liệt Trận · Xích Diệm Luân (Xạ thủ, 🔥 Hỏa)** · `rb065_xichLuanLietTran.png`

Mọi địch: sát thương, Thiêu đốt, phá ô. Ảnh tham chiếu phong cách: `public/art/skills/xichDiemTien.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a spinning wheel of flaming arrows blazing across a battlefield, scorched cracked ground. Energy and color: crimson, orange and gold flames with embers. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Trấn Sơn Hộ Trận · Trấn Sơn Thạch (Xạ thủ, ⛰️ Thổ)** · `rb066_tranSonHoTran.png`

Địch đơn: sát thương, Công−, Khiên.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a heavy arrow pinned into the ground raising a ring of standing stone shields. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Lôi Châm Tước Khí · Lôi Minh Xạ (Xạ thủ, ⚡ Lôi)** · `rb067_loiChamTuocKhi.png`

Địch đơn: sát thương, năng lượng, Câm lặng. Ảnh tham chiếu phong cách: `public/art/skills/loiTienXuyenVan.webp`.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: thin lightning-needle arrows piercing through and draining wisps of violet energy. Energy and color: violet and electric-purple lightning with crackling arcs. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Phong Lăng Nhiễu Trận · Tật Phong Lăng (Xạ thủ, 🌪️ Phong)** · `rb068_phongLangNhieuTran.png`

Mọi địch: sát thương, Công−, xoay ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: arrows riding a cyclone and scattering a formation of small banners. Energy and color: pale teal and white wind energy with spiralling gusts and drifting leaves. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Thiết Ấn Đoạt Mệnh · Bạch Phong Đao (Sát thủ, ⚙️ Kim)** · `rb069_ultimate.png`

Địch đơn: sát thương, Thủ−.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: an iron dagger stamping a glowing steel seal mark onto cracked armor. Energy and color: silver-white steel and polished gold metallic energy, sharp glints and flying metal shards. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Độc Ảnh Tiềm Châm · Độc Ảnh (Sát thủ, 🌳 Mộc)** · `rb070_ultimate.png`

Địch đơn: sát thương, Độc.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a thin poison needle sliding out of a dark sleeve, dripping green venom, shadowy leaves. Energy and color: emerald and lime-green living-wood energy with leaves and vines. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Hàn Giang Tàng Nhận · Hàn Giang Khách (Sát thủ, 💧 Thủy)** · `rb071_ultimate.png`

Địch đơn: sát thương, năng lượng, Công−.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a blade hidden just under the surface of a cold river, frost breath rising from the water. Energy and color: sapphire and cyan water energy with waves, droplets and frost. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Xích Dạ Song Sát · Xích Dạ (Sát thủ, 🔥 Hỏa)** · `rb072_ultimate.png`

Địch đơn: sát thương.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: twin crimson daggers crossing under a red moon, two fire trails curling around them. Energy and color: crimson, orange and gold flames with embers. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Địa Phục Liệt Trảo · Địa Ẩn (Sát thủ, ⛰️ Thổ)** · `rb073_ultimate.png`

Địch đơn: sát thương, Thủ−, Thủ+.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: claw-like blades bursting up out of cracked earth, rock chips flying. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Bạo Vũ Lê Hoa · Lôi Ảnh (Sát thủ, ⚡ Lôi)** · `rb074_ultimate.png`

Địch đơn: sát thương, năng lượng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a storm burst of white pear-blossom petals mixed with violet lightning needles. Energy and color: violet and electric-purple lightning with crackling arcs. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vô Thanh Đoạt Phách · Vô Ảnh (Sát thủ, 🌪️ Phong)** · `rb075_ultimate.png`

Địch đơn: sát thương, năng lượng, Câm lặng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a feather-thin blade slicing a pale wisp of soul light in silent drifting mist. Energy and color: pale teal and white wind energy with spiralling gusts and drifting leaves. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

## 7. Nhân vật đặc biệt (DRAFT)

Đinh Ngọc ([thiết kế](../../03-characters/dinh-ngoc.md)) và Vũ Phong ([thiết kế](../../03-characters/vu-phong.md)) có bộ 6 chiêu cố định, mỗi chiêu một hệ. Chỉ tạo khi hai nhân vật được duyệt vào roster.

**Đinh Ngọc · Ô 1 · Kim Quang Phá Trận** · `dn_kimQuangPhaTran.png`

⚙️ Kim; địch đơn: sát thương.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a straight sword releasing a golden light slash that breaks a formation of small banners. Energy and color: silver-white steel and polished gold metallic energy, sharp glints and flying metal shards. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Đinh Ngọc · Ô 2 · Thủy Ảnh Xuyên Lưu** · `dn_thuyAnhXuyenLuu.png`

💧 Thủy; địch đơn: sát thương, Công−.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a sword and its reflection piercing together through flowing water. Energy and color: sapphire and cyan water energy with waves, droplets and frost. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Đinh Ngọc · Ô 3 · Hỏa Bộ Đoạt Mệnh** · `dn_hoaBoDoatMenh.png`

🔥 Hỏa; địch đơn: sát thương.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: fiery footprints leading into a lunging sword thrust trailing flame. Energy and color: crimson, orange and gold flames with embers. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Đinh Ngọc · Ô 4 · Vạn Tượng Quy Nhất** · `dn_vanTuongQuyNhat.png`

Đa hệ; địch đơn: sát thương, giải hiệu ứng xấu, Khiên.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: seven small orbs (white, green, blue, red, ochre, violet, teal) converging into one jade pendant crossed by a straight sword. Energy and color: a balanced ring of seven element colors (silver, green, blue, red, ochre, violet, teal) around a gold core. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Đinh Ngọc · Ô 5 · Thổ Ấn Trấn Tâm** · `dn_thoAnTranTam.png`

⛰️ Thổ; bản thân: Khiên, Thủ+.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: an earth seal stamping onto a heavy round stone shield, the shield glowing amber. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Đinh Ngọc · Ô 6 · Lôi Văn Khai Lộ** · `dn_loiVanKhaiLo.png`

⚡ Lôi; mọi địch: sát thương, phá ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: storm clouds with lightning patterns parting to open a bright path. Energy and color: violet and electric-purple lightning with crackling arcs. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ Phong · Ô 1 · Phong Khởi Vân Động** · `vp_phongKhoiVanDong.png`

🌪️ Phong; địch đơn: sát thương, xoay ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a rising gust lifting a sea of clouds into a spiral. Energy and color: pale teal and white wind energy with spiralling gusts and drifting leaves. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Vũ Phong · Ô 2 · Mưa Giăng Ý Loạn** · `vp_muaGiangYLoan.png`

💧 Thủy; địch đơn: sát thương, Đóng băng.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a curtain of slanting rain freezing into icy streaks. Energy and color: sapphire and cyan water energy with waves, droplets and frost. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ Phong · Ô 3 · Lục Diệp Dẫn Lộ** · `vp_lucDiepDanLo.png`

🌳 Mộc; một đồng đội: giải hiệu ứng xấu, hồi máu.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: green leaves forming a glowing path that guides forward, a healing sprig. Energy and color: emerald and lime-green living-wood energy with leaves and vines. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

**Vũ Phong · Ô 4 · Vân Du Thiên Lý** · `vp_vanDuThienLy.png`

Đa hệ; mọi địch: sát thương, xóa hiệu ứng tốt, xoay ô.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a wanderer's conical straw hat riding on clouds across a long distance, a spiralling seven-colored element swirl. Energy and color: a balanced ring of seven element colors (silver, green, blue, red, ochre, violet, teal) around a gold core. This is a character's ultimate skill: make it grander than a normal skill, with a larger burst of energy behind the subject and a more elaborate gold filigree crest, but still one clear subject. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ Phong · Ô 5 · Địa Mạch Hộ Đội** · `vp_diaMachHoDoi.png`

⛰️ Thổ; cả đội: Khiên, Thủ+.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: glowing earth veins rising out of the ground into a protective wall. Energy and color: ochre, amber and gold earth energy with cracked rock and dust. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Vũ Phong · Ô 6 · Cuồng Phong Đổi Cục** · `vp_cuongPhongDoiCuc.png`

🌪️ Phong; bản thân: xoay ô, Công+.

```text
Square 1024x1024 fantasy game skill icon for a turn-based match-3 RPG. Subject: a raging gust spinning a 3x3 grid of square stones. Energy and color: pale teal and white wind energy with spiralling gusts and drifting leaves. Style: match an existing set of hand-painted skill icons — rich semi-realistic digital painting, high detail, glossy highlights, bright rim light, saturated colors, strong contrast, ornate curling gold filigree scrolls wrapping around the subject like a crest, one bold central silhouette filling about 80% of the canvas that stays readable at 48 px. Culture: 10th-century Vietnam with Dong Son bronze-drum motifs where they fit; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no frame, no border, no square panel or circle badge behind the subject, no ground shadow. Background: flat solid pure magenta (#ff00ff), completely uniform, nothing else on it.
```

## 8. Khi ảnh ra sai

| Lỗi | Sửa |
|---|---|
| Có khung tròn/vuông hoặc nền tối sau vật | Thêm "isolated subject, the background must stay one flat chroma color" và tạo lại; ô nền do code vẽ |
| Có chữ Hán, chữ Latin hay số | Thêm "absolutely no writing or symbols that look like writing" |
| Rồng, phượng, mây cụm kiểu Trung Hoa | Thêm "no dragon, no phoenix, no ruyi clouds"; dùng sóng, chim Lạc, mặt trời trống đồng |
| Quá rối, ở 48 px thành một đốm màu | Giảm chi tiết: "one subject only, fewer small particles, bigger shapes" |
| Màu lệch sang hệ khác | Nhắc lại dòng "Energy and color" ở đầu prompt, đính kèm một ảnh cùng hệ trong `public/art/skills/` |
| Hai tuyệt chiêu cùng hệ ra giống nhau | Đổi bố cục: một cái nhìn chếch từ dưới, một cái nhìn ngang; giữ vật chính khác nhau như trong prompt |
