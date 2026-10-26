# T03.02 — Cân bằng bảng đá quét

## Phạm vi và đầu vào

Tài liệu này chốt **bảng phát hành cho quét Trial**, không triển khai settlement và không tạo luật nâng cấp trang bị. State T03.01 đã có date key Việt Nam, tier lấy từ `highestCleared`, receipt một lần/player/ngày và CAS chống claim đồng thời. Dữ liệu 20 tầng hiện tại phát tổng cộng 77 Đá Cường Hóa ở first-clear.

Destiny chưa có con số milestone/chu kỳ được duyệt. Phần Destiny dưới đây là sensitivity benchmark, không phải cấu hình production.

## Bảng cấu hình Trial sweep

| Tầng cao nhất đã vượt | Tier | Đá/ngày | 7 ngày | 30 ngày | 90 ngày |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 0 | 0 | 0 | 0 | 0 |
| 1–5 | 1 | 1 | 7 | 30 | 90 |
| 6–10 | 2 | 2 | 14 | 60 | 180 |
| 11–15 | 3 | 3 | 21 | 90 | 270 |
| 16–20 | 4 | 4 | 28 | 120 | 360 |

Nguồn cấu hình sửa được tại `TRIAL_SWEEP_STONES_BY_TIER`; `trialSweepStoneAmount()` chỉ tra bảng và trả 0 cho tier không hợp lệ. Hàm này chưa ghi ví và không thay đổi receipt.

## First-clear hiện tại

| Nhóm tầng | Đá/tầng | Tổng nhóm | Lũy kế |
| --- | --- | ---: | ---: |
| 1–4 | 2 | 8 | 8 |
| 5–9 | 3 | 15 | 23 |
| 10–14 | 4 | 20 | 43 |
| 15–18 | 5 | 20 | 63 |
| 19 | 6 | 6 | 69 |
| 20 | 8 | 8 | 77 |

First-clear là nguồn hữu hạn: replay không phát lại. Sweep là nguồn lặp, tăng tuyến tính và bị chặn ở 4 đá/ngày.

## Kịch bản người chơi

Giả định người chơi đã đạt tầng nêu dưới đây ở đầu cửa sổ, nhận đủ first-clear đến tầng đó và không bỏ ngày quét. Đây là trần phát hành theo hành vi của từng profile, không phải dự báo retention.

| Profile | Mốc Trial | First-clear | Sweep/ngày | Trial 7 ngày | Trial 30 ngày | Trial 90 ngày |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Low | tầng 5 | 11 | 1 | 18 | 41 | 101 |
| Average | tầng 12 | 35 | 3 | 56 | 125 | 305 |
| High | tầng 20 | 77 | 4 | 105 | 197 | 437 |

### Destiny sensitivity benchmark

Một chu kỳ hoàn thành được tính mỗi 7 ngày; 7/30/90 ngày tương ứng 1/4/12 chu kỳ trọn vẹn. Các mức 0/4/8 dưới đây chỉ giúp nhìn độ nhạy trước khi task Destiny chốt milestone và settlement.

| Benchmark Destiny | Đá/chu kỳ | 7 ngày | 30 ngày | 90 ngày |
| --- | ---: | ---: | ---: | ---: |
| Chưa tham gia / chưa duyệt | 0 | 0 | 0 | 0 |
| Trung bình giả lập | 4 | 4 | 16 | 48 |
| Cao giả lập | 8 | 8 | 32 | 96 |

Nếu ghép benchmark theo profile (Low +0, Average +4, High +8 mỗi chu kỳ), tổng Trial + Destiny là:

| Profile | 7 ngày | 30 ngày | 90 ngày |
| --- | ---: | ---: | ---: |
| Low | 18 | 41 | 101 |
| Average | 60 | 141 | 353 |
| High | 113 | 229 | 533 |

Không dùng các con số Destiny này làm API/config cho đến khi có quyết định riêng.

## Benchmark chi phí cường hóa tương lai

Không có giá +0→+5 được chốt và Tower V1.0 chưa có sink. Ba vector dưới đây chỉ là thước đo, không phải luật game:

| Benchmark | Chi phí từng bước +0→+5 | Tổng | Số ngày sweep tier 1/2/3/4 |
| --- | --- | ---: | --- |
| Nhẹ | 5 / 10 / 15 / 20 / 25 | 75 | 75 / 38 / 25 / 19 |
| Cơ sở | 10 / 20 / 30 / 40 / 50 | 150 | 150 / 75 / 50 / 38 |
| Nặng | 20 / 40 / 60 / 80 / 100 | 300 | 300 / 150 / 100 / 75 |

First-clear tối đa 77 đủ cho một benchmark nhẹ, nhưng không đủ benchmark cơ sở. Khi GEAR-01–08 bắt đầu, phải đo lại tốc độ đạt tier, tỷ lệ claim và phân phối số dư thật trước khi chọn giá.

## Cap, anti-farm và inflation

- Cap phát hành Trial: tối đa 4/ngày, 28/7 ngày, 120/30 ngày, 360/90 ngày; first-clear tối đa 77 suốt đời nội dung V1.
- Tier và ngày đều do server tính; client không gửi số đá. Không tích lượt ngày bỏ lỡ.
- Receipt duy nhất theo player/date và CAS khiến retry hoặc claim đồng thời chỉ có một lần thắng. Settlement sau này phải dùng cùng transaction/idempotency key, không tin receipt phía client.
- Replay tầng không phát first-clear. `highestCleared` chỉ mở tier; farm lại tầng không tăng lượng ngày đó.
- Wallet có giới hạn an toàn số nguyên, nhưng **không đề xuất hard wallet cap** vì cap sẽ gây mất thưởng khó giải thích. Cap nguồn/ngày là kiểm soát kinh tế chính.
- Khi chưa có sink, 100% gross issuance được giữ lại và số dư tăng tuyến tính: high profile đạt 437 đá Trial sau 90 ngày, hoặc 533 nếu dùng benchmark Destiny cao. Đây là rủi ro inflation có chủ ý để quan sát, không phải trạng thái kinh tế bền vững.
- Telemetry nên theo dõi p50/p90 số dư, claim rate theo tier, đá phát/người hoạt động/ngày và tỷ lệ người chơi vượt 300/500 đá. Không tự nerf từ client hay hồi tố số dư.

## Quyết định và điều kiện chuyển tiếp

1. Chốt Trial sweep 1/2/3/4 đá cho bốn tier; tier 0 nhận 0.
2. Không thay first-clear 77 vì task này không được thay balance nội dung T02.06.
3. Không phát đá tại bước T03.02. Task settlement kế tiếp phải atomic giữa receipt và ledger/wallet, đồng thời giữ tương thích `tower.best`, `tower.run` và settlement cũ.
4. Destiny reward và giá nâng cấp vẫn TBD; chỉ được đưa vào production qua task riêng cùng test idempotency/concurrency.
