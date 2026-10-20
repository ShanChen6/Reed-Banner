"use client";

// Chuyển phân cảnh trong màn chơi: `go` đẩy đường dẫn mới bằng history.pushState (Next đồng bộ với
// usePathname/useSearchParams nên không tải lại trang, không gọi server), nút Back của trình duyệt quay lại
// phân cảnh trước. SceneLink là thẻ <a> có href thật để mở tab mới hay chép link vẫn chạy.

import { createContext, useContext } from "react";
import { sceneOfPath, scenePath, type Scene } from "./scene";

export type SceneParams = Readonly<Record<string, string | undefined>>;

export interface SceneApi {
  readonly currentScene: Scene;
  /** Tham số trên đường dẫn hiện tại (?returnTo=, ?resume=, …). */
  readonly params: URLSearchParams;
  go(scene: Scene, params?: SceneParams): void;
  /** Đi tới một đường dẫn: là phân cảnh của /game thì đổi tại chỗ, còn lại tải trang đó. */
  goHref(href: string): void;
  /** Đang ở đúng đường dẫn lúc tải trang (lỗi form trả về từ server chỉ hiện lúc này). */
  readonly arrived: boolean;
}

export const SceneContext = createContext<SceneApi | null>(null);

export function useScene(): SceneApi {
  const api = useContext(SceneContext);
  if (!api) throw new Error("useScene chỉ dùng trong màn chơi /game");
  return api;
}

/** Đẩy đường dẫn phân cảnh lên thanh địa chỉ mà không tải lại trang. */
export function pushScenePath(href: string) {
  window.history.pushState(null, "", href);
  window.scrollTo(0, 0);
}

export function isScenePath(href: string): boolean {
  const url = new URL(href, window.location.origin);
  return url.origin === window.location.origin && sceneOfPath(url.pathname) !== null;
}

export function SceneLink({
  scene,
  params,
  href,
  className,
  children,
  ...rest
}: {
  scene?: Scene;
  params?: SceneParams;
  /** Thay cho scene: một đường dẫn bất kỳ (vd. returnTo). */
  href?: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  const api = useScene();
  const target = href ?? scenePath(scene ?? "MENU", params);
  return (
    <a
      {...rest}
      href={target}
      className={className}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        api.goHref(target);
      }}
    >
      {children}
    </a>
  );
}

/** Ô ẩn `returnTo` trong form tài khoản: quay về phân cảnh người chơi đang muốn tới. */
export function ReturnToInput() {
  return <input type="hidden" name="returnTo" value={useReturnTo()} />;
}

export function useReturnTo(): string {
  const { params } = useScene();
  const v = params.get("returnTo");
  return v && v.startsWith("/") && !v.startsWith("//") && !v.includes("\\") ? v : scenePath("MENU");
}
