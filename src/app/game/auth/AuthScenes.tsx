import { Alert, buttonVariants } from "@/components/ui";
// Các phân cảnh tài khoản, dựng ở server từ cookie rồi truyền vào màn chơi: LOGIN (Google, GitHub, tên đăng
// nhập + mật khẩu, hoặc chơi tiếp với tư cách khách), REGISTER (tài khoản mới giữ trận và tiến độ của khách),
// ACCOUNT (nhà cung cấp đã liên kết, liên kết thêm, đặt hoặc đổi mật khẩu, email, đăng xuất), FORGOT_PASSWORD
// và RESET_PASSWORD (lấy lại mật khẩu qua email). Form vẫn là HTML thường gửi tới /api/auth/*: đăng nhập xong
// server chuyển về `returnTo` (tải lại trang để đọc cookie mới).

import type { Account, ProviderId } from "@/server/accounts";
import { RESET_TTL_MS } from "@/server/recovery";
import { scenePath } from "../scene";
import { SceneLink } from "../SceneContext";
import { AuthCard, Divider } from "./AuthCard";
import { AuthSceneLink, OnArrival, ProviderButtons, ReturnLink } from "./AuthLinks";
import type { readAuthParams } from "./params";
import { ChangePasswordForm, EmailForm, ForgotPasswordForm, LoginForm, RegisterForm, ResetPasswordForm } from "./PasswordForms";
import { PROVIDER_NAME, ProviderLogo } from "./ProviderLogo";

type AuthParams = ReturnType<typeof readAuthParams>;

function Notice({ show, children }: { show: boolean; children: React.ReactNode }) {
  return show ? (
    <OnArrival>
      <Alert tone="success">{children}</Alert>
    </OnArrival>
  ) : null;
}

export function LoginScene({
  q,
  providers,
  guest,
  mail,
}: {
  q: AuthParams;
  providers: readonly ProviderId[];
  guest: boolean;
  mail: boolean;
}) {
  return (
    <AuthCard title="Đăng nhập" oauthError={q.oauthError}>
      <div className="mt-6 flex flex-col gap-3">
        <Notice show={q.emailVerified}>Đã xác nhận email. Đăng nhập để chơi tiếp nhé.</Notice>
        <p className="text-center text-sm text-on-wood-soft">Đăng nhập để giữ tiến độ và chơi tiếp trên mọi thiết bị.</p>
        <ProviderButtons providers={providers} />
        <Divider>{providers.length > 0 ? "hoặc dùng tên đăng nhập" : "Dùng tên đăng nhập"}</Divider>
        <LoginForm username={q.username} error={q.error} />
        {mail && (
          <p className="-mt-1 text-right text-sm">
            <AuthSceneLink scene="FORGOT_PASSWORD" className="ui-link text-on-wood-soft hover:text-primary hover:underline">
              Quên mật khẩu?
            </AuthSceneLink>
          </p>
        )}
        <p className="text-center text-sm text-on-wood-soft">
          Chưa có tài khoản?{" "}
          <AuthSceneLink scene="REGISTER" className="ui-link font-semibold text-primary hover:underline">
            Đăng ký
          </AuthSceneLink>
        </p>
        <Divider>hoặc</Divider>
        <ReturnLink className={buttonVariants({ variant: "secondary", fullWidth: true })}>
          {guest ? "Chơi tiếp với tư cách khách" : "Chơi với tư cách khách"}
        </ReturnLink>
        <p className="text-center text-caption text-on-wood-soft">
          Tài khoản khách gắn với trình duyệt này, xóa dữ liệu trình duyệt là mất. Đăng nhập sau vẫn giữ được trận và tiến độ của khách.
        </p>
      </div>
    </AuthCard>
  );
}

export function RegisterScene({ q, providers, mail }: { q: AuthParams; providers: readonly ProviderId[]; mail: boolean }) {
  return (
    <AuthCard title="Đăng ký" oauthError={q.oauthError}>
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-center text-sm text-on-wood-soft">Tạo tài khoản để giữ tiến độ. Trận và tiến độ đang chơi được giữ nguyên.</p>
        <ProviderButtons providers={providers} />
        <Divider>{providers.length > 0 ? "hoặc tạo tên đăng nhập" : "Tạo tên đăng nhập"}</Divider>
        <RegisterForm username={q.username} error={q.error} mail={mail} />
        <p className="text-center text-sm text-on-wood-soft">
          Đã có tài khoản?{" "}
          <AuthSceneLink scene="LOGIN" className="ui-link font-semibold text-primary hover:underline">
            Đăng nhập
          </AuthSceneLink>
        </p>
      </div>
    </AuthCard>
  );
}

export function AccountScene({
  q,
  account,
  linkable,
  mail,
}: {
  q: AuthParams;
  account: Account;
  linkable: readonly ProviderId[];
  mail: boolean;
}) {
  const here = scenePath("ACCOUNT");
  return (
    <AuthCard title="Tài khoản" oauthError={q.oauthError}>
      <div className="mt-6 flex flex-col items-center gap-4">
        {account.avatarUrl ? (
          // Ảnh đại diện từ Google/GitHub; nhỏ nên không cần tối ưu qua next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={account.avatarUrl} alt="" className="size-16 rounded-full border-2 border-frame-gold" referrerPolicy="no-referrer" />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-full border-2 border-frame-gold text-2xl font-bold">
            {account.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <p className="text-lg font-semibold">{account.name}</p>
          {account.providers.length > 0 && (
            <p className="mt-1 flex items-center justify-center gap-2 text-sm text-on-wood-soft">
              Đã liên kết:
              {account.providers.map((p) => (
                <span key={p} className="inline-flex items-center gap-1">
                  <ProviderLogo provider={p} className="size-4" /> {PROVIDER_NAME[p]}
                </span>
              ))}
            </p>
          )}
        </div>
        <ReturnLink className={buttonVariants({ size: "lg", fullWidth: true })}>
          Vào chơi
        </ReturnLink>
        <SceneLink scene="PROFILE" className={buttonVariants({ variant: "secondary", fullWidth: true })}>
          Doanh Trại
        </SceneLink>
        {linkable.map((p) => (
          <a
            key={p}
            href={`/api/auth/${p}?returnTo=${encodeURIComponent(here)}`}
            className={buttonVariants({ variant: "secondary", fullWidth: true, className: "font-normal" })}
          >
            <ProviderLogo provider={p} /> Liên kết thêm {PROVIDER_NAME[p]}
          </a>
        ))}
        <div className="ui-frame-inset w-full p-3 text-sm">
          {account.username ? (
            <>
              <p>
                Tên đăng nhập: <span className="font-semibold">{account.username}</span>
              </p>
              {(q.passwordChanged || q.passwordReset) && (
                <OnArrival>
                  <p className="mt-2 text-jade">{q.passwordReset ? "Đã đặt mật khẩu mới." : "Đã đổi mật khẩu."}</p>
                </OnArrival>
              )}
              <details open={q.error !== null} className="mt-2">
                <summary className="cursor-pointer text-on-wood-soft pointer-coarse:py-3.5">Đổi mật khẩu</summary>
                <div className="mt-3">
                  <ChangePasswordForm error={q.error} />
                </div>
              </details>
            </>
          ) : (
            <details open={q.error !== null}>
              <summary className="cursor-pointer text-on-wood-soft pointer-coarse:py-3.5">Thêm tên đăng nhập và mật khẩu</summary>
              <div className="mt-3">
                <RegisterForm returnTo={here} username={q.username} error={q.error} label="Lưu tên đăng nhập" mail={mail} />
              </div>
            </details>
          )}
        </div>
        {mail && (account.username || account.email) && (
          <div className="ui-frame-inset flex w-full flex-col gap-2 p-3 text-sm">
            <p>
              Email:{" "}
              {account.email ? <span className="font-semibold break-all">{account.email}</span> : <span className="text-on-wood-soft">chưa có</span>}
            </p>
            <Notice show={q.emailVerified}>Đã xác nhận email. Quên mật khẩu thì lấy lại qua email này.</Notice>
            <Notice show={q.emailSent}>Đã gửi thư xác nhận. Bạn mở thư và bấm đường dẫn trong đó nhé.</Notice>
            {!account.email && (
              <Alert tone="warning" className="p-2 text-caption">Chưa có email thì quên mật khẩu là không lấy lại được.</Alert>
            )}
            <details open={q.emailError !== null}>
              <summary className="cursor-pointer text-on-wood-soft pointer-coarse:py-3.5">{account.email ? "Đổi email" : "Thêm email để lấy lại mật khẩu"}</summary>
              <div className="mt-3">
                <EmailForm current={account.email} error={q.emailError} />
              </div>
            </details>
          </div>
        )}
        <form action={`/api/auth/logout?returnTo=${encodeURIComponent(scenePath("LOGIN"))}`} method="post" className="w-full">
          <button type="submit" className={buttonVariants({ variant: "ghost", fullWidth: true, className: "text-sm text-on-wood-soft" })}>
            Đăng xuất
          </button>
        </form>
      </div>
    </AuthCard>
  );
}

export function ForgotPasswordScene({ q, mail }: { q: AuthParams; mail: boolean }) {
  return (
    <AuthCard title="Quên mật khẩu">
      <div className="mt-6 flex flex-col gap-3">
        {!mail ? (
          <p className="text-center text-sm text-on-wood-soft">Trò chơi chưa bật gửi email nên chưa lấy lại được mật khẩu.</p>
        ) : q.sent ? (
          <Alert tone="success">
            Nếu thông tin đúng và tài khoản đã xác nhận email, thư đặt lại mật khẩu đang trên đường tới. Đường dẫn trong thư dùng được
            một lần trong {RESET_TTL_MS / 60_000} phút. Không thấy thì xem cả thư mục thư rác.
          </Alert>
        ) : (
          <>
            <p className="text-center text-sm text-on-wood-soft">
              Nhập tên đăng nhập hoặc email, chúng tôi gửi đường dẫn đặt mật khẩu mới tới email đã xác nhận của tài khoản.
            </p>
            <ForgotPasswordForm />
          </>
        )}
        <p className="text-center text-sm text-on-wood-soft">
          <AuthSceneLink scene="LOGIN" className="ui-link font-semibold text-primary hover:underline">
            Quay lại đăng nhập
          </AuthSceneLink>
        </p>
      </div>
    </AuthCard>
  );
}

export function ResetPasswordScene({ q }: { q: AuthParams }) {
  return (
    <AuthCard title="Đặt lại mật khẩu">
      <div className="mt-6 flex flex-col gap-3">
        {q.token ? (
          <ResetPasswordForm token={q.token} error={q.error} />
        ) : (
          <Alert role="alert" className="text-sm">
            {q.error === "badToken" ? "Đường dẫn đã dùng rồi hoặc hết hạn." : "Đường dẫn thiếu mã đặt lại."} Bạn gửi yêu cầu mới nhé.
          </Alert>
        )}
        <p className="text-center text-sm text-on-wood-soft">
          <AuthSceneLink scene="FORGOT_PASSWORD" className="ui-link font-semibold text-primary hover:underline">
            Gửi lại thư đặt lại mật khẩu
          </AuthSceneLink>
        </p>
      </div>
    </AuthCard>
  );
}
