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
| `sfx/su-lo/roll_a..b`, `move_a..c`, `nomove_a` | Cắt tay từ ba đoạn Gemini tạo (19/11/2026, prompt `sulo_roll`, `sulo_move`, `sulo_nomove` trong bộ prompt Gemini). Gemini trả về nhạc nhịp gõ; chỉ lấy các tiếng rời ở đoạn mở đầu hoặc sau khoảng lặng (roll: giây 20,15 và 37,05; move: 3,66, 4,12 và 33,22; nomove: 0,0) | Như trên |
| `sfx/su-lo/correct_a..c` | Cắt tay từ đoạn Gemini tạo (19/11/2026, prompt `sulo_correct`): ba tiếng chuông rời ở giây 30,70, 32,91 và 35,13 (phần còn lại của đoạn là nhạc) | Như trên |
| `sfx/su-lo/wrong_a..c`, `trap_a..b` | Cắt tay từ hai đoạn Gemini tạo (19/11/2026, prompt `sulo_wrong`, `sulo_trap`): wrong là ba tiếng trầm rời ở giây 1,43, 3,73 và 7,44; trap là hai cú va ở giây 7,42 và 2,14 (phần sau của cả hai đoạn là nhạc) | Như trên |
| `sfx/su-lo/disarm_a..b` | Cắt tay từ đoạn Gemini tạo (19/11/2026, prompt `sulo_disarm`): đoạn là nhạc nhịp gõ liền, chỉ lấy hai cú gõ tắt đủ sâu ở giây 1,88 và 0,04; nên tạo lại nếu có bản tốt hơn | Như trên |
| `sfx/su-lo/luck_a` | Cắt tay từ đoạn Gemini tạo (19/11/2026, prompt `sulo_luck`): tiếng chuông mở đầu ở giây 0,0–0,97 (phần sau là nhạc liền) | Như trên |
| `sfx/su-lo/gate_a..b` | Cắt tay từ đoạn Gemini tạo (19/11/2026, prompt `sulo_gate`): tiếng đánh mạnh rồi ngân, lặp ở giây 0,0 và 7,99, cắt 1,8 giây (nghe như chiêng hơn tiếng cửa gỗ) | Như trên |
| `sfx/su-lo/aid_a..b`, `stele_a` | Dựng từ đoạn Gemini tạo (19/11/2026, prompt `sulo_aid`): aid là tiếng sột soạt ở giây 0,03 và 0,98 trộn với tiếng chuông ở giây 7,43 (vào sau 0,15 giây, nhỏ hơn 6 dB); stele là tiếng sột soạt dài ở giây 5,13–6,58 của cùng đoạn. Đoạn prompt `sulo_stele` chỉ có tiếng tách ngắn trên nền ồn nên không dùng | Như trên |

Cue `sulo.*` và nhạc `sulo_maze`, `sulo_boss` của Sử Lộ chưa có tệp riêng: manifest trỏ về các tệp ở bảng trên (xem bảng 5.6 trong `docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md`).

Cue `dotham.*` và nhạc `dotham` của Do Thám cũng chưa có tệp riêng: manifest trỏ về các tệp ở bảng trên (xem bảng 5.7 cùng tài liệu).
