"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminGet, formatMoney, statusLabel } from "@/components/admin/admin-api";
import { AdminError, AdminPageHeader } from "@/components/admin/AdminPrimitives";
import { DataTable, DataTableColumn } from "@/components/admin/DataTable";
import {
  formatRevenueDate,
  RevenueChart,
  summarizeRevenueData,
} from "@/components/admin/RevenueChart";
import { AdminProduct, AdminReports } from "@/components/admin/types";

const REPORT_RANGES = [7, 30, 90] as const;
type ReportRange = (typeof REPORT_RANGES)[number];

export default function AdminReportsPage() {
  const [days, setDays] = useState<ReportRange>(30);
  const reportsQuery = useQuery({
    queryKey: ["admin", "reports", days],
    queryFn: () => adminGet<AdminReports>("/admin/reports", { params: { days } }),
  });

  const reports = reportsQuery.data;
  const revenueSummary = reports
    ? summarizeRevenueData(reports.revenue, days)
    : null;
  const productColumns: Array<DataTableColumn<AdminProduct>> = [
    { key: "name", header: "Sản phẩm", cell: (product) => <div><p className="font-semibold text-[#111111]">{product.name}</p><p className="mt-0.5 text-[11px] text-[#777777]">{product.sku}</p></div> },
    { key: "sold", header: "Đã bán", cell: (product) => product.soldCount ?? 0 },
    { key: "price", header: "Giá hiện tại", cell: (product) => formatMoney(product.basePrice) },
  ];

  return (
    <>
      <AdminPageHeader
        title="Báo cáo"
        description="Phân tích doanh thu theo khoảng thời gian, cơ cấu đơn hàng và hiệu suất sản phẩm."
      />

      <section className="mb-5 flex flex-col justify-between gap-3 border border-[#E1E1E1] bg-white p-4 sm:flex-row sm:items-center" aria-labelledby="report-range-title">
        <div>
          <h2 id="report-range-title" className="text-sm font-semibold text-[#111111]">
            Khoảng thời gian doanh thu
          </h2>
          <p className="mt-1 text-xs text-[#666666]" aria-live="polite">
            {reportsQuery.isFetching && !reportsQuery.isPending
              ? `Đang cập nhật báo cáo ${days} ngày...`
              : "Chọn số ngày gần nhất cần phân tích."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn khoảng thời gian báo cáo">
          {REPORT_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDays(range)}
              className={range === days ? "admin-button" : "admin-button-outline"}
              aria-pressed={range === days}
            >
              {range} ngày
            </button>
          ))}
        </div>
      </section>

      {reportsQuery.isPending ? (
        <ReportsLoadingState />
      ) : reportsQuery.isError || !reports || !revenueSummary ? (
        <AdminError
          message={`Không thể tải báo cáo ${days} ngày.`}
          onRetry={() => reportsQuery.refetch()}
        />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3" aria-label={`Tóm tắt doanh thu ${days} ngày`}>
            <SummaryMetric
              label="Tổng doanh thu"
              value={formatMoney(revenueSummary.total)}
              detail={`${days} ngày gần nhất`}
            />
            <SummaryMetric
              label="Trung bình mỗi ngày"
              value={formatMoney(revenueSummary.dailyAverage)}
              detail="Tính cả ngày không có doanh thu"
            />
            <SummaryMetric
              label="Ngày cao nhất"
              value={revenueSummary.peak ? formatMoney(revenueSummary.peak.revenue) : "Chưa có"}
              detail={revenueSummary.peak
                ? formatRevenueDate(revenueSummary.peak.date, true)
                : "Chưa phát sinh doanh thu trong kỳ"}
            />
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
            <RevenueChart
              data={reports.revenue}
              days={days}
              title={`Doanh thu ${days} ngày`}
              description="Đơn đã hoàn tất hoặc đã giao, bao gồm cả ngày không phát sinh doanh thu."
              className="border border-[#E1E1E1] bg-white p-5"
            />

            <article className="border border-[#E1E1E1] bg-white p-5">
              <h2 className="font-heading text-2xl font-light">Trạng thái đơn hàng</h2>
              <p className="mt-1 text-xs text-[#666666]">Tổng quan toàn bộ đơn hàng hiện có</p>
              <div className="mt-5 space-y-2">
                {(reports.statusBreakdown ?? []).map((item) => (
                  <div key={item.status} className="flex items-center justify-between border-b border-[#EEEEEE] py-3 last:border-0">
                    <div>
                      <p className="text-sm font-semibold">{statusLabel(item.status)}</p>
                      <p className="mt-0.5 text-[11px] text-[#666666]">{formatMoney(item._sum.total)}</p>
                    </div>
                    <span className="admin-badge">{item._count.status} đơn</span>
                  </div>
                ))}
                {(reports.statusBreakdown?.length ?? 0) === 0 && (
                  <p className="py-10 text-center text-sm text-[#666666]">Chưa có dữ liệu đơn hàng.</p>
                )}
              </div>
            </article>
          </section>

          <section className="mt-5">
            <div className="mb-4">
              <h2 className="font-heading text-2xl font-light">Sản phẩm bán chạy</h2>
              <p className="mt-1 text-xs text-[#666666]">Xếp hạng tích lũy theo tổng số lượng đã bán</p>
            </div>
            <DataTable
              rows={reports.topProducts}
              columns={productColumns}
              getRowKey={(product) => product.id}
              emptyTitle="Chưa có dữ liệu sản phẩm"
            />
          </section>
        </>
      )}
    </>
  );
}

function SummaryMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="border border-[#E1E1E1] bg-white p-5">
      <p className="text-xs font-semibold text-[#666666]">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold tracking-tight text-[#111111] sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-[#666666]">{detail}</p>
    </article>
  );
}

function ReportsLoadingState() {
  return (
    <div role="status" aria-label="Đang tạo báo cáo">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse border border-[#E1E1E1] bg-[#F3F3F3] motion-reduce:animate-none" />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
        <div className="h-[430px] animate-pulse border border-[#E1E1E1] bg-[#F3F3F3] motion-reduce:animate-none" />
        <div className="h-[430px] animate-pulse border border-[#E1E1E1] bg-[#F3F3F3] motion-reduce:animate-none" />
      </div>
      <div className="mt-5 h-72 animate-pulse border border-[#E1E1E1] bg-[#F3F3F3] motion-reduce:animate-none" />
      <span className="sr-only">Đang tạo báo cáo</span>
    </div>
  );
}
