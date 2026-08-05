import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giỏ hàng | ACHROMATIC",
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
