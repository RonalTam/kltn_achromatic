"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/common/AnimatedSection";

const lookbookImages = [
  {
    src: "/marketing/lookbook/lookbook-01-2k.jpg",
    alt: "Lookbook 1 — ACHROMATIC",
    span: "tall", // aspect ratio hint
  },
  {
    src: "/marketing/lookbook/lookbook-02-2k.jpg",
    alt: "Lookbook 2 — ACHROMATIC",
    span: "short",
  },
  {
    src: "/marketing/lookbook/lookbook-03-2k.jpg",
    alt: "Lookbook 3 — ACHROMATIC",
    span: "short",
  },
  {
    src: "/marketing/lookbook/lookbook-04-2k.jpg",
    alt: "Lookbook 4 — ACHROMATIC",
    span: "tall",
  },
  {
    src: "/marketing/lookbook/lookbook-05-2k.jpg",
    alt: "Lookbook 5 — ACHROMATIC",
    span: "short",
  },
  {
    src: "/marketing/lookbook/lookbook-06-2k.jpg",
    alt: "Lookbook 6 — ACHROMATIC",
    span: "tall",
  },
  {
    src: "/marketing/lookbook/lookbook-07-2k.jpg",
    alt: "Lookbook 7 — ACHROMATIC",
    span: "short",
  },
  {
    src: "/marketing/lookbook/lookbook-08-2k.jpg",
    alt: "Lookbook 8 — ACHROMATIC",
    span: "short",
  },
  {
    src: "/marketing/lookbook/lookbook-09-2k.jpg",
    alt: "Lookbook 9 — ACHROMATIC",
    span: "tall",
  },
];

const aspectMap: Record<string, string> = {
  tall: "aspect-[3/4]",
  short: "aspect-[4/3]",
};

export function Lookbook() {
  return (
    <section className="section-padding section-gap bg-white deco-grid-pattern" id="lookbook">
      <div className="container-max">
        {/* Header */}
        <AnimatedSection className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-[#0F4C81]/40" />
            <p className="label-sm text-[#0F4C81]">Phong Cách</p>
            <span className="w-8 h-[1px] bg-[#0F4C81]/40" />
          </div>
          <h2 className="heading-lg text-[#111111] section-heading-accent section-heading-accent--center">
            Lookbook
            <span className="font-heading italic font-light"> 2026</span>
          </h2>
          <p className="font-sans text-sm text-[#6B6B6B] max-w-sm mx-auto mt-6 leading-relaxed">
            Cảm hứng thời trang từ những khoảnh khắc đời thường được nâng tầm.
          </p>
        </AnimatedSection>

        {/* Masonry Grid */}
        <div className="masonry-grid">
          {lookbookImages.map((img, i) => (
            <motion.div
              key={i}
              className="masonry-item group relative overflow-hidden cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={`relative w-full ${aspectMap[img.span]} overflow-hidden bg-[#F5F5F5]`}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  quality={90}
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                  <span className="label-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/60 px-4 py-2">
                    ACHROMATIC
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
