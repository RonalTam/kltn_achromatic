import type { Metadata } from 'next';
import { OrderDetailClient } from '@/features/orders/OrderDetailClient';

export const metadata: Metadata = {
  title: 'Chi tiết đơn hàng | Achromatic',
  description: 'Theo dõi trạng thái và xem chi tiết đơn hàng của bạn.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderDetailPage() {
  return <OrderDetailClient />;
}

