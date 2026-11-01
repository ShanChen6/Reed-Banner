"use client";

// Chế độ online có bảng xếp hạng và thưởng (Nhật Lệnh, Trấn Ải, Quần Hùng, Tháp Thiên Mệnh) chỉ cho tài khoản đã đăng
// nhập. Khách chơi thường (Luyện tập, Giao Tranh, Bình Loạn, Trận Đồ chơi thường) thoải mái. Server cũng chặn
// (HTTP 401) nên màn này chỉ là lời nhắc, không phải lớp bảo vệ duy nhất.

import { SceneLink } from "./SceneContext";

export default function LoginGate({ name }: { name: string }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#17110e] px-4 text-foreground">
      <section role="status" className="max-w-md rounded-xl border border-amber-600/40 bg-[#271d18] p-6 text-center">
        <h1 className="font-serif text-2xl font-bold text-amber-100">{name}</h1>
        <p className="mt-2 text-foreground-secondary">
          Chế độ này tính bảng xếp hạng và có thưởng nên cần tài khoản đã đăng nhập. Bạn vẫn chơi thường thoải mái ở các chế độ khác.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <SceneLink scene="LOGIN" className="inline-block rounded bg-amber-500 px-4 py-2 font-semibold text-stone-950">Đăng nhập</SceneLink>
          <SceneLink scene="MENU" className="inline-block rounded border border-amber-600/50 px-4 py-2 font-semibold text-amber-100">Về màn chính</SceneLink>
        </div>
      </section>
    </main>
  );
}
