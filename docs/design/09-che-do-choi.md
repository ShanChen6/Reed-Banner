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

- **Tướng lịch sử gia nhập** (Claude đặt 20/10/2026, chờ Shan duyệt): lần đầu qua màn, một tướng vào hồ sơ ở cấp của màn (điểm kỹ năng còn nguyên để người chơi tự nâng). Xem [Nhân vật & kỹ năng](06-nhan-vat-ky-nang.md#46-tướng-lịch-sử).

  | Màn | Tướng gia nhập | Nghề | Hệ |
  |---|---|---|---|
  | Cờ lau tập trận | Nguyễn Bặc | Tướng sĩ | Hỏa |
  | Thử tài ở Bố Hải Khẩu | Đinh Điền | Binh lính | Thổ |
  | Thu phục Đằng Châu | Lưu Cơ | Mưu sĩ | Kim |
  | Đánh Bình Kiều | Trịnh Tú | Y sư | Mộc |
  | Vây thành Tam Đái | Lê Hoàn | Quân sư | Lôi |
  | Lên Phong Châu | Đinh Liễn | Pháp sư | Thủy |

- Mô phỏng 20/10/2026 (80 trận mỗi màn 3vs3, hơn đối thủ 3 cấp, AI Thường): đội có 2 tướng lịch sử mới nhất thắng trung bình 65%, đội mặc định (Hà Vân, Mai Thanh) 54%. Tướng lịch sử mạnh hơn vì mang 6 kỹ năng, nhưng không vượt hẳn ở mọi màn (Phong Châu 38% so với 57%, Đỗ Động 48% so với 65%). Chưa đổi số, cân chung ở lộ trình 4.4.

- **Chiêu riêng và thoại** (Claude đặt 20/10/2026, chờ Shan duyệt): mỗi sứ quân có một chiêu riêng thay ô 5 ([Nhân vật & kỹ năng](06-nhan-vat-ky-nang.md#47-chiêu-riêng-của-nhân-vật-lịch-sử)). Mỗi màn có 3 câu thoại của thủ lĩnh đối thủ: trước trận (hiện ở bản đồ chiến dịch), khi người chơi thắng và khi thua (hiện ở màn kết quả). Dữ liệu ở `lines` của từng màn trong `src/core/campaign/campaign.ts`.

- **Bản đồ cổ** (Claude vẽ 20/10/2026, chờ Shan duyệt): trang `/campaign` có bản đồ Giao Châu thế kỷ X kiểu khắc gỗ trên giấy dó (`src/app/campaign/CampaignMap.tsx`). 13 màn đặt theo vị trí gần đúng của vùng đất ngày nay (dãn các màn quá sát nhau cho dễ bấm), có sông Hồng, Đà, Lô, Đáy, Đuống, Mã, bờ biển và núi Tản Viên, Tam Đảo, Hoa Lư. Đường hành quân nối các màn theo thứ tự: đoạn đã đi nét liền đỏ son, phần còn lại nét đứt. Màn đã qua cắm cờ lau, màn đang mở có vòng nhấp nháy, màn khóa mờ đi. Bấm (hoặc Enter) một màn đã mở để xem chi tiết như bấm trong danh sách bên dưới. Bản đồ là hình cách điệu, không phải bản đồ lịch sử đo đạc.

> TODO: chương sau.

## 3. Leo tháp (Vô hạn)

- Máu và lương **mang sang** giữa các tầng, không tự hồi.
- Giữa các tầng chọn **1 trong 3 phần thưởng**: hồi máu, thêm lương, hoặc một "phúc" có hiệu lực đến hết lượt leo (ví dụ +10% ATK cả đội).
- Thua thì leo lại từ tầng 1. Mỗi lượt leo được sinh ngẫu nhiên khác nhau.
- Điểm = tầng cao nhất đạt được.

> TODO: danh sách phần thưởng giữa các tầng.

## 4. Sinh tồn

- Cùng một bàn cờ trong suốt lượt chơi. Đối thủ kéo đến theo **đợt**, mạnh dần.
- **Đợt ≠ lượt.** Một đợt là một nhóm đối thủ kéo vào sân; đợt kết thúc khi toàn bộ đối thủ của đợt bị hạ gục. Mục tiêu tạm thời: 2–3 đối thủ mỗi đợt, khoảng 6–10 lượt mỗi bên (2–3 phút).
- **Báo trước** đợt kế tiếp, ví dụ "3 lượt nữa: 2 Tướng sĩ hệ Hỏa", để người chơi chuẩn bị phòng thủ.
- **Hồi phục cố định giữa các đợt:**
  - Người còn sống: +20% máu tối đa.
  - Lương chung: +25.
- **Hồi sinh người đã gục:**
  - **Tự động** sau **2 đợt** kể từ lúc gục (đếm riêng từng người), với 30% máu và 0 năng lượng.
  - **Hoặc** tiêu **40 lương** ở lần nghỉ giữa đợt để hồi sinh ngay, với 30% máu và 0 năng lượng.
  - Mỗi lần nghỉ giữa đợt chỉ hồi sinh tối đa **1 người**.
  - Nhân vật chính gục thì vẫn chơi tiếp bằng hai nhân vật kèm và chờ hồi sinh như trên.
- **Lưu điểm theo đợt:** bỏ dở quá 24 giờ thì không xử thua; lượt chơi kết thúc ở đợt cuối cùng đã hoàn thành, và điểm vẫn được ghi.
- Điểm = số đợt đã vượt qua.

> TODO: số đối thủ mỗi đợt, đường cong sức mạnh, cách đối thủ mới vào sân (lấp chỗ người đã gục).

## 5. Chế độ bổ sung

- 🗓️ **Thử thách hằng ngày:** một seed chung cho mọi người chơi mỗi ngày, mỗi người chơi một lần, xếp hạng theo số lượt hoặc máu còn lại. Seed vẫn chỉ nằm trên server.
- 🧩 **Thế cờ:** bàn cờ dựng sẵn, ô rơi cố định, hạ gục đối thủ trong đúng K nước.
- ⚔️ **Đấu trường bóng ma:** PvP không đồng bộ, đánh với đội hình của người chơi khác do AI điều khiển (làm sau cùng).
- **Cơ chế giữ chân:** nhiệm vụ ngày/tuần, thành tựu, bộ sưu tập nhân vật.
