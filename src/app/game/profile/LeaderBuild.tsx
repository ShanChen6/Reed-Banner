"use client";

// Bộ chọn hệ và nghề của thủ lĩnh (Đinh Bộ Lĩnh), dùng chung mọi nơi để cách chọn giống nhau.
// Chỗ chọn chính thức: tab Tướng sĩ ở Doanh Trại, lưu bằng thao tác chooseLeader; các chế độ khác chỉ đọc lựa chọn này
// và (nếu cho đổi) nói rõ đổi cho cả hồ sơ hay chỉ trận đó. Thành phần này không tự lưu, chỉ báo lựa chọn qua onChange.

import { ELEMENTS, LEADER_PROFESSIONS, type Element, type Profession } from "@/core";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";

const CHIP =
  "barracks-tab inline-flex min-h-10 pointer-coarse:min-h-11 items-center gap-1.5 rounded-md px-2.5 text-[15px] disabled:opacity-50";

export default function LeaderBuild({
  element,
  profession,
  onChange,
  disabled = false,
  hint,
  marks = [],
}: {
  element: Element;
  profession: Profession;
  onChange: (next: { element: Element; profession: Profession }) => void;
  disabled?: boolean;
  /** Dòng giải thích dưới bộ chọn (ví dụ "lưu cho mọi chế độ"). */
  hint?: string;
  /** Hệ nên chọn (đánh dấu ★). */
  marks?: readonly Element[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-label="Nghề của thủ lĩnh" className="flex flex-wrap gap-1.5">
        {LEADER_PROFESSIONS.map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={profession === p}
            disabled={disabled}
            onClick={() => profession !== p && onChange({ element, profession: p })}
            className={`${CHIP} ${profession === p ? "is-on" : ""}`}
          >
            <ProfessionIcon profession={p} className="size-5" />
            {PROFESSION_NAME[p]}
          </button>
        ))}
      </div>
      <div role="radiogroup" aria-label="Hệ của thủ lĩnh" className="flex flex-wrap gap-1.5">
        {ELEMENTS.map((e) => (
          <button
            key={e}
            type="button"
            role="radio"
            aria-checked={element === e}
            disabled={disabled}
            onClick={() => element !== e && onChange({ element: e, profession })}
            className={`${CHIP} ${element === e ? "is-on" : ""}`}
          >
            <ElementIcon element={e} className="size-5" />
            {ELEMENT_NAME[e]}
            {marks.includes(e) && <span className="text-jade">★</span>}
          </button>
        ))}
      </div>
      {hint && <p className="text-caption text-[var(--bk-soft)]">{hint}</p>}
    </div>
  );
}
