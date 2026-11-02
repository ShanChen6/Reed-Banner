# AUDIO/VOICE — TODO / DEFERRED (CHƯA THỰC HIỆN)

> Cập nhật: 26/10/2026  
> Trạng thái của **tất cả task** ở đây: `TODO`, không nằm trong phạm vi triển khai thoại chữ + bản đồ.

## Mục tiêu tương lai

Giữ voice profile nhất quán theo ID nhân vật; music/ambience/SFX/voice hoạt động trên web sau một tương tác chủ động; audio không được là điều kiện để hiểu cốt truyện. Thay file audio mà không sửa nội dung text/historical outcome.

## Backlog — KHÔNG CHẠY NGAY

| ID | Task | Prerequisites | Status |
|---|---|---|---|
| AUD-01 | Audit audio hiện hành, chọn giải pháp phát qua Web Audio / HTMLAudio | UI thoại và map đạt G10 | DONE (02/11/2026): chọn Web Audio API, không thêm thư viện |
| AUD-02 | Global Audio Engine, Music/Ambience/SFX/Voice buses, mute/save | AUD-01 | DONE (02/11/2026): `src/app/game/audio/`, nút tắt tiếng và âm lượng ở thanh trên; chưa có tệp âm thanh nên chạy im lặng |
| AUD-03a | Nối Trận Đồ (prompt A2) | AUD-02 | DONE (02/11/2026): `formation/sounds.ts`, nhạc theo màn và lớp căng thẳng theo thanh Bỏ Lệnh; chờ tệp |
| AUD-03 | SFX match-3, combo, kỹ năng, chuyển lượt đúng animation cue | AUD-02 | TODO — DEFERRED |
| AUD-04 | BGM + ambience theo atlas, hội thoại, chuẩn bị, battle, ending | AUD-02 | TODO — DEFERRED |
| AUD-05 | Voice Bible, TTS test, voice casting + transcript manifest | UI dialogue frozen | TODO — DEFERRED |
| AUD-06 | Voice Player đồng bộ câu thoại, ducking BGM, skip/pause/replay | AUD-02, AUD-05 | TODO — DEFERRED |
| AUD-07 | Audio export/normalization/compression và QA/license | AUD-03…06 | TODO — DEFERRED |

## Hiện trạng (02/11/2026)

Đã có engine và nút âm thanh toàn game, và Trận Đồ đã nối cue/nhạc. `public/audio/manifest.json` đang rỗng nên **chưa có tiếng**: thả tệp `.ogg` và `.m4a` vào `public/audio/` rồi thêm dòng manifest theo [quy ước](02-architecture-and-assets.md#3-quy-ước-tệp) (test kiểm đủ tệp). Các chế độ khác (A3, A4) chưa nối.

## Không nằm trong bản UI hiện tại

- ~~Không thêm code `AudioEngine`~~ (đã thêm 02/11/2026, xem trên); vẫn không cài `howler`/lib mới.
- Không dùng speechSynthesis autoplay, không gọi API ElevenLabs/FPT/TTSMaker.
- Không bắt người dùng upload audio, không tạo “audio giả” để pass.
- Không phát âm thanh khi chưa có thao tác người dùng.
- Không chèn khóa API TTS vào client.

## Docs phục vụ khi quay lại

- `01-voice-bible.md` (chưa viết): hồ sơ giọng & luật diễn xuất.
- [02-architecture-and-assets.md](02-architecture-and-assets.md) (DRAFT, 02/11/2026): kiến trúc kỹ thuật, quy ước tệp, bảng cue cho mọi chế độ.
- [04-prompts-trien-khai-theo-che-do.md](04-prompts-trien-khai-theo-che-do.md) (DRAFT, 02/11/2026): prompt giao việc code và prompt tạo âm thanh theo chế độ.
- `03-tts-prompts-and-budget.md` (chưa viết): prompt TTS, hạn mức, giấy phép và ngân sách dự kiến.