# Reed Banner — Weapon Reference Sheets V1 (5 nhân vật)

> **Ngày cập nhật:** 24/10/2026 · **Trạng thái:** Thông số art đề xuất để dựng ảnh tham chiếu; **chưa có ảnh được nghiệm thu**. Không thay gameplay, asset hiện có hay bảng cân bằng.

## Nguyên tắc chung

- Một Weapon ID tương ứng **một bộ hình học cố định**; tất cả 6 frame (Master/Idle, Đánh thường, Ra chiêu, Tuyệt chiêu, Hạ gục, Phong cách cá nhân) sử dụng bộ này.
- **Master = Idle**; không cần sinh một ảnh đứng khác. Thiết kế được duyệt bằng một tấm weapon-only orthographic reference trước, sau đó ghép cùng ảnh nhân vật Master khi sinh các frame.
- Các tỷ lệ dưới đây **mới là đề xuất sản xuất**, cần so lại với kích cỡ khung combat và nhân vật thật trước khi khóa; chúng không phải hiện vật khảo cổ phục dựng.
- Ảnh weapon-only nên có ba góc: nhìn ngang chính diện, ba phần tư, cận chi tiết; **cùng một vũ khí**, không phải ba thiết kế khác nhau. Chroma magenta #FF00FF nếu vật có vùng xanh lớn, ngược lại chroma green #00B140.
- Lưỡi, cán, cơ cấu giữ hình học bất biến; chỉ vải, dây và tua được phép biến dạng mềm theo trọng lực/chuyển động.
- Trong animation dùng hiệu ứng tách khỏi asset (tia Lôi/đường chém/làn gió).
- **Nguyễn Bặc (RB-002): giữ nguyên vũ khí và không thêm cờ**, không đưa vào năm reference sheet thay đổi.

## Checklist duyệt

- [ ] Toàn bộ Weapon ID duy nhất, không trùng tên/tỉ lệ nhân vật khác.
- [ ] Vật thể nhìn đủ ba góc vẫn là đúng một thiết kế.
- [ ] Không đổi chiều dài, độ cong, hình dạng đầu, số lượng khi tạo action frame.
- [ ] Màu HEX đúng từng chi tiết vật liệu, không tô toàn bộ một màu hệ.
- [ ] Các đạo cụ kỹ năng có vị trí gắn cố định, không tự sinh ra giữa frame.
- [ ] Đảm bảo dễ đọc ở kích thước combat thật.

## Chu Ngân — `RB-021-W01`

**Kỹ năng:** Ngân Châm Tán Xạ. **Thiết kế:** Trượng pháp khí bằng đồng với quả cầu bạc và ống ngân châm gắn cứng bên dưới chỏm.

**Tỷ lệ đề xuất:** trượng dài khoảng 0,88 lần chiều cao người; thân trượng thẳng 100%; đầu cầu đường kính 0,10 chiều dài trượng; ống chứa kim dài 0,16 chiều dài trượng.

**Danh mục bộ phận:** Một thân trượng đồng, đúng ba chuông đồng, một quả cầu bạc và một ống cơ khí sáu rãnh kim, không tự xuất hiện kim ngoài ống khi đứng yên.

**Màu/địa điểm:** đồng cũ #A68B54; cầu bạc #AAB1B8; cạnh thép #707982; dây quấn ngà #F1E9D8.

**Động tác kiểm chứng:** Nghiêng trượng vừa đủ để hướng ống sáu kim về mục tiêu; không đổi trượng thành phi tiêu.

**Các lỗi bắt buộc loại bỏ:** không cong thân trượng, không biến cầu bạc thành lưỡi kiếm, không sáu cây trượng.

### Prompt weapon-only (English, standalone)

```text
Create a WEAPON-ONLY CHARACTER EQUIPMENT REFERENCE SHEET for Reed Banner, tenth-century Vietnamese-inspired historical low fantasy. Owner: Chu Ngân. Weapon registry ID RB-021-W01. Associated signature ability: Ngân Châm Tán Xạ. Design: Trượng pháp khí bằng đồng với quả cầu bạc và ống ngân châm gắn cứng bên dưới chỏm. FIXED PROPORTIONS (provisional design ratios, not archaeological dimensions): trượng dài khoảng 0,88 lần chiều cao người; thân trượng thẳng 100%; đầu cầu đường kính 0,10 chiều dài trượng; ống chứa kim dài 0,16 chiều dài trượng. PART INVENTORY (exactly): Một thân trượng đồng, đúng ba chuông đồng, một quả cầu bạc và một ống cơ khí sáu rãnh kim, không tự xuất hiện kim ngoài ống khi đứng yên.. MATERIAL AND HEX LOCK: đồng cũ #A68B54; cầu bạc #AAB1B8; cạnh thép #707982; dây quấn ngà #F1E9D8. Mechanical use: Nghiêng trượng vừa đủ để hướng ống sáu kim về mục tiêu; không đổi trượng thành phi tiêu.. ABSOLUTE NEGATIVE REQUIREMENTS: không cong thân trượng, không biến cầu bạc thành lưỡi kiếm, không sáu cây trượng. The weapon is the same rigid physical object in all views; perspectives do not change its actual length, blade profile, shaft straightness, components, ornaments or color placement. Produce one clean technical presentation with three views of the SAME weapon: left-facing flat side view, three-quarter oblique view, and close-up on the signature mechanism. All parts separated clearly, no character hands, no people, no magical glow, no particles, no scenery. Clean hand-inked 2D game asset drawing with restrained cel shading; neutral consistent scale guides without text labels printed on image, flat uniform chroma background.
```

**Acceptance:** So sánh ba góc nhìn và ảnh Master; sai bất kỳ tỷ lệ/cán/màu/bộ phận nào thì không duyệt. Sau khi duyệt lưu ảnh chuẩn theo `RB-021-W01` để đính kèm trong cả sáu prompt.

---

## Châu Ngọc — `RB-023-W01`

**Kỹ năng:** Kim Châm Độ Mệnh. **Thiết kế:** Hồ lô sứ chữa bệnh và ống bốn kim châm, thiết kế dụng cụ y sư gọn gàng.

**Tỷ lệ đề xuất:** hồ lô cao khoảng 0,20 chiều cao thân người; ống kim dài 0,12 chiều dài cẳng tay; kim mảnh, không biến thành vũ khí ném.

**Danh mục bộ phận:** Một hồ lô sứ trắng hai bầu, một nắp bạc, một dây đỏ sẫm; một hộp kim bạc tại hông trái chứa bốn kim chuẩn; chỉ một kim được cầm trong thao tác chữa trị.

**Màu/địa điểm:** sứ ngà #F1E9D8; bạc #AAB1B8; đai xám thép #707982; phụ kiện đồng #A68B54; dây đỏ sẫm chỉ ở hồ lô.

**Động tác kiểm chứng:** Tay trái rút một kim từ hộp, tay còn lại giữ hồ lô hoặc thả dây mang; động tác điều trị chính xác.

**Các lỗi bắt buộc loại bỏ:** không phóng loạt kim, không biến hồ lô thành vũ khí, không thêm kim dài bằng đoản kiếm.

### Prompt weapon-only (English, standalone)

```text
Create a WEAPON-ONLY CHARACTER EQUIPMENT REFERENCE SHEET for Reed Banner, tenth-century Vietnamese-inspired historical low fantasy. Owner: Châu Ngọc. Weapon registry ID RB-023-W01. Associated signature ability: Kim Châm Độ Mệnh. Design: Hồ lô sứ chữa bệnh và ống bốn kim châm, thiết kế dụng cụ y sư gọn gàng. FIXED PROPORTIONS (provisional design ratios, not archaeological dimensions): hồ lô cao khoảng 0,20 chiều cao thân người; ống kim dài 0,12 chiều dài cẳng tay; kim mảnh, không biến thành vũ khí ném. PART INVENTORY (exactly): Một hồ lô sứ trắng hai bầu, một nắp bạc, một dây đỏ sẫm; một hộp kim bạc tại hông trái chứa bốn kim chuẩn; chỉ một kim được cầm trong thao tác chữa trị.. MATERIAL AND HEX LOCK: sứ ngà #F1E9D8; bạc #AAB1B8; đai xám thép #707982; phụ kiện đồng #A68B54; dây đỏ sẫm chỉ ở hồ lô. Mechanical use: Tay trái rút một kim từ hộp, tay còn lại giữ hồ lô hoặc thả dây mang; động tác điều trị chính xác.. ABSOLUTE NEGATIVE REQUIREMENTS: không phóng loạt kim, không biến hồ lô thành vũ khí, không thêm kim dài bằng đoản kiếm. The weapon is the same rigid physical object in all views; perspectives do not change its actual length, blade profile, shaft straightness, components, ornaments or color placement. Produce one clean technical presentation with three views of the SAME weapon: left-facing flat side view, three-quarter oblique view, and close-up on the signature mechanism. All parts separated clearly, no character hands, no people, no magical glow, no particles, no scenery. Clean hand-inked 2D game asset drawing with restrained cel shading; neutral consistent scale guides without text labels printed on image, flat uniform chroma background.
```

**Acceptance:** So sánh ba góc nhìn và ảnh Master; sai bất kỳ tỷ lệ/cán/màu/bộ phận nào thì không duyệt. Sau khi duyệt lưu ảnh chuẩn theo `RB-023-W01` để đính kèm trong cả sáu prompt.

---

## Lý Liệt — `RB-038-W01`

**Kỹ năng:** Xích Hỏa Đoạt Kỳ. **Thiết kế:** Trường đao cán gỗ thẳng có móc gài nhỏ trên sống lưỡi, dải vải đỏ dưới họng lưỡi.

**Tỷ lệ đề xuất:** tổng chiều dài khoảng 1,12 lần chiều cao người; lưỡi chiếm 0,28 chiều dài vũ khí; cán chiếm 0,72; cán thẳng tuyệt đối, không uốn để nhấn chuyển động.

**Danh mục bộ phận:** Một trường đao một lưỡi, một móc đồng nhỏ cố định ở sống gần gốc lưỡi, một dải vải đỏ buộc dưới họng; không có lá cờ thứ hai.

**Màu/địa điểm:** lưỡi thép xám #707982; cán gỗ than #343236; dải vải son #C84231; nút buộc đỏ gạch #903C32; móc đồng #A68B54.

**Động tác kiểm chứng:** Đưa móc gài về hướng chiến kỳ của đối phương nằm ngoài khung rồi kéo; không cần tạo cờ đối thủ trong sprite.

**Các lỗi bắt buộc loại bỏ:** không uốn cong cán, không đổi thành câu liêm dài bất thường, không mọc thêm cờ hoặc lưỡi.

### Prompt weapon-only (English, standalone)

```text
Create a WEAPON-ONLY CHARACTER EQUIPMENT REFERENCE SHEET for Reed Banner, tenth-century Vietnamese-inspired historical low fantasy. Owner: Lý Liệt. Weapon registry ID RB-038-W01. Associated signature ability: Xích Hỏa Đoạt Kỳ. Design: Trường đao cán gỗ thẳng có móc gài nhỏ trên sống lưỡi, dải vải đỏ dưới họng lưỡi. FIXED PROPORTIONS (provisional design ratios, not archaeological dimensions): tổng chiều dài khoảng 1,12 lần chiều cao người; lưỡi chiếm 0,28 chiều dài vũ khí; cán chiếm 0,72; cán thẳng tuyệt đối, không uốn để nhấn chuyển động. PART INVENTORY (exactly): Một trường đao một lưỡi, một móc đồng nhỏ cố định ở sống gần gốc lưỡi, một dải vải đỏ buộc dưới họng; không có lá cờ thứ hai.. MATERIAL AND HEX LOCK: lưỡi thép xám #707982; cán gỗ than #343236; dải vải son #C84231; nút buộc đỏ gạch #903C32; móc đồng #A68B54. Mechanical use: Đưa móc gài về hướng chiến kỳ của đối phương nằm ngoài khung rồi kéo; không cần tạo cờ đối thủ trong sprite.. ABSOLUTE NEGATIVE REQUIREMENTS: không uốn cong cán, không đổi thành câu liêm dài bất thường, không mọc thêm cờ hoặc lưỡi. The weapon is the same rigid physical object in all views; perspectives do not change its actual length, blade profile, shaft straightness, components, ornaments or color placement. Produce one clean technical presentation with three views of the SAME weapon: left-facing flat side view, three-quarter oblique view, and close-up on the signature mechanism. All parts separated clearly, no character hands, no people, no magical glow, no particles, no scenery. Clean hand-inked 2D game asset drawing with restrained cel shading; neutral consistent scale guides without text labels printed on image, flat uniform chroma background.
```

**Acceptance:** So sánh ba góc nhìn và ảnh Master; sai bất kỳ tỷ lệ/cán/màu/bộ phận nào thì không duyệt. Sau khi duyệt lưu ảnh chuẩn theo `RB-038-W01` để đính kèm trong cả sáu prompt.

---

## Tiêu Minh — `RB-053-W01`

**Kỹ năng:** Lôi Châm Khởi Tử. **Thiết kế:** Đôi hồ lô men tím và hộp năm kim châm có nắp gắn cẳng tay phải.

**Tỷ lệ đề xuất:** mỗi hồ lô cao 0,15 lần chiều cao người; hộp kim dài 0,42 lần cẳng tay, đủ năm rãnh, các kim có chiều dài bằng nhau.

**Danh mục bộ phận:** Đúng hai hồ lô nhỏ nối bằng một dây; một hộp kim trên cẳng tay phải với năm kim; không sinh thêm bình hoặc kim.

**Màu/địa điểm:** men tím #7656A4; viền tím nhạt #9B81C8; hộp xám bão #39465A; đai đen xám #313139; chốt đồng trầm #D6B75B.

**Động tác kiểm chứng:** Tay phải rút một kim, hai hồ lô buông tự nhiên theo dây; điện sét là hiệu ứng lập trình, không nằm trong vật thể.

**Các lỗi bắt buộc loại bỏ:** không biến kim thành tia điện hay vũ khí hiện đại, không nhân đôi hồ lô, không thêm bình thứ ba.

### Prompt weapon-only (English, standalone)

```text
Create a WEAPON-ONLY CHARACTER EQUIPMENT REFERENCE SHEET for Reed Banner, tenth-century Vietnamese-inspired historical low fantasy. Owner: Tiêu Minh. Weapon registry ID RB-053-W01. Associated signature ability: Lôi Châm Khởi Tử. Design: Đôi hồ lô men tím và hộp năm kim châm có nắp gắn cẳng tay phải. FIXED PROPORTIONS (provisional design ratios, not archaeological dimensions): mỗi hồ lô cao 0,15 lần chiều cao người; hộp kim dài 0,42 lần cẳng tay, đủ năm rãnh, các kim có chiều dài bằng nhau. PART INVENTORY (exactly): Đúng hai hồ lô nhỏ nối bằng một dây; một hộp kim trên cẳng tay phải với năm kim; không sinh thêm bình hoặc kim.. MATERIAL AND HEX LOCK: men tím #7656A4; viền tím nhạt #9B81C8; hộp xám bão #39465A; đai đen xám #313139; chốt đồng trầm #D6B75B. Mechanical use: Tay phải rút một kim, hai hồ lô buông tự nhiên theo dây; điện sét là hiệu ứng lập trình, không nằm trong vật thể.. ABSOLUTE NEGATIVE REQUIREMENTS: không biến kim thành tia điện hay vũ khí hiện đại, không nhân đôi hồ lô, không thêm bình thứ ba. The weapon is the same rigid physical object in all views; perspectives do not change its actual length, blade profile, shaft straightness, components, ornaments or color placement. Produce one clean technical presentation with three views of the SAME weapon: left-facing flat side view, three-quarter oblique view, and close-up on the signature mechanism. All parts separated clearly, no character hands, no people, no magical glow, no particles, no scenery. Clean hand-inked 2D game asset drawing with restrained cel shading; neutral consistent scale guides without text labels printed on image, flat uniform chroma background.
```

**Acceptance:** So sánh ba góc nhìn và ảnh Master; sai bất kỳ tỷ lệ/cán/màu/bộ phận nào thì không duyệt. Sau khi duyệt lưu ảnh chuẩn theo `RB-053-W01` để đính kèm trong cả sáu prompt.

---

## Mạnh Tường — `RB-058-W01`

**Kỹ năng:** Phong Lũy Hộ Kỳ. **Thiết kế:** Giáo cán thẳng có cờ ngọc nhỏ dưới mũi và khiên mây hình bầu dục, hai nẹp đồng chéo.

**Tỷ lệ đề xuất:** giáo cao 1,14 lần chiều cao người; đầu giáo dài 0,12 chiều dài giáo; khiên cao 0,44 chiều cao người, rộng bằng 0,62 chiều cao khiên.

**Danh mục bộ phận:** Một giáo một mũi lá, một lá cờ tam giác nhỏ gắn cố định dưới mũi giáo; một khiên mây hình bầu dục và đúng hai nẹp đồng; không có cờ rời.

**Màu/địa điểm:** cờ xanh ngọc #2E9E90; dây khiên xanh đậm #176A72; bọc tay trắng sương #E9EDE7; mây xám nhạt #A9B7B8; nẹp đồng #B49A69.

**Động tác kiểm chứng:** Hạ trọng tâm, chống giáo làm mốc phòng ngự, đưa khiên che cờ; cờ và khiên giữ nguyên tỷ lệ.

**Các lỗi bắt buộc loại bỏ:** không thêm chiến kỳ thứ hai, không biến cờ thành cánh chim, không phóng đại khiên.

### Prompt weapon-only (English, standalone)

```text
Create a WEAPON-ONLY CHARACTER EQUIPMENT REFERENCE SHEET for Reed Banner, tenth-century Vietnamese-inspired historical low fantasy. Owner: Mạnh Tường. Weapon registry ID RB-058-W01. Associated signature ability: Phong Lũy Hộ Kỳ. Design: Giáo cán thẳng có cờ ngọc nhỏ dưới mũi và khiên mây hình bầu dục, hai nẹp đồng chéo. FIXED PROPORTIONS (provisional design ratios, not archaeological dimensions): giáo cao 1,14 lần chiều cao người; đầu giáo dài 0,12 chiều dài giáo; khiên cao 0,44 chiều cao người, rộng bằng 0,62 chiều cao khiên. PART INVENTORY (exactly): Một giáo một mũi lá, một lá cờ tam giác nhỏ gắn cố định dưới mũi giáo; một khiên mây hình bầu dục và đúng hai nẹp đồng; không có cờ rời.. MATERIAL AND HEX LOCK: cờ xanh ngọc #2E9E90; dây khiên xanh đậm #176A72; bọc tay trắng sương #E9EDE7; mây xám nhạt #A9B7B8; nẹp đồng #B49A69. Mechanical use: Hạ trọng tâm, chống giáo làm mốc phòng ngự, đưa khiên che cờ; cờ và khiên giữ nguyên tỷ lệ.. ABSOLUTE NEGATIVE REQUIREMENTS: không thêm chiến kỳ thứ hai, không biến cờ thành cánh chim, không phóng đại khiên. The weapon is the same rigid physical object in all views; perspectives do not change its actual length, blade profile, shaft straightness, components, ornaments or color placement. Produce one clean technical presentation with three views of the SAME weapon: left-facing flat side view, three-quarter oblique view, and close-up on the signature mechanism. All parts separated clearly, no character hands, no people, no magical glow, no particles, no scenery. Clean hand-inked 2D game asset drawing with restrained cel shading; neutral consistent scale guides without text labels printed on image, flat uniform chroma background.
```

**Acceptance:** So sánh ba góc nhìn và ảnh Master; sai bất kỳ tỷ lệ/cán/màu/bộ phận nào thì không duyệt. Sau khi duyệt lưu ảnh chuẩn theo `RB-058-W01` để đính kèm trong cả sáu prompt.

---

## Biên bản và các việc chưa hoàn tất

| Nhân vật | Design decision | Hình học | Ảnh tham chiếu | Gameplay |
|---|---|---|---|---|
| Chu Ngân | Hướng thay đổi đã chọn | **Tỷ lệ đề xuất — chưa duyệt** | Chưa sinh/duyệt | Không sửa |
| Châu Ngọc | Hướng thay đổi đã chọn | **Tỷ lệ đề xuất — chưa duyệt** | Chưa sinh/duyệt | Không sửa |
| Lý Liệt | Hướng thay đổi đã chọn | **Tỷ lệ đề xuất — chưa duyệt** | Chưa sinh/duyệt | Không sửa |
| Tiêu Minh | Hướng thay đổi đã chọn | **Tỷ lệ đề xuất — chưa duyệt** | Chưa sinh/duyệt | Không sửa |
| Mạnh Tường | Hướng thay đổi đã chọn | **Tỷ lệ đề xuất — chưa duyệt** | Chưa sinh/duyệt | Không sửa |

- [ ] Tạo 5 ảnh weapon-only từ prompt trên, duyệt từng ảnh riêng.
- [ ] Đo lại tỷ lệ theo ảnh Master (tất cả tỷ lệ nêu trên đang là giả định art).
- [ ] Chốt đúng vị trí đạo cụ khi thay trang phục hoặc giáp khác tư thế.
- [ ] Sinh lại 6 frame của từng nhân vật bằng ảnh nhân vật + ảnh vũ khí đã duyệt.
- [ ] So sánh overlay vũ khí, kể cả khung hạ gục khi vũ khí rơi.
