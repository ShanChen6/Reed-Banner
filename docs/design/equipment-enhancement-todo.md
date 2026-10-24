# Reed Banner — Equipment Enhancement (Future TODO)

> Cập nhật: 24/10/2026

Status: **PLANNED / DO NOT IMPLEMENT during Dual Tower V1.0**.

## Mục tiêu

Đá Cường Hóa kiếm từ Song Tháp hiện được lưu ở Profile và có thể nhận theo reward events. Giai đoạn tiếp theo sẽ bổ sung cường hóa trang bị, tách biệt với cơ chế ghép ba món nâng phẩm đang có.

## Design candidates — chưa duyệt balance

- Cấp cường hóa +0..+5, thành công 100% (đề xuất).
- Thử nghiệm 4% tăng trên chỉ số **riêng món**, không phải toàn bộ stats của tướng, mỗi cấp.
- Ưu tiên áp dụng từ Tinh phẩm (Lam), chưa chốt.
- Chi phí đá và vàng cần mô phỏng dựa trên stone emission thực tế.
- Không thêm chỉ số phụ, không sửa 9 ô trang bị hoặc phẩm Trắng–Cam.

## Backlog

- **GEAR-01:** Audit item/inventory, 9 slot, 5 phẩm, stat set/element.
- **GEAR-02:** Thiết kế `enhancementLevel` gắn item ID, serialization/migration.
- **GEAR-03:** Công thức stats và thứ tự nhân với phẩm, nguyên tố, thưởng bộ/cộng hưởng.
- **GEAR-04:** Giá đá/vàng và kinh tế 7/30/90 ngày.
- **GEAR-05:** Merge compatibility: xử lý ba món đã cường hóa, chọn món chính, hoàn đá nguyên liệu, anti-exploit.
- **GEAR-06:** Server API tiêu đá/vàng và nâng cấp atomic/idempotent.
- **GEAR-07:** UI cường hóa với preview và xác nhận chi phí.
- **GEAR-08:** Simulation và regression Campaign/Survival/Tower/Arena.

## Gate triển khai

Chỉ bắt đầu sau khi Song Tháp PASS, đá cộng an toàn, emission được đo, công thức/merge policy được duyệt. Không tự triển khai GEAR-01..08 trong task Song Tháp.
