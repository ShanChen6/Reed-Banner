# Prompt video hướng dẫn Trận Đồ (Veo 3)

> Cập nhật: 02/11/2026
> Trạng thái: **DRAFT** — prompt để Shan tạo video bằng Veo 3; chưa có video. Luật chơi lấy từ [giao diện Trận Đồ](../../05-ui-ux/screens/tran-do.md) (bảng luật ở `src/app/game/formation/Rules.tsx`).

Chọn nơi tạo: Google Flow (gói miễn phí), Gemini app hoặc Vertex AI; tránh trang trung gian chèn watermark. Veo 3 tạo clip ngắn (khoảng 8 giây, có tiếng). Veo vẽ chữ và giao diện game rất kém, nên video **không quay màn hình game** mà diễn tả luật bằng một **sa bàn thật**: quân tướng là thẻ gỗ sơn mài đặt lên bản đồ bị phủ sương. Chữ và giải thích để lời dẫn tiếng Việt và phụ đề dựng sau.

## 1. Prompt chính, bản thử một clip (đã thử, còn lỗi — xem mục 2)

```
Cinematic hand-painted 2D animation in the style of a Vietnamese historical fantasy game, warm golden-hour light. Top-down angled view of a small square wooden war-table board, 3x3 grid of lacquered tiles. Every tile is covered by an opaque brown mist-cloud cover tile, except a few already lit tiles that reveal a painted landscape of limestone mountains and rice fields underneath. On the board lie small round wooden character tokens, each with a tiny red profession badge and a tiny blue-green element badge.

Shot: a hand in a sleeve of 10th-century Vietnamese armor-cloth picks up one token and places it on an empty tile next to a neighbour. A soft golden light pulses between the two tokens to show they match (same badge). A second token is held over a tile whose neighbour does not match: the tile flashes dull red and the token is lifted away. Then a third matching token completes a full row of three; the row glows, the tokens dissolve into golden dust, and the mist covers on that row fade away, revealing the bright painted map beneath. Slow gentle push-in, shallow depth of field, soft wood-and-paper textures, no UI, no readable text, no watermark.

Audio: soft bamboo flute and a low drum, subtle wooden click when each token is placed, a gentle chime when the row clears, a low dull thud for the wrong placement. A calm male Vietnamese narrator says: "Đặt quân cạnh quân đã có: cùng nghề hoặc cùng hệ với từng quân kề. Kín một hàng thì khai thông, mở hết sa bàn là thắng."
```

## 2. Bộ prompt từng cảnh cho Google Flow (gói miễn phí)

Bản thử đầu (qua trang trung gian có watermark) có các lỗi: lưới không đúng 3×3, quân nằm đè đường kẻ, quân chỉ một màu thay vì hai huy hiệu, thiếu cảnh quân sai, kết thúc mơ hồ. Bộ dưới đây sửa các lỗi đó: **mỗi cảnh một ý luật, một hành động**, và lặp lại khối cố định để các cảnh giống một bàn.

Cách làm trong Flow: tạo cảnh 1 bằng *Text to Video*; các cảnh sau dùng *Frames to Video* (khung cuối cảnh trước làm khung đầu) hoặc, nếu có, *Extend*. Gói miễn phí có hạn mức và có thể chỉ cho mô hình nhanh, có thể chưa có tiếng hoặc còn dấu nhỏ; vì vậy các prompt **không yêu cầu lời thoại**: lời dẫn thu riêng (mục 3). Hạn mức thay đổi theo thời điểm, kiểm tra trên trang Flow.

**Khối cố định (dán ở đầu MỌI cảnh):**

```
Cinematic hand-painted 2D animation, Vietnamese historical fantasy game, warm golden-hour light, soft wood and paper textures, shallow depth of field. Fixed camera angled top-down looking at a small square wooden war-table board with EXACTLY a 3x3 grid of 9 equal square tiles. Each token sits centered INSIDE one tile, never on the lines. Tokens are plain round wooden discs, each with two small badges on the same disc: a small red circle badge at the top-left and a small blue-green circle badge at the bottom-right. Tiles not yet cleared are covered by an opaque brown mist-cloud cover; cleared tiles reveal a painted landscape of limestone mountains and rice fields. The hand wears 10th-century Vietnamese armor-cloth sleeve. No UI, no readable text, no letters, no watermark.
```

**Cảnh 1 — Đặt quân sát quân đã có** (lời dẫn: "Mỗi lượt bạn cầm một quân tướng. Hãy đặt nó sát một quân đã có.")
```
[khối cố định] One token already rests in the center tile. A hand places a second token on the tile directly to its right, with a soft wooden click. The mist cover above that tile thins away and a small patch of painted landscape becomes visible. Calm slow movement, 8 seconds.
```

**Cảnh 2 — Cùng nghề hoặc cùng hệ với từng quân kề** (lời dẫn: "Quân mới phải cùng nghề hoặc cùng hệ với từng quân kề.")
```
[khối cố định] Two tokens lie in adjacent tiles. The hand holds a token whose red badge looks like the left neighbour's red badge: it is placed on the tile touching both, a golden light line connects the matching badges, and the tile glows warmly. Then the hand tries another token with different badges: the tile flashes dull red, a low thud sounds, and the token is lifted back into the hand. Calm, readable, 8 seconds.
```

**Cảnh 3 — Chướng ngại, Quân Lệnh, Thu Hồi** (lời dẫn: "Chướng ngại chắn đường. Quân Lệnh khớp mọi quân, Thu Hồi gỡ một quân khỏi bàn.")
```
[khối cố định] Three tiles are blocked by tiny painted obstacles standing on dark stone tiles: a mountain, a clump of trees, a swamp pool. A token slides toward the mountain tile and bounces back. A golden plain-faced coin token (the wild token) is placed between two mismatched tokens and glows with both colours. A hand then lifts one token off the board and it dissolves into gold dust. 8 seconds.
```

**Cảnh 4 — Dọn hàng, lửa Bỏ Lệnh, thắng** (lời dẫn: "Bỏ Lệnh sẽ nhóm lửa; lửa đầy mà còn bỏ nữa là thua. Khai thông hết sa bàn để thấy cả bản đồ.")
```
[khối cố định] A small lantern flame at the board corner flickers larger when the hand swaps a token, then shrinks when a token is placed. The third token completes a full row of three: the row glows, the tokens dissolve into golden dust, and the mist over the row disappears. The camera slowly pulls back as all remaining mist drifts away and the whole painted landscape is revealed in golden light. 8 seconds.
```

## 3. Ghép video và lời dẫn

- Ghép bốn cảnh bằng CapCut hoặc DaVinci (chồng nhau 0,3 giây, cross-dissolve); thu hoặc dùng đọc văn bản tiếng Việt một lần cho cả video với lời dẫn ở từng cảnh.
- Thêm nhạc nền liền mạch (sáo trúc, trống nhẹ) lúc dựng; phụ đề tiếng Việt dựng sau.

## 4. Lưu ý

- Thêm `Negative prompt` nếu công cụ cho phép: `text, letters, subtitles, UI, HUD, logo, watermark, modern objects, English speech`.
- Luật đổi (ví dụ thang Bỏ Lệnh, quân đặc biệt) thì sửa lời dẫn ở đây theo [giao diện Trận Đồ](../../05-ui-ux/screens/tran-do.md).
- Nên dựng phụ đề tiếng Việt khớp lời dẫn sau khi có video, vì Veo hay sai dấu khi tự vẽ chữ.
