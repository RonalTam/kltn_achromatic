"use client";

import { useQuery } from "@tanstack/react-query";
import { Banknote, Package, ShoppingCart, Users } from "lucide-react";
import { adminGet, formatMoney } from "@/components/admin/admin-api";
import {
  AdminError,
  AdminLoading,
  AdminPageHeader,
} from "@/components/admin/AdminPrimitives";
import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { AdminReports, DashboardStats } from "@/components/admin/types";

export default function AdminDashboardPage() {
  const statsQuery = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminGet<DashboardStats>("/admin/dashboard"),
  });
  const reportsQuery = useQuery({
    queryKey: ["admin", "reports", 30],
    queryFn: () => adminGet<AdminReports>("/admin/reports", { params: { days: 30 } }),
  });

  if (statsQuery.isPending) return <AdminLoading label="Đang tổng hợp số liệu" />;
  if (statsQuery.isError || !statsQuery.data) return <AdminError />;

  const stats = statsQuery.data;
  const reports = reportsQuery.data;

  return (
    <>
      <AdminPageHeader
        title="Tổng quan vận hành"
        description="Theo dõi doanh thu, đơn hàng, khách hàng và trạng thái danh mục sản phẩm."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Chỉ số chính">
        <StatsCard
          label="Doanh thu"
          value={formatMoney(stats.revenue.total)}
          detail={`${formatMoney(stats.revenue.thisMonth)} trong tháng này`}
          icon={<Banknote className="size-4" />}
        />
        <StatsCard
          label="Đơn hàng"
          value={stats.orders.total}
          detail={`${stats.orders.today} đơn mới hôm nay, ${stats.orders.pending} đang chờ`}
          icon={<ShoppingCart className="size-4" />}
        />
        <StatsCard
          label="Sản phẩm"
          value={stats.products.active}
          detail={`${stats.products.lowStock} sản phẩm sắp hết hàng`}
          icon={<Package className="size-4" />}
        />
        <StatsCard
          label="Khách hàng"
          value={stats.users.total}
          detail={`${stats.users.newToday} tài khoản mới hôm nay`}
          icon={<Users className="size-4" />}
        />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        {reportsQuery.isPending ? (
          <article className="border border-[#E1E1E1] bg-white p-5" aria-label="Đang tải biểu đồ doanh thu">
            <div className="mb-5 h-14 w-64 animate-pulse bg-[#EFEFEF] motion-reduce:animate-none" />
            <div className="h-80 animate-pulse bg-[#F3F3F3] motion-reduce:animate-none" />
          </article>
        ) : reportsQuery.isError || !reports ? (
          <AdminError
            message="Không thể tải biểu đồ doanh thu 30 ngày."
            onRetry={() => reportsQuery.refetch()}
          />
        ) : (
          <RevenueChart
            data={reports.revenue}
            days={30}
            title="Doanh thu 30 ngày"
            description="Đủ 30 ngày gần nhất, bao gồm cả ngày không phát sinh doanh thu."
            className="border border-[#E1E1E1] bg-white p-5"
          />
        )}

        <article className="border border-[#E1E1E1] bg-white p-5">
          <h2 className="font-heading text-2xl font-light">Sản phẩm bán chạy</h2>
          <p className="mt-1 text-xs text-[#666666]">Xếp theo số lượng đã bán</p>
          <div className="mt-5 space-y-1">
            {reportsQuery.isPending ? (
              Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="h-14 animate-pulse border-b border-[#EEEEEE] bg-[#F5F5F5] motion-reduce:animate-none" />
              ))
            ) : reportsQuery.isError ? (
              <p className="py-10 text-center text-sm text-[#B42318]" role="alert">
                Không thể tải xếp hạng sản phẩm.
              </p>
            ) : (
              reports?.topProducts.slice(0, 6).map((product, index) => (
                <div key={product.id} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#EEEEEE] py-3 last:border-0">
                  <span className="text-xs text-[#666666]">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{product.name}</p>
                    <p className="mt-0.5 text-[11px] text-[#666666]">{product.sku}</p>
                  </div>
                  <span className="text-sm font-semibold">{product.soldCount ?? 0}</span>
                </div>
              ))
            )}
            {!reportsQuery.isPending && !reportsQuery.isError && (reports?.topProducts.length ?? 0) === 0 && (
              <p className="py-10 text-center text-sm text-[#666666]">Chưa có dữ liệu bán hàng.</p>
            )}
          </div>
        </article>
      </section>
    </>
  );
}
