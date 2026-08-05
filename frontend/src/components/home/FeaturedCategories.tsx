"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, imageZoom } from "@/lib/animations";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { SectionPhotoBackdrop } from "@/components/home/SectionPhotoBackdrop";

const categories = [
  {
    name: "Áo Khoác",
    slug: "ao-khoac",
    image: "/marketing/categories/polo-2k.jpg",
    count: "8 sản phẩm",
    span: "col-span-1 row-span-2",
  },
  {
    name: "Áo Thun",
    slug: "ao-thun",
    image: "/marketing/categories/tshirt-2k.jpg",
    count: "10 sản phẩm",
    span: "col-span-1",
  },
  {
    name: "Sơ Mi",
    slug: "ao-so-mi",
    image: "/marketing/categories/shirts-2k.jpg",
    count: "8 sản phẩm",
    span: "col-span-1",
  },
  {
    name: "Quần Jeans",
    slug: "quan-jeans",
    image: "/marketing/categories/pants-2k.jpg",
    count: "8 sản phẩm",
    span: "col-span-1",
  },
  {
    name: "Phụ Kiện",
    slug: "phu-kien",
    image: "/marketing/categories/accessories-2k.jpg",
    count: "8 sản phẩm",
    span: "col-span-1",
  },
];

export function FeaturedCategories() {
  return (
    <section
      className="section-padding relative isolate overflow-hidden bg-white pt-14 pb-4 md:pt-16 md:pb-5 lg:pt-20 lg:pb-6"
      id="categories"
    >
      <SectionPhotoBackdrop
        src="/editorial/vietnam-fashion-categories-2k.png"
        position="center 42%"
      />

      <div className="container-max relative z-10">
        {/* Section Header */}
        <AnimatedSection className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
          <div className="accent-bar-left">
            <p className="label-sm text-[#0F4C81] mb-3">Danh Mục</p>
            <h2 className="heading-lg text-[#111111] section-heading-accent">
              Khám Phá
              <span className="font-heading italic font-light"> Bộ Sưu Tập</span>
            </h2>
          </div>
          <Link
            href="/collections"
            className="label-sm text-[#6B6B6B] hover:text-[#0F4C81] border-b border-[#E8E8E8] hover:border-[#0F4C81] pb-1 transition-all self-start md:self-auto"
          >
            Xem Tất Cả →
          </Link>
        </AnimatedSection>

        {/* Grid Layout */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              variants={staggerItem}
              className="group relative overflow-hidden cursor-pointer"
            >
              <Link href={`/collections?category=${cat.slug}`}>
                {/* Image */}
                <motion.div
                  className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F5]"
                  variants={imageZoom}
                  initial="rest"
                  whileHover="hover"
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover object-center transition-all duration-700"
                    sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 20vw"
                    quality={90}
                  />

                  {/* Dark Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />

                  {/* Hover Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400">
                    <span className="label-sm text-white border border-white/60 px-4 py-2 backdrop-blur-sm">
                      Xem Ngay
                    </span>
                  </div>
                </motion.div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <h3 className="font-sans text-sm font-medium text-[#111111] uppercase tracking-[0.1em]">
                    {cat.name}
                  </h3>
                  <p className="label-xs text-[#9A9A9A] mt-1">{cat.count}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
