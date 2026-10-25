# TASK BOARD — Campaign UI V2 (text/map NOW, audio LATER)

> Cập nhật: 26/10/2026

| Task | Nội dung | Trạng thái | Phụ thuộc |
|---|---|---|---|
| DOC-00 | Dọn docs Campaign 13/Legacy Tower | TODO | — |
| UI-00 | Audit UI hiện hành | TODO | DOC-00 |
| UI-01 | DialoguePlayer + Backlog | DONE: `DialoguePlayer.tsx`, `dialogue.ts`; lời dẫn mọi nhiệm vụ không phải hội kiến | UI-00 |
| UI-02 | Hội kiến M06 end-to-end | DONE: `DiplomacyScene.tsx` phát lời dẫn, lời đáp, kết cục từng câu (M06, M11–M13) | UI-01 |
| UI-03 | Tích hợp non-combat | DONE: lời đáp, kết thúc và màn thưởng lần đầu phát từng câu (`ChapterOne.tsx`) | UI-02 |
| UI-04 | Battle intro/outro | DONE: màn cuối trận đọc đủ lời kết (thắng) hoặc lời thua; phase giữa không chiếu lời kết; trận dở vào thẳng bước chuẩn bị | UI-03 |
| MAP-01 | Sử ký 6 chương | Shan tự làm (bản đồ + ảnh nền), Claude ghép sau | UI-00 |
| MAP-02 | Bản đồ theo vùng, panel nhiệm vụ | Shan tự làm (bản đồ + ảnh nền), Claude ghép sau | MAP-01 |
| MAP-03 | Tích hợp atlas/map/mission | Shan tự làm (bản đồ + ảnh nền), Claude ghép sau | UI-04, MAP-02 |
| BG-01 | Ảnh nền khung thoại | DONE: 7 tranh Shan vẽ ở `public/art/campaign/bg/`, chọn theo nhiệm vụ (`missionBackdrop`); `atlas.webp` để dành cho MAP-01 | UI-01 |
| UI-05 | Sử liệu, mobile và optional art | TODO | MAP-03 |
| QA-01 | Nghiệm thu toàn UI | TODO | UI-05 |
| AUD-01…07 | Âm thanh, SFX, BGM, Voice | **TODO — DEFERRED** | Chỉ thực hiện khi UI hoàn thành, có yêu cầu mới |

**Không chuyển task từ TODO sang PASS dựa trên tài liệu; chỉ sau khi thực sự triển khai và kiểm tra.**