# Nguyễn Bặc — hình động trong trận

- Roster: `nguyenBac`, tướng sĩ hệ Hỏa; không sửa `src/core/`.
- Asset: `public/art/characters/nguyenBac/`, 15 WebP, **335.442 byte** (335,4 KB thập phân; 327,6 KiB), gồm cả hai tranh tư thế. Sáu bản sao cùng nhân vật dùng chung texture; ngay cả tính sáu lần cũng dưới 3 MB ảnh nhân vật.
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

## Sửa hướng tay

Hai tay được tách lại thành cánh tay hoàn chỉnh đúng hướng ảnh nguồn, sau đó chia ở khuỷu với vùng chồng 40 px. Không lật riêng bắp tay hay bàn tay. Chỉnh lại vị trí đao để chuôi nằm trong bàn tay phải.

Prompt sửa (imagegen tích hợp, ảnh đứng gốc làm đầu vào):

“Extract ONLY the two complete arms of this exact warrior as isolated transparent cutouts, side by side, preserving original anatomical handedness and original orientation. LEFT HALF: his anatomical RIGHT arm, the arm on viewer's LEFT in the source, including its shoulder armor, sleeve, exposed upper arm, elbow, bracer and gripping hand. Remove the sword but keep the hand curled exactly as in source, ready to grip the handle, correct thumb orientation. The shoulder is at upper right, hand at lower left, arm slants down toward left. RIGHT HALF: his anatomical LEFT arm, on viewer's RIGHT in source, from shoulder armor through sleeve upper arm elbow bracer to relaxed open hand. Shoulder upper left, hand lower right, slants down right. Keep BOTH arms as they actually appear in source, DO NOT MIRROR either arm. No sword, torso, head, cape, background, labels or other objects. Both arms complete shoulder-to-fingertips, side by side with ample transparent separation and margins, true alpha. Match source colors and illustration, correct elbows, hands and thumbs, no duplicate hands.”

## Hiệu chỉnh tọa độ khớp

Tọa độ dưới đây dùng hệ ráp 1024×1536, không phải pixel WebP 0,5×. Giáp vai là hai lớp `shoulder`/`shoulderR` cố định trên thân; bắp tay xoay phía dưới, có vùng chồng với giáp và cẳng tay.

| Khớp | x | y | Vùng chồng của các lớp |
|---|---:|---:|---|
| Vai tay cầm đao | 550 | 420 | bắp tay y=400–546, giáp vai y=260–460 |
| Khuỷu tay cầm đao | 495 | 525 | bắp tay và cẳng tay y=505–546 |
| Vai tay không | 800 | 410 | bắp tay y=390–546, giáp vai y=250–450 |
| Khuỷu tay không | 870 | 525 | bắp tay và cẳng tay y=505–546 |
| Cổ | 685 | 280 | đầu và thân |

Đã kiểm tra cây container Pixi thực tế ở cỡ lớn, cả lúc đứng và góc chém −0,95 rad cùng khuỷu −0,114 rad. Test tự động kiểm tra khớp nằm trong vùng chồng và kích thước từng WebP khớp PartBox/texScale, tránh cắt lớp mà quên cập nhật tọa độ.
