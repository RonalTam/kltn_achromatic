"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home, ChevronLeft } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PageError]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 pt-28">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-destructive/20 bg-destructive/5">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        {/* Heading */}
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3 font-medium">
          Đã xảy ra lỗi
        </p>
        <h1 className="font-heading text-2xl font-light tracking-tight text-primary mb-3">
          Trang không thể tải được
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {error.message || "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc quay về trang chủ."}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Thử lại
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-border text-primary px-6 py-3 text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-accent transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Trang chủ
          </Link>
        </div>

        {/* Back link */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Quay lại trang trước
        </button>

        {error.digest && (
          <p className="mt-6 text-[11px] text-muted-foreground/60 font-mono">
            Ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
