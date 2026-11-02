# Âm thanh: kiến trúc, quy ước tệp và bảng cue theo chế độ

> Cập nhật: 02/11/2026
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
| `ui.levelup` | Lên cấp/mở khóa | Chiêng ngân + sáo lên | 1,5 s | P2 |

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
| `formation.rank` | Hiện hạng cuối kỳ | Chiêng điểm theo hạng (top 1 dài hơn) | 1,5 s | P2 |
| `formation.tick` | Kỳ sắp hết (dưới 1 giờ) | Mõ nhịp chậm (chỉ phát khi đang ở màn chế độ) | 0,3 s | P2 |

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
| `battle.damage` / `crit` | Nhận sát thương, chí mạng | Va nặng; chí mạng thêm chiêng gắt | 0,3 s | P1 |
| `battle.heal` / `shield` / `buff` / `debuff` | Hồi, khiên, tăng, giảm | Chuông nhỏ, kim loại ngân, nốt lên, nốt xuống | 0,4–0,6 s | P2 |
| `battle.burn` / `freeze` / `poison` | Trạng thái | Lách tách, đóng băng, sủi | 0,5 s | P2 |
| `battle.ko` | Một nhân vật gục | Thịch nặng + tiếng thở ra | 0,8 s | P1 |
| `battle.turn` | Đổi lượt | Mõ một tiếng | 0,2 s | P2 |
| `battle.timer` | Đồng hồ 30 giây còn 5 giây | Mõ nhịp nhanh | 0,25 s | P2 |
| `battle.win` / `lose` | Kết thúc trận | Khải hoàn bằng trống đồng + sáo; thua: trống trầm + đàn bầu | 3–4 s | P1 |

Đã nối (02/11/2026): tiếng ghép ô theo từng khung hoạt ảnh (`Frame.sound`), cue theo sự kiện ở hai thời điểm `start`/`end` của đạo diễn trận, nhạc `battle_normal`/`battle_boss` (chiến dịch có pha trùm)/`survival` khi đang trong trận. Chưa nối: `battle.crit`, `battle.turn`, `battle.timer`.

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

Đã nối (02/11/2026): `music/atlas` + `amb/atlas` khi ở màn Bình Loạn; `music/dialogue` khi mở bộ phát thoại (trả nhạc bản đồ khi đóng); `music/ending` ở màn kết cục; cue `atlas.select` khi chọn điểm trên bản đồ, `dialogue.next` khi sang câu thoại kế. Chưa nối: `music/prep`, `atlas.unlock`, `music/ending_*` theo cấp độ lịch sử.

### 5.5 Tháp, Sinh tồn, Thử thách, Đấu trường, Quần Hùng

| Chế độ | Nhạc | Cue riêng | Ưu tiên |
|---|---|---|---|
| Tháp Thí Luyện | `music/tower_trial` (nhạc màn Tháp; trận đánh trong Tháp hiện dùng `battle_normal`) | `tower.floor` (lên tầng), `tower.firstclear` (thưởng đá lần đầu) | P2 |
| Tháp Vận Mệnh | `music/tower_destiny` | `destiny.choose` (chọn thẻ/roster), `destiny.fail` | P2 |
| Sinh tồn | `music/survival` + lớp tăng theo đợt | `survival.wave` (đợt mới), `survival.warn` (báo trước đợt kế) | P2 |
| Thử thách hằng ngày | dùng nhạc trận | `daily.complete` | P2 |
| Đấu trường bóng ma | `music/arena` | `arena.rank`, `arena.ghost` (gặp bóng ma) | P2 |
| Quần Hùng online (sau này) | `music/pvp` | `pvp.found`, `pvp.turn`, `pvp.win`, `pvp.lose` | P3 |

## 6. Kiểm tra

- Test tự động: mọi `CueId` có dòng manifest và tệp; mọi tệp trong manifest tồn tại; kích thước tệp trong ngưỡng; không có cue trùng tên.
- Test hành vi (jsdom, `AudioContext` giả): chưa unlock thì không phát; tắt tiếng thì không phát; giới hạn đồng thời; ducking trả lại âm lượng.
- Kiểm tay: iOS Safari, Android Chrome, desktop; tab ẩn; tắt tiếng; lặp nhạc không hở; hai cue sát nhau không méo; âm lượng các bộ ngang nhau.

## 7. Nhạc theo phân cảnh và theo loại trận (đã nối)

`audio/sceneMusic.ts` ánh xạ phân cảnh sang nhạc/âm nền; `SceneAudio` áp khi đổi phân cảnh. Trận Đồ và trận đánh (`SELF`) tự chọn nhạc ở màn của mình. Trong trận đánh (`DemoGame`): Sinh tồn → `survival`; Thiên Mệnh → `tower_destiny`; Đấu trường → `arena`; đánh trùm hoặc nhiệm vụ có pha trùm → `battle_boss`; còn lại `battle_normal`. Cue đã nối thêm: `survival.wave` (đợt mới), `survival.warn` (màn nghỉ giữa đợt), `daily.complete` (có điểm Nhật Lệnh), `arena.rank` (có kết quả Đấu trường). Manifest có thêm mục `ambience` (cùng dạng `music`, bus `ambience`).
