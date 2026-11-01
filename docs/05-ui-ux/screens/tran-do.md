# Giao diện Trận Đồ

> Cập nhật: 02/11/2026
> Trạng thái: **DRAFT** — sa bàn là bản đồ, màn chế độ và màn chơi chi tiết đã có code với ảnh giữ chỗ; ảnh bản đồ, ô che và icon chướng ngại thật do Shan thiết kế; Shan test lần 1 rồi góp ý.

Luật chơi ở [GDD Binh Pháp](../../02-game-modes/future/02-binh-phap-gdd.md); tài liệu này chỉ nói về giao diện. Màn chơi nằm ở `src/app/game/formation/`.

## 1. Quyết định của Shan (02/11/2026)

1. **Sa bàn là một tấm bản đồ**; đặt quân vào thì ô sáng lên lộ mảnh bản đồ bên dưới; cơ chế chơi giữ nguyên.
2. **Một kho ảnh bản đồ xoay theo kỳ**, **địa danh thật của thời Loạn 12 sứ quân** (13 địa danh: Hoa Lư và 12 nơi của 12 sứ quân).
3. **Ô chưa mở** hiển thị bằng **ảnh che theo thiết kế**, đặc kín; **không** để ảnh mờ của bản đồ lộ ra vì dễ nhầm với ô đã mở.
4. **Chướng ngại có bốn biến thể** (núi, rừng, đầm lầy, thành lũy), cần icon riêng, không cần cầu kì nhưng có nét riêng; **ô chướng ngại không dùng ảnh bản đồ làm nền**.
5. **Quân** đủ huy hiệu nghề và hệ nhưng nhỏ vừa đủ.
6. **Hoàn thành một màn thì hiện ảnh đầy đủ** của màn đó.
7. **Chế độ tùy chỉnh** trong Chơi thường: chọn cột × hàng, nghề, hệ, quân đặc biệt (và chướng ngại).
8. Gợi ý giao diện màn chế độ và màn chơi: **triển khai trước**, Shan tham khảo thực tế rồi góp ý sau.

## 2. Đã code (ảnh giữ chỗ)

- **Kho bản đồ** (`maps.ts`): 13 địa danh lấy từ danh mục sứ quân của Campaign V2 (`WARLORD_ENCOUNTERS`) cộng Hoa Lư. Bản đồ của một ván chọn bằng `mapFor(bậc, theme)`; `theme` suy từ seed (chơi thường) hoặc từ muối bí mật (xếp hạng) và như nhau với mọi người trong cùng kỳ, mỗi bậc lệch một khoảng nên cùng kỳ các bậc không trùng bản đồ. Thường/Khó đổi bản đồ mỗi ngày, Đại trận mỗi tuần (theo kỳ xếp hạng).
- **Ô che đặc kín** (`public/art/formation/fog.svg`, ảnh giữ chỗ): nền sơn mài nâu với vân mây cuộn, đè hoàn toàn lên bản đồ. Ô mở thì ô che mờ dần (0,45 giây, tắt khi giảm chuyển động), ô trong suốt lộ bản đồ và viền sáng nhẹ. Ô vẫn sáng sau khi quân bị dọn (vệt khai thông).
- **Chướng ngại** (4 biến thể SVG giữ chỗ): núi (đỉnh nhọn có tuyết), rừng (cụm cây tán tròn), đầm lầy (mặt nước gợn và cỏ lau), thành lũy (tường có lỗ châu mai và cổng). Mỗi ô một kiểu theo vị trí (như nhau cho mọi người chơi cùng bàn). Ô chướng ngại có nền đá tối riêng, không lấy ảnh bản đồ.
- **Quân**: chân dung tròn có bóng như con cờ đặt lên bản đồ, kèm **hai huy hiệu tròn nhỏ**: hệ (nền theo màu hệ) ở đáy trái, nghề (nền tối) ở đáy phải; kích thước theo ô, không nhỏ hơn 11px. Quân dung hợp dùng một huy hiệu sao đỏ ở giữa đáy.
- **Hoàn thành**: quân và chướng ngại mờ đi (0,8 giây) để cả bản đồ hiện ra trên sa bàn, và khung kết quả hiện ảnh bản đồ đầy đủ kèm địa danh, một dòng giới thiệu và chú thích "tranh minh họa tái dựng, không phải bản đồ lịch sử chính xác" (theo [sổ nguồn sử](../../02-game-modes/campaign/history-sources.md): vị trí một số địa danh còn tranh luận, ví dụ Bình Kiều).
- **Tùy chỉnh** (`CustomForm.tsx`, trong Chơi thường): cột và hàng 3–10, chướng ngại 0–30%, Quân Lệnh 0–15%, Thu Hồi 0–10%, nhân vật dung hợp 0–10% (khóa tới khi có nhân vật được duyệt), chọn từng nghề (≥2) và từng hệ (≥2). Lựa chọn lưu ở máy; ván tùy chỉnh không ghi điểm cao nhất, không thưởng, không xếp hạng; engine kiểm lại giới hạn khi tạo và khi nạp ván.
- Ảnh giữ chỗ: tranh nền chiến dịch có sẵn (8 ảnh cho 30 bản đồ nên có lặp). Chúng cùng phong cách với ảnh thật sắp tới và cho thấy đúng hiệu ứng lộ dần.

## 3. Yêu cầu ảnh (cho họa sĩ)

**Prompt đầy đủ, dán được ngay, ở [prompt hình ảnh Trận Đồ](../../06-art/prompts/tran-do-hinh-anh.md)** (nguồn duy nhất, không lặp ở đây): 30 bản đồ (13 địa danh sứ quân và Hoa Lư, 7 địa danh Ngô – Đinh, 10 cảnh quan chung), ô che đặc kín và bốn icon chướng ngại. Kho **không giới hạn số ảnh**; cách thêm bản đồ mới ở mục 1.4 tài liệu đó.

Tóm tắt thông số: **tranh vẽ tay 2D điện ảnh đúng phong cách nền Bình Loạn** (cập nhật 02/11/2026, thay cho "bản đồ thủy mặc" của bản đầu vì ảnh tạo ra chưa đạt), ưu tiên vuông 2048×2048 WebP (16:9 vẫn dùng được, sa bàn cắt theo tỉ lệ bàn), chi tiết rải đều toàn khung, tông trung bình để chân dung quân đọc rõ; ô che lát được 256×256 đặc kín; icon chướng ngại 256×256 nền trong suốt.

## 4. Còn thiếu và rủi ro

- Ảnh thật chưa có: cần chỉnh lại độ tương phản của quân và ô che khi có ảnh thật.
- Ô nhỏ trên điện thoại (bàn 10×10 còn khoảng 33px, dưới mức 44px của nút điều khiển); hai huy hiệu bù bằng cỡ tối thiểu 11px nhưng vẫn rất nhỏ.
- Chưa có âm thanh (DEFERRED).
- Một số địa danh có định vị còn tranh luận (Bình Kiều); ảnh phải là tranh minh họa tái dựng và UI đã ghi chú như vậy.
- Kho có 30 bản đồ chọn theo băm nên một bản đồ có thể lặp lại trước khi hết vòng (không xoay tuần tự).

## 5. Màn chế độ (đã code, chờ Shan test lần 1)

Cấu trúc `ModeScreen.tsx`. Hai tab khi xếp hạng đang mở (**Xếp hạng · có thưởng**, **Chơi thường**); khi xếp hạng tắt chỉ có Chơi thường, không hiện tab.

- **Thẻ bậc là một tấm bản đồ** (`MapCard.tsx`): ảnh bản đồ phủ bằng ô che đặc kín từ trên xuống, phần đã khai thông lộ ra từ dưới lên theo tiến độ. Ở thẻ xếp hạng: chưa chơi thì che kín và **giấu cả tên địa danh** ("Bản đồ chưa lộ"), đang chơi thì lộ theo phần trăm khai thông, thắng thì lộ hết kèm tên. Thẻ chơi thường là bản đồ mẫu (đổi theo ngày, chỉ để trang trí) vì ván thật chọn ngẫu nhiên.
- **Đồng hồ kỳ** trên thẻ xếp hạng ("Còn 5 giờ 12 phút" theo giờ server, tự tải lại bảng khi kỳ hết), số người đã thắng, trạng thái ván.
- **Hạng hiện tại và thưởng dự kiến** (hạng/số người thắng, bậc thưởng, vàng) khi đã thắng, kèm lưu ý hạng còn đổi tới hết kỳ.
- **Thang thưởng dạng bậc thang** (`RewardLadder.tsx`): năm bậc cao thấp khác nhau, vàng từng bậc, bậc hiện tại của người chơi sáng lên.
- **Thưởng chờ nhận**, bảng xếp hạng top 10 mỗi bậc (gập), bảng thưởng đầy đủ (gập).
- **Bộ sưu tập địa danh** `n/30` lưu ở máy: khai thông trọn một sa bàn (chơi thường hay xếp hạng) thì thêm địa danh; chưa có thì hiện "? ? ?".
- Khách thấy tab xếp hạng chỉ có lời nhắc đăng nhập (không có bảng), chơi thường vẫn đầy đủ.

## 6. Màn chơi chi tiết (đã code, chờ Shan test lần 1)

- **Bản đồ là trung tâm**, vệt sáng quét qua hàng hoặc cột vừa dọn (0,7 giây; giảm chuyển động thì chỉ nháy sáng). Rê chuột hoặc dùng bàn phím lên ô thì dòng dưới sa bàn nói ô đó đặt được hay không và vì sao.
- **Lệnh bài** (`Hud.tsx`, `CommandCard`): tấm bài giấy dó có dấu son "LỆNH BÀI", chân dung lớn, tên, nghề, hệ hoặc công dụng quân đặc biệt.
- **Thanh Bỏ Lệnh là ba ngọn lửa**: mỗi lần bỏ một ngọn bùng lên, ngọn cuối đổi màu đỏ khi bỏ nữa là thua; đặt quân thì dịu đi.
- **Tiến độ** là thanh đầy dần kèm phần trăm; thống kê khô (điểm, quân đã đặt, hàng đã dọn, điểm cao nhất) gập vào "Thống kê ván"; luật gập vào "Luật chơi".
- **Điện thoại**: thanh cố định ở đáy màn hình (`MobileBar`) có quân đang cầm thu nhỏ, ba ngọn lửa, nút Bỏ Lệnh và phần trăm khai thông, để ngón cái chạm tới; ẩn ở màn rộng.
- **Gợi ý ô đặt được** là nút bật tắt, nhớ lựa chọn ở máy; **mặc định bật ở bậc Hướng dẫn, tắt ở các bậc khác** (đề xuất, chờ góp ý).
- **Hướng dẫn từng bước** ở Hướng dẫn (`TutorialTip`): bước 1 chạm ô đầu tiên, bước 2 luật kề và khớp, nhắc Bỏ Lệnh khi hết nước, nhắc dọn hàng; bấm "Đã hiểu" thì không hiện lại.
- **Kết quả**: sa bàn mờ quân và chướng ngại để hiện cả bản đồ, khung kết quả có bản đồ đầy đủ kèm địa danh; thắng thì thêm vào bộ sưu tập.

## 7. Câu hỏi còn mở

1. Kho đã mở rộng lên 30 bản đồ (Cổ Loa, Đại La, Bạch Đằng, … và cảnh quan chung) và không giới hạn; còn địa danh nào anh muốn thêm?
2. Chọn bản đồ theo băm (có thể lặp trong vòng) hay xoay tuần tự để mỗi bản đồ xuất hiện đều?
3. Sau khi test lần 1: chỉnh gì ở mục 5 và 6 (mặc định gợi ý, độ lớn ô trên điện thoại, nội dung thẻ)?
