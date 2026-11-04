# Reed Banner — Game Modes: quyết định sản phẩm và đặc tả mở rộng

> 27/10/2026 · trạng thái: **DOCS / DESIGN ONLY**. Không thay code, DB, Battle Engine, UI hay phần thưởng. PR này là đề xuất để review; chưa phải release.
>
> 31/10/2026: **Binh Pháp (hiển thị là Trận Đồ) đã có bản chơi thử offline** theo [GDD mục 11](02-binh-phap-gdd.md#11-bản-triển-khai-đầu-tiên-chơi-thử-offline); luật vẫn chờ BP-00. Liệt Truyện và các mục còn lại vẫn là design only.

## Đọc theo thứ tự

1. [01 — Danh mục chế độ và các quyết định](01-mode-portfolio.md)
2. [02 — Binh Pháp: Game Design Document](02-binh-phap-gdd.md)
3. [03 — Kiến trúc và contracts](03-binh-phap-architecture.md)
4. [04 — UX, Art Bible và prompt ảnh](04-binh-phap-ui-art.md)
5. [05 — Mô phỏng, QA và cân bằng](05-binh-phap-balance-qa.md)
6. [06 — Định hướng Tháp và Sinh tồn](06-towers-survival-future.md)
7. [07 — Roadmap task triển khai](07-implementation-roadmap.md)
8. [08 — Tầm Tướng Ký (trước gọi Liệt Truyện) — GDD](08-liet-truyen-gdd.md)
9. [09 — Công thức và quy chuẩn nội dung Liệt Truyện](09-liet-truyen-recipes.md)
10. [10 — Kiến trúc engine ghép yếu tố](10-liet-truyen-architecture.md)
11. [11 — UX, Art Bible của Liệt Truyện](11-liet-truyen-ui-art.md)
12. [12 — QA và roadmap Liệt Truyện](12-liet-truyen-qa-roadmap.md)
13. [13 — Quần Hùng online: đấu trực tiếp hai người chơi](13-quan-hung-pvp-truc-tiep.md) (DRAFT, phát triển sau)
14. [14 — Tầm Tướng Ký: Design Freeze LT-00](14-tam-tuong-ky-design-freeze.md) (FROZEN; nguồn chính luật Tầm Tướng Ký, thay luật trong 08–12)
15. [15 — Tầm Tướng Ký: catalog slice LT-01](15-tam-tuong-ky-lt01-catalog.md) (APPROVED, có code)
16. [16 — Tầm Tướng Ký: engine ghép LT-02](16-tam-tuong-ky-lt02-engine.md) (APPROVED, có code)
17. [17 — Tầm Tướng Ký: server chế độ Thường LT-04](17-tam-tuong-ky-lt04-server.md) (DRAFT, có code)
18. [18 — Tầm Tướng Ký: Gói 1 và mô phỏng LT-05](18-tam-tuong-ky-lt05-pack-1.md) (APPROVED, có code)
19. [19 — Tầm Tướng Ký: chế độ Hạng tuần LT-06](19-tam-tuong-ky-lt06-ranked.md) (DRAFT, có code)
20. [20 — Tầm Tướng Ký: nghiệm thu và phát hành LT-07](20-tam-tuong-ky-lt07-acceptance.md) (DRAFT)
21. [21 — Tầm Tướng Ký: Gói 2](21-tam-tuong-ky-pack-2.md) (IMPLEMENTED, đã bật)
22. [22 — Tầm Tướng Ký: Gói 3 (tướng thường)](22-tam-tuong-ky-pack-3.md) (IMPLEMENTED, đã bật)
23. [23 — Tầm Tướng Ký: cân bằng nguyên tố và cảnh báo cặp đã thử](23-tam-tuong-ky-can-bang-va-canh-bao.md) (APPROVED, có code)
24. [prompts/](prompts/) — Prompt Claude/Codex cho Binh Pháp và Liệt Truyện.

## Quy ước quyết định

- **APPROVED PRODUCT DIRECTION:** đã thống nhất trong trao đổi với Shan. Không ngụ ý code đã hoàn tất.
- **PROPOSED MVP:** giá trị thiết kế được đề nghị, cần chốt qua BP-00 trước khi code.
- **CURRENT IMPLEMENTATION:** đọc từ develop SHA 694f53cd08d7b6c0cfef53c93effa34d29736d56, ngày 27/10/2026 (GMT+7).
- **BACKLOG / DEFERRED:** chưa có yêu cầu xây dựng, không hiện như nút chơi được.
- **DO NOT IMPLEMENT:** chỉ viết kế hoạch; khi bắt đầu coding cần task/PR riêng.

## Ràng buộc cứng

- Binh Pháp có engine **đặt quân** độc lập, không phải match-3 hoán đổi, không tích hợp vào Battle Engine.
- Liệt Truyện có engine **kết hợp hai yếu tố** độc lập (cảm hứng Doodle God), khám phá chân dung nhân vật qua công thức nhiều tầng; **không** chiêu mộ tướng hoặc chạm Battle Engine.
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
- docs/02-game-modes/README.md; docs/02-game-modes/dual-tower/00-02-rules.md

## Tham khảo cơ chế game gốc (không phải giấy phép sử dụng asset)

- https://www.mobygames.com/game/30884/alchemy-deluxe/
- https://www.sockscap64.com/games/game/alchemy-deluxe/
- https://popcapgames.fandom.com/wiki/Alchemy
- https://www.doodlegod.com/ (tham khảo ý tưởng kết hợp yếu tố; không dùng code, tên thương mại hay assets của Doodle God)

Chi tiết sao chép **cơ chế tổng quát** phải được phân biệt với sao chép biểu đạt cụ thể. Không dùng tên Alchemy/PopCap trong màn hình game như một nhãn thương mại của Reed Banner.
