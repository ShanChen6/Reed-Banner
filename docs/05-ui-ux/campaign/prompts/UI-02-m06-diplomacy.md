# Codex prompt UI-02 — Hội thoại ngoại giao M06

> 26/10/2026 · Thực hiện SAU UI-01

Đọc `docs/campaign-v2/design-freeze.md`, `narrative-bible.md`, `ui/04-lo-trinh-tung-buoc.md` và code `DiplomacyScene.tsx`, `ChapterOne.tsx`, `events.ts`, `src/server/campaignEvents.ts`, `src/app/game/battle/online.ts`.

1. Dùng DialoguePlayer đã tạo để trình bày lần lượt lời dẫn, các nhân vật và nội dung hiện có của M06. Không viết lại chuyện Trần Lãm và Đinh Bộ Lĩnh.
2. Sau khi đọc đến đoạn quyết định, hiển thị chính xác choice IDs hiện có từ `missionCopy` và `campaignEventByNode`; phản hồi chỉ thay đổi cách diễn đạt, không đổi kết cục liên minh.
3. Chỉ bấm nút Xác nhận mới gọi `completeCampaignEventOnline`; chặn double click và request đồng thời; thông báo lỗi và cho retry.
4. Sau thành công: cập nhật profile từ server, trình bày kết quả, receipt/reward chính xác; không cộng vàng trên client. Reload/replay không thưởng lại.
5. Bảo vệ M05 và các event khác khỏi regression; giữ label fictional/sử liệu.
6. Test thủ công và targeted tests M06: new / incomplete / completed / locked / retry / network error.

Không sửa Battle Engine, Raid, Song Tháp, schema Campaign hay audio. Không commit, push, deploy.
