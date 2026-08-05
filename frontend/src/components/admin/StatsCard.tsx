import { ReactNode } from "react";

export function StatsCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <article className="border border-[#E1E1E1] bg-white p-5">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666666]">{label}</p>
        <span className="flex size-9 items-center justify-center bg-[#F1F1F1] text-[#111111]">{icon}</span>
      </div>
      <p className="font-heading text-3xl font-light tracking-tight text-[#111111]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[#777777]">{detail}</p>
    </article>
  );
}
