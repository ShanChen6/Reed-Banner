# Lộ trình

> Cập nhật: 25/10/2026

| Giai đoạn | Nội dung | Mục đích |
|---|---|---|
| **0. Khởi tạo** | Dựng Next.js trong repo Reed-Banner, cấu trúc thư mục, test; deploy trang trống lên Vercel | Nền móng |
| **1. Lõi trận đấu** (offline, chế độ Luyện tập) | Bàn cờ 12×8, luật ghép, đồng hồ 30 giây, 1vs1 và 3vs3, tài nguyên, công thức, hiệu ứng, nguyên tố. Nhân vật chính với bộ kỹ năng hệ Mộc (đã làm thêm 6 hệ còn lại ngày 19/10/2026); 5 nhân vật kèm khởi đầu với chiêu nấc 1–2 (**chưa có tuyệt chiêu nấc 3**), cùng một cấp. AI cơ bản. Script mô phỏng cân bằng. Trang `/demo` + nhúng vào ShanVerse. | Kiểm chứng gameplay có vui không, chỉnh số; ShanVerse có màn chơi thử sớm |
| **2. Server + tài khoản** | [Hạ tầng](tech/ha-tang.md): Postgres, OAuth và khách, xử lý từng nước đi trên server, đồng hồ phía server, tiếp tục trận dở. Đã có (19/10/2026): Neon + Drizzle, trận do server xử lý, chạy bù hết giờ, xử thua 24 giờ, tài khoản khách bằng cookie, API `/api/battles`; trang `/play`; đăng nhập Google/GitHub và tên đăng nhập; hồ sơ tiến trình trên server; việc định kỳ Vercel Cron | Đưa lõi lên online an toàn |
| **3. Tiến trình** | Cấp và điểm kỹ năng, nhánh nấc 2, **tuyệt chiêu nấc 3**, cửa hàng nhân vật, 9 ô trang bị. Đã làm sớm phần logic (19/10/2026): trang bị, cấp, kinh nghiệm, điểm kỹ năng, nâng kỹ năng, mở khóa theo cấp, mua và chọn nhánh nấc 2, phần thưởng cuối trận; hồ sơ lưu trên server (giai đoạn 2); tuyệt chiêu nấc 3, cửa hàng 12 nhân vật kèm, túi đồ và 9 ô trang bị lưu trên server, cửa hàng trang bị (19/10/2026). Đã xong (19/10/2026), gồm AI để dành năng lượng cho tuyệt chiêu | Lý do quay lại chơi |
| **4. Chiến dịch** | Campaign V2: 6 chương, 24 nhiệm vụ, nhân vật lịch sử, lương mang sang, địa hình, Đánh trùm, BXH (chi tiết bên dưới) | Nội dung dài hạn |
| **5. Chế độ thêm** | Leo tháp, thử thách hằng ngày, sinh tồn, nhiệm vụ | Giữ chân người chơi |
| **6. Đánh bóng** | Art, âm thanh, hướng dẫn, phát hành (art làm song song từ giai đoạn 1) | Hoàn thiện |

## Kế hoạch chi tiết từ giai đoạn 4

Mỗi dòng là một PR vào develop, làm theo thứ tự. Số liệu là điểm xuất phát do Claude đặt, cân lại bằng mô phỏng.

### Giai đoạn 4: Chiến dịch (Campaign V2 xong phần code và QA, chờ Shan duyệt phát hành)

| # | Việc | Ghi chú |
|---|---|---|
| 4.1 | Chương 1 "Cờ lau dẹp loạn": 13 màn, lương mang sang, doanh trại, luật màn, trang `/campaign` | **Đã thay bằng Campaign V2 (4.7) và gỡ ở CAMP-08.04 (25/10/2026).** Đã làm (19/10/2026). Sứ quân là nhân vật lịch sử có bộ 6 kỹ năng như Đinh Bộ Lĩnh |
| 4.2 | Tướng lịch sử gia nhập khi qua màn: Nguyễn Bặc, Đinh Điền, Lê Hoàn, Trịnh Tú, Lưu Cơ, Đinh Liễn | Đã làm (20/10/2026). Bộ 3 nghề + 2 hệ + 1 chiêu riêng từ 22/10/2026, nâng theo ô như nhân vật chính; ra trận như nhân vật kèm |
| 4.3 | Chiêu riêng cho từng sứ quân (1 tuyệt chiêu mang dấu ấn lịch sử) và thoại trước/sau trận | Đã làm (20/10/2026). Chiêu riêng thay ô 5 cho 12 sứ quân và 6 tướng lịch sử; 3 câu thoại mỗi màn |
| 4.4 | (Bản 13 màn, đã gỡ; Campaign V2 cân ở CAMP-09.02) Cân độ khó chiến dịch bằng mô phỏng: người chơi cày bình thường qua được màn trước ở cấp gợi ý | Đã làm (20/10/2026). `pnpm sim -- --stage all`, thêm `--sweep 2..5` và `--team default` khi cần; cấp gợi ý riêng từng màn, mọi màn ≥50% thắng ở cấp gợi ý |
| 4.5 | Đánh trùm: đánh lại sứ quân đã hạ ở mức khó cao hơn, luật "sân nhà", thưởng riêng | Đã làm (20/10/2026). 3 bậc, sân nhà theo nguyên tố, thưởng vàng và trang bị lần đầu. Từ 25/10/2026 chỉ 6 sứ quân bị đánh dẹp, mở theo mốc Campaign V2 (Shan chốt); xem [Chế độ chơi](design/09-che-do-choi.md#22-đánh-trùm-claude-đặt-20102026-chuyển-sang-campaign-v2-ở-camp-0804) |
| 4.6 | Bảng xếp hạng (BXH) | Đã làm (20/10/2026). Từ CAMP-08.04: chiến dịch theo số nhiệm vụ V2 rồi tổng lượt nhiệm vụ có trận, bảng `mission:<M..>` cho từng nhiệm vụ có trận, leo tháp, sinh tồn, đấu trường; xem [Chế độ chơi](design/09-che-do-choi.md#23-bảng-xếp-hạng-claude-đặt-20102026-chuyển-sang-campaign-v2-ở-camp-0804) |
| 4.7 | Campaign V2: 6 chương, 24 nhiệm vụ M01–M24 (965–968), sự kiện/ngoại giao/trận, sử liệu có nhãn nguồn, thưởng vàng lần đầu (không đá) | Code và QA xong (chuỗi CAMP-02.03 → CAMP-09.04, 24–25/10/2026, chưa commit). [Cân bằng](campaign-v2/balance-report.md) GO, [hồi quy](campaign-v2/regression-report.md) không có P0/P1, [nghiệm thu cuối](campaign-v2/final-acceptance.md) |
| 4.8 | (Ngoài phạm vi, để sau) Hậu truyện 970–971: niên hiệu Thái Bình (970), đặt quan chức (khoảng 971) | Chưa làm. Hiện chỉ là ghi chú nguồn ở M24; cần nguồn và freeze riêng trước khi dựng cảnh |

### Giai đoạn 5: Chế độ thêm

| # | Việc |
|---|---|
| 5.1 | Leo tháp: máu và lương mang sang giữa các tầng, chọn 1 trong 3 phần thưởng. Đã làm (20/10/2026), trang `/tower`, xem [Chế độ chơi](design/09-che-do-choi.md#31-bản-đầu-claude-đặt-20102026-chờ-shan-duyệt) |
| 5.2 | Thử thách hằng ngày: seed chung mỗi ngày, xếp hạng. Đã làm (20/10/2026), trang `/daily`, xem [Chế độ chơi](design/09-che-do-choi.md#51-thử-thách-hằng-ngày-claude-đặt-20102026-chờ-shan-duyệt) |
| 5.3 | Sinh tồn: đối thủ theo đợt, báo trước, hồi sinh. Đã làm (20/10/2026), trang `/survival`, xem [Chế độ chơi](design/09-che-do-choi.md#41-bản-đầu-claude-đặt-20102026-chờ-shan-duyệt) |
| 5.4 | Nhiệm vụ ngày/tuần, thành tựu, điểm danh. Đã làm (20/10/2026), trang `/quests`, xem [Chế độ chơi](design/09-che-do-choi.md#52-nhiệm-vụ-thành-tựu-điểm-danh-claude-đặt-20102026-chờ-shan-duyệt) |
| 5.5 | Đấu trường bóng ma (PvP không đồng bộ). Đã làm (20/10/2026), trang `/arena`, xem [Chế độ chơi](design/09-che-do-choi.md#53-đấu-trường-bóng-ma-claude-đặt-20102026-chờ-shan-duyệt) |
| 5.6 | Song Tháp: Trial 20 tầng, quét ngày, Destiny theo chu kỳ và Đá Cường Hóa. Code/automated QA đã hoàn tất trên `update/tower`; trạng thái release là **Trial GO có điều kiện, Destiny ADJUST**. Xem [nghiệm thu T06.04](dual-tower/06-04-final-acceptance.md). |

### Giai đoạn 6: Đánh bóng và phát hành

| # | Việc |
|---|---|
| 6.1 | Chân dung và trang bị vẽ thật (họa sĩ hoặc Shan tạo theo [13-hinh-anh](design/13-hinh-anh.md)); đồ họa, hoạt ảnh nhân vật và hiệu năng theo [Kế hoạch đồ họa](design/15-ke-hoach-do-hoa.md#9-lộ-trình-triển-khai) (bước Đ0–Đ9) |
| 6.2 | Âm thanh, nhạc nền, hiệu ứng đánh |
| 6.3 | Hướng dẫn chơi lần đầu (màn cờ lau làm màn hướng dẫn) |
| 6.4 | Kiểm tra trên điện thoại, hiệu năng, chốt tên miền, đưa develop lên main |
| 6.5 | Gate Song Tháp: staging migration có backup, browser/device smoke, CI sau merge `develop`, bổ sung cờ bật riêng Trial/Destiny; chưa mở cường hóa trang bị |

### Cách làm để không mất việc

- Mỗi PR nhỏ, đẩy commit sớm; phần đang làm dở luôn nằm trên nhánh, không chỉ trên máy.
- Mô phỏng dài chạy nền và ghi kết quả vào tài liệu, không dán cả bảng vào trò chuyện.
