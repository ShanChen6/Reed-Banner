# MAP-00-world-atlas-audit — Audit MAP World Atlas

> Campaign V2 · Codex execution prompt · Chưa triển khai

## Nguồn thiết kế đã duyệt

Đọc đầu tiên: `docs/campaign-v2/ui/09-chot-giao-dien-ban-do-toan-canh.md`, `docs/campaign-v2/design-freeze.md`, `docs/campaign-v2/warlord-matrix.md`, `docs/campaign-v2/history-sources.md`. Audit code develop mới nhất, không suy luận từ hình AI.

## Yêu cầu triển khai

Đọc code CampaignMap.tsx, mapLayout.ts, ChapterOne.tsx, FactionDossiers.tsx, storyNodes.ts, factions.ts và tài liệu 09. Ghi rõ source-of-truth cho 13 điểm (12 sứ quân + Hoa Lư), 24 mission, status chapter, world ledger, vị trí không xác định; snapshot những UI và API đang có; tạo contract WorldStronghold với factionId (Hoa Lư là HQ), location certainty, linkedMissionIds; không code gameplay.

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
