// Biểu tượng vật phẩm (Shan 19/11/2026): vẽ riêng bằng SVG, không mượn hình ô bàn cờ hay icon hệ. Cùng khung tròn nền
// sơn mài và viền đồng như ô trang bị để đặt cạnh nhau trong Kho đồ và Cửa Hàng.

import { useId } from "react";

export type ItemArtId = "food" | "stone" | "xpBook";

export function ItemIcon({ id, className = "size-12" }: { id: ItemArtId; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const g = (n: string) => `${uid}-${n}`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
      <defs>
        <radialGradient id={g("bg")} cx="50%" cy="38%" r="65%">
          <stop offset="0" stopColor="#4a2a18" />
          <stop offset="1" stopColor="#1c110a" />
        </radialGradient>
        <linearGradient id={g("rim")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1d27a" />
          <stop offset="1" stopColor="#8a6214" />
        </linearGradient>
        <linearGradient id={g("a")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={id === "stone" ? "#bfe8ff" : id === "xpBook" ? "#3b6fb4" : "#d9b779"} />
          <stop offset="1" stopColor={id === "stone" ? "#2f6fa8" : id === "xpBook" ? "#1d3561" : "#8a6232"} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill={`url(#${g("bg")})`} stroke={`url(#${g("rim")})`} strokeWidth="2.5" />
      {id === "food" && (
        // Bao lương buộc dây, miệng bao lộ hạt gạo.
        <g stroke="#3a220f" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M19 46c-1-9 2-15 6-19h14c4 4 7 10 6 19-1 4-5 6-13 6s-12-2-13-6z" fill={`url(#${g("a")})`} />
          <path d="M24 27c-1-4 1-7 3-8h10c2 1 4 4 3 8z" fill="#e7cf9a" />
          <path d="M23 28h18" stroke="#7a1f16" strokeWidth="3" />
          <g fill="#fff6dc" stroke="none">
            <ellipse cx="28" cy="22.5" rx="1.6" ry="1" />
            <ellipse cx="32" cy="21.5" rx="1.6" ry="1" />
            <ellipse cx="36" cy="22.5" rx="1.6" ry="1" />
          </g>
          <path d="M27 37h10M26 42h12" stroke="#6b4a24" strokeWidth="1.2" opacity="0.7" />
        </g>
      )}
      {id === "xpBook" && (
        // Sách đóng chỉ kiểu cổ, ấn vàng giữa bìa.
        <g stroke="#0f1d33" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M18 17h24a4 4 0 0 1 4 4v26H22a4 4 0 0 1-4-4z" fill={`url(#${g("a")})`} />
          <path d="M22 47a4 4 0 0 1 0-8h24" fill="#efe3c4" />
          <path d="M22 17v22" stroke="#e9c25a" strokeWidth="1.2" />
          <g stroke="#e9c25a" strokeWidth="1.1">
            <path d="M20 21h4M20 27h4M20 33h4" />
          </g>
          <circle cx="34" cy="28" r="5.5" fill="#e9c25a" stroke="#8a6214" />
          <path d="M34 24.5v7M30.5 28h7" stroke="#8a6214" strokeWidth="1.4" />
        </g>
      )}
      {id === "stone" && (
        // Đá Cường Hóa: khối tinh thể nhiều mặt, ánh sáng hắt từ trên.
        <g stroke="#0e2a44" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M32 12 46 24 42 46 32 52 22 46 18 24z" fill={`url(#${g("a")})`} />
          <path d="M32 12 32 52M18 24 32 31 46 24M22 46 32 31 42 46" fill="none" stroke="#e8f7ff" strokeWidth="1" opacity="0.65" />
          <path d="M32 12 25 24 32 31z" fill="#ffffff" opacity="0.45" stroke="none" />
          <path d="M44 14l1.2 2.6 2.6 1.2-2.6 1.2L44 22l-1.2-2.8-2.6-1.2 2.6-1.2z" fill="#fff6c8" stroke="none" />
        </g>
      )}
    </svg>
  );
}
