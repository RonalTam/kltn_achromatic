"use client";

import { FormEvent, useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, LockKeyhole, LockKeyholeOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminGet, adminPatch, formatDateTime, formatMoney } from "@/components/admin/admin-api";
import { CustomerDetailPanel } from "@/components/admin/AdminDetailPanels";
import {
  AdminDrawer,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminPagination,
  ResourceToolbar,
} from "@/components/admin/AdminPrimitives";
import { DataTable, DataTableColumn } from "@/components/admin/DataTable";
import { AdminCustomer, ApiList } from "@/components/admin/types";

export default function AdminCustomersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [detail, setDetail] = useState<AdminCustomer | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const listQuery = useQuery({
    queryKey: ["admin", "customers", { page, search, status }],
    queryFn: () => adminGet<ApiList<AdminCustomer>>("/admin/customers", {
      params: { page, limit: 12, search: search || undefined, status: status || undefined },
    }),
  });

  const toggle = useCallback(async (customer: AdminCustomer) => {
    if (pendingIds.has(customer.id)) return;
    setPendingIds((prev) => new Set(prev).add(customer.id));
    try {
      await adminPatch(`/admin/customers/${customer.id}/status`, { isActive: !customer.isActive });
      toast.success(customer.isActive ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
      await queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
    } catch {
      toast.error("Không thể cập nhật tài khoản");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(customer.id);
        return next;
      });
    }
  }, [pendingIds, queryClient]);

  const openDetail = async (customer: AdminCustomer) => {
    try {
      setDetail(await adminGet<AdminCustomer>(`/admin/customers/${customer.id}`));
    } catch {
      toast.error("Không thể tải hồ sơ khách hàng");
    }
  };

  const applySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const columns: Array<DataTableColumn<AdminCustomer>> = [
    { key: "customer", header: "Khách hàng", cell: (customer) => <div><p className="font-semibold text-[#111111]">{customer.firstName} {customer.lastName}</p><p className="mt-0.5 text-[11px] text-[#777777]">{customer.email}</p></div> },
    { key: "phone", header: "Điện thoại", cell: (customer) => customer.phone ?? "-" },
    { key: "orders", header: "Đơn hàng", cell: (customer) => customer._count?.orders ?? 0 },
    { key: "spent", header: "Chi tiêu", cell: (customer) => <span className="font-semibold">{formatMoney(customer.totalSpent)}</span> },
    { key: "joined", header: "Tham gia", cell: (customer) => formatDateTime(customer.createdAt) },
    { key: "status", header: "Trạng thái", cell: (customer) => <span className="admin-badge" data-tone={customer.isActive ? "success" : "danger"}>{customer.isActive ? "Hoạt động" : "Đã khóa"}</span> },
    { key: "actions", header: "Thao tác", className: "text-right", cell: (customer) => {
      const isPending = pendingIds.has(customer.id);
      return (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => openDetail(customer)} className="admin-icon-button" aria-label="Xem hồ sơ" disabled={isPending}><Eye className="size-4" /></button>
          <button type="button" onClick={() => toggle(customer)} className="admin-icon-button" aria-label={customer.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : (customer.isActive ? <LockKeyhole className="size-4" /> : <LockKeyholeOpen className="size-4" />)}
          </button>
        </div>
      );
    } },
  ];

  return (
    <>
      <AdminPageHeader title="Khách hàng" description="Tra cứu hồ sơ, lịch sử mua hàng, tổng chi tiêu và trạng thái tài khoản." />
      <ResourceToolbar search={searchInput} onSearchChange={setSearchInput} onSubmit={applySearch} status={status} onStatusChange={(value) => { setStatus(value); setPage(1); }} statusOptions={[["active", "Hoạt động"], ["locked", "Đã khóa"]]} />
      {listQuery.isPending ? <AdminLoading /> : listQuery.isError || !listQuery.data ? <AdminError /> : (
        <>
          <DataTable rows={listQuery.data.data} columns={columns} getRowKey={(customer) => customer.id} emptyTitle="Chưa có khách hàng" />
          <AdminPagination meta={listQuery.data.meta} onPageChange={setPage} />
        </>
      )}
      {detail && <AdminDrawer title={`${detail.firstName} ${detail.lastName}`} onClose={() => setDetail(null)}><CustomerDetailPanel customer={detail} /></AdminDrawer>}
    </>
  );
}
