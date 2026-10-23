# REED BANNER — CHARACTER ART PROMPTS V3

> **Cập nhật:** 24/10/2026 (Asia/Bangkok, UTC+07:00)
> **Phiên bản:** 3.0 — Character DNA / gameplay pose integration
> **Phạm vi:** 61 tướng hiện tại + 14 tướng đề xuất = 75 tướng chiến đấu, 7 hành, 8 nghề dự kiến.
> **Nguồn:** `docs/design/16-prompt-nhan-vat.md` (prompt/mô tả gốc), `docs/design/18-prompt-tu-the.md` (tuyệt chiêu/tư thế), `src/core/roster/roster.ts`, `src/core/battle/skills.ts` tại nhánh develop.
> **Trạng thái:** Thiết kế hình ảnh; 14 tướng mới chưa được xác nhận đã tích hợp roster/code; chiêu động tác là diễn giải cho art, không tự thay đổi thông số gameplay.

## Quy tắc duyệt và ưu tiên nguồn

1. Với ảnh **đã sản xuất/duyệt**, ảnh gốc là chuẩn: không thay mặt, tóc, giáp, vũ khí, phụ kiện và màu. Các gợi ý mới là TODO tùy chọn cho lần cập nhật sau.
2. Với nhân vật **chưa sản xuất**, dùng prompt mới với khuôn mặt, khối cơ thể, vũ khí và điểm nhấn cá nhân đã có; bắt buộc kiểm thử silhouette đen-trắng và ảnh thumbnail 48px. Khuyến nghị tạo 3 phương án concept trước khi chốt.
3. Không bảo đảm AI giữ được 100% đồng nhất qua prompt đơn thuần: **đính kèm ảnh Neutral đã duyệt** khi sinh tư thế.
4. Nguyên tố thể hiện màu và chất liệu; nghề thể hiện lối đánh. Không để hai nhãn này tạo đồng phục.
5. Họa tiết Đông Sơn là diễn giải mỹ thuật; trang phục thế kỷ X còn nhiều khoảng trống tư liệu, không khẳng định cách phục dựng cụ thể đã được chứng thực.
6. VFX nguyên tố, hiệu ứng kỹ năng và ánh sáng làm bằng code; không bake trong nhân vật. Giữ khả năng tách lớp, PixiJS và nền chroma.
7. Hai tạo hình Đinh Bộ Lĩnh thiếu niên/hoàng đế là nội dung truyện ngoài roster chiến đấu; xem tài liệu gốc.

## Theo dõi thay đổi

| Ngày | Phiên bản | Phạm vi |
|---|---|---|
| 20/10/2026 | Legacy | Prompt hình đứng cho roster; tư thế dùng tài liệu riêng |
| 21/10/2026 | Legacy pose | 3 tư thế ra chiêu, tuyệt chiêu, bị hạ gục |
| 24/10/2026 | V2 | Thêm identity lock chung |
| **24/10/2026** | **V3** | **61 bộ prompt chi tiết tái cấu trúc từ mô tả gốc, 5 prompt tạo dáng mỗi tướng, 14 concept nghề mới, hướng dẫn bảo toàn ảnh đã duyệt.** |

## Phần A — 61 nhân vật hiện tại

### 1. Tướng quân (hình chính trong trận) — Tướng sĩ / Mộc

**Dấu hiệu nhận diện nguồn:** tall, strong and lean, resolute leader's gaze, short beard along the jaw, black hair in a high topknot wrapped with a vermilion cloth whose ends trail behind.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Tướng quân (hình chính trong trận), Tướng sĩ class, Mộc element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: tall, strong and lean, resolute leader's gaze, short beard along the jaw, black hair in a high topknot wrapped with a vermilion cloth whose ends trail behind.
PERSONAL VISUAL ANCHOR: tall, strong and lean, resolute leader's gaze, short beard along the jaw, black hair in a high topknot wrapped with a vermilion cloth whose ends trail behind.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: off-axis shoulder layering with visible fastening knots. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps; a short vermilion cape fixed at the shoulders, a white reed-flower tassel hanging from the belt. Main colors: vermilion red, moss green and the white of reed flowers, with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a long broad single-edged saber (dao) held in the right hand: about as long as from his shoulder to his knee, steel blade slightly curved and widening toward a clipped point, round bronze disc guard, dark cord-wrapped grip ending in a bronze ring pommel, a long vermilion tassel tied at the guard, blade angled down and outward away from the legs.
CLASS LANGUAGE: Tướng sĩ is recognizable through a close-range martial strike, never through standardized same-class armor. ELEMENT LANGUAGE: Mộc uses moss-green stitching, dark timber and muted leaf tones balanced by natural browns; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #ff00ff.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Tướng quân (hình chính trong trận). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Mộc looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Tướng quân (hình chính trong trận). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Mộc looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Tướng quân (hình chính trong trận). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Mộc looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Tướng quân (hình chính trong trận). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Mộc looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Tướng quân (hình chính trong trận). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Mộc looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 2. Nguyễn Bặc — Tướng sĩ / Hỏa

**Dấu hiệu nhận diện nguồn:** a powerfully built man around thirty, square determined face, short full beard, hair in a topknot wrapped with a red cloth, a white reed-flower tassel tied to his belt; broad shoulders, solid stance.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Nguyễn Bặc, Tướng sĩ class, Hỏa element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a powerfully built man around thirty, square determined face, short full beard, hair in a topknot wrapped with a red cloth, a white reed-flower tassel tied to his belt; broad shoulders, solid stance.
PERSONAL VISUAL ANCHOR: a powerfully built man around thirty, square determined face, short full beard, hair in a topknot wrapped with a red cloth, a white reed-flower tassel tied to his belt; broad shoulders, solid stance.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: contrasting narrow and wide textile planes around shoulder and hip. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a long broad single-edged saber (dao) held in the right hand: about as long as from his shoulder to his knee, steel blade slightly curved and widening toward a clipped point, bronze guard wound with a red cloth ribbon whose ends hang down, dark grip with a short red pennant-like tassel at the pommel, blade angled down and outward away from the legs.
CLASS LANGUAGE: Tướng sĩ is recognizable through a close-range martial strike, never through standardized same-class armor. ELEMENT LANGUAGE: Hỏa uses vermilion binding, charcoal, earthen red and small ember-orange accents; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Nguyễn Bặc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Hỏa looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Nguyễn Bặc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Hỏa looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Nguyễn Bặc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Hỏa looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Nguyễn Bặc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Hỏa looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a close-range martial strike. Source ultimate movement reference: performing the signature technique "Định Quốc Hỏa Kỳ", a battle-rallying charge, the saber raised forward and high pointing the attack, mouth open in a war cry, chest turned to the enemy, one step into a lunge.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Nguyễn Bặc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Hỏa looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 3. Đinh Điền — Binh lính / Thổ

**Dấu hiệu nhận diện nguồn:** a stocky, broad man around thirty, cheerful weathered face, short beard, conical palm-leaf hat (non la) pushed back, a white reed-flower tassel on his belt; stocky, grounded stance.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Đinh Điền, Binh lính class, Thổ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a stocky, broad man around thirty, cheerful weathered face, short beard, conical palm-leaf hat (non la) pushed back, a white reed-flower tassel on his belt; stocky, grounded stance.
PERSONAL VISUAL ANCHOR: a stocky, broad man around thirty, cheerful weathered face, short beard, conical palm-leaf hat (non la) pushed back, a white reed-flower tassel on his belt; stocky, grounded stance.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a carved bronze fastening plate prominently displayed at one side. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a spear about a head taller than him, with a narrow leaf-shaped steel head, a tuft of white reed feathers tied under the head and a dark shaft banded with bronze rings, held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso.
CLASS LANGUAGE: Binh lính is recognizable through a shield-and-spear tactical guard or counterthrust, never through standardized same-class armor. ELEMENT LANGUAGE: Thổ uses ochre, clay, sand, umber, aged bronze, heavy material transitions; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Đinh Điền. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Thổ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Đinh Điền. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Thổ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Đinh Điền. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Thổ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Đinh Điền. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Thổ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a shield-and-spear tactical guard or counterthrust. Source ultimate movement reference: performing the signature technique "Ngoại Giáp Hộ Quân", stepping in front of allies, arms and shield spread wide to cover them, spear held crosswise, solid wide stance, determined glare.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Đinh Điền. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Thổ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 4. Lưu Cơ — Mưu sĩ / Kim

**Dấu hiệu nhận diện nguồn:** a thin, upright man in his thirties, keen eyes, neat mustache and goatee, black scholar's cap, a small bronze seal hanging from his belt; lean, upright silhouette.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Lưu Cơ, Mưu sĩ class, Kim element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a thin, upright man in his thirties, keen eyes, neat mustache and goatee, black scholar's cap, a small bronze seal hanging from his belt; lean, upright silhouette.
PERSONAL VISUAL ANCHOR: a thin, upright man in his thirties, keen eyes, neat mustache and goatee, black scholar's cap, a small bronze seal hanging from his belt; lean, upright silhouette.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: one distinctive diagonal sash crossing a patched torso layer. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a white feather fan (a fan of long white feathers spreading from a round dark-bronze rosette base, a short black handle with a gold tassel) held out to the side in the right hand.
CLASS LANGUAGE: Mưu sĩ is recognizable through a fan-directed feint or disruption command, never through standardized same-class armor. ELEMENT LANGUAGE: Kim uses ivory linen, brushed iron, muted silver, weathered bronze; metallic accents concentrated on equipment; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Lưu Cơ. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Lưu Cơ. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Lưu Cơ. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Lưu Cơ. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a fan-directed feint or disruption command. Source ultimate movement reference: performing the signature technique "Đô Hộ Phủ Lệnh", issuing an official decree, the feather fan raised high in the right hand like a decree, left hand pointing down at the enemy, both hands free of any other object, stern magistrate's face.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Lưu Cơ. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 5. Trịnh Tú — Y sư / Mộc

**Dấu hiệu nhận diện nguồn:** a kind, steady man in his thirties, gentle eyes, short beard, green head wrap, a woven herb basket on his back kept small and close to the body; gentle, slender silhouette.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Trịnh Tú, Y sư class, Mộc element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a kind, steady man in his thirties, gentle eyes, short beard, green head wrap, a woven herb basket on his back kept small and close to the body; gentle, slender silhouette.
PERSONAL VISUAL ANCHOR: a kind, steady man in his thirties, gentle eyes, short beard, green head wrap, a woven herb basket on his back kept small and close to the body; gentle, slender silhouette.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: an uneven outer mantle fixed with historically plausible cord ties. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a tan double-bulb medicine gourd with a bronze cap and two green tassels on its cord, hanging from that cord, held out to the side in the right hand.
CLASS LANGUAGE: Y sư is recognizable through a battlefield herbal treatment action with medicine tools, never through standardized same-class armor. ELEMENT LANGUAGE: Mộc uses moss-green stitching, dark timber and muted leaf tones balanced by natural browns; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #ff00ff.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Trịnh Tú. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Mộc looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Trịnh Tú. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Mộc looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Trịnh Tú. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Mộc looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Trịnh Tú. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Mộc looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a battlefield herbal treatment action with medicine tools. Source ultimate movement reference: performing the signature technique "Hoa Lư Thảo Dược", scattering healing herbs, one hand flinging leaves forward, gourd held at the hip, mid-step, calm face.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Trịnh Tú. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Mộc looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 6. Lê Hoàn — Quân sư / Lôi

**Dấu hiệu nhận diện nguồn:** a handsome, sharp-eyed man in his late twenties, confident half smile, clean-shaven, hair in a topknot with a purple cord, bronze plates over the shoulders of his robe; composed, commanding silhouette.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Lê Hoàn, Quân sư class, Lôi element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a handsome, sharp-eyed man in his late twenties, confident half smile, clean-shaven, hair in a topknot with a purple cord, bronze plates over the shoulders of his robe; composed, commanding silhouette.
PERSONAL VISUAL ANCHOR: a handsome, sharp-eyed man in his late twenties, confident half smile, clean-shaven, hair in a topknot with a purple cord, bronze plates over the shoulders of his robe; composed, commanding silhouette.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: different hem lengths for travel and mounted or marshland conditions. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body.
CLASS LANGUAGE: Quân sư is recognizable through a bamboo-slip and field-flag tactical order, never through standardized same-class armor. ELEMENT LANGUAGE: Lôi uses storm grey, muted amethyst and a few yellow zigzag accents without electric technology; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Lê Hoàn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Lôi looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Lê Hoàn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Lôi looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Lê Hoàn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Lôi looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Lê Hoàn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Lôi looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a bamboo-slip and field-flag tactical order. Source ultimate movement reference: performing the signature technique "Thập Đạo Lôi Binh", dispatching ten columns of troops, flag pointed forward, other hand raised with fingers spread giving signals, war-leader's shout.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Lê Hoàn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Lôi looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 7. Đinh Liễn — Pháp sư / Thủy

**Dấu hiệu nhận diện nguồn:** a young prince around twenty, resembling a younger Dinh Bo Linh, proud bright eyes, hair in a topknot with a small bronze crown band, blue silk sash; tall flowing silhouette.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Đinh Liễn, Pháp sư class, Thủy element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a young prince around twenty, resembling a younger Dinh Bo Linh, proud bright eyes, hair in a topknot with a small bronze crown band, blue silk sash; tall flowing silhouette.
PERSONAL VISUAL ANCHOR: a young prince around twenty, resembling a younger Dinh Bo Linh, proud bright eyes, hair in a topknot with a small bronze crown band, blue silk sash; tall flowing silhouette.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a waist-heavy profile emphasizing equipment and travel-worn cloth. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a short ritual staff of dark wood and bronze topped with a small water-element orb, held out to the side in the right hand.
CLASS LANGUAGE: Pháp sư is recognizable through a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery, never through standardized same-class armor. ELEMENT LANGUAGE: Thủy uses river indigo, blue-grey, washed linen and restrained cool-blue highlights; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Đinh Liễn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Thủy looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Đinh Liễn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Thủy looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Đinh Liễn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Thủy looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Đinh Liễn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Thủy looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery. Source ultimate movement reference: performing the signature technique "Nam Việt Vương Ấn", pressing down a royal seal of power, left hand held palm-down in front as if stamping a seal, staff raised in the right hand, regal stern face.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Đinh Liễn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Thủy looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 8. Trần Lãm (Trần Minh Công) — Quân sư / Thủy

**Dấu hiệu nhận diện nguồn:** an elderly coastal lord in his sixties, long white beard, kind but shrewd eyes, topknot with a blue jade pin, slightly stooped but dignified; composed, commanding silhouette; a lord's richer trims and a bronze rank plaqu

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Trần Lãm (Trần Minh Công), Quân sư class, Thủy element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: an elderly coastal lord in his sixties, long white beard, kind but shrewd eyes, topknot with a blue jade pin, slightly stooped but dignified; composed, commanding silhouette; a lord's richer trims and a bronze rank plaque on the belt.
PERSONAL VISUAL ANCHOR: an elderly coastal lord in his sixties, long white beard, kind but shrewd eyes, topknot with a blue jade pin, slightly stooped but dignified; composed, commanding silhouette; a lord's richer trims and a bronze rank plaqu. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a distinctive broken-line rhythm in the garment edges. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body.
CLASS LANGUAGE: Quân sư is recognizable through a bamboo-slip and field-flag tactical order, never through standardized same-class armor. ELEMENT LANGUAGE: Thủy uses river indigo, blue-grey, washed linen and restrained cool-blue highlights; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Trần Lãm (Trần Minh Công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Thủy looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Trần Lãm (Trần Minh Công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Thủy looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Trần Lãm (Trần Minh Công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Thủy looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Trần Lãm (Trần Minh Công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Thủy looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a bamboo-slip and field-flag tactical order. Source ultimate movement reference: performing the signature technique "Bố Hải Trấn Giang", ordering the river blockade, flag held out over an imagined river, bamboo slips raised, steady authoritative stance.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Trần Lãm (Trần Minh Công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Thủy looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 9. Phạm Bạch Hổ (Phạm Phòng Át) — Tướng sĩ / Hỏa

**Dấu hiệu nhận diện nguồn:** a fierce, battle-hardened lord in his forties, tiger-like eyes, thick beard, a white tiger-pelt mantle over his armor (tiger head not included); broad shoulders, solid stance; a lord's richer trims and a bronze rank plaq

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Phạm Bạch Hổ (Phạm Phòng Át), Tướng sĩ class, Hỏa element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a fierce, battle-hardened lord in his forties, tiger-like eyes, thick beard, a white tiger-pelt mantle over his armor (tiger head not included); broad shoulders, solid stance; a lord's richer trims and a bronze rank plaque on the belt.
PERSONAL VISUAL ANCHOR: a fierce, battle-hardened lord in his forties, tiger-like eyes, thick beard, a white tiger-pelt mantle over his armor (tiger head not included); broad shoulders, solid stance; a lord's richer trims and a bronze rank plaq. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: layered woven belt and garment panels that reveal status through wear. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: an extra-wide, heavy saber with a notched back and a white-fur-wrapped grip, held in the right hand, blade angled down and outward away from the legs.
CLASS LANGUAGE: Tướng sĩ is recognizable through a close-range martial strike, never through standardized same-class armor. ELEMENT LANGUAGE: Hỏa uses vermilion binding, charcoal, earthen red and small ember-orange accents; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Phạm Bạch Hổ (Phạm Phòng Át). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Hỏa looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Phạm Bạch Hổ (Phạm Phòng Át). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Hỏa looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Phạm Bạch Hổ (Phạm Phòng Át). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Hỏa looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Phạm Bạch Hổ (Phạm Phòng Át). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Hỏa looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a close-range martial strike. Source ultimate movement reference: performing the signature technique "Bạch Hổ Xuất Sơn", a pouncing tiger-like leap, body low and coiled in mid-air, the heavy saber held back ready to strike, free hand clawed forward, both knees bent.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Phạm Bạch Hổ (Phạm Phòng Át). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Hỏa looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 10. Ngô Xương Xí (Kiều công) — Mưu sĩ / Kim

**Dấu hiệu nhận diện nguồn:** a young, proud noble in his twenties, heir of the fallen Ngo royal house, refined pale face, thin mustache, black lacquered cap with a gold band; lean, upright silhouette; a lord's richer trims and a bronze rank plaque o

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Ngô Xương Xí (Kiều công), Mưu sĩ class, Kim element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a young, proud noble in his twenties, heir of the fallen Ngo royal house, refined pale face, thin mustache, black lacquered cap with a gold band; lean, upright silhouette; a lord's richer trims and a bronze rank plaque on the belt.
PERSONAL VISUAL ANCHOR: a young, proud noble in his twenties, heir of the fallen Ngo royal house, refined pale face, thin mustache, black lacquered cap with a gold band; lean, upright silhouette; a lord's richer trims and a bronze rank plaque o. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: asymmetrical sleeve construction grounded in practical movement. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a white feather fan held out to the side in the right hand.
CLASS LANGUAGE: Mưu sĩ is recognizable through a fan-directed feint or disruption command, never through standardized same-class armor. ELEMENT LANGUAGE: Kim uses ivory linen, brushed iron, muted silver, weathered bronze; metallic accents concentrated on equipment; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Ngô Xương Xí (Kiều công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Ngô Xương Xí (Kiều công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Ngô Xương Xí (Kiều công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Ngô Xương Xí (Kiều công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a fan-directed feint or disruption command. Source ultimate movement reference: performing the signature technique "Ngô Gia Di Mưu", unveiling a long-laid plan, fan swept wide to the side, other hand open palm up, confident lordly smile.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Ngô Xương Xí (Kiều công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 11. Ngô Nhật Khánh (Ngô Nam công) — Quân sư / Phong

**Dấu hiệu nhận diện nguồn:** an aristocratic lord in his thirties of the Ngo royal clan, calm calculating eyes, neat beard, teal silk sash and a gold belt plaque; composed, commanding silhouette; a lord's richer trims and a bronze rank plaque on the

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Ngô Nhật Khánh (Ngô Nam công), Quân sư class, Phong element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: an aristocratic lord in his thirties of the Ngo royal clan, calm calculating eyes, neat beard, teal silk sash and a gold belt plaque; composed, commanding silhouette; a lord's richer trims and a bronze rank plaque on the belt.
PERSONAL VISUAL ANCHOR: an aristocratic lord in his thirties of the Ngo royal clan, calm calculating eyes, neat beard, teal silk sash and a gold belt plaque; composed, commanding silhouette; a lord's richer trims and a bronze rank plaque on the. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: off-axis shoulder layering with visible fastening knots. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a bundle of bamboo slips tied with cord in the left hand and a small triangular command flag on a short pole in the right hand, both held away from the body.
CLASS LANGUAGE: Quân sư is recognizable through a bamboo-slip and field-flag tactical order, never through standardized same-class armor. ELEMENT LANGUAGE: Phong uses pale teal ribbon accents, mist-grey linen and airy off-white layers; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #ff00ff.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Ngô Nhật Khánh (Ngô Nam công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Phong looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Ngô Nhật Khánh (Ngô Nam công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Phong looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Ngô Nhật Khánh (Ngô Nam công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Phong looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Ngô Nhật Khánh (Ngô Nam công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Phong looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a bamboo-slip and field-flag tactical order. Source ultimate movement reference: performing the signature technique "Đường Lâm Phong Khởi", raising the wind of Duong Lam, flag spun in a circle overhead, cape and hair whipping in a gale, triumphant face.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Ngô Nhật Khánh (Ngô Nam công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Phong looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 12. Nguyễn Khoan (Nguyễn Thái Bình) — Binh lính / Thổ

**Dấu hiệu nhận diện nguồn:** a heavyset lord in his fifties, round stern face, gray beard, ochre head wrap, thick padded armor; stocky, grounded stance; a lord's richer trims and a bronze rank plaque on the belt.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Nguyễn Khoan (Nguyễn Thái Bình), Binh lính class, Thổ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a heavyset lord in his fifties, round stern face, gray beard, ochre head wrap, thick padded armor; stocky, grounded stance; a lord's richer trims and a bronze rank plaque on the belt.
PERSONAL VISUAL ANCHOR: a heavyset lord in his fifties, round stern face, gray beard, ochre head wrap, thick padded armor; stocky, grounded stance; a lord's richer trims and a bronze rank plaque on the belt.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: contrasting narrow and wide textile planes around shoulder and hip. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso.
CLASS LANGUAGE: Binh lính is recognizable through a shield-and-spear tactical guard or counterthrust, never through standardized same-class armor. ELEMENT LANGUAGE: Thổ uses ochre, clay, sand, umber, aged bronze, heavy material transitions; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Nguyễn Khoan (Nguyễn Thái Bình). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Thổ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Nguyễn Khoan (Nguyễn Thái Bình). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Thổ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Nguyễn Khoan (Nguyễn Thái Bình). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Thổ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Nguyễn Khoan (Nguyễn Thái Bình). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Thổ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a shield-and-spear tactical guard or counterthrust. Source ultimate movement reference: performing the signature technique "Tam Đái Kiên Thành", a fortress stance, shield set on the ground and leaned into with full weight, spear pointing out over the rim, low and immovable.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Nguyễn Khoan (Nguyễn Thái Bình). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Thổ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 13. Kiều Công Hãn (Kiều Tam Chế) — Pháp sư / Lôi

**Dấu hiệu nhận diện nguồn:** a gaunt, intense lord in his forties, sunken eyes, long black beard, hair loose under a purple head band, purple-black robes; tall flowing silhouette; a lord's richer trims and a bronze rank plaque on the belt.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Kiều Công Hãn (Kiều Tam Chế), Pháp sư class, Lôi element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a gaunt, intense lord in his forties, sunken eyes, long black beard, hair loose under a purple head band, purple-black robes; tall flowing silhouette; a lord's richer trims and a bronze rank plaque on the belt.
PERSONAL VISUAL ANCHOR: a gaunt, intense lord in his forties, sunken eyes, long black beard, hair loose under a purple head band, purple-black robes; tall flowing silhouette; a lord's richer trims and a bronze rank plaque on the belt.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a carved bronze fastening plate prominently displayed at one side. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a short ritual staff of dark wood and bronze topped with a small thunder-element orb, held out to the side in the right hand.
CLASS LANGUAGE: Pháp sư is recognizable through a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery, never through standardized same-class armor. ELEMENT LANGUAGE: Lôi uses storm grey, muted amethyst and a few yellow zigzag accents without electric technology; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Kiều Công Hãn (Kiều Tam Chế). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Lôi looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Kiều Công Hãn (Kiều Tam Chế). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Lôi looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Kiều Công Hãn (Kiều Tam Chế). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Lôi looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Kiều Công Hãn (Kiều Tam Chế). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Lôi looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery. Source ultimate movement reference: performing the signature technique "Phong Châu Lôi Kích", hurling thunder from the hand, right arm thrown forward with palm open, staff pulled back in the left hand, robe whipping, teeth clenched.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Kiều Công Hãn (Kiều Tam Chế). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Lôi looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 14. Kiều Thuận (Kiều Lệnh công) — Y sư / Mộc

**Dấu hiệu nhận diện nguồn:** a calm marshland lord in his forties, lean, long thin beard, green head wrap, reed-and-lotus pattern on his robe; gentle, slender silhouette; a lord's richer trims and a bronze rank plaque on the belt.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Kiều Thuận (Kiều Lệnh công), Y sư class, Mộc element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a calm marshland lord in his forties, lean, long thin beard, green head wrap, reed-and-lotus pattern on his robe; gentle, slender silhouette; a lord's richer trims and a bronze rank plaque on the belt.
PERSONAL VISUAL ANCHOR: a calm marshland lord in his forties, lean, long thin beard, green head wrap, reed-and-lotus pattern on his robe; gentle, slender silhouette; a lord's richer trims and a bronze rank plaque on the belt.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: one distinctive diagonal sash crossing a patched torso layer. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a bronze-capped medicine gourd hanging from a cord, held out to the side in the right hand.
CLASS LANGUAGE: Y sư is recognizable through a battlefield herbal treatment action with medicine tools, never through standardized same-class armor. ELEMENT LANGUAGE: Mộc uses moss-green stitching, dark timber and muted leaf tones balanced by natural browns; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #ff00ff.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Kiều Thuận (Kiều Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Mộc looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Kiều Thuận (Kiều Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Mộc looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Kiều Thuận (Kiều Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Mộc looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Kiều Thuận (Kiều Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Mộc looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a battlefield herbal treatment action with medicine tools. Source ultimate movement reference: performing the signature technique "Hồi Hồ Sinh Khí", breathing life back, both palms held forward together, gourd hanging from the wrist, eyes closed in concentration.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Kiều Thuận (Kiều Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Mộc looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 15. Lý Khuê (Lý Lãng công) — Tướng sĩ / Kim

**Dấu hiệu nhận diện nguồn:** a tall, imposing lord in his forties, hawk-like face, short pointed beard, polished silver-and-gold lamellar armor; broad shoulders, solid stance; a lord's richer trims and a bronze rank plaque on the belt.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Lý Khuê (Lý Lãng công), Tướng sĩ class, Kim element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a tall, imposing lord in his forties, hawk-like face, short pointed beard, polished silver-and-gold lamellar armor; broad shoulders, solid stance; a lord's richer trims and a bronze rank plaque on the belt.
PERSONAL VISUAL ANCHOR: a tall, imposing lord in his forties, hawk-like face, short pointed beard, polished silver-and-gold lamellar armor; broad shoulders, solid stance; a lord's richer trims and a bronze rank plaque on the belt.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: an uneven outer mantle fixed with historically plausible cord ties. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a straight double-edged bronze sword held in the right hand, angled down and outward away from the legs.
CLASS LANGUAGE: Tướng sĩ is recognizable through a close-range martial strike, never through standardized same-class armor. ELEMENT LANGUAGE: Kim uses ivory linen, brushed iron, muted silver, weathered bronze; metallic accents concentrated on equipment; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Lý Khuê (Lý Lãng công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Kim looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Lý Khuê (Lý Lãng công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Kim looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Lý Khuê (Lý Lãng công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Kim looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Lý Khuê (Lý Lãng công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Kim looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a close-range martial strike. Source ultimate movement reference: performing the signature technique "Siêu Loại Phá Giáp", an armor-breaking overhead smash, the bronze sword raised high behind the head in both hands at the top of the swing, back arched, front foot stamping down.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Lý Khuê (Lý Lãng công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Kim looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 16. Nguyễn Thủ Tiệp (Nguyễn Lệnh công) — Mưu sĩ / Thủy

**Dấu hiệu nhận diện nguồn:** a wealthy, scheming lord in his fifties, plump face, thin long mustache, blue silk robe with a heavy jade belt; lean, upright silhouette; a lord's richer trims and a bronze rank plaque on the belt.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Nguyễn Thủ Tiệp (Nguyễn Lệnh công), Mưu sĩ class, Thủy element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a wealthy, scheming lord in his fifties, plump face, thin long mustache, blue silk robe with a heavy jade belt; lean, upright silhouette; a lord's richer trims and a bronze rank plaque on the belt.
PERSONAL VISUAL ANCHOR: a wealthy, scheming lord in his fifties, plump face, thin long mustache, blue silk robe with a heavy jade belt; lean, upright silhouette; a lord's richer trims and a bronze rank plaque on the belt.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: different hem lengths for travel and mounted or marshland conditions. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a white feather fan held out to the side in the right hand.
CLASS LANGUAGE: Mưu sĩ is recognizable through a fan-directed feint or disruption command, never through standardized same-class armor. ELEMENT LANGUAGE: Thủy uses river indigo, blue-grey, washed linen and restrained cool-blue highlights; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Nguyễn Thủ Tiệp (Nguyễn Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Thủy looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Nguyễn Thủ Tiệp (Nguyễn Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Thủy looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Nguyễn Thủ Tiệp (Nguyễn Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Thủy looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Nguyễn Thủ Tiệp (Nguyễn Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Thủy looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a fan-directed feint or disruption command. Source ultimate movement reference: performing the signature technique "Tiên Du Đoạt Lương", seizing enemy supplies, fan pointing forward, other hand closing into a grasping fist, leaning forward with a greedy grin.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Nguyễn Thủ Tiệp (Nguyễn Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Thủy looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 17. Lữ Đường (Lữ Tá công) — Pháp sư / Thủy

**Dấu hiệu nhận diện nguồn:** a river-war lord in his forties, sun-darkened skin, braided beard, rope-bound hair, blue robe with wave hems; tall flowing silhouette; a lord's richer trims and a bronze rank plaque on the belt.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Lữ Đường (Lữ Tá công), Pháp sư class, Thủy element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a river-war lord in his forties, sun-darkened skin, braided beard, rope-bound hair, blue robe with wave hems; tall flowing silhouette; a lord's richer trims and a bronze rank plaque on the belt.
PERSONAL VISUAL ANCHOR: a river-war lord in his forties, sun-darkened skin, braided beard, rope-bound hair, blue robe with wave hems; tall flowing silhouette; a lord's richer trims and a bronze rank plaque on the belt.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a waist-heavy profile emphasizing equipment and travel-worn cloth. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a short ritual staff of dark wood and bronze topped with a small water-element orb, held out to the side in the right hand.
CLASS LANGUAGE: Pháp sư is recognizable through a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery, never through standardized same-class armor. ELEMENT LANGUAGE: Thủy uses river indigo, blue-grey, washed linen and restrained cool-blue highlights; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Lữ Đường (Lữ Tá công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Thủy looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Lữ Đường (Lữ Tá công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Thủy looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Lữ Đường (Lữ Tá công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Thủy looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Lữ Đường (Lữ Tá công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Thủy looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery. Source ultimate movement reference: performing the signature technique "Tế Giang Thủy Trận", performing a river ritual, both arms spread wide with the staff held horizontally overhead, chanting, robe and sleeves fanning out.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Lữ Đường (Lữ Tá công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Thủy looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 18. Nguyễn Siêu (Nguyễn Hữu công) — Binh lính / Hỏa

**Dấu hiệu nhận diện nguồn:** a hot-tempered lord in his forties, bull-necked, thick black beard, red head wrap, scarred forearms; stocky, grounded stance; a lord's richer trims and a bronze rank plaque on the belt.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Nguyễn Siêu (Nguyễn Hữu công), Binh lính class, Hỏa element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a hot-tempered lord in his forties, bull-necked, thick black beard, red head wrap, scarred forearms; stocky, grounded stance; a lord's richer trims and a bronze rank plaque on the belt.
PERSONAL VISUAL ANCHOR: a hot-tempered lord in his forties, bull-necked, thick black beard, red head wrap, scarred forearms; stocky, grounded stance; a lord's richer trims and a bronze rank plaque on the belt.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a distinctive broken-line rhythm in the garment edges. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso.
CLASS LANGUAGE: Binh lính is recognizable through a shield-and-spear tactical guard or counterthrust, never through standardized same-class armor. ELEMENT LANGUAGE: Hỏa uses vermilion binding, charcoal, earthen red and small ember-orange accents; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Nguyễn Siêu (Nguyễn Hữu công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Hỏa looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Nguyễn Siêu (Nguyễn Hữu công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Hỏa looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Nguyễn Siêu (Nguyễn Hữu công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Hỏa looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Nguyễn Siêu (Nguyễn Hữu công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Hỏa looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a shield-and-spear tactical guard or counterthrust. Source ultimate movement reference: performing the signature technique "Phù Liệt Hỏa Lũy", a blazing taunt, shield banged against the spear shaft overhead, mouth open in a shout, one foot stamping forward.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Nguyễn Siêu (Nguyễn Hữu công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Hỏa looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 19. Đỗ Cảnh Thạc (Đỗ Lệnh công) — Tướng sĩ / Thổ

**Dấu hiệu nhận diện nguồn:** a grim veteran general in his fifties, the toughest of the twelve lords, deep scar over one eye, gray beard, massive frame, heavy ochre-and-stone lamellar armor; broad shoulders, solid stance; a lord's richer trims and a

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Đỗ Cảnh Thạc (Đỗ Lệnh công), Tướng sĩ class, Thổ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a grim veteran general in his fifties, the toughest of the twelve lords, deep scar over one eye, gray beard, massive frame, heavy ochre-and-stone lamellar armor; broad shoulders, solid stance; a lord's richer trims and a bronze rank plaque on the belt.
PERSONAL VISUAL ANCHOR: a grim veteran general in his fifties, the toughest of the twelve lords, deep scar over one eye, gray beard, massive frame, heavy ochre-and-stone lamellar armor; broad shoulders, solid stance; a lord's richer trims and a. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: layered woven belt and garment panels that reveal status through wear. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a massive long-handled war hammer with a square bronze head, held in the right hand, head low and outward away from the legs.
CLASS LANGUAGE: Tướng sĩ is recognizable through a close-range martial strike, never through standardized same-class armor. ELEMENT LANGUAGE: Thổ uses ochre, clay, sand, umber, aged bronze, heavy material transitions; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Historical portrayal is an original interpretation, not a claim of documented exact clothing.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Đỗ Cảnh Thạc (Đỗ Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Thổ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Đỗ Cảnh Thạc (Đỗ Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Thổ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Đỗ Cảnh Thạc (Đỗ Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Thổ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Đỗ Cảnh Thạc (Đỗ Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Thổ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a close-range martial strike. Source ultimate movement reference: performing the signature technique "Đỗ Động Kiên Tâm", a steadfast counter-strike, feet planted wide and rooted, the war hammer swung low and forward in a heavy horizontal arc, jaw set, unshakable stance.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Đỗ Cảnh Thạc (Đỗ Lệnh công). Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Thổ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 20. Trần Cương — Tướng sĩ / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a young man in his mid-twenties, tall and athletic, sharp jaw, black hair tied in a high topknot with a silver band; broad shoulders, solid stance.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Trần Cương, Tướng sĩ class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a young man in his mid-twenties, tall and athletic, sharp jaw, black hair tied in a high topknot with a silver band; broad shoulders, solid stance.
PERSONAL VISUAL ANCHOR: a young man in his mid-twenties, tall and athletic, sharp jaw, black hair tied in a high topknot with a silver band; broad shoulders, solid stance.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: asymmetrical sleeve construction grounded in practical movement. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a long broad single-edged saber (dao) held in the right hand, blade angled down and outward away from the legs.
CLASS LANGUAGE: Tướng sĩ is recognizable through a close-range martial strike, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Trần Cương. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Trần Cương. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Trần Cương. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Trần Cương. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a close-range martial strike. Source ultimate movement reference: performing the signature technique "Kim Qua Thiết Mã", a charging armor-piercing thrust, body low and driving forward as if riding down the enemy, blade point aimed straight ahead at chest height, back leg fully extended, cloth flying back.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Trần Cương. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 21. Chu Ngân — Pháp sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a row of three small silver rings in his left ear; tall flowing silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Chu Ngân, Pháp sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a slender man in his early thirties, long narrow face, thin mustache and a small chin beard, long black hair half tied with a silver pin, distinguishing mark: a row of three small silver rings in his left ear; tall flowing silhouette.
PERSONAL VISUAL ANCHOR: a row of three small silver rings in his left ear; tall flowing silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: off-axis shoulder layering with visible fastening knots. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a ritual staff of polished bronze ringed with small bronze bells, topped with a silver metal orb, held out to the side in the right hand.
CLASS LANGUAGE: Pháp sư is recognizable through a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Chu Ngân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Chu Ngân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Chu Ngân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Chu Ngân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery. Source ultimate movement reference: performing the signature technique "Ngân Châm Tán Xạ", flinging a spray of silver needles, left arm whipped forward with fingers spread, staff held back in the right hand, body twisting with the throw.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Chu Ngân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 22. Cao Kiên — Binh lính / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a broken nose and an iron collar-guard around his neck; stocky, grounded stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Cao Kiên, Binh lính class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a giant, barrel-chested man in his late thirties, square face, short thick beard, black head wrap with silver trim, distinguishing mark: a broken nose and an iron collar-guard around his neck; stocky, grounded stance.
PERSONAL VISUAL ANCHOR: a broken nose and an iron collar-guard around his neck; stocky, grounded stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: contrasting narrow and wide textile planes around shoulder and hip. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a short heavy spear held upright in the right hand beside the body, and a round rattan shield reinforced with a big iron boss held out to the side on the left forearm, shield not covering the torso.
CLASS LANGUAGE: Binh lính is recognizable through a shield-and-spear tactical guard or counterthrust, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Cao Kiên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Cao Kiên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Cao Kiên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Cao Kiên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a shield-and-spear tactical guard or counterthrust. Source ultimate movement reference: performing the signature technique "Thiết Bích Đồng Thành", an iron-wall stance, shield braced forward with the shoulder pressed behind it, spear couched under the arm, head tucked, legs locked.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Cao Kiên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 23. Châu Ngọc — Y sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** small pearl earrings and a leather case of silver acupuncture needles on her belt; gentle, slender silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Châu Ngọc, Y sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a poised woman in her mid-twenties, oval face, calm almond eyes, hair in a low bun held by a long silver hairpin, distinguishing mark: small pearl earrings and a leather case of silver acupuncture needles on her belt; gentle, slender silhouette.
PERSONAL VISUAL ANCHOR: small pearl earrings and a leather case of silver acupuncture needles on her belt; gentle, slender silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a carved bronze fastening plate prominently displayed at one side. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a small silver-capped white porcelain medicine gourd on a red cord, held out to the side in the right hand.
CLASS LANGUAGE: Y sư is recognizable through a battlefield herbal treatment action with medicine tools, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Châu Ngọc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Châu Ngọc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Châu Ngọc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Châu Ngọc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a battlefield herbal treatment action with medicine tools. Source ultimate movement reference: performing the signature technique "Kim Châm Độ Mệnh", an acupuncture rescue, needles held between the fingers of the raised right hand, gourd in the left, precise focused gaze, slight forward lean.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Châu Ngọc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 24. Tô Kim — Mưu sĩ / Kim

**Dấu hiệu nhận diện nguồn:** a gold tooth in his smile and an abacus-bead string wrapped around his left wrist; lean, upright silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Tô Kim, Mưu sĩ class, Kim element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a lean man in his late thirties, thin sly face, neat pointed goatee, black scholar's soft cap, distinguishing mark: a gold tooth in his smile and an abacus-bead string wrapped around his left wrist; lean, upright silhouette.
PERSONAL VISUAL ANCHOR: a gold tooth in his smile and an abacus-bead string wrapped around his left wrist; lean, upright silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: one distinctive diagonal sash crossing a patched torso layer. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a black crow-feather fan with a gold-banded handle held out to the side in the right hand.
CLASS LANGUAGE: Mưu sĩ is recognizable through a fan-directed feint or disruption command, never through standardized same-class armor. ELEMENT LANGUAGE: Kim uses ivory linen, brushed iron, muted silver, weathered bronze; metallic accents concentrated on equipment; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Tô Kim. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Tô Kim. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Tô Kim. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Tô Kim. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a fan-directed feint or disruption command. Source ultimate movement reference: performing the signature technique "Kim Ngân Ly Tán", a sly bribe and betrayal, fan held up hiding half the face, other hand flicking a gold coin toward the enemy, cunning sideways glance.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Tô Kim. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Kim looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 25. Nghiêm Thiết — Quân sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a pale scar across the bridge of his nose; composed, commanding silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Nghiêm Thiết, Quân sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a stern, broad-shouldered man in his late forties, heavy brow, short gray-streaked square beard, topknot with an iron crest, distinguishing mark: a pale scar across the bridge of his nose; composed, commanding silhouette.
PERSONAL VISUAL ANCHOR: a pale scar across the bridge of his nose; composed, commanding silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: an uneven outer mantle fixed with historically plausible cord ties. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: platinum white, bright silver and royal gold with a metallic sheen (accent #9ea4ad), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a bundle of iron-bound bamboo slips in the left hand and a stiff square command flag of gray cloth on an iron pole in the right hand, both held away from the body.
CLASS LANGUAGE: Quân sư is recognizable through a bamboo-slip and field-flag tactical order, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Nghiêm Thiết. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Nghiêm Thiết. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Nghiêm Thiết. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Nghiêm Thiết. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a bamboo-slip and field-flag tactical order. Source ultimate movement reference: performing the signature technique "Thiết Trận Phá Giáp", ordering a full assault, flag raised straight up, bamboo slips pointed at the enemy, chin high.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Nghiêm Thiết. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 26. Lâm Tùng — Tướng sĩ / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a pine-needle tattoo running down his right forearm; broad shoulders, solid stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Lâm Tùng, Tướng sĩ class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a sturdy man around thirty, weathered tan skin, thick eyebrows, short stubble, hair in a topknot wrapped with a green cloth, distinguishing mark: a pine-needle tattoo running down his right forearm; broad shoulders, solid stance.
PERSONAL VISUAL ANCHOR: a pine-needle tattoo running down his right forearm; broad shoulders, solid stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: different hem lengths for travel and mounted or marshland conditions. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a straight double-edged sword with a dark wooden scabbard of bamboo strips slung at the hip, the sword held in the right hand angled down and outward away from the legs.
CLASS LANGUAGE: Tướng sĩ is recognizable through a close-range martial strike, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Lâm Tùng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Lâm Tùng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Lâm Tùng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Lâm Tùng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a close-range martial strike. Source ultimate movement reference: performing the signature technique "Trúc Lâm Phá Trận", a spinning sweep that breaks through a line, body twisted mid-turn, the sword held out level at arm's length, one foot pivoting on the toes, cloth swirling around the body.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Lâm Tùng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 27. Đàm Thảo — Pháp sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a crown of woven grass and tiny white flowers; tall flowing silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Đàm Thảo, Pháp sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a slim young woman around twenty, bright gentle eyes, freckles, long hair braided with small leaves, distinguishing mark: a crown of woven grass and tiny white flowers; tall flowing silhouette.
PERSONAL VISUAL ANCHOR: a crown of woven grass and tiny white flowers; tall flowing silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a waist-heavy profile emphasizing equipment and travel-worn cloth. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a gnarled living-wood staff with green sprouting leaves, its top curling around a small green orb, held out to the side in the right hand.
CLASS LANGUAGE: Pháp sư is recognizable through a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Đàm Thảo. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Đàm Thảo. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Đàm Thảo. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Đàm Thảo. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery. Source ultimate movement reference: performing the signature technique "Kinh Cức Triền Thân", commanding thorny vines from the ground, crouching with one palm pressed to the ground and the staff held up behind, eyes fixed on the enemy.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Đàm Thảo. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 28. Hoàng Mộc — Binh lính / Mộc

**Dấu hiệu nhận diện nguồn:** a missing front tooth and a straw rope belt; stocky, grounded stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Hoàng Mộc, Binh lính class, Mộc element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a big, round-faced young man in his early twenties, cheerful grin, clean-shaven, conical palm-leaf hat (non la) over a green head wrap, distinguishing mark: a missing front tooth and a straw rope belt; stocky, grounded stance.
PERSONAL VISUAL ANCHOR: a missing front tooth and a straw rope belt; stocky, grounded stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a distinctive broken-line rhythm in the garment edges. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a long bamboo-shafted spear held upright in the right hand beside the body, and a round rattan shield painted with a green bamboo-leaf emblem held out to the side on the left forearm, shield not covering the torso.
CLASS LANGUAGE: Binh lính is recognizable through a shield-and-spear tactical guard or counterthrust, never through standardized same-class armor. ELEMENT LANGUAGE: Mộc uses moss-green stitching, dark timber and muted leaf tones balanced by natural browns; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #ff00ff.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Hoàng Mộc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Mộc looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Hoàng Mộc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Mộc looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Hoàng Mộc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Mộc looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Hoàng Mộc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Mộc looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a shield-and-spear tactical guard or counterthrust. Source ultimate movement reference: performing the signature technique "Rễ Già Giữ Thành", rooted like an old tree, spear driven deep into the ground, shield held across the body, knees bent, heavy and immovable.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Hoàng Mộc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Mộc looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 29. Lục Diệp — Y sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a small sprig of mint tucked behind one ear; gentle, slender silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Lục Diệp, Y sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a short, cheerful young woman in her early twenties, round face with dimples, hair in two low buns tied with green ribbons, distinguishing mark: a small sprig of mint tucked behind one ear; gentle, slender silhouette.
PERSONAL VISUAL ANCHOR: a small sprig of mint tucked behind one ear; gentle, slender silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: layered woven belt and garment panels that reveal status through wear. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a green-lacquered medicine gourd with a woven bamboo sleeve, held out to the side in the right hand.
CLASS LANGUAGE: Y sư is recognizable through a battlefield herbal treatment action with medicine tools, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Lục Diệp. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Lục Diệp. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Lục Diệp. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Lục Diệp. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a battlefield herbal treatment action with medicine tools. Source ultimate movement reference: performing the signature technique "Xuân Mộc Vạn Sinh", blessing with spring life, kneeling on one knee with the gourd held to the chest, other hand spread outward, gentle smile.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Lục Diệp. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 30. Nhan Trúc — Mưu sĩ / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a thin bamboo-leaf tattoo under her left eye; lean, upright silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Nhan Trúc, Mưu sĩ class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a tall, sharp-eyed woman in her late twenties, slim, high cheekbones, hair in a high bun pierced by a bamboo hairpin, distinguishing mark: a thin bamboo-leaf tattoo under her left eye; lean, upright silhouette.
PERSONAL VISUAL ANCHOR: a thin bamboo-leaf tattoo under her left eye; lean, upright silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: asymmetrical sleeve construction grounded in practical movement. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a round fan of woven bamboo strips with a long black tassel, held out to the side in the right hand.
CLASS LANGUAGE: Mưu sĩ is recognizable through a fan-directed feint or disruption command, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Nhan Trúc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Nhan Trúc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Nhan Trúc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Nhan Trúc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a fan-directed feint or disruption command. Source ultimate movement reference: performing the signature technique "Trúc Độc Mê Hồn", casting a bewildering spell, the rigid round fan raised in front of the face moving in a slow circle, eyes narrowed and enchanting.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Nhan Trúc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 31. Sầm Tuệ — Quân sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a wooden bead necklace and reading-squint lines; composed, commanding silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Sầm Tuệ, Quân sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a calm, mature woman in her late thirties, straight posture, long hair tied back with a dark green cloth band, a few silver strands at the temples, distinguishing mark: a wooden bead necklace and reading-squint lines; composed, commanding silhouette.
PERSONAL VISUAL ANCHOR: a wooden bead necklace and reading-squint lines; composed, commanding silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: off-axis shoulder layering with visible fastening knots. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: emerald green, deep forest green and earthy brown wood (accent #4f9a4a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a bundle of bamboo slips tied with green cord in the left hand and a swallow-tailed green command pennant on a bamboo pole in the right hand, both held away from the body.
CLASS LANGUAGE: Quân sư is recognizable through a bamboo-slip and field-flag tactical order, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Sầm Tuệ. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Sầm Tuệ. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Sầm Tuệ. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Sầm Tuệ. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a bamboo-slip and field-flag tactical order. Source ultimate movement reference: performing the signature technique "Thanh Lâm Bày Trận", calmly arranging the army, pennant held level across the body, reading the bamboo slips in the other hand, serene focused face.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Sầm Tuệ. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 32. Hồ Lãng — Tướng sĩ / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a wave tattoo across his chest and shoulders, visible at the open collar; broad shoulders, solid stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Hồ Lãng, Tướng sĩ class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: an athletic man in his late twenties with a boatman's sun-dark skin, short stubble, wet-looking hair in a topknot tied with blue cord, distinguishing mark: a wave tattoo across his chest and shoulders, visible at the open collar; broad shoulders, solid stance.
PERSONAL VISUAL ANCHOR: a wave tattoo across his chest and shoulders, visible at the open collar; broad shoulders, solid stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: contrasting narrow and wide textile planes around shoulder and hip. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a long spear held upright in the right hand beside the body, shaft not crossing the torso.
CLASS LANGUAGE: Tướng sĩ is recognizable through a close-range martial strike, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Hồ Lãng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Hồ Lãng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Hồ Lãng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Hồ Lãng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a close-range martial strike. Source ultimate movement reference: performing the signature technique "Lãng Đào Trảm", a rising crescent slash like a breaking wave, the long spear sweeping upward from low beside the hip to above the head, body arched back, front foot planted.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Hồ Lãng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 33. Đào Lam — Pháp sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a graceful young woman in her early twenties, long flowing black hair with blue ribbons, serene expression; tall flowing silhouette.

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Đào Lam, Pháp sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a graceful young woman in her early twenties, long flowing black hair with blue ribbons, serene expression; tall flowing silhouette.
PERSONAL VISUAL ANCHOR: a graceful young woman in her early twenties, long flowing black hair with blue ribbons, serene expression; tall flowing silhouette.. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a carved bronze fastening plate prominently displayed at one side. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a short ritual staff of dark wood and bronze topped with a small water-element orb, held out to the side in the right hand.
CLASS LANGUAGE: Pháp sư is recognizable through a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Đào Lam. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Đào Lam. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Đào Lam. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Đào Lam. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery. Source ultimate movement reference: performing the signature technique "Băng Hà Phong Tỏa", sealing the enemy in ice, staff planted vertically in front of her with both hands, head bowed in focus, robe settling heavily, feet together.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Đào Lam. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 34. Thái Hà — Binh lính / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a fishing-net pattern woven into his vest and a shark-tooth charm on a cord; stocky, grounded stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Thái Hà, Binh lính class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a broad, sturdy man in his thirties, wide jaw, short beard, blue head wrap, distinguishing mark: a fishing-net pattern woven into his vest and a shark-tooth charm on a cord; stocky, grounded stance.
PERSONAL VISUAL ANCHOR: a fishing-net pattern woven into his vest and a shark-tooth charm on a cord; stocky, grounded stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: one distinctive diagonal sash crossing a patched torso layer. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a three-pronged fishing spear held upright in the right hand beside the body, and a round rattan shield edged with blue cord held out to the side on the left forearm, shield not covering the torso.
CLASS LANGUAGE: Binh lính is recognizable through a shield-and-spear tactical guard or counterthrust, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Thái Hà. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Thái Hà. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Thái Hà. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Thái Hà. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a shield-and-spear tactical guard or counterthrust. Source ultimate movement reference: performing the signature technique "Thủy Trại Liên Hoàn", rallying a defensive line, shield swept out to the side as if covering allies, spear raised in the other hand, calling out orders.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Thái Hà. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 35. Mai Thanh — Y sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a small mole above her lip and a white plum-blossom pin on the scarf; gentle, slender silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Mai Thanh, Y sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a kind, slender woman in her mid-twenties, soft features, hair under a pale blue head scarf, distinguishing mark: a small mole above her lip and a white plum-blossom pin on the scarf; gentle, slender silhouette.
PERSONAL VISUAL ANCHOR: a small mole above her lip and a white plum-blossom pin on the scarf; gentle, slender silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: an uneven outer mantle fixed with historically plausible cord ties. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a pale blue glazed medicine gourd with a silver stopper, hanging from a cord, held out to the side in the right hand.
CLASS LANGUAGE: Y sư is recognizable through a battlefield herbal treatment action with medicine tools, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Mai Thanh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Mai Thanh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Mai Thanh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Mai Thanh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a battlefield herbal treatment action with medicine tools. Source ultimate movement reference: performing the signature technique "Cam Lộ Hồi Xuân", pouring healing dew, medicine gourd tipped and raised high above the head in both hands, eyes closed, sleeves and apron fluttering.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Mai Thanh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 36. Quách Ẩn — Mưu sĩ / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a dark blue hooded short cape; lean, upright silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Quách Ẩn, Mưu sĩ class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a lanky, quiet man in his mid-thirties, half-lidded eyes, pale skin, long hair loose over one shoulder covering one eye, distinguishing mark: a dark blue hooded short cape; lean, upright silhouette.
PERSONAL VISUAL ANCHOR: a dark blue hooded short cape; lean, upright silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: different hem lengths for travel and mounted or marshland conditions. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a folding fan of dark blue paper with silver ribs, half open, held out to the side in the right hand.
CLASS LANGUAGE: Mưu sĩ is recognizable through a fan-directed feint or disruption command, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Quách Ẩn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Quách Ẩn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Quách Ẩn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Quách Ẩn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a fan-directed feint or disruption command. Source ultimate movement reference: performing the signature technique "Thủy Độn Ly Gián", slipping away while sowing discord, half-turned walking off, fan held over the shoulder, a finger at the lips.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Quách Ẩn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 37. Vi Triều — Quân sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a cord of cowrie shells across his chest; composed, commanding silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Vi Triều, Quân sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a tall, dignified man in his early fifties, long thin white-streaked beard, hair in a topknot with a blue jade pin, distinguishing mark: a cord of cowrie shells across his chest; composed, commanding silhouette.
PERSONAL VISUAL ANCHOR: a cord of cowrie shells across his chest; composed, commanding silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a waist-heavy profile emphasizing equipment and travel-worn cloth. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: ocean blue, deep azure, translucent aqua and pure white (accent #2f7fc1), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a bundle of bamboo slips in the left hand and a long blue banner-pole with a wave-edged triangular flag in the right hand, both held away from the body.
CLASS LANGUAGE: Quân sư is recognizable through a bamboo-slip and field-flag tactical order, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Vi Triều. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Vi Triều. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Vi Triều. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Vi Triều. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a bamboo-slip and field-flag tactical order. Source ultimate movement reference: performing the signature technique "Triều Dâng Vây Thành", commanding an encircling tide, banner swung low in a wide sweeping arc from side to side, leaning into the motion.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Vi Triều. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 38. Lý Liệt — Tướng sĩ / Chưa rõ

**Dấu hiệu nhận diện nguồn:** red-dyed ends of his hair and soot-dark fingertips; broad shoulders, solid stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Lý Liệt, Tướng sĩ class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a fierce, wiry young man in his mid-twenties, intense eyes, scar across one cheek, wild spiky hair tied back with a red band, distinguishing mark: red-dyed ends of his hair and soot-dark fingertips; broad shoulders, solid stance.
PERSONAL VISUAL ANCHOR: red-dyed ends of his hair and soot-dark fingertips; broad shoulders, solid stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a distinctive broken-line rhythm in the garment edges. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a long-handled pole-saber (dao on a long wooden pole) held upright in the right hand, blade near the head height and turned outward, shaft not crossing the torso.
CLASS LANGUAGE: Tướng sĩ is recognizable through a close-range martial strike, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Lý Liệt. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Lý Liệt. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Lý Liệt. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Lý Liệt. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a close-range martial strike. Source ultimate movement reference: performing the signature technique "Xích Hỏa Đoạt Kỳ", a leaping diagonal cleave meant to cut down the enemy banner, the pole-saber swung from high behind the shoulder down across the body, one knee raised, hair and cloth whipping upward.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Lý Liệt. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 39. Hà Vân — Pháp sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a small flame-shaped red mark on her forehead; tall flowing silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Hà Vân, Pháp sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a confident young woman in her mid-twenties, striking upturned eyes, red-tinted lips, hair in a high bun with red ribbons trailing, distinguishing mark: a small flame-shaped red mark on her forehead; tall flowing silhouette.
PERSONAL VISUAL ANCHOR: a small flame-shaped red mark on her forehead; tall flowing silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: layered woven belt and garment panels that reveal status through wear. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a short bronze ritual scepter topped with a lotus-bud cage holding a small fire orb, held out to the side in the right hand.
CLASS LANGUAGE: Pháp sư is recognizable through a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Hà Vân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Hà Vân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Hà Vân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Hà Vân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery. Source ultimate movement reference: performing the signature technique "Hỏa Vũ Liệu Nguyên", calling down a rain of fire, scepter raised high in the right hand, left arm sweeping wide across the sky, face turned upward, robe and hair lifting.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Hà Vân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 40. Trương Viêm — Binh lính / Chưa rõ

**Dấu hiệu nhận diện nguồn:** burn scars on both forearms and a blackened bronze armband; stocky, grounded stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Trương Viêm, Binh lính class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a muscular man in his late thirties, thick black beard, bald head under a red head wrap, distinguishing mark: burn scars on both forearms and a blackened bronze armband; stocky, grounded stance.
PERSONAL VISUAL ANCHOR: burn scars on both forearms and a blackened bronze armband; stocky, grounded stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: asymmetrical sleeve construction grounded in practical movement. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a halberd-spear with a crescent side blade held upright in the right hand beside the body, and a soot-stained round rattan shield held out to the side on the left forearm, shield not covering the torso.
CLASS LANGUAGE: Binh lính is recognizable through a shield-and-spear tactical guard or counterthrust, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Trương Viêm. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Trương Viêm. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Trương Viêm. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Trương Viêm. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a shield-and-spear tactical guard or counterthrust. Source ultimate movement reference: performing the signature technique "Viêm Giáp Hộ Doanh", a defiant taunt, shield thrust out in front, spear held back, chest puffed and chin raised, roaring at the enemy to come at him.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Trương Viêm. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 41. Hồng Đan — Y sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a red cinnabar dot between her eyebrows and a cinnabar-stained apron; gentle, slender silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Hồng Đan, Y sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: an elegant woman in her late twenties, warm smile, long neck, hair in a low bun with a red cord, distinguishing mark: a red cinnabar dot between her eyebrows and a cinnabar-stained apron; gentle, slender silhouette.
PERSONAL VISUAL ANCHOR: a red cinnabar dot between her eyebrows and a cinnabar-stained apron; gentle, slender silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: off-axis shoulder layering with visible fastening knots. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a red-lacquered medicine gourd with gold trim on a red cord, held out to the side in the right hand.
CLASS LANGUAGE: Y sư is recognizable through a battlefield herbal treatment action with medicine tools, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Hồng Đan. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Hồng Đan. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Hồng Đan. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Hồng Đan. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a battlefield herbal treatment action with medicine tools. Source ultimate movement reference: performing the signature technique "Đan Hỏa Hồi Nguyên", offering a warming elixir, gourd thrust forward with both hands, uncorked, chin raised, encouraging smile.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Hồng Đan. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 42. Ninh Hỏa — Mưu sĩ / Hỏa

**Dấu hiệu nhận diện nguồn:** a burnt hole on one sleeve and a tinderbox hanging from his belt; lean, upright silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Ninh Hỏa, Mưu sĩ class, Hỏa element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a lean, restless man around thirty, sharp grin, narrow mustache, hair in a small messy topknot, distinguishing mark: a burnt hole on one sleeve and a tinderbox hanging from his belt; lean, upright silhouette.
PERSONAL VISUAL ANCHOR: a burnt hole on one sleeve and a tinderbox hanging from his belt; lean, upright silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: contrasting narrow and wide textile planes around shoulder and hip. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a palm-leaf fan with singed edges and a red-wrapped handle, held out to the side in the right hand.
CLASS LANGUAGE: Mưu sĩ is recognizable through a fan-directed feint or disruption command, never through standardized same-class armor. ELEMENT LANGUAGE: Hỏa uses vermilion binding, charcoal, earthen red and small ember-orange accents; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Ninh Hỏa. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Hỏa looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Ninh Hỏa. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Hỏa looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Ninh Hỏa. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Hỏa looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Ninh Hỏa. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Hỏa looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a fan-directed feint or disruption command. Source ultimate movement reference: performing the signature technique "Hỏa Thiêu Kho Lương", ordering the enemy granary burned, fan pointed far ahead, other arm sweeping back, a sharp grin, robe swirling.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Ninh Hỏa. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Hỏa looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 43. Tôn Diệm — Quân sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a vermilion war-paint stripe across both cheeks; composed, commanding silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Tôn Diệm, Quân sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a commanding woman in her mid-thirties, sharp eyebrows, hair in a tall bun with a red-lacquered pin, distinguishing mark: a vermilion war-paint stripe across both cheeks; composed, commanding silhouette.
PERSONAL VISUAL ANCHOR: a vermilion war-paint stripe across both cheeks; composed, commanding silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a carved bronze fastening plate prominently displayed at one side. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: crimson red, fire orange and charcoal black with ember highlights (accent #d9502a), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a bundle of bamboo slips in the left hand and a red swallow-tailed command flag on a black pole in the right hand, both held away from the body.
CLASS LANGUAGE: Quân sư is recognizable through a bamboo-slip and field-flag tactical order, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Tôn Diệm. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Tôn Diệm. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Tôn Diệm. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Tôn Diệm. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a bamboo-slip and field-flag tactical order. Source ultimate movement reference: performing the signature technique "Hỏa Công Liên Kế", signaling a fire attack, flag whipped forward overhead, bamboo slips tucked under the arm, intense fiery eyes.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Tôn Diệm. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 44. Kha Sơn — Tướng sĩ / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a necklace of river stones and a cracked bronze shoulder plate; broad shoulders, solid stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Kha Sơn, Tướng sĩ class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a huge, mountain-like man in his late thirties, shaved sides, full bushy beard, short topknot, distinguishing mark: a necklace of river stones and a cracked bronze shoulder plate; broad shoulders, solid stance.
PERSONAL VISUAL ANCHOR: a necklace of river stones and a cracked bronze shoulder plate; broad shoulders, solid stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: one distinctive diagonal sash crossing a patched torso layer. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a long-handled bronze war axe in Dong Son style, the crescent blade held low and outward away from the legs in the right hand.
CLASS LANGUAGE: Tướng sĩ is recognizable through a close-range martial strike, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Kha Sơn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Kha Sơn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Kha Sơn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Kha Sơn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a close-range martial strike. Source ultimate movement reference: performing the signature technique "Sơn Hà Trấn Kích", a crushing downward strike driven into the ground, both hands on the bronze war axe, deep squat with knees wide, head lowered, as if splitting rock.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Kha Sơn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 45. Doãn Nham — Pháp sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** dusty gray stone-dust on his hands and a jade bi-disc on his belt; tall flowing silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Doãn Nham, Pháp sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a solemn, heavy-set man in his late forties, deep-set eyes, long braided beard, hair in a topknot with an ochre cloth, distinguishing mark: dusty gray stone-dust on his hands and a jade bi-disc on his belt; tall flowing silhouette.
PERSONAL VISUAL ANCHOR: dusty gray stone-dust on his hands and a jade bi-disc on his belt; tall flowing silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: an uneven outer mantle fixed with historically plausible cord ties. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a heavy staff of dark wood with a rough rock head wrapped in rope around a small amber orb, held out to the side in the right hand.
CLASS LANGUAGE: Pháp sư is recognizable through a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Doãn Nham. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Doãn Nham. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Doãn Nham. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Doãn Nham. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery. Source ultimate movement reference: performing the signature technique "Địa Mạch Bùng Phát", making the earth erupt, stamping one foot hard, staff slammed down onto the ground in both hands, body leaning over it.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Doãn Nham. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 46. Lê Thạch — Binh lính / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a chin strap of braided rope and a mud-stained ochre scarf; stocky, grounded stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Lê Thạch, Binh lính class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a steady, stocky young man in his mid-twenties, square jaw, short beard stubble, conical palm-leaf hat (non la), distinguishing mark: a chin strap of braided rope and a mud-stained ochre scarf; stocky, grounded stance.
PERSONAL VISUAL ANCHOR: a chin strap of braided rope and a mud-stained ochre scarf; stocky, grounded stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: different hem lengths for travel and mounted or marshland conditions. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a spear held upright in the right hand beside the body, and a round woven rattan shield held out to the side on the left forearm, shield not covering the torso.
CLASS LANGUAGE: Binh lính is recognizable through a shield-and-spear tactical guard or counterthrust, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Lê Thạch. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Lê Thạch. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Lê Thạch. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Lê Thạch. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a shield-and-spear tactical guard or counterthrust. Source ultimate movement reference: performing the signature technique "Trấn Sơn Hộ Quân", shielding the whole army, rattan shield raised high overhead like a roof, spear planted beside him, feet wide, looking back over the shoulder protectively.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Lê Thạch. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 47. Bế Liên — Y sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a thick silver neck ring and embroidered indigo leggings; gentle, slender silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Bế Liên, Y sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a sturdy, warm-faced highland woman in her thirties, rosy cheeks, hair wrapped in an indigo-and-ochre head cloth, distinguishing mark: a thick silver neck ring and embroidered indigo leggings; gentle, slender silhouette.
PERSONAL VISUAL ANCHOR: a thick silver neck ring and embroidered indigo leggings; gentle, slender silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a waist-heavy profile emphasizing equipment and travel-worn cloth. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a large brown gourd carried on a woven shoulder strap, one hand resting on it, the other hand open at the side.
CLASS LANGUAGE: Y sư is recognizable through a battlefield herbal treatment action with medicine tools, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Bế Liên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Bế Liên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Bế Liên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Bế Liên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a battlefield herbal treatment action with medicine tools. Source ultimate movement reference: performing the signature technique "Hậu Thổ Dưỡng Nguyên", drawing strength from the earth, kneeling with one palm on the ground and the big gourd lifted off its strap in the other hand.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Bế Liên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 48. Mã Nhạc — Mưu sĩ / Chưa rõ

**Dấu hiệu nhận diện nguồn:** an ink-stained right hand and a grain-measure token on his belt; lean, upright silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Mã Nhạc, Mưu sĩ class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a cautious, round-shouldered man in his mid-forties, heavy eyebrows, droopy mustache, brown scholar's head wrap, distinguishing mark: an ink-stained right hand and a grain-measure token on his belt; lean, upright silhouette.
PERSONAL VISUAL ANCHOR: an ink-stained right hand and a grain-measure token on his belt; lean, upright silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a distinctive broken-line rhythm in the garment edges. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a stiff square fan of woven reed with a wooden frame, held out to the side in the right hand.
CLASS LANGUAGE: Mưu sĩ is recognizable through a fan-directed feint or disruption command, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Mã Nhạc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Mã Nhạc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Mã Nhạc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Mã Nhạc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a fan-directed feint or disruption command. Source ultimate movement reference: performing the signature technique "Đoạn Đạo Tuyệt Lương", cutting the supply line, square fan swung down sharply edge-first, other hand behind the back, cold expression.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Mã Nhạc. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 49. Tạ Thạch — Quân sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** very bushy white eyebrows and a carved stone talisman on his chest; composed, commanding silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Tạ Thạch, Quân sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: an old but solid man in his late fifties, white-streaked beard, weathered face, topknot with a stone bead pin, distinguishing mark: very bushy white eyebrows and a carved stone talisman on his chest; composed, commanding silhouette.
PERSONAL VISUAL ANCHOR: very bushy white eyebrows and a carved stone talisman on his chest; composed, commanding silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: layered woven belt and garment panels that reveal status through wear. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: ochre yellow, deep mud brown, sand beige and old stone gray (accent #a5772f), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a bundle of bamboo slips bound with ochre cord in the left hand and a stiff rectangular ochre command pennant on a short pole in the right hand, both held away from the body.
CLASS LANGUAGE: Quân sư is recognizable through a bamboo-slip and field-flag tactical order, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Tạ Thạch. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Tạ Thạch. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Tạ Thạch. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Tạ Thạch. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a bamboo-slip and field-flag tactical order. Source ultimate movement reference: performing the signature technique "Bát Trận Thạch Lũy", laying out a stone formation, bamboo slips unrolled and held up, pennant planted into the ground beside him, steady commanding stance.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Tạ Thạch. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 50. Tống Tấn — Tướng sĩ / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a zigzag scar running down his neck; broad shoulders, solid stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Tống Tấn, Tướng sĩ class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a quick, lean man in his late twenties, piercing eyes, spiky short beard, hair tied high with a purple band, distinguishing mark: a zigzag scar running down his neck; broad shoulders, solid stance.
PERSONAL VISUAL ANCHOR: a zigzag scar running down his neck; broad shoulders, solid stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: asymmetrical sleeve construction grounded in practical movement. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a long two-handed straight sword held in the right hand, the long blade angled down and outward away from the legs.
CLASS LANGUAGE: Tướng sĩ is recognizable through a close-range martial strike, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Tống Tấn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Tống Tấn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Tống Tấn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Tống Tấn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a close-range martial strike. Source ultimate movement reference: performing the signature technique "Lôi Đao Liên Trảm", mid-way through a rapid chain of slashes, the two-handed sword blurred across the chest, body leaning forward on the balls of the feet, fierce focused eyes.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Tống Tấn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 51. Vũ Lôi — Pháp sư / Lôi

**Dấu hiệu nhận diện nguồn:** hair standing slightly on end as if charged and a small bronze drum hanging at his hip; tall flowing silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Vũ Lôi, Pháp sư class, Lôi element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: an intense, tall man around thirty, wild loose hair half tied, strong brow, thin beard, distinguishing mark: hair standing slightly on end as if charged and a small bronze drum hanging at his hip; tall flowing silhouette.
PERSONAL VISUAL ANCHOR: hair standing slightly on end as if charged and a small bronze drum hanging at his hip; tall flowing silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: off-axis shoulder layering with visible fastening knots. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a ritual staff crowned with a tiny bronze drum around a violet orb, held out to the side in the right hand.
CLASS LANGUAGE: Pháp sư is recognizable through a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery, never through standardized same-class armor. ELEMENT LANGUAGE: Lôi uses storm grey, muted amethyst and a few yellow zigzag accents without electric technology; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Vũ Lôi. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Lôi looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Vũ Lôi. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Lôi looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Vũ Lôi. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Lôi looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Vũ Lôi. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Lôi looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery. Source ultimate movement reference: performing the signature technique "Thiên Lôi Giáng Thế", summoning a lightning bolt, staff thrust straight up to the sky in the right hand, left hand pointing down at the enemy, hair standing on end, robe flaring.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Vũ Lôi. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Lôi looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 52. Ông Chấn — Binh lính / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a missing left ear and a heavy bronze gorget; stocky, grounded stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Ông Chấn, Binh lính class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a thick-set veteran in his late forties, broken nose, short gray beard, purple head wrap, distinguishing mark: a missing left ear and a heavy bronze gorget; stocky, grounded stance.
PERSONAL VISUAL ANCHOR: a missing left ear and a heavy bronze gorget; stocky, grounded stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: contrasting narrow and wide textile planes around shoulder and hip. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a short heavy spear with a broad blade held upright in the right hand beside the body, and a small round rattan shield with a bronze zigzag rim held out to the side on the left forearm, shield not covering the torso.
CLASS LANGUAGE: Binh lính is recognizable through a shield-and-spear tactical guard or counterthrust, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Ông Chấn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Ông Chấn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Ông Chấn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Ông Chấn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a shield-and-spear tactical guard or counterthrust. Source ultimate movement reference: performing the signature technique "Chấn Lôi Thiết Vệ", bracing for a heavy blow, shield slammed down in front of the feet, spear raised high, shouting, knees deeply bent.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Ông Chấn. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 53. Tiêu Minh — Y sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a streak of white in her hair like a lightning flash; gentle, slender silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Tiêu Minh, Y sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a bright, quick-eyed young woman around twenty, petite, short hair cut to the jaw with a purple headband, distinguishing mark: a streak of white in her hair like a lightning flash; gentle, slender silhouette.
PERSONAL VISUAL ANCHOR: a streak of white in her hair like a lightning flash; gentle, slender silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a carved bronze fastening plate prominently displayed at one side. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a pair of small purple-glazed medicine gourds tied together on one cord, held out to the side in the right hand.
CLASS LANGUAGE: Y sư is recognizable through a battlefield herbal treatment action with medicine tools, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Tiêu Minh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Tiêu Minh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Tiêu Minh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Tiêu Minh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a battlefield herbal treatment action with medicine tools. Source ultimate movement reference: performing the signature technique "Lôi Châm Khởi Tử", a jolting revival, arm thrust down as if striking a needle into a fallen ally, the pair of gourds swinging behind, determined face.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Tiêu Minh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 54. Từ Kinh — Mưu sĩ / Chưa rõ

**Dấu hiệu nhận diện nguồn:** long fingernails and a purple silk scarf tucked in his collar; lean, upright silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Từ Kinh, Mưu sĩ class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a pale, sharp-featured man in his mid-thirties, narrow eyes, neat mustache, dark scholar's cap, distinguishing mark: long fingernails and a purple silk scarf tucked in his collar; lean, upright silhouette.
PERSONAL VISUAL ANCHOR: long fingernails and a purple silk scarf tucked in his collar; lean, upright silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: one distinctive diagonal sash crossing a patched torso layer. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: an iron-ribbed folding fan, closed like a short baton, held out to the side in the right hand.
CLASS LANGUAGE: Mưu sĩ is recognizable through a fan-directed feint or disruption command, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Từ Kinh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Từ Kinh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Từ Kinh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Từ Kinh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a fan-directed feint or disruption command. Source ultimate movement reference: performing the signature technique "Kinh Lôi Đoạt Khí", a sudden startling strike of words, the closed fan jabbed forward, leaning in, eyes wide and commanding.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Từ Kinh. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 55. Mạc Vân — Quân sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a dark beauty mark under her right eye and long silver earrings; composed, commanding silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Mạc Vân, Quân sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a cool, composed woman in her early thirties, tall, long straight hair tied low, a purple cord across her brow, distinguishing mark: a dark beauty mark under her right eye and long silver earrings; composed, commanding silhouette.
PERSONAL VISUAL ANCHOR: a dark beauty mark under her right eye and long silver earrings; composed, commanding silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: an uneven outer mantle fixed with historically plausible cord ties. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: amethyst purple, bright violet and dark obsidian with electric blue highlights (accent #7d55c7), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a bundle of bamboo slips in the left hand and a narrow purple pennant with a zigzag edge on a tall pole in the right hand, both held away from the body.
CLASS LANGUAGE: Quân sư is recognizable through a bamboo-slip and field-flag tactical order, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Mạc Vân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Mạc Vân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Mạc Vân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Mạc Vân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a bamboo-slip and field-flag tactical order. Source ultimate movement reference: performing the signature technique "Lôi Trận Kinh Hồn", a thunderous command, pennant thrust forward and down sharply, mouth open in a shout, cape snapping behind.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Mạc Vân. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 56. Hứa Lăng — Tướng sĩ / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a light leather eye-scarf pushed up on her forehead and bare forearms wrapped in cloth strips; broad shoulders, solid stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Hứa Lăng, Tướng sĩ class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: an agile, slim woman warrior in her mid-twenties, determined eyes, high ponytail tied with a very long teal ribbon, distinguishing mark: a light leather eye-scarf pushed up on her forehead and bare forearms wrapped in cloth strips; broad shoulders, solid stance.
PERSONAL VISUAL ANCHOR: a light leather eye-scarf pushed up on her forehead and bare forearms wrapped in cloth strips; broad shoulders, solid stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: different hem lengths for travel and mounted or marshland conditions. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: lamellar armor of bronze plates laced over leather, worn over a cross-collar (giao linh) tunic; short sleeves so the bare or bracer-covered upper arms read clearly; leather bracers, wide belt, cloth leg wraps. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a slender curved saber with a long teal tassel on the pommel, held in the right hand angled down and outward away from the legs.
CLASS LANGUAGE: Tướng sĩ is recognizable through a close-range martial strike, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Hứa Lăng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Hứa Lăng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Hứa Lăng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Hứa Lăng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a close-range martial strike. Source ultimate movement reference: performing the signature technique "Truy Phong Đoạt Mệnh", a dashing pursuit strike, body almost horizontal leaning forward, one foot just leaving the ground, the curved saber thrust ahead, ponytail and ribbon streaming straight back.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Hứa Lăng. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Tướng sĩ of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a close-range martial strike.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 57. Liễu Yên — Pháp sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a sheer pale veil scarf around her shoulders; tall flowing silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Liễu Yên, Pháp sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a delicate young woman around nineteen, willowy, long hair loose with light strands floating, thin teal hair ribbons, distinguishing mark: a sheer pale veil scarf around her shoulders; tall flowing silhouette.
PERSONAL VISUAL ANCHOR: a sheer pale veil scarf around her shoulders; tall flowing silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a waist-heavy profile emphasizing equipment and travel-worn cloth. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: layered cross-collar (giao linh) ritual robe with a silk sash and bronze ornaments; sleeves bound with cords above the elbow so the shape of the upper arm stays readable. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a tall slender bamboo staff with feather streamers around a pale teal orb, held out to the side in the right hand.
CLASS LANGUAGE: Pháp sư is recognizable through a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Liễu Yên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Liễu Yên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Liễu Yên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Liễu Yên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery. Source ultimate movement reference: performing the signature technique "Phong Ấn Cuồng Lưu", spinning to summon a whirlwind, body turning on one foot, staff held out at arm's length in a circle, long hair and sleeves wrapping around her.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Liễu Yên. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Pháp sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a compact talismanic staff technique, folk ritual gesture rather than high fantasy sorcery.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 58. Mạnh Tường — Binh lính / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a bamboo kite-whistle hanging from his belt; stocky, grounded stance

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Mạnh Tường, Binh lính class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a tall, wiry young man in his early twenties, alert eyes, clean-shaven, teal head wrap with long trailing ends, distinguishing mark: a bamboo kite-whistle hanging from his belt; stocky, grounded stance.
PERSONAL VISUAL ANCHOR: a bamboo kite-whistle hanging from his belt; stocky, grounded stance. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: a distinctive broken-line rhythm in the garment edges. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: padded leather vest with small iron scales over a short cross-collar tunic, fitted sleeves, cloth leg wraps, straw sandals. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a long thin spear with a small teal pennant under the blade held upright in the right hand beside the body, and a light oval rattan shield held out to the side on the left forearm, shield not covering the torso.
CLASS LANGUAGE: Binh lính is recognizable through a shield-and-spear tactical guard or counterthrust, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Mạnh Tường. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Mạnh Tường. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Mạnh Tường. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Mạnh Tường. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a shield-and-spear tactical guard or counterthrust. Source ultimate movement reference: performing the signature technique "Phong Lũy Hộ Kỳ", guarding the army flag, spear held upright like a standard pole, shield raised to the side, standing tall with feet apart, cloth streaming.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Mạnh Tường. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Binh lính of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a shield-and-spear tactical guard or counterthrust.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 59. Bạch Sương — Y sư / Chưa rõ

**Dấu hiệu nhận diện nguồn:** white frost-like embroidery on her sleeves and a white feather hair ornament; gentle, slender silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Bạch Sương, Y sư class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a pale, gentle woman in her late twenties, light gray-streaked hair in a loose bun, soft smile, distinguishing mark: white frost-like embroidery on her sleeves and a white feather hair ornament; gentle, slender silhouette.
PERSONAL VISUAL ANCHOR: white frost-like embroidery on her sleeves and a white feather hair ornament; gentle, slender silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: layered woven belt and garment panels that reveal status through wear. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: light cross-collar (giao linh) robe with a short apron, herb pouches hanging from the belt, fitted sleeves rolled to the forearm. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a white jade-colored medicine gourd hung from a long silk cord, held out to the side in the right hand.
CLASS LANGUAGE: Y sư is recognizable through a battlefield herbal treatment action with medicine tools, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Bạch Sương. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Bạch Sương. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Bạch Sương. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Bạch Sương. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a battlefield herbal treatment action with medicine tools. Source ultimate movement reference: performing the signature technique "Gió Lành Tẩy Uế", sending a cleansing breeze, turning gracefully with the gourd swung out on its cord in a wide arc, hair and robe flowing.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Bạch Sương. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Y sư of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a battlefield herbal treatment action with medicine tools.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 60. Bùi Phiêu — Mưu sĩ / Chưa rõ

**Dấu hiệu nhận diện nguồn:** a bamboo flute tucked in his belt and a stalk of grass between his teeth; lean, upright silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Bùi Phiêu, Mưu sĩ class, Chưa rõ element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a carefree-looking man in his late twenties, lanky, messy hair under a loose cloth head wrap, faint smirk, distinguishing mark: a bamboo flute tucked in his belt and a stalk of grass between his teeth; lean, upright silhouette.
PERSONAL VISUAL ANCHOR: a bamboo flute tucked in his belt and a stalk of grass between his teeth; lean, upright silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: asymmetrical sleeve construction grounded in practical movement. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: scholar's cross-collar (giao linh) robe with a soft cloth head wrap, narrow sleeves, a cord belt with a small brush case. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a long white goose-feather fan, held out to the side in the right hand.
CLASS LANGUAGE: Mưu sĩ is recognizable through a fan-directed feint or disruption command, never through standardized same-class armor. ELEMENT LANGUAGE: Chưa rõ uses undefined; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #00b140.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Bùi Phiêu. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Bùi Phiêu. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Bùi Phiêu. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Bùi Phiêu. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a fan-directed feint or disruption command. Source ultimate movement reference: performing the signature technique "Phiêu Phong Ly Gián", a whirling scheme, spinning on one heel with the fan held out, robe twirling, mocking smile.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Bùi Phiêu. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Mưu sĩ of Chưa rõ looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a fan-directed feint or disruption command.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

---

### 61. Phùng Phong — Quân sư / Phong

**Dấu hiệu nhận diện nguồn:** a cloud-scroll embroidered cape and a small bronze wind-chime on his sash; composed, commanding silhouette

**Tình trạng:** Giữ ảnh đã duyệt nếu có; chỉ áp dụng biến thể cấu trúc mới cho nhân vật chưa render hoặc sau phê duyệt.

#### Prompt tạo hình chính (Neutral)

```text
Full-body character design for Reed Banner, character Phùng Phong, Quân sư class, Phong element, Vietnamese tenth-century Ngo–Dinh and Twelve Warlords period, historical low fantasy.
UNIQUE PERSON: a calm, thin man in his mid-forties, long thin beard, hair wrapped in a teal cloth, distinguishing mark: a cloud-scroll embroidered cape and a small bronze wind-chime on his sash; composed, commanding silhouette.
PERSONAL VISUAL ANCHOR: a cloud-scroll embroidered cape and a small bronze wind-chime on his sash; composed, commanding silhouette. Use a character-specific silhouette created from the stated anatomy, headwear and weapon, not from an archetypal class uniform. Distinctive construction cue: off-axis shoulder layering with visible fastening knots. Keep the existing personal markers; this construction cue is a PROPOSAL ONLY when approved reference art already exists.
COSTUME AND MATERIALS: long cross-collar (giao linh) robe with a short shoulder cape and a command sash across the chest, fitted sleeves. Main colors: pale jade teal, misty silver-white and soft gray (accent #2e9e90), with bronze gold and warm beige as neutrals.
HELD OBJECT WITH GEOMETRY LOCK: a bundle of bamboo slips in the left hand and a tall teal command flag with a feathered tip on a long pole in the right hand, both held away from the body.
CLASS LANGUAGE: Quân sư is recognizable through a bamboo-slip and field-flag tactical order, never through standardized same-class armor. ELEMENT LANGUAGE: Phong uses pale teal ribbon accents, mist-grey linen and airy off-white layers; visible on at most a few meaningful trim areas, not a full-body costume tint.
10TH-CENTURY AUTHENTICITY: naturally dyed textiles, woven rattan, bamboo, iron and bronze as fitting; simple cross-collar or local practical dress; no later dynastic regalia, Chinese opera crowns, Japanese ninja dress, Western plate armor, floating books, gunpowder devices or sci-fi weapons. Decorative Dong Son-derived motifs are modern design inspiration, not historical reconstruction. Fictional supporting hero; outfit must communicate plausible social background.
RENDER: semi-realistic anime-influenced 2D game illustration, bold dark-brown outlines, restrained two-tone cel shading, believable adult anatomy, three-quarter right-facing view, complete figure and weapon, clean margin, hands and sleeves separated from torso for PixiJS cutout. One character, no extra figures, no lettering, no VFX baked in, uniform flat chroma background #ff00ff.
```

#### Dáng đứng cá nhân

```text
Use the approved full-body reference image of Phùng Phong. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Phong looks different. standing as a living person rather than a symmetrical mannequin, distributing weight according to the specific body type and background, keeping the signature artifact unobscured and all joints separated for 2D cutout. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Đứng cảnh giới

```text
Use the approved full-body reference image of Phùng Phong. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Phong looks different. observing an unseen opponent to the right, shifting weight and weapon position in a unique, physically practical defensive posture. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Ra chiêu

```text
Use the approved full-body reference image of Phùng Phong. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Phong looks different. executing a restrained but forceful combat action with correct weight transfer and weapon handling; the entire weapon and signature accessory remain visible. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Tuyệt chiêu

```text
Use the approved full-body reference image of Phùng Phong. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Phong looks different. performing a decisive signature-finishing gesture expressing personal temperament and tactical role; no supernatural VFX baked into the art. The action vocabulary is a bamboo-slip and field-flag tactical order. Source ultimate movement reference: performing the signature technique "Phong Vân Biến Trận", changing the battle formation, command flag swept in a wide arc overhead, bamboo slips held out in the other hand, cape billowing.. Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

#### Bị hạ gục

```text
Use the approved full-body reference image of Phùng Phong. Preserve exact face, hairstyle, expression, body proportions, all costume layers, stitches, color distribution, signature weapon geometry, personal ornaments, and rendering style. Never redesign the person, even if another Quân sư of Phong looks different. kneeling or collapsing non-graphically in a pose consistent with the character's mass, gear and weapon, all unique accessories preserved. The action vocabulary is a bamboo-slip and field-flag tactical order.  Maintain readable complete silhouette, three-quarter facing right, isolated flat chroma ground, no particles, terrain, blood or magical VFX.
```

## Phần B — 14 nhân vật mở rộng: 7 Cung thủ và 7 Sát thủ

### 62. Bạch Nỏ Lang — Cung thủ / Kim

**Xuất thân hư cấu:** fortress defender. **Điểm nhận diện:** stocky torso, rectangular profile, one oversized brass crossbow stock; lever-assisted heavy hand-crossbow; palm-sized drum-shaped watch token.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese male character Bạch Nỏ Lang, Cung thủ of Kim, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: fortress defender. PERSONALITY: disciplined, unblinking.
ANATOMY AND SILHOUETTE: stocky torso, rectangular profile, one oversized brass crossbow stock. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: pale linen head wrap, bronze-backed forearm brace, angular bolt case. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: palm-sized drum-shaped watch token. PRIMARY WEAPON: lever-assisted heavy hand-crossbow; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Cung thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Kim expressed by ivory linen, brushed iron, muted silver, weathered bronze; metallic accents concentrated on equipment, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma green #00b140, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Bạch Nỏ Lang as the required sole character reference. Match face, body, hair, pale linen head wrap, bronze-backed forearm brace, angular bolt case, lever-assisted heavy hand-crossbow, palm-sized drum-shaped watch token and Kim accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing disciplined, unblinking; stocky torso, rectangular profile, one oversized brass crossbow stock. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Bạch Nỏ Lang as the required sole character reference. Match face, body, hair, pale linen head wrap, bronze-backed forearm brace, angular bolt case, lever-assisted heavy hand-crossbow, palm-sized drum-shaped watch token and Kim accent palette exactly. Only change the pose: Alert stance embodying aiming at a distant exposed enemy; bow or crossbow operation remains plausible; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Bạch Nỏ Lang as the required sole character reference. Match face, body, hair, pale linen head wrap, bronze-backed forearm brace, angular bolt case, lever-assisted heavy hand-crossbow, palm-sized drum-shaped watch token and Kim accent palette exactly. Only change the pose: Attack frame: aiming at a distant exposed enemy; bow or crossbow operation remains plausible; emphasize action mechanics of lever-assisted heavy hand-crossbow. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Bạch Nỏ Lang as the required sole character reference. Match face, body, hair, pale linen head wrap, bronze-backed forearm brace, angular bolt case, lever-assisted heavy hand-crossbow, palm-sized drum-shaped watch token and Kim accent palette exactly. Only change the pose: Ultimate frame: a focused long-range shot with precise alignment and hand control; keep the same lever-assisted heavy hand-crossbow, palm-sized drum-shaped watch token and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Bạch Nỏ Lang as the required sole character reference. Match face, body, hair, pale linen head wrap, bronze-backed forearm brace, angular bolt case, lever-assisted heavy hand-crossbow, palm-sized drum-shaped watch token and Kim accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact lever-assisted heavy hand-crossbow and palm-sized drum-shaped watch token remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 63. Thanh Lâm Xạ — Cung thủ / Mộc

**Xuất thân hư cấu:** upland forest tracker. **Điểm nhận diện:** long bent-knee stance, asymmetric bark-fibre mantle; long asymmetric bamboo bow; three-holed seed whistle.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese female character Thanh Lâm Xạ, Cung thủ of Mộc, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: upland forest tracker. PERSONALITY: patient, listening.
ANATOMY AND SILHOUETTE: long bent-knee stance, asymmetric bark-fibre mantle. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: woven leaf-cloak, rope-bound gaiters and herbs tied to a side satchel. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: three-holed seed whistle. PRIMARY WEAPON: long asymmetric bamboo bow; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Cung thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Mộc expressed by moss-green stitching, dark timber and muted leaf tones balanced by natural browns, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma magenta #ff00ff, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Thanh Lâm Xạ as the required sole character reference. Match face, body, hair, woven leaf-cloak, rope-bound gaiters and herbs tied to a side satchel, long asymmetric bamboo bow, three-holed seed whistle and Mộc accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing patient, listening; long bent-knee stance, asymmetric bark-fibre mantle. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Thanh Lâm Xạ as the required sole character reference. Match face, body, hair, woven leaf-cloak, rope-bound gaiters and herbs tied to a side satchel, long asymmetric bamboo bow, three-holed seed whistle and Mộc accent palette exactly. Only change the pose: Alert stance embodying aiming at a distant exposed enemy; bow or crossbow operation remains plausible; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Thanh Lâm Xạ as the required sole character reference. Match face, body, hair, woven leaf-cloak, rope-bound gaiters and herbs tied to a side satchel, long asymmetric bamboo bow, three-holed seed whistle and Mộc accent palette exactly. Only change the pose: Attack frame: aiming at a distant exposed enemy; bow or crossbow operation remains plausible; emphasize action mechanics of long asymmetric bamboo bow. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Thanh Lâm Xạ as the required sole character reference. Match face, body, hair, woven leaf-cloak, rope-bound gaiters and herbs tied to a side satchel, long asymmetric bamboo bow, three-holed seed whistle and Mộc accent palette exactly. Only change the pose: Ultimate frame: a focused long-range shot with precise alignment and hand control; keep the same long asymmetric bamboo bow, three-holed seed whistle and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Thanh Lâm Xạ as the required sole character reference. Match face, body, hair, woven leaf-cloak, rope-bound gaiters and herbs tied to a side satchel, long asymmetric bamboo bow, three-holed seed whistle and Mộc accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact long asymmetric bamboo bow and three-holed seed whistle remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 64. Lam Giang Nỗ — Cung thủ / Thủy

**Xuất thân hư cấu:** river landing scout. **Điểm nhận diện:** lean low centre of gravity, broad coiled rope at hip; short river skirmish crossbow; carved river buoy pendant.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese male character Lam Giang Nỗ, Cung thủ of Thủy, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: river landing scout. PERSONALITY: silent and calculating.
ANATOMY AND SILHOUETTE: lean low centre of gravity, broad coiled rope at hip. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: indigo cropped coat, tightly gathered trouser hems, fishing-net half mantle. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: carved river buoy pendant. PRIMARY WEAPON: short river skirmish crossbow; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Cung thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Thủy expressed by river indigo, blue-grey, washed linen and restrained cool-blue highlights, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma green #00b140, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Lam Giang Nỗ as the required sole character reference. Match face, body, hair, indigo cropped coat, tightly gathered trouser hems, fishing-net half mantle, short river skirmish crossbow, carved river buoy pendant and Thủy accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing silent and calculating; lean low centre of gravity, broad coiled rope at hip. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Lam Giang Nỗ as the required sole character reference. Match face, body, hair, indigo cropped coat, tightly gathered trouser hems, fishing-net half mantle, short river skirmish crossbow, carved river buoy pendant and Thủy accent palette exactly. Only change the pose: Alert stance embodying aiming at a distant exposed enemy; bow or crossbow operation remains plausible; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Lam Giang Nỗ as the required sole character reference. Match face, body, hair, indigo cropped coat, tightly gathered trouser hems, fishing-net half mantle, short river skirmish crossbow, carved river buoy pendant and Thủy accent palette exactly. Only change the pose: Attack frame: aiming at a distant exposed enemy; bow or crossbow operation remains plausible; emphasize action mechanics of short river skirmish crossbow. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Lam Giang Nỗ as the required sole character reference. Match face, body, hair, indigo cropped coat, tightly gathered trouser hems, fishing-net half mantle, short river skirmish crossbow, carved river buoy pendant and Thủy accent palette exactly. Only change the pose: Ultimate frame: a focused long-range shot with precise alignment and hand control; keep the same short river skirmish crossbow, carved river buoy pendant and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Lam Giang Nỗ as the required sole character reference. Match face, body, hair, indigo cropped coat, tightly gathered trouser hems, fishing-net half mantle, short river skirmish crossbow, carved river buoy pendant and Thủy accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact short river skirmish crossbow and carved river buoy pendant remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 65. Xích Diệm Tiễn — Cung thủ / Hỏa

**Xuất thân hư cấu:** campaign incendiary specialist. **Điểm nhận diện:** broad confident footing, one diagonal fire-arrow container; thick-limbed heavy bow with ordinary fire-arrow fittings; scorched red banner strip.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese female character Xích Diệm Tiễn, Cung thủ of Hỏa, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: campaign incendiary specialist. PERSONALITY: bold and severe.
ANATOMY AND SILHOUETTE: broad confident footing, one diagonal fire-arrow container. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: vermilion cloth tabs, leather guard, sealed earthen tinder pot. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: scorched red banner strip. PRIMARY WEAPON: thick-limbed heavy bow with ordinary fire-arrow fittings; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Cung thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Hỏa expressed by vermilion binding, charcoal, earthen red and small ember-orange accents, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma green #00b140, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Xích Diệm Tiễn as the required sole character reference. Match face, body, hair, vermilion cloth tabs, leather guard, sealed earthen tinder pot, thick-limbed heavy bow with ordinary fire-arrow fittings, scorched red banner strip and Hỏa accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing bold and severe; broad confident footing, one diagonal fire-arrow container. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Xích Diệm Tiễn as the required sole character reference. Match face, body, hair, vermilion cloth tabs, leather guard, sealed earthen tinder pot, thick-limbed heavy bow with ordinary fire-arrow fittings, scorched red banner strip and Hỏa accent palette exactly. Only change the pose: Alert stance embodying aiming at a distant exposed enemy; bow or crossbow operation remains plausible; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Xích Diệm Tiễn as the required sole character reference. Match face, body, hair, vermilion cloth tabs, leather guard, sealed earthen tinder pot, thick-limbed heavy bow with ordinary fire-arrow fittings, scorched red banner strip and Hỏa accent palette exactly. Only change the pose: Attack frame: aiming at a distant exposed enemy; bow or crossbow operation remains plausible; emphasize action mechanics of thick-limbed heavy bow with ordinary fire-arrow fittings. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Xích Diệm Tiễn as the required sole character reference. Match face, body, hair, vermilion cloth tabs, leather guard, sealed earthen tinder pot, thick-limbed heavy bow with ordinary fire-arrow fittings, scorched red banner strip and Hỏa accent palette exactly. Only change the pose: Ultimate frame: a focused long-range shot with precise alignment and hand control; keep the same thick-limbed heavy bow with ordinary fire-arrow fittings, scorched red banner strip and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Xích Diệm Tiễn as the required sole character reference. Match face, body, hair, vermilion cloth tabs, leather guard, sealed earthen tinder pot, thick-limbed heavy bow with ordinary fire-arrow fittings, scorched red banner strip and Hỏa accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact thick-limbed heavy bow with ordinary fire-arrow fittings and scorched red banner strip remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 66. Trấn Sơn Cung — Cung thủ / Thổ

**Xuất thân hư cấu:** hill-fort bowman. **Điểm nhận diện:** short broad torso, immense bowed stave vertical beside body; stout heavy longbow; round tortoise-like forearm plate.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese male character Trấn Sơn Cung, Cung thủ of Thổ, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: hill-fort bowman. PERSONALITY: unyielding and reserved.
ANATOMY AND SILHOUETTE: short broad torso, immense bowed stave vertical beside body. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: clay ochre layered vest, thick rawhide bracers, gravel-colored leg wraps. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: round tortoise-like forearm plate. PRIMARY WEAPON: stout heavy longbow; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Cung thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Thổ expressed by ochre, clay, sand, umber, aged bronze, heavy material transitions, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma green #00b140, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Trấn Sơn Cung as the required sole character reference. Match face, body, hair, clay ochre layered vest, thick rawhide bracers, gravel-colored leg wraps, stout heavy longbow, round tortoise-like forearm plate and Thổ accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing unyielding and reserved; short broad torso, immense bowed stave vertical beside body. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Trấn Sơn Cung as the required sole character reference. Match face, body, hair, clay ochre layered vest, thick rawhide bracers, gravel-colored leg wraps, stout heavy longbow, round tortoise-like forearm plate and Thổ accent palette exactly. Only change the pose: Alert stance embodying aiming at a distant exposed enemy; bow or crossbow operation remains plausible; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Trấn Sơn Cung as the required sole character reference. Match face, body, hair, clay ochre layered vest, thick rawhide bracers, gravel-colored leg wraps, stout heavy longbow, round tortoise-like forearm plate and Thổ accent palette exactly. Only change the pose: Attack frame: aiming at a distant exposed enemy; bow or crossbow operation remains plausible; emphasize action mechanics of stout heavy longbow. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Trấn Sơn Cung as the required sole character reference. Match face, body, hair, clay ochre layered vest, thick rawhide bracers, gravel-colored leg wraps, stout heavy longbow, round tortoise-like forearm plate and Thổ accent palette exactly. Only change the pose: Ultimate frame: a focused long-range shot with precise alignment and hand control; keep the same stout heavy longbow, round tortoise-like forearm plate and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Trấn Sơn Cung as the required sole character reference. Match face, body, hair, clay ochre layered vest, thick rawhide bracers, gravel-colored leg wraps, stout heavy longbow, round tortoise-like forearm plate and Thổ accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact stout heavy longbow and round tortoise-like forearm plate remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 67. Lôi Minh Xạ — Cung thủ / Lôi

**Xuất thân hư cấu:** fast-response messenger-archer. **Điểm nhận diện:** sharp triangular silhouette, high-tied hair, asymmetric short shoulder cloth; thin recurved wooden bow; weathered bronze signal bell.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese female character Lôi Minh Xạ, Cung thủ of Lôi, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: fast-response messenger-archer. PERSONALITY: impatient and exacting.
ANATOMY AND SILHOUETTE: sharp triangular silhouette, high-tied hair, asymmetric short shoulder cloth. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: storm grey narrow sleeves, amethyst bands, quick-draw quiver. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: weathered bronze signal bell. PRIMARY WEAPON: thin recurved wooden bow; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Cung thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Lôi expressed by storm grey, muted amethyst and a few yellow zigzag accents without electric technology, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma green #00b140, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Lôi Minh Xạ as the required sole character reference. Match face, body, hair, storm grey narrow sleeves, amethyst bands, quick-draw quiver, thin recurved wooden bow, weathered bronze signal bell and Lôi accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing impatient and exacting; sharp triangular silhouette, high-tied hair, asymmetric short shoulder cloth. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Lôi Minh Xạ as the required sole character reference. Match face, body, hair, storm grey narrow sleeves, amethyst bands, quick-draw quiver, thin recurved wooden bow, weathered bronze signal bell and Lôi accent palette exactly. Only change the pose: Alert stance embodying aiming at a distant exposed enemy; bow or crossbow operation remains plausible; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Lôi Minh Xạ as the required sole character reference. Match face, body, hair, storm grey narrow sleeves, amethyst bands, quick-draw quiver, thin recurved wooden bow, weathered bronze signal bell and Lôi accent palette exactly. Only change the pose: Attack frame: aiming at a distant exposed enemy; bow or crossbow operation remains plausible; emphasize action mechanics of thin recurved wooden bow. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Lôi Minh Xạ as the required sole character reference. Match face, body, hair, storm grey narrow sleeves, amethyst bands, quick-draw quiver, thin recurved wooden bow, weathered bronze signal bell and Lôi accent palette exactly. Only change the pose: Ultimate frame: a focused long-range shot with precise alignment and hand control; keep the same thin recurved wooden bow, weathered bronze signal bell and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Lôi Minh Xạ as the required sole character reference. Match face, body, hair, storm grey narrow sleeves, amethyst bands, quick-draw quiver, thin recurved wooden bow, weathered bronze signal bell and Lôi accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact thin recurved wooden bow and weathered bronze signal bell remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 68. Tật Phong Tiễn — Cung thủ / Phong

**Xuất thân hư cấu:** swift flank skirmisher. **Điểm nhận diện:** very tall and narrow torso, one trailing long teal ribbon; light compact reflex bow; small reed-flower cord charm.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese male character Tật Phong Tiễn, Cung thủ of Phong, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: swift flank skirmisher. PERSONALITY: restless and optimistic.
ANATOMY AND SILHOUETTE: very tall and narrow torso, one trailing long teal ribbon. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: light split over-layer with high side vent, off-white leg wraps. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: small reed-flower cord charm. PRIMARY WEAPON: light compact reflex bow; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Cung thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Phong expressed by pale teal ribbon accents, mist-grey linen and airy off-white layers, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma magenta #ff00ff, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Tật Phong Tiễn as the required sole character reference. Match face, body, hair, light split over-layer with high side vent, off-white leg wraps, light compact reflex bow, small reed-flower cord charm and Phong accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing restless and optimistic; very tall and narrow torso, one trailing long teal ribbon. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Tật Phong Tiễn as the required sole character reference. Match face, body, hair, light split over-layer with high side vent, off-white leg wraps, light compact reflex bow, small reed-flower cord charm and Phong accent palette exactly. Only change the pose: Alert stance embodying aiming at a distant exposed enemy; bow or crossbow operation remains plausible; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Tật Phong Tiễn as the required sole character reference. Match face, body, hair, light split over-layer with high side vent, off-white leg wraps, light compact reflex bow, small reed-flower cord charm and Phong accent palette exactly. Only change the pose: Attack frame: aiming at a distant exposed enemy; bow or crossbow operation remains plausible; emphasize action mechanics of light compact reflex bow. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Tật Phong Tiễn as the required sole character reference. Match face, body, hair, light split over-layer with high side vent, off-white leg wraps, light compact reflex bow, small reed-flower cord charm and Phong accent palette exactly. Only change the pose: Ultimate frame: a focused long-range shot with precise alignment and hand control; keep the same light compact reflex bow, small reed-flower cord charm and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Tật Phong Tiễn as the required sole character reference. Match face, body, hair, light split over-layer with high side vent, off-white leg wraps, light compact reflex bow, small reed-flower cord charm and Phong accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact light compact reflex bow and small reed-flower cord charm remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 69. Bạch Phong Đao — Sát thủ / Kim

**Xuất thân hư cấu:** disgraced household bodyguard. **Điểm nhận diện:** upright narrow silhouette with single rigid metal armguard; straight short double-edged knife; broken family bronze seal.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese female character Bạch Phong Đao, Sát thủ of Kim, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: disgraced household bodyguard. PERSONALITY: reserved, judgmental.
ANATOMY AND SILHOUETTE: upright narrow silhouette with single rigid metal armguard. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: ivory crossed robe with one folded lapel and ash-grey sash. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: broken family bronze seal. PRIMARY WEAPON: straight short double-edged knife; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Sát thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Kim expressed by ivory linen, brushed iron, muted silver, weathered bronze; metallic accents concentrated on equipment, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma green #00b140, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Bạch Phong Đao as the required sole character reference. Match face, body, hair, ivory crossed robe with one folded lapel and ash-grey sash, straight short double-edged knife, broken family bronze seal and Kim accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing reserved, judgmental; upright narrow silhouette with single rigid metal armguard. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Bạch Phong Đao as the required sole character reference. Match face, body, hair, ivory crossed robe with one folded lapel and ash-grey sash, straight short double-edged knife, broken family bronze seal and Kim accent palette exactly. Only change the pose: Alert stance embodying entering from a blind angle, using close-range short-weapon technique; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Bạch Phong Đao as the required sole character reference. Match face, body, hair, ivory crossed robe with one folded lapel and ash-grey sash, straight short double-edged knife, broken family bronze seal and Kim accent palette exactly. Only change the pose: Attack frame: entering from a blind angle, using close-range short-weapon technique; emphasize action mechanics of straight short double-edged knife. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Bạch Phong Đao as the required sole character reference. Match face, body, hair, ivory crossed robe with one folded lapel and ash-grey sash, straight short double-edged knife, broken family bronze seal and Kim accent palette exactly. Only change the pose: Ultimate frame: a single decisive low-fantasy finishing move, no teleportation; keep the same straight short double-edged knife, broken family bronze seal and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Bạch Phong Đao as the required sole character reference. Match face, body, hair, ivory crossed robe with one folded lapel and ash-grey sash, straight short double-edged knife, broken family bronze seal and Kim accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact straight short double-edged knife and broken family bronze seal remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 70. Độc Ảnh — Sát thủ / Mộc

**Xuất thân hư cấu:** woodland ambusher and herbalist. **Điểm nhận diện:** crooked stance, low head wrap and twin outward knife lines; pair of uneven curved working knives; knotted wooden dosing spool.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese male character Độc Ảnh, Sát thủ of Mộc, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: woodland ambusher and herbalist. PERSONALITY: wary, sardonic.
ANATOMY AND SILHOUETTE: crooked stance, low head wrap and twin outward knife lines. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: moss-brown layered jacket with stitched medicine pockets. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: knotted wooden dosing spool. PRIMARY WEAPON: pair of uneven curved working knives; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Sát thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Mộc expressed by moss-green stitching, dark timber and muted leaf tones balanced by natural browns, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma magenta #ff00ff, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Độc Ảnh as the required sole character reference. Match face, body, hair, moss-brown layered jacket with stitched medicine pockets, pair of uneven curved working knives, knotted wooden dosing spool and Mộc accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing wary, sardonic; crooked stance, low head wrap and twin outward knife lines. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Độc Ảnh as the required sole character reference. Match face, body, hair, moss-brown layered jacket with stitched medicine pockets, pair of uneven curved working knives, knotted wooden dosing spool and Mộc accent palette exactly. Only change the pose: Alert stance embodying entering from a blind angle, using close-range short-weapon technique; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Độc Ảnh as the required sole character reference. Match face, body, hair, moss-brown layered jacket with stitched medicine pockets, pair of uneven curved working knives, knotted wooden dosing spool and Mộc accent palette exactly. Only change the pose: Attack frame: entering from a blind angle, using close-range short-weapon technique; emphasize action mechanics of pair of uneven curved working knives. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Độc Ảnh as the required sole character reference. Match face, body, hair, moss-brown layered jacket with stitched medicine pockets, pair of uneven curved working knives, knotted wooden dosing spool and Mộc accent palette exactly. Only change the pose: Ultimate frame: a single decisive low-fantasy finishing move, no teleportation; keep the same pair of uneven curved working knives, knotted wooden dosing spool and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Độc Ảnh as the required sole character reference. Match face, body, hair, moss-brown layered jacket with stitched medicine pockets, pair of uneven curved working knives, knotted wooden dosing spool and Mộc accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact pair of uneven curved working knives and knotted wooden dosing spool remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 71. Hàn Giang Khách — Sát thủ / Thủy

**Xuất thân hư cấu:** river landing infiltrator. **Điểm nhận diện:** wide crouching legs beneath an indigo short mantle; slender long dagger with plain bronze pommel; single river-shell tether.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese female character Hàn Giang Khách, Sát thủ of Thủy, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: river landing infiltrator. PERSONALITY: watchful, unreadable.
ANATOMY AND SILHOUETTE: wide crouching legs beneath an indigo short mantle. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: roped sash, dark wet-cloth texture, wrapped hair. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: single river-shell tether. PRIMARY WEAPON: slender long dagger with plain bronze pommel; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Sát thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Thủy expressed by river indigo, blue-grey, washed linen and restrained cool-blue highlights, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma green #00b140, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Hàn Giang Khách as the required sole character reference. Match face, body, hair, roped sash, dark wet-cloth texture, wrapped hair, slender long dagger with plain bronze pommel, single river-shell tether and Thủy accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing watchful, unreadable; wide crouching legs beneath an indigo short mantle. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Hàn Giang Khách as the required sole character reference. Match face, body, hair, roped sash, dark wet-cloth texture, wrapped hair, slender long dagger with plain bronze pommel, single river-shell tether and Thủy accent palette exactly. Only change the pose: Alert stance embodying entering from a blind angle, using close-range short-weapon technique; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Hàn Giang Khách as the required sole character reference. Match face, body, hair, roped sash, dark wet-cloth texture, wrapped hair, slender long dagger with plain bronze pommel, single river-shell tether and Thủy accent palette exactly. Only change the pose: Attack frame: entering from a blind angle, using close-range short-weapon technique; emphasize action mechanics of slender long dagger with plain bronze pommel. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Hàn Giang Khách as the required sole character reference. Match face, body, hair, roped sash, dark wet-cloth texture, wrapped hair, slender long dagger with plain bronze pommel, single river-shell tether and Thủy accent palette exactly. Only change the pose: Ultimate frame: a single decisive low-fantasy finishing move, no teleportation; keep the same slender long dagger with plain bronze pommel, single river-shell tether and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Hàn Giang Khách as the required sole character reference. Match face, body, hair, roped sash, dark wet-cloth texture, wrapped hair, slender long dagger with plain bronze pommel, single river-shell tether and Thủy accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact slender long dagger with plain bronze pommel and single river-shell tether remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 72. Xích Dạ — Sát thủ / Hỏa

**Xuất thân hư cấu:** aggressive night raider. **Điểm nhận diện:** compact forward-driving wedge shape with one high shoulder; heavy inward-curved short dao; charred campaign ribbon.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese male character Xích Dạ, Sát thủ of Hỏa, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: aggressive night raider. PERSONALITY: reckless but purposeful.
ANATOMY AND SILHOUETTE: compact forward-driving wedge shape with one high shoulder. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: burnt brick short jacket, scarlet waist cord and dark forearm wraps. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: charred campaign ribbon. PRIMARY WEAPON: heavy inward-curved short dao; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Sát thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Hỏa expressed by vermilion binding, charcoal, earthen red and small ember-orange accents, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma green #00b140, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Xích Dạ as the required sole character reference. Match face, body, hair, burnt brick short jacket, scarlet waist cord and dark forearm wraps, heavy inward-curved short dao, charred campaign ribbon and Hỏa accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing reckless but purposeful; compact forward-driving wedge shape with one high shoulder. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Xích Dạ as the required sole character reference. Match face, body, hair, burnt brick short jacket, scarlet waist cord and dark forearm wraps, heavy inward-curved short dao, charred campaign ribbon and Hỏa accent palette exactly. Only change the pose: Alert stance embodying entering from a blind angle, using close-range short-weapon technique; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Xích Dạ as the required sole character reference. Match face, body, hair, burnt brick short jacket, scarlet waist cord and dark forearm wraps, heavy inward-curved short dao, charred campaign ribbon and Hỏa accent palette exactly. Only change the pose: Attack frame: entering from a blind angle, using close-range short-weapon technique; emphasize action mechanics of heavy inward-curved short dao. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Xích Dạ as the required sole character reference. Match face, body, hair, burnt brick short jacket, scarlet waist cord and dark forearm wraps, heavy inward-curved short dao, charred campaign ribbon and Hỏa accent palette exactly. Only change the pose: Ultimate frame: a single decisive low-fantasy finishing move, no teleportation; keep the same heavy inward-curved short dao, charred campaign ribbon and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Xích Dạ as the required sole character reference. Match face, body, hair, burnt brick short jacket, scarlet waist cord and dark forearm wraps, heavy inward-curved short dao, charred campaign ribbon and Hỏa accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact heavy inward-curved short dao and charred campaign ribbon remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 73. Địa Ẩn — Sát thủ / Thổ

**Xuất thân hư cấu:** patient earthwork infiltrator. **Điểm nhận diện:** low broad silhouette, thick waist profile, heavy short axe at hip; short working hand-axe modified for ambush; triangular clay tally.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese female character Địa Ẩn, Sát thủ of Thổ, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: patient earthwork infiltrator. PERSONALITY: unyielding, dry humor.
ANATOMY AND SILHOUETTE: low broad silhouette, thick waist profile, heavy short axe at hip. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: mud-ochre double-wrapped overcoat, leathery palm guard. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: triangular clay tally. PRIMARY WEAPON: short working hand-axe modified for ambush; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Sát thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Thổ expressed by ochre, clay, sand, umber, aged bronze, heavy material transitions, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma green #00b140, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Địa Ẩn as the required sole character reference. Match face, body, hair, mud-ochre double-wrapped overcoat, leathery palm guard, short working hand-axe modified for ambush, triangular clay tally and Thổ accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing unyielding, dry humor; low broad silhouette, thick waist profile, heavy short axe at hip. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Địa Ẩn as the required sole character reference. Match face, body, hair, mud-ochre double-wrapped overcoat, leathery palm guard, short working hand-axe modified for ambush, triangular clay tally and Thổ accent palette exactly. Only change the pose: Alert stance embodying entering from a blind angle, using close-range short-weapon technique; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Địa Ẩn as the required sole character reference. Match face, body, hair, mud-ochre double-wrapped overcoat, leathery palm guard, short working hand-axe modified for ambush, triangular clay tally and Thổ accent palette exactly. Only change the pose: Attack frame: entering from a blind angle, using close-range short-weapon technique; emphasize action mechanics of short working hand-axe modified for ambush. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Địa Ẩn as the required sole character reference. Match face, body, hair, mud-ochre double-wrapped overcoat, leathery palm guard, short working hand-axe modified for ambush, triangular clay tally and Thổ accent palette exactly. Only change the pose: Ultimate frame: a single decisive low-fantasy finishing move, no teleportation; keep the same short working hand-axe modified for ambush, triangular clay tally and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Địa Ẩn as the required sole character reference. Match face, body, hair, mud-ochre double-wrapped overcoat, leathery palm guard, short working hand-axe modified for ambush, triangular clay tally and Thổ accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact short working hand-axe modified for ambush and triangular clay tally remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 74. Lôi Ảnh — Sát thủ / Lôi

**Xuất thân hư cấu:** lightning-fast close-quarter raider. **Điểm nhận diện:** angular shoulders with twin crossed blade lines; paired narrow short blades; cracked bronze thunder badge.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese male character Lôi Ảnh, Sát thủ of Lôi, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: lightning-fast close-quarter raider. PERSONALITY: volatile, precise.
ANATOMY AND SILHOUETTE: angular shoulders with twin crossed blade lines. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: slate-violet narrow tunic, short asymmetric hip tabs. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: cracked bronze thunder badge. PRIMARY WEAPON: paired narrow short blades; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Sát thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Lôi expressed by storm grey, muted amethyst and a few yellow zigzag accents without electric technology, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma green #00b140, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Lôi Ảnh as the required sole character reference. Match face, body, hair, slate-violet narrow tunic, short asymmetric hip tabs, paired narrow short blades, cracked bronze thunder badge and Lôi accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing volatile, precise; angular shoulders with twin crossed blade lines. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Lôi Ảnh as the required sole character reference. Match face, body, hair, slate-violet narrow tunic, short asymmetric hip tabs, paired narrow short blades, cracked bronze thunder badge and Lôi accent palette exactly. Only change the pose: Alert stance embodying entering from a blind angle, using close-range short-weapon technique; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Lôi Ảnh as the required sole character reference. Match face, body, hair, slate-violet narrow tunic, short asymmetric hip tabs, paired narrow short blades, cracked bronze thunder badge and Lôi accent palette exactly. Only change the pose: Attack frame: entering from a blind angle, using close-range short-weapon technique; emphasize action mechanics of paired narrow short blades. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Lôi Ảnh as the required sole character reference. Match face, body, hair, slate-violet narrow tunic, short asymmetric hip tabs, paired narrow short blades, cracked bronze thunder badge and Lôi accent palette exactly. Only change the pose: Ultimate frame: a single decisive low-fantasy finishing move, no teleportation; keep the same paired narrow short blades, cracked bronze thunder badge and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Lôi Ảnh as the required sole character reference. Match face, body, hair, slate-violet narrow tunic, short asymmetric hip tabs, paired narrow short blades, cracked bronze thunder badge and Lôi accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact paired narrow short blades and cracked bronze thunder badge remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

---

### 75. Vô Ảnh — Sát thủ / Phong

**Xuất thân hư cấu:** rapid flanking messenger. **Điểm nhận diện:** open elongated outline with split front cloth and fluttering side ribbon; long thin knife with wrapped pommel; reed-thread messenger ring.

#### Prompt tạo hình chính

```text
Create ONE entirely individual Vietnamese female character Vô Ảnh, Sát thủ of Phong, an ORIGINAL fictional character from the tenth-century Ngo–Dinh / Twelve Warlords setting. Historical low fantasy, not a reconstruction claim.
IDENTITY: rapid flanking messenger. PERSONALITY: cool, daring.
ANATOMY AND SILHOUETTE: open elongated outline with split front cloth and fluttering side ribbon. Design the head and expressive adult facial features consistent with this temperament and occupation, distinctly different from other members of the class. No generic archetype costume.
COSTUME: pale teal layered tunic, grey-white trousers, minimal guard. Functional cross-collar or local practical textile layers, stitched and repaired by hand, simple iron or bronze hardware, rattan and bamboo where functional. Exact personal accessory: reed-thread messenger ring. PRIMARY WEAPON: long thin knife with wrapped pommel; preserve proportions and mechanism exactly across shots.
CLASS READABILITY: Sát thủ visible from equipment, grip, locomotion and attack behavior, NOT uniform. ELEMENT READABILITY: Phong expressed by pale teal ribbon accents, mist-grey linen and airy off-white layers, concentrated on binding, trims and engraved motif, never head-to-toe recolor. Keep realistic weapon surfaces; spell and elemental effects are drawn by the game engine.
STYLE: semi-realistic anime-influenced 2D historical character art, dark-brown ink outline, restrained cel shadow, mature anatomy, limited decorative Dong Son-inspired geometric details. Full body three-quarter facing right, limbs separated for 2D rig, full head and feet, weapon unobscured. Solid chroma magenta #ff00ff, no shadow or scenery. NO text, glow, particles, late imperial court robes, ninja outfit, katana, European fantasy armor, medieval gunpowder technology.
```

#### Đứng đặc trưng

```text
Use the approved image of Vô Ảnh as the required sole character reference. Match face, body, hair, pale teal layered tunic, grey-white trousers, minimal guard, long thin knife with wrapped pommel, reed-thread messenger ring and Phong accent palette exactly. Only change the pose: Distinct idle with a believable weight distribution expressing cool, daring; open elongated outline with split front cloth and fluttering side ribbon. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Đứng cảnh giới

```text
Use the approved image of Vô Ảnh as the required sole character reference. Match face, body, hair, pale teal layered tunic, grey-white trousers, minimal guard, long thin knife with wrapped pommel, reed-thread messenger ring and Phong accent palette exactly. Only change the pose: Alert stance embodying entering from a blind angle, using close-range short-weapon technique; distinct silhouette and weapon held clearly outside the torso. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Ra chiêu

```text
Use the approved image of Vô Ảnh as the required sole character reference. Match face, body, hair, pale teal layered tunic, grey-white trousers, minimal guard, long thin knife with wrapped pommel, reed-thread messenger ring and Phong accent palette exactly. Only change the pose: Attack frame: entering from a blind angle, using close-range short-weapon technique; emphasize action mechanics of long thin knife with wrapped pommel. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Tuyệt chiêu

```text
Use the approved image of Vô Ảnh as the required sole character reference. Match face, body, hair, pale teal layered tunic, grey-white trousers, minimal guard, long thin knife with wrapped pommel, reed-thread messenger ring and Phong accent palette exactly. Only change the pose: Ultimate frame: a single decisive low-fantasy finishing move, no teleportation; keep the same long thin knife with wrapped pommel, reed-thread messenger ring and costumes, no particle effects. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

#### Bị hạ gục

```text
Use the approved image of Vô Ảnh as the required sole character reference. Match face, body, hair, pale teal layered tunic, grey-white trousers, minimal guard, long thin knife with wrapped pommel, reed-thread messenger ring and Phong accent palette exactly. Only change the pose: Defeat frame: controlled non-graphic collapse; the exact long thin knife with wrapped pommel and reed-thread messenger ring remain visible; no bleeding. Full figure three-quarter facing right, isolated on clean chroma ground, no text, lighting effects or extra weapons.
```

## TODO cần phê duyệt

- [ ] Audit ảnh đã sản xuất của 61 tướng; khóa version asset/reference.
- [ ] Kiểm tra mọi đề xuất 'Distinctive construction cue' có xung đột với ảnh duyệt không; nếu có, giữ ảnh cũ.
- [ ] Kiểm chứng chi tiết lịch sử của mũ, giáp, cơ cấu nỏ, đao trước khi xuất asset cuối.
- [ ] Đối chiếu từng pose tuyệt chiêu với ID kỹ năng hiện hành trong code và cập nhật nếu đổi sau ngày tài liệu.
- [ ] Kiểm thử 14 hero mới về skill, role, element, equip, UI, battle và Song Tháp; chưa coi các chỉ số là đã được duyệt.
- [ ] Duyệt bảng uniqueness 75 nhân vật theo silhouette, vũ khí và signature token.
