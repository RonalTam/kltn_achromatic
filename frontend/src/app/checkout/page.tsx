"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, ChevronRight, Loader2, ShieldCheck } from 'lucide-react';
import {
  getCartItemAvailableStock,
  useCartStore,
} from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeading } from '@/components/common/PageHeading';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, accessToken } = useAuthStore();
  const [storesHydrated, setStoresHydrated] = useState(false);
  // Prevents the "cart empty → /cart" redirect from firing when we're about
  // to hand off control to the VNPay gateway (clearCart fires first).
  const isRedirectingToPayment = useRef(false);

  const [formData, setFormData] = useState({
    email: user?.email ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: '',
    addressLine1: '',
    district: '',
    province: '',
    country: 'Việt Nam',
    paymentMethod: 'COD',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: string;
    discount: number;
  } | null>(null);

  const subtotal = getTotal();
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const effectiveShipping =
    appliedCoupon?.type === 'FREE_SHIPPING' ? 0 : shipping;
  const discount =
    (appliedCoupon?.discount ?? 0) +
    (appliedCoupon?.type === 'FREE_SHIPPING' ? shipping : 0);
  const total = Math.max(0, subtotal + shipping - discount);
  const stockIssue = items.find((item) => {
    const availableStock = getCartItemAvailableStock(item);
    return availableStock !== null && item.quantity > availableStock;
  });
  const stockErrorMessage = stockIssue
    ? `${stockIssue.product.name} chỉ còn ${getCartItemAvailableStock(stockIssue) ?? 0} sản phẩm trong kho.`
    : '';

  useEffect(() => {
    const updateHydrationState = () => {
      setStoresHydrated(
        useAuthStore.persist.hasHydrated() &&
          useCartStore.persist.hasHydrated(),
      );
    };
    const unsubscribeAuth =
      useAuthStore.persist.onFinishHydration(updateHydrationState);
    const unsubscribeCart =
      useCartStore.persist.onFinishHydration(updateHydrationState);
    updateHydrationState();

    return () => {
      unsubscribeAuth();
      unsubscribeCart();
    };
  }, []);

  // Redirect to login immediately if not authenticated
  useEffect(() => {
    if (storesHydrated && !user && !accessToken) {
      router.replace('/account/login?redirect=/checkout');
    }
  }, [user, accessToken, router, storesHydrated]);

  useEffect(() => {
    if (isRedirectingToPayment.current) return;
    if (storesHydrated && items.length === 0) router.replace('/cart');
  }, [items.length, router, storesHydrated]);

  useEffect(() => {
    if (!user) return;
    const frame = requestAnimationFrame(() => {
      setFormData((current) => ({
        ...current,
        email: current.email || user.email,
        firstName: current.firstName || user.firstName,
        lastName: current.lastName || user.lastName,
      }));
    });
    return () => cancelAnimationFrame(frame);
  }, [user]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const applyCoupon = async () => {
    const normalizedCode = couponCode.trim().toUpperCase();
    if (!normalizedCode || !accessToken) return;
    setCouponLoading(true);
    setCouponMessage('');
    try {
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      const response = await api.get('/coupons/validate', {
        params: { code: normalizedCode, amount: subtotal },
      });
      const result = response.data?.data;
      if (!result?.coupon?.code) {
        throw new Error('Mã giảm giá không hợp lệ.');
      }
      setAppliedCoupon({
        code: result.coupon.code,
        type: result.coupon.type,
        discount: Number(result.discount ?? 0),
      });
      setCouponCode(result.coupon.code);
      setCouponMessage('Đã áp dụng mã giảm giá.');
    } catch (couponError) {
      setAppliedCoupon(null);
      const message =
        typeof couponError === 'object' &&
        couponError !== null &&
        'response' in couponError
          ? (
              couponError as {
                response?: { data?: { message?: string } };
              }
            ).response?.data?.message
          : undefined;
      setCouponMessage(message || 'Không thể áp dụng mã giảm giá.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user || !accessToken) {
      router.push('/account/login?redirect=/checkout');
      return;
    }

    if (stockErrorMessage) {
      setError(stockErrorMessage);
      return;
    }

    setLoading(true);

    try {
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const addressRes = await api.post('/users/me/addresses', {
        fullName: `${formData.lastName} ${formData.firstName}`.trim(),
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        district: formData.district,
        province: formData.province,
        country: formData.country,
        isDefault: true,
      });
      const addressId = addressRes.data?.data?.id;
      if (!addressId) throw new Error('Không tạo được địa chỉ giao hàng');

      await api.delete('/cart').catch(() => undefined);
      await Promise.all(
        items.map((item) =>
          api.post('/cart/items', {
            productId: item.productId,
            variantId: item.variantId ?? undefined,
            quantity: item.quantity,
          }),
        ),
      );

      const orderRes = await api.post('/orders/checkout', {
        addressId,
        paymentMethod: formData.paymentMethod,
        couponCode: appliedCoupon?.code,
      });
      const orderId = orderRes.data?.data?.id;
      const orderNumber = orderRes.data?.data?.orderNumber;

      if (formData.paymentMethod === 'VNPAY' && orderId) {
        try {
          const paymentRes = await api.post(
            `/payments/vnpay/orders/${encodeURIComponent(orderId)}/create`,
          );
          const paymentUrl = paymentRes.data?.data?.paymentUrl;
          if (!paymentUrl) {
            throw new Error('Không nhận được liên kết thanh toán VNPay.');
          }
          isRedirectingToPayment.current = true;
          clearCart();
          window.location.assign(paymentUrl);
          return;
        } catch (paymentError) {
          clearCart();
          const paymentMessage =
            paymentError instanceof Error
              ? paymentError.message
              : 'Không thể khởi tạo VNPay.';
          toast.error('Đơn hàng đã tạo nhưng chưa thanh toán', {
            description: paymentMessage,
            duration: 6000,
          });
          router.push(`/account/orders/${orderId}`);
          return;
        }
      }

      clearCart();
      toast.success('Đặt hàng thành công!', {
        description: orderNumber ? `Mã đơn hàng: ${orderNumber}` : 'Đơn hàng của bạn đã được xác nhận.',
        duration: 5000,
      });
      router.push(`/account/orders${orderNumber ? `?success=${orderNumber}` : '?success=true'}`);
    } catch (err: unknown) {
      const responseMessage =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (err as { response: { data: { message: string } } }).response.data.message
          : null;
      const errMsg =
        responseMessage ||
          (err instanceof Error ? err.message : 'Không thể đặt hàng. Vui lòng thử lại.');
      setError(errMsg);
      toast.error('Đặt hàng thất bại', { description: errMsg, duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  if (!storesHydrated || items.length === 0) return null;

  return (
    <div className="mx-auto min-h-[100dvh] max-w-[1440px] bg-background px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-24 sm:px-5 md:px-10 md:pt-28 lg:px-20">
      <PageHeading
        title="Thanh Toán"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Giỏ hàng', href: '/cart' },
          { label: 'Thanh toán' },
        ]}
        className="mb-10"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Phần Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Thông tin liên hệ */}
            <section className="border border-border p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold font-heading">
                  1
                </div>
                <h2 className="font-heading text-base uppercase tracking-wide text-primary sm:text-lg">
                  Thông Tin Liên Hệ
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Địa chỉ email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="email"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Họ *
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      autoComplete="family-name"
                      placeholder="Nguyễn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Tên *
                    </label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      autoComplete="given-name"
                      placeholder="Văn A"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Số điện thoại *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="0912 345 678"
                  />
                </div>
              </div>
            </section>

            {/* Địa chỉ giao hàng */}
            <section className="border border-border p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold font-heading">
                  2
                </div>
                <h2 className="font-heading text-base uppercase tracking-wide text-primary sm:text-lg">
                  Địa Chỉ Giao Hàng
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Địa chỉ *
                  </label>
                  <Input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    required
                    autoComplete="street-address"
                    placeholder="Số nhà, tên đường, phường/xã"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Quận/Huyện *
                    </label>
                    <Input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      autoComplete="address-level2"
                      placeholder="Quận 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <Input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                      autoComplete="address-level1"
                      placeholder="TP. Hồ Chí Minh"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Quốc gia
                  </label>
                  <Input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled
                    autoComplete="country-name"
                    className="bg-accent cursor-not-allowed"
                  />
                </div>
              </div>
            </section>

            {/* Phương thức thanh toán */}
            <section className="border border-border p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold font-heading">
                  3
                </div>
                <h2 className="font-heading text-base uppercase tracking-wide text-primary sm:text-lg">
                  Phương Thức Thanh Toán
                </h2>
              </div>

              <div className="space-y-3">
                <label className={`flex min-h-11 cursor-pointer items-start gap-3 border p-4 transition-colors sm:items-center sm:gap-4 ${formData.paymentMethod === 'COD' ? 'border-primary bg-accent' : 'border-border hover:bg-accent'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <Truck className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-primary">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Trả tiền mặt khi nhận được hàng</p>
                  </div>
                </label>

                <label className={`flex min-h-11 cursor-pointer items-start gap-3 border p-4 transition-colors sm:items-center sm:gap-4 ${formData.paymentMethod === 'BANK_TRANSFER' ? 'border-primary bg-accent' : 'border-border hover:bg-accent'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK_TRANSFER"
                    checked={formData.paymentMethod === 'BANK_TRANSFER'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <CreditCard className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-primary">Chuyển khoản ngân hàng</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Chuyển khoản trực tiếp vào tài khoản ngân hàng của chúng tôi</p>
                  </div>
                </label>
                <label className={`flex min-h-11 cursor-pointer items-start gap-3 border p-4 transition-colors sm:items-center sm:gap-4 ${formData.paymentMethod === 'VNPAY' ? 'border-primary bg-accent' : 'border-border hover:bg-accent'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={formData.paymentMethod === 'VNPAY'}
                    onChange={handleInputChange}
                    className="size-4"
                  />
                  <CreditCard className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">VNPay Sandbox</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Thanh toán trực tuyến qua môi trường thử nghiệm VNPay
                    </p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="border border-border bg-card p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="font-heading text-lg uppercase tracking-wide text-primary mb-6">
                Tóm Tắt Đơn Hàng
              </h2>

              {/* Danh sách sản phẩm */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => {
                  const price = Number(item.variant?.price ?? item.product.basePrice);
                  const primaryImage = item.product.images?.[0]?.url ?? '';

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-[4.5rem] w-14 flex-shrink-0 overflow-hidden border border-border bg-accent sm:h-20 sm:w-16">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={item.product.name}
                            fill
                            sizes="64px"
                            className="object-cover object-top"
                          />
                        ) : null}
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="font-medium text-primary line-clamp-2">
                          {item.product.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {[item.variant.color?.name, item.variant.size?.name].filter(Boolean).join(' / ')}
                          </p>
                        )}
                        <p className="font-semibold text-primary mt-1">
                          {formatPrice(price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mb-6 border-t border-border pt-4">
                <label
                  htmlFor="checkout-coupon"
                  className="mb-2 block text-sm font-medium text-primary"
                >
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <Input
                    id="checkout-coupon"
                    value={couponCode}
                    onChange={(event) => {
                      setCouponCode(event.target.value.toUpperCase());
                      setCouponMessage('');
                    }}
                    placeholder="Nhập mã"
                    autoComplete="off"
                    disabled={couponLoading}
                    aria-describedby={
                      couponMessage ? 'checkout-coupon-message' : undefined
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    aria-busy={couponLoading}
                    className="min-h-11 shrink-0"
                  >
                    {couponLoading ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      'Áp dụng'
                    )}
                  </Button>
                </div>
                {couponMessage && (
                  <p
                    id="checkout-coupon-message"
                    className={`mt-2 text-xs ${
                      appliedCoupon ? 'text-green-700' : 'text-destructive'
                    }`}
                    role="status"
                  >
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Tổng tiền */}
              <div className="space-y-3 mb-6 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-semibold text-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="font-semibold text-primary">
                    {effectiveShipping === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatPrice(effectiveShipping)
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Giảm giá{appliedCoupon ? ` (${appliedCoupon.code})` : ''}
                    </span>
                    <span className="font-semibold text-green-700">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-heading text-base uppercase tracking-wide text-primary">
                    Tổng cộng
                  </span>
                  <span className="font-sans text-2xl font-bold text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={loading || Boolean(stockErrorMessage)}
                  className="w-full h-12 font-heading text-sm tracking-wider uppercase"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Đặt Hàng
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => router.push('/cart')}
                  className="w-full h-12 font-heading text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground"
                >
                  Hủy và quay lại giỏ hàng
                </Button>
              </div>

              {error && (
                <p className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-center text-xs text-destructive">
                  {error}
                </p>
              )}

              {!error && stockErrorMessage && (
                <p className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-center text-xs text-destructive">
                  {stockErrorMessage} Vui lòng quay lại giỏ hàng để điều chỉnh số lượng.
                </p>
              )}

              <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Thông tin của bạn được bảo mật
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
