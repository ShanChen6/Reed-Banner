# 04 — Binh Pháp: UX specification + UI art bible

> **PROPOSED** — màn chưa tồn tại; không sử dụng Alchemy Deluxe assets.

## Layout: Bàn Sa Bàn Quân Sự

**Desktop >=1024:** Global Game Header hiện có (giữ nguyên), nội dung một khung gỗ lớn: sidebar trái “Quân chờ / Bỏ Lệnh / Quân Lệnh”, board giữa làm điểm tập trung, sidebar phải “Khai thông / Điểm / Luật / Hướng dẫn”. Border đồng cổ, giấy dó làm nền từng ô. Chiều cao board nên phù hợp viewport, không bắt ép scroll trong lúc đặt.

**Tablet:** board chiếm chính, HUD 2 bên thu hẹp hoặc một sidebar dưới.

**Mobile 320–430:** header toàn game tối giản; board full available width, 8 cột vẫn phải chạm chính xác với khoảng ô 36–46px theo màn; controls >=44px, panel quân chờ và meter xếp phía trên/dưới. Zoom nudge/selection keyboard hỗ trợ ô nhỏ, không có overlay che board.

## Component tree (đề xuất)

```txt
BinhPhapScreen
 ├─ ModeShell (tokens gỗ/đồng/giấy dó + GameHeader dùng chung)
 ├─ PuzzleHero (tên / luật rất ngắn / help)
 ├─ PuzzleStatus (progress, score, lượt, trạng thái)
 ├─ PieceQueue (portrait, nghề, hệ; không spoil quân sau nếu ruleset không cho)
 ├─ PuzzleBoard
 │   └─ PuzzleCell (covered / piece / eligible / focus / invalid)
 ├─ ActionDock (bỏ quân, công cụ đặc biệt, hướng dẫn)
 ├─ TutorialPanel (ví dụ khớp nghề với một phía + khớp hệ với phía khác)
 ├─ PausePanel (tiếp tục / bắt đầu lại theo quyền)
 └─ ResultPanel (thắng / thua / điểm; tuyệt đối không tự award)
```

## Theme token và visual hierarchy

- Dùng shared `--atlas-*` hoặc mapping token tương ứng thay vì chế token bất đồng với Campaign.
- Frame: dark lacquered wood `#2B1F15` / `#3D2C1D`; kim loại matte bronze `#8F6A32`, warm gold highlight `#C9A25A`; giấy dó `#E4CC99`, viền đỏ son `#8F241D`.
- Icon nghề và hệ dùng **nguồn asset hiện có**; màu hệ phải kèm icon chữ/shape, tránh phụ thuộc màu.
- Quân thường: portrait là tiêu điểm (>=65% vùng quân), nghề ký hiệu góc trên trái, hệ góc dưới phải; đường viền mảnh, tránh chữ tên dài bên trong ô 8x8.
- Visual states: `empty`, `empty-covered`, `occupied`, `can-place`, `invalid`, `highlight-row`, `completed`, `selected`. Tách style khỏi game engine events.
- Animation: đặt 100–180ms, clear line 150–260ms, covered reveal 180ms; tôn trọng `prefers-reduced-motion`, không khóa input với animation chưa resolve; không tạo 3D/particle tốn GPU.

## Kinh nghiệm người chơi

1. Mở Binh Pháp: thấy luật 1–2 câu, board và quân chờ.
2. Hover/tap focus: preview hợp lệ (nêu lý do nếu sai). Không tốn lượt.
3. Đặt hợp lệ: tile chuyển màu giấy/đồng, quân hiện lên, line có thể thu hồi.
4. Thắng: toàn bộ `covered` bật, màn chiến thắng giữ board để nhìn lại chiến thuật.
5. Thua: giải thích do discards, cho luyện lại; không tự hứa phần thưởng.

Tutorial phải có ví dụ thỏa **hai thuộc tính khác nhau với hai hướng kề khác nhau**. Game không dùng 7 hệ tương khắc để hợp lệ, chỉ equality.

## Asset inventory trước khi vẽ

| Thành phần | Nguồn ưu tiên | Mới hay cũ |
|---|---|---|
| Chân dung quân | portrait metadata trong src/app/game/art/; những ảnh nhân vật đã duyệt | Tái sử dụng |
| Hệ / nghề | icon hệ/nghề game | Tái sử dụng |
| Khung UI, hoa văn góc | World Atlas shared tokens/components, orn. nhỏ | Tái sử dụng |
| Sa bàn trống | CSS/SVG raster-free hoặc texture giấy dó hiện có | Thiết kế bằng code |
| Quân Lệnh / Thu Hồi | icon đặc thù, rõ ở cỡ 32px | **Cần asset mới nếu CSS/SVG không đạt** |
| Hero/banner trang mode | tranh sa bàn ở trong trướng chỉ huy Hoa Lư | Optional P1 |

Nếu cần sản xuất asset mới, prompt gốc riêng:
- **Quân Lệnh:** “Isolated Vietnamese 10th-century bronze command seal game icon, Dong Son inspired engraving, matte antique bronze, clean strong silhouette, transparent true alpha, no text, no numerals, no photorealistic 3D lighting.”
- **Thu Hồi:** “Isolated historical Vietnamese bronze tally token and bamboo command slip game icon, single restrained object pair, etched 2D illustration, readable at 32px, transparent true alpha, no background, no text.”
- **Sa bàn backdrop:** “Hand painted tabletop of lacquered Vietnamese timber, silk scroll, ivory mulberry paper and muted bronze accents, 10th century Hoa Lu military strategy scene, horizontal landscape, uncluttered central area, no text, no character, no UI, no embedded board, no watermark.”

Output đề xuất: 256x256 transparent PNG for icons, 2560x1440 WebP for backdrop. Verify true alpha with image pipeline; không chèn văn bản vào art.

## Acceptance

- Luật nghề/hệ đọc được trong <3s khi nhìn một quân ở desktop và mobile.
- Không có icon trùng/mất màu, crop chân dung, bàn 8 cột vượt màn.
- Trái/phải hoặc trên/dưới board không cản thao tác.
- Score/progress là derived state, animation không trở thành nguồn truth.
- Guest, light/dark Battle Theme, global header cùng hoạt động; Binh Pháp dùng theme riêng chỉ trong mode scope.
