"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, Loader2, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import {
  clearRecentSearches,
  readRecentSearches,
  saveRecentSearch,
} from "@/lib/search-history";

interface SearchPayload {
  data: Product[];
  matchCount?: number;
  meta?: { total?: number };
}

interface SearchEnvelope {
  data?: SearchPayload;
}

interface SearchOverlayProps {
  initialQuery?: string;
  onClose: () => void;
}

interface SuggestionState {
  query: string;
  status: "loading" | "success" | "error";
  products: Product[];
  matchCount: number;
  error: string;
}

export function SearchOverlay({
  initialQuery = "",
  onClose,
}: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [term, setTerm] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState(readRecentSearches);
  const [suggestionState, setSuggestionState] = useState<SuggestionState>({
    query: "",
    status: "success",
    products: [],
    matchCount: 0,
    error: "",
  });
  const normalizedTerm = term.trim();
  const currentSuggestions = suggestionState.query === normalizedTerm
    ? suggestionState
    : null;
  const suggestions = currentSuggestions?.products ?? [];
  const matchCount = currentSuggestions?.matchCount ?? 0;
  const isLoading = normalizedTerm.length >= 2 &&
    (!currentSuggestions || currentSuggestions.status === "loading");
  const hasSearched = currentSuggestions?.status === "success";
  const error = currentSuggestions?.status === "error"
    ? currentSuggestions.error
    : "";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => inputRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) return;

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      setSuggestionState({
        query,
        status: "loading",
        products: [],
        matchCount: 0,
        error: "",
      });

      try {
        const response = await api.get<SearchEnvelope>("/products", {
          params: { search: query, limit: 5, page: 1 },
          signal: controller.signal,
        });
        const payload = response.data.data;
        setSuggestionState({
          query,
          status: "success",
          products: payload?.data ?? [],
          matchCount: payload?.matchCount ?? payload?.meta?.total ?? 0,
          error: "",
        });
      } catch {
        if (!controller.signal.aborted) {
          setSuggestionState({
            query,
            status: "error",
            products: [],
            matchCount: 0,
            error: "Không thể tải gợi ý lúc này. Bạn vẫn có thể nhấn Enter để tìm kiếm.",
          });
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [term]);

  const goToSearch = (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    setRecentSearches(saveRecentSearch(normalizedQuery));
    onClose();
    router.push(`/search?q=${encodeURIComponent(normalizedQuery)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goToSearch(term);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <motion.div
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Tìm kiếm sản phẩm"
        >
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default bg-black/45 backdrop-blur-[2px]"
            onClick={onClose}
            aria-label="Đóng tìm kiếm"
          />

          <motion.div
            id="site-search-overlay"
            className="relative mx-auto w-full border-b border-[#E8E8E8] bg-white shadow-2xl"
            initial={{ y: -32 }}
            animate={{ y: 0 }}
            exit={{ y: -32 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto max-w-[1120px] px-5 py-6 md:px-10 md:py-9">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="label-xs mb-1 text-[#0F4C81]">Khám phá ACHROMATIC</p>
                  <h2 className="font-heading text-xl font-medium text-[#111111] md:text-2xl">
                    Tìm sản phẩm
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex size-11 items-center justify-center border border-[#E8E8E8] text-[#6B6B6B] transition-colors hover:border-[#111111] hover:text-[#111111]"
                  aria-label="Đóng tìm kiếm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} role="search">
                <div className="relative border-b-2 border-[#111111]">
                  <Search className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#111111]" />
                  <input
                    ref={inputRef}
                    type="search"
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder="Tên sản phẩm, mô tả hoặc mã SKU..."
                    className="h-14 w-full bg-transparent pl-9 pr-28 font-sans text-base text-[#111111] outline-none placeholder:text-[#9A9A9A] md:h-16 md:text-lg"
                    aria-label="Từ khóa tìm kiếm"
                    aria-describedby="search-helper"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={!term.trim()}
                    className="absolute right-0 top-1/2 flex min-h-11 -translate-y-1/2 items-center gap-2 px-2 py-3 font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-[#111111] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Tìm kiếm
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>

              <div id="search-helper" className="min-h-8 pt-2 font-sans text-xs text-[#777777]">
                {term.trim().length === 1
                  ? "Nhập thêm 1 ký tự để xem gợi ý."
                  : "Gợi ý được cập nhật sau 300ms khi bạn dừng nhập."}
              </div>

              <div className="max-h-[55vh] overflow-y-auto">
                {!term.trim() && recentSearches.length > 0 && (
                  <section aria-labelledby="recent-searches-heading" className="pt-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h3
                        id="recent-searches-heading"
                        className="label-xs flex items-center gap-2 text-[#6B6B6B]"
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                        Tìm kiếm gần đây
                      </h3>
                      <button
                        type="button"
                        onClick={handleClearRecent}
                        className="inline-flex min-h-11 items-center font-sans text-[11px] text-[#777777] underline underline-offset-4 hover:text-[#111111]"
                      >
                        Xóa lịch sử
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((query) => (
                        <button
                          key={query}
                          type="button"
                          onClick={() => goToSearch(query)}
                          className="min-h-11 border border-[#E8E8E8] px-3 py-2 font-sans text-xs text-[#4A4A4A] transition-colors hover:border-[#111111] hover:text-[#111111]"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {isLoading && (
                  <div className="flex items-center gap-2 py-8 font-sans text-sm text-[#6B6B6B]" role="status">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tìm sản phẩm phù hợp...
                  </div>
                )}

                {!isLoading && error && (
                  <p className="border-l-2 border-[#0F4C81] py-2 pl-3 font-sans text-sm text-[#6B6B6B]">
                    {error}
                  </p>
                )}

                {!isLoading && !error && hasSearched && suggestions.length === 0 && (
                  <div className="py-8">
                    <p className="font-heading text-base font-medium text-[#111111]">
                      Không tìm thấy kết quả
                    </p>
                    <p className="mt-1 font-sans text-sm text-[#6B6B6B]">
                      Hãy thử một từ khóa ngắn hơn hoặc kiểm tra lại mã SKU.
                    </p>
                  </div>
                )}

                {!isLoading && suggestions.length > 0 && (
                  <section aria-labelledby="search-suggestions-heading" className="pt-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 id="search-suggestions-heading" className="label-xs text-[#6B6B6B]">
                        Gợi ý sản phẩm
                      </h3>
                      <span className="font-sans text-xs text-[#777777]">
                        {matchCount} kết quả
                      </span>
                    </div>
                    <div className="divide-y divide-[#E8E8E8] border-y border-[#E8E8E8]">
                      {suggestions.map((product) => {
                        const image = product.images?.[0]?.url ?? "";

                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={() => {
                              saveRecentSearch(term);
                              onClose();
                            }}
                            className="group flex items-center gap-4 py-3"
                          >
                            <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-[#F5F5F5]">
                              {image ? (
                                <Image
                                  src={image}
                                  alt={product.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-heading text-sm font-medium text-[#111111] group-hover:text-[#0F4C81]">
                                {product.name}
                              </p>
                              <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.08em] text-[#888888]">
                                SKU: {product.sku}
                              </p>
                            </div>
                            <span className="shrink-0 font-sans text-sm font-medium text-[#111111]">
                              {formatPrice(product.basePrice)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => goToSearch(term)}
                      className="mt-4 flex min-h-11 items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#111111] hover:text-[#0F4C81]"
                    >
                      Xem tất cả {matchCount} kết quả
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </section>
                )}
              </div>
            </div>
          </motion.div>
    </motion.div>
  );
}
