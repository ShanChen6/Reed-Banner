import type { Metadata } from "next";
import "./globals.css";
import { TileDefs } from "./game/art/tiles";

export const metadata: Metadata = {
  title: "Cờ Lau",
  description: "Game match-3 chiến đấu theo lượt thời Loạn 12 Sứ Quân.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="min-h-dvh bg-stone-950 text-stone-100 antialiased">
        <TileDefs />
        {children}
      </body>
    </html>
  );
}
