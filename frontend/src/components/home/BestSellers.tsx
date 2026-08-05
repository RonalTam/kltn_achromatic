"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { ProductCard } from "@/components/common/ProductCard";
import { Product } from "@/lib/types";
import Link from "next/link";
import type { Swiper as SwiperType } from "swiper";
import { SectionPhotoBackdrop } from "@/components/home/SectionPhotoBackdrop";

interface BestSellersProps {
  products?: Product[];
}

export function BestSellers({ products }: BestSellersProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  if (!products || products.length === 0) return null;

  return (
    <section
      className="relative isolate overflow-hidden bg-white pt-16 pb-20 md:pt-20 md:pb-24 lg:pt-24 lg:pb-28"
      id="best-sellers"
    >
      <SectionPhotoBackdrop
        src="/editorial/vietnam-fashion-bestsellers-2k.png"
        position="center 42%"
        tone="dark"
      />

      <div className="container-max relative z-10">
        {/* Section Header */}
        <AnimatedSection className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16 section-padding">
          <div className="accent-bar-left">
            <p className="label-sm text-[#8EBBE2] mb-3">Bán Chạy Nhất</p>
            <h2 className="heading-lg text-white section-heading-accent">Best Sellers</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="flex size-11 items-center justify-center border border-white/35 text-white/75 transition-all duration-200 hover:border-white hover:text-white"
              aria-label="Trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="flex size-11 items-center justify-center border border-white/35 text-white/75 transition-all duration-200 hover:border-white hover:text-white"
              aria-label="Tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link
              href="/collections?sortBy=best_selling"
              className="label-sm ml-1 inline-flex min-h-11 items-center border-b border-white/30 px-1 text-white/70 transition-all hover:border-white hover:text-white sm:ml-2"
            >
              Xem Tất Cả →
            </Link>
          </div>
        </AnimatedSection>

        {/* Swiper — padding-left to align with container */}
        <div className="pl-5 md:pl-10 lg:pl-20">
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={16}
            slidesPerView={1.3}
            breakpoints={{
              480: { slidesPerView: 2.2, spaceBetween: 16 },
              768: { slidesPerView: 3.2, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            className="!overflow-visible"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} className="!h-auto">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
