# Tài liệu Cờ Lau (Reed Banner)

> Cập nhật: 27/10/2026

Bản đồ duy nhất dẫn vào tài liệu. Mỗi khái niệm có **một** nguồn chính (đánh dấu ★); file khác chỉ link tới đó. Tìm đường dẫn cũ (trước 27/10/2026) ở [MOVED.md](MOVED.md).

## 00 · Tổng quan (`00-overview/`)

| File | Nội dung |
|---|---|
| ★ [tong-quan.md](00-overview/tong-quan.md) | Ý tưởng, ngoài phạm vi, nguồn gốc và nguyên tắc clean-room |
| ★ [thuat-ngu.md](00-overview/thuat-ngu.md) | Thuật ngữ dùng chung |
| ★ [quy-dinh-tai-lieu.md](00-overview/quy-dinh-tai-lieu.md) | Quy định viết docs, nhãn trạng thái, chuyển/gộp file, kiểm tra CI, hướng dẫn cho Claude/Codex |

## 01 · Luật trận (`01-gameplay/`)

| File | Nội dung |
|---|---|
| ★ [ban-co.md](01-gameplay/ban-co.md) | Bàn cờ 12×8, loại ô, luật ghép, ô đặc biệt, sinh ô, đồng hồ 30 giây |
| ★ [tran-dau.md](01-gameplay/tran-dau.md) | Thể thức 1vs1 và 3vs3, lượt, mục tiêu, máu & thời lượng |
| ★ [tai-nguyen-cong-thuc.md](01-gameplay/tai-nguyen-cong-thuc.md) | Lương, sĩ khí, năng lượng, Nộ, công thức sát thương, Tinh thần F |
| ★ [hieu-ung.md](01-gameplay/hieu-ung.md) | Hiệu ứng trạng thái |
| ★ [nguyen-to.md](01-gameplay/nguyen-to.md) | 7 nguyên tố, khắc chế, dấu ấn |
| ★ [ai.md](01-gameplay/ai.md) | AI Tianwu |
| ★ [tien-trinh-kinh-te.md](01-gameplay/tien-trinh-kinh-te.md) | Kinh nghiệm, cấp, vàng, cửa hàng |

## 02 · Chế độ chơi (`02-game-modes/`)

| File | Nội dung |
|---|---|
| ★ [README.md](02-game-modes/README.md) | Tổng hợp mọi chế độ đang chạy; link sang nguồn chính của từng chế độ |
| ★ [campaign/](02-game-modes/campaign/design-freeze.md) | Campaign V2: [design freeze](02-game-modes/campaign/design-freeze.md), [mission matrix](02-game-modes/campaign/mission-matrix.md), [sổ nguồn sử](02-game-modes/campaign/history-sources.md), [contract](02-game-modes/campaign/contracts.md), [nghiệm thu](02-game-modes/campaign/final-acceptance.md) |
| ★ [dual-tower/](02-game-modes/dual-tower/00-02-rules.md) | Song Tháp: [luật](02-game-modes/dual-tower/00-02-rules.md), [hướng dẫn người chơi](02-game-modes/dual-tower/player-help.md), [feature flags](02-game-modes/dual-tower/06-05-feature-flags.md), [runbook Neon](02-game-modes/dual-tower/06-06-neon-staging-runbook.md), [nghiệm thu](02-game-modes/dual-tower/06-04-final-acceptance.md) |
| ★ [survival/](02-game-modes/survival/02-rules-state-machine.md) | Sinh tồn V1.1: [luật & state machine](02-game-modes/survival/02-rules-state-machine.md), [dữ liệu](02-game-modes/survival/03-data-architecture.md), [nghiệm thu](02-game-modes/survival/24-final-acceptance.md) |
| [future/](02-game-modes/future/README.md) | Đề xuất chưa triển khai: Binh Pháp, Liệt Truyện, định hướng Tháp/Sinh tồn (**DRAFT**, design only) |

## 03 · Nhân vật & kỹ năng (`03-characters/`)

| File | Nội dung |
|---|---|
| ★ [danh-sach-nhan-vat.md](03-characters/danh-sach-nhan-vat.md) | 61 nhân vật: tướng thường, tướng lịch sử, sứ quân |
| ★ [ky-nang/README.md](03-characters/ky-nang/README.md) | Kỹ năng hiện hành: Tinh thần F, 6 chủ động + 4 bị động, giá Thủ thành |
| [ky-nang/mo-hinh-nhan-vat.md](03-characters/ky-nang/mo-hinh-nhan-vat.md) | Mô hình nhân vật, nghề, luật dùng kỹ năng (bộ chiêu cụ thể đã thay) |
| [ky-nang/preset-ai-he-cu.md](03-characters/ky-nang/preset-ai-he-cu.md) | Bộ kỹ năng hệ cũ, chỉ dùng cho preset AI chiến dịch |
| [ky-nang/data/](03-characters/ky-nang/data/skill-chase-v3.md) | Dữ liệu sinh từ code và bảng kỹ năng 60 nhân vật kèm |
| [ky-nang/lich-su/](03-characters/ky-nang/lich-su/21-combo-dong-doi.md) | Phiên bản kỹ năng cũ (SUPERSEDED) |

## 04 · Trang bị (`04-equipment/`)

| File | Nội dung |
|---|---|
| ★ [trang-bi.md](04-equipment/trang-bi.md) | 9 ô trang bị, thưởng bộ, phẩm màu, ghép nâng bậc |
| [cuong-hoa-todo.md](04-equipment/cuong-hoa-todo.md) | Cường hóa bằng Đá (DEFERRED, chưa triển khai) |

## 05 · Giao diện (`05-ui-ux/`)

| File | Nội dung |
|---|---|
| ★ [design-system/theme.md](05-ui-ux/design-system/theme.md) | Theme và token CSS đang chạy (`src/styles/`) |
| ★ [design-system/README.md](05-ui-ux/design-system/README.md) | UI Home và các chế độ ngoài Campaign; spec ở [game-mode-ui-spec.md](05-ui-ux/design-system/game-mode-ui-spec.md) (Home V2 mục 14) |
| ★ [screens/battle.md](05-ui-ux/screens/battle.md) | Màn trận đấu, điều khiển |
| ★ [campaign/README.md](05-ui-ux/campaign/README.md) | UI riêng Campaign: thoại, Sử ký, World Atlas; [task board](05-ui-ux/campaign/task-board.md), [Polish V2](05-ui-ux/campaign/polish-v2/README.md), [audio (DEFERRED)](05-ui-ux/campaign/audio-todo/README.md) |
| ★ [implementation/roadmap.md](05-ui-ux/implementation/roadmap.md) | Lộ trình UI-00…UI-09, UI-02A…E |

## 06 · Đồ họa (`06-art/`)

| File | Nội dung |
|---|---|
| ★ [art-bible.md](06-art/art-bible.md) | Phong cách, bảng màu art, yêu cầu cho họa sĩ, quy ước đưa hình vào `public/art/` |
| [ke-hoach-do-hoa.md](06-art/ke-hoach-do-hoa.md) | Kế hoạch đồ họa & hoạt ảnh Đ0–Đ9 |
| ★ [prompts/v4-2/](06-art/prompts/v4-2/00-bao-cao.md) | Prompt nhân vật đang dùng: 75 tướng × 6 khung (Idle, ra chiêu, tuyệt chiêu, hạ gục…) |
| [prompts/](06-art/prompts/do-hoa.md) | [Đồ họa ngoài nhân vật](06-art/prompts/do-hoa.md), [Codex dựng rig](06-art/prompts/codex-rig-nhan-vat.md); bản cũ SUPERSEDED: [nhân vật](06-art/prompts/nhan-vat.md), [tư thế](06-art/prompts/tu-the.md) |
| [nhan-vat/nguyen-bac.md](06-art/nhan-vat/nguyen-bac.md) | Hình động Nguyễn Bặc |

## 07 · Kỹ thuật (`07-architecture/`)

| File | Nội dung |
|---|---|
| ★ [kien-truc.md](07-architecture/kien-truc.md) | Công nghệ, sơ đồ, tích hợp ShanVerse |
| ★ [ha-tang.md](07-architecture/ha-tang.md) | Server có thẩm quyền, database, tài khoản, BXH, chống gian lận |

## 09 · Lộ trình & quyết định

| File | Nội dung |
|---|---|
| ★ [09-roadmap/lo-trinh.md](09-roadmap/lo-trinh.md) | Lộ trình cấp dự án |
| ★ [09-roadmap/cau-hoi-mo.md](09-roadmap/cau-hoi-mo.md) | Mọi câu hỏi còn mở (TODO) |
| ★ [decisions/changelog.md](decisions/changelog.md) | Nhật ký quyết định thiết kế theo ngày |

## Lịch sử và bằng chứng (không phải luật hiện hành)

- [audits/](audits/DOC-01-docs-structure-audit.md): audit tài liệu và Campaign.
- [reports/](reports/2026-10-22-ky-nang.md): báo cáo mô phỏng, dữ liệu kiểm chứng. **Không đổi đường dẫn**: script trong `scripts/` đọc/ghi thẳng vào đây.
- [archive/](archive/pr/2026-10-22-chase-pr.md): kế hoạch đã thực hiện, bản sao mô tả PR, task docs cũ.

Theo dòng thời gian cải tổ kỹ năng 22–23/10/2026:

- [Cải tổ kỹ năng nghề + hệ](03-characters/ky-nang/lich-su/20-cai-to-ky-nang.md) · [báo cáo 2.784 trận](reports/2026-10-22-ky-nang.md) · [AI, Tinh thần A–E](reports/2026-10-22-tinh-than-ai.md) · [phương án F](reports/2026-10-22-tinh-than-F.md)
- [Bàn giao combo](archive/plans/2026-10-22-combo-handoff.md) · [kỹ năng phiên bản 2](03-characters/ky-nang/lich-su/21-combo-dong-doi.md) · [triển khai combo](reports/2026-10-22-combo.md)
- [Chốt F + chase](03-characters/ky-nang/README.md) · [kế hoạch cân bằng chase](archive/plans/2026-10-22-can-bang-chase.md)
- [Task1 baseline](reports/2026-10-22-baseline-f/README.md) · [Task2 AI](reports/2026-10-22-ai-f/README.md) · [Task3 cân bằng](reports/2026-10-22-balance-f/README.md) · [Task4 PvE/UI](reports/2026-10-23-pve-ui-handoff/README.md)

## Quy ước viết docs

Đầy đủ ở [quy-dinh-tai-lieu.md](00-overview/quy-dinh-tai-lieu.md). Tóm tắt:

- Viết tiếng Việt; mỗi file một tiêu đề `#`, dưới là `> Cập nhật: dd/mm/yyyy` và `> Trạng thái: **...**`.
- Một khái niệm chỉ định nghĩa ở **một** file (★ ở trên); file khác link tới đó.
- Việc chưa chốt ghi `> TODO:` tại chỗ và trong [cau-hoi-mo.md](09-roadmap/cau-hoi-mo.md); quyết định mới ghi vào [changelog.md](decisions/changelog.md).
- Chuyển/đổi tên file: `git mv` + thêm dòng vào [MOVED.md](MOVED.md).
- Chạy `pnpm docs:check` trước khi commit.
