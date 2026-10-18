# Tài nguyên trong trận & công thức

> Cập nhật: 18/10/2026
>
> Các con số dưới đây là **điểm xuất phát**. Script cân bằng sẽ chỉnh lại.

## 1. Lương thực & sĩ khí (chung cả đội)

- Khởi đầu **60**, tối đa 100.
- Đầu mỗi lượt của phe nào thì phe đó bị trừ **−5** (đội có Binh lính: **−3**).
- Mỗi ô bánh chưng ghép được: **+4**.

| Lương | Sĩ khí | Hiệu ứng |
|---|---|---|
| ≥ 70 | Hăng hái | ×1.15 sát thương |
| 30–69 | Bình thường | — |
| 1–29 | Đói | ×0.75 sát thương; năng lượng từ âm dương giảm còn một nửa |
| 0 | Hết lương | ×0.5 sát thương; mất 3% máu tối đa mỗi lượt |

- Sĩ khí chỉ tác động lên **sát thương và năng lượng**, không tác động lên hồi máu hay DEF.
- AI chịu đúng luật như người chơi.
- **Chế độ Thường:** lương reset mỗi trận.
- **Chiến dịch:** lương mang sang trận sau (xem [Chế độ chơi](09-che-do-choi.md)).

## 2. Năng lượng (riêng từng người, tối đa 100)

- **Âm dương:** người hành động nhận **10 mỗi ô** (Pháp sư ×1.5; đang Đói thì ×0.5).
- **Tĩnh tâm** (chỉ 3vs3): hai đồng đội **không** hành động trong lượt của phe mình, mỗi người nhận **+4**.
- **Phẫn nộ:** nhận **+1 cho mỗi 5% máu tối đa** bị mất.
- Dùng kỹ năng thì trừ đúng chi phí của kỹ năng; phần còn lại giữ nguyên. Không đủ năng lượng thì kỹ năng bị khóa và hiện thông báo "Không đủ năng lượng (hiện có/cần)".

## 3. Công thức sát thương

```
Sát thương kiếm = round( ATK
                         × (ô kiếm thường + 2 × ô kiếm lửa)
                         × Sĩ khí × Nguyên tố × Cascade × Nội tại nghề
                         × 100 / (100 + DEF đối thủ) )

Sát thương kỹ năng = round( Sát thương gốc của kỹ năng × Sĩ khí × Nguyên tố )
                     // bỏ qua DEF
```

| Hệ số | Giá trị |
|---|---|
| Sĩ khí | 1.15 / 1 / 0.75 / 0.5 |
| Nguyên tố (trong trận) | 1.25 (khắc) / 1 / 0.75 (bị khắc) |
| Cascade | +10% mỗi bước, tối đa +50% |
| DEF | Dạng phần trăm: DEF 50 giảm 33%, DEF 100 giảm 50%; không bao giờ vô hiệu hóa hoàn toàn |

- Tổng hệ số nằm trong khoảng 0.375× đến khoảng 2.16× (chưa tính nội tại nghề và kỹ năng bị động).
- **Hiển thị:** con số lớn ở giữa màn hình, kèm biểu tượng nhỏ cho từng hệ số đang có hiệu lực. Chạm giữ hoặc rê chuột để xem bảng chi tiết.
