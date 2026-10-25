# Audio & Voice — TODO / DEFERRED

> Cập nhật: 26/10/2026
> **Không triển khai trong vòng UI thoại chữ + bản đồ.**

## Danh sách task chờ

| ID | Nội dung | Trạng thái |
|---|---|---|
| AUD-01 | Audit thư viện và luồng CueBus | TODO — DEFERRED |
| AUD-02 | AudioEngine: music / ambience / SFX / voice buses và mute | TODO — DEFERRED |
| AUD-03 | SFX match-3, combo, kỹ năng, chuyển lượt bám animation | TODO — DEFERRED |
| AUD-04 | BGM, ambience theo scene | TODO — DEFERRED |
| AUD-05 | Voice Bible, cast giọng theo character ID, transcript | TODO — DEFERRED |
| AUD-06 | VoicePlayer khớp DialoguePlayer, ducking/skip/replay | TODO — DEFERRED |
| AUD-07 | Tối ưu audio, licensing, kiểm tra mobile | TODO — DEFERRED |

## Contract chuẩn bị trước

- Text có `missionId`, `section`, `speakerId` và `beatKey` để sau này ánh xạ audio theo từng câu.
- Không cần file MP3/WAV/OGG để hoàn thành một mission.
- Không bật âm trước khi người dùng click; tính đến autoplay limitations trên web.
- Chỉ thu âm các câu thoại đã duyệt, theo license được phép sử dụng, không voice clone người không đồng ý.
- Dự toán TTSMaker theo số ký tự thực tế và lưu text hash, không khẳng định gói miễn phí luôn có hạn mức cố định.
- Hiện tại không cài thư viện audio, không gọi TTS API, không tạo placeholder audio.
