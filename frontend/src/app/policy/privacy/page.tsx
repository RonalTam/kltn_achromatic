import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";

export const metadata: Metadata = {
  title: "Bảo mật thông tin | ACHROMATIC",
  description: "Cách ACHROMATIC thu thập và bảo vệ thông tin khách hàng.",
  alternates: { canonical: "/policy/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      eyebrow="Policy"
      heroImage="/hero/hero-vietnam-city-blue-2k.png"
      title="Bảo mật thông tin."
      description="Chúng tôi chỉ sử dụng thông tin khách hàng để xử lý đơn hàng, hỗ trợ sau bán và cải thiện trải nghiệm mua sắm."
      sections={[
        {
          title: "Dữ liệu sử dụng",
          items: [
            "Thông tin tài khoản và liên hệ.",
            "Địa chỉ giao hàng.",
            "Lịch sử đơn hàng.",
            "Tương tác với website.",
          ],
        },
        {
          title: "Cam kết",
          body: [
            "ACHROMATIC không bán dữ liệu cá nhân của khách hàng. Việc chia sẻ thông tin với đối tác vận chuyển chỉ nhằm hoàn tất giao hàng.",
          ],
        },
      ]}
      cta={{ label: "Quản lý tài khoản", href: "/account" }}
    />
  );
}
