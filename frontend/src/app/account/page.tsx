"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { PageHeading } from '@/components/common/PageHeading';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/account/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [
    { href: '/account', label: 'Thông tin cá nhân', icon: User, active: true },
    { href: '/account/orders', label: 'Đơn hàng của tôi', icon: Package, active: false },
    { href: '/account/wishlist', label: 'Danh sách yêu thích', icon: Heart, active: false },
    { href: '/account/settings', label: 'Cài đặt tài khoản', icon: Settings, active: false },
  ];

  return (
    <div className="min-h-screen bg-background px-5 md:px-20 pt-28 pb-16">
      <div className="max-w-6xl mx-auto">
        <PageHeading
          title="Tài Khoản Của Tôi"
          breadcrumbs={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Tài khoản' },
          ]}
          className="mb-10"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="border border-border bg-card">
              {/* User Info */}
              <div className="p-6 border-b border-border">
                <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-heading text-lg mb-3">
                  {user.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
                <p className="font-medium text-base text-primary">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors group ${
                      item.active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-primary'
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {!item.active && <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </Link>
                ))}
              </nav>

              {/* Logout */}
              <div className="p-2 pt-0">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>

          {/* Nội dung chính */}
          <div className="md:col-span-3 space-y-6">
            {/* Thông tin cá nhân */}
            <section className="border border-border p-6 bg-card">
              <h2 className="font-heading text-xl uppercase tracking-wide text-primary mb-6">
                Thông Tin Cá Nhân
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Họ
                  </label>
                  <p className="text-base text-primary">{user.lastName || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Tên
                  </label>
                  <p className="text-base text-primary">{user.firstName || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Địa chỉ email
                  </label>
                  <p className="text-base text-primary">{user.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Số điện thoại
                  </label>
                  <p className="text-base text-primary">{user.phone || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/account/settings">
                  <Button variant="outline" className="text-sm">Chỉnh Sửa Thông Tin</Button>
                </Link>
              </div>
            </section>

            {/* Đơn hàng gần đây */}
            <section className="border border-border p-6 bg-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl uppercase tracking-wide text-primary">
                  Đơn Hàng Gần Đây
                </h2>
                <Link
                  href="/account/orders"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Xem tất cả
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 stroke-1" />
                <p className="text-sm mb-4">Bạn chưa có đơn hàng nào</p>
                <Link href="/collections">
                  <Button className="text-sm">Mua sắm ngay</Button>
                </Link>
              </div>
            </section>

            {/* Truy cập nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/account/orders"
                className="border border-border p-5 bg-card hover:bg-accent hover:border-primary transition-all duration-200 group"
              >
                <Package className="w-7 h-7 mb-3 text-primary" />
                <h3 className="font-heading text-sm uppercase tracking-wide text-primary mb-1">
                  Theo Dõi Đơn Hàng
                </h3>
                <p className="text-xs text-muted-foreground">
                  Xem trạng thái và lịch sử đơn hàng
                </p>
              </Link>

              <Link
                href="/account/wishlist"
                className="border border-border p-5 bg-card hover:bg-accent hover:border-primary transition-all duration-200 group"
              >
                <Heart className="w-7 h-7 mb-3 text-primary" />
                <h3 className="font-heading text-sm uppercase tracking-wide text-primary mb-1">
                  Yêu Thích
                </h3>
                <p className="text-xs text-muted-foreground">
                  Lưu sản phẩm để mua sau
                </p>
              </Link>

              <Link
                href="/account/settings"
                className="border border-border p-5 bg-card hover:bg-accent hover:border-primary transition-all duration-200 group"
              >
                <Settings className="w-7 h-7 mb-3 text-primary" />
                <h3 className="font-heading text-sm uppercase tracking-wide text-primary mb-1">
                  Cài Đặt
                </h3>
                <p className="text-xs text-muted-foreground">
                  Quản lý thông tin tài khoản
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
