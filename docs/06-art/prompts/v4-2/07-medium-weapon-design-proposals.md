# Reed Banner — Rà soát 16 cảnh báo MEDIUM: đề xuất tạo hình vũ khí độc bản

> Cập nhật: 24/10/2026 · Trạng thái: **ĐỀ XUẤT CHỜ DUYỆT** · Không tạo ảnh, không sửa gameplay, không ghi đè Weapon DNA trong 6 prompt.

## Kết luận rà soát

- 16 trường hợp MEDIUM được phân nhóm: **10 Mưu sĩ dùng quạt/đồ lệnh**, **2 Pháp sư**, **2 Binh lính**, **1 Tướng sĩ**, **1 Quân sư**.
- **Cảnh báo cũ có false positive:** các chữ *trấn*, *chấn* bị hiểu thành *ấn*. Không có căn cứ bắt Trần Lãm, Kha Sơn, Lê Thạch hay Ông Chấn phải cầm ấn đồng.
- Tên kỹ năng chỉ là chỉ dẫn ngữ nghĩa; cần đối chiếu hiệu ứng thực tế trong `src/core/battle/skills.ts`. Nếu chiêu thiên về suy yếu/khống chế/tiêu lương, vật cầm tay có thể là **đạo cụ chỉ huy**, không nhất thiết là vũ khí sát thương trực tiếp.
- Mục tiêu khác biệt cùng nghề: khác **hình bóng tổng thể, chất liệu, cơ chế sử dụng, đầu/cán/khung quạt, đạo cụ phụ và dấu hiệu dòng đời**. Không giải quyết trùng lặp chỉ bằng cách đổi màu HEX.
- Hình xăm, sẹo, phụ kiện hiện có phải giữ nếu đã duyệt. Những vật mới trong đề xuất cần đưa vào Master trước khi thêm vào khung ra chiêu/tuyệt chiêu.

## Bảng đề xuất nhanh

| Mã | Nhân vật | Kỹ năng | Thiết kế phân biệt | Phương án |
|---|---|---|---|---|
| RB-004 | Lưu Cơ | Đô Hộ Phủ Lệnh | Quạt lông cánh rộng + thẻ đồng chữ nhật | Giữ quạt lông trắng dạng bán nguyệt ngắn, đế hoa thị đồng tối; thêm thẻ phủ lệnh hình chữ nhật dẹt khắc rãnh đặt bên hông, không cầm hai vật khi đánh thường. |
| RB-007 | Đinh Liễn | Nam Việt Vương Ấn | Trượng gỗ đầu cầu + ấn vuông đai | Giữ trượng nghi lễ ngắn gỗ tối, đầu cầu Thủy; bổ sung ấn đồng khối vuông nhỏ treo ở đai với dây xanh thẫm, mặt ấn khắc motif sóng. |
| RB-008 | Trần Lãm | Bố Hải Trấn Giang | Cờ đuôi én chàm + thẻ tre dây gai | Giữ thẻ tre và cờ lệnh nhưng đổi cờ thành dạng đuôi én ngắn viền chàm, cột cờ gỗ sẫm đầu móc đồng, thẻ tre cột dây gai bản to. Không bổ sung ấn. |
| RB-010 | Ngô Xương Xí | Ngô Gia Di Mưu | Quạt nan tre phủ vải ngà | Thay quạt lông trắng phổ thông bằng quạt nan tre hẹp phủ vải ngà, một góc viền bạc với bốn nút chỉ kín; gấp lại thành thanh chỉ huy ngắn, không có lông vũ. |
| RB-016 | Nguyễn Thủ Tiệp | Tiên Du Đoạt Lương | Thước lệnh dẹt và dây bản đồ | Thay quạt lông trắng bằng thước lệnh gỗ bản dẹt, hai đầu bọc đồng, dây buộc bản đồ nhỏ sau đai; thước không có lưỡi. |
| RB-024 | Tô Kim | Kim Ngân Ly Tán | Quạt năm lông quạ đen bất đối xứng | Giữ quạt lông quạ đen nhưng cố định thành loại 5 lông lớn xếp lệch, cán đồng vòng kép, tua chỉ vàng ít; bề ngang hẹp và nghiêng rõ. |
| RB-030 | Nhan Trúc | Trúc Độc Mê Hồn | Quạt tròn tre đồng tâm + ống thảo dược | Giữ quạt tre tròn nhưng làm kiểu nan vòng đồng tâm như lá chắn nhỏ, mép dệt sợi xanh rêu, cán tre ngắn; ống bột thảo dược nhỏ giấu ở viền. |
| RB-036 | Quách Ẩn | Thủy Độn Ly Gián | Quạt xếp lam dài nan bạc | Giữ quạt xếp giấy lam nhưng bổ sung nan thép bạc mảnh hình chân vịt, quạt khi gấp rất dài và hẹp, buộc dây vải xanh thẫm. |
| RB-042 | Ninh Hỏa | Hỏa Thiêu Kho Lương | Quạt lá cọ tam giác cháy góc + túi dầu | Giữ quạt lá cọ nhưng thay lá thành tấm lá ép hình tam giác dài, viền cháy cũ chỉ ở góc, cán bọc dây đỏ gạch; túi dầu nhỏ niêm kín ở đai để diễn tả đốt kho. |
| RB-044 | Kha Sơn | Sơn Hà Trấn Kích | Rìu bán nguyệt + đối trọng vuông | Giữ rìu chiến đồng cán dài; làm lưỡi rìu bán nguyệt dày mép dưới bằng, đối trọng đồng vuông nhỏ ở sau đầu rìu, đai cổ cán vải thổ hoàng. Không thêm ấn. |
| RB-046 | Lê Thạch | Trấn Sơn Hộ Quân | Khiên tròn tâm đồng vuông + giáo vững | Giữ giáo và khiên mây tròn; làm khiên cao bản rộng, tâm khiên gia cố miếng đồng nổi hình vuông và ba dải đai chéo; giáo ngắn phần mũi và chắc, bản mũi lá. |
| RB-048 | Mã Nhạc | Đoạn Đạo Tuyệt Lương | Quạt bảng đo gập hai phiến | Giữ quạt lau vuông nhưng làm kiểu thước gập hai phiến cứng đan sậy, cạnh đóng gỗ sẫm, mặt có vạch đo quãng đường; kèm cuộn dây đo nhỏ ở thắt lưng. |
| RB-052 | Ông Chấn | Chấn Lôi Thiết Vệ | Khiên răng cưa đồng + giáo ngắn | Giữ giáo ngắn đầu bản rộng và khiên mây tròn; chuyển khiên thành vành đồng răng cưa nhẹ khắc vạch sét hình học, tâm khiên có gân nổi, giáo chuôi bọc xám tím. |
| RB-054 | Từ Kinh | Kinh Lôi Đoạt Khí | Quạt sắt lục giác khép | Giữ quạt xếp nan sắt khép như đoản trượng nhưng làm cán dày dạng lục giác, khớp quạt đồng tím, sống nan thép ngắn; khi mở chỉ tạo góc nhỏ. |
| RB-057 | Liễu Yên | Phong Ấn Cuồng Lưu | Trượng tre cầu ngọc + vòng phù ấn | Giữ trượng tre thon cao và quả cầu ngọc Phong, bổ sung vòng khuyên đồng khắc phù ấn bao quanh chân cầu, tua lông buộc phía dưới. Không thêm ấn cầm tay. |
| RB-060 | Bùi Phiêu | Phiêu Phong Ly Gián | Quạt đơn lông ngỗng cỡ lớn | Thay quạt lông ngỗng trắng phổ thông thành một lá lông ngỗng lớn dựng trên cán tre cong tự nhiên ngắn, kẹp đồng hình chữ V, dải vải Phong hai nhánh mỏng. |

## Đặc tả chi tiết từng nhân vật

### 1. Lưu Cơ — RB-004

**Chiêu dùng để đối chiếu:** Đô Hộ Phủ Lệnh.

**Đề xuất Weapon DNA:** Giữ quạt lông trắng dạng bán nguyệt ngắn, đế hoa thị đồng tối; thêm thẻ phủ lệnh hình chữ nhật dẹt khắc rãnh đặt bên hông, không cầm hai vật khi đánh thường.

**Hình khối đặc trưng cần khóa:** Quạt lông cánh rộng + thẻ đồng chữ nhật.

**Chuyển động khi ra chiêu:** Quạt mở để ra hiệu; rút thẻ phủ lệnh khi thi triển khống chế/khóa khí.

**Chống trùng và giới hạn:** Không đổi thành kiếm hoặc chung một quạt lông với Ngô Xương Xí. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Lưu Cơ, RB-004. Signature ability: Đô Hộ Phủ Lệnh. Canonical form to propose: Giữ quạt lông trắng dạng bán nguyệt ngắn, đế hoa thị đồng tối; thêm thẻ phủ lệnh hình chữ nhật dẹt khắc rãnh đặt bên hông, không cầm hai vật khi đánh thường.. Signature distinction: Quạt lông cánh rộng + thẻ đồng chữ nhật. Performance when using signature skill: Quạt mở để ra hiệu; rút thẻ phủ lệnh khi thi triển khống chế/khóa khí.. Negative uniqueness requirements: Không đổi thành kiếm hoặc chung một quạt lông với Ngô Xương Xí.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 2. Đinh Liễn — RB-007

**Chiêu dùng để đối chiếu:** Nam Việt Vương Ấn.

**Đề xuất Weapon DNA:** Giữ trượng nghi lễ ngắn gỗ tối, đầu cầu Thủy; bổ sung ấn đồng khối vuông nhỏ treo ở đai với dây xanh thẫm, mặt ấn khắc motif sóng.

**Hình khối đặc trưng cần khóa:** Trượng gỗ đầu cầu + ấn vuông đai.

**Chuyển động khi ra chiêu:** Đặt đầu trượng làm điểm hội tụ; đưa ấn ra phía trước trong tuyệt chiêu để thể hiện mệnh lệnh phong tỏa.

**Chống trùng và giới hạn:** Ấn là đạo cụ riêng; không biến quả cầu thành ấn. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Đinh Liễn, RB-007. Signature ability: Nam Việt Vương Ấn. Canonical form to propose: Giữ trượng nghi lễ ngắn gỗ tối, đầu cầu Thủy; bổ sung ấn đồng khối vuông nhỏ treo ở đai với dây xanh thẫm, mặt ấn khắc motif sóng.. Signature distinction: Trượng gỗ đầu cầu + ấn vuông đai. Performance when using signature skill: Đặt đầu trượng làm điểm hội tụ; đưa ấn ra phía trước trong tuyệt chiêu để thể hiện mệnh lệnh phong tỏa.. Negative uniqueness requirements: Ấn là đạo cụ riêng; không biến quả cầu thành ấn.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 3. Trần Lãm — RB-008

**Chiêu dùng để đối chiếu:** Bố Hải Trấn Giang.

**Đề xuất Weapon DNA:** Giữ thẻ tre và cờ lệnh nhưng đổi cờ thành dạng đuôi én ngắn viền chàm, cột cờ gỗ sẫm đầu móc đồng, thẻ tre cột dây gai bản to. Không bổ sung ấn.

**Hình khối đặc trưng cần khóa:** Cờ đuôi én chàm + thẻ tre dây gai.

**Chuyển động khi ra chiêu:** Hạ cờ làm hiệu phong tỏa tuyến sông, thẻ tre dùng diễn giải tuyến phòng ngự.

**Chống trùng và giới hạn:** Chữ 'Trấn' không có nghĩa là ấn tín; tránh trùng cờ tam giác Ngô Nhật Khánh. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Trần Lãm, RB-008. Signature ability: Bố Hải Trấn Giang. Canonical form to propose: Giữ thẻ tre và cờ lệnh nhưng đổi cờ thành dạng đuôi én ngắn viền chàm, cột cờ gỗ sẫm đầu móc đồng, thẻ tre cột dây gai bản to. Không bổ sung ấn.. Signature distinction: Cờ đuôi én chàm + thẻ tre dây gai. Performance when using signature skill: Hạ cờ làm hiệu phong tỏa tuyến sông, thẻ tre dùng diễn giải tuyến phòng ngự.. Negative uniqueness requirements: Chữ 'Trấn' không có nghĩa là ấn tín; tránh trùng cờ tam giác Ngô Nhật Khánh.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 4. Ngô Xương Xí — RB-010

**Chiêu dùng để đối chiếu:** Ngô Gia Di Mưu.

**Đề xuất Weapon DNA:** Thay quạt lông trắng phổ thông bằng quạt nan tre hẹp phủ vải ngà, một góc viền bạc với bốn nút chỉ kín; gấp lại thành thanh chỉ huy ngắn, không có lông vũ.

**Hình khối đặc trưng cần khóa:** Quạt nan tre phủ vải ngà.

**Chuyển động khi ra chiêu:** Dùng đầu quạt gấp chỉ một mục tiêu để ra dấu chia cắt chiến thuật.

**Chống trùng và giới hạn:** Độc bản chất liệu và mép quạt; tránh giống Lưu Cơ. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Ngô Xương Xí, RB-010. Signature ability: Ngô Gia Di Mưu. Canonical form to propose: Thay quạt lông trắng phổ thông bằng quạt nan tre hẹp phủ vải ngà, một góc viền bạc với bốn nút chỉ kín; gấp lại thành thanh chỉ huy ngắn, không có lông vũ.. Signature distinction: Quạt nan tre phủ vải ngà. Performance when using signature skill: Dùng đầu quạt gấp chỉ một mục tiêu để ra dấu chia cắt chiến thuật.. Negative uniqueness requirements: Độc bản chất liệu và mép quạt; tránh giống Lưu Cơ.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 5. Nguyễn Thủ Tiệp — RB-016

**Chiêu dùng để đối chiếu:** Tiên Du Đoạt Lương.

**Đề xuất Weapon DNA:** Thay quạt lông trắng bằng thước lệnh gỗ bản dẹt, hai đầu bọc đồng, dây buộc bản đồ nhỏ sau đai; thước không có lưỡi.

**Hình khối đặc trưng cần khóa:** Thước lệnh dẹt và dây bản đồ.

**Chuyển động khi ra chiêu:** Đặt thước trên sơ đồ tuyến vận lương hoặc chĩa vào hướng cần chặn.

**Chống trùng và giới hạn:** Thể hiện cắt tiếp tế, tránh quạt cùng nghề. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Nguyễn Thủ Tiệp, RB-016. Signature ability: Tiên Du Đoạt Lương. Canonical form to propose: Thay quạt lông trắng bằng thước lệnh gỗ bản dẹt, hai đầu bọc đồng, dây buộc bản đồ nhỏ sau đai; thước không có lưỡi.. Signature distinction: Thước lệnh dẹt và dây bản đồ. Performance when using signature skill: Đặt thước trên sơ đồ tuyến vận lương hoặc chĩa vào hướng cần chặn.. Negative uniqueness requirements: Thể hiện cắt tiếp tế, tránh quạt cùng nghề.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 6. Tô Kim — RB-024

**Chiêu dùng để đối chiếu:** Kim Ngân Ly Tán.

**Đề xuất Weapon DNA:** Giữ quạt lông quạ đen nhưng cố định thành loại 5 lông lớn xếp lệch, cán đồng vòng kép, tua chỉ vàng ít; bề ngang hẹp và nghiêng rõ.

**Hình khối đặc trưng cần khóa:** Quạt năm lông quạ đen bất đối xứng.

**Chuyển động khi ra chiêu:** Đóng quạt và xoay nghiêng để dàn thế tước khí, không biến lông thành phi tiêu.

**Chống trùng và giới hạn:** Không đổi thành quạt trắng hay vũ khí phi tiêu. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Tô Kim, RB-024. Signature ability: Kim Ngân Ly Tán. Canonical form to propose: Giữ quạt lông quạ đen nhưng cố định thành loại 5 lông lớn xếp lệch, cán đồng vòng kép, tua chỉ vàng ít; bề ngang hẹp và nghiêng rõ.. Signature distinction: Quạt năm lông quạ đen bất đối xứng. Performance when using signature skill: Đóng quạt và xoay nghiêng để dàn thế tước khí, không biến lông thành phi tiêu.. Negative uniqueness requirements: Không đổi thành quạt trắng hay vũ khí phi tiêu.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 7. Nhan Trúc — RB-030

**Chiêu dùng để đối chiếu:** Trúc Độc Mê Hồn.

**Đề xuất Weapon DNA:** Giữ quạt tre tròn nhưng làm kiểu nan vòng đồng tâm như lá chắn nhỏ, mép dệt sợi xanh rêu, cán tre ngắn; ống bột thảo dược nhỏ giấu ở viền.

**Hình khối đặc trưng cần khóa:** Quạt tròn tre đồng tâm + ống thảo dược.

**Chuyển động khi ra chiêu:** Xoay quạt khuấy bột thảo mộc; VFX độc làm trong engine, không bake khói xanh.

**Chống trùng và giới hạn:** Không biến thành quạt giấy xếp, giữ nghề Mưu sĩ. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Nhan Trúc, RB-030. Signature ability: Trúc Độc Mê Hồn. Canonical form to propose: Giữ quạt tre tròn nhưng làm kiểu nan vòng đồng tâm như lá chắn nhỏ, mép dệt sợi xanh rêu, cán tre ngắn; ống bột thảo dược nhỏ giấu ở viền.. Signature distinction: Quạt tròn tre đồng tâm + ống thảo dược. Performance when using signature skill: Xoay quạt khuấy bột thảo mộc; VFX độc làm trong engine, không bake khói xanh.. Negative uniqueness requirements: Không biến thành quạt giấy xếp, giữ nghề Mưu sĩ.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 8. Quách Ẩn — RB-036

**Chiêu dùng để đối chiếu:** Thủy Độn Ly Gián.

**Đề xuất Weapon DNA:** Giữ quạt xếp giấy lam nhưng bổ sung nan thép bạc mảnh hình chân vịt, quạt khi gấp rất dài và hẹp, buộc dây vải xanh thẫm.

**Hình khối đặc trưng cần khóa:** Quạt xếp lam dài nan bạc.

**Chuyển động khi ra chiêu:** Nửa khép quạt để che tín hiệu khi nghi binh, mở chậm để ra hiệu phân tán.

**Chống trùng và giới hạn:** Không thêm kiếm giấu trong quạt. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Quách Ẩn, RB-036. Signature ability: Thủy Độn Ly Gián. Canonical form to propose: Giữ quạt xếp giấy lam nhưng bổ sung nan thép bạc mảnh hình chân vịt, quạt khi gấp rất dài và hẹp, buộc dây vải xanh thẫm.. Signature distinction: Quạt xếp lam dài nan bạc. Performance when using signature skill: Nửa khép quạt để che tín hiệu khi nghi binh, mở chậm để ra hiệu phân tán.. Negative uniqueness requirements: Không thêm kiếm giấu trong quạt.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 9. Ninh Hỏa — RB-042

**Chiêu dùng để đối chiếu:** Hỏa Thiêu Kho Lương.

**Đề xuất Weapon DNA:** Giữ quạt lá cọ nhưng thay lá thành tấm lá ép hình tam giác dài, viền cháy cũ chỉ ở góc, cán bọc dây đỏ gạch; túi dầu nhỏ niêm kín ở đai để diễn tả đốt kho.

**Hình khối đặc trưng cần khóa:** Quạt lá cọ tam giác cháy góc + túi dầu.

**Chuyển động khi ra chiêu:** Giơ quạt điều hướng lửa hoặc mở nút túi dầu, không phóng lửa từ quạt.

**Chống trùng và giới hạn:** Không biến thành bó đuốc/khuôn phép phương Tây. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Ninh Hỏa, RB-042. Signature ability: Hỏa Thiêu Kho Lương. Canonical form to propose: Giữ quạt lá cọ nhưng thay lá thành tấm lá ép hình tam giác dài, viền cháy cũ chỉ ở góc, cán bọc dây đỏ gạch; túi dầu nhỏ niêm kín ở đai để diễn tả đốt kho.. Signature distinction: Quạt lá cọ tam giác cháy góc + túi dầu. Performance when using signature skill: Giơ quạt điều hướng lửa hoặc mở nút túi dầu, không phóng lửa từ quạt.. Negative uniqueness requirements: Không biến thành bó đuốc/khuôn phép phương Tây.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 10. Kha Sơn — RB-044

**Chiêu dùng để đối chiếu:** Sơn Hà Trấn Kích.

**Đề xuất Weapon DNA:** Giữ rìu chiến đồng cán dài; làm lưỡi rìu bán nguyệt dày mép dưới bằng, đối trọng đồng vuông nhỏ ở sau đầu rìu, đai cổ cán vải thổ hoàng. Không thêm ấn.

**Hình khối đặc trưng cần khóa:** Rìu bán nguyệt + đối trọng vuông.

**Chuyển động khi ra chiêu:** Cắm chân và quét rìu thấp tạo thế cản; khiên kỹ năng là hiệu ứng game, không mọc khiên vật lý.

**Chống trùng và giới hạn:** 'Trấn Kích' là đòn trấn áp, không phải ấn tín. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Kha Sơn, RB-044. Signature ability: Sơn Hà Trấn Kích. Canonical form to propose: Giữ rìu chiến đồng cán dài; làm lưỡi rìu bán nguyệt dày mép dưới bằng, đối trọng đồng vuông nhỏ ở sau đầu rìu, đai cổ cán vải thổ hoàng. Không thêm ấn.. Signature distinction: Rìu bán nguyệt + đối trọng vuông. Performance when using signature skill: Cắm chân và quét rìu thấp tạo thế cản; khiên kỹ năng là hiệu ứng game, không mọc khiên vật lý.. Negative uniqueness requirements: 'Trấn Kích' là đòn trấn áp, không phải ấn tín.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 11. Lê Thạch — RB-046

**Chiêu dùng để đối chiếu:** Trấn Sơn Hộ Quân.

**Đề xuất Weapon DNA:** Giữ giáo và khiên mây tròn; làm khiên cao bản rộng, tâm khiên gia cố miếng đồng nổi hình vuông và ba dải đai chéo; giáo ngắn phần mũi và chắc, bản mũi lá.

**Hình khối đặc trưng cần khóa:** Khiên tròn tâm đồng vuông + giáo vững.

**Chuyển động khi ra chiêu:** Hạ giáo sát mép khiên, dồn trọng tâm che đồng đội và khiêu khích.

**Chống trùng và giới hạn:** Chiêu bảo hộ không yêu cầu ấn, không cần đạo cụ mới. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Lê Thạch, RB-046. Signature ability: Trấn Sơn Hộ Quân. Canonical form to propose: Giữ giáo và khiên mây tròn; làm khiên cao bản rộng, tâm khiên gia cố miếng đồng nổi hình vuông và ba dải đai chéo; giáo ngắn phần mũi và chắc, bản mũi lá.. Signature distinction: Khiên tròn tâm đồng vuông + giáo vững. Performance when using signature skill: Hạ giáo sát mép khiên, dồn trọng tâm che đồng đội và khiêu khích.. Negative uniqueness requirements: Chiêu bảo hộ không yêu cầu ấn, không cần đạo cụ mới.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 12. Mã Nhạc — RB-048

**Chiêu dùng để đối chiếu:** Đoạn Đạo Tuyệt Lương.

**Đề xuất Weapon DNA:** Giữ quạt lau vuông nhưng làm kiểu thước gập hai phiến cứng đan sậy, cạnh đóng gỗ sẫm, mặt có vạch đo quãng đường; kèm cuộn dây đo nhỏ ở thắt lưng.

**Hình khối đặc trưng cần khóa:** Quạt bảng đo gập hai phiến.

**Chuyển động khi ra chiêu:** Đóng hai phiến làm động tác chỉ điểm chặn đường tiếp tế.

**Chống trùng và giới hạn:** Không đồng nhất với quạt tròn Nhan Trúc. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Mã Nhạc, RB-048. Signature ability: Đoạn Đạo Tuyệt Lương. Canonical form to propose: Giữ quạt lau vuông nhưng làm kiểu thước gập hai phiến cứng đan sậy, cạnh đóng gỗ sẫm, mặt có vạch đo quãng đường; kèm cuộn dây đo nhỏ ở thắt lưng.. Signature distinction: Quạt bảng đo gập hai phiến. Performance when using signature skill: Đóng hai phiến làm động tác chỉ điểm chặn đường tiếp tế.. Negative uniqueness requirements: Không đồng nhất với quạt tròn Nhan Trúc.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 13. Ông Chấn — RB-052

**Chiêu dùng để đối chiếu:** Chấn Lôi Thiết Vệ.

**Đề xuất Weapon DNA:** Giữ giáo ngắn đầu bản rộng và khiên mây tròn; chuyển khiên thành vành đồng răng cưa nhẹ khắc vạch sét hình học, tâm khiên có gân nổi, giáo chuôi bọc xám tím.

**Hình khối đặc trưng cần khóa:** Khiên răng cưa đồng + giáo ngắn.

**Chuyển động khi ra chiêu:** Đứng đón đòn với khiên dẫn trước, giáo giữ thấp; năng lượng không được bake ánh sáng lên giáp.

**Chống trùng và giới hạn:** Chữ 'Chấn' không phải 'Ấn', không thêm con dấu. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Ông Chấn, RB-052. Signature ability: Chấn Lôi Thiết Vệ. Canonical form to propose: Giữ giáo ngắn đầu bản rộng và khiên mây tròn; chuyển khiên thành vành đồng răng cưa nhẹ khắc vạch sét hình học, tâm khiên có gân nổi, giáo chuôi bọc xám tím.. Signature distinction: Khiên răng cưa đồng + giáo ngắn. Performance when using signature skill: Đứng đón đòn với khiên dẫn trước, giáo giữ thấp; năng lượng không được bake ánh sáng lên giáp.. Negative uniqueness requirements: Chữ 'Chấn' không phải 'Ấn', không thêm con dấu.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 14. Từ Kinh — RB-054

**Chiêu dùng để đối chiếu:** Kinh Lôi Đoạt Khí.

**Đề xuất Weapon DNA:** Giữ quạt xếp nan sắt khép như đoản trượng nhưng làm cán dày dạng lục giác, khớp quạt đồng tím, sống nan thép ngắn; khi mở chỉ tạo góc nhỏ.

**Hình khối đặc trưng cần khóa:** Quạt sắt lục giác khép.

**Chuyển động khi ra chiêu:** Giữ quạt khép trong thế khóa khí, chạm xuống để ra lệnh, không phóng sét.

**Chống trùng và giới hạn:** Không biến thành đoản kiếm hoặc chùy. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Từ Kinh, RB-054. Signature ability: Kinh Lôi Đoạt Khí. Canonical form to propose: Giữ quạt xếp nan sắt khép như đoản trượng nhưng làm cán dày dạng lục giác, khớp quạt đồng tím, sống nan thép ngắn; khi mở chỉ tạo góc nhỏ.. Signature distinction: Quạt sắt lục giác khép. Performance when using signature skill: Giữ quạt khép trong thế khóa khí, chạm xuống để ra lệnh, không phóng sét.. Negative uniqueness requirements: Không biến thành đoản kiếm hoặc chùy.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 15. Liễu Yên — RB-057

**Chiêu dùng để đối chiếu:** Phong Ấn Cuồng Lưu.

**Đề xuất Weapon DNA:** Giữ trượng tre thon cao và quả cầu ngọc Phong, bổ sung vòng khuyên đồng khắc phù ấn bao quanh chân cầu, tua lông buộc phía dưới. Không thêm ấn cầm tay.

**Hình khối đặc trưng cần khóa:** Trượng tre cầu ngọc + vòng phù ấn.

**Chuyển động khi ra chiêu:** Xoay trượng theo quỹ đạo cung tròn để kích hoạt 'phong ấn' trên vòng cố định.

**Chống trùng và giới hạn:** Ấn ở đây là phong ấn nghi lễ, không nhất thiết là con dấu. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Liễu Yên, RB-057. Signature ability: Phong Ấn Cuồng Lưu. Canonical form to propose: Giữ trượng tre thon cao và quả cầu ngọc Phong, bổ sung vòng khuyên đồng khắc phù ấn bao quanh chân cầu, tua lông buộc phía dưới. Không thêm ấn cầm tay.. Signature distinction: Trượng tre cầu ngọc + vòng phù ấn. Performance when using signature skill: Xoay trượng theo quỹ đạo cung tròn để kích hoạt 'phong ấn' trên vòng cố định.. Negative uniqueness requirements: Ấn ở đây là phong ấn nghi lễ, không nhất thiết là con dấu.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

### 16. Bùi Phiêu — RB-060

**Chiêu dùng để đối chiếu:** Phiêu Phong Ly Gián.

**Đề xuất Weapon DNA:** Thay quạt lông ngỗng trắng phổ thông thành một lá lông ngỗng lớn dựng trên cán tre cong tự nhiên ngắn, kẹp đồng hình chữ V, dải vải Phong hai nhánh mỏng.

**Hình khối đặc trưng cần khóa:** Quạt đơn lông ngỗng cỡ lớn.

**Chuyển động khi ra chiêu:** Vung nhẹ chiếc quạt lá đơn để ra hiệu nghi binh và di chuyển, không làm lông thành phi tiêu.

**Chống trùng và giới hạn:** Không dùng quạt bán nguyệt Lưu Cơ hoặc quạt tre Ngô Xương Xí. Cần giữ nguyên màu hành và chất liệu theo hồ sơ nhân vật; không đổi tương quan kích thước giữa 6 khung. Nếu ảnh Master hiện tại đã được duyệt, phương án thay đổi cần phê duyệt riêng trước khi dùng.

**Prompt điều chỉnh vũ khí (EN, standalone amendment — phải ghép cùng Character DNA đầy đủ khi áp dụng):**

```text
REED BANNER V4.2 PROPOSED WEAPON REDESIGN — Bùi Phiêu, RB-060. Signature ability: Phiêu Phong Ly Gián. Canonical form to propose: Thay quạt lông ngỗng trắng phổ thông thành một lá lông ngỗng lớn dựng trên cán tre cong tự nhiên ngắn, kẹp đồng hình chữ V, dải vải Phong hai nhánh mỏng.. Signature distinction: Quạt đơn lông ngỗng cỡ lớn. Performance when using signature skill: Vung nhẹ chiếc quạt lá đơn để ra hiệu nghi binh và di chuyển, không làm lông thành phi tiêu.. Negative uniqueness requirements: Không dùng quạt bán nguyệt Lưu Cơ hoặc quạt tre Ngô Xương Xí.. Fix the item as ONE rigid, consistently proportioned design across Master/Idle, normal attack, skill, ultimate, defeated and personal-style frames. Flexible textiles may fold; solid shaft, blades and fittings never bend or change length. Preserve the owner's established element palette, costume, face, scars, tattoos and personal identifiers. This is an approval-stage replacement specification, not an instruction to silently overwrite existing approved artwork.
```

---

## Lộ trình thay đổi trong tài liệu

1. Duyệt hoặc từ chối đề xuất từng nhân vật; không áp dụng hàng loạt chưa duyệt.
2. Sau khi duyệt: thay Weapon DNA **cùng một phiên bản** trong sáu prompt, kèm mô tả tiếng Việt và Weapon ID; cập nhật lý do trong audit.
3. Kiểm tra xung đột cùng nghề: Lưu Cơ / Ngô Xương Xí / Nguyễn Thủ Tiệp / Tô Kim / Nhan Trúc / Quách Ẩn / Ninh Hỏa / Mã Nhạc / Từ Kinh / Bùi Phiêu phải có silhouette đạo cụ khác nhau.
4. Không tạo ảnh hoặc chạy code gameplay trong phạm vi công việc này.
