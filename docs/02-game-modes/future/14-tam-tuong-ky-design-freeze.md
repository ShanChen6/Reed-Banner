# 14 — Tầm Tướng Ký — Design Freeze (LT-00)

> Cập nhật: 03/11/2026
> Trạng thái: **DRAFT** — Shan đã chốt 10 quyết định ngày 03/11/2026 (mục 3, dòng **APPROVED**); còn các dòng PROPOSED/OPEN chờ duyệt. Chưa bắt đầu LT-01/LT-02.

File này là **nguồn chính cho luật Tầm Tướng Ký** (trước đây gọi “Liệt Truyện — Tầm Tướng Ký”). Nó thay các đề xuất trong [GDD](08-liet-truyen-gdd.md), [công thức](09-liet-truyen-recipes.md), [kiến trúc](10-liet-truyen-architecture.md), [UI/art](11-liet-truyen-ui-art.md) và [QA/roadmap](12-liet-truyen-qa-roadmap.md); khi khác nhau, file này thắng. Tên file 08–12 giữ nguyên `liet-truyen` để không làm hỏng link và script.

Đối chiếu code `develop` ngày 03/11/2026. Không có code, route, asset hay dữ liệu nào được thêm trong task này.

## 1. Tóm tắt luật đã chốt

- **Tên:** Tầm Tướng Ký (Shan, 03/11/2026).
- **Ghép có thứ tự:** `Lôi + Mộc` và `Mộc + Lôi` là hai công thức khác nhau, ra hai kết quả khác nhau. `Lôi + Lôi`, `Mộc + Mộc` được phép, mỗi cặp ra một kết quả duy nhất.
- **Hai chế độ:**
  - **Thường:** ghép tùy thích, nguyên liệu không mất; mỗi lượt chơi tốn **1 phiếu**. Phiếu kiếm từ thưởng các chế độ khác, phát ít để người chơi không mở hết tướng quá nhanh. Có gợi ý.
  - **Hạng (theo tuần, có thưởng):** mỗi tuần đề cử 5, 7 hoặc 10 tướng (chọn bằng mô phỏng). Người chơi bắt đầu với kho 7 nguyên tố; **mỗi lần ghép tiêu nguyên liệu**. Không gợi ý.
- **Độ khó theo bậc tướng:** cần nhiều lần ghép hơn theo thứ tự **lịch sử > đặc biệt > thường**.
- **Gợi ý:** chỉ ở chế độ Thường, miễn phí 2 lượt, **không bao giờ** lộ đủ công thức. Không tự mở gợi ý khi ghép sai nhiều lần.
- **Thưởng:** ghép ra tướng thì mở **thành tựu**, ngoài ra không thưởng gì thêm. Ngoại lệ duy nhất: thưởng hạng tuần.
- **Phải đăng nhập:** khách không chơi thử được (vì chơi thường tốn phiếu).
- **Tướng Lục:** hiện bóng mờ đủ số tướng của pack.
- **Thông tin tướng:** tạm dùng nghề, hệ, vật biểu trưng và icon nghề/hệ có sẵn; chưa dùng tiểu sử.

## 2. Kiểm kê hiện trạng

### 2.1 Định danh và hạ tầng có sẵn

| Mục | Nguồn code | Giá trị | Dùng cho Tầm Tướng Ký |
|---|---|---|---|
| 7 hệ | `src/core/battle/elements.ts` → `ELEMENTS` | `kim`, `moc`, `thuy`, `hoa`, `tho`, `loi`, `phong` | Starter `elt.*`; chỉ lấy ID, tên, icon. **Không** đọc `COUNTERS`/`GENERATES` |
| Nghề | `src/core/battle/rules.ts` | 6 nghề cũ + `xaThu`, `satThu`; `NEW_PROFESSIONS_ENABLED = true` nên 8 nghề active | Metadata và icon hiển thị |
| Bậc tướng | [Danh sách nhân vật](../../03-characters/danh-sach-nhan-vat.md) | Thường (mục 4, hư cấu); đặc biệt (Đinh Ngọc, Vũ Phong, DRAFT); lịch sử (Đinh Bộ Lĩnh, mục 5 tướng lịch sử, mục 6 sứ quân) | `tier` của node tướng. Tùy tướng chỉ AI (mục 7) không dùng |
| Slice | `src/core/roster/roster.ts` | `chauNgoc` (Y sư/Kim), `toKim` (Mưu sĩ/Kim), `viTrieu` (Quân sư/Thủy), đều bậc thường | LT-01 |
| Chân dung | `src/app/game/art/portrait-data.ts` | Ba nhân vật slice đều có `portrait.webp` | Tướng Lục |
| Thẻ Home | `src/app/game/MenuScene.tsx` → `UPCOMING` | `tam-tuong-ky`, “Tầm Tướng Ký”, chưa có `scene` | Thẻ sắp ra mắt, giữ tới khi phát hành |
| Thành tựu | `src/core/progress/achievements.ts` | `AchievementDef` (`id`, `title`, `target`, `gold`, `value(profile)`), nhận một lần | Thành tựu tướng dùng cơ chế này |
| Mùa tuần | `src/server/seasons.ts`, bảng `season_scores` | Tuần đổi thứ Hai 0 giờ giờ Việt Nam (`vnWeek`) | Điểm hạng tuần |
| Thưởng hạng | `src/core/progress/rankRewards.ts`, `src/server/rankRewards.ts`, sổ `rank_reward_claims` | Bậc hạng 1 / 2–3 / 4–10 / nửa trên / có tên | Thưởng hạng tuần |
| Chặn khách | `isSignedInAccount`, `loginRequiredResponse` ở `src/server/http.ts`; `src/app/game/LoginGate.tsx` | `401 loginRequired` | Toàn bộ API chế độ |
| Phiếu | — | **Chưa có** loại tiền/phiếu nào cho chế độ | Cần thêm vào hồ sơ |
| Engine | — | Chưa có | LT-02 tạo `src/core/tam-tuong-ky/` |

### 2.2 Mâu thuẫn và điểm cần lưu ý

1. **Số nghề active.** Tài liệu cũ ghi 6 nghề; code đã bật 8 nghề. Đã sửa [danh mục chế độ](01-mode-portfolio.md#rủi-ro-sản-phẩm).
2. **Ví dụ công thức 09 không còn đúng luật.** [09 mục 2](09-liet-truyen-recipes.md#2-ba-cây-thử-nghiệm-chưa-khóa) viết theo luật không thứ tự. LT-01 phải viết lại với thứ tự ô, và sửa công thức cuối của Tô Kim đang là “Hệ + Nghề” (`Mưu lược + Kim`).
3. **Hệ Lôi không dùng trong slice ví dụ**, Mộc dùng ở 5/7 công thức starter. LT-01 cân lại.
4. **Thưởng hạng hiện chỉ là vàng.** Shan chốt 01/11/2026 “trước mắt thưởng xếp hạng của mọi chế độ chỉ là vàng” ([chế độ chơi mục 6](../README.md#6-thưởng-vàng-theo-hạng-cuối-kỳ-claude-đặt-01112026-chờ-shan-duyệt)). Phiếu Tầm Tướng Ký là loại thưởng mới; đề xuất lấy phiếu từ nhiệm vụ và điểm danh thay vì thưởng hạng (P-9) để không đụng quyết định đó.
5. **Thành tựu hiện có đều thưởng vàng.** “Chỉ thưởng thành tựu, không thưởng thêm” cần chốt thành tựu tướng có vàng hay không (O-3).
6. **Quy định khách.** [Mục 6.1](../README.md#61-ai-chơi-được-chế-độ-nào-shan-01112026) cho khách chơi thường thoải mái ở các chế độ khác; Tầm Tướng Ký là ngoại lệ, cả chế độ Thường cũng cần đăng nhập. Khi phát hành phải thêm vào bảng đó.
7. **Đường dẫn prompt cũ.** Prompt LT-00 nhắc `docs/game-modes/…` và số 13; thư mục đã chuyển ([MOVED.md](../../MOVED.md)), số 13 đã dùng cho Quần Hùng, nên file này là số 14.

### 2.3 Ba nhân vật slice với art đã có

| Nhân vật | Vật biểu trưng trong art | Ghi chú |
|---|---|---|
| Châu Ngọc | Hồ lô sứ trắng, hộp bạc 4 kim châm ([prompt RB-023](../../06-art/prompts/v4-2/02-tuong-thuong-kim-moc-thuy.md#rb-023--châu-ngọc--y-sư--kim)) | Dùng `Hồ lô thuốc` thay `Bầu thuốc` cho đúng art |
| Tô Kim | Quạt năm lông quạ đen ([đề xuất vũ khí](../../06-art/prompts/v4-2/07-medium-weapon-design-proposals.md#6-tô-kim--rb-024)) | Sửa công thức cuối (mâu thuẫn 2) |
| Vi Triều | Bộ cờ và thẻ tre điều trận ([prompt RB-037](../../06-art/prompts/v4-2/02-tuong-thuong-kim-moc-thuy.md#rb-037--vi-triều--quân-sư--thủy)) | Khớp |

Tiểu sử trong prompt art là “lore đề xuất”, không hiện trong Tướng Lục (A-10).

## 3. Bảng quyết định

- **APPROVED** — Shan đã chốt.
- **PROPOSED** — Claude đề xuất, số liệu là **điểm xuất phát** chờ mô phỏng; Shan duyệt thì chuyển APPROVED.
- **OPEN** — cần Shan chọn.

### 3.1 Đã chốt

| # | Chủ đề | Quyết định |
|---|---|---|
| A-1 | Tên | **Tầm Tướng Ký** (Shan, 03/11/2026) |
| A-2 | Hướng sản phẩm | Ghép yếu tố để tìm chân dung tướng; không chiến đấu, không match-3, không chạm Battle Engine |
| A-3 | Starter | 7 hệ |
| A-4 | Thứ tự ghép | `A+B` và `B+A` là hai công thức riêng, ra hai kết quả khác nhau; `A+A` được phép, ra một kết quả (Shan, 03/11/2026) |
| A-5 | Hai chế độ | **Thường**: ghép tùy thích, không mất nguyên liệu, mỗi lượt chơi tốn 1 phiếu. **Hạng tuần**: đề cử 5/7/10 tướng (chọn bằng test tài nguyên), khởi đầu kho 7 nguyên tố, mỗi lần ghép tiêu nguyên liệu, có thưởng (Shan, 03/11/2026) |
| A-6 | Phiếu không lạm phát | Phiếu kiếm từ thưởng các chế độ khác, phát ít để tránh mở hết tướng rồi chán (Shan, 03/11/2026) |
| A-7 | Bậc tướng | Số lần ghép tối thiểu: lịch sử > đặc biệt > thường (Shan, 03/11/2026) |
| A-8 | Gợi ý | Chỉ chế độ Thường, miễn phí 2 lượt, không gợi ý đủ công thức; không tự mở gợi ý sau nhiều lần ghép sai (Shan, 03/11/2026) |
| A-9 | Thưởng | Ghép ra tướng chỉ mở thành tựu; không thưởng thêm, trừ thưởng hạng tuần (Shan, 03/11/2026) |
| A-10 | Đăng nhập | Bắt buộc đăng nhập; khách không chơi thử (Shan, 03/11/2026) |
| A-11 | Tướng Lục | Hiện bóng mờ đủ số tướng của pack (Shan, 03/11/2026) |
| A-12 | Nội dung tướng | Tạm dùng nghề, hệ, vật biểu trưng, dùng lại icon nghề/hệ; chưa có tiểu sử (Shan, 03/11/2026) |
| A-13 | Khám phá ≠ sở hữu | Ghép ra tướng không cấp tướng vào đội, không vàng/EXP/đá/trang bị (giữ từ concept) |

### 3.2 Đề xuất

| # | Chủ đề | Đề xuất |
|---|---|---|
| P-1 | Khóa công thức | Khóa `first>second` theo thứ tự ô (ô trước, ô sau). Mỗi khóa tối đa một công thức trong một `contentVersion` |
| P-2 | Cặp gương | Nếu catalog khai báo cả `A>B` và `B>A` thì hai kết quả **phải khác nhau** (validator lỗi `mirrorSameResult`). Không bắt buộc cặp nào cũng có công thức |
| P-3 | Tướng là điểm cuối | Tướng không làm nguyên liệu |
| P-4 | Nhiều đường | Node trung gian có thể có nhiều công thức; mỗi tướng đúng **một** công thức cuối |
| P-5 | Thước đo độ khó | `minCombines(node)` = số lần ghép ít nhất để tạo node đó từ starter, mỗi nguyên liệu trung gian tính riêng (như ở chế độ Hạng, nơi nguyên liệu bị tiêu). `starterCost(node)` = số đơn vị nguyên tố tiêu hết |
| P-6 | Khung độ khó | Thường `minCombines` 3–5; đặc biệt 6–8; lịch sử ≥ 9. Validator bắt buộc mọi tướng lịch sử > mọi tướng đặc biệt > mọi tướng thường trong cùng pack |
| P-7 | Lượt chơi Thường | 1 phiếu mở 1 lượt gồm **15 lần ghép**. Chỉ `created` và `noRecipe` trừ lần ghép; `alreadyKnown` và `invalid` không trừ. Lượt đang dở giữ nguyên khi rời màn; hết hạn sau 24 giờ |
| P-8 | Gợi ý | 2 lượt gợi ý miễn phí **mỗi phiếu**, không mua thêm. Mức 1: một nhóm còn công thức chưa tìm. Mức 2: một nguyên liệu của một công thức chưa tìm, **không** nói nó ở ô trước hay ô sau. Không có mức 3 |
| P-9 | Nguồn phiếu | Tài khoản mới nhận 3 phiếu. Xong đủ nhiệm vụ ngày +1; xong một nhiệm vụ tuần “Thắng trận 15” +2; điểm danh ngày 7 +1. Giữ tối đa 10 phiếu. Không bán phiếu bằng vàng ở bản đầu |
| P-10 | Kho hạng tuần | Đầu tuần mỗi hệ 10 đơn vị; mỗi ngày vào chế độ Hạng +2 mỗi hệ (tối đa một lần/ngày). Kết quả ghép thành 1 đơn vị trong kho, dùng tiếp được. `A+A` tiêu 2 đơn vị A |
| P-11 | Ghép sai ở hạng | `noRecipe` vẫn tiêu nguyên liệu (đọc đúng “ghép trong hạng mới mất nguyên tố”). Công thức đã học ở chế độ Thường giúp người chơi bớt thử sai: đây là vòng liên kết hai chế độ |
| P-12 | Đề cử tuần | Server chọn tướng đề cử đầu tuần, giống nhau cho mọi người, trộn bậc: 5 tướng = 3 thường + 1 đặc biệt + 1 lịch sử; 7 = 4+2+1; 10 = 5+3+2. Hiện bóng mờ kèm bậc, nghề, hệ; tên và chân dung lộ khi ghép ra |
| P-13 | Điểm hạng | Mỗi tướng đề cử tính một lần: thường 100, đặc biệt 200, lịch sử 300. Bằng điểm thì xếp theo tổng nguyên tố còn trong kho (nhiều hơn xếp trên), rồi ai đạt trước. Ghi vào `season_scores` với chế độ mới |
| P-14 | Thưởng hạng | Vàng theo bậc, đề xuất bằng Trấn Ải: 500 / 300 / 180 / 80 / 30; qua sổ `rank_reward_claims` |
| P-15 | Ghép ở hạng có tính khám phá | Công thức và tướng tìm ra ở chế độ Hạng cũng ghi vào sổ và Tướng Lục của tài khoản, mở thành tựu |
| P-16 | Thành tựu | Mỗi tướng một thành tựu “Tầm được <tên>”, thêm một thành tựu hoàn thành pack. Nhận một lần, server kiểm từ sổ khám phá |
| P-17 | Server quyết định | Mọi lần ghép đi qua API: server kiểm phiếu/kho, chạy engine thuần, ghi trong một giao dịch. Mỗi yêu cầu có `requestId` để gửi lại không trừ hai lần. Client chỉ hiển thị |
| P-18 | Không ngẫu nhiên | Engine deterministic: không RNG, không `Date.now`, không gọi mạng |
| P-19 | Đồ thị | Mọi node đạt được từ 7 starter; không vòng phụ thuộc; không công thức ra chính nguyên liệu hoặc ra starter |
| P-20 | Chống “Hệ + Nghề” | Công thức cuối không được gồm starter đúng hệ của tướng cộng tri thức mang nghĩa nghề của tướng (cảnh báo validator) |
| P-21 | Mọi starter có ích | Mỗi pack dùng cả 7 starter ít nhất một lần (cảnh báo) |
| P-22 | Bóng mờ | Tướng chưa tìm hiện khung bóng mờ, không tên, không chân dung, aria “Tướng chưa tìm thấy”. Ở chế độ Thường chỉ hiện bậc; ở đề cử tuần hiện thêm nghề/hệ (P-12) |
| P-23 | Nhãn biểu trưng | Màn chơi có dòng “Công thức biểu trưng của trò chơi, không phải diễn giải sử học” |
| P-24 | Content version | ID đã phát hành không đổi nghĩa, không xóa; sửa phải tăng `contentVersion` và có migration kèm test |
| P-25 | Cờ tính năng | `TAM_TUONG_KY_ENABLED` mặc định tắt; Hạng có cờ riêng `TAM_TUONG_KY_RANKED_ENABLED` |
| P-26 | Thư mục code | Engine `src/core/tam-tuong-ky/` (không import `battle` ngoài `ELEMENTS` và nhãn nghề); UI `src/app/game/tam-tuong-ky/`; server `src/server/tamTuongKy.ts` |
| P-27 | Slice LT-01 | 3 tướng thường `chauNgoc`, `toKim`, `viTrieu` để kiểm engine và chế độ Thường. Chế độ Hạng cần pack ≥ 10 tướng có đủ ba bậc (LT-05) mới chạy được |

### 3.3 Còn mở

| # | Câu hỏi |
|---|---|
| O-1 | “Mỗi lần chơi mất 1 phiếu” nghĩa là 1 phiếu cho 1 **lượt** nhiều lần ghép (đề xuất P-7, 15 lần), hay 1 phiếu cho **mỗi lần ghép**? |
| O-2 | “Miễn phí 2 lượt” gợi ý là 2 lần mỗi phiếu (đề xuất P-8), mỗi ngày, hay cả đời tài khoản? |
| O-3 | Thành tựu tướng có thưởng vàng một lần như các thành tựu hiện có, hay chỉ là huy hiệu (vàng 0)? Đề xuất: chỉ huy hiệu, đúng ý “không thưởng thêm” |
| O-4 | Ghép sai ở chế độ Hạng có tiêu nguyên liệu không (đề xuất P-11: có)? |
| O-5 | Ngoài kho đầu tuần và phần cộng mỗi ngày, người chơi “kiếm nguyên liệu” ở chế độ Hạng bằng cách nào khác (ví dụ thưởng từ trận ở chế độ khác)? |
| O-6 | Giữa 5, 7, 10 tướng đề cử: một số cố định cho mọi tuần, hay đổi theo tuần? Chốt sau mô phỏng tài nguyên |
| O-7 | Chọn tướng nào cho pack 10–12 (LT-05), có đưa tướng lịch sử và sứ quân vào ngay không (cần sổ nguồn) |

## 4. Luật chơi

### 4.1 Engine chung

1. Hai ô có thứ tự: **ô trước** và **ô sau**. Khóa công thức `first>second`.
2. Kiểm theo thứ tự: ID có trong catalog đã phát hành → nếu không, `invalid/unknownInput`; đã khám phá (Thường) hoặc còn trong kho (Hạng) → nếu không, `invalid/lockedInput`; là tướng → `invalid/lockedInput`.
3. Tra khóa. Không có → `noRecipe`.
4. Công thức đã biết → `alreadyKnown` (chế độ Thường) hoặc `created` với `recipeAlreadyKnown: true` (chế độ Hạng, vì vẫn tạo ra một đơn vị).
5. Công thức mới → ghi `recipeId`; node chưa có thì thêm vào sổ; `created`.
6. Kết quả là tướng → mở trang Tướng Lục, xét thành tựu; không gọi roster, shop, profile gear.
7. `invalid` không bao giờ đổi state, kho, phiếu hay số lần ghép.

### 4.2 Chế độ Thường

1. Vào chế độ cần đăng nhập. Không có lượt đang dở thì phải dùng 1 phiếu để mở lượt mới.
2. Nguyên liệu là mọi node đã khám phá; ghép không tiêu nguyên liệu.
3. Mỗi lượt có số lần ghép (P-7) và 2 gợi ý (P-8). Hết lần ghép thì lượt kết thúc; muốn chơi tiếp dùng phiếu khác.
4. Sổ khám phá và Tướng Lục lưu theo tài khoản, không reset.

### 4.3 Chế độ Hạng tuần

1. Tuần đổi thứ Hai 0 giờ giờ Việt Nam. Đầu tuần server công bố danh sách tướng đề cử.
2. Kho khởi đầu chỉ có 7 nguyên tố (P-10); node đã khám phá ở chế độ Thường **không** có sẵn trong kho, phải ghép lại.
3. Mỗi lần ghép tiêu 1 đơn vị mỗi nguyên liệu (`A+A` tiêu 2); thành công thì thêm 1 đơn vị kết quả.
4. Không có gợi ý. Không tốn phiếu.
5. Ghép ra tướng đề cử thì cộng điểm (P-13). Tướng tiêu khỏi kho ngay khi tạo (không làm nguyên liệu).
6. Hết tuần, kho bỏ đi; hạng cuối tuần nhận thưởng qua sổ thưởng hạng chung.

## 5. Ví dụ chuẩn

ID minh họa, **không phải nội dung phát hành**. `X` là một node trung gian bất kỳ.

| # | Bối cảnh | Thao tác (ô trước + ô sau) | Kết quả |
|---|---|---|---|
| E-1 | Thường, mới | `elt.loi + elt.moc` | `created`, mở node X1 |
| E-2 | Thường, sau E-1 | `elt.moc + elt.loi` | Công thức khác: `created`, mở node X2 ≠ X1 (nếu catalog có) hoặc `noRecipe` |
| E-3 | Thường | `elt.loi + elt.loi` | `created`, một kết quả duy nhất |
| E-4 | Thường, sau E-1 | `elt.loi + elt.moc` lần nữa | `alreadyKnown`, không trừ lần ghép |
| E-5 | Thường | `elt.kim + elt.xyz` | `invalid/unknownInput`, không trừ gì |
| E-6 | Thường, có tướng `hero.chauNgoc` | `hero.chauNgoc + elt.kim` | `invalid/lockedInput` |
| E-7 | Thường, còn 0 lần ghép, 0 phiếu | bất kỳ | Từ chối `noTicket`, không đổi state |
| E-8 | Hạng, kho `loi:1` | `elt.loi + elt.loi` | `invalid/lockedInput` (thiếu đơn vị), kho giữ nguyên |
| E-9 | Hạng, kho `loi:2, moc:3` | `elt.loi + elt.moc` (có công thức) | Kho `loi:1, moc:2, X1:1` |
| E-10 | Hạng | cặp không có công thức | `noRecipe`, nguyên liệu vẫn bị tiêu (P-11) |
| E-11 | Khách | gọi API ghép | `401 loginRequired` |

## 6. Test contract

LT-01 (validator), LT-02 (engine), LT-04 (Thường trên server) và LT-06 (Hạng) phải có test cho từng dòng.

### 6.1 Engine

1. **Given** sổ mới, **then** có đúng 7 node `elt.*` khớp `ELEMENTS`.
2. **Given** catalog có `loi>moc → X1` và `moc>loi → X2`, **when** ghép hai thứ tự, **then** ra X1 và X2 tương ứng.
3. **Given** catalog chỉ có `loi>moc`, **when** ghép `moc + loi`, **then** `noRecipe`.
4. **Given** catalog có `loi>loi`, **when** ghép `loi + loi`, **then** `created`.
5. **Given** công thức đã biết ở chế độ Thường, **when** ghép lại, **then** `alreadyKnown`, `next === state`.
6. **Given** bất kỳ state, **when** ghép cặp không có công thức ở chế độ Thường, **then** `noRecipe`, sổ không đổi.
7. **Given** node chưa mở, **when** dùng làm nguyên liệu, **then** `invalid/lockedInput`, `next === state`.
8. **Given** ID không có trong catalog, **then** `invalid/unknownInput`, `next === state`.
9. **Given** tướng đã mở, **when** dùng làm nguyên liệu, **then** `invalid/lockedInput`.
10. **Given** ghép thành công ở chế độ Thường, **then** hai nguyên liệu vẫn trong sổ.
11. **Given** cùng state và cặp, **when** gọi 100 lần, **then** kết quả giống hệt nhau.
12. **Given** chuỗi thao tác bất kỳ, **then** sổ không có ID trùng.
13. **Given** module engine, **then** không import roster, profile, shop, battle (ngoài `ELEMENTS`).
14. **Given** catalog slice, **when** BFS từ starter, **then** tạo được cả ba tướng.

### 6.2 Validator catalog

15. **Given** hai công thức cùng khóa `first>second`, **then** lỗi `duplicateKey`.
16. **Given** `A>B` và `B>A` ra cùng kết quả, **then** lỗi `mirrorSameResult`.
17. **Given** hai node cùng ID, **then** lỗi `duplicateId`.
18. **Given** công thức trỏ tới node không có, **then** lỗi `missingReference`.
19. **Given** công thức ra chính nguyên liệu hoặc ra starter, **then** lỗi `selfResult` / `starterResult`.
20. **Given** node không đạt được từ starter hoặc có vòng phụ thuộc, **then** lỗi `unreachable` / `cycle`.
21. **Given** tướng làm nguyên liệu, **then** lỗi `heroAsInput`.
22. **Given** tướng có 0 hoặc ≥ 2 công thức cuối, **then** lỗi `heroRecipeCount`.
23. **Given** `characterId` không có trong roster, **then** lỗi `unknownCharacter`; thiếu chân dung thì cảnh báo.
24. **Given** một tướng thường có `minCombines` ≥ `minCombines` của một tướng đặc biệt cùng pack, **then** lỗi `tierOrder`; tương tự đặc biệt với lịch sử.
25. **Given** tướng nằm ngoài khung P-6 của bậc mình, **then** cảnh báo `tierRange`.
26. **Given** công thức cuối là “hệ của tướng + tri thức nghề của tướng”, **then** cảnh báo `elementPlusProfession`.
27. **Given** pack không dùng một starter, **then** cảnh báo `unusedStarter`.

### 6.3 Chế độ Thường (server)

28. **Given** khách, **when** gọi bất kỳ API của chế độ, **then** `401 loginRequired`.
29. **Given** 1 phiếu, không có lượt dở, **when** mở lượt, **then** còn 0 phiếu, lượt có 15 lần ghép và 2 gợi ý.
30. **Given** 0 phiếu, không có lượt dở, **when** mở lượt, **then** `noTicket`, không đổi gì.
31. **Given** lượt đang dở, **when** mở lượt, **then** trả lượt cũ, không trừ phiếu.
32. **Given** lượt dở, **when** ghép `created` hoặc `noRecipe`, **then** trừ 1 lần ghép; `alreadyKnown`/`invalid` không trừ.
33. **Given** cùng `requestId` gửi hai lần (kể cả song song), **then** chỉ trừ một lần, trả cùng kết quả.
34. **Given** còn gợi ý, **when** xin gợi ý, **then** trả mức 1 hoặc 2, trừ 1; nội dung không bao giờ chứa đủ hai nguyên liệu và thứ tự của một công thức.
35. **Given** đã dùng 2 gợi ý trong lượt, **when** xin thêm, **then** từ chối `noHint`.
36. **Given** ghép sai nhiều lần liên tiếp, **then** không có gợi ý tự mở.
37. **Given** ghép ra tướng, **then** mở đúng thành tựu của tướng đó một lần; không đổi vàng (nếu O-3 chọn huy hiệu), EXP, đá, roster.
38. **Given** người chơi xong nhiệm vụ ngày hai lần trong một ngày (gửi lại), **then** chỉ cộng 1 phiếu; phiếu không vượt trần 10.

### 6.4 Chế độ Hạng tuần (server)

39. **Given** đầu tuần, **then** kho có đúng 7 nguyên tố theo P-10, không có node từ chế độ Thường.
40. **Given** kho thiếu đơn vị, **when** ghép, **then** `invalid/lockedInput`, kho không đổi.
41. **Given** ghép thành công, **then** kho trừ đúng nguyên liệu (`A+A` trừ 2) và cộng 1 kết quả.
42. **Given** `noRecipe`, **then** nguyên liệu bị tiêu theo P-11 (nếu O-4 giữ đề xuất).
43. **Given** chế độ Hạng, **when** xin gợi ý, **then** từ chối; không trừ phiếu khi ghép.
44. **Given** tạo cùng một tướng đề cử hai lần, **then** điểm chỉ cộng một lần.
45. **Given** hai tuần liên tiếp, **then** kho và điểm tuần mới bắt đầu lại; sổ khám phá giữ nguyên.
46. **Given** danh sách đề cử tuần, **then** giống nhau cho mọi người, có đủ bậc theo P-12, mọi tướng tạo được từ kho tối đa của tuần.
47. **Given** kỳ đã khép, **when** nhận thưởng hai lần hoặc song song, **then** chỉ cộng một lần (sổ `rank_reward_claims`).
48. **Given** client gửi số điểm hay tướng tự nhận, **then** server bỏ qua, chỉ tính theo kho và công thức đã ghi.

### 6.5 Phiên bản nội dung

49. **Given** sổ chứa ID không còn trong catalog, **when** đọc, **then** bỏ ID đó, giữ phần còn lại.
50. **Given** `contentVersion` tăng có migration, **when** đọc sổ cũ, **then** mọi tướng đã mở vẫn mở, thành tựu không mất.

## 7. Ranh giới với hệ khác

- **Trận Đồ:** engine, route, bảng xếp hạng riêng; không dùng chung reducer.
- **Campaign:** không đọc/ghi tiến trình, không reset khi đổi chương.
- **Hồ sơ:** chỉ ghi phiếu, sổ khám phá và thành tựu của chế độ; chỉ đọc tên, nghề, hệ, chân dung tướng.
- **Battle Engine:** chỉ dùng `ELEMENTS` và nhãn nghề.
- **Nhiệm vụ và điểm danh:** thêm phần thưởng phiếu (P-9); không đổi số vàng đang có.

## 8. Roadmap sau quyết định 03/11/2026

| Task | Phạm vi |
|---|---|
| LT-01 | Catalog 3 tướng thường theo luật có thứ tự, validator (mục 6.2), mô phỏng `minCombines`/`starterCost` |
| LT-02 | Engine thuần: Thường và Hạng (kho), test mục 6.1 |
| LT-03 | UI: Vạn Vật Lục, Đài Hợp Nguyên (ô trước/ô sau rõ ràng), Tướng Lục bóng mờ, màn nhắc đăng nhập |
| LT-04 | Server chế độ Thường: phiếu, lượt, gợi ý, sổ khám phá, thành tựu, nguồn phiếu từ nhiệm vụ/điểm danh; test mục 6.3 |
| LT-05 | Pack 10–12 tướng đủ ba bậc; mô phỏng tài nguyên để chọn 5/7/10 đề cử và số kho P-10 |
| LT-06 | Server Hạng tuần: kho, đề cử, điểm, mùa, thưởng; test mục 6.4 |
| LT-07 | QA, bật cờ, cập nhật [bảng ai chơi được chế độ nào](../README.md#61-ai-chơi-được-chế-độ-nào-shan-01112026) |

## 9. Điều kiện chuyển sang LT-01

- [x] Shan chốt hướng luật chính (mục 3.1, 03/11/2026).
- [ ] Shan duyệt hoặc sửa các dòng PROPOSED ở mục 3.2.
- [ ] Shan trả lời O-1 … O-4 (ảnh hưởng tới engine). O-5 … O-7 có thể để tới LT-05.
- [ ] Đổi trạng thái file này sang **FROZEN** và ghi vào [changelog](../../decisions/changelog.md).
