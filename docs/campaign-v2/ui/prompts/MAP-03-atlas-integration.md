# Codex prompt MAP-03 — Tích hợp Atlas → Map → Mission

> 26/10/2026 · Thực hiện SAU MAP-01 và MAP-02

1. Đọc `CampaignScreen.tsx`, `ChapterOne.tsx`, `CampaignAtlas.tsx`, `CampaignMap.tsx` và `RegionalPanel.tsx` sau hai task.
2. Đồng bộ selected chapter, region và mission trên cùng state client; server profile là nguồn trạng thái unlock/complete.
3. Luồng: Campaign → Sử ký 6 chương → bản đồ vùng → chọn mission Mxx → thoại/sự kiện hoặc chuẩn bị trận → quay về đúng chương/vùng.
4. Nút Back hoạt động đúng khi người chơi đang đọc thoại, xem bản đồ, hoặc quay lại từ chiến đấu.
5. Không phá `RaidPanel`, `MusterPanel`, `HistoricalCodex`, `WorldLedger`, `RouteSummary`, `CampaignEnding`.
6. Kiểm M01, M06, M15, M17, M21, M24; IV/V song song; blocked nodes không thể mở khóa bằng UI; mobile và keyboard.

Không sửa core rewards, battle engine, AI, sound, voice. Không commit/push/deploy.
