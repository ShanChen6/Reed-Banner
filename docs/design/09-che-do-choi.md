# Chế độ chơi

> Cập nhật: 19/10/2026

## 1. Tổng quan

| Chế độ | Mô tả | Thể thức | Giai đoạn |
|---|---|---|---|
| **Luyện tập / Chơi thử** | Offline, không thưởng, không lưu (gồm trang `/demo`); có thể tắt đồng hồ 30 giây | 1vs1 hoặc 3vs3 | 1 |
| **Thường (Normal)** | Trận sinh ngẫu nhiên đấu Tianwu; chọn độ khó; lương reset mỗi trận | Người chơi chọn 1vs1 hoặc 3vs3 | 2–3 |
| **Chiến dịch (Campaign)** | Theo cốt truyện; lương mang sang; luật màn; tỉ lệ ô theo màn | Mỗi màn quy định | 4 |
| **Đánh trùm** | Đánh lại trùm đã gặp trong chiến dịch ở mức khó cao hơn, có luật "sân nhà" và phần thưởng riêng | Mỗi trùm quy định | 4 |
| **Vô hạn = Leo tháp** | Chuỗi trận riêng biệt, độ khó tăng dần | 3vs3 | Sau giai đoạn 4 |
| **Sinh tồn** | Một trận không kết thúc, đối thủ theo đợt, báo trước đợt kế tiếp | 3vs3 | Sau giai đoạn 4 |

## 2. Chiến dịch

- Chuỗi màn thử thách, có trùm là sứ quân lịch sử.
- **Cốt truyện (đã chốt hướng):**
  - Người chơi đóng vai **Đinh Bộ Lĩnh** (nhân vật chính).
  - Chiến dịch đi theo **trình tự lịch sử dẹp loạn 12 sứ quân**, mở đầu từ **thuở nhỏ** cho tới khi **lên ngôi**.
  - **Tianwu** không xuất hiện như một nhân vật trong truyện; chỉ đóng vai AI điều khiển các nhân vật đối thủ.
- **Lương mang sang trận sau:**
  - Lương vào trận được giới hạn trong khoảng **20 đến 100**, nên không bao giờ vào trận ở mức hết lương.
  - Giữa các trận có **doanh trại** để đổi vàng lấy lương.
  - Một số màn đặc biệt đặt **lương theo kịch bản** cho phe AI (ví dụ thành bị vây: AI vào trận chỉ có 25 lương).
- **Luật màn** tùy chọn: bảng tỉ lệ ô riêng, lương theo kịch bản. (Đồng hồ 30 giây mỗi lượt luôn bật, không phải luật màn.)

### 2.1 Chương 1 "Cờ lau dẹp loạn" (Claude đặt 19/10/2026, chờ Shan duyệt)

Dữ liệu ở `src/core/campaign/campaign.ts`, chơi ở trang `/campaign` (trận do server xử lý như `/play`).

- 13 màn mở lần lượt: Cờ lau tập trận ở Hoa Lư (Ninh Bình), rồi 12 sứ quân theo danh sách Shan chốt 20/10/2026; trùm cuối Đỗ Cảnh Thạc máu ×1,5.

  | # | Màn | Sứ quân (tước hiệu) | Đất (ngày nay) |
  |---|---|---|---|
  | 2 | Thử tài ở Bố Hải Khẩu | Trần Lãm (Trần Minh Công) | Kỳ Bố, Thái Bình |
  | 3 | Thu phục Đằng Châu | Phạm Bạch Hổ (Phạm Phòng Át) | Kim Động, Hưng Yên |
  | 4 | Đánh Bình Kiều | Ngô Xương Xí (Kiều công) | Triệu Sơn, Thanh Hóa |
  | 5 | Đường Lâm quy phục | Ngô Nhật Khánh, còn gọi Ngô Nam Chỉ (Ngô Nam công) | Sơn Tây, Hà Nội |
  | 6 | Vây thành Tam Đái | Nguyễn Khoan (Nguyễn Thái Bình) | Vĩnh Tường, Vĩnh Phúc |
  | 7 | Lên Phong Châu | Kiều Công Hãn (Kiều Tam Chế) | Bạch Hạc, Phú Thọ |
  | 8 | Qua đầm Hồi Hồ | Kiều Thuận (Kiều Lệnh công) | Cẩm Khê, Phú Thọ |
  | 9 | Đánh Siêu Loại | Lý Khuê (Lý Lãng công) | Thuận Thành, Bắc Ninh |
  | 10 | Hạ Tiên Du | Nguyễn Thủ Tiệp (Nguyễn Lệnh công) | Tiên Du, Bắc Ninh |
  | 11 | Thủy chiến Tế Giang | Lữ Đường (Lữ Tá công) | Văn Giang, Hưng Yên |
  | 12 | Tây Phù Liệt | Nguyễn Siêu (Nguyễn Hữu công) | Thanh Trì, Hà Nội |
  | 13 | Thành Đỗ Động | Đỗ Cảnh Thạc (Đỗ Lệnh công) | Thanh Oai, Hà Nội |
- Ba màn đầu 1vs1, sau đó 3vs3 với sứ quân và hai tùy tướng. Độ khó Dễ → Thường → Khó → Trùm; cấp đối thủ 1 → 20.
- **Sứ quân là nhân vật lịch sử có bộ kỹ năng như Đinh Bộ Lĩnh** (6 kỹ năng theo nguyên tố, mở theo cấp như nhân vật chính, có bị động khi làm thủ lĩnh). Tùy tướng dùng chiêu theo nghề.
- Luật màn đang dùng: thành bị vây (Tam Đái, đối thủ 25 lương), kho lương đầy (Tiên Du, Đỗ Động, 100 lương), đầm lầy/sông nước (Hồi Hồ, Tế Giang: bánh chưng 9%, âm dương 22%).
- Lương: vào chiến dịch với 60; lương còn lại sau mỗi trận (thắng hay thua) mang sang trận sau, kẹp trong 20–100. Doanh trại đổi 3 vàng lấy 1 lương.
- Thưởng: như trận thường (kinh nghiệm, vàng, đồ rơi), thêm vàng lần đầu qua màn (100 → 1 000).
- Cấp gợi ý đặt riêng từng màn (`recommended`), cân bằng `pnpm sim -- --stage all` ngày 20/10/2026: 140 trận mỗi màn, AI Thường đánh thay người chơi, Đinh Bộ Lĩnh xoay vòng đủ 7 hệ, cả đội ở cấp gợi ý. Mục tiêu: màn nào cũng thắng từ 50% trở lên, màn Dễ khoảng 80–90%, màn Thường 65–85%, màn Khó và trùm 50–75%.

  | Màn | Cấp đối thủ | Cấp gợi ý | Thắng (đội 2 tướng lịch sử mới nhất) | Thắng (đội khởi đầu Hà Vân + Mai Thanh) |
  |---|---|---|---|---|
  | Cờ lau tập trận | 1 | 4 | 91% | 91% (1vs1) |
  | Bố Hải Khẩu | 2 | 6 | 82% | 82% (1vs1) |
  | Đằng Châu | 3 | 6 | 79% | 79% (1vs1) |
  | Bình Kiều | 5 | 8 | 79% | 66% |
  | Đường Lâm | 6 | 9 | 88% | 75% |
  | Tam Đái | 8 | 11 | 75% | 70% |
  | Phong Châu | 9 | 14 | 64% | 59% |
  | Hồi Hồ | 10 | 14 | 84% | 48% |
  | Siêu Loại | 12 | 16 | 56% | 62% |
  | Tiên Du | 13 | 16 | 72% | 34% |
  | Tế Giang | 15 | 18 | 72% | 50% |
  | Tây Phù Liệt | 17 | 21 | 53% | 39% |
  | Đỗ Động (trùm) | 20 | 24 | 59% | 53% |

  Phong Châu trước đây chỉ 35% dù hơn đối thủ 6 cấp; nguyên nhân là chiêu riêng Phong Châu Lôi Kích (bỏ nó đi thì lên 52%). Đã giảm chiêu này, đổi phó tướng Kim thành Binh lính Thổ, hạ đối thủ xuống cấp 9. Đội khởi đầu yếu hơn hẳn ở các màn Khó, nên tướng lịch sử là phần thưởng có ý nghĩa. Cấp chênh lệch ảnh hưởng ít (thêm 1 cấp thường chỉ +2–5 điểm), đội hình và hệ khắc ảnh hưởng nhiều hơn.
- Lời dẫn và thứ tự màn dựa theo sử sách phổ thông, chỉ để làm game; Shan duyệt lại trước khi phát hành.

- **Tướng lịch sử gia nhập** (Claude đặt 20/10/2026, chờ Shan duyệt): lần đầu qua màn, một tướng vào hồ sơ ở cấp của màn (điểm kỹ năng còn nguyên để người chơi tự nâng). Xem [Nhân vật & kỹ năng](14-nhan-vat.md#5-tướng-lịch-sử).

  | Màn | Tướng gia nhập | Nghề | Hệ |
  |---|---|---|---|
  | Cờ lau tập trận | Nguyễn Bặc | Tướng sĩ | Hỏa |
  | Thử tài ở Bố Hải Khẩu | Đinh Điền | Binh lính | Thổ |
  | Thu phục Đằng Châu | Lưu Cơ | Mưu sĩ | Kim |
  | Đánh Bình Kiều | Trịnh Tú | Y sư | Mộc |
  | Vây thành Tam Đái | Lê Hoàn | Quân sư | Lôi |
  | Lên Phong Châu | Đinh Liễn | Pháp sư | Thủy |

- Mô phỏng 20/10/2026 (80 trận mỗi màn 3vs3, hơn đối thủ 3 cấp, AI Thường): đội có 2 tướng lịch sử mới nhất thắng trung bình 65%, đội mặc định (Hà Vân, Mai Thanh) 54%. Tướng lịch sử mạnh hơn vì mang 6 kỹ năng, nhưng không vượt hẳn ở mọi màn (Phong Châu 38% so với 57%, Đỗ Động 48% so với 65%). Chưa đổi số, cân chung ở lộ trình 4.4.

- **Chiêu riêng và thoại** (Claude đặt 20/10/2026, chờ Shan duyệt): mỗi sứ quân có một chiêu riêng thay ô 5 ([Nhân vật & kỹ năng](14-nhan-vat.md#6-sứ-quân)). Mỗi màn có 3 câu thoại của thủ lĩnh đối thủ: trước trận (hiện ở bản đồ chiến dịch), khi người chơi thắng và khi thua (hiện ở màn kết quả). Dữ liệu ở `lines` của từng màn trong `src/core/campaign/campaign.ts`.

- **Bản đồ cổ** (Claude vẽ 20/10/2026, chờ Shan duyệt): trang `/campaign` có bản đồ Giao Châu thế kỷ X kiểu khắc gỗ trên giấy dó (`src/app/campaign/CampaignMap.tsx`). 13 màn đặt theo vị trí gần đúng của vùng đất ngày nay (dãn các màn quá sát nhau cho dễ bấm), có sông Hồng, Đà, Lô, Đáy, Đuống, Mã, bờ biển và núi Tản Viên, Tam Đảo, Hoa Lư. Đường hành quân nối các màn theo thứ tự: đoạn đã đi nét liền đỏ son, phần còn lại nét đứt. Màn đã qua cắm cờ lau, màn đang mở có vòng nhấp nháy, màn khóa mờ đi. Bấm (hoặc Enter) một màn đã mở để xem chi tiết như bấm trong danh sách bên dưới. Bản đồ là hình cách điệu, không phải bản đồ lịch sử đo đạc.

> TODO: chương sau.

### 2.2 Đánh trùm (Claude đặt 20/10/2026, chờ Shan duyệt)

- Qua màn có sứ quân (12 màn, trừ màn tập trận) thì sứ quân đó thách đấu lại ở **3 bậc**, mở lần lượt: Bậc I mở khi qua màn, bậc sau mở khi thắng bậc trước. Code ở `src/core/campaign/raids.ts`, giao diện là khung "Đánh trùm" dưới chi tiết màn ở `/campaign`.
- Đối thủ giống màn gốc nhưng hơn cấp màn **+4 / +8 / +12** (tối đa 30), AI khó hơn màn gốc **1 / 2 / 3 nấc** (Dễ → Thường → Khó → Trùm → Ác mộng). Thủ lĩnh máu ×1,5 ở màn 3vs3 (1vs1 đã nhân máu cả hai phe nên không thêm).
- **Sân nhà:** bàn cờ nghiêng về loại ô hợp với nguyên tố sứ quân (Thủy nhiều âm dương ít bánh chưng, Thổ nhiều bánh chưng, Hỏa và Kim nhiều kiếm, Mộc nhiều tim, Lôi và Phong nhiều âm dương, trống trận) và sứ quân vào trận đầy lương (100). Người chơi vào trận với lương thường (60), không dùng lương chiến dịch.
- **Thưởng lần đầu thắng mỗi bậc:** 300 / 600 / 1000 vàng và 1 món trang bị Tinh / Bảo / Thần phẩm theo nguyên tố sứ quân (vũ khí theo nghề sứ quân). Thắng lại chỉ nhận thưởng trận thường (độ khó cao nên rơi đồ tốt hơn).
- Cấp gợi ý = cấp gợi ý của màn + 4 / 8 / 12.
- Mô phỏng 20/10/2026 (`pnpm sim -- --stage all --raid 1|2|3`, 70 trận mỗi ô, AI Thường đánh thay người chơi ở cấp gợi ý, đội có 2 tướng lịch sử): thắng trung bình 46% ở Bậc I, 46% Bậc II, 39% Bậc III, dao động 14–73% theo màn. Bậc II chưa khó hơn Bậc I vì cấp gợi ý tăng cùng cấp đối thủ, còn AI ở cấp cao khác nhau ít. Khó nhất là Bình Kiều (14–26%), Siêu Loại (24–31%) và Bố Hải (27–34%); dễ nhất Hồi Hồ (63–73%). Đây là nội dung thử thách nên để khó hơn chiến dịch; cân từng màn để sau nếu cần.
- Bản đầu cho sứ quân luôn đi trước và AI nhảy thẳng lên Trùm: thắng chỉ 6–36% ở Bậc I nên đã bỏ.

### 2.3 Bảng xếp hạng (Claude đặt 20/10/2026, chờ Shan duyệt)

- Trang `/leaderboard` có 4 bảng: **Chiến dịch**, **Từng màn** (chọn màn), **Leo tháp**, **Sinh tồn**. Mỗi bảng hiện 50 người đứng đầu và hạng của người đang xem. Thử thách hằng ngày giữ bảng riêng ở `/daily`.
- **Chiến dịch:** qua nhiều màn hơn đứng trên; bằng số màn thì tổng số lượt ít nhất của các màn đã qua ít hơn đứng trên. Màn qua trước khi có bảng (chưa lưu số lượt) tính 200 lượt.
- **Từng màn:** thắng màn đó với ít lượt nhất (đếm lượt của cả hai phe). Hồ sơ lưu số lượt ít nhất mỗi màn (`campaign.bestTurns`), chỉ tính trận thắng màn chiến dịch, không tính đánh trùm.
- **Leo tháp:** tầng cao nhất đã qua. **Sinh tồn:** số đợt nhiều nhất đã vượt.
- Bằng điểm thì người đạt điểm đó trước đứng trên. Khách hiện là "Khách" kèm 4 ký tự cuối mã.
- Server ghi điểm vào bảng `leaderboard_scores` sau mỗi lần cộng thưởng trận online; người chơi có thành tích từ trước được ghi khi mở trang. Điểm tính từ hồ sơ nên trận ở `/demo` không lên bảng. Code ở `src/core/progress/leaderboard.ts` và `src/server/leaderboard.ts`.

## 3. Leo tháp (Vô hạn)

- Máu và lương **mang sang** giữa các tầng, không tự hồi.
- Giữa các tầng chọn **1 trong 3 phần thưởng**: hồi máu, thêm lương, hoặc một "phúc" có hiệu lực đến hết lượt leo (ví dụ +10% ATK cả đội).
- Thua thì leo lại từ tầng 1. Mỗi lượt leo được sinh ngẫu nhiên khác nhau.
- Điểm = tầng cao nhất đạt được.

### 3.1 Bản đầu (Claude đặt 20/10/2026, chờ Shan duyệt)

- Trang `/tower`. Code ở `src/core/tower/` (dựng tầng), `src/core/progress/towerState.ts` (lượt leo lưu trong hồ sơ), server tạo trận khi gửi `tower: true`.
- **Đội:** đội 3vs3 đang chọn ở hồ sơ, cố định cả lượt leo; chỉ số lấy theo hồ sơ lúc vào từng tầng (lên cấp, đổi đồ giữa chừng vẫn có tác dụng). Người đã ngã giữ 0 máu cho tới khi được hồi.
- **Lương:** vào tầng 1 với 60; lương còn lại mang sang, luôn trong khoảng 20–100.
- **Đối thủ:** 3 nhân vật kèm ngẫu nhiên theo seed của lượt leo. Tầng 1 cùng cấp nhân vật chính lúc bắt đầu leo, cứ 5 tầng thêm 1 cấp (tối đa 30). Máu và công nhân hệ số sức mạnh **0,38 ở tầng 1, +0,03 mỗi tầng** (tầng 10 là 0,65, tầng 20 là 0,95). Hạ từ 0,45 ngày 20/10/2026 khi nhân vật kèm lên bộ 6 ô (đối thủ mạnh hơn, trung vị tụt từ 10 xuống 8 tầng); với 0,38 AI Thường lại leo trung vị 10 tầng ở cấp 10. AI: tầng 1–3 Dễ, 4–8 Thường, 9–15 Khó, 16–24 Trùm, từ 25 Ác mộng.
- **Tầng trùm:** cứ 5 tầng, thủ lĩnh là một sứ quân ngẫu nhiên, máu ×1,5, đánh trên sân nhà của sứ quân (bảng ô theo nguyên tố như [Đánh trùm](#22-đánh-trùm-claude-đặt-20102026-chờ-shan-duyệt)). Lần đầu vượt kỷ lục ở tầng trùm được 40 vàng × số tầng.
- **Phần thưởng giữa các tầng** (luôn đủ 3 lựa chọn): Hồi máu (người còn đứng +50% máu tối đa, người đã ngã đứng dậy với 30%), Thêm lương (+30), hoặc một phúc ngẫu nhiên cộng dồn: Hùng khí +10% công, Thiết giáp +15% thủ, Bền chí +10% máu tối đa.
- Mỗi tầng thắng hay thua vẫn nhận kinh nghiệm, vàng và đồ rơi như trận thường. Không bỏ được lượt leo khi đang có trận.
- **Vì sao dùng hệ số sức mạnh:** bản đầu tăng cấp đối thủ mỗi tầng thì AI leo thay người chơi chết ở tầng 1–2, vì người thắng thường còn ít máu và chênh cấp ít tác dụng. Hệ số nhân thẳng vào máu và công chỉnh được độ khó rõ ràng hơn.
- Mô phỏng 20/10/2026 (`pnpm sim -- --tower --level N --battles 50`, AI Thường leo thay người chơi với đội khởi đầu, chọn thưởng: có người ngã hoặc máu dưới nửa thì hồi máu, lương dưới 40 thì thêm lương, còn lại lấy phúc):

  | Cấp | Tầng trung bình | Trung vị | p90 | Qua tầng 5 | Qua tầng 10 | Qua tầng 15 |
  |---|---|---|---|---|---|---|
  | 5 | 10,5 | 10 | 14 | 94% | 60% | 8% |
  | 10 | 9,7 | 10 | 14 | 78% | 54% | 6% |
  | 20 | 9,1 | 10 | 14 | 78% | 50% | 8% |
  | 30 | 10,6 | 11 | 19 | 82% | 56% | 16% |

## 4. Sinh tồn

- Cùng một bàn cờ trong suốt lượt chơi. Đối thủ kéo đến theo **đợt**, mạnh dần.
- **Đợt ≠ lượt.** Một đợt là một nhóm đối thủ kéo vào sân; đợt kết thúc khi toàn bộ đối thủ của đợt bị hạ gục. Mục tiêu tạm thời: 2–3 đối thủ mỗi đợt, khoảng 6–10 lượt mỗi bên (2–3 phút).
- **Báo trước** đợt kế tiếp, ví dụ "3 lượt nữa: 2 Tướng sĩ hệ Hỏa", để người chơi chuẩn bị phòng thủ.
- **Đội hình của một lượt Sinh tồn:** roster khóa lúc bắt đầu gồm Đinh Bộ Lĩnh, hai active companions và tối đa hai reserve companions đã sở hữu. Tổng roster từ 3–5 fighter; battle luôn có đúng ba active. Đinh Bộ Lĩnh cố định ở active slot 0 và luôn là thủ lĩnh. Reserve không xuất hiện trong battle, không hành động và không thể bị nhắm mục tiêu.
- **Đổi tướng giữa các đợt:** chỉ sau khi thắng, tại BREAK; không đổi trong round. Có thể thay một hoặc cả hai active companion bằng reserve còn sống. Active bị thay (dù còn sống hay đã gục) chuyển về reserve, giữ nguyên HP, energy và lịch sử `downedAtWave`; reserve đưa vào active giữ nguyên state. Không thể đưa fighter gục vào active, chuyển Đinh Bộ Lĩnh khỏi vị trí thủ lĩnh, hoặc thay đổi roster ID đã khóa. Nếu có reserve sống, fighter active gục phải được thay để bắt đầu round kế; nếu không có reserve sống thì giữ nguyên slot gục. Lựa chọn rotation chỉ được áp dụng khi server xác nhận bắt đầu round kế tiếp.
- **Hồi phục đúng một lần sau khi thắng round**, theo vai trò fighter đảm nhiệm trong wave vừa kết thúc: active còn sống +20% max HP; reserve còn sống +10% max HP (mức production hiện tại, chưa được phê duyệt điều chỉnh qua balance sign-off). HP bị giới hạn ở max HP; fighter gục không được hồi. Đổi vị trí trong BREAK không làm đổi tỷ lệ hồi đã được xác định cho round vừa thắng.
- **Lương:** cộng +25 ở BREAK, tối đa 100; nếu dừng lượt chơi thì không chạy settlement của round kế. Khi bắt đầu round, lương và các khoản tiêu hao theo battle rules hiện hành được giữ nguyên.
- **Hồi sinh người đã gục:**
  - **Tự động** sau **2 đợt** kể từ lúc gục (đếm riêng từng người), với 30% máu và 0 năng lượng.
  - **Hoặc** tiêu **40 lương** ở lần nghỉ giữa đợt để hồi sinh ngay, với 30% máu và 0 năng lượng.
  - Mỗi lần nghỉ giữa đợt chỉ hồi sinh tối đa **1 người**.
  - Lương được cộng trước khi kiểm tra chi phí. Nếu auto-revive đã đến hạn thì ưu tiên auto và không nhận thêm paid revive trong cùng BREAK. Reserve hồi sinh vẫn ở reserve, không tự vào active.
  - Nhân vật chính gục thì vẫn chơi tiếp bằng hai nhân vật kèm và chờ hồi sinh như trên.
- **Đinh Bộ Lĩnh:** run ban đầu snapshot nghề/nguyên tố đang lưu trong Profile; trong Survival V1.1 chỉ đổi nghề/hệ tại BREAK. Lựa chọn BREAK miễn phí và chỉ thuộc snapshot Survival, không sửa Profile. Build mới dùng progression, gear và builder hiện hành; khi max HP thay đổi, HP ratio được giữ theo baseline xác nhận, fighter HP 0 vẫn 0. Bộ kỹ năng nghề/hệ và passive hợp lệ theo cấp được dựng lại cho round kế; không mở khóa hoặc cấp điểm kỹ năng mới. Energy và Nộ không được tạo thêm bởi thao tác build.
- **Tinh thần / round kế:** dùng luật battle hiện hành; khi bắt đầu wave mới, tinh thần reset theo luật hiện tại, hiệu ứng tạm thời bị xóa, energy của fighter sống và Nộ phe được giữ, bàn cờ/RNG bàn cờ được bảo toàn. Fighter vừa hồi sinh vào trận có 0 energy.
- **Thất bại:** nếu cả ba active gục trong wave thì lượt Sinh tồn kết thúc ngay, kể cả khi còn reserve sống. Reserve không tự động nhảy vào trận. Người chơi cũng có thể dừng ở BREAK; bỏ dở quá 24 giờ chốt ở wave đã vượt qua theo luật cũ.
- **Luồng chuyển round:** server xác nhận battle thắng → đồng bộ fighter state theo ID và đánh dấu gục → áp recovery active/reserve một lần → cộng lương → xử lý tối đa một auto/paid revive → xác thực rotation và build Đinh Bộ Lĩnh → dựng đúng ba active và opponent kế → giữ board/rage, áp dụng reset turn/spirit/effects hiện hành → lưu transition atomically theo Match sequence. Client không tự tính hoặc cấp recovery/reward.
- **Lưu điểm theo đợt:** bỏ dở quá 24 giờ thì không xử thua; lượt chơi kết thúc ở đợt cuối cùng đã hoàn thành, và điểm vẫn được ghi.
- Điểm = số đợt đã vượt qua.

### 4.1 Bản đầu (Claude đặt 20/10/2026, chờ Shan duyệt; baseline trước V1.1)

Trang `/survival`, code ở `src/core/survival/`. Cả lượt chơi là **một trận** trên server (`Match.survival`), nghỉ giữa đợt làm ngay trong trận.

- **Đội:** ở baseline trước V1.1 là đội 3vs3 đã chọn ở trang Hồ sơ. V1.1 thay bằng roster snapshot 3 active + tối đa 2 reserve mô tả ở mục 4; người chơi luôn đi trước ở mỗi đợt.
- **Đối thủ mỗi đợt:**
  - Đợt 1–2 có 2 đối thủ, từ đợt 3 có 3. Đối thủ thay **toàn bộ** phe AI (không lấp chỗ từng người).
  - Cứ 5 đợt có một đợt trùm: một sứ quân dẫn 2 tùy tướng, sứ quân máu ×1,5.
  - Baseline ban đầu lấy đối thủ từ 14 nhân vật kèm. Implementation hiện tại sinh theo seed riêng từ pool 42 nhân vật kèm (5 khởi đầu + 37 cửa hàng); seed chỉ nằm trên server.
  - Cấp: bằng cấp nhân vật chính lúc bắt đầu, cứ 4 đợt thêm 1 cấp (tối đa 30).
  - Sức mạnh (nhân vào công): 0,45 ở đợt 1, mỗi đợt thêm 0,05. Máu nhân thêm 0,6 để mỗi đợt ngắn.
  - Độ khó AI: đợt 1–2 Dễ, 3–6 Thường, 7–12 Khó, 13–20 Trùm, từ 21 Ác mộng.
- **Đợt mới vào sân:** bàn cờ giữ nguyên. Phe người chơi giữ năng lượng và Nộ, xóa mọi hiệu ứng, tinh thần và đếm lượt bắt đầu lại.
- **Báo trước:** trong lúc đánh luôn hiện đợt kế tiếp (số đối thủ, cấp, tên và hệ). Chưa làm kiểu đếm ngược "3 lượt nữa".
- **Hồi sinh:**
  - "Sau 2 đợt" tính cả đợt bị gục: gục ở đợt 3 thì nghỉ đợt 4, vào lại đợt 5.
  - Mỗi lần nghỉ tối đa 1 người đứng dậy. Đã có người tự đứng dậy thì không trả lương được nữa.
  - Lương để trả tính sau khi đã cộng +25.
- **Dừng:**
  - Lúc nghỉ giữa đợt có nút dừng để ghi điểm.
  - Bỏ dở quá 24 giờ thì lượt chơi dừng ở đợt cuối đã vượt qua, không tính là thua.
- **Thưởng khi kết thúc:**
  - 10 vàng mỗi đợt vượt qua.
  - Vàng và sách nhặt trên bàn cờ cả lượt chơi.
  - Món rơi theo độ khó của đợt cuối.
  - Vượt qua ít nhất 1 đợt thì tính là thắng (kinh nghiệm, món rơi).
- **Kỷ lục:** hồ sơ lưu `survival.best`.

Mô phỏng baseline lịch sử: `pnpm sim -- --survival --battles 50`. AI Thường đánh thay người chơi, đội khởi đầu, trả lương hồi sinh khi còn ít nhất 30 lương sau khi trả. Các số dưới đây được lưu từ bản cũ; xem [báo cáo simulation V1.1](../survival-v1.1/23-balance-report.md) để biết baseline mới có seed và giới hạn so sánh.

| Cấp | Trung bình | Trung vị | p90 | Qua đợt 10 | Qua đợt 15 | Lượt mỗi đợt (2 phe) |
|---|---|---|---|---|---|---|
| 5 | 11,1 | 11 | 15 | 62% | 12% | 19,3 |
| 10 | 11,3 | 12 | 15 | 66% | 12% | 19,2 |
| 20 | 10,7 | 11 | 14 | 62% | 2% | 19,7 |
| 30 | 12,4 | 12 | 17 | 86% | 18% | 20,0 |

Mỗi đợt khoảng 10 lượt mỗi bên, đúng mức trên của mục tiêu 6–10.

## 5. Chế độ bổ sung

- 🗓️ **Thử thách hằng ngày:** một seed chung cho mọi người chơi mỗi ngày, mỗi người chơi một lần, xếp hạng theo số lượt hoặc máu còn lại. Seed vẫn chỉ nằm trên server.
- 🧩 **Thế cờ:** bàn cờ dựng sẵn, ô rơi cố định, hạ gục đối thủ trong đúng K nước.
- ⚔️ **Đấu trường bóng ma:** PvP không đồng bộ, đánh với đội hình của người chơi khác do AI điều khiển. Bản đầu ở mục 5.3.
- **Cơ chế giữ chân:** nhiệm vụ ngày/tuần, thành tựu, bộ sưu tập nhân vật.

### 5.1 Thử thách hằng ngày (Claude đặt 20/10/2026, chờ Shan duyệt)

Trang `/daily`, code ở `src/core/daily/` (đề và điểm), `src/server/daily.ts` (seed, lượt, bảng xếp hạng), bảng `daily_entries`.

- **Ngày:** đổi lúc 0 giờ giờ Việt Nam (UTC+7).
- **Seed:** HMAC của khóa bí mật server (`SESSION_SECRET`) với ngày, nên không đoán trước được đề ngày mai. Bàn cờ, ô rơi và AI dùng cùng seed: ai đi cùng nước thì gặp cùng ô rơi.
- **Đề như nhau với mọi người:**
  - Đội cho sẵn: Đinh Bộ Lĩnh với nguyên tố và nghề theo đề, cùng 2 nhân vật kèm.
  - Đối thủ: một sứ quân dẫn 2 tùy tướng, đánh trên sân nhà của sứ quân.
  - Mọi nhân vật cấp 10, không trang bị.
  - AI mức Khó, người chơi đi trước. Hồ sơ người chơi không ảnh hưởng gì tới đề.
- **Một lượt mỗi ngày:** server ghi chỗ trong `daily_entries` trước khi tạo trận (khóa chính ngày + người chơi). Tải lại trang vẫn tiếp tục được trận đang dở.
- **Điểm và xếp hạng:**
  - Thắng luôn đứng trên thua.
  - Cùng thắng thì ít lượt hơn đứng trên, rồi tới còn nhiều máu hơn.
  - Thua thì xếp theo sát thương đã gây.
  - Cùng điểm thì ai xong trước đứng trên.
  - Bảng hiện 20 người đầu, kèm hạng của mình. Khách hiện "Khách" kèm 4 ký tự cuối của id.
- **Thưởng:** 150 vàng khi thắng, 50 vàng khi thua. Không có kinh nghiệm hay món rơi, vì đội là đội của đề.
- Mô phỏng 60 đề: AI Thường thắng AI Khó 65%, trung bình 39 lượt (hai phe).

### 5.2 Nhiệm vụ, thành tựu, điểm danh (Claude đặt 20/10/2026, chờ Shan duyệt)

Trang `/quests`, code ở `src/core/progress/quests.ts` và `achievements.ts`, lưu trong hồ sơ (`quests`).

- **Thời điểm đổi:** ngày đổi lúc 0 giờ giờ Việt Nam, tuần bắt đầu thứ Hai.
- **Cách đếm:** server cộng tiến độ khi trận online kết thúc (cùng lúc cộng thưởng). Trận ở /demo không tính.
- **Nhận thưởng:** người chơi bấm Nhận; server kiểm tra lại rồi mới cộng vàng.

| Nhiệm vụ ngày | Mục tiêu | Vàng |
|---|---|---|
| Đánh trận | 3 | 60 |
| Thắng trận | 2 | 80 |
| Nhặt ô vàng trên bàn cờ | 30 | 60 |
| Đánh thử thách ngày | 1 | 50 |

| Nhiệm vụ tuần | Mục tiêu | Vàng |
|---|---|---|
| Thắng trận | 15 | 400 |
| Thắng trận chiến dịch hoặc đánh trùm | 5 | 300 |
| Qua tầng tháp | 10 | 300 |
| Vượt đợt sinh tồn | 20 | 300 |
| Đánh thử thách ngày (số hôm) | 5 | 300 |

- **Thắng trận sinh tồn:** tính là thắng khi vượt qua ít nhất 1 đợt.
- **Thành tựu (nhận một lần):**
  - Thắng trận: 1 trận (50 vàng), 50 trận (300), 200 trận (1000).
  - Qua hết chương 1 chiến dịch: 500.
  - Tháp tầng 10 / 25: 300 / 800.
  - Sinh tồn 10 / 20 đợt: 300 / 800.
  - Thử thách ngày 7 hôm: 300.
  - Điểm danh 7 ngày liền: 300.
  - Đinh Bộ Lĩnh cấp 10 / 30: 200 / 1000.
- **Điểm danh:**
  - Mỗi ngày một lần.
  - Chuỗi 7 ngày nhận lần lượt 50, 60, 80, 100, 120, 150, 300 vàng.
  - Bỏ một ngày thì chuỗi về ngày 1. Đủ 7 ngày thì bắt đầu chuỗi mới.

### 5.3 Đấu trường bóng ma (Claude đặt 20/10/2026, chờ Shan duyệt)

Trang `/arena`, code ở `src/core/arena/` (đội phòng thủ, bóng ma máy tạo, điểm), `src/server/arena.ts` (kho, bày đối thủ), bảng `arena_players`.

- **Đội phòng thủ:** bản chụp đội 3vs3 đang chọn ở hồ sơ (chỉ số, kỹ năng, trang bị lúc chụp). Tự chụp khi mở đấu trường lần đầu; nâng cấp hay đổi đội xong thì bấm "Cập nhật theo đội hiện tại". Nhân vật chính của đội phòng thủ mang tên chủ đội.
- **Đánh:** mỗi lần bày 3 đối thủ, ưu tiên người chơi thật có điểm gần mình nhất (chọn ngẫu nhiên trong 12 người gần nhất), thiếu thì thêm "bóng ma luyện tập" do máy tạo (đội ngẫu nhiên cùng cấp, không trang bị, 1000 điểm). Bấm "Đổi đối thủ" thì bày lại, miễn phí. Người đánh dùng đội 3vs3 đang chọn; đội phòng thủ do AI mức Khó điều khiển. Ai đi trước bốc ngẫu nhiên.
- **Lượt:** 10 trận mỗi ngày, đổi lúc 0 giờ giờ Việt Nam. Đánh xong thì đối thủ đã bày bị xóa, mở lại trang có đối thủ mới.
- **Điểm (kiểu Elo):** bắt đầu 1000. Người đánh đổi 32 × (kết quả − kỳ vọng), người phòng thủ đổi ngược dấu một nửa (16 ×). Ngang điểm thì thắng +16, thua −16, người phòng thủ −8/+8. Điểm không xuống dưới 0. Bóng ma máy tạo luôn 1000 điểm, nên càng lên cao đánh bóng ma càng ít điểm.
- **Thưởng:** thưởng trận thường (kinh nghiệm, vàng nhặt, món rơi theo độ khó Khó) và thêm 50 vàng khi thắng.
- **Bảng xếp hạng:** tab Đấu trường ở `/leaderboard`, theo điểm; lên bảng khi có đội phòng thủ.
- **Chưa làm:** nhật ký bị đánh (chỉ có số trận giữ được và bị mất), mùa giải và thưởng theo hạng, chặn đánh lại cùng một người.
