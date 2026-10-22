# Task3 — Đối chứng cân bằng thông số theo F

> Cập nhật: 22/10/2026

**Giữ một thay đổi:** giá `role_thuThanh`30→35 năng lượng (cấp5:25→30). Giữ lượng Khiên, Khiêu khích, AI và toàn bộ F. Hai thử nghiệm giảm Khiên/hồi đã hoàn tác. Xác nhận trên seed mới cho thấy thời lượng giảm nhẹ; chưa đủ bằng chứng thống kê để khẳng định tỷ lệ cap giảm.

Nhánh `feat/team-skill-combos`, HEAD `9e786f1b93dd658617e78f5e048d25d070b629f3` cộng diff task1–3. Giữ công việc task1/2 chưa commit và các báo cáo/hash cũ. Không merge, push hoặc deploy. Đây là đối chứng thông số dưới AI cố định, không phải kết luận cân bằng toàn bộ người chơi.

## Nguồn và mục tiêu

Đọc AGENTS.md, [baseline task1](../2026-10-22-baseline-f/README.md), [chẩn đoán task2](../2026-10-22-ai-f/README.md), thiết kế02/03/04/06/07/08/10/20/21/22 và kế hoạch chase. Mỗi nhân vật sở hữu vẫn4 bị động +6 chủ động theo định nghĩa22, không dùng khung lịch sử để suy diễn trigger. Nội tại nghề/Nộ vẫn là cơ chế nền riêng.

AI chính cố định `ai-f-task2-b5b468f48b72`, SHA-256 `b5b468f48b72bb8ee2aac61b975e3397a70914ccb76b4812c1f57c6b2935e2d0`. Không đổi policy/trọng số/chọn người, không sửa bug engine/AI trong task3. Thay chi phí là thay đầu vào mà cùng scorer đọc, không phải cải tiến AI. F là luật duy nhất:100 ban đầu, giảm5 từ lượt25, sàn hồi/Khiên20% ở44, ATK/DEF không giảm, theo người nhận và không giảm hồi tố Khiên.

Thiết kế02 đặt mục tiêu3vs3 thường20–30 lượt/phe; solo còn TODO. Dùng mục tiêu theo **lượt** để định hướng, không quy thời gian chạy AI thành phút chơi. Baseline3vs3 trung vị19,5 đã ở gần/phía dưới mục tiêu; vì vậy không tăng ATK toàn bộ hay cắt HP đại trà để kéo đuôi dài. Khác biệt nghề/khắc chế/đầu tư được giữ, không ép mọi nhóm thắng50%.

## Vấn đề có bằng chứng

Task2:23/1.680 cap, riêng48 trận mở rộng bất thường có18 cap. Binh lính focal13/280 cap, trung vị27/P9056; Y sư5 cap. Đây là tín hiệu phòng thủ/sustain, không tự đủ chứng minh một nghề quá mạnh. Ở18 cap mở rộng, Linh dược đóng42.831 HP hồi, Thủ thành37.054 Khiên thực hấp thụ; các nguồn này lớn hơn chase riêng lẻ. Lương/F vẫn đúng, không tăng hồi để bù nhầm luật F.

Bốn bị động có registry/giới hạn/nguồn chuẩn và được đo lại; chưa có bằng chứng để thay trigger, cap12/sâu4 hoặc nerf một chuỗi tướng riêng. Gear có liên hệ với đuôi dài nhưng các strata task2 không phải đối chứng nhân quả riêng về gear, nên không đồng thời đổi phẩm/bộ/HP/DEF để kéo cùng một tỷ lệ thắng.

## Các vòng thông số — từng thay đổi riêng

| Vòng | Giả thuyết | Trước → thử |48 trận chỉnh: cap|Quyết định |
|---|---|---|---|---|
|1a|Khiên tự thân thấp hơn giúp đóng trận mà giữ Khiêu khích|`role_thuThanh`20%→18% HP, giá30 giữ nguyên|18→19|Hoàn tác;6 cap mới/5 cap bỏ, duration delta−1,61 lượt/phe, CI95%−4,00…+0,57|
|1b|Giảm nhẹ hồi trực tiếp thay vì sửa F|`role_linhDuoc`22%→20% HP, giá30 giữ nguyên|18→19|Hoàn tác;5 cap mới/4 cap bỏ, duration delta−0,42, CI−2,44…+1,51|
|2|Giữ giá trị một lần bảo vệ, giảm hiệu suất/cadence spam theo năng lượng|`role_thuThanh` giá30→35, lượng Khiên20% giữ nguyên|18→17|Ứng viên khóa để sàng lọc và xác nhận độc lập; quyết định cuối ở đầu báo cáo|

Không kết hợp1a/1b với vòng2. Các thử nghiệm chỉ override dữ liệu trong tiến trình harness; source production chưa đổi trong thời gian so sánh. `parameters-before.json` giữ registry chủ động,20 phản ứng chase, chỉ số/bộ/cộng hưởng/phẩm;6 cơ hội nghề1 ở `prepared-parameters.json` (before/after giống nhau, sourceSHA khớp task2). `parameter-diff.json` là toàn bộ khác biệt **thực giữ lại**, khác với bảng thử nghiệm.

Giá35 nếu áp dụng dùng luật nâng cũ: cấp1–4 giá35 thay30, cấp5 `floor(35×0,9/5)×5=30` thay25. Khiên vẫn20% HP ở cấp1,28% ở cấp5; tại TT0 vẫn4%/5,6% HP. Hiệu suất raw Khiên/năng lượng giảm14,29% ở cấp1 và16,67% ở cấp5, không phải giảm lượng bảo vệ mỗi cast. Không đổi chiêu NPC legacy `thuThanh`, nguồn/mốc mở/ID/điểm đã đầu tư.

## Mẫu chỉnh, hồi quy rộng và seed xác nhận

- **Chỉnh:**48 trận/24 cặp đảo bên/20 cụm seed, chính là12 cặp bất thường task2 thêm3119/4567. Chạy lại48 baseline và xác nhận trùng từng trường engine/telemetry với task2 trước khi dùng đối chứng (`baseline-replay.json`). Đây là mẫu chọn theo bất thường, không gộp vào tỷ lệ cap ma trận.
- **Hồi quy rộng:**1.680 trận ứng viên, đối chiếu1.680 baseline task2 được phép dùng lại sau kiểm tra source/cấu hình/AI và replay.42 nghề×hệ, hai mode, cấp1/4/5/9/10/14/15/19/20/30, ba mức gear xoay theo strata, đầy61 ID;840 cặp/141 seed thực tế. Mẫu này đã được dùng xem xét ứng viên, **không gọi là xác nhận độc lập**.
- **Xác nhận cuối:**1.680 baseline mới +1.680 ứng viên mới, cùng AI/đội/đồ/điểm/cap, seed bàn cũ+10.000.019.141 seed mới, không giao tập chỉnh/kiểm tra tương tác. Tên case có `:holdout`. `holdout-lock.json` và `round-plan.json` được ghi trước khi xem kết quả; không chọn lại số bằng tập này.

Tiêu chí xác nhận đã khóa: cap và tỷ lệ vượt44 không tăng; trung vị3vs3 không rút quá1 lượt/phe; xem xét bất kỳ dịch tỷ lệ thắng nghề nào vượt15 điểm phần trăm; nếu không qua thì hoàn tác, không tìm số khác trên holdout. Đây là guard bảo thủ cho đợt nhỏ, không phải kiểm định rằng mọi tác động phải bằng0.

Cặp đảo bên giữ seed/đội, thay focal đi trước/sau; cùng seed không bảo đảm cùng RNG diễn biến khi lựa chọn đổi. Bootstrap1.000 lần theo seed bàn thực tế, gom các mode/strata dùng chung seed; không coi840 cặp hay1.680 trận độc lập hoàn toàn. Tập seed mới vẫn dùng cơ cấu đội/cấp cũ: kiểm tra ngoài seed chỉnh, chưa phải holdout mọi đội hình có thể tồn tại.

Cap120 lượt thường tổng, lượt thêm không tiêu thêm cap. Cap là censored, không gộp thua/hòa; duration delta là thời lượng bị chặn ở60 lượt/phe. Trung vị/P90 dùng Kaplan–Meier; `null` là chưa ước lượng được, không thay bằng60. Các tổng F/hồi dư/Khiên FIFO giữ định nghĩa task2. Đóng góp cơ hội nghề1 là gross của hành động tận dụng, không giả làm lợi ích biên phản thực.

## Tương tác nhân vật và trang bị

**Cùng nghề/hệ khác tuyệt chiêu:**24 baseline +24 ứng viên, cấp20, cả1vs1/3vs3, hai hướng, toàn đội hai phe dùng cùng policy gear thông thường. Binh lính–Hỏa: ĐBL/Trương Viêm/Nguyễn Siêu; Y sư–Mộc: ĐBL/Lục Diệp/Trịnh Tú. Cố định đồng đội/địch/seed, chỉ đổi người focal. Các tướng này thực tế dùng cùng bốn bị động nghề/hệ; không sáng tác bị động cá nhân khác nhau. Kết quả16 thắng/8 thua→15/9,0 cap cả hai, trung vị11,5/P9055,5 giữ nguyên; mẫu rất nhỏ, không cân bằng riêng từng tuyệt chiêu từ con số này.

**Phẳng/bộ/cộng hưởng:**96 baseline +96 ứng viên, đủ6 nghề, Kim/cấp30, hai mode/hướng. Cùng9Cam đúng nghề/hệ Cờ Lau, tính bốn phép chiếu cùng đồ: chỉ phẳng; phẳng+bộ; phẳng+cộng hưởng; đầy đủ. Các phép chiếu là công cụ phản thực tính đóng góp, không thêm mode trang bị cho sản phẩm.0 cap trong cả96 mỗi phiên bản; trung vị24,5→24/P9045,5→44, mean duration delta+0,31 (CI−1,50…+2,12). Không gộp quartet như bốn bộ đội độc lập.

**Lựa chọn giữa bộ:**ma trận3×3 bộ hiện có Cờ Lau/Hoa Lư/Đồng Cổ giữa focal/địch, vai trò Binh lính/Y sư/Tướng sĩ, Kim/cấp30, hai mode/hướng,108 trận mỗi phiên bản. Cùng ô/phẩm/hệ/chỉ số món, chỉ đổi nhãn bộ và thưởng đang có. Dữ liệu `sets-*` tách riêng; số cụm seed nhỏ nên không dùng để tuyên bố một bộ thống trị toàn game.

**Công thức:**1.890 hàng stress số học ở cấp30:6 nghề×7 hệ×5 phẩm×3 mốc số món3/6/9×3 bộ. `gear-formulas.json` tách base/flat/percent/các bonus/full. Xác minh chỉ số không giảm khi tăng phẩm với cùng ô/hệ/bộ; cấp trước rồi cộng phẳng, cộng tổng phần trăm một lần, mốc9 cộng thêm6 đúng luật. Không chạy fullCam cấp thấp như cohort tiến trình. Khung9 ô/5 phẩm, vũ khí theo nghề, mốc6/9 và kinh tế rơi/mua/ghép giữ nguyên.

Ví dụ9Cam đồng hệ: cộng phẳng ATK42/HP405/DEF27; Cờ Lau tổng+8%ATK/+6%HP, Hoa Lư+24%DEF/+8%HP, Đồng Cổ+14%ATK, cộng hưởng tùy hệ cộng trong cùng tổng percent. Con số DEF tương đối cao ở nghề DEF thấp không tự là bug; mitigation phi tuyến và khác vai trò. Không có bằng chứng đủ chắc từ các kiểm tra hiện tại để sửa cả bảng đồ; các combo/bộ hiếm ngoài mẫu vẫn cần kiểm chứng khi có câu hỏi cụ thể.

## Đề xuất thiết kế riêng, chưa áp dụng

`utility-upgrade-gaps.json` liệt kê15 chiêu có contract tác dụng/giá **không đổi ở cấp2–4**, chỉ giảm giá cấp5 theo luật đã chốt: Mua chuộc, Ly gián, Cắt quân lương, Phá kế;8 chiêu hệ bàn cờ/tài nguyên; Thủy Độn Ly Gián, Đoản Đao Tuyệt Lương, Phiêu Phong Ly Gián. Đây là hệ quả của quy tắc không tăng duration/năng lượng/lương/số ô, không phải bug engine.

Đề xuất review riêng: hiển thị rõ ích lợi từng mốc và cân nhắc thiết kế nâng cho chiêu thuần tiện ích cùng bất biến điểm/hồ sơ. Chưa thêm cơ chế, chưa tăng năng lượng/số ô/thời lượng, chưa hoàn/di chuyển điểm và chưa sửa `autoProgress` để che khoảng này. Không tăng sức mạnh Đoạt mệnh/Ly gián/Phản kích chỉ vì ít được chọn.

## Kết quả xác nhận và giới hạn

| Chỉ tiêu,1.680 trận mỗi phiên bản | Trước | Sau |
|---|---:|---:|
| Thắng / thua / cap |899 /758 /23|911 /748 /21|
| Trung vị lượt/phe |19|18,5|
| P90 lượt/phe |46,5|46,5|
| Vượt44 lượt/phe |212|211|
| Trung vị3vs3 |20,5|20|
| Cap3vs3 / solo |11 /12|9 /12|

Chênh lệch thời lượng bị chặn:−0,316 lượt/phe, bootstrap CI95%[−0,566;−0,074]. Chênh lệch tỷ lệ cap:−0,119 điểm phần trăm, CI[−0,545;+0,354], còn chứa0. Không diễn giải giảm23→21 là bằng chứng chắc chắn đã giải quyết vòng lặp. Thời lượng từng trận là tổng lượt thường hai phe chia2; lượt thêm vẫn được ghi riêng.

Còn hồi quy nhóm cần theo dõi: cap Mưu sĩ2→4, Y sư5→6; Binh lính13→9. Dịch tỷ lệ thắng nghề lớn nhất9/280=3,21 điểm phần trăm, nằm trong guard đã khóa. Hồi quy rộng cũ có số trận vượt44 tăng186→187, nên không tuyên bố mọi cohort đều cải thiện. Các ma trận bộ/nhân vật nhỏ chỉ cung cấp kiểm tra tương tác, không đủ chứng minh cân bằng toàn bộ.

## Dữ liệu, tái lập và kiểm chứng

Có5.688 lượt chạy chính mới,1.680 baseline sàng lọc dùng lại và4 replay trace riêng; không cộng chúng như mẫu độc lập.48 lượt pilot trong `identity-initial/` bị loại vì metadata gear không nhất quán; không dùng trong kết luận hoặc xác nhận source lịch sử. Cohort identity cuối đã thay thế đầy đủ.

- [Quyết định](decision.json), [toàn bộ khác biệt thông số](parameter-diff.json), [kiểm tra dữ liệu](validation.json), [đối chiếu nguồn lịch sử](source-provenance.json).
- [Kết quả xác nhận](validation-shield35-comparison.json), [phân nhóm](validation-shield35-groups.csv), [chủ động](validation-shield35-after-active.csv), [bị động](validation-shield35-after-passive.csv), [đóng góp](validation-shield35-after-contribution.csv), [năng lượng](energy-accounting.csv). Các file `before` tương ứng giữ đối chứng.
- [Trace và replay](traces/replay-verification.json): chọn minh bạch một cap được bỏ và một cap mới; cả4 replay khớp từng trường với dữ liệu bulk trước áp dụng.

JSONL được nén gzip không mất dữ liệu, manifest/case và snapshot source giữ hash. `source-replay.tar.gz` đóng gói core, harness, dependency lock và snapshot cần cho mô phỏng; không chứa node_modules. HEAD đơn lẻ không đại diện source vì task1–3 chưa commit. `calibration-version.json` và `data-sha256.json` định danh source/dữ liệu cuối.

Từ gốc repo, xem `scripts/task3-audit.ts` để biết cấu trúc CLI; các tham số chính là `--group`, `--variant`, `--shard`, `--shards`, `--out`. Dùng thư mục `--out` mới khi chạy với tool/source hiện tại, vì manifest lịch sử khóa hash phiên bản cũ. Harness phục hồi giá30 cho baseline trong tiến trình, kể cả source hiện tại đã35. Phân tích và kiểm tra dữ liệu đã lưu:

```sh
python3 scripts/analyze-task3.py
python3 scripts/verify-task3.py
```

Kiểm tra cuối:372/372 tests,85 suites; typecheck, lint không cảnh báo và production build đạt. Log trong `checks/`. Build bỏ qua migration do không có DATABASE_URL; chưa xác nhận môi trường DB production hoặc luồng tương tác trình duyệt. Task4 chưa triển khai.
