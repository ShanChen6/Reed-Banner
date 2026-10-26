# Quy định viết và cập nhật tài liệu

> Cập nhật: 27/10/2026  
> Trạng thái: **APPROVED** — DOC-03, áp dụng cho mọi thay đổi trong `docs/`.

Quy định này giữ cho mỗi khái niệm có đúng một nguồn chính và cho người lẫn agent (Claude, Codex) tìm đúng file trước khi sửa. CI chạy `pnpm docs:check` ([scripts/check-docs.ts](../../scripts/check-docs.ts)) để kiểm phần máy kiểm được.

## 1. Cấu trúc thư mục

| Thư mục | Chứa gì |
|---|---|
| `00-overview/` | Tổng quan, thuật ngữ, quy định này |
| `01-gameplay/` | Luật trận: bàn cờ, lượt, tài nguyên, công thức, hiệu ứng, nguyên tố, AI, tiến trình |
| `02-game-modes/` | `README.md` tổng hợp mọi chế độ; mỗi chế độ một thư mục (`campaign/`, `dual-tower/`, `survival/`); `future/` cho đề xuất chưa triển khai |
| `03-characters/` | Danh sách nhân vật; `ky-nang/` (hiện hành ở `README.md`, phiên bản cũ ở `lich-su/`, dữ liệu sinh từ code ở `data/`) |
| `04-equipment/` | Trang bị, cường hóa |
| `05-ui-ux/` | `design-system/` (theme, token, spec), `screens/`, `campaign/` (UI riêng Campaign), `implementation/` |
| `06-art/` | Art bible, kế hoạch đồ họa, `prompts/` ảnh, ghi chú từng nhân vật |
| `07-architecture/` | Kiến trúc, hạ tầng, server |
| `09-roadmap/` | Lộ trình dự án, câu hỏi còn mở |
| `decisions/` | Nhật ký quyết định (`changelog.md`) |
| `audits/`, `reports/` | Bằng chứng: audit, mô phỏng, dữ liệu. **Không đổi đường dẫn**, script đọc/ghi thẳng vào đây |
| `archive/` | Kế hoạch đã làm, bản sao mô tả PR, task docs cũ |

Chưa có thư mục cho một chủ đề mới thì đặt vào domain gần nhất và ghi lý do trong PR; không tạo thư mục rỗng.

## 2. Ba loại tài liệu

- **Nguồn chính (canonical):** định nghĩa luật, số liệu, contract. Được đánh dấu ★ trong [docs/README.md](../README.md). Mỗi khái niệm chỉ có một.
- **Tham chiếu (reference):** prompt, dữ liệu sinh từ code, hướng dẫn người chơi. Được dẫn từ nguồn chính, không định nghĩa luật mới.
- **Lịch sử (history):** báo cáo, QA, kế hoạch, task đã làm. Không sửa nội dung sau khi xong, trừ link hỏng và nhãn trạng thái.

Khi hai file mâu thuẫn, nguồn chính thắng; nếu code khác cả hai, code là thực tế và tài liệu phải được sửa trong cùng PR hoặc ghi vào [câu hỏi còn mở](../09-roadmap/cau-hoi-mo.md).

## 3. Đầu file và nhãn trạng thái

Mỗi file có đúng một tiêu đề `#`, ngay dưới là:

```markdown
> Cập nhật: dd/mm/yyyy
> Trạng thái: **APPROVED** — một câu giải thích (tùy chọn)
```

Giá trị trạng thái (CI từ chối giá trị khác):

| Trạng thái | Nghĩa |
|---|---|
| `DRAFT` | Đề xuất, chưa được Shan duyệt |
| `APPROVED` | Shan đã duyệt; **chưa chắc đã có code** |
| `FROZEN` | Đã duyệt và khóa phạm vi, đổi phải qua quyết định mới |
| `IMPLEMENTED` | Đã có trong code trên `develop` |
| `DEFERRED` | Đã duyệt nhưng hoãn, không làm lúc này |
| `SUPERSEDED` | Đã bị file khác thay; dòng trạng thái phải link tới file thay thế |
| `ARCHIVED` | Lưu để truy vết, không còn hiệu lực |
| `AUDIT` | Báo cáo kiểm kê, không phải luật |

File cũ chưa có dòng trạng thái thì thêm khi sửa tới. Đổi trạng thái (ví dụ `APPROVED` → `IMPLEMENTED`) ghi một dòng vào [changelog](../decisions/changelog.md).

## 4. Viết nội dung

- Viết tiếng Việt; tên biến, đường dẫn, lệnh, ID giữ nguyên.
- Số liệu chưa qua mô phỏng cân bằng ghi rõ là **điểm xuất phát**.
- Việc chưa chốt ghi `> TODO: ...` tại chỗ **và** thêm vào [cau-hoi-mo.md](../09-roadmap/cau-hoi-mo.md).
- Không chép luật sang file khác; tóm tắt tối đa vài dòng rồi link nguồn chính.
- Link dùng đường dẫn tương đối. Link tới mục cụ thể dùng anchor theo tiêu đề; đổi tiêu đề thì tìm và sửa mọi anchor trỏ tới nó (`pnpm docs:check` sẽ báo).
- Nhân vật lịch sử: phần hư cấu ghi rõ là hư cấu; nguồn sử theo [sổ nguồn Campaign](../02-game-modes/campaign/history-sources.md).

## 5. Thêm, chuyển, gộp, bỏ file

1. **Trước khi tạo file mới**, tìm trong [docs/README.md](../README.md) xem đã có nguồn chính chưa. Có rồi thì sửa file đó.
2. File mới đặt đúng domain, tên tiếng Việt không dấu kiểu `ten-chu-de.md`; không đánh số thứ tự mới trừ khi cả thư mục đang theo thứ tự đọc. Thêm một dòng vào `docs/README.md` nếu là nguồn chính.
3. **Chuyển hoặc đổi tên:** dùng `git mv`, sửa mọi link và comment trỏ tới, thêm một dòng vào [MOVED.md](../MOVED.md).
4. **Gộp:** chép nguyên nội dung file bị gộp vào cuối file đích dưới một mục ghi nguồn gốc và ngày gộp, rồi xóa file cũ và thêm dòng vào `MOVED.md`. Không bỏ quyết định nào.
5. **Bỏ hiệu lực:** đổi nhãn sang `SUPERSEDED` hoặc chuyển vào `archive/` với nhãn `ARCHIVED`. Không xóa tài liệu lịch sử.
6. Prompt giao việc (cho Claude/Codex) đặt trong thư mục `prompts/` của domain; chạy xong thì không sửa nội dung, chỉ thêm nhãn trạng thái.

## 6. Kiểm tra tự động

`pnpm docs:check` (chạy trong CI và trong `pnpm test`) báo lỗi khi:

- link tương đối trỏ tới file không tồn tại, hoặc anchor không có trong file đích (hiểu cả thẻ `<a id="...">`);
- file trong `docs/` không có đúng một tiêu đề `#`;
- dòng `> Trạng thái: **...**` dùng giá trị ngoài bảng ở mục 3;
- `docs/MOVED.md` có đường dẫn cũ vẫn còn file, hoặc đường dẫn mới không tồn tại;
- code trong `src/`, `scripts/`, `tests/` nhắc tới `docs/....md` không tồn tại.

Link tới file bị `.gitignore` (log, dữ liệu tạm) không được dùng; ghi tên file trong backtick.

## 7. Hướng dẫn cho Claude/Codex

Trước khi cập nhật tài liệu hoặc làm task có dẫn tài liệu:

1. Mở [docs/README.md](../README.md), tìm nguồn chính (★) của chủ đề.
2. Prompt hoặc ghi chú nhắc đường dẫn không còn tồn tại thì tra [MOVED.md](../MOVED.md); không tạo lại file ở đường dẫn cũ.
3. Đọc dòng trạng thái: `DRAFT`/`APPROVED` chưa phải code; `SUPERSEDED`/`ARCHIVED` không dùng làm luật hiện hành.
4. Sửa đúng nguồn chính; không tạo file "v2", "mới", "final" song song. Thay đổi quyết định thì thêm dòng vào changelog, việc chưa chốt thêm vào câu hỏi còn mở.
5. Không đổi đường dẫn trong `docs/reports/`, `docs/audits/`.
6. Chạy `pnpm docs:check` trước khi commit.
