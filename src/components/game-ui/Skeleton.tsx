import { cn } from "@/lib/cn";

// Khung xương khi tải (skeleton, Shan yêu cầu 20/11/2026): thay dòng "Đang tải…" bằng các khối gỗ lõm có hình dạng gần
// với nội dung sắp hiện (banner, dãy thẻ, khung danh sách), để người chơi thấy bố cục ngay và nội dung về không làm trang
// nhảy. Kiểu vệt sáng ở `.ui-skeleton` (src/styles/components.css); giảm chuyển động thì đứng yên.

/** Một khối xương. Kích thước đặt bằng className (h-*, w-*). */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("ui-skeleton", className)} />;
}

/** Dòng chữ đang tải đặt ngay trong câu (ô hạng, số liệu): cao bằng một dòng chữ. */
export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={cn("inline-block h-[1lh] w-32 max-w-full align-top", className)} />;
}

/** Nhãn cho trình đọc màn hình: khung xương chỉ là hình, nên luôn kèm một câu "đang tải". */
function Status({ label }: { label: string }) {
  return <span className="sr-only">{label}</span>;
}

/** Khung danh sách: tiêu đề, mô tả và vài dòng. */
function FrameSkeleton({ rows }: { rows: number }) {
  return (
    <div className="ui-frame-inset flex flex-col gap-3 p-4 sm:p-5">
      <Skeleton className="h-6 w-44 max-w-[70%]" />
      <Skeleton className="h-4 w-72 max-w-[90%]" />
      <div className="mt-1 flex flex-col gap-2">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    </div>
  );
}

/**
 * Màn chế độ chơi đang tải (Quần Hùng, Nhật Lệnh, các tháp, Trấn Ải, Viễn Chinh…): banner tranh, dãy thẻ và nội dung.
 * Cùng khổ với banner thật (min-h-36 / sm:min-h-44) để lúc dữ liệu về phần trên không xê dịch.
 */
export function ModeSkeleton({ label = "Đang tải…", tabs = 3 }: { label?: string; tabs?: number }) {
  return (
    <div role="status" className="flex flex-col gap-4 sm:gap-5">
      <Status label={label} />
      <Skeleton className="h-36 sm:h-44" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: tabs }, (_, i) => (
          <Skeleton key={i} className="h-11 w-24 sm:w-28" />
        ))}
      </div>
      <FrameSkeleton rows={2} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  );
}

/**
 * Màn thông tin đang tải (Nhiệm vụ, Ban Thưởng, Hợp Kích, Cửa Hàng): vài khung danh sách. Cao ít nhất một màn hình, để
 * footer nằm dưới không hiện ra giữa màn rồi bị đẩy xuống khi nội dung về (layout nhảy). Có `error` thì hiện câu báo lỗi.
 */
export function ModeLoading({ error, label = "Đang tải…", sections = 3 }: { error?: string | null; label?: string; sections?: number }) {
  if (error)
    return (
      <p role="alert" className="min-h-dvh py-24 text-center text-on-wood-soft">
        {error}
      </p>
    );
  return (
    <div role="status" className="flex min-h-dvh flex-col gap-4 sm:gap-5">
      <Status label={label} />
      {Array.from({ length: sections }, (_, i) => (
        <FrameSkeleton key={i} rows={i === 0 ? 2 : 3} />
      ))}
    </div>
  );
}
