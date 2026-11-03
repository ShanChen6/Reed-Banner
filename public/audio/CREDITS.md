# Nguồn và giấy phép âm thanh

| Tệp | Nguồn | Giấy phép / ghi chú |
|---|---|---|
| `sfx/formation/place_a..c` | Cắt từ một đoạn do Gemini tạo (tên bản "The Tenth Move") bằng `scripts/slice-sfx.py`, prompt `formation.place` trong docs | Shan tạo bằng tài khoản Gemini của mình; cần Shan xác nhận điều khoản dùng thương mại của gói đang dùng |
| `sfx/formation/reject_a..c` | Cắt từ một đoạn do Gemini tạo (tên bản "The Board's Reply") bằng `scripts/slice-sfx.py`, prompt `formation.reject` | Như trên |
| `sfx/formation/fogclear_a..c`, `line_a..b`, `discard_a..c`, `flame1_a..b` | Cắt từ bốn đoạn Gemini tạo (02/11/2026) bằng `scripts/slice-sfx.py`, prompt cùng tên cue trong docs | Như trên |
| `sfx/formation/win_a..b`, `lose_a,c`, `flame2_a..c`, `flame3_a..b` | Cắt từ bốn đoạn Gemini tạo (02/11/2026) bằng `scripts/slice-sfx.py` | Như trên |
| `sfx/formation/eraser_a..b`, `wild_a..c`, `match_a..c`, `flamedown_a..b`, `fusion_a..b` | Cắt từ năm đoạn Gemini tạo (02/11/2026) bằng `scripts/slice-sfx.py` | Như trên |
| `sfx/battle/swap_a..c`, `sfx/formation/tick_a..c`, `rank_a..b` | Cắt từ ba đoạn Gemini tạo (02/11/2026) bằng `scripts/slice-sfx.py` | Như trên |
| `music/formation_menu` | Bản nhạc Gemini tạo (02/11/2026), chuẩn hóa -18 LUFS và làm vòng lặp bằng `scripts/make-music-loop.py` | Như trên |
| `sfx/battle/hit1..3_*`, `invalid_a..c`, `match3_a..c` | Cắt từ năm đoạn Gemini tạo (02/11/2026) bằng `scripts/slice-sfx.py`. Tiếng đòn đánh dùng chung cho cả 8 nghề; `match4`/`match5` dùng lại tiếng `match3` với tốc độ cao hơn | Như trên |
| `sfx/battle/win_a`, `lose_a..b`, `ko_a..c`, `damage_a..c`, `skill_a..c` | Cắt từ năm đoạn Gemini tạo (03/11/2026) bằng `scripts/slice-sfx.py`. Tiếng kỹ năng dùng chung cho cả 7 hệ; tệp `damage` Gemini tạo kèm cả chí mạng nhưng chưa có cue chí mạng | Như trên |
| `music/atlas`, `dialogue`, `survival`, `battle_boss`, `battle_normal` | Năm bản nhạc Gemini tạo (03/11/2026), chuẩn hóa -18 LUFS và làm vòng lặp bằng `scripts/make-music-loop.py` (cắt phần tắt dần ở cuối, trộn 3 giây) | Như trên |
| `music/arena`, `music/pvp` | Hai bản nhạc Gemini tạo (03/11/2026), làm vòng lặp bằng `scripts/make-music-loop.py`. `pvp` dành cho Quần Hùng online (chưa phát triển) | Như trên |
