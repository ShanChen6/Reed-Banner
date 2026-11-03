# 16 — Tầm Tướng Ký: engine ghép LT-02

> Cập nhật: 03/11/2026
> Trạng thái: **APPROVED** — engine thuần đã có code (`src/core/tam-tuong-ky/engine.ts`, `hints.ts`) theo luật [Design Freeze](14-tam-tuong-ky-design-freeze.md#4-luật-chơi); chưa nối vào server, UI hay dữ liệu lưu.

File này ghi API và phạm vi của engine; luật nằm ở Design Freeze, nội dung công thức ở [catalog LT-01](15-tam-tuong-ky-lt01-catalog.md).

## 1. API

| Hàm | Việc |
|---|---|
| `buildCatalog(pack)` | Dựng chỉ mục node và khóa công thức `first>second` |
| `initialDiscovery(catalog)` | Sổ mới: 7 starter, chưa có công thức |
| `combineNormal(catalog, sổ, ôTrước, ôSau)` | Ghép chế độ Thường. Trả `created` (kèm `nodeAlreadyKnown`, `isCharacter`), `alreadyKnown`, `noRecipe` hoặc `invalid` (`unknownInput` / `lockedInput`) |
| `chargesCombine(kết quả)` | Có trừ một lần ghép của lượt không: chỉ `created`, `noRecipe` (P-9) |
| `initialRanked(kho)` / `combineRanked(catalog, hạng, sổ, ôTrước, ôSau)` | Ghép chế độ Hạng: tiêu nguyên liệu kể cả ghép sai, `A+A` tiêu 2, tướng không vào kho, ghi công thức mới vào sổ; trả `heroAlreadyCreated` để server không cộng điểm hai lần |
| `hintFor(catalog, sổ, mức)` | Gợi ý mức 1 (nhóm) hoặc mức 2 (một nguyên liệu, không nói ô); `null` khi không còn gì ghép được |
| `replayNormal`, `discoveredCharacters`, `makeableRecipes` | Phát lại chuỗi thao tác, liệt kê tướng đã mở, công thức ghép được ngay |

Thao tác không đổi gì (`invalid`, `noRecipe` ở Thường, `alreadyKnown`) trả về **đúng tham chiếu** state cũ.

## 2. Không thuộc engine

Để cho server (LT-04, LT-06): phiếu và lượt 15 lần ghép, 2 gợi ý mỗi ngày, chặn gợi ý ở Hạng, đăng nhập, `requestId`, túi nguyên tố và cấp nền, đề cử tuần, điểm, thành tựu, thưởng, migration `contentVersion`. Engine không import roster, hồ sơ, Battle Engine (chỉ kiểu `Element`, `Profession`), không dùng RNG, thời gian hay mạng.

## 3. Kiểm thử

`tests/core/tam-tuong-ky/engine.test.ts` (29 test) phủ [mục 7.1](14-tam-tuong-ky-design-freeze.md#71-engine) và phần engine của [mục 7.4](14-tam-tuong-ky-design-freeze.md#74-chế-độ-hạng-tuần-server):

- thứ tự ô, `A+A`, `alreadyKnown`, `noRecipe`, `invalid` không đổi state;
- 2 000 thao tác giả ngẫu nhiên không làm sổ có ID trùng; khám phá đủ mọi node và ba tướng từ starter;
- phát lại và JSON round-trip cho cùng kết quả;
- Hạng: tiêu đơn vị, `A+A`, ghép sai mất nguyên liệu, tướng một lần, ghép đủ Đinh Ngọc đúng 9 lần và 10 nguyên tố;
- gợi ý không bao giờ lộ đủ công thức và luôn chỉ tới công thức ghép được ngay.

Cùng 27 test catalog: `pnpm test` 1189/1189 qua, `pnpm typecheck` sạch.
