"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Heart, ShoppingBag, Search, User, Menu, X } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { useWishlist } from "@/features/wishlist/use-wishlist";

type NavItem = {
  label: string;
  href: string;
  category?: string;
};

const navItems: NavItem[] = [
  { label: "Áo Thun", href: "/collections?category=ao-thun", category: "ao-thun" },
  { label: "Sơ Mi", href: "/collections?category=ao-so-mi", category: "ao-so-mi" },
  { label: "Quần Jeans", href: "/collections?category=quan-jeans", category: "quan-jeans" },
  { label: "Quần Tây", href: "/collections?category=quan-tay", category: "quan-tay" },
  { label: "Phụ Kiện", href: "/collections?category=phu-kien", category: "phu-kien" },
  { label: "Thông Tin", href: "/about" },
];

export function Header() {
  return (
    <Suspense fallback={<HeaderContent activeCategory={null} currentQuery="" />}>
      <HeaderWithSearchParams />
    </Suspense>
  );
}

function HeaderWithSearchParams() {
  const searchParams = useSearchParams();

  return (
    <HeaderContent
      activeCategory={searchParams.get("category")}
      currentQuery={searchParams.get("q") ?? ""}
    />
  );
}

function HeaderContent({
  activeCategory,
  currentQuery,
}: {
  activeCategory: string | null;
  currentQuery: string;
}) {
  const { openCart, items } = useCartStore();
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const { count: wishlistCount } = useWishlist({ enabled: !isAdminRoute });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const nextScrolled = latest > 60;
    setScrolled((current) => (current === nextScrolled ? current : nextScrolled));
  });

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMobileMenuOpen(false);
      setSearchOpen(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  const isHome = pathname === "/";
  const useDarkHeaderContent =
    scrolled || !isHome || mobileMenuOpen || searchOpen;

  const isNavItemActive = (item: NavItem) =>
    item.category
      ? pathname === "/collections" && activeCategory === item.category
      : pathname === item.href;

  if (isAdminRoute) return null;

  return (
    <>
      <motion.header
        id="main-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome || mobileMenuOpen || searchOpen
            ? "bg-white/98 backdrop-blur-md border-b border-[#E8E8E8] shadow-sm"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex w-full max-w-full items-center justify-between px-4 py-2.5 sm:px-5 md:px-10 lg:px-20 lg:py-3 xl:py-5">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex size-11 items-center justify-center transition-colors xl:hidden ${
              useDarkHeaderContent ? "text-[#111111]" : "text-white"
            }`}
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex flex-1 items-center gap-8 2xl:gap-12">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`label-sm transition-colors duration-300 relative group ${
                    useDarkHeaderContent
                      ? "text-[#6B6B6B] hover:text-[#111111]"
                      : "text-white/80 hover:text-white"
                  } ${
                    isActive
                      ? useDarkHeaderContent
                        ? "text-[#111111]"
                        : "text-white"
                      : ""
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-[#0F4C81] transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Brand Logo — Center */}
          <Link
            href="/"
            aria-label="ACHROMATIC - Trang chủ"
            className={`flex min-h-11 shrink-0 items-center whitespace-nowrap font-heading text-[15px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 min-[360px]:text-lg min-[360px]:tracking-[0.1em] sm:text-xl sm:tracking-[0.15em] md:text-2xl ${
              useDarkHeaderContent ? "text-[#111111]" : "text-white"
            }`}
          >
            ACHROMATIC
          </Link>

          {/* Trailing Icons */}
          <div className="flex flex-1 items-center justify-end">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`hidden size-11 items-center justify-center transition-colors duration-300 sm:flex ${
                useDarkHeaderContent
                  ? "text-[#6B6B6B] hover:text-[#111111]"
                  : "text-white/80 hover:text-white"
              }`}
              aria-label="Tìm kiếm"
              aria-expanded={searchOpen}
              aria-controls="site-search-overlay"
            >
              <Search className="w-[18px] h-[18px] stroke-[1.5]" />
            </button>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className={`relative flex size-11 items-center justify-center transition-colors duration-300 ${
                useDarkHeaderContent
                  ? "text-[#6B6B6B] hover:text-[#111111]"
                  : "text-white/80 hover:text-white"
              }`}
              aria-label={`Danh sách yêu thích${
                wishlistCount > 0 ? `, ${wishlistCount} sản phẩm` : ""
              }`}
              aria-current={pathname === "/account/wishlist" ? "page" : undefined}
            >
              <Heart
                className={`w-[18px] h-[18px] stroke-[1.5] ${
                  pathname === "/account/wishlist" ? "fill-current" : ""
                }`}
              />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0F4C81] px-0.5 text-[9px] font-medium text-white xl:-right-0.5 xl:-top-0.5">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className={`relative flex size-11 items-center justify-center transition-colors duration-300 ${
                useDarkHeaderContent
                  ? "text-[#6B6B6B] hover:text-[#111111]"
                  : "text-white/80 hover:text-white"
              }`}
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#111111] px-0.5 text-[9px] font-medium text-white xl:-right-0.5 xl:-top-0.5">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account */}
            <Link
              href="/account"
              className={`hidden size-11 items-center justify-center transition-colors duration-300 xl:flex ${
                useDarkHeaderContent
                  ? "text-[#6B6B6B] hover:text-[#111111]"
                  : "text-white/80 hover:text-white"
              }`}
              aria-label="Tài khoản"
            >
              <User className="w-[18px] h-[18px] stroke-[1.5]" />
            </Link>
          </div>
        </div>

      </motion.header>

      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            initialQuery={currentQuery}
            onClose={closeSearch}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-[60] xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-navigation-title"
              className="fixed inset-y-0 left-0 z-[70] flex w-[88vw] max-w-[360px] flex-col bg-white xl:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center p-6 border-b border-[#E8E8E8]">
                <span id="mobile-navigation-title" className="font-heading text-lg tracking-wider text-[#111111]">
                  ACHROMATIC
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex size-11 items-center justify-center text-[#6B6B6B] transition-colors hover:text-[#111111]"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav */}
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-6">
                {navItems.map((item, i) => {
                  const isActive = isNavItemActive(item);

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 + 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex min-h-11 items-center border-b py-3 font-sans text-sm uppercase tracking-[0.12em] transition-colors ${
                          isActive
                            ? "border-[#0F4C81] text-[#0F4C81]"
                            : "border-[#F5F5F5] text-[#111111] hover:text-[#0F4C81]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 text-[#6B6B6B] transition-colors hover:text-[#111111]"
                  >
                    <Search className="h-4 w-4" />
                    <span className="font-sans text-sm">Tìm kiếm</span>
                  </button>
                  <Link
                    href="/account/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center gap-3 text-[#6B6B6B] font-sans text-sm hover:text-[#111111] transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Danh sách yêu thích</span>
                    {wishlistCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0F4C81] px-1 text-[10px] text-white">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center gap-3 text-[#6B6B6B] font-sans text-sm hover:text-[#111111] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Tài khoản của tôi
                  </Link>
                </div>
              </nav>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-[#E8E8E8]">
                <p className="label-xs text-[#9A9A9A]">
                  © {new Date().getFullYear()} ACHROMATIC
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
