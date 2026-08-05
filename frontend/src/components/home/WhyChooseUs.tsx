"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { AnimatedSection } from "@/components/common/AnimatedSection";

const features = [
  {
    icon: "🚚",
    title: "Giao Hàng Toàn Quốc",
    description: "Miễn phí vận chuyển cho đơn hàng từ 500.000đ. Giao nhanh 1-3 ngày làm việc.",
  },
  {
    icon: "🔄",
    title: "Đổi Trả Trong 30 Ngày",
    description: "Không hài lòng? Đổi trả miễn phí trong 30 ngày kể từ ngày nhận hàng.",
  },
  {
    icon: "🔒",
    title: "Thanh Toán Bảo Mật",
    description: "Giao dịch được mã hóa SSL 256-bit. Hỗ trợ VNPAY, MoMo, thẻ ngân hàng.",
  },
  {
    icon: "⭐",
    title: "10.000+ Khách Hài Lòng",
    description: "Hơn 10.000 khách hàng tin tưởng. Đánh giá trung bình 4.8/5 sao.",
  },
];

export function WhyChooseUs() {
  return (
    <section
      className="section-padding section-gap-sm bg-[#111111]"
      id="why-choose-us"
    >
      <div className="container-max">
        {/* Header */}
        <AnimatedSection className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-[#0F4C81]/60" />
            <p className="label-sm text-[#0F4C81]">Cam Kết</p>
            <span className="w-8 h-[1px] bg-[#0F4C81]/60" />
          </div>
          <h2 className="heading-md text-white section-heading-accent section-heading-accent--center">
            Tại Sao Chọn
            <span className="font-heading italic font-light"> ACHROMATIC?</span>
          </h2>
        </AnimatedSection>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#2A2A2A]"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="bg-[#111111] p-8 md:p-10 flex flex-col gap-4 group hover:bg-[#1A1A1A] transition-colors duration-300 cursor-default"
            >
              {/* Icon */}
              <div className="text-4xl mb-2">{feature.icon}</div>

              {/* Divider */}
              <div className="w-8 h-[1px] bg-[#0F4C81] group-hover:w-12 transition-all duration-400" />

              {/* Title */}
              <h3 className="font-sans text-sm font-medium text-white uppercase tracking-[0.1em]">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="font-sans text-xs text-[#6B6B6B] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
