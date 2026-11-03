# 14 — Tầm Tướng Ký — Design Freeze (LT-00)

> Cập nhật: 03/11/2026
> Trạng thái: **DRAFT** — Shan đã chốt hai đợt quyết định ngày 03/11/2026 (mục 3.1); các dòng đề xuất ở mục 3.2 và câu mở ở mục 3.3 chờ duyệt. Chưa bắt đầu LT-01/LT-02.

File này là **nguồn chính cho luật Tầm Tướng Ký** (trước đây gọi “Liệt Truyện — Tầm Tướng Ký”). Nó thay các đề xuất trong [GDD](08-liet-truyen-gdd.md), [công thức](09-liet-truyen-recipes.md), [kiến trúc](10-liet-truyen-architecture.md), [UI/art](11-liet-truyen-ui-art.md) và [QA/roadmap](12-liet-truyen-qa-roadmap.md); khi khác nhau, file này thắng. Tên file 08–12 giữ nguyên `liet-truyen` để không làm hỏng link và script.

Đối chiếu code `develop` ngày 03/11/2026. Không có code, route, asset hay dữ liệu nào được thêm trong task này.

## 1. Tóm tắt luật đã chốt

- **Tên:** Tầm Tướng Ký.
- **Ghép có thứ tự:** `Lôi + Mộc` và `Mộc + Lôi` là hai công thức khác nhau, ra hai kết quả khác nhau. `Lôi + Lôi`, `Mộc + Mộc` được phép, mỗi cặp ra một kết quả.
- **Chế độ Thường:** 1 phiếu mở một lượt 15–20 lần ghép (chốt khi cân bằng). Nguyên liệu không mất. Phiếu kiếm từ thưởng các chế độ khác, phát ít. Có gợi ý.
- **Chế độ Hạng tuần:** số tướng đề cử **cố định**, danh sách **xoay vòng theo tuần**. Khởi đầu từ 7 nguyên tố; mỗi lần ghép tiêu nguyên liệu, **ghép sai cũng mất, không hoàn lại**. Nguyên liệu thêm kiếm từ thưởng hạng các chế độ, có thể mua ở cửa hàng. Không gợi ý. Có thưởng.
- **Độ khó:** số lần ghép tối thiểu theo bậc **lịch sử > đặc biệt > thường**.
- **Gợi ý:** chỉ chế độ Thường, không lộ đủ công thức, không tự mở. Shan nghiêng về **2 lượt miễn phí mỗi ngày**; Claude đồng ý (P-8).
- **Thành tựu:** mở **đủ một bộ** tướng (ví dụ đủ tướng hệ Hỏa) thưởng vàng + huy hiệu; mở một tướng lẻ không có thành tựu.
- **Phải đăng nhập**, khách không chơi thử.
- **Tướng Lục** hiện bóng mờ đủ số tướng của pack; tạm dùng nghề, hệ, vật biểu trưng và icon có sẵn.
- **Gói đầu tiên:** 10 tướng lịch sử + 2 tướng đặc biệt.

## 2. Kiểm kê hiện trạng

### 2.1 Định danh và hạ tầng có sẵn

| Mục | Nguồn code | Giá trị | Dùng cho Tầm Tướng Ký |
|---|---|---|---|
| 7 hệ | `src/core/battle/elements.ts` → `ELEMENTS` | `kim`, `moc`, `thuy`, `hoa`, `tho`, `loi`, `phong` | Starter `elt.*`; chỉ lấy ID, tên, icon. **Không** đọc `COUNTERS`/`GENERATES` |
| Nghề | `src/core/battle/rules.ts` | 6 nghề cũ + `xaThu`, `satThu`; `NEW_PROFESSIONS_ENABLED = true` nên 8 nghề active | Metadata, icon |
| Tướng lịch sử | `src/core/roster/roster.ts`, [danh sách nhân vật mục 5–6](../../03-characters/danh-sach-nhan-vat.md#5-tướng-lịch-sử) | Đinh Bộ Lĩnh, 6 tướng theo Đinh Bộ Lĩnh, 12 sứ quân | Nguồn chọn 10 tướng gói đầu |
| Tướng đặc biệt | `roster.ts` (`special: true`) | `dinhNgoc` (Tướng sĩ/Kim), `vuPhong` (Quân sư/Phong); cả hai tài liệu nhân vật còn **DRAFT** | 2 tướng đặc biệt gói đầu |
| Chân dung | `src/app/game/art/portrait-data.ts` | Có ảnh cho cả 12 tướng đề xuất ở [mục 5](#5-gói-đầu-tiên-10-lịch-sử--2-đặc-biệt) | Tướng Lục |
| Nguồn sử | [Sổ nguồn Campaign](../campaign/history-sources.md) | Nhãn và mức tin cậy cho nhân vật lịch sử | Nhãn trong Tướng Lục |
| Thẻ Home | `src/app/game/MenuScene.tsx` → `UPCOMING` | `tam-tuong-ky`, “Tầm Tướng Ký”, chưa có `scene` | Giữ “sắp ra mắt” tới khi phát hành |
| Thành tựu | `src/core/progress/achievements.ts` | `AchievementDef` có `gold`, nhận một lần | Thành tựu bộ sưu tập |
| Mùa tuần | `src/server/seasons.ts`, `season_scores` | Tuần đổi thứ Hai 0 giờ giờ Việt Nam | Điểm hạng tuần |
| Thưởng hạng | `src/core/progress/rankRewards.ts`, `src/server/rankRewards.ts`, `rank_reward_claims` | Bậc hạng 1 / 2–3 / 4–10 / nửa trên / có tên; hiện **chỉ vàng** | Thêm nguyên liệu vào thưởng (P-11) |
| Chặn khách | `isSignedInAccount`, `loginRequiredResponse`, `LoginGate.tsx` | `401 loginRequired` | Toàn bộ API chế độ |
| Phiếu, túi nguyên tố | — | **Chưa có** | Thêm vào hồ sơ |
| Engine | — | Chưa có | LT-02 tạo `src/core/tam-tuong-ky/` |

### 2.2 Mâu thuẫn và điểm cần lưu ý

1. **Số nghề active.** Tài liệu cũ ghi 6 nghề; code đã bật 8. Đã sửa [danh mục chế độ](01-mode-portfolio.md#rủi-ro-sản-phẩm).
2. **Ví dụ công thức 09 không còn dùng được.** [09 mục 2](09-liet-truyen-recipes.md#2-ba-cây-thử-nghiệm-chưa-khóa) viết cho ba tướng thường theo luật không thứ tự. Gói đầu không có tướng thường, nên ba cây đó chỉ còn làm dữ liệu test engine.
3. **Thưởng hạng không còn chỉ là vàng.** Shan chốt 01/11/2026 “trước mắt thưởng xếp hạng mọi chế độ chỉ là vàng” ([chế độ chơi mục 6](../README.md#6-thưởng-vàng-theo-hạng-cuối-kỳ-claude-đặt-01112026-chờ-shan-duyệt)). Quyết định 03/11/2026 thêm nguyên liệu Tầm Tướng Ký vào thưởng hạng; khi code phải sửa mục đó. Số vàng đã duyệt không đổi.
4. **Hai tướng đặc biệt còn DRAFT.** [Đinh Ngọc](../../03-characters/dinh-ngoc.md) và [Vũ Phong](../../03-characters/vu-phong.md) chưa được duyệt chính thức; Vũ Phong chưa chốt họ Trần. Tên hiển thị trong Tướng Lục phải theo bản duyệt cuối.
5. **Hệ và nghề của Đinh Bộ Lĩnh đổi theo người chơi** (`mainCharacter(element, profession)`), nên không xếp được vào bộ theo hệ. Đề xuất không đưa vào gói đầu (P-27).
6. **Tướng lịch sử cần nguồn.** Vật biểu trưng và mô tả phải theo [sổ nguồn](../campaign/history-sources.md); công thức là biểu trưng, không phải sự kiện.
7. **Quy định khách.** [Mục 6.1](../README.md#61-ai-chơi-được-chế-độ-nào-shan-01112026) cho khách chơi thường ở các chế độ khác; Tầm Tướng Ký là ngoại lệ. Khi phát hành phải thêm vào bảng đó.
8. **Đường dẫn prompt cũ.** Prompt LT-00 nhắc `docs/game-modes/…` và số 13; thư mục đã chuyển ([MOVED.md](../../MOVED.md)), số 13 đã dùng cho Quần Hùng.

## 3. Bảng quyết định

- **APPROVED** — Shan đã chốt.
- **PROPOSED** — Claude đề xuất; số liệu là **điểm xuất phát** chờ mô phỏng.
- **OPEN** — cần Shan chọn.

### 3.1 Đã chốt

| # | Chủ đề | Quyết định |
|---|---|---|
| A-1 | Tên | **Tầm Tướng Ký** |
| A-2 | Hướng sản phẩm | Ghép yếu tố để tìm chân dung tướng; không chiến đấu, không chạm Battle Engine |
| A-3 | Starter | 7 hệ |
| A-4 | Thứ tự ghép | `A+B` và `B+A` là hai công thức riêng, ra hai kết quả khác nhau; `A+A` được phép, ra một kết quả |
| A-5 | Chế độ Thường | Ghép tùy thích, không mất nguyên liệu; **1 phiếu = 1 lượt 15–20 lần ghép**, số cụ thể chốt khi cân bằng |
| A-6 | Phiếu | Kiếm từ thưởng các chế độ khác, phát ít để người chơi không mở hết tướng rồi chán |
| A-7 | Chế độ Hạng tuần | Có thưởng; khởi đầu từ 7 nguyên tố; mỗi lần ghép tiêu nguyên liệu |
| A-8 | Ghép sai ở Hạng | Mất nguyên liệu, **không hoàn lại** |
| A-9 | Nguồn nguyên liệu Hạng | Thưởng hạng của các chế độ; cân nhắc bán ở cửa hàng |
| A-10 | Tướng đề cử | Số tướng **cố định**, danh sách **xoay vòng theo tuần**; số tướng chọn sau khi cân bằng nguồn nguyên liệu |
| A-11 | Bậc tướng | Số lần ghép tối thiểu: lịch sử > đặc biệt > thường |
| A-12 | Gợi ý | Chỉ chế độ Thường, miễn phí, không gợi ý đủ công thức, không tự mở khi ghép sai nhiều |
| A-13 | Thành tựu | Thưởng **vàng + huy hiệu** khi mở **đủ một bộ** tướng (ví dụ đủ tướng hệ Hỏa); mở một tướng lẻ không có thành tựu. Ngoài thành tựu và thưởng hạng tuần, ghép ra tướng không thưởng gì |
| A-14 | Đăng nhập | Bắt buộc; khách không chơi thử |
| A-15 | Tướng Lục | Bóng mờ đủ số tướng của pack |
| A-16 | Nội dung tướng | Tạm dùng nghề, hệ, vật biểu trưng, icon nghề/hệ có sẵn |
| A-17 | Gói đầu | **10 tướng lịch sử + 2 tướng đặc biệt** |
| A-18 | Khám phá ≠ sở hữu | Ghép ra tướng không cấp tướng vào đội, không EXP/đá/trang bị |

### 3.2 Đề xuất

**Luật ghép và độ khó**

| # | Đề xuất |
|---|---|
| P-1 | Khóa công thức `first>second` theo ô trước, ô sau. Mỗi khóa tối đa một công thức trong một `contentVersion` |
| P-2 | Nếu catalog có cả `A>B` và `B>A` thì hai kết quả **phải khác nhau** (lỗi `mirrorSameResult`). Không bắt buộc cặp nào cũng có công thức |
| P-3 | Tướng là điểm cuối, không làm nguyên liệu; mỗi tướng đúng **một** công thức cuối; node trung gian có thể có nhiều công thức |
| P-4 | `minCombines(node)` = số lần ghép ít nhất từ starter, mỗi nguyên liệu trung gian tính riêng (vì ở Hạng nguyên liệu bị tiêu). `starterCost(node)` = số đơn vị nguyên tố tiêu hết |
| P-5 | Khung `minCombines`: thường 3–5 (cho gói sau), đặc biệt 6–8, lịch sử 9–12. Validator bắt buộc mọi tướng lịch sử > mọi tướng đặc biệt > mọi tướng thường trong cùng pack |
| P-6 | Engine deterministic: không RNG, không `Date.now`, không gọi mạng |
| P-7 | Mọi node đạt được từ 7 starter; không vòng phụ thuộc; không công thức ra chính nguyên liệu hoặc ra starter; mỗi pack dùng cả 7 starter (cảnh báo); công thức cuối không là “hệ của tướng + tri thức theo nghề của tướng” (cảnh báo) |

**Chế độ Thường**

| # | Đề xuất |
|---|---|
| P-8 | **Gợi ý: 2 lượt miễn phí mỗi ngày** (đổi lúc 0 giờ giờ Việt Nam, không cộng dồn, không mua thêm). Lý do chọn theo ngày thay vì theo phiếu: người chơi nhiều phiếu không được nhiều gợi ý hơn; số gợi ý dễ đoán; không phải theo dõi gợi ý theo từng lượt. Mức 1: một nhóm còn công thức chưa tìm. Mức 2: một nguyên liệu của một công thức chưa tìm, không nói nó ở ô trước hay ô sau |
| P-9 | Lượt bắt đầu với **15 lần ghép**, cân bằng trong khoảng 15–20. Chỉ `created` và `noRecipe` trừ lần ghép; `alreadyKnown` và `invalid` không trừ. Lượt dở giữ khi rời màn, hết hạn sau 24 giờ |
| P-10 | Nguồn phiếu: tài khoản mới 3 phiếu; xong đủ nhiệm vụ ngày +1; xong nhiệm vụ tuần “Thắng trận 15” +2; điểm danh ngày 7 +1. Giữ tối đa 10. Không bán phiếu |

**Chế độ Hạng tuần**

| # | Đề xuất |
|---|---|
| P-11 | **Túi nguyên tố** lưu theo tài khoản, không reset. Đơn vị thưởng là **bó** = 1 đơn vị mỗi hệ (7 đơn vị). Thưởng hạng các chế độ **theo tuần** (Trận Đồ Đại trận, Tháp Thiên Mệnh, Trấn Ải, Quần Hùng, và chính Tầm Tướng Ký): hạng 1 → 5 bó; 2–3 → 4; 4–10 → 3; nửa trên → 2; có tên → 1. Chế độ theo ngày (Nhật Lệnh, Trận Đồ Thường/Khó) không thưởng bó, tránh lạm phát. Cộng cùng lúc nhận vàng, qua sổ `rank_reward_claims` |
| P-12 | Cấp nền: lần đầu vào chế độ Hạng mỗi tuần nhận 3 bó, để người mới vẫn chơi được |
| P-13 | Cửa hàng (nếu Shan đồng ý bán, O-1): 1 bó = 300 vàng, tối đa 2 bó mỗi tuần. Trần mua thấp để vàng không quyết định hạng |
| P-14 | Node trung gian ghép ở Hạng chỉ sống trong tuần; hết tuần bỏ, nguyên tố còn dư giữ trong túi. Tướng tạo ra không vào túi |
| P-15 | Mỗi lần ghép tiêu 1 đơn vị mỗi nguyên liệu (`A+A` tiêu 2); thành công cộng 1 đơn vị kết quả; `noRecipe` vẫn tiêu (A-8). Không tốn phiếu |
| P-16 | Đề cử: server chọn đầu tuần, giống nhau cho mọi người, xoay vòng sao cho mỗi tướng trong gói được đề cử đều nhau. Mỗi tuần có ít nhất 1 tướng đặc biệt. Bóng mờ đề cử hiện bậc, nghề, hệ; tên và chân dung lộ khi ghép ra |
| P-17 | Số tướng đề cử chọn trong 5 / 7 / 10 bằng mô phỏng LT-05: người chơi trung bình (thưởng “nửa trên” ở hai chế độ + cấp nền) ghép được khoảng một nửa danh sách nếu biết công thức |
| P-18 | Điểm: mỗi tướng đề cử tính một lần, đặc biệt 200, lịch sử 300 (thường 100 cho gói sau). Bằng điểm thì ít nguyên tố tiêu trong tuần hơn xếp trên, rồi ai đạt trước |
| P-19 | Thưởng hạng Tầm Tướng Ký: vàng 500 / 300 / 180 / 80 / 30 (bằng Trấn Ải) cộng bó theo P-11 |

**Thành tựu**

| # | Đề xuất |
|---|---|
| P-20 | Thành tựu gắn với **pack**: pack sau có thành tựu riêng, thành tựu đã nhận không mất khi thêm tướng. Chỉ tính bộ có từ 2 tướng trở lên |
| P-21 | Thành tựu gói đầu (theo danh sách [mục 5](#5-gói-đầu-tiên-10-lịch-sử--2-đặc-biệt)): đủ tướng hệ Hỏa / Thổ / Kim / Thủy / Phong (mỗi bộ 2 tướng) 200 vàng; đủ 2 tướng đặc biệt 300; đủ 6 tướng theo Đinh Bộ Lĩnh 500; đủ 4 sứ quân 400; đủ cả gói 1 000. Tổng 3 200 vàng một lần. Mỗi thành tựu có một huy hiệu |
| P-22 | Tướng tìm ra ở cả hai chế độ đều ghi vào Tướng Lục và tính thành tựu |

**Hệ thống**

| # | Đề xuất |
|---|---|
| P-23 | Server quyết định mọi lần ghép: kiểm phiếu/túi, chạy engine thuần, ghi trong một giao dịch; mỗi yêu cầu có `requestId` để gửi lại không trừ hai lần. Client không tự cộng điểm, tướng hay thưởng |
| P-24 | Bóng mờ: không tên, không chân dung, aria “Tướng chưa tìm thấy”; chế độ Thường chỉ hiện bậc |
| P-25 | Nhãn: màn chơi luôn có “Công thức biểu trưng của trò chơi, không phải diễn giải sử học”; tướng lịch sử có nhãn và nguồn theo sổ nguồn |
| P-26 | ID đã phát hành không đổi nghĩa, không xóa; sửa phải tăng `contentVersion` kèm migration và test |
| P-27 | Gói đầu không có Đinh Bộ Lĩnh (mâu thuẫn 5) |
| P-28 | Cờ `TAM_TUONG_KY_ENABLED` và `TAM_TUONG_KY_RANKED_ENABLED` mặc định tắt |
| P-29 | Code: `src/core/tam-tuong-ky/` (không import `battle` ngoài `ELEMENTS` và nhãn nghề), `src/app/game/tam-tuong-ky/`, `src/server/tamTuongKy.ts` |
| P-30 | Slice LT-01: 3 tướng trong gói đầu (Nguyễn Bặc, Lê Hoàn, Đinh Ngọc) để thử cả hai bậc. Ba cây tướng thường ở 09 chỉ làm dữ liệu test |

### 3.3 Còn mở

| # | Câu hỏi |
|---|---|
| O-1 | Có bán bó nguyên tố ở cửa hàng không (đề xuất P-13: có, trần thấp)? |
| O-2 | Duyệt danh sách 12 tướng ở mục 5? |
| O-3 | Thứ tự duyệt Đinh Ngọc, Vũ Phong (đang DRAFT) có kịp gói đầu không; nếu không, thay bằng tướng đặc biệt nào? |

Số lần ghép mỗi phiếu (15–20) và số tướng đề cử (5/7/10) đã có hướng chốt; LT-05 chọn số bằng mô phỏng.

## 4. Luật chơi

### 4.1 Engine chung

1. Hai ô có thứ tự: **ô trước**, **ô sau**. Khóa công thức `first>second`.
2. Kiểm theo thứ tự: ID có trong catalog đã phát hành (không → `invalid/unknownInput`); có sẵn để dùng — đã khám phá ở Thường, đủ đơn vị ở Hạng (không → `invalid/lockedInput`); là tướng → `invalid/lockedInput`.
3. Tra khóa. Không có → `noRecipe`.
4. Công thức đã biết → `alreadyKnown` ở Thường; ở Hạng vẫn là `created` với `recipeAlreadyKnown: true` (tạo thêm một đơn vị).
5. Công thức mới → ghi `recipeId` vào sổ tài khoản; node chưa có thì thêm; `created`.
6. Kết quả là tướng → mở trang Tướng Lục, xét thành tựu bộ; không gọi roster, shop, gear.
7. `invalid` không bao giờ đổi sổ, túi, phiếu, số lần ghép hay gợi ý.

### 4.2 Chế độ Thường

1. Cần đăng nhập. Không có lượt dở thì dùng 1 phiếu để mở lượt.
2. Nguyên liệu là mọi node đã khám phá; ghép không tiêu nguyên liệu.
3. Hết lần ghép thì lượt kết thúc. Gợi ý tính theo ngày, không theo lượt.
4. Sổ khám phá và Tướng Lục lưu theo tài khoản, không reset.

### 4.3 Chế độ Hạng tuần

1. Tuần đổi thứ Hai 0 giờ giờ Việt Nam; server công bố danh sách đề cử.
2. Nguyên liệu là túi nguyên tố của tài khoản cộng node trung gian ghép trong tuần. Node đã biết ở chế độ Thường không có sẵn, phải ghép lại.
3. Mỗi lần ghép tiêu nguyên liệu, kể cả ghép sai; không hoàn lại.
4. Không có gợi ý, không tốn phiếu.
5. Ghép ra tướng đề cử thì cộng điểm. Hết tuần, node trung gian bị bỏ; xếp hạng cuối tuần nhận thưởng qua sổ chung.

## 5. Gói đầu tiên: 10 lịch sử + 2 đặc biệt

Đề xuất (O-2). Chọn để 5 hệ có đúng 2 tướng (đủ làm thành tựu bộ theo hệ) và có cả hai nhóm lịch sử.

| Nhóm | Tướng | ID | Nghề | Hệ |
|---|---|---|---|---|
| Tướng theo Đinh Bộ Lĩnh | Nguyễn Bặc | `nguyenBac` | Tướng sĩ | Hỏa |
| | Đinh Điền | `dinhDien` | Binh lính | Thổ |
| | Lưu Cơ | `luuCo` | Mưu sĩ | Kim |
| | Trịnh Tú | `trinhTu` | Y sư | Mộc |
| | Lê Hoàn | `leHoan` | Quân sư | Lôi |
| | Đinh Liễn | `dinhLien` | Pháp sư | Thủy |
| Sứ quân | Phạm Bạch Hổ | `phamBachHo` | Tướng sĩ | Hỏa |
| | Đỗ Cảnh Thạc | `doCanhThac` | Tướng sĩ | Thổ |
| | Trần Lãm | `tranLam` | Quân sư | Thủy |
| | Ngô Nhật Khánh | `ngoNhatKhanh` | Quân sư | Phong |
| Đặc biệt | Đinh Ngọc | `dinhNgoc` | Tướng sĩ | Kim |
| | Vũ Phong | `vuPhong` | Quân sư | Phong |

Theo hệ: Hỏa, Thổ, Kim, Thủy, Phong mỗi hệ 2 tướng; Mộc và Lôi mỗi hệ 1 tướng (chưa có thành tựu hệ, chờ gói sau). Cả 12 tướng đều có chân dung trong `portrait-data.ts`. Nghề và hệ của tướng đặc biệt lấy theo `roster.ts`, dù trong trận họ dung hợp tám nghề/bảy hệ.

## 6. Ví dụ chuẩn

ID minh họa, **không phải nội dung phát hành**.

| # | Bối cảnh | Thao tác (ô trước + ô sau) | Kết quả |
|---|---|---|---|
| E-1 | Thường | `elt.loi + elt.moc` | `created`, mở X1 |
| E-2 | Thường, sau E-1 | `elt.moc + elt.loi` | Công thức khác: mở X2 ≠ X1, hoặc `noRecipe` nếu chưa khai báo |
| E-3 | Thường | `elt.loi + elt.loi` | `created`, một kết quả |
| E-4 | Thường, sau E-1 | `elt.loi + elt.moc` lần nữa | `alreadyKnown`, không trừ lần ghép |
| E-5 | Thường | `elt.kim + elt.xyz` | `invalid/unknownInput`, không trừ gì |
| E-6 | Thường, có `hero.nguyenBac` | `hero.nguyenBac + elt.hoa` | `invalid/lockedInput` |
| E-7 | Thường, hết lần ghép, 0 phiếu | bất kỳ | `noTicket`, không đổi state |
| E-8 | Thường, đã dùng 2 gợi ý hôm nay | xin gợi ý | `noHint`; sau 0 giờ có lại 2 lượt |
| E-9 | Hạng, túi `loi:1` | `elt.loi + elt.loi` | `invalid/lockedInput`, túi giữ nguyên |
| E-10 | Hạng, túi `loi:2, moc:3` | `elt.loi + elt.moc` (có công thức) | Túi `loi:1, moc:2`, kho tuần `X1:1` |
| E-11 | Hạng, túi `loi:2, moc:3` | cặp không có công thức | `noRecipe`, túi `loi:1, moc:2`, không hoàn |
| E-12 | Khách | gọi API | `401 loginRequired` |

## 7. Test contract

LT-01 (validator), LT-02 (engine), LT-04 (Thường), LT-06 (Hạng) phải có test cho từng dòng.

### 7.1 Engine

1. **Given** sổ mới, **then** có đúng 7 node `elt.*` khớp `ELEMENTS`.
2. **Given** catalog có `loi>moc → X1` và `moc>loi → X2`, **when** ghép hai thứ tự, **then** ra X1 và X2.
3. **Given** catalog chỉ có `loi>moc`, **when** ghép `moc + loi`, **then** `noRecipe`.
4. **Given** catalog có `loi>loi`, **when** ghép `loi + loi`, **then** `created`.
5. **Given** công thức đã biết ở Thường, **when** ghép lại, **then** `alreadyKnown`, `next === state`.
6. **Given** cặp không có công thức ở Thường, **then** `noRecipe`, sổ không đổi.
7. **Given** node chưa mở, **when** dùng làm nguyên liệu, **then** `invalid/lockedInput`, `next === state`.
8. **Given** ID không có trong catalog, **then** `invalid/unknownInput`, `next === state`.
9. **Given** tướng đã mở, **when** dùng làm nguyên liệu, **then** `invalid/lockedInput`.
10. **Given** ghép thành công ở Thường, **then** hai nguyên liệu vẫn trong sổ.
11. **Given** cùng state và cặp, **when** gọi 100 lần, **then** kết quả giống hệt.
12. **Given** chuỗi thao tác bất kỳ, **then** sổ không có ID trùng.
13. **Given** module engine, **then** không import roster, profile, shop, battle (ngoài `ELEMENTS`).
14. **Given** catalog slice, **when** BFS từ starter, **then** tạo được cả ba tướng slice.

### 7.2 Validator catalog

15. **Given** hai công thức cùng khóa `first>second`, **then** lỗi `duplicateKey`.
16. **Given** `A>B` và `B>A` cùng kết quả, **then** lỗi `mirrorSameResult`.
17. **Given** hai node cùng ID, **then** lỗi `duplicateId`.
18. **Given** công thức trỏ tới node không có, **then** lỗi `missingReference`.
19. **Given** công thức ra chính nguyên liệu hoặc ra starter, **then** lỗi `selfResult` / `starterResult`.
20. **Given** node không đạt được từ starter hoặc có vòng, **then** lỗi `unreachable` / `cycle`.
21. **Given** tướng làm nguyên liệu, **then** lỗi `heroAsInput`.
22. **Given** tướng có 0 hoặc ≥ 2 công thức cuối, **then** lỗi `heroRecipeCount`.
23. **Given** `characterId` không có trong roster, **then** lỗi `unknownCharacter`; thiếu chân dung thì cảnh báo.
24. **Given** một tướng đặc biệt có `minCombines` ≥ một tướng lịch sử cùng pack (hoặc thường ≥ đặc biệt), **then** lỗi `tierOrder`.
25. **Given** tướng ngoài khung P-5 của bậc mình, **then** cảnh báo `tierRange`.
26. **Given** tướng lịch sử không có mã nguồn trong sổ nguồn, **then** lỗi `missingHistorySource`.
27. **Given** công thức cuối “hệ của tướng + tri thức nghề của tướng”, hoặc pack không dùng một starter, **then** cảnh báo `elementPlusProfession` / `unusedStarter`.

### 7.3 Chế độ Thường (server)

28. **Given** khách, **when** gọi bất kỳ API của chế độ, **then** `401 loginRequired`.
29. **Given** 1 phiếu, không có lượt dở, **when** mở lượt, **then** còn 0 phiếu, lượt có số lần ghép theo cấu hình (15–20).
30. **Given** 0 phiếu, không có lượt dở, **when** mở lượt, **then** `noTicket`.
31. **Given** lượt dở, **when** mở lượt, **then** trả lượt cũ, không trừ phiếu.
32. **Given** lượt dở, **when** ghép `created` hoặc `noRecipe`, **then** trừ 1 lần ghép; `alreadyKnown`/`invalid` không trừ.
33. **Given** cùng `requestId` gửi hai lần hoặc song song, **then** chỉ trừ một lần, trả cùng kết quả.
34. **Given** ngày mới, **then** có 2 lượt gợi ý; lượt hôm trước không cộng dồn.
35. **Given** gợi ý được trả, **then** không bao giờ chứa đủ hai nguyên liệu kèm thứ tự của một công thức.
36. **Given** đã dùng 2 gợi ý trong ngày, **when** xin thêm, **then** `noHint`.
37. **Given** ghép sai nhiều lần liên tiếp, **then** không có gợi ý tự mở.
38. **Given** mở một tướng lẻ chưa đủ bộ nào, **then** không có thành tựu, không đổi vàng.
39. **Given** mở tướng cuối cùng của bộ hệ Hỏa, **then** mở thành tựu bộ Hỏa một lần, cộng đúng vàng P-21 và huy hiệu; không cộng EXP, đá, roster.
40. **Given** nhận thành tựu hai lần hoặc song song, **then** chỉ cộng vàng một lần.
41. **Given** nhiệm vụ ngày được ghi nhận lại, **then** chỉ cộng 1 phiếu; phiếu không vượt trần 10.

### 7.4 Chế độ Hạng tuần (server)

42. **Given** tuần mới, lần đầu vào chế độ, **then** túi cộng cấp nền P-12 đúng một lần.
43. **Given** túi thiếu đơn vị, **when** ghép, **then** `invalid/lockedInput`, túi không đổi.
44. **Given** ghép thành công, **then** trừ đúng nguyên liệu (`A+A` trừ 2) và cộng 1 kết quả vào kho tuần.
45. **Given** `noRecipe`, **then** nguyên liệu bị tiêu, không hoàn lại.
46. **Given** chế độ Hạng, **when** xin gợi ý, **then** từ chối; ghép không trừ phiếu.
47. **Given** tạo cùng một tướng đề cử hai lần, **then** điểm chỉ cộng một lần.
48. **Given** sang tuần mới, **then** node trung gian tuần cũ bị bỏ, nguyên tố còn dư giữ trong túi, điểm tuần mới từ 0; sổ khám phá giữ nguyên.
49. **Given** danh sách đề cử tuần, **then** giống nhau cho mọi người, đúng số cố định, có ít nhất 1 tướng đặc biệt, và sau một vòng xoay mỗi tướng được đề cử số lần chênh nhau không quá 1.
50. **Given** kỳ của một chế độ theo tuần đã khép, **when** nhận thưởng, **then** cộng vàng và số bó theo P-11 một lần; nhận lại hoặc song song không cộng thêm.
51. **Given** chế độ theo ngày đã khép kỳ, **when** nhận thưởng, **then** chỉ cộng vàng, không cộng bó.
52. **Given** mua bó ở cửa hàng vượt trần tuần, **then** từ chối, không trừ vàng.
53. **Given** client gửi điểm hay tướng tự nhận, **then** server bỏ qua, chỉ tính theo túi và công thức đã ghi.

### 7.5 Phiên bản nội dung

54. **Given** sổ chứa ID không còn trong catalog, **when** đọc, **then** bỏ ID đó, giữ phần còn lại.
55. **Given** `contentVersion` tăng có migration, **when** đọc sổ cũ, **then** mọi tướng đã mở vẫn mở, thành tựu đã nhận không mất.

## 8. Ranh giới với hệ khác

- **Trận Đồ:** engine, route, bảng riêng; chỉ thêm bó nguyên tố vào thưởng hạng Đại trận.
- **Campaign:** không đọc/ghi tiến trình, không reset khi đổi chương; dùng sổ nguồn của Campaign cho nhãn tướng lịch sử.
- **Hồ sơ:** chỉ ghi phiếu, túi nguyên tố, sổ khám phá và thành tựu của chế độ; chỉ đọc tên, nghề, hệ, chân dung tướng.
- **Thưởng hạng các chế độ:** thêm bó nguyên tố cho chế độ theo tuần; không đổi số vàng đã duyệt.
- **Nhiệm vụ và điểm danh:** thêm phiếu; không đổi vàng.
- **Battle Engine:** chỉ dùng `ELEMENTS` và nhãn nghề.

## 9. Roadmap

| Task | Phạm vi |
|---|---|
| LT-01 | Catalog slice 3 tướng (P-30) theo luật có thứ tự, validator mục 7.2, tính `minCombines`/`starterCost` |
| LT-02 | Engine thuần cho Thường và Hạng, test mục 7.1 |
| LT-03 | UI: Vạn Vật Lục, Đài Hợp Nguyên (ô trước/ô sau rõ ràng), Tướng Lục bóng mờ, màn nhắc đăng nhập |
| LT-04 | Server chế độ Thường: phiếu, lượt, gợi ý theo ngày, sổ khám phá, thành tựu bộ, phiếu từ nhiệm vụ/điểm danh; test mục 7.3 |
| LT-05 | Đủ gói 12 tướng; mô phỏng nguồn nguyên liệu để chốt số lần ghép mỗi phiếu, số tướng đề cử và số bó |
| LT-06 | Server Hạng tuần: túi, đề cử xoay vòng, điểm, mùa, bó trong thưởng hạng, cửa hàng (nếu duyệt); test mục 7.4 |
| LT-07 | QA, bật cờ, cập nhật [bảng ai chơi được chế độ nào](../README.md#61-ai-chơi-được-chế-độ-nào-shan-01112026) và [bảng thưởng hạng](../README.md#6-thưởng-vàng-theo-hạng-cuối-kỳ-claude-đặt-01112026-chờ-shan-duyệt) |

## 10. Điều kiện chuyển sang LT-01

- [x] Shan chốt luật chính (mục 3.1, 03/11/2026).
- [ ] Shan duyệt hoặc sửa các dòng ở mục 3.2.
- [ ] Shan trả lời O-2 (danh sách tướng) để LT-01 chọn đúng slice; O-1 và O-3 có thể để tới LT-05/LT-06.
- [ ] Đổi trạng thái file này sang **FROZEN** và ghi vào [changelog](../../decisions/changelog.md).
