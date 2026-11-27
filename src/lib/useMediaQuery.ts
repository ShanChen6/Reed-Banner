"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Điện thoại theo quy tắc giao diện (docs/05-ui-ux/design-system/theme.md, mục "Điện thoại"): dưới 640px. */
export const PHONE_QUERY = "(max-width: 639.98px)";

/**
 * Theo dõi một media query. Server render và lần render đầu luôn trả `fallback` (mặc định false) để không lệch
 * hydrate; sau đó đổi theo trình duyệt.
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => fallback);
}

/**
 * Máy tính đủ rộng để màn chế độ khóa đúng chiều cao cửa sổ (Shan chốt 28/11/2026, làm mẫu ở Bình Loạn): từ 1280px
 * khung chế độ cao bằng màn hình, nội dung dài thì chia trang thay vì kéo dài trang. Hẹp hơn thì trang cuộn như cũ.
 */
export const DESKTOP_FIT_QUERY = "(min-width: 1280px)";
