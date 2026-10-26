# Kỹ năng phiên bản 2: phối hợp chủ động–bị động đồng đội

> Trạng thái: **SUPERSEDED** — thay bởi [Kỹ năng hiện hành](../README.md). Giữ để truy vết quyết định, không dùng làm luật hiện hành.

> Cập nhật tiếp theo: [chốt F và bộ 6 chủ động + 4 bị động truy kích](../README.md). Các kết quả/luật mặc định bên dưới thuộc phiên bản trước, không phải kiểm chứng chase mới.

Triển khai trên nhánh `feat/team-skill-combos`, kế tiếp [mốc PR #108](https://github.com/ShanChen6/Reed-Banner/pull/108). Mục tiêu là tạo cơ hội để người chơi chọn người hành động, mục tiêu và thời điểm tận dụng, thay vì chờ đối phương tự gục. Các thông số mới là giá trị khởi đầu cần chơi thử, chưa phải kết luận cân bằng.

## Bộ kỹ năng và thứ tự ô

Mỗi nhân vật chơi được có 6 kỹ năng chủ động: 3 nghề, 2 hệ, 1 tuyệt chiêu; thêm một bị động phối hợp. Nội tại nghề và bị động Nộ của thủ lĩnh vẫn riêng, không bị thay thế.

| Ô | Nguồn | Mở cấp |
|---|---|---:|
| 1 | Nghề cơ bản | 1 |
| 2 | Hệ, bàn cờ | 1 |
| 3 | Nghề, vai trò chính | 5 |
| 4 | Tuyệt chiêu nhân vật | 10 |
| 5 | Nghề nâng cao | 15 |
| 6 | Hệ, bổ trợ | 20 |

Đổi số ô 4–5, giữ thứ tự mở và ý nghĩa đầu tư. `SkillDef.ultimate` xác định tuyệt chiêu cho nguồn kỹ năng, viền ảnh và hoạt ảnh; không suy đoán tuyệt chiêu từ số ô. ID kỹ năng không đổi. Hệ số/chi phí gốc của các chiêu đã có được giữ; phần tương tác phối hợp là thay đổi gameplay mới.

`characterSkills()` lắp bộ từ cùng dữ liệu cho ĐBL và 60 nhân vật kèm. [Ma trận 61 nhân vật](../../../reports/2026-10-22-combo/roster-matrix.md) và [catalog JSON](../../../reports/2026-10-22-combo/catalog.json) được sinh từ mã thực, không phải danh sách gắn nhãn bằng tay. ĐBL đổi mẫu nghề khi người chơi đổi nghề. Các nhân vật cùng nghề hiện dùng chung mẫu bị động phối hợp; tuyệt chiêu cá nhân vẫn riêng. Không tuyên bố đã tạo 61 bị động khác nhau.

Tướng AI/preset chiến dịch, tùy tướng, tháp/sinh tồn và đội phòng thủ đều nhận bị động qua các builder. Chưa đổi bộ chủ động legacy của chiến dịch hoặc chỉ số/preset để bù: các bộ này tương tác bằng cùng sự kiện gameplay. Phân biệt rõ bộ kỹ năng legacy của NPC với layout lưu hồ sơ người chơi mới.

## Sáu mẫu bị động khởi đầu

| Mẫu / nghề mặc định | Đồng đội mở điều kiện | Người hưởng tự tận dụng |
|---|---|---|
| Thừa thắng / Tướng sĩ | Áp Thủ− thành công hoặc Xua tan thực sự xóa lợi ích | Đòn kiếm hoặc kỹ năng sát thương tiếp theo vào đúng mục tiêu tăng 20% sát thương |
| Hội tụ / Pháp sư | Áp Đóng băng hoặc Câm lặng thành công | Đòn kiếm hoặc kỹ năng sát thương tiếp theo vào đúng mục tiêu tăng 20% sát thương |
| Hộ vệ phản kích / Binh lính | Khiên do người khác chủ động cấp cho mình hấp thụ đòn kiếm/kỹ năng | Đòn kiếm hoặc kỹ năng sát thương tiếp theo tăng 20% sát thương |
| Tiếp sức / Y sư | Kỹ năng đồng đội gây mất HP thực, không chỉ chạm Khiên | Kỹ năng có hồi/cấp Khiên hữu hiệu tiếp theo tăng 25% raw của các bước hồi/Khiên trực tiếp trước TT người nhận |
| Đoạn tiếp tế / Mưu sĩ | Khống chế hoặc Xua tan thành công | Kỹ năng trừ năng lượng vào đúng mục tiêu trừ thêm 10, tối đa năng lượng hiện có; chỉ thêm một lần trong một cast |
| Hiệp lực / Quân sư | Đồng đội hồi HP thực hoặc Khiên do đồng đội cấp cho người khác đỡ đòn chủ động | Kỹ năng tiếp theo giảm 10 năng lượng, không âm |

Không gắn combo với cặp tên tướng. Một nguồn phá giáp/khống chế/hồi/Khiên có thể phối hợp với nhiều nhân vật. Không phải mọi đội hình hoặc mọi kỹ năng đều mở mọi mẫu; cần chọn vai trò bổ sung nhau. Đặc biệt Hộ vệ cần nguồn Khiên từ đồng đội; tự dựng Khiên không tự mở phản kích.

Trong 1vs1 không có đồng đội để mở cơ hội; bộ chủ động và vai trò độc lập giữ nguyên. Không bù bằng buff solo tự động.

## Hợp đồng gameplay

- Một người giữ tối đa một cơ hội, không refresh hoặc cộng dồn. Mỗi lượt thường riêng của phe, người đó được mở tối đa một cơ hội mới. Có thể tận dụng ngay trong lượt thêm, nhưng lượt thêm không giảm thời hạn hoặc reset giới hạn mở.
- Cơ hội dùng trong phần còn lại của lượt đang có và hai lượt thường kế tiếp của phe người hưởng. Xóa ở đầu lượt thứ ba tiếp theo. Ví dụ mở khi phe đã bắt đầu lượt 1: còn ở lượt 2, 3; hết khi bắt đầu lượt 4.
- Câm lặng/Đóng băng chặn mở và tận dụng; thời hạn vẫn trôi theo lượt thường. Xua tan xóa cơ hội. Người hưởng hoặc mục tiêu đánh dấu gục thì xóa. Nguồn phải còn sống lúc mở; sau khi đã mở, nguồn gục không tự thu hồi cơ hội.
- Điều kiện xét tác dụng thực: hồi đầy máu, không cộng dồn Khiên, khống chế bị miễn nhiễm hoặc hiệu ứng không được cải thiện không mở cơ hội. Áp hiệu ứng mạnh hơn hoặc kéo dài một hiệu ứng ngắn hơn là tác dụng mới.
- Khiên phải do đồng đội cấp, người cấp còn sống khi hấp thụ và đỡ đòn chủ động. Hết lương, DOT, phản đòn và Khiên tự cấp không mở cơ hội này. Các khoản Khiên gia tăng giữ nguồn theo FIFO; refresh không chuyển nguồn khoản cũ.
- Nguồn mở là bước kỹ năng chủ động thực sự gây hiệu ứng. Hồi từ tick regen, thu hoạch tim và hút máu không được gắn nhãn hồi trực tiếp để farm Hiệp lực. Tiếp sức không tăng regen, hồi thu hoạch hoặc hút máu; không làm giảm TT hai lần. Khiên đang có không bị sửa hồi tố.
- Sát thương cường hóa được làm tròn sau sát thương cơ bản. Hiệu ứng kéo dài/reflect/hết lương không nhận hệ số sát thương combo. Với kỹ năng nhiều đòn/AoE, cơ hội dùng cho một cast; mẫu có mục tiêu chỉ tăng sát thương vào mục tiêu đã đánh dấu. Đòn kiếm có thể tận dụng qua một lần đổi ô/chuỗi cascade.
- Kỹ năng đã tận dụng combo không mở tiếp combo khác. Hiệu ứng Nộ/thụ động không được giả làm nguồn chủ động. Hàng đợi được giải quyết sau cast hoặc sau nước đi, theo thứ tự sự kiện/mục tiêu/vị trí đội, không gọi đệ quy qua những cơ hội vừa tạo.
- Đồng đội không tự tung chiêu hay tự gây sát thương khi mở cơ hội. Người chơi vẫn chọn hành động, có thể chuyển mục tiêu hoặc không dùng và chấp nhận hết hạn. Khiêu khích, bảo vệ, khống chế, Xua tan và hạ mục tiêu là cách đối phó có sẵn.

## Dữ liệu, engine, AI và hiển thị

`combos.ts` khai báo điều kiện, payoff, giá trị và helper dùng chung. `combo-engine.ts` xử lý hàng đợi và nguồn Khiên; battle chỉ gửi tín hiệu thực từ các primitive đã thực thi. Không kiểm tra ID tướng để quyết định combo. `audit:false` vẫn chạy đầy đủ gameplay.

`FighterConfig.comboPassive` chọn mẫu; `comboReady`, `comboOpenedAt`, `comboShield` và `BattleState.comboState` là trạng thái JSON thuần. `comboState.version=1`, đếm lượt riêng mỗi phe và sequence hành động. Sang đợt sinh tồn xóa cơ hội/cooldown/nguồn Khiên, reset đếm lượt nhưng giữ sequence không trùng giữa các đợt. Trận đang lưu trước phiên này không được tự gắn thêm bị động giữa trận. Bản chụp phòng thủ Đấu trường cũ được bổ sung mẫu khi dựng một trận mới, không sửa chỉ số/đầu tư của bản chụp.

AI đọc cùng hệ số sát thương/hồi/giá và mục tiêu đã đánh dấu; có giá trị chuẩn bị nhỏ và định giá Xua tan cơ hội đối phương. Không đọc boardRng, không ép quota sử dụng. AI hiện vẫn dùng người hành động theo xoay vòng mặc định, chưa lập kế hoạch đổi người nhiều lượt; người chơi có thể tận dụng cơ hội chủ động hơn bằng chọn người. Giá trị chuẩn bị/Xua tan là ước lượng, không giả làm mô phỏng phản thực đầy đủ.

Lobby, tiến trình, hồ sơ và battle dùng chung mô tả. Trong trận hiển thị người hưởng sẵn sàng, nguồn mở, mục tiêu và thời hạn. Chi phí Hiệp lực hiển thị và kiểm tra bằng cùng helper với core. Cần phân biệt cơ hội mở/đã dùng/hết hạn/bị phá/còn cuối trận; số lần dùng cao chưa chứng minh có lợi ích.

## Chuyển hồ sơ an toàn

Giữ `Profile.version=1` cho schema hiện tại, thêm `skillLayout=2`. Hồ sơ chưa có marker hoặc marker cũ đổi khóa `o4 ↔ o5` cho main và mọi nhân vật kèm, kể cả chỉ có một khóa hoặc ô đang khóa. Giữ nguyên cấp kỹ năng, XP, cấp nhân vật, điểm dư, trang bị và tài nguyên.

Thực hiện sau bước hoàn điểm hồ sơ nghề cổ đã có. Đọc lại hồ sơ layout2 không swap tiếp; không hoàn thêm điểm vì đây là chuyển cùng khoản đầu tư sang đúng kỹ năng. `autoProgress`/`maxProgress` tạo layout mới từ đầu. Không đổi ID kỹ năng, tên chiêu hoặc đường dẫn ảnh để đánh số ô.

Client gửi `skillLayout:2` khi nâng kỹ năng qua API. Request nâng ô4/5 không có marker hoặc marker cũ bị từ chối trước khi trừ điểm; client cache cũ cần tải lại, không âm thầm diễn giải một số ô theo hai nghĩa. Các thao tác local dùng key canonical trực tiếp.

## Thêm tướng hoặc mẫu sau này

1. Thêm record tướng trong roster, nghề/hệ/chỉ số và record tuyệt chiêu canonical vào `CHARACTER_SKILLS` (`slot:4`, `ultimate:true`, `character`, `characterKind`). Không thêm tướng mới vào bảng raw legacy để rồi phải đổi ô lại. `defineCharacterSkills` từ chối trùng người sở hữu hoặc sai ô; `defineSkillRegistry` từ chối trùng ID. Builder tự lắp bộ sáu ô và mốc mở.
2. Có thể dùng mặc định `PROFESSION_COMBO` hoặc truyền `comboPassive` thứ năm cho helper `companion(...)`. `buildCompanion` giữ override đó. Không phải sửa battle/AI/UI cho một tướng dùng primitive đã hỗ trợ.
3. Nếu cần mẫu mới, thêm định nghĩa vào `COMBO_PASSIVES` bằng các trigger/payoff đã có. Loại cơ chế hoàn toàn mới cần bổ sung primitive có kiểu và test; không hứa một DSL thực hiện được mọi cơ chế tương lai.
4. Chạy test toàn roster: ID riêng không trùng/thiếu, sáu ô đúng, nguồn mở và payoff có thể dùng; kiểm tra cả hoạt động độc lập và đội tương khắc. Registry từ chối ID kỹ năng trùng thay vì ghi đè âm thầm.

Xem [báo cáo triển khai và đối chứng](../../../reports/2026-10-22-combo.md). Tinh thần mặc định vẫn A; không sửa quân lương hoặc chỉ số trùm, không tự merge/push/deploy.
