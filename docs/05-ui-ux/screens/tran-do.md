# Giao diện Trận Đồ

> Cập nhật: 02/11/2026
> Trạng thái: **DRAFT** — cơ chế sa bàn là bản đồ đã có code với ảnh giữ chỗ; ảnh bản đồ thật, màn chọn chế độ và màn chơi chi tiết còn là đề xuất để Shan thảo luận.

Luật chơi ở [GDD Binh Pháp](../../02-game-modes/future/02-binh-phap-gdd.md); tài liệu này chỉ nói về giao diện. Màn chơi nằm ở `src/app/game/formation/`.

## 1. Quyết định của Shan (02/11/2026)

1. **Sa bàn là một tấm bản đồ** với ảnh nền riêng (sẽ có thiết kế ảnh riêng). Khi đặt quân vào, ô đó **sáng lên** và hiện mảnh bản đồ bên dưới. Cơ chế chơi giữ nguyên, chỉ đổi cách hiển thị.
2. **Ô chướng ngại** thiết kế lại cho hợp với bản đồ.
3. Nền ô đã có màu theo hệ nên **bỏ biểu tượng nghề và hệ dài dòng** trên quân.
4. Màn chế độ và màn chơi chi tiết chưa có ý tưởng: mục 5 và 6 là gợi ý để trao đổi.

## 2. Đã code (ảnh giữ chỗ)

- **Sương và ô sáng.** Ô chưa khai thông bị sương mực che (gần đục, viền đồng mờ); ô đã khai thông trong suốt, có viền sáng nhẹ và lộ bản đồ. Ô khai thông vẫn sáng sau khi quân bị dọn, đúng luật "vệt khai thông". Hai trạng thái chung một thuộc tính màu nên đổi qua lại có chuyển động 0,45 giây; tắt khi người dùng bật giảm chuyển động. Khai thông hết thì cả bản đồ hiện ra và viền ô mờ đi.
- **Bản đồ phủ cả sa bàn** (`background-size: cover`), không có khe giữa các ô để sương nối liền, không lộ bản đồ qua khe.
- **Quân** là chân dung tròn như một con cờ đặt lên bản đồ, có bóng đổ, viền theo hệ (màu của hệ đã nằm ở khung chân dung nên không vẽ biểu tượng hệ nữa), và **một** huy hiệu nghề tròn nhỏ ở góc dưới phải. Tên nghề và hệ vẫn có ở nhãn truy cập của ô và ở khung "Quân đang cầm". Quân dung hợp dùng huy hiệu sao đỏ thay cho huy hiệu nghề.
- **Chướng ngại là núi mực nho** (đỉnh có tuyết, chân sóng nước), ô bên dưới tối nhẹ nên núi nằm "trong" bản đồ thay vì là một ô xám. Chướng ngại không bao giờ bị sương che: bản đồ ở chỗ đó luôn hiện, như địa hình có sẵn.
- Ảnh giữ chỗ ở `src/app/game/formation/maps.ts`: các tranh nền chiến dịch có sẵn (không phải bản đồ nhìn từ trên xuống). Thay ảnh thật chỉ cần thả file vào `public/art/formation/` và đổi `src`.

## 3. Yêu cầu ảnh bản đồ (cho họa sĩ)

| Mục | Yêu cầu |
|---|---|
| Số ảnh | Mở đầu 4 ảnh, mỗi bậc một ảnh (Hướng dẫn, Thường, Khó, Đại trận); sau này là một kho ảnh, chọn theo seed của kỳ để mọi người trong kỳ thấy cùng một bản đồ |
| Khổ | **Vuông 2048×2048**, WebP. Sa bàn từ 3×3 đến 10×10 và hình chữ nhật 7–10 mỗi cạnh nên ảnh được cắt theo tỉ lệ bàn; **mọi chi tiết quan trọng nằm trong 80% giữa ảnh** |
| Phong cách | Bản đồ vẽ tay trên giấy dó, nhìn chếch từ trên xuống, mực nâu và màu đất nhạt, thế kỷ X Đại Việt (sông, núi, làng, thành, đường); khớp [art bible](../../06-art/art-bible.md) |
| Độ tương phản | Trung bình, màu hơi nhạt: **chân dung quân tròn phải đọc rõ khi đặt lên bất kỳ chỗ nào**. Tránh vùng trắng cháy và vùng đen đặc |
| Chi tiết | Ô chỉ cỡ 1/10 ảnh, nên cần địa vật đủ lớn để nhận ra khi mới lộ vài ô (một khúc sông, một mái nhà, một đoạn tường thành), không cần chi tiết nhỏ |
| Cấm | Chữ, số, lưới ô, khung UI, hình người đọc được mặt (tránh trùng chân dung quân), watermark |
| Địa danh | Tên địa danh hiện bằng chữ của UI khi hoàn thành bản đồ (`place` trong `maps.ts`), không vẽ chữ vào ảnh. Nội dung lịch sử gắn nhãn recorded/reconstructed/fictional theo [sổ nguồn sử](../../02-game-modes/campaign/history-sources.md) |

Prompt gốc đề xuất cho một ảnh (đổi địa điểm theo từng bậc, ví dụ Hoa Lư, Bố Hải Khẩu):

> "Hand-painted 10th-century Vietnamese strategic map on aged mulberry paper, seen from a high oblique angle, rivers and limestone mountains, a walled citadel, villages with thatched roofs, dirt roads, muted ink brown and earthy greens, soft mid-tone contrast, no text, no numbers, no grid, no UI, no faces, no watermark, square composition with the important landmarks inside the central 80%."

Núi chướng ngại hiện là biểu tượng vẽ bằng SVG phủ lên ô. Nếu họa sĩ muốn, có thể vẽ **bốn biến thể địa hình** (núi, rừng, đầm lầy, thành lũy), mỗi ô chọn một biến thể theo vị trí để không lặp; luật không đổi, chỉ khác hình.

## 4. Còn thiếu và rủi ro

- Ảnh thật chưa có, nên chưa đánh giá được độ rõ của quân và độ sương trên ảnh thật; cần chỉnh độ mờ của sương (đang 94%) khi có ảnh.
- Ô nhỏ trên điện thoại (bàn 10×10 còn khoảng 33px, dưới mức 44px của nút điều khiển); hiện bù bằng chân dung tròn gọn và không có biểu tượng hệ.
- Chưa có chuyển động khi dọn hàng/cột (hiện chỉ có tin nhắn dưới sa bàn) và chưa có âm thanh (DEFERRED theo [tổng quan](../../02-game-modes/future/README.md)).
- Hệ không còn biểu tượng trên quân: người mù màu phân biệt hệ qua nhãn truy cập và khung chân dung; cần kiểm tra thêm. Phương án dự phòng: ký hiệu nhỏ trên viền chân dung theo hệ.

## 5. Gợi ý cho màn chọn chế độ (để trao đổi, chưa chốt)

Hiện màn là hai cụm thẻ chữ (Xếp hạng, Chơi thường). Đề xuất đi theo hướng "mỗi bậc là một tấm bản đồ":

- **Thẻ bậc là ảnh bản đồ mờ sương**: thẻ hiện bản đồ của bậc với phần sương che, phần đã chơi lộ ra theo kết quả tốt nhất của người chơi (một thước đo trực quan thay cho con số).
- **Hai chế độ thành hai tab** (Xếp hạng, Chơi thường) hoặc một dòng chuyển, thay vì xếp dọc dài; xếp hạng đứng đầu khi cờ bật.
- **Đồng hồ kỳ**: "còn 5 giờ" ngay trên thẻ xếp hạng, kèm hạng hiện tại và thưởng sẽ nhận nếu giữ nguyên hạng.
- **Thang thưởng** gọn dạng bậc thang (hạng nhất, top 3, …) thay cho bảng chữ, người chơi thấy mình đang đứng bậc nào.
- **Bậc khóa** hiện gợi ý "thắng Thường để mở Khó" nếu sau này muốn có tiến trình (hiện không khóa).
- **Mỗi bản đồ một địa danh** và một dòng giới thiệu ngắn, mở bộ sưu tập địa danh đã hoàn thành (hướng cho phần thưởng không phải vàng sau này).

## 6. Gợi ý cho màn chơi chi tiết (để trao đổi, chưa chốt)

- **Bản đồ là trung tâm**, chiếm tối đa chiều cao màn hình; bảng điều khiển gọn bên phải (desktop) hoặc **thanh dưới màn hình** (điện thoại) chứa quân đang cầm và nút Bỏ Lệnh để ngón tay cái chạm tới.
- **Quân đang cầm** là một "lệnh bài" lớn có tên, nghề, hệ; thanh Bỏ Lệnh vẽ như ba ngọn đuốc hoặc ba vạch lửa thay cho thanh ngang.
- **Tiến độ khai thông** là phần trăm và là chính bản đồ sáng dần; bỏ các dòng thống kê khô (quân đã đặt, hàng đã dọn) xuống thẻ phụ.
- **Gợi ý ô đặt được** chỉ hiện khi rê/chạm giữ, hoặc nút bật tắt, để bản đồ không bị chấm dày; mặc định bật ở bậc Hướng dẫn.
- **Hiệu ứng dọn hàng**: một vệt sáng quét qua hàng hoặc cột rồi quân tan; ô giữ ánh sáng.
- **Màn kết quả** hiện cả bản đồ hoàn chỉnh kèm địa danh và điểm, nút chia sẻ ảnh bản đồ (ý tưởng sau).
- **Hướng dẫn từng bước** ở bậc 3×3 bằng lớp phủ chỉ ô, thay cho bảng luật dài.

## 7. Câu hỏi cho Shan

1. Một ảnh bản đồ cho mỗi bậc, hay một kho ảnh xoay theo kỳ (Thường và Khó đổi mỗi ngày, Đại trận đổi mỗi tuần)?
2. Núi chướng ngại giữ một kiểu, hay bốn biến thể địa hình (núi, rừng, đầm lầy, thành lũy)?
3. Bản đồ lấy địa danh có thật của thời Loạn 12 sứ quân (Hoa Lư, Bố Hải Khẩu, Đằng Châu, …) hay hư cấu?
4. Chọn hướng nào ở mục 5 và 6 để làm trước?
