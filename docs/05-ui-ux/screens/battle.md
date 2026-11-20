# Giao diện

> Cập nhật: 17/11/2026
> Trạng thái: **IMPLEMENTED**

## 1. Bố cục màn hình trận đấu

Bố cục **ngang** (landscape), cả trên desktop lẫn điện thoại xoay ngang.

```
┌───────────────────────────────────────────────────────────────────┐
│ [Khung phe mình]        [Lượt của bạn · 30]        [Khung đối thủ] │
│                    ┌──────────────────────────┐                     │
│ [Kỹ năng] [Túi đồ] │                          │                     │
│                    │   Bàn cờ 12 cột × 8 hàng  │                     │
│                    │                          │                     │
│   (nhân vật mình)  └──────────────────────────┘   (nhân vật đối thủ) │
└───────────────────────────────────────────────────────────────────┘
```

- **Giữa:** bàn cờ 12×8.
- **Trên cùng, giữa:** báo lượt của ai ("Lượt của bạn" / "Lượt đối thủ") và đồng hồ đếm ngược 30 giây. Là một dải mảnh (chữ cỡ chú thích, vạch 4px, rộng tối đa 28rem) để không lấn bàn cờ.
- **Tên phe:** cột trái ghi "Phe bạn", cột phải ghi "Đối thủ" (tên AI Tianwu chỉ ở trang giới thiệu).
- **Bị động** không hiện trong trận; mô tả bị động chỉ đọc ở thẻ nhân vật trong Doanh Trại. Thanh kỹ năng trong trận chỉ có các nút kỹ năng.
- **Hết trận:** chỉ còn kết quả trên bàn cờ, không hiện khối đội hình 3vs3 bên dưới. Màn trận không có nhật ký trận.
  - Trận thuộc một chế độ (Tháp Thiên Mệnh, Thí Luyện, Viễn Chinh, Trấn Ải, Nhật Lệnh, Quần Hùng, Bình Loạn) chỉ có nút quay về màn của chế độ đó; nút "Nâng kỹ năng & đánh tiếp" (mở sảnh Giao Tranh) chỉ còn ở trận Giao Tranh và Thao Luyện thường.
  - Tháp Thiên Mệnh có lớp kết quả riêng (`DestinyResult`): tầng vừa vượt hoặc gục trên tổng số tầng, dải tiến độ tháp, số lượt, Đá Cường Hóa mốc vừa nhận, máu còn lại của ba tướng ra trận và một nút "Chọn thưởng tầng N" (thua hoặc hoàn thành tháp thì "Về Tháp Thiên Mệnh"). Không ghi kinh nghiệm, vàng hay đồ rơi vì chế độ này không có.
- **Độ khó:** chỉ trận offline (Thao Luyện) có ô chọn độ khó ở thanh đầu trận. Trận online do máy chủ chốt độ khó lúc dựng nên không hiện ô này.
- **Góc trên trái / phải:** khung từng nhân vật của mỗi phe: tên, cấp, thanh máu, thanh năng lượng, thanh nộ (chỉ ở thủ lĩnh), biểu tượng hiệu ứng trạng thái (ảnh tròn `public/art/effects/`, viền vàng có lợi, đỏ thẫm bất lợi) kèm số nhỏ ở góc: số lượt còn lại, riêng Khiên là lượng hấp thụ.
  - 1vs1: mỗi bên một khung.
  - 3vs3: mỗi bên ba khung xếp dọc; khung của người hành động được làm sáng; chạm vào khung để đổi người hành động.
- Lương thực của mỗi phe hiển thị cạnh khung của phe đó.
- **Bên trái:** nút **Kỹ năng** (mở danh sách kỹ năng của người hành động, kỹ năng thiếu năng lượng bị làm mờ) và nút **Túi đồ**.
- **Dưới hai bên:** hình nhân vật của hai phe, có animation đánh và trúng đòn.
- **Thông báo nổi** giữa bàn cờ, ví dụ "Không đủ năng lượng (0/25)".

Ảnh tham khảo bố cục do Shan gửi ngày 18/10/2026 chỉ dùng để định hướng bố cục. Theo nguyên tắc clean-room, không đưa ảnh hay asset của game khác vào repo.

## 2. Điều khiển

Ba cách điều khiển dùng song song; người chơi đổi qua lại bất cứ lúc nào, không cần vào cài đặt.

### 2.1 Vuốt / kéo
- Vuốt (điện thoại) hoặc kéo chuột (máy tính) từ một ô sang ô kề để đổi chỗ.

### 2.2 Click / chạm để chọn
- Click ô thứ nhất: ô được **làm sáng**.
- Click một ô **kề** ô đang sáng: hai ô đổi chỗ.
- Click một ô **không kề**: chuyển ô sáng sang ô mới.
- Click lại ô đang sáng: bỏ chọn.
- Click chân dung nhân vật (3vs3) để đổi người hành động; click nút kỹ năng rồi click mục tiêu hoặc ô trên bàn để dùng kỹ năng.

### 2.3 Bàn phím

| Phím | Tác dụng |
|---|---|
| ← ↑ → ↓ hoặc W A S D | Di chuyển con trỏ trên bàn cờ |
| Enter hoặc Space | Chọn ô dưới con trỏ (ô được làm sáng) |
| Mũi tên khi đã chọn ô | Đổi ô đang chọn với ô kề theo hướng đó |
| Esc | Bỏ chọn ô, hoặc hủy kỹ năng đang ngắm |
| Tab / Shift+Tab | Chuyển người hành động sang người kế tiếp / trước đó (3vs3) |
| 1 – 6 | Chọn kỹ năng chủ động 1 – 6 của người hành động |

- **Ngắm kỹ năng bằng bàn phím:** sau khi chọn kỹ năng, ← → đổi mục tiêu (đồng đội hoặc đối thủ) rồi Enter để dùng. Kỹ năng có vùng trên bàn cờ thì con trỏ chuyển vào bàn, di chuyển để chọn tâm rồi Enter. Kỹ năng lốc xoáy (hệ Phong) chọn tâm bằng con trỏ và Enter, rồi Q xoay ngược, E xoay theo chiều kim đồng hồ (giữ Shift để xoay 2 nấc).
- **Nhân vật dung hợp (Minh Nguyệt, Vũ Phong):** thẻ nhân vật dùng hai biểu tượng riêng (`tongHop` trong code) với tên hiển thị **Vạn nghề** và **Vạn hệ**, thay cho biểu tượng nghề và hệ thường. Vì biểu tượng Vạn hệ không cho biết khắc chế, biểu tượng **hệ phòng thủ** nhỏ nằm ở góc dưới biểu tượng Vạn hệ (biểu tượng Vạn nghề không có biểu tượng phụ); thẻ không ghi thêm chữ cho gọn, tooltip giải thích hệ phòng thủ (quyết định khắc chế) và liệt kê bốn nội tại. Ở Doanh Trại, khung "Bộ 6 chủ động · 4 nội tại dung hợp" liệt kê Nội tại 1–4 kèm mô tả đầy đủ; chiêu của họ ghi "Chiêu dung hợp · đòn hệ X" (ô4: "Tuyệt chiêu nhân vật · đòn hệ X") vì hệ của đòn khác hệ phòng thủ. Nhân vật thường giữ nhãn Nghề 1/Nghề 2/Hệ 1/Hệ 2 như cũ. Mã: `FighterKindIcons.tsx`, `special-labels.ts`, `SkillDetails.tsx` trong `src/app/game/battle/`; tên hiển thị đổi ở `FUSION_PROFESSION_NAME`/`FUSION_ELEMENT_NAME`.
- **Chọn và xem trước lốc xoáy (kiểu xoay vòng, Shan 20/11/2026):** bấm kỹ năng có bước xoay (chiêu hệ Phong, ô1 và ô6 của Vũ Phong) hoặc dùng lượt xoay miễn phí của bị động Phong. **Chỉ xoay theo chiều kim đồng hồ.** Chuột: rê lên bàn cờ, ô không sát mép dưới con trỏ làm tâm tạm, một vòng tròn mũi tên xoay chậm (`WhirlRing` trong `BoardCells.tsx`) phủ 8 ô quanh, các ô trong vòng hiện trước vị trí sau khi xoay 1 nấc và ô sẽ ghép viền vàng; bấm là xoay ngay. Cảm ứng: chạm lần đầu chọn tâm và xem trước, chạm lại đúng tâm để xoay; nút ↻ (và ↻ ×2 khi kỹ năng cho 2 nấc) ghi sẵn số ô sẽ ghép. Bàn phím: Enter xoay quanh ô con trỏ, khi đã có tâm thì E một nấc, Shift+E hai nấc. Với kỹ năng còn phải chọn mục tiêu (ô1 ở 3vs3), vòng xoay được giữ viền và dòng nhắc "Đã chọn xoay …" hiện cùng lời nhắc chọn đối thủ. Esc hủy. Luật lõi vẫn cho xoay hai chiều (AI dùng); chỉ giao diện người chơi giới hạn chiều kim đồng hồ. Phần tính xem trước là `previewWhirl` trong `src/core/board/resolve.ts`.
- Con trỏ bàn phím là một khung viền rõ trên ô; tự ẩn khi người chơi dùng chuột hoặc chạm, hiện lại khi bấm phím.
- Đồng hồ 30 giây áp như nhau cho mọi cách điều khiển.

> TODO: cho phép đổi phím trong cài đặt hay không; phím tắt cho nút Túi đồ và xem chi tiết sát thương.

### 2.4 Thu phóng bàn cờ (Shan 20/11/2026)
Thu phóng riêng bàn cờ, khác thu phóng cả trang của trình duyệt: chỉ ô cờ to/nhỏ, phần còn lại của màn giữ nguyên. Áp cho bàn match-3 (mọi chế độ đánh), Khai Lộ, Sử Lộ (bàn giao tranh boss) và Do Thám.
- Hàng nút **− 100% +** ở mép phải phía trên bàn; mỗi nấc 10 %, từ 60 % đến 160 %; bấm số phần trăm để về 100 %.
- Máy tính: Ctrl (⌘ trên Mac) + cuộn chuột, hoặc chụm hai ngón trên bàn di chuột, khi con trỏ ở trên bàn.
- Điện thoại: chụm/mở hai ngón trên bàn; hai ngón kéo để dời khi bàn to hơn khung. Một ngón vẫn là vuốt đổi ô; lần nhấc ngón sau khi chụm không tính là vuốt.
- Bàn to hơn cột thì khung quanh bàn cuộn được. Mức chọn nhớ riêng từng loại bàn trên trình duyệt (`localStorage`, khóa `colau.boardZoom.<bàn>.v1`).
- Mã: `src/app/game/board-zoom/` (`BoardZoomControls`, `BoardZoomViewport` đặt biến CSS `--board-zoom`; bàn nhân cỡ ô với biến này).

## 3. Nguyên tắc chung

- Responsive cho desktop và mobile; đổi ô bằng vuốt, click chọn hoặc bàn phím (mục 2).
- Animation ghép ô, cascade, phá ô do kỹ năng, hiệu ứng chiến đấu, âm thanh.
- Thông báo sát thương rõ ràng (xem [Công thức](../../01-gameplay/tai-nguyen-cong-thuc.md#4-công-thức-sát-thương)).
- Mỗi hiệu ứng trạng thái là một biểu tượng trên chân dung, kèm số lượt còn lại.
- Tỉ lệ ô của màn hiển thị trước trận bằng thanh màu nhỏ.
- Phong cách hình ảnh, bảng màu và yêu cầu cho họa sĩ: xem [Hình ảnh](../../06-art/art-bible.md).
- Danh mục trên `/games` của ShanVerse: **Puzzle & Logic**.

## 4. Trợ giúp Song Tháp

Màn Trial/Destiny phải giải thích luật cấm/bắt buộc trước khi khóa đội, disable tướng không hợp lệ kèm lý do,
và giữ Đinh Bộ Lĩnh ở active slot thủ lĩnh. Trạng thái loading/error/locked/claimed phải đọc được bằng bàn phím,
touch và screen reader; nút settlement bị khóa trong lúc request đang chờ. UI chỉ đổi số dư hoặc hiện “đã nhận”
sau response thành công từ server.

**Ngôi sao khắc chế (★):** ở mọi màn chuẩn bị trận đã biết đối thủ, tướng có hệ khắc ít nhất một đối thủ được gắn ★ xanh
cạnh tên (chú thích ghi khắc ai). Áp dụng ở Tháp Thiên Mệnh (tướng ra trận, Đinh Bộ Lĩnh và hàng chọn Hệ), Thí Luyện,
Viễn Chinh (theo trận ở ô đang chọn), Trấn Ải (đợt kế), Nhật Lệnh và sảnh Giao Tranh; Bình Loạn đánh dấu theo thủ lĩnh
địch như trước. Component dùng chung: `src/app/game/art/CounterStar.tsx`.

Nội dung trợ giúp, reset giờ Việt Nam và bảng đá canonical cho người chơi nằm tại
[Song Tháp cho người chơi](../../02-game-modes/dual-tower/player-help.md).
