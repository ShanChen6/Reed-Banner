import type { Metadata } from "next";
import ContactDemo from "./ContactDemo";

export const metadata: Metadata = {
  title: "Khối liên hệ, ba phương án · Cờ Lau",
  description: "So sánh ba phương án thiết kế khối liên hệ ở footer theo chủ đề phong kiến.",
  robots: { index: false },
};

/** /demo/lien-he: ba phương án khối liên hệ (A giá cờ lau, B cuộn thư, C lệnh bài) ở khổ laptop và điện thoại. */
export default function ContactDemoPage() {
  return <ContactDemo />;
}
