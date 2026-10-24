# Reed Banner — Audit nhóm A: 19 nhân vật lịch sử và sứ quân

> **Ngày:** 25/10/2026 · **Hình thức:** kiểm định nội dung Markdown trên nhánh `develop`; **không sinh ảnh, không thay gameplay, chưa ghi đè file prompt V4.2**. Chỉ các 2 nhân vật đã được sửa trước đó được coi là "đã chỉnh prompt"; những dòng còn lại là khuyến nghị chờ triển khai.

## Bản nguồn và chuẩn hiệu lực

1. **Nguồn prompt mới nhất cho nhóm A:** [01-chinh-lich-su-su-quan.md](./01-chinh-lich-su-su-quan.md), đọc từ `develop` trực tiếp, không đọc tài liệu V3.1 đã xóa.
2. **Kỹ năng thực:** `src/core/battle/skills.ts` và roster `src/core/roster/roster.ts`. Role skill ô 3 được đối chiếu theo nghề: Tướng sĩ `role_phaTran`; Binh lính `role_tuongKhien`; Mưu sĩ `role_lyGian`; Y sư `role_duongSinh`; Quân sư `role_hieuLenh`; Pháp sư `role_nguHanhAn`. Ô 4 đối chiếu ID thật của từng nhân vật.
3. **Báo cáo đề xuất trước, chưa thay asset:** [07-medium-weapon-design-proposals.md](./07-medium-weapon-design-proposals.md). Các mục MEDIUM trong file 07 chỉ là *phương án*, không tự nhận là đã được đưa vào prompt 01.
4. **Hai lỗi đã sửa ở lượt trước:** Nguyễn Khoan, Kiều Công Hãn; nhắc đến ở [13-personality-frame-usage-and-prompt-qa.md](./13-personality-frame-usage-and-prompt-qa.md).
5. **Nguyễn Bặc:** theo quyết định người dùng **giữ nguyên vũ khí**; không làm theo cảnh báo HIGH cũ yêu cầu bổ sung cờ.
6. **Lưu ý kỹ thuật:** nhiều skill cá nhân được khai báo slot 5 ở raw data lịch sử nhưng `CHARACTER_SKILLS` chuyển sang **slot 4** khi đưa vào gameplay hiện hành. Không gắn nhầm ultimate vào ô 5.
7. **Đinh Bộ Lĩnh:** nghề/hành thay đổi được; `RB-001` hiện đang mô tả một preset **Tướng sĩ/Mộc**, tuyệt chiêu của preset đó `dbl_tuongSi_moc` (**Bình định · Mộc**), không đại diện mọi phiên bản loadout.

## Tổng hợp kết quả

| Phân loại | Số lượng | Giải thích |
|---|---:|---|
| **Cao** | **12** | Rủi ro lớn do vũ khí dài, trùng vũ khí hoặc cơ chế pose chưa phân biệt |
| **Trung bình** | **5** | Prompt còn chung chung, chỉnh được bằng động tác và nhận diện vũ khí |
| **Đã chỉnh prompt; cần nghiệm thu ảnh** | **2** | Văn bản đã xử lý, vẫn cần quan sát ảnh mới sau này |

**Phát hiện định lượng:** nhóm A có **19 nhân vật × 6 khung = 114 prompt**. Hai người RB-012, RB-013 đã được thay chỉ dẫn chuyên biệt; **17 người còn lại** vẫn mang cùng ba chỉ dẫn kiểu chung ở khung 2/3/4, tương đương **51 mô tả động tác còn cần viết lại**. Đây là rủi ro văn bản, **không phải 51 ảnh thực tế đã lỗi**.

## Bảng quyết định ưu tiên (19/19)

| Mã | Nhân vật | Nghề/hành | Trang bị trong prompt mới nhất | Rủi ro | Mức độ |
|---|---|---|---|---|---|
| RB-001 | Đinh Bộ Lĩnh | Tướng sĩ / Mộc (preset) | Trường đao lá bản rộng, chuôi vòng đồng, tua son | Tướng sĩ/Mộc hiện là preset art, nhưng nhân vật chính đổi được nghề/hành; ultimate `dbl_{nghề}_{hành}` không cố định. | **Cao** |
| RB-002 | Nguyễn Bặc | Tướng sĩ / Hỏa | Đại đao đơn lưỡi, dải vải đỏ tại chắn tay/chuôi | Dao và trang phục dễ giống Đinh Bộ Lĩnh; báo cáo HIGH cũ gợi thêm cờ nhưng **đã bị bác bỏ**. | **Trung bình** |
| RB-003 | Đinh Điền | Binh lính / Thổ | Giáo cán gỗ thẳng, mũi lá hẹp, chùm lông lau trắng; khiên mây tròn | Trục giáo dễ bị khuyết giữa cán khi tay/khiên chồng lớp, đặc biệt trong khung bảo vệ. | **Cao** |
| RB-004 | Lưu Cơ | Mưu sĩ / Kim | Quạt lông trắng dạng nan tỏa từ hoa thị đồng đen, tua vàng | Rất dễ trùng quạt trắng của Ngô Xương Xí/Nguyễn Thủ Tiệp; chiêu Đô Hộ Phủ Lệnh dùng khống chế, không phải vung quạt phép. | **Cao** |
| RB-005 | Trịnh Tú | Y sư / Mộc | Hồ lô thuốc hai bầu màu đất, nắp đồng, hai tua xanh | Đánh thường/y thuật/ultimate dễ thành một tư thế nâng bình, cũng gần Kiều Thuận. | **Trung bình** |
| RB-006 | Lê Hoàn | Quân sư / Lôi | Cờ lệnh tam giác ngắn tay phải và bó thẻ tre tay trái | Đồng dạng 1:1 với Trần Lãm và Ngô Nhật Khánh; kỹ năng diện rộng cần biểu tượng chỉ huy khác biệt. | **Cao** |
| RB-007 | Đinh Liễn | Pháp sư / Thủy | Trượng nghi lễ gỗ–đồng ngắn, đầu cầu Thủy | Cùng silhouette trượng đầu cầu với Lữ Đường; riêng tên 'Nam Việt Vương Ấn' dễ khiến model biến đầu cầu thành ấn. | **Cao** |
| RB-008 | Trần Lãm | Quân sư / Thủy | Cờ lệnh tam giác và bó thẻ tre | Trùng bộ với Lê Hoàn, Ngô Nhật Khánh; audit cũ đọc nhầm chữ 'Trấn' thành 'Ấn' và gợi ấn đồng. | **Cao** |
| RB-009 | Phạm Bạch Hổ | Tướng sĩ / Hỏa | Đại đao cực rộng, sống có khía và cán quấn lông trắng | Vũ khí lớn dễ bị thu nhỏ khi ra chiêu hoặc giống các tướng cầm đao cùng nhóm. | **Trung bình** |
| RB-010 | Ngô Xương Xí | Mưu sĩ / Kim | Quạt lông trắng gần như không có hình học riêng | Trùng ngay vũ khí Lưu Cơ/Nguyễn Thủ Tiệp, khó nhận diện; MEDIUM đề xuất quạt nan tre chưa áp dụng. | **Cao** |
| RB-011 | Ngô Nhật Khánh | Quân sư / Phong | Cờ lệnh tam giác ngắn + thẻ tre, giống 2 quân sư khác | Nguy cơ model sao chép Lê Hoàn/Trần Lãm; Phong xoáy dễ sinh tua vải vô lý. | **Cao** |
| RB-012 | Nguyễn Khoan | Binh lính / Thổ | Giáo một cán liên tục và khiên mây tròn | Ảnh người dùng phản ánh thương bị gãy; prompt mới đã viết lại 6 khung, song chưa thể khẳng định ảnh cũ tự được sửa. | **Đã chỉnh prompt; cần nghiệm thu ảnh** |
| RB-013 | Kiều Công Hãn | Pháp sư / Lôi | Trượng gỗ ngắn có cầu Lôi trong vòng đồng | Người dùng phản ánh khung đánh thường và ra chiêu giống nhau; prompt 6 khung đã được sửa, chưa tạo ảnh kiểm chứng. | **Đã chỉnh prompt; cần nghiệm thu ảnh** |
| RB-014 | Kiều Thuận | Y sư / Mộc | Hồ lô thuốc nắp đồng treo dây | Giống Trịnh Tú và các y sư dùng hồ lô, 3 khung dễ cùng giơ bình. | **Trung bình** |
| RB-015 | Lý Khuê | Tướng sĩ / Kim | Kiếm đồng hai lưỡi thẳng | Kỹ năng xuyên giáp dễ khiến prompt tạo kiếm phình lưỡi, sống thành đao hoặc mọc hai kiếm. | **Trung bình** |
| RB-016 | Nguyễn Thủ Tiệp | Mưu sĩ / Thủy | Quạt lông trắng trùng Lưu Cơ/Ngô Xương Xí | Chức năng chiêu đoạt lương mà đạo cụ không có nét nhận diện về hậu cần; quạt trùng 2 tướng. | **Cao** |
| RB-017 | Lữ Đường | Pháp sư / Thủy | Trượng gỗ đồng ngắn có cầu Thủy giống Đinh Liễn | Pháp trượng gần như y hệt Đinh Liễn; ra chiêu/ultimate có nguy cơ cùng một dáng giơ trượng. | **Cao** |
| RB-018 | Nguyễn Siêu | Binh lính / Hỏa | Giáo dựng tay phải và khiên mây tròn bên trái, giống Nguyễn Khoan | Giáo cán dài dễ gãy/trùng với Đinh Điền và Nguyễn Khoan; tuyệt chiêu Hỏa Lũy là phòng thủ tự thân, không phải đâm. | **Cao** |
| RB-019 | Đỗ Cảnh Thạc | Tướng sĩ / Thổ | Búa chiến cán rất dài, đầu đồng vuông rất nặng | Ảnh AI dễ biến búa thành rìu/chùy, cán uốn cong, đầu đồng xoay hướng khi giơ cao. | **Cao** |

## Đề xuất cụ thể từng nhân vật

### RB-001 — Đinh Bộ Lĩnh

**Trạng thái:** Cao. **Trang bị:** Trường đao lá bản rộng, chuôi vòng đồng, tua son.

**Vấn đề thực tế hoặc rủi ro nội dung:** Tướng sĩ/Mộc hiện là preset art, nhưng nhân vật chính đổi được nghề/hành; ultimate `dbl_{nghề}_{hành}` không cố định.

**Khung 2 — Đánh thường (phương án):** Một nhát đao ngang thấp, trọng tâm chân trước, tua đao rơi theo lực quán tính.

**Khung 3 — Ra chiêu nghề (phương án):** **Phá trận** (`role_phaTran`): vung đao chéo từ thấp lên để mở giáp; một lưỡi, không thêm đạo cụ.

**Khung 4 — Tuyệt chiêu riêng (phương án):** Preset Tướng sĩ/Mộc: **Bình định · Mộc** (`dbl_tuongSi_moc`), thế chém áp đảo một mục tiêu; hồi đồng đội thuộc gameplay. Nếu đổi nghề/hành, phải viết biến thể prompt theo build tương ứng.

**Ràng buộc vũ khí / quyết định:** Chốt rõ master dành cho preset Tướng sĩ/Mộc, không áp sai cho nghề khác; ổn định chuôi vòng và tua, tránh giống Nguyễn Bặc.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-002 — Nguyễn Bặc

**Trạng thái:** Trung bình. **Trang bị:** Đại đao đơn lưỡi, dải vải đỏ tại chắn tay/chuôi.

**Vấn đề thực tế hoặc rủi ro nội dung:** Dao và trang phục dễ giống Đinh Bộ Lĩnh; báo cáo HIGH cũ gợi thêm cờ nhưng **đã bị bác bỏ**.

**Khung 2 — Đánh thường (phương án):** Vung đao chém ngang bằng một tay, nghiêng vai đỡ lực, không đổi lưỡi.

**Khung 3 — Ra chiêu nghề (phương án):** **Phá trận** (`role_phaTran`): chém ngắn hơn, hướng vào thế giáp yếu và thu hồi ngay.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Định Quốc Hỏa Kỳ** (`dinhQuocHoaKy`): đại đao nâng cao làm hiệu lệnh rồi hạ xuống; thiêu đốt và tăng ATK toàn đội là hiệu ứng riêng, **không thêm cờ**.

**Ràng buộc vũ khí / quyết định:** GIỮ NGUYÊN vũ khí theo quyết định người dùng. Chỉ tách dáng, màu/dải vải, tay cầm; không sửa hình học.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-003 — Đinh Điền

**Trạng thái:** Cao. **Trang bị:** Giáo cán gỗ thẳng, mũi lá hẹp, chùm lông lau trắng; khiên mây tròn.

**Vấn đề thực tế hoặc rủi ro nội dung:** Trục giáo dễ bị khuyết giữa cán khi tay/khiên chồng lớp, đặc biệt trong khung bảo vệ.

**Khung 2 — Đánh thường (phương án):** Một cú đâm giáo thẳng ngắn qua vai phải, khiên ôm trái, cả mũi và chuôi đều thấy.

**Khung 3 — Ra chiêu nghề (phương án):** **Tường khiên** (`role_tuongKhien`): đưa khiên trái về phía trước để chắn, giáo dựng nguyên cây ra ngoài biên khiên, không đâm.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Ngoại Giáp Hộ Quân** (`ngoaiGiapHoQuan`): che chắn đồng đội và trụ vững, khiên đưa ngang ngực; giáo dựng thẳng tách khỏi người, phản đòn/taunt VFX riêng.

**Ràng buộc vũ khí / quyết định:** Khóa đường liên tục chuôi–cán–mũi, chùm lông chỉ một vị trí ngay dưới mũi; không để trượng gãy hoặc khiên có hai mặt.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-004 — Lưu Cơ

**Trạng thái:** Cao. **Trang bị:** Quạt lông trắng dạng nan tỏa từ hoa thị đồng đen, tua vàng.

**Vấn đề thực tế hoặc rủi ro nội dung:** Rất dễ trùng quạt trắng của Ngô Xương Xí/Nguyễn Thủ Tiệp; chiêu Đô Hộ Phủ Lệnh dùng khống chế, không phải vung quạt phép.

**Khung 2 — Đánh thường (phương án):** Quạt mở nửa vệt thấp như phẩy ra dấu ngắn, tay còn lại đỡ vạt áo.

**Khung 3 — Ra chiêu nghề (phương án):** **Ly gián** (`role_lyGian`): đóng quạt sát thân, tay trái chỉ hướng sai làm nghi binh; không giơ quạt như đang chém.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Đô Hộ Phủ Lệnh** (`doHoPhuLenh`): quạt dựng như hiệu lệnh hành chính, mắt nhìn thẳng; làm câm, giảm DEF, trừ năng lượng là hiệu ứng game.

**Ràng buộc vũ khí / quyết định:** Đề xuất giữ quạt hoa thị ấn tượng, *cân nhắc* thêm thẻ lệnh gắn sẵn thắt lưng; chưa thêm vào master trước duyệt.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-005 — Trịnh Tú

**Trạng thái:** Trung bình. **Trang bị:** Hồ lô thuốc hai bầu màu đất, nắp đồng, hai tua xanh.

**Vấn đề thực tế hoặc rủi ro nội dung:** Đánh thường/y thuật/ultimate dễ thành một tư thế nâng bình, cũng gần Kiều Thuận.

**Khung 2 — Đánh thường (phương án):** Một động tác phòng thân gạt nhẹ bằng cẳng tay trái, tay phải giữ hồ lô ở ngang hông, không ném bình.

**Khung 3 — Ra chiêu nghề (phương án):** **Dưỡng sinh** (`role_duongSinh`): kiểm nắp thuốc, tay trái mở nhẹ như mời đồng đội dùng thuốc, không tung pháp khí.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Hoa Lư Thảo Dược** (`hoaLuThaoDuoc`): bình đưa trước ngang ngực, tay còn lại đỡ đáy, tập trung hồi/giải hiệu ứng cho phe.

**Ràng buộc vũ khí / quyết định:** Giữ đúng hai tua xanh và nắp đồng; khác Kiều Thuận bằng hai bầu rõ và cách hai tay nâng bình.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-006 — Lê Hoàn

**Trạng thái:** Cao. **Trang bị:** Cờ lệnh tam giác ngắn tay phải và bó thẻ tre tay trái.

**Vấn đề thực tế hoặc rủi ro nội dung:** Đồng dạng 1:1 với Trần Lãm và Ngô Nhật Khánh; kỹ năng diện rộng cần biểu tượng chỉ huy khác biệt.

**Khung 2 — Đánh thường (phương án):** Quét cờ ngắn theo đường ngang ngực làm hiệu lệnh, bó thẻ tre giữ sát hông trái.

**Khung 3 — Ra chiêu nghề (phương án):** **Hiệu lệnh** (`role_hieuLenh`): cờ nâng chéo về trước một góc nhỏ, chân trụ vững; ngón tay trái đặt lên bó thẻ tre.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Thập Đạo Lôi Binh** (`thapDaoLoiBinh`): cờ giương cao theo hướng xông trận, vai mở, thẻ tre ép vào ngực; đòn đánh nhiều mục tiêu + năng lượng toàn đội là game.

**Ràng buộc vũ khí / quyết định:** Chưa tự đổi vũ khí: đề xuất đầu cán cờ có nút đồng mười gờ hoặc họa tiết thập đạo và tỷ lệ riêng, không thêm cờ thứ hai.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-007 — Đinh Liễn

**Trạng thái:** Cao. **Trang bị:** Trượng nghi lễ gỗ–đồng ngắn, đầu cầu Thủy.

**Vấn đề thực tế hoặc rủi ro nội dung:** Cùng silhouette trượng đầu cầu với Lữ Đường; riêng tên 'Nam Việt Vương Ấn' dễ khiến model biến đầu cầu thành ấn.

**Khung 2 — Đánh thường (phương án):** Chĩa đầu trượng thấp về trước trong một nhịp phòng vệ ngắn, không giơ cao.

**Khung 3 — Ra chiêu nghề (phương án):** **Ngũ hành ấn** (`role_nguHanhAn`): trượng dựng sát sườn phải, tay trái mở ấn trước ngực, chân đứng yên.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Nam Việt Vương Ấn** (`namVietVuongAn`): một tay nâng trượng, tay trái đưa lòng bàn tay tạo nghi thức ấn; đóng băng/đổi ô là VFX game.

**Ràng buộc vũ khí / quyết định:** Bổ sung **ấn đồng nhỏ tại đai** là đề xuất từ báo cáo MEDIUM chưa duyệt; nếu không thêm ấn, tay làm thủ ấn đủ gợi chiêu.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-008 — Trần Lãm

**Trạng thái:** Cao. **Trang bị:** Cờ lệnh tam giác và bó thẻ tre.

**Vấn đề thực tế hoặc rủi ro nội dung:** Trùng bộ với Lê Hoàn, Ngô Nhật Khánh; audit cũ đọc nhầm chữ 'Trấn' thành 'Ấn' và gợi ấn đồng.

**Khung 2 — Đánh thường (phương án):** Quạt ngang cờ ngắn ở tầm hông và bước đổi trụ một nửa nhịp; bó thẻ tre giữ ổn định.

**Khung 3 — Ra chiêu nghề (phương án):** **Hiệu lệnh** (`role_hieuLenh`): giương cờ thẳng sát vai, dùng thẻ tre như chỉ thị tuyến phòng ngự.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Bố Hải Trấn Giang** (`boHaiTranGiang`): hạ cờ về mép đất tưởng tượng, tay trái giữ thẻ tre hướng thẳng bến sông, tư thế phòng tuyến; khống chế Thủy/VFX riêng.

**Ràng buộc vũ khí / quyết định:** BỎ đề xuất thêm ấn đồng dựa vào chữ 'Trấn'; cân nhắc cờ ngắn dạng đuôi én chàm theo file 07, chỉ sau khi duyệt hình học.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-009 — Phạm Bạch Hổ

**Trạng thái:** Trung bình. **Trang bị:** Đại đao cực rộng, sống có khía và cán quấn lông trắng.

**Vấn đề thực tế hoặc rủi ro nội dung:** Vũ khí lớn dễ bị thu nhỏ khi ra chiêu hoặc giống các tướng cầm đao cùng nhóm.

**Khung 2 — Đánh thường (phương án):** Đao quét ngang rộng bằng hai tay hay một tay phụ tì chuôi nhưng đầu lưỡi không biến dạng.

**Khung 3 — Ra chiêu nghề (phương án):** **Phá trận** (`role_phaTran`): lấy vai làm trụ, lưỡi chém xiên xuống theo khoảng giáp; đầu đao không xoắn.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Bạch Hổ Xuất Sơn** (`bachHoXuatSon`): tư thế lao mạnh một mục tiêu bằng đại đao rộng, áo/lông rung tự nhiên; thiêu đốt và ATK tự tăng là VFX.

**Ràng buộc vũ khí / quyết định:** Khóa tỷ lệ mặt lưỡi thật rộng, số khía trên sống và phần quấn lông ở cán; chống vẽ thêm móng vuốt hổ thật.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-010 — Ngô Xương Xí

**Trạng thái:** Cao. **Trang bị:** Quạt lông trắng gần như không có hình học riêng.

**Vấn đề thực tế hoặc rủi ro nội dung:** Trùng ngay vũ khí Lưu Cơ/Nguyễn Thủ Tiệp, khó nhận diện; MEDIUM đề xuất quạt nan tre chưa áp dụng.

**Khung 2 — Đánh thường (phương án):** Quạt hướng xuống trong động tác gạt thư/tín hiệu, tướng lùi một bước và nhìn nghiêng.

**Khung 3 — Ra chiêu nghề (phương án):** **Ly gián** (`role_lyGian`): quạt khép sát ngực, bàn tay kia hướng lệch để phân tán đối phương.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Ngô Gia Di Mưu** (`ngoGiaDiMuu`): quạt thu hẹp áp vào cánh tay, chỉ một đối thủ với cổ tay; xuyên giáp và câm lặng thuộc code.

**Ràng buộc vũ khí / quyết định:** Đề xuất thay thành **quạt nan tre hẹp phủ vải ngà** theo báo cáo 07 để thực sự khác lông trắng; chỉ thay sau phê duyệt.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-011 — Ngô Nhật Khánh

**Trạng thái:** Cao. **Trang bị:** Cờ lệnh tam giác ngắn + thẻ tre, giống 2 quân sư khác.

**Vấn đề thực tế hoặc rủi ro nội dung:** Nguy cơ model sao chép Lê Hoàn/Trần Lãm; Phong xoáy dễ sinh tua vải vô lý.

**Khung 2 — Đánh thường (phương án):** Chuyển tay phải cờ theo đường vòng rộng ngang vai, thẻ tre giữ kín bên trái.

**Khung 3 — Ra chiêu nghề (phương án):** **Hiệu lệnh** (`role_hieuLenh`): chỉ hướng đội hình bằng đầu cờ nghiêng lên, chân lùi nửa bước.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Đường Lâm Phong Khởi** (`duongLamPhongKhoi`): thả thấp cờ như lệnh chuyển đội hình, hướng cờ chéo xuống; xua tan và xoay ô chỉ là hiệu ứng trận.

**Ràng buộc vũ khí / quyết định:** Đề xuất khóa tua cờ đôi màu Phong, đầu cán dạng dẹp, nhưng chờ duyệt thay đổi trang bị gốc; không sinh thêm cờ thứ hai.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-012 — Nguyễn Khoan

**Trạng thái:** Đã chỉnh prompt; cần nghiệm thu ảnh. **Trang bị:** Giáo một cán liên tục và khiên mây tròn.

**Vấn đề thực tế hoặc rủi ro nội dung:** Ảnh người dùng phản ánh thương bị gãy; prompt mới đã viết lại 6 khung, song chưa thể khẳng định ảnh cũ tự được sửa.

**Khung 2 — Đánh thường (phương án):** Đã mô tả một nhát đâm thẳng, cả mũi/chuôi rõ, khiên không che cán.

**Khung 3 — Ra chiêu nghề (phương án):** **Tường khiên** (`role_tuongKhien`): giơ khiên bảo vệ, giáo dựng cạnh sườn phải, không đâm.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Tam Đái Kiên Thành** (`tamDaiKienThanh`): thế thủ thành, khiên trụ trước ngực, một giáo liền mạch bên phải.

**Ràng buộc vũ khí / quyết định:** Giữ prompt đã sửa trong file 01; kiểm ảnh mới bằng silhouette riêng, không thêm khớp giữa cán hoặc thân giáo bị che.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-013 — Kiều Công Hãn

**Trạng thái:** Đã chỉnh prompt; cần nghiệm thu ảnh. **Trang bị:** Trượng gỗ ngắn có cầu Lôi trong vòng đồng.

**Vấn đề thực tế hoặc rủi ro nội dung:** Người dùng phản ánh khung đánh thường và ra chiêu giống nhau; prompt 6 khung đã được sửa, chưa tạo ảnh kiểm chứng.

**Khung 2 — Đánh thường (phương án):** Đã sửa: điểm trượng ngang hông bằng tay phải, người đổ trước.

**Khung 3 — Ra chiêu nghề (phương án):** **Ngũ hành ấn** (`role_nguHanhAn`): trượng DỰNG cạnh sườn phải, bàn tay trái mở xòe kết ấn; KHÔNG đâm.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Phong Châu Lôi Kích** (`phongChauLoiKich`): hai tay nâng trượng quá trán, tạo silhouette riêng.

**Ràng buộc vũ khí / quyết định:** Giữ trượng một thân cao ~0,54H, một vòng đồng + một cầu tím, các tay không chồng sai.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-014 — Kiều Thuận

**Trạng thái:** Trung bình. **Trang bị:** Hồ lô thuốc nắp đồng treo dây.

**Vấn đề thực tế hoặc rủi ro nội dung:** Giống Trịnh Tú và các y sư dùng hồ lô, 3 khung dễ cùng giơ bình.

**Khung 2 — Đánh thường (phương án):** Phản xạ bước lùi và bảo vệ hồ lô bằng hai tay; không lấy hồ lô làm chùy.

**Khung 3 — Ra chiêu nghề (phương án):** **Dưỡng sinh** (`role_duongSinh`): một tay đỡ bầu hồ lô, tay kia mở hiệu lệnh hồi sức.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Hồi Hồ Sinh Khí** (`hoiHoSinhKhi`): nghiêng hồ lô sát tim, lòng bàn tay còn lại mở về phía đồng minh, không tạo hồi sinh người chết.

**Ràng buộc vũ khí / quyết định:** Nếu không thay vũ khí, khóa dáng hồ lô một bầu, nắp đồng, dây duy nhất; phân biệt hồ lô hai bầu của Trịnh Tú.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-015 — Lý Khuê

**Trạng thái:** Trung bình. **Trang bị:** Kiếm đồng hai lưỡi thẳng.

**Vấn đề thực tế hoặc rủi ro nội dung:** Kỹ năng xuyên giáp dễ khiến prompt tạo kiếm phình lưỡi, sống thành đao hoặc mọc hai kiếm.

**Khung 2 — Đánh thường (phương án):** Một đường đâm thẳng ngang thân, kiếm hai cạnh giữ hình học.

**Khung 3 — Ra chiêu nghề (phương án):** **Phá trận** (`role_phaTran`): đổi trục bước để đâm vào kẽ giáp, tay còn lại mở giữ thăng bằng.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Siêu Loại Phá Giáp** (`sieuLoaiPhaGiap`): đưa mũi kiếm thẳng trước theo trục khuỷu, chân sau ép mạnh, không đổi thành thương.

**Ràng buộc vũ khí / quyết định:** Khóa một kiếm đồng hai lưỡi, trục chuôi–mũi thẳng; không nhân đôi kiếm hoặc thành tia Kim.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-016 — Nguyễn Thủ Tiệp

**Trạng thái:** Cao. **Trang bị:** Quạt lông trắng trùng Lưu Cơ/Ngô Xương Xí.

**Vấn đề thực tế hoặc rủi ro nội dung:** Chức năng chiêu đoạt lương mà đạo cụ không có nét nhận diện về hậu cần; quạt trùng 2 tướng.

**Khung 2 — Đánh thường (phương án):** Quạt thấp, tay trái như che giấu lệnh; bước nhỏ sang bên.

**Khung 3 — Ra chiêu nghề (phương án):** **Ly gián** (`role_lyGian`): quạt thu sát người, tay trái đánh lạc hướng.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Tiên Du Đoạt Lương** (`tienDuDoatLuong`): tay không hướng một tuyến vận lương tưởng tượng, quạt giữ ngang hông; giảm lương/năng lượng là code.

**Ràng buộc vũ khí / quyết định:** Đề xuất **thước lệnh gỗ dẹt** thay quạt theo file 07; chưa phê duyệt nên không đổi các khung đang dùng.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-017 — Lữ Đường

**Trạng thái:** Cao. **Trang bị:** Trượng gỗ đồng ngắn có cầu Thủy giống Đinh Liễn.

**Vấn đề thực tế hoặc rủi ro nội dung:** Pháp trượng gần như y hệt Đinh Liễn; ra chiêu/ultimate có nguy cơ cùng một dáng giơ trượng.

**Khung 2 — Đánh thường (phương án):** Một nhịp điểm trượng về ngang bụng, khuỷu tay gập, bước chân hẹp.

**Khung 3 — Ra chiêu nghề (phương án):** **Ngũ hành ấn** (`role_nguHanhAn`): giữ trượng dọc thân phải, tay trái mở ấn trước vai.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Tế Giang Thủy Trận** (`teGiangThuyTran`): trượng chếch ngang như chỉ thế nước, tay trái hướng thấp về điểm trận; đóng băng/biến ô tách VFX.

**Ràng buộc vũ khí / quyết định:** Thiết kế đầu trượng khác Đinh Liễn (vòng nước kép hay nút gỗ phù riêng) chỉ là đề xuất; giữ hình học cũ trước duyệt.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-018 — Nguyễn Siêu

**Trạng thái:** Cao. **Trang bị:** Giáo dựng tay phải và khiên mây tròn bên trái, giống Nguyễn Khoan.

**Vấn đề thực tế hoặc rủi ro nội dung:** Giáo cán dài dễ gãy/trùng với Đinh Điền và Nguyễn Khoan; tuyệt chiêu Hỏa Lũy là phòng thủ tự thân, không phải đâm.

**Khung 2 — Đánh thường (phương án):** Giáo đâm ngắn thấp một lần, cả cán mũi chuôi trong khung.

**Khung 3 — Ra chiêu nghề (phương án):** **Tường khiên** (`role_tuongKhien`): nghiêng khiên che đồng đội, giáo dựng dọc mép phải không che khuất.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Phù Liệt Hỏa Lũy** (`phuLietHoaLuy`): chống khiên trước ngực và giữ giáo dọc bên sườn, tư thế dụ địch công kích; Hỏa thiêu và khiêu khích là VFX.

**Ràng buộc vũ khí / quyết định:** Khóa một thân giáo nối mũi–cán–chuôi và khiên tròn; nên có dấu trang bị riêng so với Nguyễn Khoan.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

### RB-019 — Đỗ Cảnh Thạc

**Trạng thái:** Cao. **Trang bị:** Búa chiến cán rất dài, đầu đồng vuông rất nặng.

**Vấn đề thực tế hoặc rủi ro nội dung:** Ảnh AI dễ biến búa thành rìu/chùy, cán uốn cong, đầu đồng xoay hướng khi giơ cao.

**Khung 2 — Đánh thường (phương án):** Một cú đập búa ngắn có quỹ đạo dọc, đầu vuông rõ bốn cạnh.

**Khung 3 — Ra chiêu nghề (phương án):** **Phá trận** (`role_phaTran`): kéo búa từ trụ sau lên vai rồi quật theo đường chéo, không vượt quá tầm hai tay.

**Khung 4 — Tuyệt chiêu riêng (phương án):** **Đỗ Động Kiên Tâm** (`doDongKienTam`): chặn chân chắc, búa vuông hướng ra trước ở thời điểm sắp giáng, nâng DEF phe bằng hiệu ứng game.

**Ràng buộc vũ khí / quyết định:** Khóa hình hộp vuông đầu búa, cán gỗ một thân, chiều dài cố định, không biến sang lưỡi rìu hoặc búa hai đầu.

**Điều kiện duyệt:** silhouette khung 2 ≠ khung 3 ≠ khung 4 dựa trên trọng tâm + tay sử dụng + hướng vũ khí; vũ khí cứng giữ nguyên hình học, không chèn VFX vào sprite; trang bị nhận diện không tự xuất hiện lần đầu khi ra chiêu.

---

## Các nhóm vũ khí trùng và cách xử lý có kiểm soát

| Cụm | Nhân vật | Cách xử lý |
|---|---|---|
| Giáo và khiên | Đinh Điền, Nguyễn Khoan, Nguyễn Siêu | Khóa mũi, chùm lông, chiều dài cán, góc khiên; khung Skill nâng khiên phải khác Basic đâm giáo; giáo luôn thấy liền một cây |
| Cờ lệnh và thẻ tre | Lê Hoàn, Trần Lãm, Ngô Nhật Khánh | Giữ nguồn lore, nếu đổi hình cờ dùng báo cáo 07 trình duyệt duyệt; khác vị trí cờ, loại tua, nếp gấp và nhịp tay |
| Quạt Mưu sĩ | Lưu Cơ, Ngô Xương Xí, Nguyễn Thủ Tiệp | Lưu Cơ giữ hoa thị đồng; Ngô Xương Xí đề xuất quạt tre; Nguyễn Thủ Tiệp đề xuất thước lệnh; chưa tự áp dụng thay đổi chưa duyệt |
| Trượng pháp sư | Đinh Liễn, Kiều Công Hãn, Lữ Đường | Kiều Công Hãn đã có trượng ngắn cầu Lôi; Đinh Liễn/Lữ Đường đang đều trượng Thủy đầu cầu, cần riêng hình học và kiểu thủ ấn |
| Hồ lô Y sư | Trịnh Tú, Kiều Thuận | Phân biệt hồ lô hai bầu/tua đôi với hồ lô đơn, một giơ bình phục hồi, một nâng bình nghiêng sát ngực |
| Đao tướng | Đinh Bộ Lĩnh, Nguyễn Bặc, Phạm Bạch Hổ | Khác đao bản rộng, kiểu chắn tay, đầu chuôi, khía sống và tầm vung; không đổi đại đao Nguyễn Bặc |

## Quy chuẩn anti-duplicate / anti-break cho khi triển khai prompt

- **Mẫu pose khác nhau:** Basic = hành động đánh thường một nhịp; Skill slot 3 = động tác có mục đích và kết quả riêng; Ultimate slot 4 = thế đặc trưng không lặp cùng tay/hướng vũ khí với 2 khung trước.
- **Vũ khí dài:** mô tả cả đầu và chuôi nhìn thấy, cùng một trục vật thể không đứt; đổi tay/góc nhìn để chống cán bị thân và khiên che mất; tuyệt đối không tách thành hai đoạn gỗ.
- **Trang bị đa vật:** quạt/thẻ tre, cờ/thẻ tre, giáo/khiên phải ổn định số lượng và vị trí ở cả 6 khung. Không hoán vật giữa tay trái và phải tùy tiện.
- **Action không đồng nghĩa VFX:** chiêu giảm năng lượng, đóng băng, hồi HP, xua tan, phá ô thể hiện bởi game, không phải biến trượng hoặc quạt thành đối tượng phép màu.
- **Weapon change governance:** báo cáo 07 là đề xuất chờ duyệt, không tự sửa vũ khí gốc; Nguyễn Bặc giữ nguyên. Đề nghị chỉnh 51 dòng pose trước rồi mới đánh giá có cần thay hình học vũ khí.
- **QA ảnh:** ảnh chưa được quan sát đầy đủ; kết luận chỉ dựa trên prompt và source, ngoài 2 lỗi người dùng đã báo.

## Kế hoạch sửa tài liệu nếu được duyệt

1. Ưu tiên 1: Đinh Điền, Nguyễn Siêu, Đỗ Cảnh Thạc, Đinh Liễn, Lữ Đường, Lê Hoàn, Trần Lãm, Ngô Nhật Khánh, Lưu Cơ, Ngô Xương Xí, Nguyễn Thủ Tiệp, Đinh Bộ Lĩnh.
2. Ưu tiên 2: Nguyễn Bặc (pose only; keep weapon), Trịnh Tú, Phạm Bạch Hổ, Kiều Thuận, Lý Khuê.
3. Ưu tiên 3: giữ sửa Nguyễn Khoan, Kiều Công Hãn và bổ sung nghiệm thu ảnh sau này.
4. Khi triển khai phải thay một cách đồng bộ cả 6 khung nếu Weapon DNA thật sự đổi; còn nếu chỉ sửa pose thì chỉnh khung 2/3/4 là đủ và ghi nhật ký thiết kế.
