# Đánh giá Bình Loạn (chế độ chiến dịch)

> Cập nhật: 07/11/2026
> Trạng thái: **AUDIT** — đo tự động và xem ảnh chụp ở máy dev, chơi với tư cách khách và hồ sơ giả; chưa sửa mã. Phần "Chưa xem" cuối tài liệu liệt kê những gì cần dữ liệu thật hoặc máy chủ.

Bước đầu của kế hoạch tối ưu từng chế độ (Bình Loạn trước vì hero Chiến trường dẫn người mới thẳng vào đây). Đánh giá theo 7 câu hỏi: lần đầu vào, vòng chơi trên điện thoại, các trạng thái, thưởng và tiến độ, sau khi xong, responsive, bàn phím. Số đo nối tiếp [kiểm kê UI 07/11/2026](../ui-audit-2026-11-07/README.md); luật chiến dịch ở [tài liệu chiến dịch](../../02-game-modes/).

## Phạm vi và cách đo

- Ba tab của màn Sử ký (Bản đồ, Nhiệm vụ, Sử ký) × ba tiến độ (**mới**, **giữa chừng** 7/24 nhiệm vụ, **đã xong** 24/24) × ba cỡ (360, 768, 1440px) = 27 lần đo; hồ sơ giả chặn ở trình duyệt, không đụng máy chủ.
- Luồng một nhiệm vụ: bấm "Tiếp" qua các trang cốt truyện tới trang chọn và nút "Hoàn thành nhiệm vụ", ở người mới (360 và 1440px) và giữa chừng (360px).

## Kết quả tổng quát

| Chỉ số | Kết quả |
| --- | --- |
| Tràn ngang | **0/27** |
| Lỗi JS | **0** |
| Chữ dưới 13px | 0–1 điểm mỗi lần đo (gần đạt) |
| Chiều cao tab Bản đồ ở 360px | mới **2929px**, giữa chừng 2994px, đã xong **5351px** |
| Chiều cao tab Nhiệm vụ ở 360px | 1686 / 1857 / 2539px |
| Chiều cao tab Sử ký ở 360px | 1886 / 1932 / 2720px |

Bố cục co giãn tốt, nội dung sử liệu rõ nguồn (nhãn Sử chép, Truyền thuyết, Game tái dựng, Còn tranh luận). Vấn đề nằm ở **dẫn dắt người mới, nội dung chưa mở chiếm chỗ, vùng chạm nhỏ và vài chỗ chật ở 360px**.

## Phát hiện, xếp theo mức nặng

### P1 — nặng

1. **Người mới không thấy lối vào nhiệm vụ đầu tiên.** Hero Chiến trường dẫn tới đây bằng "Bắt đầu chiến dịch", nhưng tab Bản đồ không có nút "Bắt đầu nhiệm vụ 1". Ở điện thoại, thẻ nhiệm vụ đầu tiên nằm ở khoảng 42% chiều cao trang, sau bản đồ nhỏ, chú giải và danh sách 13 cứ điểm; người chơi phải đoán là cần bấm tab Nhiệm vụ hoặc chọn một cứ điểm.
2. **Khối "Tái đấu sứ quân" chiếm chỗ vô ích với người mới.** Hiện ở **cả ba tab**, gồm 6 ô "Sứ quân chưa gặp" gần giống nhau và một câu giải thích; cao khoảng 650px ở điện thoại, khoảng 480px ở laptop (nơi nửa phải còn bỏ trống). Khi chưa mở sứ quân nào (0/6) chỉ cần một dòng.
3. **Tab Sử ký lặp nội dung chưa mở.** Người mới thấy 12 dòng "W01…W12: Chưa gặp. Hồ sơ mở khi nhiệm vụ…" gần giống nhau. Người đã xong chiến dịch thấy **28 liên kết nguồn nhỏ** ("S01 ↗") chỉ 35×20px.
4. **Vùng chạm nhỏ.** 10 cứ điểm trên bản đồ ở điện thoại rộng 31–63px, cao 36–49px (đã có danh sách cứ điểm dưới bản đồ làm đường thay thế); ở tab Nhiệm vụ, các liên kết nguồn sử rộng 244–289px nhưng chỉ cao **18px**.
5. **Trang chọn cuối nhiệm vụ khó hiểu.** Nút "Hoàn thành nhiệm vụ" trông mờ như đã tắt mà không nói vì sao (cần chọn một lối kể); hai lựa chọn mang nhãn "CHE CHỞ" / "THỰC TẾ" khó hiểu với người mới; câu "Lựa chọn chỉ đổi lời kể; kết quả nhiệm vụ và phần thưởng như nhau" đáng giá nhưng nhỏ và nằm dưới. *(Trạng thái sau khi đã chọn chưa kiểm tra.)*

### P2 — vừa

6. **Header Sử ký chật ở 360px.** Bốn tab (Bản đồ, Nhiệm vụ, Sử ký, Binh lực) sát viền, chữ "NHIỆM VỤ" chạm mép; ba chip Cấp, Vàng, Lương xuống hai hàng và lệch.
7. **Tab Bản đồ ở laptop còn trống.** Dưới bản đồ có một dải trống khoảng 200px chỉ chứa chú giải nhỏ; bản đồ không lấp khung.
8. **Khối "Bản đồ rõ hơn khi xoay ngang"** chiếm một khối lớn ở đầu tab Bản đồ trên điện thoại.
9. **Trang quá dài ở điện thoại**, nhất là khi đã xong chiến dịch (5351px ở tab Bản đồ do danh sách tái đấu 6 sứ quân mở đầy).
10. **Nút "Chiến trường" ở header cao 40px** trên màn cảm ứng (thuộc header chung, đã ghi ở kiểm kê trước; cần xác nhận lại).

### P3 — nhẹ

11. Hai ô gập "Ghi chú nguồn" và "Sử liệu: sự kiện, nguồn và phần game dựng" chồng nhau ở mỗi nhiệm vụ; có thể gộp.
12. Cụm nhãn Sử chép, Game tái dựng, Còn tranh luận dày; ba nhãn trên một dòng tiêu đề khiến tiêu đề nhiệm vụ nặng.

## Đề xuất thứ tự sửa

1. **Gập "Tái đấu sứ quân"** thành một dòng khi chưa mở sứ quân nào; chỉ hiện đầy đủ ở tab Bản đồ (không lặp ở Nhiệm vụ và Sử ký). Rẻ nhất, bớt khoảng 650px trên điện thoại.
2. **Nút tiếp tục nổi bật ở đầu tab Bản đồ** ("Tiếp tục: Cờ lau trong ký ức · nhiệm vụ 1/4"), cùng chủ đề với nút hero; trên điện thoại có thể dính đáy. Giải quyết lỗi P1.1.
3. **Sử ký:** gập nhóm sứ quân chưa gặp thành một dòng; tăng vùng chạm các liên kết nguồn lên 44px.
4. **Trang chọn cuối nhiệm vụ:** nút "Hoàn thành nhiệm vụ" hiện lý do khi chưa chọn, nhãn dễ hiểu hơn, trạng thái đã chọn rõ.
5. **Header 360px:** hai hàng gọn (tab một hàng, chip một hàng), tab đủ chỗ cho chữ.
6. Dọn P2.7–P2.8 và P3.

## Chưa xem (cần dữ liệu thật hoặc máy chủ)

- Trận chiến trong nhiệm vụ, màn kết quả và nhận thưởng sau khi hoàn thành nhiệm vụ.
- Cảnh ngoại giao (`DiplomacyScene`), tổng kết Chương III (Hội quân Hoa Lư), màn kết thúc chiến dịch (`CampaignEnding`), Đánh trùm (`RaidPanel`) khi đã mở sứ quân.
- Trạng thái sau khi chọn lối kể và nhấn "Hoàn thành nhiệm vụ"; bàn phím và trình đọc màn hình trên bản đồ.
- Hồ sơ có tiến độ thật, lỗi mạng khi lưu tiến độ.

## Tiến độ sửa

| Việc | Trạng thái |
| --- | --- |
| Gom tất cả vào **một đại card** (Shan đề xuất 07/11/2026): tab Nhiệm vụ, tab Sử ký và khu Tái đấu sứ quân nằm trong cùng khung gỗ với header Sử ký, ngăn bằng đường kẻ mảnh thay cho các khung rời; bỏ khung nổi riêng của nhiệm vụ và của Tái đấu | Đã làm 07/11/2026 |
| Gập Tái đấu sứ quân thành một dòng khi chưa mở sứ quân nào (P1.2); chỉ hiện ở tab Bản đồ, không lặp ở Nhiệm vụ và Sử ký | Đã làm 07/11/2026 |
| Chiều cao ở 360px (mới): tab Bản đồ 2929 → 2335px, Nhiệm vụ 1686 → 970px, Sử ký 1886 → 1195px; laptop: Bản đồ 1420 → 947px, Nhiệm vụ 1395 → 900px | Đo 07/11/2026 |
| Các mục còn lại (P1.1 nút bắt đầu nổi bật, P1.3 gập Sử ký, P1.4 vùng chạm, P1.5 trang chọn cuối, header 360px) | Chưa làm |

### Cập nhật 07/11/2026 (Shan phản hồi sau khi gom đại card)

| Việc | Trạng thái |
| --- | --- |
| **Bấm cứ điểm làm bảng bên phải cuộn lồng trong card.** Nguyên nhân: ở màn từ 1280px bảng chương/cứ điểm đặt tuyệt đối với `overflow-y: auto`, nên khi nội dung dài hơn bản đồ (ví dụ 1129px trong khung 739px) hiện thanh cuộn riêng bên trong card. Sửa: bảng tự giãn theo nội dung, bỏ khung cuộn lồng, bản đồ căn đầu hàng. Đo ở 1920, 1440, 1100, 360px: không còn khung cuộn lồng sau khi bấm 4 cứ điểm; trang không tự cuộn | Đã làm |
| **Tab "Binh lực"** (liên kết sang Doanh Trại, không có đường quay lại; Doanh Trại đã có sẵn trong menu tài khoản ở header) **thay bằng tab "Tái đấu"** ngay trong card: chuyển khu Tái đấu sứ quân từ cuối tab Bản đồ sang tab riêng, nên tab Bản đồ ngắn hơn và không còn liên kết rời khỏi màn. Doanh Trại vẫn vào được từ header và từ phần "ra trận cùng đội đã chọn ở Doanh Trại" trong chữ giải thích | Đã làm |

Ghi chú: lỗi `reveal` (bản đồ phóng to tự kéo về giữa khi cờ nhận tiêu điểm) không tái hiện được bằng chuột ở các mức phóng thử; không sửa.

### Cập nhật 07/11/2026 (lượt 3)

| Việc | Trạng thái |
| --- | --- |
| **Về tab Bản đồ bị tự kéo trang.** Mỗi lần đổi tab code luôn gọi `scrollIntoView` và chuyển tiêu điểm (trình duyệt cuộn theo tiêu điểm) nên trang bị kéo xuống khoảng 56–76px. Sửa: tiêu điểm dùng `preventScroll`, chỉ cuộn trang khi đầu card đang nằm trên khung nhìn (ví dụ mở nhiệm vụ từ danh sách ở cuối bản đồ). Đo ở 1920, 1440, 360px × 3 tiến độ: đổi tab 0 lần cuộn; mở nhiệm vụ từ cuối trang vẫn đưa về đầu card | Đã làm |
| **Sử ký bỏ W01–W12:** bỏ các hàng "Chưa gặp" và mã Wxx ở hồ sơ đã mở; chỉ liệt kê hồ sơ đã mở, chưa có thì một dòng. Người mới: tab Sử ký giảm từ 1886px xuống khoảng 700px ở điện thoại | Đã làm |

### Cập nhật 07/11/2026 (lượt 4)

| Việc | Trạng thái |
| --- | --- |
| **Nút bắt đầu nổi bật cho người mới (P1.1).** Đầu tab Bản đồ có thanh khung vàng nêu nhiệm vụ nên làm tiếp (người mới: "Hành trình khởi đầu"; đang dở: "Nhiệm vụ đang dở"; còn lại: "Nhiệm vụ kế tiếp") và một nút lớn "Bắt đầu / Tiếp tục / Vào nhiệm vụ" mở thẳng nhiệm vụ đó. Chọn nhiệm vụ bằng `startTarget` (ưu tiên nhiệm vụ đang dở, rồi nhiệm vụ mở đầu tiên theo thứ tự chương); hết nhiệm vụ thì ẩn. Đo ở 1440 và 360px: nút 215×50 và 274×50, cách đầu trang 184px, bấm mở đúng nhiệm vụ | Đã làm |
| **Chọn hệ và nghề thủ lĩnh.** Trước đây hệ và nghề của Đinh Bộ Lĩnh chỉ được ghi khi bắt đầu một trận, Doanh Trại không có chỗ chọn, mỗi chế độ tự làm bộ chọn riêng. Nay có thao tác hồ sơ `chooseLeader` (server kiểm hệ và nghề hợp lệ) và bộ chọn dùng chung `LeaderBuild`: đặt ở thẻ Đinh Bộ Lĩnh trong Doanh Trại (chỗ chọn chính, lưu cho mọi chế độ) và dùng lại ở màn chuẩn bị nhiệm vụ Bình Loạn, nơi đổi là lưu ngay vào hồ sơ (Shan phản hồi: sang Doanh Trại để đổi tốn bước), nên không phải rời màn. Chưa gom các chế độ còn lại (Sảnh luyện, Sinh tồn, Cửa hàng) về bộ chọn này; các chế độ khác đã đọc mặc định từ hồ sơ | Đã làm (kiểm bằng test, chưa chụp trình duyệt) |
| **Hướng dẫn người mới.** Dưới thanh bắt đầu (chỉ khi chưa làm nhiệm vụ nào) có mục gập "Lần đầu ra trận? Xem cách chơi" gồm bốn bước: nghe chuyện chọn lời, chọn người ra trận, thắng trận mở đường, gặp sứ quân tái đấu. Dùng token và giọng văn chung của Chiến trường; người đã chơi không thấy mục này | Đã làm (chưa chụp trình duyệt); thẻ dùng class khung chung `ui-frame-inset` như các thẻ con khác |
| **Giọng kể 24 nhiệm vụ.** Viết lại theo giọng hào sảng, giữ nguyên sự kiện, năm, tên, nhãn truyền thuyết/sử chép/game sáng tác và các câu trích Toàn thư. Mỗi chương chạy bước kiểm so mọi con số trước và sau khi sửa. Xong cả sáu chương. Hai bước kiểm tự động (mọi con số và mọi tên riêng giữa câu) không phát hiện chỗ lệch; câu trích Toàn thư và các ghi chú nguồn giữ nguyên. Chưa đổi lời kể ở `storyNodes.ts`, `history.ts`, `scenarios.ts` | Đã làm 07/11/2026 |
| **Kiểm font chữ.** Họ font chuẩn: cả Bình Loạn chỉ dùng một họ (Noto Serif qua `--font-game`), không có `font-family` riêng. Cỡ chữ: đo thực tế trên trình duyệt thấy nhãn tên đất trên bản đồ chỉ còn 4–5,6px ở 360px và 8,7–12,2px ở 1440px (SVG co theo bản đồ), tiêu đề "Nhiệm vụ chương" 12,8px. Sửa: tên đất 30 đơn vị (≈13–14px ở laptop), bỏ dòng tên sứ quân khỏi bản đồ (đã có ở danh sách và bảng bên), nhãn "Biển Đông" và chữ "B" la bàn cũng theo quy tắc; bản đồ nhỏ hơn ngưỡng 13px (tính cả mức phóng) thì ẩn nhãn, dùng danh sách cứ điểm bên dưới; tiêu đề bảng 13px. Sau sửa chỉ còn huy hiệu tiến độ 11px, thuộc ngoại lệ chữ phủ lên biểu tượng trong theme.md | Đã làm |
| **Gộp token Bình Loạn vào token chung (Shan hỏi vì sao còn hai bộ).** `--atlas-*` là bản sao nguyên giá trị của token chung, tạo trước khi có `theme.css` và được ghi "sẽ thay dần" nhưng chưa ai gộp; thẻ hướng dẫn mới dùng nhầm token chung nên lệch màu. Đã đổi toàn bộ 20 token `--atlas-*` (globals.css, Chiến trường, Tam Tướng Ký) sang token chung và xóa phần khai báo; hai màu không có bản chung được thêm vào `theme.css` là `--frame-line-mid` (cũ `--atlas-border-soft`) và `--on-wood-muted` (cũ `--atlas-muted`). Chụp lại Bình Loạn và Chiến trường: màu không đổi. Còn `--bk-*` của Doanh Trại chưa gộp | Đã làm |
| **Quét toàn bộ token bản sao và gộp vào token chung (Shan yêu cầu).** Quét 199 khai báo `--*` trong `src/`, nhóm theo giá trị. Đã gộp: 11 token `--bk-*` (Doanh Trại), 8 token `--hdr-*` (header), 7 bí danh cũ (`--bg`, `--panel`, `--fg`, `--gold`, `--frame`, `--cell`), `--on-wood-muted` (trùng `--ash`), `--font-serif` khai lại trong Sử ký; `--frame-gold-hi` nay trỏ về `--color-brand-gold` thay vì lặp mã màu. Thêm hai token chung: `--frame-bronze-hi` (đồng pha vàng, cũ `--hdr-bronze-hi`) và `--frame-gold-pale`. Năm màu `--bk-*` chỉ gần đúng (panel-hi, line, gold-hi, cream, red, red-hi) được đưa về token gần nhất. Chụp trước và sau: Bình Loạn và Chiến trường giống từng điểm ảnh, Doanh Trại lệch tối đa 37/765 (tổng kênh màu), mắt thường không thấy. Các cặp còn lại là bí danh có chủ đích (`--primary` và `--ring` cùng trỏ `--color-brand-gold`; `--color-*` là ánh xạ Tailwind) | Đã làm |
| **Dọn mã hex điền thẳng trong CSS (Shan yêu cầu).** Quét 235 chỗ dùng hex (166 giá trị) trong CSS. 63 chỗ trùng đúng token nên đổi thẳng; 91 chỗ lệch tối đa 14 đơn vị màu so với một token gỗ/giấy/mực/đồng/son nên về token gần nhất; 59 chỗ (42 màu hiệu ứng, bản đồ, minh họa, ví dụ lửa, biển, sông) thành token `--tone-*` trong `theme.css`; thêm `--black`, `--white`. Màu có độ trong suốt viết bằng `color-mix(in srgb, var(--token) N%, transparent)`; bỏ các giá trị dự phòng `var(--x, #hex)`. Chụp trước và sau 20 màn/độ rộng: lệch tối đa 14/765 (tổng kênh màu), chỗ lệch lớn hơn chỉ là bàn cờ ngẫu nhiên. Test mới trong `ui-tokens.test.ts` chặn hex mới ngoài `theme.css` và `color.css`. Chưa dọn hex trong `.tsx` (test cũ đã chặn trong className) | Đã làm |
| **Quét hex trong `.tsx` (Shan yêu cầu).** 354 chỗ trong 30 tệp. Chốt (Shan, 07/11/2026): mã màu của tranh giữ nguyên, không gộp. Đã thử gộp về token gần nhất ở cả biểu tượng xu header và bản đồ thì màu lệch tối đa 19/765 nên hoàn tác. Chỉ đổi màu giao diện thuần (đổ bóng chữ, nền gradient ở Chiến trường, landing, Doanh Trại, hội thoại, thẻ màn Trận Đồ) và chỉ khi trùng đúng màu, nên không lệch điểm ảnh nào (chụp trước và sau 21 màn). Bỏ khối ghi đè `--bg/--panel/--cell/--frame/--gold` trong `DemoGame` (bí danh đã gộp, giá trị trùng mặc định). Giữ nguyên hex: `art/*.tsx`, tranh SVG trong `.tsx`, email (`mail.ts`, không dùng được biến CSS), logo đăng nhập, canvas/Web Animations (`BattleStage`), trang `/demo` | Đã làm |
| **Đổi motif cờ: cánh sen sang Kiều Thuận (Hồi Hồ), Lý Khuê (Siêu Loại) đổi thành giáp vảy** (hợp tạo hình giáp bạc vàng của ông). Sửa cả nét vẽ mã `factionMarks.ts` lẫn prompt `co-su-quan.md`; hình mặt hồ cũ của Kiều Thuận bỏ vì cánh sen đã nằm trên mặt hồ (prompt có kèm lá sen và sậy). Test cờ nhận diện qua (13 hình khác nhau) | Đã làm |
