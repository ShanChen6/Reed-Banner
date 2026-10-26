# MAP-ART-00-world-map-production — Tranh bản đồ toàn cảnh không chữ

> Campaign V2 · Codex execution prompt · Chưa triển khai

## Nguồn thiết kế đã duyệt

Đọc đầu tiên: `docs/campaign-v2/ui/09-chot-giao-dien-ban-do-toan-canh.md`, `docs/campaign-v2/design-freeze.md`, `docs/campaign-v2/warlord-matrix.md`, `docs/campaign-v2/history-sources.md`. Audit code develop mới nhất, không suy luận từ hình AI.

## Yêu cầu triển khai

Ảnh do Shan cung cấp hoặc dùng prompt tại file 09: một minh họa toàn cảnh núi/sông/làng/thành trên giấy dó, 16:9 hoặc gần tương ứng aspect ratio vùng map, KHÔNG có text/cờ/status/cứ điểm mission. Đừng dùng nguyên ảnh AI có nhãn sai làm production. Codex kiểm metadata asset thực có, viết asset manifest với fallback, không giả tạo file. Đối chiếu trước khi ghép: hình tương thích bố cục world-map SVG/mapLayout. Chi tiết ch01–ch06 để FUTURE.

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
