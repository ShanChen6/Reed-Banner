# Prompt hình ảnh cho Trận Đồ

> Cập nhật: 02/11/2026
> Trạng thái: **DRAFT** — bộ prompt để Shan tạo ảnh; ô che và 4 icon chướng ngại v1 đã có (02/11/2026), ảnh 30 bản đồ vẫn là ảnh giữ chỗ. Chưa duyệt Master phong cách.

Nguồn chính của giao diện Trận Đồ là [giao diện Trận Đồ](../../05-ui-ux/screens/tran-do.md); tài liệu này chỉ chứa **prompt đầy đủ để dán thẳng vào công cụ tạo ảnh**, kèm tên tệp và thông số. Kho bản đồ **không giới hạn số ảnh**: thêm một ảnh mới theo mục 1.4. Mọi prompt viết tiếng Anh (công cụ tạo ảnh), giải thích tiếng Việt.

## 0. Phong cách và thông số chung

**Phong cách (cập nhật 02/11/2026).** Bản đầu của bộ prompt yêu cầu "bản đồ thủy mặc trên giấy dó nhìn từ trên xuống"; ảnh tạo ra từ đó đọc như một tấm bản đồ phương Đông chung chung, chi tiết nhỏ, không đồng bộ với nền Bình Loạn. Bản này đổi sang **tranh vẽ tay 2D điện ảnh** theo đúng khối phong cách đã cho ra các nền chiến dịch (`public/art/campaign/bg/`, prompt gốc ở [prompt ảnh chiến dịch](../../05-ui-ux/campaign/05-asset-prompts.md) mục 2), chỉ bỏ các điều kiện của hộp thoại (vùng dưới, vùng chân dung) và thêm điều kiện của **nền sa bàn**: bố cục vuông, góc nhìn hơi cao, chi tiết rải đều toàn khung, mảng hình lớn dễ đọc, tông trung bình để chân dung quân đọc rõ.

| Mục | Giá trị |
|---|---|
| Bản đồ | **Ưu tiên vuông 1:1, 2048×2048**, WebP (chất lượng 85, dưới 1,5 MB), lưu ở `public/art/formation/maps/<id>.webp`. Nếu công cụ chỉ ra 16:9 (như nền Bình Loạn) vẫn dùng được: sa bàn cắt theo tỉ lệ bàn (`cover`), nên phần giữa ảnh là phần được thấy ở bàn vuông, giữ chi tiết ở giữa |
| Ô che | Ô vuông **lát được liền mạch** 256×256, `public/art/formation/fog.webp` (hoặc `.svg`) |
| Icon chướng ngại | **256×256**, nền **trong suốt thật** (alpha), `public/art/formation/obstacles/<nui\|rung\|damLay\|thanhLuy>.webp` |
| Cấm trong mọi ảnh | Chữ, số, lưới ô, khung UI, người và nhân vật (tránh trùng chân dung quân), vũ khí, watermark |
| Tinh thần | Khớp nền Bình Loạn và [art bible](../art-bible.md): tre, gỗ mái tranh, núi đá vôi, họa tiết Đông Sơn dùng tiết chế, ấm đồng cổ và giấy dó với điểm son nhẹ |
| Sau khi có ảnh | Đổi `src` trong `src/app/game/formation/maps.ts` (xem mục 1.4) và chạy `pnpm test` (test kiểm tệp ảnh tồn tại) |

**Negative prompt dùng chung (nếu công cụ hỗ trợ):** `people, characters, faces, weapons, text, letters, numbers, labels, grid lines, UI, border, frame, modern buildings, European castle, Chinese imperial palace, photorealistic, 3d render, watermark, signature, blurry, oversaturated, pure black shadows, blown-out highlights, vignette`

**Mẹo:** ô chỉ cỡ khoảng 1/10 ảnh, nên cần địa vật lớn để nhận ra khi mới lộ vài ô (một khúc sông, một mái nhà, một đoạn tường thành, một vách núi). Tránh ảnh nửa trên là trời và nửa dưới là mặt nước trống: ô lộ ra sẽ nhàm. Nếu ảnh có chân trời, đặt chân trời cao (khoảng 1/4 từ trên) và để phần lớn khung là mặt đất, nước và công trình.

## 1. Bản đồ

### 1.1 Cách ghép prompt

Mỗi prompt dưới đây là bản **đầy đủ, dán được ngay**: khối phong cách chung, rồi `Scene:` (mô tả địa điểm), rồi khối bố cục nền sa bàn. Nếu cần chỉnh phong cách toàn bộ, sửa hai khối chung ở mọi prompt cho thống nhất. Một số prompt nền Bình Loạn có thể dùng làm điểm khởi đầu cho địa điểm tương ứng: BG-01 Hoa Lư cho `hoaLu`, BG-02 Bố Hải Khẩu cho `tranLam`, BG-04 thành lũy cho `thanhDatCoHao`, BG-06 đầm nước Hồi Hồ cho `kieuThuan` và `luDuong`.

### 1.2 Địa danh thời Loạn 12 sứ quân (13 ảnh đầu)

Lấy từ danh mục sứ quân của Campaign V2 (`WARLORD_ENCOUNTERS`) cộng Hoa Lư. Nội dung là **tranh minh họa tái dựng**, không phải bản đồ lịch sử chính xác; vị trí Bình Kiều còn tranh luận ([sổ nguồn sử](../../02-game-modes/campaign/history-sources.md)) nên giữ cảnh quan chung.

#### `hoaLu` — Hoa Lư (Ninh Bình)

Tệp: `public/art/formation/maps/hoaLu.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: limestone karst mountains ringing a valley, a small walled citadel with gate towers, narrow river gaps between the cliffs, rice fields inside the valley. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `tranLam` — Bố Hải Khẩu (Kỳ Bố, Thái Bình)

Tệp: `public/art/formation/maps/tranLam.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a river mouth near the sea, tidal flats and salt fields, fishing boats, a fortified landing and a village on raised ground. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `phamBachHo` — Đằng Châu (Kim Động, Hưng Yên)

Tệp: `public/art/formation/maps/phamBachHo.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: the Red River delta plain with long dikes, a river port with moored boats, a walled town, orchards and canals. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `ngoXuongXi` — Bình Kiều (Triệu Sơn, Thanh Hóa)

Tệp: `public/art/formation/maps/ngoXuongXi.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a rural plain with a long arched bridge over a stream, scattered villages, low hills; keep geography generic because the exact location is disputed. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `ngoNhatKhanh` — Đường Lâm (Sơn Tây, Hà Nội)

Tệp: `public/art/formation/maps/ngoNhatKhanh.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: an ancient village of laterite-stone houses and banyan trees, a village gate and well, fields and a small hill. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `nguyenKhoan` — Tam Đái (Vĩnh Tường, Vĩnh Phúc)

Tệp: `public/art/formation/maps/nguyenKhoan.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a broad place where three rivers meet, wide water with sandbars, a hilltop stronghold and riverside hamlets. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `kieuCongHan` — Phong Châu (Bạch Hạc, Phú Thọ)

Tệp: `public/art/formation/maps/kieuCongHan.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: upland hills and terraced rice fields, a river valley with a fortified hill, a river confluence in the distance. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `kieuThuan` — Hồi Hồ (Cẩm Khê, Phú Thọ)

Tệp: `public/art/formation/maps/kieuThuan.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a lake edge with reed beds and a stilted bridge, a fortified hillside village, small boats. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `lyKhue` — Siêu Loại (Thuận Thành, Bắc Ninh)

Tệp: `public/art/formation/maps/lyKhue.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a plain crossed by canals and low hills, a moated stronghold, brick-and-tile village houses, orchards. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `nguyenThuTiep` — Tiên Du (Tiên Du, Bắc Ninh)

Tệp: `public/art/formation/maps/nguyenThuTiep.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a mountain with pine forests and small temples overlooking fields, a stream winding through the foot of the hill. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `luDuong` — Tế Giang (Văn Giang, Hưng Yên)

Tệp: `public/art/formation/maps/luDuong.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a misty marsh with reeds and a long wooden causeway, scattered islets with huts, a river bend. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `nguyenSieu` — Tây Phù Liệt (Thanh Trì, Hà Nội)

Tệp: `public/art/formation/maps/nguyenSieu.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a village between ponds and fields with a low earthen wall, a river nearby, stilted fishing huts. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `doCanhThac` — Đỗ Động Giang (Thanh Oai, Hà Nội)

Tệp: `public/art/formation/maps/doCanhThac.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a river bend with embankments, villages on raised ground, orchards, a ferry crossing. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

### 1.3 Địa danh và cảnh quan bổ sung

**Địa danh thật** (gắn với giai đoạn Ngô – Đinh, chú thích nguồn trong giao diện là "tranh minh họa tái dựng"; Núi Tản Viên là truyền thuyết):

#### `coLoa` — Cổ Loa (Đông Anh, Hà Nội)

Tệp: `public/art/formation/maps/coLoa.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: an ancient multi-ringed earthen citadel with concentric moats and ramparts on a flat river plain, a few thatched villages inside the rings, rice fields around, a river winding past. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `bachDang` — Bạch Đằng (Quảng Ninh – Hải Phòng)

Tệp: `public/art/formation/maps/bachDang.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a wide tidal river mouth with mudflats, sandbanks and mangroves, low hills on both banks, a few wooden war boats and fishing boats, wooden stakes faintly visible near the shore. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `daiLa` — Đại La (Hà Nội)

Tệp: `public/art/formation/maps/daiLa.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a large rectangular walled citadel on the bank of a great river, gate towers, a river port with moored boats, markets and houses outside the walls, dikes along the river. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `luyLau` — Luy Lâu (Thuận Thành, Bắc Ninh)

Tệp: `public/art/formation/maps/luyLau.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: an old administrative town on a river crossing in a plain, brick and tile buildings, a Buddhist pagoda with a tall roof, canals and boat landings, orchards. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `aiChau` — Ái Châu (Thanh Hóa)

Tệp: `public/art/formation/maps/aiChau.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a southern coastal plain with rice fields, low rugged hills to the west, a river heading to the sea, a fortified hill village, a long earthen road. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `hoanChau` — Hoan Châu (Nghệ An – Hà Tĩnh)

Tệp: `public/art/formation/maps/hoanChau.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a far southern frontier province with steep forested mountains running down to a narrow coastal strip, a river estuary, sparse villages and a lookout post on a hill. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `tanVien` — Núi Tản Viên (Ba Vì, Hà Nội)

Tệp: `public/art/formation/maps/tanVien.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a sacred triple-peaked mountain rising above clouds over a plain, pine forests on the slopes, a small shrine halfway up, rivers and fields at its foot. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

**Cảnh quan chung** (không phải địa danh cụ thể, gắn nhãn hư cấu/minh họa trong giao diện):

#### `dongLua` — Đồng lúa đồng bằng

Tệp: `public/art/formation/maps/dongLua.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a patchwork of rice paddies divided by dikes and irrigation channels, a few farm huts, water buffaloes, a distant village grove of bamboo. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `damSen` — Đầm sen

Tệp: `public/art/formation/maps/damSen.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a wide lotus pond with blooming lotus leaves and flowers, narrow earthen paths, a small stilt hut and a few punt boats. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `langVenSong` — Làng ven sông

Tệp: `public/art/formation/maps/langVenSong.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a riverside village enclosed by a thick bamboo hedge, a village gate, thatched houses, a communal landing with small boats and a banyan tree. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `benThuyen` — Bến thuyền sông

Tệp: `public/art/formation/maps/benThuyen.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a busy river junction with a wooden jetty, cargo boats and war boats moored, warehouses with thatched roofs, a watchtower on the bank. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `trungDu` — Vùng trung du

Tệp: `public/art/formation/maps/trungDu.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: rolling midland hills with terraced fields, small woods, a winding stream and a hilltop lookout, a path between hamlets. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `cuaBien` — Cửa biển

Tệp: `public/art/formation/maps/cuaBien.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a sheltered coastal inlet with sand dunes, salt pans in geometric rows, fishing boats drawn onto the beach, a small fishing village behind. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `chuaCoTrenDoi` — Chùa cổ trên đồi

Tệp: `public/art/formation/maps/chuaCoTrenDoi.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: an old Buddhist temple with curved tiled roofs on a pine-covered hill, stone steps leading up, a bell tower, fields and a stream below. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `thanhDatCoHao` — Thành đất có hào nước

Tệp: `public/art/formation/maps/thanhDatCoHao.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: a small earthen fortress with palisade walls, a moat crossed by a wooden bridge, watchtowers and a courtyard of thatched barracks, fields around. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `rungGia` — Rừng già

Tệp: `public/art/formation/maps/rungGia.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: dense ancient forest with giant trees, a narrow trail, a small waterfall into a stream, mist in the valleys, a hunters' camp in a clearing. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

#### `nuiDaVoi` — Núi đá vôi

Tệp: `public/art/formation/maps/nuiDaVoi.webp`

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. Scene: steep limestone karst peaks with cliffs and caves around a green valley, a river with a shallow ford, small farms between the rocks. Composed as a game-board background: square 1:1, a slightly elevated three-quarter view, detail and visual interest distributed evenly across the whole frame, large readable shapes and landmarks, mid-tone values without pure black or blown-out white areas, no vignette, no heavy sky band or empty foreground band, the key landmark inside the central 70% of the image.
```

### 1.4 Thêm một bản đồ mới (không giới hạn số lượng)

1. Tạo ảnh theo thông số mục 0, đặt tên `public/art/formation/maps/<id>.webp` (`id` viết liền kiểu camelCase, không trùng id cũ).
2. Thêm một dòng vào `MAP_POOL` trong `src/app/game/formation/maps.ts`: `{ id, place, src, blurb, kind }` (`kind`: `"lich-su"` cho địa danh thật, `"canh-quan"` cho cảnh quan chung). Kho tự xoay theo kỳ, không cần sửa chỗ khác.
3. Thêm một mục `#### \`<id>\`` kèm prompt vào mục 1.3 của tài liệu này (test `tests/game/formation-maps.test.ts` kiểm mọi bản đồ trong kho đều có prompt ở đây).
4. Địa danh thật: ghi nguồn vào blurb theo [sổ nguồn sử](../../02-game-modes/campaign/history-sources.md); nếu chưa chắc về vị trí hoặc sự kiện thì dùng cảnh quan chung và nói rõ là minh họa.

Phần giữ chỗ của kho dùng 8 tranh nền chiến dịch lặp lại cho nhiều bản đồ; ảnh thật thay dần từng tệp.

## 2. Ô che đặc kín

Ô chưa mở phủ lên bản đồ, **đặc kín (không trong suốt)** và **khác hẳn** màu và chất liệu bản đồ để không nhầm với ô đã mở (Shan, 02/11/2026). Một họa tiết lát được, hiển thị khoảng 48px mỗi ô lặp.

Tệp: `public/art/formation/fog.webp` (đổi đường dẫn trong `src/app/globals.css`, lớp `.fm-cell[data-state="fog"]::before` và `[data-state="lit"]::before`).

```text
Seamless tileable texture, dark lacquered brown wood surface with faint embossed Dong Son bronze-drum motifs and swirling cloud scrolls, deep chocolate-brown with subtle bronze-gold highlights, fully opaque, low contrast so many adjacent tiles do not look busy, flat even lighting, no text, no characters, no objects, no borders, no vignette, 256x256, perfectly seamless on all four edges.
```

Phương án thay thế (nếu muốn ô che giống "mây phủ" hơn): thay cụm đầu bằng `Seamless tileable texture of thick dark ink-wash mist and rolling clouds on dark brown paper, ...` và giữ phần còn lại. Phải giữ **đặc kín** và **tối hơn** bản đồ.

## 3. Bốn icon chướng ngại

Mỗi ô chướng ngại có **nền đá tối do giao diện vẽ**, không lấy ảnh bản đồ; icon đặt lên trên, **nền trong suốt**, nhìn rõ ở cỡ 32px, nhìn chếch từ trên xuống, bóng đổ nhẹ, mực nâu và màu đất khớp bản đồ. Không cần cầu kì nhưng mỗi kiểu có nét riêng. Mỗi ô một kiểu theo vị trí (`obstacleKind` trong `FormationScreen.tsx`); luật như nhau (không đặt quân được).

Hậu tố chung nên thêm vào mọi prompt icon: `isolated single object centered on a fully transparent background, bold dark brown ink outline, flat painterly colors, soft drop shadow beneath, simple silhouette readable at 32px, 256x256, no text, no frame, no ground plane, no other objects.`

#### `nui` — Núi

Tệp: `public/art/formation/obstacles/nui.webp`

```text
Hand-painted game icon of a rugged limestone mountain peak with a snow-white cap and two smaller shoulders, grey-brown rock with ochre shading and a few ink hatch strokes, isolated single object centered on a fully transparent background, bold dark brown ink outline, flat painterly colors, soft drop shadow beneath, simple silhouette readable at 32px, 256x256, no text, no frame, no ground plane, no other objects.
```

#### `rung` — Rừng

Tệp: `public/art/formation/obstacles/rung.webp`

```text
Hand-painted game icon of a small cluster of three round-canopy trees of different heights with thin dark trunks, muted forest greens with lighter highlights on the canopies, isolated single object centered on a fully transparent background, bold dark brown ink outline, flat painterly colors, soft drop shadow beneath, simple silhouette readable at 32px, 256x256, no text, no frame, no ground plane, no other objects.
```

#### `damLay` — Đầm lầy

Tệp: `public/art/formation/obstacles/damLay.webp`

```text
Hand-painted game icon of a small marsh pond with rippling teal-green water and a few tall reeds with brown seed heads at the edges, a couple of lily pads, isolated single object centered on a fully transparent background, bold dark brown ink outline, flat painterly colors, soft drop shadow beneath, simple silhouette readable at 32px, 256x256, no text, no frame, no ground plane, no other objects.
```

#### `thanhLuy` — Thành lũy

Tệp: `public/art/formation/obstacles/thanhLuy.webp`

```text
Hand-painted game icon of a short stone and earth fortress wall with crenellated top and a central arched gate with a wooden door, 10th-century Vietnamese military style, weathered grey-brown stone with ochre and moss accents, isolated single object centered on a fully transparent background, bold dark brown ink outline, flat painterly colors, soft drop shadow beneath, simple silhouette readable at 32px, 256x256, no text, no frame, no ground plane, no other objects.
```

### 3.1 Trạng thái và lưu ý nền trong suốt

Ô che (`public/art/formation/fog.webp`) đã duyệt; 4 icon v1 "tạm được" đã tích hợp. Công cụ tạo ảnh trả icon với **ô caro vẽ sẵn thay vì alpha thật**, nên đã dùng `scripts/cutout-formation-icon.py` (lan từ mép, bỏ mảng sáng trung tính, giữ mảng liền lớn nhất, làm mềm viền) để ra webp trong suốt 256×256 (cần Pillow, numpy, scipy). Còn vệt bóng trắng mờ ở chân vật thể. Lần tạo sau nên yêu cầu **nền một màu phẳng (#00FF00 hoặc xám đặc), không bóng đổ dưới chân** để cắt sạch hơn.

## 4. Kiểm tra sau khi có ảnh

- Quân (chân dung tròn có hai huy hiệu) đọc rõ khi đặt lên từng bản đồ ở bàn 10×10 trên điện thoại.
- Ô che không bị nhầm với ô đã mở, kể cả khi chỉ còn vài ô che.
- Bốn icon chướng ngại phân biệt được ở 32px.
- Alpha thật (không viền trắng) ở icon chướng ngại.
