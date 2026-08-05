import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";

export const metadata: Metadata = {
  title: "Liên hệ | ACHROMATIC",
  description: "Thông tin liên hệ và hỗ trợ khách hàng của ACHROMATIC.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      heroImage="/page-headers/vietnam-customer-care-header-2k.png"
      title="Chúng tôi sẵn sàng hỗ trợ đơn hàng, size và đổi trả."
      description="Bạn có thể liên hệ ACHROMATIC trong khung giờ làm việc hoặc gửi email bất cứ lúc nào."
      sections={[
        {
          title: "Kênh hỗ trợ",
          items: [
            "Email: hello@achromatic.vn",
            "Hotline: 1800 6868",
            "Địa chỉ: 123 Lê Lợi, Quận 1, TP.HCM",
            "Thời gian: 9:00 - 21:00 hằng ngày",
          ],
        },
        {
          title: "Khi liên hệ",
          body: [
            "Vui lòng cung cấp mã đơn hàng, số điện thoại đặt hàng hoặc tên sản phẩm để đội hỗ trợ kiểm tra nhanh hơn.",
          ],
        },
      ]}
      cta={{ label: "Theo dõi đơn hàng", href: "/track-order" }}
    />
  );
}
