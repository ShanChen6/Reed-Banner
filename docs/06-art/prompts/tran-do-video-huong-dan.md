# Prompt video hướng dẫn Trận Đồ (Veo 3)

> Cập nhật: 02/11/2026
> Trạng thái: **DRAFT** — prompt để Shan tạo video bằng Veo 3; chưa có video. Luật chơi lấy từ [giao diện Trận Đồ](../../05-ui-ux/screens/tran-do.md) (bảng luật ở `src/app/game/formation/Rules.tsx`).

Veo 3 tạo clip ngắn (khoảng 8 giây, có tiếng). Veo vẽ chữ và giao diện game rất kém, nên video **không quay màn hình game** mà diễn tả luật bằng một **sa bàn thật**: quân tướng là thẻ gỗ sơn mài đặt lên bản đồ bị phủ sương. Chữ và giải thích để lời dẫn tiếng Việt và phụ đề dựng sau.

## 1. Prompt chính (dán thẳng vào Veo 3)

```
Cinematic hand-painted 2D animation in the style of a Vietnamese historical fantasy game, warm golden-hour light. Top-down angled view of a small square wooden war-table board, 3x3 grid of lacquered tiles. Every tile is covered by an opaque brown mist-cloud cover tile, except a few already lit tiles that reveal a painted landscape of limestone mountains and rice fields underneath. On the board lie small round wooden character tokens, each with a tiny red profession badge and a tiny blue-green element badge.

Shot: a hand in a sleeve of 10th-century Vietnamese armor-cloth picks up one token and places it on an empty tile next to a neighbour. A soft golden light pulses between the two tokens to show they match (same badge). A second token is held over a tile whose neighbour does not match: the tile flashes dull red and the token is lifted away. Then a third matching token completes a full row of three; the row glows, the tokens dissolve into golden dust, and the mist covers on that row fade away, revealing the bright painted map beneath. Slow gentle push-in, shallow depth of field, soft wood-and-paper textures, no UI, no readable text, no watermark.

Audio: soft bamboo flute and a low drum, subtle wooden click when each token is placed, a gentle chime when the row clears, a low dull thud for the wrong placement. A calm male Vietnamese narrator says: "Đặt quân cạnh quân đã có: cùng nghề hoặc cùng hệ với từng quân kề. Kín một hàng thì khai thông, mở hết sa bàn là thắng."
```

## 2. Nếu cần video dài hơn (nối nhiều clip)

Veo 3 mỗi lần tạo một clip; dùng chức năng nối tiếp (extend) hoặc tạo từng cảnh rồi ghép, giữ nguyên **khối phong cách ở đầu prompt 1** cho mọi cảnh. Gợi ý bốn cảnh, mỗi cảnh một ý luật:

| Cảnh | Ý luật | Lời dẫn gợi ý (tiếng Việt) |
|---|---|---|
| 1 | Chạm ô trống sát quân đã có; ván đầu đặt đâu cũng được | "Mỗi lượt bạn cầm một quân tướng. Hãy đặt nó sát một quân đã có." |
| 2 | Cùng nghề **hoặc** cùng hệ với **từng** quân kề (có thể khác tiêu chí với từng quân) | "Quân mới phải cùng nghề hoặc cùng hệ với từng quân kề." |
| 3 | Chướng ngại (núi, rừng, đầm lầy, thành lũy) không đặt được, không nối được; Quân Lệnh khớp mọi quân; Thu Hồi xóa một quân | "Chướng ngại chắn đường. Quân Lệnh khớp mọi quân, Thu Hồi gỡ một quân khỏi bàn." |
| 4 | Bỏ Lệnh làm ngọn lửa bùng lên, dọn hàng thì lửa tắt; khai thông hết là thắng, hiện cả bản đồ | "Bỏ Lệnh sẽ nhóm lửa; lửa đầy mà còn bỏ nữa là thua. Khai thông hết sa bàn để thấy cả bản đồ." |

Mẫu prompt cho cảnh 3 (thay phần "Shot" của prompt chính): *the same table, a tile is occupied by a small painted stone mountain, another by a cluster of trees, a swamp pool and a fortress wall; a token cannot be placed there and slides back; a golden "wild" token with a plain gold coin face fits between two mismatched tokens and glows with both colours.*

## 3. Lưu ý

- Thêm `Negative prompt` nếu công cụ cho phép: `text, letters, subtitles, UI, HUD, logo, watermark, modern objects, English speech`.
- Luật đổi (ví dụ thang Bỏ Lệnh, quân đặc biệt) thì sửa lời dẫn ở đây theo [giao diện Trận Đồ](../../05-ui-ux/screens/tran-do.md).
- Nên dựng phụ đề tiếng Việt khớp lời dẫn sau khi có video, vì Veo hay sai dấu khi tự vẽ chữ.
