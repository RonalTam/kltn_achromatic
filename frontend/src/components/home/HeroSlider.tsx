"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "/hero/hero-vietnam-city-blue-2k.png",
    mobileImage: "/hero/hero-vietnam-city-blue-mobile-2k.png",
    objectPosition: "66% center",
    overline: "Bộ Sưu Tập Mới — Hè 2026",
    headline: "THỜI TRANG\nTỐI GIẢN",
    subheadline: "Dành Cho Người Hiện Đại",
    description: "Khám phá bộ sưu tập mới nhất. Tinh tế, sang trọng, đẳng cấp.",
    cta1: { label: "Nhận Ưu Đãi", href: "/collections" },
    cta2: { label: "Mua Ngay", href: "/collections" },
    align: "center",
  },
  {
    id: 2,
    image: "/hero/hero-vietnam-tropical-minimal-2k.png",
    mobileImage: "/hero/hero-vietnam-tropical-minimal-mobile-2k.png",
    objectPosition: "72% center",
    overline: "Phong Cách Mới",
    headline: "TINH HOA\nTỐI GIẢN",
    subheadline: "Chất Liệu Cao Cấp",
    description: "Mỗi chi tiết đều được chăm chút tỉ mỉ. Chất lượng không thỏa hiệp.",
    cta1: { label: "Khám Phá", href: "/collections" },
    cta2: { label: "Xem Lookbook", href: "/collections" },
    align: "left",
  },
  {
    id: 3,
    image: "/hero/hero-vietnam-menswear-slate-2k.png",
    mobileImage: "/hero/hero-vietnam-menswear-slate-mobile-2k.png",
    objectPosition: "27% center",
    overline: "Phong Cách Sống",
    headline: "ĐỊNH NGHĨA\nLẠI PHONG CÁCH",
    subheadline: "Cho Người Việt Hiện Đại",
    description: "Thương hiệu thời trang tối giản thuần Việt. Tự hào và tinh tế.",
    cta1: { label: "Bộ Sưu Tập", href: "/collections" },
    cta2: { label: "Về Chúng Tôi", href: "/about" },
    align: "right",
  },
];

function ResponsiveHeroImage({
  slide,
  eager,
}: {
  slide: (typeof slides)[number];
  eager: boolean;
}) {
  return (
    <div className="relative block h-full w-full">
      <Image
        src={slide.mobileImage}
        alt=""
        fill
        sizes="100vw"
        quality={92}
        priority={eager}
        className="object-cover md:hidden"
        style={{ objectPosition: slide.objectPosition }}
      />
      <Image
        src={slide.image}
        alt=""
        fill
        sizes="100vw"
        quality={92}
        priority={eager}
        className="hidden object-cover md:block"
        style={{ objectPosition: slide.objectPosition }}
      />
    </div>
  );
}

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasChangedSlide, setHasChangedSlide] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setHasChangedSlide(true);
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 800);
    },
    [isAnimating]
  );

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [goNext]);

  const slide = slides[current];
  const alignClass =
    slide.align === "left"
      ? "items-start text-left"
      : slide.align === "right"
      ? "items-end text-right"
      : "items-center text-center";

  return (
    <section
      className="relative h-[100dvh] min-h-[600px] max-h-[1000px] w-full overflow-hidden bg-[#111111]"
      id="hero-section"
      aria-label="Trang chủ Hero"
    >
      {/* Slides */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={hasChangedSlide ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Background Image */}
          <motion.div
            className="absolute inset-0"
            initial={hasChangedSlide ? { scale: 1.02 } : false}
            animate={{ scale: 1 }}
            transition={{ duration: 6.5, ease: "linear" }}
          >
            <ResponsiveHeroImage slide={slide} eager={slide.id === 1} />
          </motion.div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />

          {/* Content */}
          <div
            className={`absolute inset-0 flex flex-col justify-end pb-20 md:pb-28 px-8 md:px-16 lg:px-24 ${alignClass}`}
          >
            {/* Overline */}
            <motion.p
              className="label-sm text-white/70 mb-4 md:mb-6"
              initial={hasChangedSlide ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {slide.overline}
            </motion.p>

            {/* Headline */}
            <motion.h1
              className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-white font-light leading-[1.15] tracking-normal mb-4 md:mb-6 whitespace-pre-line"
              initial={hasChangedSlide ? { opacity: 0, y: 50 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {slide.headline}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="font-heading text-xl md:text-2xl lg:text-3xl text-white/80 font-light italic mb-4 md:mb-6"
              initial={hasChangedSlide ? { opacity: 0, y: 30 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
            >
              {slide.subheadline}
            </motion.p>

            {/* Description */}
            <motion.p
              className="font-sans text-sm md:text-base text-white/60 mb-8 md:mb-10 max-w-sm"
              initial={hasChangedSlide ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
            >
              {slide.description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap gap-3 md:gap-4"
              initial={hasChangedSlide ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
            >
              <Link href={slide.cta1.href} className="btn-primary">
                {slide.cta1.label}
              </Link>
              <Link href={slide.cta2.href} className="btn-outline">
                {slide.cta2.label}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goPrev}
        className="absolute left-3 top-[38%] z-20 flex size-11 -translate-y-1/2 items-center justify-center border border-white/30 text-white backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/10 md:left-8 md:top-1/2 md:size-12"
        aria-label="Slide trước"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 top-[38%] z-20 flex size-11 -translate-y-1/2 items-center justify-center border border-white/30 text-white backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/10 md:right-8 md:top-1/2 md:size-12"
        aria-label="Slide tiếp theo"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Slide ${idx + 1}`}
            aria-current={idx === current ? "true" : undefined}
            className="group flex size-11 items-center justify-center"
          >
            <span
              aria-hidden="true"
              className={`block h-[2px] transition-all duration-500 ${
                idx === current
                  ? "w-10 bg-white"
                  : "w-4 bg-white/40 group-hover:bg-white/70"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute right-4 md:right-8 bottom-8 z-20 text-white/50 label-xs hidden md:block">
        {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-8 z-20 hidden md:flex flex-col items-center gap-2">
        <motion.div
          className="w-[1px] h-12 bg-white/30"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
        <span className="label-xs text-white/40 rotate-90 mt-2">Cuộn xuống</span>
      </div>
    </section>
  );
}
