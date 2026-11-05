# Prompt icon bị động Nộ của Đinh Bộ Lĩnh (7 hình)

> Cập nhật: 05/11/2026
> Trạng thái: **IMPLEMENTED** — đủ 7 ảnh ở `public/art/passives/rage_<hệ>.webp` (ô "Bị động khi đầy Nộ" ở landing, chip trên thẻ thủ lĩnh khi bị động đang chạy); bộ bị động khác ở [dùng chung](icon-bi-dong.md) và [riêng](icon-bi-dong-rieng.md).

Bị động thủ lĩnh kích hoạt khi Nộ đạt tối đa, mỗi hệ một cái (`PASSIVES` trong `src/core/battle/skills.ts`, chữ mô tả ở `passiveText` trong `labels.ts`). Hiện chỉ có chữ ở landing (ô "Bị động khi đầy Nộ") và màn chờ trận.

## Cách dùng

- Mỗi khối một hình, tạo 1024×1024; gửi Claude PNG tên `passive_rage_<hệ>.png` hoặc không cần tên, Claude ghép theo hình.
- Hệ Mộc, Phong dùng nền **hồng `#ff00ff`**, còn lại **xanh lá `#00b140`**.
- **Nền tròn đều tuyệt đối**, không elip (Shan yêu cầu 05/11). Viền là mặt trống đồng dày và cầu kỳ hơn bị động thường, thêm ánh đỏ Nộ bên trong viền, để nhìn là biết đây là bị động thủ lĩnh. Claude vẫn cắt theo vòng tròn khi xử lý.
- Không chữ, không người, không khung vuông. Giữ clean-room.

## Kim Cốt Thiết Thân (Kim) · `passive_rage_kim.png`

Đánh thường và kỹ năng của thủ lĩnh bỏ qua một phần DEF; kỹ năng xuyên Khiên.

```text
Square 1024x1024 fantasy game LEADER RAGE PASSIVE emblem for a turn-based match-3 RPG. Subject: A heavy steel spearhead with a glowing gold core punching straight through a layered armor plate and a translucent shield bubble at once. Energy and color: silver steel, white-gold sparks. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on. The rim is the face of a Dong Son bronze drum: a gold ring with a thin band of repeating triangle and flying-bird motifs and small star points, slightly thicker and more ornate than a normal passive emblem, with a faint crimson rage glow just inside the rim. Soft round glow behind the subject; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast) with a stronger, more heroic feeling than ordinary passives; one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

## Sinh Sôi Bất Tận (Mộc) · `passive_rage_moc.png`

Cả đội Hồi phục một phần máu tối đa mỗi lượt.

```text
Square 1024x1024 fantasy game LEADER RAGE PASSIVE emblem for a turn-based match-3 RPG. Subject: A small sacred banyan tree with spreading roots, three glowing seed pods drifting up from its canopy, endless renewal. Energy and color: emerald, fresh green and soft gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on. The rim is the face of a Dong Son bronze drum: a gold ring with a thin band of repeating triangle and flying-bird motifs and small star points, slightly thicker and more ornate than a normal passive emblem, with a faint crimson rage glow just inside the rim. Soft round glow behind the subject; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast) with a stronger, more heroic feeling than ordinary passives; one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

## Hàn Tuyền (Thủy) · `passive_rage_thuy.png`

Đóng băng ngay 1 đối thủ; kỹ năng sát thương có cơ hội Đóng băng thêm.

```text
Square 1024x1024 fantasy game LEADER RAGE PASSIVE emblem for a turn-based match-3 RPG. Subject: A cold mountain spring bursting upward and freezing mid-air into a crown of sharp ice crystals. Energy and color: icy aqua blue, frost white and silver. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on. The rim is the face of a Dong Son bronze drum: a gold ring with a thin band of repeating triangle and flying-bird motifs and small star points, slightly thicker and more ornate than a normal passive emblem, with a faint crimson rage glow just inside the rim. Soft round glow behind the subject; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast) with a stronger, more heroic feeling than ordinary passives; one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

## Liệt Hỏa Tâm (Hỏa) · `passive_rage_hoa.png`

Mọi sát thương của thủ lĩnh tăng, đổi lại DEF bản thân giảm.

```text
Square 1024x1024 fantasy game LEADER RAGE PASSIVE emblem for a turn-based match-3 RPG. Subject: A blazing heart-shaped flame burning inside a cracked bronze chest-plate disk, the fire breaking through the cracks. Energy and color: crimson, orange and molten gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on. The rim is the face of a Dong Son bronze drum: a gold ring with a thin band of repeating triangle and flying-bird motifs and small star points, slightly thicker and more ornate than a normal passive emblem, with a faint crimson rage glow just inside the rim. Soft round glow behind the subject; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast) with a stronger, more heroic feeling than ordinary passives; one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

## Bàn Thạch (Thổ) · `passive_rage_tho.png`

Thủ lĩnh nhận Khiên theo máu tối đa và Phản đòn.

```text
Square 1024x1024 fantasy game LEADER RAGE PASSIVE emblem for a turn-based match-3 RPG. Subject: A massive square foundation stone engraved with a drum star, small rock shards bouncing back off its face. Energy and color: ochre, amber and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on. The rim is the face of a Dong Son bronze drum: a gold ring with a thin band of repeating triangle and flying-bird motifs and small star points, slightly thicker and more ornate than a normal passive emblem, with a faint crimson rage glow just inside the rim. Soft round glow behind the subject; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast) with a stronger, more heroic feeling than ordinary passives; one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

## Điện Quang Tốc Kích (Lôi) · `passive_rage_loi.png`

Trừ năng lượng mọi đối thủ; ghép ô âm dương được thêm năng lượng.

```text
Square 1024x1024 fantasy game LEADER RAGE PASSIVE emblem for a turn-based match-3 RPG. Subject: A forked lightning bolt splitting into three branches, each draining a small glowing energy orb toward the center. Energy and color: electric violet, white and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on. The rim is the face of a Dong Son bronze drum: a gold ring with a thin band of repeating triangle and flying-bird motifs and small star points, slightly thicker and more ornate than a normal passive emblem, with a faint crimson rage glow just inside the rim. Soft round glow behind the subject; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast) with a stronger, more heroic feeling than ordinary passives; one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

## Thuận Phong (Phong) · `passive_rage_phong.png`

Được xoay lốc xoáy miễn phí trước kỹ năng và đổi ô.

```text
Square 1024x1024 fantasy game LEADER RAGE PASSIVE emblem for a turn-based match-3 RPG. Subject: A tight swirling whirlwind lifting a small square of board tiles and turning them, a fair-wind spiral. Energy and color: pale jade, white and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on. The rim is the face of a Dong Son bronze drum: a gold ring with a thin band of repeating triangle and flying-bird motifs and small star points, slightly thicker and more ornate than a normal passive emblem, with a faint crimson rage glow just inside the rim. Soft round glow behind the subject; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast) with a stronger, more heroic feeling than ordinary passives; one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```
