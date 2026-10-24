# CAMP-00.04 — Campaign V2 Reset Policy

> Phiên bản: 1.0 — 24/10/2026
>
> Áp dụng cùng [Campaign V2 Design Freeze](design-freeze.md)

## 1. Quyết định

Reed Banner chưa có người chơi thực tế, vì vậy **được phép xóa/reset progress Campaign trong môi trường development và test** khi chuyển từ 13 stage cũ sang Campaign V2. Không cần ánh xạ `cleared`/`bestTurns` cũ sang M01–M24.

Quyền này không cho phép tự chạy `DROP`, `TRUNCATE`, xóa row profile hoặc reset dữ liệu production. Không được xóa hay rollback account, thông tin profile chung, gold hiện có, companion đã sở hữu, bag/gear/loadout, Đá Cường Hóa, Tower, Song Tháp, Survival, Quest, Arena hoặc progress của mode khác.

## 2. Reset boundary

Một reset hợp lệ chỉ được phép:

- thay Campaign state bằng state V2 rỗng: `version: 2`, không completion/milestone, food về giá trị khởi tạo Campaign hiện hành;
- bỏ `cleared` và `bestTurns` của 13 old Campaign stages;
- giữ Raid progress bằng cách extract `campaign.raids` cũ sang `RaidState`/adapter trước khi bỏ shape cũ;
- vô hiệu old Campaign leaderboard rows bằng namespace/version mới, không xóa leaderboard của mode khác.

Reset không thu hồi gold/reward cũ, không tháo gear và không xóa companion từng được Campaign mở khóa. Khi người chơi development hoàn tất lại milestone, recruit grant phải dedupe theo roster hiện có; không có compensation. Vì reset có thể cho tài khoản development nhận lại gold, QA economy lặp lại nên dùng account fixture mới thay vì coi reset là phép thử economy sạch.

## 3. Environment guard

Tool/script reset trong task sau MUST có mọi guard sau:

1. default là dry-run;
2. yêu cầu environment được allowlist rõ là local/development/test;
3. fail closed nếu environment là production, không xác định, hoặc database target không khớp allowlist;
4. yêu cầu owner/account IDs cụ thể hoặc fixture cohort cụ thể; không có wildcard toàn bảng;
5. in trước số profile dự kiến đổi và các field Campaign/Raid liên quan;
6. ghi audit result sau chạy: target, số record, before/after Campaign version và lỗi;
7. idempotent: chạy lại trên state V2 rỗng không thay shared data;
8. không dùng `DROP TABLE`, `TRUNCATE`, `DELETE FROM profiles/accounts` hoặc thao tác cascade.

Không có reset command nào được chạy trong CAMP-00.04; task này chỉ khóa policy.

## 4. Production policy

Production luôn **no-reset**. Nếu production tồn tại trước khi V2 phát hành, deployment phải dùng parser/adapter additive hoặc migration có kế hoạch riêng, backup/rollback và review. Việc “chưa có người chơi thật” không được mã hóa thành giả định runtime để bypass guard.

Old Campaign fields có thể được giữ không đọc trong production cho tới khi một data-retirement task riêng chứng minh không còn consumer. Dọn dữ liệu production không nằm trong Campaign V2 implementation mặc định.

## 5. Verification checklist cho reset implementation

- Campaign V2 state khởi tạo đúng; M01 mở và M02–M24 khóa theo graph.
- Raid tier cũ vẫn đọc được và Raid unlock adapter hoạt động theo milestone mới.
- Gold, companions, bag, gear, loadouts và next item ID giống hệt trước reset.
- Stone inventory/reward values giống hệt trước reset.
- Tower, Song Tháp, Survival, Quest và Arena state giống hệt trước reset.
- Không row account/profile bị xóa; không table/schema bị drop.
- Campaign/mission leaderboard mới không nhập score 13 stage cũ; leaderboard mode khác không đổi.
- Dry-run không ghi dữ liệu; production/unknown environment bị từ chối.

## 6. Accepted và prohibited operations

| Accepted | Prohibited |
|---|---|
| Reset Campaign development/test của owner allowlisted | Reset hoặc dọn Campaign production tự động |
| Bỏ completion/best-turn old Campaign trong nested state | `DROP`, `TRUNCATE`, xóa account/profile row |
| Reset Campaign food về default hiện hành | Xóa/giảm gold, gear, stone hoặc companion |
| Extract/preserve Raid progress | Reset Raid, Tower, Song Tháp, Survival hay mode khác |
| Dùng Campaign leaderboard namespace mới | Xóa shared leaderboard không thuộc Campaign |
| Dùng fixture account mới cho QA economy | Coi reset là lý do bỏ idempotency/reward guards |
