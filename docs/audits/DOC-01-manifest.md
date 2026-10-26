# DOC-01 — Kiểm kê toàn bộ Markdown và bảng ánh xạ đường dẫn

> Cập nhật: 27/10/2026  
> Trạng thái: **AUDIT — CHƯA DI CHUYỂN FILE** (bổ sung cho bản audit sơ bộ ở PR #183)  
> Cơ sở: `develop` commit `e3ef80b` (sau PR #183), `git ls-files '*.md'` = **182 file** (2 ở gốc repo, 180 trong `docs/`), ~25.800 dòng.

PR #183 đã chốt khung thư mục đích nhưng tự ghi là chưa có manifest đầy đủ và chưa kiểm link. Bản này hoàn tất các mục còn mở trong mục 7 của nó: manifest từng file, kiểm toàn bộ link/anchor, các chỗ code và script trỏ vào `docs/`, cụm trùng lặp, và ánh xạ cũ → mới cho từng file. Không đổi luật chơi, không đổi file nào trong repo.

## 1. Tóm tắt

| Chỉ số | Kết quả |
|---|---|
| File Markdown | 182 (71 CANONICAL · 41 REFERENCE · 70 HISTORY) |
| Link tương đối trong Markdown | 684 link, **23 hỏng**: 3 file thiếu, 3 log bị `.gitignore`, 17 anchor sai do đổi tên tiêu đề |
| File không có link nào trỏ tới | 59 (chủ yếu là prompt đã chạy, bằng chứng task Song Tháp, `design/v4-2/` QA, `theme.md`) |
| Code/script nhắc đường dẫn docs | 53 file `src/` (chỉ comment) + 27 file `scripts/`/`tests/`; trong đó 13 script đọc/ghi thật vào `docs/reports/…` và `docs/design/data` |
| Đường dẫn được nhắc trong prompt | `campaign-v2/ui/09-…` 18 lần, `campaign-v2/design-freeze.md` 12, `design/09-che-do-choi.md` 11, `campaign-v2/history-sources.md` 9, `campaign-v2/warlord-matrix.md` 7 |
| PR đang mở | Không có (kiểm 27/10), nên di chuyển không đụng nhánh nào |

## 2. Quy ước phân loại dùng trong bảng

- **Loại:** `CANONICAL` (nguồn sự thật duy nhất của một khái niệm), `REFERENCE` (dữ liệu tra cứu, prompt, bảng sinh từ code), `HISTORY` (báo cáo, QA, kế hoạch, task đã làm; giữ để truy vết).
- **Trạng thái:** `DRAFT`, `APPROVED`, `IMPLEMENTED`, `DEFERRED`, `SUPERSEDED`, `ARCHIVED`, `GENERATED`. `APPROVED` không có nghĩa là đã có code.
- Trạng thái được suy từ dòng `> Trạng thái`, task board và lịch sử PR; chỗ nào chưa chắc ghi `?` và nằm trong mục 7 (câu hỏi cho Shan).

## 3. Cụm trùng lặp và nguồn chính đề xuất

| # | Khái niệm | File đang chồng nhau | Nguồn chính | Cách xử lý ở DOC-02 |
|---|---|---|---|---|
| D1 | Luật Sinh tồn | `design/09` §4 (chép gần nguyên luật V1.1) · `survival-v1.1/02-rules-state-machine.md` | `survival/02-rules-state-machine.md` | 09 giữ 3–5 dòng tóm tắt + link; không đổi nội dung luật |
| D2 | Luật Song Tháp | `design/09` §3.1 · `dual-tower/00-02-rules.md` · `player-help.md` · `game-modes/06` (tương lai) | `dual-tower/00-02-rules.md` (luật), `player-help.md` (người chơi) | 09 giữ tóm tắt; `game-modes/06` gắn nhãn DRAFT |
| D3 | Kỹ năng | `design/06`, `12`, `20`, `21`, `22`, `23`, `data/*`, `reports/2026-10-22-combo.md`, `plans/*` | `22-ky-nang-chase.md` + bảng giá của `23` | 20, 21 → lịch sử; 06 giữ mô hình chung; 12 giữ làm preset AI; 23 gộp vào 22 |
| D4 | Task board Campaign UI | `campaign-v2/ui/TASK-BOARD.md` · `10-world-atlas-task-board.md` | một `task-board.md` | Gộp; 10 đã tự ghi là thay phần MAP của TASK-BOARD |
| D5 | Prompt MAP | `MAP-01/02/03`, `MAP-ART-02` mỗi task có 2 bản (sách mở cũ và World Atlas) | Bản World Atlas | Bản sách mở gắn `SUPERSEDED` |
| D6 | Màu, token, art bible | `design/13` (bảng màu art) · `theme.md` (token CSS) · `ui-design-system/game-mode-ui-spec.md` (token đề xuất) · art bible riêng ở `campaign-v2/ui/08`, `game-modes/04`, `11` | `theme.md` cho token code, `13` cho art | Spec UI phải map vào token của `theme.md`; art bible riêng từng mode giữ nhưng link về 13 |
| D7 | Prompt ảnh nhân vật | `design/16`, `18` · `design/v4-2/01–04, 09, 12` (75 tướng × 6 khung) · bản sao trong `/mnt/project-files/art/prompts/` | `design/v4-2/` (Shan chốt) | 16, 18 gắn `SUPERSEDED` |
| D8 | Lộ trình | `lo-trinh.md` · `ui-design-system/implementation-roadmap.md` · `game-modes/07` · `campaign-v2/ui/04` · `design/15` (Đ0–Đ9) | `lo-trinh.md` cho cấp dự án | Mỗi lộ trình domain giữ chỗ, `lo-trinh.md` chỉ link |
| D9 | Audit docs | `audits/DOC-01-…` (PR #183) · `campaign-v2/ui/07-don-dep-docs-cu.md` (DOC-00) · báo cáo này | Báo cáo này (thay nội dung file DOC-01 trong repo) | 07 → archive |
| D10 | Bản sao mô tả PR | `art/nguyen-bac-pr.md`, `plans/2026-10-22-chase-pr.md`, `plans/2026-10-22-checkpoint-pr.md` | PR trên GitHub | → `archive/pr/` |

Không trùng (đã kiểm): `campaign-v2/design-freeze.md` (luật Campaign) và `campaign-v2/ui/09-…` (freeze giao diện) là hai phạm vi khác nhau.

## 4. Link hỏng cần sửa ở DOC-02

| File:dòng | Link | Lý do |
|---|---|---|
| `campaign-v2/ui/audio-todo/README.md:32–34` | `01-voice-bible.md`, `02-architecture-and-assets.md`, `03-tts-prompts-and-budget.md` | File chưa từng được tạo; đổi thành chữ thường "(chưa viết)" |
| `reports/2026-10-22-tinh-than-F.md:124,128`, `tinh-than-ai.md:241` | `*.log` | Bị `.gitignore` (`*.log`); bỏ link, giữ tên file |
| `cau-hoi-mo.md:22`, `design/06:83` | `14-nhan-vat.md#8-cân-bằng` | Tiêu đề nay là "8. Cân bằng lịch sử trước cải tổ 22/10/2026" |
| `design/02:46`, `design/03:20`, `design/06:11` | `#5-tinh-thần-riêng-từng-tướng` | Tiêu đề nay là "5. Tinh thần F (riêng từng tướng, hiện hành)" |
| `design/14:212`, `lo-trinh.md:24,25,35`, `nhat-ky-thay-doi.md:102,115,118,121,124,128,131,144` | Các anchor `09-che-do-choi.md#2x/3x/4x-…-chờ-shan-duyệt` | Tiêu đề mục 2–4 của 09 đã đổi số và chữ sau CAMP-08.04 |

`design/data/ky-nang-dong-hanh.md` có 60 anchor `#haVan`… trỏ tới thẻ `<a id>`, hợp lệ. Trình kiểm link ở DOC-03 phải hiểu loại anchor này.

Đường dẫn được nhắc nhưng không tồn tại (không phải link, chỉ là chữ): `docs/co-lau-design.md` (đã tách ở PR #1, giữ vì là nhật ký), `docs/campaign-v2/README.md` (narrative-bible đề nghị tạo, chưa ai tạo), `docs/game-modes/08-binh-phap-design-freeze.md` và `13-liet-truyen-design-freeze.md` (prompt BP-00/LT-00 sẽ tạo; **số 08 sẽ trùng với `08-liet-truyen-gdd.md`**, nên ở chỗ mới đặt `binh-phap-design-freeze.md` không số).

## 5. Ràng buộc khi di chuyển

1. **Không di chuyển `docs/reports/` và `docs/audits/`.** 13 script (`scripts/task2-*.ts`, `task3-*.ts`, `task4-audit.ts`, `spirit-f-audit.ts`, `baseline-skills.ts`, `combo-*.ts`, `verify-skill-contracts.ts`) đọc/ghi file thật theo đường dẫn này.
2. `scripts/export-skill-chase.ts` ghi vào `docs/design/data`: khi chuyển thư mục phải đổi biến `dir` (chỉ đường dẫn, không đổi logic).
3. 53 file trong `src/` nhắc `docs/design/…`, `docs/campaign-v2/…`, `docs/dual-tower/…`, `docs/tech/…` trong comment. DOC-02 cập nhật cùng PR bằng thay chuỗi; không đụng dòng code nào khác (đã kiểm: không chỗ nào trong `src/` đọc đường dẫn docs lúc chạy).
4. **Prompt cũ của Shan** (trong repo và trong `/mnt/project-files/art/prompts/`, ghi chú Codex…) vẫn trỏ đường dẫn cũ. Không sửa nội dung prompt đã chạy; thay vào đó tạo `docs/MOVED.md` là bảng cũ → mới (sinh từ mục 6), và hướng dẫn agent ở DOC-03 bảo: gặp đường dẫn cũ thì tra `MOVED.md`. Prompt chưa chạy (`game-modes/prompts/*`) thì sửa đường dẫn luôn.
5. Di chuyển bằng `git mv` để giữ lịch sử từng file (`git log --follow`). Gộp file (23 → 22, task board) thì file bị gộp để lại nội dung cũ ở cuối file đích trong mục "Lịch sử", không xóa mất quyết định.
6. Tách DOC-02 thành nhiều commit theo domain trong một PR (hoặc vài PR nếu Shan muốn): gameplay+characters+equipment → modes → UI/art → roadmap/decisions/archive → sửa link + comment code + `MOVED.md`.

## 6. Manifest đầy đủ và ánh xạ cũ → mới

Cột "Trỏ tới" = số link Markdown / số file code trỏ vào file đó. Đường dẫn đích theo khung thư mục của PR #183 (`00-overview/` … `09-roadmap/`, `decisions/`, `archive/`). Thư mục `08-testing/` chưa có file nào thuộc về, nên không tạo thư mục rỗng.

| Đường dẫn hiện tại | Dòng | Loại | Trạng thái | Đường dẫn mới | Trỏ tới | Ghi chú |
|---|---:|---|---|---|---:|---|
| `AGENTS.md` | 10 | CANONICAL | — | _giữ nguyên_ | 0/0 | Giữ nguyên |
| `README.md` | 42 | CANONICAL | — | _giữ nguyên_ | 0/0 | Giữ nguyên |
| `docs/README.md` | 122 | CANONICAL | APPROVED | _giữ nguyên_ | 2/0 | Viết lại thành bản đồ domain |
| `docs/art/nguyen-bac-pr.md` | 21 | HISTORY | ARCHIVED | `docs/archive/pr/2026-10-24-nguyen-bac.md` | 0/0 | Bản sao mô tả PR |
| `docs/art/nguyen-bac.md` | 59 | REFERENCE | IMPLEMENTED | `docs/06-art/nhan-vat/nguyen-bac.md` | 1/0 |  |
| `docs/audits/CAMP-00.01-campaign-audit.md` | 231 | HISTORY | — | _giữ nguyên_ | 1/0 | Giữ nguyên chỗ |
| `docs/audits/DOC-01-docs-structure-audit.md` | 128 | HISTORY | — | _giữ nguyên_ | 1/0 | Giữ nguyên chỗ |
| `docs/campaign-v2/balance-report.md` | 235 | HISTORY | IMPLEMENTED | `docs/02-game-modes/campaign/balance-report.md` | 1/1 | Bằng chứng QA/cân bằng |
| `docs/campaign-v2/chapter-2-sources.md` | 45 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/campaign/chapter-2-sources.md` | 0/0 |  |
| `docs/campaign-v2/chapter-3-sources.md` | 63 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/campaign/chapter-3-sources.md` | 0/1 |  |
| `docs/campaign-v2/contracts.md` | 111 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/campaign/contracts.md` | 0/0 |  |
| `docs/campaign-v2/design-freeze.md` | 272 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/campaign/design-freeze.md` | 9/1 |  |
| `docs/campaign-v2/final-acceptance.md` | 159 | HISTORY | IMPLEMENTED | `docs/02-game-modes/campaign/final-acceptance.md` | 2/0 | Bằng chứng QA/cân bằng |
| `docs/campaign-v2/history-sources.md` | 122 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/campaign/history-sources.md` | 10/4 |  |
| `docs/campaign-v2/mission-matrix.md` | 71 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/campaign/mission-matrix.md` | 2/0 |  |
| `docs/campaign-v2/narrative-bible.md` | 145 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/campaign/narrative-bible.md` | 3/0 |  |
| `docs/campaign-v2/qa-chapter-1.md` | 52 | HISTORY | IMPLEMENTED | `docs/02-game-modes/campaign/qa-chapter-1.md` | 0/0 | Bằng chứng QA/cân bằng |
| `docs/campaign-v2/recruits.md` | 59 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/campaign/recruits.md` | 0/0 |  |
| `docs/campaign-v2/regression-report.md` | 93 | HISTORY | IMPLEMENTED | `docs/02-game-modes/campaign/regression-report.md` | 1/0 | Bằng chứng QA/cân bằng |
| `docs/campaign-v2/reset-policy.md` | 66 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/campaign/reset-policy.md` | 2/0 |  |
| `docs/campaign-v2/ui/01-hien-trang.md` | 53 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/01-hien-trang.md` | 1/0 |  |
| `docs/campaign-v2/ui/02-giao-dien-nguoi-choi.md` | 77 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/02-giao-dien-nguoi-choi.md` | 1/0 |  |
| `docs/campaign-v2/ui/03-contract-va-kien-truc.md` | 101 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/03-contract-va-kien-truc.md` | 1/0 |  |
| `docs/campaign-v2/ui/04-lo-trinh-tung-buoc.md` | 69 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/04-lo-trinh-tung-buoc.md` | 1/0 |  |
| `docs/campaign-v2/ui/05-asset-prompts.md` | 74 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/05-asset-prompts.md` | 1/0 |  |
| `docs/campaign-v2/ui/06-nghiem-thu.md` | 48 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/06-nghiem-thu.md` | 1/0 |  |
| `docs/campaign-v2/ui/07-don-dep-docs-cu.md` | 44 | HISTORY | SUPERSEDED | `docs/archive/campaign-ui/07-don-dep-docs-cu.md` | 1/0 | Task DOC-00, bị DOC-01/02 thay |
| `docs/campaign-v2/ui/08-atlas-sach-mo-asset-production.md` | 99 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/08-atlas-sach-mo-asset-production.md` | 0/0 |  |
| `docs/campaign-v2/ui/09-chot-giao-dien-ban-do-toan-canh.md` | 129 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/09-chot-giao-dien-ban-do-toan-canh.md` | 0/0 |  |
| `docs/campaign-v2/ui/10-world-atlas-task-board.md` | 26 | HISTORY | SUPERSEDED | gộp vào `docs/05-ui-ux/campaign/task-board.md` | 0/0 |  |
| `docs/campaign-v2/ui/11-map-00-audit.md` | 52 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/11-map-00-audit.md` | 0/0 |  |
| `docs/campaign-v2/ui/README.md` | 43 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/README.md` | 3/0 |  |
| `docs/campaign-v2/ui/TASK-BOARD.md` | 21 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/task-board.md` | 0/0 | Gộp 10-world-atlas-task-board vào |
| `docs/campaign-v2/ui/audio-todo/README.md` | 34 | CANONICAL | DEFERRED | `docs/05-ui-ux/campaign/audio-todo/README.md` | 2/0 | 3 link tới file chưa tồn tại |
| `docs/campaign-v2/ui/polish-v2/QA-P10.md` | 57 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/QA-P10.md` | 1/0 |  |
| `docs/campaign-v2/ui/polish-v2/README.md` | 69 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/README.md` | 0/0 |  |
| `docs/campaign-v2/ui/polish-v2/prompts/P00.md` | 25 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/prompts/P00.md` | 0/0 | Prompt đã chạy (PR #163–#171) |
| `docs/campaign-v2/ui/polish-v2/prompts/P01.md` | 25 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/prompts/P01.md` | 0/0 | Prompt đã chạy (PR #163–#171) |
| `docs/campaign-v2/ui/polish-v2/prompts/P02.md` | 25 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/prompts/P02.md` | 0/0 | Prompt đã chạy (PR #163–#171) |
| `docs/campaign-v2/ui/polish-v2/prompts/P03.md` | 25 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/prompts/P03.md` | 0/0 | Prompt đã chạy (PR #163–#171) |
| `docs/campaign-v2/ui/polish-v2/prompts/P04.md` | 10 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/prompts/P04.md` | 0/0 | Prompt đã chạy (PR #163–#171) |
| `docs/campaign-v2/ui/polish-v2/prompts/P05.md` | 10 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/prompts/P05.md` | 0/0 | Prompt đã chạy (PR #163–#171) |
| `docs/campaign-v2/ui/polish-v2/prompts/P06.md` | 25 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/prompts/P06.md` | 0/0 | Prompt đã chạy (PR #163–#171) |
| `docs/campaign-v2/ui/polish-v2/prompts/P07.md` | 25 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/prompts/P07.md` | 0/0 | Prompt đã chạy (PR #163–#171) |
| `docs/campaign-v2/ui/polish-v2/prompts/P08.md` | 10 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/prompts/P08.md` | 0/0 | Prompt đã chạy (PR #163–#171) |
| `docs/campaign-v2/ui/polish-v2/prompts/P09.md` | 10 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/prompts/P09.md` | 0/0 | Prompt đã chạy (PR #163–#171) |
| `docs/campaign-v2/ui/polish-v2/prompts/P10.md` | 10 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/polish-v2/prompts/P10.md` | 0/0 | Prompt đã chạy (PR #163–#171) |
| `docs/campaign-v2/ui/prompts/MAP-00-world-atlas-audit.md` | 26 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/prompts/MAP-00-world-atlas-audit.md` | 0/0 | Prompt đã chạy |
| `docs/campaign-v2/ui/prompts/MAP-01-atlas-six-chapters.md` | 15 | HISTORY | SUPERSEDED | `docs/05-ui-ux/campaign/prompts/MAP-01-atlas-six-chapters.md` | 0/0 | Bản "sách mở" cũ, bị World Atlas (09) thay |
| `docs/campaign-v2/ui/prompts/MAP-01-world-atlas-shell.md` | 26 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/prompts/MAP-01-world-atlas-shell.md` | 0/0 | Prompt đã chạy |
| `docs/campaign-v2/ui/prompts/MAP-02-regional-map.md` | 15 | HISTORY | SUPERSEDED | `docs/05-ui-ux/campaign/prompts/MAP-02-regional-map.md` | 0/0 | Bản "sách mở" cũ, bị World Atlas (09) thay |
| `docs/campaign-v2/ui/prompts/MAP-02-world-strongholds.md` | 26 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/prompts/MAP-02-world-strongholds.md` | 0/0 | Prompt đã chạy |
| `docs/campaign-v2/ui/prompts/MAP-03-atlas-integration.md` | 13 | HISTORY | SUPERSEDED | `docs/05-ui-ux/campaign/prompts/MAP-03-atlas-integration.md` | 0/0 | Bản "sách mở" cũ, bị World Atlas (09) thay |
| `docs/campaign-v2/ui/prompts/MAP-03-world-atlas-flow.md` | 26 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/prompts/MAP-03-world-atlas-flow.md` | 0/0 | Prompt đã chạy |
| `docs/campaign-v2/ui/prompts/MAP-ART-00-world-map-production.md` | 26 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/prompts/MAP-ART-00-world-map-production.md` | 0/0 | Prompt đã chạy |
| `docs/campaign-v2/ui/prompts/MAP-ART-01-illustrated-map-assets.md` | 28 | HISTORY | SUPERSEDED | `docs/05-ui-ux/campaign/prompts/MAP-ART-01-illustrated-map-assets.md` | 0/0 | Bản "sách mở" cũ, bị World Atlas (09) thay |
| `docs/campaign-v2/ui/prompts/MAP-ART-02-integrate-book-atlas.md` | 23 | HISTORY | SUPERSEDED | `docs/05-ui-ux/campaign/prompts/MAP-ART-02-integrate-book-atlas.md` | 0/0 | Bản "sách mở" cũ, bị World Atlas (09) thay |
| `docs/campaign-v2/ui/prompts/MAP-ART-02-world-map-overlay.md` | 26 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/prompts/MAP-ART-02-world-map-overlay.md` | 0/0 | Prompt đã chạy |
| `docs/campaign-v2/ui/prompts/MAP-QA-01-world-atlas.md` | 26 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/prompts/MAP-QA-01-world-atlas.md` | 0/0 | Prompt đã chạy |
| `docs/campaign-v2/ui/prompts/UI-01-dialogue-player.md` | 30 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/prompts/UI-01-dialogue-player.md` | 0/0 | Prompt đã chạy |
| `docs/campaign-v2/ui/prompts/UI-02-m06-diplomacy.md` | 15 | HISTORY | IMPLEMENTED | `docs/05-ui-ux/campaign/prompts/UI-02-m06-diplomacy.md` | 0/0 | Prompt đã chạy |
| `docs/campaign-v2/warlord-matrix.md` | 62 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/campaign/warlord-matrix.md` | 4/0 |  |
| `docs/cau-hoi-mo.md` | 83 | CANONICAL | APPROVED | `docs/09-roadmap/cau-hoi-mo.md` | 4/0 | Ngày cập nhật 20/10 đã cũ |
| `docs/design/00-tong-quan.md` | 29 | CANONICAL | APPROVED | `docs/00-overview/tong-quan.md` | 2/0 | Sửa dòng trạng thái "chưa triển khai code" |
| `docs/design/01-ban-co.md` | 119 | CANONICAL | IMPLEMENTED | `docs/01-gameplay/ban-co.md` | 6/6 |  |
| `docs/design/02-tran-dau.md` | 73 | CANONICAL | IMPLEMENTED | `docs/01-gameplay/tran-dau.md` | 7/2 | Sửa anchor sang 03#5 |
| `docs/design/03-tai-nguyen-cong-thuc.md` | 110 | CANONICAL | IMPLEMENTED | `docs/01-gameplay/tai-nguyen-cong-thuc.md` | 14/2 | Tinh thần F ở §5 |
| `docs/design/04-hieu-ung.md` | 35 | CANONICAL | IMPLEMENTED | `docs/01-gameplay/hieu-ung.md` | 4/1 |  |
| `docs/design/05-nguyen-to.md` | 83 | CANONICAL | IMPLEMENTED | `docs/01-gameplay/nguyen-to.md` | 5/4 |  |
| `docs/design/06-nhan-vat-ky-nang.md` | 142 | REFERENCE | SUPERSEDED (một phần) | `docs/03-characters/ky-nang/mo-hinh-nhan-vat.md` | 10/3 | Mô hình chung còn đúng; bộ chiêu đã bị 20→21→22 thay |
| `docs/design/07-trang-bi.md` | 137 | CANONICAL | IMPLEMENTED | `docs/04-equipment/trang-bi.md` | 7/3 |  |
| `docs/design/08-tien-trinh-kinh-te.md` | 50 | CANONICAL | IMPLEMENTED | `docs/01-gameplay/tien-trinh-kinh-te.md` | 8/2 |  |
| `docs/design/09-che-do-choi.md` | 225 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/README.md` | 31/10 | Giữ tóm tắt; §3 Tháp, §4 Sinh tồn rút gọn, link sang nguồn riêng |
| `docs/design/10-ai.md` | 53 | CANONICAL | IMPLEMENTED | `docs/01-gameplay/ai.md` | 4/5 | scripts/fixtures nhắc path trong comment |
| `docs/design/11-giao-dien.md` | 82 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/screens/battle.md` | 3/1 |  |
| `docs/design/12-ky-nang-nhan-vat-chinh.md` | 199 | REFERENCE | IMPLEMENTED (preset AI) | `docs/03-characters/ky-nang/preset-ai-he-cu.md` | 6/3 | Chỉ còn dùng cho preset AI chiến dịch |
| `docs/design/13-hinh-anh.md` | 159 | CANONICAL | APPROVED | `docs/06-art/art-bible.md` | 22/2 | Bảng màu art; token CSS lấy theo theme.md |
| `docs/design/14-nhan-vat.md` | 217 | CANONICAL | IMPLEMENTED | `docs/03-characters/danh-sach-nhan-vat.md` | 19/3 | §8 đổi tên → sửa 2 anchor |
| `docs/design/15-ke-hoach-do-hoa.md` | 356 | CANONICAL | APPROVED (một phần) | `docs/06-art/ke-hoach-do-hoa.md` | 19/2 | Lộ trình Đ0–Đ9 |
| `docs/design/16-prompt-nhan-vat.md` | 745 | REFERENCE | SUPERSEDED | `docs/06-art/prompts/nhan-vat.md` | 7/0 | Bộ đang dùng là v4-2 |
| `docs/design/17-prompt-do-hoa.md` | 1013 | REFERENCE | APPROVED | `docs/06-art/prompts/do-hoa.md` | 4/0 |  |
| `docs/design/18-prompt-tu-the.md` | 1473 | REFERENCE | SUPERSEDED | `docs/06-art/prompts/tu-the.md` | 4/0 | Bộ đang dùng là v4-2 |
| `docs/design/19-codex-do-hoa.md` | 287 | REFERENCE | APPROVED | `docs/06-art/prompts/codex-rig-nhan-vat.md` | 1/0 |  |
| `docs/design/20-cai-to-ky-nang.md` | 134 | HISTORY | SUPERSEDED | `docs/03-characters/ky-nang/lich-su/20-cai-to-ky-nang.md` | 15/0 | Bị 21, 22 thay |
| `docs/design/21-combo-dong-doi.md` | 79 | HISTORY | SUPERSEDED | `docs/03-characters/ky-nang/lich-su/21-combo-dong-doi.md` | 10/0 | Bị 22 thay |
| `docs/design/22-ky-nang-chase.md` | 68 | CANONICAL | IMPLEMENTED | `docs/03-characters/ky-nang/README.md` | 10/0 | Nguồn kỹ năng hiện hành; nhận phần giá Thủ thành từ 23 |
| `docs/design/23-can-bang-f.md` | 19 | HISTORY | IMPLEMENTED | gộp vào `docs/03-characters/ky-nang/README.md` | 3/0 | Bảng giá chuyển vào 22; file cũ thành mục lịch sử |
| `docs/design/data/ky-nang-dong-hanh.md` | 1271 | REFERENCE | IMPLEMENTED | `docs/03-characters/ky-nang/data/ky-nang-dong-hanh.md` | 1/0 | Bảng kỹ năng 60 nhân vật kèm, dùng anchor HTML |
| `docs/design/data/skill-chase-v3.md` | 82 | REFERENCE | GENERATED | `docs/03-characters/ky-nang/data/skill-chase-v3.md` | 1/0 | Sinh bằng scripts/export-skill-chase.ts → đổi biến dir |
| `docs/design/equipment-enhancement-todo.md` | 33 | CANONICAL | DEFERRED | `docs/04-equipment/cuong-hoa-todo.md` | 4/1 |  |
| `docs/design/v4-2/00-bao-cao.md` | 41 | REFERENCE | APPROVED | `docs/06-art/prompts/v4-2/00-bao-cao.md` | 0/0 | Giữ tên file |
| `docs/design/v4-2/01-chinh-lich-su-su-quan.md` | 1263 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/01-chinh-lich-su-su-quan.md` | 3/0 | Giữ tên file |
| `docs/design/v4-2/02-tuong-thuong-kim-moc-thuy.md` | 1193 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/02-tuong-thuong-kim-moc-thuy.md` | 3/0 | Giữ tên file |
| `docs/design/v4-2/03-tuong-thuong-hoa-tho-loi-phong.md` | 1589 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/03-tuong-thuong-hoa-tho-loi-phong.md` | 3/0 | Giữ tên file |
| `docs/design/v4-2/04-cung-thu-sat-thu.md` | 929 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/04-cung-thu-sat-thu.md` | 1/0 | Giữ tên file |
| `docs/design/v4-2/05-weapon-skill-conflict-audit.md` | 134 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/05-weapon-skill-conflict-audit.md` | 0/0 | Giữ tên file |
| `docs/design/v4-2/06-weapon-reference-sheets-v1.md` | 159 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/06-weapon-reference-sheets-v1.md` | 0/0 | Giữ tên file |
| `docs/design/v4-2/07-medium-weapon-design-proposals.md` | 362 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/07-medium-weapon-design-proposals.md` | 3/0 | Giữ tên file |
| `docs/design/v4-2/08-new-professions-14-skill-kits.md` | 481 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/08-new-professions-14-skill-kits.md` | 16/0 | Giữ tên file |
| `docs/design/v4-2/09-14-heroes-character-and-frame-prompts-v4-3.md` | 817 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/09-14-heroes-character-and-frame-prompts-v4-3.md` | 3/0 | Giữ tên file |
| `docs/design/v4-2/10-v4-3-art-and-skill-qa-report.md` | 67 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/10-v4-3-art-and-skill-qa-report.md` | 0/0 | Giữ tên file |
| `docs/design/v4-2/11-four-historical-heroes-skill-design.md` | 177 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/11-four-historical-heroes-skill-design.md` | 4/0 | Giữ tên file |
| `docs/design/v4-2/12-four-historical-heroes-character-prompts.md` | 288 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/12-four-historical-heroes-character-prompts.md` | 3/0 | Giữ tên file |
| `docs/design/v4-2/13-personality-frame-usage-and-prompt-qa.md` | 42 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/13-personality-frame-usage-and-prompt-qa.md` | 1/0 | Giữ tên file |
| `docs/design/v4-2/14-group-a-19-character-weapon-pose-audit.md` | 434 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/14-group-a-19-character-weapon-pose-audit.md` | 0/0 | Giữ tên file |
| `docs/design/v4-2/15-group-c-24-character-pose-qa.md` | 36 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/15-group-c-24-character-pose-qa.md` | 0/0 | Giữ tên file |
| `docs/design/v4-2/16-group-b-18-character-pose-qa.md` | 52 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/16-group-b-18-character-pose-qa.md` | 0/0 | Giữ tên file |
| `docs/design/v4-2/17-group-d-e-prompt-and-skill-qa.md` | 55 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/17-group-d-e-prompt-and-skill-qa.md` | 0/0 | Giữ tên file |
| `docs/design/v4-2/18-personality-frames-rb031-rb078-uniqueness-qa.md` | 55 | REFERENCE | DRAFT | `docs/06-art/prompts/v4-2/18-personality-frames-rb031-rb078-uniqueness-qa.md` | 0/0 | Giữ tên file |
| `docs/dual-tower/00-01-audit.md` | 83 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/00-01-audit.md` | 2/0 | Bằng chứng task/QA |
| `docs/dual-tower/00-02-rules.md` | 212 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/dual-tower/00-02-rules.md` | 1/3 |  |
| `docs/dual-tower/00-03-migration-plan.md` | 147 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/00-03-migration-plan.md` | 2/1 | Bằng chứng task/QA |
| `docs/dual-tower/02-06-trial-content-report.md` | 44 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/02-06-trial-content-report.md` | 0/1 | Bằng chứng task/QA |
| `docs/dual-tower/03-01-daily-sweep-state.md` | 15 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/03-01-daily-sweep-state.md` | 0/0 | Bằng chứng task/QA |
| `docs/dual-tower/03-02-stone-economy.md` | 92 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/03-02-stone-economy.md` | 1/0 | Bằng chứng task/QA |
| `docs/dual-tower/04-06-destiny-boons.md` | 21 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/04-06-destiny-boons.md` | 0/0 | Bằng chứng task/QA |
| `docs/dual-tower/05-03-destiny-leaderboard.md` | 28 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/05-03-destiny-leaderboard.md` | 0/0 | Bằng chứng task/QA |
| `docs/dual-tower/05-04-destiny-stones.md` | 14 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/05-04-destiny-stones.md` | 0/0 | Bằng chứng task/QA |
| `docs/dual-tower/06-01-regression.md` | 94 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/06-01-regression.md` | 1/0 | Bằng chứng task/QA |
| `docs/dual-tower/06-02-trial-qa.md` | 101 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/06-02-trial-qa.md` | 1/0 | Bằng chứng task/QA |
| `docs/dual-tower/06-03-balance.md` | 142 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/06-03-balance.md` | 2/0 | Bằng chứng task/QA |
| `docs/dual-tower/06-04-final-acceptance.md` | 146 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/06-04-final-acceptance.md` | 5/0 | Bằng chứng task/QA |
| `docs/dual-tower/06-05-feature-flags.md` | 71 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/dual-tower/06-05-feature-flags.md` | 3/0 |  |
| `docs/dual-tower/06-06-neon-staging-runbook.md` | 115 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/dual-tower/06-06-neon-staging-runbook.md` | 1/0 |  |
| `docs/dual-tower/06-07-post-merge-verification.md` | 97 | HISTORY | IMPLEMENTED | `docs/02-game-modes/dual-tower/06-07-post-merge-verification.md` | 1/0 | Bằng chứng task/QA |
| `docs/dual-tower/player-help.md` | 44 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/dual-tower/player-help.md` | 3/0 |  |
| `docs/game-modes/01-mode-portfolio.md` | 45 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/01-mode-portfolio.md` | 1/0 |  |
| `docs/game-modes/02-binh-phap-gdd.md` | 89 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/02-binh-phap-gdd.md` | 1/0 |  |
| `docs/game-modes/03-binh-phap-architecture.md` | 73 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/03-binh-phap-architecture.md` | 1/0 |  |
| `docs/game-modes/04-binh-phap-ui-art.md` | 73 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/04-binh-phap-ui-art.md` | 1/0 |  |
| `docs/game-modes/05-binh-phap-balance-qa.md` | 84 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/05-binh-phap-balance-qa.md` | 1/0 |  |
| `docs/game-modes/06-towers-survival-future.md` | 63 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/06-towers-survival-future.md` | 1/0 |  |
| `docs/game-modes/07-implementation-roadmap.md` | 51 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/07-implementation-roadmap.md` | 1/0 |  |
| `docs/game-modes/08-liet-truyen-gdd.md` | 91 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/08-liet-truyen-gdd.md` | 2/0 |  |
| `docs/game-modes/09-liet-truyen-recipes.md` | 103 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/09-liet-truyen-recipes.md` | 1/0 |  |
| `docs/game-modes/10-liet-truyen-architecture.md` | 80 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/10-liet-truyen-architecture.md` | 1/0 |  |
| `docs/game-modes/11-liet-truyen-ui-art.md` | 67 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/11-liet-truyen-ui-art.md` | 1/0 |  |
| `docs/game-modes/12-liet-truyen-qa-roadmap.md` | 68 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/12-liet-truyen-qa-roadmap.md` | 1/0 |  |
| `docs/game-modes/README.md` | 56 | CANONICAL | DRAFT (design only) | `docs/02-game-modes/future/README.md` | 2/0 |  |
| `docs/game-modes/prompts/BP-00.md` | 10 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/BP-00.md` | 0/0 | Chưa chạy |
| `docs/game-modes/prompts/BP-01.md` | 8 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/BP-01.md` | 0/0 | Chưa chạy |
| `docs/game-modes/prompts/BP-02.md` | 6 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/BP-02.md` | 0/0 | Chưa chạy |
| `docs/game-modes/prompts/BP-03.md` | 6 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/BP-03.md` | 0/0 | Chưa chạy |
| `docs/game-modes/prompts/BP-04.md` | 6 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/BP-04.md` | 0/0 | Chưa chạy |
| `docs/game-modes/prompts/BP-05.md` | 6 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/BP-05.md` | 0/0 | Chưa chạy |
| `docs/game-modes/prompts/LT-00.md` | 12 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/LT-00.md` | 0/0 | Chưa chạy |
| `docs/game-modes/prompts/LT-01.md` | 13 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/LT-01.md` | 0/0 | Chưa chạy |
| `docs/game-modes/prompts/LT-02.md` | 12 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/LT-02.md` | 0/0 | Chưa chạy |
| `docs/game-modes/prompts/LT-03.md` | 12 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/LT-03.md` | 0/0 | Chưa chạy |
| `docs/game-modes/prompts/LT-04.md` | 8 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/LT-04.md` | 0/0 | Chưa chạy |
| `docs/game-modes/prompts/LT-05.md` | 8 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/LT-05.md` | 0/0 | Chưa chạy |
| `docs/game-modes/prompts/TW-FUTURE.md` | 6 | REFERENCE | DRAFT | `docs/02-game-modes/future/prompts/TW-FUTURE.md` | 0/0 | Chưa chạy |
| `docs/lo-trinh.md` | 61 | CANONICAL | APPROVED | `docs/09-roadmap/lo-trinh.md` | 7/0 | 3 anchor hỏng |
| `docs/nhat-ky-thay-doi.md` | 314 | CANONICAL | — | `docs/decisions/changelog.md` | 3/0 | Giữ nguyên thứ tự/ngày; 8 anchor hỏng |
| `docs/plans/2026-10-22-can-bang-chase.md` | 166 | HISTORY | SUPERSEDED | `docs/archive/plans/2026-10-22-can-bang-chase.md` | 1/0 | Kế hoạch 22/10 đã thực hiện |
| `docs/plans/2026-10-22-chase-pr.md` | 28 | HISTORY | ARCHIVED | `docs/archive/pr/2026-10-22-chase-pr.md` | 0/0 | Bản sao mô tả PR |
| `docs/plans/2026-10-22-checkpoint-pr.md` | 24 | HISTORY | ARCHIVED | `docs/archive/pr/2026-10-22-checkpoint-pr.md` | 1/0 | Bản sao mô tả PR |
| `docs/plans/2026-10-22-combo-handoff.md` | 74 | HISTORY | SUPERSEDED | `docs/archive/plans/2026-10-22-combo-handoff.md` | 2/0 | Kế hoạch 22/10 đã thực hiện |
| `docs/reports/2026-10-22-ai-f/README.md` | 147 | HISTORY | — | _giữ nguyên_ | 4/0 | Giữ nguyên chỗ: scripts đọc/ghi theo đường dẫn |
| `docs/reports/2026-10-22-balance-f/README.md` | 98 | HISTORY | — | _giữ nguyên_ | 3/0 | Giữ nguyên chỗ: scripts đọc/ghi theo đường dẫn |
| `docs/reports/2026-10-22-baseline-f/README.md` | 86 | HISTORY | — | _giữ nguyên_ | 6/0 | Giữ nguyên chỗ: scripts đọc/ghi theo đường dẫn |
| `docs/reports/2026-10-22-baseline-f/inventory.md` | 153 | HISTORY | — | _giữ nguyên_ | 1/0 | Giữ nguyên chỗ: scripts đọc/ghi theo đường dẫn |
| `docs/reports/2026-10-22-combo.md` | 92 | HISTORY | — | _giữ nguyên_ | 3/0 | Giữ nguyên chỗ: scripts đọc/ghi theo đường dẫn |
| `docs/reports/2026-10-22-combo/README.md` | 42 | HISTORY | — | _giữ nguyên_ | 2/0 | Giữ nguyên chỗ: scripts đọc/ghi theo đường dẫn |
| `docs/reports/2026-10-22-combo/roster-matrix.md` | 68 | HISTORY | — | _giữ nguyên_ | 3/0 | Giữ nguyên chỗ: scripts đọc/ghi theo đường dẫn |
| `docs/reports/2026-10-22-ky-nang.md` | 232 | HISTORY | — | _giữ nguyên_ | 6/0 | Giữ nguyên chỗ: scripts đọc/ghi theo đường dẫn |
| `docs/reports/2026-10-22-spirit-f/README.md` | 37 | HISTORY | — | _giữ nguyên_ | 2/0 | Giữ nguyên chỗ: scripts đọc/ghi theo đường dẫn |
| `docs/reports/2026-10-22-tinh-than-F.md` | 137 | HISTORY | — | _giữ nguyên_ | 5/0 | Giữ nguyên chỗ: scripts đọc/ghi theo đường dẫn |
| `docs/reports/2026-10-22-tinh-than-ai.md` | 288 | HISTORY | — | _giữ nguyên_ | 8/0 | Giữ nguyên chỗ: scripts đọc/ghi theo đường dẫn |
| `docs/reports/2026-10-23-pve-ui-handoff/README.md` | 94 | HISTORY | — | _giữ nguyên_ | 1/0 | Giữ nguyên chỗ: scripts đọc/ghi theo đường dẫn |
| `docs/survival-v1.1/01-current-state-audit.md` | 181 | HISTORY | IMPLEMENTED | `docs/02-game-modes/survival/01-current-state-audit.md` | 3/0 | Bằng chứng audit/QA |
| `docs/survival-v1.1/02-rules-state-machine.md` | 245 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/survival/02-rules-state-machine.md` | 2/0 | Nguồn luật Sinh tồn (09 §4 chép lại) |
| `docs/survival-v1.1/03-data-architecture.md` | 507 | CANONICAL | IMPLEMENTED | `docs/02-game-modes/survival/03-data-architecture.md` | 1/0 |  |
| `docs/survival-v1.1/22-qa-report.md` | 64 | HISTORY | IMPLEMENTED | `docs/02-game-modes/survival/22-qa-report.md` | 4/0 | Bằng chứng audit/QA |
| `docs/survival-v1.1/23-balance-report.md` | 217 | HISTORY | IMPLEMENTED | `docs/02-game-modes/survival/23-balance-report.md` | 4/0 | Bằng chứng audit/QA |
| `docs/survival-v1.1/24-final-acceptance.md` | 170 | HISTORY | IMPLEMENTED | `docs/02-game-modes/survival/24-final-acceptance.md` | 1/0 | Bằng chứng audit/QA |
| `docs/tech/ha-tang.md` | 95 | CANONICAL | IMPLEMENTED | `docs/07-architecture/ha-tang.md` | 6/6 |  |
| `docs/tech/kien-truc.md` | 103 | CANONICAL | IMPLEMENTED | `docs/07-architecture/kien-truc.md` | 4/0 |  |
| `docs/theme.md` | 83 | CANONICAL | IMPLEMENTED | `docs/05-ui-ux/design-system/theme.md` | 0/0 | Nguồn token CSS; chưa có link nào trỏ tới |
| `docs/ui-design-system/README.md` | 24 | CANONICAL | APPROVED | `docs/05-ui-ux/design-system/README.md` | 0/0 | Home V2 ở mục 14 game-mode-ui-spec |
| `docs/ui-design-system/game-mode-ui-spec.md` | 297 | CANONICAL | APPROVED | `docs/05-ui-ux/design-system/game-mode-ui-spec.md` | 3/0 | Home V2 ở mục 14 game-mode-ui-spec |
| `docs/ui-design-system/implementation-roadmap.md` | 148 | CANONICAL | APPROVED | `docs/05-ui-ux/implementation/roadmap.md` | 1/0 | Giữ UI-00…09, UI-02A…E |

## 7. Quyết định của Shan (27/10/2026)

1. **Khung thư mục:** giữ khung đánh số của PR #183 như bảng ở mục 6.
2. **Prompt ảnh nhân vật:** bộ `design/v4-2/` là bộ đang dùng (`APPROVED`); `design/16` và `18` gắn `SUPERSEDED`.
3. **Kỹ năng:** `20`, `21` vào `03-characters/ky-nang/lich-su/` với nhãn `SUPERSEDED`; bảng giá của `23` gộp vào `22`.
4. **Đường dẫn cũ:** dùng một file `docs/MOVED.md`, không sửa nội dung prompt đã chạy.

## 8. Acceptance gate (bổ sung cho mục 7 của PR #183)

- [x] Manifest từ `git ls-files` trên checkout, phân loại đủ 182 file.
- [x] Kiểm 684 link và anchor; liệt kê 23 link hỏng.
- [x] Liệt kê code/script trỏ vào `docs/`, tách loại đọc/ghi thật và loại comment.
- [x] Đề xuất nguồn chính cho từng cụm trùng.
- [x] Shan duyệt ánh xạ và trả lời 4 câu ở mục 7 (27/10/2026).
