# RH-02 — Feature flags Song Tháp

> Cập nhật: 24/10/2026

## Cấu hình

Hai biến server độc lập, chỉ giá trị chính xác `true` mới bật. Thiếu, rỗng, `1`, `TRUE` hoặc giá trị khác đều tắt.

| `TRIAL_ENABLED` | `DESTINY_ENABLED` | Kết quả |
|---|---|---|
| thiếu/`false` | thiếu/`false` | Cả hai tắt |
| `true` | thiếu/`false` | Chỉ Trial bật |
| thiếu/`false` | `true` | Chỉ Destiny bật |
| `true` | `true` | Cả hai bật |

Không đặt mặc định production trong source hoặc deployment manifest. Vận hành phải cấu hình từng biến trong môi
trường deploy và redeploy; không đưa giá trị flag hay `SESSION_SECRET` vào client bundle.

## Hợp đồng khi tắt

- Entry menu trở thành thẻ disabled và deep-link hiển thị “chưa mở”. Tab BXH Destiny bị ẩn.
- GET overview trả `{ enabled: false, error: "featureDisabled" }` và không load/reconcile hồ sơ.
- Mọi write endpoint trả HTTP `503` với `{ error: "featureDisabled" }`.
- API battle chung trả cùng error cho GET/action của match Trial/Destiny; không chạy bù, save, claim reward hoặc
  settlement. Cron bỏ qua match của mode tắt.
- Trận/run/progress/wallet giữ nguyên. Khi bật lại, request đầu tiên tiếp tục pipeline bình thường; receipt hiện có
  vẫn bảo đảm settlement/replay không cấp thưởng trùng. Destiny hết cycle trong lúc tắt chỉ reconcile sau khi bật lại.
- Flag chỉ tác động match có tag Trial/Destiny; legacy Tower, Survival, Campaign, Arena, Daily và Normal không đổi.

## Ma trận endpoint

| Endpoint/path | Trial flag | Destiny flag | Khi flag mode tắt |
|---|---|---|---|
| `GET /api/trial` | đọc | — | 200 disabled payload, không ghi |
| `POST/DELETE /api/trial/battles` | ghi | — | 503; không tạo cookie/match/profile write |
| `POST /api/trial/sweep` | ghi wallet | — | 503; không receipt/wallet write |
| `GET /api/destiny` | — | đọc/reconcile | 200 disabled payload, không reconcile |
| `POST /api/destiny/run` | — | ghi | 503; không tạo cookie/run |
| `POST /api/destiny/battles` | — | ghi | 503; không create/resume |
| `POST /api/destiny/reward` | — | ghi | 503; không advance/recovery/boon |
| `POST /api/destiny/stop` | — | ghi | 503; run giữ nguyên |
| `GET /api/destiny/leaderboard` | — | đọc | 200 disabled payload |
| `GET/POST /api/battles/:id[/actions]` | theo match | theo match | 503; freeze match, không settlement |
| cron `settleAbandoned` | theo match | theo match | skip match của mode tắt |

## Rollout/rollback

1. Deploy với OFF/OFF và kiểm tra health/legacy modes.
2. Bật riêng mode cần cohort thử nghiệm; xác nhận env sau deploy bằng UI/disabled API, không log secret.
3. Rollback bằng cách đặt flag mode về `false` và redeploy. Không xóa run, match, ledger hoặc trừ đá.
4. Khi bật lại, theo dõi conflict, settlement latency, duplicate receipt và Destiny cycle reconciliation.

## RH-02 readiness

RH-02 đạt PASS khi bốn tổ hợp, direct API bypass, freeze/re-enable settlement, typecheck, lint, related tests và
legacy regression đều PASS trên CI. Migration/schema không thay đổi.

### Kết quả local 24/10/2026

| Lệnh | Kết quả |
|---|---|
| `.\\node_modules\\.bin\\tsc.cmd --noEmit` | PASS |
| `.\\node_modules\\.bin\\eslint.cmd .` | PASS |
| `node --import tsx --test tests/server/towerFeatureFlags.test.ts` | PASS, 5/5 |
| nhóm Trial/Destiny/stone/legacy liên quan | PASS, 56/56 trước khi thêm case normal OFF/OFF cuối; case mới PASS trong 5/5 |
| `node --import tsx --test --test-reporter=dot "tests/**/*.test.ts"` | PASS, exit 0, không có fail output |
| `.\\node_modules\\.bin\\next.cmd build --webpack` | PASS, 30/30 static pages |

Local evidence đạt **RH-02 PASS**. Vận hành production vẫn phải xác minh env trên staging; task không tự bật flag,
commit, push, merge hoặc deploy.
