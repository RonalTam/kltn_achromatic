"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { adminGet, adminPatch } from "@/components/admin/admin-api";
import { AdminError, AdminField, AdminLoading, AdminPageHeader, AdminTextarea } from "@/components/admin/AdminPrimitives";
import { AdminSettings } from "@/components/admin/types";

const defaults: AdminSettings = {
  store_name: "ACHROMATIC",
  store_email: "support@achromatic.vn",
  store_phone: "",
  currency: "VND",
  free_shipping_threshold: "799000",
  order_prefix: "ACH",
  store_address: "",
};

function SettingsForm({ initial }: { initial: AdminSettings }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ ...defaults, ...initial });
  const saveMutation = useMutation({
    mutationFn: () => adminPatch<AdminSettings>("/admin/settings", form),
    onSuccess: async () => {
      toast.success("Đã lưu cài đặt");
      await queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: () => toast.error("Không thể lưu cài đặt"),
  });
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <>
      <section className="grid gap-5 xl:grid-cols-2">
        <article className="border border-[#E1E1E1] bg-white p-5">
          <h2 className="font-heading text-2xl font-light">Thông tin cửa hàng</h2>
          <p className="mt-1 text-xs text-[#777777]">Thông tin dùng trong vận hành và liên hệ khách hàng.</p>
          <div className="mt-5 space-y-4">
            <AdminField label="Tên cửa hàng" value={form.store_name} onChange={(value) => update("store_name", value)} />
            <AdminField label="Email hỗ trợ" type="email" value={form.store_email} onChange={(value) => update("store_email", value)} />
            <AdminField label="Số điện thoại" value={form.store_phone} onChange={(value) => update("store_phone", value)} />
            <AdminTextarea label="Địa chỉ" value={form.store_address} onChange={(value) => update("store_address", value)} />
          </div>
        </article>
        <article className="border border-[#E1E1E1] bg-white p-5">
          <h2 className="font-heading text-2xl font-light">Bán hàng</h2>
          <p className="mt-1 text-xs text-[#777777]">Quy tắc mặc định cho đơn hàng và giao nhận.</p>
          <div className="mt-5 space-y-4">
            <AdminField label="Tiền tệ" value={form.currency} onChange={(value) => update("currency", value)} />
            <AdminField label="Miễn phí vận chuyển từ" type="number" value={form.free_shipping_threshold} onChange={(value) => update("free_shipping_threshold", value)} />
            <AdminField label="Tiền tố mã đơn" value={form.order_prefix} onChange={(value) => update("order_prefix", value)} />
          </div>
        </article>
      </section>
      <div className="mt-5 flex justify-end">
        <button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="admin-button">
          <Save className="size-4" />
          {saveMutation.isPending ? "Đang lưu" : "Lưu cài đặt"}
        </button>
      </div>
    </>
  );
}

export default function AdminSettingsPage() {
  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminGet<AdminSettings>("/admin/settings"),
  });
  if (settingsQuery.isPending) return <AdminLoading />;
  if (settingsQuery.isError || !settingsQuery.data) return <AdminError />;
  return (
    <>
      <AdminPageHeader title="Cài đặt" description="Cấu hình thông tin cửa hàng và các quy tắc bán hàng cơ bản." />
      <SettingsForm key={JSON.stringify(settingsQuery.data)} initial={settingsQuery.data} />
    </>
  );
}
