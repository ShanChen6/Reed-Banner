# T06.03 — Destiny & Stone Economy Simulation

Ngày chạy: 2026-10-24 (Asia/Ho_Chi_Minh)  
Nhánh: `update/tower`  
Kết luận: **ADJUST**

> Task ghi nhánh nền `develop`; mô phỏng chạy trên nhánh tích hợp `update/tower`. Không có tuning production
> nào được áp dụng trong task này.

## Mô hình tái lập

```text
pnpm exec tsx scripts/destiny-stone-sim.ts
```

Harness dùng trực tiếp production core: cycle HMAC seed, rule generator, roster snapshot, resolve floor,
`createDestinyFloorBattle`, AI turn, settlement, offer, Phúc/hồi phục và stone policy. Không dùng mô hình xác
suất thay thế.

- 4 cycle seed ghép cặp: `2026-10-19`, `2026-10-26`, `2026-11-02`, `2026-11-09`.
- Roster cap: 3 / 5 / 8, luôn có Đinh Bộ Lĩnh ở slot 0.
- Cấp: 5 / 10 / 20 / 30. Địch Destiny scale theo max level của roster như production.
- Hai policy:
  - `boon_first`: ưu tiên Phúc, chỉ hồi khi không có Phúc hợp lệ; bắt buộc cứu thủ lĩnh nếu gục.
  - `recovery_first`: ưu tiên cứu/hồi đội, sau đó mới lấy Phúc.
- Đội active xoay theo HP ratio cao nhất trong các đội hợp luật; không đổi tướng trong combat.
- Mỗi battle dùng AI hard cho người chơi và difficulty thật của tầng cho địch.
- Stone/cycle = milestone 3/5/10 (3/5/10 đá) + cycle reward 0/1/2/3/5, nhận tối đa một lần.

## Kết quả Destiny

`Food`, `HP`, revive và picks là mean của bốn cycle. P90 floor dùng nearest-rank.

| Cap | Level | Policy | Mean floor | Median | P90 | Food | HP% | Revive | Boon | Recovery | Stone/week |
|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 5 | boon | 3.50 | 4 | 5 | 95.5 | 46.0 | .50 | 3.00 | .50 | 5.50 |
| 3 | 5 | recovery | 3.75 | 3 | 7 | 95.5 | 55.2 | .25 | .25 | 3.50 | 5.50 |
| 3 | 10 | boon | 4.25 | 3 | 6 | 92.3 | 6.4 | .25 | 4.00 | .25 | 8.00 |
| 3 | 10 | recovery | 5.00 | 4 | 9 | 90.5 | 14.0 | .25 | 0 | 5.00 | 6.50 |
| 3 | 20 | boon | 2.75 | 1 | 6 | 85.5 | 13.8 | .25 | 2.50 | .25 | 4.25 |
| 3 | 20 | recovery | 2.25 | 1 | 5 | 89.5 | 35.6 | .25 | 0 | 2.25 | 4.25 |
| 3 | 30 | boon | 4.50 | 2 | 10 | 88.8 | 24.3 | .50 | 4.00 | .50 | 9.00 |
| 3 | 30 | recovery | 5.25 | 5 | 8 | 85.5 | 42.3 | .50 | 0 | 5.25 | 8.50 |
| 5 | 5 | boon | 8.00 | 7 | 10 | 89.0 | 32.5 | 1.00 | 7.00 | 1.00 | 17.00 |
| 5 | 5 | recovery | 10.00 | 10 | 10 | 94.3 | 71.6 | 2.25 | 1.50 | 8.50 | 23.00 |
| 5 | 10 | boon | 8.00 | 7 | 10 | 90.3 | 24.0 | 1.50 | 6.50 | 1.50 | 14.00 |
| 5 | 10 | recovery | 6.25 | 6 | 10 | 87.3 | 45.6 | 1.00 | .75 | 5.50 | 12.50 |
| 5 | 20 | boon | 4.75 | 3 | 7 | 64.8 | 16.4 | .25 | 4.50 | .25 | 8.00 |
| 5 | 20 | recovery | 8.00 | 7 | 10 | 78.0 | 49.6 | 1.75 | .50 | 7.50 | 17.00 |
| 5 | 30 | boon | 6.00 | 6 | 9 | 89.3 | 23.6 | .75 | 5.25 | .75 | 8.50 |
| 5 | 30 | recovery | 4.25 | 4 | 6 | 59.0 | 13.2 | 1.25 | 1.00 | 3.25 | 7.00 |
| 8 | 5 | boon | 7.75 | 9 | 10 | 75.3 | 46.8 | 1.00 | 6.75 | 1.00 | 14.50 |
| 8 | 5 | recovery | 7.25 | 6 | 10 | 77.3 | 49.3 | 1.25 | 1.25 | 6.00 | 14.00 |
| 8 | 10 | boon | 7.50 | 9 | 10 | 78.0 | 24.5 | 1.50 | 6.00 | 1.50 | 11.50 |
| 8 | 10 | recovery | 6.25 | 6 | 10 | 90.5 | 39.8 | 1.00 | .75 | 5.50 | 12.50 |
| 8 | 20 | boon | 7.25 | 8 | 10 | 77.0 | 46.5 | 1.75 | 5.50 | 1.75 | 14.50 |
| 8 | 20 | recovery | 4.75 | 3 | 9 | 58.5 | 51.6 | 1.25 | 0 | 4.75 | 7.00 |
| 8 | 30 | boon | 7.50 | 7 | 10 | 83.3 | 33.5 | 1.25 | 6.25 | 1.25 | 15.50 |
| 8 | 30 | recovery | 6.75 | 6 | 9 | 47.0 | 31.8 | 2.00 | 1.00 | 5.75 | 9.50 |

## So sánh multi-run trong một cycle

Level 10; run 2 lấy kết quả tốt hơn giữa hai policy. Run 3 lặp lại cùng seed/policy nên không tạo thêm
variation trong harness production-deterministic.

| Cap | Một run | Hai run | Ba run |
|---:|---:|---:|---:|
| 3 | 4.25 | 5.25 | 5.25 |
| 5 | 8.00 | 8.25 | 8.25 |
| 8 | 7.50 | 8.75 | 8.75 |

Milestone và cycle stone vẫn chỉ nhận một lần; replay không nhân emission. Run thứ hai có giá trị để đổi policy,
nhưng run thứ ba với cùng quyết định không có lợi ích mô phỏng. Người thật có thể cải thiện qua kỹ năng/lineup,
nên đây là sàn variation của AI, không phải trần retry.

## Stone economy

### Nguồn production hiện tại

- Trial first-clear V1: tối đa 77 đá, chỉ một lần.
- Trial sweep: 1/2/3/4 đá mỗi ngày theo tier, tương ứng 7/14/21/28 mỗi tuần.
- Destiny: 0–18 milestone + 0–5 cycle reward, tối đa 23/cycle.
- Reward giữa tầng Destiny: 0 đá.

Ba profile benchmark dùng kết quả gần hành vi tương ứng, không phải forecast retention:

| Profile | Trial progress | Trial steady/week | Destiny/week | Tổng steady/week | First-clear Trial | Tuần đầu gồm first-clear |
|---|---:|---:|---:|---:|---:|---:|
| Low | tầng 5 | 7 | 5.5 | 12.5 | 11 | 23.5 |
| Average | tầng 12 | 21 | 14.0 | 35.0 | 35 | 70.0 |
| High | tầng 20 | 28 | 15.5 | 43.5 | 77 | 120.5 |

Emission steady-state bị cap theo ngày/cycle; replay không farm được. Tuy nhiên chưa có stone sink production nên số dư
vẫn tăng tuyến tính.

### Benchmark thời gian đến +5 tương lai

Đây chỉ là benchmark, không phải giá production. Giả định 5 phút mỗi tầng Destiny đã chơi và 1 phút/ngày để
claim sweep. Không tính thời gian first-clear Trial, menu hoặc retry thủ công.

| Profile | Phút active/tuần | 75 đá | 150 đá | 300 đá |
|---|---:|---:|---:|---:|
| Low | ~26 | 6 tuần / 2.6 giờ | 12 tuần / 5.2 giờ | 24 tuần / 10.4 giờ |
| Average | ~47 | 2.2 tuần / 1.7 giờ | 4.3 tuần / 3.4 giờ | 8.6 tuần / 6.7 giờ |
| High | ~45 | 1.7 tuần / 1.3 giờ | 3.5 tuần / 2.6 giờ | 6.9 tuần / 5.2 giờ |

Daily/cycle gates quan trọng hơn số giờ active: không thể grind liên tục để bỏ qua thời gian lịch.

## Đánh giá balance

### GO

- Stone issuance: milestone/cycle/sweep có receipt và cap; tối đa Destiny 23/cycle.
- Roster 5: đủ chiều sâu rotate nhưng không tạo quá nhiều nhánh rule/lineup; kết quả tốt nhất và ổn định nhất trong mẫu.
- Cho phép nhiều run/cycle: không tăng đá và giúp người chơi thử policy khác.

### ADJUST

- Giữ cap kỹ thuật 8 nhưng đề xuất mặc định/onboarding là 5. Cap 8 không chứng minh tốt hơn cap 5 và tăng tải chọn đội.
- UI nên giải thích recovery có giá trị dài hạn; boon-first để lại HP rất thấp ở nhiều nhóm.
- Cần telemetry thật theo `rosterSize`, floor, policy/reward kind, HP/food cuối tầng và số run/cycle.
- Rule generator phụ thuộc roster, nên so sánh cap không phải paired encounter tuyệt đối. Nếu cần A/B khoa học, thêm chế độ
  generator dùng common rule snapshot khả thi cho cả ba cap.

### NO-GO

- Chưa chốt giá nâng trang bị hoặc triển khai stone sink. Không thể suy từ bảng này thành +ATK/DEF/HP production.
- Không tăng emission chỉ vì cap 3 kém: cap 3 là lựa chọn thiếu dự bị và nên được UI cảnh báo, không bù bằng đá.

## Uncertainty

- Chỉ bốn cycle seed; mean/median/P90 có sai số lớn và P90 rất thô.
- Enemy scale theo level, nên level cao không phải buff thuần; skill unlock và AI heuristic làm kết quả không đơn điệu.
- Policy là hai heuristic cực trị, chưa tối ưu theo floor/offer; người thật có thể vượt cả hai.
- Simulator không đo thời gian thao tác UI, churn, thiết bị yếu hoặc lỗi mạng.
- `food > 60` là hợp lệ vì bánh chưng trong battle có thể tăng lương; không phải tự hồi giữa tầng.

## Quyết định

**ADJUST** — economy source có thể tiếp tục thử nghiệm, nhưng nên mặc định roster 5, thu telemetry và chưa mở
equipment enhancement. Không có production tuning nào được thực hiện bởi task này.
