# 04 — Roadmap từng bước và điểm dừng để kiểm duyệt

> Cập nhật: 26/10/2026  
> Mục tiêu: **nâng UI đang tồn tại**, không thay nội dung/luật Campaign V2.

## Cách đọc

Mỗi task gồm: đầu vào → việc Codex phải làm → kết quả người chơi thấy → nghiệm thu → task kế. **Thực hiện tuần tự**, không chạy cả bộ một lần. File prompt copy-paste nằm trong `prompts/`.

| Thứ tự | Task | Làm ở đâu | Kết quả sau task | Gate |
|---|---|---|---|---|
| 0 | **DOC-00** | `docs/` | Không còn docs hướng dẫn Campaign 13 màn / Tower vô hạn như mode hiện hành | G0 |
| 1 | **UI-00** | Audit UI Campaign | Bảng component, luồng M06 và map hiện tại, ảnh chụp baseline | G1 |
| 2 | **UI-01** | `StoryBeats.tsx`, `DialoguePlayer.tsx` | 1 câu hiển thị/lần, next/back, backlog, skip đã xem | G2 |
| 3 | **UI-02** | `DiplomacyScene.tsx` | M06 nói chuyện từng câu → chọn → submit một lần → kết quả | G3 |
| 4 | **UI-03** | `ChapterOne.tsx` / content adapter | Áp dụng viewer cho toàn bộ non-combat M01–M24 | G4 |
| 5 | **UI-04** | Battle intro/outro + `ChapterOne` | Có thoại trước/sau trận, không lặp ở phase hoặc nhận thưởng kép | G5 |
| 6 | **MAP-01** | `CampaignAtlas.tsx` | Sử ký 6 chương với 4 mission/chương, 2 nhánh IV–V | G6 |
| 7 | **MAP-02** | `CampaignRegionPanel.tsx`, `CampaignMap.tsx` | Mở vùng/chương và chọn mission từ list không cần chạm marker nhỏ | G7 |
| 8 | **MAP-03** | `ChapterOne.tsx`, `CampaignScreen.tsx` | Một luồng Atlas → map → mission → story/battle → return | G8 |
| 9 | **UI-05** | History/mobile/keyboard | Sử liệu dễ mở, accessibility, responsive, ảnh tùy chọn | G9 |
| 10 | **QA-01** | Targeted checks, docs | Không regress state, history, rewards, các mode khác | G10 |

### Thời lượng dự tính (solo developer)

- DOC-00 & UI-00: 0.5–1 ngày.
- UI-01…04: 3–5 ngày, có thể kéo dài nếu chia lại component lớn.
- MAP-01…03: 2–4 ngày, vì SVG/layout đã tồn tại.
- UI-05 + QA-01: 1–3 ngày.

Đây là ước lượng lên kế hoạch, không phải cam kết thời gian; ưu tiên checkpoint chất lượng hơn số ngày.

## Gate/Giới hạn nghiệm thu

**G0:** docs index không nhắc Tower vô hạn như chế độ hiện tại; section cũ trong `09-che-do-choi.md` đã gỡ/sửa; lịch sử nguồn và reports vẫn còn.

**G1:** Codex báo những component đã tồn tại, đoạn render `Beats`, nơi lựa chọn được submit và cách map chọn mission; không code để tránh thay nhầm.

**G2:** Text-only viewer đọc một beat mỗi bước; next/back, backlog; nếu assets trống vẫn hoạt động.

**G3:** M06 lần đầu đi được đến confirmation; refresh/retry không nhận vàng hai lần; choice không đổi lịch sử.

**G4:** Tất cả mission sự kiện được mở/đọc từ `missionCopy`, không có fallback “nội dung đang cập nhật” cho mission đã có copy.

**G5:** M15/M21 vào trận và trả về đúng; UI không tự settle; ván nhiều phase không hiển thị kết cục sai.

**G6:** 6 chapter x 4 node, chapter IV/V song song và không để chương VI mở trước điều kiện.

**G7:** Nhiệm vụ tại Hoa Lư/Bố Hải chọn được bằng list; vùng mơ hồ không có tọa độ giả.

**G8:** Trở về Campaign không mất lựa chọn/chapter; Raid Hall và supply vẫn mở được.

**G9:** 390px/768px/desktop, tap >=44px, keyboard, `prefers-reduced-motion`, không overflow.

**G10:** Typecheck/lint/tests mục tiêu hoặc script hiện có liên quan, không tự chạy balance simulation hay full E2E nặng nếu không có lý do. Không sửa mode khác.

## Ví dụ chỉ làm một task mỗi lần

- Chạy `prompts/UI-01.md`.
- Mở màn có lời kể (ví dụ M01), bấm Tiếp/Trước/Nhật ký.
- Nếu tốt, mới chạy `prompts/UI-02.md` cho M06. Nếu chưa tốt, sửa UI-01, **không** chạy tiếp MAP-01.

## Đầu ra Codex sau MỖI task

1. Danh sách file tạo/sửa/xóa.
2. Luồng trước → sau.
3. Những test hoặc kiểm tra **thực sự đã chạy**; không báo PASS nếu chưa chạy.
4. Vấn đề tồn tại, đặc biệt dependency state/server.
5. Chỉ tiếp task sau khi người dùng duyệt nếu có khác biệt UI đáng kể.