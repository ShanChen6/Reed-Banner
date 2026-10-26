# 02 — BINH PHÁP: Game Design Document v0.1

**Trạng thái:** APPROVED CONCEPT + PROPOSED RULE BASELINE, cần BP-00 sign-off trước triển khai.

## 1. Định vị

**Tên:** Binh Pháp · Bày Trận. Một game logic xếp quân trong Reed Banner. Người chơi bày **quân lệnh mang chân dung tướng**, mỗi quân có đúng hai thuộc tính máy kiểm tra: **nghề** và **hệ**. Mục tiêu khai thông toàn bộ ô của sa bàn. Không có đòn đánh, HP, Tinh thần, combo kỹ năng, trang bị, lượt AI, cascade hay phép đổi hai ô match-3.

**Nguồn cảm hứng:** quy tắc placement puzzle của Alchemy Deluxe, không sử dụng asset/logo/code/UI/sfx gốc. Các quân trên màn là nhân vật và văn hóa mỹ thuật của Reed Banner.

## 2. Thuật ngữ và dữ liệu

- **Bàn / board:** lưới ô 2D (đề xuất MVP 8x8), có một tầng lưu `covered` (ô đã khai thông) độc lập tầng quân đang chiếm `occupant`.
- **Quân / piece:** `{pieceId, characterId, profession, element, kind}`. `characterId` để render ảnh; chỉ `profession/element/kind` chi phối luật đặt.
- **Quân thường:** nghề thuộc 6 nghề active, hệ thuộc 7 hệ active; có chân dung nhân vật được chọn qua catalog kiểm soát.
- **Bộ quân / pool:** danh sách quân có thể sinh trong một độ khó, không phụ thuộc tướng tài khoản sở hữu ở MVP.
- **Quân chờ:** quân hiện tại; **Quân kế:** hiển thị hay ẩn là tham số cân bằng (MVP đề nghị chỉ hiện quân hiện tại).
- **Quân Lệnh:** wild; **Thu Hồi:** eraser; **Bỏ Lệnh:** discard làm nóng thanh rủi ro.
- **Trận địa đã khai thông:** `covered=true`; vẫn giữ sau khi xóa quân.

## 3. Luật đặt quân thường — đủ chặt để test

Chọn ô (r,c) trong biên. Ô đó phải trống và hợp lệ.

- Khi bàn **hoàn toàn không có quân**, quân thường có thể đặt vào **bất kỳ ô trống nào**.
- Khi bàn **có từ một quân trở lên**, ô mới phải giáp **ít nhất một quân** theo 4 hướng trên/dưới/trái/phải (không tính chéo).
- Với **từng quân kề** theo 4 hướng, quân mới phải thỏa `sameProfession || sameElement`. Khớp nghề với quân A nhưng khớp hệ với quân B vẫn hợp lệ.
- Nếu có bất kỳ quân kề thường nào không thỏa thì **không** được đặt, dù đã khớp với quân khác.
- Đặt không hợp lệ không tiêu quân/không thay turn hay progress/không gọi RNG, chỉ hiện giải thích UI.
- Khi đặt hợp lệ: tạo occupant, đặt `covered[r][c] = true`, xử lý hàng/cột hoàn tất, cập nhật thanh Bỏ Lệnh, điểm số và sinh quân kế theo thứ tự deterministic.

Ví dụ: trên là Y sư–Kim, trái là Pháp sư–Hỏa ⇒ quân Y sư–Hỏa hợp lệ. Không dùng quan hệ tương sinh/tương khắc làm điều kiện khớp — yếu tố đặc trưng ở đây là **bằng nhau**, dễ học.

## 4. Hàng/cột, đồng thời và điều kiện thắng

- Hàng đủ mọi ô occupant → clear toàn bộ quân hàng đó; cột đủ → clear toàn bộ quân cột đó.
- Nếu hàng và cột đồng thời đầy ở cùng lượt, lấy **hợp union các ô**, chỉ xóa mỗi quân một lần, cộng thành tích đúng một lần/line.
- Không xóa vệt `covered`, không spawn rơi quân hay cascade.
- Sau clear, khi không còn occupant, lượt tiếp theo có thể đặt ở ô bất kỳ, trừ khi đã thắng.
- Thắng khi **mọi ô `covered=true`**. Ưu tiên kiểm tra thắng sau khi đặt/clear trước khi sinh quân mới. Không cần lấp đồng thời tất cả 64 ô.
- Score đề xuất làm biến tham số: điểm cho đặt hợp lệ, hàng/cột, hoàn thành bàn; chưa khóa con số và hệ số cho tới mô phỏng.
- Mỗi ván một bàn được khai thông toàn bộ để thắng MVP; chế độ vô hạn nhiều board/bảng xếp hạng làm sau.

## 5. Rủi ro Bỏ Lệnh / Forge

- Nút **Bỏ Lệnh** bỏ quân hiện tại dù có nước hợp lệ; chuyển sang quân tiếp theo; rủi ro tăng 1.
- Đề xuất v0.1: thanh từ 0 đến 3, **bỏ quân thứ tư liên tiếp khi thanh đầy ⇒ thua**; đặt quân thành công hạ thanh 1 (không âm), hoàn tất line có thể làm nguội về 0. Cách giảm thanh khi clear cần mô phỏng và chốt tại BP-00.
- Nếu quân hiện tại không có nước đặt nào: người chơi được bỏ, không auto-discard ẩn.
- Không nên cho “undo” trong mode tính điểm có thưởng; có thể thêm Undo trong tutorial/offline và đánh dấu không tính xếp hạng.

## 6. Quân đặc biệt (đề xuất mô tả chuẩn, xác suất CHƯA khóa)

- **Quân Lệnh / Wild:** đặt vào ô trống bất kỳ, kể cả không liền kề; quân thường đặt cạnh wild tự động coi wild là khớp. Các quân thường kề khác **vẫn phải** match từng quân. Wild vẫn có thể hoàn tất line và đánh dấu covered.
- **Thu Hồi / Eraser:** đặt lên một ô **đang có quân**, xóa occupant nhưng giữ covered; không coi là quân để hoàn thành line. MVP cần chốt có cho hủy wild hay không (đề nghị có).
- Cả hai xuất hiện trong pool theo xác suất/ràng buộc anti-streak được version hóa; không bán/tiêu vàng để mua trong MVP.
- Không kích hoạt chiến đấu hay kỹ năng tướng khi có wildcard/eraser. Tên hình minh họa và biểu tượng hoàn toàn mới.

## 7. Chế độ con và độ khó

**MVP = Bày Trận (không giới hạn thời gian, offline local prototype, 1 board/run).**
- Gợi ý bước học: tutorial 3x3 với 2 nghề/2 hệ; 5x5 với 3×3; 8x8 đầy đủ nhưng pool nghề/hệ **không** mặc định là 6×7.
- Đề xuất phiên chuẩn 8x8, pool ban đầu 3 nghề × 3 hệ (tối đa 9 kiểu, nhiều chân dung đại diện), mở dần 4×4 và các tập khó hơn.
- **Tốc chiến** (đếm thời gian) và **Thế Trận Định Sẵn** (puzzle authored) là BACKLOG, không hiển thị playable.
- Binh Pháp không phụ thuộc sở hữu tướng; không đọc gear/tier/cấp/điểm kỹ năng để tính hợp lệ.

## 8. Tương tác MVP

- Mỗi quân hiển thị chân dung ở trung tâm, hai icon nghề/hệ ở góc, màu hệ có text/shape dự phòng.
- Click/chạm vào ô hợp lệ để đặt; các ô hợp lệ hiển thị highlight tùy chọn, có nút Bỏ Lệnh / Thu Hồi rõ ràng, meter Bỏ Lệnh và progress covered `n/(w*h)`.
- Hover/focus bất kỳ ô: giải thích không hợp lệ: không kề / sai nghề và hệ / ô bị chiếm.
- Keyboard: di chuyển ô bằng arrows, Enter/Space đặt; Tab tới nút điều khiển; Escape đóng help.
- Mobile: bàn cờ lớn nhất, HUD current piece thu gọn, không cần nhìn đủ tên tướng ở từng ô; tap>=44px cho điều khiển, tránh ép mỗi ô 44px khiến bàn 8x8 tràn khung nhỏ.

## 9. Điều không đưa vào MVP

- Match-3 battle, tác động HP/ATK/SPIRIT, tướng sở hữu ảnh hưởng RNG, shop vật phẩm, PVP real-time, đồng đội, voice/SFX.
- Vàng/đá nhận được bằng client-only score. Chỉ sau khi server xác thực ván và economy review mới có thưởng/BXH.
- Không bắt buộc art mới cho cả 42 cặp nghề×hệ; trước hết ánh xạ portrait sẵn có.

## 10. Danh sách câu hỏi cần Shan sign-off tại BP-00

1. Kích thước chơi chính thức 8×8 hay biến theo cấp (đề xuất 8×8).
2. Giá trị discard cooling: thành công -1, clear row reset 0? (đề xuất như trên).
3. Wild/eraser có trong MVP hay mở ở P1 (đề xuất bao gồm, nhưng bật bằng cấu hình luật).
4. Score weights, difficulty tier, xác suất sinh special, liệu có preview quân kế (đề xuất chưa preview).
5. Offline practice trước hay server-authoritative ngay ngày phát hành (đề xuất prototype offline, production reward server).

**Không giả định các phương án đề xuất này đã được user phê duyệt.**
