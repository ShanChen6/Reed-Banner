# Prompt tranh thư cuộn liên hệ (footer)

> Cập nhật: 07/11/2026
> Trạng thái: **DRAFT** — Claude soạn theo yêu cầu của Shan (07/11/2026: làm thư cuộn liên hệ thật hơn); chưa có tranh. Hiện footer dùng bản dựng bằng CSS và SVG ([`ContactBlock.tsx`](../../../src/app/game/ContactBlock.tsx)) nên vẫn chạy bình thường khi chưa có tranh.

Khối liên hệ ở footer là một **thư cuộn treo tường** (phương án Shan chọn 07/11/2026, xem [giao diện chế độ](../../05-ui-ux/design-system/game-mode-ui-spec.md)).
Bản CSS đã có dây treo, trục gỗ, tờ giấy dó và ấn đỏ nhưng vẫn là hình vẽ bằng mã. Tranh vẽ tay cho **khung thư cuộn** (không có chữ) sẽ cho
chất liệu thật: giấy có xơ, vết ố, mép sờn, cuộn giấy dày, trục gỗ tiện, dây lụa và tua rua. Chữ, biểu tượng nền tảng và liên kết vẫn do code
đặt lên, nên nội dung đổi được mà không phải vẽ lại.

Prompt viết bằng tiếng Anh (công cụ tạo ảnh), giải thích bằng tiếng Việt. Khối phong cách lấy đúng khối đã dùng cho thumbnail chế độ
([prompt thumbnail Chiến trường](thumbnail-chien-truong.md)) để cùng nét vẽ với bộ thẻ.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Tệp | `thu-cuon.png` (PNG gốc, **nền trong suốt thật**). Khi gửi lại, Claude xuất WebP có alpha vào `public/art/footer/thu-cuon.webp` (chất lượng 85, dưới 250 KB) |
| Khổ | **Ngang 8:5**, tốt nhất 1600×1000 trở lên. Phần giấy ở giữa chiếm khoảng 80% bề rộng và 70% chiều cao ảnh để đặt chữ |
| Vùng chữ | **Phần giữa tờ giấy phải phẳng, sáng và đồng đều** (màu giấy dó vàng nhạt, ít họa tiết) vì chữ mực nâu đậm đè lên; chi tiết, vết ố và sờn chỉ ở rìa. Đây là điều kiện quan trọng nhất |
| Bố cục | Nhìn thẳng từ phía trước, đối xứng trái phải, thư cuộn treo cân bằng dưới một sợi dây; không nghiêng, không phối cảnh mạnh |
| Cấm trong ảnh | Chữ, chữ Hán, số, logo, mặt người, bàn tay, tường hay nền phía sau (nền phải trong suốt), watermark |
| Tông | Giấy dó ngà ấm, gỗ trầm, đồng cổ, lụa son đậm; khớp bảng màu `--paper`, `--frame-gold`, `--lacquer` ([theme](../../05-ui-ux/design-system/theme.md)) |

**Negative prompt dùng chung (nếu công cụ hỗ trợ):** `text, letters, Chinese characters, numbers, logo, UI, people, hands, face, background wall, scene, table, shadow on floor, watermark, signature, photorealistic, 3d render, modern paper, lined paper, oversaturated, pure black, blown-out highlights, vignette, blurry`

## 2. Prompt chính: thư cuộn treo

```text
High quality hand-painted 2D illustration of a single hanging scroll letter for a Vietnamese historical fantasy web game set in the 10th century, inspired by Hoa Lu and Northern Vietnam; antique bronze and warm parchment with subtle vermilion accents, rice-paper (giấy dó) texture, painterly brushwork, respectful historical atmosphere, no modern objects, no Chinese imperial palace stereotypes. No lettering, no calligraphy, no numbers, no logos, no UI, no people, no hands.
Subject: a wide horizontal scroll hung from a small bronze wall nail by two twisted deep-red silk cords that run down in a clean triangle and are tied to the two ends of the top rod; seen straight from the front, perfectly symmetrical. The top and bottom edges are thick paper rolls wound tightly around dark lacquered wooden rods, the rolled paper clearly showing its spiral layers and soft cylindrical shading; the wooden rods extend a little beyond the paper on both sides and end in round turned finials of aged gold-bronze with a gentle highlight. From each end of the bottom rod hangs a short vermilion silk tassel with a knotted bead and fine fringe.
The unrolled letter between the two rolls is aged handmade giấy dó paper in pale warm ivory-gold: long fibres and flecks visible only near the edges, slightly torn and deckled left and right edges, faint vertical fold creases, soft brown foxing and water-stain vignetting toward the borders and darker where the paper curves into the rolls. The central area of the paper, about 80 percent of its width and height, must be calm, flat, bright and evenly toned with almost no pattern so dark ink text can be laid over it later. A faint thin double-line border may run just inside the paper edge, with tiny bronze Dong Son sun-and-bird motifs used very sparingly in the four corners only, no text.
Transparent background outside the scroll, cords and tassels. Soft contact shading only on the object itself, no cast shadow on any background. Wide 8:5 landscape composition, the scroll centred with a little transparent margin on all sides, mid-tone values without pure black or blown-out white, no vignette around the image, no frame, no border.
```

## 3. Bản ngắn (nếu công cụ giới hạn độ dài)

```text
Hand-painted 2D game illustration, front view, symmetrical hanging scroll on transparent background: two twisted vermilion silk cords from a bronze nail tied to a dark wooden top rod; paper rolled thickly around top and bottom rods with visible spiral layers; rods end in round aged gold-bronze finials; red silk tassels hang from the bottom rod ends; between the rolls a wide sheet of aged ivory giấy dó paper with torn edges, fibres and faint foxing only at the borders, and a calm bright flat centre for text. Vietnamese 10th century, warm parchment, bronze, vermilion. No text, no people, no background, 8:5.
```

## 4. Ấn đỏ (tuỳ chọn, ảnh riêng)

Ấn hai chữ "Cờ Lau" hiện vẽ bằng SVG có nét mực không đều. Nếu muốn nét ấn thật hơn, tạo thêm một ảnh nhỏ **vuông 1:1, 512×512, nền trong suốt**,
`an-co-lau.png` → `public/art/footer/an-co-lau.webp`. Ấn là **chữ quốc ngữ "Cờ Lau" hai dòng** (không dùng chữ Hán), nên prompt mô tả hình thức,
còn chữ do code đặt nếu công cụ không vẽ chữ chính xác.

```text
Hand-painted 2D texture of a square red ink seal stamp impression on transparent background, deep vermilion cinnabar colour, a thick outer border and a thin inner border with slightly worn and uneven edges, ink pooling and tiny gaps typical of a genuine stamped seal on rough paper, the inside left empty or filled with an abstract bronze Dong Son sun motif, no letters, no numbers, no people. Square 1:1, flat front view, no shadow, no background.
```

## 5. Sau khi có ảnh

1. Xuất WebP có alpha vào `public/art/footer/` (`thu-cuon.webp`, và `an-co-lau.webp` nếu có), kiểm tra nhẹ (dưới 250 KB).
2. Trong `ContactBlock.tsx`: dùng `thu-cuon.webp` làm khung (ảnh nền của `.scroll`) và đặt khối chữ trong vùng giấy ở giữa; bỏ các lớp CSS dây treo, trục, cuộn, giấy, tua rua (giữ phần chữ, liên kết, ấn).
3. Chụp lại footer ở 1440px và 360px: chữ mực nâu phải đọc rõ trên giấy (độ tương phản ít nhất 4,5:1), liên kết bấm đúng chỗ khi ảnh co giãn.
4. Cập nhật dòng `Trạng thái` của tài liệu này thành IMPLEMENTED.
