# Doanh Trại

> Cập nhật: 03/11/2026
> Trạng thái: IMPLEMENTED

Doanh Trại thay tên hiển thị của màn Hồ sơ cũ (phân cảnh `PROFILE`). Đường dẫn giữ nguyên `/game/profile` để link cũ không hỏng. Mục Tài khoản (`/game/account`) không đổi. Code ở `src/app/game/profile/`.

## 1. Điều hướng

| Mục | Nội dung |
|---|---|
| Tướng sĩ | Danh sách mọi nhân vật đã có, chi tiết, trang bị, kỹ năng của từng người |
| Đội hình | Đội 3vs3: chủ tướng Đinh Bộ Lĩnh cố định và 2 nhân vật kèm (`chooseTeam`) |
| Kho đồ | Túi đồ (sức chứa `BAG_LIMIT`), lọc loại ô, mặc/tháo/bán, Ghép đồ |
| Cửa hàng | Nút riêng sang phân cảnh `SHOP` (tuyển tướng, mua trang bị, lương) |

Kỹ năng nâng theo từng nhân vật nên nằm trong chi tiết tướng sĩ (thẻ Kỹ năng), không có mục riêng. Chức năng của thẻ cũ "Đội hình & cửa hàng" chia sang mục Đội hình và Cửa hàng.

## 2. Tướng sĩ

- Desktop (từ 1024px): vùng trái khoảng 38% (tìm, Bộ lọc, sắp xếp, nhãn lọc xóa được, "n / tổng tướng sĩ", lưới thẻ cuộn riêng), vùng phải khoảng 62% (chi tiết cuộn riêng). Khung cao theo màn hình, tối thiểu 34rem nên màn thấp vẫn cuộn trang được.
- Thẻ: chân dung, tên (tối đa 2 dòng), cấp, hệ, dấu cờ khi đang trong đội. Thẻ đang chọn viền vàng; lưới dùng mũi tên, Home, End.
- Tìm theo tên không dấu, không phân biệt hoa thường. Lọc theo hệ, nghề, trong/ngoài đội. Sắp xếp: đội hình trước, cấp giảm/tăng, tên. Không có lực chiến hay phẩm chất vì game chưa có các thuộc tính đó.
- Bộ lọc ẩn nhân vật đang xem thì chi tiết vẫn giữ người đó và danh sách báo rõ, có nút Bỏ lọc.
- Chi tiết: tên, cấp, hệ, nghề, trạng thái đội (Thêm vào đội hình = chọn người được thay); tranh với 9 ô trang bị (4 trái, 4 phải, vũ khí dưới); thẻ Tổng quan (kinh nghiệm, Máu/Công/Thủ kèm phần cộng từ đồ, thưởng bộ), Kỹ năng (nâng theo ô), Chi tiết (gốc/trang bị/tổng). Vàng là tài nguyên chung nên ở thanh trên, không nằm trong chỉ số.
- Bấm ô trang bị mở bảng chọn đồ của đúng ô: món đang mặc, món cùng ô trong kho (vũ khí: đúng nghề), ai đang dùng, so sánh chỉ số trước khi thay (`gearComparison`). Món đang ở người khác cần bấm xác nhận chuyển.
- Điện thoại: danh sách trước, chạm thẻ mở chi tiết có nút "Danh sách tướng sĩ"; quay lại giữ chỗ cuộn, tìm kiếm và bộ lọc. Bảng chọn đồ là tấm trượt từ đáy.

## 3. Kho đồ

Lưới chỉ gồm món có thật (không vẽ ô trống), lọc Tất cả/Vũ khí/Phục sức/Trang sức và theo ô. Chọn món xem chỉ số, người đang dùng, Mặc cho (chọn nhân vật), Tháo, Bán. "Ghép đồ" mới mở khay 3 món; món không ghép chung được với món đầu bị làm mờ. Điều kiện, phí và kết quả ghép giữ nguyên (`mergeGear`).

## 4. Xem thử

`/demo/barracks?n=0|1|9|30|100` dựng Doanh Trại với hồ sơ giả trong bộ nhớ trang (không gọi server, không đụng localStorage). Quá số nhân vật có thật thì nhân bản thẻ để thử danh sách dài và tên dài.
