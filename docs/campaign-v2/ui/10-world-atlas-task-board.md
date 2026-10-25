# 10 — Task Board mới: World Atlas đã duyệt

> 26/10/2026 · TASKS NOT IMPLEMENTED · Audio/Voice TODO — DEFERRED

**Supersedes UI scope wording of MAP-01/02/03 from TASK-BOARD.md, not the campaign design freeze.** Old map documentation remains historical planning; this file is the authoritative next task sequence for approved screenshot.

| Thứ tự | Task | Owner | Phụ thuộc | Gate |
|---|---|---|---|---|
| 0 | MAP-00 audit | Claude/Codex | Develop latest | Báo cáo source and 13 strongholds |
| 1 | MAP-ART-00 one world image without text/banners | Shan | MAP-00 art layout | Approved world artwork or documented fallback |
| 2 | MAP-01 three-column shell + Noto Serif scoped typography | Claude/Codex | MAP-00 | 6 chapters sidebar + map + panel desktop/mobile |
| 3 | MAP-02 12 faction strongholds + Hoa Lư and detailed panel | Claude/Codex | MAP-01 | Clicking 13 regions shows correct lore/status |
| 4 | MAP-03 chapter → stronghold → mission | Claude/Codex | MAP-02, UI-04 already DONE | Narrative/battle flow without side effect |
| 5 | MAP-ART-02 place approved image under SVG | Claude/Codex | MAP-ART-00, MAP-03 | Image fallback and dynamic hotspots |
| 6 | MAP-QA-01 | Claude/Codex | MAP-ART-02 | Lint/typecheck/test/build + historical audit |

**Tiến độ:** MAP-00 DONE (`11-map-00-audit.md`), MAP-01 DONE (khung ba cột, Noto Serif trong `.campaign-atlas`). MAP-ART-00 DONE (Shan gửi tranh 1536×1024 không chữ, 12 thành). MAP-02 + MAP-ART-02 DONE (`WorldMap.tsx`, `StrongholdPanel`, bản đồ 24 điểm cũ đã gỡ). MAP-03 DONE: thanh header Sử ký (Bản đồ / Nhiệm vụ / Sử ký / Binh lực + Cấp, Vàng, Lương), ba màn `atlas`/`mission`/`codex` lưu ở `coLau.campaign.v2.atlas` (chỉ là trạng thái giao diện), vào nhiệm vụ thì focus tiêu đề, quay lại bản đồ thì focus lại cờ cứ điểm; cột chương và panel đổi sang màu giấy cổ theo tranh. MAP-QA-01 chưa làm.

**Không cản UI code vì thiếu ảnh**: MAP-01..03 dùng SVG/CSS fallback, chỉ MAP-ART-02 chờ hình duyệt. BG-01 seven scene backdrops DONE và không phải asset world map.

**Asset visual target:** concept trong hội thoại (sử ký trái, bản đồ giữa, panel thông tin phải), chỉ dùng làm style/layout reference. AI-rendered labels contain inaccuracies and MUST NOT be used as canonical map text.

**Historical distinction:** 12 warlords / 13 map nodes including HQ / 24 missions — three different counts. Bình Kiều unresolved geographic placement. Chapter IV–V simultaneous after M12; chapter VI M16 and M20 gate.

**No expansion:** audio TTS BGM SFX voice remains TODO — DEFERRED. Six separate painted chapter maps optional future, NOT part of current blocking tasks.
