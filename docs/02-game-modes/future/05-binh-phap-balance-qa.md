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

Lệnh: `pnpm exec tsx scripts/binh-phap-sim.ts --runs 2000 --seed 1`. Bốn bậc theo [GDD mục 11](02-binh-phap-gdd.md#11-bản-triển-khai-đầu-tiên-chơi-thử-offline): 3×3, 5×5, 6×6, và Đại trận cỡ ngẫu nhiên 7–10. Mỗi ván chạy lại bằng `replay` và so sánh state; 0 nước hợp lệ bị từ chối, 0 lệch replay. Agent *random* chọn ngẫu nhiên trong các ô đặt được (bỏ lệnh khi hết nước); *greedy* ưu tiên nước cho nhiều ô khai thông và điểm nhất, chỉ dùng Thu Hồi khi thanh đã nóng. Người chơi thật nằm quanh hoặc trên greedy, nên số này là **điểm xuất phát**, không phải mục tiêu.

| Bậc | Agent | Thắng | Lượt (trung vị / p90, mọi ván) | Bỏ lệnh TB | Khai thông TB |
|---|---|---|---|---|---|
| Hướng dẫn 3×3 | random | 97,0% | 19 / 32 | 2,5 | 98,8% |
| Hướng dẫn 3×3 | greedy | 97,9% | 10 / 13 | 1,3 | 99,1% |
| Thường 5×5 | random | 86,1% | 56 / 94 | 5,6 | 85,1% |
| Thường 5×5 | greedy | 78,0% | 33 / 44 | 6,5 | 79,7% |
| Khó 6×6 | random | 61,5% | 81 / 146 | 10,9 | 73,6% |
| Khó 6×6 | greedy | 63,9% | 47 / 66 | 8,6 | 64,6% |
| Đại trận 7–10 | random | 6,8% | 82 / 190 | 16,3 | 49,9% |
| Đại trận 7–10 | greedy | 32,5% | 17 / 124 | 11,3 | 35,8% |

**Cách chọn số liệu** (quét 600 ván mỗi cấu hình; bộ sweep chạy bằng script tạm, không nằm trong repo):

- **Núm độ khó chính là số nghề × hệ và thanh Bỏ Lệnh**, không phải cỡ bàn. Với 5×5 và chướng ngại 8%, thanh 2 → 3 vạch đổi tỉ lệ thắng của greedy từ 57% lên 78% (3 nghề × 4 hệ); đổi từ 3×3 lên 4×4 loại quân thì từ 88% xuống 66% (thanh 3). Vì Shan chưa muốn đổi thanh Bỏ Lệnh, các bậc khác nhau chủ yếu ở bộ quân.
- **Chướng ngại rút ngắn hàng/cột nên giúp bot random dọn dễ hơn**, trong khi greedy bị thiệt nhẹ vì đường đi hẹp. Tỉ lệ 10–30% ở Đại trận đổi random từ 12% lên 47% thắng, còn greedy từ 52% xuống 34%. Vì vậy chướng ngại không nên tăng quá nhiều: nó làm kỹ năng ít quan trọng hơn và vẫn rút ngắn ván.
- **Đại trận chọn 8 nghề × 7 hệ, chướng ngại 10–16%** vì cho khoảng cách kỹ năng lớn nhất giữa random (khoảng 2–7%) và greedy (khoảng 33%). Đây là tính chất cần có của bậc xếp hạng. Cấu hình 5 × 5 loại quân dễ hơn nhiều (greedy 67%) nhưng random cũng thắng 49%, tức là kém phân hóa.
- Lỗi cần nhớ khi đo: `transition` tra bộ luật theo `rulesetId` trong `RULESETS`, nên muốn thử một cấu hình khác phải thay thẳng mục trong registry (như script sweep đã làm), không chỉ truyền ruleset vào `createPuzzle`.

Nhận xét: bốn bậc tăng độ khó đúng chiều; Thường và Khó chưa tách bằng chiến thuật (greedy chỉ ngang random). Cần agent mạnh hơn (lookahead) trước khi chốt. Độ dài Đại trận phụ thuộc cỡ bàn và nằm khoảng 100 nước (trung vị, ván thắng) với bot greedy, nhờ trần 72 ô chơi được.
