import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | ACHROMATIC",
  description: "Điều khoản khi sử dụng website và dịch vụ của ACHROMATIC.",
  alternates: { canonical: "/policy/terms" },
};

export default function TermsPolicyPage() {
  return (
    <InfoPage
      eyebrow="Policy"
      heroImage="/editorial/vietnam-fashion-bestsellers-2k.png"
      title="Điều khoản sử dụng."
      description="Khi sử dụng website ACHROMATIC, bạn đồng ý với các điều khoản cơ bản về tài khoản, đặt hàng và nội dung hiển thị."
      sections={[
        {
          title: "Tài khoản",
          body: [
            "Bạn chịu trách nhiệm giữ an toàn thông tin đăng nhập và thông báo cho chúng tôi nếu phát hiện hoạt động bất thường.",
          ],
        },
        {
          title: "Đơn hàng",
          body: [
            "ACHROMATIC có quyền liên hệ xác nhận hoặc từ chối đơn hàng nếu thông tin giao hàng không hợp lệ, sản phẩm hết hàng hoặc có dấu hiệu gian lận.",
          ],
        },
        {
          title: "Nội dung",
          body: [
            "Hình ảnh, mô tả và giá bán có thể được cập nhật để phản ánh tình trạng sản phẩm thực tế tại từng thời điểm.",
          ],
        },
      ]}
      cta={{ label: "Quay lại mua sắm", href: "/collections" }}
    />
  );
}
