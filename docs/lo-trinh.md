# Lộ trình

> Cập nhật: 18/10/2026

| Giai đoạn | Nội dung | Mục đích |
|---|---|---|
| **0. Khởi tạo** | Dựng Next.js trong repo Reed-Banner, cấu trúc thư mục, test; deploy trang trống lên Vercel | Nền móng |
| **1. Lõi trận đấu** (offline, chế độ Luyện tập) | Bàn cờ 12×8, luật ghép, đồng hồ 30 giây, 1vs1 và 3vs3, tài nguyên, công thức, hiệu ứng, nguyên tố. Nhân vật chính với bộ kỹ năng hệ Mộc (đã làm thêm 6 hệ còn lại ngày 19/10/2026); 5 nhân vật kèm khởi đầu với chiêu nấc 1–2 (**chưa có tuyệt chiêu nấc 3**), cùng một cấp. AI cơ bản. Script mô phỏng cân bằng. Trang `/demo` + nhúng vào ShanVerse. | Kiểm chứng gameplay có vui không, chỉnh số; ShanVerse có màn chơi thử sớm |
| **2. Server + tài khoản** | [Hạ tầng](tech/ha-tang.md): Postgres, OAuth và khách, xử lý từng nước đi trên server, đồng hồ phía server, tiếp tục trận dở. Đã có (19/10/2026): Neon + Drizzle, trận do server xử lý, chạy bù hết giờ, xử thua 24 giờ, tài khoản khách bằng cookie, API `/api/battles`; trang `/play`; đăng nhập Google/GitHub và tên đăng nhập; hồ sơ tiến trình trên server; việc định kỳ Vercel Cron | Đưa lõi lên online an toàn |
| **3. Tiến trình** | Cấp và điểm kỹ năng, nhánh nấc 2, **tuyệt chiêu nấc 3**, cửa hàng nhân vật, 9 ô trang bị. Đã làm sớm phần logic (19/10/2026): trang bị, cấp, kinh nghiệm, điểm kỹ năng, nâng kỹ năng, mở khóa theo cấp, mua và chọn nhánh nấc 2, phần thưởng cuối trận; hồ sơ lưu trên server (giai đoạn 2); tuyệt chiêu nấc 3 cho 5 nhân vật kèm khởi đầu và cửa hàng 12 nhân vật kèm (19/10/2026). Còn cửa hàng trang bị, 9 ô trang bị lưu trên server | Lý do quay lại chơi |
| **4. Chiến dịch** | Các màn, lương mang sang, luật màn, trùm, BXH | Nội dung dài hạn |
| **5. Đánh bóng** | Art, âm thanh, hiệu ứng (làm song song từ giai đoạn 1) | Hoàn thiện |
