// Ba phân cảnh tài khoản, dựng ở server từ cookie rồi truyền vào màn chơi: LOGIN (Google, GitHub, tên đăng
// nhập + mật khẩu, hoặc chơi tiếp với tư cách khách), REGISTER (tài khoản mới giữ trận và tiến độ của khách),
// ACCOUNT (nhà cung cấp đã liên kết, liên kết thêm, đặt hoặc đổi mật khẩu, đăng xuất). Form vẫn là HTML thường
// gửi tới /api/auth/*: đăng nhập xong server chuyển về `returnTo` (tải lại trang để đọc cookie mới).

import type { Account, ProviderId } from "@/server/accounts";
import { scenePath } from "../scene";
import { SceneLink } from "../SceneContext";
import { AuthCard, Divider } from "./AuthCard";
import { AuthSceneLink, OnArrival, ProviderButtons, ReturnLink } from "./AuthLinks";
import type { readAuthParams } from "./params";
import { ChangePasswordForm, LoginForm, RegisterForm } from "./PasswordForms";
import { PROVIDER_NAME, ProviderLogo } from "./ProviderLogo";

type AuthParams = ReturnType<typeof readAuthParams>;

export function LoginScene({ q, providers, guest }: { q: AuthParams; providers: readonly ProviderId[]; guest: boolean }) {
  return (
    <AuthCard title="Đăng nhập" oauthError={q.oauthError}>
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-center text-sm text-stone-300">Đăng nhập để giữ tiến độ và chơi tiếp trên mọi thiết bị.</p>
        <ProviderButtons providers={providers} />
        <Divider>{providers.length > 0 ? "hoặc dùng tên đăng nhập" : "Dùng tên đăng nhập"}</Divider>
        <LoginForm username={q.username} error={q.error} />
        <p className="text-center text-sm text-stone-400">
          Chưa có tài khoản?{" "}
          <AuthSceneLink scene="REGISTER" className="font-semibold text-[var(--gold)] hover:underline">
            Đăng ký
          </AuthSceneLink>
        </p>
        <Divider>hoặc</Divider>
        <ReturnLink className="rounded-lg bg-white/10 px-4 py-2.5 text-center hover:bg-white/15">
          {guest ? "Chơi tiếp với tư cách khách" : "Chơi với tư cách khách"}
        </ReturnLink>
        <p className="text-center text-xs text-stone-500">
          Tài khoản khách gắn với trình duyệt này, xóa dữ liệu trình duyệt là mất. Đăng nhập sau vẫn giữ được trận và tiến độ của khách.
        </p>
      </div>
    </AuthCard>
  );
}

export function RegisterScene({ q, providers }: { q: AuthParams; providers: readonly ProviderId[] }) {
  return (
    <AuthCard title="Đăng ký" oauthError={q.oauthError}>
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-center text-sm text-stone-300">Tạo tài khoản để giữ tiến độ. Trận và tiến độ đang chơi được giữ nguyên.</p>
        <ProviderButtons providers={providers} />
        <Divider>{providers.length > 0 ? "hoặc tạo tên đăng nhập" : "Tạo tên đăng nhập"}</Divider>
        <RegisterForm username={q.username} error={q.error} />
        <p className="text-center text-sm text-stone-400">
          Đã có tài khoản?{" "}
          <AuthSceneLink scene="LOGIN" className="font-semibold text-[var(--gold)] hover:underline">
            Đăng nhập
          </AuthSceneLink>
        </p>
      </div>
    </AuthCard>
  );
}

export function AccountScene({ q, account, linkable }: { q: AuthParams; account: Account; linkable: readonly ProviderId[] }) {
  const here = scenePath("ACCOUNT");
  return (
    <AuthCard title="Tài khoản" oauthError={q.oauthError}>
      <div className="mt-6 flex flex-col items-center gap-4">
        {account.avatarUrl ? (
          // Ảnh đại diện từ Google/GitHub; nhỏ nên không cần tối ưu qua next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={account.avatarUrl} alt="" className="size-16 rounded-full border-2 border-[var(--gold)]" referrerPolicy="no-referrer" />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-full border-2 border-[var(--gold)] text-2xl font-bold">
            {account.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <p className="text-lg font-semibold">{account.name}</p>
          {account.providers.length > 0 && (
            <p className="mt-1 flex items-center justify-center gap-2 text-sm text-stone-400">
              Đã liên kết:
              {account.providers.map((p) => (
                <span key={p} className="inline-flex items-center gap-1">
                  <ProviderLogo provider={p} className="size-4" /> {PROVIDER_NAME[p]}
                </span>
              ))}
            </p>
          )}
        </div>
        <ReturnLink className="w-full rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-4 py-2.5 text-center font-bold uppercase tracking-wider text-amber-50">
          Vào chơi
        </ReturnLink>
        <SceneLink scene="PROFILE" className="w-full rounded-lg bg-white/10 px-4 py-2 text-center text-sm font-semibold hover:bg-white/15">
          Hồ sơ nhân vật
        </SceneLink>
        {linkable.map((p) => (
          <a
            key={p}
            href={`/api/auth/${p}?returnTo=${encodeURIComponent(here)}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
          >
            <ProviderLogo provider={p} /> Liên kết thêm {PROVIDER_NAME[p]}
          </a>
        ))}
        <div className="w-full rounded-lg bg-black/20 p-3 text-sm">
          {account.username ? (
            <>
              <p>
                Tên đăng nhập: <span className="font-semibold">{account.username}</span>
              </p>
              {q.passwordChanged && (
                <OnArrival>
                  <p className="mt-2 text-emerald-400">Đã đổi mật khẩu.</p>
                </OnArrival>
              )}
              <details open={q.error !== null} className="mt-2">
                <summary className="cursor-pointer text-stone-300">Đổi mật khẩu</summary>
                <div className="mt-3">
                  <ChangePasswordForm error={q.error} />
                </div>
              </details>
            </>
          ) : (
            <details open={q.error !== null}>
              <summary className="cursor-pointer text-stone-300">Thêm tên đăng nhập và mật khẩu</summary>
              <div className="mt-3">
                <RegisterForm returnTo={here} username={q.username} error={q.error} label="Lưu tên đăng nhập" />
              </div>
            </details>
          )}
        </div>
        <form action={`/api/auth/logout?returnTo=${encodeURIComponent(scenePath("LOGIN"))}`} method="post" className="w-full">
          <button type="submit" className="w-full rounded-lg px-4 py-2 text-sm text-stone-400 hover:text-stone-200">
            Đăng xuất
          </button>
        </form>
      </div>
    </AuthCard>
  );
}
