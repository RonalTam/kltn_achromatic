import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";

export const metadata: Metadata = {
  title: "Về ACHROMATIC | Thời trang tối giản Việt Nam",
  description:
    "Tìm hiểu câu chuyện thương hiệu, tinh thần thiết kế và tiêu chuẩn sản xuất của ACHROMATIC.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="ACHROMATIC"
      heroImage="/page-headers/vietnam-brand-studio-header-2k.png"
      title="Thời trang tối giản cho nhịp sống hiện đại."
      description="ACHROMATIC theo đuổi phom dáng gọn, bảng màu tiết chế và chất liệu dễ mặc trong khí hậu Việt Nam. Mỗi sản phẩm được xây để đi cùng tủ đồ lâu dài, không chỉ cho một mùa."
      sections={[
        {
          title: "Tinh thần",
          body: [
            "Chúng tôi tập trung vào các thiết kế có thể phối linh hoạt: áo thun, polo, sơ mi, quần và phụ kiện với đường nét sạch, ít chi tiết thừa.",
            "Mục tiêu là giúp khách hàng mặc đẹp mỗi ngày mà không cần suy nghĩ quá nhiều.",
          ],
        },
        {
          title: "Sản xuất",
          body: [
            "Các mẫu được phát triển theo từng đợt nhỏ để kiểm soát chất lượng, màu sắc và độ ổn định của phom.",
            "Mỗi sản phẩm cần có thông tin chất liệu, hướng dẫn bảo quản và tồn kho rõ ràng trước khi lên kệ.",
          ],
        },
        {
          title: "Cam kết",
          items: [
            "Đổi trả trong 30 ngày theo chính sách.",
            "Miễn phí vận chuyển cho đơn từ 500.000đ.",
            "Hỗ trợ chọn size trước khi đặt hàng.",
            "Dữ liệu khách hàng được bảo mật.",
          ],
        },
      ]}
      cta={{ label: "Xem bộ sưu tập", href: "/collections" }}
    />
  );
}
