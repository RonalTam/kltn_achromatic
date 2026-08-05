"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminDelete, adminGet, adminPatch, adminPost } from "@/components/admin/admin-api";
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
import { RowActions } from "@/components/admin/RowActions";
import { AdminCategory, ApiList } from "@/components/admin/types";

type CategoryForm = Partial<AdminCategory>;

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CategoryForm | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin", "categories", { page, search }],
    queryFn: () => adminGet<ApiList<AdminCategory>>("/admin/categories", {
      params: { page, limit: 12, search: search || undefined },
    }),
  });
  const saveMutation = useMutation({
    mutationFn: (next: CategoryForm) => next.id
      ? adminPatch(`/admin/categories/${next.id}`, next)
      : adminPost("/admin/categories", next),
    onSuccess: async () => {
      toast.success("Đã lưu danh mục");
      setForm(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: () => toast.error("Không thể lưu danh mục"),
  });

  const save = () => {
    if (!form?.name?.trim()) {
      toast.error("Tên danh mục là bắt buộc");
      return;
    }
    saveMutation.mutate({
      ...form,
      name: form.name.trim(),
      slug: form.slug?.trim() || undefined,
      sortOrder: Number(form.sortOrder || 0),
    });
  };

  const remove = async (category: AdminCategory) => {
    if (!window.confirm(`Ẩn danh mục “${category.name}”?`)) return;
    try {
      await adminDelete(`/admin/categories/${category.id}`);
      toast.success("Đã ẩn danh mục");
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    } catch {
      toast.error("Không thể cập nhật danh mục");
    }
  };

  const applySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const columns: Array<DataTableColumn<AdminCategory>> = [
    { key: "name", header: "Danh mục", cell: (category) => <div><p className="font-semibold text-[#111111]">{category.name}</p><p className="mt-0.5 text-[11px] text-[#777777]">/{category.slug}</p></div> },
    { key: "products", header: "Sản phẩm", cell: (category) => category._count?.products ?? 0 },
    { key: "order", header: "Thứ tự", cell: (category) => category.sortOrder },
    { key: "status", header: "Trạng thái", cell: (category) => <span className="admin-badge" data-tone={category.isActive ? "success" : "danger"}>{category.isActive ? "Hoạt động" : "Đã ẩn"}</span> },
    { key: "actions", header: "Thao tác", className: "text-right", cell: (category) => <RowActions onEdit={() => setForm(category)} onDelete={() => remove(category)} active={category.isActive} /> },
  ];

  return (
    <>
      <AdminPageHeader title="Danh mục" description="Tổ chức sản phẩm theo nhóm, thứ tự hiển thị và trạng thái kinh doanh." actionLabel="Thêm danh mục" onAction={() => setForm({ name: "", slug: "", description: "", imageUrl: "", isActive: true, sortOrder: 0 })} />
      <ResourceToolbar search={searchInput} onSearchChange={setSearchInput} onSubmit={applySearch} />
      {listQuery.isPending ? <AdminLoading /> : listQuery.isError || !listQuery.data ? <AdminError /> : (
        <>
          <DataTable rows={listQuery.data.data} columns={columns} getRowKey={(category) => category.id} emptyTitle="Chưa có danh mục" />
          <AdminPagination meta={listQuery.data.meta} onPageChange={setPage} />
        </>
      )}
      {form && (
        <AdminModal title={form.id ? "Cập nhật danh mục" : "Thêm danh mục"} saving={saveMutation.isPending} onSave={save} onClose={() => setForm(null)}>
          <AdminField label="Tên danh mục" value={form.name ?? ""} onChange={(name) => setForm({ ...form, name })} required />
          <AdminField label="Slug" value={form.slug ?? ""} onChange={(slug) => setForm({ ...form, slug })} placeholder="Tự sinh nếu để trống" />
          <AdminTextarea label="Mô tả" value={form.description ?? ""} onChange={(description) => setForm({ ...form, description })} />
          <AdminField label="URL ảnh" value={form.imageUrl ?? ""} onChange={(imageUrl) => setForm({ ...form, imageUrl })} />
          <AdminField label="Thứ tự" type="number" value={String(form.sortOrder ?? 0)} onChange={(sortOrder) => setForm({ ...form, sortOrder: Number(sortOrder) })} />
          <label className="flex min-h-12 items-center gap-3 border border-[#D4D4D4] px-3 text-sm font-semibold">
            <input type="checkbox" checked={form.isActive !== false} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
            Đang hoạt động
          </label>
        </AdminModal>
      )}
    </>
  );
}
