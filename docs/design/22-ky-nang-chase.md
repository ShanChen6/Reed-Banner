# Chốt Tinh thần F và bộ kỹ năng 6 chủ động + 4 bị động

Tiếp nối [phiên bản phối hợp trước](21-combo-dong-doi.md). Quyết định của người dùng trong phiên này thay thế trạng thái “A mặc định, F chỉ thử nghiệm” của các tài liệu cũ. Chỉ triển khai mới; chưa chạy lại test, trình duyệt, build hoặc mô phỏng/cân bằng.

## Luật Tinh thần đã chốt

Mặc định production trong code là **F**: bắt đầu100, từ lượt thường25 của từng phe giảm5/lượt, về0 tại lượt44. Lượt thêm không tăng bộ đếm. ATK/DEF có hệ số Tinh thần100%, vẫn nhận buff/debuff thông thường. Hồi HP và Khiên mới theo **người nhận**: `0.2 + 0.8 × Tinh thần/100`. Khiên đã có không bị giảm hồi tố. Chuyển hồi dư thành Khiên không nhân Tinh thần lần hai.

| Lượt thường của phe |24|25|30|35|40|44 trở đi|
|---|---:|---:|---:|---:|---:|---:|
| Hồi/Khiên mới |100%|96%|76%|56%|36%|20%|

Các cấu hình A–E vẫn giữ **đúng định nghĩa lịch sử** cho harness; đổi mặc định không làm A hoặc E ngầm dùng decay5. Không thay luật lương, chỉ số trùm, trang bị hoặc preset chiến dịch.

## Bộ kỹ năng được chốt

Mỗi tướng: ba chủ động nghề ở ô1/3/5, hai chủ động hệ ở ô2/6, tuyệt chiêu ô4. Giữ mốc mở1/1/5/10/15/20 và ánh xạ điểm nâng layout2 đã triển khai trước. Bộ sáu chủ động của60 đồng hành hiện có được giữ; hệ thống phối hợp được mở rộng bằng bốn bị động:

1. Nghề1: mẫu mở cơ hội từ phiên trước, người chơi chọn hành động sau để dùng.
2. Nghề2: một phản ứng truy kích theo nghề.
3. Hệ1: phản ứng thứ nhất của hệ.
4. Hệ2: phản ứng thứ hai của hệ.

Bốn bị động này có sẵn theo bộ nghề/hệ, không chiếm ô chủ động, không cần điểm nâng riêng. Các luật nội tại nghề và thanh Nộ cũ vẫn là cơ chế nền, không tính thành ô bị động thứ5/6. Một người không tự nhận cơ hội “đồng đội” trong solo; phản ứng hệ có thể theo tín hiệu của chính mình, nên solo vẫn dùng được chase.

## Đinh Bộ Lĩnh: đủ6 nghề ×7 hệ

ĐBL nhận **42 tuyệt chiêu ô4**, được ghép từ phần nghề và phần hệ, có ID ổn định `dbl_<nghề>_<hệ>`. Đây là42 biến thể từ dữ liệu thành phần, không phải42 cơ chế hoàn toàn khác nhau. Phần nghề:

| Nghề | Tuyệt chiêu | Vai trò |
|---|---|---|
| Tướng sĩ | Bình định | Sát thương đơn, xuyên giáp và phá giáp |
| Pháp sư | Thiên uy | Sát thương nhiều mục tiêu, câm lặng |
| Binh lính | Trấn quốc | Đánh một mục tiêu, dựng Khiên đội |
| Y sư | Hưng sinh | Hồi và giải bất lợi cho đội |
| Mưu sĩ | Định kế | Xua tan, đánh và phá năng lượng |
| Quân sư | Nhất thống | Tăng Công và tiếp năng lượng đội |

Phần hệ lần lượt bổ sung: Kim tăng Công; Mộc hồi; Thủy giải bất lợi/Khiên; Hỏa phá giáp; Thổ Khiên; Lôi trừ năng lượng; Phong tiếp năng lượng. Tất cả chi phí gốc80 là **giá trị ban đầu chưa cân bằng**. Điểm nâng ô4 cũ đi theo tuyệt chiêu mới của nghề/hệ hiện chọn, không mất đầu tư; không cần thêm một lần swap hồ sơ.

[Danh mục tên và thông số](data/skill-chase-v3.md) · [Dữ liệu đầy đủ42 bộ ĐBL và60 đồng hành](data/skill-chase-v3.json).

## Chuỗi truy kích trong cùng hành động

Một hành động gốc là một lần thi triển chủ động hoặc một lần thực thi nước bàn cờ qua `act`. Phản ứng tự nối trong chính lần gọi đó, không tạo lượt thêm, không tiêu lượt/chi phí chủ động và không đánh dấu tướng phản ứng là đã hành động. Một lượt thường có thể chứa cast rồi đổi ô; đó là hai hành động gốc riêng. Người chơi chủ động chọn chiêu/mục tiêu khởi đầu, đội hình quyết định chuỗi nối.

- Tín hiệu chỉ đến từ tác dụng thật: mất HP, hồi HP, phá giáp/khống chế/xua tan thành công, hoặc Khiên có nguồn đồng đội thực sự hấp thụ đòn chủ động. Không tính tick regen, DOT, phản đòn, hết lương, hút máu hoặc hồi dư như kỹ năng chủ động mới.
- Hàng đợi theo thứ tự tín hiệu, vị trí tướng, rồi thứ tự bị động nghề2/hệ1/hệ2. Giải hết sau các bước của chiêu gốc hoặc bước bàn cờ; không gọi đệ quy.
- **Mỗi bị động của mỗi tướng tối đa một lần mỗi hành động gốc; toàn chuỗi tối đa12 phản ứng và độ sâu4.** Bị động không có tác dụng vì mục tiêu hết năng lượng, HP đầy, Khiên không tăng hoặc phá giáp không cải thiện được bỏ qua. Chạm giới hạn thì bỏ tín hiệu còn lại; không kéo dài trận xử lý vô hạn.
- Người gục, câm lặng hoặc đóng băng không phản ứng. Dừng chuỗi ngay khi trận kết thúc. Tín hiệu nhắm địch đã gục không tự chuyển sang địch khác. Tín hiệu Khiên là mục tiêu đồng minh; nếu cần đòn đáp trả, chọn địch còn sống đầu tiên theo vị trí.
- Hồi chọn đồng minh còn sống có tỷ lệ HP thấp nhất, hòa chọn vị trí trước. Khiên cấp cho người được hồi. Năng lượng cấp người nhận của tín hiệu hồi; tín hiệu sát thương cấp người phát. Các phản ứng mới không rút lương trực tiếp.
- Phản ứng sát thương dùng ATK/DEF, lương và quan hệ hệ hiện hành. Phản ứng hồi/Khiên dùng Tinh thần F của người nhận. Không tiêu hoặc nhân thêm cơ hội chuẩn bị đang giữ khi thực hiện phản ứng tự động.
- Hành động gốc hưởng cơ hội cũ vẫn mở chase mới. Giới hạn “không mở chuỗi” trong thiết kế21 chỉ còn áp dụng cho việc nhân tiếp **cơ hội chuẩn bị**, không cấm ba bị động phản ứng mới.

Ví dụ: Tướng sĩ dùng Phá trận → Kim truy của tướng hệ Kim đánh tiếp → tín hiệu mất HP mở Mộc sinh → hồi hữu hiệu mở Tiếp phòng của Binh lính. Chuỗi cụ thể còn tùy đồng đội, điều kiện tác dụng thật, người còn sống và giới hạn kích hoạt; không đảm bảo mọi đội đều kích hoạt đủ12 phản ứng.

## Triển khai và mở rộng

`chase.ts` lưu20 định nghĩa phản ứng:6 nghề và14 hệ. Cộng6 mẫu cơ hội cũ thành26 định nghĩa bị động dùng chung. `FighterConfig.chasePassives` lưu đúng ba ID không trùng, cộng `comboPassive` thành bốn. Builder tự cấp từ nghề/hệ; có thể truyền ba ID override cho tướng mới. Danh sách được chụp vào trận mới; snapshot trận cũ thiếu trường này không tự mọc phản ứng mới giữa trận. Đội phòng thủ cũ được bổ sung khi dựng trận mới như phiên trước.

`ComboEngine` giải cả cơ hội chuẩn bị lẫn hàng đợi truy kích; battle dùng chung primitive damage/heal/shield/energy/effect, không viết điều kiện tên tướng trong engine. Sự kiện `chase` ghi người phản ứng, nguồn mở, mục tiêu, ID hành động và độ sâu; nhật ký/giao diện/hoạt ảnh hiển thị được người nối chiêu.

AI có ước lượng lợi ích trực tiếp nhịp đầu theo dữ liệu, hệ số hồi đúng F; chưa tìm kiếm toàn chuỗi hoặc tối ưu đổi người nhiều lượt. Không đọc seed bàn tương lai. Hệ số, số nhịp, giới hạn và độ khác biệt giữa các tướng cùng nghề/hệ sẽ quyết định trong đợt cân bằng sau.

`pnpm exec tsx scripts/export-skill-chase.ts` chỉ xuất danh mục, không chạy trận và không ghi đè dữ liệu báo cáo cũ. Báo cáo357 test và3.120 quan sát của phiên trước **không xác nhận phiên bản F + chase này**. Theo yêu cầu, phiên này TypeScript và lint đều đạt; không chạy test, mô phỏng hoặc cân bằng. Chưa push/merge/deploy.
