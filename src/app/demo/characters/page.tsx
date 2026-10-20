import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { characterCatalog } from "./catalog";
import CharacterPreviewer from "./CharacterPreviewer";

export const metadata: Metadata = {
  title: "Xem thử nhân vật · Cờ Lau",
  description: "Duyệt hình động, chân dung và các tư thế nhân vật Cờ Lau.",
  robots: { index: false },
};

export default async function CharactersPage() {
  const characters = await characterCatalog();
  return (
    <main className="demo-bg min-h-dvh bg-[#17110e] px-3 py-5 text-stone-100 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <nav className="flex flex-wrap gap-4 text-sm text-amber-300">
          <Link href="/demo/art" prefetch={false}>← Bộ hình</Link>
          <Link href="/game/practice" prefetch={false}>Vào trận luyện tập →</Link>
        </nav>
        <header>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">Xem thử nhân vật</h1>
          <p className="mt-1 text-sm text-stone-400">Chọn động tác để xem hình trong trận và đối chiếu tranh gốc.</p>
        </header>
        <Suspense fallback={<p role="status">Đang chuẩn bị nhân vật…</p>}>
          <CharacterPreviewer characters={characters} />
        </Suspense>
      </div>
    </main>
  );
}
