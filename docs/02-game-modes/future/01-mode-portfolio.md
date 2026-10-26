# 01 — Danh mục chế độ: trạng thái, tên gọi, ưu tiên

> Source of truth đối với cơ chế hiện hành: docs/02-game-modes/README.md và code develop. File này chỉ ghi **thay đổi định hướng tương lai**, không sửa luật đã chạy.

| Luồng | Hiện tại trong code | Quyết định / định hướng | Quy mô |
|---|---|---|---|
| Chiến dịch | 6 chương, 24 nhiệm vụ M01–M24 | Giữ nguyên, tiếp tục polish Atlas | Đã có |
| Đánh thường | 1vs1/3vs3 match-3 online, setup lobby | Giữ và polish HUD | Đã có |
| Chơi thử offline | Không lưu/thưởng | Giữ, cùng battle setup | Đã có |
| Đánh trùm | 6 sứ quân x 3 bậc, thuộc Campaign | Giữ như nhánh phụ của Campaign | Đã có |
| Tháp Thí Luyện | 20 tầng hiện tại, đợt content cố định | **APPROVED DIRECTION:** về lâu dài có thể thêm tầng >20; **không** vô hạn giả khi còn hardcode 20 | Future |
| Tháp Vận Mệnh | 10 tầng/chu kỳ, 7 ngày | **APPROVED DIRECTION:** giới hạn hữu hạn; **PROPOSED TARGET:** tối đa 20 tầng mỗi chu kỳ sau audit/mô phỏng | Future |
| Sinh tồn | Wave survival, roster + BREAK, không HP thành | **APPROVED DIRECTION:** có thể đổi nhãn hiển thị thành **Thủ Thành**; **KHÔNG** tự thêm HP cổng thành | UI rename backlog |
| Thử thách ngày | Một lượt/ngày, đề chung và leaderboard | Giữ | Đã có |
| Đấu trường | 3v3 vs snapshot phòng thủ AI | Giữ, không gọi là real-time PvP | Đã có |
| **Binh Pháp** | Không có route/engine | **APPROVED CONCEPT:** game xếp quân theo Nghề + Hệ, chân dung nhân vật; thiết kế/triển khai mới | P0 new design |
| **Liệt Truyện — Tầm Tướng Ký** | Không có route/engine | **APPROVED CONCEPT:** ghép hai yếu tố khởi đầu từ 7 hệ → vật liệu/tri thức → chân dung tướng có **công thức cuối riêng**; luật chi tiết **PROPOSED, chưa chốt LT-00** | Design / sau BP |
| Viễn Chinh | Không có | Chưa tìm ra cơ chế đủ riêng; **DEFERRED** | Backlog |
| Thủ Thành riêng (HP thành) | Không có | **Không mở thành mode thứ hai** trùng Sinh tồn | Not planned |

## Phân biệt chính xác

1. **Thủ Thành là định hướng đổi nhãn Sinh tồn**, không phải quyết định thay đổi gameplay ngay. Nếu muốn mới thật (giữ cổng, HP thành, công trình) phải ra spec riêng. Không đổi tên endpoint/route/profile/bảng BXH hoặc key lưu save trong task UI.
2. **Trial hiện tại chỉ có 20 tầng**. Ý tưởng cho phép mở rộng không đồng nghĩa tăng số tầng ở thời điểm này; khi triển khai phải tách `TRIAL_FLOORS` khỏi trần validator, chuyển sang content registry có migration và bảo toàn receipt.
3. **Destiny hiện 10 tầng**, `DESTINY_CYCLE_FLOORS = 10`; tăng mục tiêu lên 20 chỉ sau kiểm nghiệm thời lượng run, fairness roster, reward frequency và cycle reset. Bản cũ đang giữa run phải xử lý bằng versioned snapshot, không tự cắt/ghép.
4. **Binh Pháp không phải biến thể Trial**: không đánh nhau, không chọn trận/đội 3v3, không swap, không cascade.
5. **Liệt Truyện khác Binh Pháp:** không có lưới xếp quân; recipe `A+B` khám phá nodes trong đồ thị, portrait là kết quả cuối. Khám phá **không** đồng nghĩa sở hữu/chiêu mộ nhân vật. Luật cụ thể xem [GDD Liệt Truyện](08-liet-truyen-gdd.md).
6. Thiết kế UI mode trên Home có thể hiển thị “Sắp ra mắt” khi đã được quyết định phát hành, nhưng không tạo đường dẫn dẫn đến trang rỗng.

## Ưu tiên đề nghị

1. Đóng băng đặc tả Binh Pháp BP-00, chạy prototype luật BP-01/02 và kiểm tra khả năng giải.
2. Chỉ làm UI/Art BP-03 khi mô phỏng sơ bộ chứng minh cơ chế chơi được và quân dễ đọc trên mobile.
3. Thêm progress/ranking/rewards khi có thiết kế dữ liệu và server chống gian lận.
4. Tách task “Thủ Thành” rename UI thành PR nhỏ nếu cần; giữ các nhãn nội bộ, API và leaderboard stable.
5. Lập LT-00 design freeze và vertical slice 3 nhân vật cho Liệt Truyện sau khi duyệt concept, không yêu cầu làm tranh cốt truyện mới.
6. Chuẩn bị nâng tầng Trial/Destiny ở một chương trình riêng; không trộn vào PR Binh Pháp.

## Rủi ro sản phẩm

- Có 6 nghề active (Tướng sĩ, Pháp sư, Binh lính, Y sư, Mưu sĩ, Quân sư) và 7 hệ active (Kim/Mộc/Thủy/Hỏa/Thổ/Lôi/Phong). Cung thủ và Sát thủ nằm trong danh mục thiết kế mở rộng, **chưa** active Battle Engine. BP dùng registry riêng để tránh tự bật hai nghề này.
- Chân dung nhân vật là biểu đạt hiển thị, **không** phải điều kiện khớp; điều kiện duy nhất là Nghề hoặc Hệ.
- Tránh để gallery art dày làm khó hiểu luật: phải luôn có icon nghề/hệ và preview các ô hợp lệ.
- Liệt Truyện tận dụng chân dung game, nhưng phải có kiểm toán recipe riêng theo **signature nhân vật**, không cố ghép `nghề+hệ` ra tướng trực tiếp. Không coi phép ghép tượng trưng là sự kiện lịch sử.
