# 13 — Quần Hùng online: đấu trực tiếp giữa người với người (1vs1 và 3vs3)

> Cập nhật: 13/11/2026
> Trạng thái: **DRAFT** — Shan chốt hướng 01/11/2026 và duyệt luật 1vs1, 3vs3 ngày 13/11/2026 (mục 1.1). Chưa có code. Các con số kỹ thuật (giờ, ngưỡng cảnh cáo, hàng đợi) là đề xuất của Claude, chờ đo.

## 1. Quyết định của Shan

- **Quần Hùng hiện tại** ([đấu trường bóng ma](../README.md#53-đấu-trường-bóng-ma-claude-đặt-20102026-chờ-shan-duyệt)) là chế độ **tìm đối thủ offline**: người chơi đánh đội phòng thủ (bản chụp) của người khác do AI điều khiển. Giữ nguyên, không đổi.
- **Sắp phát triển:** thêm chế độ **online hai người chơi đấu trực tiếp** với nhau, có xếp hạng và thưởng. Phát triển sau khi các chế độ hiện có ổn định; tài liệu này chỉ ghi hướng để không ai thiết kế mâu thuẫn.
- Cùng nguyên tắc với các chế độ online có xếp hạng: **chỉ tài khoản đã đăng nhập** (khách không vào, như Nhật Lệnh, Trấn Ải, Thiên Mệnh, Trận Đồ xếp hạng) và trước mắt **thưởng chỉ là vàng**.
- Bình Loạn là chế độ offline theo tuyến lịch sử, không có bảng xếp hạng; không liên quan tới PvP.

### 1.1 Luật Shan duyệt (13/11/2026)

- **Hai thể thức:** **1vs1** (hai người, mỗi người chỉ dùng **Đinh Bộ Lĩnh**, chọn nghề và hệ trước trận) và **3vs3** (ba người đấu ba người, **mỗi người điều khiển đúng một tướng** do mình chọn). Máu và luật 1vs1 theo [trận đấu mục 3](../../01-gameplay/tran-dau.md#3-luật-1vs1).
- **Ghép trận 3vs3:** có hàng đợi và **phòng mời bạn bè bằng mã**; sau thời gian chờ có thể **điền AI** vào chỗ trống (ngưỡng chờ chọn khi đo).
- **Cấp:** dùng **cấp chuẩn của nhân vật đang có** (không đưa mọi người về cùng một cấp). *Claude hiểu là giữ nguyên cấp từng tướng của người chơi và không thêm bước chuẩn hóa; trang bị chưa chốt (mục 6).*
- **Chọn tướng 3vs3:** **lần lượt, có cấm chọn** (mục 3.3).
- **Bỏ lượt:** người hết giờ thì **mất lượt, lượt chuyển sang đối thủ**. Bỏ lượt liên tục bị coi là **phá trận**: cảnh cáo, về sau hạn chế ghép trận (mục 3.5). Chưa xử thua vì bỏ lượt.
- **Điểm hạng:** **mỗi người một điểm Elo riêng**, tính cho từng thể thức (mục 3.6).
- **Thưởng:** chỉ vàng, như các chế độ xếp hạng khác.

## 2. Hiện trạng kỹ thuật cần biết

| Phần | Hiện tại | Ảnh hưởng tới PvP |
|---|---|---|
| Trận | `Match` lưu một chủ sở hữu (`ownerId`), người chơi luôn là `HUMAN` = phe 0, phe 1 là `AI_SIDE` do server chạy AI | PvP cần **hai** chủ sở hữu và không có AI điều khiển; phải khái quát `ownerId` thành danh sách theo phe |
| Đồng hồ | Mỗi lượt 30 giây (`TURN_MS`), `GRACE_MS` dung sai, bỏ dở 24 giờ (`ABANDON_MS`) bị xử thua, `settle` chạy bù khi có request | PvP cần đồng hồ **hai phía**, thua do hết giờ nhanh hơn nhiều và phát hiện bỏ cuộc/mất kết nối |
| Đồng bộ | HTTP: client gửi hành động kèm `seq`, server áp rồi trả bản xem; Neon HTTP không có transaction tương tác nên dùng ghi có điều kiện theo `seq` | Hai người chơi cùng ghi vào một trận: `seq` đã chống ghi trùng nhưng cần **kênh đẩy** để người kia biết nước vừa đi |
| Thông tin ẩn | `PlayerView` bỏ `boardRng` và `aiRng`; bàn cờ rơi ô sinh từ RNG của server | Hai người chơi dùng chung một RNG bàn cờ; không phe nào được thấy trạng thái RNG |
| Điểm | Đấu trường Elo, bắt đầu 1000, người đánh đổi `32 × (kết quả − kỳ vọng)` | Tái dùng Elo, nhưng cả hai bên đều là người thật và đều đổi điểm đầy đủ |
| Server | Vercel serverless, không giữ kết nối lâu | Không dùng WebSocket thuần; cần polling, SSE hoặc dịch vụ đẩy ngoài (xem mục 4) |

## 3. Luật chơi (theo quyết định ở mục 1.1)

### 3.1 Thể thức

| | 1vs1 | 3vs3 |
|---|---|---|
| Số người | 2 | 6 (3 mỗi phe) |
| Tướng | Đinh Bộ Lĩnh của mỗi người, chọn nghề và hệ trước trận | Mỗi người **một tướng** đang sở hữu, có thể gồm Đinh Bộ Lĩnh (đề xuất tối đa một mỗi phe) |
| Luật trận | [Trận đấu mục 3](../../01-gameplay/tran-dau.md#3-luật-1vs1), máu ×2 | [Trận đấu mục 2](../../01-gameplay/tran-dau.md#2-luật-3vs3) |
| Điểm | Elo 1vs1 riêng | Elo 3vs3 riêng |

Phe đi trước bốc ngẫu nhiên hoặc phe điểm thấp hơn đi trước (đề xuất, bù lợi thế đi trước của match-3).

### 3.2 Ghép trận

- **Hàng đợi theo Elo**, mở rộng khoảng cách điểm dần theo thời gian chờ; chỉ giữ người đang mở màn Quần Hùng (hết hạn nếu im lặng quá vài chục giây).
- **3vs3 cần sáu người cùng lúc.** Ba đường vào: (a) hàng đợi cá nhân, hệ thống ghép đủ sáu và chia đội cân điểm; (b) **phòng mời bạn bè bằng mã**, đủ sáu người thì bắt đầu; (c) hết thời gian chờ thì **điền AI** vào chỗ trống. Trận có AI điền: AI giữ tướng đó như tướng bị bỏ lượt tự động theo luật AI hiện có, **không tính Elo cho người chơi nếu cả phe đối thủ chủ yếu là AI** (ngưỡng chốt khi đo).
- Phòng mời bạn bè dùng được cho **giao hữu không tính Elo, không thưởng** (đề xuất, chờ Shan xác nhận).
- Chặn đánh lại **cùng một người** quá N lần mỗi ngày để tránh đổi điểm qua lại giữa hai tài khoản.

### 3.3 Chọn tướng 3vs3 (lần lượt, có cấm chọn)

Đề xuất quy trình, cần mô phỏng và chỉnh ở PVP-00:

1. Hai phe lần lượt **cấm** mỗi phe một số tướng (đề xuất mỗi phe cấm 2 tướng của phe kia sẽ không được chọn) trong thời gian ngắn mỗi lượt (đề xuất 20 giây).
2. Các phe lần lượt **chọn** theo thứ tự xen kẽ (đề xuất 1-2-2-1 hoặc A-B-B-A-A-B). Mỗi người chọn đúng một tướng trong số tướng mình đang sở hữu.
3. **Không trùng tướng trong cùng phe**; tướng đã chọn hoặc bị cấm không ai chọn lại được. Hết giờ chọn thì máy chọn thay một tướng hợp lệ có cấp cao nhất.
4. **Đội trưởng** (người vào trước, hoặc chủ phòng) xếp **vị trí 1 / 2 / 3** cho phe mình, vị trí 1 giữ thanh Nộ và bị động thủ lĩnh. Người chọn Đinh Bộ Lĩnh thường là đội trưởng nhưng không bắt buộc.
5. Sau bước chọn, hai phe **thấy đội hình đối thủ** như Quần Hùng hiện tại, rồi vào trận.

Người chơi thấy trước các tướng của đối thủ chỉ ở bước chọn; chỉ số chi tiết của từng tướng hiện sau khi vào trận.

### 3.4 Lượt, giờ và người hành động

- Giữ **30 giây mỗi lượt** như luật hiện tại. Người đang có tướng hành động là người đi nước cờ và chọn mục tiêu kỹ năng của tướng đó.
- **Đổi người hành động** (chạm chân dung): chỉ **đội trưởng** được đổi, và chỉ đổi sang tướng hợp lệ theo luật nghỉ một lượt. Người khác không đổi được.
- **Tướng đã gục:** nếu tướng của một người đã gục thì người đó xem trận và vẫn nhắn tín hiệu cho đồng đội (đề xuất, chờ thiết kế giao diện).

### 3.5 Bỏ lượt và phá trận

- **Hết giờ thì mất lượt:** người hết giờ không đi nước nào, **quyền đi chuyển sang đối thủ** (ở 3vs3, sang phe đối diện). Trận tiếp tục; không xử thua.
- **Phá trận:** một người **bỏ lượt liên tục** (đề xuất 3 lượt của chính mình liên tiếp) bị đánh dấu phá trận. Lần đầu: **cảnh cáo** hiện ngay ở trận và ghi vào tài khoản. Lặp lại trong một kỳ: **hạn chế ghép trận** (đề xuất giảm ưu tiên hàng đợi, rồi khóa ghép tạm thời tăng dần).
- **Mất kết nối** tính như bỏ lượt. Kết nối lại trong trận thì bỏ dấu liên tiếp.
- Con số ngưỡng cảnh cáo và thời gian hạn chế chỉ là đề xuất, cần Shan chốt sau khi đo.

### 3.6 Điểm hạng (Elo từng người)

- **Mỗi người một điểm Elo riêng, mỗi thể thức một điểm** (1vs1 và 3vs3 tách nhau). Bắt đầu 1000.
- **1vs1:** `32 × (kết quả − kỳ vọng)`, kỳ vọng tính từ điểm hai người. Cả hai bên đều là người thật và đều đổi điểm đầy đủ.
- **3vs3:** kỳ vọng tính từ **điểm trung bình phe** của mỗi bên; mỗi người đổi `32 × (kết quả − kỳ vọng phe)` theo điểm của chính mình. Người thắng cùng phe cùng nhận kết quả như nhau (đề xuất, chưa tính phần đóng góp từng người).
- Người **phá trận** nhận kết quả thua dù phe thắng (đề xuất, chống kéo điểm).
- Điểm không xuống dưới 0.

### 3.7 Thưởng

- **Chỉ vàng.** Thưởng mỗi trận nhỏ cho cả người thắng lẫn thua, và thưởng cuối kỳ theo hạng bằng [cơ chế thưởng hạng chung](../README.md#6-thưởng-vàng-theo-hạng-cuối-kỳ-claude-đặt-01112026-chờ-shan-duyệt). Kỳ đề xuất theo tuần; bảng theo mùa tính từ Elo đổi trong tuần, như Quần Hùng hiện tại.
- **Giới hạn trận mỗi ngày:** có (đề xuất), để chống cày và giữ tải.
- Chỉ **tài khoản đã đăng nhập**; khách không vào.

## 4. Đề xuất kỹ thuật

- **Mô hình dữ liệu:** thêm bảng `pvp_matches` (hai chủ sở hữu, phe, hàng đợi ghép, hạn giờ từng phe, kết quả, điểm Elo trước và sau), tách khỏi `matches` của trận đấu AI để không làm vỡ các chế độ hiện tại. Trận vẫn do server nắm quyền: server áp luật bằng đúng Battle Engine, client chỉ gửi hành động (như mọi chế độ online khác).
- **Hai người cùng ghi:** giữ cơ chế `seq` có điều kiện; chỉ người đang có lượt được gửi hành động, server từ chối hành động của phe không có lượt.
- **Kênh đẩy:** ba hướng, chưa chọn:
  1. **Polling** mỗi 1–2 giây (đơn giản nhất, chạy ngay trên Vercel, tốn request);
  2. **SSE** qua route streaming (cần kiểm giới hạn thời gian hàm);
  3. **Dịch vụ đẩy ngoài** (Pusher, Ably, …): mượt nhất nhưng thêm phụ thuộc và chi phí.
  Đề xuất bắt đầu bằng polling cho bản đầu rồi đo.
- **Thông tin ẩn:** `PlayerView` cho mỗi phe chỉ có thông tin công khai; `boardRng` không bao giờ rời server. Cần kiểm xem mỗi phe có cần thấy đội hình đối thủ trước khi đánh (đề xuất: có, như đấu trường).
- **Chống gian lận:** server nắm quyền nên không cần tin client; việc cần làm là giới hạn tốc độ gọi, phát hiện thông đồng (hai tài khoản đổi điểm) và chặn tài khoản phụ (đã yêu cầu đăng nhập).
- **Cờ tính năng** mặc định tắt (như Trận Đồ xếp hạng và Song Tháp), cổng `loginRequired` ngay từ đầu.

## 5. Phân kỳ đề xuất

Làm **1vs1 trước**, vì khái quát trận cho nhiều chủ sở hữu và đồng hồ từng người là phần khó nhất và dùng chung cho cả hai thể thức.

| Task | Phạm vi | Nghiệm thu |
|---|---|---|
| PVP-00 | Duyệt luật mục 3, chốt các câu hỏi mở (mục 6), chọn kênh đẩy | Rulebook và ADR được Shan duyệt |
| PVP-01 | Khái quát `Match`: danh sách chủ sở hữu theo từng tướng, đồng hồ từng người, mất lượt và phá trận (chỉ lõi, có test, chưa UI) | Mô phỏng hai AI đấu nhau qua cùng đường server, rồi sáu AI |
| PVP-02 | Hàng đợi 1vs1 theo Elo, bảng `pvp_matches`, API ghép và đi nước | Test ghép trận, chạy song song, chặn lượt sai |
| PVP-03 | Giao diện 1vs1: màn chờ ghép, trận trực tiếp, kết quả | QA desktop và điện thoại, mất mạng giữa trận |
| PVP-04 | Elo 1vs1, giới hạn trận mỗi ngày, chặn đánh lại, thưởng vàng, cảnh cáo phá trận | Cân bằng và kiểm chống farm |
| PVP-05 | 3vs3: phòng mời bằng mã, hàng đợi sáu người, điền AI | Test ghép trận sáu người, bỏ cuộc giữa trận |
| PVP-06 | 3vs3: bước cấm và chọn tướng lần lượt, đội trưởng xếp vị trí | Mô phỏng chọn tướng, không trùng, hết giờ chọn |
| PVP-07 | Bảng xếp hạng theo kỳ, thưởng cuối kỳ | Dùng sổ `rank_reward_claims`, nhận một lần |

## 6. Câu hỏi mở

Đã chốt ở mục 1.1: đội hình 1vs1 và 3vs3, cấp, kiểu chọn tướng, bỏ lượt, điểm hạng, thưởng. Còn lại:

- **Cấp:** Claude hiểu "cấp chuẩn của nhân vật đang có" là giữ nguyên cấp từng tướng. Đúng ý Shan chưa? **Trang bị** có tính vào trận không? Nếu giữ trang bị, nên ghép kỹ theo Elo để người mới không bị lệch quá.
- **Cấm chọn:** số tướng cấm mỗi phe, thứ tự chọn, giờ mỗi lượt chọn; có cấm Đinh Bộ Lĩnh không.
- **Điền AI:** chờ bao lâu thì điền, và trận có AI có tính Elo không.
- **Phá trận:** số lượt bỏ liên tiếp để cảnh cáo, mức hạn chế ghép (thời gian khóa) và có reset theo mùa không.
- **Con số:** giờ mỗi lượt khi mất kết nối, số trận mỗi ngày, số lần đánh lại cùng một người, thưởng vàng mỗi trận.
- **Kênh đẩy:** polling, SSE hay dịch vụ ngoài (đề xuất polling ở bản đầu rồi đo).
- **Giao hữu:** có chế độ không tính Elo giữa bạn bè qua phòng mã không (đề xuất có).
- **Song song với Quần Hùng bóng ma hay thay thế dần?**
