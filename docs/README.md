# Tài liệu Cờ Lau (Reed Banner)

> Cập nhật: 20/10/2026

## Mục lục

**Thiết kế game** (`design/`)

| File | Nội dung |
|---|---|
| [00-tong-quan.md](design/00-tong-quan.md) | Ý tưởng, nguồn gốc, nguyên tắc clean-room |
| [01-ban-co.md](design/01-ban-co.md) | Bàn cờ 12×8, loại ô, luật ghép, ô đặc biệt, sinh ô, đồng hồ 30 giây |
| [02-tran-dau.md](design/02-tran-dau.md) | Thể thức 1vs1 và 3vs3, lượt, mục tiêu, máu & thời lượng |
| [03-tai-nguyen-cong-thuc.md](design/03-tai-nguyen-cong-thuc.md) | Lương, sĩ khí, năng lượng, nộ, công thức sát thương |
| [04-hieu-ung.md](design/04-hieu-ung.md) | Hiệu ứng trạng thái |
| [05-nguyen-to.md](design/05-nguyen-to.md) | 7 nguyên tố, khắc chế, hệ số trang bị, dấu ấn |
| [06-nhan-vat-ky-nang.md](design/06-nhan-vat-ky-nang.md) | Mô hình nhân vật, nghề & nội tại, luật dùng kỹ năng, chiêu nghề |
| [07-trang-bi.md](design/07-trang-bi.md) | 9 ô trang bị, thưởng bộ, phẩm màu, ghép nâng bậc |
| [08-tien-trinh-kinh-te.md](design/08-tien-trinh-kinh-te.md) | Kinh nghiệm, cấp, vàng, cửa hàng |
| [09-che-do-choi.md](design/09-che-do-choi.md) | Luyện tập, Thường, Chiến dịch, Đánh trùm, Leo tháp, Sinh tồn |
| [10-ai.md](design/10-ai.md) | AI Tianwu |
| [11-giao-dien.md](design/11-giao-dien.md) | Bố cục màn hình trận đấu, điều khiển (vuốt, click, bàn phím) |
| [12-ky-nang-nhan-vat-chinh.md](design/12-ky-nang-nhan-vat-chinh.md) | 49 kỹ năng của nhân vật chính theo 7 nguyên tố |
| [13-hinh-anh.md](design/13-hinh-anh.md) | Phong cách và bảng màu bộ hình SVG, bản yêu cầu cho họa sĩ |
| [14-nhan-vat.md](design/14-nhan-vat.md) | Danh sách 61 nhân vật: 42 tướng thường, 6 tướng lịch sử, 12 sứ quân, kỹ năng riêng, cân bằng |
| [15-ke-hoach-do-hoa.md](design/15-ke-hoach-do-hoa.md) | Kế hoạch đồ họa và hoạt ảnh: art bible, kỹ thuật hoạt ảnh nhân vật, làm nhẹ ảnh, chống giật lag, trang trí, lộ trình Đ0–Đ9 (đề xuất) |
| [16-prompt-nhan-vat.md](design/16-prompt-nhan-vat.md) | Prompt Copilot ráp sẵn cho 63 hình toàn thân: Đinh Bộ Lĩnh 3 thời kỳ, 6 tướng lịch sử, 12 sứ quân, 42 tướng thường |
| [17-prompt-do-hoa.md](design/17-prompt-do-hoa.md) | Prompt Copilot ráp sẵn cho đồ họa ngoài nhân vật: 42 trang bị, 21 ô bàn cờ, 54 lớp nền trận, mẫu giao diện, tranh lớn, linh vật, hạt hiệu ứng |

**Kỹ thuật** (`tech/`)

| File | Nội dung |
|---|---|
| [kien-truc.md](tech/kien-truc.md) | Công nghệ, sơ đồ, tích hợp ShanVerse |
| [ha-tang.md](tech/ha-tang.md) | Server có thẩm quyền, database, tài khoản, BXH, chống gian lận |

**Quản lý**

| File | Nội dung |
|---|---|
| [lo-trinh.md](lo-trinh.md) | Lộ trình theo giai đoạn |
| [cau-hoi-mo.md](cau-hoi-mo.md) | Mọi câu hỏi còn mở (TODO) |
| [nhat-ky-thay-doi.md](nhat-ky-thay-doi.md) | Các quyết định thiết kế theo ngày |

## Quy ước viết docs

- Viết bằng tiếng Việt. Tên biến, đường dẫn, lệnh giữ nguyên.
- Mỗi file một tiêu đề `#`, ngay dưới là dòng `> Cập nhật: dd/mm/yyyy`.
- Số liệu chưa qua mô phỏng cân bằng ghi rõ là **điểm xuất phát**.
- Việc chưa chốt ghi dạng `> TODO: ...` ngay tại chỗ, và **phải** có mặt trong [cau-hoi-mo.md](cau-hoi-mo.md). Đề xuất chưa được duyệt ghi rõ "đề xuất" hoặc "chờ chốt".
- Mỗi quyết định mới ghi một dòng vào [nhat-ky-thay-doi.md](nhat-ky-thay-doi.md).
- Một khái niệm chỉ định nghĩa ở **một** file; các file khác link tới đó thay vì chép lại.

## Thuật ngữ

| Thuật ngữ | Nghĩa |
|---|---|
| **Ô** | Một viên trên bàn cờ (Kiếm, Âm dương, Bánh chưng, Tim, Thỏi vàng, Sách, Trống trận) |
| **Bộ ghép** | Nhóm từ 3 ô cùng loại liền nhau |
| **Cascade** | Ô rơi xuống sau khi ăn tạo thành bộ ghép mới mà không cần người chơi kéo |
| **Lượt thêm** | Lượt đánh tiếp ngay, nhận được khi ghép từ 4 ô trở lên |
| **Ô đặc biệt** | Ô sinh ra từ bộ ghép chữ L/T (bản yếu) hoặc thẳng 5 (bản mạnh) |
| **Người hành động** | Nhân vật đang đánh trong lượt này của phe |
| **Nhân vật chính** | Đinh Bộ Lĩnh, nhân vật của người chơi, luôn ra trận |
| **Nhân vật kèm** | Hai nhân vật đi cùng nhân vật chính ở 3vs3 |
| **Nguyên tố** | Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Phong (trước đây gọi là ngũ hành) |
| **Nghề** | Tướng sĩ, Pháp sư, Binh lính, Y sư, Mưu sĩ, Quân sư; mỗi nghề gắn với một loại ô |
| **Chiêu nghề** | Kỹ năng nấc 1–2 chung theo nghề, chỉ tùy tướng AI ở chiến dịch còn dùng |
| **Tướng thường / Tướng lịch sử / Sứ quân** | Ba nhóm nhân vật kèm, xem [Danh sách nhân vật](design/14-nhan-vat.md) |
| **Dấu ấn** | Hiệu ứng phụ theo nguyên tố cộng vào chiêu nghề |
| **Nộ** | Thanh 0–100 của thủ lĩnh, tích từ ô Trống trận và khi mất máu; đầy thì kỹ năng bị động tự kích hoạt |
| **Thủ lĩnh** | Nhân vật mang thanh Nộ và kỹ năng bị động: nhân vật chính, hoặc nhân vật vị trí 1 của đội AI |
| **Lương / Sĩ khí** | Tài nguyên chung của phe và mức hệ số sát thương suy ra từ nó |
| **Tianwu** | AI điều khiển phe đối thủ |
| **Seed** | Số khởi tạo bộ sinh ngẫu nhiên của trận, chỉ nằm trên server |
