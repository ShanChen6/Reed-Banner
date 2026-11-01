# 05 — Binh Pháp: deterministic simulation, acceptance và QA

**Không phát triển economy/BXH trên luật chưa được mô phỏng.**

## Verification tiers

### T0 — Unit / pure rules

1. Bàn trống: đặt quân thường ở mọi ô hợp lệ.
2. Bàn có quân: chỉ ô 4-neighbor kề quân có thể đặt (trừ wild).
3. Quân mới khớp nghề với A **và** khớp hệ với B: hợp lệ.
4. Kề A trùng nghề, B không trùng cả hai: không hợp lệ.
5. Hàng, cột đủ: clear chính xác, kể cả line đồng thời; không xóa covered và không double-count intersection.
6. Quân mới tạo covered cho ô đã clear lại chỉ tăng coveredCount một lần.
7. Wild match mọi neighbor nhưng **không miễn kiểm tra neighbor khác** cho normal đặt sau.
8. Eraser xóa occupant trên ô bị chiếm, giữ covered, trên ô trống bị chặn.
9. Invalid action không đổi state, rngState, score, seq hay discardHeat.
10. Win chỉ khi mọi covered=true, check thắng ở cùng transaction trước next spawn.
11. Discard counter và recovery phải match spec BP-00; không chạy dưới 0/quá giới hạn.
12. Deserialize từ state bất hợp lệ fail-closed, không crash/exploit.

### T1 — Generator

- Seed cố định + rulesetVersion cố định + cùng command log => state hash giống nhau.
- Sinh chỉ các cặp nghề/hệ có portrait; không expose nhân vật expansion chưa có asset nếu catalog không có.
- Đo phân phối quân thường/wild/eraser và streak, không bias ngoài spec.
- Không dùng `Math.random()` bên trong transition, không phụ thuộc Date.now/browser locale.
- Nếu generator thỉnh thoảng cho quân không đặt được: đó là áp lực chiến lược có chủ đích; **không** âm thầm đổi quân nếu spec không cho phép.

### T2 — Monte Carlo / agent fairness

Script đề xuất `scripts/binh-phap-sim.ts`: batch seed 1k, 10k, 100k với nhiều strategy agent:
- random among legal placements;
- greedy: ưu tiên covered mới/hoàn tất line;
- constraint-aware lookahead depth 1–2;
- policy ít bỏ quân nhất.

Ghi CSV + report:
- tỷ lệ thắng, lượt tới thắng/thua (median/P90/P95), số line clear, %covered;
- số lần bị kẹt, số discard, tỷ lệ sinh special, phân bố nghề/hệ;
- difference giữa chiến thuật random và greedy/constraint;
- độ dài phiên trên 8×8, cảm giác thiếu nước, khoảng trống vô ích.

**Success gates đề xuất cho baseline, cần sign-off**:
- không crash/infinite loop, tuyệt đối 0 illegal placement accepted;
- cùng seed/log đạt 100% replay equality;
- người chơi strategy tốt thắng nhiều hơn policy random một cách có ý nghĩa;
- tỷ lệ thắng của agent tốt ở khó “bình thường” phải đo trước, không bịa % mục tiêu;
- session time và discard exhaustion phải có phân phối dùng được trên điện thoại.

### T3 — UI/E2E

- Keyboard directional movement, Enter/Space, Tab, Escape, focusVisible;
- Android/iOS 320px/360px/390px/430px; tablet 768px; desktop 1024/1440px;
- contrasts giấy dó/đồng, state highlight không chỉ màu;
- quick clicks/taps không áp 2 lệnh khi transition/animation;
- reload/resume/offline save, browser back, opening other scene; corrupted save gracefully reset;
- guest, signed-in, mode flag off, load failure, no network;
- reduction motion, screen reader labels (tọa độ hàng/cột, quân, nghề/hệ, trạng thái).

### T4 — Reward/ranked separate hard gate

- Không tin `score` từ client; replay commands trên server cho server-issued seed và version.
- Receipt idempotent một lần/ván; chống replay cùng nonce, server-side rate limits.
- Tính thưởng/stone cùng hồ sơ kinh tế để không farm vô hạn.
- Logs/audit cho mọi settle, test race và duplicate requests.
- Không kích hoạt rewards khi chưa review balance + abuse.

## Lệnh kiểm tra áp dụng ở giai đoạn coding

Theo package.json và toolchain thực tế tại thời điểm triển khai: chạy lint, typecheck, unit, simulation, build nếu đủ env. Không claim pass chỉ vì PR docs.

## QA sign-off table

| Tiêu chí | Vai trò | Trạng thái hiện tại |
|---|---|---|
| Rules v1 approved | Product | Pending BP-00 (đang chạy giá trị đề xuất, xem GDD mục 11) |
| Valid placements & clear | Engine | Implemented, 24 test (`tests/core/binh-phap`) |
| Seed deterministic | Engine QA | Implemented, replay equality kiểm trong mô phỏng |
| Balance simulation | Design | Baseline đầu tiên bên dưới; chưa có agent lookahead |
| Art readability | UI/Art | Chưa duyệt (đã chụp 1440px/390px, không tràn ngang) |
| Save/Resume | Frontend | Implemented (`localStorage`, nạp fail-closed) |
| Server reward secure | Backend | Deferred P1 |

## Kết quả mô phỏng baseline (01/11/2026)

Lệnh: `pnpm exec tsx scripts/binh-phap-sim.ts --runs 2000 --seed 1`. Bàn chữ nhật 3×3, 5×7, 7×9, 9×9 có chướng ngại ngẫu nhiên theo seed ([GDD mục 11](02-binh-phap-gdd.md#11-bản-triển-khai-đầu-tiên-chơi-thử-offline)). Mỗi ván chạy lại bằng `replay` và so sánh state; 0 nước hợp lệ bị từ chối, 0 lệch replay. Agent *random* chọn ngẫu nhiên trong các ô đặt được (bỏ lệnh khi hết nước); *greedy* ưu tiên nước cho nhiều ô khai thông và điểm nhất, chỉ dùng Thu Hồi khi thanh đã nóng. Người chơi thật nằm quanh hoặc trên greedy, nên số này là **điểm xuất phát**, không phải mục tiêu.

| Bậc | Agent | Thắng | Lượt (trung vị / p90) | Bỏ lệnh TB | Khai thông TB |
|---|---|---|---|---|---|
| Nhập môn 3×3 | random | 97,0% | 19 / 32 | 2,5 | 98,8% |
| Nhập môn 3×3 | greedy | 97,9% | 10 / 13 | 1,3 | 99,1% |
| Thường 5×7 | random | 88,3% | 77 / 129 | 5,1 | 81,6% |
| Thường 5×7 | greedy | 74,6% | 46 / 67 | 7,9 | 73,3% |
| Khó 7×9 | random | 62,2% | 154 / 268 | 12,3 | 72,9% |
| Khó 7×9 | greedy | 67,0% | 79 / 104 | 8,8 | 62,0% |
| Đại trận 9×9 | random | 17,0% | 141 / 265 | 18,6 | 61,8% |
| Đại trận 9×9 | greedy | 55,0% | 97 / 126 | 10,0 | 50,9% |

Nhận xét: bốn bậc tăng độ khó đúng chiều ở cả hai agent. Chướng ngại làm hàng/cột ngắn lại nên dọn dễ hơn, vì vậy bàn có chướng ngại dễ thắng hơn bàn đặc cùng cỡ; tỉ lệ chướng ngại và số nghề/hệ phải chỉnh cùng nhau. Ở Thường và Khó, greedy không hơn random (greedy bỏ Thu Hồi và ưu tiên khai thông chứ không giữ chỗ dọn hàng), nên cần agent mạnh hơn (lookahead) trước khi chốt độ khó. Số lượt p90 ở Đại trận (khoảng 125 đến 265 nước) khá dài cho điện thoại.
