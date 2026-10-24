# CAMP-00.03 — Narrative Bible

> Cập nhật: 24/10/2026

Trạng thái: **content freeze v1** cho cấu trúc kể chuyện 6 chương/24 nhiệm vụ. Đọc cùng [Historical Source Ledger](history-sources.md) và [Warlord Matrix](warlord-matrix.md). Bảng mission tự chứa ở [mission-matrix.md](mission-matrix.md).

## 1. Phạm vi và tình trạng dependency

CAMP-00.02 đã PASS và là nguồn lịch sử bắt buộc. Audit repo ở đầu task xác nhận runtime hiện chỉ có `CampaignStage`, `StageFoe`, `StageLines`, catalog 13 màn và sáu `HERO_COMPANIONS`; chưa có chapter/mission schema V2. Không sửa các interface hoặc game code trong task tài liệu này.

Khi CAMP-00.03 bắt đầu chưa có README/design freeze upstream, nên bảng M01–M24 được viết thành proposal tự chứa. [CAMP-00.04 Design Freeze](design-freeze.md) nay đã chấp nhận bảng đó làm canonical; mọi implementation phải đọc Narrative Bible, Mission Matrix và Design Freeze cùng nhau.

## 2. Trụ cột kể chuyện đã chốt

1. **951 — quyền lực trung ương và Hoa Lư đối đầu.** Hai vua Ngô đánh Hoa Lư không hạ được rồi rút. Đinh Liễn bị giữ làm con tin là điều sử có chép; diễn biến và lời nói chỉ được kể gián tiếp, không gán câu nguyên văn cho nhân vật (E04/E04a, S02).
2. **Bố Hải — liên minh, không phải chinh phục.** Đinh Bộ Lĩnh cùng Đinh Liễn nương Trần Lãm; Trần Lãm giao binh quyền. Thời điểm bắt đầu còn tranh luận. Không có trận tay đôi hoặc “thắng để được nhận” nào được trình bày như lịch sử (E08, U02, W01).
3. **965–967 — chiến dịch theo địa lý.** Sau khi Ngô Xương Văn mất năm 965, câu chuyện đi qua các vùng nhằm tạo nhịp chơi và bản đồ dễ hiểu. Thứ tự M11–M21 là `reconstructed`, không phải chronology đánh dẹp được nguồn xác nhận (E06–E09, E13, U01/U07).
4. **968 — đăng quang.** Đinh Bộ Lĩnh lên ngôi hoàng đế, đặt quốc hiệu Đại Cồ Việt và định đô Hoa Lư. Niên hiệu Thái Bình bắt đầu năm 970 nên không xuất hiện như niên hiệu tại M24 (E10/E11).
5. **Thống nhất không đồng nghĩa giết hết đối thủ.** Liên minh, quy phục, tan rã và đánh dẹp là bốn kết cục khác nhau. “Sứ quân” không mặc định là phản diện.
6. **Con người trước biểu tượng.** Mạch cảm xúc đi từ bảo vệ cộng đồng, học cách liên kết, nhìn thấy giá của chia cắt, đến trách nhiệm xây dựng một trật tự chung.

Thông điệp trung tâm: **thống nhất được tạo nên bằng cả sức mạnh, liên minh và khả năng khiến nhiều cộng đồng chấp nhận cùng một trật tự**. Game không tuyên bố Đinh Bộ Lĩnh đã đánh 12 trận theo một tuyến duy nhất.

## 3. Kết cấu sáu chương

| Chương | Nhiệm vụ | Câu hỏi kịch tính | Điểm kết |
|---|---|---|---|
| I — Hoa Lư dựng cờ | M01–M04 | Một thủ lĩnh địa phương bảo vệ người theo mình bằng cách nào? | Hoa Lư đứng vững sau cuộc tiến quân năm 951 |
| II — Cửa Bố kết minh | M05–M08 | Sức mạnh có thể được trao bằng lòng tin thay vì chiến thắng không? | Liên minh Trần–Đinh hình thành; trách nhiệm cầm quân được chuyển giao |
| III — Nhà Ngô rạn vỡ | M09–M12 | Khi trung tâm suy yếu, thuyết phục có thể thay gươm giáo ở đâu? | Hai kết cục quy phục được đặt cạnh bản đồ cát cứ |
| IV — Miền tây tự giữ | M13–M16 | Làm sao phân biệt người giữ đất với kẻ phải đánh? | Các thế lực phía tây được xử lý bằng ba mô hình khác nhau |
| V — Vòng cung phía đông | M17–M20 | Một chiến dịch thống nhất phải trả giá gì khi nguồn chỉ còn tên và địa bàn? | Tuyến địa lý khép lại, không tuyên bố thứ tự lịch sử |
| VI — Về một mối | M21–M24 | Thắng trận khác gì với dựng được chính quyền? | Năm 968: đăng quang, Đại Cồ Việt, Hoa Lư |

### Chương I — Hoa Lư dựng cờ

M01 mở bằng truyền thuyết cờ lau như ký ức cộng đồng, không phải cutscene “sự thật camera ghi lại”. M02 đặt cái chết của Ngô Quyền và biến động quyền lực làm bối cảnh. M03 là một tình huống phòng bị tổng hợp do game dựng để dạy người chơi đọc địa hình và chịu trách nhiệm với dân. M04 là mốc lịch sử 951; victory screen nói “Hoa Lư đứng vững”, không nói “nhà Ngô bị tiêu diệt”.

Nhịp cảm xúc: **khát vọng → bất ổn → trách nhiệm → tự chủ**.

### Chương II — Cửa Bố kết minh

M05 đưa người chơi rời Hoa Lư mà không khóa năm chính xác. M06 là buổi gặp Trần Lãm, trình diễn dưới dạng hội kiến và lựa chọn giọng đáp; không có HP bar của Trần Lãm. M07 là bài phối hợp quân sự hoàn toàn fictional chống một nhóm vô danh, dùng để thể hiện hai lực lượng học cách phối hợp. M08 kể việc giao trách nhiệm sau khi Trần Lãm mất theo nguồn, nhưng không dựng lời trăng trối nguyên văn.

Nhịp cảm xúc: **thăm dò → tin cậy → phối hợp → kế thừa**.

### Chương III — Nhà Ngô rạn vỡ

M09 dùng bản đồ và tin báo để đặt cái chết năm 965 của Ngô Xương Văn; không biến cái chết ấy thành chiến công của người chơi. M10 cho người chơi khảo sát cục diện 12 thế lực: đây là framing `reconstructed`, đồng thời giải thích rằng danh sách sử không cho ta lịch đánh trận. M11 xử lý Phạm Bạch Hổ bằng quy phục có nguồn. M12 dành cho Ngô Xương Xí: sức ép và thương lượng, không tuyên bố một trận thắng ở Bình Kiều.

Nhịp cảm xúc: **khoảng trống quyền lực → nhìn toàn cục → thu phục → kiềm chế**.

### Chương IV — Miền tây tự giữ

M13 gặp Ngô Nhật Khánh bằng ngoại giao có sức ép; quan hệ về sau không được suy từ màn này. M14 biểu diễn thế lực Nguyễn Khoan tan rã qua việc bảo vệ dân rút khỏi một cứ điểm tổng hợp, không dựng “vây đói Tam Đái” thành sử thật. M15–M16 là hai encounter đánh dẹp dựa trên tổng thuật, còn chiến trường, đội hình và lời thoại là game-authored.

Nhịp cảm xúc: **thỏa hiệp → tan rã → xung đột → bền chí**.

### Chương V — Vòng cung phía đông

M17–M20 đi theo tuyến địa lý phục vụ pacing: Siêu Loại, Tiên Du, Tế Giang, Tây Phù Liệt. Lý Khuê, Nguyễn Thủ Tiệp và Nguyễn Siêu thuộc nhóm “đánh dẹp” trong tổng thuật; Lữ Đường thuộc hướng “quy phục” nhưng chứng cứ kết cục yếu hơn. Không màn nào nêu ngày, thứ tự ordinal, người giết hoặc lời cuối lịch sử.

Nhịp cảm xúc: **áp lực kéo dài → thử thách ý chí → mở đường bằng thương lượng → trận đánh lớn cuối tuyến**.

### Chương VI — Về một mối

M21 đặt Đỗ Động ở đầu chương cuối vì đây là một cứ điểm có ghi “phá được”, nhưng không gọi là trận cuối lịch sử. M22 là hậu quả chiến dịch: thu nhận người rời bỏ các cứ điểm và giải giáp một nhóm composite; không tạo “sứ quân thứ 13”. M23 là hội nghị trước khi dựng triều, nơi các companion cameo phát biểu bằng fictional voice. M24 là lễ đăng quang năm 968; kết thúc bằng trách nhiệm cai trị, không bằng loot hoặc tuyển thêm tướng.

Nhịp cảm xúc: **đột phá → hàn gắn → đồng thuận → kiến lập**.

## 4. Voice bible

### Ranh giới claim và voice

- `historical claim`: lời dẫn trung tính, có claim/source ID trong mission matrix. Chỉ nói điều nguồn hỗ trợ.
- `fictional voice`: mọi câu nhân vật nói trong game. Không đặt trong ngoặc kép rồi gắn cho sử liệu; không dùng “sử chép rằng ông nói…” trừ khi ledger duyệt riêng.
- `legend voice`: người kể chuyện giới thiệu bằng “tương truyền”, “chuyện kể ở vùng này”.
- `reconstructed bridge`: lời dẫn “trong game, hành trình tiếp tục về…” hoặc “ta chọn đi theo tuyến…” khi nối địa lý.

Mỗi scene script sau này phải khai báo `voice: fictional` cho thoại và `basis: E…/W…` cho lời dẫn. Voice fictional được phép thể hiện thái độ, không được lén thêm ngày tháng, quan hệ họ hàng, cái chết hoặc kết cục chưa có nguồn.

### Phong cách tiếng Việt

- Câu ngắn, hiện đại, dễ đọc; giữ sắc thái trang trọng vừa phải.
- Dùng “ta”, “ông”, “các vị”, “người trong vùng”; tránh giả cổ dày đặc và thành ngữ hiện đại gây lệch thời.
- Nhân vật lịch sử không đọc diễn văn kiến thức. Bối cảnh do narrator hoặc UI codex nói.
- Sứ quân có lý do bảo vệ địa bàn; tránh thoại “ta là ác nhân”.
- Không dùng lời thoại hiện tại của V1 làm chứng cứ. Có thể tái viết hoàn toàn.

### Mẫu thoại được phép dùng

Tất cả câu dưới đây là **fictional voice**, không phải trích dẫn:

| Tình huống | Người nói | Thoại mẫu |
|---|---|---|
| Trước M04 | Đinh Liễn | “Nếu họ vào được khe núi, người trong động sẽ không còn đường lui.” |
| M06 hội kiến | Trần Lãm | “Ta cần người biết giữ lời. Ngươi cần một nơi để gom sức. Ta nghĩ đôi bên nên nói chuyện.” |
| M06 đáp lời | Đinh Bộ Lĩnh | “Tôi đến để cùng làm việc lớn, không phải để tranh hơn thua với ông.” |
| M11 quy phục | Phạm Bạch Hổ | “Đằng Châu theo một mối, với điều kiện dân và quân của ta được đối đãi công bằng.” |
| M12 kiềm chế | Ngô Xương Xí | “Dòng họ Ngô không thể chỉ còn là cái cớ cho thêm một trận đánh.” |
| M21 trước trận | Đỗ Cảnh Thạc | “Đỗ Động sẽ tự quyết lấy đường của mình. Muốn đi qua, các ông phải chứng minh được sức mạnh ấy.” |
| M24 | Narrator | “Năm 968, Đinh Bộ Lĩnh lên ngôi hoàng đế, đặt quốc hiệu Đại Cồ Việt và định đô ở Hoa Lư.” |

Cấm dùng câu mẫu M21 để kết luận Đỗ Cảnh Thạc là người cuối cùng chống cự. Câu M24 là claim narrator dựa E10, không phải lời nhân vật.

## 5. Cameo bible

Sáu người đã tồn tại trong `HERO_COMPANIONS`, nhưng timing gia nhập của V1 là thiết kế cũ, không phải lịch sử đã được CAMP-00.02 xác nhận. Trong V2, **cameo không đồng nghĩa recruit/unlock**.

| Nhân vật | Mission cameo | Vai trò trình diễn | Basis và giới hạn |
|---|---|---|---|
| Nguyễn Bặc | M01, M03, M23 | Người quen Hoa Lư; tiếng nói trực diện về bảo vệ cộng đồng | E12/S07 ở lớp `legend`; không nói ông được tuyển tại M01 |
| Đinh Điền | M03, M07, M23 | Tổ chức đội ngũ và phối hợp thao luyện | E12/S07 `legend` cho nhóm bạn; nhiệm vụ cụ thể `fictional` |
| Lưu Cơ | M10, M14, M23 | Đọc bản đồ, nhắc giới hạn thông tin | E12/S07 `legend` cho liên hệ sớm; vai trò quân sư `fictional`; không gán hạ Lý Khuê |
| Trịnh Tú | M05, M18, M23 | Liên lạc và bảo toàn dân thường | E12/S07 `legend`; vai trò y tế/hậu cần là `fictional` |
| Đinh Liễn | M04, M05, M09, M23, M24 | Con trai, nhân chứng của 951 và người trở về Hoa Lư sau biến cố 965 | E04/E04a và S02 mục 965; không dùng cameo để định tuổi chính xác hoặc recruit |
| Lê Hoàn | M19, M22, M23, M24 | Một chỉ huy trẻ xuất hiện muộn trong story; góp góc nhìn về tổ chức lực lượng | S04 ghi chức vụ dưới triều Đinh sau 968, không chứng minh thời điểm gia nhập; toàn bộ cameo tiền 968 là `reconstructed` |

Các cameo có thể xuất hiện trong cutscene dù chưa là unit sở hữu. Unlock/recruit cụ thể để task progression quyết định, phải server-authoritative và idempotent; narrative bible không trao tướng hoặc thưởng. Campaign không phát Đá Cường Hóa.

## 6. Quy tắc lựa chọn trình diễn

“Lựa chọn” trong CAMP-00.03 là lựa chọn câu đáp, góc nhìn hoặc thứ tự xem thông tin; không thay đổi kết cục lịch sử đã chốt. Các lựa chọn:

- không cấp reward, recruit, unlock hay completion;
- không tạo route trong đó một nhân vật lịch sử sống/chết trái nhau;
- có thể đổi một câu phản hồi hoặc codex entry;
- khi triển khai phải gửi lựa chọn lên server nếu nó được lưu; client không tự cấp bất kỳ tài sản nào;
- mission completion vẫn dựa kết quả server, chống nhận hai lần theo contract chung.

## 7. Những điều không được viết như lịch sử

- Trần Lãm thua Đinh Bộ Lĩnh trong một cuộc đấu tay đôi hoặc trận chinh phục.
- Đỗ Cảnh Thạc là sứ quân cuối cùng, cố thủ hơn một năm, và 11 người trước đều đã hàng.
- M11–M21 là thứ tự đánh dẹp chính xác.
- Nguyễn Bặc, Đinh Điền, Lưu Cơ, Trịnh Tú hoặc Lê Hoàn gia nhập đúng tại một mission cụ thể.
- “Ngô Nam Công/Ngô Nam Chỉ”, “Kiều công” cho Ngô Xương Xí, “Vũ Ninh Vương” hoặc “Đỗ Lệnh Công” là danh hiệu đã xác minh.
- Nghề, nguyên tố, phó tướng, lượng lương, địa hình match-3 hoặc lời thoại là chứng cứ sử học.

## 8. Freeze và tiêu chí thay đổi

M01–M24, sáu chương, bốn trụ cột niên đại, phân loại kết cục và cameo placement là content freeze v1. Thay đổi thứ tự hoặc historical basis phải cập nhật đồng thời hai tài liệu CAMP-00.03 và chỉ ra claim/source mới. Gameplay type/presentation có thể tinh chỉnh trong implementation nhưng không được đổi nghĩa lịch sử.

Điểm chờ upstream: tạo `docs/campaign-v2/README.md` và `design-freeze.md`, hoặc xác nhận bảng mission này là nguồn canonical. Nếu upstream đưa bảng khác, task reconciliation phải hoàn tất trước khi code hóa stage IDs.
