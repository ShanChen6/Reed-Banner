# CAMP-00.02 — Warlord matrix: 12 sứ quân

Baseline v1: 2026-10-24. Đọc cùng [source ledger và quy tắc nhãn](history-sources.md). Số W01–W12 chỉ là khóa hồ sơ, **không là thứ tự đánh dẹp**. Existing fighter ID chỉ dùng truy vết code V1, không sửa ID/data trong task này.

`Cao/vừa/thấp` sau đây tách **nhận diện** khỏi **kết cục**. Tên và địa bàn truyền thống của cả 12 có ghi ở **S01, mục Bính Dần 966**, đối chiếu **S05, danh sách Thập nhị sứ quân**. Quan hệ/kết cục ở nguồn hiện đại được ghi đúng tầng, không nhận vơ là chính sử. Các link source IDs trỏ về ledger chứa URL và đơn vị xuất bản.

## 1. Ma trận evidence, confidence, unresolved, decision

| ID / tên chuẩn / fighter ID hiện có | Evidence nhận diện, danh hiệu và địa bàn | Phân loại quan hệ/kết cục; evidence và nhãn | Confidence (nhận diện / kết cục) | Unresolved | Decision cho content V2 |
|---|---|---|---|---|---|
| W01 **Trần Lãm** / `tranLam` | [S01](history-sources.md#1-source-ledger-lập-trước-hồ-sơ) mục 966: Trần Minh Công, Bố Hải Khẩu | **Liên minh**: S01 mục 967 ghi nương tựa, nhận nuôi/giao quân; `recorded` (chính sử), E08 | Cao / cao về quan hệ, vừa về chi tiết | U02: thời điểm bắt đầu và mất chưa khóa | Không dựng chiến thắng quân sự trước ông thành lịch sử; đấu thử nếu có là `fictional` |
| W02 **Phạm Bạch Hổ** / `phamBachHo` | S01 mục 966: Phạm Phòng Át, Đằng Châu | **Quy phục**: S01 mục 967 ghi đem quân về hàng; `recorded` (chính sử), E09 | Cao / cao | U07: không rõ thương thuyết/trận trước đó | Dùng quy phục; không bắt buộc màn giết/hạ tướng để mô tả lịch sử |
| W03 **Ngô Xương Xí** / `ngoXuongXi` | S01 mục 966: Bình Kiều; mở mục ghi con Thiên Sách Vương. Dùng “Ngô sứ quân” như cách gọi | **Quy phục** theo S06 mục chính trị; `recorded` (tổng thuật), không có tường thuật đầu hàng riêng ở S01. Khao quân uy hiếp ở S07 là `legend` | Cao / vừa; tình tiết legend thấp | U03: vị trí Bình Kiều; cách quy phục và ngôi vị cần thận trọng | Không title “Kiều công”; không biến Bình Kiều thành trận thắng xác định. Nếu tái dựng thương lượng: `reconstructed` |
| W04 **Ngô Nhật Khánh** / `ngoNhatKhanh` | S01 mục 966: Ngô Lãm Công, Đường Lâm; chính văn nêu dị thuyết Giao Thủy | **Quy phục** theo S06 mục chính trị; `recorded` (tổng thuật) | Cao / vừa | U04: alias/title repo, địa bàn; U07: thời điểm và điều kiện | Tên chính cố định, title ưu tiên Ngô Lãm Công; không mặc định quy phục đồng nghĩa trung thành vĩnh viễn |
| W05 **Nguyễn Khoan** / `nguyenKhoan` | S01 mục 966: Nguyễn Thái Bình, Tam Đái | **Tan rã**, nhưng **chưa chắc** về cơ chế: S07 đoạn Nguyễn Khoan; `recorded` (tổng thuật), cơ chế `reconstructed` nếu viết thêm | Cao / vừa–thấp | U06/U07: thiếu dẫn sử gốc, không biết cách/mốc tan rã | Không khẳng định vây đói; dùng “thế lực tan rã theo tổng thuật S07” hoặc bỏ chi tiết |
| W06 **Kiều Công Hãn** / `kieuCongHan` | S01 mục 966: Kiểu Công Hãn/Kiểu Tam Chế, Phong Châu | **Đánh dẹp** theo S06 mục quân sự; `recorded` (tổng thuật) | Cao / vừa | U07: trận, đường rút, người hạ; U05: không tự đồng nhất Kiều Tri Hựu | Có thể dựng encounter `reconstructed`; cái chết/trận cụ thể chưa được xác nhận |
| W07 **Kiều Thuận** / `kieuThuan` | S01 mục 966: Kiểu Thuận/Kiểu Lệnh Công, Hồi Hồ | **Đánh dẹp** theo S06; `recorded` (tổng thuật) | Cao / vừa | U07: không rõ chi tiết đầm lầy, thành và kết thúc | Địa bàn có evidence; sa lầy/luật bàn cờ là `fictional` |
| W08 **Lý Khuê** / `lyKhue` | S01 mục 966: Lý Lãng Công, Siêu Loại; S05 có Lý Lang Công | **Đánh dẹp** theo S06; `recorded` (tổng thuật) | Cao / vừa | U07: ai chỉ huy, chết trận hay đầu hàng sau đánh | Không gắn Lưu Cơ là người hạ nếu chưa thêm nguồn; “giáp dày nhất vùng” là `fictional` |
| W09 **Nguyễn Thủ Tiệp** / `nguyenThuTiep` | S01 mục 966: Nguyễn Lệnh Công, Tiên Du | **Đánh dẹp** theo S06; `recorded` (tổng thuật) | Cao / vừa | U07: danh hiệu Vũ Ninh Vương trong repo chưa có nguồn nhận; chi tiết trận | Dùng Nguyễn Lệnh Công; kho lương đầy chỉ `fictional`, không suy từ địa danh |
| W10 **Lữ Đường** / `luDuong` | S01 mục 966 dùng Lã Đường/Lã Tá Công; S05 dùng Lữ Đường/Lữ Tá Công; Tế Giang | **Quy phục**, còn **chưa chắc** chi tiết: S07 đoạn Lã Đường; `recorded` (tổng thuật). S06 chưa xác định rõ cách kết thúc | Cao / vừa–thấp | U06/U07: nguồn gốc kết luận theo về; không suy là thủy chiến | Lữ Đường là tên hiển thị chuẩn, Lã Đường alias hợp lệ; không gộp với Lã Xử Bình |
| W11 **Nguyễn Siêu** / `nguyenSieu` | S01 mục 966: Nguyễn Hữu Công, Tây Phù Liệt | **Đánh dẹp** theo S06; `recorded` (tổng thuật) | Cao / vừa | U07: quân số, lớp lũy, ngày mất, vị trí trong chuỗi trận | Không chốt “hơn vạn quân” hoặc lũy lửa như dữ kiện; encounter là tái dựng |
| W12 **Đỗ Cảnh Thạc** / `doCanhThac` | S01 mục 966: Đỗ Cảnh Công, Đỗ Động Giang | **Đánh dẹp**: S04 mục Đinh Tiên Hoàng nói phá Đỗ Động; S06 đối chiếu. `recorded` (sử tổng hợp); S01 967 nói chiến dịch vùng sông/động nhưng không tự đồng nhất mọi lực lượng với cá nhân ông | Cao / vừa–cao về đánh dẹp, thấp về trận cụ thể | U07: không chứng minh trận cuối, một năm vây thành, người giết | Dùng Đỗ Cảnh Công; làm final boss là `reconstructed`, không là thứ tự lịch sử |

Các từ “quy phục” và “đánh dẹp” không cho phép suy ra tự động cái chết, bị giết, bị bắt hay trở thành đồng đội. **Không có hàng nào được duyệt ordinal defeat hoặc ngày chết riêng.** Không có kết cục cụ thể trong chính văn không phải bằng chứng phủ định kết cục ở tổng thuật.

## 2. Chuẩn tên, alias và danh hiệu

Quy tắc biên tập: tên hiển thị hiện đại có dấu, viết hoa danh hiệu thống nhất; alias giữ nguyên dạng nguồn để tìm kiếm, không tạo fighter mới. Chuẩn tên là quyết định dự án (`reconstructed`), không tuyên bố cách đọc khác là sai tuyệt đối.

| Tên chuẩn | Alias có evidence trong tập nguồn | Danh hiệu ưu tiên | Không dùng như alias chính sử đã xác nhận |
|---|---|---|---|
| Trần Lãm | Trần Minh Công (S01) | Trần Minh Công | Không đổi Lãm thành Lâm chỉ do cách gõ |
| Phạm Bạch Hổ | Phạm Phòng Át (S01) | Phạm Phòng Át | Phạm Lệnh Công là người khác trong chuyện triều Ngô S03 |
| Ngô Xương Xí | Ngô sứ quân (tên mục S01) | Không buộc title cá nhân; dùng Ngô sứ quân | “Kiều công” của repo |
| Ngô Nhật Khánh | Ngô Lãm Công (S01/S05) | Ngô Lãm Công | Ngô Nam công, Ngô Nam Chỉ: chỉ lưu **alias repo chưa xác minh**, không alias được duyệt |
| Nguyễn Khoan | Nguyễn Thái Bình (S01) | Nguyễn Thái Bình | Không nhầm “Thái Bình” ở đây với niên hiệu 970 |
| Kiều Công Hãn | Kiểu Công Hãn, Kiểu Tam Chế (S01/S05) | Kiều Tam Chế (chuẩn hóa Kiểu → Kiều) | Không gộp Kiều Công Tiễn hoặc Kiều Tri Hựu |
| Kiều Thuận | Kiểu Thuận, Kiểu Lệnh Công (S01); Kiểu Lịnh Công (S05) | Kiều Lệnh Công | Không gộp Kiều Công Hãn |
| Lý Khuê | Lý Lãng Công (S01), Lý Lang Công (S05) | Lý Lãng Công | Không xóa dị bản Lang; chưa thẩm định Hán văn để kết luận một dạng duy nhất |
| Nguyễn Thủ Tiệp | Nguyễn Lệnh Công (S01), Nguyễn Lịnh Công (S05) | Nguyễn Lệnh Công | Vũ Ninh Vương: chưa đủ evidence ở tập đọc |
| Lữ Đường | Lã Đường, Lã Tá Công (S01); Lữ Tá Công (S05/S11) | Lữ Tá Công | Lã Xử Bình không là alias (S09) |
| Nguyễn Siêu | Nguyễn Hữu Công (S01) | Nguyễn Hữu Công | Không tự đổi thành Nguyễn Hữu Cầu |
| Đỗ Cảnh Thạc | Đỗ Cảnh Công (S01) | Đỗ Cảnh Công | Đỗ Lệnh công trong repo chưa được xác nhận |

Không dùng những danh hiệu này làm chứng cứ vua ngang hàng hoàng đế. Không gọi “Đinh Tiên Hoàng” là tên người tự xưng trước 968 hoặc “Thái Bình” là niên hiệu ở 951/968. “Sứ quân” không tự động đồng nghĩa kẻ ác; cách định danh có tranh luận (S09).

## 3. Ranh giới tình tiết được phép viết tiếp

| Lớp nội dung | Nhãn bắt buộc | Decision |
|---|---|---|
| Người, tên/địa bàn theo hàng evidence | `recorded` + nguồn | Có thể dùng, giữ dị bản/giới hạn địa lý trong ledger |
| Cờ lau, khao quân uy hiếp Bình Kiều | `legend` | Dẫn bằng “tương truyền”; không chốt niên đại hoặc coi là quân báo |
| Thứ tự 24 mission, trận cuối Đỗ Động, dàn cảnh thương lượng | `reconstructed` | Có thể đề xuất trong task outline; luôn nói thứ tự phục vụ game |
| Thoại trước/thắng/thua, phó tướng không nguồn, nghề/nguyên tố, kho lương theo luật màn, quyền chọn và cách nhận thưởng/tướng | `fictional` | Không gắn sử liệu để hợp thức hóa chi tiết sáng tác |
| Điểm bất đồng trong U01–U08 | `disputed` và nhãn gốc nếu cần | Không giải quyết bằng chọn bản thuận gameplay rồi bỏ bản còn lại |

## 4. Acceptance

**PASS**: đủ 12 hồ sơ có evidence, confidence, unresolved, decision; có chuẩn tên/alias; không khẳng định thứ tự đánh dẹp. Những dòng dựa tổng thuật đã ghi rõ, không gọi là chính sử. Xem E00–E13 và U01–U08 trong ledger để giới hạn mốc/người/sự kiện.

Chưa triển khai game code, chưa sửa roster/catalog hoặc làm thay đổi dữ liệu các mode. Danh sách này không quyết định reward/recruit/choice runtime; khi triển khai sau phải server-authoritative và chống nhận hai lần theo yêu cầu chung.
