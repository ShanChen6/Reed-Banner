import type { Metadata } from "next";
import BarracksFixture from "./BarracksFixture";

export const metadata: Metadata = {
  title: "Xem thử Doanh Trại · Cờ Lau",
  description: "Doanh Trại với hồ sơ thử nghiệm trên trình duyệt, không đụng dữ liệu người chơi.",
  robots: { index: false },
};

const SIZES = [0, 1, 9, 30, 100] as const;

/** /demo/barracks?n=0|1|9|30|100: Doanh Trại với hồ sơ giả lưu trong bộ nhớ trang, thao tác áp tại chỗ bằng @/core. */
export default async function BarracksDemoPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = Number((await searchParams).n);
  const n = SIZES.includes(raw as (typeof SIZES)[number]) ? raw : 30;
  return <BarracksFixture key={n} n={n} sizes={SIZES} />;
}
