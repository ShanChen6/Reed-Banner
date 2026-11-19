# Prompt icon điểm nhấn Cẩm nang (6 hình)

> Cập nhật: 20/11/2026
> Trạng thái: **IMPLEMENTED** (20/11/2026) — đủ 6 ảnh Shan gửi (tấm bảng ngọc vuông viền vàng thay cho huy hiệu tròn ban đầu) ở `public/art/highlights/<mã>.webp` (192 px), vẽ ở `FEATURES` trong `src/app/cam-nang/page.tsx`.

Sáu thẻ điểm nhấn luật chơi ở trang Cẩm nang chiến trận. Shan muốn mỗi thẻ có hình riêng, không dùng lại hình quân cờ (bảng bảy loại ô ngay dưới đã có).

## Cách dùng

- Mỗi khối là một hình. Tạo ở 1024×1024 rồi gửi Claude PNG đặt đúng tên trong khối (ví dụ `highlight_special.png`). Claude tách nền, cắt theo huy hiệu, lưu `public/art/highlights/<mã>.webp` (192 px) và gắn vào `FEATURES`.
- Cùng một kiểu **tấm bảng ngọc vuông bo góc viền vàng, hoa văn tam giác Đông Sơn ở bốn góc** như năm ảnh đã có (Shan chọn 20/11/2026).
- Nền tách: **hồng `#ff00ff`** cho cả bộ, vì tấm bảng màu ngọc lục sẽ mất nếu tách trên nền xanh lá.
- Nên đính kèm 1–2 icon chế độ (`public/art/modes/`) làm tham chiếu nét vẽ.
- Không chữ, không người, không khung vuông. Giữ clean-room như các bộ trước.

**Ô đặc biệt** · `highlight_special.png`

Ghép chữ L, chữ T, thẳng 5 tạo ô bản yếu, bản mạnh, nổ tung cả vùng.

```text
Square 1024x1024 fantasy game RULES HIGHLIGHT icon for a turn-based match-3 RPG guide page. Subject: A burst of golden light exploding outward from the center of a small 3x3 grid of carved jade squares, the middle square cracking open with sparks and short radiating rays, a few square fragments flying out. Energy and color: jade green, gold and bright amber. Style: same hand-painted family as the existing Co Lau mode icons and skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object on a rounded-square lacquered dark jade-green plaque with a thin gold rim and small Dong Son triangle motifs in the four corners, the object may overlap the plaque edge slightly, plaque fills about 90% of the canvas, readable at 48 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Nộ và bị động** · `highlight_rage.png`

Trống trận và đòn nhận vào tích Nộ; đầy 100 thì bị động theo hệ bùng phát.

```text
Square 1024x1024 fantasy game RULES HIGHLIGHT icon for a turn-based match-3 RPG guide page. Subject: A bronze Dong Son war drum seen from a three-quarter angle, its face glowing hot red-orange, a ring-shaped gauge of flame around the drum filled to the top, small embers rising. Energy and color: bronze, crimson and flame orange. Style: same hand-painted family as the existing Co Lau mode icons and skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object on a rounded-square lacquered dark jade-green plaque with a thin gold rim and small Dong Son triangle motifs in the four corners, the object may overlap the plaque edge slightly, plaque fills about 90% of the canvas, readable at 48 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Lương thực, sĩ khí** · `highlight_morale.png`

Lương tụt mỗi lượt; no thì đánh mạnh, đói thì yếu, cạn thì mất máu.

```text
Square 1024x1024 fantasy game RULES HIGHLIGHT icon for a turn-based match-3 RPG guide page. Subject: A woven bamboo rice basket overflowing with white rice and two square banh chung wrapped in green leaves, a small red army pennant stuck in the rice. Energy and color: warm straw yellow, leaf green and red. Style: same hand-painted family as the existing Co Lau mode icons and skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object on a rounded-square lacquered dark jade-green plaque with a thin gold rim and small Dong Son triangle motifs in the four corners, the object may overlap the plaque edge slightly, plaque fills about 90% of the canvas, readable at 48 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Năng lượng và kỹ năng** · `highlight_energy.png`

Ô âm dương cho năng lượng; mỗi lượt dùng tối đa một kỹ năng trước khi đổi ô.

```text
Square 1024x1024 fantasy game RULES HIGHLIGHT icon for a turn-based match-3 RPG guide page. Subject: A glowing blue-and-white yin-yang orb hovering above an open bamboo-slip scroll, a spiral of blue energy flowing from the orb into the scroll. Energy and color: deep blue, white and gold. Style: same hand-painted family as the existing Co Lau mode icons and skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object on a rounded-square lacquered dark jade-green plaque with a thin gold rim and small Dong Son triangle motifs in the four corners, the object may overlap the plaque edge slightly, plaque fills about 90% of the canvas, readable at 48 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Trang bị 5 phẩm** · `highlight_gear.png`

9 ô trang bị, phẩm Trắng tới Cam; đủ bộ được thưởng; ghép, cường hóa tới +5.

```text
Square 1024x1024 fantasy game RULES HIGHLIGHT icon for a turn-based match-3 RPG guide page. Subject: A bronze helmet with a red plume resting on a small stack of armor scales, a curved Dai Viet saber leaning across it, a faint upward-pointing gold glow suggesting an upgrade. Energy and color: bronze, steel and red with gold. Style: same hand-painted family as the existing Co Lau mode icons and skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object on a rounded-square lacquered dark jade-green plaque with a thin gold rim and small Dong Son triangle motifs in the four corners, the object may overlap the plaque edge slightly, plaque fills about 90% of the canvas, readable at 48 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**AI Tianwu** · `highlight_ai.png`

Đối thủ AI từ Dễ tới Ác mộng, chỉ thấy những gì bạn thấy, chịu cùng luật.

```text
Square 1024x1024 fantasy game RULES HIGHLIGHT icon for a turn-based match-3 RPG guide page. Subject: A carved wooden strategist's game piece shaped like a general's token standing on a small board corner, a calm watchful bronze eye emblem engraved on its front, thin threads of light linking it to two smaller pieces. Energy and color: dark wood, bronze and cool teal. Style: same hand-painted family as the existing Co Lau mode icons and skill icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object on a rounded-square lacquered dark jade-green plaque with a thin gold rim and small Dong Son triangle motifs in the four corners, the object may overlap the plaque edge slightly, plaque fills about 90% of the canvas, readable at 48 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```
