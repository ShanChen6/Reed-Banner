# MAP-01-world-atlas-shell — Layout ba cột và font Việt

> Campaign V2 · Codex execution prompt · Chưa triển khai

## Nguồn thiết kế đã duyệt

Đọc đầu tiên: `docs/campaign-v2/ui/09-chot-giao-dien-ban-do-toan-canh.md`, `docs/campaign-v2/design-freeze.md`, `docs/campaign-v2/warlord-matrix.md`, `docs/campaign-v2/history-sources.md`. Audit code develop mới nhất, không suy luận từ hình AI.

## Yêu cầu triển khai

Xây container CampaignWorldAtlas desktop: chapter rail 6 chương bên trái, SVG CampaignMap ở giữa, contextual panel bên phải; tablet thu gọn rail, mobile chuyển chapter chips + map + bottom sheet. Áp dụng Noto Serif có đủ Vietnamese glyph vào .campaign-atlas ONLY và fallback Georgia. Dùng SVG/CSS đang có, không cần asset mới. Chapter IV/V song song theo server; không biến mỗi chương thành một bản đồ riêng.

## Hạn chế bắt buộc

- Giữ nguyên M01–M24, 6 chương, core gameplay, rewards và server-authoritative settlement.
- Không khôi phục Campaign 13 màn hoặc Tháp vô hạn; không đổi Boss Raid, Trial, Destiny, Survival, Arena, quests.
- Không tạo hoặc gọi SFX, TTS, BGM hay Voice; Audio/Voice là TODO — DEFERRED.
- Không tự commit/push/deploy. Không tuyên bố art/test đã tạo hoặc đã PASS nếu chưa làm.

## Báo cáo cần nộp

1. File đã đọc và thay đổi.
2. Hành vi user trước/sau, video hoặc screenshot nếu có môi trường.
3. Verification thực sự đã chạy (lệnh + kết quả).
4. Open questions, known issues, rollback.
