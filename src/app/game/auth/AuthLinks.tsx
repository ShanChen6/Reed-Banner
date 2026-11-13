"use client";

// Phần client của các phân cảnh tài khoản: link và form cần biết `returnTo` hiện tại trên thanh địa chỉ, lỗi
// form chỉ hiện khi vừa được server chuyển về (đổi phân cảnh rồi quay lại thì không hiện lỗi cũ).

import type { ProviderId } from "@/server/accounts";
import type { Scene } from "../scene";
import { scenePath } from "../scene";
import { SceneLink, useReturnTo, useScene } from "../SceneContext";
import styles from "./AuthLinks.module.css";
import { PROVIDER_NAME, ProviderLogo } from "./ProviderLogo";

const PROVIDER_BLURB: Record<ProviderId, string> = {
  google: "Đóng ấn tín bằng tài khoản Google",
  github: "Đóng ấn tín bằng tài khoản GitHub",
};

/** Sang phân cảnh tài khoản khác, giữ nguyên `returnTo`. */
export function AuthSceneLink({ scene, className, children }: { scene: Scene; className?: string; children: React.ReactNode }) {
  const returnTo = useReturnTo();
  return (
    <SceneLink scene={scene} params={{ returnTo: returnTo === scenePath("MENU") ? undefined : returnTo }} className={className}>
      {children}
    </SceneLink>
  );
}

/** Quay về phân cảnh người chơi đang muốn tới (mặc định màn chính). */
export function ReturnLink({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <SceneLink href={useReturnTo()} className={className}>
      {children}
    </SceneLink>
  );
}

export function OnArrival({ children }: { children: React.ReactNode }) {
  return useScene().arrived ? children : null;
}

/** Đăng nhập bằng Google/GitHub: mỗi nhà cung cấp một dòng thư tín trên giấy (như dòng mạng xã hội ở thư cuộn footer). */
export function ProviderButtons({ providers }: { providers: readonly ProviderId[] }) {
  const returnTo = useReturnTo();
  if (providers.length === 0) return null;
  return (
    <ul className={styles.providers}>
      {providers.map((p) => (
        <li key={p}>
          <a href={`/api/auth/${p}?returnTo=${encodeURIComponent(returnTo)}`} className={styles.provider}>
            <span className={styles.providerMark} aria-hidden>
              <ProviderLogo provider={p} />
            </span>
            <span className={styles.providerText}>
              <span className={styles.providerName}>Vào trại bằng {PROVIDER_NAME[p]}</span>
              <span className={styles.providerBlurb}>{PROVIDER_BLURB[p]}</span>
            </span>
            <span aria-hidden className={styles.chev}>
              ›
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
