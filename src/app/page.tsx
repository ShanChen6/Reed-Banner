import { BOARD_COLS, BOARD_ROWS } from "@/core";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Cờ Lau</h1>
      <p className="text-stone-400">
        Bàn cờ {BOARD_COLS}×{BOARD_ROWS}. Đang xây dựng.
      </p>
    </main>
  );
}
