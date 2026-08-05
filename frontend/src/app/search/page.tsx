import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Search } from "lucide-react";
import { ProductCard } from "@/components/common/ProductCard";
import { SearchPageInput } from "@/components/search/SearchPageInput";
import { Product } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const PAGE_SIZE = 12;

interface SearchMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

interface ProductSearchPayload {
  data: Product[];
  matchCount: number;
  meta: SearchMeta;
}

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = firstParam(params.q).trim();
  const title = query ? `Tìm kiếm “${query}” | ACHROMATIC` : "Tìm kiếm | ACHROMATIC";

  return {
    title,
    description: query
      ? `Kết quả tìm kiếm sản phẩm phù hợp với “${query}” tại ACHROMATIC.`
      : "Tìm kiếm sản phẩm thời trang tối giản tại ACHROMATIC.",
    alternates: { canonical: query ? `/search?q=${encodeURIComponent(query)}` : "/search" },
    robots: { index: false, follow: true },
  };
}

const emptyResult: ProductSearchPayload = {
  data: [],
  matchCount: 0,
  meta: { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0 },
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(firstParam(value), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

async function getSearchResults(query: string, page: number) {
  if (!query) return { result: emptyResult, hasError: false };

  const params = new URLSearchParams({
    search: query,
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  try {
    const response = await fetch(`${API_URL}/products?${params.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Search request failed with ${response.status}`);

    const body = (await response.json()) as {
      success?: boolean;
      data?: ProductSearchPayload;
      matchCount?: number;
      meta?: SearchMeta;
    } & Partial<ProductSearchPayload>;
    const payload = body.success ? body.data : body;

    if (!payload || !Array.isArray(payload.data)) {
      return { result: emptyResult, hasError: true };
    }

    return {
      result: {
        data: payload.data,
        matchCount: payload.matchCount ?? payload.meta?.total ?? payload.data.length,
        meta: payload.meta ?? emptyResult.meta,
      },
      hasError: false,
    };
  } catch {
    return { result: emptyResult, hasError: true };
  }
}

function pageHref(query: string, page: number) {
  const params = new URLSearchParams({ q: query });
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

function visiblePages(currentPage: number, totalPages: number) {
  return Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || page === currentPage
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = firstParam(params.q).trim().replace(/\s+/g, " ").slice(0, 120);
  const requestedPage = parsePage(params.page);
  const { result, hasError } = await getSearchResults(query, requestedPage);
  const { data: products, matchCount, meta } = result;
  const pages = visiblePages(meta.page, meta.totalPages);

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] pb-20 pt-28 md:pb-28 md:pt-36">
      <section className="border-b border-[#E8E8E8] bg-white px-5 pb-10 md:px-10 md:pb-14 lg:px-20">
        <div className="mx-auto max-w-[1120px]">
          <p className="label-xs mb-3 text-[#0F4C81]">Danh mục sản phẩm</p>
          <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h1 className="font-heading text-3xl font-light tracking-tight text-[#111111] md:text-5xl">
                Tìm kiếm
              </h1>
              <p className="mt-2 max-w-xl font-sans text-sm leading-relaxed text-[#6B6B6B]">
                Tìm theo tên sản phẩm, nội dung mô tả hoặc mã SKU.
              </p>
            </div>
            {query && !hasError && (
              <p className="font-sans text-sm text-[#6B6B6B]" aria-live="polite">
                <span className="font-medium text-[#111111]">{matchCount}</span> kết quả
                cho “{query}”
              </p>
            )}
          </div>
          <SearchPageInput key={query} initialQuery={query} />
          <p className="mt-2 font-sans text-xs text-[#888888]">
            Kết quả tự động cập nhật sau 300ms khi bạn dừng nhập.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 md:px-10 md:py-14 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          {hasError ? (
            <div className="mx-auto max-w-xl border border-[#E8E8E8] bg-white px-6 py-12 text-center md:px-10">
              <AlertCircle className="mx-auto mb-5 h-7 w-7 text-[#0F4C81]" />
              <h2 className="font-heading text-xl font-medium text-[#111111]">
                Chưa thể tải kết quả tìm kiếm
              </h2>
              <p className="mt-2 font-sans text-sm leading-relaxed text-[#6B6B6B]">
                Vui lòng kiểm tra kết nối tới backend rồi thử lại.
              </p>
              <Link href={pageHref(query, requestedPage)} className="btn-outline-dark mt-7">
                Thử lại
              </Link>
            </div>
          ) : !query ? (
            <div className="mx-auto max-w-xl py-16 text-center">
              <Search className="mx-auto mb-5 h-8 w-8 stroke-[1.25] text-[#777777]" />
              <h2 className="font-heading text-2xl font-light text-[#111111]">
                Bạn đang tìm món đồ nào?
              </h2>
              <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-[#6B6B6B]">
                Nhập ít nhất hai ký tự để khám phá các sản phẩm phù hợp trong bộ sưu tập.
              </p>
              <Link href="/collections" className="btn-outline-dark mt-8">
                Xem toàn bộ sản phẩm
              </Link>
            </div>
          ) : products.length === 0 ? (
            <div className="mx-auto max-w-xl py-16 text-center">
              <Search className="mx-auto mb-5 h-8 w-8 stroke-[1.25] text-[#777777]" />
              <h2 className="font-heading text-2xl font-light text-[#111111]">
                Không tìm thấy kết quả
              </h2>
              <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-[#6B6B6B]">
                Không có sản phẩm phù hợp với “{query}”. Hãy thử từ khóa ngắn hơn,
                tên danh mục hoặc một mã SKU khác.
              </p>
              <Link href="/collections" className="btn-outline-dark mt-8">
                Khám phá bộ sưu tập
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7 flex items-center justify-between border-b border-[#E8E8E8] pb-4">
                <h2 className="label-sm text-[#111111]">Sản phẩm phù hợp</h2>
                <span className="font-sans text-xs text-[#777777]">
                  Trang {meta.page}/{meta.totalPages}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {meta.totalPages > 1 && (
                <nav
                  className="mt-14 flex items-center justify-center gap-1 sm:gap-2"
                  aria-label="Phân trang kết quả tìm kiếm"
                >
                  {meta.page > 1 ? (
                    <Link
                      href={pageHref(query, meta.page - 1)}
                      className="flex h-11 min-w-11 items-center justify-center gap-2 border border-[#E8E8E8] px-3 font-sans text-xs text-[#4A4A4A] hover:border-[#111111]"
                      aria-label="Trang trước"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Trước</span>
                    </Link>
                  ) : (
                    <span className="flex h-11 min-w-11 items-center justify-center gap-2 border border-[#E8E8E8] px-3 font-sans text-xs text-[#AAAAAA] opacity-50">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Trước</span>
                    </span>
                  )}

                  {pages.map((page, index) => {
                    const previousPage = pages[index - 1];
                    const showEllipsis = previousPage && page - previousPage > 1;

                    return (
                      <div key={page} className="flex items-center gap-2">
                        {showEllipsis && <span className="w-4 text-center text-[#999999]">…</span>}
                        <Link
                          href={pageHref(query, page)}
                          aria-current={page === meta.page ? "page" : undefined}
                          className={`flex size-11 items-center justify-center border px-2 font-sans text-xs transition-colors ${
                            page === meta.page
                              ? "border-[#111111] bg-[#111111] text-white"
                              : "border-[#E8E8E8] bg-white text-[#4A4A4A] hover:border-[#111111]"
                          }`}
                        >
                          {page}
                        </Link>
                      </div>
                    );
                  })}

                  {meta.page < meta.totalPages ? (
                    <Link
                      href={pageHref(query, meta.page + 1)}
                      className="flex h-11 min-w-11 items-center justify-center gap-2 border border-[#E8E8E8] px-3 font-sans text-xs text-[#4A4A4A] hover:border-[#111111]"
                      aria-label="Trang sau"
                    >
                      <span className="hidden sm:inline">Sau</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <span className="flex h-11 min-w-11 items-center justify-center gap-2 border border-[#E8E8E8] px-3 font-sans text-xs text-[#AAAAAA] opacity-50">
                      <span className="hidden sm:inline">Sau</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
