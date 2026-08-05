import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-5 pt-20">
      <div className="text-center max-w-xl">
        {/* Big 404 */}
        <div className="relative mb-8 select-none">
          <span
            className="font-heading font-light text-[140px] md:text-[200px] leading-none text-[#F0F0F0] tracking-tighter"
            aria-hidden="true"
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium mb-1">
                Không tìm thấy trang
              </p>
              <h1 className="font-heading text-xl md:text-2xl font-light tracking-tight text-primary">
                Trang bạn tìm không tồn tại
              </h1>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-10 leading-relaxed max-w-sm mx-auto">
          Trang bạn đang tìm kiếm đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Trang chủ
          </Link>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 border border-border text-primary px-7 py-3.5 text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-accent transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            Xem sản phẩm
          </Link>
        </div>

        {/* Popular links */}
        <div className="border-t border-border pt-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">
            Có thể bạn đang tìm
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { href: "/collections?category=ao-thun", label: "Áo thun" },
              { href: "/collections?category=quan-jeans", label: "Quần jeans" },
              { href: "/collections?category=ao-khoac", label: "Áo khoác" },
              { href: "/collections?category=phu-kien", label: "Phụ kiện" },
              { href: "/account", label: "Tài khoản" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3 rotate-180" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
