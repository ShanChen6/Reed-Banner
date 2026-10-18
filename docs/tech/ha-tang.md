# Hạ tầng & chống gian lận

> Cập nhật: 18/10/2026

## 1. Nguyên tắc

**Server là nguồn sự thật duy nhất. Client chỉ gửi *ý định*, không bao giờ gửi *kết quả*.**

## 2. Trận đấu (server có thẩm quyền)

- Mỗi nước đi và mỗi lần dùng kỹ năng được gửi lên server (ví dụ `POST /battle/:id/move`). Server kiểm tra hợp lệ, lưu, sinh ô rơi **sau khi** nhận hành động, rồi trả kết quả.
- Server đếm đồng hồ 30 giây mỗi lượt (ghi `deadline`), cộng 3 giây ân hạn.
- **Hết giờ được xử lý kiểu "tính lười"** (Shan chốt 18/10/2026), vì Route Handlers trên Vercel không có tiến trình chạy nền và không dùng dịch vụ hẹn giờ ngoài:
  - Người chơi còn mở tab: tới `deadline`, client tự gửi request báo hết giờ. Server tự kiểm tra `now > deadline`, ghi mất lượt, chạy lượt AI và trả kết quả trong cùng response. Gửi sớm thì bị từ chối.
  - Không có request nào: không ai chuyển lượt. Request kế tiếp (nước đi, F5) sẽ chạy bù mọi lượt đã quá hạn trước khi xử lý.
  - **Người chơi bỏ đi:** AI đánh tiếp tới khi trận kết thúc (phe người chơi mất lượt liên tục). Khi chạy bù, AI dùng cách chấm điểm nhẹ nhất (xem [AI](../design/10-ai.md#chấm-điểm-theo-độ-khó)).
  - Không bao giờ quay lại: việc định kỳ 24 giờ chốt trận.
  - Chỉ PvP đồng bộ mới cần server chạy liên tục; hiện chưa có chế độ đó.
- Client chạy animation trong lúc chờ server để che độ trễ (khoảng 50–150 ms), nhưng **chỉ chạy phần biết chắc**: đổi ô, nổ bộ ghép đầu, ô cũ rơi xuống lấp chỗ. Ô mới và mọi bộ ghép tiếp theo chỉ hiện khi server trả về, kể cả khi ô cũ rơi xuống đã thẳng hàng (ô mới có thể nối dài bộ ghép đó). Nhờ vậy không bao giờ phải rút lại hình ảnh.
- Lợi ích: client không đọc trước được seed, không thể quay lui; F5 khôi phục đúng nước cuối cùng.
- **Bắt buộc online.** Mất mạng giữa trận thì **đồng hồ không dừng**: server không phân biệt được rớt mạng với bỏ đi, và dừng đồng hồ thì ai cũng có thể tắt wifi để có thời gian vô hạn. Rớt mạng ngắn có thể mất lượt; rớt lâu thì xử như bỏ đi.
- **Chế độ Luyện tập** chạy offline: không nhận thưởng, không lưu tiến độ.
- **Trận dở** được tiếp tục; quá **24 giờ** không hoàn thành thì xử thua.
- Logic game là **TypeScript thuần, xác định theo seed**, dùng chung cho client (dự đoán, hiển thị) và server (thẩm quyền).


## 3. Database

- **Postgres** (Neon hoặc Supabase) là nguồn sự thật duy nhất, cho cả tài sản người chơi lẫn trận đang diễn ra. Dùng kèm ORM (Prisma hoặc Drizzle).
- **Chống ghi trùng nước đi:** cột `move_seq`, cập nhật kèm điều kiện `WHERE move_seq = :expected`.
- **Kinh tế:** mọi thao tác trong transaction, kèm ràng buộc `CHECK (gold >= 0)`.
- **Notion** chỉ dùng cho **dữ liệu thiết kế** (nhân vật, kỹ năng, trang bị, màn chơi, lời thoại). Đồng bộ thành file tĩnh trong repo, không gọi Notion lúc đang chơi.

## 4. Tài khoản

- Đăng nhập **OAuth Google + GitHub** (Auth.js).
- **Khách:** tài khoản ẩn danh trên server, xác định bằng cookie đã ký. Chơi đúng luồng online như người đăng ký. Liên kết OAuth thì chỉ gắn danh tính vào tài khoản đó, không cần gộp dữ liệu.
- Tài khoản khách **không hoạt động 30 ngày thì bị xóa**. Có cảnh báo mất dữ liệu nếu không đăng ký.
- Tạo tài khoản (kể cả khách) là lúc người chơi chọn nguyên tố ban đầu cho nhân vật chính (nghề mặc định Tướng sĩ, đổi được trước mỗi trận).

## 5. Bảng xếp hạng

- Xếp theo **tiến độ chiến dịch** (không phải trọng tâm của game).
- **Biệt danh:** tự đặt khi lần đầu có mặt trên BXH; 3–16 ký tự, cho phép tiếng Việt có dấu; không trùng (không phân biệt hoa thường và dấu); lọc từ thô tục; đổi tối đa 1 lần mỗi 30 ngày.
- Khách có mặt trên BXH với nhãn **"Khách"**.

## 6. Những gì cố ý không chặn

- Bot hoặc solver chơi hộ (giảm bằng giới hạn số trận mỗi giờ nếu cần; giới hạn này không chặn được bot ở Sinh tồn vì đó là một trận duy nhất).
- Cày vàng và sách bằng cách kéo dài trận (xem [Tiến trình & kinh tế](../design/08-tien-trinh-kinh-te.md#2-vàng)).
- Nhiều tài khoản (giảm nhờ chỉ dùng OAuth).
