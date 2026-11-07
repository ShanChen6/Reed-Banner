"use client";

// Trang so sánh ba phương án khối liên hệ (chỉ để xem, không có trong game). Mỗi phương án hiện ở khổ laptop và khổ điện thoại
// 360px, trên nền gỗ như footer thật.

import ContactBlock from "@/app/game/ContactBlock";
import type { ContactVariant } from "@/app/game/contactVariant";
import { socialLinks } from "@/app/game/footerLinks";

const VARIANTS: readonly { id: ContactVariant; key: string; name: string; note: string }[] = [
  { id: "flags", key: "A", name: "Giá cờ lau", note: "Hợp tên game; một hàng gọn; cờ tung bay khi rê vào." },
  { id: "scroll", key: "B", name: "Cuộn thư và ấn triện", note: "Danh sách dễ đọc nhất, dùng chung laptop và điện thoại; cao hơn." },
  { id: "tablets", key: "C", name: "Lệnh bài đồng", note: "Thẻ bài triều đình; đung đưa khi rê vào." },
];

export default function ContactDemo() {
  const links = socialLinks();
  return (
    <main className="ui-mode-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header>
          <h1 className="font-serif text-2xl font-bold text-title-on-wood">Khối liên hệ: ba phương án</h1>
          <p className="mt-1 text-on-wood-soft">
            Xem trong footer thật bằng <code>/game?contact=a</code>, <code>?contact=b</code> hoặc <code>?contact=c</code>. Liên kết đang khóa
            nên bấm không chuyển trang.
          </p>
        </header>
        {VARIANTS.map((v) => (
          <section key={v.id} aria-label={`Phương án ${v.key}`} className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-frame-gold-hi">
              {v.key}. {v.name} <span className="text-caption font-normal text-on-wood-soft">· {v.note}</span>
            </h2>
            <div className="grid items-start gap-4 lg:grid-cols-[1fr_360px]">
              <div className="rounded-lg border border-frame-line-soft bg-wood-lo px-6 py-6">
                <ContactBlock links={links} variant={v.id} />
              </div>
              <div className="rounded-lg border border-frame-line-soft bg-wood-lo px-4 py-6" style={{ maxWidth: 360 }}>
                <p className="mb-3 text-caption text-on-wood-soft">Điện thoại 360px</p>
                <ContactBlock links={links} variant={v.id} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
