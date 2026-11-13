# Dò Bẫy: giải đố tìm bẫy trên sa bàn

> Cập nhật: 13/11/2026
> Trạng thái: **DRAFT** — Shan đồng ý ý tưởng đưa trò dò mìn vào game ngày 13/11/2026. Tên **Dò Bẫy**, các bậc và số liệu là đề xuất của Claude, chờ Shan chốt ở [mục 8](#8-câu-hỏi-mở). Chưa có code, route hay tranh.

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

- **Lõi:** `src/core/do-bay/` thuần TypeScript, không đọc đồng hồ: bàn sinh sau nước đầu từ `seed + ô đầu`, hàm mở ô, mở lan, mở nhanh, cắm cờ, kiểm tra thắng thua. Test ở `tests/core/do-bay/`.
- **Màn chơi:** phân cảnh `DO_BAY` (tên hiển thị "Dò Bẫy", slug `trap-sweep`), `src/app/game/do-bay/`. Thêm vào `scene.ts`, `MODE_TEXT`, `MODE_INFO`, thẻ ở Chiến Trường và thẻ Hướng dẫn ở `modeGuides.ts` (test `mode-guides` sẽ đòi mười một chế độ).
- **Lưu trữ bản đầu:** ván dở và thời gian tốt nhất mỗi bậc ở `localStorage` (`reed-banner:do-bay:*`), không cần đăng nhập, không thưởng, như Khai Lộ.
- **Văn phong:** theo [Văn phong giao diện](../../00-overview/thuat-ngu.md#văn-phong-giao-diện); tên chế độ hoa mọi chữ (Dò Bẫy), nhãn nút chỉ hoa chữ đầu.

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

## 8. Câu hỏi mở

- Tên chế độ: **Dò Bẫy** (đề xuất) hay Rà Lũy, Gài Chông, tên khác?
- Bản đầu có đủ ba bậc hay chỉ Nhập môn và Thường?
- Có bản "không phải đoán mò" ngay từ bản đầu, hay để bước 2?
- Có đạo cụ theo nguyên tố (ví dụ Y sư lộ một ô an toàn, Mưu sĩ gợi ý một nước) không? Đề xuất để sau, bản đầu thuần luật gốc để người quen dò mìn chơi được ngay.
- Có dấu hỏi `?` ngoài cờ lau không (đề xuất bỏ cho gọn).
- Tranh thẻ Chiến Trường: vẽ riêng hay cắt từ tranh có sẵn (bãi lau, lũy tre)?
