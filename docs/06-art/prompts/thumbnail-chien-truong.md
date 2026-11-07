# Prompt thumbnail thẻ chế độ ở Chiến trường

> Cập nhật: 07/11/2026
> Trạng thái: **IMPLEMENTED** — Claude soạn theo yêu cầu của Shan (07/11/2026: thumbnail Khai Lộ và Viễn Chinh đang dùng chung một tranh mực tạm); Shan tạo tranh từ hai prompt dưới đây, đã gắn vào thẻ (`public/art/home/khai-lo.webp`, `public/art/home/vien-chinh.webp`, 960×540, khoảng 145 KB mỗi tranh).

Thẻ chế độ ở màn Chiến trường (`src/app/game/MenuScene.tsx`, danh sách `MODES`) dùng tranh `public/art/home/<tên>.webp`. Hiện
**Khai Lộ** và **Viễn Chinh** chưa có tranh riêng nên cùng dùng tranh mực tạm (`public/art/campaign/rail-ink.webp`), nhìn
giống hệt nhau. Chỉ cần **một** tranh mới là hai thẻ đã khác nhau; làm cả hai thì đủ bộ. Nên làm **Viễn Chinh trước** vì
thẻ này gần như chỉ có chữ, còn Khai Lộ đã có tranh mực tạm hợp với chế độ giải đố.

Prompt viết bằng tiếng Anh (công cụ tạo ảnh), giải thích bằng tiếng Việt. Phong cách và bố cục lấy đúng khối đã dùng cho
thumbnail Trận Đồ ([prompt hình ảnh Trận Đồ](tran-do-hinh-anh.md), mục 5) để bộ thẻ đồng bộ.

## 1. Thông số chung

| Mục | Giá trị |
|---|---|
| Khổ | **16:9 ngang**, tốt nhất 1600×900 trở lên; thẻ cắt theo tỉ lệ 2:1 hoặc 16:9 (`object-cover`), nên giữ chủ thể ở giữa và hai phần ba phía trên |
| Tệp | `khai-lo.png`, `vien-chinh.png` (PNG gốc). Khi gửi lại, Claude xuất WebP 960×540 (chất lượng 85, dưới 150 KB) vào `public/art/home/khai-lo.webp` và `public/art/home/vien-chinh.webp`, rồi thêm `art: "khai-lo"` / `art: "vien-chinh"` vào `MODES` ở `MenuScene.tsx` |
| Vùng dưới | Một phần ba phía dưới **êm và tối hơn** vì tên chế độ đè lên đó |
| Cấm trong ảnh | Chữ, số, logo, khung UI, viền, watermark, vignette; mặt người nhìn rõ |
| Tông | Trung bình, không đen tuyền và không cháy sáng; ấm đồng cổ và giấy dó với điểm son nhẹ, khớp [art bible](../art-bible.md) |

**Negative prompt dùng chung (nếu công cụ hỗ trợ):** `text, letters, numbers, labels, logo, UI, border, frame, watermark, signature, close-up faces, modern objects, European castle, Chinese imperial palace, photorealistic, 3d render, anime, oversaturated, pure black shadows, blown-out highlights, vignette, blurry`

## 2. Viễn Chinh — hai đạo quân giáp công

Ý chính của chế độ ([GDD](../../02-game-modes/expedition/01-vien-chinh-gdd.md)): hai đạo quân đi hai đường khác nhau rồi hội
lại đánh một thành. Hai đạo có hai màu khác nhau trong game (vàng đồng và xanh ngọc), nên tranh cũng cho hai đạo hai màu cờ.
Khác với các tranh sa bàn, thumbnail này cho phép **bóng người rất nhỏ ở xa, không rõ mặt**, vì chủ đề là quân hành quân.

```text
High quality hand-painted 2D environment illustration for a Vietnamese historical fantasy web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. No lettering, no numbers, no logos, no UI. Scene: an epic wide valley at dawn seen from a high ridge; two separate dirt roads wind in from the left and from the right across rice terraces, a river bend and karst foothills, both converging toward a walled earthen citadel in the centre with a red-lacquered gate tower and curved tiled roofs; on each road a long column of marching soldiers rendered as tiny distant faceless silhouettes, the left column carrying warm ochre-gold banners and the right column carrying cool jade-teal banners; war boats with bamboo sails on the river; drifting river mist, low golden sunlight raking across the land, a few thin smoke trails rising from the citadel. Strategic, epic, pincer-movement mood: the viewer should read two armies about to meet at the walls. Composed as a mode-card thumbnail: wide 16:9 landscape, the citadel and the two converging roads in the upper and central two thirds, the bottom third calmer and darker (a title will be overlaid there), mid-tone values without pure black or blown-out white, no vignette, no border, no frame.
```

## 3. Khai Lộ — mở đường qua bàn ngọc

Ý chính ([GDD](../../02-game-modes/future/24-khai-lo-gdd.md)): chạm xóa cả khối quân ngọc cùng hệ, mở dần đường đi. Quân là
ngọc nhuộm màu theo bảy nguyên tố. Tranh không dùng người; thay vào đó là mặt sân lát ngọc được dọn dần để lộ con đường dẫn
tới cổng thành xa.

```text
High quality hand-painted 2D environment illustration for a Vietnamese historical fantasy web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. No people, no characters, no faces, no hands, no weapons, no lettering, no numbers, no logos, no UI. Scene: a broad stone courtyard inlaid with a grid of polished jade tiles in seven soft elemental tints (pale silver-white, leaf green, deep water blue, ember red, earthy ochre, dusk violet, sea turquoise), each tile engraved only with a tiny abstract Dong Son swirl; the near half of the grid is intact and gleaming, while the far half has been cleared in irregular blocks, leaving a pale dirt road that winds between the remaining tiles toward a distant misty fortress gate with a red-lacquered tower; a few loose jade chips and petals scattered on the road; bamboo groves and limestone peaks softly out of focus on both sides, warm afternoon light and a faint haze. Calm, satisfying, puzzle-solving mood: the viewer should read a path being opened block by block. Composed as a mode-card thumbnail: wide 16:9 landscape, the cleared road and the distant gate in the upper and central two thirds, the bottom third calmer and darker (a title will be overlaid there), mid-tone values without pure black or blown-out white, no vignette, no border, no frame.
```

## 4. Quy trình đưa ảnh vào thẻ (đã làm ngày 07/11/2026)

1. Xuất WebP 960×540 vào `public/art/home/`, kiểm tra ảnh nhẹ (dưới 150 KB) và đọc được ở thẻ nhỏ 360px.
2. Thêm `art` cho thẻ trong `MODES` (`src/app/game/MenuScene.tsx`).
3. Chụp lại màn Chiến trường ở 360 và 1440px, so với các thẻ khác (cùng độ sáng vùng dưới để chữ tên đọc được).

Tranh Khai Lộ là sân lát ngọc bảy sắc hệ với con đường được dọn dần tới cổng thành; tranh Viễn Chinh là hai đạo quân cờ vàng và cờ xanh ngọc tiến về một thành đất, có thuyền chiến trên sông. Cả hai có phần dưới êm và tối nên tên chế độ đè lên vẫn đọc rõ.
