<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Tài liệu

Trước khi đọc hoặc sửa tài liệu trong `docs/`, làm theo [quy định tài liệu](docs/00-overview/quy-dinh-tai-lieu.md):

1. Tìm nguồn chính (★) của chủ đề trong [docs/README.md](docs/README.md) và sửa đúng file đó; không tạo file song song.
2. Đường dẫn cũ trong prompt hoặc ghi chú (ví dụ `docs/design/09-che-do-choi.md`) tra ở [docs/MOVED.md](docs/MOVED.md).
3. Đọc dòng `> Trạng thái:`; `DRAFT`/`APPROVED` chưa chắc có code, `AUDIT`/`REFERENCE` không phải luật.
4. Việc xong thì xóa kế hoạch, prompt giao việc, QA và nghiệm thu của việc đó; ghi vào bảng "Đã xóa" của `docs/MOVED.md`. Không tạo thư mục lưu trữ.
5. Chạy `pnpm docs:check` trước khi commit.

## Kiểm tra trước khi commit

Chạy `pnpm check` (lint, typecheck, docs, test). Sửa giao diện hoặc luồng màn thì chạy thêm `pnpm e2e`. Quy trình đầy đủ và nơi đặt test mới: [quy trình test](docs/07-architecture/quy-trinh-test.md).
