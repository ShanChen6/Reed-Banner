# Đinh Ngọc — Vạn Tượng Hành Giả

> Cập nhật: 30/10/2026
> Trạng thái: **DRAFT** — đã thống nhất hướng một nhân vật dung hợp tám nghề/bảy hệ qua sáu chủ động và bốn nội tại; tên Đinh Ngọc, nữ khoảng 25 tuổi đã chốt; ngoại hình chi tiết, chiêu thức, thông số và cách mở khóa dưới đây là đề xuất hoàn chỉnh để review. Chưa có code, ảnh Master hoặc kết quả mô phỏng.

## Hồ sơ và vị trí trong Reed Banner

| Mục | Đặc tả đề xuất |
|---|---|
| Tên | Đinh Ngọc — tên người dùng chốt; nhân vật hư cấu lấy cảm hứng ảnh tham chiếu |
| Danh xưng | Vạn Tượng Hành Giả |
| Mã thiết kế tạm | `RB-SP-001`; runtime ID đề xuất `dinhNgoc`, chưa đăng ký vào roster/save |
| Phân loại | Nhân vật hư cấu đặc biệt, nữ khoảng 25 tuổi; không phải nhân vật lịch sử hoặc nghề thứ chín |
| Vai trò | Đấu sĩ thuật pháp linh hoạt: công kích, tự bảo vệ, tận dụng sơ hở và phối hợp |
| Vị trí đội hình | Đề xuất là đồng hành tùy chọn trong3v3; không chiếm quyền nhân vật chính Đinh Bộ Lĩnh, không thêm slot đội |
| Nghề trong lore | Có nền tảng cả tám nghề, thể hiện qua các kỹ năng cụ thể; không mặc định hưởng tám nội tại nghề |
| Hệ phòng thủ | Kim cố định trong bản đầu; không bảy kháng hệ hoặc tự miễn khắc chế |
| Cách tiếp cận | Một loadout cố định6+4 cho bản đầu; chưa có menu ghép56 tổ hợp nghề/hệ, chưa đổi nghề/hệ giữa trận |

Nguồn chính của nhân vật nằm tại file này. [Thiết kế hình ảnh và sáu prompt](../06-art/prompts/dinh-ngoc.md) là nguồn art. [Kỹ năng chung đang chạy](ky-nang/README.md) và [hai nghề mở rộng](../06-art/prompts/v4-2/08-new-professions-14-skill-kits.md) không bị thay bởi nhân vật này. Mã SP tách khỏi chuỗi RB-001… để không tự chiếm ID chưa được đăng ký; chốt ID chính thức trong task triển khai sau.

## Nhân cách và tiểu sử hư cấu

Đinh Ngọc đi qua những xóm ven sông và đường núi, học cách giữ lương của người lính, chăm người bị thương, đọc thế trận và tự bảo vệ trên đường. Nàng không học tám nghề để đứng trên mọi người: mỗi nghề giải một tình huống mà những chuyến đi buộc nàng đối diện.

Tính cách ấm áp, nhanh trí, hơi tinh nghịch khi nghỉ; vào trận tập trung, gọn và biết giữ sức. Điểm yếu là nhận quá nhiều trách nhiệm, đôi lúc cố tự xử lý thay vì nhờ đồng đội. Kỷ vật là mặt ngọc giọt nước; nó dẫn lực trong minh họa, không tự tạo thêm tài nguyên hoặc món trang bị thứ mười.

Ba câu thoại đề xuất: “Mỗi người một sở trường. Để ta nối chúng lại.” / “Giữ vững đã, rồi hãy tiến.” / “Đường còn dài, đừng quên nghỉ một chút.” Không gắn tiểu sử này với đời thật của người trong ảnh tham chiếu.

## Tám nghề và bảy hệ được thể hiện thế nào

| Nghề | Kênh thể hiện chính | Hệ | Dấu ấn gameplay |
|---|---|---|---|
| Tướng sĩ | Chủ động ô1 | Kim | Công kích chắc, xuyên một phần DEF |
| Xạ thủ | Chủ động ô2 | Thủy | Công kích bằng vật dẫn/nội lực, làm suy yếu ATK |
| Sát thủ | Chủ động ô3 | Hỏa | Tận dụng HP thấp để tăng damage một hit |
| Pháp sư | Chủ động ô4/5/6 | Dung hợp; Thổ/Lôi | Điều phối thuật lực, phòng hộ và tác động bàn cờ |
| Binh lính | Nội tại P1 | Thổ | Trụ vững sau khi Khiên bị phá |
| Y sư | Nội tại P2 | Mộc | Tự hồi phục có giới hạn khi thấp máu |
| Mưu sĩ | Nội tại P3 | Lôi | Tước một lượng năng lượng nhỏ sau sát thương thật |
| Quân sư | Nội tại P4 | Phong | Mở một cơ hội phối hợp có mục tiêu |

Bảy hệ đủ trong toàn bộ bộ năng lực, không cần bảy màu trên áo hoặc bảy buff đồng thời. Chỉ Pháp sư/Tướng sĩ/Xạ thủ/Sát thủ xuất hiện chủ yếu ở chủ động; các nghề còn lại đã đủ nhận diện qua nội tại, không ép thêm đòn dùng cờ, hồ lô hoặc tám vũ khí. Không cộng lương Binh lính, vàng Mưu sĩ, XP Quân sư, tim Y sư hoặc bonus kiếm Tướng sĩ ngoài bốn nội tại quy định ở đây.

## Chỉ số nền và tiến trình

| Chỉ số cấp1, chưa gear | Giá trị |
|---|---:|
| HP | 500 |
| ATK | 50 |
| DEF | 10 |
| Năng lượng | Theo luật chung, tối đa100 |
| Tốc độ/né/crit riêng | Không thêm |

ATK thấp hơn Tướng sĩ nền55 và Sát thủ đề xuất58, đổi lấy sáu công cụ đa dụng; HP/DEF không vượt mặt bằng tank. Không có độ hiếm hoặc cộng chỉ số vì “đặc biệt”. Tăng trưởng cùng hệ hiện hành: `round(base×(1+0.03×(L−1)))`, L1–30, trước gear và hệ số HP chế độ.

| Cấp nhân vật | HP | ATK | DEF |
|---|---:|---:|---:|
| 1 | 500 | 50 | 10 |
| 10 | 635 | 64 | 13 |
| 20 | 785 | 78 | 16 |
| 30 | 935 | 94 | 19 |

Chủ động mở theo ô1/2 ở cấp1, ô3 ở5, ô4 ở10, ô5 ở15, ô6 ở20. Bốn nội tại có sẵn khi nhân vật được mở khóa; không chiếm điểm chủ động. Cấp chiêu1–5 tách cấp nhân vật; damage/hồi/Khiên/buff-debuff tăng10% mỗi cấp trên1, cost cấp5 `floor(cost×0.9/5)×5`; thời lượng, pierce, execute, energy, số hit/ô và xác suất giữ nguyên. Nội tại không tăng theo cấp chiêu, chỉ dùng ATK/HP đã tăng trưởng của nguồn/người nhận.

## Sáu kỹ năng chủ động

Mọi cost là năng lượng, không phải Nộ. Chỉ người hành động dùng tối đa một chủ động/lượt theo luật chung; tuyệt chiêu không tự có lượt riêng. Tất cả là thông số khởi đầu, chưa qua mô phỏng.

| Ô / mở cấp | Tên / ID | Nghề / hệ đòn | Target | NL cấp1 /5 | Damage cấp1 | Hiệu ứng | Cấp5 |
|---|---|---|---|---|---|---|---|
| 1 / 1 | Kim Quang Phá Trận / `dn_kimQuangPhaTran` | Tướng sĩ / Kim | enemy | 30 / 25 | 1.8× ATK | Một hit; xuyên 20% DEF; không thêm dấu ấn hoặc phá ô. | 2.52× ATK; xuyên vẫn20% |
| 2 / 1 | Thủy Ảnh Xuyên Lưu / `dn_thuyAnhXuyenLuu` | Xạ thủ / Thủy | enemy | 35 / 30 | 1.55× ATK | Một hit bằng vật dẫn/nội lực; sau damage áp ATK -10% trong1 lượt, không trừ năng lượng. | 2.17× ATK; ATK -14%, vẫn1 lượt |
| 3 / 5 | Hỏa Bộ Đoạt Mệnh / `dn_hoaBoDoatMenh` | Sát thủ / Hỏa | enemy | 45 / 40 | 2.1× ATK | Một hit; nếu HP mục tiêu ngay trước hit ≤35% HP tối đa thì nhân hệ số hit ×1.25. Không tự giết, không xuyên Khiên. | 2.94× ATK; khi execute3.675×; ngưỡng35% và multiplier1.25 không tăng |
| 4 / 10 | Vạn Tượng Quy Nhất / `dn_vanTuongQuyNhat` | Pháp sư / Kim | enemy | 90 / 80 | 2.3× ATK | Một hit → cleanse bản thân → Khiên self bằng8% HP tối đa trong2 lượt thường phe mình. Hiệu ứng bảy hệ là diễn xuất; không bảy hit, không bảy debuff, không hồi HP trực tiếp. | 3.22× ATK; Khiên self11.2% HP tối đa, vẫn2 lượt |
| 5 / 15 | Thổ Ấn Trấn Tâm / `dn_thoAnTranTam` | Pháp sư / Thổ | self | 40 / 35 | — | Khiên self12% HP tối đa và DEF +10% trong2 lượt thường phe mình; không gây damage, không cộng thêm nguồn Khiên thứ hai. | Khiên16.8% HP tối đa; DEF +14%; vẫn2 lượt |
| 6 / 20 | Lôi Văn Khai Lộ / `dn_loiVanKhaiLo` | Pháp sư / Lôi | allEnemies | 55 / 45 | 0.7× ATK | Một hit0.70× ATK trên mỗi địch còn sống; sau damage phá ngẫu nhiên3 ô một lần/action. Không câm lặng, không trừ năng lượng trong chính chiêu. | 0.98× ATK mỗi địch; vẫn3 ô một lần |

### Thứ tự và nguyên tố sát thương

- Mỗi damage step dùng **hệ gắn với chiêu**, không ngầm dùng cả bảy hệ hoặc luôn dùng Kim: ô1/4 Kim, ô2 Thủy, ô3 Hỏa, ô6 Lôi. Từng hit chỉ tính một quan hệ nguyên tố. Ô5 không gây damage.
- Phòng thủ của Đinh Ngọc luôn Kim; thi triển chiêu Thủy/Hỏa/Lôi không đổi hệ phòng thủ, không đổi hệ của đòn bàn cờ. Đòn kiếm bàn cờ vẫn Kim, dùng luật chung, không thêm nội tại Tướng sĩ tự động.
- Đây là **yêu cầu mở rộng** per-skill damageElement: source hiện mặc định hệ theo fighter. Phải thêm contract metadata và cập nhật battle/AI/log/tooltip khi triển khai; chưa thể chỉ thêm SkillDef rồi báo đã chạy đúng.
- Ô3 xét HP ngay trước hit, threshold35% và multiplier1.25 không tăng theo cấp; damage qua Khiên và DEF như thường. Không thêm trảm sát tức chết.
- Ô4 damage enemy trước, rồi cleanse self và shield self nếu action/trận còn cho phép; không truyền target enemy vào các bước self. Bảy sắc VFX chỉ biểu tượng hợp lực của cả bộ, không làm bảy lần sát thương. Không vừa Khiên vừa hồi HP không ghi trong bảng.
- Ô5 chọn self, Khiên12% và DEF+10% là hai effect cùng action; Khiên cùng kind lấy mạnh hơn, không cộng với Khiên ô4 thành20% tự động. Mỗi Khiên mới nhân F người nhận một lần.
- Ô6 damage mọi enemy còn sống, rồi destroy random3 đúng một lần/action; không phá3×số địch. Cascade/extra turn theo luật bàn cờ, không thêm lượt vì tên Lôi.
- Năng lượng/tài nguyên từ bàn cờ theo luật kỹ năng hiện hành. Không có tài nguyên “Vạn tượng”, điểm đổi hệ hoặc thanh nội lực thứ hai.

## Bốn nội tại dung hợp

Đây là **ngoại lệ loadout có chủ đích**: hai phản ứng sự kiện, một tick cuối lượt và một cơ hội chuẩn bị. Không nhét thành bốn chase ID rồi cộng thêm combo mặc định. Không kế thừa thêm bộ P1/P2 nghề và hai chase hệ ngoài bốn mục này.

| Ô | Nội tại / ID | Nghề + hệ | Điều kiện | Tác dụng | Giới hạn |
|---|---|---|---|---|---|
| P1 | Thổ Mạch Hộ Thân / `dn_thoMachHoThan` | Binh lính + Thổ | Tổng Khiên self từ >0 về0 vì đòn chủ động hoặc đòn bàn cờ hợp lệ của địch | DEF self +15% trong1 lượt thường phe mình | Tối đa một lần/lượt thường địch; không kích vì shield hết hạn, dispel, DoT hoặc tự hủy |
| P2 | Mộc Tức Dưỡng Sinh / `dn_mocTucDuongSinh` | Y sư + Mộc | Cuối lượt thường phe mình, self còn sống và HP ≤40% tối đa ngay trước tick | Hồi self5% HP tối đa, nhân F | Tối đa một tick/lượt thường; tối đa3 tick hữu hiệu/trận; không tick lượt thêm; không hồi sinh |
| P3 | Lôi Ý Đoạt Cơ / `dn_loiYDoatCo` | Mưu sĩ + Lôi | Chủ động của chính Đinh Ngọc gây mất HP thật cho enemy | Đúng enemy đó -6 năng lượng sau toàn bộ steps của action | Một lần/action gốc, kể cả AoE/nhiều hit; không trigger chase/DoT; không tạo cơ hội nếu energy không giảm thật |
| P4 | Phong Lệnh Tiếp Ứng / `dn_phongLenhTiepUng` | Quân sư + Phong | Đồng đội khác gây freeze hoặc silence hữu hiệu lên enemy | Đinh Ngọc nhận một cơ hội +15% damage trực tiếp cho action tấn công tiếp theo vào đúng enemy đó | Một cơ hội đang giữ, không stack; không chase ngay; không áp DoT/hồi/Khiên/energy |

### Các ranh giới chống lặp

1. **P1:** tick cooldown được reset ở đầu lượt thường của phe địch, không reset mỗi hit/extra turn của địch. Cần biết lượng Khiên trước/sau cùng lý do mất. Nếu có nhiều lớp Khiên, chỉ kích khi tổng về0. Buff bắt đầu ngay sau đòn làm vỡ Khiên và hết ở cuối lượt thường kế tiếp của phe mình; áp addEffect cùng kind lấy mạnh hơn. Nếu đã có DEF+20% thì P1 không cộng thành35% hoặc hạ buff cũ.
2. **P2:** kiểm cuối lượt thường sau DoT/hết hiệu ứng/hồi theo pipeline chung; nếu self chết ở bước trước thì không tick. `heal = min(HP thiếu, round(HPmax×0.05×F))`. Chỉ tiêu một trong ba lượt hồi khi HP tăng thật; không tiêu quota khi không có hiệu quả. Hồi từ P2 không mở P1/P3/P4 hoặc các chuỗi đòi healed của chủ động; giống nguồn regen, không phải một cast chữa trị.
3. **P3:** nếu skill đánh AoE, chọn enemy còn sống có mất HP thực cao nhất từ chính action, hòa chọn vị trí trước. Nếu mục tiêu được chọn không có năng lượng hoặc đã chết thì bỏ, không đổi sang người khác. Clamp energy0–100. Ô4/6 không gây ba lần drain; ô5 không có damage nên không kích P3. Mốc tối đa -6/action là trước tương tác debuff khác; không cộng Mưu sĩ nghề mặc định.
4. **P4:** mở từ action đồng đội gốc, không từ chính mình, chase, DOT hoặc “khống chế” không gây được trạng thái. Trước tiêu cơ hội phải cùng target. Hạn theo bộ đếm lượt thường: mở ở t, hết trước đầu t+3; không kéo hạn bằng lượt thêm. Cơ hội mới hợp lệ thay đích/làm mới hạn, không cộng lên30%. Khi dùng một action phù hợp, chỉ buff phần direct damage lên target đó; AoE không buff toàn đội địch. Kỹ năng hỗ trợ không tiêu. Solo không có đồng đội mở P4; không thêm proc bù.
5. Khi nhân vật chết, P1/P3/P4 dừng và cơ hội chờ bị xóa; không có tự hồi sinh. Freeze/silence chặn phản ứng và tiêu cơ hội công kích theo contract hành động hiện hành; P2 là tick sinh lực kiểu regen, vẫn có thể tick khi bị freeze/silence nếu còn sống. Đây là ngoại lệ cần thể hiện rõ ở UI.
6. Một event hợp lệ có thể tác động bên ngoài lên các nhân vật khác theo luật chung, nhưng P1/P2/P3/P4 của Đinh Ngọc không tự mở lại nhau. Giữ guard chung tối đa12 phản ứng/sâu4 cho tương tác với đội; P4 là cơ hội giữ, không chiếm thêm một chase tự động.

### Reset và save

Mỗi trận mới: reset quota hồi về3, cooldown P1 chưa dùng và không có cơ hội P4. Survival reset theo lần beginWave/trận mới tương ứng luật mode hiện hành, không reset theo lượt thêm, đổi focus UI hoặc tải lại tab. Snapshot phải lưu quota/cooldown/cơ hội và provenance để server-authoritative không cho reset bằng reload. Đội không được lắp thêm bản sao Đinh Ngọc nếu luật trùng nhân vật hiện hành không cho phép; thiết kế này không tạo ngoại lệ nhân bản.

## Cách chơi và điểm yếu

- Khi địch nhiều DEF: ô1 để xuyên phần giáp. Khi địch gần ngưỡng35%: cân nhắc ô3. Ô2 dùng để giảm áp lực ATK trong một nhịp; không thay thế mưu sĩ khóa năng lượng chuyên dụng.
- Khi cần sống sót: ô5 trước đợt tấn công; sau Khiên bị phá P1 giúp chịu phần đòn sau. Dưới40% HP có P2 nhưng chỉ ba tick/trận, không thể dựa vào hồi vô hạn.
- Ô4 là một nhịp công/thủ đắt giá, không phải nút giải mọi trạng thái cho cả đội. Ô6 tạo nhịp bàn cờ và áp lực diện, không có sát thương đơn cao.
- Đội có đồng minh gây khống chế tận dụng P4; đội phá giáp giúp các đòn Kim nhưng không tự kích một nội tại thứ năm. Không có đồng đội thì mất lợi ích P4.
- Điểm yếu: ATK nền50, thiếu chữa trị đồng minh, không tự do đổi chiêu, không né/tàng hình/miễn khống chế, không xuyên Khiên, chịu khắc chế hệ Kim và chung ngân sách năng lượng. Đa dụng không đồng nghĩa giỏi hơn chuyên gia trong từng việc.

## Ngoại hình và sản xuất hình ảnh

Lấy cảm hứng đường nét ảnh do chủ dự án cung cấp: mặt trái xoan mềm, má đầy vừa, mắt có nét cười, tóc đen rẽ lệch và nụ cười nhẹ. Nhân vật là nữ hư cấu khoảng 25 tuổi; không chép tiểu sử/danh tính người thật. Không đưa ảnh chân dung gốc vào source công khai.

Trang phục lấy ngôn ngữ mỹ thuật Việt thế kỷ X của dự án: áo giao lĩnh ngà, khoác ngắn chàm, đai nâu đỏ, viền đồng tiết chế, quần tối và quấn chân bằng vải. Đây là thiết kế low fantasy lấy cảm hứng bối cảnh, không tuyên bố phục dựng khảo cổ. Bản chính đề xuất không kính hiện đại; kính chỉ là tùy chọn ngoại trang cần review riêng, chưa thêm vào sáu prompt.

Một kiếm ngắn thẳng và một mặt ngọc giọt nước cố định ở ngực; không mang tám vũ khí, không đổi trang phục/tóc/màu nền theo hệ. Ngọc chỉ là vật dẫn, luôn đeo, không tự xuất hiện thêm trên bàn tay. Màu hệ và tia thuật lực là VFX tách lớp. Tỷ lệ kiếm, mặt ngọc, tay cầm và sáu silhouette theo [nguồn art](../06-art/prompts/dinh-ngoc.md).

## Mở khóa và tích hợp dự kiến

Đề xuất mở qua một nhiệm vụ phụ ngắn về cứu trợ/giữ đường sau giai đoạn làm quen; không bắt quay gacha, không khóa sau nhiệm vụ lịch sử chưa được thiết kế. Nhánh này chỉ là phương án sản phẩm, chưa sửa phần thưởng Campaign hoặc shop. Là đồng hành chiếm một trong hai slot, không thay Đinh Bộ Lĩnh.

Không tự thêm profession “Vạn Tượng” vào ALL_PROFESSIONS. Cần một special character template rõ ràng trước implement: loadout cố định, per-skill damageElement, bốn passive dạng hỗn hợp, chặn tự lắp passive nghề/hệ mặc định. Nếu schema bắt buộc profession, task triển khai phải chốt mapping và bypass intrinsic có kiểm thử; không giả danh Tướng sĩ rồi ngầm nhận bonus kiếm30%.

Dữ liệu mới tối thiểu: identity `dinhNgoc`, template ID `specialHybrid`, defenseElement `kim`, sáu skill ID ở bảng, bốn passive ID, quota P2/cooldown P1/opportunity P4 trong snapshot. Đó là contract đề xuất, không phải API hiện đã có. Duy trì server-authoritative cho damageElement, target, cost và trigger; client không tự gửi hệ tấn công tùy ý.

## Kiểm tra số học và kế hoạch cân bằng

Ví dụ trung tính, không gear/buff/Sĩ khí/quan hệ hệ, ATK100, DEF địch20:

| Kiểm | Kết quả |
|---|---|
| Ô1 cấp1 | round(180×100/116)=155 HP; cost30 |
| Ô1 cấp5 | round(252×100/116)=217 HP; cost25; pierce vẫn20% |
| Ô3 cấp1, đủ execute | round(210×1.25×100/120)=219 HP |
| Ô3 cấp5, đủ execute | round(294×1.25×100/120)=306 HP; cost40 |
| Ô6 cấp1, ba địch sống | mỗi người round(70×100/120)=58 HP; vẫn chỉ phá3 ô tổng |
| P2 HPmax500, F100%, HP180 | hồi25 lên205; một quota đã dùng |
| P2 HPmax500, F20%, HP180 | hồi5 lên185; không hồi25 rồi nhân F lần nữa |
| P2 khi đủ3 tick F100% | tổng tối đa15% HPmax trước giới hạn HP thiếu; không30% hoặc hồi vô hạn |

Đây chỉ là kiểm số học, không phải mô phỏng trận. Trước rollout cần ma trận 1v1/3v3, cấp1/10/20/30, chiêu1/3/5, gear0/đại diện, các phe/hệ đối thủ, F100/20%, có/không đồng đội khống chế. So với đấu sĩ và hỗ trợ chuyên môn; báo tỷ lệ thắng kèm CI95%, thời lượng/censored, nguồn sát thương/hồi/Khiên, P4 cơ hội mở/tiêu/hết hạn và tài nguyên thực. Kiểm riêng freeze/silence, shield hết hạn/dispel, nguồn chết, nhiều hit/AoE, tải snapshot và reset Survival.

> TODO: Review hình Master, mapping special template/slot và cách mở khóa trước implement. Các chi tiết gameplay/ID/chỉ số ở đây là proposal, không coi đã được cân bằng hoặc đã triển khai. Theo dõi tại [câu hỏi mở](../09-roadmap/cau-hoi-mo.md).

## Trận Đồ (Binh Pháp)

Đinh Ngọc là nhân vật đặc biệt nhiều nghề/hệ đầu tiên dự kiến cho [Trận Đồ](../02-game-modes/future/02-binh-phap-gdd.md#111-nhân-vật-đặc-biệt-nhiều-nghềhệ): quân mang đủ 8 nghề và 7 hệ, khớp mọi quân kề nhưng vẫn phải đặt sát một quân. **Chưa bật**: nhân vật chưa duyệt và chưa đăng ký vào roster, nên danh sách đặc biệt của Trận Đồ đang rỗng. Muốn bật chỉ cần thêm một dòng vào `src/core/binh-phap/specials.ts` sau khi được duyệt.

