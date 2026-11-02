# Nhật ký thay đổi thiết kế

## 02/11/2026

**Trận Đồ: 5 ảnh bản đồ thật**
- Hoa Lư, Bố Hải Khẩu, Đằng Châu, Bình Kiều, Đường Lâm thay ảnh giữ chỗ (1024², WebP). Còn 25 bản đồ.
- Thêm Hồi Hồ, Phong Châu, Tam Đái (8/30). Còn 22 bản đồ.

**Trận Đồ: tích hợp ô che và 4 icon chướng ngại do Shan tạo**
- Ô che `fog.webp` được duyệt, icon núi/rừng/đầm lầy/thành lũy "tạm được" thay SVG giữ chỗ. Thêm `scripts/cutout-formation-icon.py` để cắt ô caro vẽ sẵn thành nền trong suốt; ghi lưu ý nền phẳng cho lần tạo sau ở [prompt hình ảnh](../06-art/prompts/tran-do-hinh-anh.md).

## 31/10/2026

**Cân bằng sơ bộ Xạ thủ/Sát thủ**
- Mô phỏng AI đấu AI cấp 20: 14 nhân vật mới 50,9% trung bình, Đinh Bộ Lĩnh Xạ thủ/Sát thủ giữa các nghề cũ; không chỉnh số liệu nào. Thêm `scripts/profession-balance.ts`. Kết quả và lệch có từ trước ở [mục 10](../03-characters/danh-sach-nhan-vat.md#10-cân-bằng-xạ-thủ-và-sát-thủ-31102026).

**Đinh Bộ Lĩnh thêm Xạ thủ và Sát thủ — triển khai (Shan duyệt số liệu)**
- Nhân vật chính dùng được 8 nghề (56 tổ hợp), 14 tuyệt chiêu ô 4 mới, hồ sơ cũ `cungThu` khôi phục thành Xạ thủ; thiết kế đổi sang IMPLEMENTED. Shan đồng ý thiết kế lại hình: biến thể cung tre/dao găm có [đặc tả và prompt](../06-art/prompts/dinh-bo-linh-xa-thu-sat-thu.md) (DRAFT, chưa có ảnh/code rig).
- Nguồn [dinh-bo-linh-xa-thu-sat-thu.md](../03-characters/dinh-bo-linh-xa-thu-sat-thu.md): 56 tổ hợp, dùng lại chiêu nghề/chỉ số/bị động của đồng hành, đề xuất 14 tuyệt chiêu ô 4 mới (Vạn tiễn, Tuyệt mệnh × 7 hệ). Chưa sửa code; nhân vật chính vẫn sáu nghề.

**Xạ thủ và Sát thủ vào trận (Shan quyết định)**
- `NEW_PROFESSIONS_ENABLED=true`: 14 đồng hành RB-062..075 có trong roster, shop 1.500 vàng, dùng được trong đội và các mode; Đinh Bộ Lĩnh vẫn sáu nghề cũ. Icon vẽ tay xạ thủ/sát thủ thay SVG tạm. Các khoảng trống nghiệm thu còn lại ghi ở [báo cáo PROF](../reports/professions-2026-10-30/README.md).

**Nhân vật tổng hợp — hướng thiết kế (Shan thống nhất)**
- Nhân vật đặc biệt mang hai nghề/hai hệ: phòng thủ và đòn đánh thường theo hệ chính, giá cao hơn nhiều, nhận bằng cách đặc biệt, dùng icon tổng hợp nghề/hệ.
- Tạo nguồn [nhan-vat-tong-hop.md](../03-characters/nhan-vat-tong-hop.md) (DRAFT) với đề xuất chính/phụ, ví dụ và tác động code; chưa sửa code, roster hay save. Icon `tongHop` cho nghề/hệ và hiển thị tổng hợp của Đinh Ngọc ở trang xem thử đã có.

## 30/10/2026

**Lôi Ảnh — đồng bộ Bạo Vũ Lê Hoa Châm dạng tròn (Shan chốt hình học)**
- Thay hộp chữ nhật W02 bằng hộp tròn dẹt `RB-074-W03`, đồng cũ/sắt sẫm, hai vòng đồng tâm và hoa lê; cập nhật mô tả vũ khí và cả sáu prompt tại nguồn hiện hành.
- Giữ nhân dạng, bảng màu, bao hông phải và toàn bộ chỉ số/kỹ năng; hộp cầm tay phải, khung hạ gục đặt cạnh tay phải, châm/sét tách VFX. Master W03 và năm khung còn lại cần duyệt ảnh; chưa thay asset/runtime.
 — Đinh Ngọc: nhân vật đặc biệt dung hợp tám nghề/bảy hệ

- Người dùng chốt tên Đinh Ngọc, giới tính nữ, khoảng 25 tuổi; lấy cảm hứng đường nét ảnh tham chiếu, trang phục giữ hướng thế kỷ X. Nhân vật hư cấu, không gán tiểu sử/danh tính người thật.
- Thống nhất nghề có thể hiện qua nội tại: Binh lính–Thổ phòng hộ, Y sư–Mộc hồi phục, Mưu sĩ–Lôi tước cơ, Quân sư–Phong phối hợp; bốn nghề còn lại qua chủ động. Thiết kế6+4 cố định, không cộng tám nội tại mặc định.
- Tạo nguồn [Đinh Ngọc](../03-characters/dinh-ngoc.md) và [art/sáu prompt](../06-art/prompts/dinh-ngoc.md). Tên Linh Đan ở trao đổi ban đầu đã bỏ; không tạo file hoặc ID runtime mang tên đó. Mã RB-SP-001, danh xưng, chỉ số500/50/10, chiêu và cách mở là DRAFT cần review/mô phỏng.
- Một kiếm DN-W01, một ngọc DN-A01, hệ phòng thủ Kim cố định; hệ damage theo chiêu là contract mở rộng cần code riêng. Không nhân bảy hit/buff trong tuyệt chiêu, không tự có slot đội thứ tư.
- Chưa tạo ảnh, công bố cân bằng hoặc thay code/roster/save; giữ nguyên nhân vật và prompt khác. Ảnh chân dung gốc không được đưa vào source công khai.

## 30/10/2026 — Hoàn thiện chiêu thức và bảng thông số Xạ thủ/Sát thủ

- Theo lựa chọn của người dùng: chỉ cập nhật docs/bảng thông số, chưa triển khai hoặc mở hai nghề trong trận. Viết lại [nguồn thiết kế](../06-art/prompts/v4-2/08-new-professions-14-skill-kits.md) để mỗi con số có một bảng nguồn, loadout nhân vật chỉ tham chiếu ID.
- Bổ sung chỉ số cấp1 Xạ thủ 475/55/9 và Sát thủ 450/58/8 (HP/ATK/DEF), tăng trưởng cùng runtime +3% mỗi cấp, ví dụ cấp10/20/30; không tạo độ hiếm/chỉ số riêng mạnh hơn cho từng hệ.
- Đủ 6 chiêu nghề, 14 tuyệt chiêu và bảng đối chiếu14 chiêu hệ, cost/hệ số cấp1/5 và công thức cấp2–4. Giữ hệ số chiêu hiện có của proposal, bổ sung recipient, nhiều hit/execute, phá ô một lần, xác suất/thời hạn và cost rõ ràng. Mọi cost là năng lượng, không phải Nộ.
- Hoàn thiện P1 alias tái dùng pursuit/resonance +20% theo mục tiêu, P2/P3/P4, thời hạn và guard. P1 là comboPassive trong bốn ô, không có bốn chase cộng thêm combo thành năm.
- Chốt proposal poison theo cuối lượt thường, không tick lượt thêm, cap hai nguồn, Khiên hấp thụ trước HP và cleanse. Hệ số poison tăng theo cấp chiêu là yêu cầu mới chưa có trong scaleSkill. Không giả làm burn hoặc coi đã hỗ trợ.
- Kiểm tra số học không thay thế mô phỏng; giữ DRAFT, chưa công bố cân bằng. Giữ nguyên toàn bộ prompt, vũ khí, tên/ID và code.

## 30/10/2026 — Tái thiết kế Sát thủ theo bảy loại vũ khí

- Người dùng chốt bỏ nỏ mini; bộ vũ khí gồm dao găm, song đao, lưỡi dao ẩn, Bạo Vũ Lê Hoa Châm, kim châm độc, móng vuốt và sáo âm công cho Phong. Phân bổ đề xuất: Kim dao găm, Mộc kim độc, Thủy lưỡi ẩn, Hỏa song đao, Thổ trảo, Lôi hộp phóng châm, Phong sáo.
- Giữ tên/ID RB-069–075, nhân dạng và bảng màu; dùng Weapon W02. Thay toàn bộ bảy hồ sơ Sát thủ W01, bộ kỹ năng và 42 prompt ngay trong [nguồn thiết kế](../06-art/prompts/v4-2/08-new-professions-14-skill-kits.md) / [nguồn prompt](../06-art/prompts/v4-2/09-14-heroes-character-and-frame-prompts-v4-3.md), không để bản cũ song song. Hai nghề cùng 6 chủ động + 4 bị động; P4 cá nhân thay chase hệ thứ hai.
- Âm công nội lực và các dụng cụ là diễn giải hư cấu mỹ thuật. Poison là contract đề xuất cần xác minh hook/tick/Khiên/giải debuff; không coi là status đã code. Phân bổ, hệ số, tên chiêu và bộ ảnh mới vẫn DRAFT cần review/mô phỏng.
- Giữ nguyên bảy hồ sơ và prompt Xạ thủ, kể cả Kim/Mộc đã làm, phi hoàng thạch và khung tung hứng Trấn Sơn Thạch. Không sửa code hoặc asset trong đợt này.

## 30/10/2026 — Trấn Sơn Thạch tung hứng phi hoàng thạch ở khung cá nhân

- Khung 6 đổi từ ngồi xem đá sang đứng thả lỏng, hơi nhếch cười, mắt nhìn một viên phi hoàng thạch vừa tung thấp phía trên tay phải mở ngang eo; tay trái chống hông. Đây là tung bắt vui, không phải đòn chiến đấu hoặc phép nâng đá.
- Chỉ một viên xuất hiện, tay phải trống dưới viên đang bay. Sửa ngoại lệ khung 6 trong ghi chú hình học để không mâu thuẫn với quy tắc cầm vật. Giữ năm khung còn lại, Weapon DNA, nhân dạng, phụ kiện và gameplay.

## 30/10/2026 — Đồng bộ phi hoàng thạch cho Trấn Sơn Thạch

- Thay mô tả đá cuội tròn/cỡ lòng bàn tay của RB-066 bằng phi hoàng thạch nhỏ, thuôn dẹt, hai đầu vát nhọn, sống giữa rõ, các mặt vát vàng đất mờ. Giữ Weapon ID `RB-066-W02` và đồng bộ cả sáu prompt cùng hồ sơ thiết kế.
- Cầm phần giữa bằng ngón cái và ngón trỏ/giữa tay phải; khung hạ gục buông vật cạnh bàn tay mở, tránh mâu thuẫn với mô tả chung. Thẻ đá bên hông là phụ kiện riêng. Không đổi pose, nhân dạng, trang phục, nền hoặc gameplay; không sửa nhân vật khác.

## 30/10/2026 — Nghề Xạ thủ thay Cung thủ; Sát thủ chờ trao đổi

- Chốt hướng Xạ thủ đa vũ khí, giữ RB ID. Kim/Mộc bảo toàn ảnh; Thủy phi tiêu, Hỏa phi luân, Thổ đá ném tay (không lao/ná), Lôi phi châm, Phong lụa chiến. Năm người thay W01 bằng W02; tên đề xuất bỏ ngữ nghĩa cung/nỏ không phù hợp.
- Viết lại nguồn [thiết kế](../06-art/prompts/v4-2/08-new-professions-14-skill-kits.md) và [prompt](../06-art/prompts/v4-2/09-14-heroes-character-and-frame-prompts-v4-3.md). Bộ thiết kế mới DRAFT để review; hướng vũ khí đã được người dùng chốt, chưa có mô phỏng/ảnh nghiệm thu hoặc thay đổi runtime.
- Theo yêu cầu rõ ràng của người dùng, xóa file prompt 04 cũ và QA Cung thủ V4.5, thay nội dung năm Cung thủ lỗi thời trong nguồn 08/09; không chép bản cũ sang archive. Git giữ lịch sử. Đây là ngoại lệ có chỉ đạo đối với quy định giữ tài liệu lịch sử; sửa liên kết và MOVED, gắn nhãn các audit liên quan để không dùng làm luật hiện hành.
- Sát thủ cần trao đổi lại trước khi chốt: giữ nguyên bảy hồ sơ/skill/prompt, không coi là thiết kế đã duyệt lại, không sửa hoặc triển khai trong đợt Xạ thủ.

## 26/10/2026 — Chọn đối thủ nhận kỹ năng

- Kỹ năng đơn mục tiêu cho chọn đối thủ (hoặc đồng đội) khi có từ hai lựa chọn: bấm thẻ, hoặc ←/→ rồi Enter (Shan yêu cầu).
  Kỹ năng phá vùng đơn mục tiêu chọn đối thủ trước rồi chọn tâm. Khiêu khích vẫn buộc nhắm kẻ khiêu khích.
- Đánh thường (ô kiếm) và kỹ năng diện rộng/lên bản thân/cả đội giữ nguyên. Không truyền `target` thì core chọn như cũ.

## 25/10/2026 — Campaign V2: gỡ chiến dịch cũ, Đánh trùm 6 trùm, nghiệm thu

- Gỡ hẳn chiến dịch 13 màn cũ (Shan yêu cầu); sứ quân chuyển sang danh mục dùng chung `warlords.ts`.
- Đánh trùm chỉ còn 6 sứ quân bị đánh dẹp, đều là tái đấu (Shan chốt; design-freeze 1.1).
- Cân bằng CAMP-09.02: M07 AI Dễ, đối thủ cấp 2; M21 phase mở đường cấp 6 (`docs/campaign-v2/balance-report.md`).
- Nghiệm thu CAMP-09.04: **GO có điều kiện** vào `develop`, chờ CI trên PR, smoke Neon preview và Shan duyệt số
  (`docs/campaign-v2/final-acceptance.md`).

## 25/10/2026 — Gỡ leo tháp cũ

- Shan yêu cầu xóa chế độ leo tháp cũ (`/tower`, lộ trình 5.1). Giữ Tháp Thí Luyện và Tháp Vận Mệnh.
- Bỏ theo: bảng xếp hạng "Leo tháp", nhiệm vụ tuần "Qua 10 tầng tháp", thành tựu "Leo tới tầng 10/25", `pnpm sim -- --tower`. Hồ sơ cũ mất trường `tower` khi lưu lại; dữ liệu Song Tháp (`dualTower`, đá) giữ nguyên.

## 24/10/2026 — Nghiệm thu Song Tháp

- Trial **GO có điều kiện**, Destiny **ADJUST/limited beta**, public release tổng thể **ADJUST** cho đến khi có feature flag độc lập, staging migration/restore drill, browser/device smoke và CI sau merge `develop`.
- Đá Cường Hóa V1.0 chỉ được tích trong tài khoản; không có `enhanceLevel`, tăng ATK/DEF/HP, API tiêu đá hoặc thay luật ghép. GEAR-01–08 tiếp tục là FUTURE TODO độc lập.

## 22/10/2026 — Chốt F và mở rộng truy kích trong hành động

- Tinh thần F thành mặc định: giảm5 từ lượt25, sàn hồi/Khiên20%, không giảm ATK/DEF.
- ĐBL có42 tuyệt chiêu theo6 nghề ×7 hệ, giữ tuyệt chiêu ô4 và điểm nâng cũ.
- Mỗi tướng có6 chủ động +4 bị động (2 nghề +2 hệ); truy kích tự nối có giới hạn12 phản ứng/sâu4.
- Danh mục và hợp đồng: [thiết kế22](../03-characters/ky-nang/README.md). Chưa test lại, mô phỏng hoặc cân bằng theo yêu cầu.


## 22/10/2026 — kỹ năng phiên bản 2 và phối hợp đồng đội

- Đổi tuyệt chiêu sang ô4/cấp10, nghề nâng cao sang ô5/cấp15; chuyển khóa đầu tư o4/o5 có marker, không mất điểm.
- Bổ sung sáu mẫu bị động phối hợp cho 61 nhân vật và builder NPC; mở điều kiện thực, người chơi tự chọn hành động tận dụng, giới hạn cơ hội và không tạo chuỗi tự động.
- UI/AI đọc cấu hình chung; giữ nguyên Tinh thần A, lương, chỉ số và preset trùm. [Thiết kế](../03-characters/ky-nang/lich-su/21-combo-dong-doi.md).

## 22/10/2026 — thử nghiệm Tinh thần F

- Thêm F vào cấu hình thử nghiệm chung: giảm 5/lượt từ25, giữ hệ số ATK/DEF 100%, hồi/Khiên mới có sàn20% theo người nhận. Mặc định vẫn A.
- Bổ sung telemetry Khiên hữu ích, test tương tác và [báo cáo đối chứng A/D/E/F](../reports/2026-10-22-tinh-than-F.md); giữ nguyên kỹ năng, lương, tiến trình và preset.

## 22/10/2026 — kỹ năng theo vai trò nghề

- Nhân vật chơi được: 3 chiêu nghề, 2 chiêu hệ và 1 tuyệt chiêu riêng; mở theo ô 1/2/3/5/4/6 ở cấp 1/1/5/10/15/20.
- Giữ khóa nâng theo ô và tiến trình; hồ sơ nghề cổ hoàn điểm thực chi một lần. AI chiến dịch giữ preset cũ tường minh.
- Thiết kế và kiểm chứng: [20](../03-characters/ky-nang/lich-su/20-cai-to-ky-nang.md). Các mục ghi bộ 6 chiêu hệ dưới đây là lịch sử trước cải tổ.


> Mới nhất ở trên cùng. Mỗi mục ghi quyết định và lý do nếu có.

## 21/10/2026

**Vũ khí đồng bộ giữa dáng đứng, ra chiêu, tuyệt chiêu, bị hạ gục (Shan báo lệch)**
- 63 prompt toàn thân và 183 prompt tư thế thêm câu khóa vũ khí (Held item lock) tả đúng món của từng người; câu tư thế gọi món bằng tên riêng thay cho chữ chung (quạt lông cho người cầm quạt tre, quạt lá cọ, quạt sắt; cờ lệnh cho người cầm cờ đuôi nheo; gậy cho Hà Vân cầm quyền trượng; "weapon" cho búa, rìu, kiếm).
- Đinh Bộ Lĩnh, Nguyễn Bặc, Đinh Điền, Lưu Cơ, Trịnh Tú: Holding tả chi tiết món đã vẽ trong `sword.webp`. Tuyệt chiêu Lưu Cơ bỏ cuộn chiếu chỉ (đồ thêm), chỉ cầm quạt.
- Dáng đứng Pháp sư và Quân sư không còn cắm gậy/cán cờ xuống đất (mâu thuẫn với gậy ngắn, cán ngắn), cầm dựng bên người.

**Dáng đứng riêng trong prompt toàn thân (Shan hỏi về việc đứng giống nhau)**
- 56 prompt toàn thân thay dáng chữ A chung bằng dáng theo nghề và thái độ riêng từng người, vẫn giữ khe hở giữa tay và thân cho live2dlayer. Bảy nhân vật đã có hình giữ nguyên.

**Tướng thường có nét riêng trong prompt ảnh (Shan đồng ý)**
- 40 tướng thường (trừ Trần Cương, Đào Lam đã có hình) thêm tuổi, vóc dáng, tóc/râu, một dấu hiệu nhận diện riêng và kiểu đồ cầm tay riêng trong nghề, áp cho cả [Prompt nhân vật](../06-art/prompts/nhan-vat.md) và [Prompt tư thế](../06-art/prompts/tu-the.md). Sứ quân Phạm Bạch Hổ (đao bản rộng chuôi lông trắng) và Đỗ Cảnh Thạc (búa chiến cán dài) đổi vũ khí để khác Đinh Bộ Lĩnh, Nguyễn Bặc và Trần Cương cùng cầm đao.

## 20/10/2026

**Bộ prompt đồ họa ngoài nhân vật (Shan yêu cầu)**
- Thêm [Prompt đồ họa game](../06-art/prompts/do-hoa.md): 140 prompt cho 42 trang bị (14 hình × 3 bộ, nguyên tố đổi màu bằng code qua chi tiết tô hồng), 21 ô bàn cờ (7 loại × 3 bản), 54 lớp nền trận (13 màn + 4 chế độ + nền chung, 3 lớp parallax), mẫu giao diện để Claude vẽ lại bằng SVG/CSS, tranh lớn, linh vật (chờ duyệt) và hạt hiệu ứng.
- So với bản Shan gửi: không thêm ô nguyên tố hay ngọc 3D động (bàn cờ giữ 7 loại ô và dáng ô); trang bị chỉ là biểu tượng, không vẽ lên người vì không dùng DragonBones; khung sơn mài viền trống đồng thay gỗ mun mây Lê–Trần; thanh chỉ số màu phẳng thay neon.

**Bộ prompt ảnh cho toàn bộ nhân vật (Shan yêu cầu)**
- Thêm [Prompt nhân vật](../06-art/prompts/nhan-vat.md): 63 prompt toàn thân ráp sẵn (Đinh Bộ Lĩnh 3 thời kỳ, 6 tướng lịch sử, 12 sứ quân, 42 tướng thường), khớp nghề và hệ trong `roster.ts`.
- So với bản Shan gửi: bỏ chữ Spine; bỏ họa tiết rồng, phượng và giáp vai đầu rồng; vũ khí không kèm hiệu ứng để tách lớp sạch; tư thế ba phần tư quay phải, chừa khe giữa tay và thân; nền xanh lá (Mộc, Phong nền hồng tươi); Quân sư cầm thẻ tre và cờ lệnh. Giới tính tướng thường do Claude đặt, chưa có trong code.

**Hoạt ảnh nhân vật tự viết bằng code, không mua Spine (Shan chốt sau bản thử Đ0)**
- Bản thử pháp sư hệ Thủy (`/prototypes/water-mage.html`): ảnh Copilot, tách lớp bằng live2dlayer, 15 lớp WebP 282 KB, hoạt ảnh PixiJS uốn lưới và xoay khớp. Shan duyệt chuyển động; giữ cách này, tiết kiệm 379 USD Spine Professional.
- Quy trình làm một nhân vật: Copilot (toàn thân, nền trơn) → live2dlayer → sửa trong Photopea (tách bắp tay, đồ cầm tay) → Claude dựng động tác.

**Hệ Phong: lốc xoáy thay trượt hàng/cột (Shan chốt)**
- Lý do: trượt bắt người chơi tự hình dung cả hàng 12 ô (hoặc cột 8 ô) dịch đi, có ô tràn quay vòng, rất khó thấy combo; AI thì tính hết nên Phong mạnh với máy mà khó với người. Shan chọn Lốc xoáy trong 3 phương án (đổi ô tầm xa, lốc xoáy, trượt có game chọn hộ).
- Lốc xoáy: chạm 1 ô không sát mép làm tâm, 8 ô quanh xoay 1–2 nấc theo hoặc ngược chiều kim đồng hồ, ô tâm đứng yên; cascade và thu hoạch giảm như trượt cũ. Thuận Phong cho 1 lần xoay miễn phí 1 nấc; Phong Quyển Tàn Vân xoay tối đa 2 nấc. Kỹ năng có xoay kèm theo (Bão Táp Càn Khôn, tuyệt chiêu và chiêu riêng hệ Phong) game tự xoay, người chơi không thao tác thêm. Chi tiết: [Kỹ năng nhân vật chính](../03-characters/ky-nang/preset-ai-he-cu.md) mục 8.
- Mô phỏng: Phong 3vs3 52.8% → 55.7% ở cấp 10, trong khoảng nhiễu, chưa đổi số liệu.

**Kế hoạch đồ họa và hoạt ảnh (đề xuất, Shan yêu cầu, chưa triển khai code)**
- Thêm [Kế hoạch đồ họa](../06-art/ke-hoach-do-hoa.md): phong cách fantasy lịch sử Việt Nam cách điệu trên nền khắc gỗ + trống đồng, nhân vật hoạt ảnh kiểu rối cắt mảnh có xương (nhẹ hơn vẽ từng khung nhiều lần, dùng chung 6 bộ xương theo nghề), lớp sân khấu PixiJS chồng lên bàn cờ DOM, ngân sách dung lượng và hiệu năng, pipeline ảnh có mã băm, lộ trình Đ0–Đ9. Các lựa chọn công cụ và ngân sách chờ Shan chốt.
- Shan chốt hướng phong cách **lai hai tầng chi tiết**: tranh lớn chi tiết (landing, chân dung, cận cảnh tuyệt chiêu) theo hình mẫu 20/10, nhân vật trong trận vẽ gọn hơn để nhẹ và dễ đọc ở 160 px. Kéo theo: hoạt ảnh cần biến dạng lưới (Spine Pro hoặc Rive).

**Hệ thống nhân vật kèm: bộ 6 ô cho mọi người, 42 tướng thường, sứ quân ở cửa hàng (Shan yêu cầu)**
- Mọi nhân vật kèm dùng bộ 6 kỹ năng theo nguyên tố như Đinh Bộ Lĩnh, mở ô theo cấp và nâng theo ô; ô 5 là tuyệt chiêu (tướng thường) hoặc chiêu riêng (tướng lịch sử, sứ quân). Bỏ chiêu nghề và chiêu nhánh ở phe người chơi; hồ sơ cũ được hoàn điểm kỹ năng. Lý do: mô phỏng cho thấy tướng lịch sử mạnh hơn tướng thường rõ (54% so với 48%), sau khi đổi ba nhóm còn 49–51%.
- Thêm 25 tướng thường để phủ đủ 42 tổ hợp nghề × hệ, mỗi tổ hợp một người. 12 sứ quân mở bán 3 000 vàng sau khi qua màn của họ. Giảm Thiết Bích Đồng Thành, tăng hồi máu Cam Lộ Hồi Xuân và Hoa Lư Thảo Dược. Chi tiết: [Danh sách nhân vật](../03-characters/danh-sach-nhan-vat.md).

**Hai màn: landing và màn chơi theo phân cảnh (Shan yêu cầu)**
- Bỏ các trang riêng. `/` là landing có CTA, `/game` là màn chơi duy nhất: state `currentScene` (MENU, PLAYING, CAMPAIGN, …, LOGIN, ACCOUNT) quyết định phân cảnh, đổi phân cảnh không tải lại trang mà chỉ cập nhật URL (`/game/campaign`, …), nút Back vẫn chạy. Link cũ chuyển hướng về phân cảnh tương ứng. Chi tiết: [Kiến trúc](../07-architecture/kien-truc.md#41-hai-màn-landing-và-màn-chơi-shan-chốt-20102026).

**Đấu trường bóng ma (lộ trình 5.5, Claude đặt, chờ Shan duyệt)**
- Trang `/arena`: mỗi người để lại một đội phòng thủ (bản chụp đội 3vs3), người khác đánh với đội đó do AI Khó điều khiển. 3 đối thủ gần điểm nhất, thiếu người thì thêm bóng ma luyện tập. 10 trận mỗi ngày, điểm kiểu Elo bắt đầu 1000 (ngang điểm thắng +16, người phòng thủ −8), thắng thêm 50 vàng. Có tab Đấu trường ở bảng xếp hạng. Chi tiết: [Chế độ chơi](../02-game-modes/README.md#53-đấu-trường-bóng-ma-claude-đặt-20102026-chờ-shan-duyệt).

**Bảng xếp hạng (lộ trình 4.6, Claude đặt, chờ Shan duyệt)**
- Trang `/leaderboard` với 4 bảng: chiến dịch (số màn, rồi tổng lượt ít nhất), từng màn (ít lượt nhất), leo tháp (tầng cao nhất), sinh tồn (đợt nhiều nhất). Hồ sơ giờ lưu số lượt ít nhất mỗi màn. Server ghi điểm sau mỗi trận online. Chi tiết: [Chế độ chơi](../02-game-modes/README.md#22-bảng-xếp-hạng-claude-đặt-20102026-chuyển-sang-campaign-v2-ở-camp-0804).

**Nhiệm vụ, thành tựu, điểm danh (lộ trình 5.4, Claude đặt, chờ Shan duyệt)**
- Trang `/quests` có 3 phần:
  - Nhiệm vụ ngày (4 việc) và tuần (5 việc), đổi lúc 0 giờ giờ Việt Nam; tuần bắt đầu thứ Hai.
  - 12 thành tựu trọn đời.
  - Điểm danh chuỗi 7 ngày, 50 đến 300 vàng.
- Server cộng tiến độ khi trận online kết thúc; người chơi bấm Nhận để lấy vàng. Chi tiết: [Chế độ chơi](../02-game-modes/README.md#52-nhiệm-vụ-thành-tựu-điểm-danh-claude-đặt-20102026-chờ-shan-duyệt).

**Thử thách hằng ngày (lộ trình 5.2, Claude đặt, chờ Shan duyệt)**
- Trang `/daily`: mỗi ngày (0 giờ giờ Việt Nam) một đề chung, gồm đội cho sẵn cấp 10 không trang bị, một sứ quân trên sân nhà và AI Khó. Seed chỉ nằm trên server. Mỗi người đánh một lần. Xếp hạng: thắng trên thua, ít lượt hơn rồi nhiều máu hơn. Thưởng 150/50 vàng. Chi tiết: [Chế độ chơi](../02-game-modes/README.md#51-thử-thách-hằng-ngày-claude-đặt-20102026-chờ-shan-duyệt).

**Sinh tồn (lộ trình 5.3, Claude đặt, chờ Shan duyệt)**
- Trang `/survival`: một trận 3vs3 không dừng trên cùng bàn cờ, đối thủ theo đợt (2 rồi 3 đối thủ, cứ 5 đợt một sứ quân), luôn báo trước đợt kế. Nghỉ giữa đợt: +20% máu, +25 lương, giữ năng lượng; người gục tự đứng dậy sau 2 đợt hoặc trả 40 lương. Mô phỏng AI Thường vượt qua trung vị 11–12 đợt, mỗi đợt khoảng 10 lượt mỗi bên. Chi tiết: [Chế độ chơi](../02-game-modes/README.md#41-bản-đầu-claude-đặt-20102026-chờ-shan-duyệt-baseline-trước-v11).

**Leo tháp (lộ trình 5.1, Claude đặt, chờ Shan duyệt)**
- Trang `/tower`: chuỗi tầng 3vs3, máu và lương mang sang, thắng tầng chọn hồi máu, thêm lương hoặc một phúc cộng dồn; cứ 5 tầng một sứ quân làm trùm. Độ khó theo hệ số sức mạnh 0,45 + 0,03 mỗi tầng; mô phỏng AI Thường leo được trung vị 10 tầng ở mọi cấp. Chi tiết: [Chế độ chơi](../02-game-modes/README.md#3-tháp).

**Đánh trùm (lộ trình 4.5, Claude đặt, chờ Shan duyệt)**
- Qua màn có sứ quân thì đánh lại sứ quân đó ở 3 bậc (+4/+8/+12 cấp, AI khó hơn 1/2/3 nấc), trên sân nhà (bàn cờ theo nguyên tố, sứ quân đầy lương). Thưởng lần đầu mỗi bậc: vàng và 1 món Tinh/Bảo/Thần phẩm. Chi tiết: [Chế độ chơi](../02-game-modes/README.md#21-đánh-trùm-claude-đặt-20102026-chuyển-sang-campaign-v2-ở-camp-0804).

**Bản đồ cổ trang chiến dịch (Claude, chờ Shan duyệt)**
- Trang `/campaign` có bản đồ Giao Châu thế kỷ X kiểu khắc gỗ: 13 màn đặt theo vùng đất, sông, núi, bờ biển; đường hành quân đỏ son, màn đã qua cắm cờ lau, bấm màn để chọn. Mô tả ở [Chế độ chơi](../02-game-modes/README.md#2-chiến-dịch).

**Cân độ khó chiến dịch (lộ trình 4.4, Claude)**
- Lệnh `pnpm sim -- --stage <id|all>` đánh màn với đúng luật màn, Đinh Bộ Lĩnh xoay vòng 7 hệ; `--sweep 2..5` thử nhiều mức hơn cấp.
- Cấp gợi ý đặt riêng từng màn (4 → 24). Phong Châu nhẹ đi (chiêu riêng Kiều Công Hãn giảm, phó tướng đổi thành Binh lính Thổ, đối thủ cấp 9). Mọi màn thắng ≥50% ở cấp gợi ý với đội có tướng lịch sử. Bảng số liệu: [Chế độ chơi](../02-game-modes/README.md#2-chiến-dịch).

**Tên, tước hiệu và đất của 12 sứ quân (Shan chốt)**
- Theo danh sách Shan đưa: Lã Đường đổi thành Lữ Đường (Lữ Tá công); mỗi sứ quân có tước hiệu (Trần Minh Công, Phạm Phòng Át, …) và mỗi màn ghi vùng đất ngày nay. Ngô Nhật Khánh ghi thêm tên Ngô Nam Chỉ. Bảng ở [Chế độ chơi](../02-game-modes/README.md#2-chiến-dịch).

**Chiêu riêng và thoại sứ quân (lộ trình 4.3, Claude đặt, chờ Shan duyệt)**
- 12 sứ quân và 6 tướng lịch sử mỗi người có một chiêu riêng thay kỹ năng ô 5. Sứ quân luôn mang chiêu riêng, giá 60 (trùm 80); tướng phe người chơi mở ở cấp 20 như ô 5. Chi tiết: [Nhân vật & kỹ năng](../03-characters/danh-sach-nhan-vat.md#6-sứ-quân).
- Mỗi màn có thoại trước trận (bản đồ chiến dịch) và sau trận (thắng/thua, màn kết quả).

**Tướng lịch sử gia nhập qua chiến dịch (lộ trình 4.2, Shan yêu cầu, nghề/hệ Claude đặt, chờ Shan duyệt)**
- Nguyễn Bặc, Đinh Điền, Lưu Cơ, Trịnh Tú, Lê Hoàn, Đinh Liễn gia nhập đội khi qua 6 màn đầu lần đầu, ở cấp của màn. Mỗi người có bộ 6 kỹ năng theo nguyên tố như Đinh Bộ Lĩnh, nâng theo ô; không bán ở cửa hàng. Chi tiết: [Nhân vật & kỹ năng](../03-characters/danh-sach-nhan-vat.md#5-tướng-lịch-sử).
- Bản đồ chiến dịch báo tướng sẽ gia nhập ở từng màn, kết quả trận báo khi có tướng mới, bảng Đội hình có mục tướng lịch sử chưa gia nhập.

## 19/10/2026

**Chiến dịch chương 1 (Shan chọn Chiến dịch, nội dung Claude đặt, chờ Shan duyệt)**
- 13 màn dẹp 12 sứ quân ở trang `/campaign`; sứ quân có bộ kỹ năng như Đinh Bộ Lĩnh. Lương mang sang giữa các trận, doanh trại đổi vàng lấy lương, luật màn, thưởng vàng lần đầu qua màn. Chi tiết: [Chế độ chơi](../02-game-modes/README.md#2-chiến-dịch).
- Lộ trình chi tiết từ giai đoạn 4 ở [Lộ trình](../09-roadmap/lo-trinh.md).

**AI để dành năng lượng cho tuyệt chiêu (Claude, giai đoạn 3)**
- Khi so kỹ năng, AI cộng thêm 40 năng lượng vào giá cho lượt dùng (mỗi lượt chỉ 1 kỹ năng), nên giờ để dành và dùng kỹ năng 100. Khiên chấm theo lượng chặn được.
- Mô phỏng 7 hệ: tỉ lệ thắng không đổi ngoài nhiễu, trận ngắn hơn khoảng 1 lượt ở vài hệ. Chưa đổi số liệu tuyệt chiêu.

**Trang hồ sơ nhân vật `/profile` (Shan yêu cầu, bố cục học theo bảng nhân vật game khác, hình tự vẽ)**
- Thẻ Nhân vật: chân dung giữa 9 ô trang bị, thanh máu, kinh nghiệm, vàng, bảng chỉ số (phần cộng từ trang bị ghi màu xanh), thưởng bộ và cộng hưởng đang có; bên phải túi đồ dạng lưới 8×5 có lọc, 5 trang, chi tiết món, mặc/tháo/bán và khay ghép 3 món.
- Thẻ Kỹ năng và thẻ Đội hình & cửa hàng dùng lại bảng của `/play`. Có link Hồ sơ trên `/play` và `/account`; khách cũng xem được.

**Túi đồ và 9 ô trang bị lưu trên server (giai đoạn 3, Claude đặt, chờ Shan duyệt)**
- Hồ sơ có túi đồ (tối đa 200 món) và ô trang bị của từng nhân vật; mặc, tháo, ghép, bán đều là thao tác trên hồ sơ, `/play` lưu trên server, `/demo` lưu trên trình duyệt.
- Món rơi sau trận vào túi đồ thay vì chỉ hiển thị. Đồ mẫu chọn theo phẩm chỉ còn ở chế độ Luyện tập.
- Cửa hàng trang bị: tự chọn ô, hệ, bộ, nghề; Lục 400 vàng, Lam 1 200 vàng. Bán món: 5/15/50/150/500 vàng theo phẩm.

**Cửa hàng nhân vật kèm (giai đoạn 3, Claude đặt, chờ Shan duyệt)**
- 12 nhân vật kèm hư cấu, 2 người mỗi nghề, đủ 7 hệ, mỗi người một tuyệt chiêu riêng; giá 1 500 hoặc 3 000 vàng.
- Hồ sơ lưu nhân vật đã có và đội 3vs3 đã chọn; `/demo` (Tiến trình) và `/play` có bảng Đội hình và cửa hàng. Server chỉ cho ra trận nhân vật đã có.

**Tuyệt chiêu nấc 3 (giai đoạn 3, Claude đặt, chờ Shan duyệt)**
- 5 nhân vật kèm khởi đầu mỗi người một tuyệt chiêu riêng, 100 năng lượng, mang đậm nguyên tố của người đó: Hà Vân Hỏa Vũ Liệu Nguyên, Lê Thạch Trấn Sơn Hộ Quân, Mai Thanh Cam Lộ Hồi Xuân, Tô Kim Kim Ngân Ly Tán, Phùng Phong Phong Vân Biến Trận.
- Tự mở ở cấp 10, không tốn điểm (nhánh nấc 2 đã tốn điểm và chỉ mang 1, nên nấc 3 là phần thưởng của việc lên cấp); nâng cấp bằng điểm như chiêu khác. Chế độ Luyện tập mở sẵn.

**Trận online (giai đoạn 2, Shan chọn Neon + Drizzle)**
- Việc định kỳ mỗi ngày (Vercel Cron): chốt trận bỏ dở quá 24 giờ và cộng thưởng, xóa khách không chơi quá 30 ngày. Cần biến `CRON_SECRET`.
- Hồ sơ tiến trình lưu trên server: `/play` chơi theo hồ sơ (cấp, kỹ năng, chiêu nhánh) thay cho đội Luyện tập, thưởng cuối trận cộng trên server, nâng kỹ năng gửi qua `/api/profile`. `/demo` vẫn lưu ở trình duyệt.
- Server xử lý từng hành động: `src/core/match/` (chạy bù hết giờ kiểu tính lười, AI đánh ngay, xử thua 24 giờ, ẩn seed) và `src/server/` (kho Postgres/bộ nhớ, cookie khách ký HMAC), API `/api/battles`.
- Bảng `matches` (Drizzle), migration tự áp khi build nếu có `DATABASE_URL`.
- Trang `/play` chơi online qua API: đồng hồ 30 giây theo giờ server, hết giờ tự chạy bù, tải lại trang tiếp tục được trận dở. Đội hình tạm như Luyện tập 3vs3.
- Sắp lại đường dẫn (Shan yêu cầu): `/` trang chủ, `/demo` chơi thử, `/play` chơi online, `/login`, `/register`, `/account` tách thành trang riêng; mục neo trên trang chủ đổi sang tiếng Anh (`#how-to-play`, `#elements`, `#roster`, `#modes`, `#faq`).
- Đường dẫn đổi sang tiếng Anh (Shan yêu cầu): trang đăng nhập là `/login`, tham số `form`, `error`, `username`, `login=error`, `passwordChanged`; `/dang-nhap` cũ chuyển hướng vĩnh viễn sang `/login`.
- Đăng ký bằng tên đăng nhập + mật khẩu (Shan đồng ý, bản chưa có email): quên mật khẩu là mất tài khoản nên form khuyên liên kết thêm Google/GitHub; sai 5 lần khóa 15 phút. Nới quy tắc cũ "chỉ dùng OAuth để hạn chế nhiều tài khoản".
- Trang đăng nhập riêng (nay là `/login`) (Shan yêu cầu): chọn Google/GitHub hoặc chơi với tư cách khách; đã đăng nhập thì xem tài khoản, liên kết thêm, đăng xuất. Trang chủ có link "Đăng nhập" ở thanh trên.
- Đăng nhập Google và GitHub (Shan yêu cầu): danh tính gắn thẳng vào tài khoản khách đang dùng nên không mất trận, không cần gộp dữ liệu; đăng nhập ở máy khác thì vào lại đúng tài khoản. Tự viết luồng OAuth thay vì Auth.js (Auth.js v5 vẫn là bản beta, và mô hình "khách chính là tài khoản" không cần bảng phiên của thư viện).

**Tiến trình nhân vật (code, Shan yêu cầu làm tiếp lối chơi; số liệu Claude đặt, chờ duyệt)**
- `src/core/progress/`: kinh nghiệm và cấp (tối đa 30), 1 điểm kỹ năng mỗi cấp, nâng kỹ năng cấp 1–5 (+10% hệ số chính mỗi cấp, cấp 5 giảm 10% năng lượng), mở ô kỹ năng nhân vật chính theo cấp 1/1/5/10/20/15, mua chiêu nhánh nấc 2 từ cấp 5 và mang 1 chiêu mỗi trận, chỉ số +3% mỗi cấp, phần thưởng cuối trận (ô sách 5 kinh nghiệm, ô vàng 3 vàng).
- Kỹ năng nhân vật chính nâng theo ô, không theo kỹ năng, để đổi nguyên tố trước trận không mất điểm.
- `/demo` có chế độ Tiến trình (hồ sơ lưu trên trình duyệt, đối thủ cùng cấp) và chọn nghề nhân vật chính trước trận. `pnpm sim` có `--level`.

**Trang bị vào trận (Shan chốt, phần số liệu Shan giao Claude tự quyết)**
- Không có chỉ số phụ cho trang sức. Phí ghép thấp: 10/20/40/80 vàng. Bảng rơi đồ theo độ khó; thắng rơi 1 món, thua 30% rơi món tối đa Lục.
- Thưởng bộ chốt theo mô phỏng: Cờ Lau Máu +4% → +3%, Hoa Lư DEF +10% → +12% để ba bộ ngang nhau (đủ bộ khoảng +9 điểm tỉ lệ thắng). Bị động Kim không mạnh lên khi có trang bị.
- `pnpm sim` có `--gear-tier`, `--set`, `--foe-set`; `/demo` chọn được phẩm và bộ trước trận, hiện chiến lợi phẩm sau trận.

**Trang bị (code, Shan yêu cầu)**
- Code hệ thống trang bị trong `src/core/gear/`: 9 ô, 5 phẩm, hệ số nguyên tố, vũ khí giữ riêng theo nghề, thưởng bộ và cộng hưởng ở mốc 6 và 9 món, ghép 3 món nâng bậc. Chưa nối vào trận demo và sim.
- Chỉ số gốc món Trắng ATK +3, Máu +30, DEF +2; 3 bộ khởi đầu (Cờ Lau, Hoa Lư, Đồng Cổ) và cộng hưởng 7 nguyên tố chỉ cộng chỉ số. Tất cả là đề xuất điểm xuất phát, chờ chốt.

**Kỹ năng bàn cờ giá rẻ (cân bằng sau giai đoạn 1, Shan chọn)**
- Ô thu hoạch khi kỹ năng hoặc lần trượt miễn phí đổi bàn cờ (phá, biến, trượt và cascade sau đó) chỉ cho 50% sát thương kiếm và 50% năng lượng âm dương. Trước đó kỹ năng ô 1 giá rẻ thu hoạch như nước đi miễn phí, và chỉ được vá bằng tăng giá từng kỹ năng.
- Tăng lại ô 3 của Kim, Lôi, Mộc, Thủy; giảm Cuồng Phong Quét Trận; Thuận Phong bỏ 15 năng lượng tức thì. Mô phỏng 3vs3 900 trận mỗi hệ: các hệ thắng 54–69% (trước 50–75%). Chi tiết ở [Bộ kỹ năng nhân vật chính](../03-characters/ky-nang/preset-ai-he-cu.md#mô-phỏng-19102026).

**Hình ảnh**
- Thay emoji ở /demo bằng bộ hình SVG tự vẽ (Shan đồng ý): 7 ô cờ, ô đặc biệt bản yếu và bản mạnh, 7 biểu tượng nguyên tố, cờ lau thủ lĩnh, khung bàn cờ. Phong cách khắc gỗ dân gian và hoa văn trống đồng. Chân dung nhân vật và hình trang bị để sau, thuê họa sĩ hoặc dùng công cụ AI theo bản yêu cầu ở [Hình ảnh](../06-art/art-bible.md).

**Bộ kỹ năng nhân vật chính**
- Code xong bộ Kim, Thủy, Hỏa, Thổ, Lôi cùng kỹ năng bị động (Shan yêu cầu).
- Hỏa Phóng Hỏa Thiêu Doanh tăng giá 20 → 35, Lôi Trụ Giáng Thế 20 → 40: phá ô giá rẻ thu hoạch như một nước đi miễn phí.
- AI để dành năng lượng cho kỹ năng đáng hơn thay vì luôn dùng kỹ năng rẻ nhất.
- Trang /demo chọn được nguyên tố nhân vật chính trước trận.
- Hệ Phong: kỹ năng trượt hàng/cột (ô tràn quay vào đầu kia, cascade không cho lượt thêm). Phong Quyển Tàn Vân giá 20 → 40; bị động Thuận Phong cho 1 lần trượt miễn phí mỗi lần kích hoạt (Shan chốt; thiết kế gốc là mỗi lần ra tay, mô phỏng cho Phong thắng 80%).

**Tinh thần**
- Thêm chỉ số Tinh thần cho mỗi tướng (Shan yêu cầu): 100 khi vào trận, từ lượt 25 của phe mất 10 mỗi lượt. ATK và DEF còn 70%, hồi máu và Khiên về 0 khi Tinh thần cạn. Áp dụng cả 1vs1 và 3vs3, thay luật Mệt mỏi. Mô phỏng: không trận hòa, 3vs3 p90 46.5 lượt (trước 58).

**1vs1 và Nộ**
- Luật Mệt mỏi cho 1vs1 (Shan chọn): từ lượt 30 mỗi bên, hồi máu và Khiên giảm 10% mỗi lượt, về 0 sau 10 lượt. Mô phỏng: không còn trận hòa, trung vị 22 lượt mỗi bên.
- 1vs1: máu tối đa ×2 (trước đó trận 1vs1 chỉ kéo dài trung vị khoảng 4 lượt mỗi bên). Máu cao hơn nữa thì trận hòa tăng mạnh vì các cặp thiên về hồi máu, phòng thủ không hạ được nhau.
- Thủ lĩnh có nguyên tố chưa làm kỹ năng bị động thì không tích Nộ (trước đó vẫn báo kích hoạt nhưng không có tác dụng).

**Giảm bộ Mộc và cân lại nhịp trận (Shan chọn giảm bộ Mộc, theo mô phỏng)**
- Mô phỏng cho thấy chỉ giảm bộ Mộc thì trận hòa (chạm giới hạn lượt) tăng vọt, vì hồi máu và khiên mạnh hơn sát thương. Nên cân cả nhịp trận cùng lúc.
- Bộ Mộc: Sinh Sôi Bất Tận hồi 3%/lượt (từ 8%); Lục Diệp Phong 35 năng lượng, phá 5 ô (từ 20, 8 ô); sát thương bộ Mộc ×0.75 (Thanh Mộc Hộ Pháp 130%, Cuồng Vũ Thiên Diệp 65%, Cổ Thụ Trấn Thiên 225%); hồi máu bộ Mộc ×0.75.
- Hồi máu, Hồi phục và Khiên của chiêu nghề ×0.75: Linh dược 22%, Tế độ 15%, Dưỡng sinh 7%/lượt, Thủ thành 20%, Tường khiên 15%.
- Máu gốc mọi nghề giảm một nửa (Tướng sĩ 500, Pháp sư 450, Binh lính 600, còn lại 475).
- Kết quả 3vs3 (120 trận, AI Thường): phe có nhân vật chính thắng khoảng 70% (từ 87–97%), không còn trận hòa, trung vị 26 lượt mỗi phe (mục tiêu 20–30).
- 1vs1 giờ quá ngắn (trung vị khoảng 5 lượt mỗi phe); cần cân riêng như TODO ở Trận đấu mục 3.

## 18/10/2026

**Tăng chiêu nghề cho nhân vật kèm (Shan yêu cầu, sau lần chạy mô phỏng đầu)**
- Hệ số sát thương chiêu nghề ×1.4 (Trảm kích 210%, Phá trận 300%, Phép công 180%, Ngũ hành ấn 140%, Phép lan 100%).
- Hồi máu, khiên và hiệu ứng mạnh hơn: Linh dược 30%, Tế độ 20%, Dưỡng sinh 10%/lượt, Thủ thành 25%, Tường khiên 20%, Mua chuộc −40, Nghi binh −30%, Bày trận +30%.
- Chiêu nấc 2 giảm từ 60 xuống 45 năng lượng, vì AI gần như không bao giờ dùng tới khi còn 60.
- Vẫn là điểm xuất phát; phe có nhân vật chính hệ Mộc vẫn thắng gần hết trận 3vs3.

**Phản biện thiết kế (Shan chốt)**
- Hết 30 giây xử lý kiểu tính lười trong request kế tiếp, vì serverless không có tiến trình nền; không dùng dịch vụ hẹn giờ ngoài. Người chơi bỏ đi thì AI đánh tiếp tới hết trận.
- Đồng hồ không dừng khi mất mạng, vì server không phân biệt được rớt mạng với bỏ đi.
- Client chỉ chạy trước phần biết chắc (đổi ô, bộ ghép đầu, ô cũ rơi), để không bao giờ phải rút lại hình.
- AI chấm nước đi: Dễ/Thường bỏ qua ô mới, Khó cộng điểm kỳ vọng, Trùm/Ác mộng giả lập ô rơi; chạy bù luôn dùng cách nhẹ nhất.
- Không chặn cày vàng và sách; thua giữ 100%.
- Một lượt: trượt miễn phí → tối đa 1 kỹ năng → 1 nước đổi ô. Kỹ năng đặt lại đồng hồ 30 giây, trượt thì không.
- Lượt thêm không tính là lượt mới khi đếm thời hạn, nhưng được làm lại đủ ba bước.
- Thuận Phong theo luật chung: 3 lượt của phe, ai ra tay cũng được trượt.

**Tổ chức docs**
- Tách `docs/co-lau-design.md` thành các file theo chủ đề trong `docs/design/` và `docs/tech/`; gom TODO về [cau-hoi-mo.md](../09-roadmap/cau-hoi-mo.md).
- Thống nhất tên: Cờ Lau (Reed Banner), repo `ShanChen6/Reed-Banner`. Bỏ đề xuất tạo repo mới `co-lau`.
- Đổi "Ngũ hành" thành "Nguyên tố" vì giờ có 6 nguyên tố.

**Gameplay (Shan chốt)**
- Bàn cờ từ 8×8 thành **12 cột × 8 hàng**, bố cục ngang (theo ảnh tham khảo bố cục).
- **Cascade** vẫn tạo ô đặc biệt và **cho thêm lượt**; mỗi nước đi tối đa 1 lượt thêm.
- **Bỏ luật đi sai bị trừ máu.** Thay bằng đồng hồ **30 giây mỗi lượt**, hết giờ mất lượt.
- Thêm thể thức **1vs1** bên cạnh **3vs3**.
- **Nhân vật chính** là Đinh Bộ Lĩnh, có từ lúc tạo game, chọn 1 trong 6 nguyên tố và được đổi nguyên tố trước mỗi trận.
- Thêm nguyên tố **Lôi**: Kim, Mộc, Thủy, Hỏa, Thổ, Lôi.
- Nhân vật chính có **7 kỹ năng** (1 bị động, 6 chủ động) theo nguyên tố, gồm kỹ năng tác động trực tiếp lên đối thủ và lên bàn cờ. Đã có tên 6 kỹ năng chủ động hệ Mộc.
- Trang bị từ 3 ô thành **9 ô**: Vũ khí, Đính mão, Y phục, Hộ thủ, Bảo ngoa, Giới chỉ, Hạng liên, Hộ phù, Ngọc bội.

**Sau khi tham khảo trang Loạn 12 Sứ Quân bản mới (Shan chốt)**
- Lôi chỉ khắc Thủy, bị Thổ khắc.
- Thêm bảng tính cách nguyên tố để định hướng kỹ năng.
- Tương sinh có tác dụng trong trận: ×1.1 sát thương khi nguyên tố người đánh sinh ra nguyên tố mục tiêu.
- Trang bị có thưởng bộ và cộng hưởng nguyên tố khi mặc đủ 9 món.
- Đổi tên kỹ năng "Thiên Nhiên Đại Chú" (trùng tên chiêu của game đó) thành tên tạm "Cổ Thụ Trấn Thiên".
- Không xây cộng điểm tiềm năng, chí mạng, né và bang hội.

**Bộ kỹ năng nhân vật chính (bản nháp, chờ duyệt)**
- Viết chi tiết 42 kỹ năng (6 nguyên tố × 7) theo một khung chung: chi phí 20/30/40/60/100/50, mở khóa cấp 1/1/5/10/20/15, nâng cấp 1–5.
- Ở 1vs1, kỹ năng toàn bộ kẻ địch gây ×1.5 sát thương.

**Bản yếu của 6 ô đặc biệt (bản nháp, chờ duyệt)**
- Kiếm đồng, Bùa âm dương, Giỏ bánh, Tim bạc, Túi vàng, Thẻ tre; sức tác động khoảng một nửa bản mạnh. Kiếm đồng tính ×1.5 ô kiếm.

**Bỏ luật trụ vững (Shan chốt)**
- Nhân vật có thể bị hạ gục trong một lượt. Máu và sát thương nhân vật sẽ được cân lại cho phù hợp.

**Thêm nguyên tố Phong (Shan chốt)**
- Nguyên tố thứ 7: Phong khắc Thổ, bị Mộc khắc, sinh ra Hỏa. Tính cách linh hoạt, điều khiển bàn cờ với kỹ năng trượt hàng/cột.
- Thêm bộ 7 kỹ năng hệ Phong (bản nháp). Đổi tên kỹ năng 6 hệ Lôi thành "Lôi Đình Hiệu Lệnh" để khỏi lẫn với Phong.

**Ô Trống trận và thanh Nộ (Shan yêu cầu, chi tiết là bản nháp)**
- Thêm loại ô thứ 7: 🥁 Trống trận, có bản yếu (Trống da) và bản mạnh (Trống đồng). Chỉnh lại bảng tỉ lệ ô chuẩn.
- Mỗi phe có thanh Nộ gắn với thủ lĩnh; đầy 100 thì kỹ năng bị động tự kích hoạt 3 lượt. Viết lại 7 kỹ năng bị động theo cơ chế này.
- Bỏ cơ chế "Phẫn nộ" của năng lượng; mất máu giờ tích Nộ thay vì năng lượng.

**Nghề của nhân vật chính (Shan chốt)**
- Đinh Bộ Lĩnh không còn cố định Tướng sĩ: chọn 1 trong 6 nghề trước mỗi trận, như nguyên tố. Nghề chỉ đổi nội tại và vũ khí, không đổi kỹ năng.

**Kỹ năng chịu DEF (Shan chốt)**
- Sát thương kỹ năng giờ bị giảm theo DEF như đánh thường. Thêm hệ số Xuyên giáp; Kim là hệ có xuyên giáp. Hệ số kỹ năng sẽ được nâng lại khi mô phỏng.

**Trang bị: mốc thưởng, phẩm, ghép (Shan chốt; số liệu là bản nháp)**
- Thưởng bộ và cộng hưởng nguyên tố có hai mốc: 6 món và 9 món.
- Trang bị có phẩm theo màu (đề xuất 5 bậc Trắng, Lục, Lam, Tím, Cam).
- Ghép 3 món cùng bậc, cùng hệ (nguyên tố), cùng loại ô để lên bậc kế tiếp; không ghép khác hệ.

**Điều khiển (Shan yêu cầu)**
- Ngoài vuốt/kéo, thêm click chọn ô rồi click ô kề để đổi, và điều khiển hoàn toàn bằng bàn phím (mũi tên/WASD, Enter, Esc, Tab, 1–6).

**Đề xuất kèm theo (chờ chốt, đã ghi trong câu hỏi mở)**
- Dấu ấn của Lôi.
- Đồng hồ 30 giây được tắt ở Luyện tập và `/demo`.
- Luật 1vs1, luật phá ô bằng kỹ năng, chỉ số chính của 9 ô trang bị.

**Chốt các đề xuất (Shan đồng ý, trừ tên miền)**
- Duyệt ô Trống trận, thanh Nộ, 7 kỹ năng bị động, bản yếu của 7 ô đặc biệt và bộ 49 kỹ năng nhân vật chính kèm tên. Số liệu vẫn là điểm xuất phát, chờ mô phỏng.
- Đồng hồ 30 giây được tắt ở Luyện tập và `/demo`.
- Dấu ấn Lôi và Phong, luật phá ô bằng kỹ năng.
- Chỉ số chính của 9 ô trang bị; 5 phẩm Trắng → Cam; ghép luôn thành công.
- Thể thức từng chế độ chơi; thêm Thử thách hằng ngày, Thế cờ, Đấu trường bóng ma (làm sau cùng).
- Tên miền chưa chốt.

## 16/10/2026

- Bản chốt thiết kế đầu tiên sau buổi phản biện (`docs/co-lau-design.md`).


## 30/10/2026 — Giá 14 tướng Xạ thủ/Sát thủ

Shan chốt RB-062–075 giá 1.500 vàng mỗi người, dùng mức basic hiện có. Không cấp miễn phí cho hồ sơ cũ; giữ khóa phát hành đến nghiệm thu PROF-06. Nguồn thông số: [thiết kế hai nghề](../06-art/prompts/v4-2/08-new-professions-14-skill-kits.md).

## 31/10/2026 — Trận Đồ (Binh Pháp) bản chơi thử

Triển khai BP-01 đến BP-04 một phần theo yêu cầu của Shan: engine `src/core/binh-phap/`, scene `FORMATION` (`/game/formation`), mô phỏng `scripts/binh-phap-sim.ts`. Các câu hỏi BP-00 lấy giá trị đề xuất làm mặc định, **chưa được duyệt** ([GDD mục 11](../02-game-modes/future/02-binh-phap-gdd.md#11-bản-triển-khai-đầu-tiên-chơi-thử-offline)). Offline, không thưởng, chưa có feature flag.

## 01/11/2026 — Trận Đồ: bàn chữ nhật, chướng ngại, điểm và thưởng theo bậc

Shan chốt: bàn không cần vuông (5×7, 7×9, 9×9…), có ô chướng ngại ngẫu nhiên không đặt được quân, xếp hạng cao được thưởng và thưởng chia theo bậc chơi; thanh Bỏ Lệnh và xác suất quân đặc biệt giữ đề xuất. Đã code bàn chữ nhật, chướng ngại, điểm mới và quân đặc biệt mới. Xếp hạng và thưởng mới có thiết kế ([GDD mục 12](../02-game-modes/future/02-binh-phap-gdd.md#12-xếp-hạng-và-thưởng-đã-code-mặc-định-tắt)), chưa có code.

### 01/11/2026 (bổ sung) — Cỡ bàn các bậc Trận Đồ

Shan chốt: Hướng dẫn 3×3 (không xếp hạng, không thưởng), Thường 5×5, Khó 6×6, Đại trận cỡ ngẫu nhiên mỗi cạnh 7–10; số chướng ngại phải tính kỹ. Đã code, số chướng ngại do mô phỏng chọn (tỉ lệ theo diện tích, trần 72 ô chơi được). Đại trận dùng đủ 8 nghề, gồm Xạ thủ và Sát thủ. Id bậc "Nhập môn" đổi thành `huong-dan`, save cũ bị bỏ.

### 01/11/2026 (bổ sung) — Quân nhân vật đặc biệt nhiều nghề/hệ trong Trận Đồ

Shan đồng ý tổng quát hóa quân thành tập nghề, tập hệ giao nhau để chứa Đinh Ngọc và các nhân vật đặc biệt sắp thiết kế. Đã code hạ tầng; danh sách nhân vật để trống, chưa nhân vật nào được bật ([GDD mục 11.1](../02-game-modes/future/02-binh-phap-gdd.md#111-nhân-vật-dung-hợp-kiểu-đinh-ngọc)).

### 01/11/2026 (sửa) — Chỉ giữ nhân vật dung hợp đủ 8 nghề, 7 hệ

Shan loại bỏ nhân vật 2 nghề + 2 hệ khỏi Trận Đồ vì làm giảm độ khó; chỉ giữ tối đa hai nhân vật mang đủ 8 nghề và 7 hệ như Đinh Ngọc, vẫn phải đặt sát một quân. Kiểu `multi` (tập nghề, tập hệ) được thay bằng kiểu `fusion` đơn giản. Danh sách vẫn rỗng ([GDD mục 11.1](../02-game-modes/future/02-binh-phap-gdd.md#111-nhân-vật-dung-hợp-kiểu-đinh-ngọc)).

### 01/11/2026 (bổ sung) — Nhân vật dung hợp thứ hai và phạm vi bậc

Nhân vật dung hợp thứ hai của Trận Đồ là Trần Vũ Phong – Vân Du Tử (đang thiết kế). Cả hai nhân vật dung hợp chỉ xuất hiện ở bậc Khó và Đại trận, không ở Hướng dẫn và Thường ([GDD mục 11.1](../02-game-modes/future/02-binh-phap-gdd.md#111-nhân-vật-dung-hợp-kiểu-đinh-ngọc)). Code khóa phạm vi bậc bằng `FUSION_ALLOWED_LEVELS`; danh sách vẫn rỗng cho tới khi duyệt.

### 01/11/2026 (bổ sung) — Trận Đồ xếp hạng và thưởng (server)

Theo yêu cầu của Shan, đã code phần server: kỳ (ngày cho Thường và Khó, tuần cho Đại trận), seed server phát, server giữ ván và áp từng lệnh, hạng, thưởng vàng theo bậc, nhận thưởng một lần, bảng `formation_entries`. Tắt mặc định sau `FORMATION_RANKED_ENABLED`. Thay đổi so với kế hoạch trước: server giữ ván thay vì kiểm lại nhật ký của client, để chặn luyện trước. Bảng thưởng là điểm xuất phát chờ Shan duyệt ([GDD mục 12](../02-game-modes/future/02-binh-phap-gdd.md#12-xếp-hạng-và-thưởng-đã-code-mặc-định-tắt)).

### 01/11/2026 (sửa) — Thưởng xếp hạng Trận Đồ không đòi số người tối thiểu

Shan: bảng ít người vẫn phải có thưởng. Bỏ điều kiện "đủ người thắng" ở các bậc thưởng; một mình một bảng vẫn là hạng nhất. Đánh đổi: tài khoản phụ dễ nhận thưởng hơn ([GDD mục 12](../02-game-modes/future/02-binh-phap-gdd.md#12-xếp-hạng-và-thưởng-đã-code-mặc-định-tắt)).

### 01/11/2026 (bổ sung) — Xếp hạng chỉ cho tài khoản đăng nhập; thưởng vàng theo hạng cho Nhật Lệnh và Thiên Mệnh

Shan chốt: (1) vào chế độ xếp hạng phải đăng nhập, khách không chơi; (2) trước mắt thưởng xếp hạng của mọi chế độ chỉ là vàng, loại thưởng khác bàn sau. Đã code: Trận Đồ xếp hạng chặn khách; thưởng vàng theo hạng cuối kỳ cho Nhật Lệnh (ngày) và Tháp Thiên Mệnh (chu kỳ 7 ngày) qua sổ chung `rank_reward_claims` (migration 0010), chỉ tài khoản đăng nhập nhận được. Bình Loạn, Từng trận, Trấn Ải, Quần Hùng chưa có thưởng theo hạng vì chưa có kỳ ([chế độ chơi mục 6](../02-game-modes/README.md#6-thưởng-vàng-theo-hạng-cuối-kỳ-claude-đặt-01112026-chờ-shan-duyệt)).

### 01/11/2026 (bổ sung) — Khách chỉ chơi thường; Bình Loạn không có BXH; hướng PvP Quần Hùng

Shan chốt: (1) khách chơi thường thoải mái, chế độ **online có bảng xếp hạng và thưởng** chặn hết khách: Nhật Lệnh, Trấn Ải, Quần Hùng, Tháp Thiên Mệnh (cùng Trận Đồ xếp hạng) trả `401 loginRequired` ở server, giao diện hiện màn nhắc đăng nhập; (2) Bình Loạn là offline theo tuyến lịch sử nên **không có bảng xếp hạng**, hai bảng Chiến dịch và Từng trận gỡ khỏi giao diện; (3) Quần Hùng hiện giữ nguyên là tìm đối thủ offline, sắp tới thêm chế độ online hai người chơi đấu trực tiếp, ghi vào [thiết kế DRAFT](../02-game-modes/future/13-quan-hung-pvp-truc-tiep.md) để phát triển sau.

### 01/11/2026 (bổ sung) — Khách không xem bảng xếp hạng; mùa tuần cho Trấn Ải và Quần Hùng

Shan chốt: (1) chặn luôn khách **xem** bảng xếp hạng và màn của các chế độ online có xếp hạng (không chỉ chặn chơi); (2) Trấn Ải và Quần Hùng có **mùa theo tuần**. Đã code: các API xem bảng, đề Nhật Lệnh, màn Thiên Mệnh trả `401` cho khách; Trận Đồ xếp hạng không trả bảng cho khách; trang Xếp hạng cần đăng nhập. Mùa tuần: bảng `season_scores` (migration 0011), điểm mùa ghi khi lượt Trấn Ải và trận Quần Hùng kết thúc, bảng mùa trong trang Xếp hạng (mặc định tuần này, có nút Mọi thời đại), thưởng vàng theo hạng cuối mùa qua sổ `rank_reward_claims` (Trấn Ải 500/300/180/80/30, Quần Hùng 600/400/240/100/40). Cách tính điểm mùa Quần Hùng là đề xuất chờ Shan duyệt ([chế độ chơi mục 6.3](../02-game-modes/README.md#63-mùa-theo-tuần-của-trấn-ải-và-quần-hùng)).

### 01/11/2026 (bổ sung) — Chốt cách tính điểm mùa Quần Hùng

Shan chọn cách tính đã đề xuất: điểm mùa Quần Hùng là tổng điểm đấu trường nhận được từ các trận mình đi đánh trong tuần (không tính phòng thủ, chỉ tổng dương mới có tên, Elo gốc không reset). Không cần đổi code; chỉ bỏ nhãn "đề xuất" ở docs.

### 01/11/2026 (bổ sung) — Duyệt bảng vàng Trấn Ải và Quần Hùng

Shan duyệt bảng vàng theo hạng mùa: Trấn Ải 500/300/180/80/30 và Quần Hùng 600/400/240/100/40 (hạng nhất, top 3, top 10, nửa trên, có tên). Không đổi code. Bảng của Trận Đồ, Nhật Lệnh và Tháp Thiên Mệnh vẫn chờ duyệt.

### 01/11/2026 (bổ sung) — Duyệt toàn bộ bảng vàng thưởng hạng

Shan duyệt bảng vàng theo hạng của cả năm chế độ: Trận Đồ (Thường 150/100/60/30/20, Khó 300/200/120/60/40, Đại trận 1000/600/350/150/80), Nhật Lệnh 100/70/50/30/10, Tháp Thiên Mệnh 800/500/300/150/60, Trấn Ải 500/300/180/80/30, Quần Hùng 600/400/240/100/40. Không đổi code. Trận Đồ xếp hạng vẫn tắt mặc định sau `FORMATION_RANKED_ENABLED`.

## 02/11/2026 — Sa bàn Trận Đồ là bản đồ

Shan: sa bàn dùng ảnh bản đồ riêng làm nền; đặt quân thì ô sáng lên lộ bản đồ; chướng ngại thiết kế lại cho hợp bản đồ; bỏ biểu tượng hệ dài trên quân. Đã code với ảnh giữ chỗ (sương che ô chưa khai thông, núi chướng ngại, quân tròn kèm một huy hiệu nghề). Ảnh bản đồ thật do Shan thiết kế; màn chế độ và màn chơi chi tiết là gợi ý chờ chọn ([giao diện Trận Đồ](../05-ui-ux/screens/tran-do.md)).

## 02/11/2026 — Trận Đồ: kho bản đồ, ô che, chướng ngại 4 biến thể, tùy chỉnh; sửa lỗ hổng dò seed

Shan chốt: kho ảnh bản đồ xoay theo kỳ (13 địa danh thật thời Loạn 12 sứ quân); ô chưa mở là ảnh che đặc kín (không để ảnh mờ của bản đồ); chướng ngại 4 biến thể (núi, rừng, đầm lầy, thành lũy) với nền ô riêng; quân đủ huy hiệu nghề và hệ nhỏ vừa đủ; hoàn thành thì hiện ảnh đầy đủ; thêm chế độ **tùy chỉnh** trong Chơi thường (cột, hàng, nghề, hệ, quân đặc biệt, chướng ngại); gợi ý giao diện triển khai trước. Đã code với ảnh giữ chỗ ([giao diện Trận Đồ](../05-ui-ux/screens/tran-do.md)).

**Sửa bảo mật:** tự rà soát phát hiện ván xếp hạng dò được seed (32 bit, bàn cờ hiển thị) nên biết trước dãy quân. Đã thêm **muối bí mật** cho ván xếp hạng ([GDD Binh Pháp mục 12](../02-game-modes/future/02-binh-phap-gdd.md#12-xếp-hạng-và-thưởng-đã-code-mặc-định-tắt)). Ván xếp hạng đang dở tạo trước bản sửa vẫn chạy theo cách cũ (không muối) cho tới khi kết thúc.

### 02/11/2026 (bổ sung) — Kho bản đồ 30, màn chế độ và màn chơi chi tiết Trận Đồ

Shan: thêm càng nhiều địa danh càng tốt (kho không giới hạn), cần prompt tạo ảnh đầy đủ (bản đồ, ô che đặc kín, 4 icon chướng ngại), và triển khai giao diện màn chế độ và màn chơi chi tiết rồi sẽ test lần 1 và góp ý. Đã làm: kho 30 bản đồ (13 địa danh sứ quân và Hoa Lư, 7 địa danh Ngô – Đinh, 10 cảnh quan chung) kèm [bộ prompt đầy đủ](../06-art/prompts/tran-do-hinh-anh.md) và test kiểm mọi bản đồ có prompt; màn chế độ (tab, thẻ bản đồ mờ sương, đồng hồ kỳ, thang thưởng bậc thang, bộ sưu tập địa danh); màn chơi (lệnh bài, ba ngọn lửa Bỏ Lệnh, thanh dưới màn hình cho điện thoại, vệt sáng dọn hàng, nút gợi ý, hướng dẫn từng bước). API tổng quan xếp hạng thêm `endsAt` và `theme` ([giao diện Trận Đồ](../05-ui-ux/screens/tran-do.md)).

### 02/11/2026 (sửa) — Prompt ảnh Trận Đồ đổi sang phong cách nền Bình Loạn

Ảnh tạo từ bộ prompt đầu ("bản đồ thủy mặc trên giấy dó nhìn từ trên xuống") chưa đạt chất lượng. Shan đề nghị tham khảo prompt nền Bình Loạn. Đã viết lại toàn bộ 30 prompt bản đồ theo khối phong cách tranh vẽ tay 2D điện ảnh của nền chiến dịch, chỉ bỏ điều kiện hộp thoại và thêm điều kiện nền sa bàn (vuông 1:1 ưu tiên, góc nhìn hơi cao, chi tiết rải đều, tông trung bình). Ô che và 4 icon chướng ngại giữ nguyên ([prompt hình ảnh Trận Đồ](../06-art/prompts/tran-do-hinh-anh.md)).

