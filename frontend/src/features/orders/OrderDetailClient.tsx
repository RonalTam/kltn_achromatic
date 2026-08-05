"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Download,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  RefreshCcw,
  RotateCcw,
  ShoppingBag,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import {
  cancelOrder,
  getOrderDetail,
  getOrderErrorMessage,
  getOrderErrorStatus,
} from './order-api';
import { OrderTimeline } from './OrderTimeline';
import { OrderInvoice } from './OrderInvoice';
import type { OrderDetail, OrderStatus } from './order-types';
import {
  canCancelOrder,
  createReorderSelection,
  formatOrderDate,
  getCancellationReason,
  getOrderItemImage,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from './order-utils';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:
    'border-amber-300/70 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200',
  CONFIRMED:
    'border-[#0F4C81]/35 bg-[#0F4C81]/8 text-[#0F4C81] dark:border-[#6CA7D7]/40 dark:bg-[#1E6FBF]/20 dark:text-[#9CC8EB]',
  PROCESSING:
    'border-[#0F4C81]/35 bg-[#0F4C81]/8 text-[#0F4C81] dark:border-[#6CA7D7]/40 dark:bg-[#1E6FBF]/20 dark:text-[#9CC8EB]',
  SHIPPING:
    'border-[#0F4C81]/35 bg-[#0F4C81]/8 text-[#0F4C81] dark:border-[#6CA7D7]/40 dark:bg-[#1E6FBF]/20 dark:text-[#9CC8EB]',
  DELIVERED:
    'border-emerald-300/70 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
  COMPLETED:
    'border-emerald-300/70 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
  CANCELLED:
    'border-red-300/70 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200',
  REFUNDED:
    'border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200',
};

function subscribeToAuthHydration(onStoreChange: () => void) {
  const unsubscribeHydrate = useAuthStore.persist.onHydrate(onStoreChange);
  const unsubscribeFinish =
    useAuthStore.persist.onFinishHydration(onStoreChange);

  return () => {
    unsubscribeHydrate();
    unsubscribeFinish();
  };
}

function getAuthHydrationSnapshot() {
  return useAuthStore.persist.hasHydrated();
}

function formatAddress(order: OrderDetail): string {
  const { address } = order;
  return [
    address.addressLine1,
    address.addressLine2,
    address.ward,
    address.district,
    address.province,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
}

function getSafeTrackingUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function OrderDetailSkeleton() {
  return (
    <main
      className="min-h-[100dvh] bg-background pb-20 pt-24 md:pt-28"
      aria-busy="true"
      aria-label="Đang tải chi tiết đơn hàng"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <div className="h-4 w-36 animate-pulse bg-muted" />
        <div className="mt-8 grid gap-5 border-b border-border pb-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="h-9 w-64 max-w-full animate-pulse bg-muted" />
            <div className="mt-3 h-4 w-48 animate-pulse bg-muted" />
          </div>
          <div className="h-8 w-28 animate-pulse bg-muted" />
        </div>
        <div className="mt-8 border border-border p-7">
          <div className="h-6 w-44 animate-pulse bg-muted" />
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            {[0, 1, 2, 3].map((stage) => (
              <div key={stage}>
                <div className="h-8 w-8 animate-pulse bg-muted" />
                <div className="mt-4 h-4 w-24 animate-pulse bg-muted" />
                <div className="mt-2 h-3 w-32 max-w-full animate-pulse bg-muted" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
          <div className="border border-border p-6">
            <div className="h-6 w-40 animate-pulse bg-muted" />
            {[0, 1].map((item) => (
              <div key={item} className="mt-6 flex gap-4 border-t border-border pt-6">
                <div className="h-28 w-24 animate-pulse bg-muted" />
                <div className="flex-1">
                  <div className="h-5 w-48 max-w-full animate-pulse bg-muted" />
                  <div className="mt-3 h-3 w-32 animate-pulse bg-muted" />
                  <div className="mt-6 h-4 w-24 animate-pulse bg-muted" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-96 animate-pulse border border-border bg-card" />
        </div>
      </div>
    </main>
  );
}

function OrderLoadError({
  notFound,
  onRetry,
}: {
  notFound: boolean;
  onRetry: () => void;
}) {
  return (
    <main className="min-h-[100dvh] bg-background pb-20 pt-24 md:pt-28">
      <div className="mx-auto max-w-3xl px-5 md:px-10">
        <Link
          href="/account/orders"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81]/40"
        >
          <ArrowLeft className="h-4 w-4" />
          Trở lại danh sách đơn hàng
        </Link>

        <section className="mt-8 border border-border bg-card p-8 md:p-12">
          <div className="flex h-12 w-12 items-center justify-center bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#9CC8EB]">
            <AlertCircle className="h-6 w-6 stroke-[1.6]" />
          </div>
          <h1 className="mt-7 font-heading text-3xl font-light tracking-tight text-primary md:text-4xl">
            {notFound ? 'Không tìm thấy đơn hàng' : 'Chưa thể tải đơn hàng'}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            {notFound
              ? 'Đơn hàng không tồn tại hoặc không thuộc tài khoản đang đăng nhập.'
              : 'Kết nối có thể đang gián đoạn. Vui lòng thử tải lại chi tiết đơn hàng.'}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {!notFound && (
              <Button
                onClick={onRetry}
                className="h-11 min-w-36 px-5"
              >
                <RefreshCcw className="h-4 w-4" />
                Thử lại
              </Button>
            )}
            <Link
              href="/account/orders"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-11 px-5',
              )}
            >
              Xem đơn hàng của tôi
            </Link>
            <Link
              href="/collections"
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'h-11 px-5',
              )}
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export function CancelOrderDialog({
  open,
  orderNumber,
  loading,
  onCancel,
  onClose,
  finalFocusRef,
}: {
  open: boolean;
  orderNumber: string;
  loading: boolean;
  onCancel: (reason: string) => Promise<void>;
  onClose: () => void;
  finalFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const [reason, setReason] = useState('');
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading) onClose();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-zinc-950/60 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <AlertDialog.Popup
        initialFocus={initialFocusRef}
        finalFocus={finalFocusRef}
        className="relative w-full max-w-lg border border-border bg-background shadow-[0_24px_80px_rgba(15,23,42,0.24)] outline-none transition duration-150 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
      >
        <div className="flex items-start justify-between border-b border-border p-6">
          <div>
            <AlertDialog.Title
              id="cancel-order-title"
              className="font-heading text-xl font-medium text-primary"
            >
              Hủy đơn hàng
            </AlertDialog.Title>
            <p className="mt-1 text-xs text-muted-foreground">
              Mã đơn {orderNumber}
            </p>
          </div>
          <AlertDialog.Close
            render={
              <button
                type="button"
                disabled={loading}
                className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81]/40 disabled:opacity-50"
                aria-label="Đóng"
              />
            }
          >
            <X className="h-5 w-5" />
          </AlertDialog.Close>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onCancel(reason);
          }}
        >
          <div className="p-6">
            <AlertDialog.Description
              id="cancel-order-description"
              className="text-sm leading-6 text-muted-foreground"
            >
              Đơn hàng chỉ có thể hủy trước khi được bàn giao cho đơn vị vận
              chuyển. Thao tác này không thể hoàn tác.
            </AlertDialog.Description>
            <div className="mt-5">
              <label
                htmlFor="cancel-reason"
                className="block text-sm font-medium text-primary"
              >
                Lý do hủy
                <span className="ml-1 font-normal text-muted-foreground">
                  (không bắt buộc)
                </span>
              </label>
              <textarea
                id="cancel-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={300}
                rows={4}
                placeholder="Ví dụ: Tôi muốn thay đổi sản phẩm hoặc địa chỉ giao hàng"
                className="mt-2 w-full resize-none border border-input bg-background px-3 py-3 text-sm text-primary outline-none placeholder:text-muted-foreground focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20"
              />
              <p className="mt-1.5 text-right text-xs text-muted-foreground">
                {reason.length}/300
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border p-6 sm:flex-row sm:justify-end">
            <AlertDialog.Close
              render={
                <Button
                  ref={initialFocusRef}
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="h-11 px-5"
                />
              }
            >
              Giữ đơn hàng
            </AlertDialog.Close>
            <Button
              type="submit"
              variant="destructive"
              disabled={loading}
              className="h-11 px-5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang hủy
                </>
              ) : (
                'Xác nhận hủy'
              )}
            </Button>
          </div>
        </form>
      </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export function OrderDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;
  const { user, accessToken } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const authHydrated = useSyncExternalStore(
    subscribeToAuthHydration,
    getAuthHydrationSnapshot,
    () => false,
  );
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [retryingPayment, setRetryingPayment] = useState(false);
  const cancelTriggerRef = useRef<HTMLButtonElement>(null);

  const loadOrder = useCallback(
    async (signal?: AbortSignal) => {
      if (!orderId || signal?.aborted) return;
      setLoading(true);
      setLoadError(false);
      setNotFound(false);

      try {
        const nextOrder = await getOrderDetail(orderId, accessToken, signal);
        setOrder(nextOrder);
      } catch (error) {
        if (signal?.aborted) return;
        setOrder(null);
        if (getOrderErrorStatus(error) === 404) {
          setNotFound(true);
        } else {
          setLoadError(true);
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [accessToken, orderId],
  );

  useEffect(() => {
    if (!authHydrated) return;
    if (!user && !accessToken) {
      router.replace(
        `/account/login?redirect=${encodeURIComponent(`/account/orders/${orderId}`)}`,
      );
      return;
    }

    const controller = new AbortController();
    const loadTimer = window.setTimeout(() => {
      void loadOrder(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(loadTimer);
      controller.abort();
    };
  }, [accessToken, authHydrated, loadOrder, orderId, router, user]);

  const cancellationReason = useMemo(
    () => (order ? getCancellationReason(order) : null),
    [order],
  );

  const handleCancelOrder = async (reason: string) => {
    if (!order) return;
    setCancelling(true);

    try {
      await cancelOrder(order.id, reason, accessToken);
      const cancelledAt = new Date().toISOString();
      const normalizedReason = reason.trim() || null;
      setOrder((current) =>
        current
          ? {
              ...current,
              status: 'CANCELLED',
              cancelledAt,
              cancelReason: normalizedReason,
              statusHistory: [
                {
                  id: `cancelled-${cancelledAt}`,
                  status: 'CANCELLED',
                  note: normalizedReason,
                  createdAt: cancelledAt,
                },
                ...current.statusHistory,
              ],
            }
          : current,
      );
      setCancelDialogOpen(false);
      toast.success('Đã hủy đơn hàng', {
        description: `Đơn ${order.orderNumber} đã được cập nhật.`,
      });

      try {
        const refreshedOrder = await getOrderDetail(order.id, accessToken);
        setOrder(refreshedOrder);
      } catch {
        // The optimistic state already reflects a successful cancellation.
      }
    } catch (error) {
      toast.error('Không thể hủy đơn hàng', {
        description: getOrderErrorMessage(
          error,
          'Trạng thái đơn hàng có thể đã thay đổi. Vui lòng thử lại.',
        ),
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleRetryVnpayPayment = async () => {
    if (!order || !accessToken) return;
    setRetryingPayment(true);
    try {
      const { api } = await import('@/lib/api');
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      const res = await api.post(
        `/payments/vnpay/orders/${encodeURIComponent(order.id)}/create`,
      );
      const paymentUrl = res.data?.data?.paymentUrl as string | undefined;
      if (!paymentUrl) throw new Error('Không nhận được liên kết thanh toán.');
      window.location.assign(paymentUrl);
    } catch (err) {
      const msg =
        typeof err === 'object' &&
        err !== null &&
        'response' in err
          ? (
              err as { response?: { data?: { message?: string } } }
            ).response?.data?.message
          : err instanceof Error
            ? err.message
            : undefined;
      toast.error('Không thể khởi tạo thanh toán VNPay', {
        description: msg ?? 'Vui lòng thử lại sau.',
      });
      setRetryingPayment(false);
    }
  };

  const handleReorder = () => {
    if (!order) return;
    setReordering(true);

    let addedUnits = 0;
    let skippedLines = 0;

    for (const item of order.items) {
      const selection = createReorderSelection(item);
      if (!selection) {
        skippedLines += 1;
        continue;
      }

      const result = addItem(selection.product, selection.variant, item.quantity);
      if (result.success) {
        addedUnits += item.quantity;
      } else {
        skippedLines += 1;
      }
    }

    setReordering(false);

    if (addedUnits === 0) {
      toast.error('Chưa thể đặt lại đơn hàng', {
        description:
          'Các sản phẩm hoặc phiên bản trong đơn hiện không còn đủ hàng.',
      });
      return;
    }

    toast.success(`Đã thêm ${addedUnits} sản phẩm vào giỏ`, {
      description:
        skippedLines > 0
          ? `${skippedLines} sản phẩm tạm hết hàng hoặc không còn bán.`
          : 'Màu sắc, kích cỡ và số lượng đã được giữ theo đơn cũ.',
    });
    router.push('/cart');
  };

  const handleDownloadInvoice = () => {
    const cleanup = () => {
      document.body.classList.remove('invoice-print-mode');
      window.removeEventListener('afterprint', cleanup);
      window.clearTimeout(cleanupTimer);
    };

    document.body.classList.add('invoice-print-mode');
    window.addEventListener('afterprint', cleanup, { once: true });
    const cleanupTimer = window.setTimeout(cleanup, 60_000);
    window.print();
  };

  if (!authHydrated || loading) return <OrderDetailSkeleton />;
  if (notFound || loadError || !order) {
    return (
      <OrderLoadError
        notFound={notFound}
        onRetry={() => void loadOrder()}
      />
    );
  }

  const trackingNumber =
    order.shipping?.trackingNumber || order.trackingNumber || null;
  const trackingUrl = getSafeTrackingUrl(order.shipping?.trackingUrl);
  const estimatedDelivery =
    order.shipping?.estimatedDelivery || order.estimatedDelivery || null;
  const discount = Number(order.discount);
  const tax = Number(order.tax);

  return (
    <main className="min-h-[100dvh] bg-background pb-20 pt-24 md:pt-28">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <Link
          href="/account/orders"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81]/40"
        >
          <ArrowLeft className="h-4 w-4" />
          Trở lại danh sách đơn hàng
        </Link>

        <header className="mt-6 grid gap-6 border-b border-border pb-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm text-muted-foreground">Chi tiết đơn hàng</p>
            <h1 className="mt-2 break-words font-heading text-3xl font-light tracking-tight text-primary md:text-4xl">
              {order.orderNumber}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Đặt lúc {formatOrderDate(order.createdAt)}
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center border px-3 py-2 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </header>

        {order.status === 'CANCELLED' && (
          <section className="mt-8 border border-red-300/70 bg-red-50 p-5 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold">Đơn hàng đã bị hủy</h2>
                <p className="mt-1 text-sm leading-6 text-red-800 dark:text-red-200">
                  {cancellationReason
                    ? `Lý do: ${cancellationReason}`
                    : 'Đơn hàng này không còn được xử lý hoặc giao đến địa chỉ nhận hàng.'}
                </p>
                {order.cancelledAt && (
                  <time
                    dateTime={order.cancelledAt}
                    className="mt-2 block text-xs text-red-700 dark:text-red-300"
                  >
                    Hủy lúc {formatOrderDate(order.cancelledAt)}
                  </time>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="mt-8">
          <OrderTimeline order={order} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
          <div className="space-y-8">
            <section
              aria-labelledby="order-items-heading"
              className="border border-border bg-card p-5 md:p-7"
            >
              <div className="flex items-center justify-between gap-4">
                <h2
                  id="order-items-heading"
                  className="font-heading text-xl font-medium text-primary"
                >
                  Sản phẩm
                </h2>
                <span className="text-sm text-muted-foreground">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                </span>
              </div>

              <div className="mt-5">
                {order.items.map((item, index) => {
                  const image = getOrderItemImage(item);
                  return (
                    <article
                      key={item.id}
                      className={`grid grid-cols-[80px_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[96px_minmax(0,1fr)_auto] ${
                        index > 0 ? 'border-t border-border' : ''
                      }`}
                    >
                      <div className="relative flex h-24 w-20 items-center justify-center overflow-hidden bg-muted sm:h-28 sm:w-24">
                        {image ? (
                          <Image
                            src={image}
                            alt={item.product.images?.[0]?.altText || item.productName}
                            fill
                            sizes="(max-width: 640px) 80px, 96px"
                            className="object-cover object-top"
                          />
                        ) : (
                          <Package
                            className="h-7 w-7 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        {item.product?.slug ? (
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-medium text-primary transition-colors hover:text-[#0F4C81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81]/40"
                          >
                            {item.productName}
                          </Link>
                        ) : (
                          <p className="font-medium text-primary">
                            {item.productName}
                          </p>
                        )}
                        {item.variantName && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.variantName}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          SKU {item.sku}
                        </p>
                        <p className="mt-3 text-sm text-primary sm:hidden">
                          {item.quantity} x {formatPrice(item.unitPrice)}
                        </p>
                      </div>

                      <div className="col-span-2 flex items-center justify-between border-t border-border pt-4 text-sm sm:col-span-1 sm:block sm:border-0 sm:pt-0 sm:text-right">
                        <p className="hidden text-muted-foreground sm:block">
                          {item.quantity} x {formatPrice(item.unitPrice)}
                        </p>
                        <p className="font-semibold text-primary sm:mt-2">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <section
                aria-labelledby="shipping-address-heading"
                className="border border-border bg-card p-5 md:p-6"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#0F4C81] dark:text-[#9CC8EB]" />
                  <h2
                    id="shipping-address-heading"
                    className="font-heading text-lg font-medium text-primary"
                  >
                    Địa chỉ nhận hàng
                  </h2>
                </div>
                <div className="mt-5 text-sm leading-6">
                  <p className="font-semibold text-primary">
                    {order.address.fullName}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {order.address.phone}
                  </p>
                  <address className="mt-2 not-italic text-muted-foreground">
                    {formatAddress(order)}
                  </address>
                </div>
              </section>

              <section
                aria-labelledby="payment-heading"
                className="border border-border bg-card p-5 md:p-6"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-[#0F4C81] dark:text-[#9CC8EB]" />
                  <h2
                    id="payment-heading"
                    className="font-heading text-lg font-medium text-primary"
                  >
                    Thanh toán
                  </h2>
                </div>
                <div className="mt-5 text-sm leading-6">
                  <p className="font-medium text-primary">
                    {order.payment
                      ? PAYMENT_METHOD_LABELS[order.payment.method] ||
                        order.payment.method
                      : 'Chưa có thông tin'}
                  </p>
                  {order.payment && (
                    <p className="mt-1 text-muted-foreground">
                      {PAYMENT_STATUS_LABELS[order.payment.status] ||
                        order.payment.status}
                    </p>
                  )}
                </div>
              </section>
            </div>

            {(trackingNumber || order.shippingMethod || estimatedDelivery) && (
              <section
                aria-labelledby="delivery-heading"
                className="border border-border bg-card p-5 md:p-7"
              >
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-[#0F4C81] dark:text-[#9CC8EB]" />
                  <h2
                    id="delivery-heading"
                    className="font-heading text-lg font-medium text-primary"
                  >
                    Vận chuyển
                  </h2>
                </div>
                <dl className="mt-5 grid grid-cols-1 gap-5 text-sm sm:grid-cols-2">
                  {order.shippingMethod && (
                    <div>
                      <dt className="text-muted-foreground">Phương thức</dt>
                      <dd className="mt-1 font-medium text-primary">
                        {order.shippingMethod.name}
                      </dd>
                    </div>
                  )}
                  {estimatedDelivery && (
                    <div>
                      <dt className="text-muted-foreground">Dự kiến giao</dt>
                      <dd className="mt-1 font-medium text-primary">
                        {formatOrderDate(estimatedDelivery)}
                      </dd>
                    </div>
                  )}
                  {trackingNumber && (
                    <div>
                      <dt className="text-muted-foreground">Mã vận đơn</dt>
                      <dd className="mt-1 font-medium text-primary">
                        {trackingNumber}
                      </dd>
                    </div>
                  )}
                  {order.shipping?.carrier && (
                    <div>
                      <dt className="text-muted-foreground">Đơn vị giao hàng</dt>
                      <dd className="mt-1 font-medium text-primary">
                        {order.shipping.carrier}
                      </dd>
                    </div>
                  )}
                </dl>
                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-[#0F4C81]/40 text-sm font-semibold text-[#0F4C81] transition-colors hover:border-[#0F4C81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81]/40 dark:text-[#9CC8EB]"
                  >
                    Theo dõi trên website vận chuyển
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <section
              aria-labelledby="order-summary-heading"
              className="border border-border bg-card p-5 md:p-6"
            >
              <h2
                id="order-summary-heading"
                className="font-heading text-xl font-medium text-primary"
              >
                Tổng thanh toán
              </h2>

              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Tạm tính</dt>
                  <dd className="font-medium text-primary">
                    {formatPrice(order.subtotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Phí vận chuyển</dt>
                  <dd className="font-medium text-primary">
                    {Number(order.shippingFee) === 0
                      ? 'Miễn phí'
                      : formatPrice(order.shippingFee)}
                  </dd>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">
                      Giảm giá{order.couponCode ? ` (${order.couponCode})` : ''}
                    </dt>
                    <dd className="font-medium text-emerald-700 dark:text-emerald-300">
                      -{formatPrice(discount)}
                    </dd>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Thuế</dt>
                    <dd className="font-medium text-primary">
                      {formatPrice(tax)}
                    </dd>
                  </div>
                )}
                <div className="flex items-end justify-between gap-4 border-t border-border pt-5">
                  <dt className="font-semibold text-primary">Tổng cộng</dt>
                  <dd className="font-heading text-2xl font-semibold text-primary">
                    {formatPrice(order.total)}
                  </dd>
                </div>
              </dl>

              {order.notes && (
                <div className="mt-6 border-t border-border pt-5">
                  <p className="text-xs font-semibold text-primary">
                    Ghi chú đơn hàng
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {order.notes}
                  </p>
                </div>
              )}

              <div className="mt-7 space-y-3">
                <Button
                  variant="outline"
                  onClick={handleDownloadInvoice}
                  className="h-12 w-full px-5"
                >
                  <Download className="h-4 w-4" />
                  Tải hóa đơn PDF
                </Button>

                <Button
                  onClick={handleReorder}
                  disabled={reordering}
                  className="h-12 w-full px-5"
                >
                  {reordering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang thêm vào giỏ
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      Đặt lại đơn này
                    </>
                  )}
                </Button>

                {/* Nút thanh toán lại VNPay */}
                {order.payment?.method === 'VNPAY' &&
                  ['FAILED', 'PENDING', 'PROCESSING'].includes(
                    order.payment.status,
                  ) &&
                  order.status === 'PENDING' && (
                    <Button
                      onClick={() => void handleRetryVnpayPayment()}
                      disabled={retryingPayment}
                      className="h-12 w-full bg-[#0F4C81] px-5 text-white hover:bg-[#0D3F6E]"
                    >
                      {retryingPayment ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang kết nối VNPay...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Thanh toán lại qua VNPay
                        </>
                      )}
                    </Button>
                  )}

                {canCancelOrder(order.status) && (
                  <Button
                    ref={cancelTriggerRef}
                    variant="outline"
                    onClick={() => setCancelDialogOpen(true)}
                    className="h-12 w-full border-red-300 px-5 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
                  >
                    <X className="h-4 w-4" />
                    Hủy đơn hàng
                  </Button>
                )}

                <Link
                  href="/collections"
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'h-11 w-full px-5',
                  )}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Tiếp tục mua sắm
                </Link>
              </div>

              {canCancelOrder(order.status) && (
                <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
                  Bạn có thể hủy trước khi đơn được bàn giao cho đơn vị vận
                  chuyển.
                </p>
              )}

              {(order.status === 'DELIVERED' ||
                order.status === 'COMPLETED') && (
                <div className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  Cảm ơn bạn đã mua sắm tại Achromatic.
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>

      <CancelOrderDialog
        open={cancelDialogOpen}
        orderNumber={order.orderNumber}
        loading={cancelling}
        onCancel={handleCancelOrder}
        finalFocusRef={cancelTriggerRef}
        onClose={() => {
          if (!cancelling) setCancelDialogOpen(false);
        }}
      />

      <OrderInvoice order={order} />
    </main>
  );
}
