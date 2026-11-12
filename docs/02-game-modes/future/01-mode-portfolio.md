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
| **Tầm Tướng Ký** (trước gọi Liệt Truyện) | Không có route/engine | **APPROVED CONCEPT:** ghép hai yếu tố khởi đầu từ 7 hệ → vật liệu/tri thức → chân dung tướng có **công thức cuối riêng**; Shan chốt luật chính 03/11/2026 ở [Design Freeze](../tam-tuong-ky/design-freeze.md), phần còn lại chờ duyệt | Design / sau BP |
| Viễn Chinh | `/game/expedition`, sau cờ `EXPEDITION_ENABLED` | Shan chọn cơ chế "Hai đạo quân trên sa bàn" (04/11/2026); luật ở [GDD Viễn Chinh](../expedition/01-vien-chinh-gdd.md) | Có code, chờ chơi thử |
| **Khai Lộ** | `/game/clear-path`, bản chơi thử offline | Shan chốt tên 05/11/2026: giải đố một chạm xóa khối ô ngọc cùng loại (thể loại SameGame); luật ở [GDD Khai Lộ](../khai-lo/gdd.md) | Có code, chờ chơi thử |
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

- Có 8 nghề active (Tướng sĩ, Pháp sư, Binh lính, Y sư, Mưu sĩ, Quân sư và hai nghề mở rộng Xạ thủ, Sát thủ, bật bằng `NEW_PROFESSIONS_ENABLED` trong `src/core/battle/rules.ts`) và 7 hệ active (Kim/Mộc/Thủy/Hỏa/Thổ/Lôi/Phong). BP dùng registry riêng nên không tự đổi theo cờ này. (Sửa 03/11/2026 theo kiểm kê [LT-00](../tam-tuong-ky/design-freeze.md#22-mâu-thuẫn-và-điểm-cần-lưu-ý).)
- Chân dung nhân vật là biểu đạt hiển thị, **không** phải điều kiện khớp; điều kiện duy nhất là Nghề hoặc Hệ.
- Tránh để gallery art dày làm khó hiểu luật: phải luôn có icon nghề/hệ và preview các ô hợp lệ.
- Liệt Truyện tận dụng chân dung game, nhưng phải có kiểm toán recipe riêng theo **signature nhân vật**, không cố ghép `nghề+hệ` ra tướng trực tiếp. Không coi phép ghép tượng trưng là sự kiện lịch sử.
