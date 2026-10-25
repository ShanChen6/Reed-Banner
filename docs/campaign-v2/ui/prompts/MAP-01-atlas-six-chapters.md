# Codex prompt MAP-01 — Sử ký sáu chương

> 26/10/2026 · CHƯA TRIỂN KHAI

Đọc `docs/campaign-v2/design-freeze.md`, `ui/02-giao-dien-nguoi-choi.md`, `ui/04-lo-trinh-tung-buoc.md`, `src/core/campaign/overview.ts`, `src/app/game/campaign/ChapterOne.tsx`.

1. Audit component chọn chương đã tồn tại và xem `CAMPAIGN_CHAPTERS`, `chapterStatus`, `chapterUnlocked` để không xây trùng.
2. Tạo hoặc cải tiến component `CampaignAtlas` dạng quyển sử với 6 chương, mỗi chương 4 mission, hiển thị tiến độ X/4, nhãn mở/khóa/hoàn thành.
3. Chương IV và V mở song song sau M12; chương VI cần M16 và M20. KHÔNG thay logic unlock server.
4. Chọn chương chuyển sang màn bản đồ vùng và focus đúng chapter; trở lại Atlas không làm mất lựa chọn.
5. Giữ phong cách giấy dó, khắc gỗ, trống đồng; bản đầu có thể dựng SVG/CSS, không lệ thuộc ảnh AI.
6. Dùng keyboard và mobile 360/390px được; cards không bị tràn.

Kết quả mong đợi: người chơi nhìn thấy đầy đủ sáu chương; map hiện có, Boss Raid, Sử liệu và các chế độ khác vẫn chạy. Không làm audio, không sửa rewards/mission graph, không tự commit.
