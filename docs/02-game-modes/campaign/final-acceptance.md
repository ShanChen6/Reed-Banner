# Campaign V2 — Final acceptance & release gate (CAMP-09.04, 25/10/2026)

Tổng kết phát hành Campaign V2 cho dự án **chưa có người chơi thật**.

Phạm vi: chuỗi CAMP-02.03 → CAMP-09.03, xây trên `develop` `2c76a20` (PR #126 = CAMP-02.02). Toàn bộ còn ở dạng
thay đổi local chưa commit. Bản gộp áp thẳng lên `2c76a20`:
`/mnt/project-files/demo/campaign-v2-ket-thuc/camp-02.03-den-09.04.diff`.

## 1. Verdict

**GO có điều kiện** để mở PR vào `develop`. Chưa GO cho production.

Bằng chứng cho GO:
- Nội dung đủ 6 chương, 24 nhiệm vụ.
- Toàn bộ lệnh của CI chạy local đều sạch: lint, typecheck, 739/739 test, build.
- Test E2E M01 → M24 qua API server không có P0/P1.
- Mô phỏng cân bằng GO.
- Browser smoke máy tính và điện thoại trên bản build đạt.

Điều kiện còn lại (chưa có bằng chứng nên không tính là GO):
1. CI GitHub Actions xanh trên PR. Chưa chạy vì task không commit hay push.
2. Smoke trên preview Vercel có Neon thật: đăng nhập, lưu hồ sơ, đi vài nhiệm vụ. Máy cloud không vào được
   `*.vercel.app`, và smoke ở đây dùng kho bộ nhớ.
3. Shan duyệt các số Claude đặt:
   - thưởng vàng lần đầu;
   - thành tựu `a.campaign` 500 vàng (đang đặt tạm);
   - hai chỉnh độ khó của CAMP-09.02.
4. CAMP-09.01 chưa nhận được văn bản task. Nếu task đó đổi nội dung trận, cần chạy lại `scripts/campaign-balance.ts`.

## 2. Checklist

| Mảng | Mục | Trạng thái | Bằng chứng |
|---|---|---|---|
| Content | 24 nhiệm vụ M01–M24, 6 chương, đồ thị tiền đề hai tuyến tây/đông hội ở M21 | ✅ | `src/core/campaign/storyNodes.ts`; `tests/core/campaign/storyNodes.test.ts` |
| Content | Lời kể từng nhiệm vụ, lựa chọn chỉ đổi cách kể, không đổi kết cục lịch sử | ✅ | `campaignCopyErrors() = []` (test các chương); `docs/campaign-v2/narrative-bible.md` |
| Content | 6 tướng lịch sử gia nhập đúng mốc (M04, M08, M12, M16, M20, M24), không nhân bản | ✅ | `recruits.ts`; `tests/server/campaignE2E.test.ts` |
| Source | Nhãn `recorded` / `reconstructed` / `disputed` / `fictional` kèm mã nguồn; hư cấu không viết thành chính sử | ✅ | `history-sources.md`, `chapter-2-sources.md`, `chapter-3-sources.md`, báo cáo CAMP-08.02 (Sử ký) |
| Source | 970–971 chỉ là ghi chú nguồn, không có cảnh | ✅ | `tests/server/campaignDangQuang.test.ts` |
| Engine | Hoàn thành, thưởng, tuyển tướng, lựa chọn đều do server chốt, có biên nhận chống nhận hai lần | ✅ | `rewards.ts` (`node:` / `chapter:`); `campaignE2E.test.ts`; `campaignEvents.test.ts` |
| Engine | Phòng thủ, trùm có ngưỡng máu, công thành 3 phase chốt qua một hàm `settleCampaignScenario` | ✅ | `scenarios.ts`; `campaignScenarios.test.ts`; `campaignDoDong.test.ts`; `campaignTayPhuLiet.test.ts` |
| Engine | Không đổi AI, match-3, nghề/nguyên tố, kỹ năng, đồng hồ lượt, luật trận chung | ✅ | `git diff 2c76a20` không có thay đổi trong `src/core/ai`, `src/core/board`, `src/core/battle`; CAMP-09.02 chỉ chỉnh tham số encounter |
| Reward | Chỉ vàng lần đầu: 3 975 (nhiệm vụ) + 1 500 (chương) + thành tựu; không đá, không trang bị cố định | ✅ | `balance.test.ts`; `09-che-do-choi.md` mục 2 |
| Reward | Đánh lại chỉ nhận thưởng trận thường; đổi lựa chọn sau khi xong bị từ chối | ✅ | `campaignE2E.test.ts` |
| Reward | Giá trị Đá Cường Hóa không đổi; Campaign không phát đá | ✅ | Chuỗi task không sửa `src/server/stones.ts`, `src/core/tower/stoneWallet.ts`, `destinyStones.ts`; E2E kiểm `stones` |
| Balance | Trận đầu dễ, trùm cuối khó có kiểm soát, không kẹt bàn | ✅ | `balance-report.md` (GO có ghi chú) |
| UX | Bản đồ cổ, sổ thế cục, Sử ký, màn chuẩn bị và doanh trại, màn kết; chạy được ở 390px | ✅ | Ảnh trong các thư mục báo cáo (mục 6); smoke `campaign-v2-hoi-quy/smoke/` |
| UX | Ô "Độ khó" còn hiện ở trận Chiến dịch (server bỏ qua giá trị này) | ⚠️ P3 | `regression-report.md` mục 5 |
| QA | E2E M01 → M24, hồi quy các chế độ, browser smoke | ✅ | `regression-report.md` |
| CI | lint, typecheck, test, build chạy local | ✅ | `regression-report.md` mục 3 |
| CI | GitHub Actions trên PR | ⏳ chưa chạy | Cần commit và push (ngoài phạm vi task) |

## 3. Breaking changes

Không ảnh hưởng người chơi thật vì chưa có ai. Với hồ sơ dev:

- **Chiến dịch 13 màn cũ đã gỡ (CAMP-08.04).**
  - `src/core/campaign/campaign.ts` bị xóa.
  - `POST /api/battles` từ chối mọi payload có `stage`.
  - `pnpm sim -- --stage` không còn.
- **Hồ sơ.**
  - Khi đọc hồ sơ, `campaign.legacy` (`cleared`, `bestTurns` của màn cũ) bị bỏ.
  - Bậc Đánh trùm chuyển sang khóa `campaign.raids[<id sứ quân>]`.
  - Trận cũ đang dở mà còn `stage` được chốt như trận thường, không có thưởng chiến dịch.
- **Đánh trùm.**
  - Chỉ còn 6 sứ quân bị đánh dẹp; Shan chốt 25/10, đã ghi ở design-freeze 1.1.
  - Bậc đã lưu của 6 sứ quân còn lại nằm trong hồ sơ nhưng không được đọc.
  - Payload là `{ raidBoss, raid }`.
- **Bảng xếp hạng.**
  - `stage:<màn>` đổi thành `mission:<M..>`, chỉ cho nhiệm vụ có trận.
  - Điểm `campaign` tính theo số nhiệm vụ V2.
- **API và kiểu dữ liệu.**
  - `Match.stage` đổi thành `raidBoss`.
  - `DailySetup.stage` đổi thành `warlord`; `/api/daily` trả `setup.warlord`.
- **Độ khó** (CAMP-09.02): M07 đổi AI Thường → Dễ, đối thủ cấp 3 → 2; M21 phase mở đường đổi cấp 7 → 6.

## 4. Dữ liệu, migration, dev reset

- **Không có SQL migration mới.** `drizzle/` không đổi so với `2c76a20` (vẫn tới `0008`). Toàn bộ trạng thái Campaign
  nằm trong JSON `profiles.data` và được `parseCampaign` chuyển đổi khi đọc.
- **Dev reset.**
  - Không chạy lệnh reset nào. Chuyển đổi diễn ra tự động khi đọc hồ sơ, theo `reset-policy.md`: bỏ `cleared` và
    `bestTurns` cũ, giữ bậc Raid.
  - `resetCampaignProgressForDev` (`src/core/progress/profile.ts`) đặt lại riêng Campaign và giữ bậc Raid. Chưa có
    lệnh CLI gọi tới nó.
  - Không đụng account, hồ sơ chung, vàng, đồ, đá, tháp, Song Tháp, sinh tồn, nhiệm vụ, đấu trường.
- **Dòng cũ trong `leaderboard_scores`** có `board = 'stage:%'` không còn ai đọc. Có thể xóa tay trên DB dev; code
  không tự xóa.
- **Production** (`co-lau.vercel.app`, nhánh `main`): theo `reset-policy.md` mục 4 là không reset. Lên main thì hồ
  sơ có sẵn tự chuyển như trên. Vì chưa có người chơi thật nên chấp nhận được, nhưng phải được Shan duyệt khi merge
  `develop` → `main`.

## 5. Phụ thuộc giữa các chế độ

- **Đánh trùm.** Mở theo `unlockedContent` kind `raid` của nhiệm vụ M15–M18, M20, M21. Đối thủ lấy từ
  `WARLORD_ENCOUNTERS` (`warlords.ts`), không đọc encounter nhiệm vụ.
- **Sinh tồn, Thử thách ngày, Đấu trường.** (Leo tháp cũ đã gỡ ở develop 25/10/2026.) Đọc `WARLORD_ENCOUNTERS` theo thứ tự cũ, nên cùng seed vẫn ra
  cùng đối thủ. CAMP-08.04 đã so 1 080 mẫu. Không đọc tiến độ Campaign.
- **Song Tháp (Trial/Destiny).** Không phụ thuộc Campaign. Cờ `TRIAL_ENABLED` / `DESTINY_ENABLED` giữ nguyên; smoke
  với cả hai cờ bật đạt.
- **Bảng xếp hạng.** `boardScores` đọc `campaign.completed` và `bestBattleTurns`. Server ghi điểm sau khi cộng thưởng.
- **Cửa hàng sứ quân.** Mở theo `warlordUnlockMission`, cùng mốc gặp sứ quân M08–M21.
- **Nhiệm vụ tuần.** Đếm trận thắng Chiến dịch hoặc Đánh trùm; hoàn thành sự kiện không được tính.

## 6. Rollback

Phù hợp khi chưa có người chơi:
1. **Trước khi merge:** bỏ diff local. Không có gì đã lên remote.
2. **Sau khi merge `develop`:** revert merge commit của PR. Không có migration nên không cần hạ DB.
   - Hồ sơ dev đã ghi theo dạng mới (`raids` khóa theo sứ quân, không có `legacy`) vẫn là JSON hợp lệ.
   - Nếu code cũ đọc lệch thì dùng quyền reset Campaign dev của `reset-policy.md`. Không đụng dữ liệu khác.
3. **Sau khi lên `main`:** dùng instant rollback của Vercel về deployment trước. Nếu dữ liệu hồ sơ lệch thì xử lý
   như bước 2 cho từng hồ sơ dev đã biết, không đụng toàn bảng.

## 7. Ngoài phạm vi (TODO sau)

- **Hậu truyện 970–971:** niên hiệu Thái Bình (970), đặt quan chức (khoảng 971, chưa có trong ledger). Cần nguồn,
  freeze và nhiệm vụ riêng. Hiện chỉ là ghi chú nguồn ở M24. Lộ trình 4.8.
- **Cường hóa trang bị** (dùng Đá Cường Hóa): chưa có hệ thống, và chuỗi Campaign không mở. Đá vẫn chỉ đến từ Song
  Tháp; Campaign không phát đá. Thuộc gate Song Tháp (lộ trình 6.5).
- **P3:** ẩn ô "Độ khó" ở trận Chiến dịch.
- **Cân bằng tiếp:**
  - đo lại khi có dữ liệu lượng đồ thật theo chương;
  - M18 thấp hơn M17 khoảng 20 điểm;
  - đội tướng lịch sử yếu hơn đội khởi đầu ở M21 (vấn đề cân tướng, không thuộc Campaign).

## 8. Bằng chứng

Mỗi thư mục có báo cáo 6 mục, diff task, diff gộp và ảnh chụp.

| Task | Thư mục `/mnt/project-files/demo/…` |
|---|---|
| CAMP-02.03 Chương I | `campaign-v2-chuong-1/` |
| CAMP-03.01–03.03 Chương II | `campaign-v2-m04-m05/` |
| CAMP-04.01 thế cục, Chương III | `campaign-v2-chuong-3/` |
| CAMP-04.02 hội kiến | `campaign-v2-hoi-kien/` |
| CAMP-04.03 hội quân | `campaign-v2-hoi-quan/` |
| CAMP-05.01 Phong Châu, Hồi Hồ | `campaign-v2-phong-chau-hoi-ho/` |
| CAMP-05.02 Tam Đái | `campaign-v2-tam-dai/` |
| CAMP-05.03 Siêu Loại, Tiên Du | `campaign-v2-sieu-loai-tien-du/` |
| CAMP-05.04 hai tuyến | `campaign-v2-hai-tuyen/` |
| CAMP-06.01 Tế Giang | `campaign-v2-te-giang/` |
| CAMP-06.02 Tây Phù Liệt | `campaign-v2-tay-phu-liet/` |
| CAMP-06.03 Đỗ Động | `campaign-v2-do-dong/` |
| CAMP-06.04 sổ thế cục | `campaign-v2-the-cuc/` |
| CAMP-07.01 Giang Sơn Một Mối | `campaign-v2-giang-son/` |
| CAMP-07.02 Hoa Lư | `campaign-v2-hoa-lu/` |
| CAMP-07.03 Đại Lễ Đăng Quang | `campaign-v2-dang-quang/` |
| CAMP-08.01 bản đồ | `campaign-v2-ban-do/` |
| CAMP-08.02 Sử ký | `campaign-v2-su-ky/` |
| CAMP-08.03 doanh trại | `campaign-v2-doanh-trai/` |
| CAMP-08.04 tách chế độ | `campaign-v2-tach-che-do/` |
| CAMP-09.02 cân bằng | `campaign-v2-can-bang/` (gồm `so-lieu/` JSON) |
| CAMP-09.03 hồi quy | `campaign-v2-hoi-quy/` (gồm `smoke/`) |
| CAMP-09.04 nghiệm thu | `campaign-v2-ket-thuc/` |

Tài liệu trong repo: `docs/campaign-v2/` (`design-freeze.md`, `history-sources.md`, `mission-matrix.md`,
`contracts.md`, `reset-policy.md`, `balance-report.md`, `regression-report.md`, tài liệu này),
`docs/design/09-che-do-choi.md` mục 2, `docs/lo-trinh.md` 4.7–4.8.
