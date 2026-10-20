# Tiến trình & kinh tế

> Cập nhật: 20/10/2026
>
> Làm ở giai đoạn 3–4 (xem [Lộ trình](../lo-trinh.md)). Phần cấp, điểm kỹ năng, nâng kỹ năng và phần thưởng cuối trận đã có logic trong `src/core/progress/` (19/10/2026), chơi thử được ở chế độ Tiến trình của `/demo`. Số liệu dưới đây là điểm xuất phát do Claude đặt, chờ Shan duyệt.

## 1. Kinh nghiệm & cấp độ

- Kinh nghiệm **tích lũy để lên cấp**, không bao giờ mất.
- Mỗi lần lên cấp nhận **điểm kỹ năng**.
- Kinh nghiệm thu được trong trận được chia lúc kết thúc trận:
  - **3vs3:** chia đều cho 3 người.
  - **1vs1:** nhân vật chính nhận toàn bộ.

### 1.1 Số liệu (điểm xuất phát, 19/10/2026)

| Mục | Giá trị |
|---|---|
| Cấp tối đa | 30 |
| Kinh nghiệm lên cấp kế tiếp | 100 + 40 × (cấp − 1): cấp 5 cần 640 tổng, cấp 10 cần 2 340, cấp 20 cần 8 740 |
| Kinh nghiệm cơ bản mỗi người ra trận | Thắng 60, thua 20 |
| Mỗi ô sách | 5 kinh nghiệm, cộng vào phần chia đều |
| Chỉ số theo cấp | Máu, ATK, DEF gốc +3% mỗi cấp trên 1 (cấp 30: ×1.87) |
| Điểm kỹ năng | 1 điểm mỗi lần lên cấp (29 điểm ở cấp 30) |
| Nâng kỹ năng | Cấp 1→2 và 2→3: 1 điểm; 3→4 và 4→5: 2 điểm (6 điểm cho 1 kỹ năng lên cấp 5) |
| Mở ô kỹ năng | Ô 1–2 cấp 1, ô 3 cấp 5, ô 4 cấp 10, ô 6 cấp 15, ô 5 cấp 20; như nhau cho nhân vật chính và nhân vật kèm |

- Kinh nghiệm cả phe = 60 (hoặc 20) × số người + 5 × số ô sách, rồi chia đều. Mô phỏng: mỗi phe ghép khoảng 17 ô sách và 17 ô vàng mỗi trận, nên một trận 1vs1 thắng cho khoảng 150 kinh nghiệm (cấp 5 sau khoảng 4–5 trận thắng, cấp 10 sau khoảng 15, cấp 20 sau khoảng 60); 3vs3 mỗi người khoảng 90.
- Mọi nhân vật nâng kỹ năng **theo ô** (ô 1–6), không theo từng kỹ năng, nên nhân vật chính đổi nguyên tố trước trận không mất điểm đã tiêu. Từ 20/10/2026 nhân vật kèm cũng vậy ([Danh sách nhân vật](14-nhan-vat.md#1-khung-chung-của-nhân-vật-kèm)); hồ sơ cũ nâng chiêu nghề được hoàn điểm.
- Mỗi nhân vật có 6 kỹ năng (36 điểm để nâng hết) mà chỉ có 29 điểm ở cấp 30, nên phải chọn ô nào nâng trước.
- Đối thủ AI cùng cấp dùng tiến trình tự dựng: tiêu đều điểm vào kỹ năng thấp nhất (tùy tướng chiến dịch còn mua cả hai chiêu nhánh và luân phiên mang một).
- Mô phỏng `pnpm sim -- --level N` (180 trận, AI Thường, Mộc): 3vs3 phe nhân vật chính thắng 62% ở cấp 1, **77% ở cấp 5** (ô 3 mở ra khi nhân vật kèm mới có chiêu nhánh), 62% ở cấp 10 và 20, 60% ở cấp 30; Luyện tập mở hết là 67%. 1vs1 49–59%. Trung vị 3vs3 ở cấp 30 là 33.5 lượt mỗi phe, dài hơn mục tiêu 20–30 vì máu tăng theo cấp nhanh như sát thương mà Tinh thần mới giảm từ lượt 25.

## 2. Vàng

- Dùng để mua nhân vật kèm, mua trang bị, và đổi lương (**10 vàng = 10 lương**).
- **Không chặn cày** (Shan chốt 18/10/2026): không có trần vàng hay sách mỗi trận, không giảm dần theo số lượt. Thua trận vẫn **giữ 100%** vàng và sách đã nhặt.
  - Chấp nhận được vì BXH xếp theo tiến độ chiến dịch, người cày chỉ đi nhanh hơn chứ không ảnh hưởng ai.
  - Hệ quả: giá cửa hàng phải cân theo **người cày nhiều nhất**, không theo người chơi trung bình.

- Mỗi ô vàng: **3 vàng**; thắng trận thêm **20 vàng** (điểm xuất phát 19/10/2026, khoảng 70 vàng mỗi trận thắng). Đội có Mưu sĩ +10% vàng, đội có Quân sư +10% kinh nghiệm; không cộng dồn.

## 3. Cửa hàng

- Bán nhân vật kèm (xem [Danh sách nhân vật](14-nhan-vat.md)) và trang bị cố định giá cao (xem [Trang bị](07-trang-bi.md)).

- **Nhân vật kèm** (Claude đặt 19–20/10/2026, chờ Shan duyệt): 37 tướng thường giá 1 500 hoặc 3 000 vàng ([danh sách](14-nhan-vat.md#4-tướng-thường)) và 12 sứ quân giá 3 000 vàng, mỗi sứ quân mở bán sau khi qua màn chiến dịch của người đó ([danh sách](14-nhan-vat.md#6-sứ-quân)). Mua hết tốn khoảng 120 000 vàng, đủ dài cho người cày nhiều nhất. Mua bằng thao tác `buyCompanion` trên hồ sơ (server trừ vàng, kiểm tra màn đã qua); cửa hàng lọc được theo nghề và hệ.

> TODO: danh sách trang bị cố định của cửa hàng và giá.
