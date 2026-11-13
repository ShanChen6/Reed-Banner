# 13 — Quần Hùng online: đấu trực tiếp giữa người với người (1vs1 và 3vs3)

> Cập nhật: 13/11/2026
> Trạng thái: **DRAFT** — Shan chốt hướng 01/11/2026 và duyệt luật 1vs1, 3vs3 ngày 13/11/2026 (mục 1.1, đã bổ sung vòng hai cùng ngày). Lõi PVP-01 đã có code (`src/core/pvp/`, mục 5); server, giao diện, ghép trận, cấm chọn và Nộ riêng chưa có. Các con số kỹ thuật (giờ, ngưỡng cảnh cáo, hàng đợi) là đề xuất của Claude, chờ đo.

## 1. Quyết định của Shan

- **Quần Hùng hiện tại** ([đấu trường bóng ma](../README.md#53-đấu-trường-bóng-ma-claude-đặt-20102026-chờ-shan-duyệt)) là chế độ **tìm đối thủ offline**: người chơi đánh đội phòng thủ (bản chụp) của người khác do AI điều khiển. Giữ nguyên, không đổi.
- **Sắp phát triển:** thêm chế độ **online hai người chơi đấu trực tiếp** với nhau, có xếp hạng và thưởng. Phát triển sau khi các chế độ hiện có ổn định; tài liệu này chỉ ghi hướng để không ai thiết kế mâu thuẫn.
- Cùng nguyên tắc với các chế độ online có xếp hạng: **chỉ tài khoản đã đăng nhập** (khách không vào, như Nhật Lệnh, Trấn Ải, Thiên Mệnh, Trận Đồ xếp hạng) và trước mắt **thưởng chỉ là vàng**.
- Bình Loạn là chế độ offline theo tuyến lịch sử, không có bảng xếp hạng; không liên quan tới PvP.

### 1.1 Luật Shan duyệt (13/11/2026)

- **Hai thể thức:** **1vs1** (hai người, mỗi người chỉ dùng **Đinh Bộ Lĩnh**, chọn nghề và hệ trước trận) và **3vs3** (ba người đấu ba người, **mỗi người điều khiển đúng một tướng** do mình chọn). Máu và luật 1vs1 theo [trận đấu mục 3](../../01-gameplay/tran-dau.md#3-luật-1vs1).
- **Ghép trận 3vs3:** có hàng đợi và **phòng mời bạn bè bằng mã**; sau thời gian chờ có thể **điền AI** vào chỗ trống (ngưỡng chờ chọn khi đo). Trận có AI **vẫn tính Elo nhưng được ít điểm hơn** (mục 3.7). Giao hữu qua phòng mã **không tính Elo, không thưởng**.
- **Cấp:** dùng **cấp của chính tướng được chọn** trong hồ sơ người chơi, không chuẩn hóa. Ví dụ Hà Vân cấp 2 thì vào trận ở cấp 2, Đinh Bộ Lĩnh cấp 5 thì vào trận ở cấp 5. **Có tính trang bị** của tướng đó.
- **Chuẩn bị:** sau khi chọn tướng có **màn chờ chuẩn bị** để người chơi sắp xếp trang bị cho tướng mình đã chọn (mục 3.4).
- **Chọn tướng 3vs3:** **lần lượt, cấm và chọn công khai**; **mỗi phe cấm 3 tướng**, hết giờ cấm thì máy cấm ngẫu nhiên (mục 3.3).
- **Đinh Bộ Lĩnh ở 3vs3:** chọn được, **cấm theo nghề hoặc hệ** của ông (không cấm cả ông), **cả trận chỉ có một Đinh Bộ Lĩnh**: phe nào chọn ông trước thì phe kia không chọn được nữa (mục 3.8).
- **Nộ:** **tính riêng cho từng người chơi**, mỗi tướng có thanh Nộ và bị động của chính mình (mục 3.5).
- **Bỏ lượt:** người hết giờ thì **mất lượt, lượt chuyển sang đối thủ**. Bỏ lượt liên tục bị coi là **phá trận**: cảnh cáo, về sau hạn chế ghép trận (mục 3.6). Chưa xử thua vì bỏ lượt. Luật phá trận được Shan đồng ý.
- **Điểm hạng:** **mỗi người một điểm Elo riêng**, tính cho từng thể thức (mục 3.7). **Người phá trận không được tính điểm.**
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
| Tướng | Đinh Bộ Lĩnh của mỗi người, chọn nghề và hệ trước trận | Mỗi người **một tướng** đang sở hữu, cấp và trang bị của chính tướng đó; Đinh Bộ Lĩnh chọn được, cả trận chỉ một người (mục 3.8) |
| Luật trận | [Trận đấu mục 3](../../01-gameplay/tran-dau.md#3-luật-1vs1), máu ×2 | [Trận đấu mục 2](../../01-gameplay/tran-dau.md#2-luật-3vs3) |
| Điểm | Elo 1vs1 riêng | Elo 3vs3 riêng |

Phe đi trước bốc ngẫu nhiên hoặc phe điểm thấp hơn đi trước (đề xuất, bù lợi thế đi trước của match-3).

### 3.2 Ghép trận

- **Hàng đợi theo Elo**, mở rộng khoảng cách điểm dần theo thời gian chờ; chỉ giữ người đang mở màn Quần Hùng (hết hạn nếu im lặng quá vài chục giây).
- **3vs3 cần sáu người cùng lúc.** Ba đường vào: (a) hàng đợi cá nhân, hệ thống ghép đủ sáu và chia đội cân điểm; (b) **phòng mời bạn bè bằng mã**, đủ sáu người thì bắt đầu; (c) hết thời gian chờ thì **điền AI** vào chỗ trống. Trận có AI điền: AI điều khiển tướng đó theo luật AI hiện có. **Trận vẫn tính Elo nhưng được ít điểm hơn** (mục 3.6).
- Phòng mời bạn bè dùng được cho **giao hữu không tính Elo, không thưởng** (Shan đồng ý).
- Chặn đánh lại **cùng một người** quá N lần mỗi ngày để tránh đổi điểm qua lại giữa hai tài khoản.

### 3.3 Chọn tướng 3vs3 (lần lượt, có cấm chọn)

Quy trình (số lượng cấm do Shan chốt; thứ tự và giờ là đề xuất, cần mô phỏng ở PVP-00):

0. **Cấm và chọn đều công khai** (Shan, 13/11/2026): mọi lượt cấm và chọn hiện ngay cho cả hai phe thấy, không cấm kín cùng lúc. Phe cấm trước thấy ít thông tin hơn phe cấm sau, và đó là lý do phe Elo cao hơn cấm trước (bù ở mục 3.8).
1. **Cấm:** hai phe lần lượt **cấm**, mỗi phe cấm **3 tướng** của đối phương (tướng bị cấm không ai trong cả trận chọn được). Riêng **Đinh Bộ Lĩnh chỉ cấm theo một nghề hoặc một hệ** của ông (mục 3.8), mỗi lượt cấm ông vẫn tính một trong 3 lượt. Mỗi lượt cấm tối đa 20 giây; **hết giờ thì máy cấm ngẫu nhiên** một tướng trong kho chung hợp lệ.
2. **Chọn:** phe điểm thấp hơn chọn trước, các phe lần lượt chọn theo thứ tự xen kẽ (đề xuất 1-2-2-1 hoặc A-B-B-A-A-B), mỗi người chọn đúng **một tướng đang sở hữu**. Hết giờ chọn thì máy chọn thay tướng hợp lệ có cấp cao nhất.
3. **Không trùng tướng trong cùng phe**; tướng đã chọn hoặc đã bị cấm không ai chọn lại. **Cả trận chỉ có một Đinh Bộ Lĩnh**: ai chọn ông trước (phe nào cũng được) thì mọi người còn lại, kể cả phe kia, không chọn được ông nữa (mục 3.8).
4. **Đội trưởng** (người vào trước, hoặc chủ phòng) xếp **vị trí 1 / 2 / 3** cho phe mình sau khi các tướng đã chọn xong.
5. Hai phe **thấy tướng của nhau** từ lúc chọn. Cấp và trang bị chi tiết hiện sau khi vào trận.

**Cấp trong trận:** mỗi tướng vào trận ở **cấp hiện có của chính tướng đó** trong hồ sơ người chơi. Ví dụ Hà Vân cấp 2 thì đánh ở cấp 2; Đinh Bộ Lĩnh cấp 5 thì đánh ở cấp 5. Không có bước đưa về cùng một cấp. Chọn tướng là chọn cả cấp của tướng đó, nên người chơi cân nhắc giữa tướng mạnh về chiêu và tướng đã nâng cấp.

### 3.4 Màn chờ chuẩn bị (sau khi chọn tướng)

- Sau bước chọn, mỗi người vào **màn chờ chuẩn bị** có đồng hồ đếm ngược chung (đề xuất 60 giây) để **sắp xếp trang bị cho tướng mình đã chọn**, lấy từ kho của chính mình. Tướng và cấp đã khóa, chỉ đổi được trang bị. Nghề và hệ của Đinh Bộ Lĩnh đã chọn và khóa từ lúc chọn tướng (mục 3.8).
- Trang bị **được tính vào chỉ số trong trận**. Chốt trang bị khi hết giờ hoặc khi bấm sẵn sàng; hết giờ thì giữ trang bị đang mặc. Người sẵn sàng thấy trạng thái sẵn sàng của mọi người, **chưa thấy** trang bị chi tiết của đối thủ.
- Trận bắt đầu khi mọi người sẵn sàng hoặc hết giờ chờ. Ở 1vs1 cũng có màn này (chọn nghề, hệ của Đinh Bộ Lĩnh và trang bị); riêng 1vs1 nghề, hệ chọn ngay ở màn chuẩn bị.
- Vì tính cả trang bị và cấp, hàng đợi cần **ghép theo Elo kỹ** để người mới không gặp người có đồ và cấp vượt trội.

### 3.5 Lượt, giờ, Nộ riêng và người hành động

- Giữ **30 giây mỗi lượt** như luật hiện tại. Người đang có tướng hành động là người đi nước cờ và chọn mục tiêu kỹ năng của tướng đó.
- **Đổi người hành động** (chạm chân dung): chỉ **đội trưởng** được đổi, và chỉ đổi sang tướng hợp lệ theo luật nghỉ một lượt. Người khác không đổi được.
- **Tướng đã gục:** người đó xem trận và nhắn tín hiệu cho đồng đội (đề xuất, chờ thiết kế giao diện).
- **Nộ tính riêng cho từng người chơi (Shan duyệt):** hôm nay mỗi phe chỉ có một thanh Nộ gắn với thủ lĩnh, nhân vật kèm không có Nộ ([tài nguyên, mục 3](../../01-gameplay/tai-nguyen-cong-thuc.md#3-nộ-và-kỹ-năng-bị-động)). Ở PvP **mỗi người chơi có thanh Nộ của tướng mình** và kích hoạt bị động của chính tướng đó (mọi tướng đều có bị động theo nghề và hệ, `chasePassives`). Đề xuất cách tích, chờ mô phỏng:
  - ô Trống trận (+8) và ô đặc biệt Trống da, Trống đồng (+20, +40) cộng cho **người ghép bộ đó** (chủ tướng đang hành động), không chia cả phe;
  - tướng nào mất máu thì **thanh của tướng đó** +1 Nộ cho mỗi 2% máu tối đa bị mất;
  - đầy 100 thì bị động của chính tướng đó kích hoạt 3 lượt của phe, rồi Nộ về 0; tướng gục thì Nộ dừng tích;
  - các luật còn lại (không tích khi bị động đang có hiệu lực, Nộ về 0 mỗi trận) giữ nguyên.
  Đổi này **chỉ áp dụng cho trận PvP**; các chế độ hiện tại giữ một thanh Nộ cho thủ lĩnh. Hệ quả cần cân bằng: phe 3 người có tới 3 thanh Nộ, và ở 1vs1 (một tướng) thì vẫn là một thanh như cũ.

### 3.6 Bỏ lượt và phá trận

- **Hết giờ thì mất lượt:** người hết giờ không đi nước nào, **quyền đi chuyển sang đối thủ** (ở 3vs3, sang phe đối diện). Trận tiếp tục; không xử thua.
- **Phá trận:** một người **bỏ lượt liên tục** (đề xuất 3 lượt của chính mình liên tiếp) bị đánh dấu phá trận. Lần đầu: **cảnh cáo** hiện ngay ở trận và ghi vào tài khoản. Lặp lại trong một kỳ: **hạn chế ghép trận** (đề xuất giảm ưu tiên hàng đợi, rồi khóa ghép tạm thời tăng dần). Luật này Shan đồng ý.
- **Mất kết nối (Shan đồng ý 13/11/2026):** tách khỏi bỏ lượt, dựa vào **tín hiệu còn sống** client gửi mỗi vài giây (mỗi nước đi cũng tính).
  - **Im lặng quá 15 giây** là mất kết nối. Lượt hết giờ **khi còn tín hiệu** là bỏ lượt và tính vào phá trận; lượt hết giờ **khi đã mất kết nối** thì **vẫn mất lượt** (đối thủ không phải chờ) nhưng **không tính vào phá trận**.
  - **Số lần tha:** mỗi người **3 lần mất kết nối được tha mỗi ngày** (theo ngày Việt Nam). Quá số đó thì lượt mất kết nối tính như bỏ lượt, và lặp lại thì thành phá trận. Server giữ và trừ số lần tha sau trận.
  - **Giữ chỗ 90 giây:** kết nối lại trong 90 giây thì vào tiếp, tướng giữ nguyên. **Quá 90 giây, AI tiếp quản** tướng đó và người chơi không vào lại được (không giành lại tướng).
  - **Điểm:** người bị AI tiếp quản **không đổi Elo** và **không bị cảnh cáo** (khác phá trận). Những người còn lại vẫn được tính nhưng ít điểm hơn vì trận có AI (mục 3.7).
  - **1vs1:** giữ luật hết giờ 30 giây như 3vs3, đối thủ không được chờ thêm.
  - Đội trưởng bị AI tiếp quản thì người thật có vị trí nhỏ nhất của phe làm đội trưởng; phe hết người thật thì không ai đổi được người hành động. Hết người thật cả trận thì server kết thúc trận.
  - Số liệu 15 giây, 90 giây, 3 lần chỉ là đề xuất, cần đo sau khi có dữ liệu thật.
- Con số ngưỡng và thời gian hạn chế chỉ là đề xuất, cần Shan chốt sau khi đo.

### 3.7 Điểm hạng (Elo từng người)

- **Mỗi người một điểm Elo riêng, mỗi thể thức một điểm** (1vs1 và 3vs3 tách nhau). Bắt đầu 1000.
- **1vs1:** `32 × (kết quả − kỳ vọng)`, kỳ vọng tính từ điểm hai người. Cả hai bên đều là người thật và đều đổi điểm đầy đủ.
- **3vs3:** kỳ vọng tính từ **điểm trung bình phe** của mỗi bên (tướng AI điền tính bằng điểm trung bình của phe); mỗi người đổi `32 × (kết quả − kỳ vọng phe)` theo điểm của chính mình. Cùng phe thắng thì cùng nhận kết quả thắng, chưa tính phần đóng góp từng người.
- **Người phá trận không được tính điểm** (Shan, 13/11/2026): Elo của họ **không đổi** sau trận đó (không cộng khi phe thắng). Những người còn lại vẫn tính bình thường; người phá trận chỉ bị cảnh cáo và hạn chế ghép (mục 3.6). *Claude hiểu "không được tính" là không cộng, không trừ; nếu Shan muốn phạt trừ điểm thì báo.*
- **Trận có AI điền: vẫn tính điểm nhưng được ít điểm hơn** (Shan, 13/11/2026). Đề xuất: hệ số 32 giảm theo số AI trong trận, ví dụ nhân `1 − 0,25 × số AI trong phe người chơi và phe đối thủ cộng lại` (tối thiểu 0,25); trận toàn người thật nhân 1. Ngưỡng này chốt khi đo.
- **Giao hữu qua phòng mã:** không tính điểm, không thưởng.
- Điểm không xuống dưới 0.

### 3.8 Đinh Bộ Lĩnh ở 3vs3 (Shan chọn phương án A, 13/11/2026)

- **Chọn được:** Đinh Bộ Lĩnh có mặt trong kho của mọi người chơi. Người chọn ông **chọn nghề và hệ ngay lúc chọn tướng** rồi khóa (một trong 8 nghề × 7 hệ, tức 56 kiểu); ở màn chuẩn bị chỉ đổi được trang bị.
- **Cả trận chỉ có một Đinh Bộ Lĩnh** (Shan, 13/11/2026): phe nào chọn ông trước thì **phe kia không được chọn ông nữa**, và đồng đội trong phe đó cũng không chọn lại. Cấp của ông là cấp trong hồ sơ người chọn.
- **Cấm theo nghề hoặc theo hệ, không cấm cả ông:** bạn không cấm "Đinh Bộ Lĩnh" nói chung mà cấm **một nghề** (ví dụ Tướng sĩ) **hoặc một hệ** (ví dụ Hỏa) của ông. Phe bị cấm không chọn được kiểu Đinh Bộ Lĩnh trùng nghề hoặc hệ đó nhưng vẫn chọn được các kiểu còn lại. Vì ông có 56 kiểu nên một lượt cấm gần như không làm mất ông khỏi trận, nhưng giúp phe cấm hạn chế kiểu mạnh nhất mà phe kia sẽ chọn. Lượt cấm này **tính vào 3 lượt cấm của phe** như cấm một tướng khác.
- **Giới hạn khuyến nghị:** vì mỗi lượt cấm chỉ chặn một phần kiểu, nên cần mô phỏng cân bằng 56 kiểu; nếu có kiểu quá mạnh thì tăng độ ưu tiên cấm hoặc điều chỉnh số trị riêng của PvP, không đổi chỉ số ở các chế độ khác.
- **Hệ quả và cách bù (Shan chốt kết hợp cách 1 + 2, 13/11/2026):** vì chỉ một phe có ông, thứ tự chọn quyết định phe nào lấy được ông. Luật bù: (1) **phe có Elo trung bình thấp hơn được chọn trước**, hòa điểm thì bốc ngẫu nhiên; (2) phe còn lại **cấm trước**, nên phe chọn trước thấy lượt cấm của đối thủ rồi mới chọn. **Không thêm lượt chọn riêng cho Đinh Bộ Lĩnh** ở bản đầu; chỉ xem lại nếu mô phỏng cho thấy phe lấy được ông vẫn thắng nhiều hơn rõ rệt.
- **Nộ và bị động:** ông dùng bị động theo nghề và hệ đã chọn như các tướng khác.

### 3.9 Thưởng

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
| PVP-01 | **Đã làm (13/11/2026):** lõi `src/core/pvp/` quanh `BattleState` hai phe: chủ sở hữu theo từng tướng (hoặc AI điền), chỉ chủ tướng đang hành động được đi nước, chỉ đội trưởng đổi người hành động, hết giờ thì mất lượt và quyền sang đối thủ, bỏ lượt liên tiếp (3 lần của chính người đó, đề xuất) là phá trận, Elo từng người (phá trận không đổi điểm, hệ số giảm khi có AI), phe Elo thấp đi trước. Có test và mô phỏng 1vs1, 3vs3 sáu bot, có AI điền và có người bỏ lượt (`tests/core/pvp/`). **Cũng đã làm (13/11/2026):** tín hiệu còn sống, tách mất kết nối khỏi bỏ lượt, tha 3 lần mỗi ngày, AI tiếp quản sau 90 giây, người bị tiếp quản không đổi Elo. **Chưa làm:** lưu và đồng bộ qua server (PVP-02), Nộ riêng từng người (PVP-06, cần sửa lõi trận) | Mô phỏng hai AI đấu nhau, rồi sáu AI, qua cùng đường kiểm tra quyền (đạt; đường server là PVP-02) |
| PVP-02 | Hàng đợi 1vs1 theo Elo, bảng `pvp_matches`, API ghép và đi nước | Test ghép trận, chạy song song, chặn lượt sai |
| PVP-03 | Giao diện 1vs1: màn chờ ghép, trận trực tiếp, kết quả | QA desktop và điện thoại, mất mạng giữa trận |
| PVP-04 | Elo 1vs1, giới hạn trận mỗi ngày, chặn đánh lại, thưởng vàng, cảnh cáo phá trận | Cân bằng và kiểm chống farm |
| PVP-05 | 3vs3: phòng mời bằng mã, hàng đợi sáu người, điền AI | Test ghép trận sáu người, bỏ cuộc giữa trận |
| PVP-06 | 3vs3: bước cấm (3 tướng mỗi phe, hết giờ máy cấm), chọn tướng lần lượt, đội trưởng xếp vị trí; **màn chờ chuẩn bị** trang bị; Nộ riêng từng người | Mô phỏng chọn tướng, không trùng, hết giờ chọn; mô phỏng cân bằng Nộ riêng |
| PVP-07 | Bảng xếp hạng theo kỳ, thưởng cuối kỳ | Dùng sổ `rank_reward_claims`, nhận một lần |

## 6. Câu hỏi mở

Đã chốt ở mục 1.1 (gồm Đinh Bộ Lĩnh ở 3vs3): đội hình 1vs1 và 3vs3, cấp (cấp của chính tướng), có tính trang bị, màn chuẩn bị, cấm chọn 3 tướng mỗi phe, Nộ riêng, bỏ lượt và phá trận, Elo từng người (phá trận không tính điểm, trận có AI ít điểm hơn), giao hữu, thưởng vàng. Còn lại:

- **Đinh Bộ Lĩnh ở 3vs3:** đã chốt phương án A với một Đinh Bộ Lĩnh cho cả trận; còn cần mô phỏng cân bằng 56 kiểu, lợi thế người chọn trước và kiểm cấm theo nghề, hệ.
- **Nộ riêng:** cách tích mục 3.5 đúng ý Shan chưa (người ghép bộ trống nhận Nộ)? Cần mô phỏng cân bằng vì phe 3 người có ba thanh.
- **Cấm chọn:** thứ tự chọn xen kẽ, giờ mỗi lượt cấm và chọn (đề xuất 20 giây).
- **Màn chuẩn bị:** giờ chờ (đề xuất 60 giây) và có cho đổi nghề, hệ của Đinh Bộ Lĩnh ở đây không.
- **Điền AI:** chờ bao lâu thì điền; hệ số giảm điểm khi có AI.
- **Phá trận:** số lượt bỏ liên tiếp để cảnh cáo, mức hạn chế ghép và có reset theo mùa không.
- **Con số:** giờ mỗi lượt khi mất kết nối, số trận mỗi ngày, số lần đánh lại cùng một người, thưởng vàng mỗi trận.
- **Kênh đẩy:** polling, SSE hay dịch vụ ngoài (đề xuất polling ở bản đầu rồi đo).
- **Song song với Quần Hùng bóng ma hay thay thế dần?**
