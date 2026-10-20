# Prompt cho Codex: dựng đồ họa nhân vật Cờ Lau

> Viết 20/10/2026, theo đúng quy trình Claude đã dùng cho Đào Lam (PR #80), Trần Cương (PR #83) và Đinh Bộ Lĩnh (PR #86).
> Cách dùng: dán toàn bộ phần **Prompt** bên dưới cho Codex, rồi thêm một dòng cho nhân vật cần làm (mã nhân vật, nghề, đường dẫn các tranh).

---

## Prompt

You are working in the repository `ShanChen6/Reed-Banner` (game "Cờ Lau", Next.js 16 + React 19 + TypeScript strict + PixiJS 8, pnpm).
Your job: take the character art the owner (Shan) provides and turn it into an animated in-battle character, exactly the way the
existing characters `daoLam`, `tranCuong` and `dinhBoLinh` were built. Read this whole prompt before starting.

### 0. Read first

- `src/app/game/stage/rigs.ts`: every animated character is one entry here (`MageRig` or `WarriorRig`). Copy the shape of
  `DINH_BO_LINH` (the most complete example: cloth layers, a cover layer, pose art).
- `src/app/game/stage/warrior.ts`, `src/app/game/stage/puppet.ts` (mage), `src/app/game/stage/kit.ts` (shared helpers:
  `layers()` sprite/mesh/joint/bend, `particles()`, `reaction()`), `src/app/game/stage/director.ts` (battle events to cues:
  `attack`, `cast`, `ultimate`, `hit`, `heal`), `src/app/game/stage/BattleStage.tsx`.
- `docs/design/15-ke-hoach-do-hoa.md` (budget and style), `docs/design/16-prompt-nhan-vat.md` section 8 and
  `docs/design/18-prompt-tu-the.md` (the art each character should have).
- Do not change game rules in `src/core/`. Graphics only.

### 1. Inputs per character (up to 4 images)

| Image | File name Shan uses | Required | Used for |
|---|---|---|---|
| Standing, full body | `<id>-toanThan.png` | yes | cut into layers, animated (idle breathing, cloth in wind, attack swing) |
| Skill pose | `<id>-chieu.png` | no | shown for a moment when the character uses a normal skill (cue `cast`) |
| Ultimate pose | `<id>-tuyetChieu.png` | no | shown for the slot-5 ultimate / signature skill (cue `ultimate`) |
| Knocked out | `<id>-haGuc.png` | no | shown when HP reaches 0 (replaces the "lean and fade" fallback) |

All images face the viewer's RIGHT. The stage mirrors the opponent side itself (`scale.x = -s`), never flip the art.

### 2. Tools (all available in the container)

- Python 3 with `opencv-python`, `numpy`, `Pillow`. Install `rembg[cpu]` with `python3 -m pip install "rembg[cpu]"` when an
  image has a non-uniform background; use the `isnet-anime` model (it downloads from GitHub on first use).
- `ffmpeg` for frames and GIFs. `playwright-core` with Chromium at `/opt/pw-browsers` (launch with
  `--use-gl=swiftshader --enable-unsafe-swiftshader` so WebGL works headless). Never run `playwright install`.
- `node_modules/.bin/esbuild` (already in the repo) to bundle a throwaway test page.
- **Do NOT create any `.py` file** (not in the repo, not in the shared project folder, not in a scratch folder). Run image
  processing as inline commands: `python3 - <<'EOF' ... EOF` heredocs typed in the shell, with the code from the appendices
  pasted in. Repo code stays TypeScript only.
- Put intermediate PNGs and recordings in a scratch folder OUTSIDE the repo. Only final WebP files and TypeScript changes go
  in the repo.

### 3. Step 1: background

1. Open the image and check the alpha channel. If it already has transparency (the Dinh Bo Linh images did), skip to step 2.
2. Flat chroma background (`#00b140` green or `#ff00ff` magenta, as the prompts ask): key it out by color distance, then
   erode the edge 1 px and despill (pull the key color out of edge pixels).
3. Gradient / glowing background (what ChatGPT and Copilot often return): run `rembg` with `isnet-anime`. Then look for left-over
   glow haze: it is smooth (local std-dev of gray over a 9×9 window below ~6), darker or desaturated, and only partly opaque
   (alpha below ~248). Build that mask, open it with a 7×7 kernel, keep only connected parts larger than ~1500 px, feather it
   with a 7×7 blur and multiply it out of the alpha; drop alpha below 40. Do not touch fully opaque pixels: dark trousers and
   boots look smooth too.
4. Always render a check image of the result over a flat green and look at it before going on.

### 4. Step 2: cut the standing image into layers (this is where the old Codex attempt fell short)

Hand-drawn polygons alone are not enough. The method that worked:

1. **Read coordinates from a grid.** Run the inline grid command (appendix) that crops a region, scales it 1.5–2×, and draws a labelled grid
   every 20 px (bright line every 100 px). Look at those crops to place polygon points; do not guess coordinates.
2. **Polygon + color mask, not polygon alone.** Each moving part gets a polygon, then is intersected with a color rule so the
   cut follows the real edge:
   - red cloth: `R - max(G, B) > 25..55`; dark cloth/hair: `R+G+B < 150`;
   - remove what must not belong to the layer (for example the sword blade from the cape: `blade & ~red`);
   - dilate the masks of neighbouring parts (15×15) and subtract them, so a cape layer never carries a piece of the hand or
     the sword guard.
3. **Parts for a warrior** (`WarriorRig`): `body` (everything that does not move), `sword` (blade, guard, grip, tassel),
   `arm` (sword arm from shoulder to fist), `armR` (free arm from elbow), `head` (head and hair, kept ALSO on the body so a
   small tilt never shows a hole), `cloth[]` (cape, hair ribbon, sash, apron: anything that waves; `behind: true` for layers
   drawn behind the body), `covers[]` (a pauldron or sleeve drawn on top of the arm to hide the shoulder seam).
   For a mage (`MageRig`) follow `DAO_LAM`: separate arms, staff/orb, back hair, top and bottom robe meshes.
4. **Patch what was hidden (inpaint).** Removing the arm and sword leaves holes in the body and cape. Fill them:
   - build the "hull" of the layer: morphological close of its opaque pixels with a large ellipse (31 px for the body, 71 px
     for a cape), limited to the layer's polygon;
   - inpaint `hull & ~opaque` with `cv2.inpaint(..., 9, cv2.INPAINT_TELEA)`, and add `alpha < 0.4` to the inpaint mask so
     transparent pixels are never used as a color source (they inject garbage colors);
   - where inpaint still looks wrong behind an apron or sash, fill with the flat local color (for example the trouser color);
   - force-fill the area under a cloth layer that will move (the sash polygon on the body), so the body under it is solid.
5. **Crop and record boxes.** Save each layer cropped to its alpha bounding box and write `{x, y, w, h}` in ORIGINAL image
   coordinates to a JSON file. These boxes go straight into `parts`, `cloth[].box`, `covers[].box` in `rigs.ts`.
6. **Joints and blade.** Read from the grid: `shoulder` (pivot of the sword arm, the whole arm and sword rotate here),
   `elbowR` (free arm), `neck`, `blade` = [hilt point, tip point] at rest, `foot` = midpoint between the feet on the ground,
   `height` = figure height in source pixels.
7. **Check images.** Composite every layer over a dark color and look at body, cape and sword individually: no leftover
   pieces of other parts, no holes, no colored halos.

The reference code (Dinh Bo Linh) is at the end of this file. Run it inline as a heredoc; adapt coordinates, keep the
structure.

### 5. Step 3: export

- WebP, `quality=82`, `method=6`, scaled by `texScale` 0.5 (the rig scales back up). Folder:
  `public/art/characters/<kebab-id>/` (`dinh-bo-linh`, `tran-cuong`, ...).
- Budget: at most 350 KB per character in total (standing layers ~150 KB, each pose ~100 KB). Check with `du -k`.
- Round medallion portrait (used on the battle side panels and the home page): crop the face from the standing image, about
  220×220 px around the face, resize to 192×192, WebP quality 85 (Dinh Bo Linh: 22 KB), save as `portrait.webp`, then add the
  id to `PHOTOS` in `src/app/game/art/portraits.tsx`.

### 6. Step 4: the rig entry

Add a `WarriorRig` (or `MageRig`) to `rigs.ts` and register it in `RIGS` under the character id from
`src/core/roster/roster.ts`. Wind on cloth: `axis` "x" for horizontal cloth (cape, ribbon: also `vertical: true` and, if it is
anchored on the right, `reverse: true`), "y" for hanging cloth (sash, apron); amplitudes 5–16, frequencies 1.2–1.8, a different
`phase` per layer. `fxColor` is the glow color of the character's element/theme.

### 7. Step 5: pose art (skill, ultimate, knocked out)

For each pose image:

1. Background as in step 3, then crop to the alpha bounding box and export at texScale 0.5 as `pose-cast.webp`,
   `pose-ultimate.webp` (and `pose-down.webp` for knocked out).
2. Fill a `PoseArt` entry in `rig.poses`: `origin` = top-left of the crop in the ORIGINAL pose image; `anchor` = the point
   in the pose image that sits on the stage foot point (for a lunge: under the belt buckle on the ground line; for a jump:
   below the figure, the code lifts it); `scale` = size match to the standing image, measured on a fixed detail (the belt
   buckle diameter, or the face height): `standing size / pose size`; `burst` = where sparks fly on impact (blade tip for a
   slash, the ground in front for a slam).
3. Cast and ultimate are already wired (`POSE_BEAT` in `warrior.ts`: wind-up on the rig, swap to the image, dash or jump,
   glowing after-image, sparks, swap back). The cue `ultimate` is produced by `isUltimate()` in `director.ts`.
4. Knocked out is NOT wired yet. When the first `-haGuc` image arrives: add `down?: PoseArt` (or a `poses.down` key), and in
   `setDown(true)` cross-fade the rig to that image over ~0.4 s instead of the lean-and-fade; `setDown(false)` must restore
   the rig (Survival waves revive characters). Respect `still` (reduced motion: switch instantly).
5. Mage poses: `puppet.ts` maps `ultimate` to `cast` today; add the same pose swap there if a mage gets pose art.

### 8. Step 6: verify like a player would

1. `pnpm lint && pnpm typecheck && pnpm test && pnpm build` must all pass.
2. Quick visual test of the puppet alone: write a throwaway `src/_harness.ts` that creates a PixiJS `Application`, calls
   `loadPuppet(rigOf("<id>")!, false)`, and exposes `window.play(kind)`. Bundle it with
   `node_modules/.bin/esbuild src/_harness.ts --bundle --format=esm --outfile=public/_harness.js`, serve `public/` with
   `python3 -m http.server` (a built-in command, no file), record with playwright (`recordVideo`), play `attack`, `cast`, `ultimate`, `hit`, then DELETE
   `src/_harness.ts`, `public/_harness.*` before committing.
3. Real battle: `SESSION_SECRET=local-test-secret-0123456789abcdef pnpm next start -p 3100`, open `/game/practice`, play a few
   turns with playwright (read `[role="gridcell"]` aria-labels, find a swap that makes 3 in a row, click the two cells; wait
   for "Lượt của bạn" in the element after `h1`). To see an opponent character, add its id to `SHOWCASE_FOES` in
   `src/app/game/battle/DemoGame.tsx`.
4. Pull frames with ffmpeg into a contact sheet and LOOK at them: idle, swing, cast, ultimate, hit, and on a 390×844 phone
   viewport. Make a GIF of the stage strip (`crop` to the stage, `fps=18`, palettegen) and save it with a screenshot to
   `/mnt/project-files/demo/<kebab-id>/` for Shan.

### 8b. Review files for Shan BEFORE any commit or PR (mandatory)

Do not commit, push or open a PR until Shan has looked at a review folder and said OK. Create
`/mnt/project-files/demo/<kebab-id>/review/` containing:

1. `01-nen.png`: the standing image after background removal, side by side over flat green, black and white (shows halos
   and leftover haze).
2. `02-cac-lop.png`: a contact sheet with every layer on its own tile over a checkerboard, labelled with its name and size,
   so Shan can see that no layer carries pieces of another part.
3. `03-vung-va.png`: the body and cape layers with the patched (inpainted) area tinted semi-transparent magenta, next to the
   same layers untinted, so Shan can judge whether the patches look natural.
4. `04-khop.png`: the rebuilt figure with joints (shoulder, elbow, neck, foot) drawn as dots and the blade line, plus three
   frames with the arm rotated to the rest, wind-up and strike angles, to check for seams.
5. `05-tu-the.png` (when pose images exist): standing image and each pose image at the `PoseArt.scale`, side by side on the
   same ground line, to check the size match.
6. `06-tran.gif` and `06-tran.png`: the test-page GIF (idle, attack, cast, ultimate, hit) and a screenshot of the real
   practice battle, desktop and 390×844 phone.
7. `REVIEW.md`: a short Vietnamese list of what each file shows, total WebP size, anything you are unsure of (for example
   "đoạn tay áo sau vai là vá đoán"), ending with the question "Duyệt để mở PR?".

Then stop and wait. If Shan asks for changes, redo the affected steps and overwrite the same review files before asking again.

### 9. Git and PR rules (Shan's rules, do not deviate)

- Branch from `develop`: `git fetch origin develop && git checkout -B feat/<kebab-id>-art origin/develop`. No `claude/` or
  `codex/` prefix. Prefixes: `feat/`, `fix/`, `docs/`, `chore/`.
- Commit author: `git -c user.name=ShanChen6 -c user.email=131275070+ShanChen6@users.noreply.github.com commit ...`.
  Commit messages in Vietnamese, first line like `feat: hình động cho Hà Vân`. Never rewrite pushed commits.
- PR into `develop` (never into `main`), title `feat: ...`, description in Vietnamese with a "Before:" paragraph, an "After:"
  paragraph and a short "How" paragraph; mention the checks you ran.
- If a PR was already merged, start a NEW branch and PR from `develop` for follow-up work; do not push more commits to the
  merged branch.
- Keep code comments in Vietnamese, matching the surrounding files. Run lint/typecheck/test/build before every push.

### 10. Quality bar (what Shan accepted)

- No visible seams at the shoulder or neck during the swing; no hole when a cloth layer moves.
- Moderate motion: flat art has guessed patches behind moving parts, so swing angles stay small (attack wind-up 0.2 rad,
  strike −0.95 rad; cast wind-up 0.4, strike −1.15). If a teammate gets crossed by the blade, reduce the wind-up.
- Pose images match the standing art in size within ~10 % (compare the face or belt buckle side by side).
- Total weight per character ≤ 350 KB; PixiJS stays dynamically imported (do not import it from a page component).

---

## Phụ lục: mã tách lớp Đinh Bộ Lĩnh (mẫu, chạy nội tuyến `python3 - <<'EOF'`, không lưu thành file .py)

```python
import cv2, numpy as np, json, os
src = cv2.imread('DinhBoLinh-TuongQuan.png', cv2.IMREAD_UNCHANGED)
full = src.astype(np.float32)
H, W = full.shape[:2]
A = full[..., 3] / 255
B, G, R = [src[..., i].astype(int) for i in range(3)]
red = (R - np.maximum(G, B)) > 55

def poly(*polys):
    m = np.zeros((H, W), np.uint8)
    for pts in polys:
        cv2.fillPoly(m, [np.array(pts, np.int32)], 1)
    return m.astype(bool)

P = {  # đọc tọa độ từ ảnh lưới, ảnh gốc 1024×1536
  'grip': [(450,585),(486,598),(470,640),(415,725),(392,770),(372,800),(330,790),(345,760),(380,700),(435,600)],
  'guard': [(255,770),(300,750),(372,790),(370,850),(320,880),(260,860),(245,820)],
  'blade': [(230,780),(345,830),(330,880),(110,1330),(20,1400),(0,1400),(0,1290),(170,920)],
  'tassel': [(305,840),(335,835),(345,900),(342,1000),(350,1092),(310,1096),(300,1000),(298,900)],
  'arm': [(385,495),(470,495),(474,560),(432,602),(416,662),(410,722),(396,772),(376,798),(340,798),(316,772),(312,722),(318,640),(338,580),(372,540)],
  'sleeve': [(388,395),(470,380),(505,420),(505,500),(470,505),(390,505),(380,470)],
  'armR': [(830,548),(890,524),(926,544),(952,640),(964,722),(947,797),(905,832),(876,822),(866,762),(853,692),(836,622)],
  'head': [(560,20),(610,8),(662,38),(702,80),(727,140),(722,200),(692,250),(652,267),(610,262),(575,232),(555,170),(545,110)],
  'ribbon': [(298,168),(560,66),(578,88),(552,130),(542,200),(470,242),(400,268),(332,338),(292,322)],
  'cape': [(395,400),(372,490),(350,560),(334,640),(318,760),(300,850),(330,880),(345,900),(345,1000),(332,1105),(200,1105),(115,1000),(55,900),(25,760),(45,700),(150,645),(238,560),(298,450),(360,380)],
  'sash': [(640,615),(700,610),(706,700),(713,830),(723,1000),(700,1014),(660,1014),(650,900),(645,750)],
}
opaque = A > 0.02
M = {}
M['sword'] = (poly(P['tassel']) | (poly(P['grip'], P['guard'], P['blade']) & ~red)) & opaque
M['arm'] = poly(P['arm']) & opaque
for k in ['sleeve', 'armR', 'head', 'ribbon', 'sash']:
    M[k] = poly(P[k]) & opaque
capeish = ((R - np.maximum(G, B)) > 25) | ((R + G + B < 150) & (R >= G))
near = cv2.dilate(poly(P['guard'], P['arm'], P['grip']).astype(np.uint8), np.ones((15, 15), np.uint8)).astype(bool)
M['cape'] = poly(P['cape']) & opaque & capeish & ~near & ~M['sword'] & ~M['arm']

def inpaint(img, holes):
    """Vá `holes` bằng màu lấy từ điểm ảnh đục của chính lớp (không lấy màu từ chỗ trong suốt)."""
    a = img[..., 3] / 255
    out = cv2.inpaint(img[..., :3].astype(np.uint8), ((holes | (a < 0.4)) * 255).astype(np.uint8), 9, cv2.INPAINT_TELEA)
    res = img.copy()
    res[..., :3] = np.where(holes[..., None], out, img[..., :3])
    res[..., 3] = np.where(holes, 255, img[..., 3])
    return res

def close(mask, k):
    ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    return cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_CLOSE, ker).astype(bool)

def layer(mask):
    img = full.copy()
    img[..., 3] = np.where(mask, img[..., 3], 0)
    return img

cape = layer(M['cape'])
cape_hull = close(M['cape'] & (A > 0.5), 71) & poly(P['cape'])
cape = inpaint(cape, cape_hull & ~(M['cape'] & (A > 0.5)))
moving = (M['sword'] | M['arm'] | M['armR'] | M['ribbon'] | M['sash'] | M['cape']
          | (poly(P['cape']) & (np.arange(H)[:, None] < 870)) | (near & (np.arange(W)[None, :] < 400)))
hull = close((A > 0.5) & ~moving, 31)
body = inpaint(layer(~moving), (hull | poly(P['sash'])) & moving & ~poly(P['cape']) & ~M['ribbon'])

os.makedirs('parts', exist_ok=True)
meta = {}
def save(name, img):
    ys, xs = np.where(img[..., 3] > 2)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    cv2.imwrite(f'parts/{name}.png', img[y0:y1, x0:x1].astype(np.uint8))
    meta[name] = dict(x=int(x0), y=int(y0), w=int(x1 - x0), h=int(y1 - y0))
for name, img in [('ribbon', layer(M['ribbon'])), ('cape', cape), ('body', body),
                  ('sash', layer(M['sash'])), ('armR', layer(M['armR'])), ('sword', layer(M['sword'])),
                  ('arm', layer(M['arm'])), ('sleeve', layer(M['sleeve'])), ('head', layer(M['head']))]:
    save(name, img)
json.dump(meta, open('meta.json', 'w'), indent=1)
```

## Phụ lục: mã vẽ lưới tọa độ (chạy nội tuyến, không lưu thành file .py)

```python
import cv2, sys
# python3 - anh.png x0 y0 x1 y1 out.png [scale] <<'EOF' ... EOF
im = cv2.imread(sys.argv[1]); x0, y0, x1, y1 = map(int, sys.argv[2:6]); s = float(sys.argv[7]) if len(sys.argv) > 7 else 1.5
c = cv2.resize(im[y0:y1, x0:x1].copy(), None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
for x in range((x0 // 20 + 1) * 20, x1, 20):
    big = x % 100 == 0
    cv2.line(c, (int((x - x0) * s), 0), (int((x - x0) * s), c.shape[0]), (0, 255, 255) if big else (0, 110, 110), 1)
    if big: cv2.putText(c, str(x), (int((x - x0) * s) + 2, 12), 0, 0.4, (0, 255, 255), 1)
for y in range((y0 // 20 + 1) * 20, y1, 20):
    big = y % 100 == 0
    cv2.line(c, (0, int((y - y0) * s)), (c.shape[1], int((y - y0) * s)), (0, 255, 255) if big else (0, 110, 110), 1)
    if big: cv2.putText(c, str(y), (2, int((y - y0) * s) - 2), 0, 0.4, (0, 255, 255), 1)
cv2.imwrite(sys.argv[6], c)
```
