// Khu tài khoản trên đầu trang /play, dựng ở server từ cookie: khách thì có link sang trang đăng nhập,
// đã đăng nhập thì hiện tên (bấm vào để xem tài khoản) và nút đăng xuất.

import Link from "next/link";
import { currentUser } from "@/server/session";

export default async function AccountBar({ loginError }: { loginError: boolean }) {
  const { account } = await currentUser();

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {loginError && <span className="text-rose-500">Đăng nhập không thành công, thử lại nhé.</span>}
      {account ? (
        <>
          <Link href="/dang-nhap?returnTo=/play" className="flex items-center gap-2" title="Tài khoản">
            {account.avatarUrl && (
              // Ảnh đại diện từ Google/GitHub, nhỏ nên không cần tối ưu qua next/image.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={account.avatarUrl} alt="" className="size-6 rounded-full" referrerPolicy="no-referrer" />
            )}
            <span className="font-semibold">{account.name}</span>
          </Link>
          <form action="/api/auth/logout?returnTo=/play" method="post">
            <button type="submit" className="rounded bg-[var(--panel)] px-2 py-1">
              Đăng xuất
            </button>
          </form>
        </>
      ) : (
        <>
          <span className="opacity-70">Đang chơi với tư cách khách.</span>
          <Link href="/dang-nhap?returnTo=/play" className="rounded bg-amber-500 px-2 py-1 font-semibold text-stone-950">
            Đăng nhập
          </Link>
        </>
      )}
    </div>
  );
}
