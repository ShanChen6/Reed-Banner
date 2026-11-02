# Prompt vẽ lại biểu tượng nghề Xạ thủ

> Cập nhật: 02/11/2026
> Trạng thái: **IMPLEMENTED** (02/11/2026) — Shan thấy biểu tượng cũ (ba mũi phi tiêu xòe, cán quấn dây xanh) khó phân biệt với Sát thủ (hai dao găm bắt chéo). Ảnh mới (cung tre và mũi tên) do Shan tạo từ prompt dưới đây đã thay `public/art/professions/xaThu.webp`.

## Vì sao phải đổi

Biểu tượng nghề hiện nhỏ ở huy hiệu quân (cỡ khoảng 11–24 px), nên chỉ **hình dáng ngoài (silhouette)** còn đọc được. Ba mũi nhọn xòe của Xạ thủ và hai lưỡi bắt chéo của Sát thủ đều là "vài vật nhọn kim loại chéo nhau", nên lẫn. Biểu tượng mới phải có silhouette khác hẳn: **một vòng cung cong dọc kèm một mũi tên**, không có lưỡi dao, không bắt chéo hình chữ X.

| Nghề | Silhouette | Màu nhấn |
|---|---|---|
| Sát thủ (giữ nguyên) | Hai dao găm bắt chéo, chữ X | Tím |
| Tướng sĩ | Một thanh kiếm thẳng đứng | Đỏ |
| Binh lính | Khiên tròn và giáo chéo | Đồng |
| **Xạ thủ (mới)** | **Cung tre cong dọc, dây căng, một mũi tên nằm ngang qua giữa cung** | **Xanh lục / xanh ngọc, giữ màu cũ của nghề** |

## Prompt (dán thẳng vào công cụ tạo ảnh)

```
A single game icon of a bamboo recurve bow with one arrow nocked and drawn, for a Vietnamese historical fantasy match-3 game. The bow is a tall curved bamboo bow standing vertically, dark-stained bamboo with golden bronze fittings at the grip and the two limb tips, grip wrapped in teal-green cloth with a small bronze medallion, taut silk string. One slender arrow with a bright steel arrowhead and white-teal feather fletching lies horizontally across the center of the bow, pointing to the right, string pulled back slightly. Strong readable silhouette: a tall vertical arc plus one horizontal arrow forming a clear "D" shape, NOT crossed blades, NO daggers, NO knives, NO X shape, NO multiple spikes.
Style: hand-painted 2D game item icon, glossy painted metal and polished bamboo, soft rim light from top-left, subtle dark outline, rich saturated colors, same rendering style as a set of fantasy weapon icons (one sword icon, one round shield with spear icon, one pair of crossed daggers icon). Centered, filling about 90% of a square frame, 1:1, slightly tilted at most 10 degrees.
Background: one flat solid plain light grey color #F2F2F2, completely uniform, no checkerboard pattern, no gradient, no ground shadow, no glow around the object, no text, no watermark.
```

**Negative prompt** (nếu công cụ có): `daggers, knives, crossed blades, X shape, multiple arrowheads, three spikes, checkerboard, transparent-looking background, shadow on floor, text, frame, hands, person`.

## Sau khi có ảnh

1. Tạo ảnh vuông 1024×1024, nền phẳng một màu (không dùng nền caro vẽ sẵn: công cụ tạo ảnh thường chỉ vẽ họa tiết caro chứ không cho alpha thật).
2. Cắt nền thành trong suốt bằng `scripts/cutout-formation-icon.py` (cần Pillow, numpy, scipy). Prompt dùng nền xám sáng phẳng (#F2F2F2) vì script cắt các điểm sáng, ít bão hòa, liền với mép ảnh; lệnh: `python3 scripts/cutout-formation-icon.py <ảnh vào> public/art/professions/xaThu.webp 128`. Lông vũ trắng của mũi tên nằm trong viền tối nên không bị cắt nhầm; nếu có, hạ ngưỡng sáng (tham số thứ 4, mặc định 205) hoặc cho lông vũ màu xanh ngọc.
3. Lưu `public/art/professions/xaThu.webp` (128×128, WebP, nền trong suốt) thay tệp cũ. `ProfessionIcon` và huy hiệu quân tự dùng ảnh mới.
4. Kiểm tra ở cỡ nhỏ nhất (khoảng 12 px) và đặt cạnh biểu tượng Sát thủ: nhìn ngay phải phân biệt được.

## Đã tích hợp

Ảnh gốc là cung dựng dọc, chiếm khung vuông rất ít và nét cung tối khó đọc trên nền huy hiệu tối. Đã cắt nền bằng `scripts/cutout-formation-icon.py` với **xoay 40° ngược chiều kim đồng hồ** (cung nằm chéo như ngọn giáo của Binh lính, đầy khung hơn) và **viền sáng 2 px** (#E4CC99, giữ dây cung và thân cung đọc được ở 12–24 px):

```bash
python3 scripts/cutout-formation-icon.py <ảnh gốc> public/art/professions/xaThu.webp 128 205 40 2
```

Ở cỡ 12–24 px, hình cung chéo và mũi tên khác rõ với chữ X của dao găm Sát thủ. Biểu tượng này cũng hiện ở mọi nơi dùng `ProfessionIcon` (huy hiệu quân, danh sách nhân vật, trang bị).
