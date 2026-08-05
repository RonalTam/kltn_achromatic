"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { staggerContainer, staggerItem } from "@/lib/animations";

// Instagram SVG icon (lucide-react v1.18 doesn't include social icons)
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const instagramPosts = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=88&fit=crop&auto=format",
    alt: "ACHROMATIC Instagram 1",
    likes: "1.2K",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=88&fit=crop&auto=format",
    alt: "ACHROMATIC Instagram 2",
    likes: "956",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=88&fit=crop&auto=format",
    alt: "ACHROMATIC Instagram 3",
    likes: "2.1K",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=88&fit=crop&auto=format",
    alt: "ACHROMATIC Instagram 4",
    likes: "784",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&q=88&fit=crop&auto=format",
    alt: "ACHROMATIC Instagram 5",
    likes: "1.5K",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=88&fit=crop&auto=format",
    alt: "ACHROMATIC Instagram 6",
    likes: "3.2K",
  },
];

export function InstagramFeed() {
  return (
    <section className="section-padding section-gap-sm bg-white" id="instagram-feed">
      <div className="container-max">
        {/* Header */}
        <AnimatedSection className="text-center mb-8 md:mb-12">
          <a
            href="https://instagram.com/achromatic.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 group"
          >
            <InstagramIcon className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#0F4C81] transition-colors" />
            <span className="label-sm text-[#6B6B6B] group-hover:text-[#0F4C81] transition-colors">
              @achromatic.vn
            </span>
          </a>
          <h2 className="heading-md text-[#111111] mt-4 section-heading-accent section-heading-accent--center">
            Theo Dõi Chúng Tôi
          </h2>
          <p className="font-sans text-sm text-[#6B6B6B] mt-5">
            Cập nhật phong cách mới nhất mỗi ngày trên Instagram
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="w-4 h-[1px] bg-[#0F4C81]/30" />
            <span className="w-1 h-1 rounded-full bg-[#0F4C81]/50" />
            <span className="w-4 h-[1px] bg-[#0F4C81]/30" />
          </div>
        </AnimatedSection>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {instagramPosts.map((post) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/achromatic.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-[#F5F5F5] block"
              variants={staggerItem}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={post.src}
                alt={post.alt}
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 17vw"
                quality={85}
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-400 flex flex-col items-center justify-center gap-2">
                <InstagramIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="label-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  ♥ {post.likes}
                </span>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Follow Button */}
        <AnimatedSection className="text-center mt-8">
          <a
            href="https://instagram.com/achromatic.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-dark inline-flex items-center gap-2"
          >
            <InstagramIcon className="w-4 h-4" />
            Theo Dõi Instagram
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
}
