# Giao diện

> Cập nhật: 02/11/2026

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
- **Trên cùng, giữa:** báo lượt của ai ("Lượt của bạn" / "Lượt đối thủ") và đồng hồ đếm ngược 30 giây.
- **Góc trên trái / phải:** khung từng nhân vật của mỗi phe: tên, cấp, thanh máu, thanh năng lượng, thanh nộ (chỉ ở thủ lĩnh), biểu tượng hiệu ứng trạng thái kèm số lượt còn lại.
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
- **Nhân vật dung hợp (Đinh Ngọc, Vũ Phong):** thẻ nhân vật dùng hai biểu tượng riêng (`tongHop` trong code) với tên hiển thị **Vạn nghề** và **Vạn hệ**, thay cho biểu tượng nghề và hệ thường. Vì biểu tượng Vạn hệ không cho biết khắc chế, thẻ ghi thêm chữ "Phòng thủ Phong" (hệ phòng thủ, quyết định khắc chế); tooltip giải thích và liệt kê bốn nội tại. Khung "Bộ 6 chủ động · 4 nội tại dung hợp" liệt kê Nội tại 1–4 kèm mô tả đầy đủ; chiêu của họ ghi "Chiêu dung hợp · đòn hệ X" (ô4: "Tuyệt chiêu nhân vật · đòn hệ X") vì hệ của đòn khác hệ phòng thủ. Nhân vật thường giữ nhãn Nghề 1/Nghề 2/Hệ 1/Hệ 2 như cũ. Mã: `FighterKindIcons.tsx`, `special-labels.ts`, `SkillDetails.tsx` trong `src/app/game/battle/`; tên hiển thị đổi ở `FUSION_PROFESSION_NAME`/`FUSION_ELEMENT_NAME`.
- **Chọn và xem trước lốc xoáy:** bấm kỹ năng có bước xoay (chiêu hệ Phong, ô1 và ô6 của Vũ Phong), rồi chạm một ô không sát mép làm tâm; chạm ô mép hiện lời nhắc, chạm lại tâm để bỏ. Vòng 8 ô quanh tâm viền xanh. Mỗi nút xoay (↺, ↻, thêm ×2 khi được 2 nấc) ghi sẵn **số ô sẽ ghép ngay** ("ghép 3" hoặc "không ghép"); rê chuột hoặc focus vào nút để xem vòng 8 ô sau khi xoay và các ô sẽ ghép viền vàng (chưa đổi bàn cờ). Với kỹ năng còn phải chọn mục tiêu (ô1 ở 3vs3), sau khi chọn chiều xoay vòng xoay vẫn được giữ viền và dòng nhắc "Đã chọn xoay …" hiện cùng lời nhắc chọn đối thủ. Esc hủy ở mọi bước. Phần tính xem trước là `previewWhirl` trong `src/core/board/resolve.ts` (hàm thuần, có test).
- Con trỏ bàn phím là một khung viền rõ trên ô; tự ẩn khi người chơi dùng chuột hoặc chạm, hiện lại khi bấm phím.
- Đồng hồ 30 giây áp như nhau cho mọi cách điều khiển.

> TODO: cho phép đổi phím trong cài đặt hay không; phím tắt cho nút Túi đồ và xem chi tiết sát thương.

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

Nội dung trợ giúp, reset giờ Việt Nam và bảng đá canonical cho người chơi nằm tại
[Song Tháp cho người chơi](../../02-game-modes/dual-tower/player-help.md).
