"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { saveRecentSearch } from "@/lib/search-history";

interface SearchPageInputProps {
  initialQuery: string;
}

function searchHref(query: string) {
  const normalizedQuery = query.trim();
  return normalizedQuery ? `/search?q=${encodeURIComponent(normalizedQuery)}` : "/search";
}

export function SearchPageInput({ initialQuery }: SearchPageInputProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialQuery);
  const [isNavigating, startTransition] = useTransition();

  useEffect(() => {
    const normalizedValue = value.trim();
    if (normalizedValue === initialQuery) return;

    const timeout = window.setTimeout(() => {
      if (normalizedValue) saveRecentSearch(normalizedValue);
      startTransition(() => {
        router.replace(searchHref(normalizedValue), { scroll: false });
      });
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [initialQuery, router, value]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = value.trim();
    if (query) saveRecentSearch(query);
    router.push(searchHref(query));
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#111111]" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Tìm theo tên, mô tả hoặc mã SKU"
        className="h-16 w-full border border-[#D8D8D8] bg-white pl-14 pr-32 font-sans text-base text-[#111111] outline-none transition-colors placeholder:text-[#999999] focus:border-[#111111] md:h-[72px] md:text-lg"
        aria-label="Tìm kiếm sản phẩm"
        autoComplete="off"
      />
      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {isNavigating && <Loader2 className="h-4 w-4 animate-spin text-[#777777]" aria-label="Đang tìm kiếm" />}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="flex size-11 items-center justify-center text-[#777777] hover:text-[#111111]"
            aria-label="Xóa từ khóa"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={!value.trim()}
          className="hidden h-11 bg-[#111111] px-5 font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-white disabled:cursor-not-allowed disabled:opacity-40 sm:block"
        >
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}
