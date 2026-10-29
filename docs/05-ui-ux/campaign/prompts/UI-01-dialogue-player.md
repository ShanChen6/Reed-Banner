# Codex prompt UI-01 — DialoguePlayer từng câu

> 26/10/2026 · Campaign V2 · CHƯA TRIỂN KHAI

## Bối cảnh
Đọc `docs/campaign-v2/design-freeze.md`, `docs/campaign-v2/ui/{02-giao-dien-nguoi-choi,03-contract-va-kien-truc,04-lo-trinh-tung-buoc}.md`.
Core đã có 24 mission, `missionCopy`, `StoryBeat`, `Beats`, `Cinematic`, `DiplomacyScene`. Đừng xây lại story registry hoặc 13-stage Campaign cũ.

## Mục tiêu
Thay khu đọc thoại dài thành trải nghiệm Visual Novel một câu mỗi bước, vẫn dùng text data canonical.

## Các bước cụ thể
1. Audit các props/types của `StoryBeats.tsx`, `ChapterOne.tsx`, `DiplomacyScene.tsx`, `Portrait`, `missionCopy`.
2. Tạo `DialoguePlayer.tsx` dùng beat[] typed, `missionId`, `section`, `onPresentationFinished`. Dùng nội dung existing, không hard-code M06.
3. Mỗi bước hiển thị chính xác 1 beat; nếu có speaker, tên + chân dung nếu có mapping; nếu không, thể hiện narrator. Hiển thị nhãn historical basis. Không giả trích dẫn thoại nhân vật là chính sử.
4. Thêm Tiếp, Trước, Xem lại và Bỏ qua thoại đã xem; Backlog chỉ hiển thị những câu đã đọc. Hỗ trợ Enter/Space, tab focus, mobile 360px và prefers-reduced-motion.
5. Dùng beat key ổn định `missionId:section:index` để sau này gắn voice audio; không tạo AudioEngine, không gọi TTS.
6. Giữ `Beats` tĩnh cho nguồn sử, `HistoricalCodex` và `SourceNotes`; không đổi behavior server.
7. Demo tối thiểu M01 trước khi tích hợp toàn chiến dịch.

## Không làm
Không sửa Battle Engine, graph M01–M24, rewards, Raid, Trial/Destiny, historical outcomes; không tạo file âm thanh; không tự commit/push/deploy.

## Nghiệm thu
- Có thể chuyển Next / Previous / Backlog / Skip.
- Chỉ một beat chính xuất hiện mỗi bước.
- `onPresentationFinished` KHÔNG trực tiếp hoàn thành mission hoặc cộng vàng.
- Typecheck/lint và targeted tests, báo rõ những gì đã chạy.
- Báo cáo Files changed, walkthrough, known issues.
