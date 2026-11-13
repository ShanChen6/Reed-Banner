import { Alert } from "@/components/ui";
// Khung chung của các phân cảnh tài khoản (LOGIN, REGISTER, ACCOUNT, quên/đặt lại mật khẩu): thư cuộn giấy dó treo giữa màn chơi,
// cùng phong cách thư cuộn liên hệ ở footer (Shan chọn 08/11/2026). Tờ giấy dùng `.ui-on-paper` nên ô nhập, nút, cảnh báo
// tự đổi sang chữ mực trên giấy; tiêu đề viền kép như "Thư tín bốn phương", ấn đỏ "Cờ Lau" ở góc phải tiêu đề.

import { ParchmentScroll, ScrollSeal } from "../scroll/ParchmentScroll";
import { OnArrival } from "./AuthLinks";
import styles from "./AuthCard.module.css";

export function AuthCard({
  title,
  subtitle,
  oauthError,
  children,
}: {
  title: string;
  /** Một câu nghiêng dưới tiêu đề, như lời đề thư. */
  subtitle?: string;
  oauthError?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className={`ui-mode-screen ${styles.screen}`}>
      <ParchmentScroll className={styles.scroll} bodyClassName={`ui-on-paper ${styles.body}`}>
        <header className={styles.head}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.sub}>{subtitle}</p>}
          <ScrollSeal className={styles.seal} />
        </header>
        {oauthError && (
          <OnArrival>
            <Alert className="mt-4">Trình danh chưa thành. Xin thử lại.</Alert>
          </OnArrival>
        )}
        {children}
      </ParchmentScroll>
    </main>
  );
}

export { Divider } from "@/components/ui";
