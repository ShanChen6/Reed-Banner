# 22 — Tầm Tướng Ký: Gói 3 (tướng thường)

> Cập nhật: 04/11/2026
> Trạng thái: **IMPLEMENTED** — Shan duyệt công thức, lời dẫn và thành tựu ngày 04/11/2026; code trên `develop` (PR #262, `PACK_3.status` là `published`); Shan bật cùng ngày (cờ `TAM_TUONG_KY_ENABLED`).

Shan (04/11/2026): **đưa mọi tướng vào Tầm Tướng Ký**. Gói 1 + Gói 2 đã có 21 tướng (lịch sử, sứ quân, đặc biệt); Gói 3 thêm **56 tướng thường** còn lại (8 nghề × 7 hệ, mỗi tổ hợp đúng một người, kể cả Xạ thủ, Sát thủ). Sau Gói 3, sổ có đủ **77 tướng**, tức mọi nhân vật chơi được trong game cùng Đinh Bộ Lĩnh (test).

## 1. Cách dựng công thức

Theo [Design Freeze](design-freeze.md): bậc thường đúng **7 lần ghép** (P-5), không dựa vào art (A-22).

- **Công thức cuối = vai trò sơ học + tuyệt chiêu.**
  - Vai trò sơ học, ví dụ “Tướng sĩ hệ Kim” = Võ nghệ sơ học + Kim: 3 lần ghép, khớp nghề/hệ roster (`roleMismatch`).
  - Tuyệt chiêu: 3 lần ghép, lấy tên tuyệt chiêu riêng của tướng làm dấu danh tính.
- Tri thức sơ học (2 lần ghép) rẻ hơn tri thức nghề của Gói 1 (4–5 lần), nên tướng thường dễ hơn tướng đặc biệt và lịch sử, đúng thứ tự lịch sử > đặc biệt > thường.
- Tuyệt chiêu ghép từ hai yếu tố cơ bản gợi tới tên chiêu, ví dụ “Băng Hà Phong Tỏa” = Giọt sương + Núi, “Hỏa Thiêu Kho Lương” = Than củi + Lúa.
- Gói 3 không thêm công thức mới cho yếu tố có sẵn, nên không đổi độ khó yếu tố nào của Gói 1, Gói 2 (test). Gói 3 dùng Lúa của Gói 2 nên chỉ mở khi Gói 2 đã `published`.
- Hai tướng có tên chiêu chứa tên mình (Độc Ảnh “Độc Ảnh Tiềm Châm”, Xích Dạ “Xích Dạ Song Sát”): yếu tố và lời dẫn dùng phần còn lại (“Tiềm Châm”, “Song Sát”), dấu danh tính ghi đủ tên chiêu.
- Lời dẫn: “<nghề> hệ <hệ>, tuyệt chiêu mang tên “…”.” — không chứa tên tướng nào (test).

### Tri thức sơ học

| Tri thức sơ học | Ô trước | Ô sau |
|---|---|---|
| Võ nghệ sơ học | Sắt rèn | Thổ |
| Đội ngũ sơ học | Lũy đất | Kim |
| Y thuật sơ học | Dược thảo | Thủy |
| Mưu kế sơ học | Than củi | Thổ |
| Binh thư sơ học | Tre | Phong |
| Pháp thuật sơ học | Đá ngọc thô | Lôi |
| Cung nỏ sơ học | Lau sậy | Kim |
| Ẩn thân sơ học | Mây trời | Mộc |

## 2. Năm mươi sáu tướng thường

| Tướng | Vai trò (ô trước) | Tuyệt chiêu (ô sau) = ô trước + ô sau | Lời dẫn chế độ Hạng |
|---|---|---|---|
| Trần Cương | Tướng sĩ hệ Kim | Kim Qua Thiết Mã = Đồng đen + Sắt rèn | Tướng sĩ hệ Kim, tuyệt chiêu mang tên “Kim Qua Thiết Mã”. |
| Lý Liệt | Tướng sĩ hệ Hỏa | Xích Hỏa Đoạt Kỳ = Than củi + Vải gai | Tướng sĩ hệ Hỏa, tuyệt chiêu mang tên “Xích Hỏa Đoạt Kỳ”. |
| Lâm Tùng | Tướng sĩ hệ Mộc | Trúc Lâm Phá Trận = Tre + Tre | Tướng sĩ hệ Mộc, tuyệt chiêu mang tên “Trúc Lâm Phá Trận”. |
| Hồ Lãng | Tướng sĩ hệ Thủy | Lãng Đào Trảm = Cửa sông + Giông tố | Tướng sĩ hệ Thủy, tuyệt chiêu mang tên “Lãng Đào Trảm”. |
| Kha Sơn | Tướng sĩ hệ Thổ | Sơn Hà Trấn Kích = Núi + Cửa sông | Tướng sĩ hệ Thổ, tuyệt chiêu mang tên “Sơn Hà Trấn Kích”. |
| Tống Tấn | Tướng sĩ hệ Lôi | Lôi Đao Liên Trảm = Giông tố + Sắt rèn | Tướng sĩ hệ Lôi, tuyệt chiêu mang tên “Lôi Đao Liên Trảm”. |
| Hứa Lăng | Tướng sĩ hệ Phong | Truy Phong Đoạt Mệnh = Mây trời + Mây trời | Tướng sĩ hệ Phong, tuyệt chiêu mang tên “Truy Phong Đoạt Mệnh”. |
| Lê Thạch | Binh lính hệ Thổ | Trấn Sơn Hộ Quân = Núi + Lũy đất | Binh lính hệ Thổ, tuyệt chiêu mang tên “Trấn Sơn Hộ Quân”. |
| Hoàng Mộc | Binh lính hệ Mộc | Rễ Già Giữ Thành = Dược thảo + Lũy đất | Binh lính hệ Mộc, tuyệt chiêu mang tên “Rễ Già Giữ Thành”. |
| Cao Kiên | Binh lính hệ Kim | Thiết Bích Đồng Thành = Đồng đen + Lũy đất | Binh lính hệ Kim, tuyệt chiêu mang tên “Thiết Bích Đồng Thành”. |
| Thái Hà | Binh lính hệ Thủy | Thủy Trại Liên Hoàn = Cửa sông + Lũy đất | Binh lính hệ Thủy, tuyệt chiêu mang tên “Thủy Trại Liên Hoàn”. |
| Trương Viêm | Binh lính hệ Hỏa | Viêm Giáp Hộ Doanh = Than củi + Sắt rèn | Binh lính hệ Hỏa, tuyệt chiêu mang tên “Viêm Giáp Hộ Doanh”. |
| Ông Chấn | Binh lính hệ Lôi | Chấn Lôi Thiết Vệ = Giông tố + Lũy đất | Binh lính hệ Lôi, tuyệt chiêu mang tên “Chấn Lôi Thiết Vệ”. |
| Mạnh Tường | Binh lính hệ Phong | Phong Lũy Hộ Kỳ = Vải gai + Lũy đất | Binh lính hệ Phong, tuyệt chiêu mang tên “Phong Lũy Hộ Kỳ”. |
| Mai Thanh | Y sư hệ Thủy | Cam Lộ Hồi Xuân = Giọt sương + Dược thảo | Y sư hệ Thủy, tuyệt chiêu mang tên “Cam Lộ Hồi Xuân”. |
| Lục Diệp | Y sư hệ Mộc | Xuân Mộc Vạn Sinh = Dược thảo + Dược thảo | Y sư hệ Mộc, tuyệt chiêu mang tên “Xuân Mộc Vạn Sinh”. |
| Bạch Sương | Y sư hệ Phong | Gió Lành Tẩy Uế = Mây trời + Dược thảo | Y sư hệ Phong, tuyệt chiêu mang tên “Gió Lành Tẩy Uế”. |
| Châu Ngọc | Y sư hệ Kim | Kim Châm Độ Mệnh = Sắt rèn + Dược thảo | Y sư hệ Kim, tuyệt chiêu mang tên “Kim Châm Độ Mệnh”. |
| Hồng Đan | Y sư hệ Hỏa | Đan Hỏa Hồi Nguyên = Than củi + Dược thảo | Y sư hệ Hỏa, tuyệt chiêu mang tên “Đan Hỏa Hồi Nguyên”. |
| Bế Liên | Y sư hệ Thổ | Hậu Thổ Dưỡng Nguyên = Lúa + Dược thảo | Y sư hệ Thổ, tuyệt chiêu mang tên “Hậu Thổ Dưỡng Nguyên”. |
| Tiêu Minh | Y sư hệ Lôi | Lôi Châm Khởi Tử = Giông tố + Dược thảo | Y sư hệ Lôi, tuyệt chiêu mang tên “Lôi Châm Khởi Tử”. |
| Tô Kim | Mưu sĩ hệ Kim | Kim Ngân Ly Tán = Đồng đen + Mây trời | Mưu sĩ hệ Kim, tuyệt chiêu mang tên “Kim Ngân Ly Tán”. |
| Ninh Hỏa | Mưu sĩ hệ Hỏa | Hỏa Thiêu Kho Lương = Than củi + Lúa | Mưu sĩ hệ Hỏa, tuyệt chiêu mang tên “Hỏa Thiêu Kho Lương”. |
| Quách Ẩn | Mưu sĩ hệ Thủy | Thủy Độn Ly Gián = Giọt sương + Mây trời | Mưu sĩ hệ Thủy, tuyệt chiêu mang tên “Thủy Độn Ly Gián”. |
| Nhan Trúc | Mưu sĩ hệ Mộc | Trúc Độc Mê Hồn = Tre + Dược thảo | Mưu sĩ hệ Mộc, tuyệt chiêu mang tên “Trúc Độc Mê Hồn”. |
| Mã Nhạc | Mưu sĩ hệ Thổ | Đoạn Đạo Tuyệt Lương = Đá tảng + Lúa | Mưu sĩ hệ Thổ, tuyệt chiêu mang tên “Đoạn Đạo Tuyệt Lương”. |
| Từ Kinh | Mưu sĩ hệ Lôi | Kinh Lôi Đoạt Khí = Giông tố + Mây trời | Mưu sĩ hệ Lôi, tuyệt chiêu mang tên “Kinh Lôi Đoạt Khí”. |
| Bùi Phiêu | Mưu sĩ hệ Phong | Phiêu Phong Ly Gián = Mây trời + Lau sậy | Mưu sĩ hệ Phong, tuyệt chiêu mang tên “Phiêu Phong Ly Gián”. |
| Phùng Phong | Quân sư hệ Phong | Phong Vân Biến Trận = Mây trời + Giông tố | Quân sư hệ Phong, tuyệt chiêu mang tên “Phong Vân Biến Trận”. |
| Tạ Thạch | Quân sư hệ Thổ | Bát Trận Thạch Lũy = Đá tảng + Lũy đất | Quân sư hệ Thổ, tuyệt chiêu mang tên “Bát Trận Thạch Lũy”. |
| Mạc Vân | Quân sư hệ Lôi | Lôi Trận Kinh Hồn = Giông tố + Giông tố | Quân sư hệ Lôi, tuyệt chiêu mang tên “Lôi Trận Kinh Hồn”. |
| Nghiêm Thiết | Quân sư hệ Kim | Thiết Trận Phá Giáp = Sắt rèn + Sắt rèn | Quân sư hệ Kim, tuyệt chiêu mang tên “Thiết Trận Phá Giáp”. |
| Sầm Tuệ | Quân sư hệ Mộc | Thanh Lâm Bày Trận = Tre + Lau sậy | Quân sư hệ Mộc, tuyệt chiêu mang tên “Thanh Lâm Bày Trận”. |
| Vi Triều | Quân sư hệ Thủy | Triều Dâng Vây Thành = Cửa sông + Cửa sông | Quân sư hệ Thủy, tuyệt chiêu mang tên “Triều Dâng Vây Thành”. |
| Tôn Diệm | Quân sư hệ Hỏa | Hỏa Công Liên Kế = Than củi + Than củi | Quân sư hệ Hỏa, tuyệt chiêu mang tên “Hỏa Công Liên Kế”. |
| Hà Vân | Pháp sư hệ Hỏa | Hỏa Vũ Liệu Nguyên = Than củi + Lau sậy | Pháp sư hệ Hỏa, tuyệt chiêu mang tên “Hỏa Vũ Liệu Nguyên”. |
| Đào Lam | Pháp sư hệ Thủy | Băng Hà Phong Tỏa = Giọt sương + Núi | Pháp sư hệ Thủy, tuyệt chiêu mang tên “Băng Hà Phong Tỏa”. |
| Vũ Lôi | Pháp sư hệ Lôi | Thiên Lôi Giáng Thế = Giông tố + Núi | Pháp sư hệ Lôi, tuyệt chiêu mang tên “Thiên Lôi Giáng Thế”. |
| Chu Ngân | Pháp sư hệ Kim | Ngân Châm Tán Xạ = Sắt rèn + Mây trời | Pháp sư hệ Kim, tuyệt chiêu mang tên “Ngân Châm Tán Xạ”. |
| Đàm Thảo | Pháp sư hệ Mộc | Kinh Cức Triền Thân = Dược thảo + Tre | Pháp sư hệ Mộc, tuyệt chiêu mang tên “Kinh Cức Triền Thân”. |
| Doãn Nham | Pháp sư hệ Thổ | Địa Mạch Bùng Phát = Đá tảng + Đá tảng | Pháp sư hệ Thổ, tuyệt chiêu mang tên “Địa Mạch Bùng Phát”. |
| Liễu Yên | Pháp sư hệ Phong | Phong Ấn Cuồng Lưu = Mây trời + Cửa sông | Pháp sư hệ Phong, tuyệt chiêu mang tên “Phong Ấn Cuồng Lưu”. |
| Bạch Nỏ Lang | Xạ thủ hệ Kim | Thiết Nỏ Phá Thành = Sắt rèn + Lũy đất | Xạ thủ hệ Kim, tuyệt chiêu mang tên “Thiết Nỏ Phá Thành”. |
| Thanh Lâm Xạ | Xạ thủ hệ Mộc | Lục Tiễn Trói Đường = Lau sậy + Lau sậy | Xạ thủ hệ Mộc, tuyệt chiêu mang tên “Lục Tiễn Trói Đường”. |
| Lam Giang Phi Diệp | Xạ thủ hệ Thủy | Liễu Diệp Tỏa Giang = Lau sậy + Cửa sông | Xạ thủ hệ Thủy, tuyệt chiêu mang tên “Liễu Diệp Tỏa Giang”. |
| Xích Diệm Luân | Xạ thủ hệ Hỏa | Xích Luân Liệt Trận = Than củi + Giông tố | Xạ thủ hệ Hỏa, tuyệt chiêu mang tên “Xích Luân Liệt Trận”. |
| Trấn Sơn Thạch | Xạ thủ hệ Thổ | Trấn Sơn Hộ Trận = Núi + Núi | Xạ thủ hệ Thổ, tuyệt chiêu mang tên “Trấn Sơn Hộ Trận”. |
| Lôi Minh Xạ | Xạ thủ hệ Lôi | Lôi Châm Tước Khí = Giông tố + Lau sậy | Xạ thủ hệ Lôi, tuyệt chiêu mang tên “Lôi Châm Tước Khí”. |
| Tật Phong Lăng | Xạ thủ hệ Phong | Phong Lăng Nhiễu Trận = Mây trời + Tre | Xạ thủ hệ Phong, tuyệt chiêu mang tên “Phong Lăng Nhiễu Trận”. |
| Bạch Phong Đao | Sát thủ hệ Kim | Thiết Ấn Đoạt Mệnh = Đồng đen + Đồng đen | Sát thủ hệ Kim, tuyệt chiêu mang tên “Thiết Ấn Đoạt Mệnh”. |
| Độc Ảnh | Sát thủ hệ Mộc | Tiềm Châm = Dược thảo + Sắt rèn | Sát thủ hệ Mộc, tuyệt chiêu mang tên “Tiềm Châm”. |
| Hàn Giang Khách | Sát thủ hệ Thủy | Hàn Giang Tàng Nhận = Cửa sông + Sắt rèn | Sát thủ hệ Thủy, tuyệt chiêu mang tên “Hàn Giang Tàng Nhận”. |
| Xích Dạ | Sát thủ hệ Hỏa | Song Sát = Than củi + Đồng đen | Sát thủ hệ Hỏa, tuyệt chiêu mang tên “Song Sát”. |
| Địa Ẩn | Sát thủ hệ Thổ | Địa Phục Liệt Trảo = Đá tảng + Sắt rèn | Sát thủ hệ Thổ, tuyệt chiêu mang tên “Địa Phục Liệt Trảo”. |
| Lôi Ảnh | Sát thủ hệ Lôi | Bạo Vũ Lê Hoa = Giông tố + Giọt sương | Sát thủ hệ Lôi, tuyệt chiêu mang tên “Bạo Vũ Lê Hoa”. |
| Vô Ảnh | Sát thủ hệ Phong | Vô Thanh Đoạt Phách = Mây trời + Sắt rèn | Sát thủ hệ Phong, tuyệt chiêu mang tên “Vô Thanh Đoạt Phách”. |

## 3. Gộp sổ và xoay vòng Hạng

- Gói 3 `published` và cờ chế độ bật: server chạy sổ ba gói (77 tướng, 271 công thức); Tướng Lục có thêm mục “Gói 3: Tướng thường · x/56”.
- Tắt Gói 3: khám phá Gói 3 vẫn giữ trong sổ người chơi (như Gói 2).
- Hạng: 7 đề cử xoay vòng qua 77 tướng; tướng thường 100 điểm. Chỉ có 3 tướng đặc biệt nên tuần nào cửa sổ xoay vòng không có tướng đặc biệt thì ô cuối thay bằng một tướng đặc biệt, lần lượt theo tuần. Đề cử của Gói 1 và Gói 1 + 2 **không đổi** (test so với cách cũ 120 tuần). Bật Gói 3 giữa tuần làm đổi đề cử tuần đó, nên bật vào thứ Hai.

## 4. Kết quả kiểm

`validatePack(PACK_1_2_3)`: **0 lỗi, 0 cảnh báo**, 278 node, 271 công thức, 77 tướng, không ngõ cụt. 56 tướng thường đều 7 lần ghép, 8 đơn vị nguyên tố ở chế độ Hạng; đủ chân dung. Test: `tests/core/tam-tuong-ky/pack-3.test.ts` (9).

## 5. Shan duyệt

- [x] 8 tri thức sơ học, 56 công thức tuyệt chiêu, 56 lời dẫn (mục 1, 2).
- [x] Thành tựu: đủ 7 tướng thường mỗi nghề 250 vàng (8 bộ) và đủ Gói 3 1 500 vàng, tổng 3 500 vàng.
- [x] `PACK_3.status` đổi sang `published`; PR #262 merge và Shan bật ngày 04/11/2026 (thứ Tư). Ra mắt khi merge vào `develop` và deploy; không cần biến môi trường mới. Deploy giữa tuần thì nếu Hạng đang bật, danh sách đề cử tuần đang chạy đổi từ lúc deploy; điểm đã ghi giữ nguyên.
