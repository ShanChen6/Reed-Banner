# Tháp Thiên Mệnh — mô phỏng cân bằng khi cấp địch tăng theo tầng (1–30)

> Cập nhật: 17/11/2026
> Trạng thái: **AUDIT** — số đo từ mô phỏng, không phải luật. Luật ở [luật Song Tháp §11.2](../02-game-modes/dual-tower/00-02-rules.md#112-tầng-nhóm-khó-và-sức-địch).

Thay cho báo cáo 11/11/2026 (đo khi địch còn theo cấp cao nhất của roster). Ngày 17/11/2026 Shan chốt: cấp địch tăng đều từ 1 ở tầng 1 tới 30 ở tầng 20, roster tối đa 8 tướng kèm, và **đội cấp 30 phải qua đủ 20 tầng khoảng 85% số lượt leo** (15% còn lại là do đánh ẩu). Báo cáo này là căn cứ chọn đường hệ số sức địch **0,68 → 0,90**.

## Cách chạy

```text
pnpm exec tsx scripts/destiny-stone-sim.ts --cycles 12 --caps 5,9
```

Harness ở `src/server/destinyBalanceReport.ts`, dùng thẳng core production: seed theo chu kỳ, bộ sinh luật, roster khóa, dựng tầng, `createDestinyFloorBattle`, AI, settlement, offer, Phúc/hồi phục và bảng đá.

- 12 chu kỳ liên tiếp từ `2026-11-16`.
- Roster 5 và 9 (tính cả Đinh Bộ Lĩnh; 9 là giới hạn hiện hành), mọi tướng cùng cấp 5 / 10 / 20 / 30, không trang bị.
- AI Khó đánh thay người chơi; địch dùng độ khó thật của tầng (Dễ, Thường, Khó, Trùm).
- Hai cách chọn thưởng: `boon` ưu tiên Phúc, `recovery` ưu tiên hồi phục. Harness lấy Phúc đầu tiên trong offer.
- Lúc dò đường hệ số, hai đầu mút được đổi tạm trong `destinyScaledEnemyPower`; bản commit chỉ giữ số đã chọn.

## Cấp địch theo tầng

`destinyFloorFoeLevel`: `1 + 29 × (tầng − 1) / 19`, làm tròn.

| Chặng | Tầng | Cấp địch | Hệ số sức địch |
|---|---|---|---|
| Dễ | 1–5 | 1, 3, 4, 6, 7 | 0,68 – 0,73 |
| Thường | 6–10 | 9, 10, 12, 13, 15 | 0,74 – 0,78 |
| Khó | 11–15 | 16, 18, 19, 21, 22 | 0,80 – 0,84 |
| Trùm | 16–20 | 24, 25, 27, 28, 30 | 0,85 – 0,90 |

## Chọn hệ số tầng cuối theo mục tiêu 85%

Hệ số tầng 1 giữ 0,68 (vòng dò trước cho thấy từ 0,74 trở lên có lượt cấp thấp dừng ngay tầng 2). Đo riêng đội cấp 30, 12 chu kỳ × roster 5 và 9 × hai cách chọn thưởng = 48 lượt leo mỗi dòng:

| Hệ số tầng 1 → tầng 20 | Qua đủ 20 tầng | Tầng trung bình |
|---|---:|---:|
| **0,68 → 0,90 (chọn)** | **41/48 = 85%** | 19,67 |
| 0,68 → 0,96 | 31/48 = 65% | 18,88 |
| 0,68 → 1,02 | 29/48 = 60% | 18,69 |
| 0,68 → 1,08 | 27/48 = 56% | 18,71 |
| 0,68 → 1,15 (vòng dò trước, 8 chu kỳ) | 16/32 = 50% | 17,5 |

Với 48 lượt, sai số của tỷ lệ 85% vào khoảng ±5 điểm phần trăm.

## Kết quả với 0,68 → 0,90 (12 chu kỳ)

| Roster | Cấp | Chọn thưởng | Tầng trung bình | Trung vị | Thấp nhất – cao nhất | Qua đủ 20 tầng | Đá/tuần |
|---:|---:|---|---:|---:|---|---:|---:|
| 5 | 5 | boon | 9,08 | 8 | 5–13 | 0/12 | 7,1 |
| 5 | 5 | recovery | 8,75 | 8 | 5–14 | 0/12 | 6,7 |
| 9 | 5 | boon | 9,08 | 9 | 3–14 | 0/12 | 7,2 |
| 9 | 5 | recovery | 9,17 | 9 | 5–12 | 0/12 | 7,1 |
| 5 | 10 | boon | 9,67 | 9 | 1–16 | 0/12 | 7,8 |
| 5 | 10 | recovery | 9,92 | 10 | 3–14 | 0/12 | 7,6 |
| 9 | 10 | boon | 11,50 | 11 | 1–16 | 0/12 | 10,4 |
| 9 | 10 | recovery | 10,67 | 10 | 5–15 | 0/12 | 8,8 |
| 5 | 20 | boon | 17,67 | 19 | 8–20 | 6/12 | 18,6 |
| 5 | 20 | recovery | 17,67 | 18 | 13–20 | 3/12 | 17,3 |
| 9 | 20 | boon | 18,33 | 20 | 11–20 | 8/12 | 20,2 |
| 9 | 20 | recovery | 15,50 | 15 | 8–20 | 4/12 | 15,4 |
| 5 | 30 | boon | 19,75 | 20 | 19–20 | 9/12 | 21,3 |
| 5 | 30 | recovery | 19,50 | 20 | 15–20 | 10/12 | 21,8 |
| 9 | 30 | boon | 19,83 | 20 | 18–20 | 11/12 | 22,4 |
| 9 | 30 | recovery | 19,58 | 20 | 15–20 | 11/12 | 22,4 |

Gộp theo cấp (48 lượt mỗi cấp):

| Cấp của đội | Tầng trung bình | Qua đủ 20 tầng | Qua mốc tầng 5 |
|---:|---:|---:|---:|
| 5 | 9,0 | 0/48 | 47/48 |
| 10 | 10,4 | 0/48 | 44/48 |
| 20 | 17,3 | 21/48 = 44% | 48/48 |
| 30 | 19,7 | 41/48 = 85% | 48/48 |

## Nhận xét

- **Đạt mục tiêu:** đội cấp 30 qua đủ 20 tầng 85% số lượt; lượt không qua đều dừng ở tầng 15–19.
- **Hệ quả cho cấp 20:** hạ hệ số cuối tháp để cấp 30 đạt 85% cũng giúp đội cấp 20 qua tháp 44% số lượt (với 0,68 → 1,15 là 6%). Chặng Trùm vì thế phân hạng kém hơn giữa cấp 20 và cấp 30; bảng xếp hạng sẽ dựa nhiều hơn vào số lượt đánh.
- **Cấp 5–10** tới trung bình tầng 9–10, cao hơn cấp của mình nhờ hệ số dưới 0,8 và mỗi cấp chỉ cộng 3% chỉ số. Có 5/96 lượt dừng trước tầng 5, trong đó hai lượt cấp 10 thua ngay tầng 1; đây là dao động của AI trên vài chu kỳ, chưa rõ luật tầng nào gây ra.
- **Roster 5 và 9 gần như ngang nhau** ở cùng cấp, nên giới hạn 8 tướng kèm không làm khó thêm.
- **Đá mỗi tuần** theo cấp: khoảng 7 (cấp 5), 8–10 (cấp 10), 15–20 (cấp 20), 21–22 (cấp 30), trên tổng tối đa 23.
- AI Khó đóng vai người chơi và tướng không có trang bị. Người chơi thật cẩn thận, có trang bị sẽ qua tháp nhiều hơn 85%; nên đo lại bằng dữ liệu thật sau 1–2 chu kỳ.

## Chưa đo

- Roster 3 và 8, và người chơi có cấp không đồng đều (thủ lĩnh thấp, vài tướng cao).
- Ảnh hưởng của trang bị và cường hóa.
- Nguyên nhân các lượt cấp 10 thua ở tầng 1–3.
- Sức mạnh riêng từng Phúc (harness không chọn Phúc theo tình huống) và thời gian chơi thật của một run 20 tầng.
