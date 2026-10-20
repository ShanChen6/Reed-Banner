// Form tên đăng nhập + mật khẩu và email của các phân cảnh tài khoản: form HTML thường gửi thẳng tới
// /api/auth/*, lỗi quay về phân cảnh đã gửi qua tham số `error` (form email: `emailError`). Dựng ở server.

import { PASSWORD_MIN, type PasswordError } from "@/server/password";
import { EMAIL_MAX } from "@/server/recovery";
import { ReturnToInput } from "../SceneContext";
import { OnArrival } from "./AuthLinks";

export const PASSWORD_ERROR: Record<PasswordError, string> = {
  badUsername: "Tên đăng nhập gồm 3–20 ký tự: chữ không dấu, số, dấu chấm hoặc gạch dưới.",
  badPassword: `Mật khẩu cần từ ${PASSWORD_MIN} ký tự trở lên.`,
  mismatch: "Hai lần nhập mật khẩu không khớp.",
  taken: "Tên đăng nhập này đã có người dùng.",
  hasPassword: "Tài khoản này đã có tên đăng nhập.",
  wrong: "Sai tên đăng nhập hoặc mật khẩu.",
  locked: "Sai quá nhiều lần, tên đăng nhập này tạm khóa 15 phút.",
  noPassword: "Tài khoản này chưa có mật khẩu.",
  badEmail: "Email không hợp lệ.",
  emailTaken: "Email này đã gắn với một tài khoản khác.",
  badToken: "Đường dẫn đã dùng rồi hoặc hết hạn. Bạn gửi yêu cầu mới nhé.",
  tooMany: "Đã gửi nhiều thư quá, bạn đợi một giờ rồi thử lại nhé.",
};

const input = "w-full rounded-lg bg-black/30 px-3 py-2 text-stone-100 ring-1 ring-stone-600 placeholder:text-stone-500 focus:outline-none focus:ring-[var(--gold)]";
const submit = "rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-stone-950 hover:bg-amber-400";

function ErrorLine({ error, text }: { error: PasswordError | null; text?: Partial<Record<PasswordError, string>> }) {
  return error ? (
    <OnArrival>
      <p role="alert" className="rounded bg-rose-900/40 px-3 py-2 text-sm text-rose-200">
        {text?.[error] ?? PASSWORD_ERROR[error]}
      </p>
    </OnArrival>
  ) : null;
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-stone-300">{label}</span>
      <input className={input} {...props} />
    </label>
  );
}

function EmailField({ label = "Email (không bắt buộc)", required }: { label?: string; required?: boolean }) {
  return <Field label={label} name="email" type="email" autoComplete="email" maxLength={EMAIL_MAX} required={required} />;
}

export function LoginForm({ username, error }: { username: string; error: PasswordError | null }) {
  return (
    <form action="/api/auth/password/login" method="post" className="flex flex-col gap-3">
      <ErrorLine error={error} />
      <ReturnToInput />
      <Field label="Tên đăng nhập" name="username" defaultValue={username} autoComplete="username" required autoCapitalize="none" />
      <Field label="Mật khẩu" name="password" type="password" autoComplete="current-password" required />
      <button type="submit" className={submit}>
        Đăng nhập
      </button>
    </form>
  );
}

/** Đăng ký mới, hoặc (khi đã đăng nhập Google/GitHub) thêm tên đăng nhập vào tài khoản đang dùng. */
export function RegisterForm({
  returnTo,
  username,
  error,
  label = "Đăng ký",
  mail,
}: {
  /** Bỏ trống thì lấy `returnTo` trên thanh địa chỉ. */
  returnTo?: string;
  username: string;
  error: PasswordError | null;
  label?: string;
  /** Có gửi được thư không: có thì hỏi thêm email để lấy lại mật khẩu. */
  mail: boolean;
}) {
  return (
    <form action="/api/auth/password/register" method="post" className="flex flex-col gap-3">
      <ErrorLine error={error} />
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : <ReturnToInput />}
      <Field
        label="Tên đăng nhập"
        name="username"
        defaultValue={username}
        autoComplete="username"
        required
        minLength={3}
        maxLength={20}
        pattern="[A-Za-z0-9_.]{3,20}"
        title="3–20 ký tự: chữ không dấu, số, dấu chấm hoặc gạch dưới"
        autoCapitalize="none"
      />
      <Field label={`Mật khẩu (từ ${PASSWORD_MIN} ký tự)`} name="password" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      <Field label="Nhập lại mật khẩu" name="confirm" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      {mail ? (
        <>
          <EmailField />
          <p className="rounded bg-amber-900/30 px-3 py-2 text-xs text-amber-200">
            Thêm email để lấy lại mật khẩu khi quên (chúng tôi gửi thư xác nhận trước). Không có email thì quên mật khẩu là mất tài khoản.
          </p>
        </>
      ) : (
        <p className="rounded bg-amber-900/30 px-3 py-2 text-xs text-amber-200">
          Chưa có cách lấy lại mật khẩu: quên là mất tài khoản. Nên liên kết thêm Google hoặc GitHub sau khi đăng ký.
        </p>
      )}
      <button type="submit" className={submit}>
        {label}
      </button>
    </form>
  );
}

export function ChangePasswordForm({ error }: { error: PasswordError | null }) {
  return (
    <form action="/api/auth/password/change" method="post" className="flex flex-col gap-3">
      <ErrorLine error={error} text={{ wrong: "Mật khẩu hiện tại không đúng." }} />
      <Field label="Mật khẩu hiện tại" name="current" type="password" autoComplete="current-password" required />
      <Field label={`Mật khẩu mới (từ ${PASSWORD_MIN} ký tự)`} name="password" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      <Field label="Nhập lại mật khẩu mới" name="confirm" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      <button type="submit" className={submit}>
        Đổi mật khẩu
      </button>
    </form>
  );
}

/** Quên mật khẩu: nhập tên đăng nhập hoặc email, thư đặt lại gửi tới email đã xác nhận của tài khoản. */
export function ForgotPasswordForm() {
  return (
    <form action="/api/auth/password/forgot" method="post" className="flex flex-col gap-3">
      <Field label="Tên đăng nhập hoặc email" name="login" autoComplete="username" required maxLength={EMAIL_MAX} autoCapitalize="none" />
      <button type="submit" className={submit}>
        Gửi thư đặt lại mật khẩu
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token, error }: { token: string; error: PasswordError | null }) {
  return (
    <form action="/api/auth/password/reset" method="post" className="flex flex-col gap-3">
      <ErrorLine error={error} />
      <input type="hidden" name="token" value={token} />
      <Field label={`Mật khẩu mới (từ ${PASSWORD_MIN} ký tự)`} name="password" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      <Field label="Nhập lại mật khẩu mới" name="confirm" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      <button type="submit" className={submit}>
        Đặt mật khẩu mới
      </button>
    </form>
  );
}

/** Thêm hoặc đổi email ở Tài khoản; email chỉ được lưu sau khi bấm đường dẫn trong thư xác nhận. */
export function EmailForm({ current, error }: { current: string | null; error: PasswordError | null }) {
  return (
    <form action="/api/auth/email" method="post" className="flex flex-col gap-3">
      <ErrorLine error={error} />
      <EmailField label={current ? "Email mới" : "Email"} required />
      <button type="submit" className={submit}>
        Gửi thư xác nhận
      </button>
    </form>
  );
}
