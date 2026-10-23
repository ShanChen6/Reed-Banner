# Survival Defense V1.1 — Balance Simulation Report

**Kết luận: NO-GO cho sign-off cân bằng; giữ nguyên luật 10% hiện tại trong lúc thu thập mẫu lớn hơn.**  
Không có thay đổi production, kỹ năng, lương, tinh thần, hoặc tỷ lệ hồi phục trong task này.

## 1. Tóm tắt

- Harness mới chạy trong `src/core/sim/survival-v11.ts`; CLI ở `scripts/survival-v11-balance.ts`. Cả hai chỉ phục vụ mô phỏng, không được gọi từ gameplay/server.
- Tập kết quả chính có **432 simulation runs hoàn tất và được lưu**:
  - Hồi phục dự bị: 200 runs; 10 seed/config/cấp × 5 tỷ lệ × 4 cấp.
  - Rotation/build: 192 runs; 3 seed/config/cấp × (8 policy rotation + 7 policy leader) × 4 cấp, cùng 12 control runs không dự bị.
  - Control không dự bị bổ sung: 40 runs; 10 seed/cấp × 4 cấp.
- Cỡ mẫu còn rất thấp so với mục tiêu 200 seed/config/cấp. Các kết quả rotation/build chỉ có **3 seed/cấp** và không đủ để xếp hạng chiến thuật. Mọi khoảng tin cậy trong báo cáo đều phải được xem là sơ bộ.
- Trong tập 10 seed hồi phục, chênh lệch paired giữa 0%, 5%, 15%, 20% so với 10% không có tín hiệu rõ; CI 95% gộp các cấp đều chứa 0.
- Không thấy bằng chứng hồi máu vô hạn hay lợi thế rounding từ đổi build. Chuyển nghề/hệ sử dụng builder/HP-ratio chuẩn hóa hiện hành. Kết quả mô phỏng không thay thế unit test cho exploit.
- Một heuristic đổi nguyên tố theo preview cho clear trung bình cao hơn trong mẫu nhỏ, nhưng CI rộng và số lần rotation tăng mạnh. Chưa có căn cứ gọi đây là chiến thuật thống trị.

## 2. Baseline và khả năng đối chiếu

### Baseline lịch sử trong thiết kế

[docs/design/09-che-do-choi.md](../design/09-che-do-choi.md) lưu bảng lịch sử với 50 lượt/cấp: mean clear 11.1 / 11.3 / 10.7 / 12.4 ở cấp 5 / 10 / 20 / 30; reach wave 10 là 62% / 66% / 62% / 86%; reach wave 15 là 12% / 12% / 2% / 18%. Tài liệu không ghi hash/source snapshot của simulator đã sinh bảng đó, nên đây là **mốc tham khảo lưu trữ, không phải paired baseline tái lập được**.

### Control tái lập hiện tại

Control 3-fighter dùng `simulateSurvival` hiện tại: AI người chơi normal, AI đối thủ theo difficulty của wave, đội khởi đầu, không trang bị, hồi sinh theo policy hiện có. Harness kiểm tra từng seed rằng kết quả `cleared` và toàn bộ danh sách `turns` khớp chính xác với `simulateSurvival`.

| Cấp | n | Mean | Median | p90 | Reach 5 | Reach 10 | Reach 15 | Reach 20 | Lượt chiến đấu / wave |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 5 | 10 | 12.8 | 14 | 15 | 100% | 80% | 10% | 0% | 15.8 |
| 10 | 10 | 11.2 | 11 | 18 | 90% | 60% | 20% | 0% | 16.2 |
| 20 | 10 | 15.1 | 16 | 20 | 100% | 80% | 60% | 10% | 16.9 |
| 30 | 10 | 14.3 | 15 | 18 | 100% | 90% | 60% | 0% | 15.3 |

Control mới khác đáng kể với một số mốc lịch sử (đặc biệt cấp 20 reach wave 15). Vì lịch sử chỉ có 50 runs và không có code hash, không quy kết khác biệt này cho V1.1; các so sánh nhân quả dưới đây dùng paired seeds trong cùng harness.

## 3. Methodology

- Cấp nhân vật: 5, 10, 20, 30. `simProfile(level)` dựng progression như simulator hiện hành; active luôn là Đinh Bộ Lĩnh, Hà Vân, Mai Thanh; reserve là Lê Thạch và Phùng Phong. Không trang bị, giữ nguyên qua mọi treatment.
- Seed: seed thứ `i` là `(1 + i * 104729) >>> 0`; cùng seed được dùng trong mọi treatment ở cùng cấp. Wave seed, board, AI RNG, difficulty, combat rules, spirit, food, auto/paid revive và progression không bị chỉnh.
- Giới hạn run: tối đa 30 wave, đủ quan sát các mốc 5/10/15/20. Không run nào trong tập kết quả chính chạm trần 30.
- Foe AI và player AI: cùng logic `playAiTurn`; phe người chơi luôn normal, phe địch theo difficulty wave. Build/rotation policies chỉ quyết định ở BREAK.
- Chính sách rotation/build chỉ dùng HP, fighter config sở hữu, profession/element đã biết và foe preview của wave kế tiếp (dữ liệu được hiển thị cho người chơi). Không đọc seed, RNG state, hidden draw hay hành động tương lai của AI.
- Điều trị hồi reserve 0/5/10/15/20% dùng policy `recovery-rotation`, vì tỷ lệ hồi dự bị chỉ ảnh hưởng kết quả khi fighter thực sự luân chuyển vào reserve. Đây là so sánh tỷ lệ **có rotation**, không phải so sánh “có reserve nhưng không bao giờ đổi”.
- Mọi transition dùng `planBreak`, `proposeSurvivalLineup`, `proposeSurvivalLeaderBuild`, `applySurvivalLeaderBuild` và `beginWave`; ngoại lệ duy nhất là sau `planBreak`, harness điều chỉnh phần hồi HP reserve để mô phỏng tỷ lệ treatment được chọn. Active vẫn hồi 20%, lương và revive không đổi.
- HP roster/active/reserve là tỷ lệ `HP / maxHP`, lấy mẫu ở cuối mỗi trận trước settlement break; các số này không phải HP tuyệt đối hay HP cuối run.
- Clear bị đánh dấu đã vượt qua khi thắng wave. Reach wave 5/10/15/20 là đã thắng wave tương ứng, các wave này đồng thời là mốc Boss.
- Median/p90 là order statistics theo chỉ số `floor(p * n)` trong mảng đã sắp xếp; ở n nhỏ, p90 có thể bằng giá trị lớn nhất mẫu.
- CI paired cho hồi phục là mean difference trên 40 cặp (10 seed × 4 cấp), xấp xỉ t/normal 95%; CI theo cấp dùng t critical với n=10. Với rotation/build, n=12 cặp tổng (3 seed × 4 cấp), dùng t critical và chỉ mang tính mô tả.

## 4. Cấu hình, sample size và lệnh tái lập

| Nhóm | Treatments | Seed/cấp/treatment | Tổng runs |
|---|---|---:|---:|
| Control 3 fighter | Không reserve | 10 | 40 |
| Reserve recovery | 0%, 5%, 10%, 15%, 20% | 10 | 200 |
| Rotation | Forced-only, dưới 30%, downed-first, highest HP, recovery rotation, element counter, profession-fit, boss prep | 3 | 96 |
| Leader | Fixed, low-HP defense, Y Sư, phòng thủ, tấn công, element counter, adaptive | 3 | 84 |
| **Tổng kết quả chính** |  |  | **432** |

Các commands đã chạy:

```sh
pnpm exec tsx scripts/survival-v11-balance.ts \
  --seeds 10 --levels 5,10,20,30 --maxWaves 30 \
  --category reserve --output /tmp/survival-v11-reserve.json

pnpm exec tsx scripts/survival-v11-balance.ts \
  --seeds 3 --levels 5,10,20,30 --maxWaves 30 \
  --category legacy,rotation,leader --output /tmp/survival-v11-strategies.json

pnpm exec tsx scripts/survival-v11-balance.ts \
  --seeds 10 --levels 5,10,20,30 --maxWaves 30 \
  --category legacy --output /tmp/survival-v11-legacy.json

pnpm exec tsx scripts/survival-v11-balance.ts \
  --seeds 3 --levels 5,10,20,30 --maxWaves 30 \
  --category leader --variant element-counter \
  --output /tmp/survival-v11-leader-elements.json

pnpm exec tsx scripts/survival-v11-balance.ts \
  --seeds 3 --levels 5,10,20,30 --maxWaves 30 \
  --category leader --variant adaptive \
  --output /tmp/survival-v11-leader-adaptive.json
```

Validation:

| Command | Result |
|---|---|
| `node --import tsx --test tests/core/survival/survival.test.ts` | PASS — 27 tests. |
| `pnpm exec eslint src/core/sim/survival-v11.ts scripts/survival-v11-balance.ts` | PASS. |
| `pnpm exec tsc --noEmit --pretty false` | PASS. |
| `git diff --check` | PASS. |

Có 100 harness/validation runs không đưa vào kết quả chính: 42 runs ở cấp 5 với max 4 wave; 21 runs ở cấp 5 với max 60; 21 runs ở cấp 5 với max 30; 16 filtered runs ở cấp 5 với max 6. Sau khi sửa normalization theo luật downed/slot, policy matrix đầy đủ ở cấp 5 đã pass. Hai leader variants phụ thuộc element tie-break (`element-counter`, `adaptive`) được rerun thêm 12 seed/cấp-matrix samples tổng cộng; các sample mới thay thế cùng seed record, không tăng N cuối cùng. Có một exploratory pilot lớn hơn bị dừng sau khi phát hiện policy tạo lineup sai; pilot không ghi artifact nên không đưa vào sample/result.

Số đếm run hoàn tất có artifact hoặc được xác minh: 432 sample cuối + 100 validation + 24 sample thay thế = **556 successful executions**. Một pilot lỗi đã dừng mà không checkpoint per-run; số lượt hoàn tất một phần của pilot không thể khôi phục và không được tính vào bất kỳ metric nào.

## 5. Reserve recovery results

Mỗi ô là 10 seed/cấp. Rate policies có cùng `recovery-rotation`; khác biệt giữa các cột là tỷ lệ hồi reserve.

| Cấp | Hồi reserve | Mean clear | Median | p90 | Reach 5 / 10 / 15 / 20 |
|---:|---:|---:|---:|---:|---|
| 5 | 0% | 14.9 | 14 | 22 | 100 / 100 / 40 / 10% |
| 5 | 5% | 14.0 | 14 | 18 | 100 / 100 / 30 / 0% |
| 5 | 10% | 14.4 | 14 | 19 | 100 / 100 / 30 / 0% |
| 5 | 15% | 14.9 | 14 | 21 | 100 / 100 / 40 / 10% |
| 5 | 20% | 14.4 | 14 | 21 | 100 / 100 / 30 / 10% |
| 10 | 0% | 10.8 | 12 | 14 | 90 / 70 / 0 / 0% |
| 10 | 5% | 10.9 | 13 | 14 | 90 / 60 / 0 / 0% |
| 10 | 10% | 11.0 | 11 | 16 | 90 / 70 / 10 / 0% |
| 10 | 15% | 10.9 | 11 | 16 | 90 / 60 / 10 / 0% |
| 10 | 20% | 11.3 | 12 | 16 | 90 / 70 / 10 / 0% |
| 20 | 0% | 13.2 | 14 | 17 | 100 / 80 / 30 / 0% |
| 20 | 5% | 13.3 | 14 | 19 | 100 / 80 / 20 / 0% |
| 20 | 10% | 13.0 | 14 | 16 | 100 / 80 / 20 / 0% |
| 20 | 15% | 13.2 | 14 | 16 | 100 / 80 / 30 / 0% |
| 20 | 20% | 13.4 | 14 | 16 | 100 / 80 / 40 / 0% |
| 30 | 0% | 14.6 | 15 | 21 | 100 / 90 / 60 / 10% |
| 30 | 5% | 14.3 | 15 | 21 | 100 / 90 / 50 / 10% |
| 30 | 10% | 15.7 | 17 | 21 | 100 / 90 / 60 / 20% |
| 30 | 15% | 15.2 | 15 | 21 | 100 / 90 / 60 / 20% |
| 30 | 20% | 15.2 | 15 | 21 | 100 / 90 / 60 / 20% |

### Paired differences in mean clear versus 10%

Gộp 4 cấp, 40 paired samples cho mỗi treatment:

| Reserve rate | Mean Δ clear | CI 95% |
|---:|---:|---:|
| 0% | -0.15 | [-0.86, 0.56] |
| 5% | -0.40 | [-0.98, 0.18] |
| 15% | +0.03 | [-0.36, 0.41] |
| 20% | +0.05 | [-0.28, 0.38] |

Tất cả khoảng tin cậy đều chứa 0. Ở từng cấp, khoảng tin cậy cũng rộng và đều chứa 0; n=10/cấp không phân biệt được các mức sát nhau. So với 10%, reach wave 20 thay đổi tối đa 10 điểm phần trăm trong tập này, nhưng số lượt ở mỗi mẫu chỉ 10.

### Trạng thái roster/economy tại 10%

| Cấp | Lượt / wave | HP roster / active / reserve | Lương cuối | Downed cuối | Auto / paid revive mỗi run | Rotation mỗi run |
|---:|---:|---|---:|---:|---:|---:|
| 5 | 17.7 | 80 / 79 / 83% | 76.8 | 3.50 | 0.70 / 1.70 | 3.70 |
| 10 | 18.3 | 80 / 76 / 85% | 67.3 | 3.50 | 0.50 / 1.50 | 3.10 |
| 20 | 19.9 | 82 / 79 / 86% | 79.4 | 3.50 | 0.50 / 1.60 | 4.00 |
| 30 | 20.1 | 82 / 79 / 85% | 75.9 | 3.60 | 0.50 / 1.80 | 4.70 |

Các số HP là tỷ lệ trung bình qua điểm lấy mẫu cuối mỗi battle; không suy ra HP tuyệt đối. Paid revive vẫn được AI sử dụng, trung bình 1.5–1.8 lần/run ở treatment 10%, nên chưa có dấu hiệu cơ chế này trở nên dư thừa.

## 6. Rotation policy comparison

Ở 10% reserve recovery, control là `forced-only`; mỗi policy có 3 seed/cấp, tổng n=12.

| Policy | Mean clear | Reach 15 / 20 | Turns / wave | Rotation / run | Δ clear paired vs forced-only (CI 95%) |
|---|---:|---:|---:|---:|---:|
| Forced-only | 14.83 | 58.3 / 8.3% | 16.1 | 1.83 | — |
| Under 30% HP | 14.25 | 50.0 / 8.3% | 15.5 | 1.58 | -0.58 [-1.87, 0.70] |
| Downed-first | 14.83 | 58.3 / 8.3% | 16.1 | 1.83 | 0.00 [0.00, 0.00] |
| Highest HP | 13.08 | 33.3 / 0% | 17.7 | 5.75 | -1.75 [-3.95, 0.45] |
| Recovery rotation | 13.83 | 25.0 / 0% | 18.2 | 3.58 | -1.00 [-3.15, 1.15] |
| Element counter | 16.25 | 58.3 / 16.7% | 16.7 | 15.58 | +1.42 [-1.33, 4.16] |
| Profession-fit | 13.17 | 25.0 / 0% | 17.5 | 6.00 | -1.67 [-3.81, 0.47] |
| Boss prep | 15.00 | 50.0 / 8.3% | 19.4 | 3.83 | +0.17 [-2.74, 3.07] |

`Downed-first` trùng `forced-only` theo luật: nếu reserve sống còn thì rotation khỏi active gục đã là điều kiện bắt buộc; nếu không có reserve sống thì fighter gục phải giữ nguyên slot. Element-counter có kết quả mô tả cao nhất trong mẫu nhỏ, nhưng CI rộng chứa 0 và trung bình 15.58 rotations/run; cần đánh giá thêm chi phí thao tác/UX và mẫu lớn hơn trước khi chọn policy.

## 7. Leader profession/element comparison

Mỗi policy có n=12 (3 seed × 4 cấp); baseline là build `tuongSi/moc`, không rotation chủ động.

| Policy | Cấu hình | Mean clear | Reach 15 / 20 | Turns / wave | Δ clear paired vs fixed (CI 95%) |
|---|---|---:|---:|---:|---:|
| Fixed | `tuongSi/moc` | 14.83 | 58.3 / 8.3% | 16.1 | — |
| Low-HP defense | chuyển `binhLinh` khi HP <45% | 14.42 | 58.3 / 8.3% | 17.1 | -0.42 [-1.05, 0.22] |
| Healer | `ySu`, giữ element | 13.75 | 25.0 / 0% | 24.5 | -1.08 [-4.33, 2.16] |
| Defense | `binhLinh`, giữ element | 13.00 | 8.3 / 0% | 22.5 | -1.83 [-4.39, 0.72] |
| Attack | `tuongSi`, giữ element | 14.83 | 58.3 / 8.3% | 16.1 | 0.00 [0.00, 0.00] |
| Element counter | nghề cố định; chọn element theo foe preview | 13.08 | 41.7 / 0% | 16.0 | -1.75 [-5.59, 2.09] |
| Adaptive | `ySu` khi HP thấp, `binhLinh` trước Boss, còn lại `tuongSi`; element counter | 14.25 | 41.7 / 0% | 16.3 | -0.58 [-2.78, 1.61] |

Các CI đều chứa 0; không kết luận profession/element nào tốt hơn. Bài chạy này cover ba archetype nghề (Y Sư, Binh Lính, Tướng Sĩ) và policy element counter/adaptive, **không phải factorial test đủ 6 nghề × 7 hệ**. Y Sư/phòng thủ có số lượt chiến đấu dài hơn trong mẫu nhỏ, cần kiểm thử bổ sung trước khi kết luận lợi ích hồi phục hay tăng độ bền.

## 8. Exploit findings và balance risks

### Exploit checks

- Reserve HP được clamp ở max HP và chỉ hồi nếu còn sống; reserve gục vẫn ở 0 cho tới hồi sinh theo luật run. Không phát hiện hồi HP vô hạn trong treatment 0–20%.
- Đổi nghề/hệ gọi `applySurvivalLeaderBuild`/builder chuẩn, giữ tỷ lệ HP chuẩn hóa, energy, rage và progression; không áp dụng phép rescale cho preview trung gian. Test hiện có xác nhận round-trip và không cộng HP do làm tròn trong [survival.test.ts](../../tests/core/survival/survival.test.ts).
- Hồi sinh có giới hạn auto/paid và lương giữ nguyên qua `planBreak`; kết quả treatment 10% vẫn ghi nhận paid revive. Không phát hiện hồi sinh lặp do mô phỏng.
- Kết quả simulation không phải chứng minh hình thức. Cần property test/seed stress lớn hơn để khẳng định không có exploit ở mọi trạng thái.

### Risks

1. **Mẫu hồi phục nhỏ:** n=10/config/cấp, không đạt mục tiêu 200. Các paired CI không cho thấy khác biệt nhưng cũng không chứng minh tương đương.
2. **Rotation miễn phí và tần suất đổi:** Element-counter tạo 15.58 lần đổi/run trong mẫu; chưa đo thời gian người chơi/UI hoặc mức độ nhàm chán. Dữ liệu không chứng minh nó là exploit, nhưng là dấu hiệu cần thử nghiệm UX/balance.
3. **Leader healer/defense:** sample nhỏ có xu hướng trận lâu hơn mà chưa tăng clear; không nerf/đổi luật dựa trên mẫu này, nhưng nên mở rộng thử nghiệm.
4. **AI không phải người chơi:** `playAiTurn` không mô hình hóa lựa chọn chiến thuật/khả năng thao tác của người thật; các policy là heuristic, không được dùng hidden information.
5. **Baseline lịch sử thiếu provenance:** không so sánh trực tiếp bảng cũ như thể dùng cùng code/seed.

## 9. Kết luận và khuyến nghị

### Reserve recovery

**Khuyến nghị tạm thời: giữ 10%, không chỉnh production từ dữ liệu hiện tại.** Các tỷ lệ 0–20% có chênh lệch mean nhỏ, không đơn điệu theo % và CI paired đều chứa 0. 10% vẫn là lựa chọn thận trọng ở giữa khoảng đã thử; không có dữ liệu đủ mạnh để khẳng định tối ưu.

### Quyết định

**NO-GO cho phê duyệt balance cuối cùng / mở rộng thêm.** Đây là NO-GO do thiếu power thống kê (10 seed cho recovery, 3 seed cho policy), không phải do phát hiện blocker hay exploit đã tái hiện. Trước quyết định cuối, chạy ít nhất 200 paired seeds/cấp/treatment; ưu tiên tăng mẫu reserve 0/5/10/15/20 và kiểm tra lại element-counter/boss-prep. Không thay đổi luật production cho tới khi có kết quả đó.

## 10. Coverage gaps

- Không đạt 200 paired seeds/cấp/treatment do chi phí chạy: pilot full-matrix được dừng trước khi có artifact; matrix hợp lệ dùng n=10 cho reserve và n=3 cho rotation/build.
- Chưa chạy factorial 6 profession × 7 element, nhiều seed riêng cho Boss, trang bị, hoặc các cấu hình roster khác.
- Chưa có policy mô phỏng người thật hay telemetry thời gian thao tác UI.
- Không chạy browser E2E; task này chỉ đánh giá core simulation. Regression suite/UI coverage được ghi riêng trong [22-qa-report.md](./22-qa-report.md).
