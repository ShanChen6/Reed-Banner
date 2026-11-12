# 13 — Quần Hùng online: đấu trực tiếp hai người chơi (PvP)

> Cập nhật: 01/11/2026
> Trạng thái: **DRAFT** — Shan chốt hướng phát triển ngày 01/11/2026 (làm sau, chưa có code, chưa chọn số liệu). Mọi giá trị dưới đây là đề xuất để thảo luận, không phải luật.

## 1. Quyết định của Shan

- **Quần Hùng hiện tại** ([đấu trường bóng ma](../README.md#53-đấu-trường-bóng-ma-claude-đặt-20102026-chờ-shan-duyệt)) là chế độ **tìm đối thủ offline**: người chơi đánh đội phòng thủ (bản chụp) của người khác do AI điều khiển. Giữ nguyên, không đổi.
- **Sắp phát triển:** thêm chế độ **online hai người chơi đấu trực tiếp** với nhau, có xếp hạng và thưởng. Phát triển sau khi các chế độ hiện có ổn định; tài liệu này chỉ ghi hướng để không ai thiết kế mâu thuẫn.
- Cùng nguyên tắc với các chế độ online có xếp hạng: **chỉ tài khoản đã đăng nhập** (khách không vào, như Nhật Lệnh, Trấn Ải, Thiên Mệnh, Trận Đồ xếp hạng) và trước mắt **thưởng chỉ là vàng**.
- Bình Loạn là chế độ offline theo tuyến lịch sử, không có bảng xếp hạng; không liên quan tới PvP.

## 2. Hiện trạng kỹ thuật cần biết

| Phần | Hiện tại | Ảnh hưởng tới PvP |
|---|---|---|
| Trận | `Match` lưu một chủ sở hữu (`ownerId`), người chơi luôn là `HUMAN` = phe 0, phe 1 là `AI_SIDE` do server chạy AI | PvP cần **hai** chủ sở hữu và không có AI điều khiển; phải khái quát `ownerId` thành danh sách theo phe |
| Đồng hồ | Mỗi lượt 30 giây (`TURN_MS`), `GRACE_MS` dung sai, bỏ dở 24 giờ (`ABANDON_MS`) bị xử thua, `settle` chạy bù khi có request | PvP cần đồng hồ **hai phía**, thua do hết giờ nhanh hơn nhiều và phát hiện bỏ cuộc/mất kết nối |
| Đồng bộ | HTTP: client gửi hành động kèm `seq`, server áp rồi trả bản xem; Neon HTTP không có transaction tương tác nên dùng ghi có điều kiện theo `seq` | Hai người chơi cùng ghi vào một trận: `seq` đã chống ghi trùng nhưng cần **kênh đẩy** để người kia biết nước vừa đi |
| Thông tin ẩn | `PlayerView` bỏ `boardRng` và `aiRng`; bàn cờ rơi ô sinh từ RNG của server | Hai người chơi dùng chung một RNG bàn cờ; không phe nào được thấy trạng thái RNG |
| Điểm | Đấu trường Elo, bắt đầu 1000, người đánh đổi `32 × (kết quả − kỳ vọng)` | Tái dùng Elo, nhưng cả hai bên đều là người thật và đều đổi điểm đầy đủ |
| Server | Vercel serverless, không giữ kết nối lâu | Không dùng WebSocket thuần; cần polling, SSE hoặc dịch vụ đẩy ngoài (xem mục 4) |

## 3. Đề xuất luật chơi (cần Shan duyệt)

1. **Đội hình:** 3vs3 như Đấu trường hiện tại, mỗi người dùng đội 3vs3 đang chọn; chỉ số, kỹ năng và trang bị theo hồ sơ như đã lưu ở đội phòng thủ. Ghi `TODO`: có **chuẩn hóa cấp** (đưa mọi người về cùng cấp) hay không, vì không chuẩn hóa thì người cày nhiều thắng người mới.
2. **Ghép trận:** hàng đợi theo điểm Elo, mở rộng khoảng cách điểm dần theo thời gian chờ. Hàng đợi chỉ giữ người đang mở màn Quần Hùng (hết hạn nếu im lặng quá vài chục giây). Chưa có phòng riêng hay thách đấu bạn bè (để sau).
3. **Đi trước:** bốc ngẫu nhiên, hoặc người điểm thấp hơn đi trước (đề xuất, để bù lợi thế đi trước của match-3).
4. **Lượt và giờ:** giữ 30 giây mỗi lượt; hết giờ thì lượt bị bỏ như luật hiện tại (xem [ban-co.md](../../01-gameplay/ban-co.md)). **Đề xuất:** ba lượt hết giờ liên tiếp hoặc mất kết nối quá một ngưỡng (ví dụ 90 giây) thì xử thua; chưa chốt con số.
5. **Kết thúc:** mục tiêu và điều kiện thắng như [trận đấu](../../01-gameplay/tran-dau.md). Thua vì bỏ cuộc tính như thua thường (đổi Elo), để không ai thoát điểm bằng cách thoát trận.
6. **Điểm:** Elo như Đấu trường. Chặn đánh lại **cùng một người** quá N lần mỗi ngày để tránh đổi điểm qua lại giữa hai tài khoản.
7. **Thưởng:** trước mắt chỉ vàng. Thưởng mỗi trận (thắng/thua, nhỏ) và thưởng cuối kỳ theo hạng bằng [cơ chế thưởng hạng chung](../README.md#6-thưởng-vàng-theo-hạng-cuối-kỳ-claude-đặt-01112026-chờ-shan-duyệt); kỳ đề xuất theo tuần. Cần mùa và chụp bảng cuối kỳ (xem câu hỏi mở).
8. **Giới hạn trận mỗi ngày:** có, để chống cày và giữ tải; con số cần đo.

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

| Task | Phạm vi | Nghiệm thu |
|---|---|---|
| PVP-00 | Duyệt luật mục 3 và các câu hỏi mở, chọn kênh đẩy | Rulebook và ADR được Shan duyệt |
| PVP-01 | Khái quát `Match` cho hai chủ sở hữu, đồng hồ hai phía, xử thua bỏ cuộc (chỉ lõi, có test, chưa UI) | Mô phỏng hai AI đấu nhau qua cùng đường server |
| PVP-02 | Hàng đợi ghép trận theo Elo, bảng `pvp_matches`, API ghép và đi nước | Test ghép trận, chạy song song, chặn lượt sai |
| PVP-03 | Giao diện: màn chờ ghép, trận trực tiếp, kết quả | QA desktop và điện thoại, mất mạng giữa trận |
| PVP-04 | Elo, giới hạn trận mỗi ngày, chặn đánh lại, thưởng vàng | Cân bằng và kiểm chống farm |
| PVP-05 | Bảng xếp hạng theo kỳ, thưởng cuối kỳ | Dùng sổ `rank_reward_claims`, nhận một lần |

## 6. Câu hỏi mở (đã ghi vào [câu hỏi mở](../../09-roadmap/cau-hoi-mo.md))

- Chuẩn hóa cấp và trang bị hay để nguyên tiến độ của mỗi người?
- Đội hình: dùng đội 3vs3 đang chọn, hay mỗi trận chọn riêng (có cấm/chọn tướng kiểu draft)?
- Con số hết giờ, mất kết nối, trận mỗi ngày, số lần đánh lại cùng một người.
- Kênh đẩy: polling, SSE hay dịch vụ ngoài.
- Có chế độ giao hữu (không tính Elo, không thưởng) giữa bạn bè không?
- Có song song với đấu trường bóng ma hay thay thế dần?
