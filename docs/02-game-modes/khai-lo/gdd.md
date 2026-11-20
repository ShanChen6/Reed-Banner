# 24 — Khai Lộ: giải đố xóa khối ô ngọc

> Cập nhật: 20/11/2026 (cân bằng lại độ khó, đạo cụ, thưởng; tối ưu bố cục máy tính/điện thoại)
> Trạng thái: **DRAFT** — Shan duyệt ý tưởng và chốt tên **Khai Lộ** ngày 05/11/2026; có bản chơi thử offline (không thưởng, không xếp hạng) với hai chế độ Thường và Cấp tốc, quân là 7 nguyên tố. Ngày 20/11/2026 Shan duyệt bộ số cân bằng lại ở [mục 4](#4-số-liệu-bản-đầu); cùng ngày chốt bàn 10 × 12 và 30 tim đỡ quân sót (chế độ Thường).

## 1. Định vị

Mini game giải đố một chạm trên bàn cờ của Cờ Lau. Người chơi chạm một quân; cả **khối** quân cùng hệ liền cạnh với nó biến mất, ô phía trên rơi xuống, cột trống thì các cột dồn lại. Cái hay nằm ở việc tính trước: xóa khối nhỏ nào để các khối khác dồn lại thành khối lớn, rồi mới xóa khối lớn lấy điểm.

- Thể loại: "xóa nhóm cùng màu" (SameGame, 1985), cảm hứng từ Block'D (EA Mobile, J2ME). Làm clean-room: không dùng tên, hình, âm thanh hay số liệu của game gốc.
- Quân là **7 nguyên tố** của game (Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Phong): nền ngọc nhuộm màu riêng của từng hệ (`ELEMENT_COLOR`) và biểu tượng hệ vẽ tay (`public/art/elements/`). Shan đổi từ ô ngọc vật phẩm sang nguyên tố ngày 05/11/2026 vì màu hệ dễ phân biệt hơn.
- Khác các chế độ khác: không đánh nhau, không đổi hai ô như match-3 (Giao Tranh), không đặt quân như Trận Đồ, không ghép công thức như Tầm Tướng Ký.
- Không có ô mới rơi vào: mỗi màn là một bài toán tất định theo seed, nên sau này phát lại được trên server để chấm điểm.

## 2. Luật chơi

### 2.1. Bàn cờ

- Bàn 10 cột × 12 hàng (từ 20/11/2026, trước đó 10 × 8), đầy ô khi bắt đầu màn.
- Màn 1–3 có 3 hệ, màn 4–7 có 4, màn 8–13 có 5, từ màn 14 có 6. Hệ của mỗi màn được xáo theo seed.
- Từ màn 2 có **ô số ×2, ×3** (Shan 20/11/2026, theo ô số 2, 3 của Block'D; thay ô hào quang cũ): quân thường có viền vàng và nhãn ×2 hoặc ×3. 1 ô ở màn 2–4, thêm 1 mỗi 3 màn, tối đa 5. Ô ×3 có từ màn 6 (`KL_MULT3_FROM`). Bản lưu cũ có ô hào quang đọc thành ô ×2.
- Bàn sinh ra luôn có ít nhất một khối xóa được.

### 2.2. Xóa khối

- **Khối** là các quân cùng hệ nối nhau theo cạnh (trên, dưới, trái, phải; không tính chéo).
- Chạm vào bất kỳ ô nào của một khối từ **2 ô** trở lên: cả khối biến mất. Ô lẻ không xóa được.
- Ô phía trên rơi thẳng xuống lấp chỗ trống. Cột trống hẳn thì các cột bên phải dồn sang trái.
- Điểm: khối n quân được **n²** điểm, nhân với các ô số trong khối, nhiều ô thì nhân dồn (`groupScore`). Ví dụ khối 6 quân có một ô ×2 được 72 điểm; có cả ×2 và ×3 được 216 điểm.

### 2.3. Kết thúc màn và tim (chế độ Thường)

Shan chốt 20/11/2026: ban đầu không dọn sạch là thua; cùng ngày thêm **tim** như 30 tim của Block'D vì những màn đầu chưa tích đủ đạo cụ nên rất dễ thua.

- Ván bắt đầu với **30 tim** (`KL_START_HEARTS`).
- Hết khối để xóa và hết đạo cụ dùng được thì hết màn: mỗi quân còn sót trừ 1 tim rồi sang màn sau.
- Số quân sót **nhiều hơn** số tim còn lại thì hết ván (số tim giữ nguyên để báo cho người chơi). Sót đúng bằng số tim thì vẫn qua, còn 0 tim.
- **Dọn sạch bàn**: cộng 300 + 50 × số màn điểm (`clearBonus`) và **+3 tim** (`KL_CLEAR_HEARTS`).
- Hết khối nhưng còn đạo cụ thì màn ở trạng thái **bế tắc**: người chơi dùng đạo cụ hoặc bấm *Kết thúc màn*. Bấm *Kết thúc màn* lúc nào cũng phải bấm hai lần; lần đầu báo số tim sẽ mất và nói rõ nếu không đủ tim.
- Ô *Tim* thay ô *Cao nhất* trong số liệu chế độ Thường. Bản lưu cũ chưa có tim được đủ 30 tim.

### 2.4. Đạo cụ và hoàn tác

Mỗi hệ một đạo cụ (Shan duyệt 20/11/2026, thay Lốc/Sấm cũ). Đạo cụ không cộng điểm, **tích không giới hạn**, ván bắt đầu với **1 đạo cụ mỗi hệ** (`KL_START_TOOLS`).

| Hệ | Đạo cụ | Tác dụng khi chọn một ô |
|---|---|---|
| Kim | **Kim Đao** | Chém sạch cả hàng ngang của ô đó. |
| Mộc | **Mộc Linh** | Đổi quân đó sang hệ của khối lớn nhất kề nó (khác hệ), để nối khối. Không có quân khác hệ kề bên thì không dùng được. |
| Thủy | **Thủy Triều** | Cuốn sạch cả cột dọc của ô đó. |
| Hỏa | **Hỏa Cầu** | Nổ vùng 3×3 quanh ô đó. |
| Thổ | **Địa Chấn** | Phá hàng dưới cùng (chọn ô nào cũng được), cả bàn sụt xuống một hàng. |
| Lôi | **Lôi Phạt** | Xóa mọi quân cùng hệ với quân được chọn. |
| Phong | **Lốc Phong** | Chọn tâm không sát mép: 8 ô quanh xoay một nấc theo chiều kim đồng hồ (giống lốc xoáy hệ Phong trong trận). |

- **Thanh nạp theo hệ** (cả hai chế độ): chạm khối hệ nào thì mỗi quân trong khối nạp 1 vào thanh của hệ đó; đủ **90 quân** (`KL_TOOL_CHARGE`) thì +1 đạo cụ hệ ấy, phần dư giữ lại. Quân bị đạo cụ phá không nạp. Thanh có màu của hệ, nằm dưới nút đạo cụ.
- Giao diện chỉ hiện đạo cụ của các hệ có trên bàn, cộng các hệ đang còn đạo cụ trong kho. Phím 1–7 chọn nhanh theo thứ tự Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Phong.
- Bản lưu cũ có Lốc/Sấm: Lốc thành Lốc Phong, Sấm thành Hỏa Cầu (cùng vùng 3×3).
- **Hoàn tác**: mỗi màn 1 lần, chỉ lùi được nước vừa đi (trả lại cả đạo cụ và thanh nạp). Không lùi qua khi màn đã kết thúc.

### 2.5. Chế độ

| Chế độ | Luật riêng |
|---|---|
| **Thường** | Không giới hạn thời gian. |
| **Cấp tốc** | Chạy đua mốc điểm (Shan 20/11/2026). Ván bắt đầu với **90 giây**. Mỗi bậc có mốc điểm cộng dồn: qua bậc n cần thêm 400 + 50 × (n − 1) điểm (`timedGoal`: 400, 850, 1350, 1900…). Đạt mốc thì lên bậc ngay, chia bàn mới của bậc đó và **cộng thêm 40 giây vào giờ còn lại** (giờ dư cộng dồn). Bàn dọn sạch hoặc hết đường thì tính thưởng dọn sạch/gần sạch rồi chia bàn mới cùng bậc; bàn bế tắc mà còn đạo cụ thì người chơi dùng đạo cụ hoặc bấm *Đổi bàn*. Không dùng quân lực; hết giờ là hết ván. Số hệ theo bậc như số hệ theo màn. Đồng hồ chỉ chạy khi tab đang mở; giờ còn lại lưu cùng ván dở. |

Hai chế độ có ván dở và điểm cao nhất riêng (Cấp tốc dùng khóa lưu v2 từ 20/11/2026, ván dở của luật cũ bỏ đi). Lõi không đọc giờ: giao diện đếm giờ, cộng `KL_TIMED_LEVEL_SECONDS` khi có sự kiện `goalReached` và gửi `timeUp` khi hết giờ.

## 3. Điều khiển

Người chơi không phải kéo nối từng ô: chỉ chọn một ô, máy tự tìm cả khối.

| Thiết bị | Xem trước | Thực hiện |
|---|---|---|
| Máy tính (chuột) | Rê chuột qua ô: cả khối sáng viền vàng, hiện số ô và điểm dự kiến. Ô lẻ không sáng. | Bấm |
| Bàn phím | Mũi tên di chuyển tiêu điểm (cũng hiện xem trước) | Enter/Space; Z hoàn tác; 1–7 chọn đạo cụ theo hệ; Esc bỏ chọn đạo cụ |
| Điện thoại | Chạm lần đầu: xem trước khối | Chạm lại vào cùng khối (với đạo cụ: cùng ô) |

Khi đang cầm đạo cụ, phần xem trước đổi thành vùng đạo cụ tác động (viền đỏ cam khi phá quân, ngọc lam khi xoay/đổi hệ).

## 4. Số liệu bản đầu

### 4.1. Cân bằng lại 20/11/2026 (Shan duyệt)

Mô phỏng 200 ván bằng bot tham lam nhìn trước 1 nước (chọn nước để lại ít quân lẻ nhất), **có dùng Sấm Sét khi bế tắc**. Bộ số cũ (3/4/5/6 hệ từ màn 1/5/10/17, kho đạo cụ 9, +1 mỗi loại và +5 quân lực khi dọn sạch, thưởng 800 × màn) cho thấy:

- Màn 1–9 quá dễ: dọn sạch 72–99% số màn; kho đạo cụ đầy trước màn 10.
- Ván quá dài: trung vị tới màn 17 (p10 = 13, p90 = 21), khoảng 500 lần chạm; từ màn 17 không dọn sạch nổi màn nào (độ khó dựng đứng).
- Thưởng dọn sạch chiếm 84% tổng điểm, gom khối to (n²) gần như không ảnh hưởng tới điểm.
- Lốc Phong ít khi có ích.

Bộ số mới (dùng tới khi đổi sang luật thua ở mục 4.3): số hệ 3/4/5/6 từ màn 1/4/8/14; dọn sạch +4 quân lực, +1 đạo cụ xen kẽ, kho tối đa 5; thưởng dọn sạch 300 + 50 × màn, gần sạch (≤ 3 quân) 100 điểm. Cùng bot, 200 ván:

| | Cũ | Mới |
|---|---|---|
| Màn đạt được (p10 / trung vị / p90) | 13 / 17 / 21 | 9 / 11 / 14 |
| Tỉ lệ dọn sạch màn 4 / 7 / 10 | 98% / 81% / 47% | 64% / 18% / 2% |
| Điểm từ gom khối / tổng điểm | 16% | 69% |

Người chơi thật tính sâu hơn bot nên kỳ vọng đi xa hơn vài màn. Các hằng số nằm đầu `src/core/khai-lo/engine.ts` (`KL_CLEAR_*`, `KL_NEAR_CLEAR_*`, `KL_TOOL_CHARGE`, `KL_START_TOOLS`, `levelConfig`). Chưa làm: Lốc Phong mạnh hơn (để sau).

### 4.2. Đạo cụ theo hệ và Cấp tốc theo mốc (20/11/2026)

Bot 120 ván, khi bế tắc thử mọi đạo cụ ở mọi ô và chọn nước để lại nhiều quân nối khối nhất. Ngưỡng nạp (quân mỗi hệ) so với màn/bậc đạt được (p10 / trung vị / p90):

| Ngưỡng nạp | Thường (màn) | Cấp tốc (bậc, 2 giây một nước) |
|---|---|---|
| 25 | 135 / 137 / 139 (không bao giờ thua) | 16 / 18 / 21 |
| 50 | 14 / 18 / 22 | 11 / 14 / 16 |
| **80 (đang dùng)** | 9 / 13 / 16 | 9 / 10 / 12 |
| 120 | 8 / 10 / 14 | 8 / 9 / 11 |

Với 80, mỗi bàn trung bình được khoảng 1 đạo cụ; bot dùng cả 7 loại gần đều nhau. Bảng trên đo ở bàn 10 × 8 với luật quân lực cũ.

### 4.3. Bàn 10 × 12 (20/11/2026)

Shan yêu cầu: không dọn sạch là thua, đạo cụ tích không giới hạn, bàn to hơn. Bot như mục 4.2, 120 ván:

| Cấu hình | Thường (màn, trung vị) | Cấp tốc (bậc, trung vị) |
|---|---|---|
| 10 × 8, nạp 80, bắt đầu 0 đạo cụ | 2 (quá khó) | — |
| 10 × 12, nạp 75, bắt đầu 1 mỗi hệ | 15 | 12 |
| **10 × 12, nạp 90, bắt đầu 1 mỗi hệ (đang dùng)** | 13 | 12 |

Thêm tim (80 ván, bàn 10 × 12, nạp 90, bắt đầu 1 đạo cụ mỗi hệ), màn đạt được ở chế độ Thường (p10 / trung vị / p90):

| Tim ban đầu, thêm khi dọn sạch | Thường |
|---|---|
| Không có tim (luật trước) | 9 / 11 / 14 |
| 20, +2 | 15 / 17 / 21 |
| 30, +0 | 14 / 16 / 19 |
| **30, +3 (đang dùng)** | 16 / 19 / 23 |
| 40, +3 | 17 / 21 / 24 |

Với tim, 10% ván kém nhất vẫn tới màn 14–16 nên không còn thua sớm ở những màn đầu. Cấp tốc không dùng tim.

Luật thua làm đạo cụ thành "mạng" của người chơi, nên mỗi hệ được 1 đạo cụ lúc đầu để màn đầu không chết oan.

## 5. Bản chơi thử hiện có (05/11/2026)

- Lõi: `src/core/khai-lo/` (thuần TypeScript, seed qua `src/core/rng.ts`), test ở `tests/core/khai-lo/`.
- Màn chơi: `/game/clear-path` (phân cảnh `KHAI_LO`), `src/app/game/khai-lo/KhaiLoScreen.tsx`. Thẻ ở hàng "Sắp ra mắt / đã mở" trên Home cạnh Trận Đồ.
- Offline: ván dở và điểm cao nhất lưu `localStorage` (`reed-banner:khai-lo:*`); không cần đăng nhập, không thưởng.
- Bố cục (20/11/2026): khi đang chơi bỏ banner lớn, thay bằng một hàng gọn (chế độ · màn và nút *Ván mới*) để bàn 10 × 12 đủ to; điện thoại xếp dọc số liệu → bàn → đạo cụ theo hệ (lưới 4 cột) cùng Hoàn tác và Kết thúc màn ngay dưới bàn; từ 1024px hai cột, từ 1280px ba cột (chế độ và số liệu bên trái, bàn giữa, đạo cụ bên phải). Cỡ ô đo theo chỗ trống thật (tối đa 88px), trên máy tính còn giới hạn theo chiều cao cửa sổ để cả bàn lọt màn hình. Bảng kết màn và hết ván hiện đè lên bàn. Không có dòng thông báo dưới bàn (Shan 20/11/2026, tránh nhảy bố cục); thông báo chỉ đọc cho trình đọc màn hình, bế tắc báo ở khung đạo cụ. Lấp khoảng trống (Shan chọn phương án A 20/11/2026): từ 640px khung bàn có tranh nền Shan vẽ phía sau (`public/art/khai-lo/bg.webp`, cây đa trái, rừng tre phải); từ 1280px cột trái có khối tranh kèm thơ (`ColumnFill` mục `clearPath`, tranh cắt phần cây đa của nền).
- Ô rơi và dồn cột có hoạt ảnh (đổi `transform`), khối vừa xóa bung mờ; tôn trọng `prefers-reduced-motion`.
- Chưa có: âm thanh, tranh thẻ Home (`public/art/home/khai-lo.webp`), hướng dẫn từng bước.

## 6. Hướng phát triển (chưa làm, chờ Shan chọn)

1. **Đề ngày**: một seed chung mỗi ngày (kiểu Nhật Lệnh), server phát lại chuỗi nước để chấm điểm và xếp hạng; cần đăng nhập.
2. **Thưởng**: vàng/sách theo mốc điểm hoặc nhiệm vụ ngày (`quests.ts`), cần server xác nhận ván.
3. **Màn soạn sẵn**: chuỗi đề có sao (ví dụ "dọn sạch trong 12 nước"), dùng chung lõi.

## 7. Câu hỏi mở

- Có muốn thưởng ảnh hưởng sức mạnh (vàng, đồ) hay chỉ danh hiệu/khung?
- Giữ hoàn tác 1 lần/màn hay bỏ hẳn để khó hơn?
- Tranh thẻ Home: vẽ riêng hay cắt từ tranh có sẵn?
