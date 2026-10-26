# Home V2 — Đại Bản Doanh: định hướng giao diện

> Cập nhật: 27/10/2026  
> Trạng thái: **Định hướng UI được chọn để triển khai tài liệu; chưa triển khai giao diện**. Các wireframe/ảnh tham khảo không phải asset được duyệt.

## 1. Quyết định thiết kế

Home hiện tại (`/game`) đang ưu tiên logo, nút “Vào trận”, sáu card văn bản và liên kết phụ. Phương án wireframe có hero hai cột, ảnh thành trì nhỏ và sáu ô giấy dó là **bước cải thiện bố cục**, nhưng chưa đạt độ hoàn thiện hình ảnh của màn Chiến dịch. Chọn **Home V2**: giữ phân cấp nội dung của phương án này, tăng chiều sâu bằng artwork Hero Hoa Lư và card chế độ có minh họa riêng; tránh biến Home thành bảng quản trị số liệu.

**Visual baseline:** màn Chiến dịch / Sử Ký Đại Việt (mức độ hoàn thiện nghệ thuật, chất liệu và hệ tương tác), **không copy layout ba cột** từ Chiến dịch.

Không redesign Header chung, không chỉnh UI Chiến dịch, không sửa battle/gameplay, API hay tiến trình. Tái sử dụng các design tokens và asset hiện hành. Bảng màu gốc ở [13-hinh-anh.md](13-hinh-anh.md); không tạo bảng màu thứ hai độc lập.

## 2. Mục tiêu trải nghiệm

Người chơi có thể nhận ra và thực hiện ba hành động chính ngay trong viewport: **tiếp tục chơi**, **chọn chế độ**, **vào hồ sơ/đội hình/trang bị**. Home là sảnh đón, không phải màn quản trị: hình ảnh phải tạo cảm giác Đại Việt thế kỷ X; ít chữ, thứ bậc CTA rõ, thành tích hiển thị ngắn gọn theo dữ liệu thật.

## 3. Bố cục thông tin Home V2

1. **Global Header (giữ nguyên):** logo/điều hướng hiện hành, hồ sơ và các tiện ích đang có. Không nhân đôi tài nguyên nếu Header đã hiển thị.
2. **Hero / Đại Bản Doanh:** artwork ngang Hoa Lư (núi đá vôi, sông, thành gỗ đất, kiến trúc Việt phù hợp thế kỷ X), logo và tên Cờ Lau, một câu dẫn ngắn. CTA ưu tiên “Tiếp tục” khi có hoạt động hợp lệ, fallback hành động hiện hành “Vào trận”; chỉ thêm logic resume sau khi code/API xác nhận hỗ trợ. Có thể đặt CTA phụ “Chiến dịch” nếu tránh lặp.
3. **Chế độ chơi:** sáu card rõ tính chất, dùng hình minh họa độc lập, nhãn, mô tả một dòng, tiến trình/trạng thái ngắn và affordance truy cập. Mặc định bố trí 3×2 trên desktop, 2 cột tablet, 1 cột mobile; cỡ card phải đảm bảo artwork vẫn nhận diện được.
4. **Điều hướng phụ:** Hồ sơ & Trang bị, Nhiệm vụ, Xếp hạng, Chơi thử offline, Tài khoản **chỉ khi các route/feature tương ứng tồn tại**. Bố cục một hàng gọn, không tranh vị trí với chọn mode.

### Gợi ý phối cảnh

- Hero ưu tiên artwork phủ vùng lớn, overlay tối có kiểm soát giúp chữ và nút dễ đọc; **không để artwork chỉ là ảnh thumbnail nhỏ bên phải**.
- Cố gắng để tiêu đề khu mode và hàng card đầu được nhìn thấy sớm trên màn 16:9 thông dụng. Không đặt hero quá cao gây cuộn dài.
- Viền đồng/hoa văn Đông Sơn mạnh ở frame chính; panel con giảm trang trí; card dùng viền tinh giản để ảnh và chữ nổi bật.
- Tránh emoji làm icon sản phẩm; chọn icon/asset thật từ repo.

## 4. Đặc trưng sáu card

| Chế độ | Visual chủ đạo | Thông tin trạng thái nên ưu tiên |
|---|---|---|
| **Chiến dịch** | Bản đồ, núi sông, thành trì và cờ thế lực | Chương/nhiệm vụ hiện tại theo server |
| **Tháp Thí Luyện** | Tháp cổ sáng sớm, hành trình leo tầng | Tầng cao nhất, tầng có thể chơi/quét nếu hợp lệ |
| **Tháp Vận Mệnh** | Tháp cổ dưới bầu trời biến đổi, cảm giác chu kỳ | Chu kỳ, tầng/run và trạng thái roster |
| **Sinh Tồn** | Lũy đất, doanh trại, chiến trường phòng thủ | Đợt cao nhất và trạng thái lượt chơi |
| **Thử Thách Ngày** | Chiếu thư/ấn đồng, thử thách chung | Đã/chưa tham gia hôm nay; thời gian đổi ngày |
| **Đấu Trường Bóng Ma** | Võ đài, cờ trận, đối đầu | Hạng/điểm/lượt còn lại nếu dữ liệu cung cấp |

Card mang tính điều hướng; không đưa toàn bộ rule, roster, phần thưởng hoặc bảng xếp hạng vào Home. Các mục chi tiết thuộc trang riêng. Không dùng số liệu mock trong production. Tôn trọng feature flag và trạng thái mở khóa/đang bảo trì; trạng thái disabled không được giả như một nút hoạt động.

## 5. Cấu trúc component và tính nhất quán

Khảo sát và dùng lại components hiện có trước khi tạo mới. Các abstraction **đề xuất**, không phải tên file đã tồn tại:

- `HomeHero`: minh họa, thông điệp và CTA phù hợp trạng thái.
- `ModeCard`: artwork, title, mô tả cực ngắn, progress/status, trạng thái locked/disabled/loading.
- `ModeGrid`: grid responsive, thứ tự tập trung bàn phím và layout.
- `SecondaryGameNav`: điều hướng phụ; không nhân đôi Header.
- Chỉ tạo shared `OrnateFrame`, `ParchmentCard`, `ResourceBadge` nếu code hiện tại chưa có tương đương. Token tập trung, không nhân bản CSS.

Các cấp trang trí: main frame (mạnh), section panel (vừa), repeatable item (nhẹ). Typography và contrast phải đủ đọc ở 100% zoom; nội dung dài phải xuống hàng hoặc rút ngắn hợp lệ. Hover/focus/selected/disabled dùng chung định nghĩa; giảm animation nếu người dùng bật reduced motion.

## 6. Yêu cầu artwork

Ưu tiên asset có sẵn trong `public/art/` và code art. Khi chưa có ảnh đúng nội dung, tạo **asset backlog** rồi duyệt từng ảnh; **không** dùng ảnh tìm kiếm ngoài web làm asset release, không sao chép game khác, không đưa text UI vào ảnh. Mỗi mode có một minh họa riêng nhưng cùng brushwork, độ tương phản và chất liệu. Tham chiếu [13-hinh-anh.md](13-hinh-anh.md) và [15-ke-hoach-do-hoa.md](15-ke-hoach-do-hoa.md).

Tránh kiến trúc sai niên đại, trang phục/trang trí phi Việt và phong cách photorealistic/3D không nhất quán. Hình tối ưu cho web, crop an toàn tại desktop và mobile, tải theo nhu cầu. Wireframe ở hội thoại chỉ xác định **tỷ lệ và thứ tự**; không phải UI screenshot cuối.

## 7. Phạm vi và thứ tự triển khai

1. Audit source Home, Header, Campaign style, các routes/modes hiện có, asset manifest, dữ liệu trạng thái và điều hướng.
2. Chốt layout + states Home V2 bằng screenshot ở desktop 16:9, tablet và mobile; giữ Campaign làm visual baseline.
3. Tích hợp hero và card có artwork, chỉ dùng dữ liệu mode thực tế.
4. Kiểm thử keyboard, focus, contrast, viewport, tải ảnh, fallback, loading/empty/locked.
5. Sau khi Home đạt chuẩn, áp dụng nền tảng giao diện cho Trial, Destiny, Survival, Daily, Arena theo từng gameplay, **không áp một layout cố định**.

### Acceptance criteria

- Header và Campaign giữ nguyên hành vi/đồ họa; không sửa battle engine.
- Mọi chế độ hiện hữu vẫn điều hướng đúng; feature flags và khóa mode phản ánh thật.
- CTA chính có hành động rõ, không đưa resume giả.
- Sáu chế độ có hình ảnh nhận diện riêng, trạng thái ngắn gọn và nhất quán.
- Tương thích màn 16:9 và viewport nhỏ; không overflow hoặc cuộn ngang.
- Các ảnh mới, nếu có, được phê duyệt trước khi dùng; art lịch sử phù hợp bối cảnh.
- Build/typecheck/tests được chạy và báo cáo **kết quả thực**, không coi docs là bằng chứng đã code.

## 8. Các vấn đề chờ xác minh trong code

- Dữ liệu resume trận/nhiệm vụ và điều kiện hiển thị CTA “Tiếp tục”.
- Các route và metadata thực của sáu mode, đặc biệt Survival.
- Nguồn dữ liệu badge tiến trình, thời gian reset và feature flags.
- Các asset chính thức sẵn có cho Hoa Lư/ảnh từng mode.
- Hành vi responsive của Header chung.

Các câu hỏi trên là việc kỹ thuật cần xác minh khi triển khai; không phải quyết định thay đổi gameplay.
