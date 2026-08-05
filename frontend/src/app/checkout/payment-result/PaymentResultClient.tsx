"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function PaymentResultClient() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const success = status === 'success';

  return (
    <main className="flex min-h-[70dvh] items-center justify-center px-4 py-24">
      <section
        className="w-full max-w-xl border border-border bg-background p-7 text-center sm:p-10"
        aria-labelledby="payment-result-title"
      >
        <div
          className={`mx-auto flex size-14 items-center justify-center ${
            success ? 'bg-green-700 text-white' : 'bg-destructive text-white'
          }`}
        >
          {success ? (
            <CheckCircle2 className="size-7" aria-hidden="true" />
          ) : (
            <AlertCircle className="size-7" aria-hidden="true" />
          )}
        </div>
        <h1
          id="payment-result-title"
          className="mt-6 font-heading text-2xl font-light tracking-tight sm:text-3xl"
        >
          {success ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất'}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
          {success
            ? `Đơn hàng ${orderNumber || ''} đã được VNPay xác nhận.`
            : 'Giao dịch không thành công hoặc thông tin phản hồi không hợp lệ. Bạn có thể kiểm tra lại đơn hàng.'}
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href={orderId ? `/account/orders/${orderId}` : '/account/orders'}
            className="inline-flex min-h-12 items-center justify-center bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Xem đơn hàng
          </Link>
          <Link
            href="/collections"
            className="inline-flex min-h-12 items-center justify-center border border-primary px-5 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    </main>
  );
}
