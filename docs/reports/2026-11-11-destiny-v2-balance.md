# Tháp Thiên Mệnh V2 (20 tầng) — mô phỏng cân bằng

> Cập nhật: 11/11/2026
> Trạng thái: **AUDIT** — số đo từ mô phỏng, không phải luật. Luật ở [luật Song Tháp §11](../02-game-modes/dual-tower/00-02-rules.md#11-destiny-v2--20-tầng-shan-chốt-11112026).

## Cách chạy

```text
pnpm exec tsx scripts/destiny-stone-sim.ts
```

Harness ở `src/server/destinyBalanceReport.ts` (thêm `--v1` để đo lại luật 10 tầng): dùng thẳng core production gồm seed HMAC theo chu kỳ, bộ sinh luật, roster khóa, dựng tầng, `createDestinyFloorBattle`, AI, settlement, offer, Phúc/hồi phục và bảng đá.

- 4 chu kỳ V2: `2026-11-16`, `2026-11-23`, `2026-11-30`, `2026-12-07`.
- Roster 3 / 5 / 8 tướng, cấp 5 / 10 / 20 / 30. Địch theo cấp cao nhất của roster.
- AI Khó đánh thay người chơi; địch dùng độ khó thật của tầng (Dễ, Thường, Khó, Trùm).
- Hai cách chọn thưởng: `boon` ưu tiên Phúc, `recovery` ưu tiên hồi phục. Harness lấy Phúc đầu tiên trong offer, không chọn Phúc theo tình huống.
- Đá mỗi tuần = mốc 5/10/15/20 (3/4/5/6 đá) + đá cuối chu kỳ 0–5.

## Kết quả

`Food`, `HP`, revive và số lần chọn là trung bình của bốn chu kỳ. Mỗi dòng chỉ có 4 run nên P90 thực chất là run tốt nhất.

| Cap | Level | Policy | Mean floor | Median | P90 | Food | HP% | Revive | Boon | Recovery | Stone/week |
|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 5 | boon | 5.25 | 5 | 8 | 81.0 | 29.8 | 0.00 | 5.25 | 0.00 | 4.00 |
| 3 | 5 | recovery | 5.75 | 7 | 7 | 87.3 | 24.7 | 0.50 | 0.25 | 5.50 | 4.00 |
| 3 | 10 | boon | 4.50 | 5 | 7 | 89.8 | 40.7 | 0.25 | 4.25 | 0.25 | 4.00 |
| 3 | 10 | recovery | 4.50 | 5 | 7 | 87.5 | 47.7 | 0.25 | 0.25 | 4.25 | 4.00 |
| 3 | 20 | boon | 4.25 | 4 | 6 | 89.8 | 39.6 | 0.50 | 3.75 | 0.50 | 3.00 |
| 3 | 20 | recovery | 4.50 | 4 | 7 | 90.3 | 46.6 | 0.50 | 0.25 | 4.25 | 3.00 |
| 3 | 30 | boon | 5.00 | 5 | 6 | 95.0 | 46.1 | 0.00 | 5.00 | 0.00 | 4.00 |
| 3 | 30 | recovery | 4.50 | 4 | 6 | 91.8 | 56.6 | 0.25 | 0.75 | 3.75 | 3.00 |
| 5 | 5 | boon | 10.25 | 10 | 11 | 90.3 | 18.3 | 0.50 | 9.75 | 0.50 | 8.75 |
| 5 | 5 | recovery | 11.50 | 10 | 14 | 79.5 | 41.7 | 1.50 | 1.00 | 10.50 | 10.00 |
| 5 | 10 | boon | 9.00 | 7 | 16 | 62.0 | 21.8 | 1.25 | 7.75 | 1.25 | 8.00 |
| 5 | 10 | recovery | 7.75 | 8 | 9 | 69.3 | 11.6 | 1.25 | 0.50 | 7.25 | 5.00 |
| 5 | 20 | boon | 10.25 | 9 | 16 | 81.8 | 20.8 | 2.00 | 8.25 | 2.00 | 9.00 |
| 5 | 20 | recovery | 9.00 | 8 | 14 | 81.5 | 29.3 | 1.75 | 1.25 | 7.75 | 6.25 |
| 5 | 30 | boon | 8.50 | 7 | 12 | 76.8 | 23.6 | 0.00 | 8.50 | 0.00 | 6.25 |
| 5 | 30 | recovery | 9.25 | 9 | 11 | 94.8 | 22.9 | 1.25 | 0.75 | 8.50 | 7.50 |
| 8 | 5 | boon | 14.00 | 10 | 20 | 61.3 | 39.8 | 1.25 | 11.50 | 2.00 | 15.25 |
| 8 | 5 | recovery | 10.25 | 10 | 12 | 73.0 | 25.5 | 2.50 | 0.50 | 9.75 | 8.75 |
| 8 | 10 | boon | 10.50 | 8 | 20 | 79.0 | 42.4 | 0.75 | 9.50 | 0.75 | 9.50 |
| 8 | 10 | recovery | 12.25 | 12 | 18 | 82.8 | 19.6 | 3.25 | 0.75 | 11.50 | 10.25 |
| 8 | 20 | boon | 7.50 | 7 | 10 | 64.3 | 32.4 | 0.50 | 6.75 | 0.75 | 6.50 |
| 8 | 20 | recovery | 9.75 | 10 | 13 | 73.5 | 51.6 | 1.25 | 1.00 | 8.75 | 8.75 |
| 8 | 30 | boon | 7.25 | 8 | 10 | 75.0 | 30.4 | 1.50 | 5.75 | 1.50 | 5.25 |
| 8 | 30 | recovery | 11.00 | 7 | 20 | 62.8 | 37.1 | 2.00 | 1.00 | 9.75 | 10.75 |

Nhiều run trong một chu kỳ (cấp 10; run 2 lấy kết quả tốt hơn giữa hai cách chọn thưởng):

| Roster | Một run | Hai run |
|---:|---:|---:|
| 3 | 4,50 | 4,50 |
| 5 | 9,00 | 10,00 |
| 8 | 10,50 | 13,50 |

## Nhận xét

- **Roster 3 tướng** dừng quanh tầng 4–6, không run nào qua tầng 8: không có dự bị nên hao máu chặn sớm, giống V1 (tầng 2–5 trên 10).
- **Roster 5 tướng** trung bình tầng 8–11, run tốt nhất tới tầng 16.
- **Roster 8 tướng** trung bình tầng 7–14; 3 trong 8 tổ hợp có run qua đủ 20 tầng.
- So với V1 (trung bình tầng 3–8 trên 10, nhiều tổ hợp P90 = 10), V2 dài gấp đôi nhưng tầng cuối vẫn tới được; nửa sau (Khó và Trùm) là phần phân hạng.
- **Đá mỗi tuần giảm** với AI đánh thay: khoảng 3–4 (roster 3), 5–10 (roster 5), 5–15 (roster 8), so với 4–9 / 7–23 / 7–15 ở V1. Đây là hệ quả đã biết của việc giữ tổng 18 đá và dời mốc lên tầng 5/10/15/20.
- Người chơi thật chọn đội, nghề/hệ thủ lĩnh và Phúc tốt hơn AI, nên các số trên là mức sàn. Mẫu nhỏ (4 chu kỳ); nên đo lại bằng dữ liệu thật sau 1–2 chu kỳ đầu.

## Chưa đo

- Chưa đo riêng sức mạnh từng Phúc mới (harness không chọn Phúc theo tình huống).
- Chưa đo thời gian chơi thật của một run 20 tầng.
