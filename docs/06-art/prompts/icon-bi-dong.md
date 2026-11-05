# Prompt icon bị động dùng chung (29 hình)

> Cập nhật: 05/11/2026
> Trạng thái: **IMPLEMENTED** (05/11/2026) — 29 ảnh Shan gửi ở `public/art/passives/<mã>.webp` (128 px, cắt theo vòng tròn đều), vẽ qua `PassiveIcon` (`src/app/game/art/passives.tsx`) ở landing, `SkillDetails`, dấu Cơ hội trong trận và `/demo/art`.

29 bị động dùng chung: 7 bị động nghề 1 (Cơ hội) và 22 truy kích dùng chung theo nghề và hệ. Mỗi cái hiện ở nhiều nhân vật. 21 bị động riêng của từng tướng làm sau. Prompt chiêu chủ động ở [Prompt biểu tượng kỹ năng](icon-ky-nang.md). Danh sách lấy từ `COMBO_PASSIVES` và `CHASE_PASSIVES` trong `src/core/battle/` ngày 05/11.

## Cách dùng

- Mỗi khối là một hình. Tạo ở 1024×1024 rồi gửi Claude PNG đặt đúng tên trong khối (ví dụ `passive_pursuit.png`). Không cần đặt tên cũng được, Claude ghép theo hình như các đợt trước.
- Hệ Mộc, Phong và nghề Y sư, Xạ thủ dùng nền **hồng `#ff00ff`**, còn lại dùng **xanh lá `#00b140`**.
- Nên đính kèm 1–2 ảnh chiêu đã có làm tham chiếu phong cách. Prompt cố ý **đơn giản, gọn và tròn hơn** ô chiêu chủ động, vì code sẽ đặt bị động trong khung tròn nhỏ để nhìn là phân biệt được.
- Không chữ, không người, không khung. Giữ clean-room như các bộ trước.

## Nhóm A · Bị động nghề 1 (Cơ hội, 7 hình)

**Thừa thắng** (Tướng sĩ) · `passive_pursuit.png`

Đồng đội phá giáp/xua tan → đòn kế vào mục tiêu đó +20%.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A cracked bronze shield with a saber point already pressing into the crack, a small arrow-like spark showing the follow-up strike. Energy and color: vermilion red and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hội tụ** (Pháp sư) · `passive_resonance.png`

Đồng đội Đóng băng/Câm lặng → đòn kế +20%.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: An ice-bound crystal orb with a faint purple spell rune converging into it from two sides. Energy and color: violet and icy blue with gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hộ vệ phản kích** (Binh lính) · `passive_retaliation.png`

Khiên đồng đội đỡ đòn → đòn kế +20%.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A round bronze-drum shield with an incoming strike shattering on it and a spear tip springing out from behind the shield. Energy and color: earthy brown bronze and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Tiếp sức** (Y sư) · `passive_renewal.png`

Đồng đội gây mất HP → kỹ năng hồi/Khiên kế +25%.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A small herbal gourd with a rising stream of glowing green drops swelling larger as they rise. Energy and color: jade green and soft gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Phong lệnh tiếp ứng** (Quân sư) · `passive_phongLenh.png`

Đồng đội Đóng băng/Câm lặng → đòn kế +15%.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A small command flag on a short pole bending in a gust, a chain of wind ribbons pointing at a frozen target mark. Energy and color: indigo blue and pale wind white with gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Đoạn tiếp tế** (Mưu sĩ) · `passive_interdiction.png`

Đồng đội khống chế/xua tan → kỹ năng trừ năng lượng kế trừ thêm 10.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A sealed rice-supply sack tied with a cut rope, grains of golden energy spilling and fading away. Energy and color: earth ochre and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hiệp lực** (Xạ thủ / Sát thủ) · `passive_coordination.png`

Đồng đội hồi/Khiên → kỹ năng kế giảm 10 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: Two bamboo arrows crossed and bound by one green cord, a small energy droplet glowing at the knot. Energy and color: leaf green and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

## Nhóm B · Truy kích theo nghề (8 hình)

**Liên trảm** (Tướng sĩ) · `passive_martial.png`

Đồng đội phá giáp → truy kích 55% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: Two saber slash arcs following one after another through a cracked armor plate. Energy and color: vermilion red and steel with gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Chú kích** (Pháp sư) · `passive_arcane.png`

Đồng đội khống chế → truy kích 50% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A spell bolt of violet light striking down onto a ring of chains. Energy and color: violet and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Tiếp phòng** (Binh lính) · `passive_guardian.png`

Đồng đội hồi HP → cấp Khiên 6% HP.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A small bronze shield forming from a green healing drop. Energy and color: bronze brown, jade green and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Cứu viện** (Y sư) · `passive_medic.png`

Đồng đội gây mất HP → hồi người yếu nhất 5% HP.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A healing gourd tipping a single bright drop onto a lotus leaf. Energy and color: jade green and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Thừa hư** (Mưu sĩ) · `passive_strategist.png`

Đồng đội xua tan → trừ thêm 8 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A broken magic seal with a folded paper fan sweeping its fragments away. Energy and color: earth ochre and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Tiếp lệnh** (Quân sư) · `passive_commander.png`

Đồng đội hồi HP → cấp 8 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A small war drum with a green healing glow turning into golden energy sparks rising from the drumhead. Energy and color: indigo, jade and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Chờ thời phá giáp** (Xạ thủ) · `passive_marksmanPrepared.png`

Đồng đội phá giáp → truy kích 40% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A drawn bamboo bow with an arrow aimed at a crack in an armor plate. Energy and color: leaf green and steel with gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Chờ thời khống chế** (Sát thủ) · `passive_assassinPrepared.png`

Đồng đội khống chế → truy kích 45% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A short dagger half hidden in shadow beside a chained target mark. Energy and color: dark plum purple and steel with gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

## Nhóm C · Truy kích theo hệ (14 hình, 2 mỗi hệ)

**Kim phá** (Kim) · `passive_kim1.png`

Kỹ năng gây mất HP → giảm DEF 10%.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A steel needle piercing a small armor scale and cracking it. Energy and color: silver steel and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Kim truy** (Kim) · `passive_kim2.png`

Phá giáp → truy kích 35% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A metal throwing blade flying after a shattered armor fragment. Energy and color: silver steel and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Mộc sinh** (Mộc) · `passive_moc1.png`

Gây mất HP → hồi 4% HP.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A sprouting seedling with two leaves glowing with life. Energy and color: emerald and fresh green. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Mộc hộ** (Mộc) · `passive_moc2.png`

Hồi HP → Khiên 4% HP.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A rounded shield woven from living vines and leaves. Energy and color: emerald and fresh green with gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Thủy tiếp** (Thủy) · `passive_thuy1.png`

Khống chế → hồi 5% HP.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A single water droplet with a small frozen ring around it. Energy and color: aqua blue and ice white. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Thủy dẫn** (Thủy) · `passive_thuy2.png`

Hồi HP → cấp 6 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A small stream curling into a spiral and glowing with golden energy at its center. Energy and color: aqua blue and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hỏa truy** (Hỏa) · `passive_hoa1.png`

Phá giáp → truy kích 40% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A flaming arrowhead chasing after a broken armor plate. Energy and color: crimson, orange and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hỏa phá** (Hỏa) · `passive_hoa2.png`

Gây mất HP → giảm DEF 12%.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A red-hot armor scale melting and dripping. Energy and color: crimson, orange and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Thổ hộ** (Thổ) · `passive_tho1.png`

Hồi HP → Khiên 5% HP.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A solid stone slab shield with a faint healing glow in its center. Energy and color: ochre, amber and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Thổ chấn** (Thổ) · `passive_tho2.png`

Khiên đỡ đòn → truy kích 35% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A stone shield with a shockwave of earth spikes bursting outward from its rim. Energy and color: ochre, amber and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Lôi truy** (Lôi) · `passive_loi1.png`

Khống chế → truy kích 45% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A lightning bolt striking a chain ring. Energy and color: electric violet and white. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Lôi đoạt** (Lôi) · `passive_loi2.png`

Gây mất HP → trừ 6 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A small storm cloud sucking golden energy sparks upward. Energy and color: electric violet and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Phong tiếp** (Phong) · `passive_phong1.png`

Xua tan → truy kích 40% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A gust tearing a magic seal apart, the wind curling into a blade-like crescent. Energy and color: pale jade and white. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Phong dẫn** (Phong) · `passive_phong2.png`

Gây mất HP → cấp 5 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A swirling wind spiral carrying golden energy sparks. Energy and color: pale jade, white and gold. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but SIMPLER and CALMER: one compact central object, a soft round glow behind it, a thin gold filigree ring around it like a medallion, subject fits inside a circle covering about 70% of the canvas, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no border panel, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```
