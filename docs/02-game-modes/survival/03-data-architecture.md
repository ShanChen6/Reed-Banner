# Survival V1.1 — Roster Data Architecture

> **Final implementation note (Task 24):** Sections marked as early-task status describe the design checkpoint at that time, not current shipping state. Current implementation supports initial roster selection, BREAK rotation/build/revive confirmation, persistence and server-side sequence validation; see [24-final-acceptance.md](./24-final-acceptance.md) and [22-qa-report.md](./22-qa-report.md).

> Thiết kế dữ liệu cho roster tối đa 5 fighter chạy trên battle engine chỉ nhận 3 active.
> Thiết kế mục tiêu; trạng thái triển khai hiện tại được ghi ở ghi chú bên dưới.
> Căn cứ: [01-current-state-audit.md](./01-current-state-audit.md), [02-rules-state-machine.md](./02-rules-state-machine.md).

> **Implementation status (Tasks 04–09):** `createSurvivalRoster` tạo snapshot 3 active + tối đa 2 reserve từ Profile đã xác thực và khóa `orderIds` theo thứ tự ban đầu để tie-break không đổi khi đổi slot. `SurvivalRun` mới lưu roster và `stateVersion: 2`. `survivalActiveSideConfig` chiếu đúng ba snapshot active sang `SideConfig` và giữ Đinh Bộ Lĩnh ở leader index 0; `readSurvivalFighterState` ánh xạ active runtime từ BattleState theo fighter ID và reserve runtime từ roster; `syncSurvivalRosterState` ghi knockout wave theo ID và đồng bộ field `downed[]` tương thích. `deserializeSurvivalRun` xác thực V2 hoặc chuyển bản lưu legacy 3-active sang V2 mà không dựng lại BattleState/board, hồi HP hay reset energy; V2 cũ thiếu `orderIds` được chuẩn hóa theo active/reserve order hiện có. `DrizzleMatchStore.get` áp dụng adapter khi load; JSONB payload schema không đổi. `recoverSurvivalRoster` settle recovery theo đúng role của wave thắng: active sống +20%, reserve sống +10%, fighter gục không heal; marker `settledThroughWave` chặn settle hai lần. `planBreak` chọn auto/paid revive theo stable fighter ID trên toàn roster; reserve revive cập nhật runtime và vẫn ở reserve. `beginWave` nhận battle đã recovery và `heal: 0` từ Survival để không cộng lại. Active HP/energy vẫn authoritative ở BattleState, reserve runtime ở roster. Thay đội hình vẫn chưa triển khai.

> **Implementation status (Task 10):** `coordinateSurvivalRoundTransition` là điểm commit duy nhất cho BREAK → wave kế; tính toán recovery, tiếp tế, revive và khởi tạo wave kế được trả về như một Match mới, sau đó server lưu qua `seq` compare-and-swap. Fetch/resume ở BREAK không settle, stale/duplicate `nextWave` không settle lần hai, còn `endRun` không settle break. Lương +25 và phí revive được áp trước upkeep đầu lượt do `beginWave`, phù hợp thứ tự luật hiện có; board, RNG và Nộ được giữ qua transition.

> **Implementation status (Tasks 11–13):** `proposeSurvivalLineup` kiểm tra đề xuất rotation trên snapshot/runtime theo ID và trả về state preview bất biến; `nextWave.activeIds` là lựa chọn xác nhận ở BREAK. Coordinator áp recovery/revive trước, dựng đúng ba active fighter từ state theo ID, remap revive slot, rồi truyền lineup cho `beginWave`. Wave mới reset spirit/effects/turn markers, giữ HP/energy đã settle, board/RNG/Nộ và đưa AI mới vào side 1; reserve không nằm trong battle side. Request lặp vẫn bị chặn bằng `seq` và server CAS.

> **Implementation status (Task 14):** `SurvivalFighterSnapshot.leaderBuildChoice` lưu nghề/hệ Đinh Bộ Lĩnh được chọn cho Survival; `proposeSurvivalLeaderBuild` chỉ cho phép lựa chọn ở BREAK, kiểm tra với `PROFESSIONS`/`ELEMENTS` và trả về run mới. Choice không sửa `Profile`, fighter config/runtime, kỹ năng hay đồng đội; legacy snapshot không có choice đọc theo nghề/hệ hiện tại của snapshot cho tới khi có lựa chọn mới. Tính lại stats, HP và kỹ năng thuộc Task 15–16.

> **Implementation status (Task 15):** Khi xác nhận `nextWave`, `applySurvivalLeaderBuild` dựng lại chỉ số bằng `buildMain` + `withGear` từ progression/trang bị snapshot; không đọc Profile và không cộng gear lần hai. HP được scale theo tỷ lệ chuẩn hóa; `leaderHpProjection` giữ cặp HP/maxHP đã làm tròn để save-sync không biến phép chiếu thành tỷ lệ mới, còn combat/recovery thay đổi HP sẽ cập nhật lại tỷ lệ baseline. HP 0 vẫn 0; energy được giữ, Nộ chung không đổi. Việc thay lại skills/levels theo nghề/hệ được bổ sung ở Task 16.
>
> **Implementation status (Task 16):** Khi áp dụng build, `applySurvivalLeaderBuild` lấy `skills` và `skillLevels` từ chính `buildMain` theo progression snapshot (`o1`–`o6`), rồi chuyển config này vào fighter của wave mới. Builder lọc slot theo cấp (1/2 ở cấp 1, 3 ở cấp 5, 4 ở cấp 10, 5 ở cấp 15, 6 ở cấp 20), chọn kỹ năng nghề/hệ và tuyệt chiêu Đinh Bộ Lĩnh theo build; không tự tạo điểm, cấp hoặc kỹ năng chưa mở. Kiểm tra no-op cũng đối chiếu loadout để sửa an toàn các snapshot đã có nghề/hệ mới nhưng còn skill IDs cũ. Kỹ năng được gửi cùng battle state mới nên client và server đọc cùng một loadout; không có trạng thái cooldown riêng gắn với ID kỹ năng, còn hiệu ứng tạm được reset theo luật đầu wave hiện hành.
>
> **Implementation status (Task 17):** Màn chuẩn bị Sinh tồn cho phép chọn hai active companion và tối đa hai reserve từ các ID đã xác thực trong `Profile.companions`; Đinh Bộ Lĩnh luôn được hiển thị cố định làm leader. UI gửi active qua `companions` và dự bị qua `reserveCompanions`; server tiếp tục xác thực sở hữu và toàn roster bằng `createSurvivalRoster` trước khi tạo snapshot, không đổi schema hay thay cách chơi mode khác.
>
> **Implementation status (Task 18):** `SurvivalView.break` được dựng phía server bằng pure recovery preview: HP trước/sau hồi, energy, vị trí, downed/revive status, lương hiện tại/sau tiếp tế/sau phí và quyền hồi sinh đều được gửi sẵn cho client; frontend không tự áp gameplay. `SurvivalRosterEntry.revivedAtWave` là field optional trong V2 để màn nghỉ phân biệt người từng được hồi sinh; parser chấp nhận snapshot cũ không có field này và chuẩn hóa thành `null`, không cần SQL migration vì dữ liệu match nằm trong JSONB. `SurvivalBreakScreen` hiện preview đợt kế, cảnh báo boss, lực lượng, hồi sinh trả lương, tiếp tục hoặc dừng; không tự chuyển wave.

> **Implementation status (Task 19):** `SurvivalBreakView` bổ sung active/reserve IDs và snapshot tiến trình/trang bị an toàn của leader để client dựng bản xem trước nghề, hệ, chỉ số, tỷ lệ HP và kỹ năng/unlock từ đúng dữ liệu của run, không đọc hoặc sửa Profile. `SurvivalBreakScreen` giữ draft lineup/build/revive trong component state; lựa chọn dự bị gục bị khóa và lineup được kiểm tra sơ bộ trước khi xác nhận. Chỉ nút xác nhận gửi một `nextWave` action gộp; server vẫn là nơi xác thực và commit rotation, build, hồi sinh và transition. Preview/hoàn tác không gửi action hoặc ghi state lên server.

> **Implementation status (Task 20):** Các route tạo/xem/action giữ kiểm tra cookie chủ sở hữu; trận của chủ khác trả `notFound`. Tạo run xác thực quyền sở hữu fighter và reserve trước snapshot. Trong BREAK, một `nextWave` duy nhất gộp `activeIds`, `leaderBuild`, và `revive`; core lập kế hoạch trong bộ nhớ và chỉ trả state chuyển round hoàn chỉnh nếu mọi kiểm tra thành công. Service lưu state bằng sequence compare-and-swap; transition lỗi không lưu một phần recovery, lương, hồi sinh, rotation hoặc build. `seq` chặn request cũ/lặp. Preview (`GET`) chỉ là dữ liệu đọc, còn draft chỉ ở client; `nextWave` và `endRun` là các action thay state. Các lỗi domain ổn định gồm `noBreak`, `invalidRevive`, `notEnoughFood`, `unknownFighter`, `fighterDowned`, `invalidProfession`, `invalidElement`, `staleSeq`, và `notFound`; payload chỉ số tự khai bị parser từ chối.

> **Implementation status (Task 21):** Persistence giữ nguyên kiến trúc: Postgres update có điều kiện `WHERE matches.seq = expectedSeq`; memory store có cùng compare-and-swap cho môi trường đơn tiến trình. Hai action cùng seq chỉ một action lưu, request còn lại nhận `conflict`; retry với seq cũ nhận `staleSeq`. Client tự GET trạng thái chuẩn sau network/conflict/stale không có view, và bỏ qua response có seq thấp hơn state đã nhận. Một transition chỉ cập nhật `settledThroughWave`, food, hồi sinh, lineup/build và wave trong cùng một Match save; GET khi đang BREAK là read-only. Bản lưu legacy được hydrate qua adapter cũ→V2 và giữ trạng thái giữa trận/nghỉ; luật bỏ dở Sinh tồn 24 giờ và claim thưởng một lần không đổi.

## 1. Mục tiêu kiến trúc

- Lưu snapshot của Đinh Bộ Lĩnh và tối đa bốn companion cho toàn bộ run.
- Mỗi fighter có ID ổn định xuyên suốt run; active slot chỉ là vị trí chiến đấu tạm thời.
- Chỉ ba active được map vào `BattleState.sides[0].fighters`; reserves không được engine nhìn thấy.
- Giữ một nguồn authoritative cho HP/energy: active fighter đọc/ghi từ battle state; reserve fighter đọc/ghi từ roster state.
- Giữ đủ config đã chụp lúc tạo run (stats, nghề/hệ, skills/levels, gear) để profile thay đổi về sau không ảnh hưởng run.
- Đổi nghề/hệ main bằng dữ liệu run, không sửa `Profile`.
- Resume bảo toàn seed/RNG/board hiện có; adapter cũ không dựng lại battle và không tiêu thụ RNG.
- Đọc được Match Survival cũ chưa có roster schema mới. Không đổi schema Postgres nếu JSONB hiện tại đủ.

## 2. Audit kiểu dữ liệu hiện tại

| Type | Dữ liệu/giới hạn hiện tại | Hệ quả với 3+2 |
|---|---|---|
| `Profile` | Có `team: readonly string[]` nhưng validator bắt đúng hai companion; `companions` giữ progression, `bag` giữ gear và `loadouts` giữ gear IDs. Survival chỉ lưu `best`. | Profile chưa có reserve selection. Profile là nguồn để tạo snapshot lúc bắt đầu, không nên tiếp tục là nguồn runtime của run. |
| `FighterConfig` | ID, name, element, profession, maxHp, atk, def, skills, skillLevels, passive IDs. Gear đã được tính vào chỉ số bởi `withGear`, nhưng object không chứa gear ID/chi tiết món. | Đủ dựng battle fighter, chưa đủ provenance equipment nếu cần tái dựng/reconfigure main. |
| `Fighter` | `FighterConfig` + hp, energy, spirit, effects, combo runtime. | Có thể dùng nguyên trạng cho active trong engine. Không nên lưu một bản mutable thứ hai trong SurvivalRun. |
| `SideConfig` / `Side` | Fighters là mảng combatants; leader là index. Không có reserve concept. | Chỉ truyền ba active vào phe người chơi. |
| `BattleState` | Hai side, board, board RNG, AI RNG, turn/indexes, winner, weights, timer, combo state. | Trong lượt đang đánh là authoritative cho active fighter runtime, board, Nộ/lương và turn. Không regenerate khi resume/sang wave. |
| `SurvivalRun` | seed, baseLevel, wave, `downed: readonly (number|null)[]` theo slot, done. | Không có identity snapshot, active/reserve IDs, resource reserve, migration marker hay settlement marker. |
| `Match` | `battle` + metadata + optional `survival`; state toàn Match được ghi vào `matches.state` JSONB. | Thêm version/roster bên trong `SurvivalRun` không đòi hỏi thêm cột; cần adapter dữ liệu cũ trước khi dùng logic mới. |

Định nghĩa nguồn: [`src/core/battle/state.ts`](../../../src/core/battle/state.ts), [`src/core/survival/survival.ts`](../../../src/core/survival/survival.ts), [`src/core/match/match.ts`](../../../src/core/match/match.ts), [`src/core/progress/profile.ts`](../../../src/core/progress/profile.ts), [`src/core/gear/gear.ts`](../../../src/core/gear/gear.ts), [`src/core/progress/inventory.ts`](../../../src/core/progress/inventory.ts), [`src/server/db/schema.ts`](../../../src/server/db/schema.ts).

## 3. Đề xuất schema Survival V2

Các interface dưới đây là **đề xuất**, dùng readonly cho state domain. Pure functions tạo object mới thay vì mutate state input. Dùng alias ID hiện tại (`FighterConfig.id`) làm stable identity vì roster cấm duplicate ID.

```ts
type FighterId = string;
type WaveNumber = number;
type ActiveSlot = 0 | 1 | 2;

interface SurvivalGearSnapshot {
  readonly items: readonly GearItem[];
  /** Profile loadout key lúc chụp; chỉ provenance, không lookup lại Profile. */
  readonly characterId: FighterId;
}

interface SurvivalFighterSnapshotBase {
  /** Config hoàn chỉnh đã build và có gear stats áp dụng; không chứa mutable battle runtime. */
  readonly config: FighterConfig;
  /** Đồ đang mặc lúc bắt đầu run; snapshot value, không chỉ lưu profile gear ID. */
  readonly equipment:
    | { readonly kind: "snapshot"; readonly value: SurvivalGearSnapshot }
    | { readonly kind: "legacyEmbedded" };
}

type SurvivalFighterSnapshot =
  | (SurvivalFighterSnapshotBase & {
      readonly kind: "main";
      /** Legacy không có progression/equipment provenance đầy đủ nên không thể reconfigure an toàn. */
      readonly mainBuild:
        | {
            readonly kind: "snapshot";
            readonly progress: CharacterProgress;
            readonly baseProfession: Profession;
            readonly baseElement: Element;
          }
        | { readonly kind: "legacyEmbedded" };
    })
  | (SurvivalFighterSnapshotBase & {
      readonly kind: "companion";
    });

interface SurvivalReserveRuntime {
  /** Runtime reserve duy nhất khi fighter không nằm trong BattleState. */
  readonly hp: number;
  readonly energy: number;
}

interface SurvivalRosterEntry {
  readonly id: FighterId;
  readonly snapshot: SurvivalFighterSnapshot;
  readonly downedAtWave: WaveNumber | null;
  readonly location:
    | { readonly kind: "active"; readonly slot: ActiveSlot }
    | {
        readonly kind: "reserve";
        /** Có mặt chỉ khi fighter reserve; không đồng thời có active Fighter runtime. */
        readonly runtime: SurvivalReserveRuntime;
      };
}

interface SurvivalRoster {
  /** Có đúng 3 ID; index tương ứng active slot. ID 0 luôn là Đinh Bộ Lĩnh. */
  readonly activeIds: readonly [FighterId, FighterId, FighterId];
  /** 0–2 ID, không trùng activeIds. Thứ tự là tie-break ổn định khi revive. */
  readonly reserveIds: readonly FighterId[];
  /** Mỗi ID duy nhất; key phải bằng entry.id. */
  readonly entries: Readonly<Record<FighterId, SurvivalRosterEntry>>;
}

interface SurvivalRunV2 {
  readonly stateVersion: 2;
  readonly seed: number;
  readonly baseLevel: number;
  readonly wave: number;
  readonly done: boolean;
  readonly roster: SurvivalRoster;
  /** Wave thắng gần nhất đã settle để mở wave kế. 0 nghĩa chưa settle wave nào. */
  readonly settledThroughWave: WaveNumber;
}
```

`GearItem` trong repository là value `{id, slot, element, tier, set, profession?}`; snapshot phải chứa **value đầy đủ**, không chỉ item ID, vì Profile/bag/loadout có thể đổi hoặc mất sau khi run bắt đầu.

Persistence boundary nên phân biệt type dữ liệu đọc từ storage và domain đã chuẩn hóa:

```ts
interface SurvivalRunV1 {
  readonly seed: number;
  readonly baseLevel: number;
  readonly wave: number;
  readonly downed: readonly (number | null)[];
  readonly done: boolean;
}

type StoredSurvivalRun = SurvivalRunV1 | SurvivalRunV2;
type CurrentSurvivalRun = SurvivalRunV2;
```

Parser nhận `unknown`, nhận diện đúng V1/V2 rồi trả `CurrentSurvivalRun`; gameplay functions chỉ nhận V2. Không cho code gameplay truy cập `downed[]` cũ.

### 3.1 Nguyên tắc không nhân bản mutable state

- `SurvivalRun.roster.entries[id].snapshot` là config snapshot chuẩn tĩnh; `BattleState` giữ projection của config cho active vì `Fighter` hiện kế thừa toàn bộ `FighterConfig`.
- Trong `FIGHTING`, HP/energy/spirit/effects/combo của active chỉ có một nguồn authoritative: `battle.sides[0].fighters[slot]`. Không copy HP/energy active sang `SurvivalRun`.
- Khi fighter ở reserve, không có trong battle side; HP/energy của họ chỉ có trong `entry.location.runtime`. Reserve không giữ effects/combo. Tại đầu wave, spirit reserve đặt 100 theo luật reset wave; không có decay ngoài trận.
- `downedAtWave` thuộc entry theo ID; đây là metadata lifecycle, không thay thế HP làm nguồn sống/chết. Bất kỳ action nào làm fighter chuyển từ sống sang gục phải ghi wave vào entry trong cùng update Match. Invariant kiểm tra `downedAtWave !== null` iff fighter đang gục theo state authoritative của vị trí hiện tại, trừ khi fighter được hồi sinh trong cùng wave (nếu có mechanic đó).
- Khi active → reserve tại break: đọc HP/energy cuối wave từ battle fighter, lưu vào `runtime`, đổi location sang reserve, bỏ fighter khỏi battle projection kế tiếp.
- Khi reserve → active: lấy HP/energy từ runtime, build `Fighter` mới từ snapshot config cộng runtime cần giữ, chèn đúng active slot, xóa `runtime` khỏi location.
- Ở transition, mọi update roster + battle phải commit cùng một Match/seq. Không có thời điểm persisted mà một ID vừa active vừa reserve hoặc không ở đâu cả.

`config` trong roster snapshot và các config fields trong `BattleState.Fighter` là projection lặp bắt buộc bởi API của battle engine, nhưng immutable. Không tạo thêm mutable combat copy. Tại boundary (adapt/confirm) so sánh `id`, `element`, `profession`, stats, skills/levels và passive fields với snapshot đã chọn; lệch ngoài trường hợp main reconfigure là invalid state, không tự “chọn bản mới nhất”.

### 3.2 ID, lineup và slot mapping

- Stable ID hiện tại: `"dinhBoLinh"` cho main; companion ID như `"haVan"`, `"maiThanh"` cho companion.
- Validate roster: tổng 3–5; active IDs đúng 3; reserve IDs 0–2; không duplicate; entry keys khớp IDs; `entry.snapshot.config.id === entry.id`; main ID ở active slot 0; không có fighter khác ở slot 0.
- `activeIds[slot]` là ánh xạ duy nhất giữa stable ID và `battle.sides[0].fighters[slot]`. Validate cả hai chiều: đúng ba fighter, fighter.id khớp ID mapping.
- `reserveIds` không phải index battle. Downed, runtime, UI selection và revive target dùng `FighterId`.
- Khi swap, cập nhật `activeIds`, `reserveIds` và locations cùng một pure transition. Chỉ thay active companion gục bằng reserve sống; stable ID và `downedAtWave` đi cùng fighter, không đi theo slot.

## 4. Dữ liệu cần giữ

| Field | Nguồn authoritative | Snapshot / giữ qua wave | Ghi chú |
|---|---|---|---|
| ID | `SurvivalRosterEntry.id` | Luôn giữ | Không lấy từ slot; main ID bất biến. |
| HP | Active: `BattleState.Fighter.hp`; reserve: `SurvivalReserveRuntime.hp` | Giữ; điều chỉnh đúng một lần tại break theo vai trò hoặc revive | Validate `0 <= hp <= maxHp`. |
| maxHp | `snapshot.config.maxHp` và active projection | Giữ; main đổi nghề/hệ có thể dựng maxHp mới | HP transfer cho main dùng HP ratio theo Task 02. |
| Energy | Active Fighter hoặc reserve runtime | Giữ qua wave; revive đặt về 0 | Validate 0–ENERGY_MAX. |
| Nghề / nguyên tố | `snapshot.config`; main có config được cập nhật theo lựa chọn run | Giữ trong roster, đổi main chỉ tại preparation/break | Không update `Profile`. |
| ATK/DEF/skills/skillLevels/passives | `snapshot.config` | Snapshot nguyên trạng qua run; active projection phải khớp | Main config được dựng lại từ run inputs khi đổi nghề/hệ. |
| Trang bị | `snapshot.equipment.items` | Value snapshot, không lookup inventory sau khi bắt đầu | Stats áp dụng trong `config`; item values lưu để audit/rebuild. |
| DownedAtWave | `SurvivalRosterEntry.downedAtWave` | Theo fighter ID, tới khi revive | `null` khi còn sống; wave number khi gục. |
| Effects/combo | Chỉ active BattleState trong wave | Xóa khi mở wave kế; reserve không có | Không copy qua state reserve. |
| Spirit | Active BattleState; reserve state logic được reset mỗi đầu wave | Đặt 100 cho toàn roster khi wave mới bắt đầu | Reserve không decay trong combat vì không tham chiến. |
| Food/rage/board/RNG | `BattleState` | Giữ theo luật hiện tại, không copy vào fighter entries | Board/boardRng/aiRng nguyên trạng; wave seed riêng không được client nhận. |

## 5. Main profession/element mà không sửa Profile

- Lúc tạo run, server snapshot `Profile.main`, lựa chọn nghề/hệ đang chọn, các `GearItem` đang mặc cho main và `FighterConfig` cuối sau `buildMain` + `withGear`.
- Lưu `SurvivalRun.mainBuild` hoặc `mainBuild` trong main snapshot: `CharacterProgress`, item values, và cấu hình build hiện hành. Không ghi bằng `updateProfile`; chỉ `Match`/run thay đổi.
- `reconfigureSurvivalMain(run, profession, element)` là pure function: validate enum, build cấu hình mới từ snapshot progress + snapshot gear, giữ ID/name, trả run mới. Nó không nhận `Profile` và không có side effect.
- Áp dụng ở `BREAK -> FIGHTING` sau khi confirm; không sửa fighter của wave đã hoàn tất.
- Giữ HP theo tỷ lệ: `newHp = round(oldHp / oldMaxHp * newMaxHp)`, clamp từ 1..newMaxHp nếu oldHp > 0. Nếu oldHp === 0 thì giữ 0 và giữ `downedAtWave`. Sau đó apply heal active 20% / reserve 10% theo vai trò đã chốt. Thứ tự này là thứ tự đã định ở Task 02.
- Equipment values giữ nguyên qua đổi nghề/hệ. Vũ khí không dùng được bởi nghề mới phải theo behavior chuẩn của `loadoutOf`/`equip` khi build mới; đề xuất giữ gear items hợp lệ theo nghề, còn item không hợp lệ vẫn nằm trong snapshot nhưng không cộng stats. Pure builder trả config và list `appliedEquipmentIds` để kiểm chứng UI; không sửa Profile loadout.
- Các companion không đổi nghề/hệ giữa run; config/progression/gear của họ giữ nguyên snapshot.

### Legacy main không có equipment provenance

Match cũ chỉ có `FighterConfig` đã áp gear stats; không lưu item IDs/values. Không thể khôi phục chính xác gear gốc từ `maxHp/atk/def` đã tổng hợp. Adapter phải đánh dấu snapshot `equipment.kind = "legacyEmbedded"` và giữ config nguyên trạng. Để tránh suy đoán hoặc làm sai stats, **legacy-converted run khóa đổi nghề/hệ main** tới khi kết thúc; run mới có snapshot đầy đủ thì hỗ trợ đổi. Đây là compatibility constraint, không cần chạm Profile.

## 6. Ánh xạ roster ↔ battle

### 6.1 Build battle projection

```ts
function activeFightersForBattle(
  roster: SurvivalRoster,
  currentBattle?: BattleState,
): readonly [Fighter, Fighter, Fighter];

function syncActiveRuntimeToRoster(
  roster: SurvivalRoster,
  battle: BattleState,
  wave: WaveNumber,
): SurvivalRoster;

function validateRosterBattlePair(
  roster: SurvivalRoster,
  battle: BattleState,
): Result<void, SurvivalStateError>;
```

- `activeFightersForBattle` trả đúng ba fighter theo `activeIds`; nếu fighter đang active trong current battle, giữ nguyên runtime object/value (HP, energy, spirit, effects/combo). Nếu reserve vừa promote, materialize từ snapshot + `runtime`.
- Chỉ gọi khi khởi tạo run hoặc `BREAK -> FIGHTING`, không gọi trên mỗi render/fetch.
- Trước transition, `syncActiveRuntimeToRoster` đọc active HP/energy và đặt location/runtime theo lineup đã commit; các reserve chưa được promote giữ nguyên runtime.
- Sau transition, `BattleState.sides[0].fighters` là ba active mới, `leader=0`; main ID vẫn ở vị trí 0. Bàn cờ, board RNG, AI RNG, weights, side food/rage và metadata battle được clone/giữ theo luật; khởi tạo opponent mới và turn state theo helper begin-wave.
- Reset `lastActors`, actor/acted/turn-specific refs và combo refs theo helper battle hiện có; không để index từ lineup cũ tham chiếu sang fighter ID khác.

### 6.2 Pure break transition

```ts
interface SurvivalBreakChoices {
  /** map active slot companion 1|2 -> reserve fighter ID; tối đa 2 swap nếu slot gục. */
  readonly replacements: Readonly<Partial<Record<1 | 2, FighterId>>>;
  readonly mainBuild?: { readonly profession: Profession; readonly element: Element };
  readonly paidReviveId?: FighterId;
}

interface SurvivalBreakResult {
  readonly run: SurvivalRun;
  readonly battle: BattleState;
  readonly events: readonly BattleEvent[];
}

function prepareSurvivalBreak(
  run: SurvivalRun,
  battle: BattleState,
  choices: SurvivalBreakChoices,
  expectedSeq: number,
  now: number,
): Result<SurvivalBreakResult, SurvivalStateError>;
```

`prepareSurvivalBreak` xác thực condition `BREAK`, candidate identities, ownership-at-run-start, health/downed, affordability, settlement marker và pair consistency; áp swap/config/recovery/revive/reset/build-next-wave thuần trên inputs. `humanAct`/server boundary chịu trách nhiệm kiểm tra `expectedSeq`, compare-and-swap ghi cả match một lần. Không tách heal/food/revive thành endpoints riêng.

### 6.3 Identity lifecycle helpers

```ts
function createSurvivalRoster(
  profile: Profile,
  activeCompanionIds: readonly [FighterId, FighterId],
  reserveCompanionIds: readonly FighterId[],
): Result<SurvivalRoster, SurvivalStateError>;

function recordFighterDown(
  run: SurvivalRun,
  fighterId: FighterId,
  wave: WaveNumber,
): SurvivalRun;

function canReplaceActive(
  roster: SurvivalRoster,
  activeSlot: 1 | 2,
  reserveId: FighterId,
): boolean;

function chooseAutomaticRevive(
  roster: SurvivalRoster,
  completedWave: WaveNumber,
): FighterId | null;

function adaptLegacySurvivalMatch(match: Match): Result<Match, SurvivalStateError>;
```

Errors phải explicit (`invalidRoster`, `unknownFighter`, `duplicateFighter`, `invalidSlot`, `fighterNotDown`, `reserveNotAlive`, `notBreak`, `staleSeq`, `alreadySettled`, `unsupportedStateVersion`, `invalidLegacyState`); không silently default fighter/config khi dữ liệu không nhất quán.

## 7. Double heal / double revive protection

- `settledThroughWave` là monotonic marker: transition chỉ settle khi `battle.winner === HUMAN`, `run.wave === completedWave`, và `settledThroughWave < completedWave`. Transition thành công đặt marker bằng completedWave trước khi mở wave kế.
- Wave kế chỉ được build với `wave = completedWave + 1`. Match đã có `settledThroughWave >= completedWave` thì cùng break đó trả `alreadySettled`, không gọi heal/food/revive lần nữa.
- Heal áp trên roster entries đúng một lần, sau khi lineup cuối đã chốt. Active entry update qua BattleState projection; reserve entry update qua `runtime`. Sau đó marker và state mới persist cùng seq.
- `downedAtWave` chỉ clear khi một revive hợp lệ được commit. `revivedAtWave` không cần làm nguồn logic thứ hai; nếu audit muốn trace, ghi trong event/result, không dùng để quyết định eligibility.
- Paid fee bị trừ và HP=30%/energy=0 được áp trong cùng pure transition với marker. Không ghi phí riêng trước khi wave bắt đầu.
- Server action sequence và database compare-and-swap ngăn hai request cùng thắng. Reward cuối run tiếp tục dùng `claimReward`; break-settlement marker không thay thế marker reward này.
- `resume/getBattle`, serialization, UI render và preview không gọi bất kỳ settlement function nào.

## 8. Match serialization, versioning và compatibility

### 8.1 Version boundary

- Đặt `stateVersion: 2` trong `SurvivalRun` mới (không thêm version vào mọi `Match`, không đổi `Profile.version`).
- Không có `stateVersion` được định nghĩa là legacy V1 **chỉ khi** `match.survival` có đủ shape legacy và `battle.sides[0].fighters` đúng ba. Không dùng thiếu version làm fallback tổng quát cho dữ liệu sai.
- `stateVersion: 2` cần validate roster completeness, fighter IDs, active mapping và `settledThroughWave`.
- Version > 2 hoặc malformed V2 trả lỗi rõ ràng, không reset run hoặc tạo roster mới.
- Sau khi adapter chuyển V1 → V2, save Match mới ngay bằng CAS `seq`; không thay board, boardRng, aiRng, turn, side resources, fighter config/runtime hoặc seed. Việc adapter không consume RNG đảm bảo đường random tiếp tục byte-for-byte từ state đang lưu.

### 8.2 Legacy V1 → V2 conversion

1. Nhận Match server-side có `survival` dạng cũ (`seed`, `baseLevel`, `wave`, `downed[]`, `done`).
2. Lấy ba active fighter hiện tại từ `match.battle.sides[0].fighters`; ID hiện tại là stable roster identity. Bắt buộc ba ID khác nhau, fighter index 0 là `"dinhBoLinh"` và leader index là 0.
3. Tạo snapshot config từ từng `FighterConfig` trong battle; runtime active vẫn authoritative trong `BattleState`. Không đọc lại Profile để thay config/gear.
4. Với mọi fighter legacy, đánh dấu `equipment.kind = "legacyEmbedded"`; khóa reconfigure nghề/hệ main như mục 5.
5. Map legacy `downed[i]` sang `entries[fighter.id].downedAtWave` theo đúng index fighter cũ. Nếu `battle.fighters[i].hp > 0`, downedAt phải null; nếu HP 0 nhưng old `downed[i]` null, gán `run.wave` (wave fighter gục hiện tại).
6. Đặt ba fighter vào active IDs theo thứ tự cũ; reserve list rỗng; `settledThroughWave = wave - 1` nếu đang ở break sau khi vừa thắng wave, nếu đang fighting thì `wave - 1` cũng là wave cuối đã settle. Tuyệt đối không thực hiện recovery/revive khi adapt.
7. Lưu converted state cùng cập nhật Match version trong cùng CAS. Nếu CAS thua, đọc lại Match mới rồi chạy adapter trên version mới nhất.

**Policy cho inconsistent legacy state:** nếu HP/downed array không tương ứng (số lượng khác 3, ID trùng, main/leader sai, downed chứa giá trị không nguyên hoặc ngoài wave đã diễn ra), không tự sửa bằng đoán. Từ chối action gameplay với `invalidLegacyState`, log Match ID phía server, cho phép fetch/export/operational repair. Đây là safer than silently revive/kill fighter.

`downed[]` cũ có thể được xóa khỏi type V2 sau adapter nhưng nên giữ adapter cho đến khi hết retention của mọi Match legacy chưa rewarded. Không backfill database hàng loạt.

### 8.3 Database migration assessment

- **Không cần migration SQL hiện tại**: `matches.state` là `jsonb` chứa toàn bộ `Match`; thêm `SurvivalRun.stateVersion`, roster snapshot và marker chỉ thay payload.
- DB cột `seq` vẫn phục vụ CAS; mỗi adapter/transition tăng `match.seq` theo contract hiện tại. `rewardedAt` vẫn chống double reward.
- Không thêm cột cho active/reserve IDs, fighter states hay version trừ khi cần query/filter server-side độc lập với JSONB (hiện không có yêu cầu đó).
- Cần ứng xử rollout an toàn nếu có nhiều server version đồng thời: reader mới phải đọc V1; writer cũ không được ghi Match V1 sau khi Match đã convert. Trong rolling deploy, feature gate/compatibility policy phải đảm bảo không có old writer cùng phục vụ Survival V2. CAS chỉ chống ghi đồng thời theo seq, không làm code cũ hiểu schema mới.
- Schema PostgreSQL profile không đổi; profile đội mặc định 3v3 thường và lưu trữ campaign/tower/PvP không bị ảnh hưởng.

## 9. Ví dụ serialized state (rút gọn)

```json
{
  "survival": {
    "stateVersion": 2,
    "seed": 319287,
    "baseLevel": 10,
    "wave": 4,
    "done": false,
    "settledThroughWave": 3,
    "roster": {
      "activeIds": ["dinhBoLinh", "leThach", "maiThanh"],
      "reserveIds": ["haVan", "toKim"],
      "entries": {
        "dinhBoLinh": {
          "id": "dinhBoLinh",
          "snapshot": {
            "kind": "main",
            "config": {
              "id": "dinhBoLinh",
              "name": "Đinh Bộ Lĩnh",
              "element": "moc",
              "profession": "tuongSi",
              "maxHp": 720,
              "atk": 80,
              "def": 16,
              "skills": ["..."],
              "skillLevels": {}
            },
            "equipment": {
              "kind": "snapshot",
              "value": {
                "characterId": "dinhBoLinh",
                "items": [{ "id": "g12", "slot": "vuKhi", "element": "moc", "tier": 2, "set": "..." }]
              }
            },
            "mainBuild": { "kind": "snapshot", "progress": { "...": "..." }, "baseProfession": "tuongSi", "baseElement": "moc" }
          },
          "downedAtWave": null,
          "location": { "kind": "active", "slot": 0 }
        },
        "leThach": {
          "id": "leThach",
          "snapshot": { "kind": "companion", "config": { "...": "..." }, "equipment": { "kind": "snapshot", "value": { "...": "..." } } },
          "downedAtWave": null,
          "location": { "kind": "active", "slot": 1 }
        },
        "maiThanh": {
          "id": "maiThanh",
          "snapshot": { "kind": "companion", "config": { "...": "..." }, "equipment": { "kind": "snapshot", "value": { "...": "..." } } },
          "downedAtWave": 4,
          "location": { "kind": "active", "slot": 2 }
        },
        "haVan": {
          "id": "haVan",
          "snapshot": { "kind": "companion", "config": { "...": "..." }, "equipment": { "kind": "snapshot", "value": { "...": "..." } } },
          "downedAtWave": 2,
          "location": { "kind": "reserve", "runtime": { "hp": 0, "energy": 37 } }
        },
        "toKim": {
          "id": "toKim",
          "snapshot": { "kind": "companion", "config": { "...": "..." }, "equipment": { "kind": "snapshot", "value": { "...": "..." } } },
          "downedAtWave": null,
          "location": { "kind": "reserve", "runtime": { "hp": 320, "energy": 54 } }
        }
      }
    }
  },
  "battle": {
    "sides": [
      {
        "fighters": [
          { "id": "dinhBoLinh", "hp": 390, "energy": 42, "spirit": 100, "effects": [] },
          { "id": "leThach", "hp": 280, "energy": 8, "spirit": 100, "effects": [] },
          { "id": "maiThanh", "hp": 0, "energy": 55, "spirit": 100, "effects": [] }
        ],
        "leader": 0,
        "food": 62,
        "rage": 40
      }
    ],
    "boardRng": 0,
    "aiRng": 0,
    "turn": { "...": "..." }
  }
}
```

Ví dụ minh họa shape, không phải payload đầy đủ/giá trị cân bằng; `"..."` là dữ liệu lược bỏ để dễ đọc, không phải giá trị parser hợp lệ. Production validator yêu cầu **mọi** active/reserve ID có đúng một entry và location khớp. Khi đang `FIGHTING`, HP/energy của fighters active trong JSON battle side là authoritative; ví dụ đó không được đồng bộ sang một bản runtime thứ hai trong `SurvivalRun`.

## 10. TypeScript strictness và validation

- Runtime input từ JSONB là `unknown`, không cast trực tiếp thành V2. Dùng parser `parseSurvivalMatchState(raw): Result<Match, PersistenceError>` với guards cho object/array/string/integer/enums/ranges.
- Không `as any`, không optional-chain rồi default thiếu roster thành đội mới, không swallow corrupt-state errors.
- Giới hạn compile-time: `ActiveSlot = 0 | 1 | 2`, active tuple có đúng 3; runtime vẫn cần validate tuple từ JSON.
- Dùng discriminated union `location.kind` để compiler phân biệt reserve `runtime` và active `slot`; validator từ chối active có reserve runtime hoặc reserve thiếu runtime.
- Các pure functions trả `Result` typed; chỉ adapter/persistence boundary có quyền giải mã unknown JSON. Không phụ thuộc clock/RNG trong functions đổi roster/reconfigure/heal; caller truyền `now`, seed/wave RNG chỉ cho hàm sinh foe hiện có.

## 11. Compatibility rules

1. Match không có `survival` (Normal/Campaign/Tower/PvP/Daily) đi qua unchanged; adapter chỉ gọi khi `match.survival` tồn tại.
2. Match Survival legacy V1 được chuyển bằng dữ liệu trong chính Match, không dựa vào profile hiện hành và không thay RNG/board.
3. Legacy run có ba fighter và không có reserve; không tự thêm reserve từ Profile.team/companions.
4. Legacy config/equipment được giữ nguyên; không rebuild gear từ profile hiện tại và không cho đổi nghề/hệ main nếu không biết provenance gear.
5. V2 writer luôn serialize `stateVersion: 2`; reader nhận V1+V2 trong giai đoạn chuyển tiếp; unknown future version fail explicit.
6. Profile.version, inventory, TowerRun, CampaignRun, Arena snapshots và battle `Fighter` type dùng chung không bị đổi vì feature Survival.
7. Match reward cũ tiếp tục idempotent qua `rewardedAt`; adapter không đặt/reset trường này.

## 12. Dependency map — đề xuất cho Task 04–16

Các task dưới đây là dependency order kỹ thuật gợi ý; tên task có thể điều chỉnh theo kế hoạch dự án, nhưng phụ thuộc phải giữ:

| Task | Deliverable kỹ thuật đề xuất | Phụ thuộc |
|---|---|---|
| 04 | Chốt API/types V2 và validation contract | Task 03; duyệt mọi behavior normative của Task 02 |
| 05 | Implement snapshot builder từ Profile (3 active + 0–2 reserve, gear/progress) | Task 04 |
| 06 | Implement V1 parser/adapter, error policy và rollout gate | Task 04 |
| 07 | Implement state helpers theo stable FighterId, active/reserve map | Tasks 04, 05 |
| 08 | Implement break transition pure function, recovery/food/revive/dedup marker | Tasks 07 và Task 02 |
| 09 | Wire Survival create/action/view ở Match + server authoritative CAS | Tasks 06, 07, 08 |
| 10 | Wire main profession/element reconfigure từ snapshot, không sửa Profile | Tasks 05, 07, 08 |
| 11 | UI preparation/roster select/active-reserve panel/break confirmation | Tasks 04, 09, 10 |
| 12 | Reward attribution và reserve UX/state presentation | Tasks 07, 09; policy XP của Task 02 |
| 13 | Unit/property tests cho types, mapping, adapter và transition | Tasks 05–10 |
| 14 | Server integration tests cho CAS, resume, old JSONB, reward idempotency | Tasks 06, 09, 12, 13 |
| 15 | Survival simulation/balance comparison và performance/regression checks | Tasks 08–12 |
| 16 | Docs/design update, rollout/monitoring checklist và release gate | Tasks 13–15 |

Luồng phụ thuộc chính:

```text
Task 02 + 03
     ↓
 04 types/contract
  ├── 05 snapshot ── 07 identity mapping ── 08 break transition ── 09 server/Match
  └── 06 adapter ──────────────────────────────────────────────────┘
                         05 + 07 + 08 ── 10 main reconfigure
                         09 + 10 ─────── 11 UI
                         07 + 09 ─────── 12 rewards
                         05–10 ───────── 13 tests
                         06 + 09 + 12 + 13 ─ 14 integration
                         08–12 + 13 ──────── 15 simulation
                         13–15 ───────────── 16 release/docs
```

## 13. Test plan

### Unit / pure function

1. Roster builder nhận đúng 3 active + 0/1/2 reserve; từ chối ID duplicate, main sai, companion không sở hữu, quá giới hạn.
2. Round-trip active ID ↔ battle slot giữ chính xác `[main, active1, active2]`; reserve không xuất hiện trong side/targets/turn actors.
3. Active runtime không bị ghi duplicate vào run; reserve HP/energy persist qua serialize/deserialize.
4. Rotation ở BREAK có thể thay active companion sống hoặc gục bằng reserve sống; active fighter được rút xuống reserve giữ HP/energy/downedAtWave theo ID. Active gục phải được thay nếu còn reserve sống.
5. Reserve đang sống hồi 10%; active sống hồi 20%; max HP cap; HP zero không heal; role được xác định theo lineup ở wave vừa kết thúc, recovery chạy trước rotation.
6. Revive theo ID chọn đúng candidate, tie-break ổn định, clear downedAtWave một lần; revived reserve vẫn reserve.
7. Break marker chặn double heal/food/revive; stale/duplicate settlement trả lỗi.
8. Main reconfigure thuần: đổi element/profession thay config trong run, Profile input không mutate; HP ratio giữ đúng, HP 0 không được hồi sinh; equipment snapshot dùng nguyên values.

### Persistence / migration / integration

1. Golden fixture Match V1 đúng shape adapt ra V2: ba active theo đúng ID, downed map đúng người, `done/wave/seed` giữ nguyên.
2. Adapter không thay board, boardRng, aiRng, turn, winner, food, rage, gold/books, fighter runtime hoặc seed.
3. Legacy V1 không tạo reserve từ current profile; gear snapshot đánh dấu embedded; main reconfigure bị từ chối rõ.
4. Legacy invalid/corrupt, unknown V2, future version fail explicit, không reset về `newSurvivalRun`.
5. CAS concurrent adapters/transitions: chỉ một request ghi thành công và settlement marker tăng một lần.
6. Serialize → store → resume tiếp tục cùng active/reserve IDs, runtime và RNG; không tạo lại battle/board.
7. Các Match không phải Survival, Profile và test Campaign/Tower/PvP giữ behavior/schema unchanged.
8. Kết thúc run sau lineup change kiểm tra XP attribution đúng policy; claimReward chỉ một lần.

## Kết quả: PASS

Thiết kế tách roster identities khỏi battle slots, giới hạn combat side đúng ba active, lưu state reserve theo fighter ID, xác định snapshot/config/runtime ownership, version hóa payload Survival và cung cấp adapter cho Match cũ. Database migration không cần thiết với JSONB hiện tại; thay đổi chỉ là payload-level và phải được serialize qua CAS hiện có.
