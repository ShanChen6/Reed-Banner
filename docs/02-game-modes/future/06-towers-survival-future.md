# 06 — Roadmap riêng cho Song Tháp và Survival rename

**Chỉ là future design. Không thay implementation trong PR docs này.**

## A. Tháp Thí Luyện — mở rộng nội dung vượt 20 tầng

### Current
- `TRIAL_FLOORS = 20` trong `src/core/progress/dualTowerState.ts`.
- `src/core/tower/trialFloors.ts` validator chặn floor >20, registry `requireComplete` đòi đúng 20.
- `TrialView.tsx` đã có navigator dựa vào `overview.floors` (có thể mở rộng render nhưng cần kiểm tra layout, keyboard navigation).
- Sweep có tier thưởng theo tầng 1–20; receipts/claim theo tier; luật hiện tại không mặc định mở thêm tier.

### Approved future direction
**Không coi 20 là giới hạn vĩnh viễn.** Mỗi season/content version có thể bổ sung tầng mới mà **không reset progress/rewards** của tầng cũ.

### Migration checklist
1. Tách `currentPublishedFloorCount` từ registry content đã kiểm duyệt; `maxSupportedFloor` an toàn cho parse, không dùng làm count.
2. Không chỉnh floor ID đã phát hành, receipt, first-clear và clear records; version content riêng.
3. Progress parser/serializer phải chấp nhận giá trị >20 hợp lệ sau mở rộng, đồng thời giữ old save.
4. Rule metadata/validation có thể bắt đầu với 20, tự suy ra số tầng registry thay vì hardcode.
5. Sweep: **không** tự tăng stones/day do số tầng tăng; thiết kế cap/tiers mới phải có economy review.
6. Navigator UI: paginate nhóm 10/20 tầng, jump-to-current, không render hàng trăm ô đồng thời.
7. QA: nâng 20→30→50 giả lập; save 20 từ phiên cũ, receipts trùng, feature off và server rejects unsupported.
8. Publish floors only when content and server ready; không hiển thị locked floors giả từ data thiếu.

## B. Tháp Vận Mệnh — mục tiêu 20 tầng có giới hạn

### Current
- `DESTINY_CYCLE_FLOORS = 10` trong `src/core/tower/destinyRules.ts`.
- Chu kỳ `DESTINY_CYCLE_DAYS = 7` (Monday 00:00 Việt Nam).
- Roster snapshot khóa cho cả run; HP/lương và Phúc đi qua các tầng; server chọn luật theo `cycleId`.

### Approved direction / Proposed target
- Định hướng giới hạn số tầng. **20 tầng/chu kỳ là đề xuất mục tiêu**, không phải live.
- Không làm vô hạn, không chạy thêm liên tục sau tầng cuối chỉ vì người chơi thích.
- Không đơn giản sửa constant 10→20: phải audit tier distribution, rule feasibility trên roster snapshot, time/attempt budget 7 ngày, hoá đơn thưởng và run reset.

### Migration checklist
1. `cycleConfigVersion` + `floorCount` snapshot bất biến khi bắt đầu run.
2. Đã bắt đầu run 10 tầng được hoàn tất theo snapshot 10; không nối 10 tầng vào giữa chu kỳ.
3. Rollover chỉ bật 20 trên cycle boundary sau feature readiness.
4. 10→20: mô phỏng xác suất hoàn thành qua các chiến lược, attrition HP/lương, boon power creep.
5. Điều chỉnh nhóm khó 1–20 và pool luật; đảm bảo luôn có đội hợp luật với roster đã khóa.
6. Reward milestones/final settlement phải scale an toàn, bảo toàn stones receipts.
7. UI thể hiện progress `floor/total` lấy từ server, không hardcode 20.
8. Tính fairness BXH nếu leaderboard gộp ván 10 và 20 tầng (phân biệt cycleVersion).
9. Regression cycle reset, run.phase prepare/battle/reward/done, stale snapshots.

## C. Sinh tồn → “Thủ Thành”: đổi tên không đổi cơ chế

- Đây là **đổi nhãn/visual framing**, chưa phải mode phòng thủ HP thành thực thụ.
- Có thể dùng nghệ thuật gác thành, doanh trại Hoa Lư, cổng gỗ, cờ quân để nhấn trận chiến phòng ngự.
- Gameplay giữ nguyên: 3 active, tới 2 reserve, luân phiên ở BREAK, lương, hồi sinh, wave boss, leaderboard theo wave.
- UX phải tránh text “bảo vệ cổng thành cho đến khi HP thành về 0” nếu luật không có HP thành.
- Tên nội bộ `SURVIVAL`, `/game/survival`, `survival` trong API/DB/score/save/analytics **giữ nguyên** trong PR rename UI.
- Nếu đổi nhãn tất cả nơi hiển thị: Home, header SCENE_TITLE, page metadata, mode intro, leaderboard section, help, các message và tests snapshot; đảm bảo không đổi dữ liệu.
- Quyết định cuối giữa “Thủ Thành”, “Trấn Thành” hoặc “Phòng Tuyến” phải được duyệt trước khi patch text. **Tên “Thủ Thành” hiện là lựa chọn đề nghị.**

## D. Không trộn nhiệm vụ

- TOWER-UPGRADE và SURVIVAL-RENAME là 2 streams độc lập ngoài BP; không phụ thuộc BP.
- Viễn Chinh và Liệt Truyện vẫn DEFERRED.
