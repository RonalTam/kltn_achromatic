"use client";

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Package, ChevronLeft, ChevronRight, X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  total: number | string;
  createdAt: string;
  items?: Array<{ productName?: string; quantity: number }>;
  payment?: { method: string; status: string } | null;
};

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

const statusColors: Record<string, string> = {
  PENDING: 'text-amber-600 bg-amber-50 border-amber-200',
  CONFIRMED: 'text-blue-600 bg-blue-50 border-blue-200',
  PROCESSING: 'text-purple-600 bg-purple-50 border-purple-200',
  SHIPPING: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  DELIVERED: 'text-green-600 bg-green-50 border-green-200',
  COMPLETED: 'text-green-700 bg-green-50 border-green-200',
  CANCELLED: 'text-red-600 bg-red-50 border-red-200',
  REFUNDED: 'text-gray-600 bg-gray-50 border-gray-200',
};

// Only these statuses can be cancelled by the customer
const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING'];

// ── Cancel Confirmation Modal ────────────────────────────────────────────────
function CancelModal({
  order,
  onConfirm,
  onClose,
  loading,
}: {
  order: OrderSummary;
  onConfirm: (reason: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');

  const reasons = [
    'Tôi muốn thay đổi địa chỉ giao hàng',
    'Tôi muốn thay đổi sản phẩm',
    'Tìm được giá rẻ hơn ở nơi khác',
    'Đặt nhầm sản phẩm',
    'Không còn cần sản phẩm nữa',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative z-10 bg-white w-full max-w-md border border-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-medium text-primary">
                Hủy Đơn Hàng
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                #{order.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-40"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-muted-foreground">
            Bạn có chắc muốn hủy đơn hàng này không? Hành động này{' '}
            <strong className="text-primary">không thể hoàn tác</strong>.
          </p>

          {/* Order summary */}
          <div className="bg-muted/50 border border-border p-4 text-sm">
            <p className="font-medium text-primary mb-1">{order.orderNumber}</p>
            <p className="text-muted-foreground">
              {formatPrice(order.total)} •{' '}
              {order.items?.length ?? 0} sản phẩm
            </p>
          </div>

          {/* Reason selection */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Lý do hủy đơn{' '}
              <span className="text-muted-foreground font-normal">(không bắt buộc)</span>
            </label>
            <div className="space-y-2 mb-3">
              {reasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`w-full text-left text-sm px-3 py-2.5 border transition-colors ${
                    reason === r
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-muted-foreground/40 text-muted-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={reasons.includes(reason) ? '' : reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Hoặc nhập lý do khác..."
              className="w-full border border-border px-3 py-2.5 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11"
          >
            Không, giữ đơn
          </Button>
          <Button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white border-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang hủy...
              </>
            ) : (
              'Xác nhận hủy đơn'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Success Toast ────────────────────────────────────────────────────────────
function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-green-200 shadow-lg px-4 py-3 max-w-sm animate-in slide-in-from-bottom-2">
      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
      <p className="text-sm text-primary">{message}</p>
      <button onClick={onClose} className="ml-auto p-0.5 hover:text-muted-foreground">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken } = useAuthStore();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<OrderSummary | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadOrders = useCallback(() => {
    if (!accessToken) return;
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    api
      .get('/orders')
      .then((res) => setOrders(res.data?.data?.data ?? []))
      .catch(() => setError('Không tải được lịch sử đơn hàng.'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    if (!user) {
      router.push('/account/login?redirect=/account/orders');
      return;
    }
    loadOrders();
  }, [user, router, loadOrders]);

  const handleCancelConfirm = async (reason: string) => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError('');
    try {
      await api.patch(`/orders/${cancelTarget.id}/cancel`, { reason });
      setCancelTarget(null);
      setSuccessMsg(`Đơn hàng ${cancelTarget.orderNumber} đã được hủy thành công.`);
      // Refresh orders list
      loadOrders();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCancelError(msg || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
    } finally {
      setCancelling(false);
    }
  };

  if (!user) return null;

  const success = searchParams.get('success');

  return (
    <div className="min-h-screen bg-background px-5 md:px-20 pt-28 pb-16">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại tài khoản
        </Link>

        <h1 className="font-heading text-3xl md:text-4xl font-light tracking-tight text-primary mb-8">
          Lịch Sử Đơn Hàng
        </h1>

        {/* Success banner (after checkout) */}
        {success && (
          <div className="mb-6 border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            Đặt hàng thành công{success !== 'true' ? ` - Mã đơn: ${success}` : ''}!
          </div>
        )}

        {/* Cancel error */}
        {cancelError && (
          <div className="mb-6 border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{cancelError}</span>
            <button
              onClick={() => setCancelError('')}
              className="ml-auto shrink-0"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Load error */}
        {error && (
          <div className="mb-6 border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Orders list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border bg-card p-5 animate-pulse">
                <div className="h-5 w-40 bg-muted rounded mb-3" />
                <div className="h-3 w-24 bg-muted rounded mb-4" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const canCancel = CANCELLABLE_STATUSES.includes(order.status);
              const statusClass = statusColors[order.status] ?? 'text-gray-600 bg-gray-50 border-gray-200';

              return (
                <div key={order.id} className="border border-border bg-card p-5 hover:border-[#111111] transition-colors duration-200">
                  {/* Top row */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-heading text-lg text-primary">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat('vi-VN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(order.createdAt))}
                      </p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <p className="font-semibold text-primary text-lg">
                        {formatPrice(order.total)}
                      </p>
                      {/* Status badge */}
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 border ${statusClass}`}>
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <p key={`${order.id}-${index}`}>
                          {item.quantity}× {item.productName ?? 'Sản phẩm'}
                        </p>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs">+{order.items.length - 3} sản phẩm khác</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    {/* Cancel hint or empty */}
                    {canCancel ? (
                      <p className="text-xs text-muted-foreground">
                        Bạn có thể hủy trước khi đơn được bàn giao cho đơn vị vận chuyển
                      </p>
                    ) : order.status === 'CANCELLED' ? (
                      <p className="text-xs text-red-500">Đơn hàng đã bị hủy</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Đơn hàng không thể hủy ở trạng thái này
                      </p>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 text-xs font-medium text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81]/40"
                      >
                        Xem chi tiết
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      {canCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCancelError('');
                            setCancelTarget(order);
                          }}
                          className="h-11 shrink-0 border-red-200 px-4 text-xs font-medium text-red-600 transition-colors hover:border-red-400 hover:bg-red-50"
                        >
                          <X className="w-3.5 h-3.5 mr-1.5" />
                          Hủy đơn hàng
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border border-border bg-card">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground stroke-1" />
            <h2 className="font-heading text-xl text-primary mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Bắt đầu mua sắm để xem lịch sử đơn hàng tại đây
            </p>
            <Link href="/collections">
              <Button>Khám phá sản phẩm</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {cancelTarget && (
        <CancelModal
          order={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => {
            if (!cancelling) setCancelTarget(null);
          }}
          loading={cancelling}
        />
      )}

      {/* Success toast */}
      {successMsg && (
        <SuccessToast message={successMsg} onClose={() => setSuccessMsg('')} />
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background px-5 md:px-20 pt-28 pb-16">
          <div className="max-w-4xl mx-auto space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border bg-card p-5 animate-pulse">
                <div className="h-5 w-40 bg-muted rounded mb-3" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
