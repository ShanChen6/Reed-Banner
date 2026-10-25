# 11 — MAP-00: kiểm kê World Atlas (develop 26/10/2026)

> Kết quả của prompt `prompts/MAP-00-world-atlas-audit.md`. Chỉ ghi nguồn sự thật và hợp đồng dữ liệu. Không đổi gameplay.

## 1. Nguồn sự thật

| Dữ liệu | Nằm ở | Ghi chú |
|---|---|---|
| 24 nhiệm vụ M01–M24, loại, tên đất, độ chắc địa danh, điều kiện mở | `src/core/campaign/storyNodes.ts` (`STORY_NODES`) | Tên đất ở `location.name`. Bố Hải có hai tên gọi ("Bố Hải Khẩu", "Vùng Bố Hải" ở M07) |
| 6 chương, câu hỏi chương, vùng chương, truyền thuyết và sử chép | `src/core/campaign/chapterOne.ts` (`CAMPAIGN_CHAPTERS`) | `chapterStatus`, `chapterFocus`, `campaignFocusChapter` đọc tiến độ từ hồ sơ |
| Mở/khép chương | `src/core/progress/campaignState.ts` (`chapterUnlocked`, `chapterCompleted`) | Sau M12, Chương IV và V mở cùng lúc |
| 12 sứ quân, nhiệm vụ kết cục, nhóm sổ thế cục | `src/core/campaign/factions.ts` (`CAMPAIGN_FACTION_RESOLUTIONS`, `campaignWorldLedger`) | 1 liên minh, 3 quy phục, 6 đánh dẹp, 2 tan rã/còn tranh luận |
| Tên, tước hiệu, kết cục theo sử | `src/core/campaign/warlords.ts` (`WARLORD_RECORDS`) | Theo `warlord-matrix.md` |
| Kết cục đã ghi của người chơi | `profile.campaign.factions` (server) | Chỉ ghi một lần khi nhiệm vụ kết cục hoàn thành |

## 2. Giao diện hiện có (trước MAP-01)

- `CampaignScreen.tsx` → `ChapterOne.tsx`: hàng nút 6 chương, bản đồ `CampaignMap.tsx` (24 điểm nhiệm vụ trên SVG giấy dó, bố cục `mapLayout.ts`), danh sách nhiệm vụ, khung chi tiết nhiệm vụ (DialoguePlayer, DiplomacyScene, BattlePrep), `WorldLedger`, `WarlordCodex`, rồi `RaidHall`.
- Bản đồ cũ đặt **nhiệm vụ**, không đặt **cứ điểm**. Nét nối là điều kiện mở khóa, không phải đường hành quân.
- API dùng: `fetchProfile`, `completeCampaignEventOnline`, `createOnline`, `fetchOnline`. Bấm chương hay bấm điểm không gọi API.

## 3. Hợp đồng `WorldStronghold` (`src/app/game/campaign/worldAtlas.ts`)

```ts
interface WorldStronghold {
  id: "hoaLu" | CampaignFactionId;
  place: string;                 // tên đất như nhiệm vụ ghi
  faction: CampaignFactionId | null; // Hoa Lư là đầu não, không phải sứ quân
  certainty: "recorded" | "traditional" | "disputed" | "fictional";
  modernRegion?: string;
  missions: CampaignMissionId[]; // mọi nhiệm vụ ở đất này
  at: [x, y] | null;             // khung 1536×1024; null = chưa định vị
}
```

- 13 điểm: Hoa Lư và 12 cứ điểm. Ba con số khác nhau: 12 sứ quân, 13 điểm trên bản đồ, 24 nhiệm vụ.
- Hoa Lư gắn M01–M04, M09, M10, M23, M24. Bố Hải Khẩu gắn M05–M08. Mỗi sứ quân còn lại gắn đúng nhiệm vụ kết cục của mình.
- Bình Kiều (Ngô Xương Xí, M12) có `at: null` vì sử chép "nay không rõ chỗ nào". Bản đồ hiện nó trong danh sách riêng.
- M22 không gắn đất nào (`UNANCHORED_MISSIONS`), chỉ hiện trong danh sách nhiệm vụ của Chương VI.
- Tọa độ là bố cục minh họa: lấy kinh/vĩ độ gần đúng như `mapLayout.ts` rồi dãn ra khung 3:2. Thứ tự đông/tây/bắc/nam giữ đúng. Không suy ra nơi giao chiến.
- Test: `tests/game/campaign-world-atlas.test.ts`.

## 4. Ảnh mẫu Shan gửi (26/10)

Đây là mục tiêu bố cục, không phải nguồn dữ liệu. 12 cặp người–đất chính khớp với Toàn thư và với game. Các điểm thừa do AI tự thêm không đưa vào: Hưng Hóa, Nghệ An (Phạm Bành), Cửa Biển, Ái Châu (Đinh Liễn). Tên viết sai trong ảnh: "Kiều Thu" phải là Kiều Thuận, "Lư Đường" phải là Lữ Đường. Ảnh còn đặt Hoa Lư ở giữa, nhưng theo vị trí thật Hoa Lư nằm ở phía nam các cứ điểm.

Tranh nền dùng được (MAP-ART-00): không có chữ, không có cờ, khung 1536×1024. Thành trì phải vẽ ở đúng các điểm `at` của `WORLD_STRONGHOLDS`; ảnh hướng dẫn vị trí nằm trong thư mục demo của dự án.

## 5. Việc tiếp theo

MAP-01 (khung ba cột + Noto Serif) làm cùng PR với bản kiểm kê này. MAP-02 thay bản đồ 24 điểm bằng 13 cứ điểm và panel chi tiết. MAP-03 nối luồng chương → cứ điểm → nhiệm vụ. Âm thanh vẫn TODO — DEFERRED.
