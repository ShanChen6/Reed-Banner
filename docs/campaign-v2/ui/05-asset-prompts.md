# 05 — Prompt ảnh phục vụ thoại và Atlas (TÙY CHỌN)

> Cập nhật: 26/10/2026  
> Ưu tiên: **sau UI-01/MAP-01**. Bản đầu không yêu cầu tạo ảnh.

## 1. Khuyến nghị

Hiện Reed Banner có chân dung qua `src/app/game/art/portrait-data.ts` và `Portrait`. **Không vẽ lại khuôn mặt, vũ khí, kiểu tóc, trang phục nhân vật bằng một prompt chung**. Reuse canonical portraits và character IDs; chỉ bổ sung ảnh nền/khung viền. Không nhúng chữ vào ảnh vì UI cần text rõ nét và responsive.

Tạo background 16:9 tối thiểu 1920×1080, WebP tối ưu sau duyệt; ảnh có vùng tối/ít chi tiết ở 1/3 dưới để đặt hộp thoại; không chứa người để chân dung trong code có thể đặt ở 2 bên mà không chồng nhân vật. Kích thước mục tiêu sau nén phải do dev đo và cân theo mobile.

## 2. Prompt chung áp dụng mọi ảnh

```text
High quality hand-painted 2D environment for a Vietnamese historical fantasy match-3 web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents. Readable large silhouettes, controlled detail, cinematic depth, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. Environment ONLY, no people, no characters, no weapons, no lettering, no logos, no UI. 16:9 composition, keep lower 30% and left/right portrait zones calm and low-detail for an overlay dialogue box and character portraits; focal scenery in upper center.
```

## 3. Các nền cần cân nhắc (chỉ 3 asset đầu là tùy chọn ưu tiên)

### BG-01 · Hoa Lư, mở đầu và hồi kết

```text
Ancient Hoa Lu mountain valley in Ninh Binh, limestone cliffs rising behind a small Vietnamese timber settlement, bamboo, simple reed flags, natural early morning mist, golden sunlight, no humans. Mood of humble origins and hope. Apply shared environment style; 16:9, dialogue-safe lower zone.
```

### BG-02 · Bố Hải Khẩu, hội kiến M05–M08

```text
10th-century northern Vietnamese river estuary settlement, wooden pier, shallow merchant boats, river mist, low timber council pavilion beside the water, solemn diplomatic calm; NO named people, no banners with text. Apply shared environment style, 16:9, dialogue-safe lower zone.
```

### BG-03 · Quân nghị, dùng lại ở các chương III–V

```text
Simple ancient Vietnamese military council hall made of wood and bamboo, woven mats, rolled parchment maps WITHOUT legible markings, bronze ceremonial drum, natural warm lantern lighting, strategic and contemplative mood, empty scene. Apply shared environment style, 16:9, portrait-safe margins and dialogue-safe bottom.
```

### BG-04 · Thành lũy, dùng cho các trận (sau)

```text
10th-century Northern Vietnam earthwork fortress and timber palisade on a river plain, wooden watch platforms, moats, soft storm clouds, subdued wartime mood; NO combatants, no gore. Not European medieval stone castle. Apply shared style, 16:9.
```

### BG-05 · Đăng quang Hoa Lư M24 (sau)

```text
Ceremonial open court at 10th-century Hoa Lu, timber architecture, bronze ritual drums, reed banners, limestone hills beyond, warm sunrise, dignified yet restrained royal atmosphere; NO people, no crown or throne with inaccurate later dynastic motifs, no text. Apply shared style, 16:9.
```

### BG-06 · Đầm nước Hồi Hồ (sau)

```text
Northern Vietnam marshland, reeds, misty floodplain, narrow wooden walkway, distant low forest and muddy banks, tense travel atmosphere, NO people. Apply shared style, 16:9.
```

## 4. Atlas backgrounds

**Khuyến nghị đầu tiên: giữ SVG `CampaignMap.tsx` và CSS paper texture**. Nếu cần ảnh trang Sử ký, tạo ảnh nền **không có marker/nội dung/đường biên**, vì tất cả các phần tương tác phải render code:

```text
Seamless handmade Vietnamese mulberry rice paper (giấy dó) parchment background, delicate fibers, engraved wave and bronze ornaments only along the far edges, calm center negative space, faded ivory #eadcbf and ink brown #4b3625, no geographic map, no labels, no icons, no text. Flat front-facing background texture, game UI asset, 16:9.
```

Không nên yêu cầu AI tự vẽ “bản đồ chính xác thời 12 sứ quân” vì sai địa danh và đường sông. Code giữ vị trí vùng có mức độ tin cậy, theo docs sử liệu.

## 5. Quy trình asset

1. Dựng text-only UI trước; chụp ảnh vị trí hộp thoại và khoảng trống thực tế.
2. Tạo 1 ảnh Hoa Lư và 1 ảnh Bố Hải thử; so với UI mobile/desktop.
3. Duyệt hình → tối ưu WebP + fallback CSS.
4. Viết asset manifest ánh xạ `sceneBackgroundKey → path`, lazy load, không hardcode URL trên 24 mission.
5. Chỉ sau khi hình nhất quán mới sản xuất BG khác.

**Audio, Voice, TTS, nhạc không thuộc file này; xem `audio-todo/` và đừng triển khai.**