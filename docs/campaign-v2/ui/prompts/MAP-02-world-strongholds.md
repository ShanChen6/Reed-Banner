# MAP-02-world-strongholds — 13 cứ điểm và panel chi tiết

> Campaign V2 · Codex execution prompt · Chưa triển khai

## Nguồn thiết kế đã duyệt

Đọc đầu tiên: `docs/campaign-v2/ui/09-chot-giao-dien-ban-do-toan-canh.md`, `docs/campaign-v2/design-freeze.md`, `docs/campaign-v2/warlord-matrix.md`, `docs/campaign-v2/history-sources.md`. Audit code develop mới nhất, không suy luận từ hình AI.

## Yêu cầu triển khai

Dựng 12 stronghold factions từ CAMPAIGN_FACTION_RESOLUTIONS + chiến dịch STORY_NODES/mapLayout, thêm Hoa Lư riêng, không nhầm 13 với Campaign V1. Bình Kiều có vị trí disputed, xuất ở unplaced list. Click cờ/cứ điểm mở panel có tên sứ quân, dữ liệu sử liệu và các Mxx liên quan; xem trạng thái locked/completed từ server và phân biệt quan hệ (alliance/submission/military/uncertain). Không bịa tọa độ hoặc tuyến tiến quân.

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
