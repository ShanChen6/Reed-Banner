# T03.01 — Daily Sweep State

## Hợp đồng

- Timezone nghiệp vụ: `Asia/Ho_Chi_Minh`; date key `YYYY-MM-DD`, đổi lúc 00:00 Việt Nam.
- Tier lấy authoritative từ `trial.cleared`: 0 tầng = chưa đủ điều kiện; 1–5 = tier 1; 6–10 = tier 2; 11–15 = tier 3; 16–20 = tier 4.
- Receipt lưu trong profile: `lastSweep { dateKey, tier, claimedAt }`. Chỉ giữ ngày gần nhất nên ngày bỏ lỡ không tích lượt.
- `claimTrialSweepState(store, ownerId, now)` là one-step claim bằng optimistic CAS. Client không gửi date key, tier hay highestCleared.
- Duplicate cùng player/date trả `claimed:false`; hai request đồng thời chỉ một request trả `claimed:true`.
- Bước này **không phát đá**, không ghi stone ledger và không có API reward. Settlement/phần thưởng là dependency kế tiếp.

## Tương thích

Không cần SQL migration vì state nằm trong JSON profile. Parser chuyển `lastSweepDay` hợp lệ cũ thành receipt với tier suy từ `cleared` và `claimedAt: 0`; receipt hỏng bị bỏ. `tower.best`, `tower.run`, BXH và settlement cũ không được đọc hay sửa bởi claim.
