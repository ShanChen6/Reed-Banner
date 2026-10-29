# TASK BOARD — Campaign UI V2 (text/map NOW, audio LATER)

> Cập nhật: 26/10/2026

| Task | Nội dung | Trạng thái | Phụ thuộc |
|---|---|---|---|
| DOC-00 | Dọn docs Campaign 13/Legacy Tower | TODO | — |
| UI-00 | Audit UI hiện hành | TODO | DOC-00 |
| UI-01 | DialoguePlayer + Backlog | DONE: `DialoguePlayer.tsx`, `dialogue.ts`; lời dẫn mọi nhiệm vụ không phải hội kiến | UI-00 |
| UI-02 | Hội kiến M06 end-to-end | DONE: `DiplomacyScene.tsx` phát lời dẫn, lời đáp, kết cục từng câu (M06, M11–M13) | UI-01 |
| UI-03 | Tích hợp non-combat | DONE: lời đáp, kết thúc và màn thưởng lần đầu phát từng câu (`ChapterOne.tsx`) | UI-02 |
| UI-04 | Battle intro/outro | DONE: màn cuối trận đọc đủ lời kết (thắng) hoặc lời thua; phase giữa không chiếu lời kết; trận dở vào thẳng bước chuẩn bị | UI-03 |
| MAP-01 | Sử ký 6 chương | Shan tự làm (bản đồ + ảnh nền), Claude ghép sau | UI-00 |
| MAP-02 | Bản đồ theo vùng, panel nhiệm vụ | Shan tự làm (bản đồ + ảnh nền), Claude ghép sau | MAP-01 |
| MAP-03 | Tích hợp atlas/map/mission | Shan tự làm (bản đồ + ảnh nền), Claude ghép sau | UI-04, MAP-02 |
| BG-01 | Ảnh nền khung thoại | DONE: 7 tranh Shan vẽ ở `public/art/campaign/bg/`, chọn theo nhiệm vụ (`missionBackdrop`); `atlas.webp` để dành cho MAP-01 | UI-01 |
| UI-05 | Sử liệu, mobile và optional art | TODO | MAP-03 |
| QA-01 | Nghiệm thu toàn UI | Atlas DONE (`polish-v2/QA-P10.md`, 26/10); checklist thoại ở `06-nghiem-thu.md` chưa chạy | UI-05 |
| AUD-01…07 | Âm thanh, SFX, BGM, Voice | **TODO — DEFERRED** | Chỉ thực hiện khi UI hoàn thành, có yêu cầu mới |

**Không chuyển task từ TODO sang PASS dựa trên tài liệu; chỉ sau khi thực sự triển khai và kiểm tra.**

## World Atlas đã duyệt (thay phần MAP-01/02/03 ở bảng trên)

> Trước 27/10/2026 mục này là file riêng `docs/campaign-v2/ui/10-world-atlas-task-board.md` (gộp ở DOC-02, nội dung giữ nguyên).

> 26/10/2026 · TASKS NOT IMPLEMENTED · Audio/Voice TODO — DEFERRED

**Supersedes UI scope wording of MAP-01/02/03 from the table above, not the campaign design freeze.** Old map documentation remains historical planning; this file is the authoritative next task sequence for approved screenshot.

| Thứ tự | Task | Owner | Phụ thuộc | Gate |
|---|---|---|---|---|
| 0 | MAP-00 audit | Claude/Codex | Develop latest | Báo cáo source and 13 strongholds |
| 1 | MAP-ART-00 one world image without text/banners | Shan | MAP-00 art layout | Approved world artwork or documented fallback |
| 2 | MAP-01 three-column shell + Noto Serif scoped typography | Claude/Codex | MAP-00 | 6 chapters sidebar + map + panel desktop/mobile |
| 3 | MAP-02 12 faction strongholds + Hoa Lư and detailed panel | Claude/Codex | MAP-01 | Clicking 13 regions shows correct lore/status |
| 4 | MAP-03 chapter → stronghold → mission | Claude/Codex | MAP-02, UI-04 already DONE | Narrative/battle flow without side effect |
| 5 | MAP-ART-02 place approved image under SVG | Claude/Codex | MAP-ART-00, MAP-03 | Image fallback and dynamic hotspots |
| 6 | MAP-QA-01 | Claude/Codex | MAP-ART-02 | Lint/typecheck/test/build + historical audit |

**Tiến độ:** MAP-00 DONE (`11-map-00-audit.md`), MAP-01 DONE (khung ba cột, Noto Serif trong `.campaign-atlas`). MAP-ART-00 DONE (Shan gửi tranh 1536×1024 không chữ, 12 thành). MAP-02 + MAP-ART-02 DONE (`WorldMap.tsx`, `StrongholdPanel`, bản đồ 24 điểm cũ đã gỡ). MAP-03 DONE: thanh header Sử ký (Bản đồ / Nhiệm vụ / Sử ký / Binh lực + Cấp, Vàng, Lương), ba màn `atlas`/`mission`/`codex` lưu ở `coLau.campaign.v2.atlas` (chỉ là trạng thái giao diện), vào nhiệm vụ thì focus tiêu đề, quay lại bản đồ thì focus lại cờ cứ điểm; cột chương và panel đổi sang màu giấy cổ theo tranh. MAP-QA-01 DONE qua Polish V2 P10 (26/10): lint, typecheck, test, build và QA trình duyệt ghi ở `polish-v2/QA-P10.md`.

**Không cản UI code vì thiếu ảnh**: MAP-01..03 dùng SVG/CSS fallback, chỉ MAP-ART-02 chờ hình duyệt. BG-01 seven scene backdrops DONE và không phải asset world map.

**Asset visual target:** concept trong hội thoại (sử ký trái, bản đồ giữa, panel thông tin phải), chỉ dùng làm style/layout reference. AI-rendered labels contain inaccuracies and MUST NOT be used as canonical map text.

**Historical distinction:** 12 warlords / 13 map nodes including HQ / 24 missions — three different counts. Bình Kiều unresolved geographic placement. Chapter IV–V simultaneous after M12; chapter VI M16 and M20 gate.

**No expansion:** audio TTS BGM SFX voice remains TODO — DEFERRED. Six separate painted chapter maps optional future, NOT part of current blocking tasks.
