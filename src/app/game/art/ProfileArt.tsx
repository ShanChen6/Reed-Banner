"use client";

import { useState } from "react";
import type { Element, Profession } from "@/core";
import { Portrait } from "./portraits";
import { portraitUrl } from "./portrait-data";

/**
 * Tranh lớn ở hồ sơ: ưu tiên tranh phong thái, thiếu thì ảnh đứng, thiếu nữa thì chân dung tròn. Thử lần lượt
 * theo thư mục tranh của nhân vật nên tranh mới thêm tự hiện, không cần sửa danh sách.
 */
export function ProfileArt({
  id,
  element,
  profession,
  className,
  fallbackClassName,
}: {
  id: string;
  element: Element;
  profession: Profession;
  className?: string;
  fallbackClassName?: string;
}) {
  const dir = portraitUrl(id)?.replace(/\/[^/]+$/, "");
  const candidates = dir ? [`${dir}/style.webp`, `${dir}/standing.webp`] : [];
  const [failed, setFailed] = useState<{ id: string; count: number }>({ id, count: 0 });
  const tried = failed.id === id ? failed.count : 0;
  const src = candidates[tried];
  if (!src) return <Portrait id={id} element={element} profession={profession} className={fallbackClassName} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh nhỏ, cần onError để lùi sang ảnh khác.
    <img
      key={src}
      src={src}
      alt=""
      draggable={false}
      className={className}
      onError={() => setFailed({ id, count: tried + 1 })}
    />
  );
}
