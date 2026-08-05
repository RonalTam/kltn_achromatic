import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";

export const metadata: Metadata = {
  title: "Hướng dẫn chọn size | ACHROMATIC",
  description:
    "Hướng dẫn chọn size áo, quần và phụ kiện khi mua sắm tại ACHROMATIC.",
  alternates: { canonical: "/size-guide" },
};

export default function SizeGuidePage() {
  return (
    <InfoPage
      eyebrow="Size Guide"
      heroImage="/page-headers/vietnam-fit-policy-header-2k.png"
      title="Chọn size theo số đo cơ thể và phom mặc mong muốn."
      description="Nếu bạn đang ở giữa hai size, hãy chọn size lớn hơn nếu muốn mặc thoải mái, hoặc size nhỏ hơn nếu thích phom gọn."
      sections={[
        {
          title: "Áo",
          items: [
            "S: 48-52kg, cao 1m60-1m68",
            "M: 53-60kg, cao 1m65-1m73",
            "L: 61-70kg, cao 1m70-1m78",
            "XL: 71-82kg, cao 1m75-1m85",
          ],
        },
        {
          title: "Quần",
          items: [
            "S: eo 68-74cm",
            "M: eo 75-80cm",
            "L: eo 81-88cm",
            "XL: eo 89-96cm",
          ],
        },
        {
          title: "Cần hỗ trợ",
          body: [
            "Gửi chiều cao, cân nặng và sản phẩm bạn quan tâm qua email hoặc hotline. Đội hỗ trợ sẽ gợi ý size trước khi bạn đặt hàng.",
          ],
        },
      ]}
      cta={{ label: "Liên hệ tư vấn", href: "/contact" }}
    />
  );
}
