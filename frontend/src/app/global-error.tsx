"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-white text-[#111111] flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-red-50 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-light tracking-tight mb-3">
            Đã xảy ra lỗi nghiêm trọng
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử tải lại trang.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-3 text-xs uppercase tracking-[0.15em] hover:bg-[#333] transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Thử lại
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-[#111111] text-[#111111] px-6 py-3 text-xs uppercase tracking-[0.15em] hover:bg-[#111111] hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              Trang chủ
            </Link>
          </div>
          {error.digest && (
            <p className="mt-8 text-xs text-gray-400 font-mono">
              Mã lỗi: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
