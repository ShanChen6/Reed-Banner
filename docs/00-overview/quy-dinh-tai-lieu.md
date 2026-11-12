# Quy định viết và cập nhật tài liệu

> Cập nhật: 12/11/2026 (Shan duyệt: tài liệu hết hiệu lực thì xóa, bỏ `archive/` và `audits/`)  
> Trạng thái: **APPROVED** — áp dụng cho mọi thay đổi trong `docs/`.

Quy định này giữ cho mỗi khái niệm có đúng một nguồn chính và cho người lẫn agent (Claude, Codex) tìm đúng file trước khi sửa. CI chạy `pnpm docs:check` ([scripts/check-docs.ts](../../scripts/check-docs.ts)) để kiểm phần máy kiểm được.

## 1. Cấu trúc thư mục

| Thư mục | Chứa gì |
|---|---|
| `00-overview/` | Tổng quan, thuật ngữ, quy định này |
| `01-gameplay/` | Luật trận: bàn cờ, lượt, tài nguyên, công thức, hiệu ứng, nguyên tố, AI, tiến trình |
| `02-game-modes/` | `README.md` tổng hợp mọi chế độ; mỗi chế độ một thư mục (`campaign/`, `dual-tower/`, `survival/`, `expedition/`, `tam-tuong-ky/`, `tran-do/`, `khai-lo/`); `future/` chỉ cho đề xuất **chưa có code** — chế độ có code thì chuyển ra thư mục riêng |
| `03-characters/` | Danh sách nhân vật; `ky-nang/` (hiện hành ở `README.md`, dữ liệu sinh từ code ở `data/`) |
| `04-equipment/` | Trang bị, cường hóa |
| `05-ui-ux/` | `design-system/` (theme, token, spec), `screens/`, `campaign/` (UI riêng Campaign), `implementation/` |
| `06-art/` | Art bible, kế hoạch đồ họa, `prompts/` ảnh, ghi chú từng nhân vật |
| `07-architecture/` | Kiến trúc, hạ tầng, server |
| `09-roadmap/` | Lộ trình dự án, câu hỏi còn mở |
| `decisions/` | Nhật ký quyết định (`changelog.md`) |
| `reports/` | Báo cáo mô phỏng, kiểm kê còn làm căn cứ cho luật hiện hành. Chỉ bản tóm tắt `.md` (và tệp nhỏ script ghi); dữ liệu thô không commit |

Chưa có thư mục cho một chủ đề mới thì đặt vào domain gần nhất và ghi lý do trong PR; không tạo thư mục rỗng.

## 2. Ba loại tài liệu

- **Nguồn chính (canonical):** định nghĩa luật, số liệu, contract. Được đánh dấu ★ trong [docs/README.md](../README.md). Mỗi khái niệm chỉ có một.
- **Tham chiếu (reference):** prompt tạo tranh, dữ liệu sinh từ code, hướng dẫn người chơi. Được dẫn từ nguồn chính, không định nghĩa luật mới.
- **Báo cáo (report):** mô phỏng, kiểm kê còn làm căn cứ cho luật hiện hành, đặt trong `reports/`. Không sửa nội dung sau khi xong, trừ link hỏng và nhãn trạng thái.

Kế hoạch, prompt giao việc, QA và nghiệm thu của một task **không giữ lại** sau khi task xong: kết quả đã nằm trong code, test và nguồn chính. Chi tiết ở [mục 5](#5-thêm-chuyển-gộp-xóa-file).

Khi hai file mâu thuẫn, nguồn chính thắng; nếu code khác cả hai, code là thực tế và tài liệu phải được sửa trong cùng PR hoặc ghi vào [câu hỏi còn mở](../09-roadmap/cau-hoi-mo.md).

## 3. Đầu file và nhãn trạng thái

Mỗi file có đúng một tiêu đề `#`, ngay dưới là:

```markdown
> Cập nhật: dd/mm/yyyy
> Trạng thái: **APPROVED** — một câu giải thích (tùy chọn)
```

**Mọi file trong `docs/` phải có dòng trạng thái** (CI báo lỗi khi thiếu hoặc dùng giá trị khác):

| Trạng thái | Nghĩa |
|---|---|
| `DRAFT` | Đề xuất, chưa được Shan duyệt |
| `APPROVED` | Shan đã duyệt; **chưa chắc đã có code** |
| `FROZEN` | Đã duyệt và khóa phạm vi, đổi phải qua quyết định mới |
| `IMPLEMENTED` | Đã có trong code trên `develop` |
| `DEFERRED` | Đã duyệt nhưng hoãn, không làm lúc này |
| `AUDIT` | Báo cáo hoặc kiểm kê, không phải luật |
| `REFERENCE` | Mục lục, bản đồ, thuật ngữ, nhật ký, dữ liệu sinh từ code: không tự định nghĩa luật |

Không còn `SUPERSEDED` và `ARCHIVED`: tài liệu bị thay thì xóa ([mục 5](#5-thêm-chuyển-gộp-xóa-file)). Đổi trạng thái (ví dụ `APPROVED` → `IMPLEMENTED`) ghi một dòng vào [changelog](../decisions/changelog.md).

## 4. Viết nội dung

- Viết tiếng Việt; tên biến, đường dẫn, lệnh, ID giữ nguyên.
- Số liệu chưa qua mô phỏng cân bằng ghi rõ là **điểm xuất phát**.
- Việc chưa chốt ghi `> TODO: ...` tại chỗ **và** thêm vào [cau-hoi-mo.md](../09-roadmap/cau-hoi-mo.md).
- Không chép luật sang file khác; tóm tắt tối đa vài dòng rồi link nguồn chính.
- Link dùng đường dẫn tương đối. Link tới mục cụ thể dùng anchor theo tiêu đề; đổi tiêu đề thì tìm và sửa mọi anchor trỏ tới nó (`pnpm docs:check` sẽ báo).
- Nhân vật lịch sử: phần hư cấu ghi rõ là hư cấu; nguồn sử theo [sổ nguồn Campaign](../02-game-modes/campaign/history-sources.md).

## 5. Thêm, chuyển, gộp, xóa file

1. **Trước khi tạo file mới**, tìm trong [docs/README.md](../README.md) xem đã có nguồn chính chưa. Có rồi thì sửa file đó.
2. File mới đặt đúng domain, tên tiếng Việt không dấu kiểu `ten-chu-de.md`; không đánh số thứ tự mới trừ khi cả thư mục đang theo thứ tự đọc. Thêm một dòng vào `docs/README.md` nếu là nguồn chính.
3. **Chuyển hoặc đổi tên:** dùng `git mv`, sửa mọi link và comment trỏ tới, thêm một dòng vào [MOVED.md](../MOVED.md).
4. **Gộp:** chép nguyên nội dung file bị gộp vào cuối file đích dưới một mục ghi nguồn gốc và ngày gộp, rồi xóa file cũ và thêm dòng vào `MOVED.md`. Không bỏ quyết định nào.
5. **Hết hiệu lực thì xóa:** tài liệu bị thay, đề xuất bị bỏ, kế hoạch/QA/nghiệm thu của task đã xong đều xóa bằng `git rm`, sửa mọi link trỏ tới, và thêm một dòng vào bảng "Đã xóa" của [MOVED.md](../MOVED.md#đã-xóa) kèm lý do. Không chuyển vào thư mục lưu trữ: nội dung cũ vẫn xem được trong lịch sử git.
6. **Prompt giao việc** (cho Claude/Codex) không commit vào `docs/`; nếu cần commit để chia sẻ thì xóa ngay khi việc xong. Prompt tạo tranh/âm thanh dùng lại được thì giữ ở `06-art/prompts/` hoặc thư mục của domain.
7. **Báo cáo** chỉ commit bản tóm tắt `.md` cùng tệp nhỏ do script ghi. Dữ liệu thô (`.gz`, `.jsonl`, `.csv` lớn) không commit; ghi lệnh tạo lại trong báo cáo.

## 6. Kiểm tra tự động

`pnpm docs:check` (chạy trong CI và trong `pnpm test`) báo lỗi khi:

- link tương đối trỏ tới file không tồn tại, hoặc anchor không có trong file đích (hiểu cả thẻ `<a id="...">`);
- file trong `docs/` không có đúng một tiêu đề `#`;
- thiếu dòng `> Trạng thái: **...**`, hoặc dùng giá trị ngoài bảng ở mục 3;
- `docs/MOVED.md` có đường dẫn cũ (đã chuyển hoặc đã xóa) vẫn còn file, hoặc đường dẫn mới không tồn tại;
- code trong `src/`, `scripts/`, `tests/` nhắc tới `docs/....md` không tồn tại.

Link tới file bị `.gitignore` (log, dữ liệu tạm) không được dùng; ghi tên file trong backtick.

## 7. Hướng dẫn cho Claude/Codex

Trước khi cập nhật tài liệu hoặc làm task có dẫn tài liệu:

1. Mở [docs/README.md](../README.md), tìm nguồn chính (★) của chủ đề.
2. Prompt hoặc ghi chú nhắc đường dẫn không còn tồn tại thì tra [MOVED.md](../MOVED.md); không tạo lại file ở đường dẫn cũ.
3. Đọc dòng trạng thái: `DRAFT`/`APPROVED` chưa phải code; `AUDIT`, `REFERENCE` không phải luật.
4. Sửa đúng nguồn chính; không tạo file "v2", "mới", "final" song song. Thay đổi quyết định thì thêm dòng vào changelog, việc chưa chốt thêm vào câu hỏi còn mở.
5. Việc xong thì xóa kế hoạch, prompt giao việc, QA/nghiệm thu của việc đó ([mục 5](#5-thêm-chuyển-gộp-xóa-file)); kết quả ghi vào nguồn chính.
6. Chạy `pnpm check` (gồm `pnpm docs:check`) trước khi commit.
