# Task2 — Chuẩn hóa mô phỏng và chẩn đoán AI theo F

> Cập nhật: 22/10/2026

Tiếp [baseline task1](../2026-10-22-baseline-f/README.md), trên nhánh `feat/team-skill-combos`, HEAD `9e786f1b93dd658617e78f5e048d25d070b629f3` cộng diff task1/task2. F là luật duy nhất được chạy; không đối chứng A, không chỉnh hệ số chiến đấu/trang bị/quân lương. Không merge, push hoặc deploy.

## Phiên bản và dữ liệu tái lập

Nguồn AI sau sửa và toàn bộ nguồn gameplay/harness được đóng bằng SHA-256 trong các `*-manifest.json`; mỗi dòng dữ liệu mang `sourceHash`. `ai-version.json` là điểm bàn giao cho task3. Không dùng HEAD đơn lẻ để tái lập vì các task chưa commit. Các thay đổi task1 có sẵn được giữ nguyên; không cập nhật đè báo cáo/hash baseline task1 bằng nguồn task2.

- `scripts/lib/task2-cases.ts`: phân tầng kịch bản và ba chính sách đồ.
- `scripts/lib/task2-runner.ts`: runner F, mẫu số cơ hội dùng chiêu, nguồn đóng góp, ledger Khiên, trace quyết định và diễn biến HP.
- `scripts/task2-audit.ts`: manifest, cấu hình từng trận, chia shard và checkpoint nối tiếp; từ chối tiếp tục nếu sourceHash đổi.
- `scripts/fixtures/2026-10-22-ai-task2-before.ts` và `2026-10-22-ai-task2-after.ts`: AI trước/sau đóng băng, chỉ sửa đường import; vẫn dùng cùng F và cùng engine/skill/gear của đối chứng.
- `scripts/task2-probe.ts`: snapshot tái hiện bug AI, không sửa state production.
- `scripts/analyze-task2.py`: kiểm tra bảo toàn, phân nhóm, Kaplan–Meier và bootstrap theo cụm seed; không đọc báo cáo A hoặc kết quả combo cũ.

Các file `*-cases.json.gz` chứa danh tính/đội, bộ sáu chủ động đã mở/cấp nâng, bốn bị động, chỉ số dựng trận, seed/đi trước và từng món đồ. Các JSONL chứa dữ liệu từng trận, counters của từng người/từng kỹ năng, lựa chọn cạnh tranh, nguồn đóng góp và chuỗi HP/lương/Khiên. Dữ liệu nén được giải nén để tiếp tục checkpoint, không tái tạo bằng các số tổng hợp.

## Kịch bản và giới hạn lấy mẫu

Ma trận chính có **1.680 trận /840 cặp đảo bên**, phủ6 nghề ×7 hệ ×10 mốc cấp ×2 thể thức ×2 hướng. ĐBL luôn đứng trong phe focal. Tướng kèm/địch chọn từ pool nghề với chỉ số quay theo nghề/hệ/cấp, không lấy vài cặp đầu roster; test xác nhận đủ61 ID nhân vật xuất hiện. Bốn archetype: tấn công, cân bằng, phòng thủ, phá tài nguyên; có phòng thủ đối đầu phòng thủ.

Mốc cấp **1,4,5,9,10,14,15,19,20,30**: bốn bị động sẵn từ1; chủ động mở1/1/5/10/15/20, đủ cả trước/sau mốc và cấp tối đa. `autoProgress(level,null)` phân điểm vào ô thấp cấp nhất theo thứ tự ổn định, giữ ngân sách cấp−1; không cấp max skill miễn phí.

Hai seed cơ sở701/1907 luân phiên theo strata, cộng offset chỉ số để có nhiều seed bàn thực tế. Cặp đảo bên giữ nguyên seed/cấu hình, focal lần lượt đi trước/sau; không coi cùng seed là cùng diễn biến khi quyết định AI đổi. Các kịch bản dùng lại cùng seed thực tế giữa thể thức/strata được gom chung khi bootstrap. Cặp đổi bên và các trận dùng chung roster không phải quan sát độc lập.

Ba mức đồ được xoay cân bằng theo ô ma trận, **không phải full factorial ba mức đồ trên mọi cùng một đội/seed**. Các bảng nhóm đồ có lẫn khác biệt nghề/hệ/cấp/đội; không dùng chênh lệch thô làm ước lượng tác động nhân quả của đồ. Mỗi tổ hợp nghề/hệ có cả ba mức trên các mốc khác nhau. Nhóm mở rộng giữ đúng đồ/đội của case gốc, chỉ thêm seed.

AI normal cho cả hai phe; cap120 lượt thường tổng (tối đa60/phe), lượt thêm nằm trong lượt hiện tại. Trận cap là censored, `won:null`, không gộp thành thua/hòa. Các event khởi đầu lượt121, kể cả expiry cơ hội trước upkeep, không đi vào tổng120 lượt. Không quy lượt thành phút chơi.

Pilot ban đầu72 trận dùng đo chi phí khoảng29,15 giây chạy tuần tự; phần lớn cấp thấp, không coi đây là dự báo chắc chắn cho Phong/cấp30/trận dài. Pilot và sàng lọc dở với telemetry cũ nằm trong `pilot-initial/`, `measurement-initial/`, chỉ dùng chẩn đoán/chi phí, **loại khỏi mẫu chính**. Khi phát hiện thiếu biên nguồn Nộ và expiry sau cap trong telemetry, đã dừng và chạy lại ma trận chính hoàn toàn bằng bộ đo cuối. Không dùng lại các chỉ số bị ảnh hưởng.

## Chính sách trang bị và nguồn kiếm đồ

Giữ9 ô/5 phẩm, vũ khí đúng nghề, chỉ HP/ATK/DEF; dùng nguyên hàm `equip`/`withGear`. Không thêm chỉ số hay thưởng bộ mới.

| Mức | Số món theo mốc | Phẩm | Hệ/bộ |
|---|---|---|---|
|Không đồ|0|—|—|
|Thông thường, preset trung gian|2 trước5;3 trước10;5 trước15;6 trước20;9 từ20|Trắng trước10; Lục10–19; Lam20–30|Xoay hệ/bộ, không ép bộ6/9 hoặc cùng hệ toàn bộ|
|Đầu tư cao|3 trước5;5 trước10;6 trước15;9 từ15|Lục trước10; Lam10–19; Tím20–29; Cam30|Cùng hệ người mặc, bộ Cờ Lau; mốc6/9 hoạt động khi đủ món|

Nguồn thực tế: `rollDrop` normal có55/30/12/3/0% Trắng/Lục/Lam/Tím/Cam; thắng rơi1 món, thua30% rơi tối đaLục. `buyGear` cho chọn đúng ô/hệ/bộ/nghề phẩmLục400 vàng hoặcLam1.200; Tím/Cam dựng được qua ghép3 món cùng tier/ô/hệ/nghề, phí10/20/40/80. Tím từ3 mónLam mua vào tối thiểu3.640 vàng/món, Cam11.000 vàng/món; chínCam một người99.000 vàng. Không cấp Cam hay đủ bộ cuối game cho cấp thấp.

Đây là **các kịch bản ngân sách đầu tư hợp lệ**, không phải mô phỏng tốc độ kiếm đồ hay phân vị tài sản của người chơi. Đặc biệt9Lam từ20 (10.800 vàng/người nếu mua hết) và bộ đầu tư cao đòi hỏi tiền tích lũy/đồ rơi/ghép; không khẳng định người chơi mới đạt đúng cấp sẽ có ngay. Chưa đo số trận farm hoặc xác suất sở hữu bộ đồng hệ; task3 cần giữ nguyên policy này khi đối chứng, và nên bổ sung cohort kinh tế thực nếu cần kết luận về trải nghiệm tài sản phổ biến.

## Đo mười kỹ năng

`active.csv` dùng mẫu số riêng cho từng ID: lượt sống mang chiêu đã mở (`carried`), lần được hành động (`actions`), không Câm lặng/chưa dùng slot (`legal`), đủ năng lượng (`affordable`), còn mục tiêu hợp lệ (`targetable`, trong trận chưa kết thúc luôn có mục tiêu theo target của bộ này), score dương (`useful`), giao của hợp lệ/đủ năng lượng/score dương (`executable`), và `uses`. `usesPerExecutable` là tỷ lệ có điều kiện, không chia số lần dùng cho mọi trận rồi gọi chiêu yếu. `executable` không có nghĩa chiêu đó là lựa chọn tối ưu.

Mỗi decision ghi score/ratio/cost/target của mọi lựa chọn, reason của selector thực, năng lượng trước và tổng chi trước đó. Trace decision trong một trận giới hạn80 mẫu, counters không giới hạn; `rare-decisions.json` chọn theo từng ID/lý do thay vì chỉ các dòng đầu. Score/ratio không phải HP thực của engine.

`passive.csv` ghi lượt sống sở hữu, ứng viên theo **tín hiệu thực phù hợp** của chase, triggered và lý do bỏ (đã dùng, tự mở sai nguồn, bị khóa, đầy HP/năng lượng, Khiên/giáp không tăng, mục tiêu gục), các giới hạn chuỗi, cùng cơ hội nghề1 opened/used/expired/broken/pending. `holderTurns` là số đầu lượt thường còn cơ hội chuẩn bị, không phải % thời gian thực. Phản ứng tức thì không có uptime kéo dài; Khiên đo qua ledger, hiệu ứng giáp/buff đo số áp dụng, không suy ra sát thương biên phản thực.

`contribution.csv` tách `active`, `passive` chase, `prepared` và môi trường/Nộ. Chỉ số damage là HP thực mất; absorbed tách riêng. Hồi là HP thực nhận, F giảm tách khỏi hồi dư; Khiên chỉ tính phần tăng theo luật max, tách phần không cộng dồn. Năng lượng chỉ tính tăng/giảm thực đã clamp; chi phí chủ động ghi riêng trong decision.

Đóng góp `prepared:<id>` là **toàn tác dụng của hành động đã tận dụng cơ hội**, không phải riêng phần tăng20%/25% hay lợi ích nhân quả. Buff/giảm giá/phá giáp chưa được quy thành HP giả. Khiên cấp được quy FIFO cho nguồn khi hấp thụ, hết hạn/xua tan, kẹt khi gục và còn cuối mẫu: `cấp = hấp thụ +hết hạn/xóa +kẹt khi gục +còn`. Refresh không mất phần cũ theo luật max. Không gọi Khiên còn cuối mẫu là lãng phí.

Audit-only `chaseAudit` đánh dấu ứng viên, kết thúc reaction và tín hiệu chạm giới hạn; `sourceAudit` bọc tác dụng Nộ để không gán nhầm cho cast/chase đang xử lý. Test tắt/bật audit cho cùng gameplay/RNG; không dùng audit làm điều kiện kích hoạt. Candidate counters phản ánh thứ tự/giới hạn hiện hành, không phải số lần có thể kích hoạt nếu đổi giới hạn.

## Bug AI và đối chứng

**Bug đã xác nhận, không phải tăng sức mạnh:** scorer phối hợp dùng `own.fighters.some(wounded)` cho mọi bước hồi, kể cả chiêu chỉ hồi bản thân/mục tiêu đã chọn. Ví dụ Thanh Lưu Tẩy Trần: caster đầy HP nhưng cần Thanh tẩy, đồng đội khác bị thương. Engine chỉ Thanh tẩy, không hồi HP và không mở tín hiệu `healed`; AI cũ vẫn cộng điểm cơ hội nghề/chase.

Sửa `comboSetupValue` nhận resolver người nhận thực của từng bước từ `scoreSkillTarget`; chỉ ghi `healed` nếu người thực nhận còn thiếu HP và lượng hồi sau làm tròn/F lớn hơn0. Snapshot đầy đủ ở `ai-bug-repro.json`, test hồi quy ở `tests/core/ai/task2.test.ts`; trường hợp thực sự bị thương vẫn nhận điểm và mở cơ hội. Không sửa trọng số, quota, giá chiêu, cơ chế giữ năng lượng hoặc AI đổi người nhiều lượt.

Đối chứng72 trận mỗi phiên bản (36 cặp đảo bên), cùngF/cấp/đội/đồ/seed/cap; nhóm nghề/hệKim tại cấp15/20/30, hai thể thức. Chỉ nguồn AI chọn chiêu thay đổi; `ai-comparison.json` ghi thay đổi kết quả/telemetry. Độ rộng mẫu này không đủ kết luận AI mạnh hơn toàn bộ roster. Các trận lặp từ ma trận chính không cộng lần nữa vào n độc lập.

Đã rà ngưỡng Đoạt mệnh trước đòn; Ly gián theo năng lượng/người kịp hành động/thời hạn; Khiêu khích/Phản đòn theo solo/đội; hồi dư/Khiên max/buff đã có; F người nhận; thu hoạch chiêu50% kiếm/năng lượng và không thêm lượt; ngang bằng thông tin RNG. Các test sẵn có vẫn đạt. Chưa tìm thấy bug có bằng chứng ở ba chiêu này ngoài lỗi định giá phối hợp nêu trên; không ép dùng hoặc tăng hệ số. Chase scorer vẫn ước lượng nhịp đầu, không phản ánh đầy đủ chuỗi/TTL/chuyển người: giới hạn heuristic, không phải cam kết AI phối hợp tối ưu.

## Kết quả sàng lọc và độ bất định

| Nhóm | Trận | Thắng focal | Thua focal | Hòa | Cap | Trung vị KM lượt/phe | P90 KM |
|---|---:|---:|---:|---:|---:|---:|---:|
|Toàn ma trận|1.680|914|743|0|23|18|45,5|
|1vs1|840|437|389|0|14|15|47,5|
|3vs3|840|477|354|0|9|19,5|42|
|Không đồ|560|321|238|0|1|18|44,5|
|Thông thường|560|289|263|0|8|17,5|44|
|Đầu tư cao|560|304|242|0|14|18|46,5|

Thắng quan sát trước cap54,40%; bootstrap1.000 lần theo141 cụm seed thực tế cho khoảng95% **51,75–57,07%**. Cap1,37%, khoảng95% **0,70–2,11%**. Khoảng này chỉ mô tả thiết kế lấy mẫu hiện tại, không bao hàm toàn bộ sai số mô hình AI/đội/trang bị hoặc tỷ lệ thắng người chơi thật. Bảng nhóm đồ có confounding như nêu trên.

Tỷ lệ có ít nhất một phe vượt25/34/44 lượt: **33,51% /20,95% /11,07%**. Trung vị/P90 dùng thời gian `tổng lượt thường/2` với censored tại60; không gọi cap là kết thúc. Số lượt từng phe nằm riêng trong JSONL; `duration-per-side.csv` cho trung vị18/P9046 của focal và đối thủ, riêng3vs3 là19/42. Bootstrap95% của thời lượng trung bình hai phe: trung vị16,5–19,5; P9043,5–47,5.

Trung bình/trận: HP mất4.784,80; hồi hữu hiệu2.117,64; Khiên tăng991,03; Khiên hấp thụ732,67; hết hạn/xua tan201,60; kẹt khi gục0,31; còn cuối56,45. F giảm hồi416,83 và Khiên90,87; hồi dư686,97; phần Khiên không cộng dồn214,34. Lương trung bình theo lượt62,54;492 lượt phe hết lương, mất HP do hết lương13,29/trận. Các con số tổng hợp không quy thành giá trị sức mạnh chiêu; xem phân nhóm/nguồn trong CSV.

Đủ26 ID bị động xuất hiện trong thống kê sở hữu. Chase:47.072 ứng viên từ tín hiệu thực,20.517 phản ứng, độ sâu tối đa quan sát4; đóng góp HP mất112.233, hồi123.813, Khiên tăng182.995 trong toàn mẫu. Nghề1:1.856 cơ hội mở,653 dùng,81 còn chưa đóng ở cuối mẫu; các trạng thái còn lại expired/broken trong `passive.csv`. Không lấy tỷ lệ kích hoạt cao làm thành công cân bằng.

## Ba chủ động cần điều tra

| Chiêu | Lượt sống mang | Lần được hành động | Đủ năng lượng hợp lệ | Hợp lệ +đủ năng lượng +score dương | Dùng | Dùng/giao cơ hội |
|---|---:|---:|---:|---:|---:|---:|
|Ly gián|14.669|11.369|2.753|2.317|745|32,15%|
|Phản kích|12.638|9.704|1.723|1.720|343|19,94%|
|Đoạt mệnh|7.598|5.341|397|397|23|5,79%|

- **Ly gián:**6.903 lần selector báo thiếu năng lượng;1.928 noValue;1.380 saving. Có sử dụng thật và cạnh tranh với Mua chuộc/chiêu hệ/chiêu riêng. Test xác nhận không định giá mục tiêu không kịp hành động hoặc chưa đủ năng lượng. NoValue không đồng nghĩa skill hỏng.
- **Phản kích:**7.741 lần thiếu năng lượng;1.057 saving;24 noValue. Trong snapshot chẩn đoán có318 lần chosen ở đội và0 solo; snapshot chỉ bao8.698/9.704 quyết định vì cap80 mẫu/trận, không thay cho counters đầy đủ343 lần dùng. Khiên/Phản đòn và Thủ thành/Tường khiên cạnh tranh; không ép dùng bằng quota.
- **Đoạt mệnh:**4.841 lần thiếu năng lượng;358 saving. Trong5.181/5.341 snapshot lưu được,967 lần mục tiêu AI chấm đang≤35%HP **trước đòn**, chỉ95 lần đồng thời đủ năng lượng,22 lần chọn và53 lần saving dù đã vào ngưỡng. Trung vị năng lượng đã chi trước các snapshot là45. Đây là bằng chứng về cạnh tranh/giữ năng lượng trong policy hiện hành, chưa chứng minh tăng hệ số là giải pháp. Counts23 uses là đầy đủ; các tỷ lệ ngưỡng chỉ đúng trong tập snapshot có lưu.

Bug tự hồi: score cũ156,5 →100 đúng giá trị Thanh tẩy trong snapshot tái hiện; không còn cộng56,5 điểm từ đồng đội được hồi giả. Trong đối chứng72 trận mỗi phiên bản,10 case đổi diễn biến/telemetry,0 đổi bên thắng,0 cap cả trước/sau; thắng37/thua35, trung vị16,5 vàP9043,5 giữ nguyên. Không diễn giải thành bằng chứng không có ảnh hưởng hoặc AI đã cân bằng.

## Mở rộng bất thường và trận dài

Chọn trước theo thứ tự **số cap trong cặp →thời lượng →hồi +Khiên hấp thụ**, lấy12 cặp cao nhất từ ma trận chính; ID/rank ở `anomalies.json`. Thêm seed3119 và4567 vào đúng đội/đồ/cấp gốc, giữ hai hướng: **48 trận /24 cặp**. Kết quả16 thắng/14 thua/18 cap; trung vị KM57 lượt/phe, **P90 chưa ước lượng được**. Đây là mẫu chọn có điều kiện theo bất thường, không gộp18 cap này vào tỷ lệ cap toàn ma trận.

Ưu tiên cho task3, xếp theo bằng chứng:

1. **Cấp cao, nhiều sustain/trang bị:** Y sư–Thủy30 solo đầu tư cao và Mưu sĩ–Mộc30 đội phòng thủ đối đầu phòng thủ đều cap cả hai hướng ở seed sàng lọc. Mẫu mở rộng vẫn có18/48 cap: tín hiệu đuôi dài lặp lại ở nhóm chọn, cần so cùng AI/đội/seed trước khi đổi thông số.
2. **Ứng viên vòng phòng thủ:** Binh lính–Phong15 solo đầu tư cao, trong10 biên lượt cuối HP từ358/1.332 thành374/1.332, mất201 HP nhưng hồi217. Đây là cửa sổ gần cân bằng HP, **chưa chứng minh chu kỳ vô hạn**; chưa xét mọi phương án người chơi hoặc độ dài ngoài cap.
3. **Trận cap vẫn tiến triển:** Mưu sĩ–Mộc30 3vs3, cùng cửa sổ cuối HP từ `[202,828,1227] /[254,552,1003]` thành `[34,983,1109] /[0,601,1003]`, có người gục, mất826 HP/hồi490. Y sư–Thủy30 solo cũng mất491/hồi169 ở cửa sổ cuối. Không gộp các trận này vào vòng hồi đứng yên chỉ vì cap.
4. **Chi phí cơ hội Đoạt mệnh:** ít cơ hội đủ năng lượng sau các chiêu đã dùng, và saving vẫn loại nhiều snapshot vào ngưỡng; cần thử heuristic có đối chứng nếu muốn thay đổi, không tăng hệ số để che lựa chọn AI. Task2 không mở rộng thành AI tìm kiếm nhiều lượt.

Hai replay đầy đủ ở `traces/high-healing/` và `traces/long-completed/`, tương ứng case tổng hồi cao nhất và trận dài nhất đã kết thúc. `progress-windows.json` ghi cửa sổ cuối của các case cap. Snapshot trajectory là sau chunk lượt, có thể gồm upkeep đầu lượt kế nếu lượt đó còn trong cap; không dùng state hậu lượt121 để đo tiến triển trong cap. Trường `progress` thô ở dòng cap là state trả về của engine sau chunk, có thể bao gồm upkeep kế tiếp; không dùng trường đó làm HP cuối mẫu. Trace raw giữ toàn bộ event để replay; tổng báo cáo đã lọc phần ngoài cap.

## Kiểm tra, lưu trữ và bàn giao task3

- `pnpm typecheck`, `pnpm lint`: đạt; `pnpm test`: **370/370 test,85 suite**, không fail/skip. Build production đạt; DATABASE_URL không có nên migration được script dự án bỏ qua, không phải kiểm chứng DB production. Không thao tác trình duyệt/animation trong task2.
- Đối soát **từng trận**: Khiên FIFO bảo toàn; tổng đóng góp damage/hồi/Khiên bằng tổng engine; uses bằng số lần selector chọn.72 replay AI-after từ nhóm chẩn đoán và2 trace trùng telemetry/diễn biến ma trận chính. Counters audit không ảnh hưởng gameplay/RNG theo test.
- Cố định AI task3 bằng `ai-version.json` và sourceHash của manifest; giữ F, skill coefficients, gear policy và cap. Dùng đúng cùng cấu hình khi so thông số. Không dùng kết quả lịch sử trước chase hoặc telemetry cũ làm đối chứng.
- Chỉ sửa bug định giá người nhận hồi; không thay trọng số heuristic. Các hạn chế first-hop chase, chưa tối ưu chọn người và snapshot cap80 được giữ rõ; không kết luận cân bằng từ test qua, tỷ lệ thắng gần50% hoặc số lần dùng chiêu.

Tái lập từ gốc repo (Node>=22, pnpm10.28.0; phiên chạy dùng Node25.9.0). Các CLI tsx có thể thay bằng `node --import tsx` như dưới để không cần IPC của CLI. Sandbox có thể cần quyền thực thi tiến trình con git/test/build; không cần kết nối dịch vụ ngoài.

```sh
node --import tsx scripts/task2-probe.ts
node --import tsx scripts/task2-audit.ts --group pilot
node --import tsx scripts/task2-audit.ts --group screen --shard 0 --shards 3
node --import tsx scripts/task2-audit.ts --group screen --shard 1 --shards 3
node --import tsx scripts/task2-audit.ts --group screen --shard 2 --shards 3
node --import tsx scripts/task2-audit.ts --group diagnostic --revision before
node --import tsx scripts/task2-audit.ts --group diagnostic --revision after
python3 scripts/analyze-task2.py
node --import tsx scripts/task2-audit.ts --group expanded --ids docs/reports/2026-10-22-ai-f/expand-pairs.json
python3 scripts/analyze-task2.py
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Muốn chạy mới, thêm `--out /tmp/task2-replay` vào CLI và truyền cùng thư mục cho analyzer (`python3 scripts/analyze-task2.py /tmp/task2-replay`); lệnh expanded dùng file expand-pairs trong thư mục mới. Lệnh trace dùng ID trong `trace-ids.json`, `--trace '<ID>' --out <thư-mục-trace-riêng>` để không ghi đè cấu hình trace khác. Trace không cộng vào n.

Trong báo cáo repo, JSONL được nén gzip; trước khi resume checkpoint, giải nén giữ bản nén bằng `gzip -dk <file.jsonl.gz>`. Giữ nguyên group/revision/shard/shards/ids khi resume. CLI đọc các ID hoàn tất và chỉ chạy phần còn thiếu; manifest chặn tiếp tục khi source đổi. Analyzer tự đọc JSONL hoặc gzip. Không sửa source giữa shard; nếu sửa source, dùng thư mục mới và giữ provenance phần chạy dở riêng. Các hash dữ liệu ở `data-sha256.json` xác nhận file bàn giao.
