"use client";

import { X } from "lucide-react";

type SizeGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

const topSizes = [
  ["S", "48-52kg", "1m60-1m68"],
  ["M", "53-60kg", "1m65-1m73"],
  ["L", "61-70kg", "1m70-1m78"],
  ["XL", "71-82kg", "1m75-1m85"],
];

const pantSizes = [
  ["S", "68-74cm", "Slim / straight"],
  ["M", "75-80cm", "Regular"],
  ["L", "81-88cm", "Relaxed"],
  ["XL", "89-96cm", "Relaxed"],
];

export function SizeGuideModal({ open, onClose }: SizeGuideModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 px-4 py-6">
      <button
        type="button"
        aria-label="Đóng hướng dẫn chọn size"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative max-h-[90dvh] w-full max-w-3xl overflow-y-auto bg-background text-foreground shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-border bg-background px-5 py-5 md:px-7">
          <div>
            <p className="label-xs mb-2 text-muted-foreground">Size Guide</p>
            <h2 className="font-heading text-2xl font-light text-primary md:text-3xl">
              Hướng dẫn chọn size
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex size-11 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-8 px-5 py-6 md:px-7 md:py-7">
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Nếu bạn đang ở giữa hai size, hãy chọn size lớn hơn nếu muốn mặc
            thoải mái, hoặc size nhỏ hơn nếu thích phom gọn.
          </p>

          <SizeTable
            title="Áo thun, polo, sơ mi"
            columns={["Size", "Cân nặng", "Chiều cao"]}
            rows={topSizes}
          />

          <SizeTable
            title="Quần"
            columns={["Size", "Vòng eo", "Phom gợi ý"]}
            rows={pantSizes}
          />

          <div className="border border-border bg-accent px-4 py-4 text-sm leading-7 text-muted-foreground">
            Cần chắc chắn hơn? Gửi chiều cao, cân nặng và sản phẩm bạn quan tâm
            qua hotline hoặc email, đội hỗ trợ sẽ gợi ý size trước khi đặt hàng.
          </div>
        </div>
      </section>
    </div>
  );
}

function SizeTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <div>
      <h3 className="mb-3 font-heading text-lg font-light text-primary">
        {title}
      </h3>
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-accent text-primary">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.join("-")}>
                {row.map((cell, index) => (
                  <td
                    key={cell}
                    className={`px-4 py-3 ${
                      index === 0 ? "font-semibold text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
