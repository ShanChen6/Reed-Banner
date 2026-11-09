# Tài liệu Cờ Lau (Reed Banner)

> Cập nhật: 30/10/2026

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
| ★ [expedition/](02-game-modes/expedition/01-vien-chinh-gdd.md) | Viễn Chinh: [GDD hai đạo quân trên sa bàn](02-game-modes/expedition/01-vien-chinh-gdd.md) (**APPROVED**, có code sau cờ `EXPEDITION_ENABLED`); [đề xuất sa bàn và nhiệm vụ](02-game-modes/expedition/02-map-va-nhiem-vu-proposal.md) (DRAFT); [thiết kế chi tiết Cửa Biển](02-game-modes/expedition/03-cua-bien-thiet-ke.md) (APPROVED, đang code) |
| [future/](02-game-modes/future/README.md) | Đề xuất chưa triển khai: Binh Pháp, Tầm Tướng Ký ([design freeze LT-00](02-game-modes/future/14-tam-tuong-ky-design-freeze.md), **FROZEN**; [catalog LT-01](02-game-modes/future/15-tam-tuong-ky-lt01-catalog.md), [engine LT-02](02-game-modes/future/16-tam-tuong-ky-lt02-engine.md), [server LT-04](02-game-modes/future/17-tam-tuong-ky-lt04-server.md), [Gói 1 LT-05](02-game-modes/future/18-tam-tuong-ky-lt05-pack-1.md), [Hạng tuần LT-06](02-game-modes/future/19-tam-tuong-ky-lt06-ranked.md), [nghiệm thu LT-07](02-game-modes/future/20-tam-tuong-ky-lt07-acceptance.md), [Gói 2](02-game-modes/future/21-tam-tuong-ky-pack-2.md), [Gói 3](02-game-modes/future/22-tam-tuong-ky-pack-3.md), [cân bằng nguyên tố và cảnh báo](02-game-modes/future/23-tam-tuong-ky-can-bang-va-canh-bao.md)), định hướng Tháp/Sinh tồn, [Quần Hùng PvP trực tiếp](02-game-modes/future/13-quan-hung-pvp-truc-tiep.md) (**DRAFT**, design only), [Khai Lộ](02-game-modes/future/24-khai-lo-gdd.md) (**DRAFT**, giải đố xóa khối, có bản chơi thử) |

## 03 · Nhân vật & kỹ năng (`03-characters/`)

| File | Nội dung |
|---|---|
| ★ [Đinh Bộ Lĩnh — thêm Xạ thủ/Sát thủ](03-characters/dinh-bo-linh-xa-thu-sat-thu.md) | IMPLEMENTED: nhân vật chính có 8 nghề (56 tổ hợp); 14 tuyệt chiêu ô 4 mới, dùng lại chiêu nghề và bị động của đồng hành; [biến thể hình ảnh và prompt](06-art/prompts/dinh-bo-linh-xa-thu-sat-thu.md) DRAFT |
| ★ [Nhân vật tổng hợp](03-characters/nhan-vat-tong-hop.md) | DRAFT: nhân vật đặc biệt hai nghề/hai hệ; phòng thủ và đòn thường theo hệ chính, hệ phụ chỉ mở rộng chiêu; giá cao, cách nhận đặc biệt, icon tổng hợp |
| ★ [Đinh Ngọc — Vạn Tượng Hành Giả](03-characters/dinh-ngoc.md) | DRAFT: nữ khoảng 25 tuổi, nhân vật đặc biệt dung hợp8 nghề/7 hệ qua6 chủ động +4 nội tại; [sáu prompt](06-art/prompts/dinh-ngoc.md), chưa có runtime |
| ★ [Vũ Phong — Vân Du Tử](03-characters/vu-phong.md) | DRAFT: nam khoảng 25–30 tuổi, lãng khách có hình xăm mây/gió/giao long; dung hợp 8 nghề/7 hệ qua 6 chủ động + 4 nội tại (đảo vai so với Đinh Ngọc), hình tượng, prompt Master và rig hình động xem thử; chưa vào roster/runtime |
| ★ [danh-sach-nhan-vat.md](03-characters/danh-sach-nhan-vat.md) | 61 nhân vật: tướng thường, tướng lịch sử, sứ quân |
| ★ [thiet-ke-lai-nhan-vat.md](03-characters/thiet-ke-lai-nhan-vat.md) | APPROVED (phần chữ đã có trong mã, tranh chưa làm): thiết kế lại nhân vật phong cách cổ trang bán hiện thực; phe (nghĩa quân Hoa Lư và 12 sứ quân), tên và ngoại hiệu (đã đồng ý), vũ khí và vật dụng đặc trưng, quan hệ mở rộng được |
| [ho-so-37-tuong-thuong.md](03-characters/ho-so-37-tuong-thuong.md) | APPROVED (đã có trong `lore.ts`): hồ sơ hư cấu 37 tướng thường (xuất thân, tính cách, ba dấu ấn, vũ khí, quan hệ, câu nói) |
| ★ [ky-nang/README.md](03-characters/ky-nang/README.md) | Kỹ năng hiện hành: Tinh thần F, 6 chủ động + 4 bị động, giá Thủ thành |
| ★ [Thiết kế Xạ thủ và Sát thủ](06-art/prompts/v4-2/08-new-professions-14-skill-kits.md) | RB-062–075: chỉ số nền, 6 chiêu nghề, 14 tuyệt chiêu, 14 chiêu hệ đối chiếu, loadout 6+4; bảng cấp 1/5 và contract poison. Thiết kế DRAFT, chưa runtime; Sát thủ có bộ đa vũ khí mới (DRAFT, chưa runtime) |
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
| ★ [screens/doanh-trai.md](05-ui-ux/screens/doanh-trai.md) | Doanh Trại (màn Hồ sơ cũ): Tướng sĩ, Đội hình, Kho đồ, bảng chọn trang bị, điện thoại |
| ★ [screens/tran-do.md](05-ui-ux/screens/tran-do.md) | Giao diện Trận Đồ: sa bàn là bản đồ, quân, chướng ngại, yêu cầu ảnh, gợi ý màn chế độ (**DRAFT**) |
| ★ [screens/tam-tuong-ky.md](05-ui-ux/screens/tam-tuong-ky.md) | Giao diện Tầm Tướng Ký: Vạn Vật Lục, Đài Hợp Nguyên, Tướng Lục, cờ bật (**DRAFT**) |
| ★ [campaign/README.md](05-ui-ux/campaign/README.md) | UI riêng Campaign: thoại, Sử ký, World Atlas; [task board](05-ui-ux/campaign/task-board.md), [Polish V2](05-ui-ux/campaign/polish-v2/README.md), [audio (DEFERRED)](05-ui-ux/campaign/audio-todo/README.md): [kiến trúc và bảng cue mọi chế độ](05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md), [prompt triển khai và tạo âm thanh](05-ui-ux/campaign/audio-todo/04-prompts-trien-khai-theo-che-do.md) |
| ★ [implementation/roadmap.md](05-ui-ux/implementation/roadmap.md) | Lộ trình UI-00…UI-09, UI-02A…E |

## 06 · Đồ họa (`06-art/`)

| File | Nội dung |
|---|---|
| ★ [art-bible.md](06-art/art-bible.md) | Phong cách, bảng màu art, yêu cầu cho họa sĩ, quy ước đưa hình vào `public/art/` |
| [ke-hoach-do-hoa.md](06-art/ke-hoach-do-hoa.md) | Kế hoạch đồ họa & hoạt ảnh Đ0–Đ9 |
| ★ [prompts/v4-2/](06-art/prompts/v4-2/00-bao-cao.md) | Điểm vào bộ prompt; [Xạ thủ và prompt Sát thủ đa vũ khí](06-art/prompts/v4-2/09-14-heroes-character-and-frame-prompts-v4-3.md). Năm Xạ thủ W02 là DRAFT, Kim/Mộc bảo toàn |
| [prompts/](06-art/prompts/do-hoa.md) | [Đồ họa ngoài nhân vật](06-art/prompts/do-hoa.md), [Codex dựng rig](06-art/prompts/codex-rig-nhan-vat.md); bản cũ SUPERSEDED: [nhân vật](06-art/prompts/nhan-vat.md), [tư thế](06-art/prompts/tu-the.md) |
| [prompts/thu-cuon-lien-he.md](06-art/prompts/thu-cuon-lien-he.md) | Prompt tranh khung thư cuộn liên hệ ở footer (nền trong suốt, vùng giữa phẳng cho chữ) và ấn đỏ tuỳ chọn; DRAFT, chưa có tranh |
| [prompts/chan-dung-lich-su.md](06-art/prompts/chan-dung-lich-su.md) | Prompt chân dung bán thân tướng sĩ phong cách lịch sử, bớt fantasy (tranh gouache trầm, nền sương, khung 1:1); làm thử 2 nhân vật (Nguyễn Bặc, Hà Vân) trước; DRAFT |
| [prompts/nen-phong-thai.md](06-art/prompts/nen-phong-thai.md) | Tranh nền sân khấu ảnh phong thái theo hệ (7 tranh, khổ 2:1, vầng sáng ở giữa; nhân vật trong suốt đặt lên trên); APPROVED, hệ Hỏa đã gắn (`public/art/stage/he-hoa.webp`) |
| [prompts/mai-thanh.md](06-art/prompts/mai-thanh.md) | Bộ prompt tranh Mai Thanh theo phong cách mới (ảnh chuẩn, bán thân, phong thái, bốn tranh ra chiêu quay phải); DRAFT, chưa có ảnh |
| [prompts/le-thach.md](06-art/prompts/le-thach.md) | Bộ prompt tranh Lê Thạch cầm giáo mũi đồng và khiên mây theo phong cách mới (ảnh khuôn đã duyệt, ảnh chuẩn đứng, bán thân, phong thái, bốn tranh ra chiêu quay phải); DRAFT, chưa có ảnh |
| [prompts/phung-phong.md](06-art/prompts/phung-phong.md) | Bộ prompt tranh Phùng Phong cầm gậy trúc chỉ huy, sáo trúc cài hông, theo phong cách mới (ảnh chuẩn đứng, bán thân, phong thái, bốn tranh ra chiêu quay phải); DRAFT, chưa có ảnh |
| [prompts/co-su-quan.md](06-art/prompts/co-su-quan.md) | Prompt ký hiệu giữa lá cờ 12 sứ quân trên bản đồ Bình Loạn (nền trong suốt, không chữ; ký hiệu game tự đặt, không phải huy hiệu lịch sử) và tuỳ chọn lá cờ đủ màu cho hồ sơ; IMPLEMENTED (`public/art/flags/co-<id>.webp`, còn cầu vòm và cổng làng cần tạo lại) |
| [prompts/thumbnail-chien-truong.md](06-art/prompts/thumbnail-chien-truong.md) | Prompt thumbnail thẻ Khai Lộ và Viễn Chinh ở Chiến trường (16:9, không chữ); IMPLEMENTED (`public/art/home/khai-lo.webp`, `vien-chinh.webp`) |
| [prompts/vien-chinh-sa-ban.md](06-art/prompts/vien-chinh-sa-ban.md) | Prompt tranh nền 6 sa bàn Viễn Chinh (5:3, không chữ); DRAFT, chưa có tranh |
| [prompts/icon-ky-nang.md](06-art/prompts/icon-ky-nang.md) | Prompt biểu tượng kỹ năng còn vẽ SVG: 24 chiêu nghề, tuyệt chiêu/chiêu riêng 74 nhân vật, tuyệt chiêu ô 4 Đinh Bộ Lĩnh, cách dùng lại 42 ảnh kỹ năng hệ; DRAFT, chưa có ảnh |
| [prompts/icon-bi-dong.md](06-art/prompts/icon-bi-dong.md) | Prompt icon 29 bị động dùng chung: 7 bị động nghề 1, 8 truy kích theo nghề, 14 truy kích theo hệ; IMPLEMENTED (`public/art/passives/`) |
| [prompts/icon-bi-dong-rieng.md](06-art/prompts/icon-bi-dong-rieng.md) | Prompt icon 21 bị động riêng: 14 Xạ thủ/Sát thủ mở rộng, Đinh Ngọc, Trần Vũ Phong; nền tròn đều; IMPLEMENTED (đã gắn ảnh) |
| [prompts/icon-bi-dong-no.md](06-art/prompts/icon-bi-dong-no.md) | Prompt icon 7 bị động Nộ của Đinh Bộ Lĩnh (mỗi hệ một), viền mặt trống đồng, nền tròn đều; IMPLEMENTED (đã gắn ảnh) |
| [prompts/trang-bi.md](06-art/prompts/trang-bi.md) | Prompt hệ thống trang bị: 48 món (8 ô + 8 vũ khí × 3 bộ), 5 khung phẩm, huy hiệu bộ, ô trống; thay mục 4 của Đồ họa; DRAFT, chưa có ảnh |
| [prompts/dinh-bo-linh-xa-thu-sat-thu.md](06-art/prompts/dinh-bo-linh-xa-thu-sat-thu.md) | Biến thể vũ khí cung tre/dao găm cho rig Đinh Bộ Lĩnh và các prompt Master/tư thế; DRAFT, chưa có ảnh |
| [prompts/tran-do-hinh-anh.md](06-art/prompts/tran-do-hinh-anh.md) | Prompt đầy đủ cho Trận Đồ: 30 bản đồ (địa danh thời Loạn 12 sứ quân và cảnh quan, kho không giới hạn), ô che đặc kín, 4 icon chướng ngại; DRAFT, ảnh chưa có |
| [prompts/tran-do-video-huong-dan.md](06-art/prompts/tran-do-video-huong-dan.md) | Prompt Veo 3 cho video hướng dẫn cách chơi Trận Đồ (sa bàn gỗ, lời dẫn tiếng Việt) và gợi ý nối 4 cảnh; DRAFT |
| [prompts/icon-nghe-xa-thu.md](06-art/prompts/icon-nghe-xa-thu.md) | Prompt và cách tích hợp biểu tượng nghề Xạ thủ mới (cung và tên, khác hẳn dao găm của Sát thủ); IMPLEMENTED |
| [prompts/dinh-ngoc.md](06-art/prompts/dinh-ngoc.md) | Character DNA, trang phục lấy cảm hứng thế kỷ X, một kiếm/một mặt ngọc và6 prompt cho Đinh Ngọc; DRAFT, chưa duyệt Master |
| [nhan-vat/nguyen-bac.md](06-art/nhan-vat/nguyen-bac.md) | Hình động Nguyễn Bặc |
| [ho-so-master-chat.md](06-art/ho-so-master-chat.md) | Ngữ cảnh cho chat mới về dựng hình nhân vật: kiến trúc rig và hiệu ứng, quy trình từ bộ 5 ảnh, tiến độ |

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

