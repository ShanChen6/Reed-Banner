# Prompt icon bị động riêng (21 hình)

> Cập nhật: 05/11/2026
> Trạng thái: **IMPLEMENTED** — đủ 21 ảnh ở `public/art/passives/<mã>.webp` (PASSIVE_ART trong `src/app/game/art/passives.tsx`); bộ 29 bị động dùng chung ở [Prompt icon bị động dùng chung](icon-bi-dong.md).

21 bị động chỉ một nhân vật có: 14 của Xạ thủ/Sát thủ bản mở rộng, 3 của Đinh Ngọc, 4 của Trần Vũ Phong. Danh sách lấy từ `CHASE_PASSIVES` (`src/core/battle/`) ngày 05/11.

## Cách dùng

- Mỗi khối là một hình, tạo ở 1024×1024. Gửi Claude PNG đặt đúng tên trong khối (ví dụ `passive_hoaCotTruyKich.png`) hoặc không cần tên, Claude ghép theo hình.
- Hệ Mộc, Phong dùng nền **hồng `#ff00ff`**, còn lại **xanh lá `#00b140`**.
- **Nền tròn phải tròn đều tuyệt đối** (Shan yêu cầu 05/11 vì bộ 29 ra hơi méo): prompt đã ghi rõ hình tròn hình học, rộng bằng cao, nhìn thẳng, không elip, không nghiêng. Ảnh ra vẫn méo thì tạo lại; Claude cũng có thể cắt theo vòng tròn khi xử lý.
- Không chữ, không người, không khung vuông. Giữ clean-room.

## Xạ thủ (7 hình)

**Nỏ thành bền bỉ** (Bạch Nỏ Lang · Kim) · `passive_noThanhBenBi.png`

Đồng đội phá giáp: giảm DEF mục tiêu 8% trong 1 lượt.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A heavy iron crossbow bolt lodged in a cracked steel armor plate. Energy and color: silver steel and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Rễ hộ người** (Thanh Lâm Xạ · Mộc) · `passive_reHoNguoi.png`

Đồng đội hồi HP: cấp Khiên 4% HP người được hồi.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: Living tree roots curling into a small protective dome around a green healing drop. Energy and color: emerald, fresh green and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Cảnh giới bến sông** (Lam Giang Phi Diệp · Thủy) · `passive_canhGioiBenSong.png`

Đồng đội khống chế: bản thân nhận 7 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A watchful arrow resting across a calm riverbank ripple, golden energy sparks rising from the water. Energy and color: aqua blue and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Hỏa cốt truy kích** (Xích Diệm Luân · Hỏa) · `passive_hoaCotTruyKich.png`

Đồng đội phá giáp: truy kích 35% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A flaming arrow chasing a broken armor shard, its fletching made of fire. Energy and color: crimson, orange and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Sơn trấn kiên thủ** (Trấn Sơn Thạch · Thổ) · `passive_sonTranKienThu.png`

Khiên đồng minh đỡ đòn: phản kích 30% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A stone shield deflecting a blow while a stone-tipped arrow flies back from behind it. Energy and color: ochre, amber and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Chớp thời cơ** (Lôi Minh Xạ · Lôi) · `passive_chopThoiCo.png`

Kỹ năng gây mất HP: trừ mục tiêu 5 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A lightning-charged arrowhead piercing a small energy orb that leaks sparks. Energy and color: electric violet, white and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Thuận gió hồi nhịp** (Tật Phong Lăng · Phong) · `passive_thuanGioHoiNhip.png`

Đồng đội xua tan: bản thân nhận 6 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A feathered arrow riding a smooth tailwind spiral that gathers golden sparks. Energy and color: pale jade, white and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

## Sát thủ (7 hình)

**Ấn khuyết quyết tâm** (Bạch Phong Đao · Kim) · `passive_anKhuyetQuyetTam.png`

Đồng đội phá giáp: truy kích 25% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A notched steel dagger poised at a crack in an armor plate, a small chip missing from its blade. Energy and color: silver steel and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Lâm ảnh tiếp nhịp** (Độc Ảnh · Mộc) · `passive_lamAnhTiepNhip.png`

Đồng đội khống chế: bản thân nhận 6 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A shadowy leaf-shaped dagger hidden among dark forest leaves, a faint green energy glow. Energy and color: deep green, shadow and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Tĩnh thủy hồi tức** (Hàn Giang Khách · Thủy) · `passive_tinhThuyHoiTuc.png`

Đồng đội khống chế: bản thân nhận 5 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A still dark-water surface with one perfect ripple and a short blade reflected in it. Energy and color: deep blue, ice white and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Dạ tập thừa hư** (Xích Dạ · Hỏa) · `passive_daTapThuaHu.png`

Đồng đội khống chế: truy kích 30% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A red crescent moon behind a short blade glowing with ember light. Energy and color: crimson, night purple and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Phục địa phản kích** (Địa Ẩn · Thổ) · `passive_phucDiaPhanKich.png`

Khiên bản thân đỡ đòn: phản kích 30% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A claw-shaped blade bursting up from cracked earth beneath a small stone shield. Energy and color: ochre, amber and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Tàn vũ hồi nhịp** (Lôi Ảnh · Lôi) · `passive_tanVuHoiNhip.png`

Kỹ năng gây mất HP: nhận 4 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: Scattered thin steel needles falling like rain, each trailing a tiny violet spark, gathering into one glow. Energy and color: electric violet and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Dư âm tiếp vận** (Vô Ảnh · Phong) · `passive_duAmTiepVan.png`

Đồng đội xua tan: bản thân nhận 6 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: Fading echo rings of wind around a slender bamboo flute. Energy and color: pale jade, white and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

## Đinh Ngọc (3 hình)

**Thổ mạch hộ thân** (Đinh Ngọc) · `passive_dn_thoMachHoThan.png`

Khiên vỡ: DEF +15% tới hết lượt kế.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A shattered jade shield with glowing earth veins knitting a new stone layer beneath it. Energy and color: amber, jade green and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Mộc tức dưỡng sinh** (Đinh Ngọc) · `passive_dn_mocTucDuongSinh.png`

HP ≤40% cuối lượt: hồi 5% HP, tối đa 3 lần.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A jade pendant with a tiny sprouting leaf, breathing soft green light. Energy and color: jade green and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Lôi ý đoạt cơ** (Đinh Ngọc) · `passive_dn_loiYDoatCo.png`

Kỹ năng gây mất HP: trừ mục tiêu 6 năng lượng.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A short sword blade crackling with a single violet lightning vein, drawing energy sparks toward it. Energy and color: electric violet, steel and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

## Trần Vũ Phong (4 hình)

**Trượng thiết hồi đáp** (Trần Vũ Phong) · `passive_vp_truongThietHoiDap.png`

Mất HP vì kỹ năng địch: trả đòn hệ Kim 30% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: An iron-capped bamboo staff blocking and bouncing back a strike with a steel shockwave. Energy and color: steel silver and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Phi diệp theo gió** (Trần Vũ Phong) · `passive_vp_phiDiepTheoGio.png`

Đồng đội đưa địch xuống ≤50% HP: truy kích hệ Phong 30% ATK.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: Sharp green leaves flying like blades on a wind stream. Energy and color: pale jade, fresh green and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Hỏa ẩn vân sau** (Trần Vũ Phong) · `passive_vp_hoaAnVanSau.png`

Đưa địch xuống ≤30% HP: Thiêu đốt 2 lượt.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A small ember flame hidden behind a soft white cloud, glowing through its edges. Energy and color: crimson ember, cloud white and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```

**Lôi vân trấn pháp** (Trần Vũ Phong) · `passive_vp_loiVanTranPhap.png`

Phe ta xua tan: Câm lặng địch đó 1 lượt.

```text
Square 1024x1024 fantasy game PASSIVE ability emblem for a turn-based match-3 RPG. Subject: A small storm cloud pressing a lightning seal down onto a broken magic rune. Energy and color: electric violet and gold. Composition: a PERFECTLY CIRCULAR medallion, an exact geometric circle centered on the canvas, the same width and height, NOT an oval, NOT an ellipse, NOT tilted or seen in perspective, viewed straight on; a soft round glow inside it and a thin even gold filigree ring tracing its edge; the subject sits fully inside the circle, which spans about 80% of the canvas, with even empty margin on all four sides. Style: same hand-painted family as the existing skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but simpler and calmer: one compact central object, readable at 32 px. Culture: 10th-century Vietnam; no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no square frame, no ground shadow. Background outside the circle: flat solid chroma green (#00b140), completely uniform, nothing else on it.
```
