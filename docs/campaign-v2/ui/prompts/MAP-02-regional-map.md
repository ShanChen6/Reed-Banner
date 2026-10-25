# Codex prompt MAP-02 — Bản đồ vùng và cụm nhiệm vụ

> 26/10/2026 · Thực hiện SAU MAP-01

Đọc `docs/campaign-v2/ui/{02-giao-dien-nguoi-choi,03-contract-va-kien-truc,04-lo-trinh-tung-buoc}.md`, `src/app/game/campaign/CampaignMap.tsx`, `mapLayout.ts`, `ChapterOne.tsx`, `src/core/campaign/factions.ts`.

1. Giữ bản đồ SVG đang có: 24 marker, đường prereq DAG, zoom/pan/pinch, tương tác bàn phím, giấy dó, marker loại nhiệm vụ.
2. Thêm RegionalPanel lấy vùng từ `MAP_LAYOUT.regions`, liệt kê mission thuộc vùng và trạng thái từ `chapterStatus`; node không có vị trí chắc chắn xử lý trong `unplaced`.
3. Người chơi có thể chọn vùng từ map, xem danh sách nhiệm vụ rồi chọn Mxx để mở chi tiết. Dùng touch target tối thiểu 44px.
4. Phân biệt liên minh / quy phục / tan rã / đánh dẹp bằng dữ liệu `campaignWorldLedger`, không suy luận tất cả sứ quân đều bị chinh phục.
5. Không trình bày tọa độ hiện đại gần đúng như tọa độ chính xác của trận đánh lịch sử.
6. Kiểm tra hai nhánh IV–V song song, trở về chapter/mission, bàn phím, mobile/desktop và zoom không chồng nút.

Không xây lại engine hoặc xóa thành phần map đang chạy. Không dùng ảnh nền bắt buộc, chưa audio, không thay reward/progression, không tự commit.
