# Prompt icon chế độ chơi (14 hình)

> Cập nhật: 19/11/2026
> Trạng thái: **DRAFT** — đã có ảnh 5/14 (19/11/2026): Thao Luyện, Giao Tranh, Bình Loạn, Tháp Thí Luyện, Quần Hùng ở `public/art/modes/<slug>.webp` (256 px, cắt sát tấm bảng), vẽ qua `ModeIcon` (`MODE_ART` trong `src/app/game/art/mode-icons.tsx`) ở trang giới thiệu; 9 chế độ còn lại vẫn dùng SVG.

Mỗi chế độ một biểu tượng vuông bo góc, dùng ở trang giới thiệu (mục Chế độ chơi), thẻ Chiến Trường và banner đầu màn. Hình mỗi chế độ bám theo bản SVG hiện có để người chơi quen mắt; tranh thẻ lớn của chế độ là việc riêng ở `public/art/home/`.

## Cách dùng

- Mỗi khối là một hình. Tạo ở 1024×1024 rồi gửi Claude PNG đặt đúng tên trong khối (ví dụ `mode_practice.png`). Claude tách nền, cắt theo tấm bảng, lưu `public/art/modes/<slug>.webp` (256 px) và thay `ModeIcon` SVG bằng ảnh, giữ SVG làm dự phòng.
- Tên tệp theo slug đường dẫn của chế độ (`SCENE_SLUG` trong `src/app/game/scene.ts`).
- Nền tách: cả bộ dùng **hồng `#ff00ff`**, vì tấm bảng màu ngọc lục sẽ bị ăn mất nếu tách trên nền xanh lá.
- Nên đính kèm 1–2 icon bị động đã có (`public/art/passives/`) làm tham chiếu nét vẽ. Mọi hình cùng một **tấm bảng ngọc viền vàng** để đứng cạnh nhau không lệch tay.
- Không chữ, không người, không khung ngoài tấm bảng. Giữ clean-room như các bộ trước.

## Nhóm A · Chiến trận (9 hình)

**Thao Luyện** · `mode_practice.png`

Luyện tay với AI, vào trận ngay không cần mạng.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: A straw archery target with red and cream rings and a bamboo arrow struck in the center, a few feather fletchings glowing. Energy and color: vermilion red, cream and gold. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Bình Loạn** · `mode_campaign.png`

Cốt truyện dẹp loạn 12 sứ quân.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: A tall command banner on a wooden pole with a swallow-tail red flag edged in gold, a small bronze drum at its foot. Energy and color: vermilion red and bronze gold. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Giao Tranh** · `mode_play.png`

Trận trực tuyến có đồng hồ.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: Two Dai Viet sabers crossed in an X with wrapped gold grips, a small sandglass of lacquer and bronze between the blades. Energy and color: steel silver, gold and deep red. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Tháp Thí Luyện** · `mode_trial.png`

Tháp 100 tầng, mỗi tầng một luật.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: A three-tiered wooden pagoda tower with curved red roofs and lit lanterns, a winding stair of small steps rising beside it. Energy and color: red lacquer, cream and gold. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Tháp Thiên Mệnh** · `mode_destiny.png`

Khóa đội theo chu kỳ, giữ máu xuyên tầng.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: A yin-yang disc inside a bronze ring engraved with eight trigram bars, a faint night-sky glow behind it with one bright star. Energy and color: deep indigo, cream and gold. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Trấn Ải** · `mode_survival.png`

Giữ ải trước từng đợt quân.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: A stone gate fortress with battlements and a closed wooden door, a small red pennant on top, arrows stuck in the wall. Energy and color: weathered stone grey, wood brown and red. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Nhật Lệnh** · `mode_daily.png`

Một đề mỗi ngày cho mọi người.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: A rising golden sun with short rays behind a vertical bronze command tablet (lenh bai) with a red cord tassel. Energy and color: warm gold, amber and red. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Quần Hùng** · `mode_arena.png`

Đấu đội phòng thủ của người chơi khác.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: A bronze two-handled trophy cup with a red star emblem, resting on a lacquered wooden base, small laurel of rice stalks around it. Energy and color: bronze gold and red. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Viễn Chinh** · `mode_expedition.png`

Chia hai đạo quân hành quân trên sa bàn.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: A small sand-table map with green hills and a blue river, two dotted red marching arrows converging on a tiny walled citadel with a red flag. Energy and color: sand beige, jade green, river blue and red. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

## Nhóm B · Binh pháp và giải đố (5 hình)

**Trận Đồ** · `mode_formation.png`

Xếp quân theo nghề, hệ cho khớp luật ô.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: A square battle board of 3x3 cells drawn on old paper, two tiny command flags of opposing colors (red and blue) and one curved red advance arrow. Energy and color: aged paper cream, red and blue. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Khai Lộ** · `mode_clear-path.png`

Phá khối quân cùng hệ, mở đường xuyên bàn.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: A cluster of rounded gem-like element tiles (red, jade, blue, gold) split open in the middle, a bright golden path of light running straight through the gap. Energy and color: multicolor jewel tones with a bright gold light path. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Do Thám** · `mode_scout.png`

Dò ô tránh bẫy chông, cắm cờ đánh dấu.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: Four square earth tiles: one dug tile showing a hidden spike trap, one tile with a small cờ lau (reed flag) planted in it, one tile with a faint question-mark scratch. Energy and color: earth brown, reed white and red. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Sử Lộ** · `mode_maze.png`

Đổ xúc xắc qua mê cung các thời kỳ, đáp câu sử.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: An unrolled bamboo-and-paper history scroll with a dotted red route winding to a tiny flag, a carved wooden die resting on the scroll corner. Energy and color: aged paper cream, bamboo green and red. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```

**Tầm Tướng Ký** · `mode_tam-tuong-ky.png`

Ghép bảy hệ thành nguyên liệu, tìm chân dung danh tướng.

```text
Square 1024x1024 fantasy game MODE icon for a turn-based match-3 RPG menu. Subject: A golden general's helmet with a red plume rising from two glowing tokens merging below it, faint seven-colored sparks swirling into the helmet. Energy and color: gold, red and seven element colors. Style: same hand-painted family as the existing Co Lau skill and passive icons (rich semi-realistic digital painting, glossy highlights, saturated colors, strong contrast, Dong Son bronze-drum motifs) but bold and iconic: one compact central object sitting on a rounded-square lacquered jade-green plaque with a thin engraved gold border and soft inner glow, the object may overlap the plaque edge slightly, plaque fills about 80% of the canvas, readable at 40 px. Culture: 10th-century Vietnam (Dai Co Viet era); no Chinese dragons, no phoenixes, no Japanese or European elements. No people, no faces, no hands. No text, no letters, no numbers unless stated, no outer frame beyond the plaque, no ground shadow. Background: flat solid chroma magenta (#ff00ff), completely uniform, nothing else on it.
```
