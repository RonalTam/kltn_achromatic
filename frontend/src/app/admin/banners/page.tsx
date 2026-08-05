"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminGet, adminPatch, adminPost } from "@/components/admin/admin-api";
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
import { AdminBanner, ApiList } from "@/components/admin/types";

interface BannerForm {
  id?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  linkText: string;
  position: AdminBanner["position"];
  isActive: boolean;
  sortOrder: string;
  startsAt: string;
  endsAt: string;
}

const emptyBanner: BannerForm = {
  title: "",
  subtitle: "",
  imageUrl: "",
  mobileImageUrl: "",
  linkUrl: "",
  linkText: "",
  position: "HERO",
  isActive: true,
  sortOrder: "0",
  startsAt: "",
  endsAt: "",
};

function bannerToForm(banner: AdminBanner): BannerForm {
  return {
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle ?? "",
    imageUrl: banner.imageUrl,
    mobileImageUrl: banner.mobileImageUrl ?? "",
    linkUrl: banner.linkUrl ?? "",
    linkText: banner.linkText ?? "",
    position: banner.position,
    isActive: banner.isActive,
    sortOrder: String(banner.sortOrder),
    startsAt: banner.startsAt?.slice(0, 16) ?? "",
    endsAt: banner.endsAt?.slice(0, 16) ?? "",
  };
}

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState<BannerForm | null>(null);
  const listQuery = useQuery({
    queryKey: ["admin", "banners", { page, search, status }],
    queryFn: () => adminGet<ApiList<AdminBanner>>("/admin/banners", {
      params: { page, limit: 10, search: search || undefined, status: status || undefined },
    }),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
  const saveMutation = useMutation({
    mutationFn: (next: BannerForm) => {
      const payload = {
        title: next.title.trim(),
        subtitle: next.subtitle.trim() || null,
        imageUrl: next.imageUrl.trim(),
        mobileImageUrl: next.mobileImageUrl.trim() || null,
        linkUrl: next.linkUrl.trim() || null,
        linkText: next.linkText.trim() || null,
        position: next.position,
        isActive: next.isActive,
        sortOrder: Number(next.sortOrder || 0),
        startsAt: next.startsAt || null,
        endsAt: next.endsAt || null,
      };
      return next.id ? adminPatch(`/admin/banners/${next.id}`, payload) : adminPost("/admin/banners", payload);
    },
    onSuccess: async () => {
      toast.success("Đã lưu banner");
      setForm(null);
      await refresh();
    },
    onError: () => toast.error("Không thể lưu banner"),
  });

  const save = () => {
    if (!form?.title.trim() || !form.imageUrl.trim()) {
      toast.error("Tiêu đề và ảnh desktop là bắt buộc");
      return;
    }
    saveMutation.mutate(form);
  };

  const toggle = async (banner: AdminBanner) => {
    try {
      await adminPatch(`/admin/banners/${banner.id}`, { isActive: !banner.isActive });
      toast.success("Đã cập nhật trạng thái banner");
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

  const columns: Array<DataTableColumn<AdminBanner>> = [
    { key: "banner", header: "Banner", cell: (banner) => <div className="flex min-w-64 items-center gap-3"><div className="relative h-12 w-20 shrink-0 bg-[#F2F2F2]">{
      <Image src={banner.imageUrl} alt={`Banner ${banner.title}`} fill unoptimized sizes="80px" className="object-cover" />
    }</div><div><p className="font-semibold text-[#111111]">{banner.title}</p><p className="mt-0.5 text-[11px] text-[#777777]">{banner.subtitle || "Không có phụ đề"}</p></div></div> },
    { key: "position", header: "Vị trí", cell: (banner) => banner.position },
    { key: "link", header: "Liên kết", cell: (banner) => banner.linkUrl || "-" },
    { key: "order", header: "Thứ tự", cell: (banner) => banner.sortOrder },
    { key: "status", header: "Trạng thái", cell: (banner) => <span className="admin-badge" data-tone={banner.isActive ? "success" : "danger"}>{banner.isActive ? "Đang hiển thị" : "Đã ẩn"}</span> },
    { key: "actions", header: "Thao tác", className: "text-right", cell: (banner) => <RowActions onEdit={() => setForm(bannerToForm(banner))} onToggle={() => toggle(banner)} active={banner.isActive} /> },
  ];

  return (
    <>
      <AdminPageHeader title="Banner" description="Quản lý nội dung truyền thông theo vị trí, thời gian và thứ tự hiển thị." actionLabel="Thêm banner" onAction={() => setForm({ ...emptyBanner })} />
      <ResourceToolbar search={searchInput} onSearchChange={setSearchInput} onSubmit={applySearch} status={status} onStatusChange={(value) => { setStatus(value); setPage(1); }} statusOptions={[["active", "Đang hiển thị"], ["hidden", "Đã ẩn"]]} />
      {listQuery.isPending ? <AdminLoading /> : listQuery.isError || !listQuery.data ? <AdminError /> : (
        <>
          <DataTable rows={listQuery.data.data} columns={columns} getRowKey={(banner) => banner.id} emptyTitle="Chưa có banner" />
          <AdminPagination meta={listQuery.data.meta} onPageChange={setPage} />
        </>
      )}
      {form && (
        <AdminModal title={form.id ? "Cập nhật banner" : "Thêm banner"} saving={saveMutation.isPending} onSave={save} onClose={() => setForm(null)}>
          <AdminField label="Tiêu đề" value={form.title} onChange={(title) => setForm({ ...form, title })} required />
          <AdminTextarea label="Phụ đề" value={form.subtitle} onChange={(subtitle) => setForm({ ...form, subtitle })} />
          <AdminField label="Ảnh desktop" value={form.imageUrl} onChange={(imageUrl) => setForm({ ...form, imageUrl })} required />
          {form.imageUrl && <div className="relative h-40 bg-[#F2F2F2]">{
            <Image src={form.imageUrl} alt="Xem trước banner" fill unoptimized sizes="(max-width: 640px) 100vw, 640px" className="object-cover" />
          }</div>}
          <AdminField label="Ảnh mobile" value={form.mobileImageUrl} onChange={(mobileImageUrl) => setForm({ ...form, mobileImageUrl })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="URL liên kết" value={form.linkUrl} onChange={(linkUrl) => setForm({ ...form, linkUrl })} />
            <AdminField label="Nhãn liên kết" value={form.linkText} onChange={(linkText) => setForm({ ...form, linkText })} />
            <AdminSelect label="Vị trí" value={form.position} onChange={(position) => setForm({ ...form, position: position as BannerForm["position"] })} options={[["HERO", "Hero"], ["COLLECTION", "Bộ sưu tập"], ["PROMOTIONAL", "Khuyến mãi"], ["SIDEBAR", "Sidebar"]]} />
            <AdminField label="Thứ tự" type="number" value={form.sortOrder} onChange={(sortOrder) => setForm({ ...form, sortOrder })} />
            <AdminField label="Bắt đầu" type="datetime-local" value={form.startsAt} onChange={(startsAt) => setForm({ ...form, startsAt })} />
            <AdminField label="Kết thúc" type="datetime-local" value={form.endsAt} onChange={(endsAt) => setForm({ ...form, endsAt })} />
          </div>
          <label className="flex min-h-12 items-center gap-3 border border-[#D4D4D4] px-3 text-sm font-semibold">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
            Đang hiển thị
          </label>
        </AdminModal>
      )}
    </>
  );
}
