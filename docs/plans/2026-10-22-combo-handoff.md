# Bàn giao mốc kỹ năng/Tinh thần và bước tiếp theo: combo đồng đội

## Trạng thái mốc lưu

Mốc này lưu toàn bộ đợt cải tổ kỹ năng, sửa AI và kiểm chứng Tinh thần đã hoàn tất. Chưa triển khai hệ thống combo mới. Luật production vẫn A; A–F là lựa chọn của harness, API ứng dụng không nhận tùy chọn thử nghiệm.

- [Khung kỹ năng đã triển khai](../design/20-cai-to-ky-nang.md): 3 chiêu nghề, 2 chiêu hệ, 1 tuyệt chiêu nhân vật; ID/ô tiến trình ổn định, hồ sơ nghề cũ hoàn điểm đúng một lần. AI chiến dịch giữ preset legacy tường minh.
- [Báo cáo cải tổ ban đầu](../reports/2026-10-22-ky-nang.md).
- [Báo cáo AI/Tinh thần A–E](../reports/2026-10-22-tinh-than-ai.md): sampler nghề/hệ đã sửa, ĐBL luôn hiện diện; kiểm tra hiệu quả kỹ năng, chiến dịch và trình duyệt.
- [Báo cáo bổ sung F](../reports/2026-10-22-tinh-than-F.md): 2.614 trận chạy mới, dùng lại kết quả tương thích, 14 trace; có manifest, dữ liệu nén và SHA nguồn. F giữ hồi/Khiên muộn nhưng tăng đuôi dài so D/E; chưa chọn luật mặc định mới.
- Các kiểm tra gần nhất: 333 test/83 suite, không fail/skip; lint, typecheck, build và Chromium desktop/mobile pass. Log nằm trong [thư mục dữ liệu F](../reports/2026-10-22-spirit-f/README.md). Build bỏ migration khi không có DATABASE_URL; không coi đây là kiểm chứng DB production.

Không dùng tỷ lệ thắng hoặc độ ngắn của trận làm tiêu chí duy nhất. Trận cap chưa có kết quả phải ghi censored; trận dài vẫn có tiến triển không đồng nghĩa vòng hồi phục. Đừng tái chạy toàn bộ ma trận cũ chỉ để xác nhận lại mốc này.

## Quyết định thiết kế người dùng đã thống nhất

Người chơi phải chủ động tạo và tận dụng cơ hội quyết định ván đấu. Chờ suy giảm tự động khiến đối phương gục làm giảm giá trị trò chơi.

Hướng tiếp theo là xây dựng lại hệ thống kỹ năng cho **toàn bộ nhân vật**, có combo giữa kỹ năng chủ động của một tướng và bị động của đồng đội, đồng thời mở rộng được cho tướng mới. Hướng combo được ưu tiên thay cho đề xuất hành động Dồn lực dùng chung; Dồn lực chưa được triển khai hay chốt thông số.

Cấu trúc hướng tới: **hành động mở điều kiện → bị động đồng đội tạo cơ hội → người chơi chọn cách tận dụng**. Ưu tiên cường hóa/mở hiệu ứng cho hành động tiếp theo hơn chuỗi tự động gây sát thương miễn phí. Các hệ số và cách bổ sung/thay thế bị động hiện tại chưa được quyết định.

## Phạm vi và nguyên tắc cho đợt triển khai mới

1. Kiểm kê ĐBL, toàn bộ tướng hiện tại và các loadout/preset chiến dịch dùng bộ legacy; không bỏ sót nhân vật chỉ vì không nằm trong roster người chơi. Lập ma trận thiết kế cho từng nhân vật: vai trò độc lập, kỹ năng mở combo, bị động hưởng ứng, hành động tận dụng, cách đối phó và đóng góp khi không có đồng đội phù hợp.
2. Tương tác theo điều kiện/ngữ nghĩa kỹ năng, không hardcode cặp tên tướng. Một tướng phải phối hợp được với nhiều đồng đội; không ép một cặp thành đội hình bắt buộc. Tướng mới thêm bằng định nghĩa dữ liệu và đăng ký roster, không cần thêm nhánh riêng trong battle/AI/UI.
3. Hồi hữu hiệu và Khiên thực sự hấp thụ là điều kiện khác với yêu cầu hồi/cấp Khiên. Không farm combo bằng hồi đầy máu, Khiên không cộng dồn, sát thương tự gây hoặc vòng kích hoạt phản đòn.
4. Cơ hội combo có thời hạn, giới hạn sử dụng và dấu hiệu rõ cho cả hai bên. Không tích vô hạn. Định nghĩa rõ lượt thường/lượt thêm, người mở/nguồn/người nhận, chết/hồi sinh, refresh, giải hiệu ứng và chuyển mục tiêu.
5. Pilot không cho hiệu ứng do combo sinh ra tiếp tục mở combo khác. Engine cần nguồn gốc sự kiện và giới hạn chuỗi để ngăn đệ quy, kể cả khi mở rộng sau này.
6. Giữ ranh giới giữa nội tại nghề, bị động Nộ thủ lĩnh và bị động combo cá nhân; quyết định phần bổ sung/thay thế trong thiết kế trước khi cộng sức mạnh lên toàn roster.
7. Duy trì ID ổn định, ánh xạ đầu tư kỹ năng, điểm đã tiêu và hồ sơ cũ. Nếu đổi layout hoặc loại kỹ năng, viết kế hoạch migration có phiên bản, bất biến tổng điểm và khả năng chạy lại an toàn; không âm thầm xóa đầu tư.
8. Không dùng sửa quân lương, chỉ số trùm hoặc buff/nerf rải rác để bù cho cơ chế chưa tốt. Mọi thay đổi cân bằng cần gắn với mục tiêu cụ thể và đối chứng.

## Kiến trúc cần kiểm tra và triển khai

- Định nghĩa kỹ năng/bị động bằng dữ liệu có kiểu: điều kiện, quan hệ đồng đội/đối thủ, bộ lọc sự kiện, người hưởng, hiệu ứng, thời hạn, giới hạn kích hoạt và khả năng giải hiệu ứng. Tái sử dụng primitive hiện có khi phù hợp; không tạo một DSL tổng quát vượt nhu cầu pilot.
- Tách sự kiện phục vụ trigger gameplay khỏi log audit tùy chọn. Sự kiện gameplay phải hoạt động cả khi `audit:false`; có ID hành động gốc, nguồn chủ động/bị động/combo, người gây/nhận và giá trị thực sau giảm/giới hạn.
- Hàng đợi trigger có thứ tự tất định, không sửa mảng trong khi duyệt, không đệ quy vô hạn; giữ RNG và thông tin ẩn của server.
- Trạng thái cơ hội combo nằm trong battle state/view có phiên bản; UI và AI đọc cùng định nghĩa, không sao chép công thức hoặc hardcode tướng.
- AI đánh giá lợi ích chuẩn bị và tận dụng trong giới hạn thông tin được phép thấy; không biết seed hoặc ô bàn tương lai. Không đặt quota ép dùng combo.
- Audit ghi cơ hội được tạo/được dùng/hết hạn/bị đối thủ phá, đóng góp thực và chi phí cơ hội. Tách hiệu quả trực tiếp khỏi giá trị phản thực chưa đo được.

## Trình tự triển khai

### 1. Thiết kế toàn bộ bể tướng trước khi chuyển đổi hàng loạt

Đọc AGENTS.md, mã kỹ năng/bị động/roster/progress, các báo cáo và dữ liệu ở trên. Lập inventory thực tế, ma trận vai trò/combo cho mọi nhân vật, mô hình trigger và quyết định về bị động hiện tại. Liệt kê những chỗ cần thay đổi hồ sơ/preset. Chưa tự chọn lại luật Tinh thần.

### 2. Hoàn thiện một lát cắt chạy được trong dev/test

Hai nhóm đầu: **phá giáp → tận dụng sơ hở** và **bảo vệ thực sự hấp thụ → phản công**. Có tướng mở, tướng hưởng, đối thủ phá kế hoạch và phương án chơi không dựa combo. Bổ sung test thứ tự sự kiện, lượt thêm, TTL, nhận/chuyển hiệu ứng, hữu hiệu, vòng lặp, seed và thông tin AI.

Harness hỗ trợ snapshot trước quyết định, hiển thị người mở/người hưởng/thời hạn/điều kiện và xuất replay. Người chơi phải thao tác hoàn tất combo; chưa tự chạy cả roster khi pilot chưa chứng minh tương tác tốt.

### 3. Chuyển đổi toàn bộ nhân vật theo cùng schema

Áp ma trận thiết kế, cập nhật UI/AI/progress/preset có kiểm soát và loại các đường legacy đã được thay thế. Test coverage phát hiện ID trùng/thiếu, trigger không có nguồn mở, điều kiện không thể đạt và nhân vật mới không lắp được kỹ năng. Có ví dụ thêm tướng bằng dữ liệu để kiểm chứng khả năng mở rộng.

### 4. Đối chứng và bàn giao

Chốt phiên bản code/AI/config trước mỗi nhóm mô phỏng. Kết quả trận cũ có thể dùng chọn kịch bản, nhưng **không dùng như đối chứng cùng điều kiện sau khi gameplay kỹ năng đã thay đổi**. Pilot trước, sau đó sàng lọc đủ nghề/hệ/cấp/mode, hai bên đi trước, nhiều seed và các nhóm hỗ trợ/phòng thủ/chiến dịch có liên quan.

Đo cửa sổ hạ gục do hành động tạo ra, tỷ lệ tận dụng/phá combo, chi phí cơ hội, hiệu quả hỗ trợ thực, diễn biến HP/KO, trận cap và sự đa dạng đội hình. Không coi số lần kích hoạt cao là thành công. Không đổi lượt mô phỏng thành phút chơi thực.

Kết thúc bằng báo cáo thiết kế toàn roster, kiểm tra migration, dữ liệu/trace, kiểm tra trình duyệt và những điểm cần người chơi lựa chọn. Chỉ cân nhắc luật Tinh thần mặc định khi đã đánh giá khả năng chủ động kết thúc bằng bộ kỹ năng mới.

## Trạng thái công bố

Nhánh lưu mốc: `checkpoint/skills-spirit-before-team-combos`, base `main`. [Nội dung PR đã chuẩn bị](2026-10-22-checkpoint-pr.md).

PR lưu mốc là để review và tiếp tục phát triển. Không merge hoặc deploy tự động. Không coi việc chấp thuận hướng combo là chấp thuận mọi hệ số, kiểu bị động hoặc chuyển luật production.
