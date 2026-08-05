import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";

export const metadata: Metadata = {
  title: "FAQ | ACHROMATIC",
  description: "Câu hỏi thường gặp về đặt hàng, thanh toán, giao hàng và đổi trả.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <InfoPage
      eyebrow="FAQ"
      heroImage="/page-headers/vietnam-faq-styling-header-2k.png"
      title="Những câu hỏi thường gặp."
      description="Một số thông tin nhanh để bạn đặt hàng dễ hơn trước khi cần liên hệ đội hỗ trợ."
      sections={[
        {
          title: "Đặt hàng",
          body: [
            "Bạn có thể thêm sản phẩm vào giỏ hàng, đăng nhập hoặc tạo tài khoản, sau đó hoàn tất thông tin giao hàng tại checkout.",
            "Sau khi đặt hàng thành công, đơn sẽ xuất hiện trong mục tài khoản của bạn.",
          ],
        },
        {
          title: "Thanh toán",
          body: [
            "Hiện website hỗ trợ thanh toán khi nhận hàng và chuyển khoản ngân hàng. Các ví điện tử sẽ được hiển thị khi được tích hợp chính thức.",
          ],
        },
        {
          title: "Giao hàng",
          body: [
            "Đơn từ 500.000đ được miễn phí vận chuyển. Các đơn nhỏ hơn áp dụng phí vận chuyển mặc định 30.000đ.",
          ],
        },
      ]}
      cta={{ label: "Mua sắm ngay", href: "/collections" }}
    />
  );
}
