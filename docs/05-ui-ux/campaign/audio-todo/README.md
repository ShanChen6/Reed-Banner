# AUDIO/VOICE — TODO / DEFERRED (CHƯA THỰC HIỆN)

> Cập nhật: 19/11/2026  
> Trạng thái: **DEFERRED** — một phần nhạc và âm thanh đã có code; phần còn lại để sau.
> Trạng thái của **tất cả task** ở đây: `TODO`, không nằm trong phạm vi triển khai thoại chữ + bản đồ.

## Mục tiêu tương lai

Giữ voice profile nhất quán theo ID nhân vật; music/ambience/SFX/voice hoạt động trên web sau một tương tác chủ động; audio không được là điều kiện để hiểu cốt truyện. Thay file audio mà không sửa nội dung text/historical outcome.

## Backlog — KHÔNG CHẠY NGAY

| ID | Task | Prerequisites | Status |
|---|---|---|---|
| AUD-01 | Audit audio hiện hành, chọn giải pháp phát qua Web Audio / HTMLAudio | UI thoại và map đạt G10 | DONE (02/11/2026): chọn Web Audio API, không thêm thư viện |
| AUD-02 | Global Audio Engine, Music/Ambience/SFX/Voice buses, mute/save | AUD-01 | DONE (02/11/2026): `src/app/game/audio/`, nút tắt tiếng và âm lượng ở thanh trên; chưa có tệp âm thanh nên chạy im lặng |
| AUD-03a | Nối Trận Đồ (prompt A2) | AUD-02 | DONE (02/11/2026): `formation/sounds.ts`, nhạc theo màn và lớp căng thẳng theo thanh Bỏ Lệnh; chờ tệp |
| AUD-03 | SFX match-3, combo, kỹ năng, chuyển lượt đúng animation cue | AUD-02 | DONE (02/11/2026): `battle/sounds.ts` nối vào `DemoGame` (trận thường, luyện tập, chiến dịch, sinh tồn); chờ tệp. Thêm tiếng khắc hệ (`battle.crit`), đổi lượt, đồng hồ 5 giây cuối (21/11/2026) |
| AUD-04 | BGM + ambience theo atlas, hội thoại, chuẩn bị, battle, ending | AUD-02 | DONE (02/11/2026): `audio/sceneMusic.ts` + `SceneAudio` (nhạc và âm nền theo phân cảnh), nhạc thoại/kết cục, nhạc trận theo loại trận; chờ tệp. Nhạc `prep` nối 23/11/2026. `atlas.unlock`, `arena.ghost`, `tower.*`, `destiny.*` nối 23/11/2026. Chưa có cue `pvp.*` |
| AUD-05 | Voice Bible, TTS test, voice casting + transcript manifest | UI dialogue frozen | TODO — DEFERRED |
| AUD-06 | Voice Player đồng bộ câu thoại, ducking BGM, skip/pause/replay | AUD-02, AUD-05 | TODO — DEFERRED |
| AUD-07 | Audio export/normalization/compression và QA/license | AUD-03…06 | TODO — DEFERRED |

## Hiện trạng (rà lại 19/11/2026)

Đã có engine, nút âm thanh toàn game và manifest `public/audio/manifest.json` (nguồn tệp ở `public/audio/CREDITS.md`). Thêm tiếng = thả tệp `.ogg` và `.m4a` vào `public/audio/` rồi thêm dòng manifest theo [quy ước](02-architecture-and-assets.md#3-quy-ước-tệp). Bảng dưới đối chiếu phân cảnh trong `src/app/game/scene.ts` với code và tệp đang có.

### Màn chơi chưa nối âm thanh (không có nhạc, không có cue)

| Màn | Ghi chú |
|---|---|
| Tầm Tướng Ký (`TAM_TUONG_KY`) | Chưa gọi `useAudio`, `soundOfScene` trả im lặng |
| Viễn Chinh (`EXPEDITION`) | Màn sa bàn phát `music/expedition` (23/11/2026); trận đánh mở ra qua `DemoGame` nên có tiếng trận |
| Khai Lộ (`KHAI_LO`) | Chưa nối |
| Nhật Lệnh (`DAILY`) | Màn chọn thử thách phát `music/daily`, điểm danh phát `daily.checkin` (23/11/2026); trong trận dùng `battle_normal`, `daily.complete` có tệp |

### Màn đã nối code nhưng còn thiếu tệp

| Màn | Có tiếng | Thiếu tệp |
|---|---|---|
| Trận Đồ | `formation_menu`, `formation_play` (kèm lớp căng thẳng `formation_play_layer2`), `formation_result_win`, `formation_result_lose` và 17/17 cue `formation.*` | — |
| Trận đánh (Giao Tranh, Thao Luyện, Bình Loạn, Viễn Chinh…) | `battle_normal`, `battle_boss`; `swap`, `invalid`, `match3`, `match4`, `match5`, `combo1..4`, `ultimate`, `heal`, `shield`, `buff`, `debuff`, `burn`, `freeze`, `poison`, `hit.*`, `skill.*`, `damage`, `ko`, `win`, `lose` | Mọi cue đã có tệp (21/11/2026). `hit.<nghề>` dùng chung một bộ, `skill.<hệ>` dùng chung một bộ |
| Bình Loạn (ngoài trận) | `atlas`, `dialogue`, `ending`, âm nền `amb/atlas`, cue `atlas.select` (23/11/2026) | Cue `dialogue.next` |
| Tháp Thí Luyện | Nhạc `tower_trial` ở màn Tháp (21/11/2026); trận trong Tháp dùng `battle_normal` | — |
| Tháp Thiên Mệnh | Nhạc `tower_destiny` cho cả màn Tháp lẫn trận trong Tháp (22/11/2026) | — |
| Trấn Ải (Sinh tồn) | `survival` | Cue `survival.wave`, `survival.warn` |
| Sử Lộ | Đã nối 19/11/2026: 16 cue `sulo.*`, tiếng ghép ô trận trùm, nhạc `sulo_maze`/`sulo_boss` ([bảng 5.6](02-architecture-and-assets.md#56-sử-lộ-sulo-đã-nối-19112026)) | Đủ tệp riêng cho 16 cue và hai bản nhạc (20/11/2026) |
| Do Thám | Đã nối 19/11/2026: 8 cue `dotham.*`, tiếng đạo cụ theo hệ, nhạc `dotham` ([bảng 5.7](02-architecture-and-assets.md#57-do-thám-dotham-đã-nối-19112026)) | `dotham.open`, `cascade`, `flag`, `shield`, `reject` đã có tệp riêng (20/11/2026); `trap`, `win`, `lose` và bản nhạc đang mượn tệp của Trận Đồ và trận đánh |
| Quần Hùng | `arena` | Cue `arena.rank`; nhạc `pvp` đã có tệp nhưng chưa nối vào trận PvP |

### Cue đã khai báo nhưng chưa nối code

- `ui.click`, `ui.back`, `ui.open`, `ui.close`, `ui.error` nối 23–24/11/2026 qua `UiSounds`; `ui.reward` phát khi nhận thưởng (nhiệm vụ, thành tựu, bậc thưởng, thưởng hạng cuối kỳ).
- `music/ending_*`, `pvp.*`: chưa có trong `cues.ts`.

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