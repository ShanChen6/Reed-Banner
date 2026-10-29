# Hồ sơ Master Chat – dựng hình nhân vật

> Cập nhật: 29/10/2026

Ngữ cảnh đầu vào cho các phiên chat mới làm việc với hình động nhân vật trên sân trận (rig, tranh tư thế, hiệu ứng tuyệt chiêu). Tổng hợp từ phiên dựng nhân vật kết thúc ở commit `d543bed` trên `develop`.

## Phần 1: Quy tắc cốt lõi (Master Context)

### 1.1 Mục tiêu và kiến trúc

- **Sản phẩm:** game chiến thuật đánh theo lượt, bối cảnh cổ trang Việt.
  - Đội 3 người mỗi phe.
  - Mỗi nhân vật có một **hệ** (Kim, Mộc, Thủy, Hỏa, Thổ...) và một **nghề** (tướng sĩ, binh lính, pháp sư, y sư, mưu sĩ, quân sư).
  - Mỗi nhân vật có một tuyệt chiêu riêng.
- **Phần lõi `src/core`:** chỉ chứa logic thuần, cùng seed cho cùng kết quả.
  - `roster/roster.ts`: danh sách nhân vật (id, tên, nghề, hệ, giá shop).
  - `battle/skills.ts`: tuyệt chiêu, gắn với nhân vật qua trường `character`.
  - `battle/battle.ts`: hàm `createBattle`.
  - `progress/profile.ts`: đội mặc định là `haVan` và `maiThanh`.
- **Phần sân khấu `src/app/game/stage`:** vẽ bằng PixiJS 8.
  - `rigs.ts` là sổ đăng ký hình động. Bản đồ `RIGS` trỏ từ id nhân vật tới rig. Nhân vật chưa có rig thì sân hiện chân dung.
  - `WarriorRig` là khung xương chuẩn cho mọi nhân vật mới:
    - `parts`: 5 lớp ảnh `body`, `armR`, `sword` (vũ khí), `arm` (nắm tay cầm vũ khí), `head`.
    - `cloth`: dải vải bay theo gió (tùy chọn). `covers`: lớp che.
    - `joints`: ba khớp `shoulder`, `elbowR`, `neck`.
    - `blade`, cùng các trường tùy chọn `grip`, `orb`, `shieldRaise`, `weapon` (`spear` | `fan` | `gourd` | `staff`).
    - `poses`: tranh tư thế `attack`, `cast`, `ultimate`; `down` là tranh gục.
    - `strikeFx` và `fxColor`: hiệu ứng tuyệt chiêu và màu của nó.
  - `MageRig` là khung cũ, hiện không còn rig nào dùng.
  - `PoseArt` gồm `name`, `texScale` (0.3), `origin` (góc cắt trong ảnh gốc), `anchor` (giữa hai bàn chân, trên mặt đất), `scale`, `burst` (chỗ tóe sáng khi trúng đòn).
  - **Quy tắc `scale`:** đo theo cỡ khóa thắt lưng và thân người, **không** đo theo chiều cao. Giá trị thường 0.9–1.1. Đo theo chiều cao làm tranh nằm ngang to hơn dáng đứng 30–45%.
  - `puppet.ts` dựng hình động, phát sự kiện `onStrike(kind, at)`.
  - `BattleStage.tsx` dựng hiệu ứng cả sân trong lớp `sky`, theo `rig.strikeFx`. Hai hàm phụ:
    - `spot(slot, k)`: vị trí một ô đứng trên sân.
    - `alive(mine)`: người còn sống của phe mình hoặc phe địch.
  - **Mỗi hiệu ứng là một module riêng**, cùng mẫu: `fn(parent, color, [palette])` trả về đối tượng có `cover/fall/slash/burn/...(at, size, wait)`, `update(dt)`, `clear()`.
  - Các module hiệu ứng: `lightning`, `ward`, `bloom`, `pierce`, `drain`, `pillar`, `flame`, `slam`, `needle`, `bulwark`, `silver`, `coins`, `banner`, `sap`, `thorn`, `miasma`, `meteor`, `cleave`.
- **Trang xem trước `src/app/demo/characters`:**
  - `RigPreview.tsx` **phải mô phỏng lại** mọi `strikeFx` có trên sân trận.
  - `catalog.ts` và `CharacterPreviewer.tsx` hiện 5 ảnh đối chiếu cùng ô "Phong thái" (`style.webp`).
- **Ảnh:** nằm ở `public/art/characters/<dir>/`.
  - Lớp rig: `arm`, `armR`, `body`, `head`, `sword`, thêm `ribbon` nếu có dải vải.
  - `portrait.webp` (chân dung), `standing.webp` (dáng đứng), `style.webp` (phong thái, nếu có).
  - Tranh tư thế: `pose-attack`, `pose-cast`, `pose-ultimate`, `pose-down`.
  - Chân dung khai báo trong `src/app/game/art/portrait-data.ts`.

### 1.2 Quy định bắt buộc

- **Luôn trả lời người dùng bằng tiếng Việt.**
- **Nhánh làm việc:**
  - Làm trên `develop`, đẩy bằng `git push -u origin develop`.
  - Trước khi push: `git fetch`, merge `origin/develop`, rồi `pnpm install --frozen-lockfile` (phía origin có thể thêm thư viện).
  - **Không tạo PR** trừ khi người dùng yêu cầu.
- **Commit:** viết tiếng Việt, mô tả rõ thay đổi. Cuối commit có hai dòng:

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01Q7BXEqFLZkyhsqgEgPGfqj
  ```

  Phiên mới thay dòng `Claude-Session` bằng link của phiên đó.
- **Trước khi push phải sạch cả ba:** `pnpm -s tsc --noEmit`, `pnpm -s lint`, `pnpm -s test` (node:test qua tsx).
- **Next.js 16 khác bản cũ:** đọc `node_modules/next/dist/docs/` trước khi sửa code Next (xem `AGENTS.md`).
- **Phong cách code:** chú thích tiếng Việt, ngắn gọn. Hằng số thời gian (`RISE`, `LIFE`...) đặt đầu file. Màu theo hệ:

  | Hệ | Màu |
  |---|---|
  | Thủy | `0x2f7fc1` |
  | Hỏa | `0xd9502a` |
  | Mộc | `0x4f9a4a` |
  | Kim | `0x9ea4ad` |

- **Quy tắc nội dung (đã chốt với người dùng):**
  - Không thêm nhân vật vào đội Practice.
  - Hiệu ứng dùng màu của hệ.
  - Ảnh phong cách đưa vào ô "Phong thái".
  - **Mỗi nhân vật ≤ 350 KB**, tính chân dung và mọi lớp, tranh của rig; không tính `standing` và `style`.

### 1.3 Quy trình "Xây dựng nhân vật X"

Người dùng gửi 5 ảnh nền trong suốt: đứng, đánh thường, ra chiêu, tuyệt chiêu, gục (có thể thêm ảnh phong thái).

1. **Tra dữ liệu:** id, nghề, hệ trong `roster.ts`; tuyệt chiêu trong `skills.ts`.
2. **Tách lớp ảnh đứng (1024×1536)** bằng Python (PIL, numpy, OpenCV):
   - Vẽ mặt nạ đa giác cho vũ khí, nắm tay, bàn tay còn lại và đầu.
   - Vá chỗ trống trên thân bằng `cv2.inpaint`, bỏ mảng vụn bằng connected components.
   - Mỗi lớp lưu ở ½ kích thước (`texScale` 0.5), WebP.
3. **Xuất ảnh còn lại:**
   - Tranh tư thế: cắt sát rồi thu ×0.3, ghi `origin`.
   - `standing`, `style`: thu còn ¼.
   - `portrait`: 192×192, cắt quanh mặt.
4. **Đăng ký rig:**
   - Thêm `const X: WarriorRig` vào `rigs.ts` ngay trước `/** Hình động theo id nhân vật.`, rồi thêm vào `RIGS`.
   - `anchor` lấy điểm giữa hai bàn chân. `scale` đo theo khóa thắt lưng (dựng ảnh so cạnh dáng đứng ở cùng mặt đất).
   - Tranh hướng sang trái thì lật ngang.
   - Thiếu tranh ra chiêu thì bỏ `cast`, rig dùng nhịp động tác sẵn có.
5. **Hiệu ứng tuyệt chiêu:**
   - Ưu tiên ghép module có sẵn; có thể thêm bảng màu (ví dụ `MistPalette`/`TIDE`, `BloomGlow`/`EMBER`).
   - Thêm giá trị mới vào kiểu `strikeFx` và cập nhật chú thích của nó.
   - Thêm nhánh trong `BattleStage.tsx` và **mô phỏng lại trong `RigPreview.tsx`**.
6. **Dữ liệu và test:**
   - Thêm chân dung vào `portrait-data.ts`.
   - Thêm id vào danh sách trong `tests/game/character-preview.test.ts`; nhân vật thiếu tranh ra chiêu thêm vào danh sách ngoại lệ ở đó.
   - Thêm test vào `tests/game/rigs.test.ts`: khớp nằm trong lớp, kích thước WebP VP8X bằng box × texScale, tổng ≤ 350 000 byte.
7. **Kiểm tra trên sân thử:**
   - Tạo trang tạm `src/app/demo/tmpstage/page.tsx`, chạy `next dev -p 3123`.
   - Chụp bằng Playwright: đứng, đánh thường, ra chiêu, vài khung tuyệt chiêu.
8. **Dọn và đẩy lên:**
   - Tắt `next dev` (`pkill -f "next dev"` luôn trả mã 144, bình thường).
   - Xóa `.next/dev` và `src/app/demo/tmpstage`, nếu không typecheck sẽ báo lỗi.
   - Commit, merge `origin/develop`, kiểm tra lại, push.

### 1.4 Công cụ và thư viện

- **Thư viện:** Next.js 16, React, TypeScript, PixiJS 8, pnpm, node:test + tsx, ESLint, Tailwind cùng `clsx` và `tailwind-merge`.
- **Xử lý ảnh:** Python (PIL, numpy, OpenCV). Playwright + Chromium để chụp kiểm tra.
- **MCP:** GitHub (`mcp__github__*`) cho PR và issue, phạm vi `shanchen6/reed-banner`; claude-code-remote cho quản lý phiên, lên lịch, theo dõi PR.

## Phần 2: Tiến độ và việc tiếp theo (Current Progress)

### 2.1 Trạng thái tại `d543bed`

- **Test:** 795 pass, 0 fail. Typecheck và lint sạch.
- **`origin/develop` đã đi tiếp** sau `d543bed` (PR #205 Vũ Lôi, PR #206 Ông Chấn). Phiên mới phải fetch và merge trước khi làm.
- **Nhân vật đã có rig đầy đủ** (tranh tư thế, hiệu ứng, test):
  - Kiều Công Hãn, Nguyễn Khoan, Kiều Thuận, Lý Khuê, Nguyễn Thủ Tiệp, Lữ Đường, Nguyễn Siêu, Đỗ Cảnh Thạc.
  - Chu Ngân, Cao Kiên, Châu Ngọc, Tô Kim, Nghiêm Thiết, Lâm Tùng, Đàm Thảo, Hoàng Mộc.
  - Lục Diệp, Nhan Trúc, Sầm Tuệ, Hồ Lãng, Đào Lam, Thái Hà, Mai Thanh, Quách Ẩn.
  - Vi Triều, Hà Vân, Lý Liệt, Trương Viêm, Hồng Đan.
  - Có từ trước: Trần Cương, Đinh Bộ Lĩnh, Nguyễn Bặc, Đinh Điền, Lưu Cơ, Trịnh Tú, Lê Hoàn, Đinh Liễn, Trần Lãm, Phạm Bạch Hổ, Ngô Xương Xí.

### 2.2 Việc vừa hoàn thành

- **Hệ Thủy:**
  - Mai Thanh – `springDew`: vòng hồi phục cho đội mình, cột băng dưới chân địch.
  - Quách Ẩn – `tideMist`: sương nước và hạt năng lượng hút về; `miasma.ts` có thêm bảng màu.
  - Vi Triều – `tideSiege`: cột băng kèm vết nứt; tranh đánh thường lật ngang.
- **Hệ Hỏa:**
  - Hà Vân – `fireRain`: module mới `meteor.ts`.
  - Lý Liệt – `flameCleave`: module mới `cleave.ts`.
  - Trương Viêm – dùng lại `flameWall`, có `shieldRaise`.
  - Hồng Đan – `emberMend`: `bloom.ts` có thêm bảng màu `EMBER`; tranh ra chiêu và tuyệt chiêu đã cập nhật lại.
- **Sửa lỗi phóng to tranh:** đặt lại `scale` tranh tư thế cho Lý Liệt, Vi Triều, Thái Hà, Hồ Lãng theo quy tắc khóa thắt lưng.
- **Ảnh phong thái** đã thêm cho Đào Lam, Hồ Lãng, Mai Thanh, Quách Ẩn, Thái Hà, Hồng Đan, Hà Vân, Lý Liệt, Trương Viêm, Vi Triều.

### 2.3 Việc tiếp theo

1. **Đồng bộ nhánh:** merge `origin/develop` (Vũ Lôi, Ông Chấn), `pnpm install`, chạy lại ba bước kiểm tra.
2. **Đo lại `scale` tranh tư thế** của các rig cũ đang dùng 1.2–1.35, nhiều khả năng bị phóng to: Nguyễn Bặc, Đỗ Cảnh Thạc, Chu Ngân, Cao Kiên, Lâm Tùng, Đàm Thảo, Hoàng Mộc, Sầm Tuệ. Chờ người dùng đồng ý.
3. **Kiểm tra tranh gục (`down`) trên sân:** trang thử chưa cho nhân vật gục, nên `anchor`/`scale` của tranh gục chưa được xem. Có thể thêm nút "gục" vào trang thử.
4. **Xem lại `cleave.ts` trên sân:** `SWEEP` 0.22 và `LIFE` 1 đã chỉnh nhưng chưa chụp lại.
5. **Dựng tiếp các nhân vật còn lại** trong roster (id chưa có trong `RIGS`), theo từng bộ 5 ảnh người dùng gửi.
6. **Bổ sung ảnh còn thiếu:** tranh ra chiêu cho Nguyễn Khoan, Nguyễn Siêu, Nghiêm Thiết (đang là ngoại lệ trong test); ảnh phong thái cho nhân vật cũ chưa có `style.webp`.
7. **Dọn mã cũ:** `MageRig` không còn ai dùng, cân nhắc xóa.
