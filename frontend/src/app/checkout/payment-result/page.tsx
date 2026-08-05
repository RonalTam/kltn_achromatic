import { Suspense } from 'react';
import { PaymentResultClient } from './PaymentResultClient';

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div
          className="mx-auto my-24 h-72 w-[min(92vw,576px)] animate-pulse bg-accent"
          aria-label="Đang tải kết quả thanh toán"
        />
      }
    >
      <PaymentResultClient />
    </Suspense>
  );
}
