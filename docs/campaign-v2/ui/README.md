# Campaign V2 — triển khai thoại và bản đồ từng bước

> Cập nhật: 26/10/2026
> Trạng thái: UI thoại/bản đồ READY; audio/voice TODO — DEFERRED.

## Hiện trạng chính xác

Campaign V2 đã có sáu chương và 24 nhiệm vụ. `src/app/game/campaign/ChapterOne.tsx`, `DiplomacyScene.tsx`, `StoryBeats.tsx`, `CampaignMap.tsx`, `mapLayout.ts` đang hoạt động. Bản đồ đã có SVG 24 điểm, zoom/pan, chapter selection. Không xây lại từ đầu, không khôi phục Campaign 13 màn.

## Bước làm ngay (mỗi bước một Codex task)

| Thứ tự | Task | Phạm vi | Kết quả mong đợi |
|---|---|---|---|
| 0 | DOC-00 | docs cũ | Bỏ hướng dẫn Campaign 13 màn và Tower vô hạn, giữ docs Boss Raid/Song Tháp |
| 1 | UI-00 | audit code | Có sơ đồ entry → story beats/choice → server và map V2 |
| 2 | UI-01 | DialoguePlayer | Một beat mỗi lần, Next/Back, backlog; không phát audio |
| 3 | UI-02 | M06 diplomacy | Hội thoại → chọn đáp → API kết quả; chặn submit trùng |
| 4 | UI-03 | noncombat | Dùng player với content M01–M24 từ `missionCopy` |
| 5 | UI-04 | combat intro/outro | Trước/sau battle, không tự thưởng hoặc lặp phase |
| 6 | MAP-01 | CampaignAtlas | Sáu chương, bốn mission/chương, IV/V song song |
| 7 | MAP-02 | RegionalPanel & SVG | List mission tại một vùng, zoom/pan cũ giữ nguyên |
| 8 | MAP-03 | tích hợp | Atlas → map → mission → story/battle → return |
| 9 | UI-05 | sử liệu/mobile | Nhãn lịch sử, Portrait fallback, responsive |
| 10 | QA-01 | kiểm tra scope hẹp | Typecheck/lint/tests mục tiêu, không chạy balance mô phỏng vô cớ |

## Ví dụ user journey M06

1. Vào Campaign → chọn Chương II → M06.
2. Xem từng câu thoại/đoạn kể bằng nút Tiếp và Trước; Backlog chỉ hiển thị câu đã xem.
3. Đọc hết → chọn lời đáp nằm trong allowlist hiện có.
4. Bấm Xác nhận → dùng `completeCampaignEventOnline`; server quyết định hoàn thành, lựa chọn và thưởng.
5. Xem kết quả → trở lại chapter/map. Replay chỉ xem lại, không cấp thưởng mới.

## Đường dẫn code chính

- Core/story: `src/core/campaign/storyNodes.ts`, `chapterOne.ts` … `chapterSix.ts`, `events.ts`.
- UI: `src/app/game/campaign/StoryBeats.tsx`, `DiplomacyScene.tsx`, `ChapterOne.tsx`, `CampaignMap.tsx`, `mapLayout.ts`.
- Server: `src/server/campaignEvents.ts`; client `src/app/game/battle/online.ts`.
- Canon: `docs/campaign-v2/design-freeze.md`, `mission-matrix.md`, `narrative-bible.md`, `history-sources.md`.

## Bất biến

Không đổi M01–M24, chapter graph, historical outcomes, battle/rewards, Quest, Raid, Trial/Destiny, Arena, Survival. Chọn câu trả lời chỉ đổi diễn đạt, không đổi kết cục lịch sử. UI chỉ điều khiển trình diễn, không tự cộng tài nguyên.

## Audio/Voice

**TODO — DEFERRED.** Chưa làm audio engine, nhạc, SFX, TTS, voice playback và chưa đòi hỏi asset mới. Đặc tả hậu kỳ xem [audio-todo/README.md](audio-todo/README.md). Bộ Markdown và prompt Codex đầy đủ được phát hành kèm bộ tài liệu triển khai ngoài repository.
