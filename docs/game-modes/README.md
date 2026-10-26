# Reed Banner — Game Modes: quyết định sản phẩm và đặc tả mở rộng

> 27/10/2026 · trạng thái: **DOCS / DESIGN ONLY**. Không thay code, DB, Battle Engine, UI hay phần thưởng. PR này là đề xuất để review; chưa phải release.

## Đọc theo thứ tự

1. [01 — Danh mục chế độ và các quyết định](01-mode-portfolio.md)
2. [02 — Binh Pháp: Game Design Document](02-binh-phap-gdd.md)
3. [03 — Kiến trúc và contracts](03-binh-phap-architecture.md)
4. [04 — UX, Art Bible và prompt ảnh](04-binh-phap-ui-art.md)
5. [05 — Mô phỏng, QA và cân bằng](05-binh-phap-balance-qa.md)
6. [06 — Định hướng Tháp và Sinh tồn](06-towers-survival-future.md)
7. [07 — Roadmap task triển khai](07-implementation-roadmap.md)
8. [prompts/](prompts/) — Prompt Claude/Codex có điều kiện nghiệm thu riêng.

## Quy ước quyết định

- **APPROVED PRODUCT DIRECTION:** đã thống nhất trong trao đổi với Shan. Không ngụ ý code đã hoàn tất.
- **PROPOSED MVP:** giá trị thiết kế được đề nghị, cần chốt qua BP-00 trước khi code.
- **CURRENT IMPLEMENTATION:** đọc từ develop SHA 694f53cd08d7b6c0cfef53c93effa34d29736d56, ngày 27/10/2026 (GMT+7).
- **BACKLOG / DEFERRED:** chưa có yêu cầu xây dựng, không hiện như nút chơi được.
- **DO NOT IMPLEMENT:** chỉ viết kế hoạch; khi bắt đầu coding cần task/PR riêng.

## Ràng buộc cứng

- Binh Pháp có engine **đặt quân** độc lập, không phải match-3 hoán đổi, không tích hợp vào Battle Engine.
- Nguồn tham khảo cơ chế: PopCap Alchemy / Alchemy Deluxe (2001); viết mới source và asset; không sao chép GUI, hình rune, đồ họa hoặc âm thanh bên thứ ba.
- Không thay Campaign V2, chuẩn lịch sử, 24 nhiệm vụ hoặc kết cục các sứ quân.
- Không đổi Trial/Destiny constants, schema, phần thưởng hoặc feature flags trong PR docs.
- Sound, TTS, voice: TODO — DEFERRED.
- UI mới tuân thủ Global Game Header hiện hành và visual language gỗ tối, đồng cổ, giấy dó, đỏ son, có khả năng dùng offline/guest theo luật mode sau khi được duyệt.

## Nguồn code được audit

- src/app/game/MenuScene.tsx, GameShell.tsx, scene.ts
- src/core/battle/elements.ts, src/core/battle/rules.ts, src/core/roster/roster.ts
- src/core/progress/dualTowerState.ts
- src/core/tower/trialFloors.ts, destinyRules.ts, destinyRun.ts
- src/app/game/trial/TrialView.tsx, destiny/DestinyScreen.tsx, survival/SurvivalScreen.tsx
- docs/design/09-che-do-choi.md; docs/dual-tower/00-02-rules.md

## Tham khảo cơ chế game gốc (không phải giấy phép sử dụng asset)

- https://www.mobygames.com/game/30884/alchemy-deluxe/
- https://www.sockscap64.com/games/game/alchemy-deluxe/
- https://popcapgames.fandom.com/wiki/Alchemy

Chi tiết sao chép **cơ chế tổng quát** phải được phân biệt với sao chép biểu đạt cụ thể. Không dùng tên Alchemy/PopCap trong màn hình game như một nhãn thương mại của Reed Banner.
