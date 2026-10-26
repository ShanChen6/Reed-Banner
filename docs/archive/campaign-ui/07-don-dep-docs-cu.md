# 07 — Dọn docs chế độ chơi cũ: XÓA nội dung lỗi thời, GIỮ tài liệu đang dùng

> Trạng thái: **ARCHIVED** — lưu để truy vết, không phải tài liệu hiện hành.

> Cập nhật: 26/10/2026  
> Ưu tiên: task **DOC-00**. Không xóa source code hoặc dữ liệu.

## Mục tiêu

Người đọc mới không nhìn thấy luật của **Chiến dịch 13 màn** hoặc **Leo tháp vô hạn (Legacy)** như những chế độ hiện hành. Tránh xóa nhầm tài liệu của Boss Raid, Song Tháp (Trial/Destiny), Sinh tồn và các báo cáo phục vụ audit.

## Kết quả audit đối chiếu `develop`

| File | Hiện trạng | Hành động |
|---|---|---|
| `docs/design/09-che-do-choi.md` | Đang có Campaign V2 + một mục **2.1 Chiến dịch 13 màn cũ**, mục **3.1 Leo tháp (Vô hạn) — đã gỡ** | **Xóa 2 đoạn lịch sử cũ khỏi tài liệu chế độ hiện hành**, chỉnh lại đánh số nội dung còn dùng và link tới nhật ký nếu muốn giữ vết |
| `docs/README.md` | Mục lục vẫn ghi **Leo tháp cũ** như chủ đề design 09 | Sửa mô tả thành mode active; thêm link Campaign V2 UI / audio TODO sau khi tài liệu được đặt vào repo |
| `docs/cau-hoi-mo.md` | Có TODO “Leo tháp (phần thưởng giữa các tầng)” dẫn đến anchor cũ | Xóa vế Leo tháp legacy + anchor sai; tách Sinh tồn và TODO UI thoại/bản đồ mới |
| `docs/lo-trinh.md` | Bảng 4.1, 4.3, 4.4 vẫn liệt kê task cũ, có lệnh sim stage đã gỡ | Chuyển các dòng thành một câu lịch sử hoặc bỏ khỏi **roadmap đang thực hiện**, giữ task 4.7 Campaign V2 và đường dẫn báo cáo |
| `docs/design/00-tong-quan.md` | Vẫn ghi “thiết kế, chưa triển khai code” | Sửa trạng thái dự án, không xóa file vì còn clean-room/legal |
| `docs/campaign-v2/` | Design Freeze, Mission Matrix, lịch sử, audits, QA V2 | **Giữ**: nguồn sự thật cho game |
| `docs/dual-tower/` | Các docs Trial/Destiny hiện hành và lịch sử migration | **Giữ**: mode còn dùng; lịch sử migration hữu ích audit |
| `docs/survival-v1.1/` | Sinh tồn hiện hành | **Giữ** |
| `docs/reports/`, `docs/audits/`, `docs/plans/` | Bằng chứng, audit và các snapshot trước/sau cân bằng | Mặc định **GIỮ**, không dùng làm source design hiện hành |

## Dự kiến xóa gì thực sự?

Chưa thấy một tệp Markdown độc lập trong `docs/` chỉ chuyên hướng dẫn chơi **Leo tháp vô hạn cũ** hoặc **Campaign 13 màn**. Do đó **không xóa cả `09-che-do-choi.md`**; chỉ xóa **sections đã hết hiệu lực**. Nếu khi Codex rà soát phát hiện file độc lập 100% obsolete, được `git rm` file đó và liệt kê rõ lý do/links phụ thuộc.

Không được xóa `src/core/campaign/` hay `RaidPanel` theo từ khóa “legacy”; code chiến dịch cũ đã gỡ, đây là task tài liệu.

## Cách kiểm tra an toàn

1. `rg -n -i 'leo tháp cũ|leo tháp vô hạn|chiến dịch 13 màn|--stage all|/game/tower|/tower|campaign\.legacy' docs --glob '*.md'`
2. Phân loại mỗi kết quả: **hướng dẫn gameplay hiện hành** (xóa/sửa); **mốc lịch sử quyết định/QA** (giữ, nhãn archived); **tài liệu code đang dùng** (giữ).
3. Chạy `rg -n '09-che-do-choi.md#|lo-trinh.md#|campaign-v2/' docs --glob '*.md'` để rà link/anchor.
4. Sửa docs index và TODO để không dẫn đến phần đã xóa.
5. Không tự viết lại tài liệu luật Trial/Destiny; chỉ link sang nguồn hiện hành.
6. Báo chính xác những file bị xóa, những section bị cắt, các nguồn giữ lại và references được cập nhật.

## Chỉ dấu hoàn thành

- Người mới mở docs/README → design/09 sẽ chỉ thấy mode đang còn: Demo, Normal, Campaign V2, Boss Raid, Trial, Destiny, Survival, Daily/Arena nếu được mô tả.
- Không có hướng dẫn “bắt đầu chơi Leo tháp vô hạn cũ” hay “chơi 13 màn cũ”.
- Docs lịch sử được gắn `ARCHIVED — chỉ đối chiếu` thay vì dùng để thực hiện task mới.
- Chạy đúng prompt `prompts/DOC-00.md`; không xóa file theo pattern toàn thư mục.