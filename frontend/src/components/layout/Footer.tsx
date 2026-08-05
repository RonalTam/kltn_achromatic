"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SizeGuideModal } from "@/components/common/SizeGuideModal";
import { api } from "@/lib/api";

// Social Media SVG Icons (lucide-react v1.18 doesn't include these)
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.19a8.16 8.16 0 0 0 4.77 1.52V7.27a4.85 4.85 0 0 1-1-.58z" />
    </svg>
  );
}

const socials = [
  { Icon: FacebookIcon, href: "https://facebook.com/achromatic.vn", label: "Facebook" },
  { Icon: InstagramIcon, href: "https://instagram.com/achromatic.vn", label: "Instagram" },
  { Icon: YoutubeIcon, href: "https://youtube.com/@achromatic", label: "YouTube" },
  { Icon: TikTokIcon, href: "https://tiktok.com/@achromatic.vn", label: "TikTok" },
];

const footerLinks = {
  about: {
    title: "Giới Thiệu",
    items: [
      { label: "Về Chúng Tôi", href: "/about" },
      { label: "Câu Chuyện Thương Hiệu", href: "/about" },
      { label: "Xưởng Sản Xuất", href: "/about" },
      { label: "Tuyển Dụng", href: "/careers" },
    ],
  },
  policy: {
    title: "Chính Sách",
    items: [
      { label: "Chính Sách Đổi Trả", href: "/policy/returns" },
      { label: "Chính Sách Giao Hàng", href: "/policy/shipping" },
      { label: "Bảo Mật Thông Tin", href: "/policy/privacy" },
      { label: "Điều Khoản Sử Dụng", href: "/policy/terms" },
    ],
  },
  support: {
    title: "Hỗ Trợ",
    items: [
      { label: "FAQ", href: "/faq" },
      { label: "Hướng Dẫn Chọn Size", href: "/size-guide" },
      { label: "Theo Dõi Đơn Hàng", href: "/track-order" },
      { label: "Liên Hệ", href: "/contact" },
    ],
  },
  contact: {
    title: "Liên Hệ",
    items: [
      { label: "📧 hello@achromatic.vn", href: "mailto:hello@achromatic.vn" },
      { label: "📞 1800 6868", href: "tel:18006868" },
      { label: "📍 123 Lê Lợi, Q1, TP.HCM", href: "#" },
      { label: "⏰ 9:00 - 21:00 hằng ngày", href: "#" },
    ],
  },
};

const paymentMethods = ["COD", "Bank Transfer"];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || subscribing) return;
    setSubscribing(true);
    setSubscribeError("");
    try {
      await api.post("/newsletter/subscribe", { email });
      setSubscribed(true);
      setEmail("");
    } catch {
      setSubscribeError("Không thể đăng ký lúc này. Vui lòng thử lại.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#0A0A0A] text-white" id="footer">
      {/* Main Footer Grid */}
      <div className="section-padding pt-16 md:pt-20 pb-12">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-6">
            {/* Brand Column — spans 2 cols */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <Link
                href="/"
                className="font-heading text-xl tracking-[0.15em] uppercase text-white block mb-4"
              >
                ACHROMATIC
              </Link>
              <p className="font-sans text-xs text-white/60 leading-relaxed mb-6 max-w-xs">
                Thương hiệu thời trang tối giản cao cấp Việt Nam. Mỗi thiết kế là một tuyên ngôn về sự tinh tế và phong cách sống hiện đại.
              </p>

              {/* Socials */}
              <div className="flex gap-3">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-11 items-center justify-center border border-white/30 text-white/70 transition-all duration-200 hover:border-white/60 hover:text-white"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>

              {/* Newsletter Mini */}
              <div className="mt-8">
                <p className="label-xs text-white/70 mb-3">Nhận ưu đãi qua email</p>
                {subscribed ? (
                  <p className="font-sans text-xs text-[#82BCE8]">✓ Đã đăng ký thành công!</p>
                ) : (
                  <>
                    <form onSubmit={handleSubmit} className="flex">
                      <label htmlFor="footer-newsletter-email" className="sr-only">
                        Email nhận ưu đãi
                      </label>
                      <input
                        id="footer-newsletter-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email của bạn"
                        required
                        autoComplete="email"
                        aria-describedby={
                          subscribeError ? "footer-newsletter-error" : undefined
                        }
                        className="min-h-11 min-w-0 flex-1 border border-white/30 bg-white/5 px-3 py-2.5 font-sans text-xs text-white outline-none transition-colors placeholder:text-white/50 focus:border-white/60"
                      />
                      <button
                        type="submit"
                        disabled={subscribing}
                        aria-busy={subscribing}
                        className="flex size-11 items-center justify-center bg-white text-[#111111] transition-colors hover:bg-white/90 disabled:opacity-70"
                        aria-label="Đăng ký nhận ưu đãi"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                    {subscribeError && (
                      <p
                        id="footer-newsletter-error"
                        className="mt-2 text-xs text-[#FFB4B4]"
                        role="alert"
                      >
                        {subscribeError}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Nav Columns */}
            {[footerLinks.about, footerLinks.policy, footerLinks.support, footerLinks.contact].map(
              (col) => (
                <div key={col.title}>
                  <h4 className="label-xs text-white/70 mb-5">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.items.map((item) => (
                      <li key={item.label}>
                        {item.href === "/size-guide" ? (
                          <button
                            type="button"
                            onClick={() => setSizeGuideOpen(true)}
                            className="inline-flex min-h-11 items-center text-left font-sans text-xs leading-relaxed text-white/60 transition-colors hover:text-white"
                          >
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            className="inline-flex min-h-11 items-center font-sans text-xs leading-relaxed text-white/60 transition-colors hover:text-white"
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 section-padding py-6">
        <div className="container-max flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="label-xs text-white/60">
            © {new Date().getFullYear()} ACHROMATIC. Bảo lưu mọi quyền. Được thiết kế tại Việt Nam 🇻🇳
          </p>

          {/* Payment Methods */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="border border-white/30 px-2 py-1 font-sans text-[9px] text-white/60 uppercase tracking-wide"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </footer>
  );
}
