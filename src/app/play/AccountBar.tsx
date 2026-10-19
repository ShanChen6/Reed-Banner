// Khu tài khoản trên đầu trang /play, dựng ở server từ cookie: khách thì có nút đăng nhập (kèm cảnh báo
// mất dữ liệu khi xóa trình duyệt), đã đăng nhập thì hiện tên và nút đăng xuất.

import { cookies } from "next/headers";
import type { ProviderId } from "@/server/accounts";
import { GUEST_COOKIE, verifyGuest } from "@/server/guest";
import { enabledProviders } from "@/server/oauth";
import { accountStore } from "@/server/store";

const PROVIDER_NAME: Record<ProviderId, string> = { google: "Google", github: "GitHub" };

export default async function AccountBar({ loginError }: { loginError: boolean }) {
  const id = verifyGuest((await cookies()).get(GUEST_COOKIE)?.value);
  const account = id ? await accountStore().get(id) : null;
  const providers = enabledProviders();
  const missing = providers.filter((p) => !account?.providers.includes(p));

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {loginError && <span className="text-rose-500">Đăng nhập không thành công, thử lại nhé.</span>}
      {account ? (
        <>
          {account.avatarUrl && (
            // Ảnh đại diện từ Google/GitHub, nhỏ nên không cần tối ưu qua next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={account.avatarUrl} alt="" className="size-6 rounded-full" referrerPolicy="no-referrer" />
          )}
          <span className="font-semibold">{account.name}</span>
          {missing.map((p) => (
            <a key={p} href={`/api/auth/${p}?returnTo=/play`} className="rounded bg-[var(--panel)] px-2 py-1" title="Đăng nhập thêm cách này vào cùng tài khoản">
              + {PROVIDER_NAME[p]}
            </a>
          ))}
          <form action="/api/auth/logout?returnTo=/play" method="post">
            <button type="submit" className="rounded bg-[var(--panel)] px-2 py-1">
              Đăng xuất
            </button>
          </form>
        </>
      ) : (
        providers.length > 0 && (
          <>
            <span className="opacity-70" title="Tài khoản khách gắn với trình duyệt này; xóa dữ liệu trình duyệt là mất.">
              Đang chơi với tư cách khách. Đăng nhập để giữ dữ liệu:
            </span>
            {providers.map((p) => (
              <a key={p} href={`/api/auth/${p}?returnTo=/play`} className="rounded bg-amber-500 px-2 py-1 font-semibold text-stone-950">
                {PROVIDER_NAME[p]}
              </a>
            ))}
          </>
        )
      )}
    </div>
  );
}
