import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";

export const metadata: Metadata = {
  title: "Chính sách giao hàng | ACHROMATIC",
  description: "Thông tin phí vận chuyển và thời gian giao hàng của ACHROMATIC.",
  alternates: { canonical: "/policy/shipping" },
};

export default function ShippingPolicyPage() {
  return (
    <InfoPage
      eyebrow="Policy"
      heroImage="/editorial/vietnam-fashion-new-arrivals-2k.png"
      title="Chính sách giao hàng."
      description="Đơn hàng được xử lý trong ngày làm việc và bàn giao cho đơn vị vận chuyển sau khi xác nhận."
      sections={[
        {
          title: "Phí vận chuyển",
          items: [
            "Miễn phí cho đơn từ 500.000đ.",
            "Phí mặc định 30.000đ cho đơn dưới 500.000đ.",
          ],
        },
        {
          title: "Thời gian dự kiến",
          body: [
            "Nội thành TP.HCM thường từ 1-2 ngày làm việc. Các tỉnh thành khác thường từ 2-5 ngày làm việc tùy khu vực.",
          ],
        },
      ]}
      cta={{ label: "Xem sản phẩm", href: "/collections" }}
    />
  );
}
