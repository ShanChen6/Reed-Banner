# Nhật ký thay đổi thiết kế

> Mới nhất ở trên cùng. Mỗi mục ghi quyết định và lý do nếu có.

## 19/10/2026

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
- Tăng lại ô 3 của Kim, Lôi, Mộc, Thủy; giảm Cuồng Phong Quét Trận; Thuận Phong bỏ 15 năng lượng tức thì. Mô phỏng 3vs3 900 trận mỗi hệ: các hệ thắng 54–69% (trước 50–75%). Chi tiết ở [Bộ kỹ năng nhân vật chính](design/12-ky-nang-nhan-vat-chinh.md#mô-phỏng-19102026).

**Hình ảnh**
- Thay emoji ở /demo bằng bộ hình SVG tự vẽ (Shan đồng ý): 7 ô cờ, ô đặc biệt bản yếu và bản mạnh, 7 biểu tượng nguyên tố, cờ lau thủ lĩnh, khung bàn cờ. Phong cách khắc gỗ dân gian và hoa văn trống đồng. Chân dung nhân vật và hình trang bị để sau, thuê họa sĩ hoặc dùng công cụ AI theo bản yêu cầu ở [Hình ảnh](design/13-hinh-anh.md).

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
- Tách `docs/co-lau-design.md` thành các file theo chủ đề trong `docs/design/` và `docs/tech/`; gom TODO về [cau-hoi-mo.md](cau-hoi-mo.md).
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
