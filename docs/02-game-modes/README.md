# Chế độ chơi

> **Quyết định sản phẩm mới (27/10/2026):** tham khảo [Game Modes 2026: định hướng, Binh Pháp và Song Tháp](future/README.md). Nội dung chi tiết bên dưới mô tả **implementation baseline trước khi triển khai các đề xuất**, không có nghĩa mode mới đã tồn tại. Các giá trị Trial 20 / Destiny 10 / nhãn Sinh tồn ở bảng dưới là **trạng thái code hiện tại**, còn định hướng tương lai xem tài liệu mới.

> Cập nhật: 01/11/2026 (khách và chế độ xếp hạng, Bình Loạn không có bảng, hướng PvP Quần Hùng; 31/10: thêm Trận Đồ bản chơi thử; 25/10: CAMP-08.04 gỡ chiến dịch 13 màn cũ, tách Đánh trùm/BXH/nhiệm vụ khỏi màn cũ)

## 1. Tổng quan

| Chế độ | Mô tả | Thể thức | Giai đoạn |
|---|---|---|---|
| **Luyện tập / Chơi thử** | Offline, không thưởng, không lưu (gồm trang `/demo`); có thể tắt đồng hồ 30 giây | 1vs1 hoặc 3vs3 | 1 |
| **Thường (Normal)** | Trận sinh ngẫu nhiên đấu Tianwu; chọn độ khó; lương reset mỗi trận | Người chơi chọn 1vs1 hoặc 3vs3 | 2–3 |
| **Chiến dịch (Campaign V2)** | 6 chương, 24 nhiệm vụ (sự kiện, ngoại giao, trận); lương mang sang; địa hình theo nhiệm vụ | Mỗi nhiệm vụ có trận quy định | 4 |
| **Đánh trùm** | Tái đấu 6 sứ quân bị đánh dẹp ở mức khó cao hơn, mở theo mốc chiến dịch, có luật "sân nhà" và phần thưởng riêng | Mỗi sứ quân quy định | 4 |
| **Tháp Thí Luyện (Trial)** | 20 tầng cố định, luật đội hình/bàn cờ và thưởng đá lần đầu | 3vs3 | Song Tháp V1.0 |
| **Tháp Vận Mệnh (Destiny)** | Run 10 tầng theo chu kỳ tuần, roster khóa và tài nguyên xuyên tầng | 3vs3 | Song Tháp V1.0 |
| **Sinh tồn** | Một trận không kết thúc, đối thủ theo đợt, báo trước đợt kế tiếp | 3vs3 | Sau giai đoạn 4 |
| **Trận Đồ** | Game xếp quân theo nghề/hệ, không đánh nhau; chơi thử offline (không thưởng) và xếp hạng có thưởng trên server (tắt mặc định, `FORMATION_RANKED_ENABLED`). Luật ở [GDD Binh Pháp](future/02-binh-phap-gdd.md#11-bản-triển-khai-đầu-tiên-chơi-thử-offline) | Một người, 4 bậc 3×3–8×8 | Sau Song Tháp |

## 2. Chiến dịch

- **Campaign V2** là chiến dịch duy nhất: 6 chương, 24 nhiệm vụ M01–M24, từ thuở nhỏ ở Hoa Lư tới Đại lễ đăng quang năm 968. Phạm vi, đồ thị mở khóa, thưởng và quy tắc nguồn sử ở `docs/02-game-modes/campaign/` (`design-freeze.md`, `mission-matrix.md`, `history-sources.md`). Code ở `src/core/campaign/` (`storyNodes.ts`, `encounters.ts`, `scenarios.ts`, `rewards.ts`), chơi ở `/game/campaign`.
- Người chơi đóng vai **Đinh Bộ Lĩnh**. **Tianwu** không xuất hiện như một nhân vật trong truyện; chỉ đóng vai AI điều khiển các nhân vật đối thủ.
- **Loại nhiệm vụ:** sự kiện, chuẩn bị và ngoại giao hoàn thành qua `completeCampaignEvent` (không phải trận, không tính lượt); trận, phòng thủ, công thành và trùm hoàn thành khi server chốt trận đạt mục tiêu.
- **Lương mang sang trận sau:** kẹp trong **20 đến 100**, bắt đầu 60, doanh trại đổi 3 vàng lấy 1 lương (mua ở màn chuẩn bị trận). Lương chốt theo phần chênh của chính trận đó (CAMP-08.03). Sự kiện và ngoại giao không trừ, không nạp lương.
- Thưởng: như trận thường (kinh nghiệm, vàng, đồ rơi), thêm vàng lần đầu hoàn thành nhiệm vụ và mốc chương; tướng lịch sử mở theo mốc chương. Chiến dịch không phát Đá Cường Hóa.
  - Vàng lần đầu cả 24 nhiệm vụ là 3 975 (50–300 mỗi nhiệm vụ, `storyNodes.ts`), cộng 6 × 250 vàng chương
    (`CAMPAIGN_CHAPTER_FIRST_CLEAR_GOLD`) và thành tựu "Chương I" và "Hoàn thành chiến dịch" (500 mỗi cái). Tổng là
    6 475 vàng một lần.
  - Thưởng nhiệm vụ chỉ có trường `firstClearGold`: không có đá, không có trang bị cố định.
  - Mọi thưởng lần đầu ghi biên nhận `node:<M..>` / `chapter:<n>` do server chốt, nên đánh lại hay gửi lại chỉ nhận
    thưởng trận thường.
- **Sử liệu:** mỗi đoạn lời kể mang nhãn `recorded` / `reconstructed` / `disputed` / `fictional` và mã nguồn theo
  `docs/02-game-modes/campaign/history-sources.md`. Tình tiết game sáng tác ghi rõ là hư cấu. Hậu truyện 970 (Thái Bình) và 971
  chỉ là ghi chú nguồn, không có cảnh chơi.
- **Độ khó** (CAMP-09.02, `docs/02-game-modes/campaign/balance-report.md`): đo bằng
  `pnpm exec tsx scripts/campaign-balance.ts --runs 200`. Mô phỏng chốt đúng mục tiêu server (phòng thủ đủ lượt,
  ngưỡng máu trùm, công thành nhiều phase). Với đội tướng lịch sử ở cấp gợi ý, không đồ, AI Thường đánh thay:
  - M03/M04 khoảng 100%; M07 66%;
  - trùm Chương IV–V 54–74%;
  - M20 30% trong một lượt (khoảng 4.7 trận);
  - M21 18% (khoảng 5.5 trận), vì server giữ phase đã qua.
- Kiểm thử E2E M01 → M24 và hồi quy các chế độ: `docs/02-game-modes/campaign/regression-report.md`. Nghiệm thu phát hành:
  `docs/02-game-modes/campaign/final-acceptance.md`.

### 2.1 Đánh trùm (Claude đặt 20/10/2026, chuyển sang Campaign V2 ở CAMP-08.04)

- Chế độ lặp lại riêng, không phải nhiệm vụ chiến dịch và không chặn kết thúc chiến dịch. **Chỉ 6 sứ quân bị đánh dẹp trong cốt truyện là trùm** (nhóm `military` của sổ thế cục `factions.ts`; Shan chốt 25/10/2026, design-freeze bổ sung 1.1), mỗi trận là **tái đấu**. Mỗi người mở sau nhiệm vụ mốc (`unlockedContent` của nhiệm vụ): Kiều Công Hãn M15, Kiều Thuận M16, Lý Khuê M17, Nguyễn Thủ Tiệp M18, Nguyễn Siêu M20, Đỗ Cảnh Thạc M21. Server chỉ mở khi nhiệm vụ đó đã có trong `campaign.completed`.
- Trần Lãm (đồng minh), Phạm Bạch Hổ, Ngô Xương Xí, Ngô Nhật Khánh (quy phục), Nguyễn Khoan và Lữ Đường (tan rã/chưa chắc) không có trận Đánh trùm; mốc của họ (M08, M11–M14, M19) chỉ mở bán ở cửa hàng. Tất cả trùm đều đánh 3vs3.
- **3 bậc**, mở lần lượt: Bậc I mở khi qua mốc, bậc sau mở khi thắng bậc trước. Bậc lưu ở `campaign.raids[idSứQuân]`, giữ qua mọi lần đặt lại tiến độ chiến dịch. Code ở `src/core/campaign/raids.ts`, giao diện là khu "Đánh trùm" dưới chiến dịch (`src/app/game/campaign/RaidPanel.tsx`); sứ quân chưa mở không lộ tên.
- Payload tạo trận: `{ raidBoss: <id sứ quân>, raid: 1|2|3 }`. Thiếu một trong hai, id lạ, id màn cũ hay trộn với chế độ khác đều bị từ chối.
- Đối thủ là sứ quân và tùy tướng của danh mục ở cấp gốc **+4 / +8 / +12** (tối đa 30), AI khó hơn mức gốc **1 / 2 / 3 nấc** (Dễ → Thường → Khó → Trùm → Ác mộng). Thủ lĩnh máu ×1,5 (cả 6 trùm đều đánh 3vs3).
- **Sân nhà:** bàn cờ nghiêng về loại ô hợp với nguyên tố sứ quân (`HOME_TERRAIN`) và sứ quân vào trận đầy lương (100). Người chơi vào trận với lương thường, không dùng và không đổi lương chiến dịch.
- **Thưởng lần đầu thắng mỗi bậc:** 300 / 600 / 1000 vàng và 1 món trang bị Tinh / Bảo / Thần phẩm theo nguyên tố sứ quân (vũ khí theo nghề sứ quân). Thắng lại chỉ nhận thưởng trận thường. Đánh trùm không đổi tiến độ, lương hay thế cục chiến dịch.
- Cấp gợi ý = cấp gợi ý gốc của sứ quân + 4 / 8 / 12.
- Mô phỏng: `pnpm sim -- --raid 1|2|3 [--boss <id> | all] [--team heroes|default] [--sweep 0..6]`. Đội "heroes" là 2 tướng lịch sử mở muộn nhất tính tới nhiệm vụ mốc của sứ quân. Số liệu 20/10/2026 (đo theo màn cũ, AI Thường đánh thay người chơi ở cấp gợi ý): thắng trung bình 46% Bậc I, 46% Bậc II, 39% Bậc III; chưa đo lại vì luật trận không đổi.

### 2.2 Bảng xếp hạng (Claude đặt 20/10/2026, chuyển sang Campaign V2 ở CAMP-08.04)

- Trang bảng xếp hạng có các bảng: **Sinh tồn**, **Đấu trường**, **Vận Mệnh**. Sinh tồn và Đấu trường mặc định hiện **bảng mùa tuần này**, có nút chuyển sang **Mọi thời đại** (bảng cộng dồn cũ); xem [mục 6.3](#63-mùa-theo-tuần-của-trấn-ải-và-quần-hùng). Mỗi bảng hiện 50 người đứng đầu và hạng của người đang xem. Thử thách hằng ngày giữ bảng riêng, Trận Đồ xếp hạng nằm trong màn Trận Đồ.
- **Bình Loạn không có bảng xếp hạng** (Shan, 01/11/2026): chiến dịch là chế độ offline theo tuyến lịch sử. Hai bảng **Chiến dịch** và **Từng trận** dưới đây đã bị gỡ khỏi giao diện; server và dữ liệu cũ (`campaign`, `mission:<M..>`) vẫn còn, chưa xóa.
- **Chiến dịch (đã gỡ khỏi giao diện):** hoàn thành nhiều nhiệm vụ V2 hơn đứng trên (sự kiện và ngoại giao cũng tính là hoàn thành); bằng số nhiệm vụ thì tổng số lượt ít nhất của các **nhiệm vụ có trận** ít hơn đứng trên. Sự kiện không có lượt nên không cộng gì; nhiệm vụ có trận đã xong mà chưa có số lượt tính 200 lượt.
- **Từng trận (đã gỡ khỏi giao diện)** (`mission:<M..>`): hoàn thành nhiệm vụ có trận đó với ít lượt nhất (đếm lượt của cả hai phe), lấy từ `campaign.bestBattleTurns`. Chỉ nhiệm vụ trận, phòng thủ, công thành, trùm có bảng; không tính đánh trùm.
- **Sinh tồn:** số đợt nhiều nhất đã vượt.
- Bằng điểm thì người đạt điểm đó trước đứng trên. Khách hiện là "Khách" kèm 4 ký tự cuối mã.
- Server ghi điểm vào bảng `leaderboard_scores` sau mỗi lần cộng thưởng trận online; người chơi có thành tích từ trước được ghi khi mở trang. Code ở `src/core/progress/leaderboard.ts` và `src/server/leaderboard.ts`.

## 3. Tháp

### 3.1 Song Tháp V1.0

Song Tháp gồm hai chế độ hiện hành: Tháp Thí Luyện và Tháp Vận Mệnh.

- **Trial — Tháp Thí Luyện:** 20 tầng cố định; mỗi lần thử reset HP/lương; chọn ba active từ tướng đã sở hữu.
  Đinh Bộ Lĩnh bắt buộc ở slot thủ lĩnh, được đổi nghề/hệ miễn phí trước tầng và phải hợp luật. Tầng đã qua được
  đánh lại nhưng đá first-clear chỉ nhận một lần. Quét dùng tiến độ phía server, nhận 1/2/3/4 đá mỗi ngày theo
  mốc tầng 1–5/6–10/11–15/16–20, đổi ngày lúc 00:00 Việt Nam và không tích lượt bỏ lỡ.
- **Destiny — Tháp Vận Mệnh:** chu kỳ 7 ngày từ thứ Hai 00:00 Việt Nam; luật được snapshot và không đổi trong
  chu kỳ. Run khóa roster từ toàn bộ tướng đã sở hữu, không giới hạn tối đa, giữ HP, energy và lương qua
  tầng; dự bị không tự hồi. Sau tầng chọn hồi phục, Phúc hoặc tài nguyên theo offer; không có đá trong reward
  giữa tầng. Đá tài khoản chỉ đến từ mốc và settlement cuối chu kỳ.
- Cả hai mode giữ battle 3vs3 và không cho đổi tướng trong combat. Không phát vàng, EXP hay trang bị riêng từ
  Trial; mọi số đá và receipt do server xác nhận trước khi UI hiển thị đã nhận.
- Đá Cường Hóa là số nguyên không âm ở tài khoản và **chưa có công dụng production**. Thiết kế cường hóa nằm ở
  [FUTURE TODO](../04-equipment/cuong-hoa-todo.md), không phải tính năng V1.0.

Hướng dẫn người chơi và bảng thưởng: [Song Tháp cho người chơi](dual-tower/player-help.md). Bằng chứng QA,
balance và release: [T06.04](dual-tower/06-04-final-acceptance.md).

## 4. Sinh tồn

- Cùng một bàn cờ trong suốt lượt chơi. Đối thủ kéo đến theo **đợt**, mạnh dần.
- **Đợt ≠ lượt.** Một đợt là một nhóm đối thủ kéo vào sân; đợt kết thúc khi toàn bộ đối thủ của đợt bị hạ gục. Mục tiêu tạm thời: 2–3 đối thủ mỗi đợt, khoảng 6–10 lượt mỗi bên (2–3 phút).
- **Báo trước** đợt kế tiếp, ví dụ "3 lượt nữa: 2 Tướng sĩ hệ Hỏa", để người chơi chuẩn bị phòng thủ.
- **Đội hình, đổi tướng, hồi phục, lương, hồi sinh, đổi nghề/hệ Đinh Bộ Lĩnh, thất bại và thứ tự xử lý giữa hai đợt:** nguồn chính là [Survival V1.1 — Rules & State Machine](survival/02-rules-state-machine.md). Tóm tắt (số không đổi):
  - Roster khóa lúc bắt đầu: Đinh Bộ Lĩnh (luôn active slot 0, thủ lĩnh) + 2 active + tối đa 2 reserve; trận luôn có đúng 3 active. Chỉ đổi tướng ở BREAK sau khi thắng.
  - Sau mỗi đợt thắng: active còn sống +20% max HP, reserve còn sống +10%; lương +25 (tối đa 100).
  - Hồi sinh: tự động sau 2 đợt hoặc trả 40 lương ở BREAK, 30% máu và 0 năng lượng; mỗi BREAK tối đa 1 người, tự động được ưu tiên.
  - Cả ba active gục thì lượt chơi kết thúc ngay, kể cả khi còn reserve.
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

Mô phỏng baseline lịch sử: `pnpm sim -- --survival --battles 50`. AI Thường đánh thay người chơi, đội khởi đầu, trả lương hồi sinh khi còn ít nhất 30 lương sau khi trả. Các số dưới đây được lưu từ bản cũ; xem [báo cáo simulation V1.1](survival/23-balance-report.md) để biết baseline mới có seed và giới hạn so sánh.

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
  - Đối thủ: một sứ quân (danh mục 12 sứ quân `warlords.ts`) dẫn 2 tùy tướng, đánh trên sân nhà của sứ quân.
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
| Thắng trận chiến dịch hoặc đánh trùm (chỉ trận thắng của nhiệm vụ có trận, kể cả qua một phase công thành; hoàn thành sự kiện/ngoại giao không tính) | 5 | 300 |
| Qua tầng tháp | 10 | 300 |
| Vượt đợt sinh tồn | 20 | 300 |
| Đánh thử thách ngày (số hôm) | 5 | 300 |

- **Thắng trận sinh tồn:** tính là thắng khi vượt qua ít nhất 1 đợt.
- **Thành tựu (nhận một lần):**
  - Thắng trận: 1 trận (50 vàng), 50 trận (300), 200 trận (1000).
  - Qua hết chương 1 chiến dịch: 500 (đếm 4 nhiệm vụ của Chương I V2, CAMP-08.04).
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
- **Mùa và thưởng:** có mùa theo tuần và thưởng vàng theo hạng, xem [mục 6.3](#63-mùa-theo-tuần-của-trấn-ải-và-quần-hùng).
- **Chưa làm:** nhật ký bị đánh (chỉ có số trận giữ được và bị mất), chặn đánh lại cùng một người.
- **Hướng sắp tới:** chế độ online hai người chơi đấu trực tiếp, xem [mục 6.2](#62-quần-hùng-online-hai-người-chơi-phát-triển-sau). Đấu trường bóng ma hiện tại giữ nguyên.

## 6. Thưởng vàng theo hạng cuối kỳ (Claude đặt 01/11/2026, chờ Shan duyệt)

Shan (01/11/2026): trước mắt thưởng xếp hạng của **mọi chế độ chỉ là vàng**; các loại thưởng khác (danh hiệu, trang bị, mở tướng) bàn sau khi các chế độ ổn định. Mỗi người nhận đúng một bậc theo hạng cuối kỳ; **bảng ít người vẫn có thưởng** (một mình một bảng là hạng nhất). Nhận sau khi kỳ khép lại, đúng một lần mỗi kỳ, và **chỉ tài khoản đã đăng nhập** nhận được (khách xem bảng, không nhận).

| Chế độ | Kỳ | Hạng nhất | Top 3 | Top 10 | Nửa trên | Có tên trên bảng | Cơ chế |
|---|---|---|---|---|---|---|---|
| **Trận Đồ** Thường / Khó / Đại trận | ngày / ngày / tuần | 150 / 300 / 1 000 | 100 / 200 / 600 | 60 / 120 / 350 | 30 / 60 / 150 | 20 / 40 / 80 (thắng ván) | Sổ riêng trong `formation_entries`, chi tiết ở [GDD Binh Pháp mục 12](future/02-binh-phap-gdd.md#12-xếp-hạng-và-thưởng-đã-code-mặc-định-tắt); tắt mặc định |
| **Nhật Lệnh** | ngày | 100 | 70 | 50 | 30 | 10 | Sổ chung `rank_reward_claims`; cộng thêm 150/50 vàng cố định mỗi ván |
| **Tháp Thiên Mệnh** | chu kỳ 7 ngày | 800 | 500 | 300 | 150 | 60 | Sổ chung `rank_reward_claims`; cộng thêm đá cuối chu kỳ; chỉ khi cờ `DESTINY_ENABLED` bật |
| **Trấn Ải** | mùa tuần | 500 | 300 | 180 | 80 | 30 | Sổ chung `rank_reward_claims`, điểm mùa ở `season_scores` ([mục 6.3](#63-mùa-theo-tuần-của-trấn-ải-và-quần-hùng)) |
| **Quần Hùng** | mùa tuần | 600 | 400 | 240 | 100 | 40 | Như Trấn Ải |

**Trạng thái duyệt:** Shan đã duyệt toàn bộ bảng vàng ở trên (Trận Đồ, Nhật Lệnh, Tháp Thiên Mệnh, Trấn Ải, Quần Hùng) ngày 01/11/2026. Muốn đổi số phải qua quyết định mới.

Bậc: hạng 1; hạng 2–3; hạng 4–10; từ hạng 11 tới hết nửa trên (làm tròn lên); còn lại. Code: `src/core/progress/rankRewards.ts` (bậc và bảng vàng), `src/server/rankRewards.ts` (nguồn theo chế độ, sổ nhận, nhận thưởng), `/api/rank-rewards` (danh sách chờ nhận) và `/api/rank-rewards/claim`. Chỉ nhận được các kỳ đã khép trong 7 kỳ gần nhất.

**Không có thưởng theo hạng:** **Bình Loạn** và **Từng trận** không có bảng xếp hạng (offline theo tuyến lịch sử). Mọi chế độ vẫn thưởng vàng khi chơi như cũ.

### 6.1 Ai chơi được chế độ nào (Shan, 01/11/2026)

Khách chơi thường thoải mái; chế độ **online có bảng xếp hạng và thưởng** chỉ cho **tài khoản đã đăng nhập**, server từ chối khách bằng `401 loginRequired` (không chỉ giao diện).

| Khách chơi được | Chỉ tài khoản đăng nhập |
|---|---|
| Luyện tập / Chơi thử, Giao Tranh (trận thường), Bình Loạn, Đánh trùm, Tháp Thí Luyện, **Trận Đồ chơi thường** | **Nhật Lệnh**, **Trấn Ải** (Sinh tồn), **Quần Hùng** (Đấu trường), **Tháp Thiên Mệnh**, **Trận Đồ xếp hạng**, trang **Bảng xếp hạng** |

**Khách cũng không xem** bảng xếp hạng, đề Nhật Lệnh, màn Thiên Mệnh và màn Quần Hùng/Trấn Ải: các API `GET` tương ứng trả `401`, Trận Đồ xếp hạng chỉ báo "cần đăng nhập" không kèm bảng, và giao diện hiện màn nhắc đăng nhập ở cả trang Xếp hạng (Shan, 01/11/2026). Trận xếp hạng đang dở của một khách cũ (đăng xuất giữa chừng) không xem và không đi tiếp được (`getBattle` và `actBattle` trả `loginRequired`); riêng "dừng run" Thiên Mệnh vẫn cho phép để kết thúc run có sẵn. Code: `Deps.isSignedIn` ở `src/server/battles.ts`, helper `isSignedInAccount` và `loginRequiredResponse` ở `src/server/http.ts`, màn nhắc `src/app/game/LoginGate.tsx`. Tháp Thí Luyện không có bảng xếp hạng nên vẫn mở cho khách.

### 6.2 Quần Hùng online hai người chơi (phát triển sau)

Quần Hùng hiện là tìm đối thủ offline (mục 5.3). Shan muốn thêm chế độ **online hai người chơi đấu trực tiếp**; xem [thiết kế DRAFT](future/13-quan-hung-pvp-truc-tiep.md). Chưa có code.

### 6.3 Mùa theo tuần của Trấn Ải và Quần Hùng

Shan (01/11/2026): Trấn Ải và Quần Hùng có **mùa theo tuần**, đổi vào thứ Hai 0 giờ giờ Việt Nam (cùng khóa với Đại trận và chu kỳ Thiên Mệnh). Điểm mùa bắt đầu lại từ 0 mỗi tuần; hạng cuối mùa nhận vàng ([mục 6](#6-thưởng-vàng-theo-hạng-cuối-kỳ-claude-đặt-01112026-chờ-shan-duyệt)). Bảng mọi thời đại cũ vẫn còn để xem.

- **Trấn Ải:** điểm mùa = số đợt cao nhất đã vượt trong **một lượt chơi** của tuần (lượt kém hơn không hạ điểm).
- **Quần Hùng:** điểm mùa = tổng điểm đấu trường nhận được từ các trận **mình đi đánh** trong tuần (thắng cộng, thua trừ); không tính phòng thủ, để người chỉ treo đội phòng thủ không leo hạng. Chỉ người có tổng **dương** mới có tên trên bảng. **Điểm Elo gốc không bị reset**; mùa chỉ đo mức tiến bộ trong tuần. *Shan chốt cách tính này ngày 01/11/2026. Phương án đã cân nhắc và không chọn: xếp theo Elo cuối tuần có reset mềm (cần chụp bảng cuối mùa).*
- Ghi điểm mùa lúc trận kết thúc, cùng lúc cộng thưởng; lỗi ghi mùa chỉ ghi log, không làm hỏng thưởng cuối trận. Code: `src/server/seasons.ts`, `src/server/db/seasons.ts`, bảng `season_scores` (migration 0011), API `GET /api/leaderboard?board=survival|arena&season=current|<thứ Hai>`.
- Số người có tên trên bảng (điểm dương) là số người để tính nửa trên. Không đòi số người tối thiểu, như các chế độ khác.

