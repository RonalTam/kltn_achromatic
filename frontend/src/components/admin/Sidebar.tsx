"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BarChart3,
  ImageIcon,
  LayoutDashboard,
  MessageCircle,
  Package,
  PanelTop,
  Settings,
  ShoppingCart,
  Tags,
  Ticket,
  Users,
  X,
} from "lucide-react";

const navigation = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/merchandising", label: "Trưng bày trang chủ", icon: PanelTop },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/customers", label: "Khách hàng", icon: Users },
  { href: "/admin/categories", label: "Danh mục", icon: Tags },
  { href: "/admin/inventory", label: "Tồn kho", icon: Archive },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: Ticket },
  { href: "/admin/banners", label: "Banner", icon: ImageIcon },
  { href: "/admin/chat", label: "Hỗ trợ Chat", icon: MessageCircle },
  { href: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

function isActiveRoute(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
          onClick={onClose}
          aria-label="Đóng menu quản trị"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E1E1E1] bg-[#111111] text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/15 px-6">
          <Link href="/admin" onClick={onClose} className="font-heading text-lg font-medium uppercase tracking-[0.17em]">
            Achromatic
          </Link>
          <button type="button" onClick={onClose} className="text-white/70 hover:text-white lg:hidden" aria-label="Đóng menu">
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-white/10 px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Admin workspace</p>
          <p className="mt-1 text-sm text-white/75">Vận hành cửa hàng</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Điều hướng quản trị">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = isActiveRoute(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`mb-1 flex min-h-11 items-center gap-3 px-3 text-sm transition-colors ${
                  active
                    ? "bg-white text-[#111111]"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="size-4 stroke-[1.7]" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-6 py-4 text-[11px] leading-5 text-white/45">
          Quyền truy cập được xác thực lại tại API.
        </div>
      </aside>
    </>
  );
}
