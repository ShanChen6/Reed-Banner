# Nguyễn Bặc — hình động trong trận

- Roster: `nguyenBac`, tướng sĩ Hỏa; không sửa `src/core/`.
- Thư mục: `public/art/characters/nguyenBac/`.
- **14 WebP, 316.904 byte** (316,9 KB thập phân), gồm avatar, ảnh đứng xem thử, hai tranh kỹ năng và tranh gục; dưới 350 KB.
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

Dự án không giữ file Python. Khi cần tái xuất, cắt lớp từ ảnh nguồn `nguyễn bặc.png` (1024×1536) cùng ảnh tách nền có alpha đúng khung nguồn, theo tọa độ trong `nguyen-bac-boxes.json`, chạy Python nội tuyến (`python3 - <<'EOF' ... EOF`) như quy ước ở `docs/design/19-codex-do-hoa.md`: từ chối ảnh khác kích thước, cắt lớp, kiểm tra ảnh ráp, ghi WebP và metadata. Sau khi đổi đường cắt phải đồng bộ PartBox trong `rigs.ts`; test sẽ bắt tọa độ không khớp.

Prompt alpha cuối, dùng công cụ imagegen tích hợp:

> Use case: background-extraction. Edit ONLY the background of this exact image, producing a faithful transparent cutout of the entire Nguyen Bac standing warrior. Preserve EXACT original 1024x1536 canvas and pixel locations, silhouette, anatomical proportions, stance, face, clothing, all red cape and hair ribbons, white feathers, BOTH arms and hands and complete sword. Do not reposition, resize, crop, rotate, mirror, recompose, stylize or redraw anything. Remove the gradient background to genuine alpha including the gaps between legs and between arms and torso, with crisp clean edges. No floor shadow. One single intact original figure, no parts sheet. Exact registration to source image is essential for cutting animation layers at source coordinates.

Hai tranh hành động từ `nguyenbacrachieu.png` và `nguyenbactuyetchieu.png` do Shan cung cấp, đã tách nền bằng imagegen tích hợp và xuất WebP. Prompt tương ứng yêu cầu chỉ xóa nền, giữ nguyên nhân vật, khuôn mặt, tư thế, đao, vải đỏ và bông lau, đầu đao và giày hiện đầy đủ, alpha thật, không vẽ lại.

## Kiểm tra và giới hạn

Đã so sánh ba rig ở cùng cỡ và cùng góc lấy đà/chém trong Pixi thực tế, đồng thời kiểm tra đứng/đánh thường/ra chiêu/tuyệt chiêu ở `/game/practice` khung 844×390. Không tràn ngang, các ảnh nhân vật tải thành công. Console có lỗi `/favicon.ico` thiếu sẵn của repo.

Chân giữ liền thân; hoạt ảnh là rối cắt mảnh và đổi tranh bằng crossfade. Vải uốn nhẹ vì ảnh phẳng không có đầy đủ phần vải bị tay/đao che. Nền alpha do AI phân đoạn có thể mất các sợi rất mảnh. Chưa đo FPS trên điện thoại thật.

## Avatar

`portrait.webp`: 256×256, 26.436 byte, cắt đầu và vai từ vùng `(425, -20)–(855, 410)` của ảnh đứng gốc, mặt ở giữa. Dùng RGB gốc cùng alpha đã tách nền; không vẽ lại khuôn mặt. Thêm vào `PHOTOS` trong `portraits.tsx` theo cách Đinh Bộ Lĩnh để mọi nơi dùng `Portrait` nhận ảnh này; nhân vật chưa có ảnh tiếp tục dùng SVG. Đã kiểm tra bảng đội trong trận, màn chờ, hồ sơ và cửa hàng bằng hồ sơ thử có Nguyễn Bặc.

## Trang xem thử

Mở `/demo/characters?id=nguyenBac` để thử Đứng, Đánh thường, Ra chiêu, Tuyệt chiêu, Trúng đòn, Hồi máu và Bị hạ gục, hoặc Phát lần lượt. Có cỡ trong trận/cỡ lớn, chọn bốn nhân vật có rig, năm ảnh đối chiếu và dung lượng từng file. Trang công khai, không đọc hồ sơ, không gọi API. Dữ liệu dung lượng đọc từ file lúc dựng trang.

Nhân vật cũ thiếu ảnh riêng hiển thị SVG/ảnh ghép rig hoặc ghi rõ chưa có tranh; không tạo tranh thay thế. Đổi nhân vật hoặc bấm nút khác hủy chuỗi đang phát, tháo canvas cũ và trả trạng thái về đứng.

## Tranh gục và ngân sách

`nguyenbacguc.png` có nền ô vuông vẽ sẵn. Imagegen tích hợp cung cấp alpha thật; RGB vẫn lấy từ ảnh gốc. `pose-ko.webp` có 35.780 byte, gắn vào `setDown` dùng chung với trận và trang xem thử. Ảnh chuyển dần sang tư thế gục và giữ tới khi được phục hồi. Các nhân vật chưa có tranh gục dùng động tác rig cũ.

Ba tranh hành động thu nhỏ đều về 1/3 nguồn; mỗi `PoseArt` khai báo `texScale=1/3` để giữ nguyên cỡ người và vị trí trong trận. Ảnh đứng đối chiếu 360×540 có 43.956 byte, chỉ dùng trên trang xem thử. Rig trong trận tải 246.512 byte; tổng tất cả file của Nguyễn Bặc là 316.904 byte, dưới 350 KB. Avatar vẫn 256×256, 26.436 byte.

Tái xuất ba tranh cũng bằng Python nội tuyến: lấy RGB từ tranh gốc, ghép alpha đã tách, thu nhỏ 1/3 rồi ghi WebP. Prompt alpha cho tranh gục:

> Use case: background-extraction. Remove ONLY the painted gray-white checkerboard background from this defeated kneeling Nguyen Bac warrior. Produce genuine transparent alpha, not a painted checkerboard. Preserve EXACT original 1536x1024 canvas and all pixel locations: full kneeling body, face, hands, armor, white feathers, flowing red fabric, entire sword including tip. Do not crop, reposition, rescale, mirror, redraw or change proportions. Clean edges and transparent gaps. No added effects, floor or shadow. Exact source registration is required: alpha will be applied to ORIGINAL RGB pixels.
