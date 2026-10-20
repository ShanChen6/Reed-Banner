# Lộ trình

> Cập nhật: 19/10/2026

| Giai đoạn | Nội dung | Mục đích |
|---|---|---|
| **0. Khởi tạo** | Dựng Next.js trong repo Reed-Banner, cấu trúc thư mục, test; deploy trang trống lên Vercel | Nền móng |
| **1. Lõi trận đấu** (offline, chế độ Luyện tập) | Bàn cờ 12×8, luật ghép, đồng hồ 30 giây, 1vs1 và 3vs3, tài nguyên, công thức, hiệu ứng, nguyên tố. Nhân vật chính với bộ kỹ năng hệ Mộc (đã làm thêm 6 hệ còn lại ngày 19/10/2026); 5 nhân vật kèm khởi đầu với chiêu nấc 1–2 (**chưa có tuyệt chiêu nấc 3**), cùng một cấp. AI cơ bản. Script mô phỏng cân bằng. Trang `/demo` + nhúng vào ShanVerse. | Kiểm chứng gameplay có vui không, chỉnh số; ShanVerse có màn chơi thử sớm |
| **2. Server + tài khoản** | [Hạ tầng](tech/ha-tang.md): Postgres, OAuth và khách, xử lý từng nước đi trên server, đồng hồ phía server, tiếp tục trận dở. Đã có (19/10/2026): Neon + Drizzle, trận do server xử lý, chạy bù hết giờ, xử thua 24 giờ, tài khoản khách bằng cookie, API `/api/battles`; trang `/play`; đăng nhập Google/GitHub và tên đăng nhập; hồ sơ tiến trình trên server; việc định kỳ Vercel Cron | Đưa lõi lên online an toàn |
| **3. Tiến trình** | Cấp và điểm kỹ năng, nhánh nấc 2, **tuyệt chiêu nấc 3**, cửa hàng nhân vật, 9 ô trang bị. Đã làm sớm phần logic (19/10/2026): trang bị, cấp, kinh nghiệm, điểm kỹ năng, nâng kỹ năng, mở khóa theo cấp, mua và chọn nhánh nấc 2, phần thưởng cuối trận; hồ sơ lưu trên server (giai đoạn 2); tuyệt chiêu nấc 3, cửa hàng 12 nhân vật kèm, túi đồ và 9 ô trang bị lưu trên server, cửa hàng trang bị (19/10/2026). Đã xong (19/10/2026), gồm AI để dành năng lượng cho tuyệt chiêu | Lý do quay lại chơi |
| **4. Chiến dịch** | Các màn, nhân vật lịch sử, lương mang sang, luật màn, trùm, BXH (chi tiết bên dưới) | Nội dung dài hạn |
| **5. Chế độ thêm** | Leo tháp, thử thách hằng ngày, sinh tồn, nhiệm vụ | Giữ chân người chơi |
| **6. Đánh bóng** | Art, âm thanh, hướng dẫn, phát hành (art làm song song từ giai đoạn 1) | Hoàn thiện |

## Kế hoạch chi tiết từ giai đoạn 4

Mỗi dòng là một PR vào develop, làm theo thứ tự. Số liệu là điểm xuất phát do Claude đặt, cân lại bằng mô phỏng.

### Giai đoạn 4: Chiến dịch (đang làm)

| # | Việc | Ghi chú |
|---|---|---|
| 4.1 | Chương 1 "Cờ lau dẹp loạn": 13 màn, lương mang sang, doanh trại, luật màn, trang `/campaign` | Đã làm (19/10/2026). Sứ quân là nhân vật lịch sử có bộ 6 kỹ năng như Đinh Bộ Lĩnh |
| 4.2 | Tướng lịch sử gia nhập khi qua màn: Nguyễn Bặc, Đinh Điền, Lê Hoàn, Trịnh Tú, Lưu Cơ, Đinh Liễn | Đã làm (20/10/2026). Bộ 6 kỹ năng theo nguyên tố, nâng theo ô như nhân vật chính; ra trận như nhân vật kèm |
| 4.3 | Chiêu riêng cho từng sứ quân (1 tuyệt chiêu mang dấu ấn lịch sử) và thoại trước/sau trận | Đã làm (20/10/2026). Chiêu riêng thay ô 5 cho 12 sứ quân và 6 tướng lịch sử; 3 câu thoại mỗi màn |
| 4.4 | Cân độ khó chiến dịch bằng mô phỏng: người chơi cày bình thường qua được màn trước ở cấp gợi ý | Đã làm (20/10/2026). `pnpm sim -- --stage all`, thêm `--sweep 2..5` và `--team default` khi cần; cấp gợi ý riêng từng màn, mọi màn ≥50% thắng ở cấp gợi ý |
| 4.5 | Đánh trùm: đánh lại sứ quân đã hạ ở mức khó cao hơn, luật "sân nhà", thưởng riêng | Đã làm (20/10/2026). 3 bậc cho 12 sứ quân, sân nhà theo nguyên tố, thưởng vàng và trang bị lần đầu; xem [Chế độ chơi](design/09-che-do-choi.md#22-đánh-trùm-claude-đặt-20102026-chờ-shan-duyệt) |
| 4.6 | Bảng xếp hạng (BXH) | Theo số màn, lượt ít nhất mỗi màn |

### Giai đoạn 5: Chế độ thêm

| # | Việc |
|---|---|
| 5.1 | Leo tháp: máu và lương mang sang giữa các tầng, chọn 1 trong 3 phần thưởng. Đã làm (20/10/2026), trang `/tower`, xem [Chế độ chơi](design/09-che-do-choi.md#31-bản-đầu-claude-đặt-20102026-chờ-shan-duyệt) |
| 5.2 | Thử thách hằng ngày: seed chung mỗi ngày, xếp hạng |
| 5.3 | Sinh tồn: đối thủ theo đợt, báo trước, hồi sinh. Đã làm (20/10/2026), trang `/survival`, xem [Chế độ chơi](design/09-che-do-choi.md#41-bản-đầu-claude-đặt-20102026-chờ-shan-duyệt) |
| 5.4 | Nhiệm vụ ngày/tuần, thành tựu |
| 5.5 | Đấu trường bóng ma (PvP không đồng bộ) |

### Giai đoạn 6: Đánh bóng và phát hành

| # | Việc |
|---|---|
| 6.1 | Chân dung và trang bị vẽ thật (họa sĩ hoặc Shan tạo theo [13-hinh-anh](design/13-hinh-anh.md)) |
| 6.2 | Âm thanh, nhạc nền, hiệu ứng đánh |
| 6.3 | Hướng dẫn chơi lần đầu (màn cờ lau làm màn hướng dẫn) |
| 6.4 | Kiểm tra trên điện thoại, hiệu năng, chốt tên miền, đưa develop lên main |

### Cách làm để không mất việc

- Mỗi PR nhỏ, đẩy commit sớm; phần đang làm dở luôn nằm trên nhánh, không chỉ trên máy.
- Mô phỏng dài chạy nền và ghi kết quả vào tài liệu, không dán cả bảng vào trò chuyện.
