# Hình ảnh & yêu cầu cho họa sĩ

> Cập nhật: 19/10/2026

File này có hai phần. Phần 1 ghi phong cách của bộ hình dựng bằng code (SVG) đang dùng trong game. Phần 2 là **bản yêu cầu gửi họa sĩ** (hoặc dùng làm đầu vào cho công cụ AI vẽ ảnh) cho phần code không vẽ được: chân dung nhân vật và hình trang bị.

## 1. Bộ hình dựng bằng code

- Toàn bộ ô cờ, 7 ô đặc biệt mỗi bản, biểu tượng 7 nguyên tố, cờ lau thủ lĩnh, lương thực, khiên và khung giao diện được vẽ bằng SVG trong `src/app/demo/art/`.
- Xem toàn bộ tại trang `/demo/art`.
- **Phong cách:** lấy cảm hứng từ tranh khắc gỗ dân gian và hoa văn trống đồng Đông Sơn: nét mực đậm, mảng màu phẳng, gần như không đổ bóng (tối đa một mảng sáng nhẹ ở mép trên).
- **Đọc được bàn cờ:** mỗi loại ô khác nhau cả màu nền, độ sáng lẫn hình vẽ, để người khó phân biệt màu vẫn chơi được.
- **Ô đặc biệt:** bản yếu có khung vuông bằng đồng với đinh tán bốn góc; bản mạnh có vòng tròn vàng tỏa tia như mặt trời giữa mặt trống đồng và tỏa sáng nhẹ. Hai bản khác nhau về hình dạng chứ không chỉ về màu.
- Phẩm trang bị (khung màu Trắng, Lục, Lam, Tím, Cam) cũng sẽ vẽ bằng code, nên họa sĩ **không** vẽ khung.

### Bảng màu

| Vai trò | Mã màu |
|---|---|
| Mực (nét viền) | `#2b1d14` |
| Giấy (mảng sáng) | `#f6ecd4` |
| Vàng đồng (viền khung, hoa văn) | `#d4a24c` (nền tối), `#b8862f` (nền sáng) |
| Sơn mài (khung bàn cờ) | `#5a1e14` (nền tối), `#7a2c1d` (nền sáng) |
| Nền trang | `#17110e` (tối), `#f3ebdc` (sáng) |

| Nguyên tố | Kim | Mộc | Thủy | Hỏa | Thổ | Lôi | Phong |
|---|---|---|---|---|---|---|---|
| Màu | `#9ea4ad` | `#4f9a4a` | `#2f7fc1` | `#d9502a` | `#a5772f` | `#7d55c7` | `#2e9e90` |

| Ô | Kiếm | Âm dương | Bánh chưng | Tim | Thỏi vàng | Sách | Trống trận |
|---|---|---|---|---|---|---|---|
| Màu nền | `#c0392b` | `#5b4a9e` | `#a7cf74` | `#f3b3c3` | `#5e3b1f` | `#2f5f9f` | `#1f7a6d` |

## 2. Bản yêu cầu cho họa sĩ

### 2.1 Bối cảnh

Cờ Lau là game match-3 chiến đấu theo lượt, lấy bối cảnh Loạn 12 Sứ Quân ở Việt Nam thế kỷ X. Người chơi là Đinh Bộ Lĩnh, từ cậu bé chăn trâu cầm cờ lau tập trận tới khi dẹp loạn và lên ngôi. Game chạy trên trình duyệt, cả máy tính lẫn điện thoại xoay ngang.

### 2.2 Phong cách

- Hợp với bộ hình SVG ở phần 1: **nét viền mực đậm, màu phẳng**, một tông bóng là đủ, gợi tranh khắc gỗ dân gian. Không vẽ kiểu ảnh thật, không 3D, không anime mắt to.
- Dùng bảng màu ở phần 1. Mỗi nhân vật có **một màu chủ đạo theo nguyên tố** của họ (khăn, đai, viền áo), phần còn lại là tông đất, chàm, nâu, đỏ son.
- **Trang phục thế kỷ X:** áo giao lĩnh (cổ chéo), khăn chít đầu hoặc búi tóc, chân quấn xà cạp hoặc đi đất; giáp vảy hoặc giáp da cho tướng. Tránh trang phục triều Nguyễn (áo dài năm thân, khăn xếp), tránh kiểu tóc và giáp nhà Thanh, tránh giáp kiểu Nhật.
- Họa tiết nên lấy từ trống đồng Đông Sơn (chim Lạc, sóng nước, răng cưa, vòng tròn đồng tâm) và mây cuộn.

### 2.3 Nguyên tắc clean-room (bắt buộc)

- Không tham khảo, đồ lại hay phối lại hình của bất kỳ game nào, kể cả các game *Loạn 12 Sứ Quân* cũ và bản mới.
- Dùng công cụ AI thì không ghi tên họa sĩ hay tên game khác trong câu lệnh, và điều khoản của công cụ phải cho dùng thương mại.
- Bên vẽ chuyển **toàn bộ quyền sử dụng thương mại** cho chủ dự án, kèm file gốc nhiều lớp (PSD, Krita hoặc SVG).

### 2.4 Danh sách hình

**Chân dung nhân vật** (ưu tiên theo thứ tự)

| # | Nhân vật | Mô tả |
|---|---|---|
| 1 | Đinh Bộ Lĩnh (thiếu niên) | Cậu bé chăn trâu, cầm cờ lau, ánh mắt cứng cỏi. Dùng cho các màn đầu chiến dịch |
| 2 | Đinh Bộ Lĩnh (tướng quân) | Thanh niên mặc giáp, thần thái thủ lĩnh. Đây là hình chính trong trận |
| 3 | Đinh Bộ Lĩnh (hoàng đế) | Áo bào, mũ miện đơn giản. Dùng cho đoạn kết |
| 4–8 | 5 nhân vật kèm | Hà Vân (Pháp sư, Hỏa), Lê Thạch (Binh lính, Thổ), Mai Thanh (Y sư, Thủy), Tô Kim (Mưu sĩ, Kim), Phùng Phong (Quân sư, Phong). Nhân vật hư cấu; nghề nhìn ra được qua trang phục và đồ cầm tay |
| 9+ | 12 sứ quân (trùm chiến dịch) | Nhân vật lịch sử. Danh sách và thứ tự lấy theo docs chiến dịch khi chốt; mỗi người một nét riêng (tuổi, dáng, vũ khí) |

Mỗi nhân vật cần hai hình:

| Hình | Kích thước gốc | Hiển thị trong game | Ghi chú |
|---|---|---|---|
| Chân dung bán thân | 1024×1024 px | 48–128 px trên thẻ nhân vật | Từ ngực trở lên, mặt nhìn 3/4, đầu chiếm khoảng 45% chiều cao. Phải đọc được ở 48 px |
| Toàn thân đứng trận | 1024×1536 px | khoảng 160–320 px cao, hai bên bàn cờ | Nhân vật bên trái quay mặt sang phải; game tự lật cho phe đối thủ. Đứng trên một đường nền chung cách đáy 5% |

**Hình trang bị**

- 9 loại ô trang bị theo [Trang bị](07-trang-bi.md#1-chín-ô-trang-bị): vũ khí, đính mão, y phục, hộ thủ, bảo ngoa, giới chỉ, hạng liên, hộ phù, ngọc bội.
- Vũ khí riêng cho 6 nghề: Tướng sĩ (đao, kiếm), Pháp sư (pháp trượng), Binh lính (giáo, khiên), Y sư (hồ lô thuốc), Mưu sĩ (quạt), Quân sư (thẻ tre, cờ lệnh).
- Mỗi loại cần 7 biến thể theo nguyên tố (đổi màu chủ đạo và một chi tiết hoa văn). Đợt đầu: 1 biến thể Mộc cho mỗi loại, tổng 15 hình.
- Kích thước gốc **512×512 px**, hiển thị 48–96 px. Vật đặt giữa, chừa lề khoảng 8%, chiếu nghiêng 3/4 nhẹ, không nền, không khung (khung phẩm màu do code vẽ).

### 2.5 Định dạng giao hàng

- PNG nền trong suốt, hệ màu sRGB, kèm file gốc nhiều lớp.
- Tên file theo mã nhân vật trong code, ví dụ `dinhBoLinh-thieuNien-chanDung.png`, `haVan-toanThan.png`, `vuKhi-tuongSi-moc.png`.
- Giao trước một bản phác (đen trắng) của Đinh Bộ Lĩnh tướng quân để duyệt phong cách, rồi mới vẽ tiếp.

> TODO: chọn người vẽ hoặc công cụ AI, ngân sách và thời điểm (khi gameplay đã ổn); chốt danh sách 12 sứ quân theo thứ tự chiến dịch.
