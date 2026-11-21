# Sổ nguồn Sử Lộ

> Cập nhật: 21/11/2026
> Trạng thái: **APPROVED** — Shan chốt lập sổ nguồn riêng cho Sử Lộ (14/11/2026). Dùng chung quy tắc nhãn với sổ nguồn Campaign.

Sổ này ghi nguồn và claim dùng riêng cho kho câu hỏi [Sử Lộ](gdd.md). Nguồn S01–S11, claim E00–E13, W01–W12, U01–U08 đã có ở [sổ nguồn Campaign](../campaign/history-sources.md) và [warlord matrix](../campaign/warlord-matrix.md); không chép lại ở đây. Nhãn (`recorded`, `legend`, `reconstructed`, `fictional`, `disputed`) và mức tin cậy theo [sổ nguồn Campaign mục 2](../campaign/history-sources.md#2-nhãn-confidence-và-quy-tắc-freeze).

Test `tests/core/su-lo/su-lo.test.ts` kiểm mọi câu trích (`quote`) trong kho câu hỏi có nguyên văn ở sổ Campaign hoặc sổ này, và mọi mã nguồn, mã claim đều có trong sổ.

## 1. Nguồn mới

Ngày 21/11/2026 Wikisource (Toàn thư, Việt Nam sử lược) vẫn không đọc được bằng công cụ của phiên làm việc. Kỷ nhà Đinh và kỷ nhà Lê của Toàn thư được đọc qua hai nơi lưu bản dịch khác: Người Kể Sử (đọc đủ thân bài, ghi nguồn Toàn thư) và Hội Bảo tồn Di sản Chữ Nôm (chỉ mở được trang đầu mỗi kỷ, dùng để đối chiếu). Các câu trích dưới đây chép đúng chữ trên trang, kể cả lỗi chính tả của trang; câu hỏi không chép lại lỗi đó.

| Mã | Nguồn | Phần đã đọc | Dùng cho | Giới hạn, tin cậy |
|---|---|---|---|---|
| S12 | [Đinh Tiên Hoàng – Người Kể Sử](https://nguoikesu.com/dong-lich-su/nha-dinh/dinh-tien-hoang-dinh-bo-linh); trang ghi "(Nguồn: Đại Việt Sử Ký Toàn Thư)", không ghi người dịch | Kỷ nhà Đinh, đời Tiên Hoàng: các mục Mậu Thìn 968 tới Kỷ Mão 979, đọc ngày 21/11/2026 | SL03–SL15 | Vừa. Bản sao Toàn thư cùng họ với S11, không phải chứng cứ độc lập; trang có lỗi gõ ("Liệt" thay "Liễn", "ai sứ") nên câu hỏi không dựa vào chỗ lỗi |
| S13 | [Đinh Phế Đế – Người Kể Sử](https://nguoikesu.com/dong-lich-su/nha-dinh/dinh-phe-de-dinh-toan); trang ghi nguồn Toàn thư | Đời Phế Đế: đoạn nối ngôi 979, mục Canh Thìn 980, lời bàn của Ngô Sĩ Liên; đọc ngày 21/11/2026 | SL16–SL21 | Vừa. Như S12. Trang viết "Phạm Cư Lạng"; câu hỏi dùng "Phạm Cự Lạng" theo cách viết phổ biến |
| S14 | [Lê Đại Hành – Người Kể Sử](https://nguoikesu.com/dong-lich-su/nha-tien-le/le-dai-hanh-le-hoan); thân bài có dấu tờ gốc ([14a]…) | Kỷ nhà Lê, đời Đại Hành: đoạn đầu tới hết năm 997; đọc ngày 21/11/2026 | SL22–SL27 | Vừa. Trang viết "Tôn Hoàng Hưng" ở mục 981 (S13 viết Tôn Toàn Hưng). Phần 998–1005 chưa đọc nguyên văn nên không soạn câu. Đoạn đầu trang ghi Lê Hoàn "[941 - 1006]": đây là chú năm của trang, không phải chính văn; S15, S16 đặt việc Trung Tông nối ngôi và Long Đĩnh cướp ngôi ở năm 1005, nên năm mất lấy 1005 (SL32, Shan xác nhận 21/11/2026) |
| S15 | [Lê Trung Tông – Người Kể Sử](https://nguoikesu.com/dong-lich-su/nha-tien-le/le-trung-tong-le-long-viet); trang ghi nguồn Toàn thư | Cả trang, đọc ngày 21/11/2026 | SL28 | Vừa. Trang không thống nhất Long Đĩnh là con thứ tư hay thứ năm: không hỏi thứ bậc |
| S16 | [Lê Ngọa Triều – Người Kể Sử](https://nguoikesu.com/dong-lich-su/nha-tien-le/le-ngoa-trieu-le-long-dinh); trang ghi nguồn Toàn thư | Thân bài 1005–1009, đọc ngày 21/11/2026 | SL29–SL31 | Vừa. Lời chê về tính tàn ác của Long Đĩnh chưa đọc nguyên văn nên không soạn câu |
| S17 | [Toàn thư, Kỷ nhà Đinh](https://www.nomfoundation.org/nom-project/history-of-greater-vietnam/Fulltext/24-Ky-nha-Dinh?uiLang=vn) và [Kỷ nhà Lê](https://www.nomfoundation.org/nom-project/history-of-greater-vietnam/Fulltext/26-Ky-nha-Le?uiLang=vn); Hội Bảo tồn Di sản Chữ Nôm, có Hán văn, phiên âm, dịch quốc ngữ | Chỉ trang đầu mỗi kỷ (tờ 1a, 13a); các trang sau nạp bằng nút trang, công cụ không mở được; đọc ngày 21/11/2026 | Đối chiếu E00, SL22 | Cao về văn bản (có Hán văn) nhưng mới đọc phần mở đầu |

## 2. Claim mới

| Claim | Nội dung | Nguồn, locator | Câu trích ngắn | Nhãn, tin cậy |
|---|---|---|---|---|
| SL01 | Lê Văn Hưu khen Tiền Ngô vương Ngô Quyền đã phá quân của Lưu Hoằng Tháo (Nam Hán) | S03, đời Tiền Ngô vương, lời bàn của Lê Văn Hưu; đọc ngày 14/11/2026 | "phá trăm vạn binh của Lưu Hoằng Tháo" | `recorded` (lời bàn của sử gia, không phải tường thuật trận), cao về việc sách có chép. Năm 938 và chi tiết cọc gỗ **không** có trong trang đã đọc |
| SL02 | Ngô Quyền đóng đô ở Loa thành (Cổ Loa) | S03, đoạn mở đầu đời Tiền Ngô vương; đọc ngày 14/11/2026 | "đóng đô ở Loa thành" | `recorded`, cao |
| SL03 | Năm 968 Đinh Bộ Lĩnh lên ngôi, quốc hiệu Đại Cồ Việt, dời kinh ấp về Hoa Lư | S12 mục Mậu Thìn 968 | "đặt quốc hiệu là Đại Cồ Việt, dời Kinh ấp về động Hoa Lư" | `recorded`, cao (khớp E10) |
| SL04 | Năm 968 bầy tôi dâng tôn hiệu Đại Thắng Minh Hoàng Đế | S12 mục Mậu Thìn 968 | "Bầy tôi dâng tôn hiệu là Đại Thắng Minh Hoàng Đế" | `recorded`, vừa |
| SL05 | Đặt vạc lớn ở sân triều, nuôi hổ trong cũi để răn kẻ trái phép | S12 mục Mậu Thìn 968 | "Kẻ nào trái phép phải chịu tội bỏ vạc dầu, cho hổ ăn" | `recorded`, vừa |
| SL06 | Năm 969 phong con trưởng Liễn làm Nam Việt Vương | S12 mục Kỷ Tỵ 969 | "phong con trưởng là Liễn làm Nam Việt Vương" | `recorded`, vừa |
| SL07 | Năm 970 lập năm hoàng hậu | S12 mục Canh Ngọ 970 | "Lập 5 hoàng hậu" | `recorded`, vừa |
| SL08 | Năm 971 định cấp bậc văn võ: Nguyễn Bặc làm Định quốc công, Lưu Cơ làm Đô hộ phủ sĩ sư, Lê Hoàn làm Thập đạo tướng quân | S12 mục Tân Mùi 971 | "Lấy Nguyễn Bặc làm Định quốc công, Lưu cơ làm Đô hộ phủ sĩ sư" | `recorded`, vừa. Đinh Điền **không** có trong mục này |
| SL09 | Năm 971 Ngô Chân Lưu được ban hiệu Khuông Việt đại sư, Trương Ma Ni làm Tăng lục | S12 mục Tân Mùi 971 | "được ban hiệu là Khuông Việt đại sư, Trương Ma Ni làm Tăng lục" | `recorded`, vừa |
| SL10 | Năm 973 nhà Tống sai sứ phong vua làm Giao Chỉ Quận Vương | S12 mục Quý Dậu 973 | (trang gõ lỗi "ai sứ", không trích) | `recorded`, vừa |
| SL11 | Năm 974 định quân mười đạo, mỗi đạo 10 quân | S12 mục Giáp Tuất 974 | "quy định về quân mười đạo: mỗi đạo có 10 quân" | `recorded`, vừa |
| SL12 | Năm 978 lập con nhỏ Hạng Lang làm hoàng thái tử, phong con thứ Toàn làm Vệ Vương | S12 mục Mậu Dần 978 | "phong con thứ là Toàn làm Vệ Vương" | `recorded`, vừa |
| SL13 | Năm 979 Nam Việt Vương Liễn bất bình, sai người giết Hạng Lang | S12 mục Kỷ Mão 979 | "Liễn vì vậy bất bình, sai người ngầm giết đi." | `recorded`, vừa |
| SL14 | Mùa đông năm 979 Đỗ Thích giết vua và Nam Việt Vương Liễn; Nguyễn Bặc bắt Đỗ Thích đem chém | S12 mục Kỷ Mão 979 | "lại giết luôn cả Nam Việt Vương Liễn"; "Đinh quốc công Nguyễn Bặc sai người bắt đem chém" | `recorded`, vừa |
| SL15 | Đinh Điền và Lê Hoàn rước Vệ Vương Toàn lên ngôi | S12 mục Kỷ Mão 979 | "rước Vệ Vương Toàn lên ngôi Hoàng đế" | `recorded`, vừa |
| SL16 | Đinh Toàn nối ngôi khi mới 6 tuổi | S13 đoạn đầu đời Phế Đế | "Vua nối ngôi khi mới 6 tuổi." | `recorded`, vừa |
| SL17 | Lê Hoàn nhiếp chính, tự xưng Phó Vương | S13 đoạn trước mục 980 | "tự xưng là Phó Vương" | `recorded`, vừa |
| SL18 | Nguyễn Bặc, Đinh Điền, Phạm Hạp ngờ Lê Hoàn hại vua nhỏ nên khởi binh; Lê Hoàn chém Điền tại trận, bắt Bặc đem chém | S13 đoạn trước mục 980 | "ngờ Hoàn sẽ làm điều bất lợi cho vua nhỏ"; "chém Điền tại trận" | `recorded`, vừa. Ngô Sĩ Liên bàn rằng họ khởi binh "không phải làm loạn" |
| SL19 | Ngô Nhật Khánh dẫn hơn nghìn thuyền Chiêm Thành theo cửa biển Đại Ác, Tiểu Khang định đánh Hoa Lư; gặp bão, thuyền lật đắm, chỉ thuyền vua Chiêm thoát | S13 mục Canh Thìn 980 | "dẫn thuyền quân Chiêm Thành hơn nghìn chiếc vào cướp"; "theo hai cửa biển Đại Ác và Tiểu Khang"; "gặp gió bão nổi lên, thuyền đều lật đắm"; "chỉ có thuyền của vua Chiêm thoát trở về nước" | `recorded`, vừa. Toàn thư chép ở năm 980, không phải 979 |
| SL20 | Năm 980 Hầu Nhân Bảo dâng thư xin vua Tống đánh; Tống cử Hầu Nhân Bảo, Tôn Toàn Hưng… hẹn ngày cùng sang | S13 mục Canh Thìn 980, tháng 6 và 7 | "Thái thường bác sĩ Hầu Nhân Bảo dâng thư tâu với vua Tống"; "Lan Lãng đoàn luyện sứ Tôn Toàn Hưng"; "hẹn ngày cùng sang xâm lược" | `recorded`, vừa |
| SL21 | Phạm Cự Lạng và tướng sĩ tôn Lê Hoàn; thái hậu khoác áo long cổn, mời lên ngôi; Lê Hoàn đổi niên hiệu Thiên Phúc, giáng vua nhỏ làm Vệ Vương | S13 mục Canh Thìn 980 | "trước hãy tôn lập ông Thập đạo làm Thiên tử"; "sai lấy áo long cổn khoác lên người" | `recorded`, vừa |
| SL22 | Lê Hoàn người Ái Châu | S14 đoạn đầu; S17 tờ 13a | "Họ Lê, tên huý là Hoàn, người Ái Châu" | `recorded`, cao (hai nơi lưu khớp nhau) |
| SL23 | Năm 981 Lê Hoàn đóng cọc ngăn sông Chi Lăng, sai quân trá hàng dụ Hầu Nhân Bảo rồi chém | S14 mục Tân Tỵ 981 | "sai quân sĩ đóng cọc ngăn sông Chi Lăng"; "Vua sai quân sĩ trá hàng để dụ Nhân Bảo, đem chém" | `recorded`, vừa |
| SL24 | Năm 982 sứ Từ Mục, Ngô Tử Canh bị Chiêm Thành giữ; vua đánh Chiêm, chém Bê Mi Thuế, san phẳng thành trì | S14 mục Nhâm Ngọ 982 | "sang sứ Chiêm Thành, bị người Chiêm bắt giữ"; "san phẳng thành trì, phá hủy tông miếu" | `recorded`, vừa |
| SL25 | Năm 982 lập Hoàng thái hậu nhà Đinh là Dương thị làm Đại Thắng Minh Hoàng Hậu | S14 mục Nhâm Ngọ 982 | "Lập Hoàng thái hậu nhà Đinh là Dương thị làm Đại Thắng Minh Hoàng Hậu" | `recorded`, vừa |
| SL26 | Năm 987 vua lần đầu cày ruộng tịch điền ở núi Đọi | S14 mục Đinh Hợi 987 | "vua lần đầu cày ruộng tịch điền ở núi Đọi" | `recorded`, vừa |
| SL27 | Niên hiệu Hưng Thống bắt đầu năm 989, Ứng Thiên năm 994; năm 989 phong thái tử Thau làm Kình Thiên Đại Vương, Ngân Tích làm Đông Thành Vương, Việt làm Nam Phong Vương | S14 mục Kỷ Sửu 989 và Giáp Ngọ 994 | "Phong thái tử Thau làm Kình Thiên Đại Vương" | `recorded`, vừa |
| SL28 | Lê Long Việt (Trung Tông) lên ngôi được 3 ngày thì bị em cùng mẹ là Long Đĩnh giết | S15 đoạn đầu | "Lên ngôi được 3 ngày thì bị em cùng mẹ là Long Đĩnh giết" | `recorded`, vừa |
| SL29 | Long Đĩnh mắc bệnh trĩ phải nằm coi chầu nên gọi Ngọa Triều | S16 đoạn đầu | "vì vua mắc bệnh trĩ phải nằm mà coi chầu" | `recorded`, vừa |
| SL30 | Niên hiệu Cảnh Thụy năm thứ 1 là năm 1008 | S16 mục Mậu Thân 1008 | "niên hiệu Cảnh Thụy năm thứ 1" | `recorded`, vừa |
| SL31 | Tháng 10 năm 1009 vua băng; Chi hậu Đào Cam Mộc dò ý Lý Công Uẩn, Lý Công Uẩn lên ngôi | S16 mục Kỷ Dậu 1009 | "Khi ấy Chi hậu là Đào Cam Mộc dò biết Công Uẩn có muốn nhận việc truyền ngôi" | `recorded`, vừa |
| SL32 | Lê Hoàn mất năm 1005 (Ất Tỵ); Long Việt nối ngôi, được 3 ngày thì bị Long Đĩnh giết, cùng năm | S15 đoạn đầu (Long Việt "983-1005"); S16 thân bài mở đầu năm 1005 | (không trích; mục Ất Tỵ 1005 của S14 chưa đọc được nguyên văn) | `recorded`, vừa. Số 1006 ở đoạn đầu S14 là chú năm của trang, không dùng |

## 3. Câu trích bổ sung cho claim đã có

| Claim | Nguồn, locator | Câu trích ngắn |
|---|---|---|
| E01 | S03, đời Ngô, mục Kỷ Hợi 939; đọc ngày 14/11/2026 | "mùa Xuân, Vương mới xưng vương, lập Dương thị làm vương hậu" |

## 4. Duyệt câu hỏi

- **Lần 1 (Claude):** đối chiếu từng câu với sổ: nguồn, locator, đáp án, đáp án nhiễu, nhãn. Đạt thì đặt `status: "verified"`.
- **Lần 2 (Shan):** duyệt trên bản chơi thử hoặc bảng trong PR, đạt thì đặt `status: "approved"`.

Bản chơi thử dùng cả câu `verified` và `approved`; câu `draft` và `retired` không vào lượt chơi.
