// Khung chung của các phân cảnh LOGIN, REGISTER, ACCOUNT: một thẻ ở giữa màn chơi (thanh trên do màn chơi lo).

import { DongSonBand } from "../art/icons";
import { OnArrival } from "./AuthLinks";

export function AuthCard({ title, oauthError, children }: { title: string; oauthError?: boolean; children: React.ReactNode }) {
  return (
    <main className="demo-bg flex flex-1 items-center justify-center bg-[var(--bg)] px-4 py-10 text-stone-100 [--bg:#17110e] [--gold:#d4a24c] [--panel:#271d18]">
      <section className="w-full max-w-sm rounded-xl border border-[var(--gold)]/40 bg-[var(--panel)]/95 p-6 shadow-[0_0_40px_-12px_#c0392b]">
        <h1 className="text-center font-serif text-2xl font-bold">{title}</h1>
        <DongSonBand className="mx-auto mt-3 w-32" />
        {oauthError && (
          <OnArrival>
            <p role="alert" className="mt-4 rounded bg-rose-900/40 px-3 py-2 text-sm text-rose-200">
              Đăng nhập không thành công, bạn thử lại nhé.
            </p>
          </OnArrival>
        )}
        {children}
      </section>
    </main>
  );
}

export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-1 flex items-center gap-3 text-xs text-stone-500">
      <span className="h-px flex-1 bg-stone-700" /> {children} <span className="h-px flex-1 bg-stone-700" />
    </div>
  );
}
