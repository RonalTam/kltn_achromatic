import { AxiosRequestConfig, isAxiosError } from "axios";
import { api } from "@/lib/api";

export async function adminGet<T>(url: string, config?: AxiosRequestConfig) {
  const response = await api.get<{ data: T }>(url, config);
  return response.data.data;
}

export async function adminPost<T>(url: string, body?: unknown) {
  const response = await api.post<{ data: T }>(url, body);
  return response.data.data;
}

export async function adminPatch<T>(url: string, body?: unknown) {
  const response = await api.patch<{ data: T }>(url, body);
  return response.data.data;
}

export async function adminDelete<T>(url: string) {
  const response = await api.delete<{ data: T }>(url);
  return response.data.data;
}

export const ORDER_STATUSES = [
  ["PENDING", "Chờ xác nhận"],
  ["CONFIRMED", "Đã xác nhận"],
  ["PROCESSING", "Đang chuẩn bị hàng"],
  ["SHIPPING", "Đang giao hàng"],
  ["DELIVERED", "Đã giao hàng"],
  ["COMPLETED", "Đã hoàn tất"],
  ["CANCELLED", "Đã hủy"],
  ["REFUNDED", "Đã hoàn tiền"],
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number][0];

export const ORDER_STATUS_TRANSITIONS = {
  PENDING: ["CONFIRMED", "PROCESSING", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "SHIPPING", "CANCELLED"],
  PROCESSING: ["SHIPPING", "DELIVERED", "CANCELLED"],
  SHIPPING: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDED: [],
} as const satisfies Record<OrderStatus, readonly OrderStatus[]>;

export function isOrderStatus(status: string): status is OrderStatus {
  return ORDER_STATUSES.some(([value]) => value === status);
}

export function nextOrderStatuses(status: string): readonly OrderStatus[] {
  return isOrderStatus(status) ? ORDER_STATUS_TRANSITIONS[status] : [];
}

type ApiErrorPayload = {
  message?: string | string[];
  error?: string | { message?: string | string[] };
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError<ApiErrorPayload>(error)) return fallback;

  const payload = error.response?.data;
  const nestedMessage =
    typeof payload?.error === "object" ? payload.error.message : undefined;
  const message = payload?.message ?? nestedMessage;

  if (Array.isArray(message)) return message.filter(Boolean).join(". ") || fallback;
  if (typeof message === "string" && message.trim()) return message.trim();
  if (typeof payload?.error === "string" && payload.error.trim()) return payload.error.trim();
  return fallback;
}

export function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function statusLabel(status: string) {
  return ORDER_STATUSES.find(([value]) => value === status)?.[1] ?? status;
}

export function paymentMethodLabel(method?: string) {
  const labels: Record<string, string> = {
    COD: "Thanh toán khi nhận hàng",
    BANK_TRANSFER: "Chuyển khoản",
    VNPAY: "VNPAY",
    MOMO: "MoMo",
    STRIPE: "Thẻ quốc tế",
  };
  return method ? labels[method] ?? method : "Chưa có";
}

export function paymentStatusLabel(status?: string) {
  const labels: Record<string, string> = {
    PENDING: "Chờ thanh toán",
    PROCESSING: "Đang xử lý",
    COMPLETED: "Đã thanh toán",
    FAILED: "Thất bại",
    REFUNDED: "Đã hoàn tiền",
    CANCELLED: "Đã hủy",
  };
  return status ? labels[status] ?? status : "Chưa có";
}
