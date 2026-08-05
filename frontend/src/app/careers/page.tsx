import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";

export const metadata: Metadata = {
  title: "Tuyển dụng | ACHROMATIC",
  description:
    "Cơ hội tham gia đội ngũ vận hành, bán hàng, nội dung và thiết kế của ACHROMATIC.",
  alternates: { canonical: "/careers" },
};

export default function CareersPage() {
  return (
    <InfoPage
      eyebrow="Careers"
      heroImage="/page-headers/vietnam-careers-team-header-2k.png"
      title="Cùng xây một thương hiệu thời trang Việt chỉn chu hơn mỗi ngày."
      description="ACHROMATIC đang mở rộng đội ngũ vận hành thương mại điện tử, nội dung và chăm sóc khách hàng."
      sections={[
        {
          title: "Vị trí quan tâm",
          items: [
            "E-commerce Operations",
            "Customer Care",
            "Content & Styling",
            "Retail Assistant",
          ],
        },
        {
          title: "Cách ứng tuyển",
          body: [
            "Gửi CV hoặc portfolio về hello@achromatic.vn với tiêu đề: Ứng tuyển - Vị trí - Họ tên.",
            "Chúng tôi ưu tiên ứng viên có gu thẩm mỹ gọn, cẩn thận với chi tiết và quen làm việc với dữ liệu sản phẩm.",
          ],
        },
      ]}
      cta={{ label: "Liên hệ", href: "/contact" }}
    />
  );
}
