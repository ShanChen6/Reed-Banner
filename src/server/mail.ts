// Gửi email qua SMTP bằng nodemailer (thư xác nhận email, thư đặt lại mật khẩu). Cấu hình bằng biến môi
// trường SMTP_*; xem docs/tech/ha-tang.md mục 4. Khi dev chưa cấu hình thì in thư ra console thay vì gửi.

import nodemailer, { type Transporter } from "nodemailer";

export interface Mail {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
}

/** Đã khai đủ máy chủ SMTP và địa chỉ gửi chưa. */
export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

/** Có gửi được thư không: production cần SMTP, dev thì in ra console. Không gửi được thì ẩn các form cần email. */
export function mailEnabled(): boolean {
  return smtpConfigured() || process.env.NODE_ENV !== "production";
}

let transporter: Transporter | null = null;

function transport(): Transporter {
  const port = Number(process.env.SMTP_PORT ?? 587);
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // Cổng 465 dùng TLS ngay từ đầu; 587 và 25 nâng lên TLS bằng STARTTLS.
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" } : undefined,
  });
  return transporter;
}

export async function sendMail(mail: Mail): Promise<void> {
  if (!smtpConfigured()) {
    if (process.env.NODE_ENV === "production") throw new Error("Thiếu biến môi trường SMTP_HOST/SMTP_FROM");
    console.info(`[mail] Tới ${mail.to}: ${mail.subject}\n${mail.text}`);
    return;
  }
  await transport().sendMail({ from: process.env.SMTP_FROM, ...mail });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function layout(lines: readonly string[], url: string, button: string): string {
  const body = lines.map((l) => `<p style="margin:0 0 12px">${escapeHtml(l)}</p>`).join("");
  const link = escapeHtml(url);
  return `<div style="font-family:system-ui,sans-serif;max-width:480px;color:#292524;line-height:1.5">
<h2 style="font-family:Georgia,serif;color:#7a2c1d">Cờ Lau</h2>${body}
<p style="margin:20px 0"><a href="${link}" style="background:#c0392b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">${escapeHtml(button)}</a></p>
<p style="font-size:12px;color:#78716c">Nút không bấm được thì mở đường dẫn này: <a href="${link}">${link}</a></p></div>`;
}

export function verifyMail(to: string, url: string, hours: number): Mail {
  const lines = [
    "Bạn vừa thêm email này vào tài khoản Cờ Lau. Bấm nút dưới đây để xác nhận; sau đó có thể dùng email này để lấy lại mật khẩu khi quên.",
    `Đường dẫn dùng được một lần trong ${hours} giờ. Nếu không phải bạn thì cứ bỏ qua thư này.`,
  ];
  return {
    to,
    subject: "Xác nhận email cho tài khoản Cờ Lau",
    text: `${lines.join("\n\n")}\n\n${url}\n`,
    html: layout(lines, url, "Xác nhận email"),
  };
}

export function resetMail(to: string, username: string, url: string, minutes: number): Mail {
  const lines = [
    `Có người vừa yêu cầu đặt lại mật khẩu cho tên đăng nhập "${username}" trên Cờ Lau. Bấm nút dưới đây để đặt mật khẩu mới.`,
    `Đường dẫn dùng được một lần trong ${minutes} phút. Nếu không phải bạn thì cứ bỏ qua thư này, mật khẩu vẫn giữ nguyên.`,
  ];
  return {
    to,
    subject: "Đặt lại mật khẩu Cờ Lau",
    text: `${lines.join("\n\n")}\n\n${url}\n`,
    html: layout(lines, url, "Đặt mật khẩu mới"),
  };
}
