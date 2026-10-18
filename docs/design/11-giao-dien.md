# Giao diện

> Cập nhật: 18/10/2026

## 1. Bố cục màn hình trận đấu

Bố cục **ngang** (landscape), cả trên desktop lẫn điện thoại xoay ngang.

```
┌───────────────────────────────────────────────────────────────────┐
│ [Khung phe mình]        [Lượt của bạn · 30]        [Khung đối thủ] │
│                    ┌──────────────────────────┐                     │
│ [Kỹ năng] [Túi đồ] │                          │                     │
│                    │   Bàn cờ 12 cột × 8 hàng  │                     │
│                    │                          │                     │
│   (nhân vật mình)  └──────────────────────────┘   (nhân vật đối thủ) │
└───────────────────────────────────────────────────────────────────┘
```

- **Giữa:** bàn cờ 12×8.
- **Trên cùng, giữa:** báo lượt của ai ("Lượt của bạn" / "Lượt đối thủ") và đồng hồ đếm ngược 30 giây.
- **Góc trên trái / phải:** khung từng nhân vật của mỗi phe: tên, cấp, thanh máu, thanh năng lượng, biểu tượng hiệu ứng trạng thái kèm số lượt còn lại.
  - 1vs1: mỗi bên một khung.
  - 3vs3: mỗi bên ba khung xếp dọc; khung của người hành động được làm sáng; chạm vào khung để đổi người hành động.
- Lương thực của mỗi phe hiển thị cạnh khung của phe đó.
- **Bên trái:** nút **Kỹ năng** (mở danh sách kỹ năng của người hành động, kỹ năng thiếu năng lượng bị làm mờ) và nút **Túi đồ**.
- **Dưới hai bên:** hình nhân vật của hai phe, có animation đánh và trúng đòn.
- **Thông báo nổi** giữa bàn cờ, ví dụ "Không đủ năng lượng (0/25)".

Ảnh tham khảo bố cục do Shan gửi ngày 18/10/2026 chỉ dùng để định hướng bố cục. Theo nguyên tắc clean-room, không đưa ảnh hay asset của game khác vào repo.

## 2. Nguyên tắc chung

- Responsive cho desktop và mobile; thao tác vuốt hoặc kéo để đổi ô.
- Animation ghép ô, cascade, phá ô do kỹ năng, hiệu ứng chiến đấu, âm thanh.
- Thông báo sát thương rõ ràng (xem [Công thức](03-tai-nguyen-cong-thuc.md#3-công-thức-sát-thương)).
- Mỗi hiệu ứng trạng thái là một biểu tượng trên chân dung, kèm số lượt còn lại.
- Tỉ lệ ô của màn hiển thị trước trận bằng thanh màu nhỏ.
- Danh mục trên `/games` của ShanVerse: **Puzzle & Logic**.
