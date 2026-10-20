"use client";

// Phần client của các phân cảnh tài khoản: link và form cần biết `returnTo` hiện tại trên thanh địa chỉ, lỗi
// form chỉ hiện khi vừa được server chuyển về (đổi phân cảnh rồi quay lại thì không hiện lỗi cũ).

import type { ProviderId } from "@/server/accounts";
import type { Scene } from "../scene";
import { scenePath } from "../scene";
import { SceneLink, useReturnTo, useScene } from "../SceneContext";
import { PROVIDER_NAME, ProviderLogo } from "./ProviderLogo";

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

export function ProviderButtons({ providers }: { providers: readonly ProviderId[] }) {
  const returnTo = useReturnTo();
  return providers.map((p) => (
    <a
      key={p}
      href={`/api/auth/${p}?returnTo=${encodeURIComponent(returnTo)}`}
      className={`flex items-center justify-center gap-3 rounded-lg px-4 py-2.5 font-semibold ${
        p === "google" ? "bg-white text-stone-900 hover:bg-stone-100" : "bg-stone-950 text-white ring-1 ring-stone-600 hover:bg-black"
      }`}
    >
      <ProviderLogo provider={p} /> Tiếp tục với {PROVIDER_NAME[p]}
    </a>
  ));
}
