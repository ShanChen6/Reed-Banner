import { Alert, buttonVariants } from "@/components/ui";
import { ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
// Các phân cảnh tài khoản, dựng ở server từ cookie rồi truyền vào màn chơi: LOGIN (Google, GitHub, tên đăng
// nhập + mật khẩu, hoặc chơi tiếp với tư cách khách), REGISTER (tài khoản mới giữ trận và tiến độ của khách),
// ACCOUNT (nhà cung cấp đã liên kết, liên kết thêm, đặt hoặc đổi mật khẩu, email, đăng xuất), FORGOT_PASSWORD
// và RESET_PASSWORD (lấy lại mật khẩu qua email). Form vẫn là HTML thường gửi tới /api/auth/*: đăng nhập xong
// server chuyển về `returnTo` (tải lại trang để đọc cookie mới).

import type { Account, ProviderId } from "@/server/accounts";
import { RESET_TTL_MS } from "@/server/recovery";
import { scenePath } from "../scene";
import { SceneLink } from "../SceneContext";
import { AccountStats } from "./AccountStats";
import { AvatarPicker } from "./AvatarPicker";
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
    <AuthCard title="Trình danh" subtitle="Trình danh hiệu để vào trại. Chiến công theo bạn tới mọi nơi đặt chân." oauthError={q.oauthError}>
      <div className="mt-5 flex flex-col gap-3">
        <Notice show={q.emailVerified}>Thư tín đã xác nhận. Xin trình danh hiệu để vào trại.</Notice>
        <ProviderButtons providers={providers} />
        <Divider>{providers.length > 0 ? "hoặc trình danh hiệu và mật lệnh" : "Trình danh hiệu và mật lệnh"}</Divider>
        <LoginForm username={q.username} error={q.error} />
        {mail && (
          <p className="-mt-1 text-right text-sm">
            <AuthSceneLink scene="FORGOT_PASSWORD" className="ui-link text-on-wood-soft hover:text-primary hover:underline">
              Quên mật lệnh?
            </AuthSceneLink>
          </p>
        )}
        <p className="text-center text-sm text-on-wood-soft">
          Chưa có tên trong sổ quân?{" "}
          <AuthSceneLink scene="REGISTER" className="ui-link font-semibold text-primary hover:underline">
            Ghi danh
          </AuthSceneLink>
        </p>
        <Divider>hoặc</Divider>
        <ReturnLink className={buttonVariants({ variant: "secondary", fullWidth: true })}>
          {guest ? "Đi tiếp với thân phận lữ khách" : "Vào trại với thân phận lữ khách"}
        </ReturnLink>
        <p className="text-center text-caption text-on-wood-soft">
          Thân phận lữ khách chỉ ghi trong trình duyệt này, xóa dữ liệu trình duyệt là mất dấu. Ghi danh sau vẫn giữ được trận và chiến công đã có.
        </p>
      </div>
    </AuthCard>
  );
}

export function RegisterScene({ q, providers, mail }: { q: AuthParams; providers: readonly ProviderId[]; mail: boolean }) {
  return (
    <AuthCard title="Ghi danh" subtitle="Ghi tên vào sổ quân để giữ chiến công lâu dài. Trận đang đánh và tiến độ đã có được giữ nguyên." oauthError={q.oauthError}>
      <div className="mt-5 flex flex-col gap-3">
        <ProviderButtons providers={providers} />
        <Divider>{providers.length > 0 ? "hoặc tự đặt danh hiệu" : "Tự đặt danh hiệu"}</Divider>
        <RegisterForm username={q.username} error={q.error} mail={mail} />
        <p className="text-center text-sm text-on-wood-soft">
          Đã có tên trong sổ quân?{" "}
          <AuthSceneLink scene="LOGIN" className="ui-link font-semibold text-primary hover:underline">
            Trình danh
          </AuthSceneLink>
        </p>
      </div>
    </AuthCard>
  );
}

const dateVi = (ms: number) => new Date(ms).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" });

/** Lối tắt từ trang Tài khoản tới các màn giữ tài sản của tài khoản. */
const SHORTCUTS = [
  { scene: "PROFILE", title: "Doanh Trại", note: "Tướng quân, đội hình, kho đồ" },
  { scene: "TIERS", title: "Ban Thưởng", note: "Thưởng bậc của các chế độ xếp hạng" },
  { scene: "LEADERBOARD", title: "Công Trạng", note: "Thứ hạng của bạn ở mọi bảng" },
  { scene: "QUESTS", title: "Nhiệm vụ", note: "Nhiệm vụ tuần và thành tựu" },
  { scene: "SHOP", title: "Cửa Hàng", note: "Tướng, trang bị, vật phẩm" },
] as const;

/**
 * Trang Tài khoản (Shan 18/11/2026): thẻ đầu trang (ảnh, tên, ngày ghi danh, nút vào chơi), dải tài sản đọc từ hồ sơ,
 * rồi các thẻ Liên kết, Danh hiệu và mật lệnh, Địa chỉ thư, Lối tắt, Rời trại. Form vẫn gửi tới /api/auth/*.
 */
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
  const providers = [...account.providers, ...linkable];
  return (
    <ModeScreen label="Tài khoản">
      {q.oauthError && (
        <OnArrival>
          <Alert>Liên kết chưa thành. Xin thử lại.</Alert>
        </OnArrival>
      )}
      <OrnateFrame level="hero" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex shrink-0 flex-col items-center gap-2">
          {account.avatarUrl ? (
            // Ảnh đại diện từ Google/GitHub; nhỏ nên không cần tối ưu qua next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={account.avatarUrl} alt="Ảnh đại diện" className="size-20 shrink-0 rounded-full border-2 border-frame-gold object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div aria-hidden className="flex size-20 shrink-0 items-center justify-center rounded-full border-2 border-frame-gold bg-lacquer font-serif text-3xl font-bold text-paper-hi">
              {account.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <AvatarPicker current={account.avatarUrl} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-caption font-semibold tracking-[0.15em] text-frame-gold uppercase">Tài khoản đã ghi danh</p>
            <h1 className="ui-title-on-wood truncate font-serif text-2xl font-bold">{account.name}</h1>
            <p className="mt-1 text-sm text-on-wood-soft">
              {account.username ? <>Danh hiệu <span className="font-semibold text-on-wood">{account.username}</span>, </> : null}
              Ghi danh từ {dateVi(account.createdAt)}, trình danh gần nhất {dateVi(account.lastLoginAt)}
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <ReturnLink className={buttonVariants({ size: "lg", className: "flex-1 sm:flex-none" })}>Vào chơi</ReturnLink>
            <SceneLink scene="PROFILE" className={buttonVariants({ variant: "secondary", size: "lg", className: "flex-1 sm:flex-none" })}>
              Doanh Trại
            </SceneLink>
          </div>
        </div>
        <AccountStats />
      </OrnateFrame>

      <div className="grid gap-4 lg:grid-cols-2">
        <OrnateFrame className="flex flex-col gap-3">
          <SectionTitle description="Liên kết thêm để trình danh nhanh và còn đường vào trại khi quên mật lệnh.">Liên kết</SectionTitle>
          {providers.length === 0 ? (
            <p className="text-sm text-on-wood-soft">Máy chủ chưa mở trình danh bằng Google hay GitHub.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {providers.map((p) => {
                const linked = account.providers.includes(p);
                return (
                  <li key={p} className="ui-frame-inset flex items-center gap-3 px-3 py-2">
                    <ProviderLogo provider={p} className="size-6 shrink-0" />
                    <span className="flex-1 font-semibold">{PROVIDER_NAME[p]}</span>
                    {linked ? (
                      <span className="rounded-full bg-jade/20 px-3 py-1 text-caption font-semibold text-jade">✓ Đã liên kết</span>
                    ) : (
                      <a href={`/api/auth/${p}?returnTo=${encodeURIComponent(here)}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Liên kết thêm {PROVIDER_NAME[p]}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </OrnateFrame>

        <OrnateFrame className="flex flex-col gap-3">
          <SectionTitle description={account.username ? "Danh hiệu dùng để trình danh cùng mật lệnh." : "Thêm danh hiệu và mật lệnh để trình danh không cần Google hay GitHub."}>
            Danh hiệu và mật lệnh
          </SectionTitle>
          {account.username ? (
            <>
              <p className="text-sm">
                Danh hiệu: <span className="font-semibold">{account.username}</span>
              </p>
              {(q.passwordChanged || q.passwordReset) && (
                <OnArrival>
                  <Alert tone="success">{q.passwordReset ? "Đã đặt mật lệnh mới." : "Đã đổi mật lệnh."}</Alert>
                </OnArrival>
              )}
              <details open={q.error !== null} className="ui-frame-inset px-3 py-2">
                <summary className="cursor-pointer font-semibold text-on-wood pointer-coarse:py-3">Đổi mật lệnh</summary>
                <div className="mt-3">
                  <ChangePasswordForm error={q.error} />
                </div>
              </details>
            </>
          ) : (
            <details open={q.error !== null} className="ui-frame-inset px-3 py-2">
              <summary className="cursor-pointer font-semibold text-on-wood pointer-coarse:py-3">Thêm danh hiệu và mật lệnh</summary>
              <div className="mt-3">
                <RegisterForm returnTo={here} username={q.username} error={q.error} label="Lưu danh hiệu" mail={mail} />
              </div>
            </details>
          )}
        </OrnateFrame>

        {mail && (account.username || account.email) && (
          <OrnateFrame className="flex flex-col gap-3">
            <SectionTitle description="Địa chỉ thư đã xác nhận là đường lấy lại mật lệnh.">Địa chỉ thư</SectionTitle>
            <p className="text-sm">
              {account.email ? <span className="font-semibold break-all">{account.email}</span> : <span className="text-on-wood-soft">Chưa có địa chỉ thư.</span>}
            </p>
            <Notice show={q.emailVerified}>Thư tín đã xác nhận. Quên mật lệnh thì lấy lại qua địa chỉ thư này.</Notice>
            <Notice show={q.emailSent}>Đã gửi thư xác nhận. Xin mở thư và bấm đường dẫn trong đó.</Notice>
            {!account.email && <Alert tone="warning" className="text-caption">Chưa có địa chỉ thư thì quên mật lệnh là không lấy lại được.</Alert>}
            <details open={q.emailError !== null} className="ui-frame-inset px-3 py-2">
              <summary className="cursor-pointer font-semibold text-on-wood pointer-coarse:py-3">{account.email ? "Đổi địa chỉ thư" : "Thêm địa chỉ thư để lấy lại mật lệnh"}</summary>
              <div className="mt-3">
                <EmailForm current={account.email} error={q.emailError} />
              </div>
            </details>
          </OrnateFrame>
        )}

        <OrnateFrame className="flex flex-col gap-3">
          <SectionTitle>Lối tắt</SectionTitle>
          <ul className="grid gap-2 sm:grid-cols-2">
            {SHORTCUTS.map((c) => (
              <li key={c.scene}>
                <SceneLink scene={c.scene} className="ui-frame-inset flex min-h-14 items-center gap-3 px-3 py-2 hover:border-frame-gold">
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif font-semibold text-title-on-wood">{c.title}</span>
                    <span className="block text-caption text-on-wood-soft">{c.note}</span>
                  </span>
                  <span aria-hidden className="text-frame-gold">›</span>
                </SceneLink>
              </li>
            ))}
          </ul>
        </OrnateFrame>

        <OrnateFrame className="flex flex-col gap-3">
          <SectionTitle description="Rời trại trên máy này. Chiến công vẫn giữ trong tài khoản, trình danh lại là có.">Rời trại</SectionTitle>
          <form action={`/api/auth/logout?returnTo=${encodeURIComponent(scenePath("LOGIN"))}`} method="post">
            <button type="submit" className={buttonVariants({ variant: "danger", className: "w-full sm:w-auto" })}>
              Đăng xuất
            </button>
          </form>
        </OrnateFrame>
      </div>
    </ModeScreen>
  );
}

export function ForgotPasswordScene({ q, mail }: { q: AuthParams; mail: boolean }) {
  return (
    <AuthCard title="Quên mật lệnh">
      <div className="mt-5 flex flex-col gap-3">
        {!mail ? (
          <p className="text-center text-sm text-on-wood-soft">Trạm thư chưa mở nên chưa lấy lại được mật lệnh.</p>
        ) : q.sent ? (
          <Alert tone="success">
            Nếu thông tin đúng và tài khoản đã xác nhận email, thư đặt lại mật lệnh đang trên đường tới. Đường dẫn trong thư dùng được
            một lần trong {RESET_TTL_MS / 60_000} phút. Không thấy thì xem cả thư mục thư rác.
          </Alert>
        ) : (
          <>
            <p className="text-center text-sm text-on-wood-soft">
              Xưng danh hiệu hoặc địa chỉ thư, trạm thư sẽ gửi đường dẫn đặt mật lệnh mới tới địa chỉ thư đã xác nhận của tài khoản.
            </p>
            <ForgotPasswordForm />
          </>
        )}
        <p className="text-center text-sm text-on-wood-soft">
          <AuthSceneLink scene="LOGIN" className="ui-link font-semibold text-primary hover:underline">
            Quay lại cổng trại
          </AuthSceneLink>
        </p>
      </div>
    </AuthCard>
  );
}

export function ResetPasswordScene({ q }: { q: AuthParams }) {
  return (
    <AuthCard title="Đặt lại mật lệnh">
      <div className="mt-5 flex flex-col gap-3">
        {q.token ? (
          <ResetPasswordForm token={q.token} error={q.error} />
        ) : (
          <Alert role="alert" className="text-sm">
            {q.error === "badToken" ? "Đường dẫn đã dùng rồi hoặc hết hạn." : "Đường dẫn thiếu mã đặt lại."} Xin gửi yêu cầu mới.
          </Alert>
        )}
        <p className="text-center text-sm text-on-wood-soft">
          <AuthSceneLink scene="FORGOT_PASSWORD" className="ui-link font-semibold text-primary hover:underline">
            Gửi lại thư đặt lại mật lệnh
          </AuthSceneLink>
        </p>
      </div>
    </AuthCard>
  );
}
