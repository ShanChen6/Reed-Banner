# Prompt thumbnail thẻ chế độ ở Chiến trường

> Cập nhật: 19/11/2026 (thêm mục 6 Thao Luyện (chưa có tranh), mục 7 Giao Tranh (đã có tranh); Shan gửi tranh mới thay cho Bình Loạn, Tháp Thí Luyện, Nhật Lệnh, Sử Lộ; 15/11/2026 thêm mục 5: Sử Lộ; Do Thám và Sử Lộ đã có tranh `public/art/home/do-tham.webp`, `su-lo.webp`, 960×540, khoảng 140 KB mỗi tranh, đã gắn vào thẻ và biển đầu màn)
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

Ý chính ([GDD](../../02-game-modes/khai-lo/gdd.md)): chạm xóa cả khối quân ngọc cùng hệ, mở dần đường đi. Quân là
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

## 4. Do Thám — sa bàn dò bẫy (13/11/2026, đã có tranh)

Thẻ Do Thám (`MODES` trong `MenuScene.tsx`) đang dùng tranh mực tạm vì chưa có `public/art/home/do-tham.webp`. Tạo tranh theo thông số mục 1 (16:9, vùng dưới êm và tối, không chữ, không mặt rõ). Khi gửi lại tranh, Claude xuất WebP 960×540 vào `public/art/home/do-tham.webp` và thêm `art: "do-tham"` cho thẻ.

Ý chính: một bãi lau mờ sương nhìn từ trên cao chếch, lưới ô đất phủ lau, vài ô đã mở lộ nền đất, một **cờ lau** cắm trên ô nghi bẫy và vài mũi **chông tre** nhô ra ở một ô xa; xa xa là bóng lũy tre và một người trinh sát rất nhỏ, không rõ mặt. Hai màu: vàng đồng ấm với điểm son nhẹ.

```text
Stylised digital painting of a historical Vietnamese scouting scene for a strategy game, 16:9 landscape, 10th-century Dinh dynasty. A grid-like field of earth and reed plots seen from a slightly raised angle in soft mist: several plots cleared to bare brown earth, the others still covered with pale reeds (lau). A small reed flag (co lau) stuck in one covered plot, and a few sharpened bamboo stakes peeping out of a plot far away. Faint bamboo palisade and a watchtower in the haze at the horizon, a tiny scout figure with a conical hat far away, face not visible. Thin ink outlines of varied thickness, soft painterly shading, warm antique bronze and rice-paper tones with a hint of vermilion, medium saturation, no pure black and no blown highlights. The lower third is calm, darker and plain so a title can sit on it. No text, no letters, no numbers, no logo, no UI, no frame, no border, no watermark, no close-up faces.
```

Nếu công cụ có ô negative: dùng khối ở mục 1.

## 5. Sử Lộ — mê cung lịch sử (15/11/2026, đã có tranh)

Thẻ Sử Lộ (`MODES` trong `MenuScene.tsx`) và biển đầu màn Sử Lộ (`ModeBanner` trong `SuLoScreen.tsx`) chưa có tranh riêng; Do Thám (mục 4) cũng vậy. Tạo tranh theo thông số mục 1 (16:9, vùng dưới êm và tối, không chữ, không mặt rõ) vào tệp `su-lo.png`. Khi gửi lại tranh, Claude xuất WebP 960×540 vào `public/art/home/su-lo.webp`, thêm `art: "su-lo"` cho thẻ ở `MenuScene.tsx` và `art="/art/home/su-lo.webp"` cho `ModeBanner` ở `SuLoScreen.tsx`. Do Thám làm tương tự với `do-tham.webp` (thẻ ở `MenuScene.tsx`, biển ở `DoThamScreen.tsx`).

Ý chính ([GDD](../../02-game-modes/su-lo/gdd.md)): một **mê cung** lát đá với tường lũy tre và đá vôi nhìn từ trên cao chếch, đường đi khúc khuỷu mờ sương dẫn tới **cổng thành** đá ở xa; trên đường rải vài ô đá khắc dấu, một **viên xúc xắc** gỗ khắc hoa văn đồng và một **cuộn sử** mở ra đặt ở góc; một quân cờ tướng nhỏ (bóng, không rõ mặt) đứng ở ô xuất phát. Gợi cảm giác "đi giữa trang sử", màu đồng cổ và giấy dó với điểm son nhẹ, hợp bộ thẻ hiện có.

```text
Stylised digital painting of a historical Vietnamese maze for a strategy-puzzle game, 16:9 landscape, 10th-century Dinh dynasty. A winding labyrinth of low stone-and-bamboo palisade walls seen from a slightly raised angle in soft mist, a path of worn flagstones with a few carved marker stones, leading far to a weathered stone city gate with a tiled roof. In the foreground a hand-carved wooden die with bronze Dong Son ornamental inlay and an unrolled bamboo-slip history scroll resting on a stone ledge, a small game-piece figure (tiny silhouette, no visible face) on the starting tile. Limestone karst hills and bamboo groves in the haze. Rice-paper and woodcut texture, antique bronze and warm parchment palette with subtle vermilion accents, painterly brushwork, calm composition with the main subject centered in the upper two thirds, the lower third soft, dark and empty for a title overlay. No text, no letters, no numbers, no border, no watermark, no close-up faces.
```

Nếu công cụ có ô negative: dùng khối ở mục 1.

## 6. Thao Luyện — sân tập võ (19/11/2026, chưa có tranh)

Thẻ Thao Luyện ở trang giới thiệu (mục Chế độ chơi, `MODE_GROUPS` trong `src/app/page.tsx`) đang tạm dùng nền trận hệ Mộc (`public/art/stage/he-moc.webp`). Tạo tranh theo thông số mục 1 vào tệp `thao-luyen.png`. Khi gửi lại, Claude xuất WebP 960×540 vào `public/art/home/thao-luyen.webp` và đổi `art` của thẻ Thao Luyện.

Ý chính: chế độ luyện tay, vào trận ngay không cần mạng, đấu AI. Một **sân tập võ** của doanh trại Hoa Lư lúc sáng sớm: bia tập bắn đan rơm vòng đỏ có mũi tên cắm, giá vũ khí tre (giáo, đao), cọc gỗ tập đánh quấn rơm, bàn cờ ghép ô bằng gỗ đặt trên chiếu ở hiên; xa là lũy tre, mái nhà sàn và núi đá vôi. Không khí êm, thư thả, gợi "luyện tập" chứ không phải chiến trận. Bóng người nếu có thì rất nhỏ, không rõ mặt.

```text
High quality hand-painted 2D environment illustration for a Vietnamese historical fantasy web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. No lettering, no numbers, no logos, no UI. Scene: a quiet military training yard of a 10th-century Vietnamese camp at early morning; a woven straw archery target with red rings and one bamboo arrow struck in the center, a bamboo weapon rack with spears and sabers, wooden training posts wrapped in straw rope, and on a raised veranda a low wooden game board with colorful carved tiles resting on a woven mat beside a small bronze drum; behind, a bamboo palisade, stilt-house roofs and soft limestone karst peaks in morning mist, golden low sunlight, a few reed plumes (lau) swaying. Calm, focused practice mood, inviting rather than violent. Composed as a mode-card thumbnail: wide 16:9 landscape, the target and the game board in the upper and central two thirds, the bottom third calmer and darker (a title will be overlaid there), mid-tone values without pure black or blown-out white, no vignette, no border, no frame, no close-up faces.
```

Nếu công cụ có ô negative: dùng khối ở mục 1.

## 7. Giao Tranh — trận trực tuyến có đồng hồ (19/11/2026, đã có tranh)

Đã gắn `public/art/home/giao-tranh.webp` (960×540, dưới 150 KB) cho thẻ Giao Tranh ở trang giới thiệu (19/11/2026). Trước đó thẻ tạm dùng nền trận hệ Hỏa. Tạo tranh theo thông số mục 1 vào tệp `giao-tranh.png`. Khi gửi lại, Claude xuất WebP 960×540 vào `public/art/home/giao-tranh.webp` và đổi `art` của thẻ Giao Tranh.

Ý chính: trận trực tuyến hai phe, mỗi lượt có đồng hồ 30 giây, thắng nhận vàng và chiến lợi phẩm. Hai **doanh trại đối diện** hai bên một bãi đất trống bên sông lúc hoàng hôn, mỗi bên một màu cờ (son đỏ và xanh ngọc), ở giữa là **đài trống đồng** cùng một **đồng hồ cát** lớn bằng đồng gợi giới hạn thời gian; khói bếp, đuốc vừa thắp. Căng thẳng trước giờ giao chiến, chưa đánh nhau. Bóng quân nếu có thì rất nhỏ, không rõ mặt.

```text
High quality hand-painted 2D environment illustration for a Vietnamese historical fantasy web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; Vietnamese bamboo, thatched timber architecture, limestone karst formations, bronze Dong Son ornamental motifs used sparingly, rice-paper and woodcut texture, antique bronze and warm parchment with subtle vermilion accents, painterly brushwork, cinematic depth and atmospheric lighting, physically coherent architecture, respectful historical atmosphere, no modern objects, no European castles, no Chinese imperial palace stereotypes. No lettering, no numbers, no logos, no UI. Scene: two opposing army camps facing each other across an open riverside field at dusk; the left camp with vermilion red banners, the right camp with jade-teal banners, bamboo palisades, tents and watchtowers with freshly lit torches; in the middle of the field a raised earthen platform holding a large bronze Dong Son drum and a tall bronze-and-lacquer sandglass with golden sand running, hinting at a turn timer; tiny distant faceless soldier silhouettes lined up at each camp; limestone karst peaks and a winding river behind, warm orange sunset sky with drifting smoke. Tense moment just before battle, competitive and fair duel mood, no fighting yet. Composed as a mode-card thumbnail: wide 16:9 landscape, the two camps and the central drum platform in the upper and central two thirds, the bottom third calmer and darker (a title will be overlaid there), mid-tone values without pure black or blown-out white, no vignette, no border, no frame, no close-up faces.
```

Nếu công cụ có ô negative: dùng khối ở mục 1.

