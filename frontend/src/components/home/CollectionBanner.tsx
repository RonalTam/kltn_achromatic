"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { heroTextReveal } from "@/lib/animations";

export function CollectionBanner() {
  return (
    <section
      className="relative w-full h-[60vh] md:h-[70vh] min-h-[450px] overflow-hidden"
      id="collection-banner"
    >
      {/* Background Image */}
      <Image
        src="/page-headers/vietnam-collections-header-2k.png"
        alt=""
        fill
        className="object-cover object-[68%_center] md:object-center"
        sizes="(max-width: 767px) 200vw, 100vw"
        quality={90}
      />

      {/* Multi-layer Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center section-padding">
        <div className="max-w-2xl">
          {/* Overline */}
          <motion.div
            className="flex items-center gap-4 mb-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="w-8 h-[1px] bg-white/60" />
            <p className="label-sm text-white/70">Bộ Sưu Tập Độc Quyền</p>
          </motion.div>

          {/* Headline */}
          <motion.h2
            className="font-heading text-5xl md:text-6xl lg:text-7xl text-white font-light leading-[0.92] tracking-tight mb-6"
            variants={heroTextReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            BỘ SƯU TẬP
            <br />
            <span className="italic">Hè 2026</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            className="font-sans text-sm md:text-base text-white/70 mb-10 leading-relaxed max-w-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Lấy cảm hứng từ ánh nắng Việt Nam và tinh thần tối giản Nhật Bản. 
            Thiết kế cho những khoảnh khắc sống đáng nhớ.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <Link
              href="/collections"
              className="inline-flex items-center gap-3 text-white border-b border-white/40 hover:border-white pb-2 transition-all duration-300 group"
            >
              <span className="label-sm text-white">KHÁM PHÁ NGAY</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative Year Tag */}
      <div className="absolute right-8 bottom-8 hidden md:block">
        <p className="font-heading text-6xl md:text-8xl text-white/10 font-light select-none">
          2026
        </p>
      </div>
    </section>
  );
}
