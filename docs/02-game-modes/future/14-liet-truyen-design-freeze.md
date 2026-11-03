# 14 — Liệt Truyện: Tầm Tướng Ký — Design Freeze (LT-00)

> Cập nhật: 03/11/2026
> Trạng thái: **DRAFT** — bản chốt đề xuất cho LT-00, chờ Shan duyệt từng dòng ở [mục 3](#3-bảng-quyết-định). Chưa được bắt đầu LT-01/LT-02.

File này là **nguồn chính cho luật Liệt Truyện** khi được duyệt. Nó gom các đề xuất rải rác trong [GDD](08-liet-truyen-gdd.md), [công thức](09-liet-truyen-recipes.md), [kiến trúc](10-liet-truyen-architecture.md), [UI/art](11-liet-truyen-ui-art.md) và [QA/roadmap](12-liet-truyen-qa-roadmap.md) thành một bảng quyết định, đối chiếu với code `develop` (commit `5403230`, 03/11/2026). Khi file này và 08–12 khác nhau, file này thắng; 08–12 giữ làm bối cảnh.

Không có code, route, asset hay dữ liệu nào được thêm trong task này.

## 1. Phạm vi LT-00

- Chốt rulebook ghép hai yếu tố, chính sách công thức, hint, lưu tiến trình, thưởng.
- Soát định danh có thật trong code: 7 hệ, nghề, ba nhân vật slice và chân dung.
- Đặt test contract mà LT-01 (catalog) và LT-02 (engine) phải đạt.
- Ngoài phạm vi: nội dung công thức chính thức (LT-01), engine (LT-02), UI (LT-03), save (LT-04).

## 2. Kiểm kê hiện trạng

### 2.1 Định danh trong code

| Mục | Nguồn code | Giá trị | Dùng cho LT |
|---|---|---|---|
| 7 hệ | `src/core/battle/elements.ts` → `ELEMENTS` | `kim`, `moc`, `thuy`, `hoa`, `tho`, `loi`, `phong` | Starter node `elt.kim` … `elt.phong`, chỉ lấy ID, tên và icon. **Không** đọc `COUNTERS`/`GENERATES` |
| Nghề cũ | `src/core/battle/rules.ts` → `LEGACY_PROFESSIONS` | `tuongSi`, `phapSu`, `binhLinh`, `ySu`, `muuSi`, `quanSu` | Metadata hiển thị |
| Nghề mở rộng | `src/core/battle/rules.ts` → `EXPANSION_PROFESSIONS` | `xaThu` (Xạ thủ), `satThu` (Sát thủ) | Metadata hiển thị |
| Cờ nghề mới | `NEW_PROFESSIONS_ENABLED` | `true` → `PROFESSIONS` có **8** nghề | Xem [mâu thuẫn 1](#22-mâu-thuẫn-phát-hiện) |
| Châu Ngọc | `src/core/roster/roster.ts` (cửa hàng cơ bản) | `chauNgoc`, `ySu`, `kim`, tướng thường **hư cấu** | Slice hero |
| Tô Kim | `src/core/roster/roster.ts` (`STARTER_COMPANIONS`) | `toKim`, `muuSi`, `kim`, tướng thường **hư cấu** | Slice hero |
| Vi Triều | `src/core/roster/roster.ts` (cửa hàng elite) | `viTrieu`, `quanSu`, `thuy`, tướng thường **hư cấu** | Slice hero |
| Chân dung | `src/app/game/art/portrait-data.ts` | Cả ba có `/art/characters/<slug>/portrait.webp`, file có trong `public/` | Tướng Lục |
| Thẻ Home | `src/app/game/MenuScene.tsx` → `UPCOMING` | `tam-tuong-ky`, tên hiển thị “Tầm Tướng Ký”, ảnh `tam-tuong-ky`, **không** có `scene` | Đã là thẻ “sắp ra mắt”, không dẫn tới trang rỗng |
| Engine LT | — | Chưa có `src/core/liet-truyen/` | LT-02 tạo |
| Mẫu save offline | `src/core/binh-phap/serialize.ts` | `SAVE_KEY = "reed-banner:tran-do:save:v1"` | Mẫu cho key LT ở LT-04 |

### 2.2 Mâu thuẫn phát hiện

1. **Số nghề active.** [Danh mục chế độ](01-mode-portfolio.md#rủi-ro-sản-phẩm) và prompt LT-00 ghi “6 nghề active, 2 nghề mở rộng chưa active”; code đã bật `NEW_PROFESSIONS_ENABLED = true` nên `PROFESSIONS` có 8 nghề. Theo quy định tài liệu, code là thực tế: đã sửa dòng đó trong danh mục. Với LT điều này không ảnh hưởng vì nghề chỉ là metadata hiển thị.
2. **Công thức cuối của Tô Kim là “Hệ + Nghề”.** Ví dụ ở [09 mục 2B](09-liet-truyen-recipes.md#b--tô-kim--mưu-sĩ--kim) kết thúc bằng `Mưu lược + Kim → Tô Kim`, tức tri thức mang nghĩa nghề Mưu sĩ cộng hệ Kim của nhân vật. Đây đúng là mẫu mà [09 mục 3](09-liet-truyen-recipes.md#3-authoring-standards-cho-danh-sách-mở-rộng) và danh mục chế độ cấm. Đề xuất đổi ở LT-01 (xem [P-14](#3-bảng-quyết-định)).
3. **Hệ Lôi không dùng trong slice.** Ba cây ví dụ dùng 6/7 starter; `elt.loi` không có công thức nào. Mộc xuất hiện ở 5/7 công thức starter-starter. Người chơi có thể thử Lôi hoài mà không ra gì.
4. **Đường dẫn trong prompt cũ.** Prompt LT-00 nhắc `docs/game-modes/08-12-…` và yêu cầu file `docs/game-modes/13-liet-truyen-design-freeze.md`. Thư mục đã chuyển sang `docs/02-game-modes/future/` ([MOVED.md](../../MOVED.md)) và số 13 đã dùng cho Quần Hùng, nên file này đặt số 14.

### 2.3 Đối chiếu ba nhân vật slice với art đã có

Chỉ dùng vật biểu trưng đã có trong prompt art v4-2; tính cách và tiểu sử ở đó ghi là “lore đề xuất”, nên LT **không** trích tiểu sử vào Tướng Lục cho tới khi lore được duyệt.

| Nhân vật | Vật biểu trưng trong art | Khớp ví dụ 09 | Ghi chú |
|---|---|---|---|
| Châu Ngọc | Hồ lô sứ trắng, hộp bạc 4 kim châm bên hông trái ([prompt RB-023](../../06-art/prompts/v4-2/02-tuong-thuong-kim-moc-thuy.md#rb-023--châu-ngọc--y-sư--kim)) | Kim châm, Bầu thuốc, Dược thảo | Khớp. Đổi tên `Bầu thuốc` thành `Hồ lô thuốc` cho đúng vật trong art (đề xuất) |
| Tô Kim | Quạt năm lông quạ đen ([đề xuất vũ khí](../../06-art/prompts/v4-2/07-medium-weapon-design-proposals.md#6-tô-kim--rb-024)) | Quạt lông, Thẻ tre, Binh thư | Khớp vật phẩm; công thức cuối vướng mâu thuẫn 2 |
| Vi Triều | Bộ cờ và thẻ tre điều trận ([prompt RB-037](../../06-art/prompts/v4-2/02-tuong-thuong-kim-moc-thuy.md#rb-037--vi-triều--quân-sư--thủy)) | Cờ lệnh, Quân thư, Sóng triều | Khớp |

Cả ba là tướng thường hư cấu, nên không cần nhãn `recorded/reconstructed/disputed`; Tướng Lục ghi nhãn `fictional`.

## 3. Bảng quyết định

- **APPROVED** — đã có trong trao đổi với Shan hoặc tài liệu đã duyệt (danh mục chế độ, GDD 08).
- **PROPOSED** — Claude đề xuất trong LT-00; Shan duyệt thì chuyển APPROVED.
- **OPEN** — cần Shan chọn, chưa có đề xuất đủ chắc.

| # | Chủ đề | Trạng thái | Quyết định |
|---|---|---|---|
| A-1 | Hướng sản phẩm | APPROVED | Mode ghép hai yếu tố, khám phá chân dung tướng qua công thức nhiều tầng; không chiến đấu, không match-3, không chạm Battle Engine |
| A-2 | Starter | APPROVED | 7 hệ là starter vĩnh viễn, không tiêu hao |
| A-3 | Khám phá ≠ sở hữu | APPROVED | Khám phá tướng chỉ ghi vào Tướng Lục; không cấp tướng, vàng, EXP, đá, trang bị |
| A-4 | Công thức cuối riêng | APPROVED | Mỗi tướng có công thức cuối riêng |
| A-5 | Tên hiển thị trên Home | APPROVED (theo code) | “Tầm Tướng Ký” đã chạy trên thẻ sắp ra mắt; tên đầy đủ “Liệt Truyện — Tầm Tướng Ký” giữ cho tài liệu và tiêu đề màn |
| P-1 | Cặp không thứ tự | PROPOSED | `A+B == B+A`; khóa canonical `min(a,b)|max(a,b)` theo so sánh chuỗi ID |
| P-2 | Một kết quả mỗi cặp | PROPOSED | Mỗi khóa canonical có tối đa một công thức trong một `contentVersion`; trùng là lỗi build |
| P-3 | `A+A` | PROPOSED | Cho phép **chỉ khi** catalog khai báo công thức `A+A`; UI cho chọn cùng một yếu tố vào hai ô. Slice 3 tướng không dùng |
| P-4 | Nhiều đường tới cùng kết quả | PROPOSED | Cho phép với node trung gian (nhiều công thức cùng `resultId`); **không** cho với tướng: mỗi `hero.*` đúng một công thức cuối |
| P-5 | Tướng là terminal | PROPOSED | `kind: "character"` không làm input trong MVP; UI không cho kéo tướng vào Đài Hợp Nguyên |
| P-6 | Không tiêu hao | PROPOSED | Ghép xong hai input vẫn còn |
| P-7 | Ghép lại | PROPOSED | Công thức đã biết trả `alreadyKnown`, state không đổi |
| P-8 | Không có công thức | PROPOSED | Trả `noRecipe`, state không đổi, không phạt; không lưu cặp sai vào state |
| P-9 | Input chưa mở / ID giả | PROPOSED | Trả `invalid` (`lockedInput` / `unknownInput`), state không đổi |
| P-10 | Không ngẫu nhiên | PROPOSED | Engine deterministic: không RNG, không `Date.now`, không gọi mạng |
| P-11 | Đồ thị | PROPOSED | Mọi node reachable từ 7 starter; không vòng phụ thuộc; không công thức ra chính input (`A+B→A`); không công thức ra starter |
| P-12 | Không giới hạn lượt | PROPOSED | Không năng lượng, không tiền tệ, không giới hạn số lần thử trong MVP |
| P-13 | Nhãn biểu trưng | PROPOSED | Màn chơi luôn có dòng “Công thức biểu trưng của trò chơi, không phải diễn giải sử học” |
| P-14 | Chống “Hệ + Nghề” | PROPOSED | Công thức cuối không được có cả (a) starter đúng hệ của tướng và (b) node tri thức tương ứng nghề của tướng. Validator cảnh báo; LT-01 sửa cây Tô Kim |
| P-15 | Mọi starter có ích | PROPOSED | Mỗi pack phát hành phải dùng cả 7 starter ít nhất một lần (cảnh báo validator, không chặn build); LT-01 thêm một nhánh dùng Lôi |
| P-16 | Hint | PROPOSED | 3 mức, **miễn phí**, không giới hạn: (1) gợi ý nhóm còn hữu ích, (2) lộ một input, (3) lộ đủ công thức. Mức 3 không tự ghép; người chơi vẫn phải bấm Hợp Nguyên. Không tính hint vào điểm/thành tích |
| P-17 | Lưu tiến trình MVP | PROPOSED | Local, guest chơi được, offline; key `reed-banner:tam-tuong-ky:save:v1` theo mẫu Trận Đồ. State chỉ lưu ID và version |
| P-18 | Thưởng lúc ra mắt | PROPOSED | Chỉ sưu tầm. Thưởng/thành tích là LT-06, cần server và review riêng |
| P-19 | Content version | PROPOSED | Node/recipe ID đã phát hành không đổi nghĩa, không xóa; sửa phải tăng `contentVersion` kèm migration có test |
| P-20 | Feature flag | PROPOSED | Flag mặc định OFF; thẻ Home giữ “sắp ra mắt” cho tới LT-07 |
| P-21 | Thư mục code | PROPOSED | Engine `src/core/liet-truyen/` (thuần, không import `battle`/`board`/`campaign`); UI `src/app/game/liet-truyen/` |
| P-22 | Slice | PROPOSED | LT-01 chỉ làm 3 tướng `chauNgoc`, `toKim`, `viTrieu`, 10–14 node trung gian |
| O-1 | Đồng bộ tài khoản | OPEN | Sau MVP: khi đăng nhập, hợp nhất tiến trình guest theo phép hợp (union) hay giữ bản server? |
| O-2 | Lộ số kết quả còn lại | OPEN | Tướng Lục hiện bóng mờ đủ số tướng của pack, hay chỉ hiện “x/y”? |
| O-3 | Gợi ý khi ghép sai | OPEN | Sau N lần `noRecipe` liên tiếp có tự mở hint mức 1 không, N là bao nhiêu? |
| O-4 | Tiểu sử trong Tướng Lục | OPEN | Dùng “lore đề xuất” trong prompt art, hay chờ lore được duyệt và tạm chỉ hiện nghề/hệ/vật biểu trưng? |
| O-5 | Pack mở rộng LT-05 | OPEN | Chọn 7–9 tướng nào cho gói 10–12; có đưa tướng lịch sử vào không (cần sổ nguồn) |

## 4. Rulebook (theo các dòng PROPOSED)

1. State khởi đầu: `discoveredNodeIds` gồm đúng 7 starter, `discoveredRecipeIds` rỗng.
2. Người chơi chọn hai node đã khám phá, không phải `character`. Có thể chọn cùng một node hai lần.
3. Engine kiểm tra theo thứ tự: ID có trong catalog đã phát hành → `unknownInput`; đã khám phá → `lockedInput`; là `character` → `lockedInput`.
4. Tra khóa canonical. Không có công thức → `noRecipe`.
5. Có công thức đã nằm trong `discoveredRecipeIds` → `alreadyKnown` kèm `nodeId`.
6. Có công thức mới → thêm `recipeId`; nếu `resultId` chưa có thì thêm vào `discoveredNodeIds`; trả `created`. Nếu `resultId` đã có qua đường khác thì vẫn ghi `recipeId` và trả `created` với cờ `nodeAlreadyKnown: true` (không thông báo khám phá mới).
7. Kết quả `character` → UI mở trang Tướng Lục; không gọi roster, shop hay profile.
8. Pack hoàn thành khi mọi `characterIds` đã phát hành của pack nằm trong `discoveredNodeIds`.
9. Mọi trường hợp trừ bước 6 trả `next` là **cùng tham chiếu** với state vào.

Kiểu dữ liệu giữ theo [kiến trúc mục contract](10-liet-truyen-architecture.md#đề-xuất-typescript-type-contract), thêm `nodeAlreadyKnown?: boolean` cho nhánh `created` và lý do `lockedInput` bao cả input là tướng.

## 5. Ví dụ chuẩn

Ví dụ dùng ID của [09 mục 2](09-liet-truyen-recipes.md#2-ba-cây-thử-nghiệm-chưa-khóa); đây là **dữ liệu kiểm thử**, chưa phải nội dung phát hành.

| # | Trước | Thao tác | Kết quả |
|---|---|---|---|
| E-1 | Starter | `elt.moc + elt.thuy` | `created`, mở `mat.herbs` |
| E-2 | Sau E-1 | `elt.thuy + elt.moc` | `alreadyKnown`, `mat.herbs`; state không đổi |
| E-3 | Starter | `elt.loi + elt.loi` | `noRecipe` |
| E-4 | Starter | `mat.herbs + mat.needles` | `invalid/lockedInput` |
| E-5 | Starter | `elt.kim + elt.xyz` | `invalid/unknownInput` |
| E-6 | Có `know.healing`, `mat.gourd` | `know.healing + mat.gourd` | `created`, mở `hero.chauNgoc`, UI mở Tướng Lục |
| E-7 | Có `hero.chauNgoc` | `hero.chauNgoc + elt.kim` | `invalid/lockedInput` |
| E-8 | Có `mat.bambooSlips` từ nhánh Tô Kim | `mat.bambooSlips + elt.tho` | `created`, mở `know.militaryRecord` cho nhánh Vi Triều |

Độ sâu tối thiểu của slice theo ví dụ 09: Châu Ngọc 3 bước, Tô Kim 4, Vi Triều 4; 15 công thức, 12 node trung gian, 7/28 cặp starter có công thức. LT-01 tính lại sau khi sửa mâu thuẫn 2 và 3.

## 6. Test contract

LT-01 (validator catalog) và LT-02 (engine) phải có test cho từng dòng. ID ví dụ theo mục 5.

### 6.1 Engine

1. **Given** state khởi đầu, **when** đọc `discoveredNodeIds`, **then** có đúng 7 ID `elt.*` khớp `ELEMENTS`.
2. **Given** state khởi đầu, **when** `combine(elt.moc, elt.thuy)`, **then** `created`, `mat.herbs` được thêm.
3. **Given** state khởi đầu, **when** `combine(elt.thuy, elt.moc)`, **then** kết quả giống hệt `combine(elt.moc, elt.thuy)`.
4. **Given** `mat.herbs` đã mở, **when** ghép lại `elt.moc + elt.thuy`, **then** `alreadyKnown`, `next === state`.
5. **Given** bất kỳ state, **when** ghép cặp không có công thức, **then** `noRecipe`, `next === state`.
6. **Given** `mat.needles` chưa mở, **when** dùng nó làm input, **then** `invalid/lockedInput`, `next === state`.
7. **Given** ID không có trong catalog, **when** dùng làm input, **then** `invalid/unknownInput`, `next === state`.
8. **Given** `hero.chauNgoc` đã mở, **when** dùng làm input, **then** `invalid/lockedInput`.
9. **Given** ghép thành công, **when** so input trước và sau, **then** hai input vẫn trong `discoveredNodeIds`.
10. **Given** catalog có `A+A`, **when** `combine(A, A)` với A đã mở, **then** `created`.
11. **Given** catalog không có `A+A`, **when** `combine(A, A)`, **then** `noRecipe`.
12. **Given** cùng state và cặp, **when** gọi `combine` 100 lần, **then** mọi kết quả bằng nhau (deterministic).
13. **Given** node X đã mở qua công thức R1, **when** ghép công thức R2 cũng ra X, **then** `created` với `nodeAlreadyKnown: true`, `discoveredNodeIds` không có X trùng.
14. **Given** bất kỳ chuỗi thao tác, **when** đọc state, **then** `discoveredNodeIds` và `discoveredRecipeIds` không có phần tử trùng.
15. **Given** ghép ra tướng, **when** engine chạy, **then** không có lời gọi tới roster/profile/shop (module không import chúng).
16. **Given** mọi công thức trong slice, **when** chạy BFS từ starter, **then** mở được cả ba tướng.

### 6.2 Validator catalog

17. **Given** hai công thức cùng khóa canonical (kể cả đảo thứ tự), **when** build registry, **then** lỗi `duplicatePair`.
18. **Given** hai node cùng ID, **when** build, **then** lỗi `duplicateId`.
19. **Given** công thức trỏ tới node không tồn tại, **when** build, **then** lỗi `missingReference`.
20. **Given** công thức `A+B→A`, **when** build, **then** lỗi `selfResult`.
21. **Given** công thức ra node `elt.*`, **when** build, **then** lỗi `starterResult`.
22. **Given** node không reachable từ starter, **when** build, **then** lỗi `unreachable`.
23. **Given** công thức dùng `hero.*` làm input, **when** build, **then** lỗi `heroAsInput`.
24. **Given** một tướng có 0 hoặc ≥2 công thức cuối, **when** build, **then** lỗi `heroRecipeCount`.
25. **Given** hai `hero.*` cùng `characterId`, **when** build, **then** lỗi `duplicateCharacter`.
26. **Given** `characterId` không có trong roster hoặc không có chân dung, **when** build, **then** lỗi `unknownCharacter` (chân dung thiếu: cảnh báo, dùng ảnh thay thế).
27. **Given** công thức cuối gồm starter đúng hệ tướng và tri thức theo nghề tướng, **when** build, **then** cảnh báo `elementPlusProfession`.
28. **Given** pack không dùng một starter nào đó, **when** build, **then** cảnh báo `unusedStarter`.

### 6.3 Lưu và phiên bản (LT-04)

29. **Given** save hợp lệ, **when** serialize rồi parse, **then** state bằng nhau.
30. **Given** save hỏng hoặc `schemaVersion` lạ, **when** parse, **then** trả state khởi đầu, không ném lỗi, không ghi đè save gốc cho tới khi người chơi ghép lần đầu.
31. **Given** save chứa ID không còn trong catalog, **when** parse, **then** bỏ ID đó, giữ phần còn lại.
32. **Given** `contentVersion` tăng và có migration, **when** load save cũ, **then** mọi tướng đã mở vẫn mở.
33. **Given** guest không có mạng, **when** chơi và tải lại trang, **then** tiến trình còn nguyên.
34. **Given** hai tab cùng ghi save, **when** tab sau ghi, **then** kết quả là hợp của hai state (không mất khám phá).

## 7. Ranh giới với hệ khác

- **Binh Pháp/Trận Đồ:** engine, save key và route riêng; không dùng chung reducer. LT không có lưới, nghề/hệ không phải điều kiện ghép.
- **Campaign:** không đọc/ghi tiến trình Campaign; không reset khi đổi chương; không đổi 24 nhiệm vụ, nguồn sử hay kết cục.
- **Profile/roster/shop:** chỉ đọc tên, nghề, hệ, chân dung qua adapter; không ghi.
- **Battle Engine:** không import `src/core/battle` ngoài hằng `ELEMENTS` và nhãn nghề.

## 8. Điều kiện chuyển sang LT-01

- [ ] Shan duyệt (hoặc sửa) từng dòng PROPOSED ở mục 3; dòng được duyệt đổi sang APPROVED.
- [ ] Shan trả lời hoặc hoãn rõ ràng O-1 … O-5.
- [ ] Đổi trạng thái file này sang **FROZEN** và ghi vào [changelog](../../decisions/changelog.md).

Chưa đủ ba điều kiện trên thì không mở LT-01/LT-02.
