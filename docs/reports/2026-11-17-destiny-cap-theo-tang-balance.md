# Tháp Thiên Mệnh — mô phỏng cân bằng khi cấp địch tăng theo tầng (1–30)

> Cập nhật: 17/11/2026
> Trạng thái: **AUDIT** — số đo từ mô phỏng, không phải luật. Luật ở [luật Song Tháp §11.2](../02-game-modes/dual-tower/00-02-rules.md#112-tầng-nhóm-khó-và-sức-địch).

Thay cho báo cáo 11/11/2026 (đo khi địch còn theo cấp cao nhất của roster). Ngày 17/11/2026 Shan chốt: cấp địch tăng đều từ 1 ở tầng 1 tới 30 ở tầng 20, roster tối đa 8 tướng kèm, và cân bằng lại độ khó. Báo cáo này là căn cứ chọn đường hệ số sức địch **0,68 → 1,15**.

## Cách chạy

```text
pnpm exec tsx scripts/destiny-stone-sim.ts --cycles 8 --caps 5,9
```

Harness ở `src/server/destinyBalanceReport.ts`, dùng thẳng core production: seed theo chu kỳ, bộ sinh luật, roster khóa, dựng tầng, `createDestinyFloorBattle`, AI, settlement, offer, Phúc/hồi phục và bảng đá.

- 8 chu kỳ liên tiếp từ `2026-11-16`.
- Roster 5 và 9 (tính cả Đinh Bộ Lĩnh; 9 là giới hạn hiện hành), mọi tướng cùng cấp 5 / 10 / 20 / 30, không trang bị.
- AI Khó đánh thay người chơi; địch dùng độ khó thật của tầng (Dễ, Thường, Khó, Trùm).
- Hai cách chọn thưởng: `boon` ưu tiên Phúc, `recovery` ưu tiên hồi phục. Harness lấy Phúc đầu tiên trong offer.
- Lúc dò đường hệ số, hai đầu mút được đổi tạm trong `destinyScaledEnemyPower`; bản commit chỉ giữ số đã chọn.

## Cấp địch theo tầng

`destinyFloorFoeLevel`: `1 + 29 × (tầng − 1) / 19`, làm tròn.

| Chặng | Tầng | Cấp địch | Hệ số sức địch |
|---|---|---|---|
| Dễ | 1–5 | 1, 3, 4, 6, 7 | 0,68 – 0,78 |
| Thường | 6–10 | 9, 10, 12, 13, 15 | 0,80 – 0,90 |
| Khó | 11–15 | 16, 18, 19, 21, 22 | 0,93 – 1,03 |
| Trùm | 16–20 | 24, 25, 27, 28, 30 | 1,05 – 1,15 |

## Chọn đường hệ số

Tầng trung bình AI tới được theo cấp của người chơi (4 chu kỳ đầu, gộp roster 5 và 9, hai cách chọn thưởng; 16 run mỗi ô):

| Hệ số tầng 1 → tầng 20 | Cấp 5 | Cấp 10 | Cấp 20 | Cấp 30 | Run thấp nhất | Cấp 30 qua đủ 20 tầng |
|---|---:|---:|---:|---:|---:|---:|
| 0,74 → 1,12 (đường cũ) | 7,2 | 8,1 | 13,9 | 18,7 | tầng 2 | 8/16 |
| 0,80 → 0,80 | 7,1 | 10,4 | 17,4 | 19,6 | tầng 2 | 14/16 |
| 0,70 → 0,90 | 9,8 | 10,8 | 16,9 | 19,4 | tầng 2 | 14/16 |
| 0,65 → 1,00 | 9,2 | 9,9 | 15,6 | 19,6 | tầng 5 | 12/16 |
| **0,68 → 1,15 (chọn)** | 7,9 | 9,6 | 14,5 | 18,8 | tầng 5 | 9/16 |
| 0,70 → 1,25 | 7,9 | 8,1 | 12,8 | 16,6 | tầng 5 | 3/16 |

- Đường phẳng hoặc thoải ở cuối (ba dòng giữa) để đội cấp 30 qua tháp gần như mọi lần, chặng Trùm không còn phân hạng.
- Đường cũ 0,74 → 1,12 có run cấp thấp dừng ngay tầng 2; hạ đầu xuống 0,65–0,70 thì run thấp nhất là tầng 5 (mốc đá đầu tiên).
- 0,70 → 1,25 gắt quá ở cuối: AI cấp 30 chỉ qua tháp 3/16 lần.
- **0,68 → 1,15** giữ được cả hai đầu: mọi run qua mốc tầng 5, đội cấp 30 qua tháp khoảng một nửa số lần.

## Kết quả với 0,68 → 1,15 (8 chu kỳ)

| Roster | Cấp | Chọn thưởng | Tầng trung bình | Trung vị | Thấp nhất – cao nhất | Qua đủ 20 tầng | Đá/tuần |
|---:|---:|---|---:|---:|---|---:|---:|
| 5 | 5 | boon | 8,00 | 8 | 5–10 | 0/8 | 5,7 |
| 5 | 5 | recovery | 6,75 | 6 | 5–10 | 0/8 | 5,7 |
| 5 | 10 | boon | 8,38 | 9 | 5–10 | 0/8 | 6,9 |
| 5 | 10 | recovery | 8,75 | 8 | 6–14 | 0/8 | 6,2 |
| 5 | 20 | boon | 14,88 | 15 | 9–20 | 1/8 | 14,1 |
| 5 | 20 | recovery | 14,25 | 12 | 11–18 | 0/8 | 13,0 |
| 5 | 30 | boon | 17,88 | 20 | 9–20 | 5/8 | 19,1 |
| 5 | 30 | recovery | 16,25 | 18 | 11–20 | 2/8 | 15,5 |
| 9 | 5 | boon | 7,75 | 7 | 5–11 | 0/8 | 6,3 |
| 9 | 5 | recovery | 6,88 | 7 | 5–10 | 0/8 | 5,7 |
| 9 | 10 | boon | 9,38 | 9 | 7–12 | 0/8 | 6,9 |
| 9 | 10 | recovery | 8,75 | 7 | 7–13 | 0/8 | 6,2 |
| 9 | 20 | boon | 14,38 | 14 | 8–20 | 1/8 | 12,5 |
| 9 | 20 | recovery | 13,12 | 11 | 10–18 | 0/8 | 12,2 |
| 9 | 30 | boon | 18,12 | 20 | 11–20 | 5/8 | 19,6 |
| 9 | 30 | recovery | 17,88 | 19 | 11–20 | 4/8 | 18,8 |

Gộp theo cấp (32 run mỗi cấp): cấp 5 tới tầng 7,3; cấp 10 tới 8,8; cấp 20 tới 14,2; cấp 30 tới 17,5, qua đủ 20 tầng 16/32 lần.

## Nhận xét

- **Cấp của người chơi giờ quyết định tầng tới được.** Khi địch theo cấp cao nhất của roster (báo cáo 11/11), mọi cấp đều dừng quanh tầng 7–12 và cấp 30 không leo cao hơn cấp 5. Nay mỗi mức cấp dừng ở một chặng riêng: cấp 5–10 hết chặng Thường, cấp 20 giữa chặng Khó, cấp 30 vào chặng Trùm.
- **Người chơi mới không bị chặn sớm:** đội cấp 5 vẫn qua tầng 5 ở mọi run và trung bình tới tầng 7 (địch cấp 10) nhờ hệ số dưới 0,8 ở đầu tháp và mỗi cấp chỉ cộng 3% chỉ số.
- **Roster 5 và 9 gần như ngang nhau** ở cùng cấp. Thêm dự bị không kéo dài lượt leo với AI đánh thay; giới hạn 8 tướng kèm không làm khó thêm.
- **Đá mỗi tuần** theo cấp: khoảng 6 (cấp 5–10), 12–14 (cấp 20), 16–20 (cấp 30), trên tổng tối đa 23.
- Người chơi thật chọn đội, nghề/hệ thủ lĩnh và Phúc tốt hơn AI, và có trang bị, nên các số trên là mức sàn. Dao động giữa các chu kỳ lớn (cấp 30 có run dừng ở tầng 9–11).

## Chưa đo

- Roster 3 và 8, và người chơi có cấp không đồng đều (thủ lĩnh thấp, vài tướng cao).
- Ảnh hưởng của trang bị và cường hóa.
- Sức mạnh riêng từng Phúc (harness không chọn Phúc theo tình huống) và thời gian chơi thật của một run 20 tầng.
