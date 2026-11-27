// Nhà năm bậc của Điền Trang Ký, vẽ bằng SVG tạm tới khi Shan vẽ tranh. Bậc quyết định dáng nhà (nhà tranh → trang ấp),
// hệ của chủ đất quyết định màu mái và vật trang trí trên nóc. Hệ không đổi tô.

import type { Element } from "@/core";
import { ELEMENT_COLOR } from "../art/icons";

/** Vật trên nóc theo hệ. */
function Finial({ element, x, y }: { element: Element; x: number; y: number }) {
  const c = ELEMENT_COLOR[element];
  switch (element) {
    case "kim":
      return <path d={`M${x} ${y - 5} L${x + 1.4} ${y} L${x - 1.4} ${y} Z`} fill="#e6e9ee" stroke={c} strokeWidth={0.5} />;
    case "moc":
      return <path d={`M${x} ${y} C${x - 3} ${y - 2} ${x - 1} ${y - 6} ${x} ${y - 6} C${x + 1} ${y - 6} ${x + 3} ${y - 2} ${x} ${y} Z`} fill="#8fd17f" />;
    case "thuy":
      return <path d={`M${x - 3} ${y - 1} Q${x - 1.5} ${y - 4} ${x} ${y - 1} Q${x + 1.5} ${y - 4} ${x + 3} ${y - 1}`} fill="none" stroke="#9fd4ff" strokeWidth={1} />;
    case "hoa":
      return <path d={`M${x} ${y - 6} C${x + 2.5} ${y - 3} ${x + 2} ${y} ${x} ${y} C${x - 2} ${y} ${x - 2.5} ${y - 3} ${x} ${y - 6} Z`} fill="#ffb347" />;
    case "tho":
      return <rect x={x - 1.6} y={y - 3.4} width={3.2} height={3.4} rx={0.6} fill="#d9b27a" />;
    case "loi":
      return <path d={`M${x + 1} ${y - 6} L${x - 1.5} ${y - 2.5} L${x + 0.5} ${y - 2.5} L${x - 1} ${y}`} fill="none" stroke="#d6b8ff" strokeWidth={1} />;
    case "phong":
      return <path d={`M${x} ${y} L${x} ${y - 6} L${x + 3.5} ${y - 5} L${x} ${y - 4}`} fill="#9ff0e3" stroke="#9ff0e3" strokeWidth={0.4} />;
  }
}

export function House({ level, element, className = "size-6" }: { level: number; element: Element; className?: string }) {
  if (level <= 0) return null;
  const roof = ELEMENT_COLOR[element];
  const wall = "#e9dcc1";
  const beam = "#5a3b22";
  return (
    <svg viewBox="0 0 32 24" className={className} aria-hidden focusable="false">
      {level >= 5 && <rect x={1} y={15} width={30} height={8} rx={1} fill="#8a6a45" stroke={beam} strokeWidth={0.6} />}
      {level === 1 && (
        <>
          <rect x={10} y={13} width={12} height={9} fill={wall} stroke={beam} strokeWidth={0.6} />
          <path d="M7 14 L16 5 L25 14 Z" fill="#c9a65a" stroke={roof} strokeWidth={1.4} />
          <Finial element={element} x={16} y={5} />
        </>
      )}
      {level === 2 && (
        <>
          <rect x={8} y={12} width={16} height={10} fill={wall} stroke={beam} strokeWidth={0.8} />
          <rect x={14} y={16} width={4} height={6} fill={beam} />
          <path d="M5 13 L16 4 L27 13 Z" fill={roof} stroke={beam} strokeWidth={0.6} />
          <Finial element={element} x={16} y={4} />
        </>
      )}
      {level === 3 && (
        <>
          <rect x={7} y={12} width={18} height={10} fill={wall} stroke={beam} strokeWidth={0.8} />
          <rect x={14} y={16} width={4} height={6} fill={beam} />
          <path d="M3 12 Q6 13 8 9 L24 9 Q26 13 29 12 L25 6 L7 6 Z" fill={roof} stroke={beam} strokeWidth={0.6} />
          <Finial element={element} x={16} y={6} />
        </>
      )}
      {level >= 4 && (
        <>
          <rect x={6} y={14} width={20} height={9} fill={wall} stroke={beam} strokeWidth={0.8} />
          <rect x={14} y={17} width={4} height={6} fill={beam} />
          <path d="M2 14 Q5 15 7 11 L25 11 Q27 15 30 14 L26 9 L6 9 Z" fill={roof} stroke={beam} strokeWidth={0.6} />
          <rect x={10} y={6} width={12} height={4} fill={wall} stroke={beam} strokeWidth={0.6} />
          <path d="M7 7 Q9 7.5 10 5 L22 5 Q23 7.5 25 7 L22 2.5 L10 2.5 Z" fill={roof} stroke={beam} strokeWidth={0.6} />
          <Finial element={element} x={16} y={2.5} />
          {level >= 5 && (
            <>
              <rect x={1} y={11} width={3} height={12} fill={roof} stroke={beam} strokeWidth={0.5} />
              <rect x={28} y={11} width={3} height={12} fill={roof} stroke={beam} strokeWidth={0.5} />
            </>
          )}
        </>
      )}
    </svg>
  );
}
