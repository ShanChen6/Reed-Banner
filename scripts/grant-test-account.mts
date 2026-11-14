// Cấp đầy đủ vàng, tướng và phiếu Tầm Tướng Ký cho MỘT tài khoản đã có (đăng ký bình thường trong game trước).
// Chạy trên máy có DATABASE_URL của môi trường cần ghi. Mặc định chỉ in việc sẽ làm; thêm --apply mới ghi.
//   DATABASE_URL=... GRANT_CONFIRM=TOI_XAC_NHAN_GHI_DU_LIEU_THAT pnpm exec tsx scripts/grant-test-account.mts --username ten_dang_nhap [--apply]
// Không tạo tài khoản, không đổi mật khẩu; chỉ ghi lại hồ sơ của đúng tài khoản có tên đăng nhập đó.

import { parseArgs } from "node:util";
import { grantFullTestProfile } from "../src/server/testAccount";
import { loadProfile, updateProfile } from "../src/server/profiles";
import { normalizeUsername } from "../src/server/password";
import { accountStore, profileStore } from "../src/server/store";

const { values } = parseArgs({ args: process.argv.slice(2).filter((a) => a !== "--"), options: { username: { type: "string" }, apply: { type: "boolean", default: false } } });
const stop = (m: string): never => {
  console.error(m);
  process.exit(2);
};

if (!process.env.DATABASE_URL) stop("Thiếu DATABASE_URL: chưa chỉ tới cơ sở dữ liệu nào, không làm gì.");
if (process.env.GRANT_CONFIRM !== "TOI_XAC_NHAN_GHI_DU_LIEU_THAT") stop("Thiếu GRANT_CONFIRM=TOI_XAC_NHAN_GHI_DU_LIEU_THAT: script này ghi vào dữ liệu thật.");
if (!values.username) stop("Thiếu --username ten_dang_nhap (tài khoản phải đã đăng ký).");

const record = await accountStore().getPassword(normalizeUsername(values.username!));
if (!record) stop(`Không có tài khoản tên "${values.username}". Hãy đăng ký trong game trước.`);
const ownerId = record!.accountId;
const { profile } = await loadProfile(profileStore(), ownerId);
const next = grantFullTestProfile(profile);
console.log(JSON.stringify({ username: values.username, tuongTruoc: Object.keys(profile.companions).length, tuongSau: Object.keys(next.companions).length, vangTruoc: profile.gold, vangSau: next.gold, phieuSau: next.tamTuongKy?.tickets, luotMoSau: next.tamTuongKy?.units }));
if (!values.apply) {
  console.log("Chưa ghi gì. Thêm --apply để ghi.");
  process.exit(0);
}
const r = await updateProfile(profileStore(), ownerId, () => ({ ok: true as const, profile: next }), Date.now());
console.log(r.ok ? "Đã ghi." : `Lỗi: ${r.error}`);
