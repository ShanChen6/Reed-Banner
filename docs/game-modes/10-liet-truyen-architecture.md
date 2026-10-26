# 10 — Liệt Truyện: Architecture, Persistence and Contracts (PROPOSED)

## Ranh giới hệ thống

Module thuần: `src/core/liet-truyen/`. **Không** import runtime từ `src/core/board` hoặc `battle`, không thay `src/core/campaign/`, `src/core/progress/roster`, auth hoặc Tower schema. Chỉ dùng ID/metadata/portrait lookup thông qua adapter; gameplay LT do recipe graph quyết định.

```text
src/core/liet-truyen/
  types.ts          — ElementNode / Recipe / Pack / DiscoveryState
  catalog.ts        — validated node/recipe registry, packs
  graph.ts          — canonicalPair / reachableFromStarters / cycles / depths
  combine.ts        — combine(state, aId, bId) pure deterministic
  hints.ts          — availableHints(level) (chỉ sau LT-00)
  persistence.ts    — parse / migrate / serialize state
src/app/game/liet-truyen/
  LietTruyenScreen.tsx, DiscoveryBook.tsx, CombineAltar.tsx, HeroLedger.tsx
```

Không tạo file ở task docs này. Tên folder đề xuất, có thể thay ở ADR LT-00.

## Đề xuất TypeScript type contract

```ts
type NodeId = string;
type NodeKind = 'element' | 'material' | 'knowledge' | 'virtue' | 'character';
type Node = {
  id: NodeId; kind: NodeKind; nameVi: string;
  characterId?: string; iconId?: string; lore?: string; contentPack: string;
};
type Recipe = {
  id: string; ingredients: readonly [NodeId, NodeId];
  resultId: NodeId; contentVersion: number; hintGroup?: string;
};
type DiscoveryState = {
  schemaVersion: number; publishedPackVersions: Record<string, number>;
  discoveredNodeIds: readonly NodeId[];
  discoveredRecipeIds: readonly string[];
  hintHistory?: readonly string[];
};
type CombineOutcome =
  | { status: 'created'; nodeId: NodeId; recipeId: string; next: DiscoveryState }
  | { status: 'alreadyKnown'; nodeId: NodeId; next: DiscoveryState }
  | { status: 'noRecipe'; next: DiscoveryState }
  | { status: 'invalid'; reason: 'lockedInput' | 'unknownInput'; next: DiscoveryState };
```

**Contract draft**, không production API.

## Quy tắc engine

- `canonicalPair(A,B)`: order-insensitive, dùng ID ổn định.
- `combine` chỉ nhận cặp input đã khám phá và có trong published catalog.
- Registry resolve cặp → một `resultId`; không RNG, không `Date.now`, không tiêu nguyên liệu, không gọi server trong engine.
- Combine repeat trả `alreadyKnown` và state không tăng tiến độ; combine missing trả `noRecipe` không thay state; locked/fake ID trả invalid.
- Nếu result là character, emit `characterDiscovered` event cho UI reveal; **không** gọi sở hữu tướng/shop/reward.
- `DiscoveryState` lưu IDs/version, không lưu portrait URLs hoặc các chuỗi tên dịch ra nhiều ngôn ngữ.
- Reset chỉ do người chơi kích hoạt với confirm hoặc môi trường developer/test, không tự xóa khi catalog cập nhật.

## Content registry

- Build-time validator: unique IDs, canonical recipe mapping, cycle-free, reachability từ 7 starters, no premature hero mixing, 1 final recipe/hero.
- Nếu server ra pack mới: giữ node/recipe IDs đã phát hành, thêm content pack/version; nếu cần xóa/sửa recipe, migration kế hoạch có tests cho saved states.
- Test data slice 3 hero với mock IDs/portraits; production mapping từ roster/portrait registry, không gắn `public/art` đường dẫn đoán.
- Hidden recipes: UI không nên tải metadata nhạy cảm trực tiếp vào accessibility tree trước khi khám phá; nếu người chơi có thể xem bundle, xem đây là vấn đề spoiler, **không** phải an ninh dữ liệu.

## Offline/online & thưởng

- **Prototype:** engine in-memory + local persistence, không awards/leaderboard, dùng như puzzle luyện tập.
- **Production discovery progress:** thiết kế state theo account/guest, hợp nhất khi đăng nhập cần chính sách cụ thể (union discovered? receipts?), serialize strict/migration.
- Khi có thưởng mở nhân vật: **server authoritative** xác nhận combination/discovery theo catalog published + player state; idempotent receipt theo `userId:recipeId:packVersion`. Không tin resultId/award count do browser gửi.
- Rate limit, CSRF/auth checks, duplicate request, replay, transaction settlement là yêu cầu trước bật economy.
- Một discovery chỉ là **sưu tầm trong mode**, không phải unlock Companion. Nếu sau này có feature “chiêu mộ từ Liệt Truyện” phải ra balance/security/design mới.
- Feature flag default OFF, không render nút active trên Home trước ready. Route `LIET_TRUYEN` đề xuất, chỉ thêm sau khi app router & auth/fallback được QA.

## Tests/telemetry

- Test deterministic pair order, repeat, invalid IDs, schema migration, recipe collision, unreachable nodes, cycles.
- Telemetry ẩn danh đề xuất: discoveries/session, %completed, dead-ends, hint requests, time to first hero; không log tên người chơi/PII.
- CI phải bảo đảm design doc và catalog không mâu thuẫn. Nếu chưa có test harness, mô tả blocker; không tuyên bố pass.
