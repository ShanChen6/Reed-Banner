# DOC-01 — Kiểm kê và kiến trúc lại tài liệu Reed Banner

> Cập nhật: 27/10/2026  
> Trạng thái: **AUDIT / PROPOSAL — KHÔNG DI CHUYỂN FILE**  
> Cơ sở: `develop` và metadata PR #179, #181, #182 tại thời điểm kiểm tra.

## 1. Mục tiêu và giới hạn xác minh

Mục tiêu của DOC-01 là xác định **nguồn sự thật duy nhất (single source of truth)**, các vùng tài liệu chồng chéo và bản đồ di chuyển trước khi thực hiện DOC-02. Không sửa business rules, code, asset, API, gameplay hoặc UI.

Bản kiểm kê này được đối chiếu với các file/index **đã đọc trực tiếp** qua GitHub connector và danh sách file thay đổi trong các PR. **Không phải manifest toàn bộ file của repo**: phương thức truy cập trong lần audit này không liệt kê được đầy đủ cây `docs/`. DOC-02 phải chạy inventory tự động trên checkout thật (ví dụ `git ls-files 'docs/**/*.md' 'docs/*.md'`) và đối chiếu trước khi di chuyển bất kỳ file nào. Không suy đoán rằng một thư mục không được liệt kê thì không tồn tại.

## 2. Bản đồ các nguồn hiện có đã xác minh

| Vị trí hiện tại | Chức năng thực tế | Phân loại cho DOC-02 |
|---|---|---|
| `docs/README.md` | Mục lục và quy ước viết docs, chưa lập chỉ mục đầy đủ UI hiện hành | Entry point canonical, cần cập nhật |
| `docs/design/01-*.md` tới `22-*.md` (theo index và các file được kiểm tra) | Design nền tảng battle, roster, tiến trình, chế độ, art, skill; các số đầu tên là lịch sử thứ tự tạo | Chia domain sau khi lập manifest |
| `docs/design/09-che-do-choi.md` | Mode implementation baseline và các luật hiện hành, có dẫn về future proposals | **Canonical tạm thời cho mode đang hoạt động** |
| `docs/design/11-giao-dien.md` | Bố cục trận chiến/battle controls | Canonical cho battle HUD/UI, không nhập nhằng với Home/modes |
| `docs/design/13-hinh-anh.md` | Bảng màu production, art references, asset conventions | Canonical hiện tại cho art tokens; không tạo bảng màu thứ hai |
| `docs/design/15-ke-hoach-do-hoa.md` | Kế hoạch art/animation với trạng thái đề xuất | Roadmap art, giữ reference tới art bible |
| `docs/ui-design-system/README.md` | Entry point Home + game-mode UI, nguồn game rules, scope | **Canonical tạm thời cho Home và UI các mode ngoài Campaign** |
| `docs/ui-design-system/game-mode-ui-spec.md` | Đặc tả chung và từng màn Home/Trial/Destiny/Survival/Daily/Arena | Canonical UI spec; Home V2 thuộc **mục 14 của PR #182** |
| `docs/ui-design-system/implementation-roadmap.md` | Roadmap UI-00…UI-09, gates/QA | Canonical UI implementation plan; UI-02A…E thuộc PR #182 |
| `docs/campaign-v2/` | Campaign V2 (6 chương, 24 nhiệm vụ), tài liệu story/contract/QA | Canonical Campaign mechanics/history, giữ nguyên |
| `docs/campaign-v2/ui/` | UI riêng Campaign: atlas, hội thoại, roadmap, QA | Canonical Campaign UI (ngoài scope redesign Home) |
| `docs/dual-tower/` | Live Twin Towers, rules/player help, QA, feature flags | Canonical chuyên biệt cho Trial/Destiny runtime |
| `docs/game-modes/` | Product directions, Binh Pháp, Liệt Truyện, tower/survival future, design-only | Canonical **proposed/future mode GDD**, không suy ra đã implement |
| `docs/lo-trinh.md` | Roadmap dự án mức cao | Canonical roadmap mức project, không copy chi tiết task |
| `docs/cau-hoi-mo.md` | TODO/open questions | Canonical câu hỏi cần quyết định |
| `docs/nhat-ky-thay-doi.md` | Nhật ký quyết định theo thời gian | Giữ nguyên lịch sử, có thể chuyển sang decisions |
| `docs/audits/`, `docs/reports/`, `docs/plans/` | Audit, bằng chứng, kết quả mô phỏng, task handoff | Historical evidence và plans; giữ provenance, không nhập toàn bộ vào GDD |

## 3. Trùng lặp và rủi ro đã xác nhận

### UI Home

- PR #179 (đã merge) tạo bộ `docs/ui-design-system/` cho Home và mode UI.
- PR #181 (đã **đóng, không merge**) tạo `docs/design/23-home-v2-dai-ban-doanh.md` trùng nguồn; không nên khôi phục đường dẫn này.
- PR #182 (đang mở tại thời điểm audit) bổ sung Home V2 **ngay trong** `docs/ui-design-system/game-mode-ui-spec.md` và UI-02A…E trong roadmap, là hướng hợp nhất được chọn.

**Quyết định:** Không tạo Home spec độc lập trong `docs/design/`. Sau khi PR #182 merge, sửa Home tại canonical UI spec; nếu DOC-02 sau này tách `screens/home.md`, chỉ một file được nhận quyền canonical và phải có redirect/link từ đường dẫn cũ.

### Mode implementation và future

- `docs/design/09-che-do-choi.md` mô tả baseline thực tế.
- `docs/game-modes/README.md` phân biệt `APPROVED PRODUCT DIRECTION`, `PROPOSED MVP`, `CURRENT IMPLEMENTATION`, `BACKLOG`.
- `docs/dual-tower/` và `docs/campaign-v2/` chứa contract chuyên biệt.

**Quyết định:** Không gộp tài liệu design-only với live rules thành một bản tóm tắt mất trạng thái. Trang index per-mode link tới live rules, future proposal, UI spec và status.

### Màu sắc và art

- `docs/design/13-hinh-anh.md` có bảng màu production; `docs/ui-design-system/game-mode-ui-spec.md` nêu token **proposal**.
- **Quyết định:** Code/theme production là chân lý kỹ thuật; art bible là visual reference; UI tokens proposal phải được mapping tới CSS thực tế trước khi đổi.

### Chiến dịch và thay đổi lịch sử

- Campaign V2 đã bỏ legacy 13-stage flow; `docs/campaign-v2/ui/` vẫn có các mốc đã triển khai và các TODO.
- **Quyết định:** Không chuyển docs lịch sử thành chỉ dẫn triển khai; chuyển hoặc gắn nhãn `SUPERSEDED`/ `ARCHIVED` sau khi lập bảng đối chiếu.

## 4. Target information architecture — đề xuất, chưa thực hiện

```text
docs/
  README.md                    # Map duy nhất dẫn vào các domain
  00-overview/                 # vision, glossary, documentation-map
  01-gameplay/                 # battle, board, skill, economy, balance rules
  02-game-modes/
    campaign/
    dual-tower/
    survival/
    daily/
    arena/
    future/                    # Binh Pháp, Liệt Truyện, Viễn Chinh (state-tagged)
  03-characters/
  04-equipment/
  05-ui-ux/
    design-system/
    screens/                   # home, trial, destiny, survival, daily, arena
    campaign/                  # Campaign UI riêng, không thay đổi visual
    implementation/
  06-art/
  07-architecture/
  08-testing/
  09-roadmap/
  decisions/                   # quyết định, supersedes và changelog
  archive/                     # tài liệu lịch sử, không phải current spec
```

Cấu trúc trên là mục tiêu dài hạn, không bắt buộc di chuyển mọi báo cáo/asset docs cùng lúc. Giữ `docs/reports/` và `docs/audits/` nếu chúng hữu ích cho provenance và đường dẫn của scripts/tests. Có thể dùng mapping virtual/index trước khi đổi path vật lý.

## 5. Mapping di chuyển sơ bộ (DOC-02 mới thực hiện)

| Nguồn | Đích đề xuất | Điều kiện |
|---|---|---|
| `docs/ui-design-system/game-mode-ui-spec.md` | `docs/05-ui-ux/screens/` + design-system references | Chỉ tách theo màn sau khi PR #182 merge; giữ một Home canonical |
| `docs/ui-design-system/implementation-roadmap.md` | `docs/05-ui-ux/implementation/roadmap.md` | Bảo toàn UI-00…09 và UI-02A…E |
| `docs/game-modes/` | `docs/02-game-modes/future/` và index theo mode | Giữ nhãn design-only, không mạo nhận live |
| `docs/dual-tower/` | `docs/02-game-modes/dual-tower/` | Kiểm tra tất cả references từ scripts/tests |
| `docs/campaign-v2/` | `docs/02-game-modes/campaign/` | Rủi ro link cao: chia riêng, có review gate |
| `docs/design/11-giao-dien.md` | `docs/05-ui-ux/screens/battle.md` | Kiểm tra thuật ngữ và link hiện tại |
| `docs/design/13-hinh-anh.md` | `docs/06-art/art-bible.md` | Không làm mất asset registry và tokens |
| `docs/nhat-ky-thay-doi.md` | `docs/decisions/changelog.md` | Preserve original date/order |
| `docs/audits/`, `docs/reports/` | Giữ nguyên, link theo domain | Tránh đổi evidence URL hoặc CI path không cần thiết |

## 6. Quy trình triển khai có kiểm soát

**DOC-01 (PR này):** inventory & canonical map. Không move/xóa.

**DOC-02:** tạo manifest **tất cả** tracked Markdown, chọn mỗi canonical owner, move theo domain thành nhiều PR nhỏ; kiểm tra markdown links/anchors, source references, import/script docs path, relative images. Mỗi PR có bảng cũ→mới, stale-reference report, rollback. Không xóa tài liệu lịch sử trước khi sao lưu thông tin và xác nhận `SUPERSEDED`.

**DOC-03:** governance + CI link validation. Mỗi tài liệu chỉ có 1 H1, cập nhật ngày, loại `CANONICAL/REFERENCE/HISTORY`, và trạng thái `DRAFT/APPROVED/IMPLEMENTED/DEFERRED/SUPERSEDED/ARCHIVED`. `APPROVED` không đồng nghĩa `IMPLEMENTED`. Claude/Codex phải tìm canonical qua `docs/README.md` rồi sửa đúng file thay vì tự tạo file tương tự.

## 7. Acceptance gate trước DOC-02

- [x] Đã xác minh nguồn UI trùng và trạng thái PR #179/#181/#182.
- [x] Đã xác minh các entrypoint lớn từ index và file thực tế.
- [x] Đã đề xuất target structure và mapping ưu tiên.
- [x] Sinh full manifest từ `git ls-files` trên checkout và phân loại toàn bộ Markdown ([DOC-01-manifest.md](DOC-01-manifest.md)).
- [x] Kiểm tra toàn bộ links/anchors và docs path references trong repository (manifest mục 4–5).
- [x] Chốt canonical owner cho từng nhóm file chưa có trong audit (manifest mục 3, 6).
- [x] Duyệt mapping cụ thể trước khi move (Shan, 27/10/2026).
- [x] Sau PR #182 merge, rebase mapping Home V2 để tránh conflict (PR #182 đã merge trước manifest).

**DOC-01 hoàn tất** ngày 27/10/2026: manifest đầy đủ 182 file, bảng ánh xạ và quyết định của Shan ở [DOC-01-manifest.md](DOC-01-manifest.md).
