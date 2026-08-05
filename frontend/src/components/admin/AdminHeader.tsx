"use client";

import { LogOut, Menu } from "lucide-react";

export function AdminHeader({
  title,
  userName,
  role,
  onMenuOpen,
  onLogout,
}: {
  title: string;
  userName: string;
  role: string;
  onMenuOpen: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[#E1E1E1] bg-white/95 px-4 backdrop-blur md:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <button type="button" onClick={onMenuOpen} className="admin-icon-button" aria-label="Mở menu quản trị">
            <Menu className="size-4" />
          </button>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777777]">Quản trị</p>
          <p className="font-heading text-xl font-light text-[#111111]">{title}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-[#111111]">{userName}</p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#777777]">{role}</p>
        </div>
        <button type="button" onClick={onLogout} className="admin-icon-button" aria-label="Đăng xuất">
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
