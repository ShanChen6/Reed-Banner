# 03 — Contract và kiến trúc UI (không làm lại gameplay)

> Cập nhật: 26/10/2026

## 1. Dữ liệu lấy ở đâu

- Mission identity/graph: `src/core/campaign/storyNodes.ts`, `STORY_NODES`, `CampaignMissionId`.
- Nội dung: `src/core/campaign/chapterOne.ts` ... `chapterSix.ts`, truy cập qua `missionCopy` / `StoryBeat`.
- Choice allowlist, historical outcome: `src/core/campaign/events.ts` và `CAMPAIGN_CHOICE_IDS`.
- Source ledger: `src/core/campaign/history.ts` + `HistoricalCodex.tsx`.
- State: `Profile.campaign.completed`, `storyChoices`, `storyFlags`, `rewardReceipts`.
- Client API: `src/app/game/battle/online.ts` (`completeCampaignEventOnline`).
- Server: `src/server/campaignEvents.ts`; thưởng trong `src/core/campaign/rewards.ts`.
- Bản đồ: `CampaignMap.tsx`, `mapLayout.ts`; chương `CAMPAIGN_CHAPTERS`, `chapterStatus`, `chapterUnlocked`.

## 2. Đề xuất thành phần mới (chỉ tạo nếu repo chưa có tương đương)

```text
src/app/game/campaign/
  CampaignScreen.tsx         GIỮ: entry và Raid Hall
  ChapterOne.tsx             GIỮ: orchestration, bớt logic UI dài
  StoryBeats.tsx             GIỮ: static Beats cho sử liệu
  DiplomacyScene.tsx         GIỮ: API/choices
  DialoguePlayer.tsx        MỚI: 1 beat mỗi lần, next/back/skip
  DialogueBacklog.tsx       MỚI: nhật ký các beat đã xem
  DialoguePortrait.tsx      MỚI nếu cần: Portrait hiện tại + focus
  CampaignAtlas.tsx         MỚI: thẻ 6 chương và tiến độ
  CampaignRegionPanel.tsx   MỚI: 4 nhiệm vụ/chương, loại/trạng thái
  CampaignMap.tsx           GIỮ, cải thiện focus & lọc theo chương
  mapLayout.ts              GIỮ: layout 24 node, vị trí vùng
```

Không bắt buộc tạo đúng tên file nếu component hiện có đã giải quyết tốt. **Tránh trùng logic hiển thị**.

## 3. Contract đề xuất cho DialoguePlayer

```ts
interface DialoguePlayerProps {
  missionId: CampaignMissionId;
  beats: readonly StoryBeat[];
  initiallySeen?: number;
  onCompletePresentation(): void; // CHỈ kết thúc trình diễn, KHÔNG SETTLE
  onBack?(): void;
}
```

Nếu trộn `intro`, `choices`, `outro`, mỗi phần nên là một sequence riêng `intro/response/outro` tham chiếu data đã có. Để tránh breaking change, có thể tạo adapter read-only từ `missionCopy` sang player; không bắt toàn bộ `StoryBeat` thêm id ngay lập tức. UI key ổn định bằng `missionId + section + index` cho nội dung bất biến.

**State UI:** `beatIndex`, `viewedMaxIndex`, `backlogOpen`, `presentationDone`, `selectedChoice` — chỉ thuộc component/session; reload có thể đọc `STEP_KEY` từ `ChapterOne`, nhưng không dùng localStorage làm source-of-truth cho completion.

**Server state:** `completed`, `storyChoices`, `storyFlags` và reward — chỉ có ở Profile trả về từ API.

## 4. Máy trạng thái gợi ý

```text
MISSION_OPEN
  → INTRO_PLAYER
  → CHOICE_PANEL? → RESPONSE_PLAYER? → SUBMIT_EVENT → RESULT
  → BATTLE_PREP? → SERVER_BATTLE → OUTCOME_PLAYER → RESULT
```

- `Next/Previous` không gửi bất kỳ request server nào.
- `Skip` chỉ thay đổi beatIndex/UI (nếu policy cho phép); **không bỏ qua nút xác nhận**.
- Event đã hoàn thành: replay độc lập với gọi server; tuyệt đối không nhân reward.
- Thua trận: không phát outro chiến thắng.
- Đóng/reload: state từ server ưu tiên; không hiện nút nhận thưởng nếu receipt đã có.
- Không sinh gameplay branch từ choice; historical outcome bất biến theo Design Freeze.

## 5. Bản đồ / Atlas

Giữ `MAP_LAYOUT` cho 24 marker. Tách **điều hướng** khỏi **hình học bản đồ**:

```ts
type AtlasSelection = {
  chapter: CampaignChapter;
  missionId?: CampaignMissionId;
  regionKey?: string;
};
```

`CampaignAtlas`: duyệt sáu `CAMPAIGN_CHAPTERS`, tính đếm bằng `chapterStatus` (không hardcode).

`CampaignRegionPanel`: lọc 4 mission theo chương đang chọn; mỗi item click gọi `onOpen(missionId)` với guard `open/completed` từ profile. Không tính unlock lần thứ hai bằng rule UI.

`CampaignMap`: dùng `chapter` hiện hữu để focus và chỉ nhấn nổi điểm thuộc chương, click marker ↔ select mission đồng bộ. Bản đồ không biết API settlement.

**Bất biến:** Chapter IV và V song song; M21 cần M16 + M20; bản đồ không vẽ một tuyến niên biểu tuyến tính giả.

## 6. Màu và chuyển động

- Nền: giấy dó, nâu mực, đỏ son, đồng cổ, xanh chàm; ưu tiên kế thừa biến `--map-*` và Tailwind game.
- Chuyển câu: fade 120–180 ms; không tự chạy theo timer, người chơi tự đọc.
- Chân dung: focus opacity 1.0, người nghe 0.6–0.7; không tạo nhân vật khác canon/weapon.
- `prefers-reduced-motion`: bỏ transition, không thay tốc độ nội dung.
- Luôn hiển thị text đầy đủ, không chờ audio.

## 7. Các giới hạn scope

Không thay đổi: `src/core/battle`, `src/server/battles.ts` ngoài adapter trực tiếp cần thiết; XP/gold/stone, Raid, Trial/Destiny, Survival, Daily, Arena, quests, achievements, login, DB schema.

Nếu phát hiện phải sửa server vì lỗi có thật, tách PR/task riêng với bằng chứng; không lén sửa trong task UI.