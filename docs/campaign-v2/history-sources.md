# CAMP-00.02 — Historical Source Ledger

Trạng thái: **frozen baseline v1**, 2026-10-24 (Asia/Saigon). Freeze quy tắc sử dụng chứng cứ, tên chuẩn và các khoảng chưa biết; không tuyên bố mọi tranh luận sử học đã được giải quyết.

Phụ thuộc: [CAMP-00.01 — PASS](../audits/CAMP-00.01-campaign-audit.md). Snapshot code đã kiểm tra: `b99f94316b1d84c185874b43096c8eff58439618`.

## 0. Audit repo trước nghiên cứu

Đã đọc `AGENTS.md`, báo cáo CAMP-00.01; kiểm tra trực tiếp `src/core/campaign/campaign.ts`, `src/core/roster/roster.ts` và mục Campaign của `docs/design/09-che-do-choi.md`. Các interface thực có là `CampaignStage`, `StageFoe`, `StageLines`; không có source ledger hay evidence field trong runtime. Không thêm interface trong task tài liệu này.

Trước task, `docs/campaign-v2/`, `history-sources.md`, `warlord-matrix.md` và `design-freeze.md` chưa tồn tại trong checkout (đã tìm bằng `rg --files`). Hai tài liệu đầu được tạo trong task này; không giả định đã đọc hoặc được phê duyệt theo một `design-freeze.md` chưa có. Quy tắc dưới đây cần được dẫn chiếu khi lập design freeze riêng.

Các vấn đề nội dung cũ cần chặn khi viết V2, chưa sửa code:

| Nơi thực có | Nội dung hiện tại | Quyết định ledger |
|---|---|---|
| `campaign.ts`, `boHai` | Thắng Trần Lãm rồi được giao quân | Liên minh/nương tựa có evidence; trận thử tài là `fictional` |
| `binhKieu` | Ngô Xương Xí mang title “Kiều công” | Không nhận là tên chuẩn; xem W03 |
| `duongLam` | “Ngô Nam Chỉ”, title “Ngô Nam công” | Không dùng làm alias chính sử nếu chưa có nguồn; xem W04 |
| `tamDai`, `tienDu` | Kho lương cạn/đầy; “Vũ Ninh Vương” | Lương là `fictional`; danh hiệu chưa được chứng minh trong nguồn đã đọc |
| `doDong` | Cố thủ hơn một năm, là trận cuối, 11 sứ quân đã hàng | Chưa có chứng cứ cho thứ tự/timing; không giữ như `recorded` |
| `09-che-do-choi.md` mục 2 | Gọi chuỗi màn là “trình tự lịch sử” | Chỉ là thứ tự thiết kế V1, không phải evidence về thứ tự đánh dẹp |

## 1. Source ledger (lập trước hồ sơ)

Mọi URL dưới đây đã mở và đọc ngày 2026-10-24, trừ mục ghi rõ chỉ tìm thấy/không lấy được. Locator là tên mục/năm/cụm tìm trong trang, không phải số dòng trong repo. Tóm tắt do ledger diễn giải, không phải lời trích nguyên văn.

| ID | URL / tác phẩm / đơn vị xuất bản hoặc lưu trữ | Locator và tóm tắt ngắn | Hỗ trợ | Độ tin cậy và giới hạn |
|---|---|---|---|---|
| S01 | [Đại Việt sử ký toàn thư — Ngô sứ quân](https://vi.wikisource.org/wiki/Đại_Việt_sử_ký_toàn_thư/Tập_II/Cuốn_thứ_năm/Ngô_sứ_quân); bộ quốc sử Ngô Sĩ Liên và sử quan các đời, bản dịch Mạc Bảo Thần được Wikisource/Wikimedia lưu trữ; [revision 101087](https://vi.wikisource.org/w/index.php?title=Đại_Việt_sử_ký_toàn_thư/Tập_II/Cuốn_thứ_năm/Ngô_sứ_quân&oldid=101087) | Mục 966: danh sách; mục 967: Trần–Đinh, Phạm Phòng Át; phụ chú K.Đ.V.S. số 2 thừa nhận không rõ ngày tháng | W01–W12, E07–E09, U01/U02 | Cao về việc bản sử có ghi; vừa về tái hiện thế kỷ X. Sử biên soạn muộn, bản web không thay bản Hán/scan. Phụ chú là lớp nguồn khác, không lẫn với chính văn |
| S02 | [Toàn thư — Hậu Ngô Vương](https://vi.wikisource.org/wiki/Đại_Việt_sử_ký_toàn_thư/Tập_II/Cuốn_thứ_năm/Hậu_Ngô_Vương); cùng hệ bản dịch/lưu trữ S01; revision 101081 | Tân Hợi 951, Giáp Dần 954, Ất Sửu 965 | E04–E06; cuộc vây Hoa Lư, Đinh Liễn | Cao về ghi chép; vừa về chi tiết kể chuyện. Không xem lời thoại trong sử là biên bản nguyên văn |
| S03 | [Toàn thư — Đời Ngô](https://vi.wikisource.org/wiki/Đại_Việt_sử_ký_toàn_thư/Tập_II/Cuốn_thứ_năm/Đời_Ngô); cùng hệ S01 | Kỷ Hợi 939, Giáp Thìn 944, Ất Tỵ 945 | E01–E03; Ngô Quyền, Dương Tam Kha | Cao về văn bản; sự chuyển quyền có cách gắn năm khác ở các bản tổng thuật |
| S04 | [Việt Nam sử lược — Quyển I, III, II](https://vi.wikisource.org/wiki/Việt_Nam_sử_lược/Quyển_I/Phần_III/Chương_II); Trần Trọng Kim; Wikisource/Wikimedia lưu trữ tác phẩm đầu thế kỷ XX | Đinh Tiên Hoàng: đoạn 951, 968, 970 | E00, E04, E10–E11; Đỗ Động và Phạm Phòng Át | Vừa; sử tổng hợp, không là chính sử đương thời hay chứng nhân độc lập của Toàn thư |
| S05 | [Việt Nam sử lược — Quyển I, III, I](https://vi.wikisource.org/wiki/Việt_Nam_sử_lược/Quyển_I/Phần_III/Chương_I); Trần Trọng Kim; Wikisource/Wikimedia; revision 94365 | Nhà Ngô; danh sách Thập nhị sứ quân | Đối chiếu tên/danh hiệu, E01–E06 | Vừa. Bản web có lỗi “905” ở đoạn Canh Tuất; không sao chép máy móc. Bình Kiều được định vị khác S06 |
| S06 | [Tầm nhìn chiến lược của Đinh Bộ Lĩnh](https://baotanglichsu.vn/vi/Articles/3096/14529/tam-nhin-chien-luoc-cua-djinh-bo-linh.html); Bảo tàng Lịch sử Quốc gia, 18-06-2013, Hồng Thanh tổng hợp từ Phạm Như Thơm, NXB Lao động 2012, tr.254–262 | Mục “Thứ hai”: phân biệt liên kết, hàng phục, quân sự | Phân loại W01–W12; tổng quan 965–967, mốc 968 | Vừa–cao cho tổng quan; vừa cho kết cục từng người. Bài diễn giải hiện đại, không tự nâng chi tiết thành chính sử |
| S07 | [Thân thế, vai trò của Đinh Bộ Lĩnh trong việc dẹp loạn 12 sứ quân](https://baoninhbinh.org.vn/than-the-vai-tro-cua-dinh-bo-linh-trong-viec-dep-loan-12-su/d20180307085454347.htm); Báo Ninh Bình, 07-03-2018, ghi Ban Tuyên giáo Tỉnh ủy | Đoạn Lã Đường; Nguyễn Khoan; truyền thuyết Bình Kiều | W03/W05/W10; E00/E04; phân biệt truyền thuyết | Vừa. Có trộn sử sách và truyền thuyết được bài nêu rõ; không có dẫn trang sử gốc cho từng kết cục |
| S08 | [Nhà Đinh với sự nghiệp thống nhất đất nước](https://baotanglichsuquocgia.vn/vi/Articles/3096/10060/nha-djinh-voi-su-nghiep-thong-nhat-djat-nuoc.html); Bảo tàng Lịch sử Quốc gia, 21-02-2012; Hồng Ánh, nguồn Tạp chí Xưa & Nay | Đoạn năm 968; đoạn “Sau khi đặt quốc hiệu… 970” | E10/E11; quốc hiệu/định đô/niên hiệu | Cao cho mốc tổng quan, vẫn là tổng thuật; không gộp 968 và 970 vì cùng một đoạn mở đầu |
| S09 | [Có phải là loạn mười hai sứ quân?](https://tiasang.com.vn/co-phai-la-loan-muoi-hai-su-quan-4979039.html); Tia Sáng, 30-07-2013, trình bày nghiên cứu TS Trần Trọng Dương | Mục “Khái niệm”, “Điểm diện” | U01/U02/U05; cảnh báo cách gọi và mô hình 12 đối thủ | Vừa cho quan điểm nghiên cứu có tác giả, không là đồng thuận cuối cùng; các giả thuyết ghi `disputed` |
| S10 | [Đinh Bộ Lĩnh – Loạn sứ quân: từ sử liệu tới sử thực](https://nghiencuulichsu.com/2013/08/19/loan-12-su-quan/); Trần Trọng Dương; trang Nghiên Cứu Lịch Sử đăng lại 19-08-2013 | Mục II “Sử liệu 1/2”, đoạn liên minh Trần–Đinh | E04; U02/U05; chỉ dẫn Toàn thư tờ 23b–24a và Việt sử lược | Vừa cho diễn giải, thấp hơn cho độ bảo đảm bản đăng lại. Website này không đồng nhất với tạp chí học thuật cùng tên. Chưa trực tiếp đối chiếu Việt sử lược/Hán văn; không ghi là đã đọc các bản ấy |
| S11 | [Ngô sứ quân — Người Kể Sử](https://nguoikesu.com/dong-lich-su/nha-ngo/ngo-su-quan-ngo-xuong-xi); website Người Kể Sử, trích Toàn thư, không rõ đơn vị xuất bản bản dịch | Phần thân “Ngô sứ quân”, bỏ qua teaser/navigation | Đối chiếu Lữ/Lã; danh sách và quan hệ Trần–Đinh | Vừa–thấp; bản sao cùng họ nguồn, không tính là chứng cứ độc lập. Teaser có lỗi tên/năm; không dùng teaser để định niên |

Không dùng search snippet làm chứng cứ cuối; không dùng wiki tổng hợp/AI answer để quyết định kết cục. Truy cập SCOV bản Việt Nam sử lược bị timeout; dùng bản Wikisource đã mở S04, không coi SCOV là nguồn đã đọc. Chưa xác minh trực tiếp bản Hán, bản in học thuật, thần tích hoặc văn bia cho từng địa phương.

## 2. Nhãn, confidence và quy tắc freeze

| Nhãn | Ý nghĩa và điều kiện dùng |
|---|---|
| `recorded` | Có văn bản cụ thể ghi nhận, bắt buộc source ID + locator. Ghi rõ đó là chính sử hay tổng thuật. Không đồng nghĩa sự kiện chắc chắn tuyệt đối |
| `legend` | Truyền thuyết/giai thoại; dù xuất hiện trong sử vẫn giữ nhãn này cho lớp huyền thoại |
| `reconstructed` | Suy luận, nén thời gian, bố trí thứ tự/màn để chơi; không trình bày như kết luận từ nguồn |
| `fictional` | Lời thoại, tình huống, nhân vật phụ, cơ chế do game sáng tác, không có evidence sử học được nhận |
| `disputed` | Nguồn/cách đọc bất đồng hoặc có giả thuyết chưa ngã ngũ; giữ cả hai cách và quyết định biên tập |

Confidence đánh theo **claim**, không theo độ nổi tiếng của website: **cao** = mốc/nhận diện được đối chiếu; **vừa** = tổng thuật có trách nhiệm hoặc chi tiết sử muộn; **thấp** = truyền thuyết, suy luận hoặc thiếu chứng cứ. Không dùng phần trăm giả chính xác. Hai bản sao Toàn thư không là hai chứng nhân độc lập.

Phân loại quan hệ: **liên minh**, **quy phục**, **đánh dẹp**, **tan rã**, **chưa chắc**. Đây là taxonomy biên tập (`reconstructed`); evidence cho từng quan hệ vẫn phải đọc riêng. “Chưa chắc” không có nghĩa chắc chắn đã không đánh; không tìm thấy trong tập nguồn đã đọc không chứng minh chuyện đó chưa từng xảy ra.

Freeze bắt buộc:

- Thứ tự 12 dòng, thứ tự catalog V1 hoặc thứ tự liệt kê trong sử **không phải thứ tự giao chiến**. Không có ordinal defeat lịch sử cho W01–W12.
- Không biến cả 12 người thành 12 cuộc quyết đấu lịch sử. Trần Lãm dùng quan hệ liên minh; Phạm Bạch Hổ có ghi về hàng. Những kết cục còn lại có mức chứng cứ khác nhau.
- “Năm sử chép” khác “năm sự kiện chắc chắn diễn ra”; đặc biệt chuyện Trần Lãm nằm trong mục 967 không khóa được ngày bắt đầu liên minh.
- Tên thật/alias/danh hiệu/địa danh là các trường khác nhau về nghĩa; không suy ra hai người chỉ vì hai cách đọc tên.
- Khi viết content sau task này, mỗi claim phải mang `claimId`, nhãn, source IDs/locator hoặc ghi “game-authored”, confidence và unresolved. Đây là yêu cầu tài liệu, chưa là runtime schema.
- Mọi lựa chọn, phần thưởng, tuyển tướng, lương, profession/element, kỹ năng và match-3 là lớp game `fictional`; không dùng chúng chứng minh lịch sử. Campaign không phát Đá Cường Hóa; không đổi giá trị đá hay luật chiến đấu trong task này.

## 3. Hồ sơ người, triều đại và niên đại

| Claim ID | Mốc / người / sự kiện | Evidence / nhãn | Confidence / quyết định |
|---|---|---|---|
| E00 | Đinh Bộ Lĩnh gắn Hoa Lư, là con Đinh Công Trứ; tên Đinh Tiên Hoàng dùng cho giai đoạn hoàng đế | S04 mục Đinh Tiên Hoàng; S08 đoạn đầu; `recorded` (sử tổng hợp) | Cao về nhận diện. Không chốt ngày sinh chính xác hoặc đồng nhất động khởi nghiệp với toàn bộ kinh thành về sau |
| E01 | Ngô Quyền xưng vương năm 939; mất 944 | S03 hai niên mục tương ứng; `recorded` (chính sử) | Cao về mốc nền; không dùng danh hiệu hoàng đế cho Ngô Quyền trong narration |
| E02 | Dương Tam Kha chiếm quyền sau Ngô Quyền; chính văn S03 mở đời ở 945, chuyển biến gắn sau cái chết 944 | S03 “Dương Tam Kha”; S05; `recorded` + `disputed` (cách gắn năm) | Vừa. Viết “sau khi Ngô Quyền mất”, tránh tự chốt ngày/tháng tiếm quyền |
| E03 | Ngô Xương Văn lật Dương Tam Kha, Hậu Ngô có Nam Tấn Vương và Thiên Sách Vương | S05 đặt khôi phục ở 950; S02 đặt xưng vương/đón anh ở 951; `recorded` + `disputed` | Cao về người và chuyển quyền; tách mốc 950/951, không làm thành một ngày xác định. Không gọi Nam Tấn/Thiên Sách là niên hiệu |
| E04 | Cuộc phòng thủ Hoa Lư 951: hai vua Ngô đánh không hạ được, rút quân | S02 mục Tân Hợi 951; S04 đoạn 951; `recorded` (có chính sử) | Cao về khung 951/người/kết quả; vừa về diễn biến. Đây là xung đột trong cục diện Ngô, không phải trận chống ngoại xâm |
| E04a | Đinh Liễn làm con tin; sử kể bị treo dọa giết, Đinh Bộ Lĩnh sai bắn; vây hơn một tháng | S02 cùng mục; `recorded` (sử muộn, tình tiết kể lại) | Vừa về việc sử ghi, thấp hơn về diễn biến chính xác. Không chép lời thoại thành trích dẫn chứng nhân; thêm thoại game phải `fictional`. Không tự đổi thành giải cứu thành công hoặc nói Liễn chết |
| E05 | Ngô Xương Ngập mất 954 | S02 mục Giáp Dần; `recorded` | Cao về mốc đã chọn, không theo teaser 959 của S11 |
| E06 | Ngô Xương Văn mất trận năm 965 | S02 mục Ất Sửu; S05; `recorded` | Cao. Không đồng nhất địa danh Thái Bình trong trận này với tỉnh hiện đại hoặc căn cứ Trần Lãm khi chưa giải quyết địa lý |
| E07 | Danh sách 12 sứ quân trong chính văn mục 966 | S01 mục Bính Dần; `recorded` | Cao về danh sách trong truyền thống sử. Không kết luận cả 12 đồng loạt xuất hiện năm đó; S01 phụ chú số 2 cảnh báo điều này |
| E08 | Đinh Bộ Lĩnh và Liễn nương Trần Lãm; được nhận/giao binh quyền | S01 mục 967; `recorded`; thời điểm bắt đầu `disputed` theo S01 phụ chú 2/S10 | Cao về quan hệ được chép; vừa về chi tiết nhận nuôi. Quyết định **liên minh**, không “đánh bại Trần Lãm” |
| E09 | Phạm Phòng Át đem quân về hàng; sau có chức Thân vệ tướng quân | S01 mục 967; `recorded` (chính sử) | Cao về ghi chép quy phục; không thêm trận quyết đấu trước đó |
| E10 | Năm 968 Đinh Bộ Lĩnh lên ngôi hoàng đế, quốc hiệu Đại Cồ Việt, định đô Hoa Lư | S04 đoạn Mậu Thìn, S08 đoạn 968; `recorded` (sử tổng hợp đối chiếu) | Cao; mốc kết Campaign được phép dùng. Không tự gắn tất cả trận riêng vào 968 |
| E11 | Niên hiệu Thái Bình bắt đầu 970, khác mốc lên ngôi 968 | S04 đoạn Canh Ngọ; S08 đoạn “Sau khi đặt quốc hiệu… 970”; `recorded` | Cao; không đưa “Thái Bình nguyên niên” vào cảnh 968 |
| E12 | Cờ lau thuở nhỏ và bạn chăn trâu | S04 đoạn đầu, S07 đoạn sử/truyền thuyết; `legend` | Thấp về tình tiết thực tế. Được dùng với lời dẫn “tương truyền”; không khóa ngày, trận đánh hay lúc tuyển từng tướng |
| E13 | Kết thúc cát cứ thường đặt cuối 967 trước mốc 968; chiến dịch không có lịch từng trận chắc chắn | S01 mục 967 và phụ chú 2; S06/S07 tổng thuật có phạm vi năm khác; `recorded` về ghi chép, lịch chi tiết `disputed` | Vừa. Dùng khoảng thời gian rộng; thứ tự mission là `reconstructed` |

Hồ sơ 12 người, alias và kết cục: [warlord-matrix.md](warlord-matrix.md). Quan hệ thân thuộc ngoài những claim có nguồn ở đây không được tự bổ sung vào narration. Trần Lãm là W01 trong tập 12, không là người thứ 13; Đinh Bộ Lĩnh không thêm vào danh sách 12 truyền thống của S01.

## 4. Unresolved register và quyết định bảo thủ

| ID | Chưa giải quyết / bất đồng | Decision đã đóng băng |
|---|---|---|
| U01 | Thời điểm phát sinh các thế lực, độ đồng thời của “12”; S01 phụ chú và S09 phản biện khung kể phổ biến | Giữ tên giai đoạn truyền thống, không khẳng định 12 thế lực cùng nổi năm 966 hoặc có đúng 12 chiến dịch độc lập |
| U02 | Trần–Đinh bắt đầu khi nào; S01 chép trong 967 nhưng phụ chú đặt vấn đề sớm hơn | Không có ngày/năm bắt đầu bắt buộc; không gắn nhận binh quyền với thắng đấu thử |
| U03 | Bình Kiều: S05 ghi vùng Hưng Yên, S06 dùng Thanh Hóa; S01 phụ chú nói chưa rõ | Dùng “Bình Kiều” không kèm tọa độ chính xác; Thanh Hóa là định vị thông dụng trong S06, không là kết luận địa lý tuyệt đối |
| U04 | Nhật Khánh: Ngô Lãm Công; repo dùng Ngô Nam công/Ngô Nam Chỉ; Đường Lâm/Giao Thủy khác nhau | Tên chính Ngô Nhật Khánh, title ưu tiên Ngô Lãm Công theo S01/S05; hai alias repo chưa xác minh. Không suy ra là sai tuyệt đối, nhưng không xuất bản như chính sử |
| U05 | S09/S10 nêu Lã Xử Bình, Kiều Tri Hựu, Dương Huy, cách nhìn khác về loạn và nhà Ngô | Ghi `disputed`; không tự thay 12 người bằng mô hình nghiên cứu này. Lã Xử Bình không phải Lữ/Lã Đường |
| U06 | Nguyễn Khoan tan rã và Lã Đường theo về: S07 ghi, S01 không kể rõ kết cục từng người | Chấp nhận làm hướng kể có attribution S07/confidence vừa, không gắn nhãn “chính sử xác nhận” |
| U07 | Ngày mất, cách chết, viên tướng hạ từng sứ quân và trình tự trận | Chưa đủ chứng cứ trong tập đọc; để trống. Trận cuối Đỗ Động, vây một năm, thủy chiến, chết trận chỉ là game nếu sáng tác |
| U08 | Chưa có design-freeze.md hoặc duyệt chuyên gia Hán Nôm/bản in | Freeze nội bộ ledger v1 có giới hạn; design freeze tiếp theo phải nhận các khoảng trống này, không coi chúng đã giải quyết |

Không cần giải hết unresolved mới được viết game; cần gắn nhãn và không vượt giới hạn claim. Muốn nâng nhãn/confidence phải thêm nguồn và ghi rationale thay đổi ledger, không sửa im lặng.

## 5. Kiểm tra và acceptance

- [x] Phụ thuộc CAMP-00.01 đã đọc, trạng thái PASS; audit source code trước khi tạo hồ sơ.
- [x] Source IDs có URL, đơn vị lưu trữ/xuất bản, locator, tóm tắt, coverage và giới hạn tin cậy.
- [x] Có hồ sơ triều Ngô, Đinh Bộ Lĩnh, 951, Trần Lãm, 12 sứ quân, 968; phân biệt 970.
- [x] 12/12 người có evidence, confidence, unresolved và decision trong matrix.
- [x] Claim chính sử chỉ dùng nơi có locator chính sử; nguồn hiện đại không bị nâng thành chính sử.
- [x] Không có thứ tự đánh dẹp chính xác được đóng dấu lịch sử; hư cấu/legend có nhãn.

**Acceptance: PASS cho CAMP-00.02**, giới hạn là baseline biên tập có nguồn và có vùng chưa biết; không phải chứng nhận sự thật tuyệt đối hoặc duyệt kịch bản V2.

Commands thực chạy trong task: `pwd`, `rg --files` (AGENTS/history/warlord/freeze/sources/matrix/CAMP/campaign), `cat AGENTS.md`, `cat docs/audits/CAMP-00.01-campaign-audit.md`, `sed` đọc Campaign/roster, `rg -n` rà nội dung Campaign và design 09, `git rev-parse HEAD`, `git status --short`; `mkdir -p docs/campaign-v2`, shell heredoc ghi hai tài liệu; Python kiểm tra đủ 12 ID, source references, nhãn và link nội bộ; `git diff --check`. Tra cứu web dùng công cụ search/open/click, không chạy curl. Đã chạy thêm `git diff --no-index --check /dev/null <file>` cho từng tài liệu mới để kiểm tra cả file untracked; không chạy test game/build/migration/simulation cho task docs.

Rủi ro còn lại: bản web có lỗi phiên âm/đánh máy; nhiều trang chép cùng nguồn; chưa đối chiếu bản Hán/scan và nguồn riêng từng kết cục. Không sửa source V1 nên những cách kể sai lệch đã nêu vẫn còn trong game hiện tại. Không xóa dữ liệu dev/production, không đổi tài sản, reward, recruit, choice hay server authority.

Next task đề xuất: **Design freeze về nguyên tắc lịch sử và narrative outline 6 chương/24 nhiệm vụ** dựa trên claim IDs; xác định lớp `recorded`/`legend`/game của từng cảnh trước khi viết thoại hoặc triển khai. Không tự gán mã task chưa tồn tại.

Kết quả kiểm tra thực tế: Python **PASS** — 12/12 ID duy nhất, mỗi hàng đủ 6 cột, 11 source IDs không có tham chiếu thiếu, đủ 5 nhãn, link file nội bộ và dependency tồn tại. Kiểm tra whitespace hai tài liệu mới không báo lỗi. `docs/audits/` là artifact CAMP-00.01 có sẵn trước task, không phải thay đổi mới của CAMP-00.02.
