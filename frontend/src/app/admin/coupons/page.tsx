"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminGet, adminPatch, adminPost, formatDateTime, formatMoney } from "@/components/admin/admin-api";
import {
  AdminError,
  AdminField,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  AdminPagination,
  AdminSelect,
  AdminTextarea,
  ResourceToolbar,
} from "@/components/admin/AdminPrimitives";
import { DataTable, DataTableColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { AdminCoupon, ApiList } from "@/components/admin/types";

interface CouponForm {
  id?: string;
  code: string;
  name: string;
  description: string;
  type: AdminCoupon["type"];
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  usagePerUser: string;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
}

const emptyCoupon: CouponForm = {
  code: "",
  name: "",
  description: "",
  type: "PERCENTAGE",
  value: "10",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  usagePerUser: "1",
  isActive: true,
  startsAt: "",
  expiresAt: "",
};

function couponToForm(coupon: AdminCoupon): CouponForm {
  return {
    id: coupon.id,
    code: coupon.code,
    name: coupon.name,
    description: coupon.description ?? "",
    type: coupon.type,
    value: String(coupon.value),
    minOrderAmount: String(coupon.minOrderAmount ?? ""),
    maxDiscount: String(coupon.maxDiscount ?? ""),
    usageLimit: String(coupon.usageLimit ?? ""),
    usagePerUser: String(coupon.usagePerUser),
    isActive: coupon.isActive,
    startsAt: coupon.startsAt?.slice(0, 10) ?? "",
    expiresAt: coupon.expiresAt?.slice(0, 10) ?? "",
  };
}

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState<CouponForm | null>(null);
  const listQuery = useQuery({
    queryKey: ["admin", "coupons", { page, search, status }],
    queryFn: () => adminGet<ApiList<AdminCoupon>>("/admin/coupons", {
      params: { page, limit: 12, search: search || undefined, status: status || undefined },
    }),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
  const saveMutation = useMutation({
    mutationFn: (next: CouponForm) => {
      const payload = {
        code: next.code.trim().toUpperCase(),
        name: next.name.trim(),
        description: next.description.trim() || null,
        type: next.type,
        value: Number(next.value),
        minOrderAmount: next.minOrderAmount ? Number(next.minOrderAmount) : null,
        maxDiscount: next.maxDiscount ? Number(next.maxDiscount) : null,
        usageLimit: next.usageLimit ? Number(next.usageLimit) : null,
        usagePerUser: Number(next.usagePerUser || 1),
        isActive: next.isActive,
        startsAt: next.startsAt || null,
        expiresAt: next.expiresAt || null,
      };
      return next.id ? adminPatch(`/admin/coupons/${next.id}`, payload) : adminPost("/admin/coupons", payload);
    },
    onSuccess: async () => {
      toast.success("Đã lưu mã giảm giá");
      setForm(null);
      await refresh();
    },
    onError: () => toast.error("Không thể lưu mã giảm giá"),
  });

  const save = () => {
    if (!form?.code.trim() || !form.name.trim()) {
      toast.error("Mã và tên chương trình là bắt buộc");
      return;
    }
    if (form.type !== "FREE_SHIPPING" && Number(form.value) <= 0) {
      toast.error("Giá trị ưu đãi phải lớn hơn 0");
      return;
    }
    if (form.type === "PERCENTAGE" && Number(form.value) > 100) {
      toast.error("Giá trị phần trăm không thể vượt quá 100%");
      return;
    }
    const parsedUsagePerUser = Number(form.usagePerUser);
    if (!Number.isInteger(parsedUsagePerUser) || parsedUsagePerUser < 1) {
      toast.error("Số lượt dùng mỗi khách phải ít nhất là 1");
      return;
    }
    if (form.startsAt && form.expiresAt) {
      if (new Date(form.expiresAt) <= new Date(form.startsAt)) {
        toast.error("Ngày hết hạn phải sau ngày bắt đầu");
        return;
      }
    }
    saveMutation.mutate(form);
  };


  const toggle = async (coupon: AdminCoupon) => {
    try {
      await adminPatch(`/admin/coupons/${coupon.id}`, { isActive: !coupon.isActive });
      toast.success("Đã cập nhật trạng thái mã giảm giá");
      await refresh();
    } catch {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const applySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const columns: Array<DataTableColumn<AdminCoupon>> = [
    { key: "code", header: "Mã", cell: (coupon) => <div><p className="font-semibold tracking-[0.08em] text-[#111111]">{coupon.code}</p><p className="mt-0.5 text-[11px] text-[#777777]">{coupon.name}</p></div> },
    { key: "value", header: "Ưu đãi", cell: (coupon) => coupon.type === "PERCENTAGE" ? `${Number(coupon.value)}%` : coupon.type === "FREE_SHIPPING" ? "Miễn phí ship" : formatMoney(coupon.value) },
    { key: "usage", header: "Lượt dùng", cell: (coupon) => `${coupon.usedCount}/${coupon.usageLimit ?? "∞"}` },
    { key: "expires", header: "Hết hạn", cell: (coupon) => formatDateTime(coupon.expiresAt) },
    { key: "status", header: "Trạng thái", cell: (coupon) => <span className="admin-badge" data-tone={coupon.isActive ? "success" : "danger"}>{coupon.isActive ? "Hoạt động" : "Đã tắt"}</span> },
    { key: "actions", header: "Thao tác", className: "text-right", cell: (coupon) => <RowActions onEdit={() => setForm(couponToForm(coupon))} onToggle={() => toggle(coupon)} active={coupon.isActive} /> },
  ];

  return (
    <>
      <AdminPageHeader title="Mã giảm giá" description="Thiết lập chương trình ưu đãi, giới hạn sử dụng và thời gian áp dụng." actionLabel="Thêm mã" onAction={() => setForm({ ...emptyCoupon })} />
      <ResourceToolbar search={searchInput} onSearchChange={setSearchInput} onSubmit={applySearch} status={status} onStatusChange={(value) => { setStatus(value); setPage(1); }} statusOptions={[["active", "Hoạt động"], ["hidden", "Đã tắt"]]} />
      {listQuery.isPending ? <AdminLoading /> : listQuery.isError || !listQuery.data ? <AdminError /> : (
        <>
          <DataTable rows={listQuery.data.data} columns={columns} getRowKey={(coupon) => coupon.id} emptyTitle="Chưa có mã giảm giá" />
          <AdminPagination meta={listQuery.data.meta} onPageChange={setPage} />
        </>
      )}
      {form && (
        <AdminModal title={form.id ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá"} saving={saveMutation.isPending} onSave={save} onClose={() => setForm(null)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Mã" value={form.code} onChange={(code) => setForm({ ...form, code })} required />
            <AdminField label="Tên chương trình" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
          </div>
          <AdminTextarea label="Mô tả" value={form.description} onChange={(description) => setForm({ ...form, description })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminSelect label="Loại ưu đãi" value={form.type} onChange={(type) => setForm({ ...form, type: type as CouponForm["type"] })} options={[["PERCENTAGE", "Phần trăm"], ["FIXED_AMOUNT", "Số tiền cố định"], ["FREE_SHIPPING", "Miễn phí vận chuyển"]]} />
            <AdminField label="Giá trị" type="number" value={form.value} onChange={(value) => setForm({ ...form, value })} required />
            <AdminField label="Đơn tối thiểu" type="number" value={form.minOrderAmount} onChange={(minOrderAmount) => setForm({ ...form, minOrderAmount })} />
            <AdminField label="Giảm tối đa" type="number" value={form.maxDiscount} onChange={(maxDiscount) => setForm({ ...form, maxDiscount })} />
            <AdminField label="Giới hạn sử dụng" type="number" value={form.usageLimit} onChange={(usageLimit) => setForm({ ...form, usageLimit })} />
            <AdminField label="Lượt dùng mỗi khách" type="number" value={form.usagePerUser} onChange={(usagePerUser) => setForm({ ...form, usagePerUser })} />
            <AdminField label="Bắt đầu" type="date" value={form.startsAt} onChange={(startsAt) => setForm({ ...form, startsAt })} />
            <AdminField label="Hết hạn" type="date" value={form.expiresAt} onChange={(expiresAt) => setForm({ ...form, expiresAt })} />
          </div>
          <label className="flex min-h-12 items-center gap-3 border border-[#D4D4D4] px-3 text-sm font-semibold">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
            Đang hoạt động
          </label>
        </AdminModal>
      )}
    </>
  );
}
