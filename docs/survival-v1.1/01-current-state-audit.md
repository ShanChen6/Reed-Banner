# Survival V1.1 — Current State Audit

> Phạm vi: kiểm tra implementation hiện tại để chuẩn bị mở rộng đội hình Survival thành 3 active + 2 reserve.
> Không thay đổi gameplay, thông số hoặc schema trong lần audit này.
>
> Repository: `ShanChen6/Reed-Banner`
>
> Branch thực tế được kiểm tra: `update/survival-rule` (khác branch `develop` được nêu trong yêu cầu).
>
> Tài liệu chính: [Chế độ chơi](../design/09-che-do-choi.md), [Tài nguyên & công thức](../design/03-tai-nguyen-cong-thuc.md), [Trận đấu](../design/02-tran-dau.md), [Tiến trình & kinh tế](../design/08-tien-trinh-kinh-te.md).

## Kết luận nhanh

- Survival là **một Match online duy nhất** kéo dài qua nhiều wave. `Match.battle` là trạng thái trận hiện tại; `Match.survival` giữ seed, wave, lịch sử gục và cờ kết thúc.
- Đội người chơi khi tạo lượt được đóng băng thành ba `Fighter` trong `battle.sides[0].fighters`: nhân vật chính ở index 0 và hai companion theo `Profile.team`. Hiện chưa có mô hình dự bị/bench, luân phiên vào sân, hoặc thao tác đổi fighter tại break.
- Mọi dữ liệu liên quan hồi sinh của Survival dùng **index vị trí** thay vì ID fighter. Thay fighter tại một vị trí trong lượt chơi sẽ làm lịch sử gục và thao tác hồi sinh có thể trỏ nhầm nhân vật.
- Các cấu trúc battle cơ bản không bắt buộc đúng ba fighter: `SideConfig.fighters` là mảng, `buildSide` chỉ yêu cầu tối thiểu một fighter và một số luật chạy theo độ dài mảng. Nhưng API/profile và logic Survival hiện cố định bộ ba; đưa năm fighter vào mảng hiện tại sẽ khiến cả năm cùng là combatants chứ không tạo reserve.
- Đối chiếu tài liệu: hầu hết luật của mục 4.1 khớp code. Sai khác rõ nhất là tài liệu ghi pool địch 14 người, trong khi pool hiện tạo từ 5 starter + 37 shop companion = 42 fighter; một số nội dung trong tài liệu công thức mô tả reset Nộ theo “mỗi trận”, trong khi Survival là một trận xuyên nhiều wave và code giữ Nộ qua wave như mục 4.1 mô tả.

## 1. Current architecture

### 1.1 Các lớp state

| Cấu trúc | Vai trò hiện tại | Nơi định nghĩa / tạo |
|---|---|---|
| `Profile` | Lưu tiến trình tài khoản; `team` là đúng hai companion ID, kèm tiến trình của nhân vật chính và các companion đã sở hữu. Chỉ lưu `survival.best`, không lưu lượt Survival đang chạy. | [`src/core/progress/profile.ts`](../../src/core/progress/profile.ts): `Profile`, `validTeam`, `profileTeam`, `parseProfile` |
| `FighterConfig` | Cấu hình fighter gồm ID, chỉ số nền, nghề/hệ, kỹ năng/trang bị đã dựng; không chứa trạng thái chiến đấu. | [`src/core/battle/state.ts`](../../src/core/battle/state.ts): `FighterConfig` |
| `Fighter` | `FighterConfig` cộng HP, energy, spirit, effects và trạng thái combo; đây là snapshot theo fighter trong trận. | [`src/core/battle/state.ts`](../../src/core/battle/state.ts): `Fighter` |
| `SideConfig` / `Side` | Phe chiến đấu gồm mảng fighters, index thủ lĩnh, lương; `Side` còn giữ Nộ, passive turns, lượt xoay miễn phí, vàng/sách. Không có trường active/reserve. | [`src/core/battle/state.ts`](../../src/core/battle/state.ts): `SideConfig`, `Side` |
| `BattleState` | Bàn cờ, hai phe, RNG, lượt/actor theo index, winner. `createBattle` khởi tạo state; `beginWave` thay phe AI và chuẩn bị lượt phe người chơi mới. | [`src/core/battle/state.ts`](../../src/core/battle/state.ts), [`src/core/battle/battle.ts`](../../src/core/battle/battle.ts): `createBattle`, `beginWave` |
| `SurvivalRun` | Seed bí mật, cấp lúc bắt đầu, wave hiện tại, `downed: (number|null)[]`, `done`. Không lưu danh sách fighter IDs hoặc reserve. | [`src/core/survival/survival.ts`](../../src/core/survival/survival.ts): `SurvivalRun`, `newSurvivalRun`, `planBreak` |
| `Match` | Ghép `BattleState` với độ khó, sequence, mốc thời gian, trạng thái kết thúc và optional `survival`. Là đơn vị được lưu/đồng bộ cho toàn lượt Survival. | [`src/core/match/match.ts`](../../src/core/match/match.ts): `Match`, `MatchConfig`, `startMatch` |

`profileTeam(profile, profile.team)` dựng một `FighterConfig[]` theo thứ tự `[main, companion 1, companion 2]`. `createSurvivalBattle` lưu snapshot đó vào phe 0 ở wave đầu. Từ đó trở đi, `beginWave` clone `BattleState` trước và giữ nguyên phe 0; nó chỉ thay phe 1 bằng đội địch wave mới.

### 1.2 Client/server và persistence

1. [`src/app/game/survival/SurvivalScreen.tsx`](../../src/app/game/survival/SurvivalScreen.tsx) tải profile, hiển thị team, gửi yêu cầu tạo trận online với `survival: true`, sau đó lưu **match ID** vào `localStorage` và vào scene chơi.
2. [`src/server/battles.ts`](../../src/server/battles.ts): `parseNewBattle` ép Survival thành 3v3/độ khó mở đầu Easy; `createSurvivalBattle` cập nhật lựa chọn hệ/nghề trên profile, lấy team từ profile server, tạo seed run riêng, tạo `Match` với `firstSide: 0`, rồi lưu `MatchRecord`.
3. Client chơi qua `GET /api/battles/:id` và `POST /api/battles/:id/actions`; server chạy `settle`, áp `humanAct`, lưu state theo `seq`, và trả `viewOf(match)`. Hành động ngoài bàn cờ gồm `nextWave` và `endRun`.
4. Match persistence lưu toàn bộ `Match` trong JSONB (`matches.state`); `DrizzleMatchStore` đọc/ghi nguyên state. Client chỉ lưu ID, không phải bản state có thẩm quyền. `viewOf` bỏ RNG khỏi view battle và `SurvivalView` không chứa seed.
5. `DemoGame` tự resume bằng cách lấy match ID từ `localStorage` rồi fetch lại state server; nhờ vậy F5 không khôi phục một bản Survival client cũ.

Nguồn: [`src/server/battles.ts`](../../src/server/battles.ts): `createSurvivalBattle`, `getBattle`, `actBattle`, `reward`; [`src/server/store.ts`](../../src/server/store.ts): `MatchRecord`, `MatchStore`; [`src/server/db/store.ts`](../../src/server/db/store.ts): `DrizzleMatchStore`; [`src/server/db/schema.ts`](../../src/server/db/schema.ts): `matches.state`; [`src/app/game/battle/online.ts`](../../src/app/game/battle/online.ts): `ONLINE_BATTLE_KEY`, `createOnline`, `fetchOnline`, `actOnline`; [`src/app/game/battle/DemoGame.tsx`](../../src/app/game/battle/DemoGame.tsx): resume.

## 2. Gameplay lifecycle

| Bước | Behavior hiện tại |
|---|---|
| Bắt đầu lượt chơi | Server lấy ba fighter từ profile snapshot; `newSurvivalRun` đặt `wave=1`, `downed=[null,null,null]`, `done=false`, `baseLevel=profile.main.level`. `createBattle` khởi tạo toàn bộ fighter HP đầy, energy 0, spirit 100, effects rỗng; phe có rage 0 và food nền 60. `createBattle` gọi `beginSideTurn(0)` trước khi trả state, nên upkeep đầu wave đã trừ (thường 5; 3 nếu có Binh lính sống) trước hành động đầu tiên. Wave 1 dùng seed wave riêng, AI có 2 fighter; người chơi đi trước. |
| Thắng wave | Khi phe 0 hạ hết địch, `battle.winner=0`. Đây là break, chưa phải kết thúc Match (`matchOver` trả false nếu Survival chưa `done`). `survivalCleared` khi break trả `run.wave`. |
| Nghỉ giữa wave | `BreakPanel` tính fighter đã gục và lương giả định sau khi cộng; người chơi có thể trả phí hồi sinh, đi wave tiếp, hoặc dừng. Core chỉ nhận `nextWave`/`endRun` lúc `survivalBreak` đúng (phe người chơi vừa thắng wave). |
| Hồi HP và cộng lương | `planBreak` cộng `SURVIVAL_FOOD=25`, cap ở `FOOD_MAX=100`; `beginWave` hồi từng fighter đang sống thêm `round(maxHp * 0.2)`, cap max HP. Sau khi bắt đầu wave mới, `beginSideTurn(0)` trừ upkeep ngay (3 nếu còn fighter Binh lính sống, nếu không 5). |
| Hồi sinh | `downedAfterWave` ghi wave đầu tiên fighter có HP 0 theo **index**. `autoRevive` ưu tiên người gục sớm nhất đã đủ thời gian; điều kiện thực tế cho phép tự hồi ở break sau wave kế tiếp, rồi fighter vào wave sau đó. Hoặc chọn trả 40 lương sau khi đã cộng +25; mỗi break tối đa một fighter. `beginWave` đưa fighter được hồi về 30% max HP và energy 0; hồi tự động không xóa nợ trước khi `planBreak` chọn. |
| Bắt đầu wave kế | `planBreak` xác định wave mới/địch, và `beginWave` giữ bàn cờ, phe người chơi và energy người còn sống; thay toàn bộ phe AI. Phe người chơi bắt đầu trước. `run.wave` tăng sau khi kế hoạch break được áp dụng. |
| Thua / hết lượt | Khi phe 0 bị quét sạch, battle winner là phe 1, `closeLost` đánh dấu `survival.done`. Sau 24 giờ không có hành động của người chơi, `settle` đóng run và ghi điểm theo wave đã vượt qua, không đánh dấu forfeited. Tại break, `endRun` đặt `done=true`. |
| Thưởng cuối lượt | Chỉ khi `matchOver` mới cộng thưởng. `cleared` là số wave đã hoàn thành; có ít nhất 1 wave thì tính thắng cho phần thưởng trận. Server cộng vàng Survival 10 mỗi wave, vàng/sách nhặt được, XP cho IDs fighter đang ở phe người chơi lúc kết thúc, phần thưởng rơi theo difficulty hiện tại, cập nhật kỷ lục/quest/leaderboard. Cơ chế `claimReward` chống cộng thưởng lặp. |

Chi tiết triển khai: [`src/core/survival/survival.ts`](../../src/core/survival/survival.ts): `survivalBreak`, `survivalCleared`, `downedAfterWave`, `planBreak`, `autoRevive`, `applySurvivalResult`; [`src/core/match/match.ts`](../../src/core/match/match.ts): `matchOver`, `closeLost`, `survivalAct`, `survivalView`; [`src/core/battle/battle.ts`](../../src/core/battle/battle.ts): `buildSide`, `createBattle`, `beginWave`; [`src/server/battles.ts`](../../src/server/battles.ts): `reward`.

## 3. Tài nguyên và reset qua wave

| Trạng thái | Khởi đầu lượt Survival | Khi sang wave tiếp |
|---|---|---|
| HP | Full HP khi tạo trận. | Người còn sống +20% max HP; người mới hồi sinh về 30%; người gục chưa hồi sinh vẫn HP 0. |
| Energy | Mọi fighter bắt đầu 0. | Người sống giữ nguyên. Fighter hồi sinh về 0. |
| Spirit / Tinh thần | 100 trên mọi fighter. | Đặt lại 100 cho mọi fighter, kể cả đang gục. Lượt phe người chơi đầu wave bắt đầu lại ở turn 1 nên chưa decay. |
| Rage / Nộ | `Side.rage=0`, gắn với `Side.leader` (index 0, nhân vật chính). | **Giữ nguyên** `Side.rage`; không reset qua wave. Nếu thủ lĩnh gục, cơ chế cộng Nộ dừng cho tới khi thủ lĩnh sống lại. |
| Passive / free whirl | 0 khi tạo trận. | Reset `passiveTurns` và `freeWhirls` về 0; trạng thái hiệu ứng bị động trên fighters cũng bị xóa. |
| Effects / combo | Rỗng khi tạo trận. | Xóa effects và các trường combo trên mỗi fighter; combo side-turn counters reset. |
| Lương / morale | Mặc định 60. Morale đọc từ lượng lương hiện tại. | Cộng 25, cap 100; sau đó upkeep phe người chơi bị trừ ngay khi bắt đầu lượt phe đầu wave. Không reset lương. |
| Board / turn | Bàn cờ và RNG bắt đầu mới ở wave 1. | Giữ board và board RNG; reset `winner`, turn number và last actor phe địch; phe người chơi bắt đầu trước. |

Các điểm về Spirit và reset được mô tả trong [Tài nguyên & công thức §5](../design/03-tai-nguyen-cong-thuc.md), còn energy/Nộ và effects được mô tả tại [Chế độ chơi §4.1](../design/09-che-do-choi.md). Ở combat engine, food/morale không bị `beginWave` reset; upkeep phát sinh ngay trong `Ctx.beginSideTurn`.

## 4. State/data dependencies và invariant hiện có

### Invariants được code áp đặt

- `Profile.team` hợp lệ khi có **đúng hai ID khác nhau**, đều là companion đã sở hữu; nhân vật chính luôn được `profileTeam` thêm ở đầu. `parseNewBattle` cũng đòi đúng hai companion cho 3v3.
- Server là nguồn sự thật: lựa chọn Survival được lấy từ profile server; action cần `seq` khớp, thay đổi được ghi bằng compare-and-swap theo seq.
- `SurvivalRun.downed[i]` đang có nghĩa “fighter ở slot i đã gục lần đầu ở wave nào”; `WaveConfig.revive` cũng là index slot phe 0.
- Chỉ được break khi run chưa done và `battle.winner===0`; `beginWave` cũng ném lỗi nếu phe 0 không vừa thắng.
- Mỗi lần break chỉ hồi sinh một người. Auto revive có ưu tiên người gục sớm nhất; nếu auto revive xảy ra thì người chơi không thể đồng thời trả lương hồi thêm người khác.
- Foe lineup được thay toàn bộ mỗi wave; player lineup không bị thay đổi trong code hiện tại.
- Main/leader ở index 0 là một invariant liên quan Nộ và các hiệu ứng thủ lĩnh; turn actor, last actor, targets, events, revive và UI đều tham chiếu fighter bằng index.
- `BattleState`/`Match` có thể tuần tự hóa; run seed chỉ lưu trong server Match, không đưa ra `SurvivalView`.

### Không phải invariant / không được hỗ trợ hiện tại

- `SideConfig.fighters` và `Side.fighters` không biểu diễn active/reserve. `buildSide` chỉ cấm phe rỗng; nếu đưa 5 fighter vào đây, cả 5 đều được dựng thành combatants: target, lượt, hiệu ứng, Tĩnh tâm, phần thưởng và AI đều nhìn thấy họ.
- `SurvivalRun.downed` khởi tạo cứng ba slot, không được validate/migrate theo số lượng fighter hay theo ID.
- `Profile` lưu roster sở hữu qua `companions`, nhưng trận chỉ snapshot `profile.team` (hai companion) cùng main. Roster sở hữu không phải danh sách reserve đang gắn với một Survival run.
- Thay profile/team/loadout sau khi trận được tạo không thay snapshot `FighterConfig` trong `Match`; không có API đổi lineup giữa wave hiện nay.

## 5. Các giả định đội hình 3 fighter

1. **Profile và API:** `DEFAULT_TEAM` có hai companion; `validTeam`, `parseProfile`, `ProfileAction.chooseTeam` và `parseProfileAction` yêu cầu đúng hai. `parseNewBattle` yêu cầu hai companion với 3v3. Đây là ràng buộc 3 active (main + hai companion), không chỉ là giao diện.
2. **Survival initialization:** `newSurvivalRun` tạo `downed` đúng ba phần tử; `createSurvivalBattle` dùng `profile.team`; test Survival khởi tạo fixture từ `profileTeam(p,p.team)`.
3. **Slot-indexed persistence:** `downedAfterWave`, `planBreak`, `autoRevive`, `WaveConfig.revive`, `beginWave`, `BreakPanel` và events `revive` trao đổi vị trí fighter, không ID.
4. **Battle generic nhưng không có bench:** phần lớn core chiến đấu chạy trên `fighters.length` nên không giới hạn ba; tuy nhiên đây là số fighter **đang tham chiến**, không phải tổng roster. `Side.leader`, `TurnState.actor/lastActor/acted`, `lastActors`, target refs và nhiều event payload đều index vào cùng mảng.
5. **Progression/reward:** `battleRewards` chia XP theo `own.fighters.length`; `reward` lấy ID từ fighter có mặt trong battle state lúc kết thúc. Nếu thêm roster thay người, quy tắc ai nhận XP cần được xác định chứ không thể dựa vào luật hiện tại.
6. **UI:** `SurvivalScreen` hiển thị team hiện tại theo `profileTeam`; copy nói rõ “đội 3vs3”. `BreakPanel` map trên fighter hiện có nhưng lựa chọn hồi sinh/trạng thái vẫn dựa index. UI active/reserve và thao tác swap giữa wave chưa tồn tại.

Đường dẫn cụ thể: [`src/core/progress/profile.ts`](../../src/core/progress/profile.ts): `DEFAULT_TEAM`, `Profile.team`, `validTeam`, `profileTeam`, `ProfileAction`; [`src/server/battles.ts`](../../src/server/battles.ts): `parseNewBattle`, `createSurvivalBattle`; [`src/core/survival/survival.ts`](../../src/core/survival/survival.ts): `newSurvivalRun`, `downedAfterWave`, `planBreak`; [`src/core/battle/state.ts`](../../src/core/battle/state.ts): `SideConfig`, `Side`, `TurnState`; [`src/app/game/battle/DemoGame.tsx`](../../src/app/game/battle/DemoGame.tsx): `BreakPanel`; [`src/app/game/survival/SurvivalScreen.tsx`](../../src/app/game/survival/SurvivalScreen.tsx).

## 6. Rủi ro khi thay fighter bằng ID khác giữa các wave

### Rủi ro correctness

- **Hồi sinh sai ID:** `downed` giữ số wave ở index; nếu fighter A tại index 1 bị thay bằng B, trạng thái gục của A có thể hiện trên B và `planBreak` có thể trả phí/tự hồi sinh B theo lịch sử của A.
- **Hồi HP và resource đi sai người:** `beginWave` giữ trực tiếp HP/energy/effects trên các object hiện tại trong `own.fighters`. Thay ID bằng cách sửa `id`/fighter config tại slot có nguy cơ mang HP/energy của người cũ sang người mới; thay cả object lại có nguy cơ làm mất resource cần giữ.
- **Leader/Nộ không tự đi theo ID:** thủ lĩnh là index 0, Nộ là thuộc tính của phe. Nếu ID ở slot 0 thay đổi, fighter mới kế thừa vai trò thủ lĩnh/Nộ theo vị trí; không có quy tắc chuyển hay reset Nộ theo nhân vật.
- **Turn/combo refs:** actor, acted/lastActor, side `lastActors`, combo refs và UI selection giữ index. Chỉ thay danh sách fighter khi đang ở break và reset mọi ref liên quan là cần thiết; nếu đổi giữa trận thì có thể tạo stale refs.
- **XP cuối lượt:** server phân bổ XP theo lineup cuối cùng. Người dự bị hoặc fighter đã tham chiến rồi bị thay sẽ không có attribution phù hợp; người được đưa vào cuối run có thể nhận cùng XP với người tham gia tất cả wave.
- **Snapshot hồ sơ:** tiến trình/gear được dựng khi tạo Match. Đọc lại Profile lúc đổi fighter sẽ tạo khác biệt giữa server state hiện có và profile mới; cần xác định khi nào build fighter config và xác thực mọi ID sở hữu ở server.
- **JSONB cũ:** các trận đang dở được lưu trực tiếp dưới dạng `Match`. Đổi `SurvivalRun.downed` từ index sang ID hoặc bổ sung roster/bench đòi hỏi tương thích state trận cũ trong DB; type TypeScript không tự migrate JSONB.

### Hướng dữ liệu an toàn để cân nhắc

- Gắn trạng thái sống sót/lịch sử gục với **fighter identity ổn định** (ID hoặc stable roster-entry ID nếu cho phép trùng nhân vật), không gắn duy nhất với slot combat.
- Tách roster của run (tổng 5), lineup active (3) và reserve (2) thành khái niệm riêng; giữ `Side.fighters` chỉ cho active combatants nếu muốn bảo toàn ý nghĩa hiện tại của engine.
- Tại break, xác thực thay người phía server, rồi dựng/carry state có chủ đích: HP, energy, spirit, effects/combo, leader/rage, `downed`, turn refs và thứ tự slot. Không tái sử dụng index cũ như identity.
- Quy định rõ reserve bắt đầu với trạng thái nào, hồi máu/energy có áp dụng cho reserve không, ai được hồi sinh khi reserve có mặt, quyền đổi fighter có giới hạn không, và XP/gear/quest tính theo tổng roster hay mức tham gia. Các điểm này là quyết định gameplay, chưa được code/doc hiện hành định nghĩa.

## 7. Mismatch giữa code và tài liệu

| Chủ đề | Tài liệu | Code hiện tại | Đánh giá |
|---|---|---|---|
| Pool fighter địch Survival | [§4.1](../design/09-che-do-choi.md) ghi “14 nhân vật kèm (khởi đầu và cửa hàng)”. | `FOE_POOL` ghép toàn bộ `STARTER_COMPANIONS` (5) và `SHOP_COMPANIONS` (37), tổng 42 config; chọn distinct theo wave. | **Mismatch rõ**; cập nhật số liệu tài liệu hoặc kiểm tra liệu pool có chủ đích khác. |
| Đội player | Tài liệu §4.1 nói dùng đội 3vs3 đã chọn ở Hồ sơ. | Main + đúng hai companion theo profile; `newSurvivalRun.downed` cứng ba slot. | Khớp hiện trạng, nhưng docs không nói có reserve; yêu cầu 3 active + 2 reserve là thay đổi thiết kế mới. |
| Hồi sinh tự động | Gục wave 3: nghỉ wave 4, trở lại wave 5; tối đa 1 người/break. | `downedAfterWave` ghi wave 3; `autoRevive(3)` chưa đủ; `autoRevive(4)` đủ và `beginWave` hồi khi bắt đầu wave 5. | Khớp. |
| Sức mạnh/độ khó wave | §4.1: +1 cấp mỗi 4 wave; multiplier từ 0.45, +0.05/wave; HP ×0.6; boss mỗi 5 wave; difficulty theo mốc. | `SURVIVAL_WAVES_PER_LEVEL`, `survivalPower`, `SURVIVAL_FOE_HP`, `isBossWave`, `survivalDifficulty` triển khai đúng mốc. | Khớp. |
| Lương và HP nghỉ | §4: +25 food, hồi 20% HP cho người sống; trả revive 40 food sau khi cộng lương. | `planBreak` cap food ở 100 và trừ phí sau cộng; `beginWave` heal người sống. | Khớp; upkeep giảm lương ngay ở lượt phe người chơi đầu wave kế tiếp. |
| Energy, Nộ, Spirit | §4.1 mô tả giữ energy/Nộ, xóa effects/spirit và reset turn count. | `beginWave` giữ energy và `Side.rage`; reset spirit 100, effects, passive/free-whirl, turn number/combo side turns. Revive đặt energy 0. | Khớp. Cần giữ câu ngoại lệ này nếu tài liệu công thức nói Nộ reset “mỗi trận”; Survival là một Match xuyên wave. |
| Wave preview | Bản đầu ghi báo trước đội kế; phần mô tả chung có ví dụ “3 lượt nữa”. | `WavePreview` cho biết ngay đội kế (wave/level/boss/fighters), không có bộ đếm lượt. | Phần §4.1 đã ghi rõ “chưa làm kiểu đếm ngược”; ví dụ ở phần tổng quan là mô tả ý tưởng, không phải behavior hiện có. |
| Giới hạn/bỏ dở | §4.1: bỏ dở quá 24 giờ dừng tại wave hoàn thành, không xử thua. | `settle` đặt `done`, chỉ sửa winner nếu trận đang live; `survivalCleared` trừ wave chưa hoàn tất. | Khớp. |

Tài liệu thiết kế liên quan khác: [Tài nguyên & công thức §3](../design/03-tai-nguyen-cong-thuc.md) quy định thanh Nộ theo thủ lĩnh và reset mỗi trận; câu đó cần được hiểu là reset khi tạo Match mới, không phải mỗi wave Survival. [Trận đấu §1–2](../design/02-tran-dau.md) mô tả 1vs1/3vs3 và fighter slots thông thường; không có active/reserve. [Lộ trình](../lo-trinh.md) đánh dấu Survival 5.3 đã làm, không mô tả mở rộng 3+2.

## 8. Recommended extension points

1. **Roster/team domain:** trước hết xác định model 3 active + 2 reserve và vai trò main. Mở rộng profile/action validation có chủ đích; không chỉ nới `team.length`, vì hiện main được chèn tự động và tổng active đang là main + 2 IDs.
2. **Survival run state:** giữ snapshot của 5 fighter identities/progress/gear cần thiết và lineup hiện hành; thay `downed` theo-position bằng trạng thái per-identity hoặc mapping ID → wave gục. Thêm version/default migration cho những Match đang dở.
3. **Break transaction:** mở rộng `SurvivalAction`/`survivalAct` để nhận lineup mới và validate sở hữu/không trùng phía server; xử lý thay người atomically cùng hồi phục, revive và `beginWave`.
4. **Battle integration:** tiếp tục dùng `Side.fighters` làm active lineup 3 để không làm reserves tham gia combat, hoặc nếu thiết kế chọn giữ tất cả trong side thì sửa/chứng minh mọi target/AI/turn/passive/reward semantics phù hợp. Reset actor/lastActor/acted/targets/combo refs khi lineup đổi.
5. **Reward attribution:** quy định XP và phần thưởng theo roster/active/participation; cập nhật `battleRewards`/`reward` và IDs được dùng cho `applyRewards`, thay vì vô tình chỉ thưởng lineup cuối.
6. **Client experience:** ở break hiển thị active + reserve, HP/energy/downed state theo fighter identity, cho swap và revive rõ ràng; preview và resume tiếp tục do server cung cấp view đã lọc seed.
7. **Simulation/tests/docs:** thêm test chuyển đổi qua nhiều wave, fighter gục rồi ra reserve/trở lại, đổi slot/leader, auto-vs-paid revive, restart/resume, người dự bị nhận XP và các lineup cũ; cân lại mô phỏng Survival sau khi luật được chốt.

## 9. Files likely to require changes

### Core / server

- [`src/core/progress/profile.ts`](../../src/core/progress/profile.ts) — profile team/roster và validator cho đội mới.
- [`src/core/battle/state.ts`](../../src/core/battle/state.ts) — kiểu dữ liệu nếu cần tách active/reserve hoặc nhận diện ổn định.
- [`src/core/survival/survival.ts`](../../src/core/survival/survival.ts) — `SurvivalRun`, downed/revive identity, kế hoạch break.
- [`src/core/battle/battle.ts`](../../src/core/battle/battle.ts) — `beginWave` nếu thay đổi fighter và cần carry/reset state.
- [`src/core/match/match.ts`](../../src/core/match/match.ts) — `SurvivalAction`, `survivalAct`, view và tương thích Match.
- [`src/server/battles.ts`](../../src/server/battles.ts) — tạo team server-side, validate action, persistence, kết quả/XP.
- [`src/server/db/store.ts`](../../src/server/db/store.ts) / [`src/server/db/schema.ts`](../../src/server/db/schema.ts) — chỉ cần sửa nếu quyết định thay đổi cách lưu; hiện `Match` là JSONB nguyên khối, nên thay đổi nội dung JSON không đồng nghĩa phải thêm cột SQL, nhưng cần tương thích dữ liệu run cũ.

### UI / simulation / tests / docs

- [`src/app/game/survival/SurvivalScreen.tsx`](../../src/app/game/survival/SurvivalScreen.tsx) — cần bổ sung trình bày active/reserve và cập nhật mô tả luật.
- [`src/app/game/battle/DemoGame.tsx`](../../src/app/game/battle/DemoGame.tsx) — `BreakPanel` hiện có lựa chọn hồi sinh/tiếp tục/dừng; cần bổ sung đổi fighter và hiển thị reserve.
- [`src/core/sim/survival.ts`](../../src/core/sim/survival.ts) — mô phỏng luật lineup, reserve và quyết định revive.
- [`tests/core/survival/survival.test.ts`](../../tests/core/survival/survival.test.ts) — unit tests lifecycle hiện tại và mở rộng.
- [`tests/server/battles.test.ts`](../../tests/server/battles.test.ts) — tạo trận, action/save-resume, reward.
- [`docs/design/09-che-do-choi.md`](../design/09-che-do-choi.md), [`docs/design/03-tai-nguyen-cong-thuc.md`](../design/03-tai-nguyen-cong-thuc.md) — cập nhật luật sau khi quyết định behavior; đồng thời sửa số lượng pool 14 → số đúng hoặc mô tả pool chính xác.

## 10. Evidence / coverage

- Đã đọc `AGENTS.md`, thiết kế mục Survival, tài nguyên/công thức, luật trận, tiến trình/kinh tế, lộ trình; source Survival, battle state/engine/rules, Match, profile/progress, roster, simulation, UI Survival/battle, server battle/store và DB JSONB; unit/integration tests liên quan.
- Test hiện có xác nhận wave 1–2 có 2 địch, từ wave 3 có 3; boss wave 5 có 3 fighter; heal/food/revive, energy carry, wave continuation, endRun, timeout 24 giờ, kết quả và leaderboard. Test server cũng xác nhận full flow khởi tạo → break → next wave → kết thúc/thưởng.
- Không chạy test vì chỉ tạo tài liệu audit; không chỉnh source, thông số gameplay, schema hoặc commit.

## Kết quả: PASS

Audit xác định được flow Survival hiện tại, invariants và các vị trí cụ thể cần mở rộng cho mô hình 3 active + 2 reserve; đã nêu mismatch tài liệu và các rủi ro khi thay fighter bằng ID khác. Branch được kiểm tra không phải `develop`; báo cáo phản ánh trạng thái trên `update/survival-rule`.
