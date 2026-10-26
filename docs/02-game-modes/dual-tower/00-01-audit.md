# T00.01 — Audit hệ thống Tower hiện tại

Phạm vi: chỉ đọc code + chạy baseline; không sửa production. Nhánh `develop`, working tree sạch lúc bắt đầu. `AGENTS.md` chỉ chứa khối quy tắc Next.js (đọc `node_modules/next/dist/docs/` trước khi viết code Next.js ở task sau).

## 1. Bản đồ phụ thuộc (file / function)

| Lớp | File | Symbol chính |
|---|---|---|
| Kiểu dữ liệu + parse | `src/core/progress/towerState.ts` | `TowerRun`, `TowerState`, `NEW_TOWER`, `parseTower`/`parseRun`, `applyTowerReward`, `clampTowerFood`, `TOWER_BOONS`, `BOON_BONUS`, `TOWER_HEAL/REVIVE/FOOD*` |
| Logic tầng | `src/core/tower/tower.ts` (re-export `index.ts`) | `towerFloor`, `newTowerRun`, `towerTeam`, `towerOffer`, `applyTowerResult`, `towerPower`, `towerDifficulty`, `isBossFloor`, `TOWER_BOSS_GOLD` |
| Profile | `src/core/progress/profile.ts` | `Profile.tower`, `newProfile` (`tower: NEW_TOWER`), `parseProfile` (`tower: parseTower(p.tower)`), action `towerPick`/`towerQuit`, `towerPick()`, `validTeam`, `profileTeam`, `MAIN_ID="dinhBoLinh"`, `Profile.version: 1` |
| Match | `src/core/match/match.ts` | cờ `tower?: number` (config, `startMatch`, serialize) |
| Server | `src/server/battles.ts` | `parseNewBattle` (`tower: true`), `createTowerBattle`, `matchMode`, settle gọi `applyTowerResult`, rồi `submitProfile` |
| API | `src/app/api/battles/route.ts`, `src/app/api/profile/route.ts`, `src/app/api/leaderboard/route.ts` | Không có endpoint tower riêng: tower đi qua `POST /api/battles {tower:true}` và `POST /api/profile` (action `towerPick`/`towerQuit`) |
| UI | `src/app/game/tower/TowerScreen.tsx` (được `GameShell.tsx` render ở case `"TOWER"`; không có Next route `/tower`), `battle/DemoGame.tsx` (hiển thị `outcome.tower`), `battle/online.ts` (kiểu `TowerResult`) |
| BXH | `src/core/progress/leaderboard.ts` (`board:"tower", score: p.tower.best`; allow-list board), `src/server/db/leaderboard.ts` (`leaderboardScores`), `LeaderboardScreen.tsx` |
| Quest/thành tựu | `src/core/progress/quests.ts` (stat `tower`: +1 mỗi trận thắng `mode==="tower"`; `w.tower10` 300 vàng), `achievements.ts` (`a.tower10`, `a.tower25` dùng `p.tower.best`) |
| Sim | `src/core/sim/tower.ts` (`simulateTower`; `simProfile` còn được Survival import), `scripts/balance.ts --tower`, `scripts/task4-audit.ts` |
| Test | `tests/core/tower/tower.test.ts`, `tests/server/battles.test.ts`, `tests/server/db.test.ts` (BXH `tower`), `tests/core/quests/quests.test.ts` |

## 2. Cấu trúc dữ liệu hiện hữu

- `profile.tower = { best: number; run: TowerRun | null }` trong JSON hồ sơ (ghi có điều kiện version qua `updateProfile`).
- `TowerRun`: `seed, floor, baseLevel, team: string[3] (MAIN_ID + 2 kèm), hp: number[3] (tỉ lệ), food, boons{atk,def,hp}, offer: TowerReward[]|null, active`.
- Một run duy nhất, không có trần tầng (boss mỗi 5 tầng; độ khó `easy→nightmare` theo tầng). Thua = `run=null`. Thắng = `floor+1`, `offer` 3 lựa chọn (heal / food / boon) phải chọn trước tầng sau.
- `parseTower` fail-soft: dữ liệu sai → `NEW_TOWER`; run sai → `null` (mất run lặng lẽ, giữ `best`).
- Chưa có `stones`/Đá Cường Hóa, luật tầng, chu kỳ, sweep.

## 3. Chỗ giả định đội 3 tướng cố định

1. `parseRun`: `team.length !== 3`, `hp.length !== 3`, `hp[0] > 0` — run roster 8 / HP theo id sẽ bị parse thành `null`.
2. `newTowerRun`: `team: [MAIN_ID, ...profile.team]`, `hp: [1,1,1]`.
3. `profile.ts validTeam`: đúng 2 tướng kèm, khác nhau, sở hữu; `chooseTeam` dùng chung mọi chế độ → Trial "tự do chọn 3 active" cần validation riêng.
4. `towerTeam`: `profileTeam(profile, run.team.slice(1))` bỏ qua tướng không sở hữu (đội có thể <3 lặng lẽ); phúc áp đồng đều.
5. `createTowerBattle`: side 0 = `towerTeam`, `hpRatio: run.hp`, `leader: 0`; không có bước chọn active từ roster.
6. `applyTowerResult`: HP lấy theo vị trí (`side.fighters.map(hp/maxHp)`), Destiny cần HP theo id tướng.
7. `applyTowerReward` `heal`: hồi mọi vị trí và revive (0.3) — mâu thuẫn "không hồi HP dự bị tự động" (nhưng khớp "hồi phục là lựa chọn trong run").
8. `createTowerBattle` ghi đè `element/profession` từ input (tiền lệ cho đổi nghề/hệ của Đinh Bộ Lĩnh) nhưng chưa kiểm luật tầng (chưa có luật tầng).
9. `towerFloor`: luôn 3 địch (boss: thủ lĩnh + 2 phụ); chưa có `rules`.
10. `TowerScreen.tsx`: dùng `towerTeam(profile, shown)` và `newTowerRun(profile, 0)` để xem trước.
11. Battle 3v3, không đổi tướng trong trận: `startMatch` đã phù hợp.

## 4. Điểm chạm thưởng hiện hữu

| Nguồn | Vị trí | Hiện trạng / xung đột |
|---|---|---|
| Vàng boss tầng | `applyTowerResult`: `TOWER_BOSS_GOLD(40) × floor` khi `newBest && isBossFloor` | Vi phạm "không vàng từ Tower V1.0"; UI hiển thị ở `DemoGame.tsx` (`bonusGold`) |
| Thưởng giữa tầng | `towerOffer`/`towerPick`: heal / food / boon | Destiny giữ làm lựa chọn trong run; Trial reset mỗi lần |
| Thưởng trận chung | settle: `applyRewards` (EXP/vàng) + `rollDrop`/`receiveDrop` chạy cả với `match.tower` | Trận tower hiện còn nhận EXP/vàng/trang bị thường → cần tắt cho Trial/Destiny |
| Quest | `recordMatch` stat `tower`; `w.tower10` = 300 vàng | Cần quyết định giữ hay ánh xạ |
| Thành tựu | `a.tower10`, `a.tower25` đọc `p.tower.best` | Phải giữ `tower.best` |
| BXH | `leaderboard.ts` board `tower` = `tower.best`, `submitProfile` sau mỗi settle | Phải giữ; board mới cần thêm vào allow-list |

Helper tuần/ngày giờ Việt Nam (tuần bắt đầu thứ Hai) đã có trong `quests.ts` (xem test "ngày và tuần theo giờ Việt Nam") — có thể tái sử dụng cho chu kỳ Destiny và sweep ngày.

## 5. Nguy cơ run cũ / migration

- `Profile.version` luôn 1, không có migration hồ sơ; thay đổi dùng parse mềm. Trường mới = optional + default trong `parse*`; không cần SQL migration cho JSON hồ sơ (`drizzle/` hiện 0000–0007; bảng riêng mới sẽ cần migration).
- Run cũ `active: true` hoặc `offer` chưa chọn có thể đang ở DB; `MatchRecord` tower cũ có thể settle sau deploy → `applyTowerResult` phải vẫn tương thích, nếu không run kẹt (`towerQuit` bị chặn bởi `towerBusy`).
- Đổi shape `team/hp` mà không có nhánh đọc cũ sẽ xóa run người chơi (parse trả `null`).
- Đổi nghĩa `tower.best` (ví dụ trần 20 tầng) làm lệch BXH và `a.tower25` → giữ nguyên `tower.best`/`tower.run`, thêm state mới song song.
- Không xóa/di chuyển `core/sim/tower.ts` vì Survival import `simProfile`.
- Next.js 16 có breaking changes: đọc docs trong `node_modules` trước khi thêm route.

## 6. Baseline (chạy thật 23/10/2026)

| Lệnh | Kết quả |
|---|---|
| `pnpm typecheck` | PASS, không lỗi |
| `pnpm test` | PASS: 415 tests, 90 suites, 0 fail, 0 skip, ~15.8 s |
| `pnpm sim --tower --level 10 --battles 50` | Trung bình 12.6 tầng; p10 7; trung vị 14; p90 19; qua T5 94%, T10 68%, T15 26%, T20 6% (AI Normal, đội khởi đầu) |
| `pnpm lint`, `pnpm build` | Không chạy (build chạy migrate DB; ngoài phạm vi audit chỉ-docs) |

Chỉ ~6% lượt leo qua tầng 20 → 20 tầng cố định của Trial cần cân bằng lại, không dùng nguyên `towerPower`.

## 7. Kết luận cho task sau

- Giữ `tower.best`, `tower.run`, BXH `tower`, `a.tower10/25`; Song Tháp thêm state mới song song.
- Cần mới: `stones` ở tài khoản (số nguyên ≥ 0), luật tầng, roster khóa + HP theo id, chu kỳ tuần VN, sweep theo ngày VN, tắt vàng/EXP/drop cho trận Trial/Destiny.
- Test hiện có phủ floor/offer/result/parse, battle server, BXH, quest. Chưa thấy test idempotency chống double-settle riêng cho tower.

Status: PASS (audit).
