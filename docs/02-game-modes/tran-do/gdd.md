# 02 — BINH PHÁP: Game Design Document v0.1

> Cập nhật: 02/11/2026
> Trạng thái: **DRAFT** — concept đã thống nhất (tên hiển thị **Trận Đồ**); bản chơi thử offline đã có code theo [mục 11](#11-bản-triển-khai-đầu-tiên-chơi-thử-offline), các luật đề xuất vẫn chờ Shan chốt ở BP-00.

## 1. Định vị

**Tên:** Binh Pháp · Bày Trận. Một game logic xếp quân trong Reed Banner. Người chơi bày **quân lệnh mang chân dung tướng**, mỗi quân có đúng hai thuộc tính máy kiểm tra: **nghề** và **hệ**. Mục tiêu khai thông toàn bộ ô của sa bàn. Không có đòn đánh, HP, Tinh thần, combo kỹ năng, trang bị, lượt AI, cascade hay phép đổi hai ô match-3.

**Nguồn cảm hứng:** quy tắc placement puzzle của Alchemy Deluxe, không sử dụng asset/logo/code/UI/sfx gốc. Các quân trên màn là nhân vật và văn hóa mỹ thuật của Reed Banner.

## 2. Thuật ngữ và dữ liệu

- **Bàn / board:** lưới ô 2D (đề xuất MVP 8x8), có một tầng lưu `covered` (ô đã khai thông) độc lập tầng quân đang chiếm `occupant`.
- **Quân / piece:** `{pieceId, characterId, profession, element, kind}`. `characterId` để render ảnh; chỉ `profession/element/kind` chi phối luật đặt.
- **Quân thường:** nghề thuộc 6 nghề active, hệ thuộc 7 hệ active; có chân dung nhân vật được chọn qua catalog kiểm soát.
- **Bộ quân / pool:** danh sách quân có thể sinh trong một độ khó, không phụ thuộc tướng tài khoản sở hữu ở MVP.
- **Quân chờ:** quân hiện tại; **Quân kế:** hiển thị hay ẩn là tham số cân bằng (MVP đề nghị chỉ hiện quân hiện tại).
- **Quân Lệnh:** wild; **Thu Hồi:** eraser; **Bỏ Lệnh:** discard làm nóng thanh rủi ro.
- **Trận địa đã khai thông:** `covered=true`; vẫn giữ sau khi xóa quân.

## 3. Luật đặt quân thường — đủ chặt để test

Chọn ô (r,c) trong biên. Ô đó phải trống và hợp lệ.

- Khi bàn **hoàn toàn không có quân**, quân thường có thể đặt vào **bất kỳ ô trống nào**.
- Khi bàn **có từ một quân trở lên**, ô mới phải giáp **ít nhất một quân** theo 4 hướng trên/dưới/trái/phải (không tính chéo).
- Với **từng quân kề** theo 4 hướng, quân mới phải thỏa `sameProfession || sameElement`. Khớp nghề với quân A nhưng khớp hệ với quân B vẫn hợp lệ.
- Nếu có bất kỳ quân kề thường nào không thỏa thì **không** được đặt, dù đã khớp với quân khác.
- Đặt không hợp lệ không tiêu quân/không thay turn hay progress/không gọi RNG, chỉ hiện giải thích UI.
- Khi đặt hợp lệ: tạo occupant, đặt `covered[r][c] = true`, xử lý hàng/cột hoàn tất, cập nhật thanh Bỏ Lệnh, điểm số và sinh quân kế theo thứ tự deterministic. **Quân thường kế tiếp luôn chung ít nhất một nghề hoặc hệ với một quân thường bất kỳ trên bàn** (Shan chốt 02/11/2026; quân neo không cần còn ô trống kề bên nên vẫn có quân liên quan mà không đặt được, để Bỏ Lệnh còn tác dụng; ngoại lệ: có Quân Lệnh hoặc quân dung hợp còn ô trống kề bên thì không ràng buộc; quân đặc biệt ra theo tỉ lệ riêng); vì vậy quân kế phụ thuộc bàn hiện tại, vẫn tất định theo trạng thái.

Ví dụ: trên là Y sư–Kim, trái là Pháp sư–Hỏa ⇒ quân Y sư–Hỏa hợp lệ. Không dùng quan hệ tương sinh/tương khắc làm điều kiện khớp — yếu tố đặc trưng ở đây là **bằng nhau**, dễ học.

## 4. Hàng/cột, đồng thời và điều kiện thắng

- Hàng đủ mọi ô occupant → clear toàn bộ quân hàng đó; cột đủ → clear toàn bộ quân cột đó.
- Nếu hàng và cột đồng thời đầy ở cùng lượt, lấy **hợp union các ô**, chỉ xóa mỗi quân một lần, cộng thành tích đúng một lần/line.
- Không xóa vệt `covered`, không spawn rơi quân hay cascade.
- Sau clear, khi không còn occupant, lượt tiếp theo có thể đặt ở ô bất kỳ, trừ khi đã thắng.
- Thắng khi **mọi ô `covered=true`**. Ưu tiên kiểm tra thắng sau khi đặt/clear trước khi sinh quân mới. Không cần lấp đồng thời tất cả 64 ô.
- Score đề xuất làm biến tham số: điểm cho đặt hợp lệ, hàng/cột, hoàn thành bàn; chưa khóa con số và hệ số cho tới mô phỏng.
- Mỗi ván một bàn được khai thông toàn bộ để thắng MVP; chế độ vô hạn nhiều board/bảng xếp hạng làm sau.

## 5. Rủi ro Bỏ Lệnh / Forge

- Nút **Bỏ Lệnh** bỏ quân hiện tại dù có nước hợp lệ; chuyển sang quân tiếp theo; rủi ro tăng 1.
- Đề xuất v0.1: thanh từ 0 đến 3, **bỏ quân thứ tư liên tiếp khi thanh đầy ⇒ thua**; đặt quân thành công hạ thanh 1 (không âm), hoàn tất line có thể làm nguội về 0. Cách giảm thanh khi clear cần mô phỏng và chốt tại BP-00.
- Nếu quân hiện tại không có nước đặt nào: người chơi được bỏ, không auto-discard ẩn.
- Không nên cho “undo” trong mode tính điểm có thưởng; có thể thêm Undo trong tutorial/offline và đánh dấu không tính xếp hạng.

## 6. Quân đặc biệt (đề xuất mô tả chuẩn, xác suất CHƯA khóa)

- **Quân Lệnh / Wild:** đặt vào ô trống bất kỳ, kể cả không liền kề; quân thường đặt cạnh wild tự động coi wild là khớp. Các quân thường kề khác **vẫn phải** match từng quân. Wild vẫn có thể hoàn tất line và đánh dấu covered.
- **Thu Hồi / Eraser:** đặt lên một ô **đang có quân**, xóa occupant nhưng giữ covered; không coi là quân để hoàn thành line. MVP cần chốt có cho hủy wild hay không (đề nghị có).
- Cả hai xuất hiện trong pool theo xác suất/ràng buộc anti-streak được version hóa; không bán/tiêu vàng để mua trong MVP.
- Không kích hoạt chiến đấu hay kỹ năng tướng khi có wildcard/eraser. Tên hình minh họa và biểu tượng hoàn toàn mới.

## 7. Chế độ con và độ khó

**MVP = Bày Trận (không giới hạn thời gian, offline local prototype, 1 board/run).**
- Gợi ý bước học: tutorial 3x3 với 2 nghề/2 hệ; 5x5 với 3×3; 8x8 đầy đủ nhưng pool nghề/hệ **không** mặc định là 6×7.
- Đề xuất phiên chuẩn 8x8, pool ban đầu 3 nghề × 3 hệ (tối đa 9 kiểu, nhiều chân dung đại diện), mở dần 4×4 và các tập khó hơn.
- **Tốc chiến** (đếm thời gian) và **Thế Trận Định Sẵn** (puzzle authored) là BACKLOG, không hiển thị playable.
- Binh Pháp không phụ thuộc sở hữu tướng; không đọc gear/tier/cấp/điểm kỹ năng để tính hợp lệ.

## 8. Tương tác MVP

- Mỗi quân hiển thị chân dung ở trung tâm, hai icon nghề/hệ ở góc, màu hệ có text/shape dự phòng.
- Click/chạm vào ô hợp lệ để đặt; các ô hợp lệ hiển thị highlight tùy chọn, có nút Bỏ Lệnh / Thu Hồi rõ ràng, meter Bỏ Lệnh và progress covered `n/(w*h)`.
- Hover/focus bất kỳ ô: giải thích không hợp lệ: không kề / sai nghề và hệ / ô bị chiếm.
- Keyboard: di chuyển ô bằng arrows, Enter/Space đặt; Tab tới nút điều khiển; Escape đóng help.
- Mobile: bàn cờ lớn nhất, HUD current piece thu gọn, không cần nhìn đủ tên tướng ở từng ô; tap>=44px cho điều khiển, tránh ép mỗi ô 44px khiến bàn 8x8 tràn khung nhỏ.

## 9. Điều không đưa vào MVP

- Match-3 battle, tác động HP/ATK/SPIRIT, tướng sở hữu ảnh hưởng RNG, shop vật phẩm, PVP real-time, đồng đội, voice/SFX.
- Vàng/đá nhận được bằng client-only score. Chỉ sau khi server xác thực ván và economy review mới có thưởng/BXH.
- Không bắt buộc art mới cho cả 42 cặp nghề×hệ; trước hết ánh xạ portrait sẵn có.

## 10. Danh sách câu hỏi cần Shan sign-off tại BP-00

1. Kích thước chơi chính thức 8×8 hay biến theo cấp (đề xuất 8×8).
2. Giá trị discard cooling: thành công -1, clear row reset 0? (đề xuất như trên).
3. Wild/eraser có trong MVP hay mở ở P1 (đề xuất bao gồm, nhưng bật bằng cấu hình luật).
4. Score weights, difficulty tier, xác suất sinh special, liệu có preview quân kế (đề xuất chưa preview).
5. Offline practice trước hay server-authoritative ngay ngày phát hành (đề xuất prototype offline, production reward server).

**Không giả định các phương án đề xuất này đã được user phê duyệt.**

## 11. Bản triển khai đầu tiên (chơi thử offline)

Tên hiển thị trong game là **Trận Đồ** (đã duyệt tên 26/10/2026); "Binh Pháp" là tên thiết kế. Bản này đi trước BP-00 theo yêu cầu của Shan "đọc docs, thảo luận và triển khai". Các giá trị nằm gọn trong `src/core/binh-phap/rulesets.ts` và `types.ts`. Cột cuối ghi nguồn từng giá trị: **Shan chốt** hoặc **mặc định đề xuất** (chưa duyệt).

| Giá trị | Đang chạy | Nguồn |
|---|---|---|
| Cỡ bàn | Hình chữ nhật `width × height`. Hướng dẫn 3×3; Thường 5×5; Khó 6×6; **Đại trận ngẫu nhiên theo seed, mỗi cạnh 7–10** | Shan chốt 01/11/2026 |
| Ô chướng ngại | Rải ngẫu nhiên theo seed: Hướng dẫn 0%, Thường 8%, Khó 10%, Đại trận 10–16% theo diện tích có trần 72 ô chơi được. Không đặt quân được, không cần khai thông, không nối được hai quân, các ô còn lại luôn liền nhau | Shan chốt có chướng ngại; con số do đo bằng mô phỏng, xem bên dưới |
| Thanh Bỏ Lệnh | 0–3; đặt quân hạ 1; dọn hàng/cột về 0; bỏ khi đã đầy là thua | Giữ như đề xuất (Shan chưa có đề xuất khác); chưa kiểm phương án "dọn hạ 2" |
| Điểm | Đặt 10; +5 mỗi quân kề khớp cả nghề lẫn hệ; mỗi hàng/cột dọn 50; thắng 500 + 100 mỗi vạch Bỏ Lệnh còn trống + 5 mỗi nước nhanh hơn chuẩn (chuẩn = 3 nước × số ô chơi được) | Shan giao "làm hợp lý" 01/11/2026 |
| Quân đặc biệt | Quân Lệnh 8% / Thu Hồi 4% (Đại trận Quân Lệnh 10%); Hướng dẫn không có. Không ra hai quân đặc biệt liên tiếp; không ra Thu Hồi khi bàn trống | Shan không có ý kiến, dùng đề xuất |
| Offline hay server | Chơi thử offline (khách, không thưởng); xếp hạng và thưởng chạy trên server, tắt mặc định | Chơi thử là mặc định đề xuất; xếp hạng và thưởng ở [mục 12](#12-xếp-hạng-và-thưởng-đã-code-mặc-định-tắt) |

**Tùy chỉnh (trong Chơi thường).** Người chơi tự chọn cỡ bàn (cột × hàng 3–10), từng nghề (≥2) và từng hệ (≥2), tỉ lệ Quân Lệnh (≤15%), Thu Hồi (≤10%), nhân vật dung hợp (≤10%, khóa tới khi có nhân vật được duyệt) và chướng ngại (≤30%). Bộ luật nằm trong chính ván (id `tuy-chinh`), engine kiểm giới hạn khi tạo và khi nạp; không thưởng, không xếp hạng, không ghi điểm cao nhất (`customRuleset` ở `src/core/binh-phap/rulesets.ts`).

**Chế độ thường và chế độ xếp hạng.** Trận Đồ có hai chế độ cùng tồn tại. **Chơi thường** (trước đây gọi "chơi thử") chạy offline ở trình duyệt, không cần cờ hay đăng nhập, không thưởng, không xếp hạng, chơi bao nhiêu ván tùy thích với cả bốn bậc kể cả Hướng dẫn, và lưu ván dở tại máy. **Xếp hạng** ([mục 12](#12-xếp-hạng-và-thưởng-đã-code-mặc-định-tắt)) chạy trên server, có thưởng, tắt mặc định; khi tắt, màn Trận Đồ chỉ còn chế độ thường.

**Bốn bậc** (`RULESETS`, id `huong-dan`, `thuong`, `kho`, `dai-tran`):

| Bậc | Cỡ bàn | Nghề × hệ | Chướng ngại | Quân Lệnh / Thu Hồi | Xếp hạng, thưởng |
|---|---|---|---|---|---|
| Hướng dẫn | 3×3 | 2 × 2 | 0% | không có | **Không** (bậc học) |
| Thường | 5×5 | 3 × 4 | 8% | 8% / 4% | Có ([mục 12](#12-xếp-hạng-và-thưởng-đã-code-mặc-định-tắt)) |
| Khó | 6×6 | 4 × 5 | 10% | 8% / 4% | Có |
| Đại trận | **7–10 × 7–10, ngẫu nhiên theo seed** | **8 × 7** (đủ 56 loại) | 10–16%, trần 72 ô chơi được | 10% / 4% | Có |

Mọi cặp nghề–hệ đều có ít nhất một tướng trong danh mục, nên chân dung luôn khớp thuộc tính; quân đặc biệt và chướng ngại dùng biểu tượng vẽ bằng SVG.

**Xạ thủ và Sát thủ.** Hai nghề này đã vào game từ 31/10/2026 (`NEW_PROFESSIONS_ENABLED`, 14 tướng RB-062–075 đều có chân dung), nhưng chỉ **Đại trận** dùng chúng; ba bậc kia giữ 6 nghề cũ để người mới học luật với bộ quân nhỏ. Muốn thêm vào bậc khác chỉ cần thêm `xaThu`/`satThu` vào `professions` của bậc đó và tăng `version`. Trận Đồ không có giá trị riêng cho hai nghề: chúng chỉ là thêm hai loại nghề trong luật "cùng nghề hoặc cùng hệ".

**Cỡ bàn ngẫu nhiên của Đại trận.** Rút từ seed: mỗi cạnh đều trong [7, 10] (nên có 16 cỡ, gồm cả bàn dọc lẫn ngang như 7×10 và 10×7), rồi rải chướng ngại. Số chướng ngại tính theo hai quy tắc, lấy giá trị lớn hơn:

1. **Theo diện tích:** tỉ lệ nội suy từ 10% (7×7) lên 16% (10×10), vì bàn lớn cần nhiều chướng ngại hơn để dọn hàng/cột ngắn lại.
2. **Trần ô chơi được 72:** nếu bàn còn hơn 72 ô chơi được thì tăng chướng ngại cho tới khi còn 72. Lý do: thời lượng ván tỉ lệ với số ô chơi được (khoảng 100 nước ở 60 ô với bot greedy); không có trần thì bàn 10×10 dài hơn 150 nước.

| Cỡ | Diện tích | Chướng ngại | Chơi được |
|---|---|---|---|
| 7×7 | 49 | 5 (10%) | 44 |
| 7×9 | 63 | 7 (11%) | 56 |
| 8×8 | 64 | 8 (13%) | 56 |
| 9×9 | 81 | 11 (14%) | 70 |
| 10×9 | 90 | 18 (20%) | 72 |
| 10×10 | 100 | 28 (28%) | 72 |

Chướng ngại luôn giữ các ô còn lại liền nhau theo 4 hướng (mỗi ô chỉ bị chặn nếu vẫn liền). Chướng ngại tối đa là 28% diện tích nên không bao giờ biến bàn thành mê cung rời rạc. Khi xếp hạng, mọi người chơi cùng seed thì cùng cỡ và cùng bản đồ.

Engine nhận mọi cỡ nên thêm bậc hay chế độ tự chọn cỡ bàn (chơi thường, không xếp hạng) chỉ là thêm một mục trong `RULESETS`.

**Luật chi tiết đã chốt khi code** (mục 3–6 chưa đủ rõ):

- Quân Lệnh kề không miễn kiểm tra các quân kề khác của quân thường đặt sau (đúng mục 6).
- Thu Hồi chỉ đặt lên ô có quân, kể cả Quân Lệnh; không đổi `covered`. Đặt xong tính là một nước thành công (hạ thanh 1, tiến lượt) nhưng không cộng điểm đặt.
- **Chướng ngại:** chỉ sinh trước quân đầu tiên (thứ tự RNG cố định); mỗi ô chỉ bị chặn nếu các ô còn lại vẫn liền nhau theo 4 hướng. Thắng khi khai thông hết *ô chơi được*.
- **Đường kín với chướng ngại:** hàng/cột kín khi mọi ô chơi được của nó đều có quân, nhưng chỉ tính nếu có **từ 3 ô chơi được** (tránh dọn miễn phí ở chỗ chỉ còn 1–2 ô). Chướng ngại không bị dọn.
- Dọn hàng/cột: lấy hợp các ô, mỗi đường tính 50 điểm một lần, rồi mới xét thắng. Thắng được xét trước khi sinh quân mới nên không tiêu RNG.
- Lệnh sai không đổi state, điểm, thanh Bỏ Lệnh hay RNG (kiểm thử `tests/core/binh-phap/engine.test.ts`).
- Không có Undo.

**Code:** `src/core/binh-phap/` (luật, reducer, sinh quân và địa hình, lưu/nạp), `src/app/game/formation/FormationScreen.tsx` (scene `FORMATION`, đường dẫn `/game/formation`), mô phỏng `scripts/binh-phap-sim.ts`. Số đo ở [mục mô phỏng](#kết-quả-mô-phỏng-baseline-01112026). Lưu ván dở ở `localStorage`; đổi bộ luật của một bậc thì save cũ bị bỏ (fail-closed).

### 11.1 Nhân vật dung hợp (kiểu Đinh Ngọc)

Shan (01/11/2026): chỉ giữ loại nhân vật mang **đủ 8 nghề và 7 hệ** như [Đinh Ngọc](../../03-characters/dinh-ngoc.md), **tối đa hai nhân vật**: Đinh Ngọc và **Trần Vũ Phong – Vân Du Tử** (nguồn nhân vật: [Vũ Phong](../../03-characters/vu-phong.md), DRAFT, chưa duyệt). **Chỉ xuất hiện ở bậc Khó và Đại trận** (`FUSION_ALLOWED_LEVELS`); Hướng dẫn và Thường không bao giờ có; không có nhân vật 2 nghề + 2 hệ (hoặc ít hơn tám/bảy) vì làm ván dễ đi. Hạ tầng đã có trong engine. **Đã bật cả hai nhân vật** ở Khó và Đại trận ngày 02/11/2026 theo yêu cầu của Shan (`src/core/binh-phap/specials.ts`, `FUSION_CHARACTERS`); chân dung lấy từ `portrait-data.ts`, tên hiển thị Đinh Ngọc và Vũ Phong. Hai nhân vật chưa vào roster trận đấu, chỉ là quân của Trận Đồ.

- **Quân `fusion`** khớp mọi quân kề. Luật vẫn chỉ dựa trên nghề và hệ.
- **Khác Quân Lệnh:** quân `fusion` vẫn **phải đặt sát một quân** (trừ khi bàn trống) và quân đặt cạnh nó vẫn phải khớp các quân kề khác. Không đặt được ở ô trống xa mọi quân, không đặt đè lên quân khác hay chướng ngại. Hai quân `fusion` đặt cạnh nhau được.
- **Điểm:** không tạo điểm "khớp hoàn hảo" (+5), cả khi đặt lẫn khi làm quân kề của quân thường.
- **Sinh quân:** tung chung với Quân Lệnh/Thu Hồi bằng một lần tung; tỉ lệ `fusionPermille` của bậc, chọn đều giữa các nhân vật được duyệt cho bậc đó (`levels`). Không ra liền sau quân đặc biệt. Danh sách rỗng thì dãy quân y hệt trước khi có tính năng này.
- **Thêm một nhân vật** là thêm một dòng vào `FUSION_CHARACTERS` (id, tên, các bậc); test chặn quá `MAX_FUSION_CHARACTERS = 2`. Sau đó đo lại bằng mô phỏng và tăng `version` của bậc liên quan.
- **Hiển thị:** chân dung kèm số "8" (nghề) ở góc trên-trái và "7" (hệ) ở góc dưới-phải; khung thông tin ghi "Dung hợp mọi nghề và mọi hệ".

**Ảnh hưởng độ khó (Đại trận, 800 ván, một nhân vật dung hợp):**

| Tỉ lệ quân dung hợp | Random thắng | Greedy thắng |
|---|---|---|
| 0% | 6,0% | 31,4% |
| 4% | 13,8% | 42,3% |
| 8% | 25,5% | 51,0% |

Quân này rất mạnh: 4% đã nâng tỉ lệ thắng của greedy khoảng 11 điểm, nên **tỉ lệ phải thấp, đề xuất 1–2%** cho bậc có xếp hạng. `fusionPermille` của Khó và Đại trận đặt 15 (1,5%), chia đều giữa hai nhân vật. Đo lại ngày 02/11/2026 (1.500 ván mỗi ô, `binh-phap-sim.ts`, `version` hai bậc tăng 6→7):

| Bậc / chiến thuật | Trước khi bật | Sau khi bật (hai nhân vật) |
|---|---|---|
| Khó, random | 83,8% | 83,9% |
| Khó, greedy | 97,3% | 97,6% |
| Đại trận, random | 13,4% | 15,5% |
| Đại trận, greedy | 88,9% | 89,1% |

Mức tăng nhỏ (sai số mỗi ô khoảng ±1–2 điểm), chỉ random ở Đại trận nhích đáng kể. Đổi `version` làm ván dở của hai bậc không đọc được nữa và đổi dãy quân theo seed, nên triển khai vào lúc kỳ xếp hạng vừa đổi. Cả hai bậc này đều có xếp hạng và thưởng, nên nhân vật dung hợp sẽ xuất hiện trong ván tính thưởng; vì seed do server phát nên mọi người gặp cùng dãy quân.

*Lịch sử:* cùng ngày, bản đầu của hạ tầng này cho phép quân có tập nghề/hệ bất kỳ; Shan loại bỏ vì làm giảm độ khó, chỉ giữ loại dung hợp đủ 8 nghề, 7 hệ.

## 12. Xếp hạng và thưởng (đã code, mặc định tắt)

Shan (01/11/2026): xếp hạng cao được nhận thưởng; thưởng chia theo mức độ chơi để công bằng; làm phần server. Đã code, **tắt mặc định** sau cờ `FORMATION_RANKED_ENABLED` (chỉ chuỗi `true` mới bật, thiếu hoặc giá trị lạ là tắt). Bảng thưởng đã được Shan duyệt (01/11/2026); việc còn lại trước khi bật ở production là đặt cờ và `SESSION_SECRET`, và chưa có security review chính thức. Code: `src/core/binh-phap/ranked.ts` (kỳ, hạng, thưởng), `src/server/formation.ts` + `src/server/db/formation.ts` + `src/app/api/formation/` (server), `src/app/game/formation/RankedPanel.tsx` (giao diện), bảng `formation_entries` (migration `drizzle/0009_formation_entries.sql`).

**Cách chống gian lận: server giữ ván và áp từng lệnh.** Bản thiết kế đầu định "client chơi rồi gửi nhật ký cho server chạy lại". Đã đổi vì seed phải gửi cho client thì client chạy thử được vô hạn lần trên cùng bàn (luyện trước, chọn nước tối ưu) rồi chỉ nộp ván đẹp nhất. Bản đang chạy:

1. `POST /api/formation/start`: server sinh seed bằng HMAC(`SESSION_SECRET`, bậc, kỳ), nên mọi người trong kỳ cùng bàn, cùng chướng ngại, cùng dãy quân, mà không ai đoán trước được kỳ sau. Seed, trạng thái RNG và **muối** **không bao giờ rời server**. **Muối** (02/11/2026): seed chỉ 32 bit mà bàn cờ (chướng ngại, quân đầu) hiển thị ra, nên người chơi có thể dò ngược mọi seed để tìm đúng seed rồi biết trước toàn bộ dãy quân. Vì vậy ván xếp hạng mang thêm một muối bí mật 128 bit (HMAC khác với seed): địa hình và **từng quân** lấy seed từ băm của (muối, mục đích, số thứ tự lượt) thay vì một dòng RNG 32 bit chạy liên tục; biết bàn cờ và các quân đã ra cũng không suy ra được quân sau. Client chỉ nhận `theme` (một hàm một chiều của muối, dùng chọn bản đồ nền).
2. `POST /api/formation/move`: client gửi lệnh (đặt quân hoặc bỏ lệnh) kèm `seq`; server chạy đúng engine `src/core/binh-phap`, lưu trạng thái mới, trả bản công khai (bàn và quân đang cầm, không seed, không RNG). Lệnh sai không đổi gì; `seq` lệch (gửi trùng, hai tab) bị từ chối kèm ván hiện tại. Mỗi lệnh là không thể hoàn tác và quân kế tiếp chưa ai biết, nên không luyện trước được.
3. Mỗi người **một ván mỗi kỳ mỗi bậc** (chỉ mục duy nhất trong DB). Mở lại thì nối đúng ván cũ, tải lại trang không mất tiến độ và không bày bàn mới. Ván vượt 600 lệnh bị xử thua.
4. Điểm do server tính. Chỉ ván **thắng** có hạng; ván thua không hạng, không thưởng.
5. **Chỉ tài khoản đã đăng nhập mới chơi và nhận thưởng** (Shan chốt 01/11/2026): khách bị chặn ở mọi route (`401 loginRequired`) và cả ở tầng service, không để lại ván nào; khách cũng **không xem bảng** (tổng quan chỉ báo "cần đăng nhập", không có danh sách bậc), và thấy nút "Đăng nhập để chơi". Ván khách đã chơi ở chế độ thường không bị ảnh hưởng.

**Kỳ** (giờ Việt Nam, như Nhật Lệnh): Thường và Khó đổi **theo ngày** lúc 0 giờ; Đại trận đổi **theo tuần** vào thứ Hai 0 giờ. Hướng dẫn không xếp hạng, không thưởng. Hạng: điểm cao hơn, rồi ít nước hơn, rồi nộp sớm hơn.

**Thưởng** (vàng, chia theo bậc chơi; nhận sau khi kỳ khép lại, mỗi ván nhận đúng một lần). Mỗi người nhận đúng một bậc thưởng, bậc cao nhất đủ điều kiện:

| Bậc | Hạng nhất | Top 3 | Top 10 | Nửa trên | Thắng ván |
|---|---|---|---|---|---|
| Thường (ngày) | 150 | 100 | 60 | 30 | 20 |
| Khó (ngày) | 300 | 200 | 120 | 60 | 40 |
| Đại trận (tuần) | 1 000 | 600 | 350 | 150 | 80 |

Hạng tính theo hạng cuối kỳ của người thắng; nửa trên làm tròn lên. **Không đòi số người tối thiểu** (Shan chốt 01/11/2026): bảng ít người vẫn có thưởng, kể cả một mình một bảng thì là hạng nhất. Mốc so với Nhật Lệnh (thắng 150 vàng) và Đấu trường (thắng +50).

**Nhận thưởng** (`POST /api/formation/claim`): chỉ khi kỳ đã khép lại; cờ nhận được đặt bằng một lệnh cập nhật có điều kiện (đúng một bên thắng khi gọi song song) rồi mới cộng vàng vào hồ sơ; cộng vàng hỏng thì hoàn lại cờ để thử lại. Hạng và số người thắng chốt theo trạng thái lúc nhận, vì kỳ đã khép nên không đổi nữa.

**Hạn chế đã biết** (chưa xử lý, ghi để quyết định sau):

- Vì không đòi số người tối thiểu, một tài khoản phụ chơi một mình một bảng vẫn nhận hạng nhất (Đại trận: 1 000 vàng mỗi tuần mỗi tài khoản). Yêu cầu đăng nhập chặn được việc xóa cookie để tạo "khách" mới, nhưng chưa chặn được người đăng ký nhiều tài khoản. Cách giảm còn lại: chỉ tính hạng khi điểm đạt chuẩn (số đo: điểm mỗi ô chơi được của người thắng dao động hẹp, khoảng 65–75 ở Thường, 54–64 ở Khó, 40–47 ở Đại trận, nên ngưỡng điểm chặn được ít).
- Cùng bàn cờ cả kỳ nên người chơi có thể chia sẻ dãy quân cho nhau (như lộ đáp án Nhật Lệnh). Server không chặn được việc người ngoài giải hộ.
- Chưa có giới hạn tốc độ gọi API và chưa có tác vụ cron dọn ván bỏ dở (ván dở của kỳ cũ chỉ nằm im, không có hạng).
- Đổi `version` của bậc thì ván đang chơi của bậc đó không đọc được nữa (nạp fail-closed); phải triển khai vào lúc kỳ vừa đổi.
- Chưa có tab Trận Đồ ở trang `/game/leaderboard`; bảng hiện nằm trong màn Trận Đồ (top 10 mỗi bậc).
- Nhân vật dung hợp (mục 11.1) sẽ xuất hiện trong ván tính thưởng ở Khó và Đại trận khi được bật.

## Mô phỏng cân bằng

Chuyển từ tài liệu QA Binh Pháp (đã xóa 12/11/2026). Chạy lại: `pnpm exec tsx scripts/binh-phap-sim.ts --runs 2000`.

### Kết quả mô phỏng baseline (01/11/2026)

Lệnh: `pnpm exec tsx scripts/binh-phap-sim.ts --runs 2000 --seed 1`. Bốn bậc theo [GDD mục 11](#11-bản-triển-khai-đầu-tiên-chơi-thử-offline): 3×3, 5×5, 6×6, và Đại trận cỡ ngẫu nhiên 7–10. Mỗi ván chạy lại bằng `replay` và so sánh state; 0 nước hợp lệ bị từ chối, 0 lệch replay. Agent *random* chọn ngẫu nhiên trong các ô đặt được (bỏ lệnh khi hết nước); *greedy* ưu tiên nước cho nhiều ô khai thông và điểm nhất, chỉ dùng Thu Hồi khi thanh đã nóng. Người chơi thật nằm quanh hoặc trên greedy, nên số này là **điểm xuất phát**, không phải mục tiêu.

| Bậc | Agent | Thắng | Lượt (trung vị / p90, mọi ván) | Bỏ lệnh TB | Khai thông TB |
|---|---|---|---|---|---|
| Hướng dẫn 3×3 | random | 97,0% | 19 / 32 | 2,5 | 98,8% |
| Hướng dẫn 3×3 | greedy | 97,9% | 10 / 13 | 1,3 | 99,1% |
| Thường 5×5 | random | 86,1% | 56 / 94 | 5,6 | 85,1% |
| Thường 5×5 | greedy | 78,0% | 33 / 44 | 6,5 | 79,7% |
| Khó 6×6 | random | 61,5% | 81 / 146 | 10,9 | 73,6% |
| Khó 6×6 | greedy | 63,9% | 47 / 66 | 8,6 | 64,6% |
| Đại trận 7–10 | random | 6,8% | 82 / 190 | 16,3 | 49,9% |
| Đại trận 7–10 | greedy | 32,5% | 17 / 124 | 11,3 | 35,8% |

**Cách chọn số liệu** (quét 600 ván mỗi cấu hình; bộ sweep chạy bằng script tạm, không nằm trong repo):

- **Núm độ khó chính là số nghề × hệ và thanh Bỏ Lệnh**, không phải cỡ bàn. Với 5×5 và chướng ngại 8%, thanh 2 → 3 vạch đổi tỉ lệ thắng của greedy từ 57% lên 78% (3 nghề × 4 hệ); đổi từ 3×3 lên 4×4 loại quân thì từ 88% xuống 66% (thanh 3). Vì Shan chưa muốn đổi thanh Bỏ Lệnh, các bậc khác nhau chủ yếu ở bộ quân.
- **Chướng ngại rút ngắn hàng/cột nên giúp bot random dọn dễ hơn**, trong khi greedy bị thiệt nhẹ vì đường đi hẹp. Tỉ lệ 10–30% ở Đại trận đổi random từ 12% lên 47% thắng, còn greedy từ 52% xuống 34%. Vì vậy chướng ngại không nên tăng quá nhiều: nó làm kỹ năng ít quan trọng hơn và vẫn rút ngắn ván.
- **Đại trận chọn 8 nghề × 7 hệ, chướng ngại 10–16%** vì cho khoảng cách kỹ năng lớn nhất giữa random (khoảng 2–7%) và greedy (khoảng 33%). Đây là tính chất cần có của bậc xếp hạng. Cấu hình 5 × 5 loại quân dễ hơn nhiều (greedy 67%) nhưng random cũng thắng 49%, tức là kém phân hóa.
- Lỗi cần nhớ khi đo: `transition` tra bộ luật theo `rulesetId` trong `RULESETS`, nên muốn thử một cấu hình khác phải thay thẳng mục trong registry (như script sweep đã làm), không chỉ truyền ruleset vào `createPuzzle`.

Nhận xét: bốn bậc tăng độ khó đúng chiều; Thường và Khó chưa tách bằng chiến thuật (greedy chỉ ngang random). Cần agent mạnh hơn (lookahead) trước khi chốt. Độ dài Đại trận phụ thuộc cỡ bàn và nằm khoảng 100 nước (trung vị, ván thắng) với bot greedy, nhờ trần 72 ô chơi được.

### Đo lại sau khi đổi luật sinh quân (02/11/2026)

Shan chơi thử Đại trận thấy 5 lượt đầu ra 5 quân không dính gì nhau phải bỏ hết; sau bản dùng xác suất 65–80% vẫn gặp quân Sát thủ Thổ khi trên bàn không có Sát thủ hay Thổ nào. Luật chốt: khi bàn có quân thường, quân thường mới **luôn** chung ít nhất một nghề hoặc hệ với một quân thường **bất kỳ** trên bàn. Quân neo **không cần còn ô trống kề bên** (ưu tiên ô trống thì quá dễ), nên vẫn có quân liên quan mà không đặt được và Bỏ Lệnh còn tác dụng. **Ngoại lệ duy nhất**: có Quân Lệnh hoặc quân dung hợp còn ô trống kề bên thì quân mới không bị ràng buộc (đặt cạnh quân đó được). Quân đặc biệt ra theo tỉ lệ riêng. Bộ luật các bậc tăng `version` (save cũ bị bỏ). Đã thử xác suất liên quan 450–1000‰ rồi bỏ khái niệm đó.

Đo `--runs 1000 --seed 1`:

| Bậc | Agent | Thắng | Lượt (trung vị / p90) | Bỏ lệnh TB |
|---|---|---|---|---|
| Hướng dẫn | random / greedy | 100% / 100% | 17/30 · 9/9 | 0,13 / 0,00 |
| Thường | random / greedy | 95,1% / 99,3% | 55/89 · 28/42 | 2,96 / 1,76 |
| Khó | random / greedy | 85,0% / 97,5% | 87/141 · 44/63 | 7,82 / 3,46 |
| Đại trận | random / greedy | 13,6% / 88,4% | 121/220 · 95/123 | 20,05 / 9,18 |

Trước khi đổi luật (01/11): Khó 62% / 64%, Đại trận 7% / 33% (random / greedy). Ván dễ hơn khá nhiều vì ít phải bỏ quân. Núm bù không đụng thanh Bỏ Lệnh: tăng chướng ngại, bớt Quân Lệnh, thêm nghề/hệ (nhưng quân liên quan luôn có nên đây là hướng yếu). Cần Shan chọn độ khó mục tiêu cho từng bậc xếp hạng, xem [câu hỏi mở](../../09-roadmap/cau-hoi-mo.md).
