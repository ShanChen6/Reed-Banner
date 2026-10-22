# Tài nguyên trong trận & công thức

> Cập nhật: 19/10/2026
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

- Sĩ khí chỉ tác động lên **sát thương và năng lượng**, không tác động lên hồi máu hay DEF. Khác với [Tinh thần](#5-tinh-thần-riêng-từng-tướng), giảm theo độ dài trận.
- AI chịu đúng luật như người chơi.
- **Chế độ Thường:** lương reset mỗi trận.
- **Chiến dịch:** lương mang sang trận sau (xem [Chế độ chơi](09-che-do-choi.md)).

## 2. Năng lượng (riêng từng người, tối đa 100)

- **Âm dương:** người hành động nhận **10 mỗi ô** (Pháp sư ×1.5; đang Đói thì ×0.5).
- **Tĩnh tâm** (chỉ 3vs3): hai đồng đội **không** hành động trong lượt của phe mình, mỗi người nhận **+4**.
- Dùng kỹ năng thì trừ đúng chi phí của kỹ năng; phần còn lại giữ nguyên. Không đủ năng lượng thì kỹ năng bị khóa và hiện thông báo "Không đủ năng lượng (hiện có/cần)".

## 3. Nộ và kỹ năng bị động

- Mỗi phe có **một thanh Nộ** (0–100), gắn với **thủ lĩnh**: phe người chơi là nhân vật chính; phe AI là nhân vật đứng vị trí 1. Nhân vật kèm không có nộ.
- **Tích nộ:**
  - Mỗi ô 🥁 Trống trận ghép được (do bất kỳ ai trong phe ghép): **+8 nộ**.
  - Thủ lĩnh mất máu: **+1 nộ cho mỗi 2% máu tối đa** bị mất.
  - Ô đặc biệt Trống da / Trống đồng: +20 / +40 nộ ([Bàn cờ](01-ban-co.md#3-ô-đặc-biệt)).
- **Đầy 100 nộ:** kỹ năng bị động của thủ lĩnh **tự kích hoạt** ngay, có hiệu lực **3 lượt** của phe mình (trừ khi kỹ năng ghi khác), rồi nộ về 0.
  - Kích hoạt không tốn năng lượng, không tính vào giới hạn 1 kỹ năng mỗi lượt, và không bị Câm lặng chặn.
  - Lượt thêm không tính là một lượt của phe, nên không trừ thời hạn bị động (xem [Trận đấu](02-tran-dau.md#5-cấu-trúc-một-lượt)).
  - Trong lúc bị động đang có hiệu lực, thanh nộ không tích thêm.
  - Thủ lĩnh đã gục thì nộ dừng tích, giữ nguyên số đang có.
- Nộ reset về 0 mỗi trận (kể cả Chiến dịch).
- Mục tiêu cân bằng: bị động kích hoạt khoảng 2–3 lần mỗi trận chuẩn.

> TODO: kiểm tra tốc độ tích nộ bằng mô phỏng.

## 4. Công thức sát thương

```
Sát thương kiếm = round( ATK
                         × (ô kiếm thường + 1.5 × ô kiếm đồng + 2 × ô kiếm lửa)
                         × Sĩ khí × Nguyên tố × Cascade × Nội tại nghề
                         (ATK và DEF đã nhân hệ số Tinh thần)
                         × 100 / (100 + DEF hiệu lực) )

Sát thương kỹ năng = round( Sát thương gốc của kỹ năng
                            × Sĩ khí × Nguyên tố
                            × 100 / (100 + DEF hiệu lực) )

DEF hiệu lực = DEF đối thủ × (1 − Xuyên giáp)
```

| Hệ số | Giá trị |
|---|---|
| Sĩ khí | 1.15 / 1 / 0.75 / 0.5 |
| Nguyên tố (trong trận) | 1.25 (khắc) / 1.1 (tương sinh) / 1 / 0.75 (bị khắc) |
| Cascade | +10% mỗi bước, tối đa +50% |
| DEF | Dạng phần trăm: DEF 50 giảm 33%, DEF 100 giảm 50%; không bao giờ vô hiệu hóa hoàn toàn |
| Xuyên giáp | 0 nếu không ghi gì; một số kỹ năng hoặc hiệu ứng ghi rõ "bỏ qua X% DEF" |

- **Kỹ năng chịu DEF như đánh thường** (Shan chốt 18/10/2026), để DEF, Thủ+/Thủ− và trang bị thủ có ý nghĩa với mọi nguồn sát thương.
- **Không** chịu DEF: Thiêu đốt, Phản đòn, mất máu do hết lương (sát thương gián tiếp).
- Hệ số % ATK của kỹ năng hiện là điểm xuất phát tính khi kỹ năng còn bỏ qua DEF; sẽ nâng lên (dự kiến khoảng ×1.3–1.5) khi chạy mô phỏng.
- Tổng hệ số nằm trong khoảng 0.375× đến khoảng 2.16× (chưa tính nội tại nghề và kỹ năng bị động).
- **Hiển thị:** con số lớn ở giữa màn hình, kèm biểu tượng nhỏ cho từng hệ số đang có hiệu lực. Chạm giữ hoặc rê chuột để xem bảng chi tiết.

## 5. Tinh thần (riêng từng tướng)

Shan yêu cầu 19/10/2026: trận kéo dài thì tinh thần chiến đấu giảm, kéo các chỉ số xuống theo.

- Mỗi tướng vào trận với **100** Tinh thần, ở cả 1vs1 và 3vs3.
- Từ **lượt thứ 25** của phe, đầu mỗi lượt của phe đó mọi tướng còn sống mất **10**, về 0 ở lượt 34.
- **ATK và DEF** × (0.7 + 0.3 × Tinh thần/100): còn 70% khi Tinh thần về 0.
- **Hồi máu nhận được** (kỹ năng, ô tim, Hồi phục, hút máu) và **Khiên mới nhận** × Tinh thần/100: về 0 thì không hồi được nữa, nên trận nào cũng kết thúc bằng hạ gục.
- Tính theo người nhận: tướng được hồi hoặc nhận Khiên dùng Tinh thần của chính mình.
- Thay cho luật Mệt mỏi 1vs1 cũ (chỉ giảm hồi máu và Khiên).
- Mô phỏng 19/10/2026 (150 trận, AI Thường, seed 7): không trận nào chạm giới hạn lượt. 1vs1 trung vị 20 lượt mỗi bên, 90% xong trong 48.5 lượt; 3vs3 trung vị 27, 90% xong trong 46.5 lượt (trước đó 58), tỉ lệ thắng của phe nhân vật chính 64% (trước đó 68%).

> TODO: kỹ năng, trang bị hoặc sự kiện hồi Tinh thần (ví dụ hạ gục đối thủ) nếu cần thêm chiều sâu.

## Kiểm chứng 22/10/2026

Luật mặc định ở mục5 giữ nguyên. Sửa bug Y sư: tính hồi dư từ lượng hồi đã chịu Tinh thần, rồi chuyển dư thành Khiên mà không giảm Tinh thần lần nữa. Khiên đang có không co theo Tinh thần; chỉ lượng mới chịu hệ số. Thiêu đốt (ATK gốc lúc tạo), Phản đòn (đầu vào đòn nhận), mất máu hết lương không nhân Tinh thần lần thứ hai. Các nhánh mô phỏng B–E không phải luật hiện hành. Xem [báo cáo kiểm chứng](../reports/2026-10-22-tinh-than-ai.md).
