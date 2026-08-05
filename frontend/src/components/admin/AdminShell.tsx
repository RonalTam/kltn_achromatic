"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Sidebar } from "@/components/admin/Sidebar";
import { useAuthStore } from "@/store/auth-store";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

const pageTitles: Record<string, string> = {
  "/admin": "Tổng quan",
  "/admin/products": "Sản phẩm",
  "/admin/merchandising": "Trưng bày trang chủ",
  "/admin/orders": "Đơn hàng",
  "/admin/customers": "Khách hàng",
  "/admin/categories": "Danh mục",
  "/admin/inventory": "Tồn kho",
  "/admin/coupons": "Mã giảm giá",
  "/admin/banners": "Banner",
  "/admin/chat": "Hỗ trợ Chat",
  "/admin/reports": "Báo cáo",
  "/admin/settings": "Cài đặt",
};

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const isAdmin = Boolean(user && ADMIN_ROLES.includes(user.role));

  useEffect(() => {
    const persistence = useAuthStore.persist;
    if (!persistence) return;

    const unsubscribe = persistence.onFinishHydration(() => setHydrated(true));
    if (persistence.hasHydrated()) {
      const frame = requestAnimationFrame(() => setHydrated(true));
      return () => {
        cancelAnimationFrame(frame);
        unsubscribe();
      };
    }
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(`/account/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!isAdmin) router.replace(`/forbidden?from=${encodeURIComponent(pathname)}`);
  }, [hydrated, isAdmin, isAuthenticated, pathname, router]);

  if (!hydrated || !isAuthenticated || !user || !isAdmin) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#F4F4F4] text-sm text-[#666666]">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  const title = pageTitles[pathname] ?? "Quản trị";
  const userName = `${user.firstName} ${user.lastName}`.trim() || user.email;

  const handleLogout = async () => {
    await logout();
    router.replace("/account/login");
  };

  return (
    <div className="min-h-[100dvh] bg-[#F4F4F4] text-[#111111]">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="min-h-[100dvh] lg:pl-72">
        <AdminHeader
          title={title}
          userName={userName}
          role={user.role}
          onMenuOpen={() => setMobileOpen(true)}
          onLogout={handleLogout}
        />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
