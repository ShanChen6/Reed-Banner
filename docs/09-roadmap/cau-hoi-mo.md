# Câu hỏi còn mở

> Cập nhật: 20/10/2026
>
> Mọi TODO trong docs đều có mặt ở đây. Chốt xong mục nào thì sửa file liên quan, đánh dấu ở đây và ghi vào [nhật ký thay đổi](../decisions/changelog.md).

## Gameplay

- [ ] Kiểm tra tốc độ tích nộ bằng mô phỏng. → [Tài nguyên](../01-gameplay/tai-nguyen-cong-thuc.md#3-nộ-và-kỹ-năng-bị-động)
- [ ] Mức lợi thế "sân nhà" của trùm và bảng tỉ lệ ô cho từng màn. → [Bàn cờ](../01-gameplay/ban-co.md#tỉ-lệ-sinh-ô-theo-màn)
- [ ] Thời lượng mục tiêu riêng cho 1vs1 (đã có máu ×2 và Tinh thần). → [Trận đấu](../01-gameplay/tran-dau.md#3-luật-1vs1)
- [ ] Chỉ số gốc theo nghề và theo cấp (sau khi chạy mô phỏng), cân lại máu và sát thương vì đã bỏ luật trụ vững. → [Trận đấu](../01-gameplay/tran-dau.md#4-máu--thời-lượng)


## Nhân vật & kỹ năng

- [ ] Số điểm kỹ năng cần cho mỗi cấp nâng kỹ năng. Đã có điểm xuất phát (1, 1, 2, 2), chờ Shan duyệt. → [Bộ kỹ năng](../03-characters/ky-nang/preset-ai-he-cu.md#11-nâng-cấp)
- [ ] Mô phỏng cân bằng 7 bộ kỹ năng với nhau và với nhân vật kèm. → [Bộ kỹ năng](../03-characters/ky-nang/preset-ai-he-cu.md#9-so-sánh-nhanh)
- [x] Nguyên tố và tuyệt chiêu đặc trưng của 5 nhân vật kèm khởi đầu (Claude đặt 19/10/2026, chờ Shan duyệt). → [Nhân vật](../03-characters/danh-sach-nhan-vat.md#4-tướng-thường)
- [x] Danh sách nhân vật kèm trong cửa hàng (12 người) và giá 1 500/3 000 vàng (Claude đặt 19/10/2026, chờ Shan duyệt). → [Tiến trình](../01-gameplay/tien-trinh-kinh-te.md#3-cửa-hàng)
- [ ] Duyệt 25 tướng thường mới (tên, tuyệt chiêu), giá sứ quân 3 000 vàng và việc bỏ chiêu nghề ở phe người chơi (Claude đặt 20/10/2026). → [Danh sách nhân vật](../03-characters/danh-sach-nhan-vat.md)
- [ ] Kéo các tổ hợp nghề × hệ lệch nhiều (Cao Kiên 58%, Nguyễn Thủ Tiệp 41%, Tạ Thạch 42%): chỉnh nội tại nghề hay dạy AI dùng hiệu ứng suy yếu. → [Danh sách nhân vật](../03-characters/danh-sach-nhan-vat.md#8-cân-bằng-lịch-sử-trước-cải-tổ-22102026)

## Trang bị & kinh tế

- [x] Trang sức có chỉ số phụ hay không: không (Shan chốt 19/10/2026). → [Trang bị](../04-equipment/trang-bi.md#1-chín-ô-trang-bị)
- [x] Thưởng bộ và cộng hưởng nguyên tố ở mốc 6 và 9 món, chốt theo mô phỏng (19/10/2026).
- [ ] Thêm bộ trang bị, có hiệu ứng bộ ngoài chỉ số hay không. → [Trang bị](../04-equipment/trang-bi.md#3-thưởng-bộ--cộng-hưởng-nguyên-tố)
- [x] Phí vàng khi ghép nâng bậc: thấp, 10–80 vàng (19/10/2026). → [Trang bị](../04-equipment/trang-bi.md#5-ghép-nâng-bậc)
- [x] Bảng rơi đồ theo phẩm (19/10/2026).
- [x] Cửa hàng trang bị: tự chọn món phẩm Lục 400 hoặc Lam 1 200 vàng (Claude đặt 19/10/2026, chờ Shan duyệt). → [Trang bị](../04-equipment/trang-bi.md#6-nguồn-trang-bị)
- [ ] Giá trị mỗi ô vàng và ô sách. Đã có điểm xuất phát (3 vàng, 5 kinh nghiệm), chờ Shan duyệt.
- [ ] Đường cong kinh nghiệm, chỉ số theo cấp (+3% mỗi cấp) và cấp tối đa 30. → [Tiến trình](../01-gameplay/tien-trinh-kinh-te.md#11-số-liệu-điểm-xuất-phát-19102026) → [Tiến trình](../01-gameplay/tien-trinh-kinh-te.md#2-vàng)

## Chế độ chơi

- [x] Cấu trúc 6 chương/24 nhiệm vụ, phe phái, Boss Raid và thưởng Campaign V2 → [Design Freeze](../02-game-modes/campaign/design-freeze.md).
- [ ] Nâng cấp trình diễn lời thoại từng câu và atlas theo chương/vùng → [Campaign UI roadmap](../05-ui-ux/campaign/README.md).
- [ ] **TODO — DEFERRED:** âm thanh và giọng đọc nhân vật → [Audio todo](../05-ui-ux/campaign/audio-todo/README.md).
- [ ] Rà soát cân bằng Sinh tồn theo luật đang áp dụng → [Sinh tồn](../02-game-modes/README.md#4-sinh-tồn).

## Giao diện

- [ ] Người vẽ hoặc công cụ AI, ngân sách và thời điểm vẽ chân dung, trang bị; danh sách 12 sứ quân theo thứ tự chiến dịch. → [Hình ảnh](../06-art/art-bible.md#25-định-dạng-giao-hàng)
- [x] Hướng phong cách: lai hai tầng chi tiết, tranh lớn chi tiết và nhân vật trận gọn (Shan chốt 20/10/2026). → [Kế hoạch đồ họa](../06-art/ke-hoach-do-hoa.md#24-hai-tầng-chi-tiết-shan-chốt-20102026)
- [x] Công cụ hoạt ảnh nhân vật: tự viết bằng code PixiJS, không mua Spine (Shan chốt sau bản thử Đ0, 20/10/2026). → [Kế hoạch đồ họa](../06-art/ke-hoach-do-hoa.md#32-đã-chốt-sau-bước-thử-đ0-shan-chốt-20102026)
- [ ] Kiến trúc hiển thị: PixiJS cho nhân vật và hiệu ứng, bàn cờ giữ DOM tới khi đo thấy cần chuyển. → [Kế hoạch đồ họa](../06-art/ke-hoach-do-hoa.md#52-đề-xuất-ba-lớp-chồng-nhau-chờ-chốt)
- [ ] Ngân sách dung lượng và mục tiêu hiệu năng. → [Kế hoạch đồ họa](../06-art/ke-hoach-do-hoa.md#61-ngân-sách-dung-lượng-điểm-xuất-phát)
- [ ] Bảng linh vật 7 hệ và mức xuất hiện của linh vật trong hiệu ứng. → [Kế hoạch đồ họa](../06-art/ke-hoach-do-hoa.md#22-ngôn-ngữ-hình-ảnh-của-7-nguyên-tố)
- [x] Ai tách mảnh và dựng xương: Shan tạo ảnh bằng Copilot và tách lớp bằng live2dlayer, Claude dựng động tác (20/10/2026). → [Kế hoạch đồ họa](../06-art/ke-hoach-do-hoa.md#44-quy-cách-mảnh-cắt-cho-họa-sĩ--công-cụ-ai)
- [ ] Hai font tiêu đề và nội dung có đủ dấu tiếng Việt. → [Kế hoạch đồ họa](../06-art/ke-hoach-do-hoa.md#83-chữ)
- [ ] Chỗ dùng tranh "phong thái" của nhân vật (hiện chỉ hiện ở `/demo/characters`, bản đầu là Kiều Công Hãn ngồi bên rương xem lệnh bài): thẻ hoặc hồ sơ chi tiết tướng, hay cảnh truyện chiến dịch khi sứ quân xuất hiện hoặc quy hàng (Claude ghi 24/10/2026). → `public/art/characters/kieu-cong-han/style.webp`
- [ ] Cho phép đổi phím trong cài đặt; phím tắt Túi đồ và xem chi tiết sát thương. → [Giao diện](../05-ui-ux/screens/battle.md#23-bàn-phím)

## AI

- [ ] Tính cách AI theo nghề và độ ngẫu nhiên từng mức khó. → [AI](../01-gameplay/ai.md#chấm-điểm-theo-độ-khó)

## Kỹ thuật

- [ ] Chốt tên miền (đề xuất `colau.vercel.app`). → [Kiến trúc](../07-architecture/kien-truc.md#3-sơ-đồ)
- [x] Triển khai hai feature flag server-authoritative, mặc định tắt, để bật/tắt Trial và Destiny độc lập; chặn cả write API và entry UI. → [RH-02](../02-game-modes/dual-tower/06-05-feature-flags.md)
- [ ] Chạy Neon staging migration + restore drill và browser smoke mobile/desktop trước public launch Song Tháp. → [Nghiệm thu Song Tháp](../02-game-modes/dual-tower/06-04-final-acceptance.md#gate-bắt-buộc-trước-public-launch)

## Đã chốt ngày 18/10/2026

- [x] Hết giờ xử lý kiểu tính lười, không dùng dịch vụ ngoài; người chơi bỏ đi thì AI đánh tới hết trận.
- [x] Đồng hồ không dừng khi mất mạng.
- [x] Client chỉ chạy trước phần biết chắc của nước đi.
- [x] Cách AI chấm nước đi theo từng mức độ khó.
- [x] Không chặn cày vàng và sách; thua giữ 100%.
- [x] Cấu trúc một lượt (trượt, kỹ năng, đổi ô), đặt lại đồng hồ sau kỹ năng, cách đếm lượt thêm.

- [x] Ô Trống trận, thanh Nộ và 7 kỹ năng bị động kích hoạt bằng nộ.
- [x] Bản yếu (từ chữ L/T) của 7 ô đặc biệt.
- [x] Đồng hồ 30 giây được tắt ở Luyện tập và `/demo`.
- [x] Dấu ấn Lôi (trừ 10 năng lượng / Câm lặng) và Phong (Công −10% / Xua tan).
- [x] Bộ 49 kỹ năng nhân vật chính và toàn bộ tên kỹ năng, gồm "Sinh Sôi Bất Tận" và "Cổ Thụ Trấn Thiên".
- [x] Luật phá ô bằng kỹ năng.
- [x] Chỉ số chính của 9 ô trang bị (3 ô ATK, 3 ô Máu, 3 ô DEF).
- [x] 5 phẩm Trắng, Lục, Lam, Tím, Cam; ghép luôn thành công.
- [x] Thể thức của từng chế độ chơi; thêm Thử thách hằng ngày, Thế cờ, Đấu trường bóng ma.


## Xạ thủ và Sát thủ — 30/10/2026

- Xạ thủ: chốt hướng đổi nghề, giữ Kim/Mộc, Thủy–phi tiêu, Hỏa–phi luân, Thổ–đá ném bằng tay, Lôi–phi châm, Phong–lụa chiến. Bộ tên mới, chiêu và ảnh W02 cần review trước khi triển khai; xem [nguồn thiết kế](../06-art/prompts/v4-2/08-new-professions-14-skill-kits.md).
- Sát thủ đã chốt bộ vũ khí ngày 30/10: dao găm, song đao, lưỡi dao ẩn, Bạo Vũ Lê Hoa Châm, kim châm độc, móng vuốt; Phong dùng sáo âm công. Phân bổ hệ và 42 prompt W02 đã được thiết kế thay bản cũ; chưa có ảnh nghiệm thu hoặc runtime.
- TODO: Review và mô phỏng [bảng thông số hai nghề](../06-art/prompts/v4-2/08-new-professions-14-skill-kits.md): Xạ thủ HP475/ATK55/DEF9, Sát thủ HP450/ATK58/DEF8 ở cấp1 chưa gear; cấp chiêu1–5 và P1–P4 đã có proposal cụ thể. Đây không phải chỉ số đã cân bằng hoặc runtime.
- TODO: Khi triển khai poison, xác minh hook cuối lượt thường (không tick lượt thêm), cap hai nguồn, snapshot ATK, Khiên hấp thụ trước HP, cleanse và provenance. Các hành vi đã được đặc tả trong nguồn chính; việc còn lại là review, code, test và mô phỏng, không để lựa chọn runtime ngầm.
- TODO: Mô phỏng và chốt P1 cơ hội nghề, ánh xạ P4 thay chase hệ thứ hai và thông số Xạ thủ; nghiệm thu sáu ảnh W02 mỗi nhân vật. Chưa báo cáo như tính năng runtime.

## Đinh Ngọc — nhân vật đặc biệt dung hợp

- Đã chốt hướng: nữ khoảng 25 tuổi, tên Đinh Ngọc; tám nghề/bảy hệ phân bổ qua6 chủ động và4 nội tại, có nghề chỉ cần nội tại. Nguồn duy nhất: [thiết kế](../03-characters/dinh-ngoc.md), [art và6 prompt](../06-art/prompts/dinh-ngoc.md).
- TODO: Duyệt ngoại hình Master theo ảnh tham chiếu, trang phục thế kỷ X và bản chính không kính; không suy ra thân phận/tiểu sử người thật. Danh xưng Vạn Tượng Hành Giả và mã RB-SP-001 là đề xuất.
- TODO: Review gameplay/chỉ số, mapping special template không tự nhận nội tại nghề/hệ cũ; per-skill damageElement và hệ phòng thủ Kim cố định; passive cuối lượt, shield-break provenance, quota hồi3 tick/trận, P4 một cơ hội và snapshot/reset mode.
- TODO: Chốt cách mở đồng hành và kiểm chứng bằng mô phỏng trước triển khai; chưa sửa Campaign, roster, code, UI hoặc asset.

## Nhân vật tổng hợp — 31/10/2026

- Đã chốt hướng: hai nghề/hai hệ, phòng thủ và đòn thường theo hệ chính, giá cao, cách nhận đặc biệt, icon tổng hợp. Nguồn duy nhất: [thiết kế](../03-characters/nhan-vat-tong-hop.md).
- Đã chốt: "kiếm sĩ" là Tướng sĩ (gọi nhầm).
- TODO: Chốt cách nhận, mức giá và giới hạn trong đội sau khi thiết kế thêm vài nhân vật tổng hợp; duyệt mô hình chính/phụ và cách hiển thị hệ chính trong trận; mô phỏng cân bằng trước khi triển khai.

## Đinh Bộ Lĩnh — thêm Xạ thủ và Sát thủ — 31/10/2026

- Đã làm: Đinh Bộ Lĩnh dùng được Xạ thủ/Sát thủ, Shan duyệt số liệu 31/10/2026. Nguồn: [thiết kế](../03-characters/dinh-bo-linh-xa-thu-sat-thu.md), [art và prompt](../06-art/prompts/dinh-bo-linh-xa-thu-sat-thu.md).
- Đã đo sơ bộ cân bằng 56 tổ hợp và 14 nhân vật mới (cấp 20, không gear): nằm trong dải hiện có, chưa chỉnh số nào; xem [mục 10](../03-characters/danh-sach-nhan-vat.md#10-cân-bằng-xạ-thủ-và-sát-thủ-31102026).
- TODO: Đo thêm cấp 10/30, có trang bị và cấp chiêu khác nhau trước khi chốt; quyết định có xử lý lệch có từ trước (Binh lính/Pháp sư cao, Mưu sĩ/Quân sư thấp ở 1v1; hệ Kim thấp; Lâm Tùng 67%) hay không.
- TODO: Tạo và duyệt ảnh biến thể vũ khí (cung tre, dao găm) cho rig Đinh Bộ Lĩnh, rồi thêm code chọn biến thể; hiện hiển thị bằng bản kiếm.

## Trận Đồ (Binh Pháp)

- TODO: BP-00 sign-off. Bản chơi thử đang chạy giá trị đề xuất (Hướng dẫn 3×3, Thường 5×5, Khó 6×6, Đại trận cỡ ngẫu nhiên 7–10; có chướng ngại, thanh Bỏ Lệnh 0–3, Quân Lệnh 8%/Thu Hồi 4%, điểm 10/5/50 và thưởng thắng 500 cộng thêm, không xem trước quân kế). Cỡ bàn các bậc do Shan chốt 01/11/2026. Cần Shan chốt hoặc đổi, xem [GDD mục 11](../02-game-modes/future/02-binh-phap-gdd.md#11-bản-triển-khai-đầu-tiên-chơi-thử-offline).
- TODO: Duyệt bảng thưởng và kỳ xếp hạng Trận Đồ đã code (ngày cho Thường/Khó, tuần cho Đại trận; vàng 150/300/1000 cho hạng nhất; không đòi số người thắng tối thiểu), rồi mới bật `FORMATION_RANKED_ENABLED` ở production. Xem [GDD mục 12](../02-game-modes/future/02-binh-phap-gdd.md#12-xếp-hạng-và-thưởng-đã-code-mặc-định-tắt), gồm các hạn chế đã biết (tài khoản khách, giới hạn tốc độ, tab BXH).
- TODO: Agent mô phỏng lookahead và thử người thật để cân lại bậc Thường (greedy ngang random) và độ dài ván lớn (Đại trận phụ thuộc cỡ bàn), xem [QA Binh Pháp](../02-game-modes/future/05-binh-phap-balance-qa.md#kết-quả-mô-phỏng-baseline-01112026).
- TODO: Hoàn tất thiết kế và duyệt hai nhân vật dung hợp của Trận Đồ (Đinh Ngọc, Trần Vũ Phong – Vân Du Tử; đủ 8 nghề, 7 hệ; chỉ ở bậc Khó và Đại trận), đo lại độ khó ở bàn 6×6 của Khó, chốt tỉ lệ (đề xuất 1–2% vì rất mạnh), xem [GDD mục 11.1](../02-game-modes/future/02-binh-phap-gdd.md#111-nhân-vật-dung-hợp-kiểu-đinh-ngọc).
- Đã chốt (Shan, 01/11/2026): cách tính điểm mùa Quần Hùng là tổng điểm nhận được từ trận mình đi đánh, Elo gốc không reset; Trấn Ải là số đợt cao nhất một lượt chơi trong tuần; và **toàn bộ bảng vàng theo hạng** của Trận Đồ, Nhật Lệnh, Tháp Thiên Mệnh, Trấn Ải, Quần Hùng đã duyệt (xem [chế độ chơi mục 6](../02-game-modes/README.md#6-thưởng-vàng-theo-hạng-cuối-kỳ-claude-đặt-01112026-chờ-shan-duyệt)). Việc còn lại trước khi bật Trận Đồ xếp hạng ở production: đặt `FORMATION_RANKED_ENABLED=true` cùng `SESSION_SECRET`.
- TODO: Loại thưởng ngoài vàng (danh hiệu theo kỳ, trang bị, mở tướng) cho mọi chế độ; Shan sẽ bàn chi tiết sau khi các chế độ ổn định.

## Quần Hùng online hai người chơi (phát triển sau)

- TODO: Duyệt luật PvP trực tiếp ([thiết kế DRAFT](../02-game-modes/future/13-quan-hung-pvp-truc-tiep.md)): chuẩn hóa cấp và trang bị hay để nguyên tiến độ; dùng đội 3vs3 đang chọn hay chọn riêng mỗi trận; con số hết giờ, mất kết nối, trận mỗi ngày và số lần đánh lại cùng một người; kênh đẩy (polling, SSE hay dịch vụ ngoài); có giao hữu không tính Elo không; song song hay thay thế đấu trường bóng ma.

## Giao diện Trận Đồ

- TODO: Shan thiết kế ảnh bản đồ cho sa bàn Trận Đồ (yêu cầu ở [giao diện Trận Đồ mục 3](../05-ui-ux/screens/tran-do.md#3-yêu-cầu-ảnh-bản-đồ-cho-họa-sĩ)), chọn một ảnh mỗi bậc hay kho ảnh xoay theo kỳ, kiểu núi chướng ngại, địa danh thật hay hư cấu, và hướng thiết kế màn chế độ và màn chơi chi tiết (mục 5, 6 cùng tài liệu).

