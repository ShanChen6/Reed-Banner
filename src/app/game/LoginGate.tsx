"use client";

// Chế độ online có bảng xếp hạng và thưởng (Nhật Lệnh, Trấn Ải, Quần Hùng, Tháp Thiên Mệnh, Tầm Tướng Ký, Xếp hạng)
// chỉ cho tài khoản đã đăng nhập. Khách chơi thường (Thao Luyện, Giao Tranh, Bình Loạn, Trận Đồ) thoải mái. Server cũng
// chặn (HTTP 401) nên màn này chỉ là lời nhắc, không phải lớp bảo vệ duy nhất.
// Đồng bộ UI 05/11/2026 (UI-S2): khách vẫn thấy banner, mô tả, luật và phần thưởng chính; nút chính là "Đăng nhập để chơi".

import { buttonVariants } from "@/components/ui";
import { ModeBanner, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { MODE_INFO } from "./modeInfo";
import type { Scene } from "./scene";
import { SceneLink } from "./SceneContext";

const DEFAULT_REASON = "Chế độ này tính bảng xếp hạng và có thưởng nên cần tài khoản đã ghi danh.";

export default function LoginGate({ scene, name, reason }: { scene: Scene; name: string; reason?: string }) {
  const info = MODE_INFO[scene];
  return (
    <ModeScreen label={name}>
      <ModeBanner title={name} kicker={info?.kicker} description={info?.text}
        art={info?.art ? `/art/home/${info.art}.webp` : undefined} />
      <OrnateFrame level="raised" role="status" className="mx-auto w-full max-w-2xl">
        <SectionTitle description={`${reason ?? DEFAULT_REASON} Bạn vẫn chơi thường thoải mái ở các chế độ khác.`}>
          Cần trình danh
        </SectionTitle>
        {info?.perks && (
          <ul className="mb-4 grid gap-2">
            {info.perks.map((p) => (
              <li key={p} className="ui-frame-inset flex items-start gap-2 px-3 py-2">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rotate-45 bg-frame-gold" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="ui-action-bar flex flex-wrap items-center justify-end gap-2">
          <SceneLink scene="MENU" className={buttonVariants({ variant: "secondary" })}>Về Chiến Trường</SceneLink>
          <SceneLink scene="LOGIN" className={buttonVariants({ size: "lg" })}>Trình danh để chơi</SceneLink>
        </div>
      </OrnateFrame>
    </ModeScreen>
  );
}
