# Prompt triển khai âm thanh theo chế độ chơi

> Cập nhật: 02/11/2026
> Trạng thái: **DRAFT** — bộ prompt để giao việc và tạo âm thanh ([README](README.md)); A1, A2, A3 và A4 đã thực hiện (02/11/2026), A5 và phần tạo tệp âm thanh (B) chưa. Kiến trúc, quy ước tệp và bảng cue ở [02-architecture-and-assets.md](02-architecture-and-assets.md) (nguồn chính, không lặp ở đây).

Hai nhóm prompt: **A** giao cho Claude Code/Codex để viết code (theo thứ tự AUD-02 → AUD-03 → AUD-04), **B** dán vào công cụ tạo âm thanh để có tệp. Làm A1 trước, có tệp tạm hoặc im lặng đều chạy được; B làm song song.

## A. Prompt triển khai (code)

Mọi prompt A đều kèm khối chung này ở cuối:

```
Quy tắc chung: đọc AGENTS.md và docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md trước; Next.js của repo có thay đổi so với kiến thức cũ, đọc node_modules/next/dist/docs/ trước khi viết code. Không thêm thư viện ngoài. Âm thanh chỉ phát sau thao tác người dùng, không đổi luật hay kết quả, không import vào src/core. Không tạo tệp âm thanh giả; thiếu tệp thì cue im lặng (có cảnh báo trong dev). Viết test (node:test + tsx), chạy pnpm lint, npx tsc --noEmit, pnpm test, pnpm docs:check. Commit với tác giả Shan <shanchen611@gmail.com>, không thêm Co-Authored-By hay Claude-Session, push lên develop.
```

### A1. Engine âm thanh toàn cục (AUD-02)

```
Xây AudioEngine theo mục 2 của 02-architecture-and-assets.md trong src/app/game/audio/: engine.ts (AudioContext mở sau cử chỉ đầu tiên, 4 bus music/ambience/sfx/voice với ducking, cache buffer, giới hạn 8 cue đồng thời và 40 ms giữa hai lần cùng cue, rate ngẫu nhiên ±3%, chọn biến thể _a/_b/_c, chọn ogg hoặc m4a theo canPlayType), manifest.ts (đọc public/audio/manifest.json), settings.ts (âm lượng 4 bus và tắt tiếng lưu localStorage bọc try/catch), AudioProvider.tsx (context, useAudio, usePlayCue) và cues.ts. Thêm nút tắt/mở tiếng vào thanh trên (src/app/game/header) và mục âm lượng trong cài đặt hiện có. Test bằng AudioContext giả: chưa unlock thì không phát, tắt tiếng thì không phát, giới hạn đồng thời, ducking trả âm lượng, manifest khớp cues.ts và tệp tồn tại. Chưa nối chế độ nào.
```

### A2. Trận Đồ (`formation.*`)

```
Nối âm thanh vào Trận Đồ (src/app/game/formation/FormationScreen.tsx, BoardView.tsx, ModeScreen.tsx) theo mục 5.2 của 02-architecture-and-assets.md. Nghe `events` do transition() trả về (placed, covered, erased, lineCleared, discarded, heat, won, lost) và lý do từ chối (notAdjacent, mismatch, blocked, occupied) để phát cue formation.*. Lớp căng thẳng của nhạc formation_play tăng theo discardHeat (0, 0.33, 0.66, 1) với crossfade 600 ms; nhạc đổi theo màn (chọn bậc, đang chơi, kết quả thắng/thua); formation.line cao dần khi nhiều đường dọn cùng lúc; formation.tick chỉ ở màn chọn bậc khi kỳ còn dưới 1 giờ. Không phát khi ván đang được nạp lại từ lưu (replay). Tôn trọng chế độ giảm hiệu ứng. Test bằng engine giả: đúng cue cho từng sự kiện, không phát cue trùng khi render lại.
```

### A3. Trận đánh chung: Chiến dịch, Thường, Tháp, Sinh tồn, Thử thách, Đấu trường (AUD-03)

```
Nối âm thanh vào trận đánh theo mục 5.3 của 02-architecture-and-assets.md. Nghe BattleEvent qua lớp đạo diễn trận (src/app/game/battle) để cue khớp hoạt ảnh, không phát lúc tính toán. Cue theo nghề (battle.hit.<nghe>) và hệ (battle.skill.<he>) chọn từ dữ liệu sự kiện; combo cao dần theo tầng; battle.ko, win, lose. Nhạc theo loại trận: thường, trùm, tháp, sinh tồn (lớp tăng theo đợt). Nếu đạo diễn trận chưa có thì phát ở điểm kết thúc từng bước hoạt ảnh hiện có và ghi rõ chỗ cần đổi sau. Có chế độ "Giảm hiệu ứng": gộp cue lặp dày. Test: mỗi loại BattleEvent ra đúng một cue, không phát khi tắt tiếng.
```

### A4. Chiến dịch ngoài trận, Tháp, Sinh tồn, Thử thách, Đấu trường (AUD-04)

```
Nối nhạc nền và ambience theo mục 5.4 và 5.5: bản đồ toàn cảnh (atlas), thoại chữ (nhạc nhỏ, không át chữ), chuẩn bị trận, kết cục; nhạc riêng cho Tháp Thí Luyện, Tháp Vận Mệnh, Sinh tồn, Đấu trường; cue riêng (atlas.select, dialogue.next, tower.floor, destiny.choose, survival.wave, survival.warn, daily.complete, arena.rank). Đổi scene thì crossfade 800 ms, không cắt đột ngột; tab ẩn thì tạm dừng. Mỗi scene khai báo bộ nhạc của nó ở một chỗ (cues.ts hoặc scene.ts) thay vì rải rác trong từng màn.
```

### A5. Giọng đọc nhân vật (AUD-05/06, làm sau cùng)

```
Chỉ làm khi Voice Bible (01-voice-bible.md) đã được Shan duyệt. Voice Player đồng bộ câu thoại: phát/tạm dừng/phát lại/bỏ qua, bus voice làm ducking nhạc 6–9 dB, phụ đề luôn hiện (âm thanh không phải điều kiện để hiểu), manifest transcript khớp tệp. Không gọi API TTS từ client; không dùng speechSynthesis tự phát.
```

## B. Prompt tạo âm thanh

Công cụ gợi ý: hiệu ứng bằng công cụ tạo SFX từ văn bản (ví dụ ElevenLabs Sound Effects, Stable Audio), nhạc bằng công cụ tạo nhạc (ví dụ Suno, Udio, Lyria). Kiểm tra giấy phép thương mại của gói đang dùng trước khi đưa tệp vào repo, và ghi nguồn vào `public/audio/CREDITS.md`. Tạo 3 lượt cho mỗi cue rồi chọn tốt nhất (hoặc dùng làm biến thể `_a/_b/_c`).

### B1. Khối phong cách (dán đầu mọi prompt hiệu ứng)

```
Short dry game sound effect, no music, no voice, no reverb tail beyond 0.3 s, no background noise, clean start and end, mono, naturalistic materials: lacquered wood, bamboo, bronze, silk, paper, soft metal bells. Warm and low-mid focused, never harsh or shrill. Setting: 10th-century Vietnamese war table game.
```

### B2. Hiệu ứng Trận Đồ (P1)

| Cue | Prompt (ghép sau B1) |
|---|---|
| `formation.place` | A small round lacquered wooden game piece placed down firmly on a wooden board, one soft clack with a tiny hollow resonance, 0.25 s. (3 variations) |
| `formation.reject` | A dull muted wooden knock followed by a quick soft slide of the piece sliding back, gentle error feeling not alarming, 0.25 s. |
| `formation.fogclear` | A soft breath of wind dissolving a cloud of mist, airy whoosh fading out, no pitch, 0.6 s. |
| `formation.line` | A golden sweeping chime: a bronze bell strike and a quick rising swish traveling left to right, bright but warm, 1 second. |
| `formation.discard` | A paper order scroll being crumpled in a hand, 0.3 s. |
| `formation.flame1` | A small flame catching with a soft crackle and whoosh, 0.6 s. |
| `formation.flame2` | A medium fire flaring up with a stronger whoosh and crackle, 0.8 s. |
| `formation.flame3` | A large fire roaring up with a low ominous bronze gong undertone, warning feeling, 1 second. |
| `formation.win` | A triumphant short fanfare: bronze drum hit, then bamboo flute opening into a wide held chord with a gentle bell shimmer, feeling of a map revealing, 4 seconds. |
| `formation.lose` | A fire dying out, a low muted drum, a bamboo flute phrase falling downward, 2.5 seconds. |

P2: `formation.match` (a warm single bronze bell ring), `formation.wild` (a gold coin spinning then planting on wood), `formation.eraser` (a cloth sweep with golden dust sparkle), `formation.fusion` (a bamboo flute chord with a soft bronze drum bloom), `formation.flamedown` (a flame sputtering out), `formation.rank` (bronze gong strikes, longer for first place), `formation.tick` (one slow wooden mõ knock).

### B3. Nhạc Trận Đồ

```
Instrumental loop, 100 BPM, calm and thoughtful, 10th-century Vietnamese feel: bamboo flute (sáo trúc) leading a gentle melody, sparse đàn tranh plucks, soft low drone, occasional wooden block; warm, spacious, no vocals, no electronic drums, seamless loop of about 110 seconds. For a strategy puzzle played on a wooden war table; must not distract from thinking.
```

Lớp căng thẳng (`formation_play_layer2`, cùng tốc độ và tông, chỉ gồm lớp thêm vào): `Same tempo and key as the base loop, layer only: slow soft bronze-drum pulse and a low đàn bầu bending note that builds tension, no melody of its own, seamless loop of the same length.` Màn chế độ: `Gentle opening theme with đàn tranh arpeggios and bamboo flute, hopeful and welcoming, 90 seconds loop.` Kết quả thắng/thua: ngắn 8–12 giây, lấy ý từ `formation.win`/`formation.lose`.

### B4. Hiệu ứng trận đánh (P1)

| Cue | Prompt (ghép sau B1) |
|---|---|
| `battle.swap` | Two wooden tiles swapping places, one light clack, 0.12 s. |
| `battle.match3` | A bright wooden marimba-like note with a small bell tail, satisfying, 0.3 s. (`match4`, `match5` higher and longer; `combo1..4` rising in pitch each step, `combo4` adds a bronze gong.) |
| `battle.invalid` | A dull wooden knock and a short slide back, 0.2 s. |
| `battle.hit.<nghe>` | Tướng sĩ: sword slash with metal ring. Binh lính: spear thrust and shield thud. Pháp sư: magical whoosh with soft chime. Y sĩ: gentle herbal sparkle. Mưu sĩ: fan snap and bamboo slip rattle. Quân sư: war banner flap and drum tap. Xạ thủ: bowstring twang and arrow whistle. Sát thủ: quick dagger slash and cloth rustle. Each 0.3–0.5 s. |
| `battle.skill.<he>` | Kim: bronze blade ring. Mộc: wood cracking and leaves rustling. Thủy: wave surge. Hỏa: fire burst. Thổ: heavy earth rumble. Lôi: lightning crack. Phong: sharp wind howl. Each 0.6–1 s. |
| `battle.damage` / `battle.crit` | A heavy dull impact; crit adds a sharp bronze gong strike. 0.3 s. |
| `battle.ko` | A heavy thud and an exhale, 0.8 s. |
| `battle.win` | Bronze drum and bamboo flute victory fanfare, 3–4 s. |
| `battle.lose` | Low drum and a falling đàn bầu phrase, 3 s. |

### B5. Nhạc theo chế độ

| Nhạc | Prompt |
|---|---|
| `music/atlas` | `Instrumental, slow, 70 BPM, sweeping historical map feeling: bamboo flute and đàn tranh, distant wind and birds, warm and wide, 10th-century Vietnamese, no vocals, seamless 120 s loop.` |
| `music/dialogue` | `Very sparse solo đàn bầu with long pauses, soft and sad, must not mask spoken text, seamless 90 s loop.` |
| `music/battle_normal` | `Instrumental battle loop, 120 BPM, bronze drums and bamboo flute, driving but not aggressive, Vietnamese traditional instruments with a modern game-score polish, no vocals, seamless 100 s loop.` |
| `music/battle_boss` | `Same instruments as battle_normal but heavier: deep bronze drum ostinato, low war horn, tense đàn bầu bends, 135 BPM, seamless 100 s loop.` |
| `music/tower_trial` / `tower_destiny` | `Dark, echoing stone-tower atmosphere with deep drum, slow đàn bầu and sparse bell tones; destiny version more mysterious with a faint drone; seamless 100 s loops.` |
| `music/survival` | `Relentless but steady rhythmic loop with hand drums and clapper, layer for rising intensity, seamless 90 s loop.` |
| `music/arena` | `Competitive duel feeling: tight drums, plucked đàn tranh motifs, 125 BPM, seamless 90 s loop.` |
| `music/pvp` (sau này) | `Same family as arena but more triumphant; seamless 90 s loop.` |

## C. Thứ tự đề nghị

1. A1 (engine) cùng B2 (hiệu ứng Trận Đồ P1) và B3 (nhạc Trận Đồ): có thể thử cảm giác ngay ở chế độ vừa làm UI.
2. A2 (nối Trận Đồ).
3. B4 và A3 (trận đánh, chiếm nhiều cue nhất).
4. B5 và A4 (nhạc theo chế độ).
5. A5 chỉ sau khi duyệt Voice Bible.
