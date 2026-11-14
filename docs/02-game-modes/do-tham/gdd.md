# Do Thám: giải đố dò bẫy trên sa bàn

> Cập nhật: 13/11/2026
> Trạng thái: **IMPLEMENTED (bản chơi thử)** — Shan đồng ý ý tưởng và chốt tên **Do Thám**, ba bậc, bàn suy luận được ngay từ bản đầu, có đạo cụ nguyên tố, tranh thẻ vẽ riêng (13/11/2026). Bản chơi thử offline đã có code; thưởng, xếp hạng và phát lại trên server chưa làm.

## 1. Định vị

Mini game giải đố một người trên lưới ô. Một số ô giấu **bẫy**; bạn mở từng ô, suy ra ô nào có bẫy từ các con số, rồi mở hết mọi ô an toàn mà không chạm bẫy.

- Thể loại: "dò mìn" (Minesweeper, thập niên 1960 đến nay). Làm clean-room như Khai Lộ: không dùng tên, hình, âm thanh hay số liệu của game gốc.
- Khác các chế độ không đánh nhau đang có: không xóa khối như [Khai Lộ](../khai-lo/gdd.md), không đặt quân như [Trận Đồ](../tran-do/gdd.md), không ghép công thức như [Tầm Tướng Ký](../tam-tuong-ky/design-freeze.md). Đây là bài toán **suy luận có thông tin một phần**.
- Mỗi ván là một bài toán tất định theo seed (qua `src/core/rng.ts`), nên sau này phát lại được trên server để chấm điểm.

## 2. Chủ đề (hợp bối cảnh thế kỷ X)

- Không dùng chữ "mìn" vì lệch thời. Trên màn hình dùng **bẫy**: hố chông, chông tre, hầm bẫy. Con số trên ô là **số bẫy ở các ô quanh nó**.
- Dấu đánh dấu bẫy là **cờ lau**, trùng biểu tượng của game.
- Bàn cờ là **sa bàn**: bãi lau, ruộng, lũy tre. Ô chưa mở là đất phủ lau; ô đã mở lộ nền đất. Tranh nền và biểu tượng vẽ SVG, tranh thẻ vẽ sau.
- Thua là "sa bẫy": các bẫy còn lại lộ ra, bẫy vừa chạm đánh dấu đỏ.

## 3. Luật chơi

### 3.1. Bàn và bẫy

- Bàn hình chữ nhật `cột × hàng`, mỗi ô thuộc đúng một trạng thái: **chưa mở**, **đã mở**, **cắm cờ**.
- Số bẫy cố định theo bậc (mục 4). Bẫy đặt ngẫu nhiên theo seed, **sau nước mở đầu tiên**.
- **Nước đầu luôn an toàn:** ô đầu tiên bạn mở và 8 ô quanh nó không có bẫy, nên nước đầu luôn lan ra một vùng trống.

### 3.2. Mở ô

- Mở ô có bẫy: thua.
- Mở ô an toàn: hiện **số bẫy trong 8 ô xung quanh** (kể cả đường chéo), từ 0 đến 8.
- Số 0: tự mở lan sang mọi ô kề (và tiếp tục nếu ô kề cũng là 0).
- **Mở nhanh:** chạm vào ô đã mở có số n mà quanh nó đã cắm đúng n cờ thì mở nốt các ô chưa mở còn lại quanh nó. Nếu cắm sai cờ thì có thể mở trúng bẫy, như luật gốc.

### 3.3. Cờ lau

- Cắm hoặc gỡ cờ trên ô chưa mở. Ô có cờ không mở được cho tới khi gỡ cờ.
- Bộ đếm "còn lại" = số bẫy trừ số cờ đã cắm (có thể âm nếu cắm thừa).
- Không có dấu hỏi (`?`) ở bản đầu.

### 3.4. Thắng và thua

- **Thắng:** mở hết mọi ô không có bẫy. Các bẫy còn lại tự cắm cờ.
- **Thua:** mở trúng bẫy. Hiện toàn bộ bẫy, cờ cắm sai đánh dấu gạch chéo.
- Đồng hồ chạy từ nước đầu tiên đến lúc thắng hoặc thua. Dừng khi rời trang (như Khai Lộ).

## 4. Bậc độ khó (đề xuất, chờ Shan chốt)

| Bậc | Cỡ bàn | Số bẫy | Mật độ |
|---|---|---|---|
| Nhập môn | 9 × 9 | 10 | 12% |
| Thường | 16 × 16 | 40 | 16% |
| Khó | 30 × 16 | 99 | 21% |
| Tùy chọn | cột 8–30, hàng 8–24 | tối đa 35% số ô trừ vùng an toàn đầu | chọn tay; bản đầu có thể để sau |

Ba bậc đầu theo cỡ kinh điển, người chơi đã quen. Chỉ **bậc Nhập môn và Thường** nên có ở bản đầu nếu muốn gọn.

## 5. Điều khiển

| Thiết bị | Mở ô | Cắm cờ lau | Mở nhanh |
|---|---|---|---|
| Máy tính (chuột) | Bấm trái | Bấm phải | Bấm vào ô số đã đủ cờ |
| Điện thoại | Chạm | Chạm giữ, hoặc bật nút chế độ cờ rồi chạm | Chạm vào ô số đã đủ cờ |
| Bàn phím | Mũi tên di chuyển tiêu điểm, Enter hoặc Space mở | F cắm cờ | Enter trên ô số |

Ô co theo bề rộng màn hình như Khai Lộ; bậc Khó (30 cột) cần cuộn ngang hoặc thu nhỏ trên điện thoại, nên cần thử trên máy thật.

## 6. Kiến trúc dự kiến

- **Lõi:** `src/core/do-tham/` thuần TypeScript, không đọc đồng hồ: bàn sinh sau nước đầu từ `seed + ô đầu`, hàm mở ô, mở lan, mở nhanh, cắm cờ, kiểm tra thắng thua. Test ở `tests/core/do-tham/`.
- **Màn chơi:** phân cảnh `DO_THAM` (tên hiển thị "Do Thám", slug `scout`), `src/app/game/do-tham/`. Thêm vào `scene.ts`, `MODE_TEXT`, `MODE_INFO`, thẻ ở Chiến Trường và thẻ Hướng dẫn ở `modeGuides.ts` (test `mode-guides` sẽ đòi mười một chế độ).
- **Lưu trữ bản đầu:** ván dở và thời gian tốt nhất mỗi bậc ở `localStorage` (`reed-banner:do-tham:*`), không cần đăng nhập, không thưởng, như Khai Lộ.
- **Văn phong:** theo [Văn phong giao diện](../../00-overview/thuat-ngu.md#văn-phong-giao-diện); tên chế độ hoa mọi chữ (Do Thám), nhãn nút chỉ hoa chữ đầu.

## 7. Lộ trình

**Bước 1, bản chơi thử** (cỡ tương đương bản đầu của Khai Lộ):
- Thiết kế này được Shan chốt tên, bậc và luật.
- Lõi luật có test (nước đầu an toàn, mở lan, mở nhanh, thắng thua, seed lặp lại được).
- Màn chơi đủ điều khiển chuột, chạm, bàn phím; tôn trọng `prefers-reduced-motion`.
- Hướng dẫn trong thẻ Hướng dẫn; thẻ ở Chiến Trường (tranh tạm).
- Chưa thưởng, chưa xếp hạng, khách chơi được.

**Bước 2, thưởng và xếp hạng** (chỉ làm sau khi Shan duyệt):
- **Server phát lại:** gửi chuỗi nước đi, server dựng lại bàn từ seed và kiểm tra rồi mới ghi thời gian. Không tin đồng hồ ở trình duyệt.
- **Bàn giải được bằng suy luận** ("không phải đoán mò"): cần bộ giải để sinh bàn, bắt buộc cho bảng xếp hạng cho công bằng.
- **Đề ngày** (một seed chung, kiểu Nhật Lệnh) và bảng theo bậc, cần đăng nhập.
- **Thưởng vàng** theo mốc hoặc nhiệm vụ ngày; số liệu do Shan duyệt.
- Bật bằng cờ tính năng như các chế độ xếp hạng khác.

## 8. Quyết định của Shan (13/11/2026)

- **Tên:** Do Thám (trên giao diện hoa mọi chữ, tên chế độ; mô tả ngắn viết "do thám").
- **Bậc:** đủ ba bậc ở bản đầu: Nhập môn 9×9 với 10 bẫy, Thường 16×16 với 40 bẫy, Khó 30×16 với 99 bẫy. Bậc Tùy chọn để sau.
- **Bàn suy luận được ngay từ bản đầu:** bàn chỉ được dùng khi người dò chỉ cần suy luận từ nước đầu là mở hết ô an toàn (bộ giải ở `deduce`, `isGuessFree`). Đo ngày 13/11/2026: Nhập môn và Thường sinh trong vài mili giây, Khó khoảng 10 mili giây trung bình (tối đa 20), không có bàn nào hết số lần thử.
- **Có đạo cụ nguyên tố:** mang tối đa hai, mỗi cái dùng một lần (mục 9).
- **Tranh thẻ vẽ riêng:** Shan vẽ; prompt ở [thumbnail-chien-truong.md](../../06-art/prompts/thumbnail-chien-truong.md). Chưa có tranh thì thẻ dùng tranh mực tạm.
- **Dấu hỏi `?`:** bỏ, chỉ có cờ lau.

## 9. Đạo cụ nguyên tố (bản đầu)

Trước ván (hoặc trước nước đầu) bạn chọn tối đa hai trong bảy hệ. Mỗi đạo cụ dùng một lần. Đạo cụ không làm ván thắng hay thua thay bạn: chúng chỉ cho thông tin hoặc đỡ một lỗi.

| Hệ | Đạo cụ | Tác dụng |
|---|---|---|
| Kim | Dò chông | Cắm cờ lên một ô có bẫy thật (ưu tiên ô sát vùng đã mở) |
| Mộc | Mầm xanh | Chọn một ô chưa mở: an toàn thì mở, có bẫy thì tự cắm cờ mà không thua |
| Thủy | Soi nước | Chọn một ô: biết trong vùng 3×3 quanh nó có bao nhiêu bẫy |
| Hỏa | Đốt lau | Chọn một ô: mở hết ô an toàn trong vùng 3×3, cắm cờ lên các bẫy |
| Thổ | Khiên đất | Đỡ một lần sa bẫy (dùng được cả trước nước đầu) |
| Lôi | Sấm báo | Chọn hàng hoặc cột rồi một ô: biết trên đó có bao nhiêu bẫy |
| Phong | Gió mách | Chỉ ra một ô chắc chắn an toàn hoặc chắc chắn có bẫy, theo suy luận từ các số đang hiện |

Tên đạo cụ do Claude đặt, Shan có thể đổi.

## 10. Câu hỏi mở

- Bàn "bậc Tùy chọn" (cột 8–30, hàng 8–24) có làm không?
- Có cho đạo cụ cơ chế nâng cấp hoặc kiếm được từ chế độ khác không?
- Thưởng vàng và xếp hạng bước 2 theo thời gian hay theo số bàn liên tiếp?
