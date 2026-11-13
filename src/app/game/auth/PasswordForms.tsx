import { Input, Alert, Button, FormField } from "@/components/ui";
// Form tên đăng nhập + mật khẩu và email của các phân cảnh tài khoản: form HTML thường gửi thẳng tới
// /api/auth/*, lỗi quay về phân cảnh đã gửi qua tham số `error` (form email: `emailError`). Dựng ở server.

import { PASSWORD_MIN, type PasswordError } from "@/server/password";
import { EMAIL_MAX } from "@/server/recovery";
import { ReturnToInput } from "../SceneContext";
import { OnArrival } from "./AuthLinks";

export const PASSWORD_ERROR: Record<PasswordError, string> = {
  badUsername: "Danh hiệu gồm 3–20 ký tự: chữ không dấu, số, dấu chấm hoặc gạch dưới.",
  badPassword: `Mật lệnh cần từ ${PASSWORD_MIN} ký tự trở lên.`,
  mismatch: "Hai lần đọc mật lệnh không khớp nhau. Xin nhập lại.",
  taken: "Danh hiệu này đã có người mang. Xin chọn danh hiệu khác.",
  hasPassword: "Tài khoản này đã có danh hiệu.",
  wrong: "Danh hiệu hoặc mật lệnh không đúng. Lính gác chưa cho qua.",
  locked: "Sai quá nhiều lần, cổng trại đóng với danh hiệu này 15 phút. Xin quay lại sau.",
  noPassword: "Tài khoản này chưa đặt mật lệnh.",
  badEmail: "Địa chỉ thư (email) không hợp lệ.",
  emailTaken: "Địa chỉ thư này đã thuộc về một tài khoản khác.",
  badToken: "Đường dẫn đã dùng rồi hoặc hết hạn. Xin gửi yêu cầu mới.",
  tooMany: "Trạm thư đã gửi quá nhiều. Xin đợi một canh giờ rồi thử lại.",
};


function ErrorLine({ error, text }: { error: PasswordError | null; text?: Partial<Record<PasswordError, string>> }) {
  return error ? (
    <OnArrival>
      <Alert role="alert" className="text-sm">
        {text?.[error] ?? PASSWORD_ERROR[error]}
      </Alert>
    </OnArrival>
  ) : null;
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FormField label={label}>
      <Input {...props} />
    </FormField>
  );
}

function EmailField({ label = "Địa chỉ thư (email, không bắt buộc)", required }: { label?: string; required?: boolean }) {
  return <Field label={label} name="email" type="email" autoComplete="email" maxLength={EMAIL_MAX} required={required} />;
}

export function LoginForm({ username, error }: { username: string; error: PasswordError | null }) {
  return (
    <form action="/api/auth/password/login" method="post" className="flex flex-col gap-3">
      <ErrorLine error={error} />
      <ReturnToInput />
      <Field label="Danh hiệu (tên đăng nhập)" name="username" defaultValue={username} autoComplete="username" required autoCapitalize="none" />
      <Field label="Mật lệnh (mật khẩu)" name="password" type="password" autoComplete="current-password" required />
      <Button type="submit">
        Vào trại
      </Button>
    </form>
  );
}

/** Đăng ký mới, hoặc (khi đã đăng nhập Google/GitHub) thêm tên đăng nhập vào tài khoản đang dùng. */
export function RegisterForm({
  returnTo,
  username,
  error,
  label = "Ghi danh",
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
        label="Danh hiệu (tên đăng nhập)"
        name="username"
        defaultValue={username}
        autoComplete="username"
        required
        minLength={3}
        maxLength={20}
        pattern="[A-Za-z0-9_.]{3,20}"
        title="Danh hiệu 3–20 ký tự: chữ không dấu, số, dấu chấm hoặc gạch dưới"
        autoCapitalize="none"
      />
      <Field label={`Mật lệnh (mật khẩu, từ ${PASSWORD_MIN} ký tự)`} name="password" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      <Field label="Nhắc lại mật lệnh" name="confirm" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      {mail ? (
        <>
          <EmailField />
          <Alert tone="warning" className="text-caption">
            Để lại địa chỉ thư thì quên mật lệnh còn đường lấy lại; trạm thư sẽ gửi thư xác nhận trước. Không để lại thì quên mật lệnh là mất tài khoản.
          </Alert>
        </>
      ) : (
        <Alert tone="warning" className="text-caption">
          Chưa có đường lấy lại mật lệnh: quên là mất tài khoản. Nên liên kết thêm Google hoặc GitHub sau khi ghi danh.
        </Alert>
      )}
      <Button type="submit">
        {label}
      </Button>
    </form>
  );
}

export function ChangePasswordForm({ error }: { error: PasswordError | null }) {
  return (
    <form action="/api/auth/password/change" method="post" className="flex flex-col gap-3">
      <ErrorLine error={error} text={{ wrong: "Mật lệnh hiện tại không đúng." }} />
      <Field label="Mật lệnh hiện tại" name="current" type="password" autoComplete="current-password" required />
      <Field label={`Mật lệnh mới (từ ${PASSWORD_MIN} ký tự)`} name="password" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      <Field label="Nhắc lại mật lệnh mới" name="confirm" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      <Button type="submit">
        Đổi mật lệnh
      </Button>
    </form>
  );
}

/** Quên mật khẩu: nhập tên đăng nhập hoặc email, thư đặt lại gửi tới email đã xác nhận của tài khoản. */
export function ForgotPasswordForm() {
  return (
    <form action="/api/auth/password/forgot" method="post" className="flex flex-col gap-3">
      <Field label="Danh hiệu hoặc địa chỉ thư" name="login" autoComplete="username" required maxLength={EMAIL_MAX} autoCapitalize="none" />
      <Button type="submit">
        Gửi thư đặt lại mật lệnh
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token, error }: { token: string; error: PasswordError | null }) {
  return (
    <form action="/api/auth/password/reset" method="post" className="flex flex-col gap-3">
      <ErrorLine error={error} />
      <input type="hidden" name="token" value={token} />
      <Field label={`Mật lệnh mới (từ ${PASSWORD_MIN} ký tự)`} name="password" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      <Field label="Nhắc lại mật lệnh mới" name="confirm" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      <Button type="submit">
        Đặt mật lệnh mới
      </Button>
    </form>
  );
}

/** Thêm hoặc đổi email ở Tài khoản; email chỉ được lưu sau khi bấm đường dẫn trong thư xác nhận. */
export function EmailForm({ current, error }: { current: string | null; error: PasswordError | null }) {
  return (
    <form action="/api/auth/email" method="post" className="flex flex-col gap-3">
      <ErrorLine error={error} />
      <EmailField label={current ? "Địa chỉ thư mới (email)" : "Địa chỉ thư (email)"} required />
      <Button type="submit">
        Gửi thư xác nhận
      </Button>
    </form>
  );
}
