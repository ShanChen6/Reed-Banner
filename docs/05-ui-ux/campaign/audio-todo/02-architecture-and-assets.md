# Âm thanh: kiến trúc, quy ước tệp và bảng cue theo chế độ

> Cập nhật: 19/11/2026
> Trạng thái: **DRAFT** — engine (AUD-02), nối Trận Đồ và nối trận đánh (AUD-03) và nhạc theo phân cảnh (AUD-04) đã có code (02/11/2026), chưa có tệp âm thanh. Backlog và điều kiện bắt đầu ở [README](README.md). Prompt giao việc và prompt tạo âm thanh ở [04-prompts-trien-khai-theo-che-do.md](04-prompts-trien-khai-theo-che-do.md).

Phạm vi: **toàn bộ chế độ chơi** (Trận Đồ, Chiến dịch và trận đánh, Tháp Thí Luyện, Tháp Vận Mệnh, Sinh tồn, Thử thách hằng ngày, Đấu trường bóng ma, Quần Hùng online sau này). Âm thanh chỉ là lớp cảm giác: không chế độ nào được cần nghe mới hiểu luật hay cốt truyện.

## 1. Nguyên tắc

1. **Chỉ phát sau thao tác người dùng** (trình duyệt chặn autoplay): lần chạm đầu tiên mở `AudioContext`; trước đó mọi lệnh phát bị bỏ qua, không báo lỗi.
2. **Tắt tiếng và âm lượng lưu ở máy** (`localStorage`, bọc `try/catch`), có nút ở thanh trên và trong trang cài đặt. Mặc định bật, nhạc nền nhỏ hơn hiệu ứng.
3. **Bốn bus**: `music`, `ambience`, `sfx`, `voice`; mỗi bus một thanh âm lượng. Khi `voice` phát thì `music` và `ambience` hạ 6–9 dB (ducking), trả lại sau 400 ms.
4. **Tôn trọng người dùng**: tab ẩn thì tạm dừng nhạc; `prefers-reduced-motion` không liên quan âm thanh nhưng chế độ "Giảm hiệu ứng" của game cũng giảm các cue lặp dày (tiếng nổ liên tiếp).
5. **Không đưa khóa API TTS hay tạo âm thanh vào client**; giọng đọc và nhạc là tệp tĩnh đã duyệt và nằm trong repo hoặc CDN.
6. **Âm thanh không đổi luật hay kết quả**: engine thuần (`src/core/*`) không biết âm thanh; lớp UI nghe **sự kiện** (`PuzzleEvent`, `BattleEvent`) rồi phát cue.

## 2. Kiến trúc

```
src/app/game/audio/
  engine.ts       AudioEngine: AudioContext, bus, giải mã và cache buffer, ducking, giới hạn đồng thời
  manifest.ts     đọc public/audio/manifest.json, ánh xạ cueId -> tệp, âm lượng gốc, nhóm, độ trễ cho phép
  settings.ts     âm lượng và tắt tiếng, lưu localStorage
  AudioProvider.tsx  React context: unlock sau cử chỉ đầu, useAudio(), usePlayCue()
  cues.ts         kiểu CueId theo chế độ (chuỗi hằng, kiểm tra khớp manifest bằng test)
```

- **Giải pháp phát**: Web Audio API (độ trễ thấp cho hiệu ứng, lặp nhạc không hở bằng `AudioBufferSourceNode.loop` với điểm lặp); không thêm thư viện ngoài (xem AUD-01 trong [README](README.md)).
- **API gọi từ UI**: `playCue(id, { volume?, rate?, pan? })`, `playMusic(sceneId, { fadeMs })`, `stopMusic(fadeMs)`, `setLayer(sceneId, layer, 0..1)` (lớp căng thẳng của nhạc), `playVoice(id)` (sau này).
- **Giới hạn**: tối đa 8 cue đồng thời; cùng `cueId` cách nhau ít nhất 40 ms; cue ưu tiên thấp bị bỏ trước. Biến thiên tự nhiên: mỗi lần phát cùng cue dùng `rate` ngẫu nhiên ±3% và chọn một trong 2–3 biến thể (`click_a/b/c`) để không lặp máy móc.
- **Nạp lười**: bộ `ui` và bộ của scene hiện tại tải khi vào scene (nhạc nền tải khi rảnh, cue chính tải trước); không tải âm thanh scene khác. Mỗi tệp hiệu ứng nhỏ hơn 60 KB, mỗi bản nhạc nhỏ hơn 1,5 MB.
- **Gắn vào code**: Trận Đồ nghe `events` của `transition()` (đã có `placed`, `covered`, `erased`, `lineCleared`, `discarded`, `heat`, `spawned`, `won`, `lost` theo `PuzzleEvent`; lệnh bị từ chối trả `reason` thuộc `RejectReason`); trận đánh nghe `BattleEvent` qua đạo diễn trận (xem [kế hoạch đồ họa](../../../06-art/ke-hoach-do-hoa.md)) để âm thanh khớp hoạt ảnh.

## 3. Quy ước tệp

```
public/audio/
  manifest.json
  ui/<cue>.ogg|.m4a
  sfx/<che-do>/<cue>[_a|_b|_c].ogg|.m4a
  music/<scene>.ogg|.m4a            (và <scene>_layer2.ogg cho lớp căng thẳng)
  amb/<scene>.ogg|.m4a
  voice/<nhan-vat>/<cau>.ogg|.m4a   (sau này, xem AUD-05)
```

- Hai định dạng: **Ogg/Opus** cho trình duyệt hỗ trợ và **M4A/AAC** cho Safari; engine chọn theo `canPlayType`.
- Mono cho hiệu ứng, stereo cho nhạc và ambience; 44,1 kHz; hiệu ứng 96 kbps, nhạc 128 kbps.
- Chuẩn hóa: nhạc nền khoảng −18 LUFS, hiệu ứng đỉnh −1 dBTP và ngang độ lớn nhau trong cùng bộ, giọng đọc khoảng −16 LUFS.
- Tên cue: `chedo.hanhdong` không dấu (ví dụ `formation.place`, `battle.match3`). Thêm cue = thêm tệp + dòng manifest + hằng trong `cues.ts` (test kiểm đủ tệp, như test kho bản đồ).
- Giấy phép: mỗi tệp ghi nguồn và giấy phép trong `public/audio/CREDITS.md`; chỉ dùng âm thanh tự tạo, mua có thương mại hoặc công cụ có giấy phép thương mại rõ ràng; không bắt chước một bản nhạc cụ thể.

## 4. Phong cách

Việt cổ thế kỷ X, ấm và trầm: **sáo trúc, đàn bầu, đàn tranh, trống đồng, chiêng, mõ, trống cơm**, kết hợp tiếng gỗ, tre và kim loại mộc của sa bàn; tránh điện tử và nhạc phim Trung Hoa/Nhật chung chung. Hiệu ứng ngắn, khô, có "vật chất" (gỗ, sơn mài, đồng), không chói. Nhạc nền không lời, vòng lặp 60–120 giây.

## 5. Bảng cue theo chế độ

Độ dài là mục tiêu. Cột "Ưu tiên": **P1** làm trước (cần để chơi thấy cảm giác), P2 sau.

### 5.1 Chung (UI)

| Cue | Khi nào | Mô tả | Dài | Ưu tiên |
|---|---|---|---|---|
| `ui.click` | Bấm nút, tab, thẻ | Gõ gỗ nhẹ | 0,1 s | P1 |
| `ui.back` | Quay lại, đóng | Gõ gỗ trầm hơn | 0,12 s | P1 |
| `ui.open` / `ui.close` | Mở/đóng hộp thoại | Cuộn giấy dó, vút nhẹ | 0,3 s | P2 |
| `ui.error` | Thao tác không hợp lệ | Gõ đục ngắn | 0,2 s | P1 |
| `ui.reward` | Nhận thưởng vàng | Tiếng đồng xu đồng rơi, chuông nhỏ | 0,9 s | P1 |
| `ui.levelup` | Lên cấp: tướng lên cấp sau trận (trễ 0,9 s sau tiếng thắng), dùng đủ sách kinh nghiệm để lên cấp kế (nối 24/11/2026) | Chiêng ngân + sáo lên | 1,5 s | P2 |

### 5.2 Trận Đồ (`formation.*`)

| Cue | Sự kiện nguồn | Mô tả | Dài | Ưu tiên |
|---|---|---|---|---|
| `formation.place` | `placed` (quân thường) | Thẻ gỗ sơn mài đặt xuống bàn gỗ, 3 biến thể | 0,25 s | P1 |
| `formation.match` | Đặt khớp có "điểm cộng" (cùng cả nghề và hệ) | Ngân nhẹ kim loại, ấm | 0,5 s | P2 |
| `formation.reject` | Lệnh bị từ chối (`notAdjacent`, `mismatch`, `blocked`, `occupied`) | Gõ đục + thẻ trượt về | 0,25 s | P1 |
| `formation.fogclear` | `covered` (ô được khai thông, ô che mờ đi 0,45 s) | Gió nhẹ tan sương | 0,6 s | P1 |
| `formation.line` | `lineCleared` | Quét sáng vàng: chuông đồng + tiếng vút theo hướng hàng/cột; cao dần khi nhiều đường cùng lúc | 1,0 s | P1 |
| `formation.wild` | Đặt Quân Lệnh | Đồng xu vàng xoay rồi cắm xuống | 0,5 s | P2 |
| `formation.eraser` | `erased` (Thu Hồi) | Tiếng quét vải, hạt bụi vàng | 0,5 s | P2 |
| `formation.fusion` | Đặt nhân vật dung hợp | Hợp âm sáo + trống đồng nhẹ | 1,0 s | P2 |
| `formation.discard` | `discarded` (Bỏ Lệnh) | Giấy lệnh bị vò | 0,3 s | P1 |
| `formation.flame1/2/3` | `heat` 1, 2, 3 | Lửa bùng lên, mỗi bậc to hơn, bậc 3 có tiếng cảnh báo trầm | 0,6–1,0 s | P1 |
| `formation.flamedown` | Hạ lửa khi đặt thành công | Hơi lửa lụi | 0,4 s | P2 |
| `formation.win` | `won` | Bản đồ lộ ra: trống đồng + sáo mở rộng, ngân dài | 4 s | P1 |
| `formation.lose` | `lost` | Lửa tắt, trống trầm, sáo rơi xuống | 2,5 s | P1 |
| `formation.rank` | Nhận thưởng xếp hạng cuối kỳ (đã nối) | Chiêng điểm theo hạng (top 1 dài hơn) | 1,5 s | P2 |
| `formation.tick` | 5 giây cuối của một kỳ (đã nối; chỉ phát khi đang ở màn chọn bậc) | Mõ điểm từng giây | 0,3 s | P2 |

Nhạc Trận Đồ: `music/formation_menu` (màn chế độ: sáo + đàn tranh nhẹ, 90 s), `music/formation_play` (đang chơi: bàn gỗ yên tĩnh, đàn tranh ít nốt, 110 s) và **lớp căng thẳng** `formation_play_layer2` (trống nhẹ và đàn bầu) tăng dần theo `discardHeat` (0 → 0, 1 → 0,33, 2 → 0,66, 3 → 1); `music/formation_result_win` và `_lose` ngắn. Ambience: gió nhẹ + tre, rất nhỏ.

### 5.3 Trận đánh (chung cho Chiến dịch, Thường, Tháp, Sinh tồn, Thử thách, Đấu trường)

| Cue | Sự kiện nguồn | Mô tả | Dài | Ưu tiên |
|---|---|---|---|---|
| `battle.swap` | Đổi hai ô | Gõ gỗ nhẹ | 0,12 s | P1 |
| `battle.match3` / `match4` / `match5` | Nối 3/4/5 ô | Tiếng gỗ vang tăng nốt theo số ô | 0,3–0,5 s | P1 |
| `battle.combo1..4` | Chuỗi tầng | Cao dần theo tầng, thêm chiêng ở tầng 4+ | 0,5 s | P1 |
| `battle.invalid` | Đổi không tạo được hàng | Gõ đục + trượt về | 0,2 s | P1 |
| `battle.hit.<nghe>` | Đòn đánh thường | Theo nghề: kiếm (tướng sĩ), giáo/khiên (binh lính), pháp lực (pháp sư), thuốc (y sĩ), quạt/sách (mưu sĩ), kỳ (quân sư), tên (xạ thủ), dao (sát thủ) | 0,3–0,5 s | P1 |
| `battle.skill.<he>` | Kỹ năng theo hệ | Kim: va kim loại; Mộc: gỗ nứt, lá; Thủy: sóng; Hỏa: lửa; Thổ: đất rung; Lôi: sét; Phong: gió rít | 0,6–1,0 s | P1 |
| `battle.ultimate` | Tuyệt chiêu ô 5 | Trống đồng + vút nghịch rồi nổ | 1,5 s | P2 |
| `battle.damage` / `crit` | Nhận sát thương; `crit` cho đòn khắc hệ (game không có chí mạng) | Va nặng; đòn khắc hệ thêm chiêng gắt | 0,3 s | P1 |
| `battle.heal` / `shield` / `buff` / `debuff` | Hồi, khiên, tăng, giảm | Chuông nhỏ, kim loại ngân, nốt lên, nốt xuống | 0,4–0,6 s | P2 |
| `battle.burn` / `freeze` / `poison` | Trạng thái | Lách tách, đóng băng, sủi | 0,5 s | P2 |
| `battle.ko` | Một nhân vật gục | Thịch nặng + tiếng thở ra | 0,8 s | P1 |
| `battle.turn` | Đổi phe (thêm lượt cùng phe thì không) | Mõ một tiếng | 0,2 s | P2 |
| `battle.timer` | Lượt người chơi còn 5 giây: mỗi giây một tiếng, hai giây cuối cao hơn | Mõ nhịp nhanh | 0,25 s | P2 |
| `battle.win` / `lose` | Kết thúc trận | Khải hoàn bằng trống đồng + sáo; thua: trống trầm + đàn bầu | 3–4 s | P1 |

Đã nối (02/11/2026): tiếng ghép ô theo từng khung hoạt ảnh (`Frame.sound`), cue theo sự kiện ở hai thời điểm `start`/`end` của đạo diễn trận, nhạc `battle_normal`/`battle_boss` (chiến dịch có pha trùm)/`survival` khi đang trong trận. Nối thêm 21/11/2026: `battle.crit` (đòn kiếm hoặc kỹ năng của người đang hành động đánh vào hệ mình khắc, thay tiếng `battle.damage`), `battle.turn` (sự kiện `turnStart` đổi phe, sau tiếng gục), `battle.timer` (`timerCue` trong `battle/sounds.ts`, gọi từ `DemoGame`).

Nhạc: `music/battle_normal`, `music/battle_boss` (căng hơn, trống chiến), `music/battle_tower` (u tối, vang), `music/survival` (nhịp tăng theo đợt). Ambience theo địa hình nhiệm vụ.

### 5.4 Chiến dịch (ngoài trận)

| Cue/nhạc | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| `music/atlas` + `amb/atlas` | Bản đồ toàn cảnh | Sáo và đàn tranh chậm, gió, chim xa | P1 |
| `atlas.select` | Chọn điểm trên bản đồ | Gõ đồng | P1 |
| `atlas.unlock` | Mở khu vực mới | Cuộn giấy, chiêng nhỏ | P2 |
| `music/dialogue` | Thoại chữ | Đàn bầu đơn, rất nhẹ, không át chữ | P1 |
| `dialogue.next` | Câu thoại kế | Lật thẻ tre | P2 |
| `music/prep` | Chuẩn bị trận | Trống đều chậm | P2 |
| `music/ending_*` | Kết cục (theo cấp độ lịch sử) | Sáo + đàn, mỗi kết cục một hướng | P2 |
| Giọng đọc | Sau này, xem AUD-05/06 | Thoại nhân vật theo hồ sơ giọng | P3 |

Đã nối (02/11/2026): `music/atlas` + `amb/atlas` khi ở màn Bình Loạn; `music/dialogue` khi mở bộ phát thoại (trả nhạc bản đồ khi đóng); `music/ending` ở màn kết cục; cue `atlas.select` khi chọn điểm trên bản đồ, `dialogue.next` khi sang câu thoại kế. Nối thêm 23/11/2026: `music/prep` ở màn chuẩn bị trận (`DemoGame` trước khi vào trận, mọi chế độ dùng `DemoGame`). Nối thêm 23/11/2026: `atlas.unlock` khi số nhiệm vụ mở trên bản đồ tăng so với lần xem trước (nhớ trong `localStorage`, lần đầu chỉ ghi nhớ, không phát). Chưa nối: `music/ending_*` theo cấp độ lịch sử.

### 5.5 Tháp, Sinh tồn, Thử thách, Đấu trường, Quần Hùng

| Chế độ | Nhạc | Cue riêng | Ưu tiên |
|---|---|---|---|
| Tháp Thí Luyện | `music/tower_trial` (nhạc màn Tháp; trận đánh trong Tháp hiện dùng `battle_normal`) | `tower.floor` (lên tầng), `tower.firstclear` (thưởng đá lần đầu) | P2 |
| Tháp Vận Mệnh | `music/tower_destiny` | `destiny.choose` (chọn thẻ/roster), `destiny.fail` | P2 |
| Sinh tồn | `music/survival` + lớp tăng theo đợt | `survival.wave` (đợt mới), `survival.warn` (báo trước đợt kế) | P2 |
| Thử thách hằng ngày | `music/daily` ở màn Nhật Lệnh (23/11/2026); trong trận dùng nhạc trận | `daily.complete`, `daily.checkin` (điểm danh thành công, nối 23/11/2026) | P2 |
| Đấu trường bóng ma | `music/arena` | `arena.rank`, `arena.ghost` (đổi đối thủ, hiện các đội bóng ma; nối 23/11/2026) | P2 |
| Quần Hùng online (sau này) | `music/pvp` | `pvp.found`, `pvp.turn`, `pvp.win`, `pvp.lose` | P3 |

### 5.6 Sử Lộ (`sulo.*`, đã nối 19/11/2026)

`su-lo/sounds.ts` ánh xạ nước đi và sự kiện `SlEvent` sang cue; trận trùm match-3 dùng tiếng ghép ô của trận đánh (`frameCue`) theo từng khung hoạt ảnh. Mọi cue và hai bản nhạc đã có tệp riêng ở `public/audio/sfx/su-lo/` và `music/` (19–20/11/2026, cắt từ đoạn Gemini tạo; vị trí cắt ghi ở `public/audio/CREDITS.md`).

| Cue | Khi nào | Tệp | Ưu tiên |
|---|---|---|---|
| `sulo.roll` | Đổ xúc xắc | `su-lo/roll` | P1 |
| `sulo.move` | Đi quân tới ô | `su-lo/move` | P1 |
| `sulo.nomove` | Đổ ra số không đi được | `su-lo/nomove` | P2 |
| `sulo.correct` / `sulo.wrong` | Trả lời đúng / sai | `su-lo/correct`, `su-lo/wrong` | P1 |
| `sulo.disarm` / `sulo.trap` | Gỡ bẫy / sập bẫy | `su-lo/disarm`, `su-lo/trap` | P1 |
| `sulo.luck` | Ô may mắn | `su-lo/luck` | P2 |
| `sulo.gate` | Mở cửa ải | `su-lo/gate` | P2 |
| `sulo.stele` | Đọc bia đá | `su-lo/stele` | P2 |
| `sulo.aid` | Dùng trợ giúp | `su-lo/aid` | P2 |
| `sulo.boss` | Vào trận trùm trấn cổng | `su-lo/boss` | P1 |
| `sulo.counsel` | Quân sư hiến kế giữa trận | `su-lo/counsel` | P2 |
| `sulo.bosswon` / `sulo.bosslost` | Hạ trùm / thua hoặc rút | `su-lo/bosswon`, `su-lo/bosslost` | P1 |
| `sulo.won` | Thoát mê cung | `su-lo/won` | P1 |

Nhạc: `sulo_maze` (mê cung và màn chuẩn bị) và `sulo_boss` (trong trận trùm, kể cả lúc trả lời câu Quân sư), tệp riêng `music/sulo_maze`, `music/sulo_boss`. Phân cảnh `SU_LO` là `SELF` trong `sceneMusic.ts`.

### 5.7 Do Thám (`dotham.*`, đã nối 19/11/2026)

Engine Do Thám không phát sự kiện nên `do-tham/sounds.ts` so trạng thái trước và sau nước đi để chọn cue. Đạo cụ nguyên tố dùng luôn tiếng kỹ năng theo hệ của trận đánh (`battle.skill.<hệ>`). Mọi cue đã có tệp riêng trong `sfx/do-tham/` (20/11/2026).

| Cue | Khi nào | Tệp | Ưu tiên |
|---|---|---|---|
| `dotham.open` | Mở một vài ô (dưới 4 ô) | Đã có tệp riêng `do-tham/open` | P1 |
| `dotham.cascade` | Mở lan từ 4 ô trở lên (gặp ô số 0) | Đã có tệp riêng `do-tham/cascade` | P1 |
| `dotham.flag` | Cắm cờ lau; gỡ cờ cùng tiếng, trầm hơn | Đã có tệp riêng `do-tham/flag` | P1 |
| `dotham.shield` | Khiên đất đỡ một lần sa bẫy | Đã có tệp riêng `do-tham/shield` | P2 |
| `dotham.reject` | Lệnh bị từ chối (mở nhanh sai số cờ, đạo cụ chưa dùng được...) | Đã có tệp riêng `do-tham/reject` | P1 |
| `dotham.trap` | Sập bẫy; tiếng thua vào sau 0,9 giây (`LOSE_AFTER_TRAP_MS`) | Đã có tệp riêng `do-tham/trap` | P1 |
| `dotham.win` / `dotham.lose` | Thắng / thua ván | Đã có tệp riêng `do-tham/win` / `do-tham/lose` | P1 |

Nhạc: `dotham` (một bài cho cả màn, tệp riêng `music/dotham`). Phân cảnh `DO_THAM` là `SELF` trong `sceneMusic.ts`.

### 5.8 Khai Lộ (`khailo.*`, nối 24/11/2026)

`khai-lo/sounds.ts` (`cuesForEvents`) chọn cue từ sự kiện engine; `KhaiLoScreen` phát ở `commit`. Bàn là `role="grid"` nên không có tiếng bấm chung.

| Cue | Khi nào | Tệp | Ưu tiên |
|---|---|---|---|
| `khailo.remove` | Xóa khối hoặc đạo cụ phá dưới 8 quân; tốc độ phát tăng theo số quân (2 quân = 1, +0,02 mỗi quân, trần 1,25) | Tệp riêng `khailo/remove` (3 biến thể) | P1 |
| `khailo.big` | Xóa khối hoặc đạo cụ phá từ 8 quân (`BIG_GROUP`), thay cho `khailo.remove` | Tệp riêng `khailo/big` (2 biến thể) | P1 |
| `khailo.fall` | Quân rơi, cột dồn sau mỗi lần xóa; trễ 150 ms (`FALL_DELAY_MS`, giữa hoạt ảnh rơi 0,24 s) | Tệp riêng `khailo/fall` (3 biến thể, 24/11/2026) | P1 |
| `khailo.reject` | Lệnh bị từ chối (khối 1 quân, ô trống, hết đạo cụ...); `notPlaying`, `outOfBounds` im | Tệp riêng `khailo/reject` (24/11/2026) | P1 |
| `khailo.charged` | Thanh nạp đầy, +1 đạo cụ (`toolCharged`); trễ 300 ms sau tiếng xóa | Tệp riêng `khailo/charged` (24/11/2026) | P2 |
| `khailo.heart` | Tim đổi khi hết màn Thường: được cộng (dọn sạch) phát như gốc, bị trừ phát chậm 0,85 cho trầm | Tệp riêng `khailo/heart` (24/11/2026) | P2 |

| `khailo.clear` | Hết màn mà dọn sạch bàn (Thường `levelDone`, Cấp tốc `levelPassed`) | Tệp riêng `khailo/clear` (1 biến thể, 24/11/2026) | P1 |
| `khailo.leveldone` | Hết màn còn sót quân | Tệp riêng `khailo/leveldone` (24/11/2026) | P1 |
| `khailo.over` | Hết ván (thiếu tim, hết giờ, đầu hàng); không kèm tiếng hết màn hay tim | Tệp riêng `khailo/over` (24/11/2026) | P1 |
| `khailo.tick` | Cấp tốc: mỗi giây một tiếng trong 5 giây cuối (`tickDue`), chỉ khi đồng hồ đang chạy | Tệp riêng `khailo/tick` (24/11/2026) | P2 |

`khailo.heart` vào sau tiếng hết màn 1,2 s (`HEART_DELAY_MS`). Nhạc (25/11/2026): `khai_lo` cho Thường, `khai_lo_timed` cho Cấp tốc, đổi theo chế độ đang chọn; phân cảnh `KHAI_LO` là `SELF`. Chưa có: `khailo.whirl`, `thunder`, `undo`.

### 5.9 Tam Quân Kỳ (`tqk.*`, nối 25/11/2026)

Sa bàn là `role="application"` nên không có tiếng bấm chung.

| Cue | Khi nào | Tệp | Ưu tiên |
|---|---|---|---|
| `tqk.select` | Chọn một quân của phe đang đi (đấu máy, hai người, đấu người, có thưởng) | Tệp riêng `tqk/select` (2 biến thể) | P1 |
| `tqk.move` | Mỗi nước đi được ghi, của mình hay đối thủ/máy, khi không thuộc các dòng dưới; ván qua server phát khi server ghi thêm nước (lần nạp ván đầu im) | Tệp riêng `tqk/move` (3 biến thể) | P1 |
| `tqk.capture` | Nước ăn quân: đánh chiếm, bắn, Thiên mã lao vào vùng phòng không (ưu tiên cao nhất) | Tệp riêng `tqk/capture` (3 biến thể, 25/11/2026) | P1 |
| `tqk.carry` | Lên chung với quân khác, hoặc đi cả chồng đang chở quân | Tệp riêng `tqk/carry` (3 biến thể, 25/11/2026) | P2 |
| `tqk.boat` | Chiến thuyền đi (kể cả khi chở quân) | Tệp riêng `tqk/boat` (2 biến thể, 25/11/2026) | P2 |
| `tqk.fly` | Thiên mã bay | Tệp riêng `tqk/fly` (2 biến thể, 25/11/2026) | P2 |

| `tqk.check` | Sau nước đi, một bên bị chiếu tướng: mình chiếu đối thủ, hoặc hai người chơi chung máy | Tệp riêng `tqk/check` (25/11/2026) | P1 |
| `tqk.checked` | Bên mình (người chơi trên máy này) bị chiếu tướng | Tệp riêng `tqk/checked` (25/11/2026) | P1 |
| `tqk.hero` | Phe nào có thêm quân anh hùng sau nước đi (quân dọa Chủ tướng địch, hoặc quân chiến đấu cuối cùng) | Tệp riêng `tqk/hero` (25/11/2026) | P2 |
| `tqk.illegal` | Đang cầm quân mà bấm ô quân đó không tới được (bấm lại chính quân đó là bỏ chọn, im) | Tệp riêng `tqk/illegal` (25/11/2026) | P1 |

Thứ tự chọn tiếng đi quân ở `tam-quan-ky/sounds.ts` (`moveCue`): ăn quân → lên chung → Chiến thuyền → Thiên mã → chồng chở quân → thường. `moveSounds` nối thêm tiếng chiếu và tiếng anh hùng (ván đã ngã ngũ thì không báo chiếu), `playInTurn` phát cách nhau 280 ms.

| Cue | Khi nào | Tệp | Ưu tiên |
|---|---|---|---|
| `tqk.win` / `tqk.lose` / `tqk.draw` | Hết ván (`resultCue`): phe mình thắng hoặc hai người chung máy là win, thua là lose, hòa là draw. Nước kết thúc ván: phát sau tiếng nước 0,7 s; đầu hàng và hết giờ: phát ngay; ván qua server: khi server báo hết ván (nạp lại ván đã xong thì im) | Tệp riêng `tqk/win`, `tqk/lose`, `tqk/draw` (25/11/2026) | P1 |
| `tqk.clock` | Còn 10 giây cuối trong lượt của mình (hai người chung máy: lượt bên đang đi), mỗi giây một tiếng (`clockTickDue`) | Tệp riêng `tqk/clock` (25/11/2026) | P2 |

Nhạc: `tam_quan_ky` (26/11/2026) ở phân cảnh `TAM_QUAN_KY` (`sceneMusic.ts`).

### 5.10 Vây Thành Kỳ (`go.*`, nối 26/11/2026)

Bàn cờ là `role="application"` nên không có tiếng bấm chung. `vay-thanh-ky/sounds.ts` (`goMoveSounds`) chọn tiếng cho một nước, `playInTurn` phát cách nhau 220 ms. Đấu máy, hai người chung máy và đấu người dùng chung; ván qua server phát khi server ghi thêm nước (nạp ván đầu im).

| Cue | Khi nào | Tệp | Ưu tiên |
|---|---|---|---|
| `go.place` | Đặt quân hợp lệ | Tệp riêng `go/place` (3 biến thể) | P1 |
| `go.capture_small` / `go.capture_big` | Nước đó bắt quân: dưới 4 quân / từ 4 quân (`BIG_CAPTURE`), sau tiếng đặt quân | Tệp riêng `go/capture_small`, `go/capture_big` | P1 |
| `go.atari` | Bên kia có thêm nhóm chỉ còn một khí (ván chưa ngã ngũ) | Tệp riêng `go/atari` | P2 |
| `go.pass` | Bỏ lượt | Tệp riêng `go/pass` | P1 |
| `go.illegal` | Bấm điểm không đặt được (đã có quân, luật cướp, tự hết khí) | Tệp riêng `go/illegal` | P1 |
| `go.score` | Hết ván bằng đếm điểm: bấm xác nhận điểm (chơi trên máy) hoặc server báo kết quả đếm điểm | Tệp riêng `go/score` | P2 |
| `go.clock` | Đấu người có đồng hồ: còn 10 giây cuối trong lượt của bạn, mỗi giây một tiếng | Tệp riêng `go/clock` | P2 |
| `go.win` / `go.lose` | Hết ván (`goResultCue`): phe mình thắng hoặc hai người chung máy là win, thua là lose. Đếm điểm: sau `go.score` 1,2 s; bắt quân trước, đầu hàng: sau 0,4 s. Ván qua server: khi server báo hết ván | Tệp riêng `go/win`, `go/lose` (26/11/2026) | P1 |

Nhạc: `vay_thanh_ky` (26/11/2026) ở phân cảnh `VAY_THANH_KY` (`sceneMusic.ts`).

### 5.11 Tầm Tướng Ký (`ttk.*`, nối một phần 26/11/2026)

| Cue | Khi nào | Tệp | Ưu tiên |
|---|---|---|---|
| `ttk.slot` | Nguyên liệu mới vào ô Đài Hợp Nguyên (chọn từ kho, dùng thẻ, chọn lại cặp đã thử), cả Thường và Hạng (`tam-tuong-ky/sounds.ts`, `slotCue`) | Tệp riêng `ttk/slot` (3 biến thể) | P1 |
| `ttk.unslot` | Gỡ nguyên liệu khỏi ô hoặc đổi chỗ hai ô; dọn ô sau khi ghép thì im | Tệp riêng `ttk/unslot` (3 biến thể, 27/11/2026) | P1 |
| `ttk.miss` | Ghép không ra gì (`noRecipe`; Hạng: nguyên liệu mất) (`combineCue`) | Tệp riêng `ttk/miss` (27/11/2026) | P1 |
| `ttk.known` | Ghép ra yếu tố đã biết (`alreadyKnown`, hoặc thêm một cách ra yếu tố đã biết) | Tệp riêng `ttk/known` (27/11/2026) | P1 |
| `ttk.reject` | Server từ chối lần ghép (`invalid`) hoặc thao tác lỗi (mạng, hết lượt...) | Tệp riêng `ttk/reject` (27/11/2026) | P1 |

Chưa có: `ttk.new` (khám phá mới), `ttk.hero` (ra tướng), `ttk.hint` và nhạc `tam_tuong_ky` (prompt ở 04-prompts mục D5).

## 6. Kiểm tra

- Test tự động: mọi `CueId` có dòng manifest và tệp; mọi tệp trong manifest tồn tại; kích thước tệp trong ngưỡng; không có cue trùng tên.
- Test hành vi (jsdom, `AudioContext` giả): chưa unlock thì không phát; tắt tiếng thì không phát; giới hạn đồng thời; ducking trả lại âm lượng.
- Kiểm tay: iOS Safari, Android Chrome, desktop; tab ẩn; tắt tiếng; lặp nhạc không hở; hai cue sát nhau không méo; âm lượng các bộ ngang nhau.

## 7. Nhạc theo phân cảnh và theo loại trận (đã nối)

`audio/sceneMusic.ts` ánh xạ phân cảnh sang nhạc/âm nền; `SceneAudio` áp khi đổi phân cảnh. Trận Đồ và trận đánh (`SELF`) tự chọn nhạc ở màn của mình. Trong trận đánh (`DemoGame`): Sinh tồn → `survival`; Thiên Mệnh → `tower_destiny`; Đấu trường → `arena`; đánh trùm hoặc nhiệm vụ có pha trùm → `battle_boss`; còn lại `battle_normal`. Cue đã nối thêm: `survival.wave` (đợt mới), `survival.warn` (màn nghỉ giữa đợt), `daily.complete` (có điểm Nhật Lệnh), `arena.rank` (có kết quả Đấu trường). Nối 23/11/2026: `tower.firstclear` (vượt tầng Thí Luyện lần đầu), `tower.floor` (vượt tầng đã từng vượt, hoặc vượt tầng Thiên Mệnh), `destiny.fail` (gục ở Thiên Mệnh); `destiny.choose` ở màn Thiên Mệnh khi lập đội đầu lượt leo hoặc nhận ban thưởng. Nối 23/11/2026: `ui.click`/`ui.back` cho mọi nút, liên kết, thẻ tab trong `/game` qua `UiSounds` (luật ở `audio/uiSounds.ts`: nhãn bắt đầu bằng "Về", "Quay lại", "Trở lại", "Trở về", "Đóng", "Thoát" dùng `ui.back`; trong bàn cờ `role="grid"`/`"application"` im; `data-sfx="none" | "back" | "click"` ghi đè); nhạc `daily` ở màn Nhật Lệnh, `expedition` ở màn Viễn Chinh. Nối 24/11/2026, cũng trong `UiSounds`: `ui.open`/`ui.close` khi số hộp thoại đang mở (`dialog[open]`, `role="dialog"`/`"alertdialog"`, `aria-modal`) tăng/giảm, khi đó bỏ tiếng bấm của cú bấm mở/đóng; `ui.error` khi một `role="alert"` mới hiện (trong `data-sfx="none"` thì im). `ui.reward` gọi trực tiếp khi nhận thưởng thành công: `claimQuest`/`claimAchievement` trong `useProfile`, mọi bảng bậc thưởng (Quần Hùng, Giao Tranh, Trấn Ải, Trận Đồ, Bậc thưởng, bảng bậc theo chế độ) và thưởng hạng cuối kỳ. Manifest có thêm mục `ambience` (cùng dạng `music`, bus `ambience`).
