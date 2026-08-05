"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Star } from "lucide-react";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { motion } from "framer-motion";

const reviews = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    location: "Hà Nội",
    avatar: "N",
    rating: 5,
    product: "Áo Polo Classic Piqué",
    text: "Chất lượng vải rất tốt, đường may tỉ mỉ. Mặc vào người rất thoải mái và phong cách. Sẽ ủng hộ ACHROMATIC dài dài!",
    date: "Tháng 6, 2026",
  },
  {
    id: 2,
    name: "Trần Thị Lan",
    location: "TP. Hồ Chí Minh",
    avatar: "T",
    rating: 5,
    product: "Áo Thun Essential",
    text: "Mình mua tặng bạn trai và anh ấy rất thích. Màu đen đúng như hình, form dáng chuẩn. Giao hàng nhanh, đóng gói đẹp.",
    date: "Tháng 5, 2026",
  },
  {
    id: 3,
    name: "Lê Văn Hùng",
    location: "Đà Nẵng",
    avatar: "L",
    rating: 5,
    product: "Sơ Mi Oxford Tối Giản",
    text: "Đây là thương hiệu Việt hiếm hoi mà tôi mua lần 2. Thiết kế tối giản nhưng rất sang. Chất liệu thoáng mát, phù hợp thời tiết Việt Nam.",
    date: "Tháng 5, 2026",
  },
  {
    id: 4,
    name: "Phạm Thu Hà",
    location: "Hải Phòng",
    avatar: "P",
    rating: 4,
    product: "Quần Chino Navy",
    text: "Quần mặc rất đẹp, form slim fit vừa vặn. Màu navy đúng chuẩn. Chỉ tiếc giao hàng hơi chậm hơn dự kiến nhưng hàng nhận được hoàn toàn xứng đáng.",
    date: "Tháng 4, 2026",
  },
  {
    id: 5,
    name: "Võ Quang Minh",
    location: "Cần Thơ",
    avatar: "V",
    rating: 5,
    product: "Áo Polo Merino Blend",
    text: "Mua online mà sợ không ưng ý nhưng nhận hàng xong cực kỳ hài lòng. Chính sách đổi trả 30 ngày rất an tâm. 10/10 sẽ giới thiệu bạn bè!",
    date: "Tháng 4, 2026",
  },
];

export function CustomerReviews() {
  const swiperRef = useRef(null);

  return (
    <section className="section-padding section-gap page-hero-dark" id="reviews">
      <div className="container-max relative z-10">
        {/* Header */}
        <AnimatedSection className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-[#0F4C81]/60" />
            <p className="label-sm text-[#0F4C81]">Khách Hàng Nói Gì</p>
            <span className="w-8 h-[1px] bg-[#0F4C81]/60" />
          </div>
          <h2 className="heading-lg text-white section-heading-accent section-heading-accent--center">
            Đánh Giá
            <span className="font-heading italic font-light"> Thực Tế</span>
          </h2>
          {/* Stars Summary */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-[#0F4C81] stroke-none" />
              ))}
            </div>
            <span className="font-sans text-sm font-medium text-white">4.9</span>
            <span className="font-sans text-sm text-white/50">/ 5 từ 10.000+ đánh giá</span>
          </div>
        </AnimatedSection>

        {/* Swiper */}
        <Swiper
          ref={swiperRef}
          modules={[Autoplay, Pagination, A11y]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1.5, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          className="!pb-10"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id} className="!h-auto">
              <motion.div
                className="bg-white p-6 md:p-8 h-full flex flex-col gap-4 border-t-2 border-t-[#0F4C81]"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                {/* Rating */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= review.rating
                          ? "fill-[#111111] stroke-none"
                          : "fill-none stroke-[#D0D0D0]"
                      }`}
                    />
                  ))}
                </div>

                {/* Product */}
                <p className="label-xs text-[#0F4C81]">{review.product}</p>

                {/* Review Text */}
                <p className="font-sans text-sm text-[#4A4A4A] leading-relaxed flex-1 italic">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Divider */}
                <div className="w-8 h-[1px] bg-[#E8E8E8]" />

                {/* Reviewer */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#111111] text-white flex items-center justify-center font-sans text-sm font-medium flex-shrink-0">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-sans text-sm font-medium text-[#111111]">{review.name}</p>
                    <p className="label-xs text-[#9A9A9A]">
                      {review.location} · {review.date}
                    </p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
