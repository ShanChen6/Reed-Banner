# Campaign V2 — Regression report (CAMP-09.03, 25/10/2026)

Kiểm thử luồng 24 nhiệm vụ và các hệ thống bị Campaign V2 tác động. Chạy trên bản gộp CAMP-02.03 → CAMP-09.02,
chưa commit. Bằng chứng nằm ở `/mnt/project-files/demo/campaign-v2-hoi-quy/`.

## 1. Luồng Campaign từ đầu đến cuối

Test mới: `tests/server/campaignE2E.test.ts`. Một hồ sơ mới đi hết M01 → M24, chỉ qua API server thật:
- `completeCampaignEvent` cho sự kiện, ngoại giao và chuẩn bị;
- `createBattleFor` + `getBattle` cho trận.

Trận được ép thắng hoặc thua bằng cách sửa trạng thái trận đã lưu, như các test server khác.

| Kiểm tra | Kết quả |
|---|---|
| Sai thứ tự: chưa qua M01 thì M02 trả `locked`, trận M03 trả `badRequest` | PASS |
| Không có sự kiện trận ở nhiệm vụ story: `parseNewBattle` từ chối M01 và M24; gọi sự kiện cho nhiệm vụ có trận trả `notEvent` | PASS |
| Sự kiện bấm hai lần (cùng `eventId`), gửi lại bằng `eventId` khác, đổi lựa chọn sau khi xong: không cộng thêm vàng; đổi lựa chọn bị từ chối | PASS (14 nhiệm vụ không có trận) |
| Thua phase đầu của mọi nhiệm vụ có trận: không hoàn thành, không thưởng lần đầu, không tiến phase | PASS (9 nhiệm vụ) |
| Công thành và trùm nhiều phase (M20, M21): phase giữa chỉ tiến `siegePhases`, phase cuối mới hoàn thành | PASS |
| Chốt lại cùng trận (tải lại trang): hồ sơ không đổi | PASS |
| Đánh lại nhiệm vụ đã qua: không thưởng lần đầu, tiến độ giữ nguyên | PASS |
| Tổng vàng lần đầu đúng một lần: 3 975 vàng nhiệm vụ + 6 × 250 vàng chương | PASS |
| Đủ 6 tướng lịch sử; `campaignCompleted`; hồ sơ qua JSON đọc lại giữ nguyên `campaign` | PASS |
| Không phát đá (`stones` giữ như hồ sơ mới) | PASS |

Các test có sẵn vẫn đạt:
- từng chương: `tests/server/campaign*.test.ts`, 22 file;
- core: `tests/core/campaign/*`, 12 file, gồm `balance.test.ts` của CAMP-09.02 (seed tất định, không kẹt bàn).

## 2. Các chế độ khác

| Chế độ | Test chứng minh contract không đổi | Smoke trình duyệt |
|---|---|---|
| Đánh trùm (6 trùm) | `tests/core/campaign/raids.test.ts`; `tests/server/battles.test.ts` ("trận đánh trùm") | khu Đánh trùm ở màn Chiến dịch |
| Bảng xếp hạng | `tests/core/leaderboard/leaderboard.test.ts`; `campaignChapterThree` (boardScores) | `/game/leaderboard` |
| Cửa hàng sứ quân | `tests/core/campaign/recruits.test.ts`; `campaign.test.ts` | `/game/profile` |
| Nhiệm vụ, thành tựu | `tests/core/quests/*`; `tests/core/campaign/modeIntegration.test.ts` | `/game/quests` |
| Leo tháp cũ | `tests/core/tower/*`; `battles.test.ts` ("trận leo tháp"); `towerFeatureFlags` ("OFF/OFF không chặn battle legacy/normal") | `/game/tower` |
| Tháp Thí Luyện (Trial) | `tests/server/trial*.test.ts`, 5 file | `/game/trial` (bật `TRIAL_ENABLED`) |
| Tháp Vận Mệnh (Destiny) | `tests/server/destiny*.test.ts`, 4 file | `/game/destiny` (bật `DESTINY_ENABLED`) |
| Sinh tồn | `tests/core/survival/*`; `tests/game/survival-*.test.ts` | `/game/survival` |
| Thử thách ngày, đấu trường | `tests/core/daily/*`; `tests/core/arena/*` | `/game/daily`, `/game/arena` |
| Trận thường, chơi thử | `battles.test.ts` ("dịch vụ trận online") | `/game/practice`, `/game` |

CAMP-08.04 đã so ảnh chụp JSON trước và sau cho tháp, sinh tồn, thử thách ngày và đấu trường: 1 080 mẫu trùng khớp.
CAMP-09.02 và 09.03 không đụng tới các chế độ này.

## 3. Lệnh đã chạy

| Lệnh | Kết quả |
|---|---|
| `pnpm exec tsc --noEmit` | sạch |
| `pnpm lint` | sạch |
| `pnpm exec tsx --test tests/server/campaignE2E.test.ts` | 1/1 pass |
| `pnpm test` | 739 test, 164 suite: 739 pass, 0 fail, 0 skip, 0 todo, 0 cancelled |
| `pnpm build` | thành công. Không có `DATABASE_URL` nên bỏ qua migration, đúng như `scripts/migrate.mts` ghi |
| `pnpm start` + Playwright | xem mục 4 |

## 4. Browser smoke

Đã chạy thật: Chromium của Playwright, trên bản `pnpm build` + `pnpm start`, ở 1366×900 và 390×844 (giả lập điện
thoại có cảm ứng). Kho dữ liệu là kho bộ nhớ, vì không có `DATABASE_URL`. `SESSION_SECRET` là chuỗi thử.
Script: `smoke.cjs` trong scratchpad. Log và ảnh ở `smoke/`.

- **Hồ sơ mới mở Chiến dịch:** Chương I hiện 0/4.
  - Hoàn thành M01, M02 qua `POST /api/campaign/events`: 200.
  - Gửi lại M01: `firstClear: false`, `rewardGold: 0`.
  - M05 khi chưa tới lượt: 422 `locked`.
- **Tải lại trang:** hiện "2/4 nhiệm vụ", M03 đang mở.
- **Vào trận M03 qua giao diện** (đọc lời kể, chọn lựa, chuẩn bị, Xuất quân), chuyển sang `/game/play`:
  - đồng hồ lượt đếm "còn 27 giây" → "còn 22 giây" sau 4 giây;
  - server trả trận M03 với `winner: null`;
  - bản máy tính: lượt đầu của AI đã diễn xong rồi mới tới lượt người chơi, đúng hàng đợi trình diễn.
- **11 phân cảnh khác** (menu, chơi thử, tháp, Trial, Destiny, sinh tồn, thử thách ngày, đấu trường, nhiệm vụ, bảng
  xếp hạng, hồ sơ): đều trả 200, không có lỗi trang mới.
- **Lỗi console duy nhất** là 422 của lần gọi M05 cố ý.

Chưa smoke: chơi hết một trận bằng tay trên trình duyệt, đăng nhập OAuth, và Neon thật.

## 5. Lỗi tìm thấy

- **P0/P1** (mất tiến độ, nhận thưởng hai lần): không có.
- **P3:** ở trận Chiến dịch, ô chọn "Độ khó" vẫn hiện "Thường" dù server dùng độ khó của nhiệm vụ (M03 là Dễ).
  Server bỏ qua giá trị client gửi (`parseNewBattle` đặt `difficulty` theo scenario), nên không ảnh hưởng luật.
  Nên ẩn ô chọn này ở trận Chiến dịch.

## 6. Kết luận

Đạt cả hai tiêu chí nghiệm thu:
- không có lỗi P0/P1 về mất tiến độ hay nhận thưởng hai lần;
- các chế độ ngoài Campaign giữ nguyên contract, có test và smoke kèm theo.
