import type { Metadata } from "next";
import { Inter, Be_Vietnam_Pro } from "next/font/google";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";
import { TawkChat } from "@/components/layout/TawkChat";
import { ChatWidget } from "@/features/chat/ChatWidget";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "ACHROMATIC | Thời Trang Tối Giản Cao Cấp Việt Nam",
  description:
    "ACHROMATIC là thương hiệu thời trang tối giản cao cấp Việt Nam. Khám phá bộ sưu tập áo polo, áo thun, sơ mi, quần và phụ kiện dành cho người hiện đại.",
  keywords: [
    "thời trang tối giản",
    "thời trang cao cấp Việt Nam",
    "ACHROMATIC",
    "áo polo",
    "áo thun",
    "sơ mi",
    "luxury fashion Vietnam",
  ],
  authors: [{ name: "ACHROMATIC" }],
  creator: "ACHROMATIC",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "ACHROMATIC",
    title: "ACHROMATIC | Thời Trang Tối Giản Cao Cấp",
    description:
      "Khám phá bộ sưu tập thời trang tối giản cao cấp. Dành cho người hiện đại, yêu thích sự đơn giản và tinh tế.",
    images: [
      {
        url: "/hero/hero-vietnam-city-blue-2k.png",
        width: 1200,
        height: 630,
        alt: "Bộ sưu tập thời trang tối giản ACHROMATIC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ACHROMATIC | Thời Trang Tối Giản Cao Cấp",
    description: "Khám phá bộ sưu tập thời trang tối giản cao cấp Việt Nam.",
    images: ["/hero/hero-vietnam-city-blue-2k.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body
        className={`${inter.variable} ${beVietnamPro.variable} antialiased min-h-[100dvh] flex flex-col bg-white text-[#111111]`}
      >
        <QueryProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                fontSize: '14px',
                borderRadius: '2px',
              },
            }}
          />
          <TawkChat />
          <ChatWidget />
        </QueryProvider>
      </body>
    </html>
  );
}
