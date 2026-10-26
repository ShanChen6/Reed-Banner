import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TileDefs } from "./game/art/tiles";

const gameFont = localFont({
  src: "./fonts/NotoSerif.ttf",
  variable: "--font-game",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cờ Lau",
  description: "Game match-3 chiến đấu theo lượt thời Loạn 12 Sứ Quân.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${gameFont.variable} scroll-smooth`}>
      <body className="min-h-dvh antialiased">
        <TileDefs />
        {children}
      </body>
    </html>
  );
}
