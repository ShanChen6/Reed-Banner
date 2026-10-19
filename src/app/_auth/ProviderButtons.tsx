// Nút đăng nhập Google/GitHub (chỉ hiện nhà cung cấp đã cấu hình), dùng chung cho /login và /register.

import type { ProviderId } from "@/server/accounts";
import { PROVIDER_NAME, ProviderLogo } from "./ProviderLogo";

export function ProviderButtons({ providers, returnTo }: { providers: readonly ProviderId[]; returnTo: string }) {
  return providers.map((p) => (
    <a
      key={p}
      href={`/api/auth/${p}?returnTo=${encodeURIComponent(returnTo)}`}
      className={`flex items-center justify-center gap-3 rounded-lg px-4 py-2.5 font-semibold ${
        p === "google" ? "bg-white text-stone-900 hover:bg-stone-100" : "bg-stone-950 text-white ring-1 ring-stone-600 hover:bg-black"
      }`}
    >
      <ProviderLogo provider={p} /> Tiếp tục với {PROVIDER_NAME[p]}
    </a>
  ));
}
