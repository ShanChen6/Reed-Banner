# Post-merge verification Song Tháp

> Ngày kiểm tra: 24/10/2026 (Asia/Ho_Chi_Minh)  
> Nhánh: `develop`  
> Commit: `5c0a8247d276a2f4b1cfc3051e9cce3ba54ffdd7` (Merge PR #118)

## Phạm vi và trạng thái working copy

Kiểm tra được chạy trên HEAD hiện tại của `develop` cùng các thay đổi RH-02/RH-03 chưa commit đang có trong
working copy. Vì vậy kết quả local xác minh tổ hợp **SHA trên + working copy**, còn GitHub Actions run #261 xác minh
đúng commit đã merge. Không commit, push, deploy hoặc kết nối database production trong task này.

## Toolchain thực tế

| Thành phần | Giá trị |
|---|---|
| Local OS | Windows NT 10.0.26200.0 |
| Local Node | 24.18.0 |
| CI | `ubuntu-latest`, Node 22 |
| Package manager | pnpm 10.28.0 (`packageManager` trong `package.json`) |
| Lockfile | `pnpm-lock.yaml`, lockfileVersion 9.0 |
| Next.js | 16.4.2 |
| TypeScript | 5.9.3 |
| ESLint | 9.39.5 |
| CI workflow | `.github/workflows/ci.yml`: frozen install, lint, typecheck, test, default build |

## Kết quả lệnh local

| Lệnh | Exit | Kết quả |
|---|---:|---|
| `pnpm install --frozen-lockfile` | 0 | PASS; lockfile up to date. |
| `pnpm typecheck` | 0 | PASS; `tsc --noEmit`. |
| `pnpm lint` | 0 | PASS. |
| `pnpm test` | 0 | PASS; 606 tests, 124 suites, 0 fail/skip/todo. |
| migration/compatibility subset (`db`, `dualTower`, `stones`) | 0 | PASS; 31 tests, 5 suites. Dùng PGlite/local, không có production URL. |
| gameplay subset Survival/Campaign/Tower/Arena/Daily/Battles | 0 | PASS; 114 tests. |
| `pnpm build` | 1 | FAIL local ở Turbopack khi tạo child process cho PostCSS `src/app/globals.css`. Migration tự skip vì không có `DATABASE_URL`. |
| `pnpm exec next build --webpack` | 0 | PASS; compile, TypeScript và 30/30 static pages. |
| child-process smoke (`node --version` qua `spawnSync`) | 0 | PASS; loại trừ lỗi cấm tạo mọi child process trên máy. |

## Turbopack so với webpack

Lỗi local mặc định là panic của Turbopack: `evaluate_webpack_loader failed`, sau đó process Node thoát trước khi
kết nối, không có diagnostic parse CSS. Webpack build cùng source và dependency graph hoàn tất. Quan trọng hơn,
GitHub Actions CI run #261 trên Node 22/Linux đã PASS chính lệnh `pnpm build` mặc định cho SHA trên, bao gồm bước
Turbopack.

Kết luận: bằng chứng hiện tại phù hợp với lỗi tương tác môi trường Windows/Node 24 và Turbopack/PostCSS child-process,
không phải lỗi source Song Tháp tái hiện trên toolchain CI. Chưa chọn webpack cho production và không đổi script
`build`; webpack chỉ là diagnostic fallback. Nếu lỗi xuất hiện trên CI Node 22/Linux hoặc platform deployment thì
mới mở task riêng để pin/đổi bundler dựa trên log của môi trường đó.

## CI evidence và matrix

GitHub Actions [CI run #261](https://github.com/ShanChen6/Reed-Banner/actions/runs/40062651642) kết thúc `success`.
Job `check` PASS toàn bộ: checkout, pnpm setup, Node 22 setup, frozen install, lint, typecheck, full test và default
`pnpm build`.

| Check | Local Windows / Node 24 | CI Linux / Node 22 | Gate |
|---|---|---|---|
| Frozen install | PASS | PASS | PASS |
| Lint | PASS | PASS | PASS |
| Typecheck | PASS | PASS | PASS |
| Full tests | PASS | PASS | PASS |
| Default Turbopack build | FAIL | PASS | CI is authoritative; local risk recorded |
| Webpack fallback | PASS | Không chạy | Diagnostic only |
| Gameplay regression subset | PASS | Bao phủ trong full tests | PASS |

Workflow hiện tại đã chạy trên push `main`/`develop` và pull request, không truyền database URL hay production
secret. Không thêm job webpack vì production vẫn dùng default build và một fallback job xanh có thể che khuất thay vì
giải quyết regression Turbopack. Default build đang là required regression signal phù hợp.

## Migration safety

`pnpm build` gọi `scripts/migrate.mts`, nhưng không có `DATABASE_URL` trong local/CI nên migration được skip an toàn.
Các migration compatibility tests chạy bằng database local/PGlite. Task này không thay thế Neon staging drill và
không tuyên bố migration remote PASS.

## Diff của task

- Thêm báo cáo này.
- Không đổi source gameplay, balance, schema, build script hoặc CI workflow.
- Không ghi đè các thay đổi RH-02/RH-03 chưa commit có trước.

## Rủi ro còn mở

1. Local Node 24/Windows vẫn không build được bằng Turbopack; developer nên dùng Node 22 như CI để tái kiểm tra trước
   khi coi đây là regression source.
2. Working copy có thay đổi chưa commit, nên CI run #261 không xác minh các thay đổi RH-02/RH-03 đó.
3. Neon staging migration/backup/restore và browser/device E2E vẫn là gate độc lập chưa được chứng minh ở đây.

## Status

**PASS cho post-merge SHA trên CI; PARTIAL cho toàn bộ working copy.** Pipeline của commit merge đã xanh và gameplay
regression local PASS. Chưa thể công bố release GO cho các thay đổi chưa commit hoặc migration/browser gates chưa
chạy.
