"use client";

// Đổi ảnh đại diện ở trang Tài khoản (Shan 18/11/2026): hộp thoại lưới chân dung các tướng quân đã có, bấm một người
// để đặt làm ảnh đại diện, tải ảnh từ máy lên (19/11/2026), hoặc về chữ cái đầu. Ảnh tải lên được cắt vuông giữa ảnh
// và thu về 256px WebP ngay ở trình duyệt rồi mới gửi, nên tệp gốc lớn cũng không đi qua mạng. Server kiểm tra quyền sở hữu (POST /api/auth/avatar); lưu xong tải lại
// trang để thanh đầu trang và thẻ tài khoản (dựng ở server) hiện ảnh mới.

import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui";
import { portraitUrl } from "../art/portrait-data";
import { useProfile } from "../profile/useProfile";
import { nameOf, ownedIds } from "../profile/roster";

const ERROR: Record<string, string> = {
  notOwned: "Tướng này chưa về trại nên chưa dùng làm ảnh được.",
  noPortrait: "Tướng này chưa có chân dung.",
  badImage: "Tệp này không đọc được thành ảnh. Xin chọn ảnh JPG, PNG hoặc WebP.",
  tooLarge: "Ảnh vẫn quá nặng sau khi thu nhỏ. Xin chọn ảnh khác.",
};

const AVATAR_SIDE = 256;
/** Tệp gốc tối đa trước khi thu nhỏ (chỉ để tránh treo trình duyệt với tệp quá lớn). */
const FILE_MAX = 15 * 1024 * 1024;
/** Khớp AVATAR_UPLOAD_MAX ở server (src/server/avatar.ts). */
const UPLOAD_MAX = 120_000;

/** Cắt vuông giữa ảnh, thu về 256px, mã hóa WebP (trình duyệt không có WebP thì JPEG); hạ chất lượng nếu vẫn nặng. */
async function shrinkImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = AVATAR_SIDE;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, AVATAR_SIDE, AVATAR_SIDE);
  bitmap.close();
  for (const q of [0.86, 0.7, 0.5]) {
    let url = canvas.toDataURL("image/webp", q);
    if (!url.startsWith("data:image/webp")) url = canvas.toDataURL("image/jpeg", q);
    if (url.length <= UPLOAD_MAX) return url;
  }
  throw new Error("tooLarge");
}

export function AvatarPicker({ current }: { current: string | null }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useProfile();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const send = async (payload: { hero: string | null } | { image: string }) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/avatar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const body = (await res.json()) as { error?: string };
      if (res.ok) return window.location.reload();
      setError(ERROR[body.error ?? ""] ?? "Chưa đổi được ảnh đại diện. Xin thử lại.");
    } catch {
      setError("Tin báo đứt quãng, chưa liên lạc được máy chủ. Xin thử lại sau giây lát.");
    }
    setBusy(false);
  };
  const choose = (hero: string | null) => send({ hero });

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > FILE_MAX) {
      setError(file.size > FILE_MAX ? "Tệp quá lớn (tối đa 15 MB). Xin chọn ảnh khác." : ERROR.badImage!);
      return;
    }
    let image: string;
    try {
      image = await shrinkImage(file);
    } catch (e) {
      setError(e instanceof Error && e.message === "tooLarge" ? ERROR.tooLarge! : ERROR.badImage!);
      return;
    }
    await send({ image });
  };

  const heroes = profile ? ownedIds(profile).filter((id) => portraitUrl(id) !== null) : [];
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={buttonVariants({ variant: "outline", size: "sm" })}>
        Đổi ảnh đại diện
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        aria-label="Chọn ảnh đại diện"
        className="campaign-atlas m-auto max-h-[min(44rem,calc(100dvh-2rem))] w-[min(40rem,calc(100vw-2rem))] rounded-xl border border-frame-gold bg-wood p-0 text-on-wood backdrop:bg-black/60"
      >
        {open && (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="ui-title-on-wood font-serif text-lg font-bold">Chọn ảnh đại diện</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Đóng" className="grid size-11 shrink-0 place-items-center rounded-full border border-frame-line-soft text-lg hover:border-frame-gold">
                ✕
              </button>
            </div>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <div className="ui-frame-inset flex flex-wrap items-center gap-3 p-3">
              {current?.startsWith("data:image/") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current} alt="Ảnh đang dùng" className="size-14 shrink-0 rounded-full border-2 border-frame-gold object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-title-on-wood">Tải ảnh từ máy</p>
                <p className="text-caption text-on-wood-soft">JPG, PNG hoặc WebP. Ảnh được cắt vuông ở giữa và thu về 256 × 256.</p>
              </div>
              <label className={buttonVariants({ variant: "secondary", size: "sm", className: `cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}` })}>
                {busy ? "Đang lưu…" : "Chọn ảnh"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  disabled={busy}
                  onChange={(e) => {
                    void upload(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="text-caption text-on-wood-soft">Hoặc chọn chân dung một tướng quân đã về trại. Tuyển thêm tướng thì có thêm ảnh để chọn.</p>
            {!profile ? (
              <p role="status" className="py-8 text-center text-on-wood-soft">Đang mở danh sách tướng quân…</p>
            ) : (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {heroes.map((id) => {
                  const url = portraitUrl(id)!;
                  const on = current === url;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        disabled={busy}
                        aria-pressed={on}
                        aria-label={`Dùng chân dung ${nameOf(id)}`}
                        onClick={() => void choose(id)}
                        className={`flex w-full flex-col items-center gap-1 rounded-lg border p-1.5 text-center ${on ? "border-frame-gold bg-frame-gold/15" : "border-frame-line-soft bg-wood-inset hover:border-frame-gold/70"}`}
                      >
                        {/* Chân dung nhỏ trong game, không cần tối ưu qua next/image. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" loading="lazy" className="aspect-square w-full rounded-md object-cover" />
                        <span className="w-full truncate text-caption font-semibold">{nameOf(id)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <button type="button" disabled={busy || current === null} onClick={() => void choose(null)} className={buttonVariants({ variant: "ghost", size: "sm", className: "self-start" })}>
              Dùng chữ cái đầu
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
