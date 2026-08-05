"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { api } from "@/lib/api";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/newsletter/subscribe", { email });
      setSubmitted(true);
      setEmail("");
    } catch (requestError) {
      const responseMessage =
        typeof requestError === "object" &&
        requestError !== null &&
        "response" in requestError
          ? (
              requestError as {
                response?: { data?: { message?: string } };
              }
            ).response?.data?.message
          : undefined;
      setError(
        responseMessage ||
          "Không thể đăng ký lúc này. Vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="section-padding py-20 md:py-28 bg-[#111111] relative overflow-hidden"
      id="newsletter"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#0F4C81]/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0F4C81]/5 rounded-full translate-x-32 translate-y-32 blur-3xl" />

      <div className="container-max relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Header */}
          <AnimatedSection>
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-[#0F4C81]/60" />
              <p className="label-sm text-[#0F4C81]">Ưu Đãi Độc Quyền</p>
              <span className="w-8 h-[1px] bg-[#0F4C81]/60" />
            </div>
            <h2 className="font-heading text-4xl md:text-5xl text-white font-light leading-tight tracking-tight mb-4 section-heading-accent section-heading-accent--center">
              Nhận Ưu Đãi
              <br />
              <span className="italic">Độc Quyền</span>
            </h2>
            <p className="font-sans text-sm text-white/50 leading-relaxed mb-8 max-w-md mx-auto">
              Đăng ký nhận bản tin để nhận ưu đãi 10% cho đơn hàng đầu tiên, 
              cập nhật bộ sưu tập mới và tin tức thời trang.
            </p>
          </AnimatedSection>

          {/* Form */}
          <AnimatedSection delay={0.2}>
            {submitted ? (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-12 h-12 bg-[#0F4C81] flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <p className="font-heading text-xl text-white font-light">
                  Cảm ơn bạn đã đăng ký!
                </p>
                <p className="font-sans text-sm text-white/50">
                  Hãy kiểm tra email để nhận mã giảm giá 10% của bạn.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
                <div className="flex-1 relative">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Địa chỉ email
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email của bạn"
                    required
                    autoComplete="email"
                    aria-describedby={error ? "newsletter-error" : "newsletter-privacy"}
                    className="w-full bg-white/5 border border-white/20 text-white placeholder:text-white/30 px-5 py-4 font-sans text-sm outline-none focus:border-white/60 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="bg-white text-[#111111] px-6 py-4 font-sans text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#F5F5F5] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 flex-shrink-0"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-[#111111]/20 border-t-[#111111] rounded-full animate-spin" />
                  ) : (
                    <>
                      Đăng Ký
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {error && (
              <p
                id="newsletter-error"
                className="mt-4 text-sm text-[#ffb4b4]"
                role="alert"
              >
                {error}
              </p>
            )}

            {!submitted && (
              <p id="newsletter-privacy" className="font-sans text-[11px] text-white/50 mt-4">
                Bằng cách đăng ký, bạn đồng ý với chính sách bảo mật của chúng tôi. Hủy đăng ký bất cứ lúc nào.
              </p>
            )}
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}
