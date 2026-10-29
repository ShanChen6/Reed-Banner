# Reed Banner — Báo cáo QA nhân vật mới V4.3

> Cập nhật nhãn: 30/10/2026
> Trạng thái: **AUDIT** — bằng chứng lịch sử trước khi đổi nghề. Các nhận xét Cung thủ RB-062–068 bên dưới đã hết hiệu lực; không dùng để tạo ảnh hoặc triển khai. Thiết kế hiện hành: [Xạ thủ](./08-new-professions-14-skill-kits.md), [prompt](./09-14-heroes-character-and-frame-prompts-v4-3.md). Các nhận xét Sát thủ W01 cũng đã bị thay bởi bộ đa vũ khí W02 tại hai nguồn trên; không dùng audit cũ để dựng ảnh hoặc triển khai.

> 24/10/2026 · Tình trạng: đã rà nội dung 14 nhân vật/84 prompt, **chưa nghiệm thu ảnh** · Scope: văn bản và prompt בלבד.

## Đối chiếu thực hiện

1. Đọc bản skill design `08-new-professions-14-skill-kits.md`, tài liệu prompt `09-14-heroes-character-and-frame-prompts-v4-3.md` và registry `src/core/battle/skills.ts`.
2. Xác minh 14 tên kỹ năng riêng ở slot 4, 7 hệ, hai nghề dự kiến; rà trùng ID và số lượng hồ sơ.
3. Rà 84 khung (14 × 6), đặc biệt 14 Master = Idle, 14 khung ra chiêu nghề slot 3, 14 khung tuyệt chiêu slot 4.
4. Điều chỉnh trực tiếp **56 đoạn pose direction** ở bốn khung trên mỗi người: đánh thường, ra chiêu, tuyệt chiêu, hạ gục. Phần pose đã cá nhân hóa dựa trên hình học vũ khí và tuyệt chiêu riêng; giữ 14 khung Master và 14 khung cá tính.
5. Chỉnh hai lỗi tên chiêu hệ so với source: **Thủy Nguyệt Tụ Linh** và **Phóng Hỏa Thiêu Doanh**.

## Những lỗi đã phát hiện và sửa

| Hạng mục | Phát hiện | Cách xử lý |
|---|---|---|
| 14 Ultimate | Câu “signature attack and status effects according to the design registry” không nêu mechanics cụ thể | Thay bằng động tác thực, hướng đánh, vũ khí tương ứng; khống chế/hồi/đốt/xoay bàn cờ luôn là effect riêng |
| 14 Skill | Một mô tả chuyển động chung cho cả nghề | Thay hướng sử dụng cung/nỏ hoặc dao/rìu theo tư thế và kỹ năng slot 3 |
| 14 Basic Attack | Đánh thường theo cùng template | Mỗi tướng có kiểu cầm, nhịp ngắm/chém và bước chân riêng |
| 14 Defeated | Cùng động tác ngã nghiêng hông, giảm khác biệt | Đặc tả ngã và vị trí vũ khí cho từng silhouette |
| 2 kỹ năng hệ | Tên hệ khác registry | Sửa để khớp chính xác chữ trong source |

## Phân biệt hình khối / vũ khí giữa 14 người

| Nhân vật | Dấu nhận diện vũ khí | Điểm quyết định ở ultimate |
|---|---|---|
| Bạch Nỏ Lang | Nỏ nặng cánh rộng gia cố đồng | Một tên phá giáp, vai chống báng nỏ |
| Thanh Lâm Xạ | Trường cung tre, nhánh trên dài | Bắn chặn đường, **không tạo dây trói vật lý** |
| Lam Giang Nỗ | Nỏ nhỏ báng vuông cánh ngắn | Bắn kiểu trinh sát sông, không dùng nỏ đại |
| Xích Diệm Tiễn | Đại cung gỗ cân xứng | Một tên hiệu lệnh đợt hỏa tiễn, không vẽ nhiều cung |
| Trấn Sơn Cung | Cung nặng bản dày, đầu sừng | Thế chân trấn giữ, khiên đồng đội là VFX |
| Lôi Minh Xạ | Cung ngắn phản cong, chuông bên hông | Chạm chuông trước phát bắn phá khí |
| Tật Phong Tiễn | Cung ngắn bất đối xứng, bước chân nhanh | Bắn và đổi chỗ; không nhân bản người |
| Bạch Phong Đao | Một dao găm ngắn thẳng bản dày | Đâm kẽ giáp, không dài thêm lưỡi |
| Độc Ảnh | Hai dao cong ngắn đồng cỡ | Khóa cổ tay và cắt, không thêm trạng thái độc |
| Hàn Giang Khách | Một dao găm sông lưỡi mảnh hai cạnh | Đâm hẹp + lui bước, đóng băng là VFX |
| Xích Dạ | Một đoản đao cong vào, mũi vát | Nhịp chém kết thúc, không sinh lưỡi khác |
| Địa Ẩn | Một rìu tay đầu nêm cán ngắn | Quét thấp cắt đường rút, không tự mọc khiên |
| Lôi Ảnh | Hai đoản đao thẳng cùng khuôn | Cắt hai góc đối xứng, không thêm đao thứ ba |
| Vô Ảnh | Một dao dài hẹp, gần thẳng | Thay chân dẫn, không teleport hoặc dư ảnh |

## Các điểm còn phải duyệt, KHÔNG mặc định hoàn thành

- **Art scale**: chiều dài chính xác so với nhân vật, kích thước chuôi, quiver, vết sẹo và màu HEX từng bề mặt chưa có ảnh Master được duyệt; prompt text không bảo đảm pixel-perfect.
- **Gameplay**: `rules.ts` mới đăng ký hai nghề ở `ALL_PROFESSIONS`; **chưa** có kỹ năng/tile/combo/AI/UI chính thức. Con số kỹ năng trong tài liệu mới chỉ là proposal; không xác nhận vận hành.
- **Passive stacking**: P1 + P2/P3 + P4 có tín hiệu kích hoạt chồng nhau, cần chặn trigger vòng và mô phỏng số lần truy kích khi triển khai. Không suy ra 4 passive đã hoạt động.
- **Khả thi của art pose**: ảnh nỏ trước/sau phóng tên phải xác định trạng thái dây nỏ; hiện chỉ cố định hình học báng/cánh/khoang tên, chưa ràng buộc bằng weapon-only art đã duyệt.
- **Cơ chế hiệu ứng**: đề xuất về dây trói, độc, tàng hình hay ảo ảnh là ngôn ngữ kể chuyện, không được tạo thêm status game ngoài step registry.
- **Các tiểu sử mới** là lore hư cấu đề xuất, chưa khẳng định sử liệu.
- **14 mô tả ngoại hình và phục trang bằng tiếng Việt** vẫn cần biên tập riêng ở bước tài liệu tiếp theo; các thuộc tính gốc đang kèm tiếng Anh, dù prompt EN là đúng định dạng yêu cầu.

## Trạng thái đầu ra

- [x] 14 hồ sơ nghề/hệ và 14 tuyệt chiêu riêng trong tài liệu.
- [x] 84 prompt standalone với khóa vũ khí và màu hành.
- [x] Cá nhân hóa 56 hướng động tác tấn công, skill, ultimate, hạ gục.
- [x] Chuẩn hóa hai tên kỹ năng hệ.
- [ ] Duyệt Weapon DNA về tỷ lệ hình học tuyệt đối.
- [ ] Biên tập toàn bộ chân dung và y phục tiếng Việt chuyên sâu.
- [ ] Thiết lập và mô phỏng skill/bị động trong runtime (ngoài scope hiện tại).
- [ ] Render và kiểm tra ảnh (ngoài scope hiện tại).

## Files

- [Skill kits](./08-new-professions-14-skill-kits.md)
- [Character & frame prompts](./09-14-heroes-character-and-frame-prompts-v4-3.md)

