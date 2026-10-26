# 03 — Binh Pháp: Technical architecture & data contracts (PROPOSED)

## Nguyên tắc

Đặt module độc lập tại `src/core/binh-phap/` hoặc `src/core/strategy-puzzle/` (chốt tên một lần BP-00). Không import `src/core/board/match.ts`, `battle/battle.ts` làm gameplay. Chỉ import type nghề/hệ và portrait catalog đã có. Logic thuần JS/TS, reproducible seeds, dễ chạy Node test/simulation.

## API types draft

```ts
type Cell = { covered: boolean; piece: Piece | null };
type NormalPiece = { kind: "normal"; uid: string; characterId: string; profession: Profession; element: Element };
type Piece = NormalPiece | { kind: "wild"; uid: string } | { kind: "eraser"; uid: string };
type TurnCommand = { kind: "place"; row: number; col: number } | { kind: "discard" };
type Phase = "ready" | "playing" | "won" | "lost";
interface PuzzleState {
  schemaVersion: number; rulesVersion: number; seed: string;
  width: number; height: number; cells: readonly Cell[]; hand: Piece;
  discardHeat: number; score: number; placed: number; coveredCount: number;
  phase: Phase; turn: number; rngState: string;
}
type Transition = { ok: true; state: PuzzleState; events: readonly PuzzleEvent[] }
  | { ok: false; reason: "occupied" | "empty" | "notAdjacent" | "mismatch" | "finished" | "invalidCommand" };
```

Đây là **contract draft**, không phải schema production. Khi thiết kế eraser, `place` có thể trên occupied; normal/wild chỉ vào empty. Events như `placed/lineCleared/discarded/covered/won/lost` cấp dữ liệu để animation, không để UI tự viết luật.

## Modules đề xuất

- `types.ts`: Phase, Piece, BoardCell, PuzzleState, Ruleset.
- `rules.ts`: pure `legalPlacements(state,piece)`, `canPlace(state,piece,cell)`, `adjacent4`, `resolveCompletedLines`.
- `reducer.ts`: `transition(state,command)` immutable; state không đổi khi invalid; event order ổn định.
- `generator.ts`: RNG seeded, `nextPiece`, pool nghề–hệ–portrait có kiểm soát, weights versioned.
- `scoring.ts`: điểm đặt, điểm line, thắng, streak theo ruleset.
- `catalog.ts`: ánh xạ các quân có chân dung hợp lệ. Snapshot key `characterId` ổn định, không chọn theo tên hiển thị hoặc đường dẫn file.
- `serialize.ts`: parse/clamp/validate/load saved schema; migrations khi rulesVersion thay.
- `src/app/game/binh-phap/`: UI board, HUD, controls, tutorial, pause/resume; không sửa `DemoGame.tsx`.

## State transition chính xác

1. Validate command, bounds, phase và target.
2. Với normal: tính tất cả neighbors4; nếu board occupied bất kỳ cần ít nhất một neighbor; kiểm từng neighbor (wild luôn match).
3. Gắn piece, tô `covered`, xác định các line đầy **sau đặt**.
4. Clear union rows/columns trong một transition, giữ covered; phát events.
5. Update discardHeat/score/count, check win/loss.
6. Chỉ khi còn playing mới spawn piece mới bằng RNG seed; RNG **không advance** khi invalid.
7. Return một state mới + sự kiện render; state bất biến.

Trường hợp eraser không làm đổi covered của mục tiêu và không tự tăng thành tích covered. Khi có wild/eraser sinh liên tiếp, anti-streak được định nghĩa trong generator, không đoán tại UI.

## Tích hợp game app

- Tạo scene mới **chỉ sau BP-00 sign-off** trong `src/app/game/scene.ts` / `GameShell.tsx` / `MenuScene.tsx`.
- Màn Binh Pháp dùng Global Game Header, UI chung, và có trạng thái guest/profile như code hiện tại.
- Feature flag server-authoritative (default off) để không lộ mode dở dang; cách cấu hình cần chốt với hệ flag hiện có.
- Prototype chạy local/guest **không phát thưởng**, có thể dùng localStorage để resume nhưng phải phân biệt saved progress không phải server-verified.
- Nếu phát hành có reward/BXH: hành động do server xác minh, match seed/rules revision, chống replay/idempotent settlement; không tin điểm từ client, giới hạn request và kiểm session. Thiết kế endpoints/migration ở PR riêng.
- Phân biệt `id` của piece trong session với id nhân vật catalog; không leak hidden next-rng server trong chế độ cạnh tranh.
- Không được hardcode 6×7 quân nếu roster catalog thiếu ảnh; fallback icon nhân vật có nhãn nghề/hệ.

## Savegame & replay

- Draft: `{schemaVersion,rulesVersion,seed,ruleSetId,state,rngState,createdAt,updatedAt}`; enforce upper bound log, invalid-state rejection.
- Nếu tính điểm cạnh tranh: lưu action log (place r,c / discard), server re-sim deterministic; kiểm chứng code/ruleset version, seq, trùng nonce, throttle.
- Không trộn Binh Pháp data vào CampaignProgressV2 hoặc TowerProgress; model riêng.
- Undo chỉ offline tutorial, không có nếu claim thưởng.

## Security / accessibility / perf

- Validate `seed`, board dimensions, pool, coordinates từ client trên server khi có reward.
- Seed RNG deterministic không phải biện pháp chống gian lận nếu client chọn seed; server issued seed khi có reward.
- React render ô bằng memo hoặc selectors; 8×8 không cần canvas; test performance mobile.
- Hiển thị màu hệ cùng icon/nhãn, không dựa độc nhất màu; ngôn ngữ tiếng Việt có dấu.
