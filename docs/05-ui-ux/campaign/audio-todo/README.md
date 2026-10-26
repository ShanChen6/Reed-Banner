# AUDIO/VOICE — TODO / DEFERRED (CHƯA THỰC HIỆN)

> Cập nhật: 26/10/2026  
> Trạng thái của **tất cả task** ở đây: `TODO`, không nằm trong phạm vi triển khai thoại chữ + bản đồ.

## Mục tiêu tương lai

Giữ voice profile nhất quán theo ID nhân vật; music/ambience/SFX/voice hoạt động trên web sau một tương tác chủ động; audio không được là điều kiện để hiểu cốt truyện. Thay file audio mà không sửa nội dung text/historical outcome.

## Backlog — KHÔNG CHẠY NGAY

| ID | Task | Prerequisites | Status |
|---|---|---|---|
| AUD-01 | Audit audio hiện hành, chọn giải pháp phát qua Web Audio / HTMLAudio | UI thoại và map đạt G10 | TODO — DEFERRED |
| AUD-02 | Global Audio Engine, Music/Ambience/SFX/Voice buses, mute/save | AUD-01 | TODO — DEFERRED |
| AUD-03 | SFX match-3, combo, kỹ năng, chuyển lượt đúng animation cue | AUD-02 | TODO — DEFERRED |
| AUD-04 | BGM + ambience theo atlas, hội thoại, chuẩn bị, battle, ending | AUD-02 | TODO — DEFERRED |
| AUD-05 | Voice Bible, TTS test, voice casting + transcript manifest | UI dialogue frozen | TODO — DEFERRED |
| AUD-06 | Voice Player đồng bộ câu thoại, ducking BGM, skip/pause/replay | AUD-02, AUD-05 | TODO — DEFERRED |
| AUD-07 | Audio export/normalization/compression và QA/license | AUD-03…06 | TODO — DEFERRED |

## Không nằm trong bản UI hiện tại

- Không thêm code `AudioEngine`, không cài `howler`/lib mới.
- Không dùng speechSynthesis autoplay, không gọi API ElevenLabs/FPT/TTSMaker.
- Không bắt người dùng upload audio, không tạo “audio giả” để pass.
- Không phát âm thanh khi chưa có thao tác người dùng.
- Không chèn khóa API TTS vào client.

## Docs phục vụ khi quay lại

- `01-voice-bible.md` (chưa viết): hồ sơ giọng & luật diễn xuất.
- `02-architecture-and-assets.md` (chưa viết): kiến trúc kỹ thuật, asset conventions, quality.
- `03-tts-prompts-and-budget.md` (chưa viết): prompt TTS, hạn mức, giấy phép và ngân sách dự kiến.