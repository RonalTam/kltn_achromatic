import { ReactNode } from "react";
import Image from "next/image";
import {
  formatDateTime,
  formatMoney,
  paymentMethodLabel,
  paymentStatusLabel,
  statusLabel,
} from "@/components/admin/admin-api";
import { AdminCustomer, AdminOrder } from "@/components/admin/types";

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-[#E1E1E1] bg-white p-4">
      <h3 className="mb-4 font-heading text-xl font-light">{title}</h3>
      {children}
    </section>
  );
}

function DetailRow({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-[#666666]">{label}</span>
      <span className={`text-right text-[#111111] ${strong ? "text-base font-semibold" : "font-medium"}`}>{value}</span>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border border-[#E1E1E1] bg-[#FAFAFA] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#666666]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#111111]">{value}</p>
    </div>
  );
}

export function OrderDetailPanel({ order }: { order: AdminOrder }) {
  const address = order.address;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <DetailMetric label="Trạng thái" value={statusLabel(order.status)} />
        <DetailMetric label="Tổng tiền" value={formatMoney(order.total)} />
        <DetailMetric label="Ngày tạo" value={formatDateTime(order.createdAt)} />
      </div>
      <DetailCard title="Khách hàng">
        <DetailRow label="Họ tên" value={`${order.user?.firstName ?? ""} ${order.user?.lastName ?? ""}`.trim() || "-"} />
        <DetailRow label="Email" value={order.user?.email ?? "-"} />
        <DetailRow label="Điện thoại" value={order.user?.phone ?? "-"} />
      </DetailCard>
      <DetailCard title="Địa chỉ giao hàng">
        <p className="text-sm font-semibold">{address?.fullName ?? "-"}</p>
        <p className="mt-1 text-sm text-[#666666]">{address?.phone ?? "-"}</p>
        <p className="mt-2 text-sm leading-6 text-[#454545]">
          {[address?.addressLine1, address?.addressLine2, address?.ward, address?.district, address?.province, address?.country].filter(Boolean).join(", ") || "-"}
        </p>
      </DetailCard>
      <DetailCard title="Sản phẩm trong đơn">
        <div className="space-y-3">
          {(order.items ?? []).map((item, index) => {
            const image = item.imageUrl ?? item.product?.images?.[0]?.url;
            const variant = item.variantName ?? [item.variant?.color?.name, item.variant?.size?.name].filter(Boolean).join(" / ");
            return (
              <div key={item.id ?? `${item.productName}-${index}`} className="flex gap-3 border-b border-[#EEEEEE] pb-3 last:border-0 last:pb-0">
                <div className="relative size-16 shrink-0 bg-[#F2F2F2]">
                  {image && (
                    <Image src={image} alt={item.productName ?? "Sản phẩm"} fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.productName ?? "Sản phẩm"}</p>
                  <p className="mt-1 text-xs text-[#666666]">{[item.sku, variant].filter(Boolean).join(" · ") || "-"}</p>
                  <p className="mt-2 text-sm text-[#454545]">{item.quantity} x {formatMoney(item.unitPrice)} = <span className="font-semibold text-[#111111]">{formatMoney(item.totalPrice)}</span></p>
                </div>
              </div>
            );
          })}
        </div>
      </DetailCard>
      <DetailCard title="Thanh toán">
        <DetailRow label="Tạm tính" value={formatMoney(order.subtotal)} />
        <DetailRow label="Phí vận chuyển" value={formatMoney(order.shippingFee)} />
        <DetailRow label="Giảm giá" value={formatMoney(order.discount)} />
        <DetailRow label="Thuế" value={formatMoney(order.tax)} />
        <div className="my-3 border-t border-[#E1E1E1]" />
        <DetailRow label="Tổng thanh toán" value={formatMoney(order.total)} strong />
        <DetailRow label="Phương thức" value={paymentMethodLabel(order.payment?.method)} />
        <DetailRow label="Trạng thái" value={paymentStatusLabel(order.payment?.status)} />
        <DetailRow label="Mã vận đơn" value={order.trackingNumber ?? "-"} />
      </DetailCard>
      <DetailCard title="Lịch sử trạng thái">
        <div className="space-y-3">
          {(order.statusHistory ?? []).map((history) => (
            <div key={history.id} className="border-l-2 border-[#111111] pl-3">
              <p className="text-sm font-semibold">{statusLabel(history.status)}</p>
              <p className="text-xs text-[#666666]">{formatDateTime(history.createdAt)}</p>
              {history.note && <p className="mt-1 text-sm text-[#454545]">{history.note}</p>}
            </div>
          ))}
          {(order.statusHistory?.length ?? 0) === 0 && <p className="text-sm text-[#666666]">Chưa có lịch sử trạng thái.</p>}
        </div>
      </DetailCard>
    </div>
  );
}

export function CustomerDetailPanel({ customer }: { customer: AdminCustomer }) {
  const totalSpent = customer.orders?.reduce((sum, order) => sum + Number(order.total || 0), 0) ?? customer.totalSpent ?? 0;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <DetailMetric label="Trạng thái" value={customer.isActive ? "Hoạt động" : "Đã khóa"} />
        <DetailMetric label="Đơn hàng" value={customer.orders?.length ?? customer._count?.orders ?? 0} />
        <DetailMetric label="Tổng chi tiêu" value={formatMoney(totalSpent)} />
      </div>
      <DetailCard title="Thông tin liên hệ">
        <DetailRow label="Email" value={customer.email} />
        <DetailRow label="Điện thoại" value={customer.phone ?? "-"} />
        <DetailRow label="Ngày tạo" value={formatDateTime(customer.createdAt)} />
      </DetailCard>
      <DetailCard title="Địa chỉ">
        <div className="space-y-3">
          {(customer.addresses ?? []).map((address) => (
            <div key={address.id} className="border border-[#E1E1E1] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{address.fullName}</p>
                {address.isDefault && <span className="admin-badge">Mặc định</span>}
              </div>
              <p className="mt-1 text-sm text-[#666666]">{address.phone}</p>
              <p className="mt-2 text-sm leading-6 text-[#454545]">{[address.addressLine1, address.ward, address.district, address.province].filter(Boolean).join(", ")}</p>
            </div>
          ))}
          {(customer.addresses?.length ?? 0) === 0 && <p className="text-sm text-[#666666]">Chưa có địa chỉ.</p>}
        </div>
      </DetailCard>
      <DetailCard title="Lịch sử mua hàng">
        <div className="space-y-3">
          {(customer.orders ?? []).map((order) => (
            <div key={order.id} className="flex items-center justify-between gap-4 border-b border-[#EEEEEE] pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-xs text-[#666666]">{formatDateTime(order.createdAt)} · {statusLabel(order.status)}</p>
              </div>
              <p className="font-semibold">{formatMoney(order.total)}</p>
            </div>
          ))}
          {(customer.orders?.length ?? 0) === 0 && <p className="text-sm text-[#666666]">Khách hàng chưa có đơn hàng.</p>}
        </div>
      </DetailCard>
    </div>
  );
}
