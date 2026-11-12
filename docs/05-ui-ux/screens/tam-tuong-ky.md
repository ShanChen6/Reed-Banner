# Giao diện Tầm Tướng Ký

> Cập nhật: 06/11/2026
> Trạng thái: **DRAFT** — màn chế độ Thường đã có code (`src/app/game/tam-tuong-ky/`), chạy trên server theo tài khoản từ LT-04; bật bằng cờ `TAM_TUONG_KY_ENABLED` (mặc định tắt). Shan góp ý 6 điểm ngày 06/11/2026; đã sửa theo [mục 7](#7-sửa-theo-góp-ý-06112026-đã-triển-khai), mục 3 mô tả bản sau khi sửa.

Luật ở [Design Freeze](../../02-game-modes/tam-tuong-ky/design-freeze.md); nội dung công thức ở [Gói 1](../../02-game-modes/tam-tuong-ky/goi-1.md) và code `src/core/tam-tuong-ky/catalog.ts`. Tài liệu này chỉ nói về giao diện.

## 1. Vào màn

- Đường dẫn `/game/tam-tuong-ky`, phân cảnh `TAM_TUONG_KY`.
- Cờ tắt: thẻ Home giữ “Sắp ra mắt”, mở thẳng đường dẫn thì hiện “Chế độ này chưa mở”.
- Cờ bật: thẻ Home thành “Đã mở” và dẫn vào màn. Khách thấy màn nhắc đăng nhập kèm lý do tốn phiếu (A-14).

## 2. Bố cục

| Màn | Cách xếp |
|---|---|
| ≥ 1024px | Ba cột: Vạn Vật Lục (trái ~26%), Đài Hợp Nguyên (giữa ~44%, dính khi cuộn), Tướng Lục (phải ~30%) |
| < 1024px | Đài Hợp Nguyên ở trên; hai nút chọn sổ “Vạn Vật Lục” / “Tướng Lục x/y” bên dưới; thanh **Hợp Nguyên** cố định ở đáy màn hình |

Tông gỗ tối, giấy dó, đồng cổ dùng token chung (theme.css) và khung `atlas-frame` của Sử ký; dùng chung Global Game Header. Dòng “Công thức biểu trưng của trò chơi, không phải diễn giải sử học” luôn hiện dưới tiêu đề (P-25).

## 3. Các vùng

Ba khung cùng một hàng lưới trên máy tính, mép trên thẳng hàng và cao bằng nhau (không `sticky`, không `self-start`); danh sách dài phân trang (`usePagedItems` + `PageControls`) thay vì cuộn dài.

**Vạn Vật Lục**
- Ô tìm kiếm không phân biệt dấu (“thap dao” ra “Thập đạo”).
- Lọc theo nhóm, một hàng: chip “Tất cả” và “Nguyên tố”, các nhóm còn lại (Thiên nhiên, Binh khí, Cờ hiệu, Thư tịch, Ngọc, Vai trò, Tuyệt chiêu) trong ô chọn “Nhóm khác…”; chỉ hiện nhóm đã có yếu tố. Câu hướng dẫn cách đặt ô chỉ hiện cho người mới (chưa ghép ra gì).
- Ô yếu tố là thẻ vuông, icon là chính (icon 36px trên, tên tối đa 2 dòng chữ nhỏ dưới, cao cố định 84px, `title` đủ tên), lưới 4 cột (8 cột ở máy tính bảng); chấm vàng “còn công thức” (Thường) hoặc `×n` (Hạng) ở góc trên phải. Mọi yếu tố trừ tướng có icon: nguyên tố dùng icon hệ, yếu tố khác dùng tranh ở `public/art/tam-tuong-ky/`, tuyệt chiêu Gói 3 dùng ảnh kỹ năng ô 4 của chính tướng (test chốt trong `tests/game/skill-art.test.ts`).
- Phân trang 24 ô (máy tính, 4 × 6) / 16 ô (điện thoại); đổi từ khóa hoặc nhóm thì về trang 1. Yếu tố vừa khám phá: mở trang có nó (nếu nằm trong danh sách đang lọc) và nhấp nháy một lần.
- Bấm yếu tố: điền ô trước, rồi ô sau; đủ hai ô thì thay ô sau. Bấm cùng yếu tố hai lần được (`A+A`). Không có kéo thả.

**Đài Hợp Nguyên**
- Hai ô **Ô trước** / **Ô sau** cao cố định (144px máy tính, 112px điện thoại), ba hàng cố định: nhãn, icon (ô trống là vòng nét đứt), tên tối đa 2 dòng. Ô có yếu tố là nút: bấm để bỏ, hover/focus hiện ✕ và viền đỏ nhạt (`aria-label="Bỏ <tên> khỏi ô trước"`). Nút ⇄ đổi chỗ hai ô; dòng nhắc thứ tự ô có nghĩa.
- **Thẻ dưới hai ô** cao cố định (112px), một trong ba loại (đổi loại không đẩy bố cục):
  - **Sổ công thức** của yếu tố vừa bấm ở Vạn Vật Lục (chế độ Thường): tên, “còn công thức chưa tìm” nếu có, **Tạo từ** (các cặp đã biết, icon + `title`) và **Dùng ghép** (thứ đi cùng → thứ ra được, tối đa 4, “+n”). Chỉ từ công thức người chơi đã tự ghép ra, không lộ công thức chưa tìm (`recipeBook` trong `altar.ts`).
  - **Kết quả** lần ghép vừa rồi: lúc chờ server hai ô rung nhẹ, viền vàng; có kết quả thì icon hai yếu tố trượt vào giữa rồi tan, sau đó hiện: khám phá mới (icon, tên, nhãn “Mới”, quầng vàng), đã biết (nhãn “Đã biết”), tìm thấy tướng (chân dung, tên, bậc, quầng mạnh hơn; Hạng thêm “+n điểm”), không ra gì (hai icon xám tách ra, khói, “Chưa tìm được mối liên hệ”). Bấm thẻ yếu tố thì đặt yếu tố đó vào ô trước. Giảm chuyển động: chỉ hiện thẻ.
  - **Gợi ý** vừa xin: mức 1 “Còn công thức ra một thứ thuộc nhóm …”, bấm thẻ thì Vạn Vật Lục lọc theo nhóm đó; mức 2 hiện icon nguyên liệu, ô đó trong Vạn Vật Lục có viền vàng và đèn gợi ý (bỏ lọc, mở đúng trang), bấm thẻ thì đặt nguyên liệu vào ô trước.
- Nút Hợp Nguyên chỉ bấm được khi đủ hai ô và còn lần ghép.
- Ô thông báo `aria-live`: khám phá mới, tìm thấy chân dung, đã biết (không trừ lần ghép), chưa tìm được mối liên hệ, yếu tố không hợp lệ, lời gợi ý. Khi thẻ dưới hai ô đã nói điều đó thì ô thông báo chỉ còn cho máy đọc màn hình (không lặp chữ); lỗi luôn hiện.
- Số lần ghép còn lại của lượt (15) và nút “Lượt mới” khi hết; một hàng gợi ý: “Nhóm”, “Nguyên liệu” (kèm icon đèn dầu vẽ tay `HintIcon`, không dùng emoji), “còn x/2” hôm nay.
- “Lần ghép gần đây”: 5 lần gần nhất, luôn hiện, mỗi dòng dạng icon `A + B → C` (không ra gì: `✕`); bấm một dòng thì đặt lại đúng cặp đó vào hai ô.
- Đặt lại một cặp đã ghép mà không ra gì (cả Thường và Hạng): hiện cảnh báo “Bạn đã ghép cặp này ở lần trước…” ngay dưới nút (để nút không nhảy); nút vẫn ghi “Hợp Nguyên” (Shan, 06/11/2026: không đổi chữ trên nút). Không nói công thức sai. Xem [cảnh báo cặp đã thử](../../02-game-modes/tam-tuong-ky/can-bang-va-canh-bao.md#2-cảnh-báo-cặp-đã-thử).

**Tướng Lục**
- Đủ số tướng của sổ đang chạy (A-15), chia **nhóm theo quan hệ** (chỉ để hiển thị; gói phát hành giữ nguyên trong code và thành tựu): Cờ lau Hoa Lư (Đinh Bộ Lĩnh và 6 tướng theo ông), Thập nhị sứ quân, Kỳ nhân (Đinh Ngọc, Trần Vũ Phong), 8 nhóm tướng thường theo nghề. Bộ lọc hai tầng, mỗi tầng một hàng: thanh 4 mục **Hoa Lư · Sứ quân · Kỳ nhân · Tướng thường** kèm `x/y`; chọn Tướng thường thì hiện hàng icon 8 nghề (tên và `x/y` ở nhãn, `title`). Thêm nghề hay nhóm mới không thêm hàng. Mặc định nhóm đầu tiên chưa đủ; một dòng tên nhóm và giới thiệu (chữ của trò chơi). Logic ở `ledgerGroup`, `ledgerGroups`, `ledgerSections` (`altar.ts`).
- Thẻ là ô chân dung lưới 3 cột (6 ở máy tính bảng), phân trang 9 ô (máy tính) / 6 ô (điện thoại). Bấm tướng đã tìm mở khung chi tiết (`<dialog>`, Esc để đóng).
- Tướng chưa tìm: vòng “?” viền màu theo bậc (vàng: lịch sử, tím: đặc biệt), chữ bậc nhỏ; “Tướng chưa tìm thấy” cho máy đọc màn hình; không có tên, chân dung hay nghề/hệ trong HTML lẫn aria.
- Tướng đã tìm: ô hiện chân dung thật (`Portrait`) và tên; khung chi tiết có bậc, icon và tên nghề/hệ đọc từ roster, **dấu tích** là nguyên liệu danh tính của công thức cuối (tước hiệu, địa danh, chiêu, lore; không lấy từ art, A-22). Chưa có tiểu sử.
- Dòng “Tìm thấy chân dung chỉ ghi vào Tướng Lục, không thêm tướng vào đội”. Không có chữ nhận tướng, chiêu mộ hay vàng.
- Ghép ra tướng thì Tướng Lục tự mở nhóm và trang có tướng đó, thẻ sáng lên; trên điện thoại tự chuyển sang Tướng Lục.

## 4. Phiếu, lượt và lưu (LT-04)

- Góc phải tiêu đề: **Phiếu x/10**.
- Chưa có lượt: nút chính là **Mở lượt mới · 1 phiếu**; hết phiếu thì nút mờ và ô thông báo chỉ cách nhận phiếu (nhiệm vụ ngày, nhiệm vụ tuần “Thắng 15 trận”, điểm danh ngày thứ 7).
- Có lượt: nút **Hợp Nguyên** và dòng “Lượt này còn x/15 lần ghép”.
- Sổ mới (chưa ghép công thức nào): ô thông báo hiện mẹo “chọn Mộc vào ô trước và Mộc vào ô sau”.
- Mọi nút khóa trong lúc chờ server (chống bấm đúp); lỗi mạng thì bấm lại gửi cùng `requestId`.
- Sổ, phiếu, lượt và gợi ý lưu theo tài khoản; tải lại trang hay đổi máy vẫn còn. Chi tiết ở [server LT-04](../../02-game-modes/tam-tuong-ky/server.md).

## 5. Chế độ Hạng tuần (LT-06)

- Khi cờ `TAM_TUONG_KY_ENABLED` bật, đầu màn có hai nút **Thường** / **Hạng tuần**.
- Tiêu đề “Tầm Tướng Ký · Hạng tuần <thứ Hai>”, dòng nhắc “Không có gợi ý. Mỗi lần ghép tiêu nguyên liệu, ghép sai cũng mất.”; khung phải: túi (đơn vị nguyên tố), điểm, đã tiêu.
- Vạn Vật Lục: 7 nguyên tố (dùng chung túi, không hiện số riêng từng hệ) và yếu tố trong kho tuần kèm `×n`; không có dấu còn công thức.
- Đài Hợp Nguyên: hai ô, đổi chỗ, Hợp Nguyên; không có nút gợi ý. Cửa hàng: giá, số bó đã mua tuần này /2, vàng hiện có, nút “Mua 1 bó”.
- **Đề cử tuần**: 7 ô, mỗi ô “Tướng chưa tìm thấy · <điểm>” và lời dẫn in nghiêng; ghép ra thì hiện tên và điểm cộng (A-23).
- **Bảng tuần**: top 10 và hạng của mình.
- Chế độ Thường thêm chấm vàng “còn công thức chưa tìm” trên yếu tố (L5-4).

### Ngoài màn chế độ (cờ bật)

- **Trang Xếp hạng**: tab “Tầm Tướng Ký” (khi cờ Hạng bật) với bảng tuần, “x điểm · tiêu y” mỗi dòng.
- **Trang Nhiệm vụ** (người đã vào chế độ): đầu trang ghi số phiếu; ô điểm danh ngày 7 ghi “+1 phiếu”; ghi chú nhiệm vụ ngày nhắc “Nhận đủ nhiệm vụ ngày: +1 phiếu”; nút “Thắng 15 trận” ghi “400 vàng +2 phiếu”. Thành tựu bộ `ttk.*` chỉ hiện khi cờ bật.

## 6. Đã kiểm

- `tests/game/tam-tuong-ky-screen.test.ts` (14 test): màn chờ dữ liệu, phiếu và nút mở lượt, mẹo người mới; chọn ô, đổi chỗ, `A+A`; tìm không dấu và lọc nhóm; lời thông báo; Tướng Lục không lộ tướng chưa tìm; dựng màn không có tên tướng hay chữ thưởng; phân cảnh và cờ.
- Playwright với cờ bật: khách thấy màn nhắc đăng nhập; đăng ký rồi ghép ra Đinh Ngọc ở 1440px và iPhone 13 (390px); không tràn ngang ở 320, 768, 1024px; thẻ Home dẫn vào màn.

> TODO: kéo thả (tùy chọn).

## 7. Sửa theo góp ý 06/11/2026 (đã triển khai)

Shan chơi bản trên `co-lau.vercel.app` và góp ý 6 điểm. Đã có code: 7.1 ở PR #341; 7.2–7.6 làm chung một PR vì cả ba nhóm A/B/C bên dưới sửa đan xen trong cùng file và ba khung chỉ cao bằng nhau (7.6) khi Tướng Lục đã phân trang (7.2). Shan xem bản đầu thấy hai sổ còn tràn lan nên chỉnh tiếp trong cùng PR: ô yếu tố và ô tướng thành lưới thẻ vuông, bộ lọc gom về một hàng mỗi tầng (chi tiết ở mục 3). Đo bằng Playwright sau khi sửa: mép trên ba khung lệch 0px ở 1024/1440/1600px (trước 16px, đúng bằng `lg:top-4` của `sticky`); nút Hợp Nguyên đứng yên khi đặt/bỏ yếu tố kể cả “Dựng nước Đại Cồ Việt”; mọi ô yếu tố cao bằng nhau (84px), ba khung cao bằng nhau (754px ở 1440px, trước khi chỉnh lần hai 902px). Kế hoạch ban đầu chia 3 PR:

| PR | Gồm | Đụng file |
|---|---|---|
| A. Bố cục và ô | 7.3, 7.4, 7.6 | `TamTuongKyScreen.tsx`, `globals.css` |
| B. Icon và hiệu ứng ghép | 7.1, 7.5 | `TamTuongKyScreen.tsx`, `altar.ts`, `globals.css` |
| C. Tướng Lục chia nhóm | 7.2 | `altar.ts`, `TamTuongKyScreen.tsx`, test |

Mỗi PR chụp 1440px và 390px, chạy `pnpm lint`, `pnpm typecheck`, `pnpm test`; sửa mục 3 tài liệu này cho khớp khi xong.

### 7.1. Yếu tố còn thiếu icon

**Hiện trạng.** `NodeGlyph` lấy tranh ở `public/art/tam-tuong-ky/yeu-to/<mã>.webp` (61 yếu tố trong `NODE_ART`, đủ từ 06/11/2026 khi có Đô hộ phủ) hoặc tranh nghề ở `public/art/tam-tuong-ky/tri-thuc-nghe/` cho tri thức sơ học và node vai trò. Còn **56 tuyệt chiêu riêng của tướng thường** (`know.skill.<mã tướng>`, nhóm "Tuyệt chiêu", ví dụ "Liễu Diệp Tỏa Giang", "Gió Lành Tẩy Uế") rơi về chữ cái đầu.

**Cách làm.** Dùng chung icon kỹ năng: `know.skill.<id>` → `ultimateOf(id)` (`src/core/battle/skills.ts`) → `SkillIcon` (`src/app/game/art/skills.tsx`). Cả 56 chiêu đã có ảnh riêng trong `public/art/skills/` (06/11/2026; trước đó 15 chiêu mượn tạm ảnh chiêu hệ cũ của Đinh Bộ Lĩnh nên trùng hình với chiêu khác, không phải vẽ SVG; cơ chế mượn ảnh đã bỏ); khi Shan gửi thêm ảnh thì không phải sửa màn này. Thêm test: mọi node không phải tướng đều có `nodeArt` hoặc icon kỹ năng, không còn node nào rơi về chữ cái (test liệt kê node thiếu để lần thêm gói sau biết ngay).

**Nghiệm thu.** Lọc "Tuyệt chiêu" không còn ô chữ cái.

### 7.2. Tướng Lục: phân trang và chia nhóm theo quan hệ

**Hiện trạng.** Tướng Lục chia mục theo gói phát hành: Gói 1 "Dẹp loạn" (6 tướng theo Đinh Bộ Lĩnh, 4 sứ quân, Đinh Ngọc, Vũ Phong), Gói 2 "Thập nhị sứ quân" (8 sứ quân còn lại **và Đinh Bộ Lĩnh**, nên đếm ra 9), Gói 3 "Tướng thường" (56). Cả 77 thẻ nằm một cột dài.

**Cách làm.** Tách hai khái niệm:

- **Gói** giữ nguyên trong code (`pack` của node, thành tựu `ttk.pack-*`, cờ phát hành): là đơn vị ra mắt nội dung, người chơi không cần thấy.
- **Nhóm Tướng Lục** (mới, chỉ để hiển thị) gom tướng theo quan hệ, kiểu sảnh kết nghĩa: mỗi nhóm có tên, một dòng giới thiệu mối liên hệ và số đã tìm.

| Nhóm | Tướng | Số |
|---|---|---|
| Cờ lau Hoa Lư | Đinh Bộ Lĩnh, Nguyễn Bặc, Đinh Điền, Lưu Cơ, Trịnh Tú, Lê Hoàn, Đinh Liễn | 7 |
| Thập nhị sứ quân | 12 sứ quân (cả 4 ở Gói 1) | 12 |
| Kỳ nhân | Đinh Ngọc, Trần Vũ Phong | 2 |
| Tướng thường theo nghề | 8 nhóm (Tướng sĩ, Binh lính, Y sư, Mưu sĩ, Quân sư, Pháp sư, Xạ thủ, Sát thủ), mỗi nhóm 7 tướng, một tướng mỗi hệ | 8 × 7 |

Dòng giới thiệu là chữ của trò chơi, không phải trích sử (ví dụ "Những người theo cờ lau từ buổi đầu ở Hoa Lư"). Không lộ tướng chưa tìm: thẻ chưa tìm vẫn chỉ có "?" và bậc như hiện nay.

Giao diện:

- Đầu Tướng Lục là hàng chip nhóm (ChoiceChip) kèm `x/y`; mặc định nhóm đầu tiên chưa đủ.
- Danh sách trong nhóm phân trang bằng `usePagedItems` + `PageControls` (`@/components/ui/Pagination`), **6 thẻ/trang** trên máy tính, 4 trên điện thoại; đặt `key` theo nhóm để đổi nhóm thì về trang 1.
- Ghép ra tướng thì tự chuyển tới nhóm và trang có tướng đó, thẻ sáng lên (`ttk-reveal`).

Code: thêm `ledgerGroup(characterId)` trong `altar.ts` đọc `isHero`, `isWarlord` (`src/core/roster/roster.ts`), bậc `dacBiet` và nghề trong roster; Đinh Bộ Lĩnh xếp vào Cờ lau Hoa Lư. `LedgerEntry` thêm trường `group` cho cả tướng chưa tìm (tên nhóm không lộ tướng vì nhóm có từ 2 người).

**Ghi chú.** Thành tựu "đủ ba tướng đặc biệt" vẫn tính Đinh Bộ Lĩnh dù hiển thị ở nhóm Hoa Lư; không đổi vàng hay thành tựu trong PR này. Muốn đổi luôn tên gói phát hành cho khớp nhóm thì làm riêng.

### 7.3. Đài Hợp Nguyên thụt xuống so với hai cột bên

**Hiện trạng.** Ở 1600px, khung Đài Hợp Nguyên bắt đầu thấp hơn Vạn Vật Lục và Tướng Lục khoảng 15px. Cả ba `Panel` cùng một hàng lưới; chỉ Đài Hợp Nguyên có `lg:sticky lg:top-4` (`TamTuongKyScreen.tsx`, cả chế độ Thường và Hạng). Nghi nguyên nhân là `sticky` trong khung cuộn của `GameShell`; **chưa đo xác nhận**.

**Cách làm.** Đo `boundingBox` ba khung bằng Playwright ở 1024, 1440, 1600px, trước và sau khi bỏ `lg:sticky lg:top-4`. Khi Vạn Vật Lục đã phân trang (7.6) thì ba cột gần bằng nhau, không cần dính khi cuộn nữa, nên bỏ `sticky`.

**Nghiệm thu.** Mép trên ba khung lệch nhau ≤ 1px ở cả ba bề rộng.

### 7.4. Ô trước, ô sau cố định; bấm vào ô để bỏ

**Hiện trạng.** `Slot` cao theo nội dung (`min-h-24`): ô trống chỉ có chữ "Trống", ô có yếu tố thêm icon, tên và nút "Bỏ", nên đặt yếu tố vào thì cả khung cao lên và nút Hợp Nguyên nhảy xuống. Tên dài xuống hai dòng còn nhảy thêm.

**Cách làm.**

- Ô cao cố định (`h-36` máy tính, `h-28` điện thoại), bố cục ba hàng cố định: nhãn "Ô trước/Ô sau", vùng icon `size-12`, tên tối đa 2 dòng (`line-clamp-2`, `title` đủ tên). Ô trống vẫn giữ chỗ icon bằng vòng nét đứt.
- Bỏ nút chữ "Bỏ". Ô có yếu tố là một `button` với `aria-label="Bỏ <tên> khỏi ô trước"`; hover/focus hiện dấu ✕ nhỏ góc phải và viền đỏ nhạt để người chơi biết bấm là bỏ. Ô trống không bấm được.
- Thanh ghép ở đáy trên điện thoại giữ nguyên.

**Nghiệm thu.** Đặt rồi bỏ yếu tố, kể cả tên dài nhất ("Dựng nước Đại Cồ Việt"), vị trí nút Hợp Nguyên không đổi (đo `boundingBox`).

### 7.5. Hiệu ứng hợp nguyên và hiện thứ tạo thành

**Hiện trạng.** Bấm Hợp Nguyên thì hai ô xóa ngay, chỉ có một dòng chữ trong ô thông báo; không thấy thứ vừa tạo ra.

**Cách làm.** Không cần sửa server: phản hồi ghép đã có `status`, `nodeId`, `isCharacter`, `nodeAlreadyKnown`.

1. Trong lúc chờ server: hai ô rung nhẹ và sáng viền vàng (`aria-busy`).
2. Có kết quả: icon hai ô trượt vào giữa nút ⇄ rồi tan (keyframe `ttk-merge`, ~450 ms), sau đó hiện **thẻ kết quả** ngay dưới hai ô, cao cố định để không đẩy bố cục:

| Kết quả | Thẻ hiện |
|---|---|
| Khám phá mới | Icon `size-16` + tên + nhãn "Mới", quầng vàng tỏa (`ttk-reveal`), yếu tố mới nhấp nháy 1 lần trong Vạn Vật Lục |
| Thêm cách ra / Đã biết | Icon + tên, nhãn "Đã biết", không quầng |
| Tìm thấy tướng | Chân dung `Portrait` + tên + bậc, quầng mạnh hơn; trên điện thoại vẫn tự chuyển Tướng Lục như hiện nay |
| Không ra gì | Hai icon tách ra, khói xám, chữ "Chưa tìm được mối liên hệ" |

3. Bấm thẻ kết quả (khi là yếu tố) thì đặt yếu tố đó vào ô trước để ghép tiếp.
4. `prefers-reduced-motion`: bỏ chuyển động, chỉ hiện thẻ. Ô thông báo `aria-live` giữ nguyên chữ để đọc màn hình.

Chế độ Hạng dùng chung thẻ kết quả, cộng dòng "+n điểm" khi ra tướng đề cử.

### 7.6. Ô yếu tố tên dài làm lệch các cột

**Hiện trạng.** Ô trong Vạn Vật Lục cao theo chữ: tên dài như "Liễu Diệp Tỏa Giang" xuống hai dòng nên ô đó cao hơn ô bên cạnh; danh sách càng dài thì cột Vạn Vật Lục càng cao, lệch hẳn so với hai cột kia.

**Cách làm.**

- Ô cao cố định `h-14`, lưới `auto-rows-fr`; tên `text-[13px] leading-tight line-clamp-2`, `title` đủ tên; chấm vàng "còn công thức" và `×n` không chiếm chỗ của tên (đặt góc trên phải).
- **Vạn Vật Lục phân trang** (Shan dặn danh sách dài phải phân trang, không cuộn dài): `usePagedItems` + `PageControls`, 16 ô/trang (2 cột × 8 hàng) trên máy tính, 12 trên điện thoại; `key` theo ô tìm + nhóm lọc để đổi lọc thì về trang 1. 7 nguyên tố luôn ở trang 1.
- Ba khung cùng chiều cao tối thiểu trên máy tính (`lg:min-h-[…]` theo khung cao nhất sau phân trang), không dùng `self-start` riêng lẻ.

**Nghiệm thu.** Ở 1440px, ba khung cao lệch nhau không quá một hàng ô; không có ô nào cao hơn ô cùng hàng.
