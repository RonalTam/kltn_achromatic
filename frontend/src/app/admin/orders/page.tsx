"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Eye, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";
import {
  adminGet,
  adminPatch,
  formatDateTime,
  formatMoney,
  getApiErrorMessage,
  nextOrderStatuses,
  ORDER_STATUSES,
  OrderStatus,
  statusLabel,
} from "@/components/admin/admin-api";
import { OrderDetailPanel } from "@/components/admin/AdminDetailPanels";
import {
  AdminDrawer,
  AdminError,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  AdminPagination,
  ResourceToolbar,
} from "@/components/admin/AdminPrimitives";
import { DataTable, DataTableColumn } from "@/components/admin/DataTable";
import { AdminOrder, ApiList } from "@/components/admin/types";

type TransitionDraft = {
  order: AdminOrder;
  nextStatus: OrderStatus;
  note: string;
};

function statusTone(status: string) {
  if (status === "DELIVERED" || status === "COMPLETED") return "success";
  if (status === "CANCELLED" || status === "REFUNDED") return "danger";
  return "warning";
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "COD",
  BANK_TRANSFER: "Chuyển khoản",
  VNPAY: "VNPay",
  MOMO: "MoMo",
  STRIPE: "Stripe",
};

function paymentStatusStyle(status: string): string {
  if (status === "COMPLETED") return "text-emerald-700 bg-emerald-50 border border-emerald-200";
  if (status === "FAILED") return "text-red-700 bg-red-50 border border-red-200";
  if (status === "REFUNDED") return "text-zinc-600 bg-zinc-100 border border-zinc-200";
  return "text-amber-700 bg-amber-50 border border-amber-200"; // PENDING / PROCESSING
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chưa TT",
  PROCESSING: "Đang TT",
  COMPLETED: "Đã TT",
  FAILED: "Thất bại",
  REFUNDED: "Hoàn tiền",
  CANCELLED: "Đã hủy",
};

function requiresTransitionNote(status: OrderStatus) {
  return status === "CANCELLED";
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [detail, setDetail] = useState<AdminOrder | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [transitionDraft, setTransitionDraft] = useState<TransitionDraft | null>(null);
  const [transitionError, setTransitionError] = useState("");


  const listQuery = useQuery({
    queryKey: ["admin", "orders", { page, search, status }],
    queryFn: () =>
      adminGet<ApiList<AdminOrder>>("/admin/orders", {
        params: {
          page,
          limit: 12,
          search: search || undefined,
          status: status || undefined,
        },
      }),
    placeholderData: (previous) => previous,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, nextStatus, note }: { orderId: string; nextStatus: OrderStatus; note: string }) =>
      adminPatch<AdminOrder>(`/admin/orders/${orderId}/status`, {
        status: nextStatus,
        note: note.trim() || undefined,
      }),
    onSuccess: async (_, variables) => {
      toast.success(`Đã chuyển đơn hàng sang ${statusLabel(variables.nextStatus)}`);
      setTransitionDraft(null);
      setTransitionError("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      if (detail?.id === variables.orderId) {
        try {
          setDetail(await adminGet<AdminOrder>(`/admin/orders/${variables.orderId}`));
        } catch (error) {
          toast.error(getApiErrorMessage(error, "Không thể làm mới chi tiết đơn hàng"));
        }
      }
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, "Không thể cập nhật trạng thái đơn hàng");
      setTransitionError(message);
      toast.error(message);
    },
  });


  const transitionKey = transitionDraft
    ? `${transitionDraft.order.id}:${transitionDraft.nextStatus}`
    : "";



  const openDetail = async (order: AdminOrder) => {
    if (detailLoadingId || statusMutation.isPending) return;
    setDetailLoadingId(order.id);
    try {
      setDetail(await adminGet<AdminOrder>(`/admin/orders/${order.id}`));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải chi tiết đơn hàng"));
    } finally {
      setDetailLoadingId(null);
    }
  };

  const requestTransition = (
    order: AdminOrder,
    nextStatus: string,
    _trigger: HTMLElement
  ) => {
    if (!nextStatus || statusMutation.isPending) return;
    const allowed = nextOrderStatuses(order.status);
    const typedStatus = allowed.find((item) => item === nextStatus);
    if (!typedStatus) {
      toast.error("Chuyển trạng thái này không hợp lệ. Hãy tải lại danh sách đơn hàng.");
      return;
    }
    setTransitionError("");
    setTransitionDraft({ order, nextStatus: typedStatus, note: "" });
  };

  const closeTransition = () => {
    if (statusMutation.isPending) return;
    setTransitionError("");
    setTransitionDraft(null);
  };

  const confirmTransition = () => {
    if (!transitionDraft || statusMutation.isPending) return;
    if (requiresTransitionNote(transitionDraft.nextStatus) && !transitionDraft.note.trim()) {
      setTransitionError("Cần nhập lý do khi hủy hoặc hoàn tiền đơn hàng.");
      return;
    }
    setTransitionError("");
    statusMutation.mutate({
      orderId: transitionDraft.order.id,
      nextStatus: transitionDraft.nextStatus,
      note: transitionDraft.note,
    });
  };

  const applySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const columns: Array<DataTableColumn<AdminOrder>> = [
    {
      key: "order",
      header: "Đơn hàng",
      cell: (order) => (
        <div>
          <p className="font-semibold text-[#111111]">{order.orderNumber}</p>
          <p className="mt-0.5 text-[11px] text-[#777777]">{formatDateTime(order.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Khách hàng",
      cell: (order) => (
        <div className="min-w-48">
          <p>{`${order.user?.firstName ?? ""} ${order.user?.lastName ?? ""}`.trim() || "-"}</p>
          <p className="mt-0.5 text-[11px] text-[#777777]">{order.user?.email ?? "-"}</p>
        </div>
      ),
    },
    {
      key: "total",
      header: "Tổng tiền",
      cell: (order) => <span className="font-semibold">{formatMoney(order.total)}</span>,
    },
    {
      key: "items_count",
      header: "Số SP",
      cell: (order) => {
        const qty = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
        return (
          <span className="inline-flex items-center justify-center min-w-[28px] h-6 rounded-full bg-[#F3F4F6] text-xs font-semibold text-[#374151] px-2">
            {qty}
          </span>
        );
      },
    },
    {
      key: "payment",
      header: "Thanh toán",
      cell: (order) => {
        if (!order.payment) return <span className="text-[#999999] text-xs">—</span>;
        const methodLabel = PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method;
        const statusLabel = PAYMENT_STATUS_LABELS[order.payment.status] ?? order.payment.status;
        return (
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#444444]">{methodLabel}</p>
            <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${paymentStatusStyle(order.payment.status)}`}>
              {statusLabel}
            </span>
          </div>
        );
      },
    },
    {
      key: "coupon",
      header: "Mã giảm giá",
      cell: (order) => {
        if (!order.couponCode) return <span className="text-[#CCCCCC] text-xs">—</span>;
        return (
          <span className="inline-flex items-center gap-1 rounded border border-[#E2D9F3] bg-[#F5F0FF] px-1.5 py-0.5 text-[11px] font-mono font-semibold text-[#6B21A8]">
            <Tag className="size-3" />
            {order.couponCode}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (order) => (
        <span className="admin-badge" data-tone={statusTone(order.status)}>
          {statusLabel(order.status)}
        </span>
      ),
    },
    {
      key: "update",
      header: "Bước tiếp theo",
      cell: (order) => {
        const nextStatuses = nextOrderStatuses(order.status);
        const locked = statusMutation.isPending || detailLoadingId === order.id;
        return (
          <select
            value=""
            onChange={(event) =>
              requestTransition(order, event.target.value, event.currentTarget)
            }
            className="admin-select min-w-52"
            disabled={locked || nextStatuses.length === 0}
            aria-label={`Chọn trạng thái tiếp theo cho đơn ${order.orderNumber}`}
          >
            <option value="">
              {nextStatuses.length === 0 ? "Đơn đã ở trạng thái cuối" : "Chọn trạng thái tiếp theo"}
            </option>
            {nextStatuses.map((nextStatus) => (
              <option key={nextStatus} value={nextStatus}>
                {statusLabel(nextStatus)}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: "actions",
      header: "Chi tiết",
      className: "text-right",
      cell: (order) => {
        const loading = detailLoadingId === order.id;
        return (
          <button
            type="button"
            onClick={() => openDetail(order)}
            disabled={Boolean(detailLoadingId) || statusMutation.isPending}
            className="admin-icon-button ml-auto"
            aria-label={`Xem chi tiết đơn ${order.orderNumber}`}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
          </button>
        );
      },
    },
  ];

  const hasFilters = Boolean(search || status);

  return (
    <>
      <AdminPageHeader
        title="Đơn hàng"
        description="Theo dõi vòng đời đơn hàng, thanh toán, giao nhận và lịch sử trạng thái."
      />
      <ResourceToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        onSubmit={applySearch}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        statusOptions={[...ORDER_STATUSES]}
      />

      {listQuery.isPending ? (
        <AdminLoading label="Đang tải danh sách đơn hàng" />
      ) : listQuery.isError || !listQuery.data ? (
        <AdminError
          message={getApiErrorMessage(listQuery.error, "Không thể tải danh sách đơn hàng")}
          onRetry={() => listQuery.refetch()}
        />
      ) : (
        <>
          {listQuery.isFetching && (
            <div className="mb-2 flex items-center justify-end gap-2 text-xs text-[#666666]" role="status">
              <Loader2 className="size-3.5 animate-spin" /> Đang cập nhật danh sách
            </div>
          )}
          <DataTable
            rows={listQuery.data.data}
            columns={columns}
            getRowKey={(order) => order.id}
            emptyTitle={hasFilters ? "Không tìm thấy đơn hàng phù hợp" : "Chưa có đơn hàng"}
            emptyDescription={
              hasFilters
                ? "Hãy thử từ khóa khác hoặc thay đổi bộ lọc trạng thái."
                : "Đơn hàng mới sẽ xuất hiện tại đây."
            }
          />
          <AdminPagination meta={listQuery.data.meta} onPageChange={setPage} />
        </>
      )}

      {detail && (
        <AdminDrawer title={`Đơn hàng ${detail.orderNumber}`} onClose={() => setDetail(null)}>
          <OrderDetailPanel order={detail} />
        </AdminDrawer>
      )}

      {transitionDraft && (
        <AdminModal
          title="Xác nhận trạng thái đơn hàng"
          saving={statusMutation.isPending}
          saveLabel="Xác nhận cập nhật"
          onSave={confirmTransition}
          onClose={closeTransition}
        >
          <p className="-mt-1 text-sm text-[#666666]">Đơn {transitionDraft.order.orderNumber}</p>

          <div className="flex items-center gap-3 border border-[#DADADA] bg-[#FAFAFA] p-4">
            <span className="admin-badge" data-tone={statusTone(transitionDraft.order.status)}>
              {statusLabel(transitionDraft.order.status)}
            </span>
            <ArrowRight className="size-4 shrink-0 text-[#666666]" />
            <span className="admin-badge" data-tone={statusTone(transitionDraft.nextStatus)}>
              {statusLabel(transitionDraft.nextStatus)}
            </span>
          </div>

          {transitionDraft.nextStatus === "CANCELLED" && (
            <div className="flex gap-3 border border-[#E7B8B3] bg-[#FFF7F6] p-3 text-sm text-[#7A271F]">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>Hủy đơn sẽ giải phóng tồn kho đã giữ. Hãy ghi rõ lý do để lưu vào lịch sử đơn hàng.</p>
            </div>
          )}

          <label className="block">
            <span className="admin-label">
              Ghi chú chuyển trạng thái
              {requiresTransitionNote(transitionDraft.nextStatus) && <span className="ml-1 text-[#B42318]">*</span>}
            </span>
            <textarea
              value={transitionDraft.note}
              onChange={(event) => {
                setTransitionError("");
                setTransitionDraft((current) => current ? { ...current, note: event.target.value } : current);
              }}
              className="admin-textarea min-h-28"
              placeholder="Ví dụ: Đã đối soát thanh toán, bàn giao đơn vị vận chuyển..."
              maxLength={500}
              disabled={statusMutation.isPending}
            />
            <span className="mt-1 block text-right text-[11px] text-[#777777]">{transitionDraft.note.length}/500</span>
          </label>

          {transitionError && (
            <p className="text-sm font-medium text-[#B42318]" role="alert">{transitionError}</p>
          )}
        </AdminModal>
      )}
    </>
  );
}
