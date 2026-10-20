# Nguyễn Bặc — hình động trong trận

- Roster: `nguyenBac`, tướng sĩ Hỏa; không sửa `src/core/`.
- Thư mục: `public/art/characters/nguyenBac/`.
- **12 WebP, 329.886 byte** (329,9 KB thập phân), gồm hai tranh kỹ năng và avatar; dưới 350 KB.
- Dùng bộ dựng `warrior.ts` có sẵn của Trần Cương/Đinh Bộ Lĩnh: tay cầm đao và đao cùng xoay quanh vai; giáp vai cố định che mối nối. Kỹ năng thường dùng tranh ra chiêu, ô 5 dùng tranh tuyệt chiêu.

## Giữ đúng thiết kế gốc

Bản trước dùng mảnh phục dựng và co giãn riêng từng phần nên sai tỷ lệ thân, đầu và tay. Bản hiện tại thay toàn bộ lớp đứng bằng **pixel RGB từ ảnh đứng gốc 1024×1536** của Shan. Imagegen tích hợp chỉ cung cấp alpha tách nền; không dùng RGB được AI vẽ lại. Không lật tay, không dịch hoặc co giãn riêng bộ phận.

Các lớp cắt theo tọa độ nguồn, rồi thu nhỏ đồng đều 0,5× để xuất WebP. Vị trí và kích thước mỗi lớp lưu trong `nguyen-bac-boxes.json`; test đối chiếu metadata này với rig và kích thước WebP. Bộ cắt kiểm tra rằng ráp các lớp trước nén cho ảnh giống từng pixel hiển thị với ảnh nguồn đã gắn alpha, trên cùng nền xám.

| Điểm | x | y |
|---|---:|---:|
| Vai tay cầm đao, dưới tay áo | 411 | 470 |
| Khuỷu tay không | 850 | 525 |
| Cổ | 598 | 245 |
| Giữa chân, mặt sân | 620 | 1518 |
| Chuôi đao / đầu lưỡi | 295 / 20 | 825 / 1350 |

Tọa độ đều trong khung nguồn 1024×1536, không phải pixel WebP. Khớp vai trước đây đặt ở x=550 làm cánh tay xoay lệch vào thân; nay khớp và lớp tay cùng lấy trực tiếp từ ảnh gốc. Đầu, áo, chân và vũ khí cũng giữ tỷ lệ nguồn.

## Tái xuất

Cần Pillow, ảnh nguồn `nguyễn bặc.png` và ảnh tách nền có alpha đúng khung nguồn:

```sh
python3 scripts/art/nguyen_bac.py '/đường/dẫn/nguyễn bặc.png' '/đường/dẫn/alpha.png'
```

Script từ chối ảnh khác kích thước 1024×1536, cắt lớp, kiểm tra ảnh ráp, ghi WebP và metadata. Sau khi đổi đường cắt phải đồng bộ PartBox trong `rigs.ts`; test sẽ bắt tọa độ không khớp.

Prompt alpha cuối, dùng công cụ imagegen tích hợp:

> Use case: background-extraction. Edit ONLY the background of this exact image, producing a faithful transparent cutout of the entire Nguyen Bac standing warrior. Preserve EXACT original 1024x1536 canvas and pixel locations, silhouette, anatomical proportions, stance, face, clothing, all red cape and hair ribbons, white feathers, BOTH arms and hands and complete sword. Do not reposition, resize, crop, rotate, mirror, recompose, stylize or redraw anything. Remove the gradient background to genuine alpha including the gaps between legs and between arms and torso, with crisp clean edges. No floor shadow. One single intact original figure, no parts sheet. Exact registration to source image is essential for cutting animation layers at source coordinates.

Hai tranh hành động từ `nguyenbacrachieu.png` và `nguyenbactuyetchieu.png` do Shan cung cấp, đã tách nền bằng imagegen tích hợp và xuất WebP. Prompt tương ứng yêu cầu chỉ xóa nền, giữ nguyên nhân vật, khuôn mặt, tư thế, đao, vải đỏ và bông lau, đầu đao và giày hiện đầy đủ, alpha thật, không vẽ lại.

## Kiểm tra và giới hạn

Đã so sánh ba rig ở cùng cỡ và cùng góc lấy đà/chém trong Pixi thực tế, đồng thời kiểm tra đứng/đánh thường/ra chiêu/tuyệt chiêu ở `/game/practice` khung 844×390. Không tràn ngang, các ảnh nhân vật tải thành công. Console có lỗi `/favicon.ico` thiếu sẵn của repo.

Chân giữ liền thân; hoạt ảnh là rối cắt mảnh và đổi tranh bằng crossfade. Vải uốn nhẹ vì ảnh phẳng không có đầy đủ phần vải bị tay/đao che. Nền alpha do AI phân đoạn có thể mất các sợi rất mảnh. Chưa đo FPS trên điện thoại thật.

## Avatar

`portrait.webp`: 256×256, 26.436 byte, cắt đầu và vai từ vùng `(425, -20)–(855, 410)` của ảnh đứng gốc, mặt ở giữa. Dùng RGB gốc cùng alpha đã tách nền; không vẽ lại khuôn mặt. Thêm vào `PHOTOS` trong `portraits.tsx` theo cách Đinh Bộ Lĩnh để mọi nơi dùng `Portrait` nhận ảnh này; nhân vật chưa có ảnh tiếp tục dùng SVG. Đã kiểm tra bảng đội trong trận, màn chờ, hồ sơ và cửa hàng bằng hồ sơ thử có Nguyễn Bặc.
