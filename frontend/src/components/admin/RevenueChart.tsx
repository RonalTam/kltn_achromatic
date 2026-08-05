"use client";

import { KeyboardEvent, useId, useRef, useState } from "react";

export interface RevenueDatum {
  date: string;
  revenue: number;
}

export interface RevenueSummary {
  total: number;
  dailyAverage: number;
  peak: RevenueDatum | null;
}

interface RevenueChartProps {
  data: RevenueDatum[];
  days: number;
  title: string;
  description: string;
  className?: string;
}

const STORE_TIME_ZONE = "Asia/Ho_Chi_Minh";
const CHART_WIDTH = 960;
const CHART_HEIGHT = 320;
const PLOT = { top: 18, right: 20, bottom: 50, left: 76 };
const GRID_LINES = 4;

function currentStoreDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function shiftDateKey(dateKey: string, offset: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function safeRevenue(value: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
}

export function normalizeRevenueData(
  data: RevenueDatum[],
  days: number,
  endDateKey = currentStoreDateKey(),
) {
  const safeDays = Math.max(1, Math.floor(days));
  const revenueByDate = new Map<string, number>();

  data.forEach((item) => {
    const dateKey = item.date.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
    revenueByDate.set(
      dateKey,
      (revenueByDate.get(dateKey) ?? 0) + safeRevenue(item.revenue),
    );
  });

  const startDateKey = shiftDateKey(endDateKey, -(safeDays - 1));
  return Array.from({ length: safeDays }, (_, index) => {
    const date = shiftDateKey(startDateKey, index);
    return { date, revenue: revenueByDate.get(date) ?? 0 };
  });
}

export function summarizeRevenueData(data: RevenueDatum[], days: number): RevenueSummary {
  const series = normalizeRevenueData(data, days);
  const total = series.reduce((sum, item) => sum + item.revenue, 0);
  const peak = series.reduce<RevenueDatum | null>(
    (highest, item) => (!highest || item.revenue > highest.revenue ? item : highest),
    null,
  );

  return {
    total,
    dailyAverage: total / series.length,
    peak: peak && peak.revenue > 0 ? peak : null,
  };
}

export function formatRevenueDate(dateKey: string, long = false) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    ...(long ? { year: "numeric" as const } : {}),
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactVnd(value: number) {
  const amount = Math.abs(value);
  if (amount >= 1_000_000_000) return `${trimDecimal(value / 1_000_000_000)} tỷ`;
  if (amount >= 1_000_000) return `${trimDecimal(value / 1_000_000)} tr`;
  if (amount >= 1_000) return `${trimDecimal(value / 1_000)} nghìn`;
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);
}

function revenuePointLabel(item: RevenueDatum) {
  return `${formatRevenueDate(item.date, true)}: ${formatCurrency(item.revenue)}`;
}

function trimDecimal(value: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value);
}

function niceMaximum(value: number) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const normalized = value / power;
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return factor * power;
}

function tickIndexes(length: number) {
  const target = length <= 7 ? length : length <= 30 ? 6 : 7;
  if (target <= 1) return [0];
  return Array.from(
    new Set(
      Array.from({ length: target }, (_, index) =>
        Math.round((index * (length - 1)) / (target - 1)),
      ),
    ),
  );
}

export function RevenueChart({
  data,
  days,
  title,
  description,
  className = "",
}: RevenueChartProps) {
  const titleId = useId();
  const descriptionId = useId();
  const pointRefs = useRef<Array<SVGGElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const series = normalizeRevenueData(data, days);
  const summary = summarizeRevenueData(data, days);
  const hasRevenue = summary.total > 0;
  const rawMaximum = Math.max(...series.map((item) => item.revenue), 0);
  const yMaximum = niceMaximum(rawMaximum);
  const plotWidth = CHART_WIDTH - PLOT.left - PLOT.right;
  const plotHeight = CHART_HEIGHT - PLOT.top - PLOT.bottom;
  const bandWidth = plotWidth / series.length;
  const barGap = Math.min(8, bandWidth * 0.32);
  const barWidth = Math.max(2, bandWidth - barGap);
  const xTicks = tickIndexes(series.length);
  const peakText = summary.peak
    ? `${formatCurrency(summary.peak.revenue)} vào ${formatRevenueDate(summary.peak.date, true)}`
    : "chưa có";
  const accessibleSummary = `Tổng doanh thu ${formatCurrency(summary.total)}. Trung bình ${formatCurrency(summary.dailyAverage)} mỗi ngày. Ngày cao nhất ${peakText}.`;
  const resolvedActiveIndex = activeIndex !== null && activeIndex < series.length
    ? activeIndex
    : null;
  const activeDatum = resolvedActiveIndex === null ? null : series[resolvedActiveIndex];
  const activeHeight = activeDatum ? (activeDatum.revenue / yMaximum) * plotHeight : 0;
  const activeCenterX = resolvedActiveIndex === null
    ? 0
    : PLOT.left + resolvedActiveIndex * bandWidth + bandWidth / 2;
  const activeBarY = PLOT.top + plotHeight - activeHeight;
  const tooltipWidth = 196;
  const tooltipHeight = 58;
  const tooltipX = Math.min(
    Math.max(activeCenterX - tooltipWidth / 2, PLOT.left),
    CHART_WIDTH - PLOT.right - tooltipWidth,
  );
  const tooltipY = Math.max(
    PLOT.top + 4,
    Math.min(activeBarY - tooltipHeight - 10, PLOT.top + plotHeight - tooltipHeight - 8),
  );

  function focusPoint(index: number) {
    const nextIndex = Math.min(Math.max(index, 0), series.length - 1);
    setActiveIndex(nextIndex);
    pointRefs.current[nextIndex]?.focus();
  }

  function handlePointKeyDown(event: KeyboardEvent<SVGGElement>, index: number) {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      focusPoint(index - 1);
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      focusPoint(index + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusPoint(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusPoint(series.length - 1);
    } else if (event.key === "Escape") {
      event.currentTarget.blur();
      setActiveIndex(null);
    }
  }

  return (
    <figure className={className} aria-labelledby={titleId}>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 id={titleId} className="font-heading text-2xl font-light text-[#111111]">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#666666]">{description}</p>
        </div>
        <span className="admin-badge self-start sm:self-auto">VND</span>
      </div>

      <figcaption id={descriptionId} className="sr-only">
        {accessibleSummary}
      </figcaption>

      {hasRevenue ? (
        <div
          className="overflow-x-auto pb-1 outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] focus-visible:ring-offset-2"
          role="region"
          tabIndex={0}
          aria-label="Biểu đồ doanh thu, có thể cuộn ngang trên màn hình nhỏ"
        >
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-auto w-full min-w-[680px]"
            role="group"
            aria-labelledby={`${titleId} ${descriptionId}`}
          >
            <title>{title}</title>
            <desc>
              {accessibleSummary} Dùng phím mũi tên để di chuyển giữa các ngày. Bảng dữ liệu chi tiết nằm ngay dưới biểu đồ.
            </desc>

            <g aria-hidden="true">
              {Array.from({ length: GRID_LINES + 1 }, (_, index) => {
                const ratio = index / GRID_LINES;
                const value = yMaximum * (1 - ratio);
                const y = PLOT.top + ratio * plotHeight;
                return (
                  <g key={index}>
                    <line
                      x1={PLOT.left}
                      x2={CHART_WIDTH - PLOT.right}
                      y1={y}
                      y2={y}
                      stroke={index === GRID_LINES ? "#BEBEBE" : "#E7E7E7"}
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                    <text
                      x={PLOT.left - 12}
                      y={y + 4}
                      textAnchor="end"
                      fill="#5F5F5F"
                      fontSize="11"
                      fontFamily="var(--font-sans), sans-serif"
                    >
                      {formatCompactVnd(value)}
                    </text>
                  </g>
                );
              })}

              <line
                x1={PLOT.left}
                x2={PLOT.left}
                y1={PLOT.top}
                y2={PLOT.top + plotHeight}
                stroke="#BEBEBE"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />

              {xTicks.map((index) => {
                const item = series[index];
                const x = PLOT.left + index * bandWidth + bandWidth / 2;
                return (
                  <text
                    key={item.date}
                    x={x}
                    y={CHART_HEIGHT - 18}
                    textAnchor="middle"
                    fill="#5F5F5F"
                    fontSize="11"
                    fontFamily="var(--font-sans), sans-serif"
                  >
                    {formatRevenueDate(item.date)}
                  </text>
                );
              })}
            </g>

            <g role="group" aria-label={`Doanh thu từng ngày trong ${series.length} ngày`}>
              {series.map((item, index) => {
                const height = (item.revenue / yMaximum) * plotHeight;
                const x = PLOT.left + index * bandWidth + (bandWidth - barWidth) / 2;
                const y = PLOT.top + plotHeight - height;
                const isActive = index === resolvedActiveIndex;

                return (
                  <g
                    key={item.date}
                    ref={(node) => {
                      pointRefs.current[index] = node;
                    }}
                    role="img"
                    tabIndex={index === (resolvedActiveIndex ?? 0) ? 0 : -1}
                    aria-label={revenuePointLabel(item)}
                    onFocus={() => setActiveIndex(index)}
                    onBlur={() => setActiveIndex(null)}
                    onPointerEnter={() => setActiveIndex(index)}
                    onPointerLeave={(event) => {
                      if (event.pointerType === "mouse") setActiveIndex(null);
                    }}
                    onPointerDown={(event) => {
                      if (event.pointerType === "touch") setActiveIndex(index);
                    }}
                    onKeyDown={(event) => handlePointKeyDown(event, index)}
                    className="cursor-crosshair outline-none"
                  >
                    {isActive && (
                      <line
                        x1={PLOT.left + index * bandWidth + bandWidth / 2}
                        x2={PLOT.left + index * bandWidth + bandWidth / 2}
                        y1={PLOT.top}
                        y2={PLOT.top + plotHeight}
                        stroke="#8AAEC9"
                        strokeDasharray="3 4"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                        aria-hidden="true"
                      />
                    )}
                    {item.revenue > 0 && (
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(height, 1.5)}
                        rx="2"
                        fill={isActive ? "#111111" : "#0F4C81"}
                        aria-hidden="true"
                      />
                    )}
                    {isActive && (
                      <circle
                        cx={PLOT.left + index * bandWidth + bandWidth / 2}
                        cy={item.revenue > 0 ? y : PLOT.top + plotHeight}
                        r="4.5"
                        fill="#FFFFFF"
                        stroke="#0F4C81"
                        strokeWidth="2.5"
                        vectorEffect="non-scaling-stroke"
                        aria-hidden="true"
                      />
                    )}
                    <rect
                      x={PLOT.left + index * bandWidth}
                      y={PLOT.top}
                      width={bandWidth}
                      height={plotHeight}
                      fill="transparent"
                      aria-hidden="true"
                    />
                  </g>
                );
              })}
            </g>

            {activeDatum && (
              <g className="pointer-events-none" aria-hidden="true">
                <rect
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx="4"
                  fill="#111111"
                />
                <text
                  x={tooltipX + 14}
                  y={tooltipY + 22}
                  fill="#D9D9D9"
                  fontSize="11"
                  fontFamily="var(--font-sans), sans-serif"
                >
                  {formatRevenueDate(activeDatum.date, true)}
                </text>
                <text
                  x={tooltipX + 14}
                  y={tooltipY + 43}
                  fill="#FFFFFF"
                  fontSize="13"
                  fontWeight="600"
                  fontFamily="var(--font-sans), sans-serif"
                >
                  {formatCompactVnd(activeDatum.revenue)} VND
                </text>
              </g>
            )}
          </svg>
          <p className="sr-only" aria-live="polite">
            {activeDatum ? revenuePointLabel(activeDatum) : ""}
          </p>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center border border-dashed border-[#D7D7D7] bg-[#FAFAFA] px-6 text-center" role="status">
          <div>
            <p className="text-sm font-semibold text-[#111111]">Chưa có doanh thu trong kỳ</p>
            <p className="mt-1 text-xs leading-5 text-[#666666]">
              Dữ liệu sẽ xuất hiện khi có đơn hàng hoàn tất hoặc đã giao.
            </p>
          </div>
        </div>
      )}

      <details className="mt-4 border-t border-[#E4E4E4] pt-3">
        <summary className="flex min-h-11 cursor-pointer items-center text-xs font-semibold text-[#444444] outline-none hover:text-[#111111] focus-visible:ring-2 focus-visible:ring-[#0F4C81] focus-visible:ring-offset-2">
          Xem bảng dữ liệu {series.length} ngày
        </summary>
        <div className="mt-2 max-h-80 overflow-auto border border-[#E1E1E1]">
          <table className="w-full min-w-[440px] border-collapse text-sm">
            <thead className="sticky top-0 bg-[#F7F7F7]">
              <tr>
                <th scope="col" className="border-b border-[#DDDDDD] px-4 py-3 text-left text-xs font-semibold text-[#444444]">
                  Ngày
                </th>
                <th scope="col" className="border-b border-[#DDDDDD] px-4 py-3 text-right text-xs font-semibold text-[#444444]">
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody>
              {series.map((item) => (
                <tr key={item.date} className="border-b border-[#EEEEEE] last:border-0">
                  <th scope="row" className="px-4 py-2.5 text-left font-normal text-[#444444]">
                    {formatRevenueDate(item.date, true)}
                  </th>
                  <td className="px-4 py-2.5 text-right font-semibold text-[#111111]">
                    {formatCurrency(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
