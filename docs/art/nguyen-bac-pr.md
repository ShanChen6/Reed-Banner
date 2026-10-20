# feat: hình động Nguyễn Bặc và trang xem thử nhân vật

Đưa Nguyễn Bặc (`nguyenBac`, tướng sĩ Hỏa) vào sân khấu Pixi bằng lớp cắt từ RGB ảnh đứng gốc, giữ tỷ lệ và tọa độ nguồn. Có đứng thở, chém đao, phản ứng trúng đòn/hồi máu, tranh ra chiêu, tuyệt chiêu và bị hạ gục. Avatar đầu/vai thay SVG qua thành phần dùng chung. Không sửa `src/core/`.

Thêm `/demo/characters`: chọn những nhân vật có rig, thử từng động tác hoặc phát lần lượt, đổi cỡ, đối chiếu năm ảnh cùng dung lượng file. Trang không cần tài khoản, không gọi `/api/*`. Đổi nhân vật và bấm động tác khác hủy chuỗi đang chạy.

- Nhánh đích: **develop**.
- Nguyễn Bặc: **316.904 byte / 14 WebP**, gồm avatar, ảnh đứng đối chiếu và ba tranh hành động; dưới 350 KB. Rig trong trận: 246.512 byte. Avatar: 256×256, 26.436 byte, dưới 30 KB.
- Hạn chế: chân liền thân, động tác theo kiểu rối cắt mảnh; vải uốn nhẹ; alpha có thể mất sợi rất nhỏ. Tranh hành động thu về 1/3 kích thước nguồn để giữ ngân sách. Nhân vật cũ chưa có đủ tranh riêng hiển thị rõ phần còn thiếu. Chưa đo FPS trên điện thoại thật.
- Kiểm tra: lint, typecheck, test, build; Chrome 375×812, 844×390, 1280×900; đủ nút, đầy đủ chuỗi, hủy chuỗi, đổi cả bốn rig, không tràn ngang hoặc gọi API.

## Liên kết xem thử Vercel

**Chưa có deployment của nhánh này vì GitHub chưa xác thực để đẩy nhánh. Không dùng link dự đoán.** Sau khi có deployment, thay `VERCEL_PREVIEW_URL` bằng URL do Vercel trả về trước khi đăng PR:

- Nguyễn Bặc: `VERCEL_PREVIEW_URL/demo/characters?id=nguyenBac`

Các nhân vật cũ có thể đối chiếu tại cùng host với `?id=daoLam`, `?id=tranCuong`, `?id=dinhBoLinh`.

Nguồn, prompt và tọa độ: [docs/art/nguyen-bac.md](nguyen-bac.md).
