# Baseline task1 — 10 kỹ năng và Tinh thần F

> Cập nhật: 22/10/2026

Bàn giao cho task2. Nguồn thực tế là nhánh `feat/team-skill-combos`, HEAD `9e786f1b93dd658617e78f5e048d25d070b629f3` cộng diff task1 và SHA-256 trong [inventory.json](inventory.json). Chỉ kiểm chứng F theo yêu cầu mới nhất; không chạy đối chứng A, không điều chỉnh hệ số để kéo tỷ lệ thắng. Chưa commit, merge, push hoặc deploy.

## Nguồn và cấu hình

Ban đầu checkout ở `checkpoint/skills-spirit-before-team-combos`, HEAD `32f87aa`, sạch. Sau khi người dùng chỉ nhánh chứa bốn bị động, chuyển sang `feat/team-skill-combos`; bản sửa thử tại checkpoint được lưu `/tmp/reed-task1-checkpoint.patch`, không đưa code checkpoint vào nhánh mới. Đã đọc AGENTS.md và hướng dẫn Next cục bộ trước sửa.

Thứ tự nguồn: [thiết kế22](../../design/22-ky-nang-chase.md) và `chase.ts`/`combos.ts`/`skills.ts` hiện hành; [thiết kế21](../../design/21-combo-dong-doi.md) cho cơ hội chuẩn bị/layout2; thiết kế20/06/12/14 chỉ dùng đúng phần còn hiệu lực. Đã đối chiếu thiết kế02/03/04/05/07/08/09/10, roster, progress/profile/inventory, gear, arena, các báo cáo kỹ năng/AI/Tinh thần/F và bàn giao combo. Dữ liệu trận cũ là lịch sử, không dùng chứng minh cân bằng chase mới.

F đã được nhánh này triển khai trước task1: `DEFAULT_SPIRIT_EXPERIMENT='F'`, decay5 từ lượt25, statFloor1, healFloor0.2. Engine, scorer AI, tooltip và thẻ tướng đọc cùng rules/helper; request tạo trận không nhận tùy chọn thử nghiệm. Task1 xác nhận và cập nhật các test/docs còn giả định cũ.

| Lượt mỗi phe | 24 | 25 | 30 | 35 | 40 | 44+ |
|---|---:|---:|---:|---:|---:|---:|
| Tinh thần |100|95|70|45|20|0|
| Hồi/Khiên mới |100%|96%|76%|56%|36%|20%|
| ATK/DEF do Tinh thần |100%|100%|100%|100%|100%|100%|

Không sửa lương, hệ số chiêu, chỉ số gốc, 9 ô/5 phẩm trang bị, vũ khí theo nghề hoặc mốc bộ/cộng hưởng.

## Bản đồ bốn bị động và sáu chủ động

[Bảng đầy đủ](inventory.md) và [JSON định nghĩa/đầu tư/preset](inventory.json) được sinh từ code bằng `scripts/baseline-skills.ts`: 42 tổ hợp ĐBL +60 đồng hành, 26 định nghĩa bị động dùng chung, 13 màn PvE với kỹ năng thực mang theo cấp màn. Không thiếu định nghĩa bốn bị động sau khi dùng đúng nhánh.

| Nhóm | Chủ động sở hữu | Bốn bị động |
|---|---|---|
| ĐBL, 6 nghề ×7 hệ |3 nghề +2 hệ +tuyệt chiêu `dbl_<nghề>_<hệ>`|1 cơ hội nghề +1 phản ứng nghề +2 phản ứng hệ|
|42 tướng thường|Cùng khung; tuyệt chiêu cá nhân|Cùng cách lắp từ nghề/hệ|
|6 lịch sử, 12 sứ quân sở hữu|Cùng khung; chiêu riêng cá nhân|Cùng cách lắp từ nghề/hệ|
|NPC thủ lĩnh/tùy tướng PvE|Giữ preset legacy thực tế, không giả là sáu ô sở hữu|Builder gắn cùng bốn bị động theo nghề/hệ|

Ô1/2/3/4/5/6 mở cấp1/1/5/10/15/20; ô4 là tuyệt chiêu. Nâng chủ động1–5, giá1/1/2/2; mỗi cấp tăng10% các hệ số được phép, cấp5 giảm10% chi phí làm tròn xuống bội5. Không tăng thời lượng/xuyên giáp/ngưỡng/xác suất/tài nguyên/số ô ngoài định nghĩa. Bốn bị động có từ cấp1, không nâng riêng, không dùng Nộ; nội tại nghề và Nộ thủ lĩnh là cơ chế nền, không đếm thành bị động thứ5/6.

Bị động nghề1: trigger/mục tiêu/payoff tại `COMBO_PASSIVES`; nguồn phải là đồng đội, Hộ vệ yêu cầu chính người hưởng nhận Khiên đồng đội thực sự hấp thụ đòn chủ động. Một cơ hội không stack/refresh; mỗi người tối đa mở một lần/lượt thường, tồn tại qua hai lượt thường tiếp theo (`expiresAt=sideTurns+3`). Câm lặng/Đóng băng chặn mở và dùng; Xua tan/gục/hạ mục tiêu phá cơ hội. Lượt thêm không rút TTL.

Nghề2/hệ1/hệ2: bảng `CHASE_PASSIVES` ghi đầy đủ ID/trigger/effect/value; JSON thêm nguồn, mục tiêu, thời hạn, cộng dồn và giới hạn. Hồi chọn đồng minh sống có tỷ lệ HP thấp nhất, hòa chọn vị trí trước; Khiên cho người nhận tín hiệu hồi; đòn nhắm địch nhận tín hiệu, riêng tín hiệu Khiên chọn địch sống đầu tiên. Chỉ tác dụng thật mới mở tín hiệu; mỗi bị động/người tối đa một lần/hành động gốc, toàn chuỗi12 phản ứng và sâu4. Thứ tự tín hiệu → vị trí tướng → thứ tự ba ID. Phản ứng không dùng điểm hành động/năng lượng/Nộ; không tự tiêu cơ hội chuẩn bị. Solo không giả đồng đội, nhưng phản ứng hệ có thể nhận tín hiệu chính mình.

## Thứ tự công thức thực tế

1. `BASE_STATS[profession]` → `round(base × (1 +0.03 ×(clamp(level,1,30)−1)))` cho HP/ATK/DEF tại `scaleStats`. Nhân vật kèm dùng cùng builder, thay ID/tên/chiêu riêng; không scale lần hai.
2. `profileTeam`: `buildMain`/`buildCompanion` rồi `withGear` đúng một lần. Mỗi món: `round(STAT_BASE ×phẩm ×quan hệ hệ món→người mặc)`. Chọn vũ khí đúng khóa nghề; cộng phẳng từng chỉ số. Tổng phần trăm bộ +cộng hưởng theo mốc6 và9; mốc9 cộng thêm mốc6, không nhân hai hệ số với nhau. Kết quả `round((chỉ số sau cấp +flat) ×(1 +tổng percent))`.
3. `createBattle`: solo nhân HP tối đa2 rồi làm tròn; HP vào trận từ hpRatio, energy0, Tinh thần100. Không nhân thêm đồ/cấp. Bốn bị động được chụp theo cấu hình trận; snapshot trận cũ không tự mọc phản ứng.
4. ATK hiệu dụng = ATK dựng trận ×`max(0,1+atkUp−atkDown)`. DEF hiệu dụng = `max(0,DEF ×(max(0,1+defUp−defDown)+bonus Binh lính−giảm Thủ Nộ Hỏa))`. F nhân1. Các effect cùng loại giữ max giá trị/max thời hạn, không cộng dồn.
5. Sát thương chủ động: hệ số chiêu đã scale ×ngưỡng kết liễu nếu có ×ATK hiệu dụng ×sĩ khí lương ×AoE solo1.5 nếu áp dụng ×Nộ Hỏa ×quan hệ hệ ×`100/(100+max(0,DEF hiệu dụng×(1−pierce)))`, làm tròn. Xuyên giáp chiêu và Nộ Kim gộp `1−(1−a)(1−b)`. Cơ hội damage áp trên lượng đã round rồi round thêm; Khiên hấp thụ trước HP, trừ khi xuyên Khiên.
6. Kiếm dùng ATK hiệu dụng ×số ô/trọng số kiếm ×sĩ khí ×hệ ×cascade ×nội tại nghề ×Nộ ×DEF; thu hoạch từ chiêu giảm kiếm/năng lượng50%, không thêm lượt. DOT/reflect/hết lương giữ đường riêng, không nhân Tinh thần lần nữa. Truy kích damage dùng ATK/DEF/sĩ khí/hệ hiện hành, không tiêu cơ hội damage.
7. Hồi trực tiếp = `round(round(maxHP người nhận ×ratio chiêu) ×cơ hội sustain)` rồi `round(raw ×(0.2+0.8×TT người nhận/100))`, chặn theo HP thiếu. Regen lưu lượng gốc và chịu F mỗi tick; tim dùng HP người nhận và nội tại Y sư; hút máu round từ lượng đòn gây ra rồi chịu F người hút. Chuyển hồi dư Y sư sang Khiên dùng lượng đã chịu F, không giảm lần hai.
8. Khiên mới: xác định raw từ HP người nhận hoặc ATK gốc caster theo `ofMaxHp/ofAtk`, áp sustain nếu là chiêu trực tiếp hữu hiệu, rồi F theo người nhận một lần. Refresh giữ max với Khiên cũ. Truy kích hồi/Khiên dùng HP người nhận và F; không nhận sustain chuẩn bị. ATK gốc được dùng cho effect `ofAtk` đúng hợp đồng dữ liệu, không nhầm ATK hiệu dụng của đòn đánh.

Hồ sơ lưu layout2, nâng theo khóa ô; parser chuyển ô4↔5 của layout cũ đúng một lần và giữ đầu tư. Test mới dựng/lưu/đọc lại hai lần cả42 tổ hợp cấp20 với9 món Cam cùng bộ/hệ và so cấu hình dựng trận; các test sẵn có kiểm tra vũ khí sai nghề, mốc6/9, đổi hệ/nghề và hoàn điểm cổ.

## Bug đã sửa và phân loại

**Bug gameplay, không phải chỉnh cân bằng:** `ComboEngine.signal` trước đây đưa tín hiệu từ chase vào cả hàng đợi phản ứng và hàng đợi cơ hội chuẩn bị. Một hồi từ Cứu viện/Mộc sinh vì thế tự mở Hiệp lực. `shieldGranted` cũng gắn nguồn chủ động cho Khiên từ Mộc hộ, có thể mở Hộ vệ khi bị đánh sau đó. Điều này trái thiết kế22: phản ứng có thể nối chase nhưng không nhân cơ hội chuẩn bị.

Sửa: chỉ đưa tín hiệu trực tiếp vào hàng đợi chuẩn bị và đánh dấu nguồn Khiên từ phản ứng bằng `reaction:true`, không đưa tín hiệu hấp thụ đó vào hàng đợi chuẩn bị. Vẫn giữ nguồn để Khiên phản ứng có thể mở truy kích Thổ chấn khi thực sự đỡ đòn. Giữ tín hiệu chase và primitive hồi/Khiên/sát thương hiện hành. Hai test hồi quy tái hiện đường hồi→Hiệp lực và Khiên phản ứng→Hộ vệ. Hệ số/cap không đổi.

**Test/docs lỗi thời:** các kỳ vọng ATK/DEF70%, hồi bằng TT/100, mất10/lượt và mặc định A không còn đúng. Chuyển sang F, giữ test hữu hiệu/refresh/hồi dư/AI/xuyên giáp. Mốc mở ô4/5 trong docs tiến trình được đồng bộ layout2; tài nguyên ghi F là hiện hành và giữ thiết kế cũ dưới nhãn lịch sử.

**Cải tiến AI:** không thay scorer/trọng số trong task1. AI dùng cùng F cho hồi/Khiên; chase vẫn là ước lượng nhịp đầu, chưa mô phỏng toàn chuỗi/đổi người nhiều lượt. Đây là giới hạn định giá, không lấy số score làm kết quả engine hoặc bằng chứng cân bằng.

## Nhiều ải và trạng thái đặc biệt

Trận thường/chiến dịch/tháp/ngày dựng trận mới nên TT reset100 theo `createBattle`, không mang giảm qua ải. Sinh tồn `beginWave` xóa effect/cơ hội/nguồn Khiên, reset TT100 và đếm lượt; giữ năng lượng/Nộ theo luật sẵn có. Hồi nghỉ giữa đợt và hồi sinh dùng tỷ lệ cố định, không phải hồi chiến đấu chịu F. Không đổi luật này.

Đã kiểm tra hai phe đi trước, lượt thường/lượt thêm, Đóng băng, người gục, thủ lĩnh gục, buff/debuff ATK/DEF, Khiên đội theo từng người nhận, refresh Khiên cũ, trực tiếp/tim/regen/hút máu/hồi dư, giới hạn chuỗi và audit bật/tắt không đổi gameplay/RNG.

## Kiểm tra và tái lập

Kết quả cuối cùng xem `validation.txt` trong thư mục này. Các lệnh thực hiện từ gốc repository:

```sh
node --import tsx scripts/baseline-skills.ts
pnpm typecheck
pnpm lint
pnpm test
pnpm build
# Đếm test chi tiết khi môi trường runner chỉ hiển thị kết quả cấp file:
node --import tsx --test --test-isolation=none "tests/**/*.test.ts"
```

Sandbox ban đầu chặn IPC của CLI tsx và tiến trình con/capture output; đã chạy lại kiểm tra cần thiết với quyền thực thi phù hợp. Không sửa dependencies/lockfile để né lỗi môi trường. Công cụ xuất inventory không chạy mô phỏng cân bằng, không ghi đè dữ liệu audit cũ.

Giới hạn: nguồn Khiên trong snapshot trận đang dở từ trước bản sửa không có marker phản ứng thì giữ cách đọc legacy; không đoán hoặc viết lại lịch sử nguồn giữa trận. Trận mới ghi marker đầy đủ. Chưa thao tác trình duyệt hoặc kiểm tra animation của bản sửa task1; UI dùng helper F sẵn có và không sửa component trong task này. Không xác minh DB production, SMTP/OAuth hoặc triển khai. Dữ liệu cũ357 test và ma trận combo trước chase không đại diện phiên bản hiện tại. Task2 dùng commit +hash +diff task1 này làm baseline mới, không dùng tỷ lệ thắng lịch sử như đối chứng cùng cấu hình.
