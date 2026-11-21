# Prompt triển khai âm thanh theo chế độ chơi

> Cập nhật: 19/11/2026
> Trạng thái: **DRAFT** — bộ prompt để giao việc và tạo âm thanh ([README](README.md)); A1–A4 đã thực hiện (02/11/2026), Sử Lộ và Do Thám đã nối (19/11/2026); A5, mục D và phần lớn tệp âm thanh (B) chưa. Phần còn thiếu theo từng màn ở [README](README.md#hiện-trạng-rà-lại-19112026); prompt chi tiết và thứ tự làm phần đó ở [mục D](#d-lộ-trình-phần-còn-thiếu-19112026), prompt tạo tệp ở B6–B9. Kiến trúc, quy ước tệp và bảng cue ở [02-architecture-and-assets.md](02-architecture-and-assets.md) (nguồn chính, không lặp ở đây).

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

### A6–A9. Phần còn thiếu

Prompt chi tiết từng bước và thứ tự làm ở [mục D](#d-lộ-trình-phần-còn-thiếu-19112026).

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

### B8. Hiệu ứng cho Khai Lộ, Tầm Tướng Ký, Viễn Chinh (dùng ở D4–D6)

| Cue | Prompt (ghép sau B1) |
|---|---|
| `khailo.remove` | A cluster of jade tiles shattering softly into sparkles, pitch rises for bigger groups, 0.4 s (3 variations). |
| `khailo.big` | A large group of jade tiles bursting with a resonant bronze bell, 1 s. |
| `khailo.fall` | Jade tiles sliding down and settling with soft clicks, 0.4 s. |
| `khailo.whirl` / `khailo.thunder` | Whirl: a spinning wind vortex, 0.8 s. Thunder: a sharp lightning crack shattering tiles, 0.8 s. |
| `khailo.undo` | A quick reversed whoosh, 0.3 s. |
| `khailo.tick` | One quiet wooden clapper tick, 0.2 s. |
| `khailo.reject` | A dull muted jade knock, 0.2 s. |
| `khailo.leveldone` / `khailo.over` | Level done: an ascending jade chime phrase, 2 s. Over: a soft falling đàn tranh phrase, 2 s. |
| `ttk.slot` / `ttk.unslot` | Slot: a small ingredient placed into a bronze offering bowl, 0.3 s. Unslot: the ingredient lifted out with a soft rattle, 0.25 s. |
| `ttk.miss` | Smoke puffing out of a bronze altar with a dull hum, 0.8 s. |
| `ttk.known` | A short familiar bronze chime, already discovered, 0.5 s. |
| `ttk.reject` | A dull wooden knock on the altar, 0.2 s. |
| `ttk.new` | A bright mystical chime with a swirl of light, 1 s. |
| `ttk.hero` | A deep gong, a rising flute phrase and a heroic drum hit, a hero appearing, 2.5 s. |
| `ttk.hint` | A soft wind chime, 0.5 s. |
| `expedition.move` | A marching column of footsteps and a banner flap, 0.8 s. |
| `expedition.blocked` / `expedition.tide` | Blocked: a wooden barricade knock and a horse snort, 0.5 s. Tide: waves rushing over a sandbar, 1 s. |
| `expedition.battle` | Two war drums pounding and a horn call, 1.5 s. |
| `expedition.capture` | A banner planted into the ground with a short drum flourish, 1 s. |
| `expedition.win` / `expedition.lose` | Win: a long victory horn over drums, 3 s. Lose: a retreat gong and fading drums, 2.5 s. |

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
6. Phần còn thiếu (19/11/2026): theo [mục D](#d-lộ-trình-phần-còn-thiếu-19112026).

## D. Lộ trình phần còn thiếu (19/11/2026)

Hiện trạng từng màn ở [README](README.md#hiện-trạng-rà-lại-19112026). Mỗi bước dưới đây gồm: việc của Shan (tạo tệp bằng prompt B), prompt giao Claude/Codex (dán nguyên khối, kèm khối "Quy tắc chung" ở đầu mục A), và điều kiện coi là xong. Làm theo thứ tự; bước có ghi "song song" làm cùng lúc được.

### Thứ tự và lý do

| Bước | Việc | Loại | Vì sao ở vị trí này |
|---|---|---|---|
| D0 | Quy trình đưa tệp vào repo | Quy ước | Mọi bước có tệp đều dùng |
| D1 | Tệp riêng cho Sử Lộ, Do Thám | Chỉ tệp | Code đã nối, chỉ thay manifest; thấy kết quả ngay |
| D2 | Tệp trận đánh còn thiếu | Chỉ tệp | Trận đánh dùng ở 7 chế độ; code đã nối |
| D3 | Nhạc đã nối mà chưa có tệp (song song D2) | Chỉ tệp | Tháp, Trận Đồ, kết cục, âm nền bản đồ đang im |
| D4 | Khai Lộ | Code + tệp | Chế độ chơi thử offline, im hoàn toàn, engine đã có `KlEvent` nên dễ nối |
| D5 | Tầm Tướng Ký | Code + tệp | Im hoàn toàn; kết quả do server trả nên cần cẩn thận thời điểm phát |
| D6 | Viễn Chinh, màn sa bàn | Code + tệp | Trận đã có tiếng, chỉ thiếu sa bàn |
| D7 | Nhật Lệnh và điểm danh | Code + tệp | Màn phụ, ít cue |
| D8 | Tiếng giao diện chung | Code + tệp | Đụng component dùng chung, làm sau khi các màn ổn để tránh chồng tiếng |
| D9 | Cue trận còn thiếu: chí mạng, đổi lượt, đồng hồ | Code + tệp | Cần kiểm dữ liệu sự kiện core |
| D10 | Cue ngoài trận còn thiếu: chuẩn bị, kết cục theo cấp, Tháp, Đấu trường | Code + tệp | Đánh bóng, ưu tiên P2 |
| D11 | Chuẩn hóa và QA toàn bộ (AUD-07) | Kiểm tra | Làm cuối khi đã đủ tệp |

### D0. Quy trình đưa tệp vào repo

1. Dán prompt B (khối B1 + dòng của cue) vào công cụ tạo âm thanh. Gemini trả một đoạn khoảng 1 phút gồm nhiều tiếng; công cụ SFX khác trả từng tiếng.
2. Cắt hiệu ứng: `python3 scripts/slice-sfx.py <tệp> public/audio/sfx/<chế-độ> <tên> <số biến thể> <độ dài giây>`. Ví dụ Sử Lộ: `python3 scripts/slice-sfx.py roll.mp3 public/audio/sfx/su-lo roll 3 0.8`.
3. Làm vòng lặp nhạc: `python3 scripts/make-music-loop.py <tệp> public/audio/music/<tên> [cắt đuôi giây] [trộn giây] [LUFS]` (mặc định 6, 3, -18). Âm nền làm tương tự vào `public/audio/amb/`.
4. Sửa dòng của cue trong `public/audio/manifest.json` trỏ sang tệp mới (bỏ tệp mượn), ghi nguồn vào `public/audio/CREDITS.md`, sửa cột "Tệp tạm" ở bảng 5.x của [02](02-architecture-and-assets.md).
5. Chạy `pnpm test` (test manifest kiểm tệp có thật) rồi nghe thử trên máy.

Có thể giao bước 2–5 cho Claude: gửi tệp gốc kèm prompt:

```
Đây là tệp âm thanh gốc cho các cue <danh sách cue>. Cắt và chuẩn hóa theo D0 trong docs/05-ui-ux/campaign/audio-todo/04-prompts-trien-khai-theo-che-do.md (slice-sfx.py cho hiệu ứng, make-music-loop.py cho nhạc), chọn tiếng sạch nhất, mỗi cue 2–3 biến thể. Sửa manifest trỏ sang tệp mới, xóa tệp mượn nếu không cue nào dùng nữa, ghi CREDITS.md, cập nhật cột "Tệp tạm" ở bảng tương ứng trong 02-architecture-and-assets.md và bảng Hiện trạng ở README. Báo lại thời điểm cắt và điểm số từng tiếng để tôi nghe lại.
```

### D1. Tệp riêng cho Sử Lộ và Do Thám

- **Shan tạo tệp:** B7 (24 hiệu ứng), B9 dòng `sulo_maze`, `sulo_boss`, `dotham`.
- **Giao Claude:** prompt D0 với danh sách `sulo.*`, `dotham.*`, `music/sulo_maze`, `music/sulo_boss`, `music/dotham`; tệp đặt ở `sfx/su-lo/`, `sfx/do-tham/`.
- **Xong khi:** manifest không còn cue `sulo.*`/`dotham.*` trỏ về `sfx/formation` hay `sfx/battle`; bảng 5.6, 5.7 bỏ cột "Tệp tạm".

### D2. Tệp trận đánh còn thiếu

- **Shan tạo tệp:** B6 dòng `battle.debuff`, `burn`, `freeze`, `poison` (`match4`, `match5`, `combo1..4`, `ultimate`, `heal`, `shield`, `buff` đã có từ 20/11/2026). Nếu muốn tách tiếng theo nghề/hệ: B4 dòng `battle.hit.<nghe>` và `battle.skill.<he>` (hiện 8 nghề và 7 hệ dùng chung một bộ).
- **Giao Claude:** prompt D0 với các cue trên; tệp ở `sfx/battle/`.
- **Xong khi:** mọi cue trong `BATTLE_CUES` có dòng manifest; chơi một trận Giao Tranh nghe đủ combo, tuyệt chiêu, hồi máu, khiên, hiệu ứng trạng thái.

### D3. Nhạc đã nối mà chưa có tệp (song song D2)

- **Shan tạo tệp:** B3 (`formation_play`, `formation_play_layer2`, `formation_result_win`, `formation_result_lose`), B5 (`tower_trial`, `tower_destiny`), B9 (`ending`, `amb/atlas`).
- **Giao Claude:** prompt D0. Thêm: `formation_play_layer2` khai báo là trường `layer` của mục `formation_play` trong manifest (không phải mục riêng); `formation_result_*` và `ending` đặt `"loop": false` nếu bản nhạc có kết thúc; âm nền `atlas` thêm vào mục `ambience` của manifest.
- **Xong khi:** Trận Đồ đổi nhạc giữa chọn bậc, đang chơi, kết quả; lớp căng thẳng to dần theo mức Bỏ Lệnh; Tháp có nhạc; bản đồ Bình Loạn có gió và chim.

### D4. Khai Lộ (`khailo.*`)

- **Shan tạo tệp (có thể sau khi code xong, cue im lặng vẫn chạy):** B8 dòng `khailo.*`, B9 dòng `khai_lo`.
- **Prompt code:**

```
Nối âm thanh cho Khai Lộ (src/app/game/khai-lo/KhaiLoScreen.tsx; luật ở src/core/khai-lo/engine.ts, GDD docs/02-game-modes/khai-lo/gdd.md). Làm theo mẫu đã có ở src/app/game/su-lo/sounds.ts và src/app/game/do-tham/sounds.ts.

1. Viết src/app/game/khai-lo/sounds.ts, hàm thuần không đụng AudioContext:
   - cuesForEvents(events: readonly KlEvent[], before: KlState, after: KlState): CuePlay[] với CuePlay = { id: CueId; rate?: number }.
   - removed: khailo.remove, rate tăng theo cells.length (2 ô = 1, mỗi ô thêm +0,02, trần 1,25); khối từ 8 ô trở lên thêm khailo.big. Ô rơi và cột dồn: khailo.fall phát sau tiếng xóa (độ trễ do màn quyết định, khớp thời lượng hoạt ảnh rơi hiện có).
   - whirled: khailo.whirl. thundered: khailo.thunder. undone: khailo.undo.
   - levelDone: khailo.leveldone. over: khailo.over. newLevel: không có tiếng riêng (nhạc vẫn chạy).
   - Lệnh bị từ chối (KlReason single, empty, noTool, edge, noUndo): khailo.reject; notPlaying và outOfBounds im lặng.
   - Mỗi id chỉ một lần trong một lô sự kiện.
   - KHAILO_PRELOAD và musicFor(): một bài khai_lo cho cả màn.
2. Cấp tốc (mode "timed"): còn 5 giây cuối thì mỗi giây một tiếng khailo.tick; chỉ khi tab đang hiện và ván đang chạy; không phát lại khi nạp ván dở.
3. Trong KhaiLoScreen: dùng useAudio(); gọi preload một lần; playMusic("khai_lo") khi mount, stopMusic(600) khi rời; ở hàm commit (nơi đang nhận events) phát cue, các cue sau cách nhau khoảng 200 ms để không chồng.
4. audio/cues.ts: thêm KHAILO_CUES (khailo.remove, khailo.big, khailo.fall, khailo.whirl, khailo.thunder, khailo.undo, khailo.reject, khailo.tick, khailo.leveldone, khailo.over) vào CUE_IDS và "khai_lo" vào MUSIC_IDS. audio/sceneMusic.ts: KHAI_LO là SELF.
5. public/audio/manifest.json: nếu chưa có tệp riêng thì trỏ tạm về tệp sẵn có (remove -> sfx/battle/match3, big -> sfx/formation/line, fall -> sfx/battle/swap, whirl -> sfx/formation/fogclear, thunder -> sfx/battle/skill, undo -> sfx/formation/eraser, reject -> sfx/formation/reject, tick -> sfx/formation/tick, leveldone -> sfx/formation/win, over -> sfx/formation/lose; nhạc khai_lo -> music/formation_menu) và ghi chú ở CREDITS.md.
6. Tài liệu: thêm bảng 5.8 Khai Lộ vào 02-architecture-and-assets.md (cue, khi nào, tệp tạm, ưu tiên), sửa bảng Hiện trạng ở README.md.
7. Test tests/game/khai-lo-sounds.test.ts: chơi một ván bằng engine (chọn khối lớn nhất mỗi lượt) tới khi qua màn, gom cue và kiểm mọi id thuộc CUE_IDS, có khailo.remove và khailo.leveldone; khối lớn có rate cao hơn khối nhỏ; lệnh bị từ chối ra khailo.reject; manifest có dòng cho mọi KHAILO_CUES. Sửa tests/game/scene-audio.test.ts cho KHAI_LO.
8. Chạy pnpm check và pnpm e2e.
```

- **Xong khi:** chơi Khai Lộ cả Thường lẫn Cấp tốc nghe đủ tiếng xóa, rơi, công cụ, qua màn, hết ván; tắt tiếng thì im.

### D5. Tầm Tướng Ký (`ttk.*`)

- **Shan tạo tệp:** B8 dòng `ttk.*`, B9 dòng `tam_tuong_ky`.
- **Prompt code:**

```
Nối âm thanh cho Tầm Tướng Ký chế độ Thường và Hạng (src/app/game/tam-tuong-ky/TamTuongKyScreen.tsx, client.ts; luật FROZEN ở docs/02-game-modes/tam-tuong-ky/design-freeze.md, giao diện docs/05-ui-ux/screens/tam-tuong-ky.md). Luật chạy ở server (src/server/tamTuongKy.ts): KHÔNG đổi server, chỉ phát tiếng khi màn đã nhận phản hồi.

1. src/app/game/tam-tuong-ky/sounds.ts, hàm thuần:
   - cueForCombine(result): kết quả ghép do server trả. kind "miss" hoặc status "noRecipe" -> ttk.miss; kind "new" (khám phá nguyên liệu mới) -> ttk.new; kind "hero" (ra tướng) -> ttk.hero; status "invalid" -> ttk.reject; đã khám phá trước đó (không mới) -> ttk.known. Có points > 0 ở chế độ Hạng thì thêm ui.reward sau tiếng chính.
   - Đặt nguyên liệu vào ô Đài Hợp Nguyên: ttk.slot; gỡ hoặc đổi chỗ: ttk.unslot.
   - Dùng gợi ý: ttk.hint. Mở thẻ thông tin ở Vạn Vật Lục hay Tướng Lục: không tiếng (tránh ồn).
   - musicFor(): một bài tam_tuong_ky.
2. Trong màn: tiếng ttk.slot/unslot phát ngay khi người chơi thao tác (thao tác cục bộ). Tiếng kết quả phát khi promise trả về và chỉ khi component còn mount; lỗi mạng thì ttk.reject. Không phát gì khi tải lại view từ server lúc vào màn.
3. Nếu màn có hoạt ảnh lóe sáng khi khám phá (setFlash) thì tiếng ttk.new/ttk.hero phát cùng lúc với lóe sáng, không trước.
4. cues.ts: TTK_CUES (ttk.slot, ttk.unslot, ttk.miss, ttk.known, ttk.new, ttk.hero, ttk.reject, ttk.hint), MUSIC_IDS thêm tam_tuong_ky; sceneMusic.ts: TAM_TUONG_KY là SELF (hoặc trả thẳng tam_tuong_ky nếu một bài cho cả màn là đủ, khi đó không cần SELF).
5. Manifest tạm khi chưa có tệp: slot -> sfx/formation/place, unslot -> sfx/battle/swap, miss -> sfx/formation/reject, known -> sfx/formation/match, new -> sfx/formation/fusion, hero -> sfx/formation/win, reject -> sfx/battle/invalid, hint -> sfx/formation/fogclear; nhạc -> music/dialogue.
6. Tài liệu: bảng 5.9 trong 02-architecture-and-assets.md, Hiện trạng ở README.md; nếu docs/05-ui-ux/screens/tam-tuong-ky.md có mục âm thanh thì link sang bảng 5.9.
7. Test tests/game/tam-tuong-ky-sounds.test.ts cho từng loại kết quả (miss, noRecipe, new, hero, invalid, đã biết), có điểm thì thêm ui.reward; manifest có dòng cho mọi TTK_CUES. Chạy pnpm check và pnpm e2e (có test e2e Tầm Tướng Ký).
```

- **Xong khi:** ghép trượt, ghép ra nguyên liệu mới, ra tướng mỗi loại một tiếng khác nhau; không có tiếng khi vừa vào màn.

### D6. Viễn Chinh, màn sa bàn (`expedition.*`)

- **Shan tạo tệp:** B8 dòng `expedition.*`, B9 dòng `expedition`.
- **Prompt code:**

```
Nối âm thanh màn sa bàn Viễn Chinh (src/app/game/expedition/ExpeditionScreen.tsx; GDD docs/02-game-modes/expedition/01-vien-chinh-gdd.md, Cửa Biển 03-cua-bien-thiet-ke.md). Mọi luật ở server (/api/expedition); trận đánh mở từ sa bàn đi qua DemoGame và đã có tiếng, không đụng.

1. src/app/game/expedition/sounds.ts, hàm thuần cueForResult(result: ApiResult, before, after):
   - kind "moved": expedition.move; nếu sau nước đi có điểm đổi chủ (so before/after) thì thêm expedition.capture.
   - kind "blocked": expedition.blocked (reason "tide" ở Cửa Biển dùng expedition.tide nếu có tệp, không thì blocked).
   - kind "battle": expedition.battle phát ngay trước khi chuyển sang trận (chờ khoảng 600 ms để tiếng kịp vang rồi mới chuyển, hoặc phát song song nếu chuyển cảnh đã có độ trễ).
   - Kết thúc chiến dịch thắng/thua (khi view báo run xong): expedition.win / expedition.lose.
   - Lỗi server (ERROR_TEXT): ui.error.
   - Chọn đạo quân, chọn ô: ui.click (nếu D8 chưa làm thì tạm im lặng).
2. Nhạc expedition cho phân cảnh EXPEDITION; khi rời sang trận thì DemoGame tự đổi nhạc, khi quay về sa bàn thì nhạc expedition chạy lại. Kiểm kỹ không chồng hai bài.
3. cues.ts: EXPEDITION_CUES (expedition.move, expedition.capture, expedition.blocked, expedition.tide, expedition.battle, expedition.win, expedition.lose), MUSIC_IDS thêm expedition; sceneMusic.ts: EXPEDITION -> { music: "expedition" }.
4. Manifest tạm: move -> sfx/formation/place, capture -> sfx/formation/line, blocked và tide -> sfx/formation/reject, battle -> sfx/formation/flame3, win -> sfx/battle/win, lose -> sfx/battle/lose; nhạc -> music/battle_normal hạ âm lượng 0,35 (hoặc music/atlas).
5. Tài liệu bảng 5.10, Hiện trạng ở README. Test tests/game/expedition-sounds.test.ts cho từng kind và kết thúc; sửa scene-audio test. pnpm check, pnpm e2e.
```

- **Xong khi:** đi quân, bị chặn, vào trận, chiếm điểm có tiếng; vào trận rồi quay lại sa bàn nhạc đổi đúng.

### D7. Nhật Lệnh và điểm danh

- **Shan tạo tệp:** B6 dòng `daily.complete`, `daily.checkin`, `ui.reward`; B9 dòng `daily`.
- **Prompt code:**

```
Nối âm thanh màn Nhật Lệnh (src/app/game/daily/DailyScreen.tsx) và bảng điểm danh (src/app/game/quests/CheckInPanel.tsx, dùng ở Nhật Lệnh).

1. Nhạc daily cho phân cảnh DAILY trong audio/sceneMusic.ts; sửa tests/game/scene-audio.test.ts (đang ghi DAILY im lặng). Trận Nhật Lệnh vẫn dùng nhạc trận của DemoGame.
2. Cue: daily.checkin khi điểm danh thành công (sau phản hồi server); ui.reward khi nhận thưởng nhiệm vụ ngày; ui.error khi server từ chối. daily.complete đã nối trong DemoGame, chỉ cần tệp.
3. cues.ts thêm daily.checkin; MUSIC_IDS thêm daily. Manifest tạm: checkin -> sfx/formation/rank, ui.reward -> sfx/formation/match, daily.complete -> sfx/formation/win; nhạc daily -> music/formation_menu.
4. Tài liệu: thêm dòng vào bảng 5.5 và Hiện trạng ở README. Test hàm thuần (nếu có) và scene-audio. pnpm check, pnpm e2e (có test điểm danh ở Nhật Lệnh).
```

### D8. Tiếng giao diện chung (`ui.*`)

- **Shan tạo tệp:** B6 dòng `ui.click`, `ui.back`, `ui.open`, `ui.close`, `ui.error`, `ui.reward`, `ui.levelup`.
- **Prompt code:**

```
Nối tiếng giao diện chung theo bảng 5.1 của 02-architecture-and-assets.md.

1. Component nút dùng chung (src/components/ui: Button, ChoiceChip và các tab): thêm prop sound?: "click" | "back" | false, mặc định "click"; nút có variant quay lại/đóng dùng "back". Phát qua useAudio() ở onPointerDown hoặc onClick (chọn một, không cả hai), không phát khi disabled.
2. Tắt tiếng mặc định (sound={false}) cho mọi nút đã có tiếng riêng: ô bàn cờ trận đánh, Trận Đồ, Sử Lộ, Do Thám, Khai Lộ, Tầm Tướng Ký, sa bàn Viễn Chinh. Rà bằng grep các màn đã gọi useAudio.
3. Hộp thoại dùng chung: ui.open khi mở, ui.close khi đóng.
4. ui.reward ở mọi chỗ nhận thưởng (Ban Thưởng, nhiệm vụ, cửa hàng mua thành công); ui.levelup khi lên cấp tài khoản hoặc tướng; ui.error khi API trả lỗi ở các form (đăng nhập, mua hàng).
5. Không phát tiếng ở trang ngoài /game (AudioProvider chỉ bọc /game, useAudio ngoài đó đã im).
6. cues.ts thêm ui.open, ui.close, ui.levelup. Manifest tạm: click -> sfx/battle/swap (âm lượng 0,5), back -> sfx/battle/invalid (0,5), open và close -> sfx/formation/fogclear (0,4), error -> sfx/formation/reject, reward -> sfx/formation/rank, levelup -> sfx/formation/fusion.
7. Test: render Button với AudioProvider giả, kiểm phát đúng cue, disabled thì không phát, sound={false} thì không phát. pnpm check, pnpm e2e.
```

- **Xong khi:** bấm nút menu có tiếng gỗ nhẹ; trong bàn cờ không có tiếng bấm chồng lên tiếng chơi.

### D9. Cue trận còn thiếu: chí mạng, đổi lượt, đồng hồ

- **Shan tạo tệp:** B4 dòng `battle.damage`/`battle.crit` (phần chí mạng), B6 dòng `battle.turn`, `battle.timer`.
- **Prompt code:**

```
Thêm ba cue trận đánh còn thiếu vào src/app/game/battle/sounds.ts và DemoGame.tsx (bảng 5.3 của 02-architecture-and-assets.md).

1. battle.crit: kiểm BattleEvent "damage" trong src/core có thông tin chí mạng chưa. Nếu có thì damage chí mạng phát battle.crit thay battle.damage. Nếu chưa có: KHÔNG tự thêm vào core; dừng phần này và báo lại để Shan quyết (thêm cờ crit vào sự kiện là đổi contract core).
2. battle.turn: khi sự kiện turnStart đổi phe (side khác lượt trước), một tiếng mõ; không phát ở lượt đầu trận và không phát khi đang tua lại/nạp trận.
3. battle.timer: đồng hồ lượt (turn.deadline) còn 5 giây thì mỗi giây một tiếng, chỉ ở lượt của người chơi, dừng ngay khi người chơi đi.
4. cues.ts thêm battle.crit, battle.turn, battle.timer vào BATTLE_CUES. Manifest tạm: crit -> sfx/battle/damage (rate cao hơn), turn -> sfx/formation/tick, timer -> sfx/formation/tick.
5. Test trong tests/game/battle-sounds.test.ts cho từng cue. pnpm check, pnpm e2e.
```

### D10. Cue ngoài trận còn thiếu

- **Shan tạo tệp:** B6 dòng `atlas.unlock`, `tower.*`, `destiny.*`, `arena.ghost`; B9 dòng `prep`; nhạc kết cục theo cấp nếu muốn (mỗi cấp một bản theo prompt `ending`, đổi tâm trạng).
- **Prompt code:**

```
Nối các cue ngoài trận còn thiếu theo bảng 5.4 và 5.5 của 02-architecture-and-assets.md.

1. music prep: màn chuẩn bị trận trong DemoGame (trước khi started) phát prep thay vì im; vào trận thì đổi nhạc trận như hiện tại.
2. atlas.unlock: khi bản đồ Bình Loạn mở khu vực mới (src/app/game/campaign/WorldMap.tsx), chỉ lần đầu thấy, không phát lại khi tải trang.
3. ending_<cấp>: CampaignEnding.tsx chọn nhạc theo cấp độ lịch sử của kết cục; thiếu tệp cấp nào thì dùng ending.
4. tower.floor (lên tầng mới) và tower.firstclear (thưởng lần đầu) ở Tháp Thí Luyện (src/app/game/trial); destiny.choose (chọn thẻ/đội) và destiny.fail (thua tầng) ở Tháp Thiên Mệnh (src/app/game/destiny); arena.ghost khi ghép được đối thủ bóng ma ở Đấu trường (src/app/game/arena).
5. Thêm id vào cues.ts và MUSIC_IDS; manifest tạm trỏ về tệp sẵn có, ghi CREDITS.md; cập nhật bảng 5.4, 5.5 (bỏ dòng "Chưa nối"). Hàm thuần + test cho phần chọn nhạc kết cục và điều kiện phát. pnpm check, pnpm e2e.
```

### D11. Chuẩn hóa và QA toàn bộ (AUD-07)

```
Rà toàn bộ public/audio theo mục 3 và 6 của 02-architecture-and-assets.md: đo LUFS từng tệp (nhạc khoảng -18, hiệu ứng đỉnh -1 dBTP và ngang nhau trong cùng bộ), kích thước (hiệu ứng < 60 KB, nhạc < 1,5 MB), đủ cặp .ogg/.m4a, CREDITS.md ghi đủ nguồn. Viết script scripts/audit-audio.py in bảng lệch chuẩn và sửa bằng ffmpeg. Thêm test kích thước tệp nếu chưa có. Lập danh sách kiểm tay (iOS Safari, Android Chrome, desktop; tab ẩn; tắt tiếng; lặp nhạc không hở; hai cue sát nhau không méo) vào README.md mục Hiện trạng, đánh dấu từng dòng sau khi Shan kiểm. Cuối cùng chuyển AUD-07 sang DONE và xóa các dòng "Tệp tạm" đã thay.
```
