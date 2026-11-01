# 02 — BINH PHÁP: Game Design Document v0.1

> Cập nhật: 01/11/2026
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
- Khi đặt hợp lệ: tạo occupant, đặt `covered[r][c] = true`, xử lý hàng/cột hoàn tất, cập nhật thanh Bỏ Lệnh, điểm số và sinh quân kế theo thứ tự deterministic.

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
| Offline hay server | Offline, khách, không thưởng, không xếp hạng | Mặc định đề xuất; xếp hạng và thưởng ở [mục 12](#12-xếp-hạng-và-thưởng-thiết-kế-chưa-có-code) |

**Bốn bậc** (`RULESETS`, id `huong-dan`, `thuong`, `kho`, `dai-tran`):

| Bậc | Cỡ bàn | Nghề × hệ | Chướng ngại | Quân Lệnh / Thu Hồi | Xếp hạng, thưởng |
|---|---|---|---|---|---|
| Hướng dẫn | 3×3 | 2 × 2 | 0% | không có | **Không** (bậc học) |
| Thường | 5×5 | 3 × 4 | 8% | 8% / 4% | Có (thiết kế ở [mục 12](#12-xếp-hạng-và-thưởng-thiết-kế-chưa-có-code)) |
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

**Code:** `src/core/binh-phap/` (luật, reducer, sinh quân và địa hình, lưu/nạp), `src/app/game/formation/FormationScreen.tsx` (scene `FORMATION`, đường dẫn `/game/formation`), mô phỏng `scripts/binh-phap-sim.ts`. Số đo ở [05 — mô phỏng và QA](05-binh-phap-balance-qa.md#kết-quả-mô-phỏng-baseline-01112026). Lưu ván dở ở `localStorage`; đổi bộ luật của một bậc thì save cũ bị bỏ (fail-closed).

## 12. Xếp hạng và thưởng (thiết kế, chưa có code)

Shan (01/11/2026): xếp hạng cao được nhận thưởng; thưởng chia theo mức độ chơi để công bằng. Các điểm dưới đây là **đề xuất** để Shan chốt; không có số nào đã chạy. Làm ở BP-05/BP-06, sau khi BP-00 chốt luật.

**Công bằng bắt buộc.** Điểm do client báo thì không tin được, và seed do client chọn thì chọn được ván dễ. Vì vậy:

1. **Seed do server phát** theo bậc và theo kỳ, giống [Thử thách hằng ngày](../README.md#51-thử-thách-hằng-ngày-claude-đặt-20102026-chờ-shan-duyệt): mọi người chơi cùng một bàn, cùng chướng ngại, cùng dãy quân trong kỳ đó. Chướng ngại và quân đều sinh từ seed nên khớp nhau.
2. **Client gửi nhật ký lệnh** (`place r,c` hoặc `discard`); server chạy lại bằng đúng engine `src/core/binh-phap` (đã có `replay`), tự tính điểm, từ chối nhật ký có lệnh sai hoặc quá dài. Điểm hiển thị là điểm server tính.
3. **Mỗi người một lượt tính điểm mỗi kỳ và mỗi bậc** (server ghi chỗ trước khi bày bàn, như Nhật Lệnh). Chơi tiếp ngoài lượt đó vẫn được nhưng không lên bảng, không thưởng.
4. Hạng thắng bằng điểm; bằng điểm thì ít nước hơn, rồi nộp sớm hơn.

**Kỳ:** đề xuất bảng theo **ngày** (đổi 0 giờ giờ Việt Nam, như Nhật Lệnh) cho Thường và Khó, và bảng theo **tuần** (thứ Hai 0 giờ) cho Đại trận. Hướng dẫn là bậc học, không xếp hạng, không thưởng.

**Thưởng chia theo bậc** (vàng, đề xuất; mốc so với Nhật Lệnh thắng 150 vàng và Đấu trường thắng +50). Nhận một lần mỗi kỳ, theo hạng chốt lúc đổi kỳ:

| Bậc | Hạng 1 | Hạng 2–3 | Top 10 | Top 50% | Tham gia và thắng |
|---|---|---|---|---|---|
| Thường (ngày) | 150 | 100 | 60 | 30 | 20 |
| Khó (ngày) | 300 | 200 | 120 | 60 | 40 |
| Đại trận (tuần) | 1 000 | 600 | 350 | 150 | 80 |

Thắng ván tính điểm mới được nhận thưởng "Tham gia và thắng"; thua thì không tính hạng. Thưởng đi qua cùng biên nhận idempotent như thưởng Campaign (không phát hai lần, nhận qua server). Bảng nằm cùng trang `/game/leaderboard`, thêm tab Trận Đồ có chọn bậc. Cần thêm: bảng DB (`formation_entries`: kỳ, bậc, người chơi, điểm, nước, nhật ký) và cờ tính năng server mặc định tắt. Phần này thuộc [BP-05/06](07-implementation-roadmap.md), cần review kinh tế và chống gian lận như [05 mục T4](05-binh-phap-balance-qa.md).
