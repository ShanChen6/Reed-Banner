# Prompt lá cờ 12 sứ quân

> Cập nhật: 07/11/2026
> Trạng thái: **IMPLEMENTED** — Shan tạo 12 ký hiệu từ prompt dưới đây (07/11/2026), Claude xuất WebP 256×256 vào `public/art/flags/co-<id>.webp` (6–16 KB mỗi tệp) và gắn vào `WorldMap.tsx` (`MarkArt`). Hoa Lư giữ nét vẽ mã ([`factionMarks.ts`](../../../src/app/game/campaign/factionMarks.ts), cũng là dự phòng khi ảnh lỗi). Hai ký hiệu **cầu vòm (Ngô Xương Xí) và cổng làng (Ngô Nhật Khánh) đang là bản đầu quá nhiều chi tiết / kiểu pailou**, nên tạo lại theo prompt đã sửa ở mục 3.3 và 3.4 rồi thay tệp cùng tên.

Mỗi sứ quân có một lá cờ trên bản đồ Bình Loạn (`WorldMap.tsx`, `FactionFlag`). **Sử không chép cờ của 12 sứ quân** ([Narrative Bible](../../02-game-modes/campaign/narrative-bible.md)), nên đây là **ký hiệu game tự đặt** lấy ý từ tên đất và tạo hình nhân vật, không phải huy hiệu lịch sử. Tranh không được kèm chữ, chữ Hán hay chú thích nào khiến người xem tưởng đó là cờ thật.

Prompt viết bằng tiếng Anh (công cụ tạo ảnh), giải thích bằng tiếng Việt. Khối phong cách lấy đúng khối nhân vật (khối phong cách chung của [bộ prompt V4.2](v4-2/00-bao-cao.md)) để cờ cùng nét với tướng.

## 1. Chọn cách làm: tạo hình ký hiệu, không tạo cả lá cờ

Màu nền lá cờ trên bản đồ là **trạng thái thế cục** của người chơi (đỏ đầu não, xanh liên minh, nâu chưa kết cục…, `STATE_COLOR`), đổi theo tiến độ. Nếu vẽ sẵn cả lá cờ có màu thì mất thông tin này. Vì vậy:

| Phần | Tạo bằng | Ghi chú |
|---|---|---|
| **Ký hiệu giữa cờ** (12 hình, mục 3) | Tranh, nền trong suốt | Đặt lên vải cờ do code vẽ; thay hình `MarkGlyph` hiện tại. Cần đọc rõ trên mọi màu thế cục |
| Dáng cờ (đuôi én, vuông, nhọn đáy) | Giữ bằng code | Dáng đã gắn cố định theo từng sứ quân (cột "Dáng cờ") |
| Lá cờ đủ màu cho hồ sơ sứ quân (tuỳ chọn, mục 4) | Tranh | Chỉ để trang trí thẻ hồ sơ, không dùng trên bản đồ |

## 2. Thông số chung của ký hiệu

| Mục | Giá trị |
|---|---|
| Tệp | `co-<id>.png` (PNG gốc, **nền trong suốt thật**), `<id>` theo cột "Id". Khi gửi lại, Claude xuất WebP có alpha vào `public/art/flags/co-<id>.webp` (256×256, dưới 20 KB mỗi tệp) |
| Khổ | **Vuông 1:1**, tốt nhất 1024×1024; hình nằm giữa, chừa lề trong suốt khoảng 12% mỗi cạnh |
| Đọc được ở cỡ nhỏ | Trên bản đồ ký hiệu chỉ cao khoảng 24–40px: **một hình lớn, nét dày, tối đa 3 chi tiết**, không hoa văn nhỏ. Kiểm bằng cách thu ảnh còn 32px vẫn nhận ra hình |
| Màu | Vàng đồng `#d4a24c` làm chính, viền mực nâu `#2b1d14` dày; **một điểm nhấn nhỏ** theo màu hệ của sứ quân (bảng ở mục 3). Không dùng đỏ son hay xanh lục làm màu chủ đạo vì sẽ chìm vào màu vải thế cục |
| Cấm trong ảnh | Chữ, chữ Hán, số, logo, chữ ký, watermark, vải cờ, cán cờ, nền, bóng đổ xuống nền, người, mặt người, chữ viết giả |
| Văn hóa | Việt thế kỷ X; mô-típ Đông Sơn (răng cưa, vòng tròn đồng tâm) dùng tiết chế và không coi là phục dựng chính xác |

**Negative prompt dùng chung (nếu công cụ hỗ trợ):** `text, letters, Chinese characters, numbers, logo, watermark, signature, flag cloth, flagpole, background, scene, people, face, hands, European heraldry, shield, crown, modern, photorealistic, 3d render, gradient glow, oversaturated, pure black, blurry, tiny details, thin lines`

**Khối phong cách chung (dán vào đầu mọi prompt):**

```text
Style: Vietnamese folk woodblock print emblem, 2D game icon, bold flat shapes with heavy dark-brown ink outline (#2b1d14), main fill aged bronze gold (#d4a24c) with one tiny accent colour, at most one shadow tone, subtle paper grain, Dong Son bronze-drum motifs (sawtooth band, concentric circles) used very sparingly. 10th-century Vietnam. Single centred emblem, front view, symmetrical or near-symmetrical, large simple readable silhouette, transparent background, no text, no letters, no Chinese characters, no flag, no frame.
```

## 3. Mười hai ký hiệu

Hình lấy đúng ý đã đặt trong `factionMarks.ts` (cột "Ý hình") để ký hiệu tranh và nét vẽ hiện tại cùng nghĩa; thứ tự theo sổ nguồn W01–W12.

| Id | Sứ quân (đất) | Hệ → điểm nhấn | Dáng cờ | Ý hình |
|---|---|---|---|---|
| `tranLam` | Trần Lãm (Bố Hải Khẩu) | Thủy → xanh dương `#2f7fc1` | đuôi én | sóng cửa biển |
| `phamBachHo` | Phạm Bạch Hổ (Đằng Châu) | Hỏa → cam `#d9502a` | vuông | ba vạch vuốt |
| `ngoXuongXi` | Ngô Xương Xí (Bình Kiều) | Kim → xám bạc `#9ea4ad` | nhọn đáy | cầu vòm |
| `ngoNhatKhanh` | Ngô Nhật Khánh (Đường Lâm) | Phong → xanh lơ `#2e9e90` | vuông | cổng làng |
| `nguyenKhoan` | Nguyễn Khoan (Tam Đái) | Thổ → nâu đất `#a5772f` | đuôi én | ba dải |
| `kieuCongHan` | Kiều Công Hãn (Phong Châu) | Lôi → tím `#7d55c7` | nhọn đáy | đỉnh núi |
| `kieuThuan` | Kiều Thuận (Hồi Hồ) | Mộc → xanh lá `#4f9a4a` | vuông | cánh sen |
| `lyKhue` | Lý Khuê (Siêu Loại) | Kim → xám bạc `#9ea4ad` | đuôi én | giáp vảy |
| `nguyenThuTiep` | Nguyễn Thủ Tiệp (Tiên Du) | Thủy → xanh dương `#2f7fc1` | nhọn đáy | sao bốn cánh |
| `luDuong` | Lữ Đường (Tế Giang) | Thủy → xanh dương `#2f7fc1` | vuông | dòng sông |
| `nguyenSieu` | Nguyễn Siêu (Tây Phù Liệt) | Hỏa → cam `#d9502a` | đuôi én | lũy có răng cưa |
| `doCanhThac` | Đỗ Cảnh Thạc (Đỗ Động Giang) | Thổ → nâu đất `#a5772f` | nhọn đáy | mũi giáo |

Mỗi khối dưới đây là **phần nội dung**; dán sau khối phong cách chung ở mục 2.

### 3.1 Trần Lãm — sóng cửa biển

```text
Subject: emblem of three stacked rolling sea waves with curled crests, drawn as bold bronze-gold bands with ink outline, the lowest wave slightly wider like a river mouth opening to the sea. Tiny accent: the topmost crest tip in blue (#2f7fc1). Calm, welcoming, old-sea-lord feeling.
```

### 3.2 Phạm Bạch Hổ — ba vạch vuốt

```text
Subject: emblem of three diagonal claw slashes, thick tapered strokes that curve slightly like a tiger's swipe, bronze gold with ink outline, a faint white fur-stripe notch cut into each slash. Tiny accent: a single ember-orange (#d9502a) dot at the top of the middle slash. Fierce, proud, white-tiger feeling, no animal drawn.
```

### 3.3 Ngô Xương Xí — cầu vòm

Bản đầu ra quá nhiều chi tiết (năm trụ, lan can, từng viên đá, sóng nước) nên ở cỡ 24–32px thành một cục mờ; prompt dưới đây đã rút gọn (Shan thử 07/11/2026).

```text
Subject: emblem of a single high round stone arch bridge in side view, ONE thick semicircular arch with a flat deck line on top and two short square posts at the two ends only. No railing bars, no individual stone blocks, no water waves, no extra posts. Bold simple shapes, thick outline, at most three details in total, readable at 32 pixels. Tiny accent: one thick silver-grey (#9ea4ad) stripe along the top of the arch. Young, proud, noble-house feeling. Square 1:1 composition with the bridge centred.
```

### 3.4 Ngô Nhật Khánh — cổng làng

Bản đầu có mái cong vút bốn góc và hàng ngói, nhìn giống cổng pailou kiểu Trung Hoa; prompt dưới đây đổi sang cổng làng Việt mộc mạc (Shan thử 07/11/2026).

```text
Subject: emblem of an old Vietnamese village gate (cong lang), two thick square brick posts joined by a flat lintel, a small plain two-slope tiled roof on top with a STRAIGHT ridge, roof ends only slightly lifted, no upturned dragon corners, no ridge ornaments, no individual roof tile lines, no Chinese pailou or palace look. A wide open passage between the posts. Bronze gold with ink outline, bold simple shapes. Tiny accent: one teal (#2e9e90) wind swirl curling through the opening. Calm, calculating, ancient-gate feeling.
```

### 3.5 Nguyễn Khoan — ba dải

```text
Subject: emblem of three thick horizontal bands stacked like layers of rammed earth, the bands slightly uneven with small notches at the ends, bronze gold with ink outline, heavy and stable proportions. Tiny accent: the lowest band with an earth-ochre (#a5772f) inner stripe. Solid, immovable, fortress feeling.
```

### 3.6 Kiều Công Hãn — đỉnh núi

```text
Subject: emblem of a single sharp mountain peak with a smaller shoulder peak beside it, faceted planes drawn as bold bronze-gold shapes with ink outline, a thin zig-zag lightning notch splitting the main peak. Tiny accent: the lightning notch in violet (#7d55c7). Brooding, ancestral-land feeling.
```

### 3.7 Kiều Thuận — cánh sen

```text
Subject: emblem of a lotus flower seen from the front with five bold pointed petals around a small round seed head, two broad lotus leaves and one reed stalk at its base, bronze gold with ink outline. Tiny accent: the lotus leaves in green (#4f9a4a). Quiet, healing, marsh-lake feeling (Hoi Ho lake).
```

### 3.8 Lý Khuê — giáp vảy

```text
Subject: emblem of three overlapping rows of rounded armour scales (lamellar plates) stacked like a breastplate, each row a bold scalloped bronze-gold band with ink outline and a bright silver edge highlight on every scale. Tiny accent: silver-grey (#9ea4ad) edge lines. Radiant, polished, silver-gold-armour feeling, no human figure.
```

### 3.9 Nguyễn Thủ Tiệp — sao bốn cánh

```text
Subject: emblem of a four-pointed star with long vertical and short horizontal points, bold bronze gold with ink outline, a small round coin-like hole at its centre ringed by one thin water-ripple circle. Tiny accent: the centre ring in blue (#2f7fc1). Wealthy, scheming, merchant-lord feeling.
```

### 3.10 Lữ Đường — dòng sông

```text
Subject: emblem of a single winding river drawn as one thick S-shaped bronze-gold ribbon with ink outline, two short crossed oars laid across its bend. Tiny accent: a thin blue (#2f7fc1) centre line inside the ribbon. Flowing, river-warrior feeling.
```

### 3.11 Nguyễn Siêu — lũy có răng cưa

```text
Subject: emblem of a palisade rampart seen from the front: a wide wall topped with a bold sawtooth row of pointed stakes (Dong Son sawtooth band), a small round gate arch at the base, bronze gold with ink outline. Tiny accent: one small orange-red (#d9502a) flame tip on the central stake. Hot-tempered, stubborn feeling.
```

### 3.12 Đỗ Cảnh Thạc — mũi giáo

```text
Subject: emblem of a single upright spearhead, long leaf-shaped blade with a central ridge and a short socket below, one small notch scar cut into the left edge of the blade, bronze gold with ink outline. Tiny accent: the scar notch in earth-ochre (#a5772f). Veteran, scarred, last-stand feeling.
```

## 4. Lá cờ đủ màu cho hồ sơ sứ quân (tuỳ chọn)

Chỉ để trang trí thẻ hồ sơ sứ quân ở tab Sử ký, khi muốn một tranh lá cờ thật. Làm sau khi đã chốt 12 ký hiệu; dùng lại hình ký hiệu làm **ảnh tham chiếu** để giữ đúng hình. Khổ **dọc 3:4**, nền trong suốt, một lá cờ treo thẳng trên cán tre, chừa lề 8%.

```text
Style: Vietnamese folk woodblock print look, hand-painted 2D game illustration, heavy dark-brown ink outline (#2b1d14), flat colours, subtle paper grain, aged cloth with soft fold shading, no text.
Subject: a single hanging flag of a 10th-century Vietnamese regional lord, vertical 3:4 composition, cloth shape [SWALLOWTAIL with a V notch at the bottom | SQUARE with a straight bottom | POINTED with a V-shaped bottom point], hung from a slim bamboo pole with a small bronze finial, cloth in muted [ELEMENT COLOUR] with a thin bronze-gold border, the supplied emblem centred on the cloth. Gentle wind folds, transparent background, no shadow on the ground, no text, no Chinese characters, no people.
```

Điền `[ELEMENT COLOR]` theo cột "Hệ" ở mục 3 (nhạt hơn một bậc để không chói), `[dáng cờ]` theo cột "Dáng cờ".

## 5. Sau khi có ảnh

Đã làm cho 12 ký hiệu (07/11/2026). Còn lại khi thay ảnh mới:

1. Xuất WebP có alpha, 256×256, hình canh giữa, chừa lề 4% mỗi cạnh; thả đè lên `public/art/flags/co-<id>.webp`, kiểm nhẹ (dưới 20 KB mỗi tệp). Ảnh không vuông vẫn được, đặt vừa khung 256 theo cạnh dài.
2. `MarkArt` (`WorldMap.tsx`) vẽ ảnh 36×36 đơn vị giữa lá cờ, giữ nguyên dáng cờ và màu vải thế cục; ảnh tải lỗi thì quay về nét vẽ mã `MarkGlyph`. Danh sách sứ quân có tranh ở `FLAG_ART` (`factionMarks.ts`), test kiểm tệp tồn tại.
3. Chụp bản đồ ở 1440px và 360px, kiểm ký hiệu đọc được trên cả sáu màu thế cục (đầu não, chưa kết cục, liên minh, quy phục, đánh dẹp, tan rã). Chữ nội dung vẫn là chữ code, không đặt chữ vào tranh.
