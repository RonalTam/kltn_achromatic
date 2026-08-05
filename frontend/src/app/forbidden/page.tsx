import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Home, ShieldX } from "lucide-react";

export const metadata: Metadata = {
  title: "Không có quyền truy cập | ACHROMATIC",
  robots: { index: false, follow: false },
};

export default async function ForbiddenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const source = Array.isArray(params.from) ? params.from[0] : params.from;
  const safeSource = source?.startsWith("/") ? source : "/admin";

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#F4F4F4] px-5 py-12">
      <section className="w-full max-w-2xl border border-[#DCDCDC] bg-white p-7 shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:p-10">
        <div className="flex items-start justify-between gap-6 border-b border-[#E8E8E8] pb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0F4C81]">Lỗi 403</p>
            <h1 className="mt-3 font-heading text-4xl font-light tracking-tight text-[#111111] sm:text-5xl">Không có quyền truy cập</h1>
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center bg-[#111111] text-white"><ShieldX className="size-5" /></span>
        </div>
        <p className="mt-7 max-w-xl text-sm leading-7 text-[#5F5F5F]">
          Tài khoản hiện tại không được phép mở khu vực quản trị. Dữ liệu quản trị chỉ dành cho ADMIN và SUPER_ADMIN.
        </p>
        <p className="mt-3 break-all text-xs text-[#888888]">Đường dẫn yêu cầu: {safeSource}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/account" className="btn-outline-dark"><ArrowLeft className="size-4" /> Về tài khoản</Link>
          <Link href="/" className="btn-primary"><Home className="size-4" /> Trang chủ</Link>
        </div>
      </section>
    </main>
  );
}
