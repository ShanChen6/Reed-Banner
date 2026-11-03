# 15 — Tầm Tướng Ký: catalog slice LT-01

> Cập nhật: 03/11/2026
> Trạng thái: **DRAFT** — catalog thử 3 tướng và validator đã có code (`src/core/tam-tuong-ky/`), pack để `draft`; công thức và tên node chờ Shan duyệt.

Luật theo [Design Freeze](14-tam-tuong-ky-design-freeze.md) (FROZEN). File này ghi nội dung slice và kết quả kiểm; dữ liệu thật nằm trong code, file này không định nghĩa luật mới.

## 1. Code

| File | Nội dung |
|---|---|
| `src/core/tam-tuong-ky/types.ts` | Node, công thức có thứ tự, pack, bậc tướng, mã lỗi |
| `src/core/tam-tuong-ky/graph.ts` | `recipeKey` (`A>B`), `computeMetrics` (`minCombines`, `starterCost`), `findCycles` |
| `src/core/tam-tuong-ky/validate.ts` | `validatePack`: lỗi và cảnh báo theo [mục 7.2](14-tam-tuong-ky-design-freeze.md#72-validator-catalog); `TIER_COMBINE_RANGE` |
| `src/core/tam-tuong-ky/catalog.ts` | `SLICE_PACK` (draft), `rosterCharacter` đọc nghề/hệ/bậc từ roster, `CORE_CATALOG_DEPS` |
| `tests/core/tam-tuong-ky/catalog.test.ts` | 28 test: slice hợp lệ, số đo, mỗi lỗi và cảnh báo của validator |

Catalog không chép nghề, hệ hay tên chân dung: validator đọc từ `roster.ts`; test kiểm chân dung bằng `portraitUrl` và file trong `public/`. Module không import tiến trình, Battle Engine, trang bị hay hàm cấp tướng.

## 2. Kết quả kiểm

`validatePack(SLICE_PACK)`: **0 lỗi, 0 cảnh báo**. `pnpm test`: 1161/1161 qua; `pnpm typecheck` sạch.

| Tướng | Bậc | Khung | Số lần ghép tối thiểu | Nguyên tố tiêu | Công thức cuối (ô trước + ô sau) |
|---|---|---|---|---|---|
| Đinh Ngọc | đặc biệt | 7–9 | **8** | 9 | Kiếm ngọc + Đường xa |
| Lê Hoàn | lịch sử | 9–12 | **10** | 11 | Thập đạo + Binh thư |
| Nguyễn Bặc | lịch sử | 9–12 | **11** | 12 | Đại đao buộc vải đỏ + Hỏa kỳ |

- Thứ tự chặt: 10 và 11 (lịch sử) > 8 (đặc biệt).
- 7/7 starter đều được dùng; 27 công thức, 24 node trung gian.
- 12/49 cặp starter có công thức, trong đó 3 cặp `A+A` (Mộc+Mộc, Thủy+Thủy, Thổ+Thổ) và 2 cặp gương ra hai kết quả khác nhau (Mộc+Thủy / Thủy+Mộc, Phong+Lôi / Lôi+Phong).
- Node dùng chung: Vải gai (3 nhánh), Tre (3), Sắt rèn (2).
- Ba node phụ không dẫn tới tướng (Dược thảo, Giông tố, Lũy đất), để minh họa thứ tự ô và `A+A`. Ở chế độ Hạng chúng là ngõ cụt tốn nguyên liệu; LT-05 quyết định giữ hay nối vào tướng khác.

## 3. Công thức

Đọc “ô trước + ô sau → kết quả”. Lý do biểu trưng ghi trong code (`reason`).

### Bậc 1 (hai starter)

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Mộc | Thủy | Lau sậy |
| Thủy | Mộc | Dược thảo |
| Kim | Hỏa | Sắt rèn |
| Mộc | Mộc | Tre |
| Mộc | Phong | Vải gai |
| Phong | Lôi | Trống trận |
| Lôi | Phong | Giông tố |
| Hỏa | Thủy | Mực |
| Thủy | Thủy | Giọt sương |
| Thổ | Kim | Đá ngọc thô |
| Phong | Thổ | Đường xa |
| Thổ | Thổ | Lũy đất |

### Lê Hoàn — cờ lệnh tam giác và bó thẻ tre

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Tre | Vải gai | Cờ lệnh |
| Tre | Kim | Thẻ tre |
| Thẻ tre | Mực | Binh thư |
| Cờ lệnh | Trống trận | Thập đạo |
| Thập đạo | Binh thư | **Lê Hoàn** |

### Nguyễn Bặc — đại đao đơn lưỡi, dải vải đỏ, hỏa kỳ

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Lau sậy | Vải gai | Cờ lau |
| Vải gai | Hỏa | Dải vải đỏ |
| Sắt rèn | Tre | Đại đao |
| Đại đao | Dải vải đỏ | Đại đao buộc vải đỏ |
| Cờ lau | Hỏa | Hỏa kỳ |
| Đại đao buộc vải đỏ | Hỏa kỳ | **Nguyễn Bặc** |

### Đinh Ngọc — kiếm ngắn thẳng, mặt ngọc giọt nước, giữ đường

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Sắt rèn | Kim | Kiếm ngắn |
| Đá ngọc thô | Giọt sương | Ngọc giọt nước |
| Kiếm ngắn | Ngọc giọt nước | Kiếm ngọc |
| Kiếm ngọc | Đường xa | **Đinh Ngọc** |

## 4. Nguồn vật biểu trưng và nguồn sử

| Tướng | Vật biểu trưng | Nguồn trong repo |
|---|---|---|
| Nguyễn Bặc | Đại đao đơn lưỡi, dải vải đỏ ở chắn tay; chiêu Định Quốc Hỏa Kỳ | [Audit vũ khí nhóm A](../../06-art/prompts/v4-2/14-group-a-19-character-weapon-pose-audit.md#rb-002--nguyễn-bặc), [danh sách nhân vật](../../03-characters/danh-sach-nhan-vat.md#5-tướng-lịch-sử) |
| Lê Hoàn | Cờ lệnh tam giác, bó thẻ tre; chiêu Thập Đạo Lôi Binh | [Audit vũ khí nhóm A](../../06-art/prompts/v4-2/14-group-a-19-character-weapon-pose-audit.md#rb-006--lê-hoàn), [danh sách nhân vật](../../03-characters/danh-sach-nhan-vat.md#5-tướng-lịch-sử) |
| Đinh Ngọc | Kiếm ngắn thẳng, mặt ngọc giọt nước ở ngực; mở khóa theo chủ đề cứu trợ, giữ đường | [Đinh Ngọc](../../03-characters/dinh-ngoc.md) |

Hai tướng lịch sử gắn mã nguồn `S04` (Việt Nam sử lược, mục Đinh Tiên Hoàng) trong [sổ nguồn](../campaign/history-sources.md). “Hỏa kỳ” và “Thập đạo” lấy từ tên chiêu trong game, gợi tới tước Định Quốc công và chức Thập đạo tướng quân. Sổ nguồn **chưa có claim** riêng cho hai tước này, và phiên làm LT-01 không mở được Wikisource để đối chiếu (mạng chặn).

> TODO: Thêm claim tước Nguyễn Bặc, Lê Hoàn vào sổ nguồn và đối chiếu S04 trước khi Tướng Lục hiện mô tả lịch sử; tới lúc đó Tướng Lục chỉ hiện nghề, hệ, vật biểu trưng (A-16).

## 5. Việc tiếp theo

- Shan duyệt tên node và công thức ở mục 3.
- LT-02: engine thuần cho chế độ Thường và Hạng trên `SLICE_PACK`, test [mục 7.1](14-tam-tuong-ky-design-freeze.md#71-engine).
