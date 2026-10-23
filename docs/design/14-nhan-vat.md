# Danh sách nhân vật

> Cập nhật tiếp theo: [kỹ năng phiên bản 2 và combo đồng đội](21-combo-dong-doi.md). Layout mới đổi tuyệt chiêu sang ô 4, nghề nâng cao sang ô 5, có chuyển hồ sơ giữ điểm. Các định nghĩa legacy/lịch sử bên dưới cần đọc cùng tài liệu phiên bản 2.

> Cập nhật: 20/10/2026
>
> Danh sách đầy đủ mọi nhân vật chơi được: Đinh Bộ Lĩnh, 42 tướng thường, 6 tướng lịch sử và 12 sứ quân. Luật chung về nghề, nội tại và cách dùng kỹ năng ở [Nhân vật, nghề & kỹ năng](06-nhan-vat-ky-nang.md); bộ kỹ năng hiện hành ở [Cải tổ kỹ năng](20-cai-to-ky-nang.md). Tên nhân vật hư cấu và tên chiêu do Claude tự đặt (clean-room), số liệu đã qua mô phỏng `pnpm sim -- --roster` ngày 20/10/2026 (mục 8), chờ Shan duyệt. Dữ liệu nằm trong `src/core/roster/roster.ts` và `src/core/battle/skills.ts`.

## 1. Khung chung của nhân vật kèm

Từ 22/10/2026 mọi nhân vật chơi được dùng **3 kỹ năng nghề + 2 kỹ năng hệ + 1 tuyệt chiêu riêng**. Thiết kế và danh sách ở [Cải tổ kỹ năng](20-cai-to-ky-nang.md). Cùng hệ nhưng khác nghề có 3 chiêu khác nhau.

| Ô | Vai trò | Mở ở cấp |
|---|---|---|
| 1 | Nghề cơ bản | 1 |
| 2 | Hệ bàn cờ | 1 |
| 3 | Nghề chính | 5 |
| 5 | Tuyệt chiêu riêng | 10 |
| 4 | Nghề chiến thuật | 15 |
| 6 | Hệ bổ trợ | 20 |

- **Nâng kỹ năng:** khóa theo ô `o1`–`o6`, giá điểm như nhân vật chính ([Tiến trình](08-tien-trinh-kinh-te.md#11-số-liệu-điểm-xuất-phát-19102026)). Mỗi cấp kỹ năng +10% hệ số chính, cấp 5 giảm 10% năng lượng.
- Bộ nghề mới ở ô 1/3/4; không mua nhánh. Bộ nghề cũ chỉ dùng cho tùy tướng AI chiến dịch (mục 7).
- **Kỹ năng bị động** theo hệ chỉ có tác dụng khi nhân vật làm thủ lĩnh. Thủ lĩnh phe người chơi luôn là Đinh Bộ Lĩnh, nên với người chơi bị động của nhân vật kèm không dùng tới; đội AI lấy người vị trí 1 làm thủ lĩnh.
- **Chỉ số gốc theo nghề**, +3% mỗi cấp trên 1:

| Nghề | Máu | ATK | DEF |
|---|---|---|---|
| ⚔️ Tướng sĩ | 500 | 55 | 10 |
| ☯️ Pháp sư | 450 | 55 | 8 |
| 🍙 Binh lính | 600 | 45 | 15 |
| ❤️ Y sư | 475 | 45 | 10 |
| 💰 Mưu sĩ | 475 | 50 | 10 |
| 📖 Quân sư | 475 | 50 | 10 |

- **Ba nhóm nhân vật kèm:**

| Nhóm | Số người | Có được | Ô 5 |
|---|---|---|---|
| Tướng thường | 42 (5 khởi đầu + 37 ở cửa hàng) | Có sẵn hoặc mua 1 500 / 3 000 vàng | Tuyệt chiêu, 100 năng lượng |
| Tướng lịch sử | 6 | Gia nhập khi qua màn chiến dịch lần đầu, không bán | Chiêu riêng, 100 năng lượng |
| Sứ quân | 12 | Mở bán ở cửa hàng sau khi qua màn có sứ quân đó, 3 000 vàng | Chiêu riêng, 60 năng lượng (Đỗ Cảnh Thạc 80) |

- Mua về hoặc gia nhập đều vào hồ sơ: mua ở cấp 1, tướng lịch sử gia nhập ở cấp của màn với đủ điểm kỹ năng để tự nâng.
- **Vai trò ô 5 theo nghề** (khung chung khi đặt tuyệt chiêu; sắc thái lấy từ hệ):

| Nghề | Ô 5 thường làm gì | Sắc thái theo hệ (ví dụ) |
|---|---|---|
| Tướng sĩ | Dồn 240–300% ATK vào 1 đối thủ | Kim xuyên giáp, Mộc hút máu, Thủy đóng băng, Hỏa thiêu đốt, Thổ Khiên bản thân, Lôi xuyên Khiên và trừ năng lượng, Phong tự xoay lốc xoáy |
| Pháp sư | 110–150% ATK vào cả đội đối thủ | Kim giảm Thủ, Mộc hút máu, Thổ tăng Thủ đội mình, Phong Xua tan và tự xoay lốc xoáy |
| Binh lính | Khiêu khích, Khiên, Phản đòn | Thủy đóng băng, Hỏa thiêu đốt kẻ đánh, Lôi trừ năng lượng, Phong cho năng lượng đội mình |
| Y sư | Hồi 18–30% máu cả đội | Kim tăng Thủ, Hỏa tăng Công, Thổ thêm Khiên, Lôi cho năng lượng |
| Mưu sĩ | Trừ năng lượng, lương, Câm lặng | Mộc hồi phục đội mình, Thổ phá ô, Lôi đánh thêm sát thương, Phong Xua tan và tự xoay lốc xoáy |
| Quân sư | Giảm Công/Thủ đối thủ hoặc tăng đội mình | Kim phá giáp, Mộc hồi phục, Thủy đóng băng, Hỏa thiêu đốt |

## 2. Hai kỹ năng theo hệ

Mỗi hệ có chiêu bàn cờ ô 2 và bổ trợ ô 6; danh sách, giá và cơ chế đầy đủ ở [20 §14 chiêu hệ](20-cai-to-ky-nang.md#14-chiêu-hệ). Bị động thủ lĩnh giữ nguyên. Ô 5 mặc định của hệ chỉ Đinh Bộ Lĩnh dùng; nhân vật kèm thay bằng kỹ năng riêng ở các bảng dưới.

## 3. Đinh Bộ Lĩnh

Nhân vật chính, luôn ra trận và luôn là thủ lĩnh phe người chơi. Chọn nghề (6) và hệ (7) trước mỗi trận, nên có 42 cách dựng; mang 3 chiêu nghề, 2 chiêu hệ, ô 5 mặc định theo hệ và bị động thủ lĩnh. Chi tiết ở [Nhân vật, nghề & kỹ năng](06-nhan-vat-ky-nang.md#2-nhân-vật-chính-đinh-bộ-lĩnh).

## 4. Tướng thường

42 nhân vật hư cấu, **mỗi tổ hợp nghề × hệ đúng một người**, để người chơi luôn tìm được người bù đúng hệ khắc chế hoặc đúng nghề mình thiếu. Tên không trùng 12 sứ quân hay tướng lịch sử.

### 4.1 Bảng nghề × hệ

| Nghề \ Hệ | ⚙️ Kim | 🌿 Mộc | 💧 Thủy | 🔥 Hỏa | ⛰️ Thổ | ⚡ Lôi | 🌪️ Phong |
|---|---|---|---|---|---|---|---|
| ⚔️ Tướng sĩ | Trần Cương | Lâm Tùng | Hồ Lãng | Lý Liệt | Kha Sơn | Tống Tấn | Hứa Lăng |
| ☯️ Pháp sư | Chu Ngân | Đàm Thảo | Đào Lam | **Hà Vân** | Doãn Nham | Vũ Lôi | Liễu Yên |
| 🍙 Binh lính | Cao Kiên | Hoàng Mộc | Thái Hà | Trương Viêm | **Lê Thạch** | Ông Chấn | Mạnh Tường |
| ❤️ Y sư | Châu Ngọc | Lục Diệp | **Mai Thanh** | Hồng Đan | Bế Liên | Tiêu Minh | Bạch Sương |
| 💰 Mưu sĩ | **Tô Kim** | Nhan Trúc | Quách Ẩn | Ninh Hỏa | Mã Nhạc | Từ Kinh | Bùi Phiêu |
| 📖 Quân sư | Nghiêm Thiết | Sầm Tuệ | Vi Triều | Tôn Diệm | Tạ Thạch | Mạc Vân | **Phùng Phong** |

In đậm là 5 người khởi đầu (có sẵn, đội 3vs3 mặc định là Hà Vân + Mai Thanh). Còn lại bán ở cửa hàng; trong mỗi nghề, người có từ trước (19/10/2026) giữ giá cũ, người mới chia đều hai mức giá. Giá chỉ là nhịp cày, không phải độ mạnh (mục 8).

### 4.2 Tuyệt chiêu (ô 5, 100 năng lượng)

**⚔️ Tướng sĩ**

| Nhân vật | Hệ | Giá | Tuyệt chiêu | Tác dụng |
|---|---|---|---|---|
| Trần Cương | Kim | 1 500 | **Kim Qua Thiết Mã** | 280% ATK 1 đối thủ, bỏ qua 40% Thủ; Thủ −30% 2 lượt |
| Lâm Tùng | Mộc | 1 500 | **Trúc Lâm Phá Trận** | 260% ATK 1 đối thủ, hút máu 30%; bản thân Hồi phục 5% 2 lượt |
| Hồ Lãng | Thủy | 1 500 | **Lãng Đào Trảm** | 260% ATK 1 đối thủ, 40% Đóng băng 1 lượt, −20 năng lượng |
| Lý Liệt | Hỏa | 3 000 | **Xích Hỏa Đoạt Kỳ** | 300% ATK 1 đối thủ, Thiêu đốt 15% ATK 3 lượt; phá chữ thập nhỏ |
| Kha Sơn | Thổ | 1 500 | **Sơn Hà Trấn Kích** | 250% ATK 1 đối thủ; bản thân Khiên 20% máu; phá chữ thập nhỏ |
| Tống Tấn | Lôi | 3 000 | **Lôi Đao Liên Trảm** | 270% ATK 1 đối thủ, xuyên Khiên, −30 năng lượng |
| Hứa Lăng | Phong | 3 000 | **Truy Phong Đoạt Mệnh** | 240% ATK 1 đối thủ; cả đội +15 năng lượng; tự xoay lốc xoáy tối đa 2 nấc |

**☯️ Pháp sư**

| Nhân vật | Hệ | Giá | Tuyệt chiêu | Tác dụng |
|---|---|---|---|---|
| Chu Ngân | Kim | 1 500 | **Ngân Châm Tán Xạ** | 120% ATK cả đội đối thủ, bỏ qua 30% Thủ; Thủ −20% 2 lượt |
| Đàm Thảo | Mộc | 1 500 | **Kinh Cức Triền Thân** | 110% ATK cả đội đối thủ, hút máu 25%; Công −15% 2 lượt |
| Đào Lam | Thủy | 1 500 | **Băng Hà Phong Tỏa** | 120% ATK cả đội đối thủ, mỗi người 35% Đóng băng 1 lượt; phá 8 ô ngẫu nhiên |
| Hà Vân | Hỏa | khởi đầu | **Hỏa Vũ Liệu Nguyên** | 150% ATK cả đội đối thủ, Thiêu đốt 15% ATK 2 lượt; phá vùng 3×3 |
| Doãn Nham | Thổ | 3 000 | **Địa Mạch Bùng Phát** | 130% ATK cả đội đối thủ; đội mình Thủ +15% 2 lượt; phá vùng 3×3 |
| Vũ Lôi | Lôi | 3 000 | **Thiên Lôi Giáng Thế** | 250% ATK 1 đối thủ, −30 năng lượng; phá 1 cột |
| Liễu Yên | Phong | 3 000 | **Phong Ấn Cuồng Lưu** | 110% ATK cả đội đối thủ, Xua tan; tự xoay lốc xoáy tối đa 2 nấc |

**🍙 Binh lính**

| Nhân vật | Hệ | Giá | Tuyệt chiêu | Tác dụng |
|---|---|---|---|---|
| Cao Kiên | Kim | 3 000 | **Thiết Bích Đồng Thành** | Bản thân Thủ +35% 3 lượt, Phản đòn 35% và Khiêu khích 2 lượt (giảm 20/10/2026 từ +50%/50%) |
| Hoàng Mộc | Mộc | 1 500 | **Rễ Già Giữ Thành** | Cả đội Hồi phục 6% máu/lượt 3 lượt; bản thân Khiên 25% và Khiêu khích 2 lượt |
| Thái Hà | Thủy | 1 500 | **Thủy Trại Liên Hoàn** | Cả đội Khiên 18% máu; bản thân Khiêu khích 2 lượt; mỗi đối thủ 25% Đóng băng |
| Trương Viêm | Hỏa | 1 500 | **Viêm Giáp Hộ Doanh** | Bản thân Khiên 25%, Khiêu khích và Phản đòn 30% 2 lượt; cả đội đối thủ Thiêu đốt 10% ATK 2 lượt |
| Lê Thạch | Thổ | khởi đầu | **Trấn Sơn Hộ Quân** | Cả đội Khiên 25% máu; bản thân Khiêu khích và Phản đòn 35% 2 lượt |
| Ông Chấn | Lôi | 3 000 | **Chấn Lôi Thiết Vệ** | Bản thân Thủ +40% và Khiêu khích 2 lượt; mỗi đối thủ −20 năng lượng |
| Mạnh Tường | Phong | 3 000 | **Phong Lũy Hộ Kỳ** | Cả đội Khiên 15% máu và +15 năng lượng; bản thân Khiêu khích 2 lượt |

**❤️ Y sư**

| Nhân vật | Hệ | Giá | Tuyệt chiêu | Tác dụng |
|---|---|---|---|---|
| Châu Ngọc | Kim | 1 500 | **Kim Châm Độ Mệnh** | Hồi 22% máu, Thanh tẩy và Thủ +20% 2 lượt cho cả đội |
| Lục Diệp | Mộc | 1 500 | **Xuân Mộc Vạn Sinh** | Hồi 20% máu cả đội, kèm Hồi phục 6%/lượt 2 lượt |
| Mai Thanh | Thủy | khởi đầu | **Cam Lộ Hồi Xuân** | Hồi 30% máu và Thanh tẩy cả đội; mỗi đối thủ 30% Đóng băng 1 lượt (tăng 20/10/2026 từ 25%) |
| Hồng Đan | Hỏa | 1 500 | **Đan Hỏa Hồi Nguyên** | Hồi 22% máu cả đội, Công +15% 2 lượt |
| Bế Liên | Thổ | 3 000 | **Hậu Thổ Dưỡng Nguyên** | Hồi 20% máu cả đội, kèm Khiên 10% máu |
| Tiêu Minh | Lôi | 3 000 | **Lôi Châm Khởi Tử** | Hồi 22% máu cả đội, mỗi người +20 năng lượng |
| Bạch Sương | Phong | 3 000 | **Gió Lành Tẩy Uế** | Thanh tẩy và hồi 18% máu cả đội, mỗi người +15 năng lượng |

**💰 Mưu sĩ**

| Nhân vật | Hệ | Giá | Tuyệt chiêu | Tác dụng |
|---|---|---|---|---|
| Tô Kim | Kim | khởi đầu | **Kim Ngân Ly Tán** | 180% ATK 1 đối thủ, bỏ qua 50% Thủ và Khiên; −50 năng lượng, Câm lặng 1 lượt |
| Nhan Trúc | Mộc | 1 500 | **Trúc Độc Mê Hồn** | Mỗi đối thủ −25 năng lượng, 40% Câm lặng 1 lượt; đội mình Hồi phục 4% 2 lượt |
| Quách Ẩn | Thủy | 3 000 | **Thủy Độn Ly Gián** | Mỗi đối thủ 50% Câm lặng 1 lượt, −20 năng lượng |
| Ninh Hỏa | Hỏa | 1 500 | **Hỏa Thiêu Kho Lương** | Đối thủ −25 lương, mỗi người −25 năng lượng và Thiêu đốt 10% ATK 2 lượt |
| Mã Nhạc | Thổ | 1 500 | **Đoạn Đạo Tuyệt Lương** | Đối thủ −30 lương, mỗi người −20 năng lượng; phá 6 ô ngẫu nhiên |
| Từ Kinh | Lôi | 3 000 | **Kinh Lôi Đoạt Khí** | 150% ATK 1 đối thủ, −50 năng lượng, Câm lặng 1 lượt |
| Bùi Phiêu | Phong | 3 000 | **Phiêu Phong Ly Gián** | Mỗi đối thủ −25 năng lượng, Xua tan; tự xoay lốc xoáy tối đa 2 nấc |

**📖 Quân sư**

| Nhân vật | Hệ | Giá | Tuyệt chiêu | Tác dụng |
|---|---|---|---|---|
| Nghiêm Thiết | Kim | 1 500 | **Thiết Trận Phá Giáp** | Cả đội đối thủ Thủ −30% 2 lượt; đội mình Công +15% 2 lượt |
| Sầm Tuệ | Mộc | 1 500 | **Thanh Lâm Bày Trận** | Cả đội Hồi phục 5%/lượt và Thủ +20% 2 lượt |
| Vi Triều | Thủy | 3 000 | **Triều Dâng Vây Thành** | Cả đội đối thủ Công −25% 2 lượt, mỗi người 30% Đóng băng 1 lượt |
| Tôn Diệm | Hỏa | 3 000 | **Hỏa Công Liên Kế** | Cả đội đối thủ Công −20% và Thiêu đốt 12% ATK 2 lượt; đội mình +10 năng lượng |
| Tạ Thạch | Thổ | 1 500 | **Bát Trận Thạch Lũy** | Cả đội Thủ +30% 2 lượt và Khiên 12% máu |
| Mạc Vân | Lôi | 3 000 | **Lôi Trận Kinh Hồn** | Cả đội đối thủ Công −25% 2 lượt, −20 năng lượng; phá 6 ô ngẫu nhiên |
| Phùng Phong | Phong | khởi đầu | **Phong Vân Biến Trận** | Xua tan và Công −30% cả đội đối thủ 2 lượt; đội mình +20 năng lượng; tự xoay lốc xoáy tối đa 2 nấc |

## 5. Tướng lịch sử

Sáu tướng theo Đinh Bộ Lĩnh dẹp loạn, nhân vật lịch sử được hư cấu hóa. Gia nhập khi qua màn chiến dịch lần đầu ([Chế độ chơi](09-che-do-choi.md#21-chương-1-cờ-lau-dẹp-loạn-claude-đặt-19102026-chờ-shan-duyệt)), không bán. Chiêu riêng 100 năng lượng, mở ở cấp 10.

| Tướng | Nghề | Hệ | Gia nhập | Chiêu riêng | Tác dụng |
|---|---|---|---|---|---|
| Nguyễn Bặc | Tướng sĩ | 🔥 Hỏa | Cờ lau tập trận | **Định Quốc Hỏa Kỳ** | 240% ATK 1 đối thủ, Thiêu đốt 15% ATK 2 lượt; cả đội Công +15% 2 lượt |
| Đinh Điền | Binh lính | ⛰️ Thổ | Thử tài ở Bố Hải Khẩu | **Ngoại Giáp Hộ Quân** | Cả đội Khiên 20% máu; bản thân Khiêu khích và Phản đòn 35% 2 lượt |
| Lưu Cơ | Mưu sĩ | ⚙️ Kim | Thu phục Đằng Châu | **Đô Hộ Phủ Lệnh** | Cả đội đối thủ −30 năng lượng, 50% Câm lặng 1 lượt, Thủ −15% 2 lượt |
| Trịnh Tú | Y sư | 🌿 Mộc | Đánh Bình Kiều | **Hoa Lư Thảo Dược** | Hồi 28% máu, Thanh tẩy và Hồi phục 5%/lượt 2 lượt cho cả đội (tăng 20/10/2026 từ 22%) |
| Lê Hoàn | Quân sư | ⚡ Lôi | Vây thành Tam Đái | **Thập Đạo Lôi Binh** | 100% ATK cả đội đối thủ, Công −25% 2 lượt; đội mình +20 năng lượng |
| Đinh Liễn | Pháp sư | 💧 Thủy | Lên Phong Châu | **Nam Việt Vương Ấn** | 130% ATK cả đội đối thủ, 30% Đóng băng 1 lượt; phá 6 ô ngẫu nhiên |

Tên chiêu gợi tới chức tước lịch sử: Nguyễn Bặc là Định Quốc công, Đinh Điền là Ngoại giáp, Lưu Cơ là Đô hộ phủ sĩ sư, Lê Hoàn là Thập đạo tướng quân, Đinh Liễn là Nam Việt vương.

## 6. Sứ quân

Mười hai sứ quân là đối thủ thủ lĩnh của chiến dịch chương 1. Sau khi người chơi **qua màn có sứ quân đó lần đầu**, sứ quân mở bán ở cửa hàng giá **3 000 vàng**, mua về ở cấp 1. Nghề, hệ và chiêu riêng giống hệt khi làm đối thủ; riêng phe người chơi thì chiêu riêng mở ở cấp 10 như mọi ô 5 (làm đối thủ thì sứ quân luôn mang chiêu riêng). Giá năng lượng 60 (trùm 80) giữ như ở chiến dịch vì chiêu được chỉnh cho AI dùng; mô phỏng mục 8 cho thấy sứ quân phe người chơi không mạnh hơn hai nhóm kia nên không tăng giá.

| Sứ quân | Tước hiệu | Nghề | Hệ | Đất (màn mở bán) | Chiêu riêng | NL | Tác dụng |
|---|---|---|---|---|---|---|---|
| Trần Lãm | Trần Minh Công | Quân sư | Thủy | Bố Hải Khẩu | **Bố Hải Trấn Giang** | 60 | 80% ATK cả đội đối thủ, Công −30% 2 lượt, 35% Đóng băng; phá 4 ô |
| Phạm Bạch Hổ | Phạm Phòng Át | Tướng sĩ | Hỏa | Đằng Châu | **Bạch Hổ Xuất Sơn** | 60 | 320% ATK 1 đối thủ, Thiêu đốt 20% ATK 2 lượt; bản thân Công +20% |
| Ngô Xương Xí | Kiều công | Mưu sĩ | Kim | Bình Kiều | **Ngô Gia Di Mưu** | 60 | 240% ATK bỏ qua 40% Thủ, −50 năng lượng, Câm lặng 1 lượt; phá 6 ô |
| Ngô Nhật Khánh | Ngô Nam công | Quân sư | Phong | Đường Lâm | **Đường Lâm Phong Khởi** | 60 | 60% ATK cả đội đối thủ, Xua tan, Công −25% 2 lượt; tự xoay lốc xoáy tối đa 2 nấc |
| Nguyễn Khoan | Nguyễn Thái Bình | Binh lính | Thổ | Tam Đái | **Tam Đái Kiên Thành** | 60 | Cả đội Khiên 25% máu; bản thân Khiêu khích, Phản đòn 35% 2 lượt |
| Kiều Công Hãn | Kiều Tam Chế | Pháp sư | Lôi | Phong Châu | **Phong Châu Lôi Kích** | 60 | 100% ATK cả đội đối thủ, −15 năng lượng; phá 4 ô |
| Kiều Thuận | Kiều Lệnh công | Y sư | Mộc | Hồi Hồ | **Hồi Hồ Sinh Khí** | 60 | Hồi 25% máu và Hồi phục 6%/lượt 2 lượt cho cả đội |
| Lý Khuê | Lý Lãng công | Tướng sĩ | Kim | Siêu Loại | **Siêu Loại Phá Giáp** | 60 | 340% ATK bỏ qua 50% Thủ, Thủ −30% 2 lượt; phá 6 ô |
| Nguyễn Thủ Tiệp | Nguyễn Lệnh công | Mưu sĩ | Thủy | Tiên Du | **Tiên Du Đoạt Lương** | 60 | 60% ATK cả đội đối thủ, −25 lương, −30 năng lượng, 25% Đóng băng |
| Lữ Đường | Lữ Tá công | Pháp sư | Thủy | Tế Giang | **Tế Giang Thủy Trận** | 60 | 150% ATK cả đội đối thủ, 35% Đóng băng; biến 4 ô thành âm dương |
| Nguyễn Siêu | Nguyễn Hữu công | Binh lính | Hỏa | Tây Phù Liệt | **Phù Liệt Hỏa Lũy** | 60 | Bản thân Khiên 30% máu và Khiêu khích; cả đội đối thủ Thiêu đốt 15% ATK |
| Đỗ Cảnh Thạc | Đỗ Lệnh công | Tướng sĩ | Thổ | Đỗ Động (trùm) | **Đỗ Động Kiên Tâm** | 80 | 360% ATK 1 đối thủ; cả đội Thủ +30% 2 lượt; phá 8 ô |

## 7. Tùy tướng chiến dịch (chỉ AI)

Phó tướng, thầy pháp, lang y… đi kèm sứ quân ở chiến dịch không có bộ theo hệ: họ dùng **chiêu nghề nấc 1 và một chiêu nhánh nấc 2** ([Bộ chiêu nghề](06-nhan-vat-ky-nang.md#43-bộ-chiêu-nghề)) cộng dấu ấn nguyên tố, dựng bằng `buildAide`. Người chơi không sở hữu được tùy tướng. Đối thủ AI ở Leo tháp, Sinh tồn, Thử thách ngày và Đấu trường bóng ma rút từ tướng thường nên dùng bộ nghề + hệ mới như người chơi. Thủ lĩnh chiến dịch giữ bộ hệ cũ theo preset riêng.

## 8. Cân bằng lịch sử trước cải tổ 22/10/2026

**Cách đo** (`pnpm sim -- --roster --level N --battles 200`): mỗi trận 3vs3, phe 0 là Đinh Bộ Lĩnh + nhân vật cần đo + một bạn rút ngẫu nhiên, phe 1 là Đinh Bộ Lĩnh + 2 nhân vật rút ngẫu nhiên; hai Đinh Bộ Lĩnh cùng hệ (xoay đủ 7 hệ), cùng cấp, AI Thường cả hai phe, đi trước luân phiên. Bạn và đối thủ rút từ cả kho nhân vật kèm, nên 50% là đúng mức trung bình. 200 trận mỗi người cho nhiễu khoảng ±3,5 điểm.

**Trước khi đổi** (cấp 20, tướng thường còn chiêu nghề): tướng lịch sử trung bình 54,2%, sứ quân 51,3%, tướng thường 47,8%. Đúng như sim chiến dịch trước đó (đội 2 tướng lịch sử 65% so với đội mặc định 54%): bộ theo hệ mạnh hơn chiêu nghề.

**Sau khi tướng thường lên bộ 6 ô** (17 tướng thường cũ): trung bình ba nhóm 49–51% ở cả cấp 10, 20 và 30. Lệch nhất là Cao Kiên (60–68%, tuyệt chiêu Thủ +50% 3 lượt kèm Phản đòn 50%) nên giảm còn +35%/35%; Y sư nhìn chung thấp (Mai Thanh, Trịnh Tú 38–45%) nên tăng hồi máu của Cam Lộ Hồi Xuân (25→30%) và Hoa Lư Thảo Dược (22→28%). Chiêu riêng của sứ quân không đổi vì dùng chung với chiến dịch đã cân.

**Sau khi thêm 25 tướng thường** (đủ 60 nhân vật kèm, 200 trận mỗi người mỗi cấp):

| Nhóm | Cấp 10 | Cấp 20 | Cấp 30 |
|---|---|---|---|
| Tướng thường (42) | 50,4% | 49,4% | 48,4% |
| Tướng lịch sử (6) | 52,1% | 50,8% | 49,7% |
| Sứ quân (12) | 49,6% | 49,3% | 49,3% |

- Từng người nằm trong khoảng 41–58% (trung bình ba cấp). Cao nhất: Cao Kiên 58%, Vũ Lôi 56%, Ông Chấn 56%, Chu Ngân 55%. Thấp nhất: Nguyễn Thủ Tiệp 41%, Tạ Thạch 42%, Trần Lãm 44%, Mã Nhạc 45%.
- Độ lệch đã có từ **cấp 10, khi ô 5 chưa mở**, nên đến từ tổ hợp nghề × hệ (ví dụ Binh lính hệ Kim chịu đòn tốt, Quân sư hệ Thổ và Mưu sĩ hệ Thủy chủ yếu làm suy yếu mà AI dùng chưa khéo), không phải từ kỹ năng riêng. Thử tăng tuyệt chiêu của Tạ Thạch, Hồ Lãng, Mã Nhạc, Hồng Đan (300 trận, cấp 20 và 30) không đổi được tỉ lệ thắng ngoài mức nhiễu nên giữ nguyên. Muốn kéo các tổ hợp này lại cần chỉnh nội tại nghề hoặc dạy AI dùng hiệu ứng suy yếu, để sau.
- Sứ quân phe người chơi không mạnh hơn mặt bằng dù chiêu riêng chỉ 60 năng lượng, nên giá 3 000 như tướng thường mức cao.
- Đối thủ AI ở Leo tháp và Sinh tồn cũng lên bộ 6 ô. Sinh tồn không đổi (trung vị 11 đợt ở cấp 10); Leo tháp khó hơn (trung vị 10 → 8 tầng) nên hạ hệ số sức mạnh tầng 1 từ 0,45 xuống 0,38, trung vị về lại 10 tầng ([Chế độ chơi](09-che-do-choi.md#31-bản-đầu-claude-đặt-20102026-chờ-shan-duyệt)).

## 9. Hồ sơ cũ

Hồ sơ lưu trước 20/10/2026 có nhân vật kèm nâng chiêu nghề theo id hoặc đã mua chiêu nhánh. Khi đọc hồ sơ, những nhân vật này được **xóa khóa chiêu nghề/nhánh cũ và hoàn đúng điểm đã chi** (giá nâng 1,1,2,2 và giá nhánh 1), cộng vào điểm chưa chi; giữ cấp, kinh nghiệm và khóa ô nếu có. Xóa khóa/nhánh cũ là dấu hiệu đã chuyển, nên đọc lại không hoàn lặp; trường `branchChoice` bị bỏ. Hồ sơ khóa ô của mọi nhân vật giữ nguyên, kể cả cấp nâng của ô 4/6 tạm khóa theo mốc mới. Chi tiết ở [20](20-cai-to-ky-nang.md#ánh-xạ-cũ--mới-và-lưu-trữ).
