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
