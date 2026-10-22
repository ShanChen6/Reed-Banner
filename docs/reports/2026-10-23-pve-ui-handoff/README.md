# Task 4 — PvE, giao diện và bàn giao F

> Cập nhật: 23/10/2026 · nhánh `feat/team-skill-combos` · baseline `9e786f1b93dd658617e78f5e048d25d070b629f3` cộng diff Task 1–4 chưa commit

## Mức sẵn sàng

Luật F, bộ 10 kỹ năng và giá Thủ thành đã qua373/373 test (86 suites), typecheck, lint và build. Task 4 không đổi hệ số PvE hay thông số chiến đấu. Mẫu PvE smoke không phát hiện cap ở chiến dịch/thử thách ngày; cỡ mẫu nhỏ nên chưa đủ để tuyên bố cân bằng hoàn toàn. Phiên này không có công cụ điều khiển trình duyệt, vì vậy chơi thử desktop/mobile và cảm ứng vẫn cần review thủ công trước khi phát hành.

- [Task 1 — baseline F](../2026-10-22-baseline-f/README.md)
- [Task 2 — mô phỏng và AI](../2026-10-22-ai-f/README.md)
- [Task 3 — cân bằng thông số](../2026-10-22-balance-f/README.md)

## Thay đổi được bàn giao

| Nhóm | Trước | Sau | Trạng thái |
|---|---|---|---|
| Luật mặc định | Các nhánh thử nghiệm | F:100; từ lượt phe25 giảm5; lượt44 về0; ATK/DEF100%; hồi/Khiên mới sàn20% | Khóa ở Task 1; lượt thêm không làm giảm, Khiên cũ không giảm hồi tố |
| Phản ứng Khiên | Có thể sai nguồn và mở cơ hội nghề1 | Giữ cờ phản ứng; chase không mở cơ hội đã chuẩn bị | Sửa bug engine |
| AI hồi phục | Điểm setup có thể dựa vào người không thực nhận | Chấm theo người nhận thực tế | Sửa Task 2 rồi đóng băng AI |
| `role_thuThanh.cost` |30 NL; cấp5:25|35 NL; cấp5:30|Thay đổi cân bằng duy nhất Task 3; lượng Khiên/Khiêu khích giữ nguyên |
| Bảng trang bị | Chỉ hiện số thưởng mốc | Hiện cộng phẳng/phần trăm, từng bộ/cộng hưởng và chênh lệch món | Sửa UI Task 4 từ dữ liệu engine |

Hai thử nghiệm giảm Khiên Thủ thành20%→18% và hồi Linh dược22%→20% đã hoàn tác. Không đổi9 ô,5 phẩm, vũ khí theo nghề, mốc6/9, kinh tế, preset PvE hay AI trong Task 4.

## Kiểm chứng chiến dịch

Mỗi màn chạy6 trận ở cấp gợi ý, AI người chơi `normal`, AI địch theo preset màn, luân phiên đi trước, không trang bị (hợp lệ và bảo thủ), giới hạn120 lượt tổng. Hai cohort dùng seed mới: đội tướng lịch sử gần nhất và đội khởi đầu Hà Vân/Mai Thanh.

| Màn | Cấp | Đội lịch sử | Đội khởi đầu | Trung vị lượt/phe lịch sử / khởi đầu |
|---|---:|---:|---:|---:|
| Cờ lau |4|100%|100%|25,5 /25,5|
| Bố Hải |6|83%|67%|12 /7|
| Đằng Châu |6|67%|67%|7 /3,5|
| Bình Kiều |8|83%|67%|31 /28|
| Đường Lâm |9|100%|83%|22 /16|
| Tam Đái |11|83%|67%|24,5 /25|
| Phong Châu |14|67%|50%|22,5 /18|
| Hồi Hồ |14|33%|17%|22 /36,5|
| Siêu Loại |16|67%|67%|14,5 /17,5|
| Tiên Du |16|67%|33%|9,5 /20,5|
| Tế Giang |18|33%|33%|17 /26,5|
| Tây Phù Liệt |21|50%|50%|16,5 /13,5|
| Đỗ Động |24|50%|83%|20,5 /20,5|

Không có trận cap. Phong Châu không nổi lên như chặn tiến trình. Hồi Hồ là tín hiệu khó nhất, nhất là với đội khởi đầu; Tiên Du nhạy với đội hình. Vì mỗi tỷ lệ chỉ có6 trận và hệ Đinh Bộ Lĩnh xoay theo seed, chưa chỉnh preset. Dữ liệu: [đội lịch sử](raw/campaign-heroes.json), [đội khởi đầu](raw/campaign-default.json).

## Tháp, Sinh tồn và thử thách ngày

Kiểm tra chuỗi dùng hồ sơ hợp lệ cấp5/10/20/30, đội khởi đầu, không đồ. Mỗi cấp có một seed mới cho mỗi mode và dừng smoke ở tầng/đợt8; cả8 lượt đều vượt đủ8. Điều này xác nhận luồng nối trận, mang máu/lương và nghỉ giữa đợt; chưa đo điểm gãy đường cong. Test core còn phủ người gục, hồi sinh bằng lương, tự hồi sinh, thưởng tháp, boss tầng/đợt5 và hồ sơ cũ.

Thử thách ngày chạy14 đề seed mới ×2 hướng đi trước=28 trận, cấp10 không đồ, người chơi AI `normal` gặp AI `hard`: thắng8/28 (28,6%),0 cap, trung vị13,5 lượt/phe. Hai hướng cùng đề có tương quan; nhóm nghề/hệ quá nhỏ để xếp hạng. Tỷ lệ thấp phù hợp nhãn khó nhưng cần người thật chơi trước khi chốt mục tiêu. [Tổng hợp](daily-summary.json), [từng trận](raw/daily.jsonl), [chuỗi](sequence-summary.json).

## Kiểm tra giao diện

Contract tự động phủ42 tổ hợp6 nghề ×7 hệ:6 chủ động, một cơ hội nghề và3 phản ứng; nhãn lấy đúng giá và mốc mở. F đối chiếu trực tiếp từ engine:

| Lượt phe | Tinh thần | ATK/DEF | Hồi/Khiên mới |
|---:|---:|---:|---:|
|24|100|100%|100%|
|25|95|100%|96%|
|30|70|100%|76%|
|44|0|100%|20%|

Source có `Esc` để hủy mục tiêu/vùng/xoay; phím1–6; mặc/tháo/bán/ghép; khóa đổi đồ trong trận; vũ khí đúng nghề; Đinh Bộ Lĩnh giữ vũ khí riêng theo nghề. Task 4 bổ sung tên/giá trị từng mốc bộ và cộng hưởng cùng chênh lệch khi thay món. [Contract và source hash](ui-contracts.json).

Chưa kiểm chứng bằng trình duyệt thật: bố cục desktop/mobile, hit target cảm ứng, kéo/vuốt, focus bàn phím, độ dễ đọc tooltip, toàn luồng hồ sơ và trạng thái F sống tại đúng bốn mốc. Production build webpack đạt. HTTP smoke trả200 cho `/`; `/game/practice` trả500 vì môi trường kiểm tra không có `SESSION_SECRET`, health trả503 vì thiếu cấu hình dịch vụ. Đây là giới hạn cấu hình local, và HTTP/build smoke không thay thế chơi thử. [Kết quả HTTP](http-smoke.json).

## Hướng chơi thử

- Tấn công: ưu tiên Tướng sĩ/Pháp sư, tạo cơ hội nghề rồi dùng hành động có tác dụng thực.
- Cân bằng: ghép sát thương, điều khiển và Y sư/Quân sư; xem dòng thưởng bộ/cộng hưởng sau mỗi lần đổi đồ.
- Phòng thủ: Thủ thành vẫn cùng lượng Khiên nhưng tốn35 NL; từ lượt25 theo dõi hệ số hồi/Khiên mới giảm về20%.
- Chiến dịch: thử tướng lịch sử vừa gia nhập khi mắc ở Hồi Hồ/Tiên Du; tăng cấp/đồ hợp lệ trước khi kết luận preset lỗi.
- Chuỗi: giữ lương cho hồi sinh Sinh tồn; trong tháp, máu và người gục được mang sang.

## Tái lập, giới hạn và quyết định còn lại

```sh
node --import tsx scripts/balance.ts --stage all --battles 6 --max-turns 120 --seed 30000019 --team heroes --json
node --import tsx scripts/balance.ts --stage all --battles 6 --max-turns 120 --seed 31000019 --team default --json
node --import tsx scripts/task4-audit.ts
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Trong phiên kiểm tra, `pnpm build` không thể tạo IPC socket của `tsx` trong sandbox và Turbopack không thể bind cổng worker. Build cuối dùng `next build --webpack` với `experimental.useTypeScriptCli=false` chỉ trong lúc chạy để tránh lỗi parser CLI của Next16/Node25; cấu hình đã hoàn nguyên. TypeScript đã được kiểm tra riêng. Migration không chạy và không có thay đổi DB.

AI cố định không đại diện kỹ năng người chơi. Mẫu Task 4 là smoke nhỏ, không ước lượng tỷ lệ thắng quần thể. Cohort không đồ hợp lệ nhưng chưa đại diện đường rơi/mua/ghép. Task 3 vẫn là bằng chứng định lượng chính; CI tỷ lệ cap chứa0.

Đề xuất chưa triển khai vẫn là15 kỹ năng tiện ích không tăng tác dụng cấp2–4 ngoài giảm giá cấp5. Cần người dùng quyết định mục tiêu thắng của thử thách ngày, độ khó mong muốn ở Hồi Hồ, và duyệt trực tiếp desktop/mobile trước phát hành. Không merge, push hoặc deploy.

