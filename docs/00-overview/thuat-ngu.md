# Thuật ngữ

> Cập nhật: 13/11/2026 (Xưng hô: vài chỗ gọi "Chúa công"; thêm mục Văn phong giao diện, Shan duyệt; 11/11: thêm từ của Tháp Thiên Mệnh; 27/10: tách từ `docs/README.md` ở DOC-02, nội dung giữ nguyên)
> Trạng thái: **REFERENCE** — thuật ngữ dùng chung.

| Thuật ngữ | Nghĩa |
|---|---|
| **Ô** | Một viên trên bàn cờ (Kiếm, Âm dương, Bánh chưng, Tim, Thỏi vàng, Sách, Trống trận) |
| **Bộ ghép** | Nhóm từ 3 ô cùng loại liền nhau |
| **Cascade** | Ô rơi xuống sau khi ăn tạo thành bộ ghép mới mà không cần người chơi kéo |
| **Lượt thêm** | Lượt đánh tiếp ngay, nhận được khi ghép từ 4 ô trở lên |
| **Ô đặc biệt** | Ô sinh ra từ bộ ghép chữ L/T (bản yếu) hoặc thẳng 5 (bản mạnh) |
| **Người hành động** | Nhân vật đang đánh trong lượt này của phe |
| **Tướng quân** | Cách gọi chung mọi nhân vật trên giao diện (danh sách tướng quân, tìm tướng quân). Cụm đếm ngắn được rút thành "tướng" (ba tướng ra trận, tướng dự bị). Trong code và docs kỹ thuật vẫn gọi là nhân vật |
| **Chủ tướng** (nhân vật chính) | Đinh Bộ Lĩnh, tướng quân của người chơi, luôn ra trận |
| **Phó tướng** (nhân vật kèm) | Hai tướng quân đi cùng chủ tướng ở 3vs3 |
| **Nguyên tố** | Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Phong (trước đây gọi là ngũ hành) |
| **Nghề** | Tướng sĩ, Pháp sư, Binh lính, Y sư, Mưu sĩ, Quân sư; mỗi nghề gắn với một loại ô |
| **Chiêu nghề** | 3 chiêu ô 1/3/4 theo nghề; tùy tướng AI chiến dịch giữ bộ cũ nấc 1–2 |
| **Tướng thường / Tướng lịch sử / Sứ quân** | Ba nhóm nhân vật kèm, xem [Danh sách nhân vật](../03-characters/danh-sach-nhan-vat.md) |
| **Dấu ấn** | Hiệu ứng phụ theo nguyên tố cộng vào chiêu nghề |
| **Nộ** | Thanh 0–100 của thủ lĩnh, tích từ ô Trống trận và khi mất máu; đầy thì kỹ năng bị động tự kích hoạt |
| **Thủ lĩnh** | Tướng quân mang thanh Nộ và kỹ năng bị động trong trận: chủ tướng, hoặc tướng vị trí 1 của đội AI. Khác "Chủ tướng" (vai trong đội hình ở Doanh Trại) |
| **Lương / Sĩ khí** | Tài nguyên chung của phe và mức hệ số sát thương suy ra từ nó |
| **Tianwu** | AI điều khiển phe đối thủ |
| **Seed** | Số khởi tạo bộ sinh ngẫu nhiên của trận, chỉ nằm trên server |
| **Lượt leo** | Một lần leo Tháp Thiên Mệnh từ tầng 1 với đội hình đã khóa (tên mã: `run`). Giao diện không dùng chữ "run" |
| **Đội hình / Tướng ra trận / Dự bị** | Ở Tháp Thiên Mệnh: các tướng khóa cho lượt leo (tên mã `roster`); ba người đánh một tầng (`active`); số còn lại |
| **Phúc** | Lợi thế chọn sau mỗi tầng thắng ở Tháp Thiên Mệnh, giữ tới hết lượt leo, chọn lại thì cộng dồn (tên mã `boon`, `stack`) |

## Từ không dùng trên giao diện

Chữ hiện cho người chơi viết bằng tiếng Việt: run → lượt leo; roster → đội hình; active → tướng ra trận; build → nghề và hệ; HP → máu; ATK → Công; DEF → Thủ; NL → năng lượng (riêng nhãn thanh hẹp trên thẻ trận giữ "NL"); stack → cộng dồn; clear → vượt (tầng); boss → trùm; buff → hiệu ứng có lợi; debuff → hiệu ứng bất lợi; server → máy chủ; online → trực tuyến (hoặc "trận có đồng hồ"); offline → không cần mạng; preview → xem trước; tab → thẻ hoặc "nơi khác"; match-3 → ghép ba. Tên mã tiếng Anh chỉ ở trong code và tài liệu kỹ thuật. Tên chế độ cũ (Chiến dịch, Sinh tồn, Đấu trường, Thử thách ngày, Tháp Vận Mệnh, Đánh trùm) không dùng trên giao diện; tên hiện hành ở [Chế độ chơi](../02-game-modes/README.md).

## Văn phong giao diện

Quy ước Shan duyệt 13/11/2026. Áp cho mọi chữ người chơi thấy; test `tests/ui-wording.test.ts` chặn từ cấm và tên chế độ cũ.

| Mảng | Quy ước |
|---|---|
| Xưng hô | Lời hệ thống gọi người chơi là **bạn**, không dùng "người chơi" trên giao diện. **Ngoại lệ (Shan, 13/11/2026): chỉ vài chỗ gọi "Chúa công"**, để giữ giọng quân doanh: dòng kết quả trận ("Chúa công thắng!", "Chúa công thua", cả nhật ký trận) và dòng "Chúa công đã đánh hôm nay" ở Nhật Lệnh. Hướng dẫn, nút, nhãn, thông báo lỗi và mọi chỗ khác vẫn là "bạn". Không đặt "Chúa công" vào lời nhân vật lịch sử (không bịa cách gọi cho người thật) và không dùng ở chương Đinh Bộ Lĩnh còn nhỏ Lời thoại nhân vật giữ giọng cổ (ta, ngươi, các ngươi) |
| Phe trong trận | **Phe bạn** và **Đối thủ**. Kết quả: "Chúa công thắng!" / "Chúa công thua". "Tianwu" chỉ xuất hiện ở trang giới thiệu, nơi nói đó là AI của game; "địch" chỉ dùng trong mô tả kỹ năng |
| Gọi nhân vật | Tướng quân, chủ tướng, phó tướng (bảng trên). "Tướng sĩ" chỉ là tên nghề |
| Chỉ số | Máu, Công, Thủ (không HP, ATK, DEF) |
| Màn tài khoản | Giọng giang hồ, quân doanh (Shan, 13/11/2026): tên đăng nhập → **danh hiệu**, mật khẩu → **mật lệnh**, đăng ký → **ghi danh**, email → **địa chỉ thư**, khách → **lữ khách**, đăng nhập → **trình danh** (tài khoản đã đăng nhập → "đã ghi danh"); nút gửi form là "Vào trại". Nhãn ô nhập ghi kèm từ quen trong ngoặc ở lần đầu ("Danh hiệu (tên đăng nhập)", "Mật lệnh (mật khẩu)") để người mới vẫn hiểu. "Đăng nhập" chỉ còn trong ngoặc của nhãn "Danh hiệu (tên đăng nhập)" |
| Giọng văn | Câu ngắn, nói việc cần làm. Thẻ chế độ và hero giữ giọng hào sảng ([spec thẻ chế độ](../05-ui-ux/design-system/game-mode-ui-spec.md)). Dấu chấm than chỉ cho khoảnh khắc thắng, kỷ lục, khai thông |
| Thông báo lỗi | Giọng cổ trang, võ lâm nhưng vẫn rõ việc: *điều xảy ra* + *việc nên làm*, kết thúc bằng dấu chấm, không xưng "bạn", không "nhé". Giữ nguyên từ chức năng (đăng nhập, tải lại trang, máy chủ, mật khẩu). Ví dụ: "Tin báo đứt quãng, chưa liên lạc được máy chủ. Xin thử lại sau giây lát." |
| Viết hoa tên riêng trong game | Hoa mọi chữ: tên chế độ, màn chức năng mang tên riêng (Chiến Trường, Doanh Trại, Cửa Hàng, Công Trạng), địa danh, đạo quân (Đạo Chính, Biệt Đạo), quân và công cụ có tên (Quân Lệnh, Thu Hồi, Lốc Phong), chiêu Hán Việt (tuyệt chiêu, chiêu riêng, chiêu hệ). Màn tiện ích tên chung (Nhiệm vụ, Tài khoản, Trình danh), chiêu nghề và bị động (Trảm kích, Tường khiên, Chờ thời phá giáp) chỉ hoa chữ đầu |
| Viết hoa nút, tiêu đề, nhãn | Chỉ hoa chữ đầu (Thu hồi, Hoàn thành chương), trừ phần là tên riêng. Chữ in to làm bằng CSS `uppercase`, không gõ cứng |
| Hiệu ứng và tài nguyên | Hiệu ứng hoa chữ đầu như tên riêng (Khiên, Đóng băng, Câm lặng, Phản đòn, Nộ). Tài nguyên viết thường giữa câu (máu, năng lượng, lương, vàng) |
| Số | "12 sứ quân", "Loạn 12 sứ quân" dùng số; thẻ chế độ và hero viết chữ ("mười hai"). "sứ quân" luôn viết thường |
| Dấu câu | Câu đầy đủ có dấu chấm; nhãn, nút không chấm. Luôn "…" (một ký tự), ngoặc kép cong “ ”, phân cách "·" |
| Chính tả | Kiểu dấu cũ: hòa, thủy, khóa, tùy, hủy; luôn "kỹ", "đăng ký" |

Quy tắc commit và PR (Shan chốt cùng ngày) ở [AGENTS.md](../../AGENTS.md#commit-và-pr).
