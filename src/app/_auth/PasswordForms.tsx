// Form tên đăng nhập + mật khẩu của các trang /login, /register, /account: form HTML thường gửi thẳng tới
// /api/auth/password/*, lỗi quay về trang đã gửi qua tham số `error`.

import { PASSWORD_MIN, type PasswordError } from "@/server/password";

export const PASSWORD_ERROR: Record<PasswordError, string> = {
  badUsername: "Tên đăng nhập gồm 3–20 ký tự: chữ không dấu, số, dấu chấm hoặc gạch dưới.",
  badPassword: `Mật khẩu cần từ ${PASSWORD_MIN} ký tự trở lên.`,
  mismatch: "Hai lần nhập mật khẩu không khớp.",
  taken: "Tên đăng nhập này đã có người dùng.",
  hasPassword: "Tài khoản này đã có tên đăng nhập.",
  wrong: "Sai tên đăng nhập hoặc mật khẩu.",
  locked: "Sai quá nhiều lần, tên đăng nhập này tạm khóa 15 phút.",
  noPassword: "Tài khoản này chưa có mật khẩu.",
};

const input = "w-full rounded-lg bg-black/30 px-3 py-2 text-stone-100 ring-1 ring-stone-600 placeholder:text-stone-500 focus:outline-none focus:ring-[var(--gold)]";
const submit = "rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-stone-950 hover:bg-amber-400";

function ErrorLine({ error, text }: { error: PasswordError | null; text?: Partial<Record<PasswordError, string>> }) {
  return error ? (
    <p role="alert" className="rounded bg-rose-900/40 px-3 py-2 text-sm text-rose-200">
      {text?.[error] ?? PASSWORD_ERROR[error]}
    </p>
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

export function LoginForm({ returnTo, username, error }: { returnTo: string; username: string; error: PasswordError | null }) {
  return (
    <form action="/api/auth/password/login" method="post" className="flex flex-col gap-3">
      <ErrorLine error={error} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <Field label="Tên đăng nhập" name="username" defaultValue={username} autoComplete="username" required autoCapitalize="none" />
      <Field label="Mật khẩu" name="password" type="password" autoComplete="current-password" required />
      <button type="submit" className={submit}>
        Đăng nhập
      </button>
    </form>
  );
}

/** Đăng ký mới, hoặc (khi đã đăng nhập Google/GitHub) thêm tên đăng nhập vào tài khoản đang dùng. */
export function RegisterForm({ returnTo, username, error, label = "Đăng ký" }: { returnTo: string; username: string; error: PasswordError | null; label?: string }) {
  return (
    <form action="/api/auth/password/register" method="post" className="flex flex-col gap-3">
      <ErrorLine error={error} />
      <input type="hidden" name="returnTo" value={returnTo} />
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
      <p className="rounded bg-amber-900/30 px-3 py-2 text-xs text-amber-200">
        Chưa có cách lấy lại mật khẩu: quên là mất tài khoản. Nên liên kết thêm Google hoặc GitHub sau khi đăng ký.
      </p>
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
