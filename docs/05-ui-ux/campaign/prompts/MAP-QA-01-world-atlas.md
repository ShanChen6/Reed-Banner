# MAP-QA-01-world-atlas — QA Atlas và các chế độ

> Campaign V2 · Codex execution prompt · Chưa triển khai

## Nguồn thiết kế đã duyệt

Đọc đầu tiên: `docs/campaign-v2/ui/09-chot-giao-dien-ban-do-toan-canh.md`, `docs/campaign-v2/design-freeze.md`, `docs/campaign-v2/warlord-matrix.md`, `docs/campaign-v2/history-sources.md`. Audit code develop mới nhất, không suy luận từ hình AI.

## Yêu cầu triển khai

Test/verify 6 chương x4, 13 điểm gồm Hoa Lư, 12 faction, Bình Kiều unplaced; chapter IV/V song song, VI M16+M20, sứ quân allied/submitted/dispersed/defeated như faction ledger; M06 Trần Lãm không đánh, M14 Nguyễn Khoan không ép có trận, mission choice không đổi lịch sử; retry/replay/idempotent reward; mobile <=390, keyboard, image fallback, UTF-8 Vietnamese font. Chạy lint/typecheck/tests/build hoặc ghi rõ cái chưa chạy. Không triển khai audio.

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
