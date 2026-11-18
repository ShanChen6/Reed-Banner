# Reed Banner — Cường hóa trang bị, Đá Cường Hóa và sách kinh nghiệm

> Cập nhật: 19/11/2026 (Shan yêu cầu thêm đá nâng cấp, cường hóa trang bị và sách kinh nghiệm)
> Trạng thái: **IMPLEMENTED** — đã có code; số liệu là điểm xuất phát, chờ Shan duyệt balance.

## Cường hóa trang bị

- Mỗi món trong kho có cấp cường hóa **+0..+5** (`GearItem.enhance`, không có là +0), thành công 100%.
- Mỗi cấp **+4% chỉ số riêng của món** (`ENHANCE_BONUS`), nhân vào `itemStat` sau phẩm và hệ; không thêm chỉ số phụ, không đổi 9 ô, phẩm Trắng–Cam, thưởng bộ hay cộng hưởng. Quần Hùng vẫn chặn trang bị bằng `ARENA_GEAR_CAP`.
- Giá lên cấp +n+1: **n+1 Đá Cường Hóa** và **50 × (n+1) × phẩm** vàng (`enhanceCost`). Lên +5 tổng cộng 15 đá.
- **Ghép ba món** giữ cấp cường hóa của món chính (luật ghép chép món chính rồi nâng phẩm); đá đã tiêu cho hai món kia không hoàn lại. Bán món không trả lại đá.
- Thao tác hồ sơ `{ type: "enhance", item }` (`enhanceItem` trong `src/core/progress/inventory.ts`), server kiểm tra lại qua `/api/profile`. Giao diện: khung **Cường hóa** trong chi tiết món ở Kho đồ (Doanh Trại), nhãn `+n` ở góc ô món, tên món ghi `+n`.

## Đá Cường Hóa

Tiền tệ tài khoản (`profile.stones`). Nhận khi leo Tháp Thí Luyện, Tháp Thiên Mệnh như trước; từ 19/11/2026 mua thêm ở **Cửa Hàng › Vật phẩm** giá **200 vàng/viên** và tiêu khi cường hóa. Giữ tối đa 999.

## Sách kinh nghiệm

- Mua ở **Cửa Hàng › Vật phẩm** giá **120 vàng/cuốn** (`SHOP_ITEM_PRICE.xpBook`), giữ tối đa 999 (`profile.xpBooks`).
- Mỗi cuốn **+250 kinh nghiệm** (`XP_BOOK_XP`) cho một tướng đã có; lên cấp vẫn nhận điểm kỹ năng như thường. Dùng ở thẻ **Tổng quan** của tướng trong Doanh Trại (một cuốn, đủ để lên cấp kế, hoặc mười cuốn); không tiêu quá số cuốn cần để tới cấp 30.
- Thao tác hồ sơ `{ type: "buyItem", item: "stone" | "xpBook", amount }` và `{ type: "useXpBook", character, amount }` (`src/core/progress/profile.ts`).

## Còn mở

- Mô phỏng kinh tế đá và vàng 7/30/90 ngày; có cần giới hạn mua đá theo tuần không.
- Hoàn một phần đá khi ghép món đã cường hóa.
