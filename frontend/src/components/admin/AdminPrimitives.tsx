"use client";

import { FormEvent, ReactNode, useEffect, useRef } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";

const DIALOG_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function visibleFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(DIALOG_FOCUSABLE_SELECTOR),
  ).filter((element) => element.getClientRects().length > 0);
}

/**
 * Locks document body scroll while the dialog is mounted.
 * Restores the original overflow value on cleanup.
 */
function useBodyScrollLock() {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
}

function useDialogFocusTrap<T extends HTMLElement>(
  onClose: () => void,
  closeDisabled = false,
) {
  const dialogRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  const closeDisabledRef = useRef(closeDisabled);

  useEffect(() => {
    onCloseRef.current = onClose;
    closeDisabledRef.current = closeDisabled;
  }, [closeDisabled, onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      (visibleFocusableElements(dialog)[0] ?? dialog).focus();
    });

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (event.key === "Escape") {
        if (closeDisabledRef.current) return;
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = visibleFocusableElements(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return dialogRef;
}

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#DFDFDF] pb-5 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-heading text-3xl font-light tracking-tight text-[#111111]">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-[#666666]">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="admin-button shrink-0">
          <Plus className="size-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ResourceToolbar({
  search,
  onSearchChange,
  onSubmit,
  status,
  onStatusChange,
  statusOptions = [],
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: Array<readonly [string, string]>;
}) {
  return (
    <form onSubmit={onSubmit} className="mb-5 flex flex-col gap-3 border border-[#E1E1E1] bg-white p-3 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777777]" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm kiếm"
          className="admin-input pl-9"
          aria-label="Tìm kiếm"
        />
      </div>
      {onStatusChange && (
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="admin-select sm:w-56"
          aria-label="Lọc trạng thái"
        >
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      )}
      <button type="submit" className="admin-button-outline">Áp dụng</button>
    </form>
  );
}

export function AdminPagination({
  meta,
  onPageChange,
}: {
  meta?: { totalPages: number; total: number; page: number };
  onPageChange: (page: number) => void;
}) {
  if (!meta) return null;
  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 border border-[#E1E1E1] bg-white px-4 py-3 text-sm sm:flex-row">
      <span className="text-[#666666]">{meta.total} bản ghi</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          className="admin-icon-button"
          aria-label="Trang trước"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span>Trang {meta.page} / {Math.max(meta.totalPages, 1)}</span>
        <button
          type="button"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          className="admin-icon-button"
          aria-label="Trang sau"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function AdminLoading({ label = "Đang tải dữ liệu" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-2 border border-[#E1E1E1] bg-white text-sm text-[#666666]" role="status">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

export function AdminError({
  message = "Không thể tải dữ liệu quản trị.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center border border-[#E1E1E1] bg-white p-6 text-center">
      <AlertCircle className="mb-3 size-6 text-[#B42318]" />
      <p className="text-sm font-semibold text-[#111111]">Có lỗi xảy ra</p>
      <p className="mt-1 text-sm text-[#666666]">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="admin-button-outline mt-4">
          Thử lại
        </button>
      )}
    </div>
  );
}

export function AdminModal({
  title,
  children,
  saving,
  saveLabel = "Lưu thay đổi",
  onSave,
  onClose,
  size = "md",
}: {
  title: string;
  children: ReactNode;
  saving: boolean;
  saveLabel?: string;
  onSave: () => void;
  onClose: () => void;
  size?: "md" | "lg";
}) {
  const dialogRef = useDialogFocusTrap<HTMLDivElement>(onClose, saving);
  useBodyScrollLock();

  return (
    <div className="fixed inset-0 z-[100] flex bg-black/45 p-3 sm:p-5">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`m-auto flex max-h-[92dvh] w-full flex-col overflow-hidden bg-white shadow-2xl outline-none ${size === "lg" ? "max-w-4xl" : "max-w-xl"}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E8E8E8] px-5 py-4 sm:px-6">
          <h2 className="font-heading text-2xl font-light text-[#111111]">{title}</h2>
          <button type="button" onClick={onClose} disabled={saving} className="admin-icon-button" aria-label="Đóng">
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-[#E8E8E8] px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} disabled={saving} className="admin-button-outline">Hủy</button>
          <button type="button" onClick={onSave} disabled={saving} className="admin-button">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminDrawer({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const dialogRef = useDialogFocusTrap<HTMLElement>(onClose);
  useBodyScrollLock();

  return (
    <div className="fixed inset-0 z-[100] bg-black/30">
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="ml-auto h-full w-full max-w-2xl overflow-y-auto border-l border-[#E1E1E1] bg-white p-5 shadow-2xl outline-none sm:p-7"
      >
        <div className="mb-6 flex items-center justify-between border-b border-[#E8E8E8] pb-4">
          <h2 className="font-heading text-2xl font-light">{title}</h2>
          <button type="button" onClick={onClose} className="admin-icon-button" aria-label="Đóng">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

export function AdminField({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="admin-label">{label}{required && <span className="ml-1 text-[#B42318]">*</span>}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input"
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

export function AdminTextarea({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="admin-label">{label}{required && <span className="ml-1 text-[#B42318]">*</span>}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="admin-textarea" required={required} />
    </label>
  );
}

export function AdminSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<readonly [string, string]>;
}) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="admin-select">
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}
