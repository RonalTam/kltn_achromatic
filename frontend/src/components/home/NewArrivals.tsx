"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ProductCard } from "@/components/common/ProductCard";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Product } from "@/lib/types";

interface NewArrivalsProps {
  products: Product[];
}

export function NewArrivals({ products }: NewArrivalsProps) {
  if (products.length === 0) return null;

  return (
    <section
      className="relative isolate overflow-hidden bg-[#EEF0F2] pb-16 md:pb-20 lg:pb-24"
      id="new-arrivals"
    >
      {/* Editorial transition replaces the previous empty grid background. */}
      <div className="relative flex min-h-[320px] items-center overflow-hidden md:min-h-[360px] lg:min-h-[400px]">
        <Image
          src="/editorial/vietnam-fashion-new-arrivals-2k.png"
          alt=""
          fill
          sizes="(max-width: 767px) 165vw, 100vw"
          quality={90}
          className="object-cover object-[45%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/20 to-black/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-[#EEF0F2]" />

        <div className="section-padding relative z-10 w-full py-14 md:py-16">
          <div className="container-max">
            <AnimatedSection className="mx-auto max-w-xl text-center md:mr-0 md:text-left">
              <div className="mb-4 inline-flex items-center gap-3">
                <span className="h-px w-8 bg-white/45" />
                <p className="label-sm text-[#A9CCE9]">Mới Nhất</p>
                <span className="h-px w-8 bg-white/45" />
              </div>
              <h2 className="heading-lg text-white section-heading-accent section-heading-accent--mobile-center">
                Hàng Mới
                <span className="font-heading italic font-light"> Về</span>
              </h2>
              <p className="mt-10 max-w-md font-sans text-sm leading-relaxed text-white/75 md:mr-0">
                Những thiết kế mới nhất từ bộ sưu tập Hè 2026. Tinh tế, tối giản, đẳng cấp.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </div>

      <div className="section-padding relative z-10 -mt-8 md:-mt-10">
        <div className="container-max">
          {/* Products Grid */}
          <motion.div
            className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={staggerItem}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <AnimatedSection className="mt-12 text-center md:mt-16">
            <Link href="/collections?newArrival=true" className="btn-outline-dark">
              Xem Tất Cả Sản Phẩm
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
