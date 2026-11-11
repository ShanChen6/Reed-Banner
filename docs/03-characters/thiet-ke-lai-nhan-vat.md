# Thiết kế lại nhân vật theo phong cách cổ trang bán hiện thực

> Cập nhật: 10/11/2026
> Trạng thái: **APPROVED** — Shan duyệt toàn bộ (08/11/2026). **Phần chữ đã có trong mã:** đổi tên (3 tướng thường, 14 Xạ thủ và Sát thủ), ngoại hiệu, phe, tiểu sử, quan hệ (`src/core/roster/lore.ts`, hiện ở tab Chi tiết). **Phần tranh** (làm lại nhân vật, vũ khí và tư thế theo phong cách mới, mục 6) **chưa làm**.

Phong cách mục tiêu: **semi-realistic historical illustration, digital painting** (minh họa cổ trang bán hiện thực, tranh vẽ kỹ thuật số). Đã có chuẩn cho chân dung ở [prompt chân dung](../06-art/prompts/chan-dung-lich-su.md); chân dung Hà Vân mới (có họa tiết) là mẫu tham chiếu.

## 1. Năm yêu cầu của Shan và cách đáp ứng

| # | Yêu cầu | Cách đáp ứng |
|---|---|---|
| 1 | Hạn chế đổi hệ thống chiêu thức, kỹ năng | **Chỉ đổi tranh và chữ.** Không đụng `skills`, `chasePassives`, chỉ số, `strikeFx`, `fxColor`. Vũ khí trong hình chỉ là vẻ ngoài (xem 3) |
| 2 | Câu chuyện cho nhân vật thường (hư cấu) | Mỗi người một hồ sơ ngắn theo mẫu mục 4, gắn nhãn **hư cấu**; 5 hồ sơ mẫu ở mục 5 |
| 3 | Mỗi nhân vật có nét riêng | **Quy tắc ba dấu ấn** (mục 2): khuôn mặt, họa tiết trang phục kèm màu nhấn, vật dụng/vũ khí. Hai người cùng nghề phải khác ít nhất hai dấu ấn |
| 4 | Vũ khí đa dạng **trong cùng một nghề** (pháp sư cầm trượng, sách hoặc kiếm; y sư dùng hồ lô hoặc kim châm, có người gắn với thảo dược…), vẫn giữ kiểu cổ điển; **không phải vật dụng đặc trưng nào cũng thành vũ khí** | Tách **vũ khí** (thứ ra đòn) khỏi **vật dụng đặc trưng** (đồ đeo hoặc cầm thụ động để nhận diện) và khỏi **nhịp chuyển động** (mục 3); mỗi nghề có 7 tướng thường nên có bảng 7 vũ khí khác nhau, gồm cả hình cổ điển (mục 3.3) |
| 5 | Hình ảnh và tư thế làm lại theo phong cách mới | Mỗi nhân vật một bộ tranh (mục 6); làm thử trọn bộ Hà Vân trước |
| 6 | Nhân vật có thể là **nghĩa quân** hoặc **lính của các sứ quân** | Mỗi nhân vật có một **phe** (nghĩa quân Hoa Lư hoặc một trong 12 sứ quân); phe cho dấu hiệu trên trang phục lấy từ **ký hiệu cờ đã có trên bản đồ** (mục 2.1, 4.1) |
| 8 | **Tên và ngoại hiệu** hợp hình tượng | Mục 2.2: đổi ba tên để cùng họ với người thân; ngoại hiệu rút từ câu nói của từng người; 14 xạ thủ, sát thủ đặt họ tên mới, tên cũ thành ngoại hiệu |
| 7 | Nhân vật có thể có **quan hệ** với nhau (anh chị em, cha con…) mà **không gò bó khi mở rộng sau này** | Quan hệ nằm trong **bảng riêng**, chia ba mức và để sẵn chỗ trống (mục 4.2) |

## 2. Quy tắc ba dấu ấn (mỗi nhân vật phải khác nhau)

Mỗi nhân vật có **ba dấu ấn riêng**, ghi trong hồ sơ và trong prompt:

1. **Khuôn mặt:** tuổi, râu, sẹo, kiểu tóc hoặc khăn, thần thái.
2. **Họa tiết và màu nhấn:** một mô-típ trang phục (Đông Sơn: sóng, răng cưa, vòng tròn đồng tâm; cánh sen kiểu cột đá Hoa Lư; lau sậy; vân sông…) kèm **một màu nhấn** theo hệ.
3. **Vật dụng đặc trưng:** một món gắn với xuất thân, **không nhất thiết là vũ khí** (ví dụ cân đồng của Tô Kim, sáo trúc của Phùng Phong). Vũ khí chọn riêng, xem mục 3.

**Kiểm tra trước khi làm:** (a) nhìn bóng đen trắng ở 48px vẫn phân biệt được với người cùng nghề; (b) trong cùng nghề, bảng "ba dấu ấn" không có hai người trùng quá một ô; (c) họa tiết lấy từ trang phục gốc (xem `body.webp`) để không mất nét cũ.

### 2.1 Phe: nghĩa quân hoặc lính của sứ quân

Mỗi tướng thường có thêm một **phe** quyết định xuất thân quân ngũ và dấu hiệu trên trang phục. Có **13 phe**:

| Phe | Dấu hiệu (ký hiệu cờ trên bản đồ, đã có ảnh) |
|---|---|
| **Nghĩa quân Hoa Lư** (cờ lau) | mặt trời trống đồng, thêm bông lau |
| Bố Hải (Trần Lãm) | sóng cửa biển |
| Đằng Châu (Phạm Bạch Hổ) | ba vạch vuốt |
| Bình Kiều (Ngô Xương Xí) | cầu vòm |
| Đường Lâm (Ngô Nhật Khánh) | cổng làng |
| Tam Đái (Nguyễn Khoan) | ba dải |
| Phong Châu (Kiều Công Hãn) | đỉnh núi và sét |
| Hồi Hồ (Kiều Thuận) | cánh sen |
| Siêu Loại (Lý Khuê) | giáp vảy |
| Tiên Du (Nguyễn Thủ Tiệp) | sao bốn cánh |
| Tế Giang (Lữ Đường) | dòng sông |
| Tây Phù Liệt (Nguyễn Siêu) | lũy răng cưa |
| Đỗ Động (Đỗ Cảnh Thạc) | mũi giáo |

**Loại xuất thân:** *nghĩa quân* (dân làng tự nguyện theo cờ lau), *dân binh* (người giữ làng, giữ đê), *lính sứ quân* (quân thường trực của một vùng), *hàng binh* (lính sứ quân rời hoặc theo về khi chủ tướng quy phục hay tan rã). Một nhân vật hư cấu có thể từng đứng ở phe đối diện với Đinh Bộ Lĩnh rồi theo về, nên hợp với cốt truyện "thống nhất bằng liên minh, quy phục chứ không chỉ đánh dẹp" ([Narrative Bible](../02-game-modes/campaign/narrative-bible.md)).

**Phe thể hiện trên tranh bằng ba cách** (chọn hai trong ba để khỏi rối):
1. Một **miếng vải hoặc băng tay** có ký hiệu của phe (dùng đúng ảnh `public/art/flags/co-<id>.webp`, thu nhỏ).
2. **Màu nhấn chung** của phe trên một phần trang phục, ví dụ lam sóng cho Bố Hải.
3. **Kiểu giáp, khăn hoặc nón** theo vùng (đồng bằng, đầm lầy, đèo núi).

**Quy tắc sử liệu:** sử **không chép cờ hay quân phục của các sứ quân**; ký hiệu là do game đặt ([`factionMarks.ts`](../../src/app/game/campaign/factionMarks.ts)). Nhân vật lính của sứ quân là **hư cấu** và không được gán hành động hay lời thoại cho sứ quân có thật ngoài những gì sử ghi.

**Phe chỉ là chữ và tranh.** Không gắn với mở khóa, giá bán hay chỉ số (giữ yêu cầu 1). Nếu sau này muốn gắn, ví dụ mở khóa nhân vật sau khi hoàn thành nhiệm vụ của sứ quân, đó là thay đổi gameplay riêng.

### 2.2 Tên, họ và ngoại hiệu

Quy tắc (Shan chốt 08/11/2026, ngoại hiệu bản 2 chờ duyệt):

1. **Tên** là họ tên kiểu Việt thế kỷ X (họ + tên Hán Việt, như Trần Cương, Hà Vân). Giữ tên hiện có khi đã hợp.
2. **Ruột thịt cùng họ** (con theo họ cha, anh em cùng họ). Ba tên đổi để khớp quan hệ: Châu Ngọc thành **Trần Ngọc** (em của Trần Cương), Bế Liên thành **Mã Liên** (con của Mã Nhạc), Đào Lam thành **Vi Lam** (em của Vi Triều). Thầy trò, vợ chồng, cậu cháu, chị em họ, bạn cũ **không** cần cùng họ.
3. **Ngoại hiệu rút từ chính câu nói đặc trưng của nhân vật** (hồ sơ ở [ho-so-37-tuong-thuong.md](ho-so-37-tuong-thuong.md)), hai đến ba chữ Hán Việt gợi **tính cách hoặc điều nhân vật theo đuổi**, không chỉ là tên món đồ. Ví dụ Trần Cương "Cổng ta giữ chưa từng hở một lần" thành **Bất Hạ Môn**; Hà Vân "lửa trận thì tôi xin nhận phần nặng" thành **Đảm Hỏa**. Không trùng nhau, không trùng tên người thật trong sử. (Bản 1 gồm Hỏa Lô Nữ, Thiết Môn, Thổ Thuẫn… bị Shan nhận xét "chưa hay" vì chỉ gọi tên món đồ; đã bỏ.)
4. **Xạ thủ và Sát thủ:** tên hiện nay đã là tên hiệu kiểu giang hồ, nên **chuyển thành ngoại hiệu** và nhân vật được **đặt họ tên mới** (bảng dưới).
5. **Hiển thị:** họ tên giữ trên ô và thẻ; **ngoại hiệu hiện ở tab Chi tiết** cùng tiểu sử ngắn (ví dụ "Hà Vân · Đảm Hỏa"), không chen vào ô nhỏ.
6. **Không đổi `id`** (`haVan`, `chauNgoc`, `bachNoLang`…): `id` là khóa trong mã, hồ sơ, tên thư mục tranh. Chỉ đổi chữ hiển thị.
7. **Tên có thật trong sử** (Đinh Bộ Lĩnh, sứ quân, tướng lịch sử) **không đổi** và không có ngoại hiệu tự đặt.

**Ảnh hưởng khi áp dụng:** 3 tên của tướng thường và 14 tên của xạ thủ, sát thủ đổi chuỗi `name` ở `roster.ts` (mỗi tên một dòng), cùng vài chuỗi trong test và chú thích mã (`rigs.ts`, `skills.tsx`, `rigs.test.ts`); tên cũ xuất hiện ở nhiều tệp tài liệu. Ngoại hiệu cần một trường tùy chọn `epithet` cho nhân vật; chưa làm.

**Tướng sĩ**

| Hệ | Tên | Ngoại hiệu (nghĩa) | Ghi chú |
|---|---|---|---|
| Kim | Trần Cương | Bất Hạ Môn (cổng không bao giờ hạ) | giữ tên |
| Mộc | Lâm Tùng | Cô Tùng (cây tùng lẻ bên đầm) | giữ tên |
| Thủy | Hồ Lãng | Nghịch Lưu (ngược dòng) | giữ tên |
| Hỏa | Lý Liệt | Cuồng Hỏa (lửa dữ) | giữ tên |
| Thổ | Kha Sơn | Bất Thoái (núi không lùi) | giữ tên |
| Lôi | Tống Tấn | Nộ Lôi (sấm giận) | giữ tên |
| Phong | Hứa Lăng | Khinh Phong (gió nhẹ, không chờ ai) | giữ tên |

**Pháp sư**

| Hệ | Tên | Ngoại hiệu (nghĩa) | Ghi chú |
|---|---|---|---|
| Kim | Chu Ngân | Định Tâm (tâm vững, tay không run) | giữ tên |
| Mộc | Đàm Thảo | Thảo Tâm (lòng thật như cây rừng) | giữ tên |
| Thủy | Vi Lam | Mặc Lam (mực xanh của người ghi chép) | đổi từ Đào Lam |
| Hỏa | ★ Hà Vân | Đảm Hỏa (gánh lửa, nhận phần nặng) | giữ tên |
| Thổ | Doãn Nham | Địa Ức (đất nhớ mọi bước chân) | giữ tên |
| Lôi | Vũ Lôi | Thiên Cảnh (trời nhắc nhở) | giữ tên |
| Phong | Liễu Yên | Hồi Phong (gió mang về) | giữ tên |

**Binh lính**

| Hệ | Tên | Ngoại hiệu (nghĩa) | Ghi chú |
|---|---|---|---|
| Kim | Cao Kiên | Trực Mâu (mâu thẳng, lòng gọn) | giữ tên |
| Mộc | Hoàng Mộc | Hồ Tử (chàng trai của đầm) | giữ tên |
| Thủy | Thái Hà | Nhẫn Hải (kiên nhẫn như biển) | giữ tên |
| Hỏa | Trương Viêm | Dạ Tiếu (cười trong đêm gác) | giữ tên |
| Thổ | ★ Lê Thạch | Thủ Thổ (giữ đất) | giữ tên |
| Lôi | Ông Chấn | Nhịp Quân (người giữ nhịp cho quân) | giữ tên |
| Phong | Mạnh Tường | Truy Phong (đuổi theo gió) | giữ tên |

**Y sư**

| Hệ | Tên | Ngoại hiệu (nghĩa) | Ghi chú |
|---|---|---|---|
| Kim | Trần Ngọc | Nhất Châm (một mũi kim đúng chỗ) | đổi từ Châu Ngọc |
| Mộc | Lục Diệp | Hồi Xuân (chữa lành) | giữ tên |
| Thủy | ★ Mai Thanh | Thanh Hồ (hồ trong, thuốc trong hồ lô) | giữ tên |
| Hỏa | Hồng Đan | Văn Hỏa (lửa nhỏ nấu thuốc) | giữ tên |
| Thổ | Mã Liên | Vô Kỳ (không cờ, chữa mọi phe) | đổi từ Bế Liên |
| Lôi | Tiêu Minh | Thiên Lý Y (thầy thuốc đi ngàn dặm) | giữ tên |
| Phong | Bạch Sương | Sương Phủ (sương phủ lên vết thương) | giữ tên |

**Mưu sĩ**

| Hệ | Tên | Ngoại hiệu (nghĩa) | Ghi chú |
|---|---|---|---|
| Kim | ★ Tô Kim | Toán Lương (tính từng hạt lương) | giữ tên |
| Mộc | Nhan Trúc | Vô Ngôn (kế hay không nói ra) | giữ tên |
| Thủy | Quách Ẩn | Nhàn Điếu (cần câu nhàn) | giữ tên |
| Hỏa | Ninh Hỏa | Tiếu Diện (mặt cười giấu cái cau mày) | giữ tên |
| Thổ | Mã Nhạc | Hồi Thủ (ngoái đầu vì thương con) | giữ tên |
| Lôi | Từ Kinh | Trắc Lộ (đo từng con đường) | giữ tên |
| Phong | Bùi Phiêu | Thanh Sổ (sổ sách rõ ràng) | giữ tên |

**Quân sư**

| Hệ | Tên | Ngoại hiệu (nghĩa) | Ghi chú |
|---|---|---|---|
| Kim | Nghiêm Thiết | Thiết Kỷ (kỷ luật sắt) | giữ tên |
| Mộc | Sầm Tuệ | Tĩnh Thủy (nước lặng, đọc được trước) | giữ tên |
| Thủy | Vi Triều | Chính Cổ (trống đúng nhịp) | giữ tên |
| Hỏa | Tôn Diệm | Hỏa Lệnh (lệnh ban thì lửa cũng nghe) | giữ tên |
| Thổ | Tạ Thạch | Địa Thế (địa thế không biết dối) | giữ tên |
| Lôi | Mạc Vân | Viễn Âm (tiếng đi xa hơn lời nói) | giữ tên |
| Phong | ★ Phùng Phong | Báo Phong (báo gió trước trận) | giữ tên |

**Xạ thủ và Sát thủ (14):** Shan chốt (08/11/2026): tên hiện nay là **ngoại hiệu**, nhân vật được **đặt họ tên mới**; **vũ khí giữ nguyên**.

| Hệ | Nghề | Họ tên mới (hiển thị) | Ngoại hiệu (tên hiện nay) | Ghi chú |
|---|---|---|---|---|
| Kim | Xạ thủ | Đoàn Cự | Bạch Nỏ Lang | nam, cao tuổi |
| Mộc | Xạ thủ | Quản Hiên | Thanh Lâm Xạ | nữ, thợ săn núi |
| Thủy | Xạ thủ | Thái Diệp | Lam Giang Phi Diệp | nam; con trai của Thái Hà (R2) |
| Hỏa | Xạ thủ | Lý Diệm | Xích Diệm Luân | nữ; em của Lý Liệt (R4) |
| Thổ | Xạ thủ | Kha Thạch | Trấn Sơn Thạch | nam; em của Kha Sơn (R3) |
| Lôi | Xạ thủ | Lương Triệt | Lôi Minh Xạ | giới tính chưa ghi trong thiết kế gốc, đề xuất nam; học trò của Tống Tấn (R13) |
| Phong | Xạ thủ | Giáp Yến | Tật Phong Lăng | nữ, kỵ trạm |
| Kim | Sát thủ | Phan Quyên | Bạch Phong Đao | nữ, cận vệ |
| Mộc | Sát thủ | Nông Sâm | Độc Ảnh | giới tính chưa ghi, đề xuất nam |
| Thủy | Sát thủ | Âu Thu | Hàn Giang Khách | nữ; học trò của Quách Ẩn (R10) |
| Hỏa | Sát thủ | Tiết Dạ | Xích Dạ | giới tính chưa ghi, đề xuất nam; đồng đội cũ của Trương Viêm (R15) |
| Thổ | Sát thủ | Cát Tàng | Địa Ẩn | giới tính chưa ghi, đề xuất nam; học trò của Doãn Nham (R9) |
| Lôi | Sát thủ | Mẫn Tuyên | Lôi Ảnh | nữ, truyền tin |
| Phong | Sát thủ | Liễu Thiều | Vô Ảnh | nữ; chị em với Liễu Yên (R8) |

## 3. Vũ khí, vật dụng đặc trưng và nhịp: ba thứ khác nhau

| | Là gì | Ví dụ | Ảnh hưởng đến mã và tranh |
|---|---|---|---|
| **Vũ khí** | Thứ nhân vật **dùng để ra đòn** trong hình động trận; phải trông có thể gây sát thương và hợp nghề | trượng, sách, kiếm phép (pháp sư); hồ lô, kim châm (y sư); quạt sắt, bút sắt (mưu sĩ) | Là một lớp cắt riêng (`sword.webp`), quay quanh cổ tay; có điểm cầm và điểm bắn hiệu ứng. **Đổi vũ khí là làm lại ảnh đứng, lớp và tranh ra chiêu** |
| **Vật dụng đặc trưng** | Đồ **đeo hoặc cầm thụ động** để nhận ra nhân vật và kể xuất thân; **không dùng để đánh** | cân đồng và túi tiền (Tô Kim), sáo trúc cài hông (Phùng Phong), lư hương treo hông (Hà Vân), giỏ lá thuốc (Lục Diệp) | Vẽ **ngay trên thân**, không tách lớp, không đổi nhịp. **Rẻ**: chỉ vẽ lại ảnh thân |
| **Nhịp** | Cách vũ khí chuyển động có sẵn trong mã | Chém, Đâm, Trượng, Quạt, Hồ lô | Mỗi vũ khí mới phải xếp vào một nhịp có sẵn để khỏi viết thêm mã chuyển động |

**Quy tắc chọn:** món nhân vật mang theo **mặc định là vật dụng**; chỉ lên làm vũ khí khi nó (1) vung hoặc chỉa được như một vũ khí và (2) hợp nghề (người đọc nhìn là hiểu nghề). Cân đồng, chày giã thuốc, sáo, ống thẻ, cần câu, tráp sổ… là vật dụng, không là vũ khí.

**Hiện trạng trong mã** (`src/app/game/stage/rigs.ts`, `warrior.ts`): 77 nhân vật, mỗi người một bộ hình động riêng; vũ khí hiển thị chỉ để vẽ và chuyển động, không ảnh hưởng chiêu thức. Có **bốn nhịp** riêng (giáo, trượng, hồ lô, quạt) cộng nhịp chém kiếm. **Cả bảy tướng thường cùng nghề đang cầm cùng một hình** (bảy y sư đều hồ lô, bảy mưu sĩ đều quạt, bảy pháp sư đều trượng), nên nhìn giống nhau. Món vũ khí **trang bị** (đồ trong kho) là hệ thống khác, gắn theo **nghề**, không gắn theo hình trong tranh.

### 3.1 Bộ vũ khí hợp lý cho từng nghề (chọn trong đây)

| Nghề | Vũ khí hợp nghề |
|---|---|
| Pháp sư | **trượng**, **sách (pháp thư)**, **kiếm phép**, chùy phép, phất trần |
| Y sư | **hồ lô thuốc**, **kim châm**, gậy thuốc, dao thuốc (**thảo dược** là họa tiết và vật dụng, không phải vũ khí) |
| Mưu sĩ | **quạt** (quạt sắt, quạt lông), bút sắt, thước sắt, đoản kiếm, roi mềm |
| Quân sư | **cờ lệnh**, gậy chỉ huy, kích ngắn, đoản đao lệnh |
| Binh lính | giáo, khiên và dao quắm, chĩa, rìu, chùy |
| Tướng sĩ | đao, côn, đinh ba, song đoản đao, kích, kiếm |

### 3.1b Danh sách vũ khí tham khảo của Shan (08/11/2026) và cách dùng

Shan cung cấp: Kiếm, Đao, Giản, Tiên, Thương, Đại đao, Kích, Mâu, Cung, Nỏ, Rìu, Phi đao, Phi tiêu, Kim châm, Lưu tinh chùy, Nga Mi Thích, Câu (Hộ thủ câu), Phong Hỏa Luân, Thiết Phiến (quạt sắt), Tỳ Bà Kiếm, Địch Kiếm, Trảo thủ (Thiết trảo), Cửu Tiết Roi, Côn nhị khúc, Côn tam khúc, Dải lụa (thần lụa), Tụ Tiễn (tên bắn trong tay áo).

Chia ba nhóm theo **mức hợp thế kỷ X** để biết cách vẽ (nhóm B và C dễ trượt sang fantasy nên **vẽ vật liệu thật, không phát sáng**):

| Nhóm | Vũ khí | Nhịp gợi ý | Đã dùng ở |
|---|---|---|---|
| **A. Hợp thời** | kiếm, đao, đại đao, thương và mâu (giáo), kích, cung, nỏ, rìu, giản (gậy sắt có đốt), tiên (roi sắt), phi đao, phi tiêu, kim châm | Chém, Đâm, Trượng | Trần Cương (đại đao), Cao Kiên (mâu), Tống Tấn (kích), Kha Sơn (rìu), Bạch Nỏ Lang (nỏ), Thanh Lâm Xạ (cung), Lam Giang Phi Diệp (phi tiêu), Trần Ngọc và Độc Ảnh (kim châm) |
| **B. Võ hiệp nhẹ (vẽ được thực)** | thiết phiến (quạt sắt), hộ thủ câu, Nga Mi Thích, lưu tinh chùy, thiết trảo, cửu tiết roi (cửu tiết tiên), côn nhị khúc, côn tam khúc | Chém, Quạt, Trượng | Tô Kim (thiết phiến), Địa Ẩn (trảo), **mới:** Lý Liệt (hộ thủ câu), Ông Chấn (lưu tinh chùy), Từ Kinh (cửu tiết tiên), Lâm Tùng (côn tam khúc) |
| **C. Võ hiệp, giả tưởng nhiều** | Phong Hỏa Luân, dải lụa thần, tỳ bà kiếm, địch kiếm, tụ tiễn | Hồ lô, Chém | Xích Diệm Luân (phi luân), Tật Phong Lăng (dải lụa), Vô Ảnh (sáo, gần với địch kiếm) |

**Chưa dùng, để dành cho nhân vật mở rộng sau** (khớp mục 4.2): giản, Nga Mi Thích, tỳ bà kiếm, địch kiếm, tụ tiễn, côn nhị khúc; thêm tiên (roi sắt) ngoài cửu tiết tiên.

**Gợi ý nhỏ cho Vô Ảnh:** nếu muốn sáo của Vô Ảnh vừa giữ nguyên hình vừa là vũ khí thật (không phải vật dụng bị biến thành vũ khí), có thể đổi sang **địch kiếm**: ống sáo trúc giấu một lưỡi kiếm mảnh. Hình ngoài gần như không đổi; cần cập nhật mô tả khóa và tên chiêu "âm công" cho khớp, nên chỉ làm khi Shan muốn.

### 3.2 Bảng phân bổ cho 42 tướng thường (đề xuất)

Mỗi nghề 7 người, mỗi hệ một người. **Vũ khí** chọn trong 3.1 (chữ đậm là hình cổ điển); **vật dụng đặc trưng** chỉ để nhận diện, không đánh. Cột "Nhịp" là nhịp có sẵn.

**Pháp sư**

| Hệ | Nhân vật | Vũ khí (nhịp) | Vật dụng đặc trưng (không đánh) |
|---|---|---|---|
| Kim | Chu Ngân | kiếm phép bạc khắc bùa (Chém) | ống bùa bạc, chuỗi hạt |
| Mộc | Đàm Thảo | **trượng cành gỗ** (Trượng) | túi hạt giống, vòng lá khô |
| Thủy | Vi Lam | **pháp thư**, sách thẻ tre (Quạt) | bình nước nhỏ, dải lụa xanh |
| Hỏa | ★ Hà Vân | **trượng đồng đầu ngọc đỏ** (Trượng, giữ như hiện tại) | lư hương đồng treo xích ở hông |
| Thổ | Doãn Nham | chùy phép bằng đá (Chém) | chuông đồng nhỏ ở cổ tay |
| Lôi | Vũ Lôi | kiếm gỗ đào khắc sét (Chém) | tấm bùa gỗ đeo cổ |
| Phong | Liễu Yên | phất trần (Quạt) | chuông gió nhỏ cài lưng |

**Y sư**

| Hệ | Nhân vật | Vũ khí (nhịp) | Vật dụng đặc trưng |
|---|---|---|---|
| Kim | Trần Ngọc | **kim châm bạc** (Quạt) | cuộn kim đeo hông, họa tiết lá bạc |
| Mộc | Lục Diệp | gậy cành ngải (Trượng) | giỏ lá thuốc sau lưng, **họa tiết thảo dược khắp áo** |
| Thủy | ★ Mai Thanh | **hồ lô thuốc khắc vân sông** (Hồ lô) | cối đồng nhỏ ở hông |
| Hỏa | Hồng Đan | dao thuốc cong (Chém) | siêu sắc thuốc nhỏ đeo hông |
| Thổ | Mã Liên | **hồ lô đất nung** (Hồ lô) | chày và cối đồng đeo lưng |
| Lôi | Tiêu Minh | gậy sắt chạm sét (Trượng) | túi thuốc rong |
| Phong | Bạch Sương | dao thuốc mảnh (Chém) | túi hương, bó nhang xông |

**Mưu sĩ**

| Hệ | Nhân vật | Vũ khí (nhịp) | Vật dụng đặc trưng |
|---|---|---|---|
| Kim | ★ Tô Kim | quạt xếp nan sắt (Quạt) | **cân đồng**, túi tiền vải |
| Mộc | Nhan Trúc | bút sắt (Quạt) | bó thẻ tre sau lưng |
| Thủy | Quách Ẩn | kiếm (Chém; theo ảnh Shan gửi, đổi từ thước sắt) | cần câu trúc, nón rộng vành |
| Hỏa | Ninh Hỏa | **quạt lông** (Quạt) | túi mồi lửa |
| Thổ | Mã Nhạc | đoản kiếm (Chém) | ống thẻ gieo quẻ |
| Lôi | Từ Kinh | **cửu tiết tiên**, roi sắt chín khúc (Chém) | cuộn bản đồ |
| Phong | Bùi Phiêu | quạt giấy xếp (Quạt) | tráp sổ sách |

**Quân sư**

| Hệ | Nhân vật | Vũ khí (nhịp) | Vật dụng đặc trưng |
|---|---|---|---|
| Kim | Nghiêm Thiết | đoản đao lệnh (Chém) | lệnh bài đồng |
| Mộc | Sầm Tuệ | **cờ lệnh** xanh (Trượng) | cuộn thẻ lệnh |
| Thủy | Vi Triều | bàn cờ vây và quân cờ (Quạt; đổi từ giáo ngắn cắm cờ, Shan 11/11) | trống lệnh nhỏ đeo hông |
| Hỏa | Tôn Diệm | **cờ lệnh** (Trượng, giữ như hiện tại) | bó thẻ tre |
| Thổ | Tạ Thạch | gậy chỉ huy gỗ lim (Trượng) | bản đồ da |
| Lôi | Mạc Vân | kiếm cong (Chém) | tù và đeo vai |
| Phong | ★ Phùng Phong | **gậy trúc chỉ huy** (Trượng) | **sáo trúc** cài hông (thổi báo hiệu, không đánh) |

**Binh lính**

| Hệ | Nhân vật | Vũ khí (nhịp) | Vật dụng đặc trưng |
|---|---|---|---|
| Kim | Cao Kiên | **giáo dài** (Đâm) | dây lương đeo chéo |
| Mộc | Hoàng Mộc | **giản sắt** (Chém) | giỏ cơm lam |
| Thủy | Thái Hà | **chùy gai sắt** (Chém) | lưới vắt vai |
| Hỏa | Trương Viêm | **kích hai lưỡi trăng** (Đâm) | đuốc cài lưng |
| Thổ | ★ Lê Thạch | **giáo** (mũi đồng hình lá) và khiên mây (Đâm) | túi vải đựng nắm đất |
| Lôi | Ông Chấn | **tiên** (roi sắt, Chém) | dùi trống cài thắt lưng; trống trận chỉ ghép ở tranh phong thái |
| Phong | Mạnh Tường | giáo ngắn và lao phóng (Đâm) | cờ hiệu nhỏ |

**Tướng sĩ**

| Hệ | Nhân vật | Vũ khí (nhịp) | Vật dụng đặc trưng |
|---|---|---|---|
| Kim | Trần Cương | **đại đao** (Chém) | dây lệnh bài |
| Mộc | Lâm Tùng | **côn tam khúc gỗ lim** (Trượng) | cành tùng cài giáp |
| Thủy | Hồ Lãng | đinh ba (Đâm) | lưới cuộn ở hông |
| Hỏa | Lý Liệt | **đôi hộ thủ câu**, kiếm móc (Chém) | khăn đỏ buộc đầu |
| Thổ | Kha Sơn | **rìu-giáo hai tay** (rìu bán nguyệt có mũi giáo trên đầu, Chém) | đai giáp đá |
| Lôi | Tống Tấn | trường kiếm (Chém; giữ theo tranh hiện tại, kích giao Trương Viêm) | chuông ngựa |
| Phong | Hứa Lăng | kiếm mảnh (Chém) | dải lụa buộc tóc |

Kiểm tra: không nghề nào có hai người trùng cả vũ khí lẫn vật dụng, và sau khi đổi **Lý Liệt sang hộ thủ câu, Xích Dạ (song đao) là người duy nhất dùng song đao**; hình cổ điển vẫn có ở mỗi nghề. Đây là **đề xuất ban đầu**, Shan đổi chỗ nào cũng được, miễn vũ khí vẫn nằm trong nhịp có sẵn.

### 3.3 Xạ thủ và Sát thủ (14 nhân vật)

Hai nghề này khác bảng 3.2 ở một điểm quan trọng: **cả 14 người đã có vũ khí riêng, khác nhau hoàn toàn và đã khóa** (mỗi người một mã vũ khí trong [prompt V4.3](../06-art/prompts/v4-2/09-14-heroes-character-and-frame-prompts-v4-3.md)), cùng một tiểu sử hư cấu ngắn. Vì **tên chiêu gắn với vũ khí** (Khoan Giáp Tiễn, Thiết Nỏ Phá Thành, Bạo Vũ Lê Hoa Châm…), đổi vũ khí là đổi tên kỹ năng, trái yêu cầu 1. **Shan chốt (08/11/2026): giữ nguyên cả 14 vũ khí**, chỉ vẽ lại theo phong cách mới, thêm họa tiết và mở rộng hồ sơ theo mẫu mục 4.

**Xạ thủ**

| Hệ | Nhân vật | Vũ khí (đã khóa) | Nhịp trong mã | Vật dụng đặc trưng (không đánh) |
|---|---|---|---|---|
| Kim | Bạch Nỏ Lang | nỏ nặng gỗ cứng viền đồng | Đâm (giáo) | hộp tên nỏ bằng đồng ở hông trái |
| Mộc | Thanh Lâm Xạ | cung tre dài | Trượng | giỏ tên đan tre, bím tóc |
| Thủy | Lam Giang Phi Diệp | phi tiêu lá liễu | Chém | hộp phi tiêu viền vỏ sò ở hông trái |
| Hỏa | Xích Diệm Luân | phi luân vành kín | Chém | cần bổ sung (đề xuất: chùm chìa kho đồng, hợp xuất thân giữ kho lương) |
| Thổ | Trấn Sơn Thạch | phi hoàng thạch, ném bằng tay | Chém | túi đan mây bọc da đựng đá |
| Lôi | Lôi Minh Xạ | phi châm bản lớn | Chém | chiếc chuông cũ (dấu nhận diện) |
| Phong | Tật Phong Lăng | dải lụa chiến (xem lưu ý) | Hồ lô | lụa hiệu của kỵ trạm |

**Sát thủ**

| Hệ | Nhân vật | Vũ khí (đã khóa) | Nhịp trong mã | Vật dụng đặc trưng (không đánh) |
|---|---|---|---|---|
| Kim | Bạch Phong Đao | dao găm sắt | Chém | nửa ấn đồng kỷ vật, vỏ dao trống ở hông phải |
| Mộc | Độc Ảnh | kim châm độc | Chém | lọ thảo mộc, hộp kim nhỏ |
| Thủy | Hàn Giang Khách | lưỡi dao ẩn dưới cẳng tay phải | Chém | cần bổ sung (đề xuất: áo tơi sông, nón rộng vành) |
| Hỏa | Xích Dạ | song đao | Chém | mảnh vải cháy xém |
| Thổ | Địa Ẩn | găng ba vuốt hai tay | Chém | cần bổ sung (đề xuất: dây móc bám đá) |
| Lôi | Lôi Ảnh | hộp ám khí Bạo Vũ Lê Hoa Châm | Chém | phù hiệu đồng nứt trước ngực |
| Phong | Vô Ảnh | sáo trúc âm công (xem lưu ý) | Chém | vòng sợi lau ở đai |

**Lưu ý:**

- **Hai trường hợp gần với "biến vật dụng thành vũ khí" (đã chốt giữ):** Tật Phong Lăng (lụa hiệu của kỵ trạm thành lụa chiến) và Vô Ảnh (sáo của nhạc công thành sáo âm công). Cả hai ghi rõ là hư cấu low fantasy trong thiết kế gốc. Đề xuất: **giữ**, vì kỹ năng đã gắn với vũ khí; nếu Shan muốn tuân quy tắc mục 3 cho cả hai thì phải đổi vũ khí (ví dụ Tật Phong Lăng dùng cung ngắn, lụa thành vật dụng; Vô Ảnh dùng dao mảnh, sáo thành vật dụng) và **đặt lại tên chiêu** của hai người đó.
- **Vũ khí kiểu "võ hiệp" cần vẽ thực hơn:** phi luân (Xích Diệm Luân), hộp ám khí (Lôi Ảnh), găng vuốt (Địa Ẩn), sáo âm công (Vô Ảnh) dễ trượt sang fantasy. Khi vẽ theo phong cách mới: **vật liệu thật (đồng, sắt, tre)**, không phát sáng, không hiệu ứng, kích thước và hình giữ đúng mô tả khóa.
- **Tương tự bảng 3.2:** vật dụng đặc trưng vẽ trên thân (rẻ); vũ khí đã khóa nên chỉ vẽ lại, không đổi hình. Hồ sơ của 14 người đã có tiểu sử một câu; cần mở rộng theo mẫu mục 4 (xuất thân, tính cách, ba dấu ấn, câu nói).

### 3.4 Hai điểm cần lưu ý chung

- **Đồ trang bị vs hình trong tranh:** kho đồ ghi theo nghề (ví dụ "vũ khí Pháp sư"), không theo hình trong tranh. Đề xuất **giữ nguyên tên và biểu tượng đồ trang bị theo nghề**; hình trong tranh là nét riêng của nhân vật.
- **Chỉ đổi vũ khí mới tốn cắt lớp.** Nhân vật giữ hình cổ điển (Hà Vân giữ trượng, Mai Thanh giữ hồ lô, Tôn Diệm giữ cờ lệnh, Cao Kiên giữ giáo…) thì chỉ vẽ lại ảnh; còn vật dụng đặc trưng luôn rẻ vì vẽ ngay trên thân.

## 4. Mẫu hồ sơ nhân vật thường (hư cấu)

| Mục | Nội dung |
|---|---|
| Tên · nghề · hệ | theo `roster.ts`, không đổi |
| **Phe và loại xuất thân** | nghĩa quân Hoa Lư hoặc một sứ quân; nghĩa quân, dân binh, lính hoặc hàng binh (mục 2.1) |
| Tuổi, quê | một vùng quanh Hoa Lư, sông Hồng, Bố Hải… (đất hư cấu hoặc chung chung) |
| Xuất thân | 1–2 câu: việc từng làm, vì sao theo cờ lau |
| Tính cách | 3 từ và một thói quen |
| Ba dấu ấn | khuôn mặt · họa tiết và màu nhấn · vật dụng đặc trưng (mục 2) |
| Vũ khí và nhịp | vũ khí chọn theo mục 3.1 và nhịp dùng (mục 3.2) |
| Câu nói | một câu, giọng hào sảng ngắn |
| Nhãn | **Nhân vật hư cấu của game**, không phải nhân vật có trong sử |

Lời kể theo văn phong "hào sảng" đã dùng ở Bình Loạn; không gán người thật, sự kiện thật cho nhân vật hư cấu ([Narrative Bible](../02-game-modes/campaign/narrative-bible.md)).

### 4.1 Phân bổ phe cho 56 nhân vật (42 tướng thường và 14 xạ thủ, sát thủ)

Quy ước: mỗi hệ có 8 người (6 nghề cũ, Xạ thủ, Sát thủ). Phe chọn theo **hệ của sứ quân** (Thủy: Bố Hải, Tiên Du, Tế Giang; Hỏa: Đằng Châu, Tây Phù Liệt; Kim: Bình Kiều, Siêu Loại; Thổ: Tam Đái, Đỗ Động; Mộc: Hồi Hồ; Lôi: Phong Châu; Phong: Đường Lâm) và theo **xuất thân đã ghi** của 14 xạ thủ, sát thủ. ★ là tướng khởi đầu, đều là nghĩa quân Hoa Lư.

| Hệ | Nghĩa quân Hoa Lư | Lính hoặc hàng binh của sứ quân |
|---|---|---|
| Kim | ★ Tô Kim, Nghiêm Thiết | **Bình Kiều:** Đoàn Cự (Bạch Nỏ Lang, cựu xạ thủ giữ thành), Chu Ngân, Cao Kiên · **Siêu Loại:** Trần Cương, Trần Ngọc, Phan Quyên (Bạch Phong Đao, cận vệ) |
| Mộc | Quản Hiên (Thanh Lâm Xạ, dẫn đường núi tre), Đàm Thảo, Lục Diệp, Nhan Trúc | **Hồi Hồ:** Nông Sâm (Độc Ảnh, trinh sát đầm), Lâm Tùng, Hoàng Mộc, Sầm Tuệ |
| Thủy | ★ Mai Thanh, Quách Ẩn | **Bố Hải:** Thái Diệp (Lam Giang Phi Diệp, trinh sát bến sông), Thái Hà · **Tiên Du:** Vi Triều, Vi Lam · **Tế Giang:** Âu Thu (Hàn Giang Khách, khách ven sông), Hồ Lãng |
| Hỏa | ★ Hà Vân, Tôn Diệm | **Đằng Châu:** Lý Diệm (Xích Diệm Luân, hộ vệ kho lương), Lý Liệt, Hồng Đan · **Tây Phù Liệt:** Tiết Dạ (Xích Dạ, đột kích đêm), Trương Viêm, Ninh Hỏa |
| Thổ | ★ Lê Thạch, Mã Liên | **Tam Đái:** Kha Thạch (Trấn Sơn Thạch, giữ lối đèo), Kha Sơn, Mã Nhạc · **Đỗ Động:** Cát Tàng (Địa Ẩn, trinh sát công sự), Doãn Nham, Tạ Thạch |
| Lôi | Mẫn Tuyên (Lôi Ảnh, truyền tin), Vũ Lôi, Tiêu Minh, Mạc Vân | **Phong Châu:** Lương Triệt (Lôi Minh Xạ, truyền tin miền núi), Tống Tấn, Ông Chấn, Từ Kinh |
| Phong | ★ Phùng Phong, Giáp Yến (Tật Phong Lăng, kỵ trạm), Liễu Thiều (Vô Ảnh), Bạch Sương | **Đường Lâm:** Hứa Lăng, Liễu Yên, Mạnh Tường, Bùi Phiêu |

Tổng: **20 nghĩa quân Hoa Lư** và **36 lính hoặc hàng binh của 12 sứ quân** (từ 2 đến 4 người mỗi phe). Với nhân vật lính sứ quân, hồ sơ cần thêm một câu trả lời "vì sao theo về Hoa Lư" (hàng binh, chán cảnh tranh đánh, theo chủ tướng quy phục…).

### 4.2 Quan hệ giữa nhân vật, để mở rộng không bị gò bó

**Nguyên tắc:** quan hệ là **đồ thị mở**, không phải cây gia phả đóng. Để thêm nhân vật mới (anh, chị, con, thầy, bạn) sau này mà **không phải sửa hồ sơ cũ**:

1. **Quan hệ nằm ở bảng riêng**, mỗi dòng một mối (người A, người B, loại, mức, ghi chú). Hồ sơ từng người **chỉ ghi "xem bảng quan hệ"**, không viết cứng "là anh của X" trong lời kể. Thêm người mới nghĩa là **thêm dòng**, không sửa hồ sơ cũ.
2. **Ba mức chắc chắn:**
   - **Đã chốt:** hiển thị cho người chơi và đã vẽ vào tranh (ví dụ ký hiệu chung).
   - **Gợi mở:** chỉ ghi nội bộ để viết thoại, có thể đổi.
   - **Chỗ trống:** một mối **chưa có tên**, giữ sẵn cho người tương lai ("người thầy cũ", "người anh thất lạc"). Hồ sơ nêu mối này nhưng **không đặt tên hay mặt**.
3. **Loại quan hệ chuẩn:** ruột thịt (anh chị em, cha mẹ và con), hôn nhân, thầy trò, bạn thuở nhỏ, đồng hương, đồng đội, đối địch, ơn nghĩa.
4. **Hạn chế để khỏi đóng cửa:** mỗi người tối đa **hai** quan hệ đã chốt; mỗi gia đình tối đa **ba** người đã chốt (còn lại để ngỏ); **không** đặt quan hệ "đã kết thúc" (đã mất, đã tuyệt giao) trừ khi nhân vật liên quan đã được chốt.
5. **Không bắt buộc cùng hệ, cùng nghề, cùng phe** (riêng **ruột thịt thì cùng họ**, xem mục 2.2). Người thân khác phe là nguồn kịch (hai anh em ở hai bên, vợ chồng chia hai phe). Các cặp ở bảng dưới trùng hệ chỉ vì đang gợi một "dòng khí", sau này có thể phá.
6. **Không gán quan hệ huyết thống hoặc hôn nhân với người có thật trong sử** (sứ quân, Đinh Bộ Lĩnh, Đinh Liễn…). Nhân vật hư cấu chỉ làm **lính hoặc thuộc hạ**, không làm họ hàng.
7. **Dữ liệu sau này** (chưa làm): một bảng mỏng trong mã, mỗi dòng `{a, b, loại, mức}`, id người giữ chỗ dùng tiền tố riêng; tab **Chi tiết** đọc bảng này để hiện mục "Người liên quan" và **mở dần** theo tiến độ (Shan chốt 08/11/2026: tiểu sử ngắn gộp trong Chi tiết, **không thêm tab**).

**Bảng quan hệ khởi đầu (đề xuất, 15 mối giữa 30 người):**

| Mã | Người A | Người B | Loại | Mức | Ghi chú |
|---|---|---|---|---|---|
| R1 | Trần Cương | Trần Ngọc | anh em ruột | đã chốt | cùng Siêu Loại; anh cầm đại đao, em cầm kim châm |
| R2 | Thái Hà | Thái Diệp (ngoại hiệu Lam Giang Phi Diệp) | cha và con trai | đã chốt | cùng Bố Hải; cha lính chèo, con trinh sát bến sông |
| R3 | Kha Sơn | Kha Thạch (ngoại hiệu Trấn Sơn Thạch) | anh em ruột | đã chốt | cùng Tam Đái; anh đẽo đá, em giữ lối đèo |
| R4 | Lý Liệt | Lý Diệm (ngoại hiệu Xích Diệm Luân) | anh và em gái | đã chốt | cùng Đằng Châu |
| R5 | Hồng Đan | Ninh Hỏa | vợ chồng | đã chốt | **hai phe**: Đằng Châu và Tây Phù Liệt |
| R6 | Mã Nhạc | Mã Liên | cha và con gái | đã chốt | **hai phe**: Tam Đái và nghĩa quân Hoa Lư; con rời cha theo cờ lau |
| R7 | Vi Triều | Vi Lam | anh và em gái | gợi mở | cùng Tiên Du |
| R8 | Liễu Yên | Liễu Thiều (ngoại hiệu Vô Ảnh) | chị em thất lạc | gợi mở | **hai phe**: Đường Lâm và nghĩa quân |
| R9 | Doãn Nham | Cát Tàng (ngoại hiệu Địa Ẩn) | thầy trò | gợi mở | cùng Đỗ Động |
| R10 | Quách Ẩn | Âu Thu (ngoại hiệu Hàn Giang Khách) | thầy trò | gợi mở | **hai phe**: nghĩa quân và Tế Giang |
| R11 | Nghiêm Thiết | Cao Kiên | bạn cũ | gợi mở | **hai phe**: nghĩa quân và Bình Kiều |
| R12 | Lâm Tùng | Hoàng Mộc | cậu và cháu | gợi mở | cùng Hồi Hồ |
| R13 | Tống Tấn | Lương Triệt (ngoại hiệu Lôi Minh Xạ) | thầy trò | gợi mở | cùng Phong Châu |
| R14 | Đàm Thảo | Lục Diệp | chị em họ | gợi mở | cùng nghĩa quân |
| R15 | Tiết Dạ (ngoại hiệu Xích Dạ) | Trương Viêm | đồng đội cũ | gợi mở | cùng Tây Phù Liệt |

**Chỗ trống đã đặt sẵn** (người chưa có tên): mẹ của Hà Vân (thợ dệt), cha của Mai Thanh (thầy thuốc đò), cha của Tô Kim (lái buôn bến), thầy dạy sáo của Phùng Phong, người em của Hứa Lăng. Sau này thêm nhân vật vào các chỗ này **không phải sửa hồ sơ của năm người trên**.

## 5. Năm hồ sơ mẫu (năm tướng thường khởi đầu)

*Ba mươi bảy hồ sơ còn lại ở file `ho-so-37-tuong-thuong.md`.*

### Hà Vân · Pháp sư · Hỏa
- **Ngoại hiệu:** Đảm Hỏa (gánh lửa, nhận phần nặng).

- **Phe:** nghĩa quân Hoa Lư (cờ lau); dấu hiệu mặt trời trống đồng thêu ở cổ tay áo.
- **Tuổi, quê:** khoảng 25, làng đúc đồng ven sông (hư cấu).
- **Xuất thân:** con gái thợ đúc, lớn lên bên lò lửa và khung dệt của mẹ. Khi cờ lau cần giáo và trống đồng, cô mang lửa lò theo đi, thành người "gọi lửa" của đội quân.
- **Tính cách:** điềm tĩnh, kín tiếng, ít cười; thói quen lau lư hương mỗi sáng.
- **Ba dấu ấn:** nét nữ rõ, khăn và hai dải lụa đỏ, trâm đồng · áo đỏ gạch thêu sóng mây vàng, lớp lót cam, vòng đồng răng cưa (màu nhấn đỏ) · **lư hương đồng treo xích ở hông** (vật dụng, không dùng đánh).
- **Vũ khí và nhịp:** **trượng đồng đầu ngọc đỏ** · nhịp **trượng** (giữ như hiện tại, nên chỉ vẽ lại ảnh).
- **Câu nói:** "Lửa lò nuôi được cả làng, lửa trận thì tôi xin nhận phần nặng."

### Lê Thạch · Binh lính · Thổ
- **Ngoại hiệu:** Thủ Thổ (giữ đất).

- **Phe:** dân binh trong nghĩa quân Hoa Lư; dấu hiệu là bông lau cài trên khiên mây.
- **Tuổi, quê:** khoảng 30, làng ven đê (hư cấu).
- **Xuất thân:** người đắp lũy và giữ đê, tay quen vác đất, từng một mình giữ kho thóc làng qua mùa nước lớn. Nghe tin cờ lau, anh dẫn thanh niên làng đi theo.
- **Tính cách:** chắc nịch, ít nói, bền bỉ; có thói quen đặt tay lên đất trước trận.
- **Ba dấu ấn:** da sạm nắng, nón lá, sẹo ở cằm · áo giáp da ô-liu, họa tiết ba dải đất (màu nhấn nâu đất) · **túi vải đựng nắm đất** (vật dụng).
- **Vũ khí và nhịp:** **giáo mũi đồng hình lá và khiên mây** · nhịp **đâm** (giữ hình cổ điển, chỉ vẽ lại ảnh và cắt lại lớp theo phong cách mới). Ban đầu thiết kế là rìu đồng hình thuyền, bỏ ngày 09/11/2026 vì mô hình tạo ảnh vẽ rìu sai nhiều lần (đầu rìu hình chữ T, tay cầm sai chỗ, mỗi tranh một kiểu).
- **Câu nói:** "Đất còn thì lũy còn. Ta đứng đây."

### Mai Thanh · Y sư · Thủy
- **Ngoại hiệu:** Thanh Hồ (hồ trong, thuốc trong hồ lô).

- **Phe:** nghĩa quân Hoa Lư, lo việc chữa trị; băng tay có bông lau.
- **Tuổi, quê:** khoảng 22, thuyền thuốc trên sông (hư cấu).
- **Xuất thân:** con nhà thầy thuốc đò, quen hái lá ven sông và chữa người bị thương sau lũ. Cô theo quân vì thấy quá nhiều người ngã xuống mà không ai chữa.
- **Tính cách:** dịu dàng, quả quyết, hay nhắc người khác uống nước; thuộc tên mọi loại lá.
- **Ba dấu ấn:** tóc dài buông, trâm vàng nhỏ, nốt ruồi dưới mắt · áo xanh chàm viền thêu vân sông (màu nhấn xanh) · **cối đồng nhỏ ở hông** (vật dụng).
- **Vũ khí và nhịp:** **hồ lô thuốc khắc vân sông** · nhịp **hồ lô** (giữ như hiện tại, nên chỉ vẽ lại ảnh).
- **Câu nói:** "Vết thương nào cũng có thuốc. Cứ để tôi lo."

### Tô Kim · Mưu sĩ · Kim
- **Ngoại hiệu:** Toán Lương (tính từng hạt lương).

- **Phe:** nghĩa quân Hoa Lư, lo lương thảo; thẻ đồng khắc mặt trời trống đồng trên túi tiền.
- **Tuổi, quê:** khoảng 35, chợ bến sông (hư cấu).
- **Xuất thân:** con nhà buôn chợ bến, giỏi tính từng hạt thóc, từng đường đi. Anh dùng sổ sách và đường buôn để quân có lương trước khi có giáo.
- **Tính cách:** lanh lợi, hơi kiêu, tính toán; hay đếm nhẩm khi suy nghĩ.
- **Ba dấu ấn:** nét sắc, râu cằm mỏng, búi tóc gọn · áo xám bạc thêu vòng tròn đồng tâm (màu nhấn bạc) · **cân đồng và túi tiền vải bên hông** (vật dụng, không dùng đánh).
- **Vũ khí và nhịp:** **quạt xếp nan sắt** · nhịp **quạt** (giữ nhịp cũ, đổi hình quạt cho khác Ninh Hỏa).
- **Câu nói:** "Thóc nào đi đường nào, tôi đếm đủ."

### Phùng Phong · Quân sư · Phong
- **Ngoại hiệu:** Báo Phong (báo gió trước trận).

- **Phe:** nghĩa quân Hoa Lư, trinh sát đưa tin; dải vải bông lau buộc ở sáo.
- **Tuổi, quê:** khoảng 40, vùng núi gió (hư cấu).
- **Xuất thân:** người đưa tin vùng núi, thổi sáo trúc để báo hiệu giữa các làng, đọc gió và mây để đoán thời tiết. Anh theo quân để dẫn đường và báo gió trước trận.
- **Tính cách:** từ tốn, quan sát, ít nói; thường ngước nhìn trời trước khi mở lời.
- **Ba dấu ấn:** gầy, khăn quấn xanh ngọc, mắt sáng, râu thưa · áo nâu xám thêu vân gió xoáy (màu nhấn xanh ngọc) · **sáo trúc cài hông** (vật dụng: thổi báo hiệu, không đánh).
- **Vũ khí và nhịp:** **gậy trúc chỉ huy** · nhịp **trượng**.
- **Câu nói:** "Gió đã đổi. Quân ta xuất phát."

> Cả năm khớp bảng 3.2. Vũ khí khác nhau và **không món nào do biến vật dụng thành vũ khí**: Hà Vân và Mai Thanh giữ hình cổ điển (ít việc nhất); Lê Thạch giữ giáo (chỉ vẽ lại ảnh và cắt lại lớp); Tô Kim đổi hình quạt; Phùng Phong đổi vũ khí từ cờ lệnh hoặc giáo cũ sang gậy trúc. Vật dụng đặc trưng của cả năm (lư hương, túi đất, cối đồng, cân đồng, sáo) chỉ vẽ trên thân.

## 6. Quy trình sản xuất mỗi nhân vật

| Bước | Tranh | Ghi chú |
|---|---|---|
| 1 | Hồ sơ (mục 4) và chốt vũ khí | Shan duyệt |
| 2 | `bust.webp` | Làm trước, chuẩn cho các bước sau (prompt đã có) |
| 3 | `style.webp` (tranh lớn) | Không gắn với hình động trận |
| 4 | `standing.webp` và các lớp | Cắt lớp lại; chỉ tốn thêm khi **đổi vũ khí** (vật dụng đặc trưng vẽ trên thân nên không tốn) |
| 5 | `pose-attack`, `pose-cast`, `pose-ultimate`, `pose-down` | Giữ dáng tranh cũ làm tham chiếu, đặt lại tọa độ trong `rigs.ts` |
| 6 | Ghép vào trận, chỉnh tọa độ, chụp so sánh | Claude làm |

**Quy tắc nét mặt (Shan, 10/11/2026):** chỉ **bán thân** và **tranh phong thái** được cười. Dáng chuẩn đứng bình thản. Các dáng chiến đấu phải có **sắc thái chiến đấu**, không chỉ là "không cười":

| Dáng | Nét mặt |
|---|---|
| Ra đòn | Mắt khóa vào địch, chân mày hạ thấp, hàm nghiến, môi mím |
| Ra chiêu | Mắt nheo tập trung, chân mày hạ, ánh nhìn vững, miệng ngậm |
| Tuyệt chiêu | Mắt rực tập trung, chân mày dồn, miệng há hô xung trận, cổ và hàm căng (không hề hước) |
| Gục xuống | Đau và kiệt sức, chân mày nhíu, mắt nhắm, nhăn mặt |

Khối mô tả nhân vật dùng chung cho nhiều dáng không được ghi sẵn nụ cười; nụ cười đặc trưng chỉ viết trong dòng dáng của phong thái. Prompt mỗi dáng chiến đấu có dòng `BATTLE FACE:` (hoặc `FACE:` với dáng gục) theo bảng trên.

**Quy tắc tóc (Shan, 11/11/2026):** thời Đinh **nam để tóc dài, búi hoặc vấn khăn; nữ búi, tết hoặc xõa dài**. **Tránh tóc ngắn** (húi, cạo, ngang cằm, ngang vai) vì không hợp thời. Hồ sơ nào ghi tóc ngắn thì đổi thành búi hoặc vấn khăn; ngoại lệ (người có lý do cạo đầu, như thợ đá hoặc lính) phải được Shan duyệt riêng.

**Phong thái phải đa dạng và mang dáng tướng (Shan, 10/11/2026):** phong thái không bắt buộc phải cười; dù đang nghỉ, nhân vật chiến đấu vẫn phải toát ra dáng của người từng ra trận (tư thế vững, ánh nhìn có hồn), không hề hước giả tạo. Nụ cười chỉ dùng khi hợp tính cách và phải tự nhiên. mỗi nhân vật một hoạt động riêng gắn với nghề và tính cách, hạn chế trùng dáng (tránh nhiều người cùng quỳ chạm đất, cùng ngồi lau vũ khí, cùng đứng chống vũ khí). Có thể có **thú**: dắt ngựa, dắt voi, dắt trâu, cho ngựa ăn, ngồi trên lưng trâu. Kho gợi ý: dắt trâu kéo đá; dắt voi tải hàng; dắt ngựa thồ; cho ngựa uống nước; vá lưới trên thuyền; ăn cơm lam; khắc chữ lên đá; mài dao hoặc lau mũi giáo; kể chuyện bên rào lũy; đánh trống; nấu thuốc; chép sách; đếm tiền và sổ; thả diều hoặc nghe gió; nướng cá; gánh nước; buộc cờ lên cột. Trước khi viết phong thái mới, xem bảng dưới để khỏi trùng.

| Nhân vật | Phong thái |
|---|---|
| Lê Thạch | Dắt trâu bằng dây thừng, tay vỗ cổ trâu |
| Kha Sơn | Dắt voi non tải hàng trên đường núi |
| Hoàng Mộc | Ngồi mép thuyền mở ống cơm lam |
| Thái Hà | Quỳ vá lưới |
| Trương Viêm | Ngồi rào lũy kể chuyện cười |
| Cao Kiên | Ngồi ghế thấp lau mũi giáo |
| Ông Chấn | Nghỉ như tướng ở rìa trại: một chân gác bệ trống trận, tay chống tiên xuống đất, mắt nhìn quân (không cười, không đánh trống) |
| Doãn Nham | Ngồi trên tảng đá khắc chữ lên bia đá |
| Hà Vân, Tô Kim, Hồ Lãng | Giữ như prompt đã duyệt (quỳ một gối; ngồi ghế sổ; ngồi mũi thuyền) |
| Các nhân vật còn lại | Chọn từ kho gợi ý, không trùng bảng này |

Khoảng **7 tranh** và một lần cắt lớp cho mỗi người; 77 nhân vật là hơn 500 tranh, nên làm theo đợt:

- **Đợt 0:** Hà Vân trọn bộ (đã chuẩn bị).
- **Đợt 1:** bốn tướng khởi đầu còn lại.
- **Đợt 2:** tướng lịch sử và sứ quân (khoảng 19 người).
- **Đợt 3:** các tướng thường còn lại.

## 7. Quyết định

**Đã chốt (Shan, 08/11/2026):**

1. Bảy yêu cầu ở mục 1.
2. **Phe** (mục 2.1, 4.1): 13 phe, 20 nghĩa quân Hoa Lư và 36 lính hoặc hàng binh của 12 sứ quân.
3. **Quy tắc "vật dụng ≠ vũ khí"** (mục 3) và **bảng phân bổ 3.2**.
4. **Đồ trang bị giữ tên theo nghề** (3.4).
5. **Tiểu sử ngắn gộp trong tab Chi tiết**, không thêm tab.
6. **Xạ thủ và Sát thủ** (3.3, 2.2): giữ nguyên 14 vũ khí; đặt họ tên mới, tên hiện nay thành ngoại hiệu.
7. **Quan hệ** (4.2) và 15 mối khởi đầu.
8. **37 hồ sơ** ([ho-so-37-tuong-thuong.md](ho-so-37-tuong-thuong.md)) và năm hồ sơ mẫu.
9. **Tên và ngoại hiệu** (2.2): ba tên đổi họ, 42 ngoại hiệu bản 2 (rút từ câu nói), họ tên mới của 14 Xạ thủ, Sát thủ.

**Đã áp dụng vào mã (08/11/2026):**

- `roster.ts`: đổi chuỗi `name` của 17 nhân vật (`id` không đổi).
- `src/core/roster/lore.ts`: 13 phe (`FACTIONS`), ngoại hiệu, phe, xuất thân, tính cách, câu nói của 56 nhân vật (`CHARACTER_LORE`) và bảng quan hệ R1–R15 (`RELATIONS`, hai mức `chot` và `goiMo`; chỉ `chot` hiển thị). Dữ liệu sinh từ các hồ sơ ở docs; **sửa chữ ở một nơi thì sửa cả hai** (hồ sơ và `lore.ts`).
- Tab **Chi tiết** (`profile/Biography.tsx`): ngoại hiệu, phe kèm ký hiệu cờ, tuổi và quê, tiểu sử, tính cách, câu nói, người liên quan; ghi rõ nhân vật hư cấu. Nhân vật có thật (Đinh Bộ Lĩnh, tướng lịch sử, sứ quân) không hiện mục này.
- Test `tests/core/roster-lore.test.ts`: đủ 56 nhân vật, ngoại hiệu không trùng, tên không trùng, 13 phe (20 và 36), quan hệ hợp lệ, ruột thịt cùng họ.
- 14 hồ sơ Xạ thủ, Sát thủ trong `lore.ts` mới có tiểu sử một câu (từ thiết kế gốc), chưa có tuổi, quê, tính cách, câu nói; mở rộng theo mẫu mục 4 khi có thời gian.
- Tên cũ vẫn còn trong tài liệu lịch sử, prompt tranh, báo cáo và tên thư mục tranh (không đổi theo quy định "lịch sử không sửa"); trong tên của chiêu (ví dụ "Độc Ảnh Tiềm Châm") ngoại hiệu giữ nguyên.

**Chưa làm:** làm lại tranh nhân vật, vũ khí và tư thế theo phong cách mới (quy trình mục 6, làm thử trọn bộ Hà Vân trước, xem [prompt chân dung](../06-art/prompts/chan-dung-lich-su.md)); tuổi, quê, tính cách, câu nói cho 14 Xạ thủ, Sát thủ; mở khóa hoặc thưởng theo phe (nếu muốn thì là thay đổi gameplay riêng).
