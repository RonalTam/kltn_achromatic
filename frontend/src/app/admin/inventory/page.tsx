"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminGet,
  adminPatch,
  getApiErrorMessage,
} from "@/components/admin/admin-api";
import {
  AdminError,
  AdminField,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  AdminPagination,
  AdminTextarea,
  ResourceToolbar,
} from "@/components/admin/AdminPrimitives";
import { DataTable, DataTableColumn } from "@/components/admin/DataTable";
import { AdminInventoryItem, ApiList } from "@/components/admin/types";

export default function AdminInventoryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<AdminInventoryItem | null>(null);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const listQuery = useQuery({
    queryKey: ["admin", "inventory", { page, search, status }],
    queryFn: () => adminGet<ApiList<AdminInventoryItem>>("/admin/inventory", {
      params: { page, limit: 12, search: search || undefined, status: status || undefined },
    }),
    placeholderData: (previous) => previous,
  });

  const openAdjust = (item: AdminInventoryItem) => {
    setSelected(item);
    setQuantity("");
    setReason("");
  };

  const adjust = async () => {
    const adjustment = Number(quantity);
    if (!selected || !Number.isInteger(adjustment) || adjustment === 0 || !reason.trim()) {
      toast.error("Nhập số lượng thay đổi và lý do hợp lệ");
      return;
    }
    if (selected.quantity + adjustment < selected.reserved) {
      toast.error(`Tồn kho sau điều chỉnh không thể thấp hơn ${selected.reserved} sản phẩm đang giữ`);
      return;
    }
    setSaving(true);
    try {
      await adminPatch(`/admin/inventory/${selected.id}/adjust`, { quantity: adjustment, reason: reason.trim() });
      toast.success("Đã điều chỉnh tồn kho");
      setSelected(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể điều chỉnh tồn kho"));
    } finally {
      setSaving(false);
    }
  };

  const applySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const columns: Array<DataTableColumn<AdminInventoryItem>> = [
    { key: "product", header: "Sản phẩm", cell: (item) => <div className="flex min-w-64 items-center gap-3"><div className="relative size-12 shrink-0 bg-[#F2F2F2]">{item.product.images?.[0]?.url && (
      <Image src={item.product.images[0].url} alt={item.product.name} fill sizes="48px" className="object-cover" />
    )}</div><div><p className="font-semibold text-[#111111]">{item.product.name}</p><p className="mt-0.5 text-[11px] text-[#777777]">{item.variant?.sku ?? item.product.sku}</p></div></div> },
    { key: "variant", header: "Biến thể", cell: (item) => [item.variant?.color?.name, item.variant?.size?.name].filter(Boolean).join(" / ") || "Mặc định" },
    { key: "quantity", header: "Hiện có", cell: (item) => <span className="font-semibold">{item.quantity}</span> },
    { key: "reserved", header: "Đang giữ", cell: (item) => item.reserved },
    { key: "available", header: "Khả dụng", cell: (item) => Math.max(item.quantity - item.reserved, 0) },
    { key: "status", header: "Cảnh báo", cell: (item) => {
      const lowStock = Math.max(item.quantity - item.reserved, 0) <= item.threshold;
      return <span className="admin-badge" data-tone={lowStock ? "danger" : "success"}>{lowStock ? "Sắp hết" : "Ổn định"}</span>;
    } },
    { key: "action", header: "Thao tác", className: "text-right", cell: (item) => <button type="button" onClick={() => openAdjust(item)} className="admin-button-outline ml-auto">Điều chỉnh</button> },
  ];

  return (
    <>
      <AdminPageHeader title="Tồn kho" description="Theo dõi lượng khả dụng theo biến thể và ghi nhận mọi lần nhập hoặc xuất kho." />
      <ResourceToolbar search={searchInput} onSearchChange={setSearchInput} onSubmit={applySearch} status={status} onStatusChange={(value) => { setStatus(value); setPage(1); }} statusOptions={[["low", "Sắp hết hàng"]]} />
      {listQuery.isPending ? <AdminLoading /> : listQuery.isError || !listQuery.data ? (
        <AdminError
          message={getApiErrorMessage(listQuery.error, "Không thể tải danh sách tồn kho")}
          onRetry={() => listQuery.refetch()}
        />
      ) : (
        <>
          <DataTable
            rows={listQuery.data.data}
            columns={columns}
            getRowKey={(item) => item.id}
            emptyTitle={search || status ? "Không tìm thấy tồn kho phù hợp" : "Chưa có dữ liệu tồn kho"}
            emptyDescription={search || status ? "Thử từ khóa khác hoặc bỏ bộ lọc cảnh báo." : undefined}
          />
          <AdminPagination meta={listQuery.data.meta} onPageChange={setPage} />
        </>
      )}
      {selected && (
        <AdminModal title={`Điều chỉnh: ${selected.product.name}`} saving={saving} onSave={adjust} onClose={() => { if (!saving) setSelected(null); }}>
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-[#E1E1E1] bg-[#FAFAFA] p-3"><p className="text-xs text-[#666666]">Hiện có</p><p className="mt-1 text-xl font-semibold">{selected.quantity}</p></div>
            <div className="border border-[#E1E1E1] bg-[#FAFAFA] p-3"><p className="text-xs text-[#666666]">Đang giữ</p><p className="mt-1 text-xl font-semibold">{selected.reserved}</p></div>
            <div className="border border-[#E1E1E1] bg-[#FAFAFA] p-3"><p className="text-xs text-[#666666]">Sau thay đổi</p><p className="mt-1 text-xl font-semibold">{selected.quantity + (parseInt(quantity, 10) || 0)}</p></div>
          </div>
          <AdminField label="Số lượng thay đổi" type="number" value={quantity} onChange={setQuantity} placeholder="Ví dụ: 10 hoặc -3" required />
          <AdminTextarea label="Lý do" value={reason} onChange={setReason} required />
        </AdminModal>
      )}
    </>
  );
}
