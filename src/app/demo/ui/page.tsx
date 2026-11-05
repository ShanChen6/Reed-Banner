import type { Metadata } from "next";
import UiGallery from "./UiGallery";

export const metadata: Metadata = {
  title: "Bộ giao diện chung · Cờ Lau",
  description: "Nút, lựa chọn, khung và banner chế độ dùng chung cho mọi màn.",
  robots: { index: false },
};

/** /demo/ui: xem mọi thành phần giao diện chung (đồng bộ UI 05/11/2026). */
export default function UiDemoPage() {
  return <UiGallery />;
}
