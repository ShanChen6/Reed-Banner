# Nguyễn Bặc — hình động trong trận

- Roster: `nguyenBac`, tướng sĩ hệ Hỏa; không sửa `src/core/`.
- Asset: `public/art/characters/nguyenBac/`, 13 WebP, **334.792 byte** (334,8 KB thập phân; 327 KiB), gồm cả hai tranh tư thế. Sáu bản sao cùng nhân vật dùng chung texture; ngay cả tính sáu lần cũng dưới 3 MB ảnh nhân vật.
- Rig: hệ tọa độ ráp 1024×1536, texture 0,5×; khớp vai, khuỷu hai tay và cổ. Áo choàng, khăn, vạt áo và bông lau dùng lưới gió.
- Đánh thường dùng rig; kỹ năng thường dùng `pose-cast`, ô 5 dùng `pose-ultimate` qua director hiện có.
- Luyện tập đặt Nguyễn Bặc trong đội Tianwu để mở `/game/practice` là thấy ngay.

## Nguồn và xử lý

Ba ảnh do Shan cung cấp: `nguyễn bặc.png`, `nguyenbacrachieu.png`, `nguyenbactuyetchieu.png`. Dùng công cụ imagegen tích hợp, sau đó cắt ô, ráp tọa độ và xuất WebP bằng Pillow. Không dùng API CLI.

Bộ prompt cuối (cùng các ảnh nguồn tương ứng):

1. “Edit supplied warrior into isolated puppet parts on transparent alpha. Preserve exact face, clothes, painting style. 4 columns by 3 rows grid, no labels, each part inside own cell with generous margins. Row1: (1) torso plus legs and boots, no head arms sword cape sash; reconstruct hidden armor (2) head neck and hair bun, no trailing ribbons (3) left-image upper arm and shoulder armor (4) left-image forearm and gripping hand. Row2: (1) whole sword including handle no hand (2) right-image upper arm shoulder armor (3) right-image forearm and empty hand (4) red front sash. Row3: (1) flowing red cape (2) hair ribbons (3) white belt feathers (4) empty. Keep each piece original standing orientation, extend hidden elbow and shoulder joints for overlap. Pieces separate, no overlap between cells. Absolutely transparent background, no text, no extra objects.”
2. “Use case: background-extraction. Edit target: supplied Nguyen Bac sword attack illustration. Remove ONLY the entire gradient background, make genuinely transparent alpha. Preserve exact full character, face, pose, sword, all flowing red fabric and white feathers. Crisp clean cutout edges, no glow, no floor shadow, no background residue. Entire sword tip and boots visible. Do not redraw or redesign.”
3. “Use case: background-extraction. Edit target: supplied Nguyen Bac ultimate sword illustration. Remove ONLY the entire gradient background, make genuinely transparent alpha. Preserve exact full character, shouting face, pose, raised sword, all flowing red fabric and white feathers. Crisp clean cutout edges, no glow, no floor shadow, no background residue. Entire sword tip and boots visible. Do not redraw or redesign.”

## Hạn chế

Mảnh được phục dựng từ ảnh phẳng bằng AI, không phải PSD tác giả: một số hoa văn, tỉ lệ thân và phần bị che khác ảnh đứng gốc. Tay có khớp khuỷu riêng nhưng chân giữ liền thân; chuyển động là rối cắt mảnh, hai tranh hành động đổi bằng crossfade, không phải hoạt ảnh vẽ từng khung. Vải chỉ uốn nhẹ để tránh lộ đường nối. Ngân sách trên là ảnh Nguyễn Bặc; không bao gồm JavaScript, âm thanh hoặc các tài sản khác của toàn trang.
