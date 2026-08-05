import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";

export const metadata: Metadata = {
  title: "Theo dõi đơn hàng | ACHROMATIC",
  description: "Theo dõi trạng thái đơn hàng ACHROMATIC trong tài khoản khách hàng.",
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderPage() {
  return (
    <InfoPage
      eyebrow="Order Tracking"
      heroImage="/page-headers/vietnam-order-fulfillment-header-2k.png"
      title="Theo dõi trạng thái đơn hàng trong tài khoản của bạn."
      description="Để bảo mật thông tin giao hàng, lịch sử đơn hàng chỉ hiển thị sau khi bạn đăng nhập bằng email đã dùng khi đặt hàng."
      sections={[
        {
          title: "Cách xem đơn",
          body: [
            "Đăng nhập tài khoản, mở mục Đơn hàng và chọn đơn cần theo dõi. Nếu vừa đặt hàng thành công, hệ thống sẽ đưa bạn tới danh sách đơn.",
          ],
        },
        {
          title: "Trạng thái",
          items: [
            "Chờ xác nhận",
            "Đã xác nhận",
            "Đang chuẩn bị hàng",
            "Đang giao hàng",
            "Đã giao hàng",
            "Đã hủy",
          ],
        },
      ]}
      cta={{ label: "Vào đơn hàng của tôi", href: "/account/orders" }}
    />
  );
}
