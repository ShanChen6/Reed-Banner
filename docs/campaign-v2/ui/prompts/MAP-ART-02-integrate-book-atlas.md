# Codex prompt MAP-ART-02 — Tích hợp sách mở và tranh bản đồ với SVG

> Sau MAP-01, MAP-02 và khi có asset pilot đã duyệt. Đọc docs/campaign-v2/ui/08-atlas-sach-mo-asset-production.md.

## Mục tiêu
Hiển thị giao diện sách sử mở hai trang như mẫu: trái văn bản sử ký React, phải bản đồ minh họa hoa văn/sông núi, overlay mission node tương tác.

## Các bước
1. Audit current CampaignMap.tsx, mapLayout.ts, ChapterOne.tsx, CampaignScreen.tsx và component Atlas sau MAP-01; không xây lại một bản đồ khác.
2. Xây AtlasBookFrame: lớp ảnh book-shell chỉ mang tính trang trí; typography bên trái bằng HTML, không nằm trong pixel ảnh.
3. Xây AtlasChapterMapArt: manifest chapter 1..6 -> map-chXX.webp; fit/crop vào mặt trong trang phải, lazy-load ảnh không active; fallback CSS/SVG khi asset thiếu.
4. Dùng CampaignMap hiện có làm overlay tương tác (marker, đường DAG, labels, trạng thái, zoom/pan/pinch) với transform chính xác giữa map viewBox và vùng map ảnh.
5. Dùng dữ liệu chapter/unlock/server profile hiện hữu, không thay graph, historical outcomes hoặc tọa độ marker để chiều theo AI art. M12/M22 vẫn trong khối unplaced.
6. Mobile 390px: tabs Sử ký/Bản đồ, list 4 mission nằm rõ ràng, không ép hình hai trang thành thumbnail chữ tí hon. Kích thước click mục tiêu >=44 px.
7. Regression: Chapter IV và V song song, VI cần cả hai; replay, sourceNotes, RaidPanel, WorldLedger; không tạo audio.
8. Chạy lint/typecheck/targeted tests và QA ảnh 1440x900/390x844, báo lỗi còn tồn tại.

## Hoàn thành khi
- Giao diện có hình sách mở + tranh địa hình minh họa rõ ràng.
- SVG 24 mission tương tác, không có chữ giả trong ảnh.
- Khi tắt ảnh, chế độ Campaign vẫn hoạt động đầy đủ.
- Không thay battle/reward/loot/history contracts; không tự commit/push/deploy.
