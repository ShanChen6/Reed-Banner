# Prompt triển khai âm thanh theo chế độ chơi

> Cập nhật: 19/11/2026
> Trạng thái: **DRAFT** — bộ prompt để giao việc và tạo âm thanh ([README](README.md)); A1–A4 đã thực hiện (02/11/2026), Sử Lộ và Do Thám đã nối (19/11/2026); A5–A9 và phần lớn tệp âm thanh (B) chưa. Phần còn thiếu theo từng màn ở [README](README.md#hiện-trạng-rà-lại-19112026); prompt cho phần đó ở A6–A9 và B6–B9. Kiến trúc, quy ước tệp và bảng cue ở [02-architecture-and-assets.md](02-architecture-and-assets.md) (nguồn chính, không lặp ở đây).

Hai nhóm prompt: **A** giao cho Claude Code/Codex để viết code (theo thứ tự AUD-02 → AUD-03 → AUD-04), **B** dán vào công cụ tạo âm thanh để có tệp. Làm A1 trước, có tệp tạm hoặc im lặng đều chạy được; B làm song song.

## A. Prompt triển khai (code)

Mọi prompt A đều kèm khối chung này ở cuối:

```
Quy tắc chung: đọc AGENTS.md và docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md trước; Next.js của repo có thay đổi so với kiến thức cũ, đọc node_modules/next/dist/docs/ trước khi viết code. Không thêm thư viện ngoài. Âm thanh chỉ phát sau thao tác người dùng, không đổi luật hay kết quả, không import vào src/core. Không tạo tệp âm thanh giả; thiếu tệp thì cue im lặng (có cảnh báo trong dev). Viết test (node:test + tsx), chạy pnpm lint, npx tsc --noEmit, pnpm test, pnpm docs:check. Commit theo AGENTS.md (tên ShanChen6), không thêm Co-Authored-By hay Claude-Session, push lên develop.
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

### A6. Khai Lộ (`khailo.*`)

```
Nối âm thanh vào Khai Lộ (src/app/game/khai-lo/KhaiLoScreen.tsx) theo cách đã làm ở Sử Lộ và Do Thám (su-lo/sounds.ts, do-tham/sounds.ts): viết src/app/game/khai-lo/sounds.ts ánh xạ thuần KlEvent (removed, whirled, thundered, undone, levelDone, over, newLevel) và KlReason sang cue khailo.*; removed cao dần theo số ô xóa (rate theo cells.length, khối lớn thêm một tiếng ngân); Cấp tốc còn 5 giây thì mõ nhịp (khailo.tick). Nhạc khai_lo: một bài cho cả màn, đặt SELF cho KHAI_LO trong audio/sceneMusic.ts. Thêm hằng vào audio/cues.ts, dòng manifest trỏ tạm về tệp sẵn có, bảng 5.8 trong 02-architecture-and-assets.md, test tests/game/khai-lo-sounds.test.ts.
```

### A7. Tầm Tướng Ký (`ttk.*`)

```
Nối âm thanh vào Tầm Tướng Ký (src/app/game/tam-tuong-ky/TamTuongKyScreen.tsx). Luật chạy ở server; chỉ phát cue khi server đã trả kết quả (không phát lúc đang chờ). Cue: ttk.slot (đặt nguyên liệu vào Đài Hợp Nguyên), ttk.miss (kết quả miss hoặc noRecipe), ttk.new (khám phá nguyên liệu mới), ttk.hero (ra tướng, dài và trang trọng hơn), ttk.invalid, ttk.hint (dùng gợi ý). Nhạc tam_tuong_ky, SELF cho TAM_TUONG_KY trong sceneMusic.ts. Viết tam-tuong-ky/sounds.ts thuần (kết quả server -> cue) kèm test; bảng 5.9 trong 02-architecture-and-assets.md.
```

### A8. Viễn Chinh, màn sa bàn (`expedition.*`)

```
Nối âm thanh màn sa bàn Viễn Chinh (src/app/game/expedition/ExpeditionScreen.tsx); trận đánh mở từ đây đã có tiếng qua DemoGame, không đụng. Cue khi server trả kết quả điều quân: expedition.move (kind moved), expedition.blocked (kind blocked), expedition.battle (kind battle, trống thúc trước khi vào trận), expedition.capture (chiếm điểm), expedition.win / expedition.lose (kết thúc chiến dịch). Nhạc expedition cho màn sa bàn (EXPEDITION trong sceneMusic.ts; nếu cần đổi nhạc theo pha thì SELF). Hàm thuần + test; bảng 5.10.
```

### A9. Nhật Lệnh, cue chung UI và cue trận còn thiếu

```
(1) Nhật Lệnh: thêm nhạc daily cho phân cảnh DAILY trong sceneMusic.ts (sửa test scene-audio đang ghi DAILY im lặng); cue daily.checkin khi điểm danh, ui.reward khi nhận thưởng nhiệm vụ ngày. (2) Cue UI chung: nối ui.click/ui.back/ui.error vào component nút dùng chung (src/components/ui) bằng prop tắt được, không phát trên nút trong bàn cờ đã có tiếng riêng; ui.reward ở mọi chỗ nhận thưởng; ui.levelup khi lên cấp. (3) Trận đánh: thêm battle.crit (sự kiện damage có cờ chí mạng), battle.turn (đổi lượt), battle.timer (đồng hồ 30 giây còn 5 giây) vào battle/sounds.ts. (4) Ngoài trận: music prep (màn chuẩn bị trận), atlas.unlock, ending_* theo cấp độ lịch sử, tower.floor, tower.firstclear, destiny.choose, destiny.fail, arena.ghost. Mỗi nhóm một commit, có test.
```

### A5. Giọng đọc nhân vật (AUD-05/06, làm sau cùng)

```
Chỉ làm khi Voice Bible (01-voice-bible.md) đã được Shan duyệt. Voice Player đồng bộ câu thoại: phát/tạm dừng/phát lại/bỏ qua, bus voice làm ducking nhạc 6–9 dB, phụ đề luôn hiện (âm thanh không phải điều kiện để hiểu), manifest transcript khớp tệp. Không gọi API TTS từ client; không dùng speechSynthesis tự phát.
```

## B. Prompt tạo âm thanh

Công cụ gợi ý: hiệu ứng bằng công cụ tạo SFX từ văn bản (ví dụ ElevenLabs Sound Effects, Stable Audio), nhạc bằng công cụ tạo nhạc (ví dụ Suno, Udio, Lyria). Kiểm tra giấy phép thương mại của gói đang dùng trước khi đưa tệp vào repo, và ghi nguồn vào `public/audio/CREDITS.md`. Tạo 3 lượt cho mỗi cue rồi chọn tốt nhất (hoặc dùng làm biến thể `_a/_b/_c`).

> **Lưu ý khi dùng Gemini (02/11/2026):** dán prompt hiệu ứng ngắn vào Gemini cho ra **tệp mp3 khoảng 1 phút gồm nhiều tiếng lặp** (đặt tên như "The Tenth Move"), không phải một tiếng 0,25 giây. Dùng `scripts/slice-sfx.py` để cắt các tiếng đơn sạch nhất, xuất `.ogg` và `.m4a` đúng quy ước:
>
> ```bash
> python3 scripts/slice-sfx.py <tệp mp3> public/audio/sfx/formation place 3 0.28
> ```
>
> Script in thời điểm và điểm số từng tiếng được chọn; nghe lại và chạy lại với tham số khác (số biến thể, độ dài, ngưỡng tách biệt) nếu chưa ưng. Đã làm với `formation.place` (3 biến thể) và `formation.reject` (3 biến thể).

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

### B6. Hiệu ứng trận đánh và UI còn thiếu tệp

Ghép sau B1. Những cue đã có prompt ở B2–B4 mà chưa có tệp (`battle.combo1..4`, `battle.crit`, `formation_play`…) dùng lại prompt ở đó.

| Cue | Prompt |
|---|---|
| `battle.ultimate` | A reversed whoosh sucking in, a deep bronze drum hit, then a wide bright explosion with bell shimmer, 1.5 s. |
| `battle.heal` | A small soft bronze bell with a gentle rising sparkle, soothing, 0.5 s. |
| `battle.shield` | A metallic shield ring, firm and resonant, short tail, 0.4 s. |
| `battle.buff` / `battle.debuff` | Buff: two quick rising bamboo-xylophone notes with a light chime, 0.4 s. Debuff: two falling muted wooden notes with a dull thud, 0.4 s. |
| `battle.burn` / `battle.freeze` / `battle.poison` | Burn: crackling small flames, 0.5 s. Freeze: ice crystals forming with a cold glassy crackle, 0.5 s. Poison: thick liquid bubbling with a soft hiss, 0.5 s. |
| `battle.turn` | One clear wooden mõ knock, 0.2 s. |
| `battle.timer` | A fast single wooden clapper tick, urgent but quiet, 0.25 s (3 variations). |
| `ui.click` / `ui.back` | Click: a light wooden tap, 0.1 s. Back: the same tap one tone lower and softer, 0.12 s. |
| `ui.open` / `ui.close` | A paper scroll unrolling / rolling up with a soft whoosh, 0.3 s. |
| `ui.error` | A dull muted wooden knock, 0.2 s. |
| `ui.reward` | Small bronze coins dropping onto a wooden tray with a tiny bell, 0.9 s. |
| `ui.levelup` | A bronze gong swell followed by a rising bamboo flute phrase, 1.5 s. |
| `atlas.select` / `atlas.unlock` | Select: a single small bronze tap, 0.2 s. Unlock: a scroll unrolling then a small gong, 1 s. |
| `dialogue.next` | A bamboo slip flipped over, dry and light, 0.15 s. |
| `survival.wave` / `survival.warn` | Wave: three rapid war drum hits and a horn blast, 1.2 s. Warn: a low distant war drum roll building, 1.5 s. |
| `daily.complete` / `daily.checkin` | Complete: a bright bronze bell with a short flute flourish, 1.2 s. Check-in: a seal stamped on paper with a soft chime, 0.6 s. |
| `arena.rank` / `arena.ghost` | Rank: gong strikes rising in pitch, 1.5 s. Ghost: an eerie airy whoosh with a faint bell, 1 s. |
| `tower.floor` / `tower.firstclear` | Floor: heavy stone door grinding open with a drum hit, 1.2 s. First clear: a gem chime over a bronze gong, 1.5 s. |
| `destiny.choose` / `destiny.fail` | Choose: a fortune card flipped with a mystical chime, 0.6 s. Fail: a cracked bell tone falling away, 1.2 s. |

### B7. Hiệu ứng riêng cho Sử Lộ và Do Thám (thay tệp đang mượn)

Hiện cue `sulo.*` và `dotham.*` mượn tệp Trận Đồ và trận đánh (bảng 5.6, 5.7 ở [02](02-architecture-and-assets.md)). Ghép sau B1:

| Cue | Prompt |
|---|---|
| `sulo.roll` | A wooden dice rattling in a bamboo cup then tumbling onto a wooden board, 0.8 s. |
| `sulo.move` | A small bronze general token sliding a short way then set down on a map table, 0.3 s. |
| `sulo.nomove` | The dice settling with a dull knock and a short disappointed low tone, 0.4 s. |
| `sulo.correct` / `sulo.wrong` | Correct: a warm bronze bell ring with a short rising flute note, 0.6 s. Wrong: a muted low wooden knock and a falling note, 0.5 s. |
| `sulo.trap` / `sulo.disarm` | Trap: a wooden spike trap snapping shut with a thud, 0.6 s. Disarm: a rope cut and a mechanism clicking safely open, 0.5 s. |
| `sulo.luck` | A sparkle of small bells and a gust of fair wind, 0.8 s. |
| `sulo.gate` | A heavy wooden fortress gate creaking open, 1.2 s. |
| `sulo.stele` | Fingers brushing dust off a stone stele with a soft resonant hum, 0.8 s. |
| `sulo.aid` | A scroll opened quickly with a soft chime, 0.5 s. |
| `sulo.boss` | A war horn and a rolling bronze drum announcing an enemy, 1.5 s. |
| `sulo.counsel` | A folding fan snapping open and a calm flute phrase, 1 s. |
| `sulo.bosswon` / `sulo.bosslost` | Won: drums and flute victory phrase, 2.5 s. Lost: a retreat gong and fading drums, 2 s. |
| `sulo.won` | A city gate opening into a wide triumphant flute and drum fanfare, 4 s. |
| `dotham.open` | A small reed mat lifted off a patch of earth, soft rustle, 0.2 s (3 variations). |
| `dotham.cascade` | Many reed mats lifted in a quick ripple, wind sweeping across a field, 0.7 s. |
| `dotham.flag` | A small reed banner pole pushed into soft earth, 0.25 s (3 variations). |
| `dotham.shield` | Earth rumbling up into a wall and a bronze clang absorbing a blow, 0.7 s. |
| `dotham.reject` | A dull wooden knock, 0.2 s. |
| `dotham.trap` | A hidden pit trap collapsing with a heavy thump and falling dirt, 0.8 s. |
| `dotham.win` / `dotham.lose` | Win: a scout's horn and a bright flute phrase, 3 s. Lose: a low drum and fading flute, 2.5 s. |

### B8. Hiệu ứng cho Khai Lộ, Tầm Tướng Ký, Viễn Chinh (dùng khi làm A6–A8)

| Cue | Prompt (ghép sau B1) |
|---|---|
| `khailo.remove` | A cluster of jade tiles shattering softly into sparkles, pitch rises for bigger groups, 0.4 s (3 variations). |
| `khailo.big` | A large group of jade tiles bursting with a resonant bronze bell, 1 s. |
| `khailo.fall` | Jade tiles sliding down and settling with soft clicks, 0.4 s. |
| `khailo.whirl` / `khailo.thunder` | Whirl: a spinning wind vortex, 0.8 s. Thunder: a sharp lightning crack shattering tiles, 0.8 s. |
| `khailo.undo` | A quick reversed whoosh, 0.3 s. |
| `khailo.tick` | One quiet wooden clapper tick, 0.2 s. |
| `khailo.levelDone` / `khailo.over` | Level done: an ascending jade chime phrase, 2 s. Over: a soft falling đàn tranh phrase, 2 s. |
| `ttk.slot` | A small ingredient placed into a bronze offering bowl, 0.3 s. |
| `ttk.miss` | Smoke puffing out of a bronze altar with a dull hum, 0.8 s. |
| `ttk.new` | A bright mystical chime with a swirl of light, 1 s. |
| `ttk.hero` | A deep gong, a rising flute phrase and a heroic drum hit, a hero appearing, 2.5 s. |
| `ttk.hint` | A soft wind chime, 0.5 s. |
| `expedition.move` | A marching column of footsteps and a banner flap, 0.8 s. |
| `expedition.blocked` | A wooden barricade knock and a horse snort, 0.5 s. |
| `expedition.battle` | Two war drums pounding and a horn call, 1.5 s. |
| `expedition.capture` | A banner planted into the ground with a short drum flourish, 1 s. |

### B9. Nhạc còn thiếu

Nhạc ghép phong cách B3 (nhạc cụ Việt cổ, không lời, vòng lặp liền mạch).

| Nhạc | Prompt |
|---|---|
| `formation_play`, `formation_play_layer2`, `formation_result_win/lose`, `tower_trial`, `tower_destiny` | Dùng prompt ở B3 và B5. |
| `music/ending` | `Reflective closing theme: bamboo flute and đàn tranh, slow and dignified, a story ending, 60 s, may end instead of loop.` |
| `music/prep` | `Steady slow war drums with a low drone and occasional horn, preparation before battle, 80 BPM, seamless 60 s loop.` |
| `amb/atlas` | `Ambience only, no music: light wind over open land, distant birds, rustling reeds, very quiet, seamless 90 s loop, stereo.` |
| `music/sulo_maze` | `Curious, exploratory loop: đàn tranh and bamboo flute with a light hand-drum walking rhythm, a journey through history, 90 BPM, seamless 100 s loop.` |
| `music/sulo_boss` | `Gatekeeper battle loop: heavy bronze drums, war horn, tense đàn bầu, 130 BPM, seamless 90 s loop.` |
| `music/dotham` | `Quiet, careful, suspenseful scouting loop: sparse plucked đàn tranh, soft low drone, occasional wooden tick, night field feeling, 75 BPM, seamless 100 s loop.` |
| `music/khai_lo` | `Light, playful but calm puzzle loop: đàn tranh arpeggios, soft jade-like mallet notes, bamboo flute, 95 BPM, seamless 90 s loop.` |
| `music/tam_tuong_ky` | `Mystical alchemy-altar loop: slow bronze bowl drones, soft bells, breathy flute, 70 BPM, seamless 100 s loop.` |
| `music/expedition` | `Campaign march loop over a war map: marching drums, horn calls, flute melody, determined, 105 BPM, seamless 100 s loop.` |
| `music/daily` | `Morning camp loop: bright bamboo flute, light hand drum, đàn tranh, fresh and hopeful, 95 BPM, seamless 90 s loop.` |

## C. Thứ tự đề nghị

1. A1 (engine) cùng B2 (hiệu ứng Trận Đồ P1) và B3 (nhạc Trận Đồ): có thể thử cảm giác ngay ở chế độ vừa làm UI.
2. A2 (nối Trận Đồ).
3. B4 và A3 (trận đánh, chiếm nhiều cue nhất).
4. B5 và A4 (nhạc theo chế độ).
5. A5 chỉ sau khi duyệt Voice Bible.
6. (19/11/2026) B7 và B9 cho Sử Lộ, Do Thám để thay tệp mượn; A6 (Khai Lộ) cùng B8; A7, A8; A9 cùng B6.
