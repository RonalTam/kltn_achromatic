import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";

export const metadata: Metadata = {
  title: "Chính sách đổi trả | ACHROMATIC",
  description: "Điều kiện đổi trả sản phẩm tại ACHROMATIC.",
  alternates: { canonical: "/policy/returns" },
};

export default function ReturnsPolicyPage() {
  return (
    <InfoPage
      eyebrow="Policy"
      heroImage="/hero/hero-vietnam-tropical-minimal-2k.png"
      title="Chính sách đổi trả."
      description="ACHROMATIC hỗ trợ đổi trả để bạn yên tâm hơn khi mua sắm online."
      sections={[
        {
          title: "Điều kiện",
          items: [
            "Trong vòng 30 ngày từ ngày nhận hàng.",
            "Sản phẩm chưa qua sử dụng, còn tem nhãn.",
            "Có hóa đơn hoặc thông tin đơn hàng.",
            "Không áp dụng cho sản phẩm lỗi do bảo quản sai hướng dẫn.",
          ],
        },
        {
          title: "Quy trình",
          body: [
            "Liên hệ đội hỗ trợ với mã đơn hàng và hình ảnh sản phẩm. Sau khi xác nhận, chúng tôi sẽ hướng dẫn cách gửi hàng về kho.",
          ],
        },
      ]}
      cta={{ label: "Liên hệ hỗ trợ", href: "/contact" }}
    />
  );
}
